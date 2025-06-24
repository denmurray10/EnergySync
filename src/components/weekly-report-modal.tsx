
"use client";

import { useMemo, useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Activity } from "@/lib/types";
import { LoaderCircle, Volume2 } from 'lucide-react';
import { textToSpeech } from '@/ai/flows/text-to-speech-flow';
import { useToast } from '@/hooks/use-toast';

type WeeklyReportModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activities: Activity[];
  isProMember: boolean;
  ageGroup: 'under14' | '14to17' | 'over18' | null;
};

export function WeeklyReportModal({
  open,
  onOpenChange,
  activities,
  isProMember,
  ageGroup,
}: WeeklyReportModalProps) {
  const { toast } = useToast();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
    
  const { reportData, summaryText } = useMemo(() => {
    const totalDrain = activities
      .filter((a) => a.impact < 0)
      .reduce((sum, a) => sum + a.impact, 0);
      
    const totalRecharge = activities
      .filter((a) => a.impact > 0)
      .reduce((sum, a) => sum + a.impact, 0);

    const rechargers = activities.filter(a => a.impact > 0);
    const mvpRecharge = rechargers.length > 0 
        ? rechargers.reduce((max, act) => (act.impact > max.impact ? act : max))
        : null;

    let text = `Here is your weekly report. Your total energy drained was ${Math.abs(totalDrain)} percent, and you recharged a total of ${totalRecharge} percent. `;
    if (mvpRecharge) {
        text += `Your most valuable recharge activity this week was ${mvpRecharge.name}. Keep up the great work!`;
    } else {
        text += "Try to log more recharge activities next week!";
    }

    return { 
        reportData: { totalDrain, totalRecharge, mvpRecharge },
        summaryText: text,
    };
  }, [activities]);

  const handleListen = async () => {
    if (!summaryText || !isProMember) return;
    setIsSpeaking(true);
    try {
        const { media } = await textToSpeech(summaryText);
        if (audioRef.current) {
            audioRef.current.src = media;
            audioRef.current.play();
        }
    } catch (error) {
        console.error("Failed to generate audio:", error);
        toast({
            title: "Audio Failed",
            description: "Could not generate the audio report.",
            variant: "destructive"
        });
        setIsSpeaking(false);
    }
  };

  const handleAudioEnded = () => {
    setIsSpeaking(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card/95 backdrop-blur-lg max-h-[80vh]">
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Your Weekly Report
          </DialogTitle>
        </DialogHeader>
        <audio ref={audioRef} onEnded={handleAudioEnded} className="hidden" />
        <div className="space-y-6 text-center py-4">
          <div>
            <p className="text-5xl font-bold text-red-500">{reportData.totalDrain}%</p>
            <p className="text-sm text-muted-foreground">Total Energy Drained</p>
          </div>
          <div>
            <p className="text-5xl font-bold text-green-500">+{reportData.totalRecharge}%</p>
            <p className="text-sm text-muted-foreground">Total Energy Recharged</p>
          </div>
          {reportData.mvpRecharge && (
            <div className="pt-4">
              <p className="font-semibold text-card-foreground">This Week's MVP Recharge:</p>
              <p className="text-xl text-blue-600 font-semibold mt-1">
                {reportData.mvpRecharge.emoji} {reportData.mvpRecharge.name}
              </p>
            </div>
          )}
        </div>
        <DialogFooter className="gap-2 sm:flex-row">
           <Button onClick={() => onOpenChange(false)} variant="secondary" className="w-full">
                Great!
           </Button>
           <Button onClick={handleListen} className="w-full" disabled={isSpeaking || !isProMember}>
                {isSpeaking ? (
                    <LoaderCircle className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                    <Volume2 className="w-4 h-4 mr-2" />
                )}
                Listen
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
