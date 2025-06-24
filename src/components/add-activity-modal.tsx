
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type { Activity } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { suggestActivityDetails } from "@/ai/flows/suggest-activity-details";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Sparkles, LoaderCircle, Star } from "lucide-react";


const activityFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  type: z.enum(["social", "work", "recharge", "personal"]),
  impact: z.number().min(-50).max(50),
  duration: z.coerce.number().min(1, "Duration must be at least 1 minute."),
  location: z.string().min(2, "Location must be at least 2 characters."),
  emoji: z.string().min(1, "Please add an emoji.").max(2, "Please use only one emoji."),
});

type ActivityFormValues = z.infer<typeof activityFormSchema>;

type AddActivityModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLogActivity: (data: Omit<Activity, 'id' | 'date' | 'autoDetected' | 'recoveryTime'>) => void;
  isProMember: boolean;
  ageGroup: 'under14' | '14to17' | 'over18' | null;
};

export function AddActivityModal({ open, onOpenChange, onLogActivity, isProMember, ageGroup }: AddActivityModalProps) {
  const { toast } = useToast();
  const [isSuggesting, setIsSuggesting] = useState(false);

  const form = useForm<ActivityFormValues>({
    resolver: zodResolver(activityFormSchema),
    defaultValues: {
      name: "",
      type: "personal",
      impact: 0,
      duration: 30,
      location: "Home",
      emoji: "📝",
    },
  });

  const handleSuggestDetails = async () => {
    const activityName = form.getValues("name");
    if (!activityName || activityName.length < 3) {
      toast({
        title: "💡 Enter a Name First",
        description: "Please type an activity name before asking for suggestions.",
        variant: "default",
      });
      return;
    }

    setIsSuggesting(true);
    try {
      const suggestions = await suggestActivityDetails({ name: activityName });
      if (suggestions) {
        form.setValue("type", suggestions.type, { shouldValidate: true });
        form.setValue("impact", suggestions.impact, { shouldValidate: true });
        form.setValue("duration", suggestions.duration, { shouldValidate: true });
        form.setValue("emoji", suggestions.emoji, { shouldValidate: true });
        toast({
          title: "🤖 Details Auto-filled!",
          description: ageGroup === 'under14' ? "Your pet has suggested details for your activity." : "AI has suggested details for your activity.",
        });
      }
    } catch (error) {
      console.error("Failed to get suggestions:", error);
      toast({
        title: "❌ Error",
        description: "Could not fetch suggestions. Please fill in the details manually.",
        variant: "destructive",
      });
    } finally {
      setIsSuggesting(false);
    }
  };

  function onSubmit(data: ActivityFormValues) {
    onLogActivity(data);
    form.reset();
  }

  const autoFillText = ageGroup === 'under14' ? 'Ask Pet' : 'Auto-fill';

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) form.reset();
      onOpenChange(isOpen);
    }}>
      <DialogContent className="bg-card/95 backdrop-blur-lg">
        <DialogHeader>
          <DialogTitle>Log a New Activity</DialogTitle>
          <DialogDescription>
            Track what drains and recharges you. Or, let your helper fill in the details for you!
          </DialogDescription>
        </DialogHeader>
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
                      <span className="ml-2">{autoFillText}</span>
                      {!isProMember && (
                        <Badge variant="destructive" className="ml-2 bg-gradient-to-r from-yellow-400 to-amber-500 text-white border-none">
                            <Star className="w-3 h-3 mr-1 fill-white"/>
                            PRO
                        </Badge>
                      )}
                    </Button>
                  </div>
                  <FormControl>
                    <Input placeholder="e.g., Coffee with a friend" {...field} />
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
                    <Input placeholder="e.g., ☕" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select activity type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="social">Social</SelectItem>
                      <SelectItem value="work">Work</SelectItem>
                      <SelectItem value="recharge">Recharge</SelectItem>
                      <SelectItem value="personal">Personal</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="impact"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Energy Impact: <span className="font-bold text-primary">{field.value > 0 ? '+' : ''}{field.value}%</span></FormLabel>
                  <FormControl>
                    <Slider
                      min={-50}
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
                    <Input type="number" placeholder="e.g., 60" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Cafe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                <Button type="submit">Log Activity</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
