
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
} from "@/components/ui/form";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ProFeatureWrapper } from "./pro-feature-wrapper";
import { ArrowLeft, ArrowRight, HeartPulse, Sparkles, Star } from "lucide-react";
import { Progress } from "./ui/progress";


const surveySchema = z.object({
  sleepQuality: z.number().min(1).max(5),
  stressLevel: z.number().min(1).max(5),
  physicalFeeling: z.enum(["energetic", "normal", "tired", "sore"]),
});

type SurveyFormValues = z.infer<typeof surveySchema>;

type ReadinessSurveyModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (data: SurveyFormValues) => void;
  isProMember: boolean;
};

const sleepLabels = ["Poor", "Fair", "Good", "Very Good", "Excellent"];
const stressLabels = ["Very Low", "Low", "Moderate", "High", "Very High"];
const physicalOptions = [
    { value: "energetic", label: "Energetic & Rested", icon: '🤸' },
    { value: "normal", label: "Pretty Normal", icon: '🙂' },
    { value: "tired", label: "Tired & Sluggish", icon: '😴' },
    { value: "sore", label: "Sore & Achy", icon: '😩' },
]

export function ReadinessSurveyModal({ open, onOpenChange, onComplete, isProMember }: ReadinessSurveyModalProps) {
  const [step, setStep] = useState(0);

  const form = useForm<SurveyFormValues>({
    resolver: zodResolver(surveySchema),
    defaultValues: {
      sleepQuality: 3,
      stressLevel: 3,
      physicalFeeling: "normal",
    },
  });
  
  const resetForm = () => {
    setStep(0);
    form.reset();
  }

  const handleOpenChange = (isOpen: boolean) => {
    if(!isOpen) {
        resetForm();
    }
    onOpenChange(isOpen);
  }

  function onSubmit(data: SurveyFormValues) {
    onComplete(data);
    resetForm();
  }
  
  const totalSteps = 3;
  const progress = ((step + 1) / totalSteps) * 100;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-card/95 backdrop-blur-lg">
        <DialogHeader className="text-center items-center">
            <div className="p-3 rounded-full bg-primary/10 mb-2">
                <HeartPulse className="w-8 h-8 text-primary"/>
            </div>
          <DialogTitle className="text-2xl">Daily Readiness Survey</DialogTitle>
          <DialogDescription>Answer a few questions to get your score.</DialogDescription>
        </DialogHeader>

        <Progress value={progress} className="w-full my-4" />
        
        {!isProMember ? (
            <div className="text-center p-4 bg-muted/50 rounded-lg">
                <Star className="mx-auto h-8 w-8 text-yellow-500 mb-2 fill-yellow-500" />
                <h3 className="font-semibold text-card-foreground">Upgrade to Pro</h3>
                <p className="text-sm text-muted-foreground mt-1">This is a Pro feature. Upgrade your plan to calculate your readiness score.</p>
            </div>
        ) : (
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 min-h-[150px]">
                {step === 0 && (
                     <FormField
                        control={form.control}
                        name="sleepQuality"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-lg">How would you rate last night's sleep?</FormLabel>
                                <FormControl>
                                    <Slider
                                        min={1} max={5} step={1}
                                        value={[field.value]}
                                        onValueChange={(value) => field.onChange(value[0])}
                                    />
                                </FormControl>
                                <div className="text-center font-bold text-primary text-lg pt-2">{sleepLabels[field.value-1]}</div>
                            </FormItem>
                        )}
                        />
                )}
                {step === 1 && (
                     <FormField
                        control={form.control}
                        name="stressLevel"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-lg">How stressed do you feel right now?</FormLabel>
                                <FormControl>
                                    <Slider
                                        min={1} max={5} step={1}
                                        value={[field.value]}
                                        onValueChange={(value) => field.onChange(value[0])}
                                    />
                                </FormControl>
                                <div className="text-center font-bold text-primary text-lg pt-2">{stressLabels[field.value-1]}</div>
                            </FormItem>
                        )}
                        />
                )}
                {step === 2 && (
                    <FormField
                        control={form.control}
                        name="physicalFeeling"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-lg">How does your body feel?</FormLabel>
                                <FormControl>
                                     <RadioGroup
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        className="grid grid-cols-2 gap-4 pt-4"
                                    >
                                        {physicalOptions.map(opt => (
                                            <FormItem key={opt.value}>
                                                <FormControl>
                                                    <RadioGroupItem value={opt.value} id={opt.value} className="sr-only peer" />
                                                </FormControl>
                                                <Label htmlFor={opt.value} className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                                                   <span className="text-3xl mb-2">{opt.icon}</span>
                                                   {opt.label}
                                                </Label>
                                            </FormItem>
                                        ))}
                                    </RadioGroup>
                                </FormControl>
                            </FormItem>
                        )}
                    />
                )}

                <DialogFooter className="pt-4 gap-2 sm:justify-between">
                    {step > 0 ? (
                        <Button type="button" variant="outline" onClick={() => setStep(s => s - 1)}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back
                        </Button>
                    ) : <div></div>}
                    
                    {step < totalSteps - 1 ? (
                         <Button type="button" onClick={() => setStep(s => s + 1)}>
                            Next <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    ) : (
                         <Button type="submit">
                            Calculate Score <Sparkles className="ml-2 h-4 w-4"/>
                        </Button>
                    )}
                </DialogFooter>
            </form>
            </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
