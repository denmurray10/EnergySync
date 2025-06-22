"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getRechargeRecommendations,
  RechargeRecommendationsOutput,
  RechargeRecommendationsInput,
} from "@/ai/flows/personalized-recharge-recommendations";

type RechargeModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  handleRecharge: (rechargeAmount: number, debtReduction: number) => void;
  activities: RechargeRecommendationsInput['activities'];
  currentEnergy: number;
};

export function RechargeModal({
  open,
  onOpenChange,
  handleRecharge,
  activities,
  currentEnergy,
}: RechargeModalProps) {
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<RechargeRecommendationsOutput>([]);

  useEffect(() => {
    if (open) {
      setLoading(true);
      const fetchRecommendations = async () => {
        try {
          const input = { activities, currentEnergy };
          const result = await getRechargeRecommendations(input);
          // Sort by highest impact first
          const sortedResult = result.sort((a, b) => b.expectedImpact - a.expectedImpact);
          setRecommendations(sortedResult);
        } catch (error) {
          console.error("Failed to get recommendations:", error);
          setRecommendations([]); // Handle error case
        } finally {
          setLoading(false);
        }
      };
      fetchRecommendations();
    }
  }, [open, activities, currentEnergy]);

  const onRechargeSelect = (activity: RechargeRecommendationsOutput[0]) => {
    // Assuming debt reduction is equal to the expected impact for this prototype
    handleRecharge(activity.expectedImpact, activity.expectedImpact);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card/95 backdrop-blur-lg max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Personalised Recharge
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 overflow-y-auto custom-scrollbar pr-2">
          {loading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex items-center space-x-4 p-4 rounded-2xl border-2">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[150px]" />
                  <Skeleton className="h-4 w-[100px]" />
                </div>
              </div>
            ))
          ) : recommendations.length > 0 ? (
            recommendations.map((activity, index) => (
              <button
                key={index}
                onClick={() => onRechargeSelect(activity)}
                className="w-full p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl hover:border-green-300 transition-all duration-300 text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="text-3xl">{activity.emoji}</span>
                    <div>
                      <p className="font-semibold text-gray-800">{activity.name}</p>
                      <p className="text-sm text-gray-600">{activity.duration} minutes</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.description}</p>
                    </div>
                  </div>
                  <div className="text-green-600 font-bold text-lg">
                    +{activity.expectedImpact}%
                  </div>
                </div>
              </button>
            ))
          ) : (
             <p className="text-center text-muted-foreground py-8">No recommendations available at this moment.</p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
