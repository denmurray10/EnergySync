"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type { User } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Zap, LoaderCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { updateProfile } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const onboardingFormSchema = z.object({
  name: z.string().min(2, "Please enter a name with at least 2 characters.").max(50),
});

type OnboardingFormValues = z.infer<typeof onboardingFormSchema>;

type OnboardingScreenProps = {
  onComplete: (user: User) => void;
};

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const { user: firebaseUser, setAppUser } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const form = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingFormSchema),
    defaultValues: {
      name: "",
    },
  });

  async function onSubmit(data: OnboardingFormValues) {
    if (!firebaseUser) {
        toast({ title: 'Error', description: 'No authenticated user found.', variant: 'destructive'});
        return;
    }
    setLoading(true);
    try {
        await updateProfile(firebaseUser, { displayName: data.name });
        
        // Manually update the appUser state to trigger re-render
        // This is better than a full page reload.
        const petCustomizationData = localStorage.getItem(`energysync_pet_customization_${firebaseUser.uid}`);
        const membershipTierData = localStorage.getItem(`energysync_membership_${firebaseUser.uid}`);
        
        const defaultPetCustomization = {
            color: '#a8a29e',
            accessory: 'none' as const,
            background: 'default' as const,
            unlockedColors: ['#a8a29e'],
            unlockedAccessories: ['none'],
            unlockedBackgrounds: ['default'],
        };

        const newUser: User = {
            name: data.name,
            membershipTier: membershipTierData ? JSON.parse(membershipTierData) : 'free',
            petCustomization: petCustomizationData ? JSON.parse(petCustomizationData) : defaultPetCustomization,
        };
        setAppUser(newUser);

    } catch (error: any) {
        toast({ title: 'Profile Update Failed', description: error.message, variant: 'destructive'});
        setLoading(false);
    }
  }

  return (
    <main className="min-h-dvh bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
            <div className="mx-auto bg-primary/10 p-3 rounded-full mb-4">
                <Zap className="h-8 w-8 text-primary" />
            </div>
          <CardTitle className="text-2xl">One Last Step!</CardTitle>
          <CardDescription>
            Let's get you started. What should we call you?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Alex" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={loading}>
                 {loading && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                Save and Continue
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </main>
  );
}
