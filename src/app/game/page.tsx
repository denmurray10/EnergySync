
'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ArrowUp, Sun, Sparkles, PawPrint, Star } from "lucide-react";
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { PetCustomization, PetTask, JourneyEntry } from '@/lib/types';
import dynamic from 'next/dynamic';

const DynamicDotLottie = dynamic(
  () => import('@lottiefiles/dotlottie-react').then((mod) => mod.DotLottieReact),
  { ssr: false }
);

// --- Pet Avatar Component ---
const GamePet = ({ happiness, customization, isInteracting }: { happiness: number; customization: PetCustomization; isInteracting: boolean }) => {
    return (
        <div className={cn("relative transition-transform drop-shadow-lg", isInteracting && "animate-jump")}>
            <DynamicDotLottie
                src="https://lottie.host/09487b01-8ddf-44ee-9132-312a993d0950/OwLvmZQ781.lottie"
                loop
                autoplay
                speed={0.5}
                className="w-32 h-32"
            />
        </div>
    );
};


// --- Background Component ---
const DayNightBackground = () => {
    return (
        <div className="absolute inset-0 -z-10 overflow-hidden bg-gradient-to-b from-sky-400 to-cyan-400">
            {/* Sun */}
            <div className="absolute top-16 left-16 w-20 h-20 rounded-full bg-yellow-300 shadow-lg" />

            {/* Clouds */}
            <div className="absolute top-[20%] -left-1/4 w-1/2 h-16 rounded-full animate-pan bg-white/60" />
            <div className="absolute top-[30%] -left-1/3 w-1/2 h-20 rounded-full animate-pan-slow bg-white/50" style={{ animationDelay: '-15s' }}/>

            {/* Hills */}
            <svg className="absolute bottom-0 w-full h-1/2 text-transparent" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M-5,100 Q25,20 50,40 T105,60 L105,100 L-5,100 Z" className="fill-sky-600 opacity-60" />
                <path d="M-5,100 Q15,30 40,50 T85,40 L105,100 L-5,100 Z" className="fill-cyan-500 opacity-80" />
                <path d="M-5,80 Q25,40 45,60 T90,50 L105,100 L-5,100 Z" className="fill-teal-400 opacity-80" />
            </svg>
        </div>
    );
};


