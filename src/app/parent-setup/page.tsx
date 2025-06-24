
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoaderCircle } from 'lucide-react';
import { ParentSetupForm } from '@/components/parent-setup-form';
import { AdultSignupForm } from '@/components/adult-signup-form';

// --- Main Page Component ---
export default function SetupPage() {
    const [mode, setMode] = useState<'parent' | 'adult' | 'teen' | null>(null);
    const router = useRouter();

    useEffect(() => {
        const setupMode = localStorage.getItem('energysync_signup_mode');
        if (setupMode === 'parent' || setupMode === 'adult' || setupMode === 'teen') {
            setMode(setupMode as 'parent' | 'adult' | 'teen');
        } else {
            router.push('/welcome');
        }
    }, [router]);

    if (!mode) {
        return (
            <main className="min-h-dvh bg-background flex items-center justify-center">
                <LoaderCircle className="w-12 h-12 animate-spin text-primary" />
            </main>
        );
    }

    if (mode === 'parent') return <ParentSetupForm />;
    if (mode === 'adult') return <AdultSignupForm />;
    if (mode === 'teen') return <AdultSignupForm isTeen />;

    return null;
}
