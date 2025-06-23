"use client";

import { useState } from "react";
import type { PetTask } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { PawPrint, Heart, Utensils, Bed, ShowerHead } from "lucide-react";
import { cn } from "@/lib/utils";

// A component to render the animated, interactive pet
const VirtualPet = ({ happiness, isInteracting }: { happiness: number, isInteracting: boolean }) => {
    const getFace = () => {
        const strokeColor = "hsl(var(--foreground))";
        if (happiness >= 80) { // Ecstatic, happy eyes and wide smile
            return {
                eyes: <>
                    <path d="M 35 48 C 38 42, 42 42, 45 48" stroke={strokeColor} strokeWidth="2.5" fill="none" strokeLinecap="round" />
                    <path d="M 55 48 C 58 42, 62 42, 65 48" stroke={strokeColor} strokeWidth="2.5" fill="none" strokeLinecap="round" />
                </>,
                mouth: <path d="M 40 63 Q 50 73, 60 63" stroke={strokeColor} strokeWidth="2.5" fill="none" strokeLinecap="round" />
            };
        }
        if (happiness >= 60) { // Happy, round eyes and smile
            return {
                eyes: <><circle cx="40" cy="48" r="3" fill={strokeColor} /><circle cx="60" cy="48" r="3" fill={strokeColor} /></>,
                mouth: <path d="M 42 63 Q 50 69, 58 63" stroke={strokeColor} strokeWidth="2.5" fill="none" strokeLinecap="round" />
            };
        }
        if (happiness >= 40) { // Neutral, round eyes and flat mouth
            return {
                eyes: <><circle cx="40" cy="48" r="3" fill={strokeColor} /><circle cx="60" cy="48" r="3" fill={strokeColor} /></>,
                mouth: <line x1="45" y1="65" x2="55" y2="65" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" />
            };
        }
        if (happiness >= 20) { // Worried, small eyes and wavy mouth
            return {
                eyes: <><circle cx="40" cy="48" r="2.5" fill={strokeColor} /><circle cx="60" cy="48" r="2.5" fill={strokeColor} /></>,
                mouth: <path d="M 42 67 Q 50 61, 58 67" stroke={strokeColor} strokeWidth="2.5" fill="none" strokeLinecap="round" />
            };
        }
        return { // Sad, small eyes and downturned mouth
            eyes: <><circle cx="40" cy="48" r="2.5" fill={strokeColor} /><circle cx="60" cy="48" r="2.5" fill={strokeColor} /></>,
            mouth: <path d="M 40 70 Q 50 60, 60 70" stroke={strokeColor} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        };
    };

    const getHappinessText = () => {
        if (happiness >= 80) return "Feeling ecstatic!";
        if (happiness >= 60) return "Very happy!";
        if (happiness >= 40) return "Doing okay.";
        if (happiness >= 20) return "A little sad...";
        return "Needs some love!";
    }

    return (
        <div className="text-center">
             <div className={cn("relative w-48 h-48 mx-auto", isInteracting && "animate-jump")}>
                <svg viewBox="0 0 100 100" className="w-full h-full">
                    <g className="animate-breathe">
                        {/* Cat Body */}
                        <path 
                            d="M 50,95 C 25,95 20,70 20,55 C 20,30 30,20 50,20 C 70,20 80,30 80,55 C 80,70 75,95 50,95 Z"
                            fill="hsl(var(--primary) / 0.2)"
                            stroke="hsl(var(--primary))"
                            strokeWidth="3"
                            strokeLinejoin="round"
                        />
                         {/* Cat Ears */}
                        <path
                            d="M 32 32 C 32 32, 20 15, 35 15 C 40 15, 40 25, 40 25 Z"
                            fill="hsl(var(--primary) / 0.2)"
                            stroke="hsl(var(--primary))"
                            strokeWidth="3"
                            strokeLinejoin="round"
                        />
                        <path
                            d="M 68 32 C 68 32, 80 15, 65 15 C 60 15, 60 25, 60 25 Z"
                            fill="hsl(var(--primary) / 0.2)"
                            stroke="hsl(var(--primary))"
                            strokeWidth="3"
                            strokeLinejoin="round"
                        />
                         {/* Whiskers */}
                        <g stroke="hsl(var(--foreground))" strokeWidth="1" opacity="0.7">
                            <path d="M 28 58 L 15 55" />
                            <path d="M 29 63 L 15 63" />
                            <path d="M 28 68 L 15 71" />
                            <path d="M 72 58 L 85 55" />
                            <path d="M 71 63 L 85 63" />
                            <path d="M 72 68 L 85 71" />
                        </g>
                        {getFace().eyes}
                        {getFace().mouth}
                    </g>
                </svg>
            </div>
            <p className="text-muted-foreground mt-2 font-semibold">{getHappinessText()}</p>
        </div>
    );
};

