
"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getRechargeRecommendations,
  RechargeRecommendationsOutput,
  RechargeRecommendationsInput,
} from "@/ai/flows/personalized-recharge-recommendations";
import { getGuidedRechargeScript } from "@/ai/flows/guided-recharge-flow";
import { textToSpeech } from "@/ai/flows/text-to-speech-flow";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import type { Activity } from "@/lib/types";
import { LoaderCircle, Plus, Sparkles, Star, Zap, ChevronLeft, Volume2, Waves } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { suggestRechargeDetails } from "@/ai/flows/suggest-recharge-details";
import { ProFeatureWrapper } from "@/components/pro-feature-wrapper";


const customRechargeSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters."),
    impact: z.number().min(5).max(50),
    duration: z.coerce.number().min(5, "Duration must be at least 5 minutes."),
    emoji: z.string().min(1, "Please add an emoji.").max(2, "Please use only one emoji."),
});

type CustomRechargeFormValues = z.infer<typeof customRechargeSchema>;

type RechargeModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  handleRecharge: (rechargeAmount: number, debtReduction: number) => void;
  activities: RechargeRecommendationsInput['activities'];
  currentEnergy: number;
  onCustomRecharge: (data: Omit<Activity, 'id' | 'date' | 'autoDetected' | 'recoveryTime'>) => void;
  onLogActivity: (data: Omit<Activity, 'id' | 'date' | 'autoDetected' | 'recoveryTime'>) => void;
  isProMember: boolean;
  ageGroup: 'under14' | '14to17' | 'over18' | null;
};

const guidedSessions = [
  { type: "Breathing", duration: 3, impact: 15, emoji: '🧘' },
  { type: "Mindfulness", duration: 5, impact: 20, emoji: '🧠' },
  { type: "Visualization", duration: 5, impact: 25, emoji: '🏞️' },
];

