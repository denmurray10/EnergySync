
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
                className="w-32 h-32"
            />
        </div>
    );
};

// --- SVG Components from User ---
const SunIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M26.6667 3.33333C26.6667 3.33333 26.6667 0 30 0C33.3333 0 33.3333 3.33333 33.3333 3.33333V6.66667C33.3333 6.66667 33.3333 10 30 10C26.6667 10 26.6667 6.66667 26.6667 6.66667V3.33333ZM56.6667 26.6667C56.6667 26.6667 60 26.6667 60 30C60 33.3333 56.6667 33.3333 56.6667 33.3333H53.3333C53.3333 33.3333 50 33.3333 50 30C50 26.6667 53.3333 26.6667 53.3333 26.6667H56.6667ZM6.66667 26.6667C6.66667 26.6667 10 26.6667 10 30C10 33.3333 6.66667 33.3333 6.66667 33.3333H3.33333C3.33333 33.3333 0 33.3333 0 30C0 26.6667 3.33333 26.6667 3.33333 26.6667H6.66667ZM15.2017 12.155C15.2017 12.155 17.5583 14.5117 15.2017 16.8683C12.845 19.225 10.4883 16.8683 10.4883 16.8683L8.13 14.5133C8.13 14.5133 5.77333 12.1567 8.13 9.79833C10.4883 7.44167 12.845 9.79833 12.845 9.79833L15.2017 12.155ZM49.5133 16.8683C49.5133 16.8683 47.1567 19.225 44.8 16.8683C42.4433 14.5117 44.8 12.155 44.8 12.155L47.1567 9.79833C47.1567 9.79833 49.5133 7.44167 51.87 9.79833C54.2267 12.155 51.87 14.5117 51.87 14.5117L49.5133 16.8683ZM14.5133 51.8683C14.5133 51.8683 12.1567 54.225 9.8 51.8683C7.44333 49.5117 9.8 47.155 9.8 47.155L12.1567 44.7983C12.1567 44.7983 14.5133 42.4417 16.87 44.7983C19.2267 47.155 16.87 49.5117 16.87 49.5117L14.5133 51.8683Z" fill="#FFAC33"/>
        <path d="M30 46.6667C39.2048 46.6667 46.6667 39.2047 46.6667 30C46.6667 20.7953 39.2048 13.3333 30 13.3333C20.7953 13.3333 13.3334 20.7953 13.3334 30C13.3334 39.2047 20.7953 46.6667 30 46.6667Z" fill="#FFAC33"/>
        <path d="M49.295 35.3333C48.225 35.3333 47.195 35.5 46.2233 35.8083C45.0767 32.4283 41.9567 30 38.2783 30C34.3317 30 31.0283 32.7967 30.1133 36.5617C29.1164 35.7722 27.8833 35.3403 26.6117 35.335C23.39 35.335 20.7783 38.02 20.7783 41.335C20.7783 42.14 20.9383 42.9033 21.2183 43.6067C20.6554 43.4334 20.0706 43.3414 19.4817 43.3333C15.9017 43.3333 13 46.3183 13 50C13 53.6817 15.9017 56.6667 19.4817 56.6667H49.2967C55.0233 56.6667 59.6667 51.8933 59.6667 46C59.6667 40.1083 55.0233 35.3333 49.295 35.3333Z" fill="#E1E8ED"/>
    </svg>
);

const CloudIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 47 27" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M36.295 5.33333C35.225 5.33333 34.195 5.5 33.2233 5.80833C32.0767 2.42833 28.9567 0 25.2783 0C21.3317 0 18.0283 2.79667 17.1133 6.56167C16.1164 5.77222 14.8833 5.34026 13.6117 5.335C10.39 5.335 7.77833 8.02 7.77833 11.335C7.77833 12.14 7.93833 12.9033 8.21833 13.6067C7.65539 13.4334 7.07061 13.3414 6.48167 13.3333C2.90167 13.3333 0 16.3183 0 20C0 23.6817 2.90167 26.6667 6.48167 26.6667H36.2967C42.0233 26.6667 46.6667 21.8933 46.6667 16C46.6667 10.1083 42.0233 5.33333 36.295 5.33333Z" fill="#E1E8ED"/>
    </svg>
);

const BackHillIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 393 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M-10 80 C 150 0, 250 120, 410 40 V 100 H -10 Z" fill="#025402" />
    </svg>
);

const TopLevelHillsIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 393 124" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M251.663 0.338863C255.277 -0.413996 258.668 0.212629 261.169 0.999019C263.837 1.83788 266.245 3.09438 268.142 4.30566C270.723 5.95444 272.663 7.94468 274.08 9.56738C274.79 10.3798 275.437 11.1814 275.956 11.8252C276.515 12.5184 276.908 13.0069 277.281 13.4365C280.268 16.8735 282.719 20.45 287.093 26.6904C292.337 34.1732 295.193 38.5051 297.305 41.1309C299.635 44.029 302.936 45.0351 308.381 47.1631C308.649 47.2679 309.655 47.5134 311.713 47.6074C313.621 47.6946 315.782 47.6312 318.033 47.5244C327.989 47.0521 333.16 45.2259 335.142 44.4521C337.727 43.4427 340.251 42.5744 347.499 40.1445C351.578 38.777 354.965 37.8905 359.186 37.7051C361.797 37.5904 364.863 37.3813 371.521 37.5674C376.731 37.713 380.994 40.0425 382.766 40.8252C385.49 42.029 388.953 43.6879 392.139 47.3965C392.457 47.7666 392.742 48.147 393 48.5312V124H0V62.7432C2.01237 61.0719 4.42949 59.0794 7.33105 56.7168C14.5423 50.8451 22.2687 49.0766 25.8857 48.2148H25.8867L25.9551 48.1982C30.4936 47.1169 35.718 47.0038 39.7422 47.1602C43.5609 47.3085 47.7191 47.7604 50.0498 48.4746C54.5441 49.8519 58.4148 52.2508 60.5498 53.6885C62.538 55.0273 65.6455 56.9488 69.3643 58.5996C69.4975 58.6217 69.7278 58.657 70.0752 58.6904C70.9822 58.7777 72.254 58.8255 73.8428 58.8018C77.0104 58.7544 80.9402 58.432 84.8184 57.8359C85.5411 57.7248 86.0783 57.5467 87.3457 56.8359C88.1311 56.3955 88.8638 55.9445 90.1318 55.1953C91.3108 54.4987 92.7167 53.6878 94.416 52.8008C101.666 49.0163 105.776 45.8955 111.535 42.1191C118.102 37.8131 123.459 36.1297 126.396 35.0518C131.036 33.3492 136.425 32.7441 152.252 32.3096C159.648 32.1066 163.937 34.6013 166.489 35.6689C173.103 38.4357 176.055 38.9407 178.941 39.5615C181.978 40.2148 184.014 40.6794 186.554 41.0156C191.566 41.6792 194.37 42.1031 197.164 42.0381C204.441 41.8688 206.639 40.8255 207.619 40.3115C210.195 38.96 211.166 37.5856 214.062 34.3281C215.486 32.7251 220.323 26.4967 224.57 20.8936C227.897 16.506 231.094 12.3274 235.414 8.60156C240.409 4.29323 247.216 1.36827 251.312 0.416011L251.663 0.338863ZM269.871 61.6738C270.015 61.6652 270.158 61.6571 270.303 61.6484C270.141 61.4792 269.978 61.3075 269.814 61.1348C269.832 61.3117 269.852 61.4916 269.871 61.6738Z" fill="#036803"/>
    </svg>
);

const TreeIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 60 90" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M30 60L30 90" stroke="#5D4037" strokeWidth="12" strokeLinecap="round"/>
        <path d="M30 0L0 45H60L30 0Z" fill="#047857"/>
        <path d="M30 20L10 55H50L30 20Z" fill="#065F46"/>
    </svg>
);


// --- Background Component ---
const GameBackground = () => {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-gradient-to-b from-pink-200 via-purple-200 to-amber-100">
      {/* Sun */}
      <SunIcon className="absolute top-10 right-10 w-24 h-24 opacity-90" />

      {/* Clouds */}
       <CloudIcon className="absolute top-16 left-[-10%] w-24 opacity-80 animate-pan" style={{ animationDuration: '150s' }} />
       <CloudIcon className="absolute top-24 left-[-15%] w-32 opacity-70 animate-pan-slow" style={{ animationDuration: '180s', animationDelay: '-30s' }} />
       <CloudIcon className="absolute top-8 left-[-5%] w-20 opacity-90 animate-pan" style={{ animationDuration: '100s', animationDelay: '-60s' }} />
      
      {/* Landscape SVG Container */}
      <div className="absolute bottom-0 left-0 w-full h-[55%]">
        <BackHillIcon className="absolute bottom-0 left-0 w-full h-2/3" />
        {/* Trees behind the front hill */}
        <TreeIcon className="absolute bottom-[25%] left-[15%] w-20 h-auto opacity-90" />
        <TreeIcon className="absolute bottom-[20%] right-[20%] w-24 h-auto" />
        
        <TopLevelHillsIcon className="absolute bottom-0 left-0 w-full h-full" />
        
        {/* Trees in front */}
        <TreeIcon className="absolute bottom-8 left-[5%] w-16 h-auto z-10" />
        <TreeIcon className="absolute bottom-6 left-[30%] w-12 h-auto opacity-95 z-10" />
        <TreeIcon className="absolute bottom-10 right-[8%] w-20 h-auto z-10" />
        <TreeIcon className="absolute bottom-5 right-[35%] w-14 h-auto opacity-90 z-10" />
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
