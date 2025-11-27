import React from 'react';
import { cn } from "@/lib/utils";

export type PetMood = 'happy' | 'sad' | 'sleepy' | 'excited' | 'neutral' | 'hungry' | 'playful';
export type EvolutionStage = 'baby' | 'teen' | 'adult';

interface PetVisualProps {
    type: 'cat' | 'dog' | 'horse' | 'chicken';
    stage: EvolutionStage;
    mood: PetMood;
    color: string;
    className?: string;
}

const Eye = ({ mood, side }: { mood: PetMood, side: 'left' | 'right' }) => {
    const xOffset = side === 'left' ? -14 : 14;

    if (mood === 'sleepy') {
        return (
            <path
                d="M -8 0 Q -4 4 0 0"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                transform={`translate(${xOffset}, -2)`}
            />
        );
    }

    if (mood === 'sad') {
        return (
            <g transform={`translate(${xOffset}, -2)`}>
                <circle r="3" fill="currentColor" cy="2" />
                <path d="M -5 -5 Q 0 -2 5 -5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </g>
        );
    }

    if (mood === 'excited' || mood === 'playful') {
        return (
            <g transform={`translate(${xOffset}, -2)`}>
                <path d="M -5 0 L 0 -5 L 5 0" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M -5 6 L 0 1 L 5 6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </g>
        );
    }

    if (mood === 'hungry') {
        return (
            <g transform={`translate(${xOffset}, -2)`}>
                <circle r="3" fill="currentColor" cy="0" />
                <path d="M -4 -6 Q 0 -3 4 -6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </g>
        );
    }

    // Happy / Neutral - Anime Style Big Eyes
    return (
        <g transform={`translate(${xOffset}, -4)`}>
            <ellipse rx="9" ry="10" fill="white" stroke="currentColor" strokeWidth="0.5" />
            <ellipse rx={mood === 'happy' ? "7" : "6"} ry={mood === 'happy' ? "8" : "7"} fill="currentColor" />
            <circle r="3" fill="white" cx="-3" cy="-3" />
            <circle r="1.5" fill="white" cx="3" cy="4" opacity="0.8" />
        </g>
    );
};

const Mouth = ({ mood }: { mood: PetMood }) => {
    if (mood === 'sad') {
        return <path d="M -6 12 Q 0 8 6 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />;
    }
    if (mood === 'sleepy') {
        return <circle r="3" cx="0" cy="12" fill="currentColor" opacity="0.5" />;
    }
    if (mood === 'excited' || mood === 'playful') {
        return <path d="M -6 10 Q 0 18 6 10 Z" fill="currentColor" transform="translate(0, 2)" />;
    }
    if (mood === 'hungry') {
        return <ellipse cx="0" cy="12" rx="4" ry="6" fill="currentColor" />;
    }
    return (
        <path
            d="M -7 10 Q -3.5 13 0 10 Q 3.5 13 7 10"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
        />
    );
};

