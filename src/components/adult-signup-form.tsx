
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, functions } from '@/lib/firebase';
import { httpsCallable } from 'firebase/functions';
import { useToast } from '@/hooks/use-toast';
import { addDays, formatISO } from 'date-fns';
import { useAuth } from '@/context/AuthContext';
import { INITIAL_FRIENDS } from '@/lib/data';

import type { User } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { LoaderCircle, User as UserIcon, ArrowLeft, ArrowRight, Check, PartyPopper, Mail } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const hearOptions = [
    { value: "social", label: "Social Media" },
    { value: "friend", label: "Friend or Family" },
    { value: "app_store", label: "App Store" },
    { value: "advertisement", label: "Advertisement" },
    { value: "other", label: "Other" },
];

const adultWhatToGetOptions = [
    { value: "track_energy", label: "Track my energy levels" },
    { value: "mental_wellbeing", label: "Improve my wellbeing" },
    { value: "understand_routine", label: "Understand my daily routine" },
    { value: "get_suggestions", label: "Get activity suggestions" },
    { value: "other", label: "Other" },
];


const adultSignupSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  confirmPassword: z.string(),
  howDidYouHear: z.enum(["social", "friend", "app_store", "advertisement", "other"], {
    errorMap: () => ({ message: "Please select an option." }),
  }),
   whatDoYouExpect: z.enum(["track_energy", "mental_wellbeing", "understand_routine", "get_suggestions", "other"], {
    errorMap: () => ({ message: "Please select an option." }),
  }),
  acceptTrial: z.boolean().default(false),
  parentEmailForApproval: z.string().email("Please provide a valid parent email.").optional(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});

type AdultSignupFormValues = z.infer<typeof adultSignupSchema>;