const StatBar = ({ label, value, icon, colorClass }: { label: string; value: number; icon: React.ReactNode; colorClass: string }) => (
    <div className="space-y-1">
        <div className="flex justify-between items-center text-sm font-medium">
            <span className="flex items-center">{icon} <span className="ml-2">{label}</span></span>
            <span>{Math.round(value)}%</span>
        </div>
        <Progress value={value} indicatorClassName={colorClass} />
    </div>
);


type PetTabProps = {
  tasks: PetTask[];
  onTaskComplete: (taskId: number) => void;
  interactions: number;
  petHappiness: number;
  petHunger: number;
  petEnergy: number;
  petHygiene: number;
  onFeedPet: () => void;
  onSleepPet: () => void;
  onToiletPet: () => void;
};

export function PetTab({ 
    tasks, 
    onTaskComplete, 
    interactions, 
    petHappiness,
    petHunger,
    petEnergy,
    petHygiene,
    onFeedPet,
    onSleepPet,
    onToiletPet,
}: PetTabProps) {
    const [isInteracting, setIsInteracting] = useState(false);

    const handleAction = (action: () => void) => {
        if (interactions > 0 && !isInteracting) {
            action();
            setIsInteracting(true);
            setTimeout(() => {
                setIsInteracting(false);
            }, 500); // Duration of the jump animation
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent">
                Your Energy Pet
            </h2>

            <Card className="bg-card/80 backdrop-blur-sm overflow-hidden">
                <CardContent className="p-6">
                    <VirtualPet happiness={petHappiness} isInteracting={isInteracting} />
                </CardContent>
            </Card>

            <Card className="bg-card/80 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="flex items-center text-xl">Pet's Needs</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <StatBar label="Hunger" value={petHunger} icon={<Utensils className="h-4 w-4 text-orange-500" />} colorClass="bg-orange-500" />
                    <StatBar label="Energy" value={petEnergy} icon={<Bed className="h-4 w-4 text-blue-500" />} colorClass="bg-blue-500" />
                    <StatBar label="Hygiene" value={petHygiene} icon={<ShowerHead className="h-4 w-4 text-cyan-500" />} colorClass="bg-cyan-500" />
                </CardContent>
            </Card>

            <Card className="bg-card/80 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle>Actions</CardTitle>
                    <CardDescription>Use your {interactions} interactions to care for your pet.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-3 gap-2">
                    <Button onClick={() => handleAction(onFeedPet)} disabled={interactions <= 0 || isInteracting}>
                        <Utensils className="mr-2 h-4 w-4" /> Feed
                    </Button>
                    <Button onClick={() => handleAction(onSleepPet)} disabled={interactions <= 0 || isInteracting}>
                        <Bed className="mr-2 h-4 w-4" /> Sleep
                    </Button>
                    <Button onClick={() => handleAction(onToiletPet)} disabled={interactions <= 0 || isInteracting}>
                        <ShowerHead className="mr-2 h-4 w-4" /> Toilet
                    </Button>
                </CardContent>
            </Card>


            <Card className="bg-card/80 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="flex items-center text-xl">
                        <PawPrint className="mr-3 text-cyan-500" />
                        Daily Tasks
                    </CardTitle>
                    <CardDescription>Complete these tasks to earn interactions with your pet.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {tasks.map(task => (
                            <div key={task.id} className="flex items-center space-x-3 bg-muted/50 p-3 rounded-lg transition-colors hover:bg-muted">
                                <Checkbox id={`task-${task.id}`} checked={task.completed} onCheckedChange={() => onTaskComplete(task.id)} className="h-5 w-5" />
                                <Label htmlFor={`task-${task.id}`} className={`flex-grow cursor-pointer ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                                    <span className="font-semibold text-card-foreground">{task.icon} {task.name}</span>
                                </Label>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
