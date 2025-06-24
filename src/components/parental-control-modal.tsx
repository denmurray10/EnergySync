
"use client";

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShieldCheck, LoaderCircle } from "lucide-react";
import { useToast } from '@/hooks/use-toast';

type ParentalControlModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'set' | 'verify';
  correctPin: string | null | undefined;
  onPinSet: (pin: string) => void;
  onPinVerified: () => void;
};

export function ParentalControlModal({
  open,
  onOpenChange,
  mode,
  correctPin,
  onPinSet,
  onPinVerified,
}: ParentalControlModalProps) {
  const { toast } = useToast();
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setPin('');
      setConfirmPin('');
      setError(null);
    }
  }, [open]);

  const handleSetPin = () => {
    if (pin.length !== 4) {
      setError("PIN must be 4 digits.");
      return;
    }
    if (pin !== confirmPin) {
      setError("PINs do not match.");
      return;
    }
    onPinSet(pin);
    onOpenChange(false);
  };

  const handleVerifyPin = () => {
    if (pin === correctPin) {
      onPinVerified();
    } else {
      setError("Incorrect PIN. Please try again.");
      toast({
        title: "Incorrect PIN",
        description: "The PIN you entered is incorrect.",
        variant: "destructive",
      });
      setPin('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card/95 backdrop-blur-lg">
        <DialogHeader className="text-center items-center">
          <div className="p-3 rounded-full bg-primary/10 mb-2">
            <ShieldCheck className="w-8 h-8 text-primary" />
          </div>
          <DialogTitle className="text-2xl">
            {mode === 'set' ? "Set Parental PIN" : "Enter Parental PIN"}
          </DialogTitle>
          <DialogDescription>
            {mode === 'set'
              ? "Create a 4-digit PIN to protect settings."
              : "Enter the 4-digit PIN to unlock settings."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Input
            type="password"
            maxLength={4}
            placeholder="****"
            value={pin}
            onChange={(e) => {
              setError(null);
              setPin(e.target.value.replace(/\D/g, ''));
            }}
            className="text-center text-2xl tracking-[1em]"
          />
          {mode === 'set' && (
            <Input
              type="password"
              maxLength={4}
              placeholder="Confirm ****"
              value={confirmPin}
              onChange={(e) => {
                setError(null);
                setConfirmPin(e.target.value.replace(/\D/g, ''));
              }}
              className="text-center text-2xl tracking-[1em]"
            />
          )}
          {error && <p className="text-sm font-medium text-destructive text-center">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={mode === 'set' ? handleSetPin : handleVerifyPin}>
            {mode === 'set' ? "Set PIN" : "Unlock"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
