
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

// --- Sun Component ---
const SunIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M26.6667 3.33333C26.6667 3.33333 26.6667 0 30 0C33.3333 0 33.3333 3.33333 33.3333 3.33333V6.66667C33.3333 6.66667 33.3333 10 30 10C26.6667 10 26.6667 6.66667 26.6667 6.66667V3.33333ZM56.6667 26.6667C56.6667 26.6667 60 26.6667 60 30C60 33.3333 56.6667 33.3333 56.6667 33.3333H53.3333C53.3333 33.3333 50 33.3333 50 30C50 26.6667 53.3333 26.6667 53.3333 26.6667H56.6667ZM6.66667 26.6667C6.66667 26.6667 10 26.6667 10 30C10 33.3333 6.66667 33.3333 6.66667 33.3333H3.33333C3.33333 33.3333 0 33.3333 0 30C0 26.6667 3.33333 26.6667 3.33333 26.6667H6.66667ZM15.2017 12.155C15.2017 12.155 17.5583 14.5117 15.2017 16.8683C12.845 19.225 10.4883 16.8683 10.4883 16.8683L8.13 14.5133C8.13 14.5133 5.77333 12.1567 8.13 9.79833C10.4883 7.44167 12.845 9.79833 12.845 9.79833L15.2017 12.155ZM49.5133 16.8683C49.5133 16.8683 47.1567 19.225 44.8 16.8683C42.4433 14.5117 44.8 12.155 44.8 12.155L47.1567 9.79833C47.1567 9.79833 49.5133 7.44167 51.87 9.79833C54.2267 12.155 51.87 14.5117 51.87 14.5117L49.5133 16.8683ZM14.5133 51.8683C14.5133 51.8683 12.1567 54.225 9.8 51.8683C7.44333 49.5117 9.8 47.155 9.8 47.155L12.1567 44.7983C12.1567 44.7983 14.5133 42.4417 16.87 44.7983C19.2267 47.155 16.87 49.5117 16.87 49.5117L14.5133 51.8683Z" fill="#FFAC33"/>
        <path d="M30 46.6667C39.2048 46.6667 46.6667 39.2047 46.6667 30C46.6667 20.7953 39.2048 13.3333 30 13.3333C20.7953 13.3333 13.3334 20.7953 13.3334 30C13.3334 39.2047 20.7953 46.6667 30 46.6667Z" fill="#FFAC33"/>
        <path d="M49.295 35.3333C48.225 35.3333 47.195 35.5 46.2233 35.8083C45.0767 32.4283 41.9567 30 38.2783 30C34.3317 30 31.0283 32.7967 30.1133 36.5617C29.1164 35.7722 27.8833 35.3403 26.6117 35.335C23.39 35.335 20.7783 38.02 20.7783 41.335C20.7783 42.14 20.9383 42.9033 21.2183 43.6067C20.6554 43.4334 20.0706 43.3414 19.4817 43.3333C15.9017 43.3333 13 46.3183 13 50C13 53.6817 15.9017 56.6667 19.4817 56.6667H49.2967C55.0233 56.6667 59.6667 51.8933 59.6667 46C59.6667 40.1083 55.0233 35.3333 49.295 35.3333Z" fill="#E1E8ED"/>
    </svg>
);


// --- Cloud Component ---
const Cloud = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 47 27"
    className={cn("absolute opacity-80 fill-white/80", className)}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M36.295 5.33333C35.225 5.33333 34.195 5.5 33.2233 5.80833C32.0767 2.42833 28.9567 0 25.2783 0C21.3317 0 18.0283 2.79667 17.1133 6.56167C16.1164 5.77222 14.8833 5.34026 13.6117 5.335C10.39 5.335 7.77833 8.02 7.77833 11.335C7.77833 12.14 7.93833 12.9033 8.21833 13.6067C7.65539 13.4334 7.07061 13.3414 6.48167 13.3333C2.90167 13.3333 0 16.3183 0 20C0 23.6817 2.90167 26.6667 6.48167 26.6667H36.2967C42.0233 26.6667 46.6667 21.8933 46.6667 16C46.6667 10.1083 42.0233 5.33333 36.295 5.33333Z" />
  </svg>
);


// --- Background Component ---
const GameBackground = () => {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden bg-[#78D2F0]"> {/* Sky */}
      {/* Sun */}
      <SunIcon className="absolute top-8 left-8 w-20 h-20" />
      
      {/* Clouds */}
      <Cloud className="top-[8%] left-[10%] w-28 h-14 animate-pan" style={{animationDuration: '180s'}} />
      <Cloud className="top-[15%] left-[30%] w-32 h-16 animate-pan-slow" style={{animationDuration: '220s'}} />
      <Cloud className="top-[10%] left-[65%] w-40 h-20 animate-pan" style={{animationDuration: '160s'}} />
      <Cloud className="top-[18%] left-[85%] w-24 h-12 animate-pan-slow" style={{animationDuration: '240s'}} />

      {/* Landscape SVG */}
      <div className="absolute bottom-0 left-0 w-full h-full">
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute bottom-0"
        >
          {/* Dark Hills */}
          <path
            d="M -5 100 L -5 45 C 10 35, 30 55, 50 45 C 70 35, 90 55, 105 45 L 105 100 Z"
            fill="#1A5D2B"
          />
          {/* Light Grass */}
          <path
            d="M -5 100 L -5 55 C 15 50, 35 60, 50 55 C 65 50, 85 60, 105 55 L 105 100 Z"
            fill="#4CAF50"
          />
        </svg>
      </div>

       {/* Trees - positioned absolutely on top of the SVG container */}
        <div className="absolute bottom-[42%] left-[40%] w-10 h-12 opacity-80">
            <div className="absolute bottom-0 w-2 h-6 bg-[#A1662F] left-1/2 -translate-x-1/2 rounded-t-sm" />
            <div className="absolute top-0 w-full h-10 bg-[#388E3C] rounded-full" />
        </div>
        <div className="absolute bottom-[44%] left-[65%] w-8 h-10 opacity-80">
            <div className="absolute bottom-0 w-2 h-5 bg-[#A1662F] left-1/2 -translate-x-1/2 rounded-t-sm" />
            <div className="absolute top-0 w-full h-8 bg-[#388E3C] rounded-full" />
        </div>
       <div className="absolute bottom-[33%] left-[15%] w-16 h-20">
            <div className="absolute bottom-0 w-4 h-10 bg-[#A1662F] left-1/2 -translate-x-1/2 rounded-t-sm" />
            <div className="absolute top-0 w-full h-16 bg-[#388E3C] rounded-full" />
        </div>
        <div className="absolute bottom-[35%] left-[80%] w-12 h-16">
            <div className="absolute bottom-0 w-3 h-8 bg-[#A1662F] left-1/2 -translate-x-1/2 rounded-t-sm" />
            <div className="absolute top-0 w-full h-12 bg-[#388E3C] rounded-full" />
        </div>
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
            <GameBackground />
            
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
