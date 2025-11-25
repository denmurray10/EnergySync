"use client";

import dynamic from 'next/dynamic';
import { cn } from "@/lib/utils";
import type { PetCustomization } from "@/lib/types";

const DynamicDotLottie = dynamic(
    () => import('@lottiefiles/dotlottie-react').then(mod => mod.DotLottieReact),
    { ssr: false }
);

export type PetType = 'cat' | 'dog' | 'horse' | 'chicken';

const PetFace = ({ happiness }: { happiness: number }) => {
    const strokeColor = "hsl(var(--foreground))";
    let face;
    if (happiness >= 80) { // Ecstatic
        face = (
            <g>
                <path d="M 35 48 C 38 42, 42 42, 45 48" stroke={strokeColor} strokeWidth="2.5" fill="none" strokeLinecap="round" />
                <path d="M 55 48 C 58 42, 62 42, 65 48" stroke={strokeColor} strokeWidth="2.5" fill="none" strokeLinecap="round" />
                <path d="M 40 63 Q 50 73, 60 63" stroke={strokeColor} strokeWidth="2.5" fill="none" strokeLinecap="round" />
            </g>
        );
    } else if (happiness >= 60) { // Happy
        face = (
            <g>
                <circle cx="40" cy="48" r="3" fill={strokeColor} />
                <circle cx="60" cy="48" r="3" fill={strokeColor} />
                <path d="M 42 63 Q 50 69, 58 63" stroke={strokeColor} strokeWidth="2.5" fill="none" strokeLinecap="round" />
            </g>
        );
    } else if (happiness >= 40) { // Neutral
        face = (
            <g>
                <circle cx="40" cy="48" r="3" fill={strokeColor} />
                <circle cx="60" cy="48" r="3" fill={strokeColor} />
                <line x1="45" y1="65" x2="55" y2="65" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" />
            </g>
        );
    } else if (happiness >= 20) { // Worried
        face = (
            <g>
                <circle cx="40" cy="48" r="2.5" fill={strokeColor} />
                <circle cx="60" cy="48" r="2.5" fill={strokeColor} />
                <path d="M 42 67 Q 50 61, 58 67" stroke={strokeColor} strokeWidth="2.5" fill="none" strokeLinecap="round" />
            </g>
        );
    } else { // Sad
        face = (
            <g>
                <circle cx="40" cy="48" r="2.5" fill={strokeColor} />
                <circle cx="60" cy="48" r="2.5" fill={strokeColor} />
                <path d="M 40 70 Q 50 60, 60 70" stroke={strokeColor} strokeWidth="2.5" fill="none" strokeLinecap="round" />
            </g>
        );
    }
    return <g>{face}</g>;
};

const PetBody = ({ type, color, outlineColor }: { type: PetType, color: string, outlineColor: string }) => {
    const bodyProps = {
        fill: color,
        stroke: outlineColor,
        strokeWidth: "3",
        strokeLinejoin: "round" as const
    };

    switch (type) {
        case 'horse':
            return (
                <g>
                    <path d="M 50 20 C 35 20, 28 40, 28 55 C 28 80, 40 98, 50 98 C 60 98, 72 80, 72 55 C 72 40, 65 20, 50 20 Z" {...bodyProps} />
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

export type VirtualPetProps = {
    petType: PetType;
    happiness: number;
    isInteracting: boolean;
    customization: PetCustomization;
    level: number;
    suggestion: string | null;
    showBackground?: boolean;
}

export const VirtualPet = ({ petType, happiness, isInteracting, customization, level, suggestion, showBackground = true }: VirtualPetProps) => {

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

    const petContent = (
        <div className={cn("relative transition-transform", isInteracting && "animate-jump")} style={{ transform: `scale(${scale})` }}>
            {petType === 'dog' ? (
                <DynamicDotLottie
                    src="https://lottie.host/09487b01-8ddf-44ee-9132-312a993d0950/OwLvmZQ781.lottie"
                    loop
                    autoplay
                    className="w-48 h-48"
                />
            ) : (
                <svg viewBox="0 0 100 100" className="w-48 h-48">
                    <g className="animate-breathe">
                        <PetBody type={petType} color={customization.color} outlineColor={customization.outlineColor} />
                        {(petType === 'cat') && (
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
                                fill="hsl(var(--destructive))" stroke={customization.outlineColor} strokeWidth="1.5" strokeLinejoin="round" />
                        )}
                    </g>
                </svg>
            )}
        </div>
    );


    return (
        <div className={cn("text-center rounded-2xl p-4 transition-colors", showBackground ? backgroundClass : "bg-transparent")}>
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
                            {petContent}
                        </div>
                    </div>
                ) : (
                    <div className="pt-8">
                        {petContent}
                    </div>
                )}
            </div>
            {showBackground && <p className="text-muted-foreground mt-2 font-semibold">{getHappinessText()}</p>}
        </div>
    );
};
