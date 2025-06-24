
'use client';

import React, { useState, useEffect, useMemo, useRef, FC } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { doc, onSnapshot, setDoc, collection, addDoc, updateDoc } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { Zap, Plus, Feather, CheckCircle, Circle, BookOpen, ClipboardList, ChevronDown, Sparkles, Gem, Heart, Volume2, VolumeX, Gamepad2 } from 'lucide-react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { cn } from '@/lib/utils';
import type { DocumentData } from 'firebase/firestore';

// Forward declaration for Tone.js types to avoid build errors
declare const Tone: any;

// Type definitions
interface PetData {
    name: string;
    energy: number;
    gems: number;
    adventureLog: string[];
}

interface PetTask {
    id: string;
    text: string;
    completed: boolean;
}

interface Sounds {
    complete?: any;
    adventure?: any;
    pet?: any;
    gem?: any;
}

// Helper Components
const GoogleFont = () => (<style>{`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;800&display=swap'); .font-nunito { font-family: 'Nunito', sans-serif; }`}</style>);

const RoomBackground = () => (
    <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-2/3 bg-[#fdf5e6]" />
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-[#a0522d]" style={{
            backgroundImage: `repeating-linear-gradient(90deg, #8b4513, #8b4513 1px, transparent 1px, transparent 20px)`,
        }}>
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>
        <div className="absolute bottom-1/3 left-0 right-0 h-2 bg-white/60 shadow-md" />
        <div className="absolute bottom-[calc(33.33%)] left-4 w-24 h-28">
            <svg viewBox="0 0 100 120" className="w-full h-full">
                <rect x="0" y="0" width="100" height="8" fill="#6b4226" />
                <defs>
                    <pattern id="bricks" patternUnits="userSpaceOnUse" width="30" height="15">
                        <rect width="30" height="15" fill="#d2691e" />
                        <path d="M 0 7.5 H 30 M 15 0 V 7.5 M 0 7.5 V 15" stroke="#a0522d" strokeWidth="1" />
                    </pattern>
                </defs>
                <rect x="5" y="8" width="90" height="112" fill="url(#bricks)" />
                <rect x="20" y="50" width="60" height="50" fill="#282828" />
                <ellipse cx="50" cy="95" rx="20" ry="10" fill="orange" className="animate-pulse" />
                <ellipse cx="50" cy="90" rx="15" ry="8" fill="yellow" className="animate-pulse" style={{ animationDelay: '0.2s' }} />
            </svg>
        </div>
        <div className="absolute bottom-[calc(33.33%)] right-4 w-20 h-40">
            <svg viewBox="0 0 80 160" className="w-full h-full">
                <rect x="0" y="0" width="80" height="160" fill="#8b4513" stroke="#5a2d0c" strokeWidth="4" rx="5" />
                <circle cx="15" cy="80" r="5" fill="#daa520" />
            </svg>
        </div>
    </div>
);

const DialogueBubble: FC<{ text?: string }> = ({ text }) => {
    if (!text) return null;
    return (
        <div className="absolute bottom-full mb-2 w-max max-w-xs bg-white/90 backdrop-blur-sm p-3 rounded-xl shadow-lg animate-fade-in-up">
            <p className="text-center text-slate-700 font-semibold">{text}</p>
            <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-white/90 transform translate-y-full"></div>
        </div>
    );
};

const PetAvatar: FC<{ onPet: () => void; setDialogue: (text: string) => void }> = ({ onPet, setDialogue }) => {
    const [isPetting, setIsPetting] = useState(false);
    const petDialogue = ["Woof woof!", "I love pats!", "You're the best!"];

    const handlePet = () => {
        setIsPetting(true);
        onPet();
        setDialogue(petDialogue[Math.floor(Math.random() * petDialogue.length)]);
        setTimeout(() => setIsPetting(false), 500);
    };

    return (
        <div className="relative cursor-pointer w-28 h-20" onClick={handlePet}>
            <svg viewBox="0 0 120 60" className="absolute bottom-0 left-0 w-full h-full drop-shadow-md">
                <g>
                    <ellipse cx="60" cy="40" rx="58" ry="18" fill="#a16207" />
                    <ellipse cx="60" cy="37" rx="52" ry="15" fill="#facc15" />
                </g>
            </svg>
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-16 h-16">
                <DotLottieReact
                    src="https://lottie.host/09487b01-8ddf-44ee-9132-312a993d0950/OwLvmZQ781.lottie"
                    loop
                    autoplay
                    className={cn("transition-transform duration-200 drop-shadow-lg", isPetting && 'animate-pet-wiggle')}
                    style={{ width: "100%", height: "100%" }}
                />
            </div>
            {isPetting && Array.from({ length: 3 }).map((_, i) => <Heart key={i} className="absolute text-pink-500 animate-float-up" style={{ left: `${20 + i * 25}%`, top: '-20%', animationDelay: `${i * 0.1}s` }} />)}
        </div>
    );
};

