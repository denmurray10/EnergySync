"use client";

import dynamic from 'next/dynamic';
import { cn } from "@/lib/utils";
import type { PetCustomization } from "@/lib/types";
import { PetVisual, type PetMood, type EvolutionStage } from "./pet-visuals";

const DynamicDotLottie = dynamic(
    () => import('@lottiefiles/dotlottie-react').then(mod => mod.DotLottieReact),
    { ssr: false }
);

export type PetType = 'cat' | 'dog' | 'horse' | 'chicken';

type VirtualPetProps = {
    petType: PetType;
    happiness: number;
    isInteracting: boolean;
    customization: PetCustomization;
    level: number;
    suggestion: string | null;
    showBackground?: boolean;
    lastInteractionTime?: number | null;
};

export function VirtualPet({
    petType,
    happiness,
    isInteracting,
    customization,
    level,
    suggestion,
    showBackground = true,
    lastInteractionTime
}: VirtualPetProps) {

    // Determine Mood
    const getMood = (): PetMood => {
        const hour = new Date().getHours();
        const isNight = hour >= 22 || hour < 6;
        const timeSinceLastInteraction = lastInteractionTime ? Date.now() - lastInteractionTime : Infinity;
        const isRecentInteraction = timeSinceLastInteraction < 60 * 60 * 1000; // 1 hour

        // Priority 1: Sleepy (Time based)
        if (isNight) return 'sleepy';

        // Priority 2: Hungry (Low Energy)
        if (happiness < 30) return 'hungry';

        // Priority 3: Excited (High Energy)
        if (happiness >= 80) return 'excited';

        // Priority 4: Playful (Recent interaction + Good Energy)
        if (isRecentInteraction && happiness >= 60) return 'playful';

        // Priority 5: Sad (Very Low Energy)
        if (happiness < 20) return 'sad';

        // Priority 6: Happy (Good Energy)
        if (happiness >= 50) return 'happy';

        return 'neutral';
    };

    // Determine Evolution Stage
    const getStage = (): EvolutionStage => {
        if (level < 5) return 'baby';
        if (level < 15) return 'teen';
        return 'adult';
    };

    const mood = getMood();
    const stage = getStage();
    const color = customization.color || "#FFD700";

    const getHappinessText = () => {
        switch (mood) {
            case 'sleepy': return "Zzz... sleepy time...";
            case 'hungry': return "I'm hungry! We need energy!";
            case 'excited': return "Feeling ecstatic!! ✨";
            case 'playful': return "Let's play more! 🎾";
            case 'sad': return "Feeling a bit down... 💧";
            case 'happy': return "Feeling happy and good! ☀️";
            default: return "Just chilling.";
        }
    };

    const backgroundClass = happiness >= 60
        ? "bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900/20 dark:to-orange-900/20 border-2 border-yellow-200 dark:border-yellow-800"
        : "bg-gradient-to-br from-gray-100 to-slate-100 dark:from-gray-800/50 dark:to-slate-800/50 border-2 border-border";

    // Dog specific scaling for evolution simulation
    const dogScale = Math.min(1.5, 1 + (level - 1) * 0.05);

    const renderPet = () => {
        if (petType === 'dog') {
            return (
                <div
                    className={cn("relative w-48 h-48 transition-transform duration-300", isInteracting && "animate-jump")}
                    style={{ transform: `scale(${dogScale})` }}
                >
                    <DynamicDotLottie
                        src="https://lottie.host/09487b01-8ddf-44ee-9132-312a993d0950/OwLvmZQ781.lottie"
                        loop
                        autoplay
                        className="w-full h-full"
                    />
                    {/* Mood Overlays for Dog */}
                    {mood === 'sleepy' && (
                        <div className="absolute -top-2 right-4 text-3xl animate-pulse">💤</div>
                    )}
                    {mood === 'excited' && (
                        <div className="absolute -top-2 right-4 text-3xl animate-bounce">✨</div>
                    )}
                    {mood === 'sad' && (
                        <div className="absolute -top-2 right-4 text-3xl animate-bounce">💧</div>
                    )}
                    {mood === 'hungry' && (
                        <div className="absolute -top-2 right-4 text-3xl animate-bounce">🍗</div>
                    )}
                    {mood === 'playful' && (
                        <div className="absolute -top-2 right-4 text-3xl animate-bounce">🎾</div>
                    )}
                </div>
            );
        }

        return (
            <div className="w-48 h-48 relative">
                <PetVisual
                    type={petType}
                    stage={stage}
                    mood={mood}
                    color={color}
                    className={cn(isInteracting && "animate-bounce")}
                />
            </div>
        );
    };

    if (!showBackground) {
        return (
            <div className="relative">
                {renderPet()}
            </div>
        );
    }

    return (
        <div className={cn("text-center rounded-2xl p-4 transition-colors", backgroundClass)}>
            <div className="flex items-center justify-center min-h-[224px]">
                {suggestion ? (
                    <div className="flex items-center justify-center w-full">
                        <div className="w-2/5 flex-shrink-0 -mr-8 z-10">
                            <div className="bg-background rounded-2xl p-3 shadow-lg border-2 border-primary/20 relative">
                                <p className="text-sm font-medium text-foreground text-center">{suggestion}</p>
                                <div className="absolute top-1/2 -translate-y-1/2 right-[-13px] w-0 h-0 border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent border-l-[12px] border-l-primary/20" />
                                <div className="absolute top-1/2 -translate-y-1/2 right-[-10px] w-0 h-0 border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent border-l-[10px] border-l-background" />
                            </div>
                        </div>
                        <div className="flex-shrink-0">
                            {renderPet()}
                        </div>
                    </div>
                ) : (
                    <div className="pt-8">
                        {renderPet()}
                    </div>
                )}
            </div>
            {showBackground && <p className="text-muted-foreground mt-2 font-semibold">{getHappinessText()}</p>}
        </div>
    );
};
