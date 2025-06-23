
"use client";

import { useState, useRef, ChangeEvent } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type { Activity } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import Image from 'next/image';
import { analyzeImageForActivity } from "@/ai/flows/image-checkin-flow";

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
import { Sparkles, LoaderCircle, Upload, Image as ImageIcon } from "lucide-react";


const activityFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  type: z.enum(["social", "work", "recharge", "personal"]),
  impact: z.number().min(-50).max(50),
  duration: z.coerce.number().min(1, "Duration must be at least 1 minute."),
  location: z.string().min(2, "Location must be at least 2 characters."),
  emoji: z.string().min(1, "Please add an emoji.").max(2, "Please use only one emoji."),
});

type ActivityFormValues = z.infer<typeof activityFormSchema>;

type ImageCheckinModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLogActivity: (data: Omit<Activity, 'id' | 'date' | 'autoDetected' | 'recoveryTime'>) => void;
  ageGroup: 'under14' | 'over14' | null;
};

export function ImageCheckinModal({ open, onOpenChange, onLogActivity, ageGroup }: ImageCheckinModalProps) {
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [imageDataUri, setImageDataUri] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ActivityFormValues>({
    resolver: zodResolver(activityFormSchema),
    defaultValues: {
      name: "",
      type: "personal",
      impact: 0,
      duration: 30,
      location: "",
      emoji: "",
    },
  });

  const formValues = useWatch({ control: form.control });
  const formIsPopulated = formValues.name && formValues.location && formValues.emoji;

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const dataUri = e.target?.result as string;
        setImageDataUri(dataUri);
        await handleAnalyzeImage(dataUri);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyzeImage = async (dataUri: string) => {
    setIsAnalyzing(true);
    form.reset();
    try {
      const suggestions = await analyzeImageForActivity({ imageDataUri: dataUri });
      if (suggestions) {
        form.setValue("name", suggestions.name, { shouldValidate: true });
        form.setValue("type", suggestions.type, { shouldValidate: true });
        form.setValue("impact", suggestions.impact, { shouldValidate: true });
        form.setValue("duration", suggestions.duration, { shouldValidate: true });
        form.setValue("emoji", suggestions.emoji, { shouldValidate: true });
        form.setValue("location", suggestions.location, { shouldValidate: true });
        toast({
          title: "🤖 Analysis Complete!",
          description: ageGroup === 'under14' ? "Your pet filled in the details from your image." : "AI has filled in the details from your image.",
        });
      }
    } catch (error) {
      console.error("Failed to analyze image:", error);
      toast({
        title: "❌ Error",
        description: "Could not analyze the image. Please fill in details manually.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  function onSubmit(data: ActivityFormValues) {
    onLogActivity(data);
    resetState();
  }

  const resetState = () => {
    form.reset();
    setImageDataUri(null);
    setIsAnalyzing(false);
  };
  
  const handleOpenChange = (isOpen: boolean) => {
      if(!isOpen) {
          resetState();
      }
      onOpenChange(isOpen);
  }

  const description = ageGroup === 'under14' 
    ? "Upload a photo of your current activity and let your pet figure out the details."
    : "Upload a photo of your current activity and let AI figure out the details.";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-card/95 backdrop-blur-lg">
        <DialogHeader>
          <DialogTitle>Visual Check-in</DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>

        <Input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
        />

        {!imageDataUri && (
            <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="w-full h-32 border-dashed">
                <Upload className="mr-2 h-4 w-4" />
                Click to Upload an Image
            </Button>
        )}
        
        {imageDataUri && (
             <div className="relative w-full aspect-video rounded-lg overflow-hidden border">
                <Image src={imageDataUri} alt="Uploaded check-in" layout="fill" objectFit="cover" />
                {isAnalyzing && (
                    <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white">
                        <LoaderCircle className="animate-spin h-8 w-8" />
                        <p className="mt-2">Analyzing image...</p>
                    </div>
                )}
            </div>
        )}

        {(formIsPopulated || isAnalyzing) && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control} name="name"
              render={({ field }) => (
                <FormItem><FormLabel>Activity Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
                <FormField
                control={form.control} name="emoji"
                render={({ field }) => (
                    <FormItem><FormLabel>Emoji</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )}
                />
                <FormField
                control={form.control} name="location"
                render={({ field }) => (
                    <FormItem><FormLabel>Location</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )}
                />
            </div>
             <FormField
              control={form.control} name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
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
              control={form.control} name="impact"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Energy Impact: <span className="font-bold text-primary">{field.value > 0 ? '+' : ''}{field.value}%</span></FormLabel>
                  <FormControl>
                    <Slider min={-50} max={50} step={5} value={[field.value]} onValueChange={(value) => field.onChange(value[0])} />
                  </FormControl>
                   <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control} name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration (minutes)</FormLabel>
                  <FormControl><Input type="number" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
                <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>Cancel</Button>
                <Button type="submit">Log Activity</Button>
            </DialogFooter>
          </form>
        </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
