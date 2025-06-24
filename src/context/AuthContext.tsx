
// src/context/AuthContext.tsx
'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import type { User, PetCustomization, Friend, ChatMessage } from '@/lib/types';
import { INITIAL_FRIENDS } from '@/lib/data';

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  appUser: User | null;
  setAppUser: (user: Partial<User>) => void;
  loading: boolean;
  signOut: () => Promise<void>;
  friends: Friend[];
  setFriends: React.Dispatch<React.SetStateAction<Friend[]>>;
  chatHistory: ChatMessage[];
  addChatMessage: (message: ChatMessage) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const defaultPetCustomization: PetCustomization = {
    color: '#a8a29e',
    outlineColor: '#4c51bf',
    accessory: 'none' as const,
    background: 'default' as const,
    unlockedColors: ['#a8a29e'],
    unlockedOutlineColors: ['#4c51bf'],
    unlockedAccessories: ['none'],
    unlockedBackgrounds: ['default'],
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [appUser, setLocalAppUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [friends, setFriends] = useState<Friend[]>(INITIAL_FRIENDS);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

  // Load user data from localStorage
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      if (user) {
        // User is logged in, try to load app user data from localStorage
        const storedUser = localStorage.getItem(`energysync_user_${user.uid}`);
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          if (!parsedUser.featureVisibility) {
            parsedUser.featureVisibility = { insights: true, friends: true, communityMode: true };
          }
          setLocalAppUser(parsedUser);
        } else {
          // If no stored user, set to null to trigger onboarding.
          // We removed the risky fallback logic here.
          setLocalAppUser(null);
        }

        const storedChatHistory = localStorage.getItem(`energysync_chat_${user.uid}`);
        if (storedChatHistory) {
            setChatHistory(JSON.parse(storedChatHistory));
        }

      } else {
        // User is logged out
        setLocalAppUser(null);
        setChatHistory([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const setAppUser = useCallback((updatedData: Partial<User>) => {
    setLocalAppUser(prevUser => {
      const newUser = prevUser ? { ...prevUser, ...updatedData } : updatedData as User;
      // Get UID from the context's logged in user, or from the new data object itself
      const uid = firebaseUser?.uid ?? newUser.userId;

      if (uid) {
        localStorage.setItem(`energysync_user_${uid}`, JSON.stringify(newUser));
      } else {
        console.error("AuthContext: Cannot save user data, UID is missing.");
      }
      
      return newUser;
    });
  }, [firebaseUser]);
  
  const addChatMessage = useCallback((message: ChatMessage) => {
    if (firebaseUser) {
      setChatHistory(prev => {
        const newHistory = [...prev, message];
        localStorage.setItem(`energysync_chat_${firebaseUser.uid}`, JSON.stringify(newHistory));
        return newHistory;
      });
    }
  }, [firebaseUser]);


  const signOut = async () => {
    await auth.signOut();
    if(firebaseUser) {
        localStorage.removeItem(`energysync_user_${firebaseUser.uid}`);
        localStorage.removeItem(`energysync_chat_${firebaseUser.uid}`);
    }
    setLocalAppUser(null);
  };

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
