"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { QrCode, Camera } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import QRCode from "react-qr-code";
import type { User } from "@/lib/types";
import { Html5Qrcode } from "html5-qrcode";
import { useToast } from "@/hooks/use-toast";

type QRCodeModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onScanComplete: (scannedUserId: string) => void;
};

export function QRCodeModal({ open, onOpenChange, user, onScanComplete }: QRCodeModalProps) {
  const { toast } = useToast();
  const [isScanning, setIsScanning] = useState(false);
  const [scanner, setScanner] = useState<Html5Qrcode | null>(null);

  if (!user?.userId) return null;

  const startScanning = async () => {
    try {
      setIsScanning(true);
      const html5QrCode = new Html5Qrcode("qr-reader");
      setScanner(html5QrCode);

      const config = { fps: 10, qrbox: { width: 250, height: 250 } };

      await html5QrCode.start(
        { facingMode: "environment" },
        config,
        (decodedText) => {
          // Successfully scanned
          html5QrCode.stop().then(() => {
            setIsScanning(false);
            onScanComplete(decodedText);
            onOpenChange(false);
          });
        },
        (errorMessage) => {
          // Scan error - ignore, this fires frequently while scanning
        }
      );
    } catch (err) {
      console.error("Error starting scanner:", err);
      toast({
        title: "Camera Error",
        description: "Could not access camera. Please check permissions.",
        variant: "destructive",
      });
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    if (scanner) {
      scanner.stop().then(() => {
        setIsScanning(false);
        setScanner(null);
      });
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && isScanning) {
      stopScanning();
    }
    onOpenChange(newOpen);
  };

  // Encode user data as JSON for richer information
  const qrData = JSON.stringify({
    userId: user.userId,
    name: user.name,
    avatar: user.avatar || "",
  });

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-card/95 backdrop-blur-lg max-w-md">
        <DialogHeader className="text-center items-center">
          <div className="p-3 rounded-full bg-primary/10 mb-2">
            <QrCode className="w-8 h-8 text-primary" />
          </div>
          <DialogTitle className="text-2xl">Connect with Friends</DialogTitle>
          <DialogDescription>
            Share your QR code or scan a friend's code to connect.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="show" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="show" onClick={stopScanning}>
              <QrCode className="w-4 h-4 mr-2" />
              My Code
            </TabsTrigger>
            <TabsTrigger value="scan" onClick={startScanning}>
              <Camera className="w-4 h-4 mr-2" />
              Scan Code
            </TabsTrigger>
          </TabsList>

          <TabsContent value="show" className="space-y-4">
            <div className="p-4 bg-white rounded-2xl flex justify-center">
              <QRCode value={qrData} size={256} />
            </div>
            <p className="text-sm text-center text-muted-foreground">
              Have a friend scan this code to send you a friend request!
            </p>
          </TabsContent>

          <TabsContent value="scan" className="space-y-4">
            <div className="bg-white rounded-2xl p-4">
              <div id="qr-reader" className="w-full"></div>
            </div>
            {isScanning && (
              <div className="space-y-2">
                <p className="text-sm text-center text-muted-foreground">
                  Point your camera at a friend's QR code
                </p>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={stopScanning}
                >
                  Cancel Scanning
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
