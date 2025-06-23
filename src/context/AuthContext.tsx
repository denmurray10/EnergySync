// src/context/AuthContext.tsx
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import type { User, PetCustomization } from '@/lib/types';

interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
  appUser: User | null;
  setAppUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const defaultPetCustomization: PetCustomization = {
    color: '#a8a29e', // stone-400
    accessory: 'none' as const,
    background: 'default' as const,
    unlockedColors: ['#a8a29e'],
    unlockedAccessories: ['none'],
    unlockedBackgrounds: ['default'],
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [appUser, setAppUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) {
          if (user.displayName) {
              const petCustomizationData = localStorage.getItem(`energysync_pet_customization_${user.uid}`);
              const membershipTierData = localStorage.getItem(`energysync_membership_${user.uid}`);
              setAppUser({
                  name: user.displayName,
                  membershipTier: membershipTierData ? JSON.parse(membershipTierData) : 'free',
                  petCustomization: petCustomizationData ? JSON.parse(petCustomizationData) : defaultPetCustomization,
              });
          }
      } else {
          setAppUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = { user, loading, appUser, setAppUser };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
