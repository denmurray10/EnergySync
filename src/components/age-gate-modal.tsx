
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
import { Zap } from "lucide-react";

type AgeGateModalProps = {
  open: boolean;
  onSelect: (group: 'under14' | 'over14') => void;
};

export function AgeGateModal({ open, onSelect }: AgeGateModalProps) {
  return (
    <Dialog open={open}>
      <DialogContent className="bg-card/95 backdrop-blur-lg sm:max-w-md" hideCloseButton>
        <DialogHeader className="text-center items-center pt-4">
          <div className="p-3 bg-primary/10 rounded-full mb-4">
            <Zap className="h-10 w-10 text-primary" />
          </div>
          <DialogTitle className="text-2xl">Welcome to EnergySync!</DialogTitle>
          <DialogDescription className="text-base px-4">
            To give you the best experience, please confirm your age group.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4 flex-col sm:flex-col sm:space-x-0 gap-3">
          <Button onClick={() => onSelect('over14')} size="lg" className="w-full">
            I am 14 or older
          </Button>
          <Button onClick={() => onSelect('under14')} size="lg" variant="secondary" className="w-full">
            I am under 14
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
