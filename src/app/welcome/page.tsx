
'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, Shield, User } from 'lucide-react';

export default function WelcomePage() {
  const router = useRouter();

  return (
    <main className="min-h-dvh bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
            <div className="mx-auto bg-primary/10 p-3 rounded-full mb-4">
                <Zap className="h-8 w-8 text-primary" />
            </div>
          <CardTitle className="text-2xl">Welcome to EnergySync!</CardTitle>
          <CardDescription>
            Who is setting up this account?
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Button onClick={() => router.push('/parent-setup')} size="lg" className="w-full h-auto py-4">
            <div className="flex items-center">
                <Shield className="mr-3 h-6 w-6"/>
                <div>
                    <p className="font-semibold">Parent or Guardian</p>
                    <p className="font-normal text-xs">I'm setting this up for a child.</p>
                </div>
            </div>
          </Button>
          <Button onClick={() => router.push('/login')} size="lg" variant="secondary" className="w-full h-auto py-4">
             <div className="flex items-center">
                <User className="mr-3 h-6 w-6"/>
                <div>
                    <p className="font-semibold">I am the User</p>
                    <p className="font-normal text-xs">I'm setting up my own account.</p>
                </div>
            </div>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
