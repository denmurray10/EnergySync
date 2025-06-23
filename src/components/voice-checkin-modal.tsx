"use client";

import { useState } from "react";
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
import { LoaderCircle } from "lucide-react";
import { analyzeCheckin, AnalyzeCheckinOutput } from "@/ai/flows/analyze-checkin-flow";
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
    try {
      const result = await analyzeCheckin({ checkInText: text });
      onCheckinComplete(result);
      setText(""); // Clear text on success
    } catch (e) {
      console.error("Failed to analyze check-in:", e);
      toast({
        title: "Error Analyzing Check-in",
        description: "Sorry, we couldn't analyze your message right now. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };


  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) {
        setText('');
        setIsAnalyzing(false);
      }
      onOpenChange(isOpen);
    }}>
      <DialogContent className="bg-card/95 backdrop-blur-lg">
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            AI Voice Check-in
          </DialogTitle>
          <DialogDescription>
            Tell me how you're feeling, and I'll log your energy.
            <br/>
            e.g., "I'm feeling great!" or "I'm exhausted."
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
            <Textarea
                placeholder="Type or speak how you feel..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={4}
                disabled={isAnalyzing}
            />
        </div>
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full"
            disabled={isAnalyzing}
          >
            Cancel
          </Button>
           <Button
            onClick={handleAnalyze}
            className="w-full"
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
                <>
                 <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                 Analyzing...
                </>
            ) : "Log My Energy"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
