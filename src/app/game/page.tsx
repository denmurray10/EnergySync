
'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ArrowLeft, GripVertical, CheckIcon, Zap } from "lucide-react";
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';

const DynamicDotLottie = dynamic(
  () => import('@lottiefiles/dotlottie-react').then((mod) => mod.DotLottieReact),
  { ssr: false }
);

// --- Pet Avatar Component ---
const GamePet = ({ isInteracting }: { isInteracting: boolean }) => {
    return (
        <div className={cn("relative transition-transform drop-shadow-lg", isInteracting && "animate-jump")}>
            <DynamicDotLottie
                src="https://lottie.host/09487b01-8ddf-44ee-9132-312a993d0950/OwLvmZQ781.lottie"
                loop
                autoplay
                speed={0.5}
                className="w-40 h-40"
            />
        </div>
    );
};

// --- Sun Component ---
const SunIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <circle cx="40" cy="40" r="40" fill="url(#sun-gradient)"/>
        <defs>
            <radialGradient id="sun-gradient" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(40 40) rotate(90) scale(40)">
                <stop stopColor="white"/>
                <stop offset="0.5" stopColor="#FFDE7A"/>
                <stop offset="1" stopColor="#FFAC33"/>
            </radialGradient>
        </defs>
    </svg>
);

// --- Tree Component ---
const Tree = ({ className, style }: { className?: string, style?: React.CSSProperties }) => (
    <div className={cn("absolute bottom-0", className)} style={style}>
        <svg width="100" height="150" viewBox="0 0 100 150" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M50 0L0 120H100L50 0Z" fill="#055B05"/>
            <path d="M50 20L15 120H85L50 20Z" fill="#066D06"/>
            <path d="M50 40L30 120H70L50 40Z" fill="#078007"/>
            <rect x="42" y="120" width="16" height="30" fill="#5D4037"/>
        </svg>
    </div>
);


// --- Background Component ---
const GameBackground = () => {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-gradient-to-b from-pink-200 via-purple-200 to-amber-100">
      {/* Sun */}
      <SunIcon className="absolute top-10 right-10 w-24 h-24 opacity-80" />
      
      {/* Landscape SVG Container */}
      <div className="absolute bottom-0 left-0 w-full h-[55%]">
         {/* Trees */}
        <Tree className="left-[5%] bottom-16" style={{ transform: 'scale(0.8)' }} />
        <Tree className="left-[20%] bottom-10" style={{ transform: 'scale(0.6)' }} />
        <Tree className="left-[65%]" style={{ transform: 'scale(0.9)' }} />
        <Tree className="left-[80%] bottom-8" style={{ transform: 'scale(0.7)' }} />

        <svg
          width="100%"
          height="100%"
          viewBox="0 0 393 150"
          preserveAspectRatio="none"
          className="absolute bottom-0 left-0 w-full h-full"
        >
          {/* Back Hill */}
           <path d="M-10 100 C 150 0, 250 150, 410 50 V 150 H -10 Z" fill="#025402" />
          {/* Front Hill */}
          <path d="M-10 120 C 100 50, 300 150, 410 80 V 150 H -10 Z" fill="#036803" />
        </svg>
      </div>
    </div>
  );
};


// --- Main Game Page Component ---
export default function GamePage() {
    const router = useRouter();
    const { gainPetExp, addJourneyEntry, petTasks, setPetTasks } = useAuth();
    const [isInteracting, setIsInteracting] = useState(false);

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
    
    const uncompletedTasksCount = useMemo(() => petTasks.filter(t => !t.completed).length, [petTasks]);

    return (
        <main className="min-h-dvh flex flex-col items-center p-0 font-body overflow-hidden relative bg-background">
            {/* Background */}
            <GameBackground />
            
            {/* Back Button */}
            <Button onClick={() => router.back()} variant="ghost" size="icon" className="absolute top-6 left-6 z-20 bg-background/50 backdrop-blur-sm rounded-full">
                <ArrowLeft />
            </Button>
            
            {/* Scene Content */}
            <div className="relative z-10 w-full h-[45vh] flex-shrink-0 flex flex-col items-center justify-end pb-4">
                <GamePet isInteracting={isInteracting} />
                <Button variant="secondary" className="mt-4 rounded-full px-6 shadow-lg" onClick={() => {
                    setIsInteracting(true);
                    setTimeout(() => setIsInteracting(false), 500);
                }}>
                    Chat with me!
                </Button>
            </div>

            {/* Goals Panel */}
            <div className="relative z-10 w-full flex-1 bg-background rounded-t-3xl pt-6 flex flex-col">
                <div className="px-6 pb-4">
                    <h2 className="text-lg font-semibold text-card-foreground">
                        {uncompletedTasksCount > 0 ? `${uncompletedTasksCount} goals left for today!` : "All goals complete!"}
                    </h2>
                </div>
                <div className="flex-1 overflow-y-auto px-4 custom-scrollbar pb-4">
                    <div className="space-y-3">
                        {petTasks.map((task) => (
                            <div key={task.id} className="flex items-center space-x-3 bg-white p-2 rounded-full shadow-md">
                                <span className="text-muted-foreground pl-2 cursor-grab"><GripVertical size={20} /></span>
                                <span className="text-xl">{task.icon}</span>
                                <Label htmlFor={`game-task-${task.id}`} className={cn("flex-grow text-base", task.completed && 'line-through text-muted-foreground')}>
                                    {task.name}
                                </Label>
                                <div className="flex items-center gap-2 pr-2">
                                    <span className="text-sm font-bold text-yellow-500 flex items-center gap-1">5 <Zap size={14}/></span>
                                     <div
                                        onClick={() => handleTaskComplete(task.id)}
                                        className={cn(
                                            "h-9 w-9 flex items-center justify-center rounded-full cursor-pointer transition-colors",
                                            task.completed ? "bg-green-500 text-white" : "bg-gray-200 text-gray-400 hover:bg-gray-300"
                                        )}
                                    >
                                        <CheckIcon size={20} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </main>
    );
}

    