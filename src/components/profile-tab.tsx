
"use client";

import { useRef, ChangeEvent } from "react";
import type { User } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Film, Star, BookOpen, Crown, PawPrint, Users, Camera, QrCode, LogOut, ShieldCheck, LockKeyhole } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ProFeatureWrapper } from "@/components/pro-feature-wrapper";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

type ProfileTabProps = {
  user: User | null;
  isProMember: boolean;
  ageGroup: 'under14' | '14to17' | 'over18' | null;
  onShowTutorial: () => void;
  onShowDebrief: () => void;
  onTierChange: (tier: 'free' | 'pro') => void;
  onTogglePet: (enabled: boolean) => void;
  onAgeGroupChange: (group: 'under14' | '14to17' | 'over18') => void;
  onUpdateUser: (updatedData: Partial<User>) => void;
  openModal: (modalName: string) => void;
  isParentModeUnlocked: boolean;
};

export function ProfileTab({ user, isProMember, ageGroup, onShowTutorial, onShowDebrief, onTierChange, onTogglePet, onAgeGroupChange, onUpdateUser, openModal, isParentModeUnlocked }: ProfileTabProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { signOut } = useAuth();
  const router = useRouter();

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUri = e.target?.result as string;
        onUpdateUser({ avatar: dataUri });
      };
      reader.readAsDataURL(file);
    }
  };

  if (!user) return null;
  
  const areSettingsLocked = !!user.parentalPin && !isParentModeUnlocked;

  const handleParentalClick = () => {
    if (isParentModeUnlocked) {
      router.push('/parent-dashboard');
    } else {
      openModal('parentalControls');
    }
  };

  return (
    <div className="space-y-6">
       <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
      <div className="flex flex-col items-center space-y-4 pt-4">
        <div className="relative group">
            <Avatar className="h-24 w-24 border-4 border-primary">
                <AvatarImage src={user.avatar || 'https://placehold.co/100x100.png'} data-ai-hint="profile picture" />
                <AvatarFallback className="text-4xl bg-muted">
                {user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
            </Avatar>
            <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                aria-label="Upload profile picture"
            >
                <Camera className="h-8 w-8 text-white" />
            </button>
        </div>
        <h2 className="text-3xl font-bold">{user.name}</h2>
        {user.petEnabled && (
            <p className="font-semibold text-muted-foreground -mt-2">Pet Level: {user.petLevel}</p>
        )}
      </div>
      
      {ageGroup !== 'over18' && (
       <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <ShieldCheck className="text-green-500 mr-3" />
            Parent Dashboard
          </CardTitle>
          <CardDescription>
            {user.parentalPin ? "Unlock with your PIN to manage features and view activity." : "Set a PIN to access the parent dashboard and receive updates."}
          </CardDescription>
        </CardHeader>
        <CardContent>
            <Button onClick={handleParentalClick} className="w-full">
               {user.parentalPin ? (isParentModeUnlocked ? "Go to Dashboard" : "Unlock Dashboard") : "Set Up Parental Controls"}
            </Button>
        </CardContent>
      </Card>
      )}


      {ageGroup === 'over18' && (
        <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader>
            <CardTitle className="flex items-center text-xl">
                <Crown className="text-yellow-500 mr-3" />
                Membership
            </CardTitle>
            {areSettingsLocked && <CardDescription>Enter Parent PIN to change membership.</CardDescription>}
            </CardHeader>
            <CardContent>
                {areSettingsLocked ? (
                    <div className="flex items-center justify-center p-4 bg-muted rounded-lg text-muted-foreground">
                        <LockKeyhole className="mr-2 h-4 w-4"/> Locked
                    </div>
                ) : (
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
                )}
            </CardContent>
        </Card>
      )}

      <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader>
            <CardTitle>Settings & Features</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            {ageGroup !== 'under14' && (
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
                 {areSettingsLocked ? (
                    <div className="flex items-center justify-center p-4 bg-muted rounded-lg text-muted-foreground">
                        <LockKeyhole className="mr-2 h-4 w-4"/> Locked
                    </div>
                ) : (
                    <RadioGroup 
                        value={ageGroup ?? '14to17'} 
                        onValueChange={(value) => onAgeGroupChange(value as 'under14' | '14to17' | 'over18')}
                        className="space-y-2 pt-2"
                    >
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="under14" id="under14" />
                            <Label htmlFor="under14" className="font-normal">Under 14</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="14to17" id="14to17" />
                            <Label htmlFor="14to17" className="font-normal">14-17</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="over18" id="over18" />
                            <Label htmlFor="over18" className="font-normal">18 or Over</Label>
                        </div>
                    </RadioGroup>
                )}
            </div>
             <Button onClick={() => openModal('qrCode')} variant="outline" className="w-full justify-start">
                <QrCode className="mr-2 h-4 w-4" />
                Show My Friend Code
            </Button>
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
            <Button onClick={signOut} variant="destructive" className="w-full justify-start">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}
