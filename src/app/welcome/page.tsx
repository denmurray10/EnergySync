
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, Shield, User } from 'lucide-react';
import { AgeGateModal } from '@/components/age-gate-modal';
import { GuardianRequiredModal } from '@/components/guardian-required-modal';

export default function WelcomePage() {
  const router = useRouter();
  const [showAgeGate, setShowAgeGate] = useState(false);
  const [showGuardianMessage, setShowGuardianMessage] = useState(false);

  const handleAgeSelect = (group: 'under14' | '14to17' | 'over18') => {
    setShowAgeGate(false);
    if (group === 'over18') {
      localStorage.setItem('energysync_signup_mode', 'adult');
      router.push('/parent-setup');
    } else {
      setShowGuardianMessage(true);
    }
  };

  const handleParentSetupClick = () => {
    localStorage.setItem('energysync_signup_mode', 'parent');
    router.push('/parent-setup');
  };


  return (
    <main className="min-h-dvh bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
            <div className="mx-auto bg-primary/10 p-3 rounded-full mb-4">
                <Zap className="h-8 w-8 text-primary" />
            </div>
          <CardTitle className="text-2xl">Welcome to EnergySync!</CardTitle>
          <CardDescription>
            How are you getting started today?
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Button onClick={handleParentSetupClick} size="lg" className="w-full h-auto py-4">
            <div className="flex items-center">
                <Shield className="mr-3 h-6 w-6"/>
                <div>
                    <p className="font-semibold">Set up for a Child</p>
                    <p className="font-normal text-xs">I'm a parent or guardian.</p>
                </div>
            </div>
          </Button>
          <Button onClick={() => setShowAgeGate(true)} size="lg" variant="secondary" className="w-full h-auto py-4">
             <div className="flex items-center">
                <User className="mr-3 h-6 w-6"/>
                <div>
                    <p className="font-semibold">Create My Own Account</p>
                    <p className="font-normal text-xs">For users setting up their own account.</p>
                </div>
            </div>
          </Button>

          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Or
              </span>
            </div>
          </div>
          
          <Button onClick={() => router.push('/login')} variant="outline" className="w-full font-semibold">
            I already have an account
          </Button>
        </CardContent>
      </Card>

      <AgeGateModal open={showAgeGate} onOpenChange={setShowAgeGate} onSelect={handleAgeSelect} />
      <GuardianRequiredModal open={showGuardianMessage} onOpenChange={setShowGuardianMessage} />
    </main>
  );
}
