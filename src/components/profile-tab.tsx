"use client";

import type { User } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, Film, Star, BookOpen, Crown } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ProFeatureWrapper } from "./pro-feature-wrapper";

type ProfileTabProps = {
  user: User | null;
  isProMember: boolean;
  onLogout: () => void;
  onShowTutorial: () => void;
  onShowDebrief: () => void;
  onTierChange: (tier: 'free' | 'pro') => void;
};

export function ProfileTab({ user, isProMember, onLogout, onShowTutorial, onShowDebrief, onTierChange }: ProfileTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center space-y-4 pt-4">
        <Avatar className="h-24 w-24 border-4 border-primary">
          <AvatarImage src={`https://placehold.co/100x100.png`} data-ai-hint="profile picture" />
          <AvatarFallback className="text-4xl bg-muted">
            {user?.name?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <h2 className="text-3xl font-bold">{user?.name}</h2>
      </div>

      <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <Crown className="text-yellow-500 mr-3" />
            Membership
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup 
            value={user?.membershipTier} 
            onValueChange={(value: 'free' | 'pro') => onTierChange(value)}
            className="space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="free" id="free" />
              <Label htmlFor="free">Free</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="pro" id="pro" />
              <Label htmlFor="pro">Pro</Label>
            </div>
          </RadioGroup>
          <p className="text-sm text-muted-foreground mt-4">
            {isProMember ? "You have access to all AI features!" : "Upgrade to Pro to unlock all AI features."}
          </p>
        </CardContent>
      </Card>
      
      <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader>
            <CardTitle>Settings & Reports</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
             <Button onClick={onShowTutorial} variant="outline" className="w-full justify-start">
                <Film className="mr-2 h-4 w-4" />
                Re-watch Tutorial
            </Button>
            <ProFeatureWrapper isPro={isProMember}>
                <Button onClick={onShowDebrief} variant="outline" className="w-full justify-start">
                    <BookOpen className="mr-2 h-4 w-4" />
                    Yesterday's Debrief
                </Button>
            </ProFeatureWrapper>
            <Button onClick={onLogout} variant="destructive" className="w-full justify-start">
                <LogOut className="mr-2 h-4 w-4" />
                Log Out
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}
