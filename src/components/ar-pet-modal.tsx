"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Webcam from "react-webcam";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { X, RefreshCw, Volume2, VolumeX, AlertCircle, Cookie, Star, Trophy, Shirt, Target, Image as ImageIcon, Mic, MicOff, Settings, Menu } from "lucide-react";
import { VirtualPet, type PetType } from "./virtual-pet";
import type { PetCustomization, DailyChallenge } from "@/lib/types";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { getUnlockedAccessories, type AccessorySlot, ACCESSORIES } from "@/lib/accessories";
import { useAuth } from "@/context/AuthContext";

type ARPetModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    petType: PetType;
    petHappiness: number;
    customization: PetCustomization;
    level: number;
    onCustomizationChange?: (customization: Partial<PetCustomization>) => void;
    isPro?: boolean;
    achievements?: string[];
    dailyChallenges?: DailyChallenge[];
    onUpdateChallenge?: (type: string, amount: number) => void;
    petName: string;
    onSavePetSettings?: (name: string, type: PetType) => void;
};

const SPEECH_BUBBLES = {
    greeting: [
        "Hey there! 👋",
        "Ready to explore? 🌟",
        "Let's have fun! 🎉",
        "You came back! 😊",
        "I missed you! 💙",
        "Adventure time! 🚀"
    ],
    tap: [
        "That tickles! 😄",
        "Hehe! Again! 🎈",
        "Wheee! 🌈",
        "I love that! 💕",
        "So fun! 🎪",
        "Keep going! ✨",
        "Yay! More! 🎊"
    ],
    spin: [
        "Watch me spin! ✨",
        "Wheeee! 🎪",
        "So dizzy! 😵",
        "Round and round! 🌪️",
        "Look at me go! 🎯",
        "Spinning star! ⭐"
    ],
    orbCaught: [
        "Yum! Energy! ⚡",
        "Got it! 🎯",
        "Nom nom! 💫",
        "Caught it! 🌟",
        "Score! 🏆",
        "My favorite! 😋",
        "So tasty! 🤤"
    ],
    treatEaten: [
        "Delicious! 😋",
        "Mmm! Tasty! 🍖",
        "More please! 🤤",
        "Best snack ever! 😍",
        "So good! 🌟",
        "Thank you! 💝"
    ],
    sparkle: [
        "Sparkle power! ✨",
        "Magic! 🌟",
        "Wow! 💫",
        "I'm glowing! ✨",
        "Magical vibes! 🪄",
        "Shiny! 💎"
    ],
    energyTip: [
        "Remember to rest! 😴",
        "Stay hydrated! 💧",
        "You're doing great! 💪",
        "Take care of yourself! 💚",
        "Listen to your body! 🧘",
        "You've got this! 🌈"
    ],
    lowEnergy: [
        "You seem tired... 🥱",
        "Time for a break? ☕",
        "Let's recharge! 🔋",
        "Rest is important! 😴",
        "Take it easy! 🛋️"
    ],
    highEnergy: [
        "You're on fire! 🔥",
        "Amazing energy! ⚡",
        "Keep it up! 🌟",
        "Unstoppable! 💪",
        "Peak performance! 🚀",
        "You're glowing! ✨"
    ],
    gameStart: [
        "Let's play! 🎮",
        "Catch time! 🎯",
        "Here we go! 🚀",
        "Game on! 🕹️",
        "Ready, set, go! 🏁"
    ],
    gameWin: [
        "We did it! 🏆",
        "Great job! 🌟",
        "You're amazing! 🎉",
        "Victory! 🎊",
        "Champions! 👑",
        "Perfect! 💯"
    ],
    ballPlay: [
        "Throw me the ball! 🎾",
        "How hard can you throw? 💪",
        "Wanna play fetch? 🐕",
        "Bet you can't hit me! 😏",
        "I'm ready! Throw it! 🎯",
        "Let's play ball! ⚾",
        "Catch me if you can! 🏃"
    ],
    sit: [
        "Where should I sit? 🪑",
        "Find me a good spot! 📍",
        "I'll stay right there! 🐕",
        "Perfect spot! 🎯",
        "Comfy! 😌"
    ],
};

const TREAT_TYPES = {
    cat: { emoji: "🐟", color: "#4FB3D4" },
    dog: { emoji: "🦴", color: "#F4E4C1" },
    horse: { emoji: "🥕", color: "#FF8C42" },
    chicken: { emoji: "🌾", color: "#F4D03F" },
};

type EnergyOrb = { id: number; x: number; y: number; color: string; vx: number; vy: number };
type Treat = { id: number; x: number; y: number; vy: number };
type FallingObject = { id: number; x: number; y: number; type: 'star' | 'heart' | 'coin'; velocity: number };
type Particle = { id: number; x: number; y: number; vx: number; vy: number; color: string; life: number };

