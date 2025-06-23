
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import QRCode from "react-qr-code";
import type { User } from "@/lib/types";
import { QrCode } from "lucide-react";

type QRCodeModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
};

export function QRCodeModal({ open, onOpenChange, user }: QRCodeModalProps) {
  if (!user?.userId) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card/95 backdrop-blur-lg">
        <DialogHeader className="text-center items-center">
          <div className="p-3 rounded-full bg-primary/10 mb-2">
              <QrCode className="w-8 h-8 text-primary"/>
          </div>
          <DialogTitle className="text-2xl">Connect with Me</DialogTitle>
          <DialogDescription>
            Have a friend scan this QR code to connect with you on EnergySync.
          </DialogDescription>
        </DialogHeader>
        <div className="p-4 bg-white rounded-2xl flex justify-center mt-4">
          <QRCode value={user.userId} size={256} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
