"use client";

import { useState } from "react";
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Zap, ListChecks, BrainCircuit, CalendarCheck } from "lucide-react";

type TutorialModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
};

const tutorialSteps = [
    {
        icon: <Zap className="h-10 w-10 text-yellow-500" />,
        title: "Track Your Energy",
        description: "The main screen shows your current energy level. Keep an eye on this gauge to understand your daily capacity and avoid burnout.",
    },
    {
        icon: <ListChecks className="h-10 w-10 text-blue-500" />,
        title: "Log Your Activities",
        description: "Go to the 'Activities' tab to log what drains or recharges you. Use the '+' button to add new entries, and try the AI 'Auto-fill' to save time!",
    },
    {
        icon: <Zap className="h-10 w-10 text-green-500" />,
        title: "Recharge Intelligently",
        description: "Feeling low? Hit 'Start Recharge' on the home screen. Our AI will give you personalized suggestions to get your energy back up.",
    },
    {
        icon: <BrainCircuit className="h-10 w-10 text-purple-500" />,
        title: "Discover Insights",
        description: "The 'Insights' tab reveals your energy patterns, like what drains you most and what recharges you best. Unlock achievements as you build healthy habits!",
    },
    {
        icon: <CalendarCheck className="h-10 w-10 text-indigo-500" />,
        title: "Plan Your Schedule",
        description: "Sync your calendar to see upcoming events and their estimated energy impact. EnergySync helps you prepare for demanding days.",
    },
];

const placeholderImages = [
    "https://placehold.co/400x300.png",
    "https://placehold.co/400x300.png",
    "https://placehold.co/400x300.png",
    "https://placehold.co/400x300.png",
    "https://placehold.co/400x300.png",
];

const dataAiHints = [
    "app dashboard",
    "activity list",
    "meditation suggestion",
    "analytics chart",
    "calendar schedule",
];


export function TutorialModal({ open, onOpenChange, onComplete }: TutorialModalProps) {
    const [step, setStep] = useState(0);

    const handleNext = () => {
        if (step < tutorialSteps.length - 1) {
        setStep(step + 1);
        } else {
            handleComplete();
        }
    };

    const handleBack = () => {
        if (step > 0) {
        setStep(step - 1);
        }
    };

    const handleComplete = () => {
        onComplete();
        onOpenChange(false);
    }
    
    const currentStepData = tutorialSteps[step];

    return (
        <Dialog open={open} onOpenChange={(isOpen) => {
            if (!isOpen) {
                handleComplete();
            } else {
                onOpenChange(true);
            }
        }}>
        <DialogContent className="bg-card/95 backdrop-blur-lg sm:max-w-[480px]">
            <DialogHeader className="text-center items-center pt-4">
                <div className="p-3 bg-primary/10 rounded-full mb-4">
                    {currentStepData.icon}
                </div>
                <DialogTitle className="text-2xl">{currentStepData.title}</DialogTitle>
                <DialogDescription className="text-base px-4">
                    {currentStepData.description}
                </DialogDescription>
            </DialogHeader>
            <div className="my-4 aspect-video w-full rounded-lg overflow-hidden border-2 border-primary/20 bg-muted">
                 <Image
                    src={placeholderImages[step]}
                    alt={currentStepData.title}
                    width={400}
                    height={300}
                    className="object-cover w-full h-full"
                    data-ai-hint={dataAiHints[step]}
                 />
            </div>
            <div className="flex items-center justify-center space-x-2">
                {tutorialSteps.map((_, index) => (
                    <div
                        key={index}
                        className={`h-2 w-2 rounded-full transition-all ${
                            step === index ? 'w-6 bg-primary' : 'bg-muted-foreground/50'
                        }`}
                    />
                ))}
            </div>
            <DialogFooter className="mt-4 sm:justify-between sm:flex-row-reverse gap-2">
                <Button onClick={handleNext} className="w-full sm:w-auto">
                    {step === tutorialSteps.length - 1 ? "Get Started!" : "Next"}
                    {step < tutorialSteps.length - 1 && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
                {step > 0 && (
                    <Button onClick={handleBack} variant="outline" className="w-full sm:w-auto">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Button>
                )}
            </DialogFooter>
        </DialogContent>
        </Dialog>
    );
}
