
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { addDays, formatISO } from 'date-fns';
import { useAuth } from '@/context/AuthContext';
import { INITIAL_FRIENDS, INITIAL_PET_TASKS, INITIAL_ACTIVITIES, INITIAL_UPCOMING_EVENTS } from '@/lib/data';

import type { User } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { LoaderCircle, Shield, ArrowLeft, ArrowRight, BrainCircuit, Users, MessageSquare, Check, PartyPopper } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import placeholderImages from '@/app/lib/placeholder-images.json';

const hearOptions = [
    { value: "social", label: "Social Media" },
    { value: "friend", label: "Friend or Family" },
    { value: "app_store", label: "App Store" },
    { value: "advertisement", label: "Advertisement" },
    { value: "other", label: "Other" },
];

const parentWhatToGetOptions = [
    { value: "track_energy", label: "Track their energy levels" },
    { value: "mental_wellbeing", label: "Improve their wellbeing" },
    { value: "understand_routine", label: "Understand their daily routine" },
    { value: "get_suggestions", label: "Get activity suggestions" },
    { value: "other", label: "Other" },
];

const parentSetupSchema = z.object({
  parentEmail: z.string().email("Please enter a valid parent email address."),
  parentalPin: z.string().length(4, "PIN must be 4 digits."),
  confirmPin: z.string().length(4, "PIN must be 4 digits."),
  ageGroup: z.enum(['under14', '14to17']),
  featureVisibility: z.object({
    insights: z.boolean().default(true),
    friends: z.boolean().default(true),
    communityMode: z.boolean().default(true),
  }).default({ insights: true, friends: true, communityMode: true }),
  childName: z.string().min(2, "Child's name must be at least 2 characters."),
  childUsername: z.string().min(3, "Username must be at least 3 characters.").regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores."),
  childPassword: z.string().min(6, "Password must be at least 6 characters."),
  confirmChildPassword: z.string(),
  howDidYouHear: z.enum(["social", "friend", "app_store", "advertisement", "other"], {
    errorMap: () => ({ message: "Please select an option." }),
  }),
  whatDoYouExpect: z.enum(["track_energy", "mental_wellbeing", "understand_routine", "get_suggestions", "other"], {
    errorMap: () => ({ message: "Please select an option." }),
  }),
  acceptTrial: z.boolean().default(false),
}).refine(data => data.parentalPin === data.confirmPin, {
  message: "PINs do not match.",
  path: ["confirmPin"],
}).refine(data => data.childPassword === data.confirmChildPassword, {
  message: "Child's passwords do not match.",
  path: ["confirmChildPassword"],
});

type ParentSetupFormValues = z.infer<typeof parentSetupSchema>;

