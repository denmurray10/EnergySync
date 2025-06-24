
'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, BrainCircuit, Users, LineChart, MessageSquare, User as UserIcon, ShieldAlert, LoaderCircle, Crown, Star, Users2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { User } from '@/lib/types';
import { useEffect, useState, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { MembershipModal } from '@/components/membership-modal';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { differenceInDays } from 'date-fns';


export default function ParentDashboardPage() {
    const { appUser, setAppUser, chatHistory, loading: authLoading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [isMembershipModalOpen, setIsMembershipModalOpen] = useState(false);

    const [isConfirmingAgeChange, setIsConfirmingAgeChange] = useState(false);
    const [pendingAgeGroup, setPendingAgeGroup] = useState<'under14' | '14to17' | 'over18' | null>(null);

    const isProMember = useMemo(() => {
        if (!appUser) return false;
        if (appUser.membershipTier === 'pro') return true;
        if (appUser.proTrialEndDate) {
            return new Date(appUser.proTrialEndDate) > new Date();
        }
        return false;
    }, [appUser]);

    const daysLeftOnTrial = appUser?.proTrialEndDate && new Date(appUser.proTrialEndDate) > new Date()
        ? differenceInDays(new Date(appUser.proTrialEndDate), new Date()) + 1
        : null;


    useEffect(() => {
        if (!authLoading && !appUser?.parentalPin) {
             router.push('/');
        }
    }, [appUser, authLoading, router]);

    const handleVisibilityChange = (feature: keyof NonNullable<User['featureVisibility']>, isVisible: boolean) => {
        if (appUser) {
            const currentVisibility = appUser.featureVisibility ?? { insights: true, friends: true, communityMode: true };
            const newVisibility = {
                ...currentVisibility,
                [feature]: isVisible,
            };
            setAppUser({ featureVisibility: newVisibility });
        }
    };
    
    const handleAgeGroupChange = (newAgeGroup: 'under14' | '14to17' | 'over18') => {
        setAppUser({ ageGroup: newAgeGroup });
        
        let ageDescription = `Your child's app experience has been updated.`;
        if (newAgeGroup === 'under14') ageDescription = "Experience set for users under 14.";
        if (newAgeGroup === '14to17') ageDescription = "Experience set for users 14-17.";
        if (newAgeGroup === 'over18') ageDescription = "Experience set for users 18 and over. Parental controls will be disabled.";

        toast({
            title: "Age Group Updated",
            description: ageDescription,
        });
        
        if (newAgeGroup === 'over18' && appUser) {
            setAppUser({ parentalPin: null, parentEmail: null });
            router.push('/');
        }
    };

    const confirmAgeChange = () => {
        if (pendingAgeGroup) {
            handleAgeGroupChange(pendingAgeGroup);
        }
        setPendingAgeGroup(null);
        setIsConfirmingAgeChange(false);
    };

    const handleTierChange = (newTier: 'free' | 'pro') => {
        if (appUser) {
            setAppUser({ membershipTier: newTier, proTrialEndDate: null });
            toast({
                title: `Membership Updated!`,
                description: `Your child is now on the ${newTier === 'pro' ? 'Pro' : 'Free'} plan.`,
            });
        }
    };
    
    if (authLoading || !appUser) {
        return (
            <main className="min-h-dvh bg-background flex items-center justify-center">
                <LoaderCircle className="w-12 h-12 animate-spin text-primary" />
            </main>
        );
    }
    
    const visibility = appUser.featureVisibility ?? { insights: true, friends: true, communityMode: true };

    return (
        <main className="min-h-dvh bg-background">
             <div className="max-w-md mx-auto bg-card/60 backdrop-blur-lg min-h-dvh shadow-2xl relative">
                <div className="p-6 h-dvh overflow-y-auto pb-24 custom-scrollbar">
                    <div className="flex items-center gap-4 mb-6">
                        <ShieldAlert className="h-10 w-10 text-primary" />
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                            Parent Dashboard
                        </h1>
                    </div>
                    
                    <Card className="bg-card/80 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle>Feature Controls</CardTitle>
                            <CardDescription>Enable or disable features within the app.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between rounded-lg border p-3">
                                <Label htmlFor="insights-toggle" className="flex items-center gap-2 font-normal"><LineChart /> Insights Tab</Label>
                                <Switch
                                    id="insights-toggle"
                                    checked={visibility.insights}
                                    onCheckedChange={(checked) => handleVisibilityChange('insights', checked)}
                                />
                            </div>
                            <div className="flex items-center justify-between rounded-lg border p-3">
                                <Label htmlFor="friends-toggle" className="flex items-center gap-2 font-normal"><Users /> Friend Network</Label>
                                <Switch
                                    id="friends-toggle"
                                    checked={visibility.friends}
                                    onCheckedChange={(checked) => handleVisibilityChange('friends', checked)}
                                />
                            </div>
                             <div className="flex items-center justify-between rounded-lg border p-3">
                                <Label htmlFor="community-toggle" className="flex items-center gap-2 font-normal"><MessageSquare /> Community Mode</Label>
                                <Switch
                                    id="community-toggle"
                                    checked={visibility.communityMode}
                                    onCheckedChange={(checked) => handleVisibilityChange('communityMode', checked)}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="mt-6 bg-card/80 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center text-xl">
                                <Users2 className="text-teal-500 mr-3" />
                                Child's Age Group
                            </CardTitle>
                            <CardDescription>Adjust your child's age group for a tailored experience.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {appUser.ageGroup ? (
                                <RadioGroup 
                                    value={appUser.ageGroup} 
                                    onValueChange={(value) => {
                                        setPendingAgeGroup(value as 'under14' | '14to17' | 'over18');
                                        setIsConfirmingAgeChange(true);
                                    }}
                                    className="space-y-2 pt-2"
                                >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="under14" id="pd-under14" />
                                        <Label htmlFor="pd-under14" className="font-normal">Under 14</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="14to17" id="pd-14to17" />
                                        <Label htmlFor="pd-14to17" className="font-normal">14-17</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="over18" id="pd-over18" />
                                        <Label htmlFor="pd-over18" className="font-normal">18 or Over</Label>
                                    </div>
                                </RadioGroup>
                            ) : (
                                <p className="text-sm text-muted-foreground">Could not load age group setting.</p>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="mt-6 bg-card/80 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center text-xl">
                                <Crown className="text-yellow-500 mr-3" />
                                Membership
                            </CardTitle>
                            <CardDescription>Your child is on the <span className="font-semibold">{isProMember ? 'Pro' : 'Free'}</span> plan.</CardDescription>
                             {daysLeftOnTrial !== null && daysLeftOnTrial > 0 && (
                                <p className="text-sm text-primary pt-2 font-semibold">
                                    Their Pro trial ends in {daysLeftOnTrial} {daysLeftOnTrial === 1 ? 'day' : 'days'}.
                                </p>
                            )}
                        </CardHeader>
                        <CardContent>
                             {!isProMember ? (
                                <Button onClick={() => setIsMembershipModalOpen(true)} className="w-full bg-gradient-to-r from-yellow-400 to-amber-500 text-white border-none shadow-lg hover:shadow-xl">
                                    <Star className="mr-2 h-4 w-4 fill-white"/>
                                    Upgrade to Pro
                                </Button>
                            ) : (
                                <Button onClick={() => handleTierChange('free')} className="w-full" variant="outline">
                                    Downgrade to Free
                                </Button>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="mt-6 bg-card/80 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle>AI Chat History</CardTitle>
                            <CardDescription>A log of conversations with the AI coach.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="h-64 w-full rounded-md border p-2">
                                {chatHistory.length > 0 ? (
                                    <div className="space-y-4 p-2">
                                        {chatHistory.map((message, index) => (
                                        <div key={index} className={cn("flex items-start gap-3 text-sm", message.role === 'user' ? "justify-end" : "justify-start")}>
                                            {message.role === 'model' && (
                                            <Avatar className="w-6 h-6 bg-primary/20 text-primary">
                                                <AvatarFallback><BrainCircuit size={14}/></AvatarFallback>
                                            </Avatar>
                                            )}
                                            <div className={cn("max-w-[80%] rounded-lg p-2", message.role === 'user' ? "bg-primary text-primary-foreground" : "bg-muted text-card-foreground")}>
                                            <p>{message.content}</p>
                                            </div>
                                            {message.role === 'user' && (
                                            <Avatar className="w-6 h-6">
                                                <AvatarFallback><UserIcon size={14}/></AvatarFallback>
                                            </Avatar>
                                            )}
                                        </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground text-center p-4">No chat history yet.</p>
                                )}
                            </ScrollArea>
                        </CardContent>
                    </Card>

                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-sm border-t">
                    <Button onClick={() => router.push('/')} className="w-full bg-primary hover:bg-primary/90">
                        <ArrowLeft className="mr-2 h-4 w-4"/>
                        Back to App
                    </Button>
                </div>
            </div>
             <MembershipModal
                open={isMembershipModalOpen}
                onOpenChange={setIsMembershipModalOpen}
                onUpgrade={() => handleTierChange('pro')}
                currentTier={appUser.membershipTier}
            />
            <AlertDialog open={isConfirmingAgeChange} onOpenChange={(isOpen) => { if(!isOpen) setPendingAgeGroup(null); setIsConfirmingAgeChange(isOpen); }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            {pendingAgeGroup === 'over18'
                                ? "Changing the age group to '18 or Over' will disable all parental controls and grant the user full access. This action cannot be undone. Are you sure you want to continue?"
                                : `Are you sure you want to change the age group to '${pendingAgeGroup === 'under14' ? 'Under 14' : '14-17'}'?`}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setPendingAgeGroup(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmAgeChange}>Continue</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </main>
    );
}
