"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type { User, PetCustomization } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Zap } from "lucide-react";

const onboardingFormSchema = z.object({
  name: z.string().min(2, "Please enter a name with at least 2 characters.").max(50),
});

type OnboardingFormValues = z.infer<typeof onboardingFormSchema>;

type OnboardingScreenProps = {
  onComplete: (user: Omit<User, 'membershipTier' | 'petCustomization'>) => void;
};

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const form = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingFormSchema),
    defaultValues: {
      name: "",
    },
  });

  function onSubmit(data: OnboardingFormValues) {
    onComplete(data);
  }

  return (
    <main className="min-h-dvh bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
            <div className="mx-auto bg-primary/10 p-3 rounded-full mb-4">
                <Zap className="h-8 w-8 text-primary" />
            </div>
          <CardTitle className="text-2xl">Welcome to EnergySync!</CardTitle>
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
              <Button type="submit" className="w-full">
                Get Started
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </main>
  );
}
