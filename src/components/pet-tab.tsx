"use client";

import { useState } from "react";
import type { PetTask } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { PawPrint, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

// A component to render the animated, interactive pet
const VirtualPet = ({ happiness, isInteracting }: { happiness: number, isInteracting: boolean }) => {
    const getFace = () => {
        const strokeColor = "hsl(var(--foreground))";
        if (happiness >= 80) { // Ecstatic
            return {
                eyes: <><circle cx="35" cy="45" r="5" fill={strokeColor} /><circle cx="65" cy="45" r="5" fill={strokeColor} /></>,
                mouth: <path d="M 30 65 Q 50 85 70 65" stroke={strokeColor} strokeWidth="3" fill="none" strokeLinecap="round" />
            };
        }
        if (happiness >= 60) { // Happy
            return {
                eyes: <><circle cx="35" cy="45" r="4" fill={strokeColor} /><circle cx="65" cy="45" r="4" fill={strokeColor} /></>,
                mouth: <path d="M 35 68 Q 50 78 65 68" stroke={strokeColor} strokeWidth="3" fill="none" strokeLinecap="round" />
            };
        }
        if (happiness >= 40) { // Neutral
            return {
                eyes: <><circle cx="35" cy="45" r="4" fill={strokeColor} /><circle cx="65" cy="45" r="4" fill={strokeColor} /></>,
                mouth: <line x1="35" y1="70" x2="65" y2="70" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" />
            };
        }
        if (happiness >= 20) { // Worried
            return {
                eyes: <><circle cx="35" cy="45" r="3.5" fill={strokeColor} /><circle cx="65" cy="45" r="3.5" fill={strokeColor} /></>,
                mouth: <path d="M 35 72 Q 50 62 65 72" stroke={strokeColor} strokeWidth="3" fill="none" strokeLinecap="round" />
            };
        }
        return { // Sad
            eyes: <><circle cx="35" cy="45" r="3" fill={strokeColor} /><circle cx="65" cy="45" r="3" fill={strokeColor} /></>,
            mouth: <path d="M 30 75 Q 50 55 70 75" stroke={strokeColor} strokeWidth="3" fill="none" strokeLinecap="round" />
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
                    <path
                        d="M 50,95 C 10,95 10,50 10,50 C 10,10 40,10 50,25 C 60,10 90,10 90,50 C 90,50 90,95 50,95 Z"
                        fill="hsl(var(--primary) / 0.2)"
                        stroke="hsl(var(--primary))"
                        strokeWidth="3"
                        className="animate-breathe"
                    />
                    {getFace().eyes}
                    {getFace().mouth}
                </svg>
            </div>
            <p className="text-muted-foreground mt-2 font-semibold">{getHappinessText()}</p>
        </div>
    );
};

type PetTabProps = {
  tasks: PetTask[];
  onTaskComplete: (taskId: number) => void;
  interactions: number;
  onInteractWithPet: () => void;
  petHappiness: number;
};

export function PetTab({ tasks, onTaskComplete, interactions, onInteractWithPet, petHappiness }: PetTabProps) {
    const [isInteracting, setIsInteracting] = useState(false);

    const handleInteraction = () => {
        if (interactions > 0 && !isInteracting) {
            onInteractWithPet();
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
                    <div className="text-center mt-4">
                        <Button onClick={handleInteraction} disabled={interactions === 0 || isInteracting} className="w-full sm:w-auto">
                            <Heart className="mr-2 h-4 w-4" />
                            Interact ({interactions} left)
                        </Button>
                        {interactions === 0 && <p className="text-xs text-muted-foreground mt-2">Complete tasks to earn more interactions!</p>}
                    </div>
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
