
// src/context/AuthContext.tsx
'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import type { User, PetCustomization } from '@/lib/types';

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  appUser: User | null;
  setAppUser: (user: User | null) => void;
  loading: boolean;
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      if (user && user.displayName) {
          // User is logged in and has completed onboarding
          const storedMembership = localStorage.getItem(`energysync_membership_${user.uid}`) || '"free"';
          const storedPetCustomization = localStorage.getItem(`energysync_pet_customization_${user.uid}`);
          const storedPetLevel = localStorage.getItem(`energysync_pet_level_${user.uid}`) || '1';
          const storedPetExp = localStorage.getItem(`energysync_pet_exp_${user.uid}`) || '0';
          const storedPetName = localStorage.getItem(`energysync_pet_name_${user.uid}`) || 'Buddy';
          const storedPetType = localStorage.getItem(`energysync_pet_type_${user.uid}`) || 'dog';
          const storedPetEnabled = localStorage.getItem(`energysync_pet_enabled_${user.uid}`) || 'true';

          setLocalAppUser({
              name: user.displayName,
              membershipTier: JSON.parse(storedMembership),
              petCustomization: storedPetCustomization ? JSON.parse(storedPetCustomization) : defaultPetCustomization,
              petLevel: JSON.parse(storedPetLevel),
              petExp: JSON.parse(storedPetExp),
              petName: storedPetName,
              petType: storedPetType as 'cat' | 'dog' | 'horse' | 'chicken',
              petEnabled: JSON.parse(storedPetEnabled),
          });
      } else {
        // User is not logged in or has not completed onboarding
        setLocalAppUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const setAppUser = useCallback((user: User | null) => {
    setLocalAppUser(user);
    if (user && firebaseUser) {
        localStorage.setItem(`energysync_membership_${firebaseUser.uid}`, JSON.stringify(user.membershipTier));
        localStorage.setItem(`energysync_pet_customization_${firebaseUser.uid}`, JSON.stringify(user.petCustomization));
        localStorage.setItem(`energysync_pet_level_${firebaseUser.uid}`, JSON.stringify(user.petLevel));
        localStorage.setItem(`energysync_pet_exp_${firebaseUser.uid}`, JSON.stringify(user.petExp));
        localStorage.setItem(`energysync_pet_name_${firebaseUser.uid}`, user.petName);
        localStorage.setItem(`energysync_pet_type_${firebaseUser.uid}`, user.petType);
        localStorage.setItem(`energysync_pet_enabled_${firebaseUser.uid}`, JSON.stringify(user.petEnabled));
    }
  }, [firebaseUser]);

  const value = { firebaseUser, appUser, setAppUser, loading };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
