"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Webcam from "react-webcam";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, RefreshCw, Volume2, VolumeX, AlertCircle, Cookie, Star, Trophy } from "lucide-react";
import { VirtualPet, type PetType } from "./virtual-pet";
import type { PetCustomization } from "@/lib/types";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

type ARPetModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    petType: PetType;
    petHappiness: number;
    customization: PetCustomization;
    level: number;
};

const SPEECH_BUBBLES = {
    greeting: ["Hey there! 👋", "Ready to explore? 🌟", "Let's have fun! 🎉"],
    tap: ["That tickles! 😄", "Hehe! Again! 🎈", "Wheee! 🌈"],
    spin: ["Watch me spin! ✨", "Wheeee! 🎪", "So dizzy! 😵"],
    orbCaught: ["Yum! Energy! ⚡", "Got it! 🎯", "Nom nom! 💫"],
    treatEaten: ["Delicious! 😋", "Mmm! Tasty! 🍖", "More please! 🤤"],
    sparkle: ["Sparkle power! ✨", "Magic! 🌟", "Wow! 💫"],
    energyTip: ["Remember to rest! 😴", "Stay hydrated! 💧", "You're doing great! 💪"],
    lowEnergy: ["You seem tired... 🥱", "Time for a break? ☕", "Let's recharge! 🔋"],
    highEnergy: ["You're on fire! 🔥", "Amazing energy! ⚡", "Keep it up! 🌟"],
    gameStart: ["Let's play! 🎮", "Catch time! 🎯", "Here we go! 🚀"],
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

export function ARPetModal({ open, onOpenChange, petType, petHappiness, customization, level }: ARPetModalProps) {
    const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
    const [petPosition, setPetPosition] = useState({ x: 0, y: 0 });
    const [petScale, setPetScale] = useState(1.5);
    const [petRotation, setPetRotation] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const [speechBubble, setSpeechBubble] = useState<string | null>(null);
    const [soundEnabled, setSoundEnabled] = useState(false);
    const [lastTap, setLastTap] = useState(0);
    const [cameraError, setCameraError] = useState(false);

    const [energyOrbs, setEnergyOrbs] = useState<EnergyOrb[]>([]);
    const [treats, setTreats] = useState<Treat[]>([]);
    const [fallingObjects, setFallingObjects] = useState<FallingObject[]>([]);
    const [particles, setParticles] = useState<Particle[]>([]);
    const [score, setScore] = useState(0);
    const [combo, setCombo] = useState(0);
    const [gameActive, setGameActive] = useState(false);
    const [missedCount, setMissedCount] = useState(0);

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

    const showSpeechBubble = useCallback((category: keyof typeof SPEECH_BUBBLES) => {
        const messages = SPEECH_BUBBLES[category];
        setSpeechBubble(messages[Math.floor(Math.random() * messages.length)]);
        setTimeout(() => setSpeechBubble(null), 3000);
    }, []);

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
        vibrate([30, 10, 30]);
        setTimeout(() => setIsAnimating(false), 700);
    }, [playSound, showSpeechBubble, vibrate, createParticles, petPosition]);

    const startGame = useCallback(() => {
        setGameActive(true);
        setScore(0);
        setCombo(0);
        setMissedCount(0);
        setFallingObjects([]);
        showSpeechBubble('gameStart');
    }, [showSpeechBubble]);

    const endGame = useCallback(() => {
        setGameActive(false);
        setFallingObjects([]);
    }, []);

    // Handle pet touch interactions
    const handlePetTouchStart = useCallback((e: React.TouchEvent) => {
        e.stopPropagation();
        if (e.touches.length === 1) {
            const rect = containerRef.current?.getBoundingClientRect();
            if (rect) {
                touchStartRef.current = {
                    x: e.touches[0].clientX,
                    y: e.touches[0].clientY
                };
            }
        } else if (e.touches.length === 2) {
            // Pinch zoom start
            const dist = Math.sqrt(
                Math.pow(e.touches[1].clientX - e.touches[0].clientX, 2) +
                Math.pow(e.touches[1].clientY - e.touches[0].clientY, 2)
            );
            touchStartRef.current = { x: 0, y: 0, dist };
        }
    }, []);

    const handlePetTouchMove = useCallback((e: React.TouchEvent) => {
        e.stopPropagation();
        if (!touchStartRef.current) return;

        if (e.touches.length === 1 && !touchStartRef.current.dist) {
            // Drag pet
            const deltaX = e.touches[0].clientX - touchStartRef.current.x;
            const deltaY = e.touches[0].clientY - touchStartRef.current.y;
            setPetPosition({ x: deltaX / 2, y: deltaY / 2 });
        } else if (e.touches.length === 2 && touchStartRef.current.dist) {
            // Pinch zoom
            const dist = Math.sqrt(
                Math.pow(e.touches[1].clientX - e.touches[0].clientX, 2) +
                Math.pow(e.touches[1].clientY - e.touches[0].clientY, 2)
            );
            const scale = Math.max(0.8, Math.min(2.5, dist / touchStartRef.current.dist * petScale));
            setPetScale(scale);
        }
    }, [petScale]);

    const handlePetTouchEnd = useCallback((e: React.TouchEvent) => {
        e.stopPropagation();

        if (touchStartRef.current && !touchStartRef.current.dist && e.touches.length === 0) {
            // Check if it was a tap (not drag)
            const now = Date.now();
            if (Math.abs(petPosition.x) < 5 && Math.abs(petPosition.y) < 5) {
                if (now - lastTap < 300) {
                    doTrick('spin');
                } else {
                    doTrick('bounce');
                }
                setLastTap(now);
            }

            // Smooth return to center
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
    }, [lastTap, doTrick, petPosition]);

    // Physics loop
    useEffect(() => {
        if (!open) return;

        let frameId: number;
        const update = () => {
            const rect = containerRef.current?.getBoundingClientRect();
            if (!rect) return;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            // Update orbs
            setEnergyOrbs(prev => prev.map(orb => {
                const newX = orb.x + orb.vx;
                const newY = orb.y + orb.vy;
                const dist = Math.sqrt(
                    Math.pow(newX - (centerX + petPosition.x), 2) +
                    Math.pow(newY - (centerY + petPosition.y), 2)
                );

                if (dist < 50) {
                    setScore(s => s + 10);
                    setCombo(c => c + 1);
                    createParticles(newX, newY, orb.color, 12);
                    playSound(880, 0.1);
                    vibrate([15]);
                    showSpeechBubble('orbCaught');
                    return null;
                }

                return (newX > -50 && newX < rect.width + 50 && newY > -50 && newY < rect.height + 50)
                    ? { ...orb, x: newX, y: newY }
                    : null;
            }).filter(Boolean) as EnergyOrb[]);

            // Update treats
            setTreats(prev => prev.map(treat => {
                const newY = treat.y + treat.vy;
                const dist = Math.sqrt(
                    Math.pow(treat.x - (centerX + petPosition.x), 2) +
                    Math.pow(newY - (centerY + petPosition.y), 2)
                );

                if (dist < 50) {
                    createParticles(treat.x, newY, TREAT_TYPES[petType].color, 15);
                    playSound(659, 0.15);
                    vibrate([25]);
                    showSpeechBubble('treatEaten');
                    return null;
                }

                return newY < rect.height + 50 ? { ...treat, y: newY, vy: treat.vy + 0.15 } : null;
            }).filter(Boolean) as Treat[]);

            // Update falling objects
            if (gameActive) {
                setFallingObjects(prev => prev.map(obj => {
                    const newY = obj.y + obj.velocity;
                    const dist = Math.sqrt(
                        Math.pow(obj.x - (centerX + petPosition.x), 2) +
                        Math.pow(newY - (centerY + petPosition.y), 2)
                    );

                    if (dist < 45) {
                        const pts = obj.type === 'star' ? 10 : obj.type === 'heart' ? 15 : 20;
                        setScore(s => s + pts);
                        setCombo(c => c + 1);
                        createParticles(obj.x, newY, '#ffd700', 8);
                        playSound(880 + combo * 40, 0.1);
                        vibrate([10]);
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

            // Update particles
            setParticles(prev => prev.map(p => ({
                ...p,
                x: p.x + p.vx,
                y: p.y + p.vy,
                vy: p.vy + 0.2,
                life: p.life - 0.018
            })).filter(p => p.life > 0));

            frameId = requestAnimationFrame(update);
        };

        frameId = requestAnimationFrame(update);
        return () => cancelAnimationFrame(frameId);
    }, [open, petPosition, gameActive, combo, petType, createParticles, playSound, vibrate, showSpeechBubble, endGame]);

    // Spawn falling objects
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

    // Device motion
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

        setTimeout(() => showSpeechBubble('greeting'), 500);

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
                    {!cameraError ? (
                        <Webcam
                            audio={false}
                            ref={webcamRef}
                            videoConstraints={{ facingMode }}
                            className="absolute inset-0 w-full h-full object-cover"
                            onUserMedia={() => setCameraError(false)}
                            onUserMediaError={() => setTimeout(() => setCameraError(true), 3000)}
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
                                <p>Fantasy mode active! ✨</p>
                            </div>
                        </div>
                    )}

                    {/* Pet */}
                    <div
                        className="relative z-10 transition-all duration-200 drop-shadow-2xl cursor-pointer"
                        style={{
                            transform: `translate(${petPosition.x}px, ${petPosition.y}px) scale(${petScale * energyState.scale / 1.5}) rotate(${petRotation}deg)`,
                            filter: energyState.glow ? 'drop-shadow(0 0 15px rgba(16, 185, 129, 0.7))' : 'none',
                            pointerEvents: 'auto'
                        }}
                        onTouchStart={handlePetTouchStart}
                        onTouchMove={handlePetTouchMove}
                        onTouchEnd={handlePetTouchEnd}
                    >
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

                    {/* Orbs */}
                    {energyOrbs.map(orb => (
                        <div key={orb.id} className="absolute w-7 h-7 rounded-full animate-pulse z-20 pointer-events-none"
                            style={{ left: orb.x, top: orb.y, backgroundColor: orb.color, boxShadow: `0 0 15px ${orb.color}`, transform: 'translate(-50%, -50%)' }} />
                    ))}

                    {/* Treats */}
                    {treats.map(t => (
                        <div key={t.id} className="absolute text-3xl z-20 pointer-events-none" style={{ left: t.x, top: t.y, transform: 'translate(-50%, -50%)' }}>
                            {TREAT_TYPES[petType].emoji}
                        </div>
                    ))}

                    {/* Falling objects */}
                    {fallingObjects.map(obj => (
                        <div key={obj.id} className="absolute text-2xl z-20 pointer-events-none" style={{ left: obj.x, top: obj.y, transform: 'translate(-50%, -50%)' }}>
                            {obj.type === 'star' ? '⭐' : obj.type === 'heart' ? '❤️' : '🪙'}
                        </div>
                    ))}

                    {/* Particles */}
                    {particles.map(p => (
                        <div key={p.id} className="absolute w-1.5 h-1.5 rounded-full z-20 pointer-events-none"
                            style={{ left: p.x, top: p.y, backgroundColor: p.color, opacity: p.life, transform: 'translate(-50%, -50%)' }} />
                    ))}

                    {/* Speech */}
                    {speechBubble && (
                        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 z-20 pointer-events-none animate-in fade-in zoom-in-95 duration-200"
                            style={{ transform: `translate(calc(-50% + ${petPosition.x}px), calc(-110px + ${petPosition.y}px))` }}>
                            <div className="relative bg-white text-black px-5 py-2.5 rounded-xl shadow-xl max-w-xs">
                                <p className="text-center font-medium">{speechBubble}</p>
                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full">
                                    <div className="w-0 h-0 border-l-6 border-r-6 border-t-6 border-l-transparent border-r-transparent border-t-white"></div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Score */}
                    {score > 0 && (
                        <div className="absolute top-20 left-4 z-20 bg-black/50 backdrop-blur px-3 py-2 rounded-lg">
                            <div className="flex items-center gap-2 text-white">
                                <Trophy className="h-4 w-4 text-yellow-400" />
                                <span className="font-bold text-xl">{score}</span>
                            </div>
                            {combo > 1 && <div className="text-orange-400 text-xs font-bold">{combo}x!</div>}
                        </div>
                    )}

                    {gameActive && (
                        <div className="absolute top-20 right-4 z-20 bg-red-500/50 backdrop-blur px-3 py-1.5 rounded text-white text-sm">
                            Miss: {missedCount}/3
                        </div>
                    )}

                    {/* Controls */}
                    <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                        <Button variant="secondary" size="icon" className="rounded-full bg-black/50 hover:bg-black/70 backdrop-blur" onClick={throwTreat}>
                            <Cookie className="h-5 w-5" />
                        </Button>
                        <Button variant="secondary" size="icon" className="rounded-full bg-black/50 hover:bg-black/70 backdrop-blur" onClick={gameActive ? endGame : startGame}>
                            <Star className="h-5 w-5" />
                        </Button>
                    </div>

                    <div className="absolute top-4 right-4 z-20 flex gap-2">
                        <Button variant="secondary" size="icon" className="rounded-full bg-black/50 hover:bg-black/70 backdrop-blur" onClick={() => setSoundEnabled(!soundEnabled)}>
                            {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
                        </Button>
                        {!cameraError && (
                            <Button variant="secondary" size="icon" className="rounded-full bg-black/50 hover:bg-black/70 backdrop-blur" onClick={() => setFacingMode(p => p === "user" ? "environment" : "user")}>
                                <RefreshCw className="h-5 w-5" />
                            </Button>
                        )}
                        <Button variant="destructive" size="icon" className="rounded-full" onClick={() => onOpenChange(false)}>
                            <X className="h-5 w-5" />
                        </Button>
                    </div>

                    {/* Instructions */}
                    <div className="absolute bottom-12 left-0 right-0 z-20 flex flex-col gap-2 items-center pointer-events-none">
                        <div className="bg-black/40 backdrop-blur px-5 py-2.5 rounded-full text-white/90 font-medium shadow-lg border border-white/10">
                            {cameraError ? "Fantasy Mode ✨" : gameActive ? "🎮 Catch Game" : "AR Companion"}
                        </div>
                        <div className="bg-black/30 backdrop-blur px-4 py-1.5 rounded-full text-white/70 text-sm">
                            {gameActive ? "Tap pet to catch!" : "Tap → orbs • Drag pet • Pinch zoom • Shake → sparkle"}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