const CatVisual = ({ stage, mood, color }: { stage: EvolutionStage, mood: PetMood, color: string }) => {
    const isBaby = stage === 'baby';
    // Scaled up by ~25% from previous (0.12 -> 0.15, 0.15 -> 0.19)
    const transform = isBaby
        ? "scale(0.15) translate(-400, -220)"
        : "scale(0.19) translate(-400, -250)";

    return (
        <g transform={transform} className={cn("transition-all duration-500", mood === 'excited' && "animate-bounce")}>
            {/* Backing for Eyes (Whites) - Positioned behind the head holes */}
            <circle cx="325" cy="180" r="35" fill="white" />
            <circle cx="435" cy="180" r="35" fill="white" />

            {/* Backing for Nose/Mouth (Dark) - Positioned behind the face holes */}
            <circle cx="380" cy="240" r="25" fill="rgba(0,0,0,0.7)" />

            {/* Main Body */}
            <path
                d="M237.98,537.75c12.55-.63,25.09-1.26,37.84-1.91-7.01-8.77-8.52-18.12-2.54-28.1-6.85-1.71-13.58-3.39-20.69-5.17,3.51-2.41,6.32-4.29,9.08-6.24,1.77-1.26,1.79-2.62,.56-4.49-7.66-11.59-12.64-24.24-14.33-38.08-3.86-31.62,9.36-58.33,38.55-70.45,2.35-.97,2.43-2.32,2.44-4.32,.13-30.59,8.78-58.39,27.2-83.01,1.69-2.26,3.15-2.83,5.88-1.87,25.99,9.22,52.83,10.78,80.06,8.69,14.2-1.09,28.05-3.87,41.36-8.99,2.85-1.1,3.93,.59,5.19,2.25,7.29,9.7,12.96,20.28,17.1,31.68,6.25,17.19,9.21,34.91,8.45,53.2-.1,2.32,.47,3.42,2.69,4.52,20.47,10.13,32.04,26.6,34.37,49.37,1.97,19.29-2.96,36.98-12.83,53.45-.54,.91-1.1,1.8-2.19,3.59,5.86,.79,11.21,1.94,16.6,2.16,20.63,.86,38.07-5.81,49.84-23.46,10.89-16.34,10.72-34.01,4.33-51.96-3.6-10.11-9.58-18.91-15.52-27.74-5.53-8.21-11.68-16.13-14.1-25.98-.63-2.57-.79-5.47-.28-8.05,1.36-6.9,8.21-10.45,15.45-8.23,8.28,2.54,14.81,7.9,20.71,13.89,17.28,17.52,29.58,37.89,34.75,62.24,9.71,45.7-13.8,90.26-57.12,108.07-2.24,.92-4.5,1.79-6.75,2.68l.07,.95c6.43,0,12.86-.19,19.28,.05,6.44,.25,12.85,.93,19.28,1.43,.03,.51,.07,1.02,.1,1.53-1.91,.4-3.81,1.04-5.74,1.14-10.04,.55-20.08,1.23-30.13,1.36-16.81,.22-33.63-.11-50.44,.13-13.94,.2-27.88,.87-41.81,1.38-.74,.03-1.82,.3-2.14,.82-3.07,5.11-8.31,6.19-13.43,6.76-12.71,1.41-25.47,2.27-38.21,.26-3.96-.63-7.29-2.41-9.84-5.74-.82-1.08-2.62-1.65-4.07-1.94-1.59-.32-3.3,.03-4.96-.03-4.05-.15-7.41,.21-10.58,3.87-2.17,2.51-6.58,3.92-10.13,4.24-13.93,1.25-27.91,1.12-41.64-1.91-2.99-.66-5.53-3.26-8.32-4.9-1.03-.61-2.15-1.43-3.25-1.48-19.02-.74-38.05-1.31-57.08-2.09-4.4-.18-8.76-.99-13.15-1.5l.09-2.07Zm119.16-148.65c1.41,4.12,3.07,7.58,3.76,11.22,2.66,14.02,4.97,28.1,7.48,42.15,2.18,12.19,4.41,24.37,6.71,36.53,.24,1.25,.94,3.2,1.79,3.43,4.03,1.05,8.2,1.61,12.93,2.46,4.07-20.9,7.94-41.15,11.98-61.36,2.15-10.73,4.6-21.4,6.91-32.1,.34-1.58,.66-3.17,1.12-5.41-1.22,1.13-1.92,1.77-3.11,2.87v-11.21c-.87,1.87-1.42,3.05-2.21,4.76-1.76-10.01-4.56-15.93-8.31-18.86,.37,4.97,.77,10.48,1.18,15.99l-1.51,.37c-1.53-9.43-5.09-17.69-12.75-23.65,3.24,7.33,5.83,14.74,5.17,23.42-6.8-12.82-11.98-18.64-18.27-20.2,1.1,4.35,2.13,8.41,3.16,12.46l-.55,.37c-2.15-2.97-4.31-5.94-6.52-9-3.02,4.31-2.05,8.92-1.18,13.7-1.06-1.5-2.11-3.01-3.38-4.81-3.22,7.07-2,13.75-.14,20.73-1.25-1.13-2.49-2.26-4.27-3.86Zm70.45,122.26c3.69,.33,5.4-.86,6.61-3.68,12.26-28.59,24.64-57.13,36.98-85.69,1.05-2.43,2.04-4.88,3.06-7.33-17.59,31.15-33.79,62.93-46.65,96.7Zm-96.39-.82l1.29-.41c0-1.72,.3-3.5-.06-5.14-.8-3.67-1.67-7.36-2.96-10.89-10-27.45-23.49-53.24-37.52-78.77-.38-.7-.89-1.33-1.33-1.99l-.65,.34c13.75,32.29,27.49,64.57,41.24,96.86Zm65.39,33.96c0-5.17-.5-10.83,.11-16.37,1.11-10.19,2.91-20.3,4.34-30.45,2.33-16.46,4.63-32.93,6.86-49.4,.91-6.74,1.62-13.51,2.42-20.26-.83,1.53-1.2,3.12-1.48,4.73-2.8,15.77-5.76,31.51-8.34,47.31-2.51,15.36-4.8,30.75-6.83,46.18-.86,6.55-.48,13.15,2.92,18.27Zm-28.82,.91c.93-1.94,2.08-3.81,2.74-5.83,2.6-7.91,1.41-15.95,.29-23.89-1.8-12.84-3.91-25.64-6-38.44-2.6-15.87-5.32-31.71-7.98-47.57-.45,1.7-.39,3.33-.19,4.95,1.28,10.67,2.53,21.34,3.91,31.99,1.99,15.34,4.21,30.65,6.07,46,1.31,10.8,4.56,21.61,1.16,32.79Zm208.44-70.86c-19.95,33.34-49.51,41.55-86.24,31.58,29.52,14.57,71.18,4.86,86.24-31.58Zm-125.06-32.86c.26-.38,.59-.73,.77-1.14,7.37-17.02,13.42-34.45,15.71-52.95,.87-7.05,1.08-14.22-.97-21.22,.16,26.22-7.97,50.68-15.52,75.32Zm-152.93-74.86c-3.17,27.73,6.31,52.61,17.21,77.17-8.05-25.22-16.9-50.27-17.21-77.17Zm132.59,150.09c11.69,6.09,19.6,13.66,12.57,28.01,6.58-3.73,8.52-8.98,6.29-15.88-2.62-8.12-10.04-13.09-18.86-12.13Zm-110.51,27.96c-6.77-14.83,2.14-21.95,13.87-28.19-10.07-.14-16.94,4.48-19.47,12.52-2.12,6.73-.52,12.82,5.6,15.66Zm-36.44-9.69c-4.4-8.43-3.92-15.54,2.1-21.93,5.63-5.98,12.8-8.36,21.66-8.76-9.37-3.77-20.9,.69-26.3,9.42-4.49,7.27-3.79,15.76,2.54,21.27Zm172.25-30.76c8.81-.09,15.78,2.84,21.26,8.91,5.99,6.63,6.28,13.9,1.65,21.57,6.46-5.3,7.33-14.17,2.58-21.8-4.88-7.85-16.08-12.62-25.5-8.68Zm-29.12,17.22c8.26,10.5,8.48,14.19,3.32,26.12,4.6-4.24,6.92-8.63,6.1-13.92-.81-5.23-3.57-9.46-9.42-12.2Zm-88.4,.52c-5.19,1.75-8.85,6.41-9.33,11.38-.6,6.24,1.13,10.89,4.85,13.07-4.34-11.02-3.65-15.04,4.47-24.45Zm79.02,26.78c7.74-7.67,5.24-21.22-3.52-25.25,6.83,7.66,7.69,15.78,3.52,25.25Zm-67.84-23.73c-7.5,4.83-8.77,16.05-2.45,23.44-2.54-8.51-2.87-16.28,2.45-23.44Z"
                fill={color}
            />
            {/* Eyes (Pupils) - The small paths are likely pupils */}
            <path d="M347.83,200.04c.11,12.84-10.27,23.56-22.87,23.62-12.01,.06-22.45-10.5-22.58-22.82-.14-13.35,10.43-24.5,23.3-24.59,12.23-.08,22.04,10.45,22.16,23.79Zm-20.99,.4c6.13-.02,10.96-4.71,10.92-10.6-.03-5.63-5.02-10.66-10.61-10.7-5.9-.04-10.81,4.85-10.82,10.79-.01,5.91,4.61,10.53,10.5,10.51Z" fill="#333" />
            <path d="M415.81,200.53c.12-13.24,9.85-23.83,21.77-23.71,13,.13,23.42,11.08,23.27,24.43-.15,12.67-10.35,22.94-22.72,22.88-12.44-.06-22.43-10.62-22.31-23.6Zm21.58-.08c6.07,.16,11.09-4.51,11.16-10.37,.07-5.75-4.63-10.62-10.45-10.83-5.59-.2-10.65,4.44-10.84,9.94-.22,6.31,4.09,11.1,10.13,11.26Z" fill="#333" />
        </g>
    );
};

