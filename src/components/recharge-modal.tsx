"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import type { Activity } from "@/lib/types";
import { LoaderCircle, Plus, Sparkles, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { suggestRechargeDetails } from "@/ai/flows/suggest-recharge-details";


const customRechargeSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters."),
    impact: z.number().min(5).max(50),
    duration: z.coerce.number().min(5, "Duration must be at least 5 minutes."),
    emoji: z.string().min(1, "Please add an emoji.").max(2, "Please use only one emoji."),
});

type CustomRechargeFormValues = z.infer<typeof customRechargeSchema>;

type RechargeModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  handleRecharge: (rechargeAmount: number, debtReduction: number) => void;
  activities: RechargeRecommendationsInput['activities'];
  currentEnergy: number;
  onCustomRecharge: (data: Omit<Activity, 'id' | 'date' | 'autoDetected' | 'recoveryTime'>) => void;
  isProMember: boolean;
};

export function RechargeModal({
  open,
  onOpenChange,
  handleRecharge,
  activities,
  currentEnergy,
  onCustomRecharge,
  isProMember,
}: RechargeModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [recommendations, setRecommendations] = useState<RechargeRecommendationsOutput>([]);
  const [view, setView] = useState<'recommendations' | 'custom'>('recommendations');

  const form = useForm<CustomRechargeFormValues>({
    resolver: zodResolver(customRechargeSchema),
    defaultValues: {
      name: "",
      impact: 20,
      duration: 15,
      emoji: "🧘",
    },
  });

  useEffect(() => {
    if (open) {
      setView('recommendations');
      form.reset();
      setIsSuggesting(false);

      if (isProMember) {
        setLoading(true);
        const fetchRecommendations = async () => {
          try {
            const input = { activities, currentEnergy };
            const result = await getRechargeRecommendations(input);
            const sortedResult = result.sort((a, b) => b.expectedImpact - a.expectedImpact);
            setRecommendations(sortedResult);
          } catch (error) {
            console.error("Failed to get recommendations:", error);
            setRecommendations([]);
          } finally {
            setLoading(false);
          }
        };
        fetchRecommendations();
      } else {
          setRecommendations([]);
          setLoading(false);
      }
    }
  }, [open, activities, currentEnergy, form, isProMember]);

  const onRechargeSelect = (activity: RechargeRecommendationsOutput[0]) => {
    handleRecharge(activity.expectedImpact, activity.expectedImpact);
    onOpenChange(false);
  };

  function onSubmit(data: CustomRechargeFormValues) {
    onCustomRecharge({
      ...data,
      type: 'recharge',
      location: 'Custom',
    });
  }

  const handleSuggestDetails = async () => {
    const activityName = form.getValues("name");
    if (!activityName || activityName.length < 3) {
      toast({
        title: "💡 Enter a Name First",
        description: "Please type a recharge activity name before asking for suggestions.",
        variant: "default",
      });
      return;
    }

    setIsSuggesting(true);
    try {
      const suggestions = await suggestRechargeDetails({ name: activityName });
      if (suggestions) {
        form.setValue("impact", suggestions.impact, { shouldValidate: true });
        form.setValue("duration", suggestions.duration, { shouldValidate: true });
        form.setValue("emoji", suggestions.emoji, { shouldValidate: true });
        toast({
          title: "🤖 Details Auto-filled!",
          description: "AI has suggested details for your recharge activity.",
        });
      }
    } catch (error) {
      console.error("Failed to get suggestions:", error);
      toast({
        title: "❌ Error",
        description: "Could not fetch AI suggestions. Please fill in the details manually.",
        variant: "destructive",
      });
    } finally {
      setIsSuggesting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card/95 backdrop-blur-lg max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            {view === 'recommendations' ? 'Personalised Recharge' : 'Custom Recharge'}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-grow overflow-y-auto custom-scrollbar pr-2">
            {view === 'recommendations' ? (
                <div className="space-y-4">
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
                ) : isProMember ? (
                  recommendations.length > 0 ? (
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
                    <p className="text-center text-muted-foreground py-8">Could not find any recommendations right now.</p>
                  )
                ) : (
                   <div className="text-center p-8 bg-muted/50 rounded-lg">
                     <Star className="mx-auto h-8 w-8 text-yellow-500 mb-2 fill-yellow-500" />
                     <h3 className="font-semibold text-card-foreground">Unlock Personalized Recommendations</h3>
                     <p className="text-sm text-muted-foreground mt-1">Upgrade to Pro to get AI-powered recharge suggestions.</p>
                   </div>
                )}
                </div>
            ) : (
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                  <div className="flex justify-between items-center">
                                    <FormLabel>Activity Name</FormLabel>
                                    <Button type="button" size="sm" variant="ghost" onClick={handleSuggestDetails} disabled={isSuggesting || !isProMember}>
                                      {isSuggesting ? (
                                        <LoaderCircle className="animate-spin" />
                                      ) : (
                                        <Sparkles className="text-yellow-500" />
                                      )}
                                      <span className="ml-2">Auto-fill</span>
                                    </Button>
                                  </div>
                                <FormControl>
                                    <Input placeholder="e.g., Deep breathing" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="emoji"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Emoji</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g., 🧘" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="impact"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Energy Boost: <span className="font-bold text-primary">+{field.value}%</span></FormLabel>
                                <FormControl>
                                    <Slider
                                    min={5}
                                    max={50}
                                    step={5}
                                    value={[field.value]}
                                    onValueChange={(value) => field.onChange(value[0])}
                                    />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="duration"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Duration (minutes)</FormLabel>
                                <FormControl>
                                    <Input type="number" placeholder="e.g., 15" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </form>
                </Form>
            )}
        </div>

        <DialogFooter className="pt-4 gap-2">
            {view === 'recommendations' ? (
                <>
                <Button variant="outline" onClick={() => setView('custom')} className="w-full">
                    <Plus className="mr-2 h-4 w-4" /> Add Custom Recharge
                </Button>
                <Button variant="secondary" onClick={() => onOpenChange(false)} className="w-full">
                    Close
                </Button>
                </>
            ) : (
                <>
                <Button type="button" variant="ghost" onClick={() => setView('recommendations')} className="w-full">Back to suggestions</Button>
                <Button type="button" onClick={form.handleSubmit(onSubmit)} className="w-full">Recharge Now</Button>
                </>
            )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
