"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type { UpcomingEvent } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { suggestEventDetails } from "@/ai/flows/suggest-event-details";

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

const eventFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  type: z.enum(["social", "work", "personal"]),
  estimatedImpact: z.number().min(-50).max(50),
  date: z.string().min(1, "Please enter a date."),
  time: z.string().min(1, "Please enter a time."),
  emoji: z.string().min(1, "Please add an emoji.").max(2, "Please use only one emoji."),
});

type EventFormValues = z.infer<typeof eventFormSchema>;

type AddEventModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLogEvent: (data: Omit<UpcomingEvent, 'id' | 'conflictRisk' | 'bufferSuggested'>) => void;
  isProMember: boolean;
};

export function AddEventModal({ open, onOpenChange, onLogEvent, isProMember }: AddEventModalProps) {
  const { toast } = useToast();
  const [isSuggesting, setIsSuggesting] = useState(false);
  
  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      name: "",
      type: "personal",
      estimatedImpact: -10,
      date: "Today",
      time: "5:00 PM",
      emoji: "🗓️",
    },
  });

  const handleSuggestDetails = async () => {
    const eventName = form.getValues("name");
    if (!eventName || eventName.length < 3) {
      toast({
        title: "💡 Enter a Name First",
        description: "Please type an event name before asking for suggestions.",
        variant: "default",
      });
      return;
    }

    setIsSuggesting(true);
    try {
      const suggestions = await suggestEventDetails({ name: eventName });
      if (suggestions) {
        form.setValue("type", suggestions.type, { shouldValidate: true });
        form.setValue("estimatedImpact", suggestions.estimatedImpact, { shouldValidate: true });
        form.setValue("emoji", suggestions.emoji, { shouldValidate: true });
        toast({
          title: "🤖 Details Auto-filled!",
          description: "AI has suggested details for your event.",
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


  function onSubmit(data: EventFormValues) {
    onLogEvent(data);
    form.reset();
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) form.reset();
      onOpenChange(isOpen);
    }}>
      <DialogContent className="bg-card/95 backdrop-blur-lg rounded-3xl">
        <DialogHeader>
          <DialogTitle>Add to Schedule</DialogTitle>
          <DialogDescription>
            Add a new event to your Smart Schedule to see its potential impact.
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
                    <FormLabel>Event Name</FormLabel>
                    <Button type="button" size="sm" variant="ghost" onClick={handleSuggestDetails} disabled={isSuggesting || !isProMember}>
                      {isSuggesting ? (
                        <LoaderCircle className="animate-spin" />
                      ) : (
                        <Sparkles className="text-yellow-500" />
                      )}
                      <span className="ml-2">Auto-fill</span>
                      {!isProMember && (
                        <Badge variant="destructive" className="ml-2 bg-gradient-to-r from-yellow-400 to-amber-500 text-white border-none">
                            <Star className="w-3 h-3 mr-1 fill-white"/>
                            PRO
                        </Badge>
                      )}
                    </Button>
                  </div>
                  <FormControl>
                    <Input placeholder="e.g., Team Lunch" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="emoji"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Emoji</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g., 🍽️" {...field} />
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
                            <SelectValue placeholder="Select event type" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        <SelectItem value="social">Social</SelectItem>
                        <SelectItem value="work">Work</SelectItem>
                        <SelectItem value="personal">Personal</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
             <FormField
              control={form.control}
              name="estimatedImpact"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estimated Impact: <span className="font-bold text-primary">{field.value > 0 ? '+' : ''}{field.value}%</span></FormLabel>
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
            <div className="grid grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g., Tomorrow" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Time</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g., 1:00 PM" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
            <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                <Button type="submit">Add Event</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
