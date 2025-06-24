
'use client';

import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { addDays, formatISO } from 'date-fns';

import type { User } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { LoaderCircle, Shield, User as UserIcon, ArrowLeft, ArrowRight, BrainCircuit, Users, MessageSquare, Check, PartyPopper, X } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const setupSchema = z.object({
  parentEmail: z.string().email("Please enter a valid parent email address."),
  parentalPin: z.string().length(4, "PIN must be 4 digits."),
  confirmPin: z.string().length(4, "PIN must be 4 digits."),
  ageGroup: z.enum(['under14', '14to17', 'over18']),
  featureVisibility: z.object({
    insights: z.boolean().default(true),
    friends: z.boolean().default(true),
    communityMode: z.boolean().default(true),
  }).default({ insights: true, friends: true, communityMode: true }),
  childName: z.string().min(2, "Child's name must be at least 2 characters."),
  childUsername: z.string().min(3, "Username must be at least 3 characters.").regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores."),
  acceptTrial: z.boolean().default(false),
}).refine(data => data.parentalPin === data.confirmPin, {
  message: "PINs do not match.",
  path: ["confirmPin"],
});

type SetupFormValues = z.infer<typeof setupSchema>;

export default function ParentSetupPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(0);
    const [tempPassword, setTempPassword] = useState('');

    const form = useForm<SetupFormValues>({
        resolver: zodResolver(setupSchema),
        defaultValues: {
            parentEmail: '',
            parentalPin: '',
            confirmPin: '',
            ageGroup: 'under14',
            featureVisibility: { insights: true, friends: true, communityMode: true },
            childName: '',
            childUsername: '',
            acceptTrial: false,
        },
    });

    const ageGroup = useWatch({ control: form.control, name: 'ageGroup' });

    const totalSteps = ageGroup === 'over18' ? 4 : 5;
    const progress = ((step + 1) / (totalSteps + 1)) * 100;

    const handleNext = async () => {
        let fieldsToValidate: (keyof SetupFormValues)[] = [];
        switch (step) {
            case 0: fieldsToValidate = ['parentEmail', 'parentalPin', 'confirmPin']; break;
            case 1: fieldsToValidate = ['ageGroup']; break;
            case 2: fieldsToValidate = ageGroup !== 'over18' ? ['featureVisibility'] : []; break;
            case 3: fieldsToValidate = ['childName', 'childUsername']; break;
            case 4: fieldsToValidate = ageGroup !== 'over18' ? ['acceptTrial'] : []; break;
        }

        const isValid = await form.trigger(fieldsToValidate as any);
        if (isValid) {
            if (step === 1 && ageGroup === 'over18') {
                 setStep(3); // Skip feature visibility for over 18
            } else if (step === 3 && ageGroup === 'over18') {
                 setStep(step + 2); // Skip trial for over 18 and go to success
            } else {
                setStep(s => s + 1);
            }
        }
    };
    
    const handleBack = () => {
        if (step === 0) {
            router.push('/welcome');
        } else if (step === 3 && ageGroup === 'over18') {
             setStep(1); // Skip back over feature visibility
        } else {
             setStep(s => s - 1)
        }
    };

    async function onSubmit(data: SetupFormValues) {
        setLoading(true);
        const randomPassword = Math.random().toString(36).slice(-8);
        setTempPassword(randomPassword);

        const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
        if (!projectId) {
            toast({ title: "Configuration Error", description: "Firebase Project ID is not set.", variant: "destructive" });
            setLoading(false);
            return;
        }
        const email = `${data.childUsername.toLowerCase().trim()}@${projectId}.fake-user.com`;

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, randomPassword);
            const user = userCredential.user;

            await updateProfile(user, { displayName: data.childName });
            
            const trialEndDate = data.acceptTrial ? formatISO(addDays(new Date(), 3)) : null;

            const initialUser: User = {
                userId: user.uid,
                name: data.childName,
                username: data.childUsername,
                avatar: `https://placehold.co/100x100.png`,
                membershipTier: data.acceptTrial ? 'pro' : 'free',
                proTrialEndDate: trialEndDate,
                petCustomization: {
                    color: '#a8a29e', outlineColor: '#4c51bf', accessory: 'none', background: 'default',
                    unlockedColors: ['#a8a29e'], unlockedOutlineColors: ['#4c51bf'], unlockedAccessories: ['none'], unlockedBackgrounds: ['default'],
                },
                petLevel: 1, petExp: 0, petName: 'Buddy', petType: 'dog', petEnabled: true,
                parentalPin: ageGroup !== 'over18' ? data.parentalPin : null,
                parentEmail: ageGroup !== 'over18' ? data.parentEmail : null,
                featureVisibility: ageGroup !== 'over18' ? data.featureVisibility : { insights: true, friends: true, communityMode: true },
            };
            
            localStorage.setItem(`energysync_user_${user.uid}`, JSON.stringify(initialUser));
            localStorage.setItem('energysync_age_group', data.ageGroup);

            
            setStep(totalSteps); // Go to success screen

        } catch (error: any) {
            console.error("Account creation error:", error);
            let description = "An unexpected error occurred. Please try again.";
            if (error.code === 'auth/email-already-in-use') {
                description = "This username is already taken. Please choose another one.";
            }
            toast({ title: 'Account Creation Failed', description, variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    }
    
    const renderStep = () => {
         switch (step) {
            case 0: return (
                <CardContent className="space-y-4">
                    <FormField control={form.control} name="parentEmail" render={({ field }) => (
                        <FormItem><FormLabel>Your Email Address</FormLabel><FormControl><Input type="email" placeholder="you@example.com" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="parentalPin" render={({ field }) => (
                         <FormItem><FormLabel>Create a 4-Digit PIN</FormLabel><FormControl><Input type="password" maxLength={4} placeholder="••••" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="confirmPin" render={({ field }) => (
                        <FormItem><FormLabel>Confirm PIN</FormLabel><FormControl><Input type="password" maxLength={4} placeholder="••••" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                </CardContent>
            );
            case 1: return (
                 <CardContent>
                     <FormField control={form.control} name="ageGroup" render={({ field }) => (
                         <FormItem>
                            <FormControl>
                                <RadioGroup onValueChange={field.onChange} value={field.value} className="grid grid-cols-1 gap-4">
                                     <Label htmlFor="under14" className="flex items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"><p>Under 14</p><RadioGroupItem value="under14" id="under14" /></Label>
                                     <Label htmlFor="14to17" className="flex items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"><p>14 - 17</p><RadioGroupItem value="14to17" id="14to17" /></Label>
                                     <Label htmlFor="over18" className="flex items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"><p>18 or Over</p><RadioGroupItem value="over18" id="over18" /></Label>
                                </RadioGroup>
                            </FormControl>
                         </FormItem>
                     )}/>
                 </CardContent>
            );
            case 2: return (
                <CardContent className="space-y-4">
                    <FormField control={form.control} name="featureVisibility.insights" render={({ field }) => (
                        <div className="flex items-center justify-between rounded-lg border p-3">
                            <Label htmlFor="insights-toggle" className="flex items-center gap-2 font-normal"><BrainCircuit /> Insights Tab</Label>
                            <Switch id="insights-toggle" checked={field.value} onCheckedChange={field.onChange} />
                        </div>
                    )}/>
                     <FormField control={form.control} name="featureVisibility.friends" render={({ field }) => (
                        <div className="flex items-center justify-between rounded-lg border p-3">
                            <Label htmlFor="friends-toggle" className="flex items-center gap-2 font-normal"><Users /> Friend Network</Label>
                            <Switch id="friends-toggle" checked={field.value} onCheckedChange={field.onChange} />
                        </div>
                    )}/>
                     <FormField control={form.control} name="featureVisibility.communityMode" render={({ field }) => (
                        <div className="flex items-center justify-between rounded-lg border p-3">
                            <Label htmlFor="community-toggle" className="flex items-center gap-2 font-normal"><MessageSquare /> Community Mode</Label>
                            <Switch id="community-toggle" checked={field.value} onCheckedChange={field.onChange} />
                        </div>
                    )}/>
                </CardContent>
            );
             case 3: return (
                 <CardContent className="space-y-4">
                    <FormField control={form.control} name="childName" render={({ field }) => (
                        <FormItem><FormLabel>What's your child's name?</FormLabel><FormControl><Input placeholder="e.g., Alex" {...field} autoComplete="new-password" /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="childUsername" render={({ field }) => (
                        <FormItem><FormLabel>Create a username for your child</FormLabel><FormControl><Input placeholder="e.g., alex_sync" {...field} autoComplete="new-password" /></FormControl><FormMessage /></FormItem>
                    )}/>
                </CardContent>
            );
            case 4: return (
                <CardContent className="text-center">
                    <p className="text-lg">Would you like to start a free 3-day trial of our Pro features for your child?</p>
                     <FormField control={form.control} name="acceptTrial" render={({ field }) => (
                        <div className="flex items-center justify-center gap-4 mt-6">
                            <Button type="button" variant={field.value ? "default" : "outline"} onClick={() => field.onChange(true)}>Yes, start trial</Button>
                            <Button type="button" variant={!field.value ? "default" : "outline"} onClick={() => field.onChange(false)}>No, thanks</Button>
                        </div>
                    )}/>
                </CardContent>
            );
            case totalSteps: return (
                <CardContent className="text-center space-y-4">
                    <PartyPopper className="h-16 w-16 text-primary mx-auto"/>
                    <p className="text-lg font-semibold">Account Created Successfully!</p>
                    <div className="p-4 bg-muted rounded-lg text-left space-y-2">
                        <p><strong>Username:</strong> {form.getValues('childUsername')}</p>
                        <p><strong>Temporary Password:</strong> {tempPassword}</p>
                    </div>
                </CardContent>
            )
            default: return null;
         }
    };
    
    const getStepTitle = () => {
        switch (step) {
            case 0: return 'Set Up Parental Controls';
            case 1: return "What is your child's age group?";
            case 2: return 'Select Visible Features';
            case 3: return "Child's Account Details";
            case 4: return 'Free Pro Trial';
            case totalSteps: return "All Done!";
            default: return '';
        }
    };

    const getStepDescription = () => {
        switch (step) {
            case 0: return "Your email is for receiving important updates. The PIN protects access to sensitive settings and the Parent Dashboard.";
            case 1: return "This helps us tailor the app experience. Selecting '18 or Over' will disable all parental controls.";
            case 2: return "Choose which major features your child can access. You can change these later from the Parent Dashboard.";
            case 3: return "This creates the login for your child. The username must be unique. A temporary password will be generated.";
            case 4: return "Unlock all features for 3 days, including advanced AI insights and guided audio sessions. No credit card required.";
            case totalSteps: return "Your child's account is ready. Please share these login details with them. They will be prompted to change their password on first login.";
            default: return '';
        }
    };

    return (
        <main className="min-h-dvh bg-background flex items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-2xl">
                <CardHeader className="text-center items-center">
                    <div className="mx-auto bg-primary/10 p-3 rounded-full mb-4">
                        <Shield className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">{getStepTitle()}</CardTitle>
                    <CardDescription>{getStepDescription()}</CardDescription>
                </CardHeader>
                
                {step < totalSteps && <Progress value={progress} className="w-[90%] mx-auto mb-4" />}

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        {renderStep()}

                        <CardContent className="flex flex-col gap-2">
                            {step < totalSteps -1 && (
                                <Button type="button" onClick={handleNext} className="w-full">Next <ArrowRight className="ml-2 h-4 w-4"/></Button>
                            )}
                            {step === totalSteps - 1 && (
                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                    Create Account & Finish
                                </Button>
                            )}
                             {step < totalSteps && (
                                <Button type="button" variant="outline" onClick={handleBack} className="w-full">
                                    <ArrowLeft className="mr-2 h-4 w-4"/> Back
                                </Button>
                            )}
                             {step === totalSteps && (
                                <Button type="button" onClick={() => router.push('/')} className="w-full">
                                    Go to App
                                </Button>
                            )}
                        </CardContent>
                    </form>
                </Form>
            </Card>
        </main>
    );
}
