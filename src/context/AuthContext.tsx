// src/context/AuthContext.tsx
'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, firestore } from '@/lib/firebase';
import type { User, Friend, ChatMessage } from '@/lib/types';
import { INITIAL_FRIENDS } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  appUser: User | null;
  setAppUser: (user: Partial<User>) => Promise<void>;
  loading: boolean;
  signOut: () => Promise<void>;
  friends: Friend[];
  setFriends: (friends: Friend[]) => void;
  chatHistory: ChatMessage[];
  addChatMessage: (message: ChatMessage) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [appUser, setLocalAppUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        try {
          const userRef = doc(firestore, 'users', user.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            setLocalAppUser(userSnap.data() as User);
          } else {
            console.error(`CRITICAL: No Firestore document found for authenticated user ${user.uid}. Signing out.`);
            toast({
              title: 'Profile Not Found',
              description: "We couldn't find your user profile. Please try signing up again.",
              variant: 'destructive',
            });
            await auth.signOut();
            setLocalAppUser(null);
          }
        } catch (error) {
            console.error("Error fetching user document from Firestore:", error);
            toast({
                title: 'Could not load profile',
                description: 'There was a problem fetching your user data. Please try logging in again.',
                variant: 'destructive',
            });
            await auth.signOut();
            setLocalAppUser(null);
        } finally {
            setLoading(false);
        }
      } else {
        setLocalAppUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [toast]);

  const setAppUser = useCallback(async (userData: Partial<User>) => {
    const currentUser = auth.currentUser; 
    const userId = userData.userId || currentUser?.uid;

    if (!userId) {
      const errorMsg = "Could not save user data because no user is logged in.";
      console.error("setAppUser failed:", errorMsg);
      toast({ title: 'Save Failed', description: errorMsg, variant: 'destructive' });
      throw new Error(errorMsg);
    }

    const userRef = doc(firestore, 'users', userId);
    
    try {
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        await updateDoc(userRef, userData);
        setLocalAppUser(prev => prev ? { ...prev, ...userData } as User : null);
      } else {
        await setDoc(userRef, userData as User);
        setLocalAppUser(userData as User);
      }
    } catch (error) {
      console.error("Firestore operation failed in setAppUser:", error);
      toast({ title: 'Save Failed', description: "There was a problem saving your data to the cloud.", variant: 'destructive' });
      throw error;
    }
  }, [toast]);
  
  const addChatMessage = useCallback(async (message: ChatMessage) => {
    if (appUser) {
        const newHistory = [...(appUser.chatHistory || []), message];
        const userRef = doc(firestore, 'users', appUser.userId);
        await updateDoc(userRef, { chatHistory: newHistory });
        setLocalAppUser(prev => prev ? ({ ...prev, chatHistory: newHistory }) : null);
    }
  }, [appUser]);
  
  const setFriends = useCallback(async (friends: Friend[]) => {
      if(appUser) {
          const userRef = doc(firestore, 'users', appUser.userId);
          await updateDoc(userRef, { friends });
          setLocalAppUser(prev => prev ? ({ ...prev, friends }) : null);
      }
  }, [appUser]);


  const signOut = async () => {
    await auth.signOut();
    setLocalAppUser(null);
    setFirebaseUser(null);
  };

  const friends = appUser?.friends ?? INITIAL_FRIENDS;
  const chatHistory = appUser?.chatHistory ?? [];

  const value = { firebaseUser, appUser, setAppUser, loading, signOut, friends, setFriends, chatHistory, addChatMessage };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
