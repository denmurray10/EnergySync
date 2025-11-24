
// src/context/AuthContext.tsx
'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useRef } from 'react';
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
  addChatMessage: (message: ChatMessage, callback?: (history: ChatMessage[]) => void) => void;
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

// Helper function to remove undefined values from an object recursively
const removeUndefineds = (obj: any): any => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => removeUndefineds(item));
  }

  const newObj: any = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key) && obj[key] !== undefined) {
      newObj[key] = removeUndefineds(obj[key]);
    }
  }
  return newObj;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [localAppUser, setLocalAppUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        try {
          const userRef = doc(firestore, 'users', user.uid);
          let userSnap = await getDoc(userRef);

          // Retry logic to handle race condition on signup
          if (!userSnap.exists()) {
            const isNewUser = user.metadata.creationTime ?
              (new Date().getTime() - new Date(user.metadata.creationTime).getTime() < 10000)
              : false;

            if (isNewUser) {
              console.log("New user detected, retrying profile fetch...");
              await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
              userSnap = await getDoc(userRef);
            }
          }

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
            // This path is now only hit if the user exists in Auth but truly has no profile document.
            console.error(`Profile document not found for existing user ${'user.uid'}.`);
            toast({
              title: 'Profile Not Found',
              description: "We couldn't find your user profile. Please try signing up again.",
              variant: 'destructive',
            });
            await auth.signOut();
            setLocalAppUser(null);
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
        const cleanedUpdateData = removeUndefineds(userData);
        await updateDoc(userRef, cleanedUpdateData);
      } else {
        const cleanedSetData = removeUndefineds(userData);
        await setDoc(userRef, cleanedSetData);
      }
      setLocalAppUser(prev => prev ? { ...prev, ...userData } : (userData as User));

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

  const localAppUserRef = useRef<User | null>(null);
  const latestChatHistoryRef = useRef<ChatMessage[]>([]);

  useEffect(() => {
    localAppUserRef.current = localAppUser;
    // Only sync if ref is empty to avoid overwriting optimistic updates with stale state
    if (localAppUser?.chatHistory && latestChatHistoryRef.current.length === 0) {
      latestChatHistoryRef.current = localAppUser.chatHistory;
    }
  }, [localAppUser]);

  const addChatMessage = useCallback(async (message: ChatMessage, callback?: (history: ChatMessage[]) => void) => {
    // Use the ref for the most up-to-date history, falling back to state or empty array
    const currentHistory = latestChatHistoryRef.current;
    const newHistory = [...currentHistory, message];

    // Update ref immediately to handle rapid successive calls
    latestChatHistoryRef.current = newHistory;

    // Update local state first for instant UI feedback, then persist.
    setLocalAppUser(prev => prev ? { ...prev, chatHistory: newHistory } : null);

    // Execute the callback with the most up-to-date history
    if (callback) {
      callback(newHistory);
    }

    try {
      if (auth.currentUser) {
        const userRef = doc(firestore, 'users', auth.currentUser.uid);
        await updateDoc(userRef, { chatHistory: newHistory });
      }
    } catch (e) {
      console.error("Failed to persist chat history", e);
      // Optionally rollback state or show an error
    }
  }, []);

  const setFriends = useCallback(async (friends: Friend[]) => {
    if (localAppUser) {
      await setAppUser({ friends });
    }
  }, [localAppUser, setAppUser]);

  const setPetTasks = useCallback(async (tasks: PetTask[]) => {
    if (localAppUser) {
      await setAppUser({ petTasks: tasks });
    }
  }, [localAppUser, setAppUser]);

  const setActivities = useCallback(async (activities: Activity[]) => {
    if (localAppUser) {
      await setAppUser({ activities });
    }
  }, [localAppUser, setAppUser]);

  const setUpcomingEvents = useCallback(async (events: UpcomingEvent[]) => {
    if (localAppUser) {
      await setAppUser({ upcomingEvents: events });
    }
  }, [localAppUser, setAppUser]);

  const setReminders = useCallback(async (reminders: Reminder[]) => {
    if (localAppUser) {
      await setAppUser({ reminders });
    }
  }, [localAppUser, setAppUser]);


  const addJourneyEntry = useCallback(async (text: string, icon: string) => {
    if (localAppUser) {
      const newEntry: JourneyEntry = {
        text, icon, timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
      };
      const newJourneys = [newEntry, ...(localAppUser.journeys || [])].slice(0, 50); // Keep last 50
      await setAppUser({ journeys: newJourneys });
    }
  }, [localAppUser, setAppUser]);

  const gainPetExp = useCallback((amount: number) => {
    if (!localAppUser || !localAppUser.petEnabled) return;

    const newExp = (localAppUser.petExp || 0) + amount;
    const expToNextLevel = 100 * (localAppUser.petLevel || 1);

    if (newExp >= expToNextLevel) {
      const newLevel = localAppUser.petLevel + 1;
      const remainingExp = newExp - expToNextLevel;
      toast({
        title: '🎉 Pet Level Up! 🎉',
        description: `Your energy companion grew to Level ${newLevel}!`,
      });
      setAppUser({ petLevel: newLevel, petExp: remainingExp });
    } else {
      setAppUser({ petExp: newExp });
    }
  }, [localAppUser, setAppUser, toast]);

  const signOut = async () => {
    await auth.signOut();
    setLocalAppUser(null);
    setFirebaseUser(null);
  };

  const friends = localAppUser?.friends ?? INITIAL_FRIENDS;
  const chatHistory = localAppUser?.chatHistory ?? [];
  const petTasks = localAppUser?.petTasks ?? INITIAL_PET_TASKS;
  const activities = localAppUser?.activities ?? INITIAL_ACTIVITIES;
  const upcomingEvents = localAppUser?.upcomingEvents ?? INITIAL_UPCOMING_EVENTS;
  const reminders = localAppUser?.reminders ?? [];

  const value = { firebaseUser, appUser: localAppUser, setAppUser, loading, signOut, friends, setFriends, chatHistory, addChatMessage, petTasks, setPetTasks, gainPetExp, addJourneyEntry, activities, setActivities, upcomingEvents, setUpcomingEvents, reminders, setReminders };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