const DogVisual = ({ stage, mood, color }: { stage: EvolutionStage, mood: PetMood, color: string }) => {
    const isBaby = stage === 'baby';

    return (
        <g className={cn("transition-all duration-500", mood === 'excited' && "animate-bounce")}>
            <path d="M 20 30 Q 40 25 45 15" fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" />
            <rect x="-25" y={isBaby ? "20" : "25"} width="50" height={isBaby ? "35" : "50"} rx="15" fill={color} />
            <g transform={isBaby ? "translate(0, 5)" : "translate(0, -5)"}>
                <path d="M -20 -10 Q -35 0 -30 15 L -20 5 Z" fill={color} stroke={color} strokeWidth="4" />
                <path d="M 20 -10 Q 35 0 30 15 L 20 5 Z" fill={color} stroke={color} strokeWidth="4" />
                <circle r={isBaby ? "26" : "24"} fill={color} />
                <g fill="hsl(var(--foreground))" stroke="hsl(var(--foreground))">
                    <Eye mood={mood} side="left" />
                    <Eye mood={mood} side="right" />
                    <Mouth mood={mood} />
                </g>
            </g>
            <ellipse cx="-18" cy={isBaby ? "50" : "70"} rx="7" ry="5" fill={color} />
            <ellipse cx="18" cy={isBaby ? "50" : "70"} rx="7" ry="5" fill={color} />
        </g>
    );
};

export const PetVisual = ({ type, stage, mood, color, className }: PetVisualProps) => {
    return (
        <svg viewBox="-50 -50 100 150" className={cn("w-full h-full overflow-visible drop-shadow-lg", className)}>
            {type === 'cat' && <CatVisual stage={stage} mood={mood} color={color} />}
            {type === 'dog' && <DogVisual stage={stage} mood={mood} color={color} />}
            {(type === 'horse' || type === 'chicken') && <CatVisual stage={stage} mood={mood} color={color} />}

            {mood === 'sleepy' && (
                <g className="animate-pulse opacity-70">
                    <text x="30" y="-30" fontSize="20" fill="currentColor">Z</text>
                    <text x="45" y="-45" fontSize="15" fill="currentColor">z</text>
                </g>
            )}
            {mood === 'excited' && (
                <g className="animate-pulse">
                    <text x="30" y="-30" fontSize="20">✨</text>
                    <text x="-40" y="-20" fontSize="20">✨</text>
                </g>
            )}
        </svg>
    );
};