export function AdultSignupForm({ isTeen = false }: { isTeen?: boolean }) {
    const router = useRouter();
    const { toast } = useToast();
    const { setAppUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(0);

    const form = useForm<AdultSignupFormValues>({
        resolver: zodResolver(adultSignupSchema),
        defaultValues: { 
            name: '', 
            email: '', 
            password: '', 
            confirmPassword: '', 
            howDidYouHear: undefined,
            whatDoYouExpect: undefined,
            acceptTrial: false,
            parentEmailForApproval: '',
        },
        mode: 'onTouched',
    });

    const totalSteps = isTeen ? 4 : 3;
    const progress = ((step + 1) / (totalSteps + 1)) * 100;
    
    const handleNext = async () => {
        let fieldsToValidate: (keyof AdultSignupFormValues)[] = [];
        switch(step) {
            case 0: fieldsToValidate = ['name', 'email', 'password', 'confirmPassword']; break;
            case 1: fieldsToValidate = ['howDidYouHear']; break;
            case 2: fieldsToValidate = ['whatDoYouExpect']; break;
            case 3: 
                if (isTeen) fieldsToValidate = ['parentEmailForApproval'];
                break;
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
            setStep(s => s - 1);
        }
    };

    const handleTrialDecisionAndSubmit = (accept: boolean) => {
        form.setValue('acceptTrial', accept, { shouldValidate: true });
        form.handleSubmit(onSubmit)();
    }

    async function onSubmit(data: AdultSignupFormValues) {
        setLoading(true);

        if (isTeen) {
            try {
                const sendApprovalEmail = httpsCallable(functions, 'sendApprovalEmail');
                await sendApprovalEmail({
                    parentEmail: 'dennis.murray10@gmail.com', // Temporarily hardcoded for testing
                    childName: data.name,
                });
                toast({
                    title: "Approval Request Sent",
                    description: `We've sent an approval link to the parent/guardian.`,
                });
                setStep(s => s + 1); // Move to final "Request Sent" screen
            } catch (error) {
                console.error("Failed to send approval email:", error);
                toast({
                    title: "Could Not Send Email",
                    description: "There was a problem sending the approval request. Please check the email and try again.",
                    variant: "destructive",
                });
            } finally {
                setLoading(false);
            }
            return;
        }

        // --- Standard Adult Signup Logic ---
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
            const user = userCredential.user;
            await updateProfile(user, { displayName: data.name });
            
            const trialEndDate = data.acceptTrial ? formatISO(addDays(new Date(), 3)) : null;

            const initialUser: User = {
                userId: user.uid,
                name: data.name,
                username: data.email.split('@')[0],
                avatar: `https://placehold.co/100x100.png`,
                membershipTier: data.acceptTrial ? 'pro' : 'free',
                proTrialEndDate: trialEndDate,
                petCustomization: {
                    color: '#a8a29e', outlineColor: '#4c51bf', accessory: 'none', background: 'default',
                    unlockedColors: ['#a8a29e'], unlockedOutlineColors: ['#4c51bf'], unlockedAccessories: ['none'], unlockedBackgrounds: ['default'],
                },
                petLevel: 1, petExp: 0, petName: 'Buddy', petType: 'dog', petEnabled: true,
                parentalPin: null,
                parentEmail: null,
                featureVisibility: { insights: true, friends: true, communityMode: true },
                howDidYouHear: data.howDidYouHear,
                whatDoYouExpect: data.whatDoYouExpect,
                ageGroup: 'over18',
                tutorialSeen: false,
                lastTaskCompletionTime: null,
                chatHistory: [],
                friends: INITIAL_FRIENDS,
            };

            await setAppUser(initialUser);
            router.push('/');

        } catch (error: any) {
            if (error.code === 'auth/email-already-in-use') {
                form.setError('email', { type: 'manual', message: 'This email is already in use.' });
                setStep(0);
                toast({ title: 'Email in Use', description: 'This email is already registered. Please log in or use a different email.', variant: 'destructive' });
            } else {
                console.error("Account creation error:", error);
                toast({ title: 'Account Creation Failed', description: "An unexpected error occurred.", variant: 'destructive' });
            }
        } finally {
            setLoading(false);
        }
    }

    const getStepTitle = () => {
        const titles = [
            "Create Your Account",
            "How did you hear about us?",
            "What do you expect from the app?",
            isTeen ? "Parental Approval" : "Free Pro Trial",
            isTeen ? "Request Sent!" : "All Done!",
        ];
        return titles[step] || '';
    };

     const getStepDescription = () => {
        const descriptions = [
            "Let's get you set up with your own account.",
            "This helps us understand our community.",
            "This helps us improve the app based on your needs.",
            isTeen ? "Enter your parent or guardian's email. We'll send them a link to approve your account." : "Unlock all features for 3 days, including advanced AI insights and guided audio sessions. No credit card required.",
            isTeen ? "Great! Ask your parent or guardian to check their email to finish setting up your account." : "Your account is ready to use! You will now be logged in.",
        ];
        return descriptions[step] || '';
    };

    const getStepContent = () => {
         switch (step) {
            case 0: return (
                <>
                    <FormField control={form.control} name="name" render={({ field }) => (
                        <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="e.g., Alex Smith" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="email" render={({ field }) => (
                        <FormItem><FormLabel>Email Address</FormLabel><FormControl><Input type="email" placeholder="you@example.com" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="password" render={({ field }) => (
                        <FormItem><FormLabel>Password</FormLabel><FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                        <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                        <FormItem><FormLabel>Confirm Password</FormLabel><FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                </>
            );
            case 1: return (
                
                    <FormField control={form.control} name="howDidYouHear" render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <RadioGroup onValueChange={field.onChange} value={field.value} className="grid grid-cols-1 gap-4">
                                    {hearOptions.map(opt => (
                                        <Label key={opt.value} htmlFor={`hear-${opt.value}`} className="flex items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                                            <p>{opt.label}</p>
                                            <RadioGroupItem value={opt.value} id={`hear-${opt.value}`} />
                                        </Label>
                                    ))}
                                </RadioGroup>
                            </FormControl>
                            <FormMessage className="pt-2" />
                        </FormItem>
                    )}/>
                
            );
            case 2: return (
                 
                     <FormField control={form.control} name="whatDoYouExpect" render={({ field }) => (
                         <FormItem>
                            <FormControl>
                                <RadioGroup onValueChange={field.onChange} value={field.value} className="grid grid-cols-1 gap-4">
                                    {adultWhatToGetOptions.map(opt => (
                                         <Label key={opt.value} htmlFor={`expect-adult-${opt.value}`} className="flex items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                                            <p>{opt.label}</p>
                                            <RadioGroupItem value={opt.value} id={`expect-adult-${opt.value}`} />
                                        </Label>
                                    ))}
                                </RadioGroup>
                            </FormControl>
                            <FormMessage className="pt-2" />
                         </FormItem>
                     )}/>
                 
            );
            case 3: return isTeen ? (
                
                    <FormField control={form.control} name="parentEmailForApproval" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Parent/Guardian Email</FormLabel>
                            <FormControl><Input type="email" placeholder="parent@example.com" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}/>
                
            ) : (
                <div className="text-center">
                    <p className="text-lg">Would you like to start a free 3-day trial of our Pro features?</p>
                    <p className="text-sm text-muted-foreground mt-2">Unlock all features for 3 days, including advanced AI insights and guided audio sessions. No credit card required.</p>
                </div>
            );
            case totalSteps: return ( // Final success/info screen
                <div className="text-center space-y-4">
                    <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
                        {isTeen ? <Mail className="h-12 w-12 text-primary" /> : <PartyPopper className="h-12 w-12 text-primary" />}
                    </div>
                </div>
            );
            default: return null;
         }
    };


    return (
        <main className="min-h-dvh bg-background flex items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-2xl relative">
                <CardHeader className="text-center items-center">
                    <div className="mx-auto bg-primary/10 p-3 rounded-full mb-4">
                        <UserIcon className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">{getStepTitle()}</CardTitle>
                    <CardDescription>{getStepDescription()}</CardDescription>
                </CardHeader>

                {step < totalSteps && <Progress value={progress} className="w-[90%] mx-auto mb-4" />}

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <CardContent className="space-y-4 min-h-[300px]">
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
                            ) : step === totalSteps - 1 && isTeen ? (
                                <>
                                    <Button type="button" onClick={form.handleSubmit(onSubmit)} className="w-full" disabled={loading}>
                                        {loading ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4"/>}
                                        Send Approval & Finish
                                    </Button>
                                     <Button type="button" variant="outline" onClick={handleBack} className="w-full" disabled={loading}>
                                        <ArrowLeft className="mr-2 h-4 w-4"/> Back
                                    </Button>
                                </>
                            ) : step === totalSteps - 1 && !isTeen ? (
                                <div className="flex flex-col gap-2 w-full">
                                    <Button type="button" onClick={() => handleTrialDecisionAndSubmit(true)} className="w-full" disabled={loading}>
                                        {loading ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                                        Yes, Start Trial & Finish
                                    </Button>
                                    <Button type="button" variant="secondary" onClick={() => handleTrialDecisionAndSubmit(false)} className="w-full" disabled={loading}>
                                        {loading ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : 'No Thanks, Just Finish'}
                                    </Button>
                                    <Button type="button" variant="outline" onClick={handleBack} className="w-full" disabled={loading}>
                                        <ArrowLeft className="mr-2 h-4 w-4"/> Back
                                    </Button>
                                </div>
                            ) : (
                                 <Button type="button" onClick={() => router.push('/welcome')} className="w-full">
                                    Back to Welcome
                                </Button>
                            )}
                        </CardFooter>
                    </form>
                </Form>
            </Card>
        </main>
    );
}