export function RechargeModal({
  open,
  onOpenChange,
  handleRecharge,
  activities,
  currentEnergy,
  onCustomRecharge,
  onLogActivity,
  isProMember,
  ageGroup,
}: RechargeModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [recommendations, setRecommendations] = useState<RechargeRecommendationsOutput>([]);
  const [view, setView] = useState<'recommendations' | 'custom'>('recommendations');
  const [guidedState, setGuidedState] = useState({
      isFetchingScript: false,
      isFetchingAudio: false,
      isPlaying: false,
      script: '',
      audioSrc: '',
      currentSession: null as typeof guidedSessions[0] | null,
  });
  const audioRef = useRef<HTMLAudioElement>(null);


  const form = useForm<CustomRechargeFormValues>({
    resolver: zodResolver(customRechargeSchema),
    defaultValues: {
      name: "",
      impact: 20,
      duration: 15,
      emoji: "🧘",
    },
  });

  const resetAll = () => {
    setView('recommendations');
    form.reset();
    setIsSuggesting(false);
    setGuidedState({
        isFetchingScript: false, isFetchingAudio: false, isPlaying: false, script: '', audioSrc: '', currentSession: null,
    });
    if(audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
    }
  }

  useEffect(() => {
    if (open && view === 'recommendations') {
      if (isProMember) {
        setLoading(true);
        const fetchRecommendations = async () => {
          try {
            const input = { activities, currentEnergy };
            const result = await getRechargeRecommendations(input);
            const sortedResult = result.sort((a, b) => b.expectedImpact - a.expectedImpact);
            setRecommendations(sortedResult);
          } catch (error) {
            console.error("Failed to get recommendations:", error);
            setRecommendations([]);
          } finally {
            setLoading(false);
          }
        };
        fetchRecommendations();
      } else {
          setRecommendations([]);
          setLoading(false);
      }
    }
  }, [open, view, activities, currentEnergy, isProMember]);

  const onRechargeSelect = (activity: RechargeRecommendationsOutput[0]) => {
    handleRecharge(activity.expectedImpact, activity.expectedImpact);
    resetAll();
    onOpenChange(false);
  };

  function onSubmit(data: CustomRechargeFormValues) {
    onCustomRecharge({
      ...data,
      type: 'recharge',
      location: 'Custom',
    });
    resetAll();
  }

  const handleSuggestDetails = async () => {
    const activityName = form.getValues("name");
    if (!activityName || activityName.length < 3) {
      toast({ title: "💡 Enter a Name First", description: "Please type an activity name.", variant: "default" });
      return;
    }
    setIsSuggesting(true);
    try {
      const suggestions = await suggestRechargeDetails({ name: activityName });
      if (suggestions) {
        form.setValue("impact", suggestions.impact, { shouldValidate: true });
        form.setValue("duration", suggestions.duration, { shouldValidate: true });
        form.setValue("emoji", suggestions.emoji, { shouldValidate: true });
        toast({ title: "🤖 Details Auto-filled!", description: "Your helper has suggested details." });
      }
    } catch (error) {
      console.error("Failed to get suggestions:", error);
      toast({ title: "❌ Error", description: "Could not fetch suggestions.", variant: "destructive" });
    } finally {
      setIsSuggesting(false);
    }
  };
  
  const handlePlayGuided = async (session: typeof guidedSessions[0]) => {
    setGuidedState(s => ({ ...s, currentSession: session, isFetchingScript: true }));
    try {
      const { script } = await getGuidedRechargeScript({ type: session.type as any, duration: session.duration });
      setGuidedState(s => ({ ...s, script, isFetchingScript: false, isFetchingAudio: true }));
      
      const { media } = await textToSpeech(script);
      setGuidedState(s => ({ ...s, audioSrc: media, isFetchingAudio: false }));

      if (audioRef.current) {
        audioRef.current.src = media;
        audioRef.current.play();
        setGuidedState(s => ({ ...s, isPlaying: true }));
      }
    } catch (e) {
        console.error("Failed to play guided session", e);
        toast({ title: "Error", description: "Could not start the guided session.", variant: "destructive" });
        resetAll();
    }
  };
  
  const handleAudioEnded = () => {
    if (guidedState.currentSession) {
        onLogActivity({
            name: `Guided: ${guidedState.currentSession.type}`,
            type: 'recharge',
            impact: guidedState.currentSession.impact,
            duration: guidedState.currentSession.duration,
            emoji: guidedState.currentSession.emoji,
            location: 'Guided Session'
        });
        handleRecharge(guidedState.currentSession.impact, guidedState.currentSession.impact);
    }
    resetAll();
    onOpenChange(false);
  };

  const recommendationsTitle = ageGroup === 'under14' ? "YOUR PET'S SUGGESTIONS" : "AI RECOMMENDATIONS";
  const autoFillText = ageGroup === 'under14' ? "Ask Pet" : "Auto-fill";

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
        if (!isOpen) resetAll();
        onOpenChange(isOpen);
    }}>
      <DialogContent className="bg-card/95 backdrop-blur-lg max-h-[80vh] flex flex-col">
        <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                {view === 'custom' ? 'Custom Recharge' : 'Personalised Recharge'}
            </DialogTitle>
             <DialogDescription>
                {view === 'custom' ? 'Log a custom recharge activity.' : 'Choose an option to boost your energy.'}
            </DialogDescription>
        </DialogHeader>
        <audio ref={audioRef} onEnded={handleAudioEnded} className="hidden" />
        <div className="flex-grow overflow-y-auto custom-scrollbar pr-2 -mr-2">
            {view === 'recommendations' && (
                <div className="space-y-4">
                    <h3 className="font-semibold text-muted-foreground text-sm">GUIDED SESSIONS</h3>
                    <ProFeatureWrapper isPro={isProMember}>
                         <div className="space-y-2">
                            {guidedSessions.map((session) => (
                                <button
                                    key={session.type}
                                    onClick={() => handlePlayGuided(session)}
                                    disabled={!isProMember || Object.values(guidedState).some(Boolean)}
                                    className="w-full p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-2xl hover:border-purple-300 transition-all duration-300 text-left"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <span className="text-3xl">{session.emoji}</span>
                                            <div>
                                                <p className="font-semibold text-gray-800">{session.type}</p>
                                                <p className="text-sm text-gray-600">{session.duration} minutes</p>
                                            </div>
                                        </div>
                                         <div className="text-purple-600 font-bold text-lg">
                                            +{session.impact}%
                                        </div>
                                    </div>
                                     {(guidedState.currentSession?.type === session.type) && (
                                        <div className="mt-2 text-center text-sm text-purple-700 font-semibold flex items-center justify-center">
                                           {guidedState.isFetchingScript && <><LoaderCircle className="animate-spin h-4 w-4 mr-2" /> Generating script...</>}
                                           {guidedState.isFetchingAudio && <><LoaderCircle className="animate-spin h-4 w-4 mr-2" /> Generating audio...</>}
                                           {guidedState.isPlaying && <><Waves className="h-4 w-4 mr-2" /> Playing...</>}
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </ProFeatureWrapper>
                    
                    <h3 className="font-semibold text-muted-foreground text-sm pt-2">{recommendationsTitle}</h3>
                     <ProFeatureWrapper isPro={isProMember}>
                        {loading ? (
                            Array.from({ length: 2 }).map((_, index) => (
                            <div key={index} className="flex items-center space-x-4 p-4 rounded-2xl border-2">
                                <Skeleton className="h-12 w-12 rounded-full" />
                                <div className="space-y-2 flex-grow"><Skeleton className="h-4 w-4/5" /><Skeleton className="h-4 w-3/5" /></div>
                            </div>))
                        ) : recommendations.length > 0 ? (
                            recommendations.map((activity, index) => (
                            <button key={index} onClick={() => onRechargeSelect(activity)} className="w-full p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl hover:border-green-300 transition-all text-left">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <span className="text-3xl">{activity.emoji}</span>
                                        <div>
                                            <p className="font-semibold text-gray-800">{activity.name}</p>
                                            <p className="text-sm text-gray-600">{activity.duration} minutes</p>
                                        </div>
                                    </div>
                                    <div className="text-green-600 font-bold text-lg">+{activity.expectedImpact}%</div>
                                </div>
                            </button>
                            ))
                        ) : <p className="text-center text-muted-foreground py-4 text-sm">No specific recommendations right now.</p>}
                    </ProFeatureWrapper>
                </div>
            )}
            {view === 'custom' && (
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem>
                                <div className="flex justify-between items-center">
                                <FormLabel>Activity Name</FormLabel>
                                 <ProFeatureWrapper isPro={isProMember}>
                                    <Button type="button" size="sm" variant="ghost" onClick={handleSuggestDetails} disabled={isSuggesting || !isProMember}>
                                        {isSuggesting ? <LoaderCircle className="animate-spin" /> : <Sparkles className="text-yellow-500" />}
                                        <span className="ml-2">{autoFillText}</span>
                                    </Button>
                                 </ProFeatureWrapper>
                                </div>
                                <FormControl><Input placeholder="e.g., Deep breathing" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}/>
                        <FormField control={form.control} name="emoji" render={({ field }) => (
                            <FormItem><FormLabel>Emoji</FormLabel><FormControl><Input placeholder="e.g., 🧘" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="impact" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Energy Boost: <span className="font-bold text-primary">+{field.value}%</span></FormLabel>
                                <FormControl><Slider min={5} max={50} step={5} value={[field.value]} onValueChange={(value) => field.onChange(value[0])} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}/>
                        <FormField control={form.control} name="duration" render={({ field }) => (
                            <FormItem><FormLabel>Duration (minutes)</FormLabel><FormControl><Input type="number" placeholder="e.g., 15" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                    </form>
                </Form>
            )}
        </div>

        <DialogFooter className="pt-4 gap-2 sm:justify-between">
            {view === 'custom' ? (
                <>
                    <Button type="button" variant="ghost" onClick={() => setView('recommendations')}><ChevronLeft className="mr-2 h-4 w-4"/> Back to suggestions</Button>
                    <Button type="button" onClick={form.handleSubmit(onSubmit)}><Zap className="mr-2 h-4 w-4"/>Recharge Now</Button>
                </>
            ) : (
                 <>
                    <Button variant="outline" onClick={() => setView('custom')}><Plus className="mr-2 h-4 w-4" /> Add Custom</Button>
                    <Button variant="secondary" onClick={() => onOpenChange(false)}>Close</Button>
                </>
            )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
