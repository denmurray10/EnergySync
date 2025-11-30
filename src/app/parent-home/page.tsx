'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ShieldAlert, LoaderCircle, UserPlus, ChevronRight, Users, LogOut } from 'lucide-react';
import { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import type { User } from '@/lib/types';

interface ChildAccount {
    userId: string;
    name: string;
    email: string;
    avatar?: string;
    petName?: string;
    petType: 'cat' | 'dog' | 'horse' | 'chicken';
    ageGroup: 'under14' | '14to17' | 'over18' | null;
}

export default function ParentHomePage() {
    const { appUser, firebaseUser, loading: authLoading, signOut } = useAuth();
    const router = useRouter();
    const [children, setChildren] = useState<ChildAccount[]>([]);
    const [loading, setLoading] = useState(true);

    const searchParams = useSearchParams();

    useEffect(() => {
        if (!authLoading && !firebaseUser) {
            router.push('/login');
            return;
        }

        const fetchChildren = async () => {
            if (!firebaseUser?.email) {
                setLoading(false);
                return;
            }

            try {
                const parentEmailNormalized = firebaseUser.email.toLowerCase().trim();
                console.log('Fetching children for parent email:', parentEmailNormalized);

                // Query for all users where parentEmail matches the logged-in parent's email
                const usersRef = collection(firestore, 'users');
                const q = query(usersRef, where('parentEmail', '==', firebaseUser.email));
                let querySnapshot = await getDocs(q);

                console.log('Exact match query returned', querySnapshot.size, 'documents');

                // If no exact match, try case-insensitive search by fetching all and filtering
                if (querySnapshot.size === 0) {
                    console.log('No exact match found, trying case-insensitive search...');
                    const allUsersQuery = query(usersRef);
                    const allUsersSnapshot = await getDocs(allUsersQuery);

                    const matchingDocs: any[] = [];
                    allUsersSnapshot.forEach((doc) => {
                        const data = doc.data();
                        if (data.parentEmail && data.parentEmail.toLowerCase().trim() === parentEmailNormalized) {
                            matchingDocs.push(doc);
                        }
                    });

                    console.log('Case-insensitive search found', matchingDocs.length, 'documents');

                    // Create a pseudo snapshot for compatibility
                    querySnapshot = {
                        size: matchingDocs.length,
                        forEach: (callback: any) => matchingDocs.forEach(callback)
                    } as any;
                }

                const childAccounts: ChildAccount[] = [];
                querySnapshot.forEach((doc) => {
                    const data = doc.data() as User;
                    console.log('Found child:', data.name, 'with parentEmail:', data.parentEmail);
                    childAccounts.push({
                        userId: doc.id,
                        name: data.name,
                        email: data.email,
                        avatar: data.avatar,
                        petName: data.petName,
                        petType: data.petType,
                        ageGroup: data.ageGroup,
                    });
                });

                setChildren(childAccounts);

                // Auto-redirect if only one child and not explicitly asked to show list
                if (childAccounts.length === 1) {
                    const showList = searchParams.get('showList');
                    if (!showList) {
                        router.push(`/parent-dashboard?childId=${childAccounts[0].userId}`);
                    }
                }

            } catch (error) {
                console.error('Error fetching children:', error);
            } finally {
                setLoading(false);
            }
        };

        if (!authLoading) {
            fetchChildren();
        }
    }, [firebaseUser, appUser, authLoading, router, searchParams]);

    const handleSelectChild = (childId: string) => {
        router.push(`/parent-dashboard?childId=${childId}`);
    };

    const handleLogout = async () => {
        try {
            await signOut();
            router.push('/login');
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    if (authLoading || loading) {
        return (
            <main className="min-h-dvh bg-background flex items-center justify-center">
                <LoaderCircle className="w-12 h-12 animate-spin text-primary" />
            </main>
        );
    }

    const getPetEmoji = (petType: 'cat' | 'dog' | 'horse' | 'chicken') => {
        switch (petType) {
            case 'cat': return '🐱';
            case 'dog': return '🐶';
            case 'horse': return '🐴';
            case 'chicken': return '🐔';
        }
    };

    return (
        <main className="min-h-dvh bg-background">
            <div className="max-w-md mx-auto bg-card/60 backdrop-blur-lg min-h-dvh shadow-2xl relative">
                <div className="p-6 h-dvh overflow-y-auto pb-24 custom-scrollbar">
                    <div className="flex items-center justify-between gap-4 mb-6">
                        <div className="flex items-center gap-4">
                            <ShieldAlert className="h-10 w-10 text-primary" />
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                                Parent Portal
                            </h1>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleLogout}
                            className="flex items-center gap-2"
                        >
                            <LogOut className="h-4 w-4" />
                            Logout
                        </Button>
                    </div>

                    <Card className="bg-card/80 backdrop-blur-sm mb-6">
                        <CardHeader>
                            <CardTitle className="flex items-center text-xl">
                                <Users className="text-primary mr-3" />
                                Your Children
                            </CardTitle>
                            <CardDescription>Select a child to view their dashboard</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {children.length > 0 ? (
                                children.map((child) => (
                                    <Button
                                        key={child.userId}
                                        variant="outline"
                                        className="w-full h-auto p-4 flex items-center justify-between hover:bg-accent/50 transition-colors"
                                        onClick={() => handleSelectChild(child.userId)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-12 w-12">
                                                <AvatarFallback className="text-lg">
                                                    {child.name.charAt(0).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="text-left">
                                                <div className="font-medium text-base">{child.name}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {getPetEmoji(child.petType)} {child.petName} • {
                                                        child.ageGroup === 'under14' ? 'Under 14' :
                                                            child.ageGroup === '14to17' ? '14-17' :
                                                                child.ageGroup === 'over18' ? '18+' : 'Age not set'
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                    </Button>
                                ))
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    <p className="mb-2">No children found</p>
                                    <p className="text-sm">Children accounts will appear here when they link to your parent account</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="bg-card/80 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center text-lg">
                                <UserPlus className="text-teal-500 mr-3" />
                                Add a Child
                            </CardTitle>
                            <CardDescription>
                                Have your child enter your email ({firebaseUser?.email}) as their parent email during account setup
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </div>
            </div>
        </main>
    );
}
