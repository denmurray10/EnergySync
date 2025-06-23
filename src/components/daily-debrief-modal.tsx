
"use client";

import { useState, useRef } from "react";
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
import { BookOpen, LoaderCircle, Volume2 } from "lucide-react";
import { textToSpeech } from "@/ai/flows/text-to-speech-flow";
import { useToast } from "@/hooks/use-toast";

type DailyDebriefModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  story: string | null;
  loading: boolean;
  isProMember: boolean;
  ageGroup: 'under14' | 'over14' | null;
};

export function DailyDebriefModal({ open, onOpenChange, story, loading, isProMember, ageGroup }: DailyDebriefModalProps) {
  const { toast } = useToast();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleListen = async () => {
    if (!story || !isProMember) return;
    setIsSpeaking(true);
    try {
        const { media } = await textToSpeech(story);
        if (audioRef.current) {
            audioRef.current.src = media;
            audioRef.current.play();
        }
    } catch (error) {
        console.error("Failed to generate audio:", error);
        toast({
            title: "Audio Failed",
            description: "Could not generate the audio debrief.",
            variant: "destructive"
        });
        setIsSpeaking(false);
    }
  };

  const handleAudioEnded = () => {
    setIsSpeaking(false);
  };

  const description = ageGroup === 'under14'
    ? "Here's the story of your energy from yesterday, told by your pet."
    : "Here's the AI-generated story of your energy from yesterday.";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card/95 backdrop-blur-lg">
        <DialogHeader className="text-center items-center">
          <div className="p-3 rounded-full bg-primary/10 mb-2">
            <BookOpen className="w-8 h-8 text-primary" />
          </div>
          <DialogTitle>Your Daily Debrief</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <audio ref={audioRef} onEnded={handleAudioEnded} className="hidden" />
        <div className="my-4 p-4 bg-muted/50 rounded-lg min-h-[120px]">
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ) : (
            <p className="text-card-foreground leading-relaxed">{story}</p>
          )}
        </div>
        <DialogFooter className="gap-2 sm:flex-row">
            <Button onClick={() => onOpenChange(false)} variant="secondary" className="w-full">
                Close
            </Button>
            <Button onClick={handleListen} className="w-full" disabled={loading || isSpeaking || !isProMember || !story}>
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