export function ParentSetupForm() {
    const router = useRouter();
    const { toast } = useToast();
    const { setAppUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(0);

    const form = useForm<ParentSetupFormValues>({
        resolver: zodResolver(parentSetupSchema),
        defaultValues: {
            parentEmail: '',
            parentalPin: '',
            confirmPin: '',
            ageGroup: 'under14',
            featureVisibility: { insights: true, friends: true, communityMode: true },
            childName: '',
            childUsername: '',
            childPassword: '',
            confirmChildPassword: '',
            howDidYouHear: undefined,
            whatDoYouExpect: undefined,
            acceptTrial: false,
        },
        mode: 'onTouched',
    });

    const totalSteps = 7;
    const progress = ((step + 1) / (totalSteps + 1)) * 100;

    const handleNext = async () => {
        let fieldsToValidate: (keyof ParentSetupFormValues)[] = [];
        switch (step) {
            case 0: fieldsToValidate = ['parentEmail', 'parentalPin', 'confirmPin']; break;
            case 1: fieldsToValidate = ['ageGroup']; break;
            case 2: fieldsToValidate = ['featureVisibility']; break;
            case 3: fieldsToValidate = ['childName', 'childUsername', 'childPassword', 'confirmChildPassword']; break;
            case 4: fieldsToValidate = ['howDidYouHear']; break;
            case 5: fieldsToValidate = ['whatDoYouExpect']; break;
        }

        const isValid = await form.trigger(fieldsToValidate as any);
        if (isValid) {
            setStep(s => s + 1);
        }
    };
    
    const handleBack = () => {
        if (step === 0) {
            router.push('/welcome');
        } else {
             setStep(s => s - 1)
        }
    };

    const handleTrialDecisionAndSubmit = (accept: boolean) => {
        form.setValue('acceptTrial', accept, { shouldValidate: true });
        form.handleSubmit(onSubmit)();
    }

    async function onSubmit(data: ParentSetupFormValues) {
        setLoading(true);

        const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
        if (!projectId) {
            toast({ title: "Configuration Error", description: "Firebase Project ID is not set in your environment variables.", variant: "destructive" });
            setLoading(false);
            return;
        }
        const email = `${data.childUsername.toLowerCase().trim()}@${projectId}.fake-user.com`;

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, data.childPassword);
            const user = userCredential.user;

            await updateProfile(user, { displayName: data.childName });
            
            const trialEndDate = data.acceptTrial ? formatISO(addDays(new Date(), 3)) : null;

            const initialUser: User = {
                userId: user.uid,
                name: data.childName,
                username: data.childUsername,
                avatar: placeholderImages.default_avatar.src,
                membershipTier: data.acceptTrial ? 'pro' : 'free',
                proTrialEndDate: trialEndDate,
                petCustomization: {
                    color: '#a8a29e', outlineColor: '#4c51bf', accessory: 'none', background: 'default',
                    unlockedColors: ['#a8a29e'], unlockedOutlineColors: ['#4c51bf'], unlockedAccessories: ['none'], unlockedBackgrounds: ['default'],
                },
                petLevel: 1, petExp: 0, petName: 'Buddy', petType: 'dog', petEnabled: true,
                parentalPin: data.parentalPin,
                parentEmail: data.parentEmail,
                featureVisibility: data.featureVisibility,
                howDidYouHear: data.howDidYouHear,
                whatDoYouExpect: data.whatDoYouExpect,
                ageGroup: data.ageGroup,
                tutorialSeen: false,
                lastTaskCompletionTime: null,
                chatHistory: [],
                friends: INITIAL_FRIENDS,
                journeys: [],
                petTasks: INITIAL_PET_TASKS,
                activities: INITIAL_ACTIVITIES,
                upcomingEvents: INITIAL_UPCOMING_EVENTS,
                reminders: [],
            };
            
            await setAppUser(initialUser);
            
            setStep(s => s + 1);

        } catch (error: any) {
             if (error.code === 'auth/email-already-in-use') {
                form.setError('childUsername', {
                    type: 'manual',
                    message: 'This username is already taken. Please choose another one.'
                });
                setStep(3); // Go back to the username step
                toast({ title: 'Username Taken', description: 'That username is unavailable. Please try another.', variant: 'destructive' });
            } else {
                console.error("Account creation error:", error);
                toast({ 
                    title: 'Account Creation Failed', 
                    description: "An unexpected error occurred. Please try again.", 
                    variant: 'destructive' 
                });
            }
        } finally {
            setLoading(false);
        }
    }
    
    const getStepContent = () => {
         switch (step) {
            case 0: return (
                <CardContent className="space-y-4" key="step-0-parent">
                    <FormField control={form.control} name="parentEmail" render={({ field }) => (
                        <FormItem><FormLabel>Your Email Address</FormLabel><FormControl><Input type="email" placeholder="you@example.com" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="parentalPin" render={({ field }) => (
                         <FormItem><FormLabel>Create a 4-Digit PIN</FormLabel><FormControl><Input type="password" autoComplete="new-password" maxLength={4} placeholder="••••" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="confirmPin" render={({ field }) => (
                        <FormItem><FormLabel>Confirm PIN</FormLabel><FormControl><Input type="password" autoComplete="new-password" maxLength={4} placeholder="••••" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                </CardContent>
            );
            case 1: return (
                 <CardContent key="step-1-parent">
                     <FormField control={form.control} name="ageGroup" render={({ field }) => (
                         <FormItem>
                            <FormControl>
                                <RadioGroup onValueChange={field.onChange} value={field.value} className="grid grid-cols-1 gap-4">
                                     <Label htmlFor="under14" className="flex items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"><p>Under 14</p><RadioGroupItem value="under14" id="under14" /></Label>
                                     <Label htmlFor="14to17" className="flex items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"><p>14 - 17</p><RadioGroupItem value="14to17" id="14to17" /></Label>
                                </RadioGroup>
                            </FormControl>
                         </FormItem>
                     )}/>
                 </CardContent>
            );
            case 2: return (
                <CardContent className="space-y-4" key="step-2-parent">
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
                 <CardContent className="space-y-4" key="step-3-parent">
                    <FormField control={form.control} name="childName" render={({ field }) => (
                        <FormItem><FormLabel>What's your child's name?</FormLabel><FormControl><Input placeholder="e.g., Alex" autoComplete="new-password" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="childUsername" render={({ field }) => (
                        <FormItem><FormLabel>Create a username for your child</FormLabel><FormControl><Input placeholder="e.g., alex_sync" autoComplete="new-password" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="childPassword" render={({ field }) => (
                        <FormItem><FormLabel>Create a password for your child</FormLabel><FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="confirmChildPassword" render={({ field }) => (
                        <FormItem><FormLabel>Confirm child's password</FormLabel><FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                </CardContent>
            );
            case 4: return (
                 <CardContent key="step-4-parent">
                     <FormField control={form.control} name="howDidYouHear" render={({ field }) => (
                         <FormItem>
                            <FormControl>
                                <RadioGroup onValueChange={field.onChange} value={field.value} className="grid grid-cols-1 gap-4">
                                    {hearOptions.map(opt => (
                                         <Label key={opt.value} htmlFor={`hear-${opt.value}`} className="flex items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"><p>{opt.label}</p><RadioGroupItem value={opt.value} id={`hear-${opt.value}`} /></Label>
                                    ))}
                                </RadioGroup>
                            </FormControl>
                            <FormMessage className="pt-2" />
                         </FormItem>
                     )}/>
                 </CardContent>
            );
            case 5: return (
                 <CardContent key="step-5-parent">
                     <FormField control={form.control} name="whatDoYouExpect" render={({ field }) => (
                         <FormItem>
                            <FormControl>
                                <RadioGroup onValueChange={field.onChange} value={field.value} className="grid grid-cols-1 gap-4">
                                    {parentWhatToGetOptions.map(opt => (
                                         <Label key={opt.value} htmlFor={`expect-${opt.value}`} className="flex items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"><p>{opt.label}</p><RadioGroupItem value={opt.value} id={`expect-${opt.value}`} /></Label>
                                    ))}
                                </RadioGroup>
                            </FormControl>
                            <FormMessage className="pt-2" />
                         </FormItem>
                     )}/>
                 </CardContent>
            );
            case 6: return (
                <CardContent className="text-center" key="step-6-parent">
                    <p className="text-lg">Would you like to start a free 3-day trial of our Pro features for your child?</p>
                    <p className="text-sm text-muted-foreground mt-2">Unlock all features for 3 days, including advanced AI insights and guided audio sessions. No credit card required.</p>
                </CardContent>
            );
            case totalSteps: return (
                 <CardContent className="text-center space-y-4" key="step-final-parent">
                    <PartyPopper className="h-16 w-16 text-primary mx-auto"/>
                    <p className="text-lg font-semibold">Account Created Successfully!</p>
                    <p className="text-sm text-muted-foreground">Your child's account is ready. You will be logged in automatically.</p>
                </CardContent>
            )
            default: return null;
         }
    };
    
    const getStepTitle = () => {
        const titles = [
            "Set Up Parental Controls",
            "What is your child's age group?",
            "Select Visible Features",
            "Child's Account Details",
            "How did you hear about us?",
            "What do you expect from the app?",
            "Free Pro Trial",
            "All Done!",
        ];
        return titles[step] || '';
    };

    const getStepDescription = () => {
         const descriptions = [
            "Your email is for receiving important updates. The PIN protects access to sensitive settings and the Parent Dashboard.",
            "This helps us tailor the app experience.",
            "Choose which major features your child can access. You can change these later from the Parent Dashboard.",
            "This creates the login for your child. The username must be unique.",
            "This helps us understand how people find EnergySync.",
            "This helps us improve the app based on your needs.",
            "Unlock all features for 3 days, including advanced AI insights and guided audio sessions. No credit card required.",
            "Your child's account is ready to use. You will be logged in automatically.",
        ];
        return descriptions[step] || '';
    };

    return (
        <main className="min-h-dvh bg-background flex items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-2xl relative">
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
                        <CardContent className="min-h-[300px]">
                          {getStepContent()}
                        </CardContent>

                        <CardFooter className="flex flex-col gap-2 pt-4">
                             {step < totalSteps -1 ? (
                                <>
                                    <Button type="button" onClick={handleNext} className="w-full">Next <ArrowRight className="ml-2 h-4 w-4"/></Button>
                                    <Button type="button" variant="outline" onClick={handleBack} className="w-full">
                                        <ArrowLeft className="mr-2 h-4 w-4"/> Back
                                    </Button>
                                </>
                             ) : step === totalSteps - 1 ? (
                                <div className="flex flex-col gap-2 w-full">
                                    <Button type="button" onClick={() => handleTrialDecisionAndSubmit(true)} className="w-full" disabled={loading}>
                                        {loading ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                                        Yes, Start Free Trial & Create
                                    </Button>
                                    <Button type="button" variant="secondary" onClick={() => handleTrialDecisionAndSubmit(false)} className="w-full" disabled={loading}>
                                        {loading ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : 'No Thanks & Create'}
                                    </Button>
                                     <Button type="button" variant="outline" onClick={handleBack} className="w-full" disabled={loading}>
                                        <ArrowLeft className="mr-2 h-4 w-4"/> Back
                                    </Button>
                                </div>
                             ) : (
                                <Button type="button" onClick={() => router.push('/')} className="w-full">
                                    Go to App
                                </Button>
                             )}
                        </CardFooter>
                    </form>
                </Form>
            </Card>
        </main>
    );
}

    