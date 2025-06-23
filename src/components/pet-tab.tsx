"use client";

import { useState } from "react";
import type { PetTask, PetCustomization } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { PawPrint, Utensils, Bed, Paintbrush, Star, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

type PetType = 'cat' | 'dog' | 'horse' | 'chicken';

const PetFace = ({ happiness }: { happiness: number }) => {
    const strokeColor = "hsl(var(--foreground))";
    if (happiness >= 80) { // Ecstatic
        return (
            <g>
                <path d="M 35 48 C 38 42, 42 42, 45 48" stroke={strokeColor} strokeWidth="2.5" fill="none" strokeLinecap="round" />
                <path d="M 55 48 C 58 42, 62 42, 65 48" stroke={strokeColor} strokeWidth="2.5" fill="none" strokeLinecap="round" />
                <path d="M 40 63 Q 50 73, 60 63" stroke={strokeColor} strokeWidth="2.5" fill="none" strokeLinecap="round" />
            </g>
        );
    }
    if (happiness >= 60) { // Happy
        return (
            <g>
                <circle cx="40" cy="48" r="3" fill={strokeColor} />
                <circle cx="60" cy="48" r="3" fill={strokeColor} />
                <path d="M 42 63 Q 50 69, 58 63" stroke={strokeColor} strokeWidth="2.5" fill="none" strokeLinecap="round" />
            </g>
        );
    }
    if (happiness >= 40) { // Neutral
        return (
            <g>
                <circle cx="40" cy="48" r="3" fill={strokeColor} />
                <circle cx="60" cy="48" r="3" fill={strokeColor} />
                <line x1="45" y1="65" x2="55" y2="65" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" />
            </g>
        );
    }
    if (happiness >= 20) { // Worried
        return (
            <g>
                <circle cx="40" cy="48" r="2.5" fill={strokeColor} />
                <circle cx="60" cy="48" r="2.5" fill={strokeColor} />
                <path d="M 42 67 Q 50 61, 58 67" stroke={strokeColor} strokeWidth="2.5" fill="none" strokeLinecap="round" />
            </g>
        );
    }
    return ( // Sad
        <g>
            <circle cx="40" cy="48" r="2.5" fill={strokeColor} />
            <circle cx="60" cy="48" r="2.5" fill={strokeColor} />
            <path d="M 40 70 Q 50 60, 60 70" stroke={strokeColor} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </g>
    );
};

const PetBody = ({ type, color }: { type: PetType, color: string }) => {
    const bodyProps = {
        fill: color,
        stroke: "hsl(var(--primary))",
        strokeWidth: "3",
        strokeLinejoin: "round" as const
    };

    switch (type) {
        case 'dog':
            return (
                <g>
                    <path d="M 50,95 C 25,95 20,70 20,55 C 20,30 35,22 50,22 C 65,22 80,30 80,55 C 80,70 75,95 50,95 Z" {...bodyProps} />
                    <path d="M 25 35 C 15 45, 15 60, 28 60 L 28 40 Z" {...bodyProps} />
                    <path d="M 75 35 C 85 45, 85 60, 72 60 L 72 40 Z" {...bodyProps} />
                </g>
            );
        case 'horse':
             return (
                <g>
                    <path d="M 50 20 C 35 20, 28 40, 28 55 C 28 80, 40 98, 50 98 C 60 98, 72 80, 72 55 C 72 40, 65 20, 50 20 Z" {...bodyProps}/>
                    <path d="M 40 20 L 35 8 L 45 20" {...bodyProps} />
                    <path d="M 60 20 L 65 8 L 55 20" {...bodyProps} />
                    <path d="M 50 20 C 58 35, 52 45, 50 50" fill="none" stroke={bodyProps.stroke} strokeWidth="2" strokeLinecap="round" />
                </g>
            );
        case 'chicken':
            return (
                <g>
                    <path d="M 50,95 C 20,95 20,65 35,50 C 45,40 55,40 65,50 C 80,65 80,95 50,95 Z" {...bodyProps} />
                    <path d="M 45 42 C 40 35, 50 32, 50 38 C 50 32, 60 35, 55 42 Z" fill="hsl(var(--destructive))" stroke={bodyProps.stroke} strokeWidth="2" />
                </g>
            );
        case 'cat':
        default:
            return (
                <g>
                    <path d="M 50,95 C 25,95 20,70 20,55 C 20,30 30,20 50,20 C 70,20 80,30 80,55 C 80,70 75,95 50,95 Z" {...bodyProps} />
                    <path d="M 32 32 C 32 32, 20 15, 35 15 C 40 15, 40 25, 40 25 Z" {...bodyProps} />
                    <path d="M 68 32 C 68 32, 80 15, 65 15 C 60 15, 60 25, 60 25 Z" {...bodyProps} />
                </g>
            );
    }
}


const VirtualPet = ({ petType, happiness, isInteracting, customization, level }: { petType: PetType, happiness: number; isInteracting: boolean, customization: PetCustomization, level: number }) => {
    const getHappinessText = () => {
        if (happiness >= 80) return "Feeling ecstatic because you are!";
        if (happiness >= 60) return "Feeling great, just like you!";
        if (happiness >= 40) return "Feeling a bit sluggish...";
        if (happiness >= 20) return "Needs an energy boost...";
        return "Feeling drained, needs a recharge!";
    }

    const backgroundClass = {
        default: 'bg-card',
        park: 'bg-green-100',
        cozy: 'bg-amber-100'
    }[customization.background] || 'bg-card';
    
    const scale = 1 + (level - 1) * 0.05;

    return (
        <div className={cn("text-center rounded-2xl p-4 transition-colors", backgroundClass)}>
             <div className={cn("relative w-48 h-48 mx-auto transition-transform", isInteracting && "animate-jump")} style={{ transform: `scale(${scale})` }}>
                <svg viewBox="0 0 100 100" className="w-full h-full">
                    <g className="animate-breathe">
                        <PetBody type={petType} color={customization.color} />
                        {(petType === 'cat' || petType === 'dog') && (
                          <g stroke="hsl(var(--foreground))" strokeWidth="1" opacity="0.7">
                              <path d="M 28 58 L 15 55" /><path d="M 29 63 L 15 63" /><path d="M 28 68 L 15 71" />
                              <path d="M 72 58 L 85 55" /><path d="M 71 63 L 85 63" /><path d="M 72 68 L 85 71" />
                          </g>
                        )}
                        <PetFace happiness={happiness} />
                        {petType === 'chicken' && <path d="M 47 60 L 53 60 L 50 65 Z" fill="#facc15" />}
                        {customization.accessory === 'bowtie' && (
                             <path
                                d="M 45 75 L 55 80 L 55 70 Z M 55 75 L 45 80 L 45 70 Z"
                                fill="hsl(var(--destructive))" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinejoin="round" />
                        )}
                    </g>
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
  petHappiness: number;
  onPetInteraction: (toast: {title: string, description: string}) => void;
  customization: PetCustomization;
  openCustomization: () => void;
  openSettings: () => void;
  level: number;
  exp: number;
  petName: string;
  petType: PetType;
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
    level,
    exp,
    petName,
    petType
}: PetTabProps) {
    const [isInteracting, setIsInteracting] = useState(false);
    const expToNextLevel = 100 * level;
    const expPercentage = (exp / expToNextLevel) * 100;

    const handleAction = (toast: {title: string, description: string}) => {
        if (interactions > 0 && !isInteracting) {
            onPetInteraction(toast);
            setIsInteracting(true);
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
                <div className="flex items-center gap-1">
                    <Button onClick={openCustomization} size="icon" variant="ghost" className="text-primary">
                        <Paintbrush className="h-6 w-6"/>
                        <span className="sr-only">Customize Pet</span>
                    </Button>
                     <Button onClick={openSettings} size="icon" variant="ghost" className="text-primary">
                        <Settings className="h-6 w-6"/>
                        <span className="sr-only">Pet Settings</span>
                    </Button>
                </div>
            </div>

            <Card className="bg-card/80 backdrop-blur-sm overflow-hidden">
                <CardContent className="p-0">
                    <VirtualPet petType={petType} happiness={petHappiness} isInteracting={isInteracting} customization={customization} level={level} />
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
                    <Button onClick={() => handleAction({title: "Yum!", description: "Your pet enjoyed the snack!"})} disabled={interactions <= 0 || isInteracting}>
                        <Utensils className="mr-2 h-4 w-4" /> Feed
                    </Button>
                    <Button onClick={() => handleAction({title: "Aww!", description: "Your pet loves being petted."})} disabled={interactions <= 0 || isInteracting}>
                        <PawPrint className="mr-2 h-4 w-4" /> Pet
                    </Button>
                    <Button onClick={() => handleAction({title: "So fun!", description: "Your pet loves to play."})} disabled={interactions <= 0 || isInteracting}>
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