export function ARPetModal({
    open,
    onOpenChange,
    petType,
    petHappiness,
    customization,
    level,
    onCustomizationChange,
    isPro,
    achievements,
    dailyChallenges,
    onUpdateChallenge,
    petName,
    onSavePetSettings
}: ARPetModalProps) {
    const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
    const [petPosition, setPetPosition] = useState({ x: 0, y: 0 });
    const [petScale, setPetScale] = useState(1.5);
    const [petRotation, setPetRotation] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const [speechBubble, setSpeechBubble] = useState<string | null>(null);
    const [soundEnabled, setSoundEnabled] = useState(false);
    const [lastTap, setLastTap] = useState(0);
    const [cameraError, setCameraError] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    const [energyOrbs, setEnergyOrbs] = useState<EnergyOrb[]>([]);
    const [treats, setTreats] = useState<Treat[]>([]);
    const [fallingObjects, setFallingObjects] = useState<FallingObject[]>([]);
    const [particles, setParticles] = useState<Particle[]>([]);
    const [score, setScore] = useState(0);
    const [combo, setCombo] = useState(0);
    const [gameActive, setGameActive] = useState(false);
    const [missedCount, setMissedCount] = useState(0);
    const [gameTimeLeft, setGameTimeLeft] = useState(20);
    const [showAccessories, setShowAccessories] = useState(false);
    const [showChallenges, setShowChallenges] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<AccessorySlot>('hat');
    const [showAchievements, setShowAchievements] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showLeftMenu, setShowLeftMenu] = useState(false);
    const [tempPetName, setTempPetName] = useState(petName);
    const [tempPetType, setTempPetType] = useState<PetType>(petType);
    const { achievements: allAchievements, unlockAchievement } = useAuth();
    const interactionCount = useRef(0);



    // Unlock 'Master Catcher' if score > 500
    useEffect(() => {
        if (score >= 500) {
            unlockAchievement('Master Catcher');
        }
    }, [score, unlockAchievement]);

    // Track interactions for 'Pet Whisperer'
    useEffect(() => {
        if (isAnimating) {
            interactionCount.current += 1;
            if (interactionCount.current >= 50) {
                unlockAchievement('Pet Whisperer');
            }
        }
    }, [isAnimating, unlockAchievement]);

    // Background state
    const [backgroundMode, setBackgroundMode] = useState<'camera' | 'image'>('camera');
    const [selectedBackground, setSelectedBackground] = useState<'park' | 'living-room' | 'beach' | 'space'>('park');

    // Draggable ball state
    const [ballPosition, setBallPosition] = useState({ x: 100, y: 100 });
    const [ballVelocity, setBallVelocity] = useState({ vx: 0, vy: 0 });
    const [isDraggingBall, setIsDraggingBall] = useState(false);
    const ballDragStart = useRef<{ x: number; y: number; time: number } | null>(null);

    // Sit & Stay state
    const [interactionMode, setInteractionMode] = useState<'default' | 'menu' | 'placing' | 'sitting'>('default');
    const [petAnchor, setPetAnchor] = useState({ x: 0, y: 0 });
    const longPressTimer = useRef<NodeJS.Timeout | null>(null);
    const lastBallInteraction = useRef<number>(Date.now());

    const webcamRef = useRef<Webcam>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const deviceOrientationRef = useRef({ beta: 0, gamma: 0 });
    const touchStartRef = useRef<{ x: number; y: number; dist?: number } | null>(null);
    const particleIdRef = useRef(0);

    const getEnergyColor = useCallback(() => {
        if (petHappiness > 70) return "#10b981";
        if (petHappiness > 40) return "#f59e0b";
        return "#ef4444";
    }, [petHappiness]);

    const getPetEnergyState = useCallback(() => {
        if (petHappiness > 70) return { scale: 1.6, glow: true };
        if (petHappiness > 40) return { scale: 1.5, glow: false };
        return { scale: 1.3, glow: false };
    }, [petHappiness]);

    const isSpeechBubbleVisible = useRef(false);

    const showSpeechBubble = useCallback((category: keyof typeof SPEECH_BUBBLES) => {
        if (isDragging || isSpeechBubbleVisible.current) return;
        const messages = SPEECH_BUBBLES[category];
        setSpeechBubble(messages[Math.floor(Math.random() * messages.length)]);
        isSpeechBubbleVisible.current = true;
        setTimeout(() => {
            setSpeechBubble(null);
            isSpeechBubbleVisible.current = false;
        }, 3000);
    }, [isDragging]);

    // Initial greeting and unlock 'First Steps'
    useEffect(() => {
        if (open) {
            unlockAchievement('First Steps');
            const t = setTimeout(() => showSpeechBubble('greeting'), 500);
            return () => clearTimeout(t);
        }
    }, [open, unlockAchievement, showSpeechBubble]);

    const playSound = useCallback((freq: number, dur: number) => {
        if (!soundEnabled) return;
        try {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.value = freq;
            osc.type = 'sine';
            gain.gain.setValueAtTime(0.2, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + dur);
            osc.start();
            osc.stop(ctx.currentTime + dur);
        } catch (e) { }
    }, [soundEnabled]);

    const vibrate = useCallback((pattern: number[]) => {
        if ('vibrate' in navigator) navigator.vibrate(pattern);
    }, []);

    const createParticles = useCallback((x: number, y: number, color: string, count: number = 10) => {
        const newParticles: Particle[] = [];
        for (let i = 0; i < count; i++) {
            newParticles.push({
                id: ++particleIdRef.current,
                x, y,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                color,
                life: 1.0
            });
        }
        setParticles(prev => [...prev, ...newParticles]);
    }, []);

    const throwOrb = useCallback((x: number, y: number) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        setEnergyOrbs(prev => [...prev, {
            id: Date.now(),
            x, y,
            color: getEnergyColor(),
            vx: (centerX + petPosition.x - x) / 15,
            vy: (centerY + petPosition.y - y) / 15
        }]);
        playSound(440, 0.1);
        vibrate([10]);
    }, [getEnergyColor, petPosition, playSound, vibrate]);

    const throwTreat = useCallback(() => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        setTreats(prev => [...prev, {
            id: Date.now(),
            x: rect.width / 2 + (Math.random() - 0.5) * 100,
            y: 50,
            vy: 2
        }]);
        playSound(523, 0.15);
        vibrate([20]);
    }, [playSound, vibrate]);

    const doTrick = useCallback((type: 'bounce' | 'spin' | 'sparkle') => {
        setIsAnimating(true);
        if (type === 'bounce') {
            setPetPosition(prev => ({ ...prev, y: -60 }));
            setTimeout(() => setPetPosition(prev => ({ ...prev, y: 0 })), 350);
            playSound(523, 0.1);
            showSpeechBubble('tap');
        } else if (type === 'spin') {
            setPetRotation(720);
            setTimeout(() => setPetRotation(0), 600);
            playSound(659, 0.2);
            showSpeechBubble('spin');
        } else if (type === 'sparkle') {
            createParticles(petPosition.x, petPosition.y, '#ffd700', 25);
            playSound(880, 0.2);
            showSpeechBubble('sparkle');
        }
        setTimeout(() => onUpdateChallenge?.('perform_tricks', 1), 0);
        vibrate([30, 10, 30]);
        setTimeout(() => setIsAnimating(false), 700);
    }, [playSound, showSpeechBubble, vibrate, createParticles, petPosition, onUpdateChallenge]);

    const startGame = useCallback(() => {
        setGameActive(true);
        setScore(0);
        setCombo(0);
        setMissedCount(0);
        setGameTimeLeft(20);
        setFallingObjects([]);
        showSpeechBubble('gameStart');
    }, [showSpeechBubble]);

    const endGame = useCallback(() => {
        setGameActive(false);
        setFallingObjects([]);
        if (score > 0) {
            showSpeechBubble('gameWin');
            setTimeout(() => onUpdateChallenge?.('play_minigame', 1), 0);
        }
    }, [score, showSpeechBubble, onUpdateChallenge]);

    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<any>(null);

    const toggleListening = useCallback(() => {
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
            return;
        }

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Voice commands are not supported in this browser.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onerror = (event: any) => {
            console.error("Speech recognition error", event.error);
            setIsListening(false);
        };

        recognition.onresult = (event: any) => {
            const lastResult = event.results[event.results.length - 1];
            const command = lastResult[0].transcript.trim().toLowerCase();
            console.log("Voice command:", command);

            if (command.includes('sit') || command.includes('stay')) {
                setInteractionMode('sitting');
                showSpeechBubble('sit');
            } else if (command.includes('spin') || command.includes('turn')) {
                doTrick('spin');
            } else if (command.includes('jump') || command.includes('bounce') || command.includes('up')) {
                doTrick('bounce');
            } else if (command.includes('sparkle') || command.includes('magic') || command.includes('glow')) {
                doTrick('sparkle');
            } else if (command.includes('play') || command.includes('game') || command.includes('catch')) {
                if (!gameActive) startGame();
            } else if (command.includes('stop') || command.includes('end') || command.includes('quit')) {
                if (gameActive) endGame();
            }
        };

        recognition.start();
        recognitionRef.current = recognition;
    }, [isListening, gameActive, showSpeechBubble, doTrick, startGame, endGame]);

    // Clean up recognition on unmount
    useEffect(() => {
        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, []);

    // Touch handlers for pet
    const handlePetTouchStart = useCallback((e: React.TouchEvent) => {
        e.stopPropagation();
        setIsDragging(false);

        // Long press detection
        if (e.touches.length === 1 && !gameActive) {
            longPressTimer.current = setTimeout(() => {
                setInteractionMode('menu');
                if (navigator.vibrate) navigator.vibrate(50);
            }, 800);
        }

        if (e.touches.length === 1) {
            const rect = containerRef.current?.getBoundingClientRect();
            if (rect) {
                touchStartRef.current = {
                    x: e.touches[0].clientX,
                    y: e.touches[0].clientY
                };
            }
        } else if (e.touches.length === 2) {
            const dist = Math.sqrt(
                Math.pow(e.touches[1].clientX - e.touches[0].clientX, 2) +
                Math.pow(e.touches[1].clientY - e.touches[0].clientY, 2)
            );
            touchStartRef.current = { x: 0, y: 0, dist };
        }
    }, [gameActive]);

    const handlePetTouchMove = useCallback((e: React.TouchEvent) => {
        e.stopPropagation();

        // Cancel long press if moved
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
        }

        if (!touchStartRef.current) return;
        setIsDragging(true);

        if (e.touches.length === 1 && !touchStartRef.current.dist) {
            const deltaX = e.touches[0].clientX - touchStartRef.current.x;
            const deltaY = e.touches[0].clientY - touchStartRef.current.y;

            if (interactionMode === 'placing') {
                // Move the anchor
                setPetAnchor(prev => ({
                    x: prev.x + deltaX,
                    y: prev.y + deltaY
                }));
                // Update touch start to avoid jumping
                touchStartRef.current = {
                    x: e.touches[0].clientX,
                    y: e.touches[0].clientY
                };
            } else {
                setPetPosition({ x: deltaX / 2, y: deltaY / 2 });
            }
        } else if (e.touches.length === 2 && touchStartRef.current.dist) {
            const dist = Math.sqrt(
                Math.pow(e.touches[1].clientX - e.touches[0].clientX, 2) +
                Math.pow(e.touches[1].clientY - e.touches[0].clientY, 2)
            );
            const scale = Math.max(0.8, Math.min(2.5, dist / touchStartRef.current.dist * petScale));
            setPetScale(scale);
        }
    }, [petScale, interactionMode]);

    const handlePetTouchEnd = useCallback((e: React.TouchEvent) => {
        e.stopPropagation();

        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
        }

        if (interactionMode === 'placing') {
            setInteractionMode('sitting');
            touchStartRef.current = null;
            setIsDragging(false);
            return;
        }

        if (touchStartRef.current && !touchStartRef.current.dist && e.touches.length === 0) {
            const now = Date.now();
            if (!isDragging && Math.abs(petPosition.x) < 5 && Math.abs(petPosition.y) < 5) {
                if (now - lastTap < 300) {
                    doTrick('spin');
                } else {
                    doTrick('bounce');
                }
                setLastTap(now);
            }

            const returnInterval = setInterval(() => {
                setPetPosition(prev => {
                    const newX = prev.x * 0.85;
                    const newY = prev.y * 0.85;
                    if (Math.abs(newX) < 1 && Math.abs(newY) < 1) {
                        clearInterval(returnInterval);
                        return { x: 0, y: 0 };
                    }
                    return { x: newX, y: newY };
                });
            }, 16);
        }

        touchStartRef.current = null;
        setTimeout(() => setIsDragging(false), 100);
    }, [lastTap, doTrick, petPosition, isDragging, interactionMode]);

    // Physics loop
    useEffect(() => {
        if (!open) return;

        let frameId: number;
        const update = () => {
            const rect = containerRef.current?.getBoundingClientRect();
            if (!rect) return;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            setEnergyOrbs(prev => prev.map(orb => {
                const newX = orb.x + orb.vx;
                const newY = orb.y + orb.vy;
                const dist = Math.sqrt(
                    Math.pow(newX - (centerX + petAnchor.x + petPosition.x), 2) +
                    Math.pow(newY - (centerY + petAnchor.y + petPosition.y), 2)
                );

                if (dist < 50) {
                    setScore(s => s + 10);
                    setCombo(c => c + 1);
                    createParticles(newX, newY, orb.color, 12);
                    playSound(880, 0.1);
                    vibrate([15]);
                    showSpeechBubble('orbCaught');
                    setTimeout(() => onUpdateChallenge?.('catch_items', 1), 0);
                    return null;
                }

                return (newX > -50 && newX < rect.width + 50 && newY > -50 && newY < rect.height + 50)
                    ? { ...orb, x: newX, y: newY }
                    : null;
            }).filter(Boolean) as EnergyOrb[]);

            setTreats(prev => prev.map(treat => {
                const newY = treat.y + treat.vy;
                const dist = Math.sqrt(
                    Math.pow(treat.x - (centerX + petAnchor.x + petPosition.x), 2) +
                    Math.pow(newY - (centerY + petAnchor.y + petPosition.y), 2)
                );

                if (dist < 50) {
                    createParticles(treat.x, newY, TREAT_TYPES[petType].color, 15);
                    playSound(659, 0.15);
                    vibrate([25]);
                    showSpeechBubble('treatEaten');
                    setTimeout(() => onUpdateChallenge?.('feed_treats', 1), 0);
                    return null;
                }

                return newY < rect.height + 50 ? { ...treat, y: newY, vy: treat.vy + 0.15 } : null;
            }).filter(Boolean) as Treat[]);

            if (gameActive) {
                setFallingObjects(prev => prev.map(obj => {
                    const newY = obj.y + obj.velocity;
                    const dist = Math.sqrt(
                        Math.pow(obj.x - (centerX + petAnchor.x + petPosition.x), 2) +
                        Math.pow(newY - (centerY + petAnchor.y + petPosition.y), 2)
                    );

                    if (dist < 45) {
                        const pts = obj.type === 'star' ? 10 : obj.type === 'heart' ? 15 : 20;
                        setScore(s => s + pts);
                        setCombo(c => c + 1);
                        createParticles(obj.x, newY, '#ffd700', 8);
                        playSound(880 + combo * 40, 0.1);
                        vibrate([10]);
                        setTimeout(() => onUpdateChallenge?.('catch_items', 1), 0);
                        return null;
                    }

                    if (newY > rect.height) {
                        setMissedCount(m => {
                            if (m + 1 >= 3) endGame();
                            return m + 1;
                        });
                        setCombo(0);
                        return null;
                    }

                    return { ...obj, y: newY };
                }).filter(Boolean) as FallingObject[]);
            }

            setParticles(prev => prev.map(p => ({
                ...p,
                x: p.x + p.vx,
                y: p.y + p.vy,
                vy: p.vy + 0.2,
                life: p.life - 0.018
            })).filter(p => p.life > 0));

            // Ball physics (gravity, bouncing, pet interaction)
            if (!isDraggingBall && rect) {
                setBallPosition(prev => {
                    const timeSinceInteraction = Date.now() - lastBallInteraction.current;
                    let newX = prev.x + ballVelocity.vx;
                    let newY = prev.y + ballVelocity.vy;
                    let newVx = ballVelocity.vx * 0.99; // Air resistance
                    let newVy = ballVelocity.vy + 0.5; // Gravity

                    // Sleep mode: after 3 seconds of no interaction, ball settles
                    if (timeSinceInteraction > 3000) {
                        newVx *= 0.8; // Strong horizontal friction
                        if (newY > rect.height - 40) {
                            newVy = 0; // Stop bouncing
                            newY = Math.min(newY, rect.height - 30);
                        }
                    }

                    // Bounce off walls
                    if (newX < 30) {
                        newX = 30;
                        newVx = -newVx * 0.7; // Energy loss on bounce
                        playSound(440, 0.05);
                    } else if (newX > rect.width - 30) {
                        newX = rect.width - 30;
                        newVx = -newVx * 0.7;
                        playSound(440, 0.05);
                    }

                    // Bounce off floor/ceiling
                    if (newY < 30) {
                        newY = 30;
                        newVy = -newVy * 0.7;
                        playSound(440, 0.05);
                    } else if (newY > rect.height - 30) {
                        newY = rect.height - 30;
                        newVy = -newVy * 0.8; // More bounce on floor
                        playSound(440, 0.05);
                        if (Math.abs(newVy) < 1) newVy = 0; // Stop if barely moving
                    }

                    // Check collision with pet
                    const distToPet = Math.sqrt(
                        Math.pow(newX - (centerX + petAnchor.x + petPosition.x), 2) +
                        Math.pow(newY - (centerY + petAnchor.y + petPosition.y), 2)
                    );

                    if (distToPet < 80) {
                        lastBallInteraction.current = Date.now();
                        createParticles(newX, newY, '#ffd700', 15);
                        showSpeechBubble('tap');
                        doTrick('bounce');
                        playSound(659, 0.15);
                        vibrate([20, 10, 20]);
                        setTimeout(() => onUpdateChallenge?.('play_minigame', 1), 0);
                        // Bounce away from pet
                        const angle = Math.atan2(newY - (centerY + petAnchor.y + petPosition.y), newX - (centerX + petAnchor.x + petPosition.x));
                        newVx = Math.cos(angle) * 8;
                        newVy = Math.sin(angle) * 8;
                    }

                    setBallVelocity({ vx: newVx, vy: newVy });
                    return { x: newX, y: newY };
                });
            }

            frameId = requestAnimationFrame(update);
        };

        frameId = requestAnimationFrame(update);
        return () => cancelAnimationFrame(frameId);
    }, [open, petPosition, petAnchor, gameActive, combo, petType, createParticles, playSound, vibrate, showSpeechBubble, endGame, onUpdateChallenge, isDraggingBall]);

    // Game timer
    useEffect(() => {
        if (!gameActive) return;

        const interval = setInterval(() => {
            setGameTimeLeft(prev => {
                if (prev <= 1) {
                    endGame();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [gameActive, endGame]);

    // Spawn objects
    useEffect(() => {
        if (!gameActive || !containerRef.current) return;

        const interval = setInterval(() => {
            const rect = containerRef.current!.getBoundingClientRect();
            const types: ('star' | 'heart' | 'coin')[] = ['star', 'heart', 'coin'];
            setFallingObjects(prev => [...prev, {
                id: Date.now(),
                x: Math.random() * rect.width,
                y: -30,
                type: types[Math.floor(Math.random() * types.length)],
                velocity: 2.5 + Math.random() * 1.5
            }]);
        }, 1400);

        return () => clearInterval(interval);
    }, [gameActive]);

    // Motion
    useEffect(() => {
        if (!open) return;

        let lastShake = 0;
        const handleOrientation = (e: DeviceOrientationEvent) => {
            if (!e.beta || !e.gamma) return;

            const prevBeta = deviceOrientationRef.current.beta;
            const prevGamma = deviceOrientationRef.current.gamma;
            deviceOrientationRef.current = { beta: e.beta, gamma: e.gamma };

            const deltaBeta = Math.abs(e.beta - prevBeta);
            const deltaGamma = Math.abs(e.gamma - prevGamma);
            const now = Date.now();

            if ((deltaBeta > 20 || deltaGamma > 20) && now - lastShake > 800) {
                lastShake = now;
                doTrick('sparkle');
            }

            if (Math.abs(e.gamma) > 15 && !isAnimating && !gameActive) {
                setPetPosition(prev => ({ x: e.gamma! / 10, y: prev.y }));
            }
        };

        if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
            (DeviceOrientationEvent as any).requestPermission()
                .then((r: string) => {
                    if (r === 'granted') window.addEventListener('deviceorientation', handleOrientation);
                })
                .catch(console.error);
        } else {
            window.addEventListener('deviceorientation', handleOrientation);
        }



        return () => window.removeEventListener('deviceorientation', handleOrientation);
    }, [open, doTrick, showSpeechBubble, isAnimating, gameActive]);

    // Energy reactions
    useEffect(() => {
        if (!open) return;
        const interval = setInterval(() => {
            if (petHappiness < 25) showSpeechBubble('lowEnergy');
            else if (petHappiness > 75 && Math.random() < 0.4) showSpeechBubble('highEnergy');
        }, 18000);
        return () => clearInterval(interval);
    }, [open, petHappiness, showSpeechBubble]);

    // Ball play requests
    useEffect(() => {
        if (!open || gameActive) return;

        // Show first ball play message after 5 seconds
        const initialTimeout = setTimeout(() => {
            showSpeechBubble('ballPlay');
        }, 5000);

        // Then show randomly every 10 seconds (60% chance)
        const interval = setInterval(() => {
            if (Math.random() < 0.6) {
                showSpeechBubble('ballPlay');
            }
        }, 10000);

        return () => {
            clearTimeout(initialTimeout);
            clearInterval(interval);
        };
    }, [open, gameActive, showSpeechBubble]);

    const energyState = getPetEnergyState();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="p-0 border-0 bg-black text-white w-full h-[100dvh] max-w-full rounded-none flex flex-col">
                <VisuallyHidden><DialogTitle>AR Pet</DialogTitle></VisuallyHidden>

                <div
                    ref={containerRef}
                    className="relative flex-1 overflow-hidden flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900"
                    onTouchStart={(e) => {
                        if (e.touches.length === 1 && !gameActive) {
                            const touch = e.touches[0];
                            const rect = containerRef.current?.getBoundingClientRect();
                            if (rect) throwOrb(touch.clientX - rect.left, touch.clientY - rect.top);
                        }
                    }}
                >
                    {backgroundMode === 'camera' && !cameraError ? (
                        <Webcam
                            audio={false}
                            ref={webcamRef}
                            videoConstraints={{ facingMode }}
                            className="absolute inset-0 w-full h-full object-cover"
                            onUserMedia={() => setCameraError(false)}
                            onUserMediaError={() => setTimeout(() => setCameraError(true), 3000)}
                        />
                    ) : backgroundMode === 'image' ? (
                        <img
                            src={`/backgrounds/${selectedBackground}.png`}
                            alt="Background"
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                    ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
                            <div className="absolute inset-0 bg-[radial-gradient(circle,_rgba(255,255,255,0.08)_1px,_transparent_1px)] bg-[size:25px_25px]"></div>
                        </div>
                    )}

                    {cameraError && (
                        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 bg-yellow-500/20 backdrop-blur px-4 py-2 rounded-lg border border-yellow-500/40 max-w-xs">
                            <div className="flex items-center gap-2 text-yellow-100 text-sm">
                                <AlertCircle className="h-4 w-4" />
                                <p>Fantasy mode! ✨</p>
                            </div>
                        </div>
                    )}

                    <div
                        className="relative z-10 transition-all duration-200 drop-shadow-2xl cursor-pointer"
                        style={{
                            transform: `translate(${petAnchor.x + petPosition.x}px, ${petAnchor.y + petPosition.y}px) scale(${petScale * energyState.scale / 1.5 * 0.65}) rotate(${petRotation}deg)`,
                            filter: energyState.glow ? 'drop-shadow(0 0 15px rgba(16, 185, 129, 0.7))' : 'none',
                            pointerEvents: 'auto'
                        }}
                        onTouchStart={handlePetTouchStart}
                        onTouchMove={handlePetTouchMove}
                        onTouchEnd={handlePetTouchEnd}
                    >
                        {interactionMode === 'menu' && (
                            <div className="absolute -top-32 left-1/2 -translate-x-1/2 flex gap-4 animate-in fade-in zoom-in duration-200 z-50">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setInteractionMode('placing');
                                        showSpeechBubble('sit');
                                    }}
                                    className="bg-white/90 backdrop-blur text-black px-4 py-2 rounded-full font-bold shadow-lg hover:bg-white active:scale-95 transition-all flex items-center gap-2"
                                >
                                    <span>🪑</span> Sit
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setInteractionMode('default');
                                        setPetAnchor({ x: 0, y: 0 });
                                    }}
                                    className="bg-white/90 backdrop-blur text-black px-4 py-2 rounded-full font-bold shadow-lg hover:bg-white active:scale-95 transition-all flex items-center gap-2"
                                >
                                    <span>🔄</span> Reset
                                </button>
                            </div>
                        )}

                        {interactionMode === 'placing' && (
                            <div className="absolute -top-20 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur text-white px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap animate-pulse">
                                Drag to place
                            </div>
                        )}

                        <VirtualPet
                            petType={petType}
                            happiness={petHappiness}
                            isInteracting={isAnimating}
                            customization={customization}
                            level={level}
                            suggestion={null}
                            showBackground={false}
                        />
                    </div>


                    {/* Draggable/Throwable Ball */}
                    <div
                        className="absolute z-25 cursor-grab active:cursor-grabbing"
                        style={{
                            left: ballPosition.x,
                            top: ballPosition.y,
                            transform: 'translate(-50%, -50%)',
                            transition: isDraggingBall ? 'none' : 'transform 0.1s ease-out',
                            touchAction: 'none'
                        }}
                        onTouchStart={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const touch = e.touches[0];
                            setIsDraggingBall(true);
                            ballDragStart.current = {
                                x: touch.clientX,
                                y: touch.clientY,
                                time: Date.now()
                            };
                            lastBallInteraction.current = Date.now();
                            setBallVelocity({ vx: 0, vy: 0 });
                        }}
                        onTouchMove={(e) => {
                            if (!isDraggingBall || !ballDragStart.current) return;
                            e.preventDefault();
                            e.stopPropagation();
                            const touch = e.touches[0];
                            const rect = containerRef.current?.getBoundingClientRect();
                            if (rect) {
                                setBallPosition({
                                    x: touch.clientX - rect.left,
                                    y: touch.clientY - rect.top
                                });
                            }
                        }}
                        onTouchEnd={(e) => {
                            if (!ballDragStart.current) return;
                            e.preventDefault();
                            e.stopPropagation();
                            setIsDraggingBall(false);

                            const touch = e.changedTouches[0];
                            const deltaX = touch.clientX - ballDragStart.current.x;
                            const deltaY = touch.clientY - ballDragStart.current.y;
                            const deltaTime = Math.max(1, Date.now() - ballDragStart.current.time);

                            // Calculate throw velocity
                            const throwSpeed = 0.5; // Multiplier for throw power
                            setBallVelocity({
                                vx: (deltaX / deltaTime) * throwSpeed * 16,
                                vy: (deltaY / deltaTime) * throwSpeed * 16
                            });

                            ballDragStart.current = null;
                            lastBallInteraction.current = Date.now();
                            playSound(523, 0.1);
                            vibrate([15]);
                        }}
                    >
                        <div className="relative">
                            <div className="drop-shadow-2xl filter brightness-110">
                                {/* CSS Tennis Ball */}
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#CDDC39] to-[#8BC34A] relative overflow-hidden shadow-lg">
                                    {/* White curved lines */}
                                    <div className="absolute top-0 left-1/2 w-1 h-full bg-white rounded-full transform -translate-x-1/2 rotate-12"></div>
                                    <div className="absolute top-0 left-1/2 w-1 h-full bg-white rounded-full transform -translate-x-1/2 -rotate-12"></div>
                                </div>
                            </div>
                            {isDraggingBall && (
                                <div className="absolute inset-0 rounded-full bg-white/20 animate-ping" />
                            )}
                        </div>
                    </div>

                    {energyOrbs.map(orb => (
                        <div key={orb.id} className="absolute w-7 h-7 rounded-full animate-pulse z-20 pointer-events-none"
                            style={{ left: orb.x, top: orb.y, backgroundColor: orb.color, boxShadow: `0 0 15px ${orb.color}`, transform: 'translate(-50%, -50%)' }} />
                    ))}

                    {treats.map(t => (
                        <div key={t.id} className="absolute text-3xl z-20 pointer-events-none" style={{ left: t.x, top: t.y, transform: 'translate(-50%, -50%)' }}>
                            {TREAT_TYPES[petType].emoji}
                        </div>
                    ))}

                    {fallingObjects.map(obj => (
                        <div key={obj.id} className="absolute text-2xl z-20 pointer-events-none" style={{ left: obj.x, top: obj.y, transform: 'translate(-50%, -50%)' }}>
                            {obj.type === 'star' ? '⭐' : obj.type === 'heart' ? '❤️' : '🪙'}
                        </div>
                    ))}

                    {particles.map(p => (
                        <div key={p.id} className="absolute w-1.5 h-1.5 rounded-full z-20 pointer-events-none"
                            style={{ left: p.x, top: p.y, backgroundColor: p.color, opacity: p.life, transform: 'translate(-50%, -50%)' }} />
                    ))}

                    {speechBubble && (
                        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 z-20 pointer-events-none animate-in fade-in zoom-in-95 duration-200"
                            style={{ transform: `translate(calc(-50% + ${petAnchor.x + petPosition.x}px), calc(-50px + ${petAnchor.y + petPosition.y}px))` }}>
                            <div className="relative bg-white text-black p-3 rounded-2xl shadow-xl max-w-[160px] min-h-[50px] flex items-center justify-center">
                                <p className="text-center font-medium text-xs leading-tight">{speechBubble}</p>
                                {/* Speech bubble tail pointing at the pet */}
                                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2">
                                    <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-t-[8px] border-l-transparent border-r-transparent border-t-white"></div>
                                </div>
                            </div>
                        </div>
                    )}

                    {score > 0 && (
                        <div className="absolute top-20 right-4 z-20 bg-black/50 backdrop-blur px-3 py-2 rounded-lg">
                            <div className="flex items-center gap-2 text-white">
                                <Trophy className="h-4 w-4 text-yellow-400" />
                                <span className="font-bold text-xl">{score}</span>
                            </div>
                            {combo > 1 && <div className="text-orange-400 text-xs font-bold">{combo}x!</div>}
                        </div>
                    )}

                    {gameActive && (
                        <div className="absolute top-20 right-4 z-20 bg-black/60 backdrop-blur px-4 py-2 rounded-lg">
                            <div className="text-white text-sm font-bold">
                                ⏱️ {gameTimeLeft}s
                            </div>
                            <div className="text-red-400 text-xs">
                                Misses: {missedCount}/3
                            </div>
                        </div>
                    )}

                    <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                        {/* Menu Toggle Button */}
                        <Button
                            variant="secondary"
                            size="icon"
                            className="rounded-full bg-black/50 hover:bg-black/70 backdrop-blur text-white border-white/20"
                            onClick={() => setShowLeftMenu(!showLeftMenu)}
                        >
                            <Menu className="h-5 w-5 text-white" />
                        </Button>

                        {/* Expandable Menu Items */}
                        {showLeftMenu && (
                            <div className="flex flex-col gap-2 animate-in slide-in-from-left duration-200">
                                <Button
                                    variant="secondary"
                                    size="icon"
                                    className={`rounded-full backdrop-blur text-white border-white/20 ${isListening ? 'bg-red-500/80 hover:bg-red-600/80 animate-pulse' : 'bg-black/50 hover:bg-black/70'}`}
                                    onClick={toggleListening}
                                >
                                    {isListening ? <Mic className="h-5 w-5 text-white" /> : <MicOff className="h-5 w-5 text-white" />}
                                </Button>
                                <Button variant="secondary" size="icon" className="rounded-full bg-black/50 hover:bg-black/70 backdrop-blur text-white border-white/20" onClick={throwTreat}>
                                    <Cookie className="h-5 w-5 text-white" />
                                </Button>
                                <Button variant="secondary" size="icon" className="rounded-full bg-black/50 hover:bg-black/70 backdrop-blur text-white border-white/20" onClick={gameActive ? endGame : startGame}>
                                    <Star className="h-5 w-5 text-white" />
                                </Button>
                                <Button
                                    variant="secondary"
                                    size="icon"
                                    className="rounded-full bg-black/50 hover:bg-black/70 backdrop-blur text-white border-white/20"
                                    onClick={() => setShowAccessories(!showAccessories)}
                                >
                                    <Shirt className="h-5 w-5 text-white" />
                                </Button>
                                <Button
                                    variant="secondary"
                                    size="icon"
                                    className="rounded-full bg-black/50 hover:bg-black/70 backdrop-blur text-white border-white/20"
                                    onClick={() => setShowChallenges(!showChallenges)}
                                >
                                    <Target className="h-5 w-5 text-white" />
                                </Button>
                                <Button
                                    variant="secondary"
                                    size="icon"
                                    className="rounded-full bg-black/50 hover:bg-black/70 backdrop-blur text-white border-white/20"
                                    onClick={() => setShowAchievements(!showAchievements)}
                                >
                                    <Trophy className="h-5 w-5 text-white" />
                                </Button>
                                <Button
                                    variant="secondary"
                                    size="icon"
                                    className="rounded-full bg-black/50 hover:bg-black/70 backdrop-blur text-white border-white/20"
                                    onClick={() => setShowSettings(!showSettings)}
                                >
                                    <Settings className="h-5 w-5 text-white" />
                                </Button>
                            </div>
                        )}
                    </div>

                    <div className="absolute top-4 right-4 z-20 flex gap-2">
                        <Button variant="secondary" size="icon" className="rounded-full bg-black/50 hover:bg-black/70 backdrop-blur text-white border-white/20" onClick={() => setSoundEnabled(!soundEnabled)}>
                            {soundEnabled ? <Volume2 className="h-5 w-5 text-white" /> : <VolumeX className="h-5 w-5 text-white" />}
                        </Button>

                        <Button variant="secondary" size="icon" className="rounded-full bg-black/50 hover:bg-black/70 backdrop-blur text-white border-white/20" onClick={() => setBackgroundMode(prev => prev === 'camera' ? 'image' : 'camera')}>
                            <ImageIcon className="h-5 w-5 text-white" />
                        </Button>

                        {backgroundMode === 'image' && (
                            <Button variant="secondary" size="icon" className="rounded-full bg-black/50 hover:bg-black/70 backdrop-blur text-white border-white/20" onClick={() => {
                                const backgrounds: ('park' | 'living-room' | 'beach' | 'space')[] = ['park', 'living-room', 'beach', 'space'];
                                const currentIndex = backgrounds.indexOf(selectedBackground);
                                const nextIndex = (currentIndex + 1) % backgrounds.length;
                                setSelectedBackground(backgrounds[nextIndex]);
                            }}>
                                <span className="text-xs font-bold">
                                    {selectedBackground === 'park' ? '🌳' :
                                        selectedBackground === 'living-room' ? '🏠' :
                                            selectedBackground === 'beach' ? '🏖️' : '🚀'}
                                </span>
                            </Button>
                        )}

                        {backgroundMode === 'camera' && !cameraError && (
                            <Button variant="secondary" size="icon" className="rounded-full bg-black/50 hover:bg-black/70 backdrop-blur text-white border-white/20" onClick={() => setFacingMode(p => p === "user" ? "environment" : "user")}>
                                <RefreshCw className="h-5 w-5 text-white" />
                            </Button>
                        )}
                        <Button variant="destructive" size="icon" className="rounded-full" onClick={() => onOpenChange(false)}>
                            <X className="h-5 w-5 text-white" />
                        </Button>
                    </div>

                    {/* Accessory Drawer */}
                    {showAccessories && (
                        <>
                            {/* Backdrop */}
                            <div
                                className="absolute inset-0 z-20 bg-black/20"
                                onClick={() => setShowAccessories(false)}
                            />
                            <div
                                className="absolute bottom-0 left-0 right-0 z-30 bg-gradient-to-br from-purple-900/95 via-blue-900/95 to-indigo-900/95 backdrop-blur-lg border-t-2 border-purple-400/30 rounded-t-3xl transition-all duration-300 animate-in slide-in-from-bottom"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="p-4 max-h-[40vh] overflow-y-auto scrollbar-hide">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-white font-bold text-lg">Pet Accessories</h3>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setShowAccessories(false)}
                                            className="text-white"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>

                                    {/* Slot Tabs */}
                                    <div className="flex gap-2 mb-4">
                                        {(['hat', 'glasses', 'collar', 'toy'] as AccessorySlot[]).map(slot => (
                                            <button
                                                key={slot}
                                                onClick={() => setSelectedSlot(slot)}
                                                className={`px-4 py-2 rounded-lg font-medium capitalize transition-colors ${selectedSlot === slot
                                                    ? 'bg-white text-black'
                                                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                                                    }`}
                                            >
                                                {slot}s
                                            </button>
                                        ))}
                                    </div>

                                    {/* Accessories Grid */}
                                    {selectedSlot === 'toy' ? (
                                        <div className="grid grid-cols-4 gap-3">
                                            {/* None option */}
                                            <button
                                                onClick={() => {
                                                    if (onCustomizationChange) {
                                                        onCustomizationChange({ [selectedSlot]: 'none' } as any);
                                                    }
                                                }}
                                                className={`p-4 rounded-xl border-2 transition-all ${customization[selectedSlot] === 'none'
                                                    ? 'border-white bg-white/20'
                                                    : 'border-white/20 bg-white/5 hover:bg-white/10'
                                                    }`}
                                            >
                                                <div className="text-3xl mb-1">❌</div>
                                                <div className="text-white/80 text-xs">None</div>
                                            </button>

                                            {/* Unlocked accessories */}
                                            {getUnlockedAccessories(selectedSlot, level, achievements || [], isPro || false).map(acc => (
                                                <button
                                                    key={acc.id}
                                                    onClick={() => {
                                                        if (onCustomizationChange) {
                                                            onCustomizationChange({ [selectedSlot]: acc.id } as any);
                                                        }
                                                    }}
                                                    className={`p-4 rounded-xl border-2 transition-all ${customization[selectedSlot] === acc.id
                                                        ? 'border-white bg-white/20'
                                                        : 'border-white/20 bg-white/5 hover:bg-white/10'
                                                        }`}
                                                    title={acc.description}
                                                >
                                                    <div className="text-3xl mb-1">
                                                        {acc.id === 'ball' ? (
                                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#CDDC39] to-[#8BC34A] relative overflow-hidden shadow-md mx-auto">
                                                                <div className="absolute top-0 left-1/2 w-0.5 h-full bg-white rounded-full transform -translate-x-1/2 rotate-12"></div>
                                                                <div className="absolute top-0 left-1/2 w-0.5 h-full bg-white rounded-full transform -translate-x-1/2 -rotate-12"></div>
                                                            </div>
                                                        ) : (
                                                            acc.emoji
                                                        )}
                                                    </div>
                                                    <div className="text-white/80 text-xs truncate">{acc.name}</div>
                                                </button>
                                            ))}

                                            {/* Locked accessories (preview) */}
                                            {Object.values(ACCESSORIES)
                                                .filter(acc =>
                                                    acc.slot === selectedSlot &&
                                                    !getUnlockedAccessories(selectedSlot, level, achievements || [], isPro || false)
                                                        .some(unlocked => unlocked.id === acc.id)
                                                )
                                                .slice(0, 3)
                                                .map(acc => (
                                                    <div
                                                        key={acc.id}
                                                        className="p-4 rounded-xl border-2 border-white/10 bg-black/40 relative opacity-50"
                                                        title={`Unlock at ${acc.unlockCondition.type}: ${acc.unlockCondition.value || 'special'}`}
                                                    >
                                                        <div className="absolute top-1 right-1 text-xs">🔒</div>
                                                        <div className="text-3xl mb-1 grayscale">{acc.emoji}</div>
                                                        <div className="text-white/60 text-xs truncate">{acc.name}</div>
                                                    </div>
                                                ))}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-8 text-white/80">
                                            <div className="text-4xl mb-2">🚧</div>
                                            <p className="font-bold">Coming Soon!</p>
                                            <p className="text-sm text-white/60 text-center mt-1">
                                                We're working on new {selectedSlot}s for your pet.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}

                    {/* Challenges Drawer */}
                    {showChallenges && dailyChallenges && (
                        <>
                            {/* Backdrop */}
                            <div
                                className="absolute inset-0 z-20 bg-black/20"
                                onClick={() => setShowChallenges(false)}
                            />
                            <div
                                className="absolute bottom-0 left-0 right-0 z-30 bg-gradient-to-br from-purple-900/95 via-blue-900/95 to-indigo-900/95 backdrop-blur-lg border-t-2 border-purple-400/30 rounded-t-3xl transition-all duration-300 animate-in slide-in-from-bottom"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="p-4 max-h-[40vh] overflow-y-auto scrollbar-hide">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-white font-bold text-lg">Daily Challenges</h3>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setShowChallenges(false)}
                                            className="text-white"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>

                                    <div className="space-y-3">
                                        {dailyChallenges.map(challenge => (
                                            <div key={challenge.id} className="bg-white/10 rounded-xl p-3 border border-white/10">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="text-2xl">{challenge.icon}</div>
                                                    <div className="flex-1">
                                                        <div className="text-white font-medium text-sm">{challenge.description}</div>
                                                        <div className="text-white/60 text-xs">Reward: {challenge.reward.value} XP</div>
                                                    </div>
                                                    {challenge.completed ? (
                                                        <div className="text-green-400 font-bold text-sm">DONE!</div>
                                                    ) : (
                                                        <div className="text-white/80 text-sm">{challenge.progress}/{challenge.target}</div>
                                                    )}
                                                </div>
                                                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full transition-all duration-500 ${challenge.completed ? 'bg-green-500' : 'bg-blue-500'}`}
                                                        style={{ width: `${(challenge.progress / challenge.target) * 100}%` }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Achievements Drawer */}
                    {showAchievements && allAchievements && (
                        <>
                            {/* Backdrop */}
                            <div
                                className="absolute inset-0 z-20 bg-black/20"
                                onClick={() => setShowAchievements(false)}
                            />
                            <div
                                className="absolute bottom-0 left-0 right-0 z-30 bg-gradient-to-br from-purple-900/95 via-blue-900/95 to-indigo-900/95 backdrop-blur-lg border-t-2 border-purple-400/30 rounded-t-3xl transition-all duration-300 animate-in slide-in-from-bottom"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="p-4 max-h-[40vh] overflow-y-auto scrollbar-hide">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-white font-bold text-lg">Achievements</h3>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setShowAchievements(false)}
                                            className="text-white"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>

                                    <div className="grid grid-cols-1 gap-3">
                                        {allAchievements.map(achievement => (
                                            <div key={achievement.id} className={`flex items-center gap-4 p-3 rounded-xl border ${achievement.unlocked ? 'bg-white/10 border-white/20' : 'bg-black/20 border-white/5 opacity-60'}`}>
                                                <div className="text-3xl">{achievement.icon}</div>
                                                <div className="flex-1">
                                                    <div className="font-bold text-white">{achievement.name}</div>
                                                    <div className="text-xs text-white/70">{achievement.description}</div>
                                                </div>
                                                {achievement.unlocked && (
                                                    <div className="text-green-400">
                                                        <Trophy className="h-5 w-5" />
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Settings Drawer */}
                    {showSettings && (
                        <>
                            {/* Backdrop */}
                            <div
                                className="absolute inset-0 z-20 bg-black/20"
                                onClick={() => setShowSettings(false)}
                            />
                            <div
                                className="absolute bottom-0 left-0 right-0 z-30 bg-gradient-to-br from-purple-900/95 via-blue-900/95 to-indigo-900/95 backdrop-blur-lg border-t-2 border-purple-400/30 rounded-t-3xl transition-all duration-300 animate-in slide-in-from-bottom"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="p-4 max-h-[50vh] overflow-y-auto scrollbar-hide">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-white font-bold text-lg">Pet Settings</h3>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setShowSettings(false)}
                                            className="text-white"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="pet-name" className="text-white/90 text-sm font-medium mb-2 block">
                                                Pet's Name
                                            </Label>
                                            <Input
                                                id="pet-name"
                                                value={tempPetName}
                                                onChange={(e) => setTempPetName(e.target.value)}
                                                placeholder="e.g., Buddy"
                                                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-white/90 text-sm font-medium mb-3 block">Pet Type</Label>
                                            <RadioGroup
                                                value={tempPetType}
                                                onValueChange={(value) => setTempPetType(value as PetType)}
                                                className="grid grid-cols-2 gap-3"
                                            >
                                                <div className="flex items-center space-x-3 p-3 bg-white/10 rounded-lg border border-white/20">
                                                    <RadioGroupItem value="cat" id="pet-cat" className="border-white/40" />
                                                    <Label htmlFor="pet-cat" className="text-white cursor-pointer flex items-center gap-2">
                                                        🐱 Cat
                                                    </Label>
                                                </div>
                                                <div className="flex items-center space-x-3 p-3 bg-white/10 rounded-lg border border-white/20">
                                                    <RadioGroupItem value="dog" id="pet-dog" className="border-white/40" />
                                                    <Label htmlFor="pet-dog" className="text-white cursor-pointer flex items-center gap-2">
                                                        🐶 Dog
                                                    </Label>
                                                </div>
                                                <div className="flex items-center space-x-3 p-3 bg-white/10 rounded-lg border border-white/20">
                                                    <RadioGroupItem value="horse" id="pet-horse" className="border-white/40" />
                                                    <Label htmlFor="pet-horse" className="text-white cursor-pointer flex items-center gap-2">
                                                        🐴 Horse
                                                    </Label>
                                                </div>
                                                <div className="flex items-center space-x-3 p-3 bg-white/10 rounded-lg border border-white/20">
                                                    <RadioGroupItem value="chicken" id="pet-chicken" className="border-white/40" />
                                                    <Label htmlFor="pet-chicken" className="text-white cursor-pointer flex items-center gap-2">
                                                        🐔 Chicken
                                                    </Label>
                                                </div>
                                            </RadioGroup>
                                        </div>
                                        <Button
                                            onClick={() => {
                                                onSavePetSettings?.(tempPetName, tempPetType);
                                                setShowSettings(false);
                                            }}
                                            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                                        >
                                            Save Changes
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    <div className="absolute bottom-12 left-0 right-0 z-20 flex flex-col gap-2 items-center pointer-events-none">
                        <div className="bg-black/40 backdrop-blur px-5 py-2.5 rounded-full text-white/90 font-medium shadow-lg border border-white/10">
                            {cameraError ? "Fantasy Mode ✨" : gameActive ? `🎮 Catch Game` : "AR Companion"}
                        </div>
                        <div className="bg-black/30 backdrop-blur px-4 py-1.5 rounded-full text-white/70 text-sm">
                            {gameActive ? "Drag pet to catch!" : "Tap → orbs • Drag pet • Pinch zoom • Shake → sparkle"}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog >
    );
}
