"use client";

import type { PetTask } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { PawPrint, Heart } from "lucide-react";

// A simple component to render the pet
const VirtualPet = ({ happiness }: { happiness: number }) => {
    const getPetEmoji = () => {
        if (happiness >= 80) return '😄';
        if (happiness >= 60) return '😊';
        if (happiness >= 40) return '😐';
        if (happiness >= 20) return '😟';
        return '😢';
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
            <div className="text-8xl mx-auto animate-bounce w-24 h-24 flex items-center justify-center">{getPetEmoji()}</div>
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
    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent">
                Your Energy Pet
            </h2>

            <Card className="bg-card/80 backdrop-blur-sm">
                <CardContent className="p-6">
                    <VirtualPet happiness={petHappiness} />
                    <div className="text-center mt-4">
                        <Button onClick={onInteractWithPet} disabled={interactions === 0} className="w-full sm:w-auto">
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
