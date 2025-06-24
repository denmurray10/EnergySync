
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, Star } from "lucide-react";

type MembershipModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpgrade: () => void;
  currentTier: 'free' | 'pro';
};

const proFeatures = [
    "AI Energy Coach",
    "Proactive AI Suggestions",
    "Health Readiness Score",
    "Guided Audio Sessions",
    "AI-powered Activity Suggestions",
    "Image-based Check-ins",
    "Energy Forecast",
    "Energy Hotspot Analysis"
];

export function MembershipModal({ open, onOpenChange, onUpgrade, currentTier }: MembershipModalProps) {
  
  const handleUpgrade = () => {
    onUpgrade();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card/95 backdrop-blur-lg sm:max-w-lg">
        <DialogHeader className="text-center items-center">
            <div className="p-3 rounded-full bg-yellow-400/20 mb-2">
                <Star className="w-8 h-8 text-yellow-500 fill-yellow-500"/>
            </div>
          <DialogTitle className="text-2xl">Upgrade to Pro</DialogTitle>
          <DialogDescription>Unlock all features and get the most out of EnergySync.</DialogDescription>
        </DialogHeader>

        {currentTier === 'pro' ? (
            <div className="text-center py-8">
                <p className="font-semibold text-lg text-primary">You are already a Pro member!</p>
                <p className="text-muted-foreground mt-2">Thank you for your support.</p>
            </div>
        ) : (
             <div className="space-y-6 py-4">
                <Card className="border-primary ring-2 ring-primary bg-primary/5">
                    <CardHeader>
                        <CardTitle className="text-primary">Pro Plan</CardTitle>
                        <CardDescription>Get full access to all our advanced AI features.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            {proFeatures.map(feature => (
                                <li key={feature} className="flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>
                        <Tabs defaultValue="monthly" className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="monthly">Monthly</TabsTrigger>
                                <TabsTrigger value="yearly">Yearly (Save 17%)</TabsTrigger>
                            </TabsList>
                            <TabsContent value="monthly" className="text-center pt-4">
                                <p className="text-4xl font-bold">£4.99</p>
                                <p className="text-muted-foreground">per month</p>
                                <Button onClick={handleUpgrade} className="w-full mt-4">Choose Monthly Plan</Button>
                            </TabsContent>
                            <TabsContent value="yearly" className="text-center pt-4">
                                <p className="text-4xl font-bold">£49.99</p>
                                <p className="text-muted-foreground">per year</p>
                                <Button onClick={handleUpgrade} className="w-full mt-4">Choose Yearly Plan</Button>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        )}

      </DialogContent>
    </Dialog>
  );
}
