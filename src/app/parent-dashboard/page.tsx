
'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, BrainCircuit, Users, LineChart, MessageSquare, User as UserIcon, ShieldAlert, LoaderCircle, Crown, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { User } from '@/lib/types';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { MembershipModal } from '@/components/membership-modal';

export default function ParentDashboardPage() {
    const { appUser, setAppUser, chatHistory, loading: authLoading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [isMembershipModalOpen, setIsMembershipModalOpen] = useState(false);

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

    const handleTierChange = (newTier: 'free' | 'pro') => {
        if (appUser) {
            setAppUser({ membershipTier: newTier });
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
                                <Crown className="text-yellow-500 mr-3" />
                                Membership
                            </CardTitle>
                            <CardDescription>Your child is on the <span className="font-semibold">{appUser.membershipTier}</span> plan.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             {appUser.membershipTier === 'free' ? (
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
        </main>
    );
}
