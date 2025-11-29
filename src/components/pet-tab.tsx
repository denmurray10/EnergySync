
"use client";

import { useState, useMemo } from "react";
import { useRouter } from 'next/navigation';
import type { PetTask, PetCustomization } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { PawPrint, Utensils, Bed, Paintbrush, Star, Settings, Gamepad2 } from "lucide-react";
import { VirtualPet, type PetType } from "./virtual-pet";

type PetTabProps = {
    tasks: PetTask[];
    onTaskComplete: (taskId: number) => void;
    interactions: number;
    petHappiness: number;
    onPetInteraction: (toast: { title: string, description: string }) => void;
    customization: PetCustomization;
    openCustomization: () => void;
    openSettings: () => void;
    onOpenAR: () => void;
    level: number;
    exp: number;
    petName: string;
    petType: PetType;
    lastTaskCompletionTime: number | null;
};

export function PetTab({
    tasks,
    onTaskComplete,
    interactions,
    petHappiness,
    onPetInteraction,
    customization,
    openCustomization,
    openSettings,
    onOpenAR,
    level,
    exp,
    petName,
    petType,
    lastTaskCompletionTime
}: PetTabProps) {
    const [isInteracting, setIsInteracting] = useState(false);
    const [lastLocalInteractionTime, setLastLocalInteractionTime] = useState<number | null>(null);
    const router = useRouter();
    const expToNextLevel = 100 * level;
    const expPercentage = (exp / expToNextLevel) * 100;

    const uncompletedTask = tasks.find(task => !task.completed);
    const shouldShowSuggestion = petHappiness < 80 && uncompletedTask;

    const petSuggestion = useMemo(() => {
        if (lastTaskCompletionTime) {
            const thirtyMinutes = 30 * 60 * 1000;
            if (Date.now() - lastTaskCompletionTime < thirtyMinutes) {
                return null; // Cooldown is active
            }
        }

        // AR play suggestions (no task required)
        const arPlaySuggestions = [
            "Wanna play in AR? Tap me! 🎮",
            "Let's explore in AR! Touch me! 🌟",
            "Ready for an AR adventure? 🚀",
            "Tap me to enter AR mode! ✨",
            "Let's play some AR games! 🎯"
        ];

        // Determine if we should show task or AR suggestion
        const now = Date.now();
        const hourOfDay = new Date().getHours();
        const suggestionSeed = Math.floor(now / (10 * 60 * 1000)); // Changes every 10 minutes

        // 50% chance for AR suggestion, 50% for task suggestion
        const showARSuggestion = suggestionSeed % 2 === 0;

        if (showARSuggestion) {
            // Show AR play invitation
            const arIndex = suggestionSeed % arPlaySuggestions.length;
            return arPlaySuggestions[arIndex];
        }

        // Show task suggestion if there's an uncompleted task
        if (!shouldShowSuggestion || !uncompletedTask) {
            // Fallback to AR suggestion if no tasks
            const arIndex = suggestionSeed % arPlaySuggestions.length;
            return arPlaySuggestions[arIndex];
        }

        // Use the task ID to create a semi-stable random-like suggestion
        const suggestionType = uncompletedTask.id % 3;
        if (suggestionType === 0) {
            return `I think doing "${uncompletedTask.name}" would be great!`;
        } else if (suggestionType === 1) {
            return `Hey, what do you say we do "${uncompletedTask.name}"?`;
        } else {
            return `I bet we'd both feel better if we completed "${uncompletedTask.name}"!`;
        }
    }, [shouldShowSuggestion, uncompletedTask, lastTaskCompletionTime]);


    const handleAction = (toast: { title: string, description: string }) => {
        if (interactions > 0 && !isInteracting) {
            onPetInteraction(toast);
            setIsInteracting(true);
            setLastLocalInteractionTime(Date.now());
            setTimeout(() => {
                setIsInteracting(false);
            }, 500); // Duration of the jump animation
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent">
                    {petName}
                </h2>
            </div>

            <Card className="bg-card/80 backdrop-blur-sm overflow-hidden cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-200" onClick={onOpenAR}>
                <CardContent className="p-0">
                    <VirtualPet
                        petType={petType}
                        happiness={petHappiness}
                        isInteracting={isInteracting}
                        customization={customization}
                        level={level}
                        suggestion={petSuggestion}
                        lastInteractionTime={lastLocalInteractionTime || lastTaskCompletionTime}
                    />
                </CardContent>
            </Card>

            <Card className="bg-card/80 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="flex items-center text-xl">Pet Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-1">
                        <div className="flex justify-between items-center text-sm font-medium">
                            <span className="flex items-center"><Star className="h-4 w-4 mr-2 text-yellow-500 fill-yellow-500" /> <span>Level {level}</span></span>
                            <span className="text-xs text-muted-foreground">{Math.floor(exp)} / {expToNextLevel} XP</span>
                        </div>
                        <Progress value={expPercentage} indicatorClassName="bg-yellow-500" />
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-card/80 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle>Actions</CardTitle>
                    <CardDescription>Use your {interactions} interactions to care for your pet.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-3 gap-2">
                    <Button onClick={() => handleAction({ title: "Yum!", description: "Your pet enjoyed the snack!" })} disabled={interactions <= 0 || isInteracting}>
                        <Utensils className="mr-2 h-4 w-4" /> Feed
                    </Button>
                    <Button onClick={() => handleAction({ title: "Aww!", description: "Your pet loves being petted." })} disabled={interactions <= 0 || isInteracting}>
                        <PawPrint className="mr-2 h-4 w-4" /> Pet
                    </Button>
                    <Button onClick={() => handleAction({ title: "So fun!", description: "Your pet loves to play." })} disabled={interactions <= 0 || isInteracting}>
                        <Bed className="mr-2 h-4 w-4" /> Play
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
