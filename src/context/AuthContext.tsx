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
  setAppUser: (user: User) => Promise<void>;
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
          // Doc doesn't exist. This happens during signup, right before setAppUser is called.
          // We set it to null so the app knows the profile is not yet loaded.
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

  const setAppUser = useCallback(async (userData: User) => {
    // Always get the freshest user from the auth object, not from closure
    const currentUser = auth.currentUser;
    if (!currentUser) {
        console.error("Cannot set user data, no firebase user is available.");
        // This can happen in a race condition, so we'll just wait a moment and try to use the provided uid.
        if (!userData.userId) {
             throw new Error("User not authenticated and no userId provided.");
        }
    }
    
    const userId = currentUser ? currentUser.uid : userData.userId;
    const userRef = doc(firestore, 'users', userId);
    
    // During signup, we are always creating a new document.
    // For updates, we would check if the doc exists first.
    await setDoc(userRef, userData);
    setLocalAppUser(userData);

  }, []);
  
  const addChatMessage = useCallback((message: ChatMessage) => {
    if (appUser) {
        const newHistory = [...(appUser.chatHistory || []), message];
        const userRef = doc(firestore, 'users', appUser.userId);
        updateDoc(userRef, { chatHistory: newHistory });
        setLocalAppUser(prev => prev ? ({ ...prev, chatHistory: newHistory }) : null);
    }
  }, [appUser]);
  
  const setFriends = useCallback((friends: Friend[]) => {
      if(appUser) {
          const userRef = doc(firestore, 'users', appUser.userId);
          updateDoc(userRef, { friends });
          setLocalAppUser(prev => prev ? ({ ...prev, friends }) : null);
      }
  }, [appUser]);


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
