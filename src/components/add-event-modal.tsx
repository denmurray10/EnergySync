
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, addDays } from "date-fns";
import type { UpcomingEvent, Friend } from "@/lib/types";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Sparkles, LoaderCircle, Star, Calendar as CalendarIcon, ArrowLeft, ArrowRight, Check } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";
import { cn } from "@/lib/utils";
import { Progress } from "./ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Checkbox } from "./ui/checkbox";

const eventFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  type: z.enum(["social", "work", "personal"]),
  estimatedImpact: z.number().min(-50).max(50),
  date: z.string().min(1, "Please enter a date."),
  time: z.string().min(1, "Please select a time."),
  emoji: z.string(),
  taggedFriendIds: z.array(z.string()).optional(),
});

type EventFormValues = z.infer<typeof eventFormSchema>;

const timeOptions: string[] = [];
for (let h = 1; h <= 12; h++) {
    for (let m = 0; m < 60; m += 30) {
        const hour = h;
        const minute = m.toString().padStart(2, '0');
        timeOptions.push(`${hour}:${minute} AM`);
        timeOptions.push(`${hour}:${minute} PM`);
    }
}
// Adjust for 12 AM/PM ordering
const sortedTimeOptions = [
    ...timeOptions.filter(t => t.includes('AM')).sort((a,b) => a.localeCompare(b, undefined, { numeric: true })),
    ...timeOptions.filter(t => t.includes('PM')).sort((a,b) => a.localeCompare(b, undefined, { numeric: true })),
].filter(t => !t.startsWith("12:00 PM"));
sortedTimeOptions.push('12:00 PM'); 
sortedTimeOptions.unshift(...sortedTimeOptions.splice(sortedTimeOptions.findIndex(v => v.startsWith("12:") && v.endsWith("AM")), 2))


type AddEventModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLogEvent: (data: Omit<UpcomingEvent, 'id' | 'conflictRisk' | 'bufferSuggested'>) => void;
  isProMember: boolean;
  ageGroup: 'under14' | '14to17' | 'over18' | null;
  friends: Friend[];
};

export function AddEventModal({ open, onOpenChange, onLogEvent, isProMember, ageGroup, friends }: AddEventModalProps) {
  const { toast } = useToast();
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [step, setStep] = useState(0);

  const totalSteps = 3;
  const progress = ((step + 1) / totalSteps) * 100;
  
  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      name: "",
      type: "personal",
      estimatedImpact: -10,
      date: format(addDays(new Date(), 1), "PPP"),
      time: "5:00 PM",
      emoji: "🗓️",
      taggedFriendIds: [],
    },
  });

  const autoFillText = ageGroup === 'under14' ? 'Ask Pet' : 'Auto-fill';

  const resetForm = () => {
    form.reset({
      name: "",
      type: "personal",
      estimatedImpact: -10,
      date: format(addDays(new Date(), 1), "PPP"),
      time: "5:00 PM",
      emoji: "🗓️",
      taggedFriendIds: [],
    });
    setStep(0);
  };
  
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
        resetForm();
    }
    onOpenChange(isOpen);
  };

  const handleNext = async () => {
      let fieldsToValidate: (keyof EventFormValues)[] = [];
      if (step === 0) fieldsToValidate = ['name', 'emoji', 'type'];
      if (step === 1) fieldsToValidate = ['estimatedImpact', 'date', 'time'];
      
      const isValid = await form.trigger(fieldsToValidate as any);
      if (isValid) {
          setStep(s => s + 1);
      }
  };

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
          description: ageGroup === 'under14' ? "Your pet has suggested details for your event." : "AI has suggested details for your event.",
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

  function onSubmit(data: EventFormValues) {
    onLogEvent(data);
    handleOpenChange(false);
  }

  const renderStepContent = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-4">
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
          </div>
        );
      case 1:
        return (
          <div className="space-y-4">
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
                    <FormItem className="flex flex-col">
                      <FormLabel>Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                field.value
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value ? new Date(field.value) : undefined}
                            onSelect={(date) => field.onChange(date ? format(date, "PPP") : "")}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
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
                    <Select onValueChange={field.onChange} value={field.value}>
                       <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a time" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <ScrollArea className="h-48">
                            {sortedTimeOptions.map(time => (
                                <SelectItem key={time} value={time}>{time}</SelectItem>
                            ))}
                            </ScrollArea>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
          </div>
        );
        case 2:
            return (
                <div className="space-y-4">
                    <FormLabel>Tag Friends (Optional)</FormLabel>
                     <p className="text-sm text-muted-foreground">Select friends to share this event with.</p>
                    <ScrollArea className="h-48 w-full rounded-md border p-2">
                        <FormField
                            control={form.control}
                            name="taggedFriendIds"
                            render={({ field }) => (
                                <div className="space-y-2">
                                {friends.filter(f => !f.isMe).map(friend => (
                                    <FormItem key={friend.id} className="flex flex-row items-center space-x-3 space-y-0 rounded-lg p-2 hover:bg-muted">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value?.includes(friend.id)}
                                                onCheckedChange={(checked) => {
                                                    return checked
                                                    ? field.onChange([...(field.value || []), friend.id])
                                                    : field.onChange(
                                                        field.value?.filter(
                                                            (value) => value !== friend.id
                                                        )
                                                        )
                                                }}
                                            />
                                        </FormControl>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={friend.avatar} data-ai-hint={friend.avatarHint} />
                                                <AvatarFallback>{friend.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <FormLabel className="font-normal text-sm">{friend.name}</FormLabel>
                                        </div>
                                    </FormItem>
                                ))}
                                </div>
                            )}
                        />
                    </ScrollArea>
                </div>
            )
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-card/95 backdrop-blur-lg rounded-3xl">
        <DialogHeader>
          <DialogTitle>Add to Schedule</DialogTitle>
          <DialogDescription>
            Add a new event to your Smart Schedule to see its potential impact.
          </DialogDescription>
        </DialogHeader>

        <Progress value={progress} className="w-full my-4" />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 min-h-[260px]">
            {renderStepContent()}
            <DialogFooter className="pt-8 gap-2">
                {step > 0 && (
                     <Button type="button" variant="outline" onClick={() => setStep(s => s - 1)}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                )}
                 {step < totalSteps - 1 ? (
                    <Button type="button" onClick={handleNext} className="w-full">
                        Next <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                ) : (
                    <Button type="submit" className="w-full">
                        <Check className="mr-2 h-4 w-4" /> Add Event
                    </Button>
                )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
