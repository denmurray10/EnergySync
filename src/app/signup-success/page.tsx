
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle, LoaderCircle } from 'lucide-react';

export default function SignupSuccessPage() {
    const router = useRouter();

    useEffect(() => {
        const timer = setTimeout(() => {
            router.push('/login');
        }, 3000); // 3-second delay before redirecting

        return () => clearTimeout(timer);
    }, [router]);

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
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                        <LoaderCircle className="w-4 h-4 animate-spin"/>
                        <p>Redirecting you to the login page...</p>
                    </div>
                </CardContent>
            </Card>
        </main>
    );
}
