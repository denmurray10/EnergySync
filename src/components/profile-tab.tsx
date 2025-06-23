
"use client";

import type { User } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Film, Star, BookOpen, Crown, PawPrint, Users } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ProFeatureWrapper } from "@/components/pro-feature-wrapper";

type ProfileTabProps = {
  user: User | null;
  isProMember: boolean;
  ageGroup: 'under14' | 'over14' | null;
  onShowTutorial: () => void;
  onShowDebrief: () => void;
  onTierChange: (tier: 'free' | 'pro') => void;
  onTogglePet: (enabled: boolean) => void;
  onAgeGroupChange: (group: 'under14' | 'over14') => void;
};

export function ProfileTab({ user, isProMember, ageGroup, onShowTutorial, onShowDebrief, onTierChange, onTogglePet, onAgeGroupChange }: ProfileTabProps) {
  
  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center space-y-4 pt-4">
        <Avatar className="h-24 w-24 border-4 border-primary">
          <AvatarImage src={`https://placehold.co/100x100.png?text=${user.name.charAt(0)}`} data-ai-hint="profile picture" />
          <AvatarFallback className="text-4xl bg-muted">
            {user.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <h2 className="text-3xl font-bold">{user.name}</h2>
        {user.petEnabled && (
            <p className="font-semibold text-muted-foreground -mt-2">Pet Level: {user.petLevel}</p>
        )}
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
            value={user.membershipTier} 
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
            {isProMember ? "You have access to all AI features!" : "Upgrade to Pro to unlock all smart features."}
          </p>
        </CardContent>
      </Card>

      <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader>
            <CardTitle>Settings & Features</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            {ageGroup === 'over14' && (
              <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <Label htmlFor="pet-toggle" className="text-base flex items-center"><PawPrint className="mr-2 h-4 w-4" /> Pet Companion</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable or disable the virtual pet companion.
                  </p>
                </div>
                <Switch
                  id="pet-toggle"
                  checked={user.petEnabled}
                  onCheckedChange={onTogglePet}
                />
              </div>
            )}
             <div className="rounded-lg border p-3 shadow-sm">
                <div className="space-y-1.5">
                    <Label className="text-base flex items-center"><Users className="mr-2 h-4 w-4" /> Age Group</Label>
                    <p className="text-sm text-muted-foreground pb-2">
                        Select your age group for a tailored experience.
                    </p>
                </div>
                <RadioGroup 
                    value={ageGroup ?? 'over14'} 
                    onValueChange={(value) => onAgeGroupChange(value as 'under14' | 'over14')}
                    className="space-y-2 pt-2"
                >
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="under14" id="under14" />
                        <Label htmlFor="under14" className="font-normal">Under 14</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="over14" id="over14" />
                        <Label htmlFor="over14" className="font-normal">14 or Over</Label>
                    </div>
                </RadioGroup>
            </div>
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
        </CardContent>
      </Card>
    </div>
  );
}
