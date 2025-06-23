"use client";

import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { LoaderCircle, Volume2, Mic } from "lucide-react";
import { analyzeCheckin, AnalyzeCheckinOutput } from "@/ai/flows/analyze-checkin-flow";
import { textToSpeech } from "@/ai/flows/text-to-speech-flow";
import { useToast } from "@/hooks/use-toast";

type VoiceCheckinModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCheckinComplete: (result: AnalyzeCheckinOutput) => void;
};

export function VoiceCheckinModal({
  open,
  onOpenChange,
  onCheckinComplete,
}: VoiceCheckinModalProps) {
  const { toast } = useToast();
  const [text, setText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeCheckinOutput | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const resetState = () => {
      setText('');
      setIsAnalyzing(false);
      setIsSpeaking(false);
      setAnalysisResult(null);
  };
  
  const handleAnalyze = async () => {
    if (!text.trim()) {
      toast({
        title: "Please say something!",
        description: "Type how you're feeling into the text box.",
        variant: "destructive",
      });
      return;
    }
    
    setIsAnalyzing(true);
    setAnalysisResult(null);
    try {
      const result = await analyzeCheckin({ checkInText: text });
      setAnalysisResult(result);
      
      const { media } = await textToSpeech(result.responseForSpeech);
      
      if (audioRef.current) {
        audioRef.current.src = media;
        audioRef.current.play();
        setIsSpeaking(true);
      }

    } catch (e) {
      console.error("Failed to analyze check-in:", e);
      toast({
        title: "Error Analyzing Check-in",
        description: "Sorry, we couldn't analyze your message right now. Please try again.",
        variant: "destructive",
      });
      setIsAnalyzing(false);
    }
  };
  
  const handleAudioEnded = () => {
      setIsSpeaking(false);
      setIsAnalyzing(false);
  };

  const handleConfirm = () => {
    if (analysisResult) {
      onCheckinComplete(analysisResult);
    }
    resetState();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) {
        resetState();
      }
      onOpenChange(isOpen);
    }}>
      <DialogContent className="bg-card/95 backdrop-blur-lg">
        <DialogHeader className="text-center items-center">
            <div className="p-3 rounded-full bg-primary/10 mb-2">
                <Mic className="w-8 h-8 text-primary"/>
            </div>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            AI Voice Check-in
          </DialogTitle>
          <DialogDescription>
            Tell me how you're feeling, and I'll log your energy and respond.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
            <Textarea
                placeholder="e.g., I'm feeling great after a good night's sleep!"
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={4}
                disabled={isAnalyzing}
            />
            <audio ref={audioRef} onEnded={handleAudioEnded} className="hidden" />
        </div>
        
        {analysisResult && !isAnalyzing && (
            <div className="p-4 bg-muted rounded-lg text-center">
                <p className="font-semibold">"{analysisResult.summary}"</p>
                <p className="text-sm text-primary font-bold mt-2">Energy Impact: {analysisResult.energyImpact > 0 ? '+' : ''}{analysisResult.energyImpact}%</p>
            </div>
        )}

        <DialogFooter className="gap-2">
            {!analysisResult ? (
                <>
                    <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full" disabled={isAnalyzing}>Cancel</Button>
                    <Button onClick={handleAnalyze} className="w-full" disabled={isAnalyzing || !text.trim()}>
                        {isAnalyzing ? <><LoaderCircle className="mr-2 h-4 w-4 animate-spin" />Analyzing...</> : "Analyze My Mood"}
                    </Button>
                </>
            ) : (
                <>
                    <Button variant="outline" onClick={handleAnalyze} className="w-full" disabled={isAnalyzing}>
                        <Volume2 className="mr-2 h-4 w-4" /> Replay
                    </Button>
                    <Button onClick={handleConfirm} className="w-full" disabled={isAnalyzing}>
                        Confirm & Log
                    </Button>
                </>
            )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
