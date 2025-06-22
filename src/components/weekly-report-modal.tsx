"use client";

import { useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Activity } from "@/lib/types";

type WeeklyReportModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activities: Activity[];
};

export function WeeklyReportModal({
  open,
  onOpenChange,
  activities,
}: WeeklyReportModalProps) {
    
  const reportData = useMemo(() => {
    const totalDrain = activities
      .filter((a) => a.impact < 0)
      .reduce((sum, a) => sum + a.impact, 0);
      
    const totalRecharge = activities
      .filter((a) => a.impact > 0)
      .reduce((sum, a) => sum + a.impact, 0);

    const rechargers = activities.filter(a => a.impact > 0);
    const mvpRecharge = rechargers.length > 0 
        ? rechargers.reduce((max, act) => (act.impact > max.impact ? act : max))
        : null;

    return { totalDrain, totalRecharge, mvpRecharge };
  }, [activities]);


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card/95 backdrop-blur-lg max-h-[80vh]">
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Your Weekly Report
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 text-center py-4">
          <div>
            <p className="text-5xl font-bold text-red-500">{reportData.totalDrain}%</p>
            <p className="text-sm text-muted-foreground">Total Energy Drained</p>
          </div>
          <div>
            <p className="text-5xl font-bold text-green-500">+{reportData.totalRecharge}%</p>
            <p className="text-sm text-muted-foreground">Total Energy Recharged</p>
          </div>
          {reportData.mvpRecharge && (
            <div className="pt-4">
              <p className="font-semibold text-card-foreground">This Week's MVP Recharge:</p>
              <p className="text-xl text-blue-600 font-semibold mt-1">
                {reportData.mvpRecharge.emoji} {reportData.mvpRecharge.name}
              </p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} className="w-full">
            Great!
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
