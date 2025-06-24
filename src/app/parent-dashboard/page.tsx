
'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, BrainCircuit, Users, LineChart, MessageSquare, User as UserIcon, ShieldAlert, LoaderCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { User } from '@/lib/types';
import { useEffect } from 'react';

export default function ParentDashboardPage() {
    const { appUser, setAppUser, chatHistory, loading: authLoading } = useAuth();
    const router = useRouter();

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
        </main>
    );
}