// --- Main Game Page Component ---
export default function GamePage() {
    const router = useRouter();
    const { appUser, gainPetExp, addJourneyEntry, petTasks, setPetTasks } = useAuth();
    const [isInteracting, setIsInteracting] = useState(false);
    const [panelOpen, setPanelOpen] = useState(true);

    const handleTaskComplete = (taskId: number) => {
        const task = petTasks.find(t => t.id === taskId);
        if (task && !task.completed) {
            setPetTasks(petTasks.map(t => t.id === taskId ? { ...t, completed: true } : t));
            gainPetExp(10);
            addJourneyEntry(`Completed goal: "${task.name}"`, task.icon);
            setIsInteracting(true);
            setTimeout(() => setIsInteracting(false), 500);
        }
    };

    const energy = useMemo(() => {
        if (!appUser) return 50;
        const completedTasks = petTasks.filter(t => t.completed).length;
        const totalTasks = petTasks.length;
        const baseEnergy = 50;
        const energyPerTask = 50 / totalTasks;
        return Math.min(100, baseEnergy + (completedTasks * energyPerTask));
    }, [petTasks, appUser]);

    if (!appUser) {
        return (
            <main className="min-h-dvh bg-blue-200 flex items-center justify-center p-4 text-center">
                <h1 className="text-xl font-bold">Loading your pet...</h1>
            </main>
        );
    }
    
    const expToNextLevel = 100 * appUser.petLevel;

    return (
        <main className="min-h-dvh flex flex-col items-center justify-center p-4 font-body overflow-hidden relative">
            {/* Background */}
            <DayNightBackground />
            
            {/* Back Button */}
            <Button onClick={() => router.back()} variant="ghost" size="icon" className="absolute top-6 left-6 z-20 bg-background/50 backdrop-blur-sm rounded-full">
                <ArrowLeft />
            </Button>
            
            {/* Main Content */}
            <div className="relative z-10 w-full h-full flex flex-col flex-grow items-center justify-end text-center">
                
                {/* Pet Display Area */}
                <div className="flex-grow flex flex-col items-center justify-center w-full">
                    <GamePet happiness={energy} customization={appUser.petCustomization} isInteracting={isInteracting} />
                    <h1 className="text-3xl font-bold mt-2">{appUser.petName}</h1>
                    <p className="text-muted-foreground">{energy >= 80 ? "is feeling joyful!" : energy >= 40 ? "is doing pretty good." : "needs some attention."}</p>
                </div>

                {/* Bottom Panel */}
                <div className={cn("absolute bottom-0 left-0 right-0 z-20 transition-transform duration-500 ease-in-out", panelOpen ? 'translate-y-0' : 'translate-y-[calc(100%-100px)]')}>
                    <Card className="rounded-t-3xl border-t-4 border-primary/50 bg-background/90 backdrop-blur-lg shadow-2xl max-w-2xl mx-auto">
                        <button onClick={() => setPanelOpen(!panelOpen)} className="absolute -top-8 right-4 bg-primary text-primary-foreground p-3 rounded-full shadow-lg">
                            <ArrowUp className={cn("transition-transform", panelOpen && 'rotate-180')} />
                        </button>
                        <CardHeader className="pt-4">
                             <div className="flex justify-between items-center text-sm font-medium">
                                <span className="flex items-center"><Star className="h-4 w-4 mr-2 text-yellow-500 fill-yellow-500" /> <span>Level {appUser.petLevel}</span></span>
                                <span className="text-xs text-muted-foreground">{Math.floor(appUser.petExp)} / {expToNextLevel} XP</span>
                            </div>
                            <Progress value={(appUser.petExp / expToNextLevel) * 100} indicatorClassName="bg-yellow-500" />
                        </CardHeader>
                        <CardContent className="px-2 pb-2">
                           <Tabs defaultValue="goals" className="w-full">
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="goals">Today's Goals</TabsTrigger>
                                    <TabsTrigger value="journey">Journey</TabsTrigger>
                                </TabsList>
                                <TabsContent value="goals">
                                    <ScrollArea className="h-48">
                                        <div className="space-y-3 p-4">
                                            {petTasks.map((task) => (
                                                <div key={task.id} className="flex items-center space-x-3 bg-muted/50 p-3 rounded-lg">
                                                    <Checkbox id={`game-task-${task.id}`} checked={task.completed} onCheckedChange={() => handleTaskComplete(task.id)} className="h-5 w-5" />
                                                    <Label htmlFor={`game-task-${task.id}`} className={cn("flex-grow", task.completed && 'line-through text-muted-foreground')}>
                                                        <span className="font-semibold">{task.icon} {task.name}</span>
                                                    </Label>
                                                </div>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                </TabsContent>
                                <TabsContent value="journey">
                                    <ScrollArea className="h-48">
                                        <div className="space-y-3 p-4">
                                            {appUser.journeys?.length > 0 ? (
                                                appUser.journeys.map((entry, index) => (
                                                <div key={index} className="flex items-start gap-3 text-left text-sm">
                                                    <span className="mt-1">{entry.icon}</span>
                                                    <div>
                                                        <p className="font-medium text-card-foreground">{entry.text}</p>
                                                        <p className="text-xs text-muted-foreground">{entry.timestamp}</p>
                                                    </div>
                                                </div>
                                            ))) : (
                                                <p className="text-center text-muted-foreground py-10">Complete a goal to start your journey!</p>
                                            )}
                                        </div>
                                    </ScrollArea>
                                </TabsContent>
                           </Tabs>
                        </CardContent>
                    </Card>
                </div>

            </div>
        </main>
    );
}
