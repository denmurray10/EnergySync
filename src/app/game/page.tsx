
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
import Image from 'next/image';

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
                className="w-32 h-32"
            />
        </div>
    );
};

// --- Background Component ---
const GameBackground = () => {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      <Image
        src="https://i.imgur.com/gA3CfI1.png"
        layout="fill"
        objectFit="cover"
        alt="Scenic background of hills and a sky"
        priority
      />
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
            const newTasks = petTasks.map(t => t.id === taskId ? { ...t, completed: true } : t);
            setPetTasks(newTasks);
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
            <div className="relative z-10 w-full h-[55vh] flex-shrink-0 flex flex-col items-center justify-end pb-8">
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
