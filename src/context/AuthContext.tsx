
// src/context/AuthContext.tsx
'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { getDoc, setDoc, updateDoc, doc } from 'firebase/firestore';
import { auth, firestore } from '@/lib/firebase';
import type { User, Friend, ChatMessage, PetTask, JourneyEntry, Activity, UpcomingEvent, Reminder } from '@/lib/types';
import { INITIAL_FRIENDS, INITIAL_PET_TASKS, INITIAL_ACTIVITIES, INITIAL_UPCOMING_EVENTS } from '@/lib/data';
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
  petTasks: PetTask[];
  setPetTasks: (tasks: PetTask[]) => void;
  gainPetExp: (amount: number) => void;
  addJourneyEntry: (text: string, icon: string) => void;
  activities: Activity[];
  setActivities: (activities: Activity[]) => void;
  upcomingEvents: UpcomingEvent[];
  setUpcomingEvents: (events: UpcomingEvent[]) => void;
  reminders: Reminder[];
  setReminders: (reminders: Reminder[]) => void;
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
            const userData = userSnap.data() as User;
             // Ensure essential arrays are initialized if they are missing
            if (!userData.activities) userData.activities = INITIAL_ACTIVITIES;
            if (!userData.upcomingEvents) userData.upcomingEvents = INITIAL_UPCOMING_EVENTS;
            if (!userData.friends) userData.friends = INITIAL_FRIENDS;
            if (!userData.petTasks) userData.petTasks = INITIAL_PET_TASKS;
            if (!userData.chatHistory) userData.chatHistory = [];
            if (!userData.journeys) userData.journeys = [];
            if (!userData.reminders) userData.reminders = [];
            setLocalAppUser(userData);
          } else {
            const creationTime = new Date(user.metadata.creationTime!).getTime();
            const lastSignInTime = new Date(user.metadata.lastSignInTime!).getTime();
            
            if (lastSignInTime - creationTime < 5000) {
              setLocalAppUser(null);
            } else {
              console.error(`Profile document not found for existing user ${user.uid}.`);
              toast({
                title: 'Profile Not Found',
                description: "We couldn't find your user profile. Please try signing up again.",
                variant: 'destructive',
              });
              await auth.signOut();
              setLocalAppUser(null);
            }
          }
        } catch (error: any) {
            console.error("Error fetching user document from Firestore:", error);
            if (error.code === 'permission-denied') {
                toast({
                    title: 'Action Required: Enable Firestore API',
                    description: "Your app is connected, but the Firestore API is disabled in Google Cloud. Please enable it to proceed.",
                    variant: 'destructive',
                    duration: 10000,
                });
            } else {
                toast({
                    title: 'Could not load profile',
                    description: `There was a problem fetching your user data. Please try logging in again.`,
                    variant: 'destructive',
                });
            }
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
      return;
    }

    const userRef = doc(firestore, 'users', userId);
    
    try {
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        await updateDoc(userRef, userData);
        setLocalAppUser(prev => prev ? { ...prev, ...userData } as User : null);
      } else {
        await setDoc(userRef, { ...userData } as User);
        setLocalAppUser({ ...userData } as User);
      }
    } catch (error: any) {
      console.error("Firestore operation failed in setAppUser:", error);
      if (error.code === 'permission-denied') {
        toast({
            title: 'Action Required: Enable Firestore API',
            description: "Your app is connected, but the Firestore API is disabled in Google Cloud. Please enable it to proceed.",
            variant: 'destructive',
            duration: 10000,
        });
      } else {
        toast({
          title: 'Save Failed',
          description: `There was a problem saving your data. Error: ${error.message}`,
          variant: 'destructive'
        });
      }
      throw error;
    }
  }, [toast]);
  
  const addChatMessage = useCallback(async (message: ChatMessage) => {
    if (appUser) {
        const newHistory = [...(appUser.chatHistory || []), message];
        await setAppUser({ chatHistory: newHistory });
    }
  }, [appUser, setAppUser]);
  
  const setFriends = useCallback(async (friends: Friend[]) => {
      if(appUser) {
          await setAppUser({ friends });
      }
  }, [appUser, setAppUser]);
  
  const setPetTasks = useCallback(async (tasks: PetTask[]) => {
      if(appUser) {
          await setAppUser({ petTasks: tasks });
      }
  }, [appUser, setAppUser]);
  
  const setActivities = useCallback(async (activities: Activity[]) => {
      if(appUser) {
          await setAppUser({ activities });
      }
  }, [appUser, setAppUser]);
  
  const setUpcomingEvents = useCallback(async (events: UpcomingEvent[]) => {
      if(appUser) {
         await setAppUser({ upcomingEvents: events });
      }
  }, [appUser, setAppUser]);
  
  const setReminders = useCallback(async (reminders: Reminder[]) => {
      if(appUser) {
         await setAppUser({ reminders });
      }
  }, [appUser, setAppUser]);


  const addJourneyEntry = useCallback(async (text: string, icon: string) => {
    if (appUser) {
        const newEntry: JourneyEntry = {
            text, icon, timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
        };
        const newJourneys = [newEntry, ...(appUser.journeys || [])].slice(0, 50); // Keep last 50
        await setAppUser({ journeys: newJourneys });
    }
  }, [appUser, setAppUser]);
  
  const gainPetExp = useCallback((amount: number) => {
    if (!appUser || !appUser.petEnabled) return;
    
    const newExp = (appUser.petExp || 0) + amount;
    const expToNextLevel = 100 * (appUser.petLevel || 1);
    
    if (newExp >= expToNextLevel) {
        const newLevel = appUser.petLevel + 1;
        const remainingExp = newExp - expToNextLevel;
        toast({
            title: '🎉 Pet Level Up! 🎉',
            description: `Your energy companion grew to Level ${newLevel}!`,
        });
        setAppUser({ petLevel: newLevel, petExp: remainingExp });
    } else {
        setAppUser({ petExp: newExp });
    }
  }, [appUser, setAppUser, toast]);

  const signOut = async () => {
    await auth.signOut();
    setLocalAppUser(null);
    setFirebaseUser(null);
  };

  const friends = appUser?.friends ?? INITIAL_FRIENDS;
  const chatHistory = appUser?.chatHistory ?? [];
  const petTasks = appUser?.petTasks ?? INITIAL_PET_TASKS;
  const activities = appUser?.activities ?? INITIAL_ACTIVITIES;
  const upcomingEvents = appUser?.upcomingEvents ?? INITIAL_UPCOMING_EVENTS;
  const reminders = appUser?.reminders ?? [];

  const value = { firebaseUser, appUser, setAppUser, loading, signOut, friends, setFriends, chatHistory, addChatMessage, petTasks, setPetTasks, gainPetExp, addJourneyEntry, activities, setActivities, upcomingEvents, setUpcomingEvents, reminders, setReminders };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