export default function PetGamePage() {
    const { firebaseUser, appUser } = useAuth();
    const [petData, setPetData] = useState<PetData | null>(null);
    const [tasks, setTasks] = useState<PetTask[]>([]);
    const [newTask, setNewTask] = useState("");
    const [activeTab, setActiveTab] = useState('tasks');
    const [isNameEditing, setIsNameEditing] = useState(false);
    const [editingName, setEditingName] = useState("");
    const [showPanel, setShowPanel] = useState(true);
    const [isMuted, setIsMuted] = useState(true);
    const [dialogue, setDialogueText] = useState("");
    const dialogueTimeout = useRef<NodeJS.Timeout | null>(null);
    const sounds = useRef<Sounds | null>(null);
    const adventureLocations = ["The Park", "The Beach", "The Forest Trail", "The Bustling Market", "The Quiet Library"];
    const router = useRouter();

    // Dynamically import Tone.js and initialize sounds
    useEffect(() => {
        let soundInstances: Sounds = {};
        import('tone').then(ToneModule => {
            const Tone = ToneModule;
            soundInstances = {
                complete: new Tone.Synth({ oscillator: { type: 'sine' }, envelope: { attack: 0.01, decay: 0.2, sustain: 0.1, release: 0.2 } }).toDestination(),
                adventure: new Tone.NoiseSynth({ noise: { type: 'white' }, envelope: { attack: 0.01, decay: 0.1, sustain: 0 } }).toDestination(),
                pet: new Tone.Synth({ oscillator: { type: 'triangle' }, envelope: { attack: 0.01, decay: 0.1, sustain: 0.1, release: 0.1 } }).toDestination(),
                gem: new Tone.Synth({ oscillator: { type: 'fmtriangle', modulationType: 'sine' }, envelope: { attack: 0.01, decay: 0.2, sustain: 0, release: 0.2 } }).toDestination(),
            };
            sounds.current = soundInstances;
        });

        return () => {
            if (sounds.current) {
                Object.values(sounds.current).forEach(s => s?.dispose());
            }
        };
    }, []);

    const setDialogue = (text: string) => {
        setDialogueText(text);
        if (dialogueTimeout.current) clearTimeout(dialogueTimeout.current);
        dialogueTimeout.current = setTimeout(() => setDialogueText(""), 4000);
    };

    const playSound = (sound: keyof Sounds) => {
        if (!isMuted && sounds.current && sounds.current[sound]) {
            const s = sounds.current[sound];
            if (s.name === 'Synth') s.triggerAttackRelease("C5", "8n");
            if (s.name === 'NoiseSynth') s.triggerAttackRelease("2n");
        }
    };
    
    const handleMuteToggle = async () => {
        const Tone = await import('tone');
        await Tone.start();
        setIsMuted(m => !m);
    };

    // Data fetching and subscriptions
    useEffect(() => {
        if (!firebaseUser || !appUser) return;
        const petGameCollectionName = 'pet-game-data';

        const petDocRef = doc(firestore, 'users', firebaseUser.uid, petGameCollectionName, 'data');
        const unsubPet = onSnapshot(petDocRef, (snap) => {
            if (snap.exists()) {
                setPetData(snap.data() as PetData);
            } else {
                const initialData: PetData = { name: appUser.petName || "Buddy", energy: 50, gems: 5, adventureLog: ["Your new pet is ready for an adventure!"] };
                setDoc(petDocRef, initialData).then(() => {
                    setPetData(initialData);
                    setDialogue(`Welcome! I'm so happy to see you.`);
                });
            }
        });

        const tasksCollectionRef = collection(firestore, 'users', firebaseUser.uid, petGameCollectionName, 'tasks');
        const unsubTasks = onSnapshot(tasksCollectionRef, qSnap => {
            setTasks(qSnap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<PetTask, 'id'>) })));
        });

        return () => {
            unsubPet();
            unsubTasks();
        };
    }, [firebaseUser, appUser]);
    
    const { name: petName, energy, gems, adventureLog } = petData || {};

    const moodText = useMemo(() => {
        if (!petData) return "Loading...";
        if (energy! >= 100) return "Energetic";
        if (energy! >= 50) return "Happy";
        if (energy! > 0) return "Okay";
        return "Tired";
    }, [energy, petData]);

    // Game Actions
    const handleAddTask = async () => {
        if (newTask.trim() !== "" && firebaseUser) {
            setDialogue("A new goal! We can do it!");
            await addDoc(collection(firestore, 'users', firebaseUser.uid, 'pet-game-data', 'tasks'), { text: newTask.trim(), completed: false });
            setNewTask("");
        }
    };

    const handleToggleTask = async (task: PetTask) => {
        if (!task.completed && firebaseUser && petData) {
            playSound('complete');
            playSound('gem');
            setDialogue("We did it! Go us!");
            await updateDoc(doc(firestore, 'users', firebaseUser.uid, 'pet-game-data', 'tasks', task.id), { completed: true });
            await updateDoc(doc(firestore, 'users', firebaseUser.uid, 'pet-game-data', 'data'), { energy: petData.energy + 25, gems: petData.gems + 1 });
        }
    };

    const handleGoOnAdventure = async () => {
        if (firebaseUser && petData && petData.energy >= 50) {
            playSound('adventure');
            setDialogue("I'm going on an adventure!");
            const newEnergy = petData.energy - 50;
            const location = adventureLocations[Math.floor(Math.random() * adventureLocations.length)];
            const discoveries = ["I found a cool stick!", "I chased a squirrel.", "I took a nap in a sunbeam."];
            const newDiscovery = discoveries[Math.floor(Math.random() * discoveries.length)];
            setTimeout(() => setDialogue(`I'm back from ${location}! ${newDiscovery}`), 3000);
            await updateDoc(doc(firestore, 'users', firebaseUser.uid, 'pet-game-data', 'data'), {
                energy: newEnergy,
                adventureLog: [`${petName} went to ${location} and ${newDiscovery.toLowerCase().replace('i ', '')}`, ...petData.adventureLog].slice(0, 20)
            });
        }
    };

    const handleNameUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (editingName.trim() && firebaseUser) {
            setDialogue(`I love my new name!`);
            await updateDoc(doc(firestore, 'users', firebaseUser.uid, 'pet-game-data', 'data'), { name: editingName.trim() });
        }
        setIsNameEditing(false);
    };

    if (!firebaseUser || !appUser || !petData) {
        return <div className="flex items-center justify-center h-screen bg-sky-200 text-slate-700 font-nunito"><Sparkles className="w-16 h-16 animate-pulse text-sky-500" /><h1 className="text-2xl font-bold ml-4">Waking up...</h1></div>;
    }

    const moodStyles = { Energetic: { color: "text-green-500", bgColor: "bg-green-100/80" }, Happy: { color: "text-sky-500", bgColor: "bg-sky-100/80" }, Okay: { color: "text-yellow-500", bgColor: "bg-yellow-100/80" }, Tired: { color: "text-slate-500", bgColor: "bg-slate-200/80" }, Loading: { color: "text-slate-500", bgColor: "bg-slate-200/80" } }[moodText];

    return (
        <div className="w-full h-full flex items-center justify-center bg-gray-800 font-nunito p-4">
            <div className="w-full max-w-sm h-[90vh] max-h-[800px] bg-gray-100 rounded-3xl shadow-2xl overflow-hidden relative flex flex-col">
                <GoogleFont />
                <RoomBackground />
                 <div className="absolute top-4 left-4 z-20"><button onClick={() => router.back()} className="bg-white/70 backdrop-blur-sm p-2 rounded-full shadow-sm"><ChevronDown className="rotate-90" /></button></div>
                <div className="absolute top-4 right-4 z-20 flex gap-2"><button onClick={handleMuteToggle} className="bg-white/70 backdrop-blur-sm p-2 rounded-full shadow-sm">{isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}</button><div className="bg-white/70 backdrop-blur-sm p-2 px-3 rounded-full flex items-center gap-2 shadow-sm"><Gem size={20} className="text-pink-500" /><span className="font-bold text-lg">{gems}</span></div></div>

                <main className="flex-1 flex flex-col justify-between items-center text-center p-4 pt-8 z-10">
                    <div className="w-full">
                        {isNameEditing ? (<form onSubmit={handleNameUpdate}><input type="text" value={editingName} onChange={(e) => setEditingName(e.target.value)} className="bg-white/70 text-center text-2xl font-extrabold rounded-lg p-2 -m-2" autoFocus onBlur={handleNameUpdate} /></form>) : (<h1 onClick={() => { setIsNameEditing(true); setEditingName(petName!); }} className="text-2xl font-extrabold cursor-pointer p-2 -m-2 rounded-lg hover:bg-white/50 transition-colors">{petName}</h1>)}
                        <p className={`mt-1 font-bold px-3 py-1 rounded-full text-sm inline-block ${moodStyles.bgColor} ${moodStyles.color}`}>Mood: {moodText}</p>
                    </div>

                    <div className="relative flex flex-col items-center">
                        <DialogueBubble text={dialogue} />
                        <PetAvatar onPet={() => playSound('pet')} setDialogue={setDialogue} />
                    </div>

                    <div className="w-full">
                        <div className="bg-white/80 backdrop-blur-sm p-2 px-4 rounded-full flex items-center justify-center gap-2 shadow-md mb-4 max-w-xs mx-auto"><Zap size={18} className="text-amber-500" /><span className="font-bold text-lg">{energy}</span><span className="text-sm text-slate-600">Energy</span></div>
                        <button onClick={handleGoOnAdventure} disabled={energy! < 50} className="w-full max-w-xs mx-auto flex items-center justify-center gap-2 bg-pink-500 hover:bg-pink-600 disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-full transition-all duration-300 shadow-lg hover:shadow-pink-500/40 transform hover:-translate-y-1"><Feather size={20} /><span>Go on Adventure (50)</span></button>
                    </div>
                </main>

                <footer className={`absolute bottom-0 left-0 right-0 w-full transition-all duration-500 ${showPanel ? 'translate-y-0' : 'translate-y-[calc(100%-4rem)]'} z-20`}>
                    <button onClick={() => setShowPanel(!showPanel)} className="w-full bg-white/50 backdrop-blur-lg py-4 rounded-t-2xl shadow-2xl flex items-center justify-center gap-2 font-bold text-lg hover:bg-white/80 transition-colors"><span>Menu</span><ChevronDown className={`transition-transform ${showPanel ? 'rotate-180' : ''}`} /></button>
                    <div className="bg-gradient-to-b from-white/90 to-white/80 backdrop-blur-lg p-4 h-64 overflow-y-auto flex flex-col">
                        <div className="flex border-b border-slate-200 mb-4 justify-center">
                            <button onClick={() => setActiveTab('tasks')} className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 font-semibold transition-colors ${activeTab === 'tasks' ? 'text-green-600 border-b-2 border-green-500' : 'text-slate-500 hover:text-slate-800'}`}><ClipboardList size={18} /> Goals</button>
                            <button onClick={() => setActiveTab('adventures')} className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 font-semibold transition-colors ${activeTab === 'adventures' ? 'text-sky-600 border-b-2 border-sky-500' : 'text-slate-500 hover:text-slate-800'}`}><BookOpen size={18} /> Log</button>
                        </div>
                        {activeTab === 'tasks' && (<><div className="flex gap-2 mb-4"><input type="text" value={newTask} onChange={(e) => setNewTask(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleAddTask()} placeholder="Add a new self-care goal..." className="flex-grow bg-slate-100 rounded-full p-3 px-5 focus:outline-none focus:ring-2 focus:ring-green-500" /><button onClick={handleAddTask} className="bg-green-500 hover:bg-green-600 text-white font-bold p-3 rounded-full transition-colors flex items-center justify-center shadow-md hover:shadow-lg"><Plus size={24} /></button></div><div className="flex-grow overflow-y-auto pr-2 space-y-2">{tasks.length > 0 ? tasks.map(task => (<div key={task.id} className={`flex items-center gap-3 p-3 rounded-xl transition-all relative overflow-hidden ${task.completed ? 'bg-slate-200 text-slate-400' : 'bg-green-100'}`}><button onClick={() => handleToggleTask(task)} disabled={task.completed} className="relative z-10"><CheckCircle className={`${task.completed ? 'text-green-500' : 'text-slate-400 opacity-0'}`} size={24} /><Circle className={`absolute top-0 left-0 ${task.completed ? 'opacity-0' : 'text-slate-400 hover:text-green-500'}`} size={24} /></button><p className={`relative z-10 flex-grow ${task.completed ? 'line-through' : ''}`}>{task.text}</p></div>)) : (<div className="text-center py-10 text-slate-500"><p>Add a goal to give {petName} energy!</p></div>)}</div></>)}
                        {activeTab === 'adventures' && (<div className="flex-grow overflow-y-auto pr-2 space-y-3">{adventureLog?.length > 0 ? adventureLog.map((log, index) => (<div key={index} className="flex items-start gap-3 p-3 bg-sky-100/70 rounded-xl"><Feather className="text-sky-500 mt-1 flex-shrink-0" size={18} /><p>{log}</p></div>)) : <div className="text-center py-10 text-slate-500"><p>The adventure log is empty.</p></div>}</div>)}
                    </div>
                </footer>
            </div>
            <style>{`
                @keyframes pet-wiggle { 0% {transform: rotate(0deg);} 25% {transform: rotate(-8deg);} 75% {transform: rotate(8deg);} 100% {transform: rotate(0deg);}} .animate-pet-wiggle { animation: pet-wiggle 0.5s ease-in-out; }
                @keyframes float-up { from { transform: translateY(0) scale(0.5); opacity: 1; } to { transform: translateY(-50px) scale(1.5); opacity: 0; } } .animate-float-up { animation: float-up 0.7s ease-out forwards; }
                @keyframes fade-in-up { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } } .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; }
            `}</style>
        </div>
    );
}
