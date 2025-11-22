
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, LoaderCircle, LogIn } from 'lucide-react';

export default function SignupSuccessPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        setLoading(true);
        const email = localStorage.getItem('energysync_autologin_email');
        const password = localStorage.getItem('energysync_autologin_password');

        if (!email || !password) {
            toast({
                title: "Auto-login failed",
                description: "Credentials not found. Please log in manually.",
                variant: "destructive",
            });
            router.push('/login');
            return;
        }

        try {
            await signInWithEmailAndPassword(auth, email, password);
            localStorage.removeItem('energysync_autologin_email');
            localStorage.removeItem('energysync_autologin_password');
            toast({ title: 'Welcome!', description: 'You have been successfully signed in.' });
            router.push('/');
        } catch (error) {
            console.error("Auto-login error:", error);
            toast({
                title: "Login Failed",
                description: "An error occurred during login. Please try again manually.",
                variant: "destructive",
            });
            router.push('/login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-dvh bg-background flex items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95">
                <CardHeader className="text-center items-center">
                     <div className="p-3 bg-green-500/10 rounded-full mb-2">
                        <CheckCircle className="w-12 h-12 text-green-500" />
                    </div>
                    <CardTitle className="text-2xl">Account Created!</CardTitle>
                    <CardDescription>Your account has been successfully created.</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                    <p className="text-muted-foreground">Click the button below to log in and start your journey.</p>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleLogin} className="w-full" disabled={loading}>
                        {loading ? (
                            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <LogIn className="mr-2 h-4 w-4" />
                        )}
                        Login Now
                    </Button>
                </CardFooter>
            </Card>
        </main>
    );
}
