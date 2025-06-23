
// src/context/AuthContext.tsx
'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import type { User, PetCustomization } from '@/lib/types';

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  appUser: User | null;
  setAppUser: (user: Partial<User>) => void;
  loading: boolean;
  signOut: () => Promise<void>;
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

  // Load user data from localStorage
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      if (user) {
        // User is logged in, try to load app user data from localStorage
        const storedUser = localStorage.getItem(`energysync_user_${user.uid}`);
        if (storedUser) {
          setLocalAppUser(JSON.parse(storedUser));
        } else if (user.displayName) {
          // Fallback: If user has a display name but no stored data (e.g., first login after onboarding)
          const newUser: User = {
            userId: user.uid,
            name: user.displayName,
            avatar: user.photoURL || `https://placehold.co/100x100.png`,
            membershipTier: 'free',
            petCustomization: defaultPetCustomization,
            petLevel: 1,
            petExp: 0,
            petName: 'Buddy',
            petType: 'dog',
            petEnabled: true,
          };
          setLocalAppUser(newUser);
          localStorage.setItem(`energysync_user_${user.uid}`, JSON.stringify(newUser));
        }
      } else {
        // User is logged out
        setLocalAppUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const setAppUser = useCallback((updatedData: Partial<User>) => {
    if (firebaseUser) {
      setLocalAppUser(prevUser => {
        // If prevUser is null (e.g., during onboarding), updatedData is the full new user object
        const newUser = prevUser ? { ...prevUser, ...updatedData } : updatedData as User;
        localStorage.setItem(`energysync_user_${firebaseUser.uid}`, JSON.stringify(newUser));
        return newUser;
      });
    }
  }, [firebaseUser]);
  
  const signOut = async () => {
    await auth.signOut();
    if(firebaseUser) {
        localStorage.removeItem(`energysync_user_${firebaseUser.uid}`);
    }
    setLocalAppUser(null);
  };

  const value = { firebaseUser, appUser, setAppUser, loading, signOut };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
