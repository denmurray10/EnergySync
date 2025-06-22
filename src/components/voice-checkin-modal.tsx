"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type VoiceCheckinModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  simulateVoiceCheckIn: (energyChange: number, message: string) => void;
};

export function VoiceCheckinModal({
  open,
  onOpenChange,
  simulateVoiceCheckIn,
}: VoiceCheckinModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card/95 backdrop-blur-lg">
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Voice Check-in
          </DialogTitle>
          <DialogDescription>
            Select the phrase that best matches how you feel.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-4">
          <Button
            onClick={() =>
              simulateVoiceCheckIn(20, "+20% - Glad you're feeling great!")
            }
            className="w-full text-left p-4 h-auto justify-start bg-green-100 text-green-800 hover:bg-green-200"
            variant="secondary"
          >
            "I feel great today!"
          </Button>
          <Button
            onClick={() =>
              simulateVoiceCheckIn(-15, "-15% - Remember to take it easy.")
            }
            className="w-full text-left p-4 h-auto justify-start bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
            variant="secondary"
          >
            "I'm feeling a bit tired."
          </Button>
          <Button
            onClick={() =>
              simulateVoiceCheckIn(
                -30,
                "-30% - Consider a recharge activity."
              )
            }
            className="w-full text-left p-4 h-auto justify-start bg-red-100 text-red-800 hover:bg-red-200"
            variant="secondary"
          >
            "I'm totally drained and exhausted."
          </Button>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full"
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
