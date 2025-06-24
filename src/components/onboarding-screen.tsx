
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, LoaderCircle } from "lucide-react";

export function OnboardingScreen() {
  const router = useRouter();

  useEffect(() => {
    // This effect will run once when the component mounts.
    // It gives the AuthContext time to load the user profile.
    const timer = setTimeout(() => {
      // Force a navigation to the home page, which will re-evaluate
      // the user's state and show the main dashboard.
      router.push('/');
    }, 3000); // 3 seconds

    return () => clearTimeout(timer); // Clean up the timer if the component unmounts
  }, [router]);


  return (
    <main className="min-h-dvh bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
            <div className="mx-auto bg-primary/10 p-3 rounded-full mb-4">
                <Zap className="h-8 w-8 text-primary" />
            </div>
          <CardTitle className="text-2xl">Just a moment...</CardTitle>
          <CardDescription>
            We are just creating your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center space-y-4 py-8">
          <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">You will be redirected shortly.</p>
        </CardContent>
      </Card>
    </main>
  );
}
