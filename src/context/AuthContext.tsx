// src/context/AuthContext.tsx
'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, firestore } from '@/lib/firebase';
import type { User, Friend, ChatMessage } from '@/lib/types';
import { INITIAL_FRIENDS } from '@/lib/data';

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  appUser: User | null;
  setAppUser: (user: Partial<User>) => void;
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        // User is logged in, fetch from Firestore
        const userRef = doc(firestore, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setLocalAppUser(userSnap.data() as User);
        } else {
          // Doc doesn't exist. This happens during signup.
          // The signup flow will call setAppUser which will create the doc.
          setLocalAppUser(null);
        }
      } else {
        // User is logged out
        setLocalAppUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const setAppUser = useCallback(async (updatedData: Partial<User>) => {
    if (!firebaseUser) {
        console.error("Cannot set user data, no firebase user logged in.");
        return;
    }

    const userRef = doc(firestore, 'users', firebaseUser.uid);

    setLocalAppUser(prevUser => {
        const newUser = prevUser ? { ...prevUser, ...updatedData } : updatedData as User;
        
        // This is an async operation, but we don't wait for it to complete
        // to keep the UI responsive. This is "fire and forget".
        const saveToFirestore = async () => {
             if (prevUser) {
                 await updateDoc(userRef, updatedData);
            } else {
                await setDoc(userRef, newUser);
            }
        };
        saveToFirestore().catch(console.error);
        
        return newUser;
    });

  }, [firebaseUser]);
  
  const addChatMessage = useCallback((message: ChatMessage) => {
    if (appUser) {
        const newHistory = [...(appUser.chatHistory || []), message];
        setAppUser({ chatHistory: newHistory });
    }
  }, [appUser, setAppUser]);
  
  const setFriends = useCallback((friends: Friend[]) => {
      if(appUser) {
          setAppUser({ friends });
      }
  }, [appUser, setAppUser]);


  const signOut = async () => {
    await auth.signOut();
    setLocalAppUser(null);
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
