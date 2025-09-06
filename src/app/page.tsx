

"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from 'next/navigation';
import type { Activity, UpcomingEvent, Achievement, User, Goal, Challenge, ReadinessReport, ChatMessage, ActionableSuggestion, EnergyForecastData, PetTask, PetCustomization, EnergyHotspotAnalysis, Friend } from "@/lib/types";
import { INITIAL_ACHIEVEMENTS, INITIAL_GOALS, INITIAL_CHALLENGES } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { getProactiveSuggestion } from "@/ai/flows/proactive-suggestion-flow";
import { getReadinessScore } from "@/ai/flows/readiness-score-flow";
import { getEnergyStory } from "@/ai/flows/energy-story-flow";
import { chatWithCoach } from "@/ai/flows/conversational-coach-flow";
import { suggestGoals } from "@/ai/flows/suggest-goals-flow";
import { getEnergyForecast } from "@/ai/flows/energy-forecast-flow";
import { analyzeEnergyHotspots } from "@/ai/flows/energy-hotspot-flow";
import { subDays, startOfDay } from 'date-fns';

import { useAuth } from "@/context/AuthContext";
import { HomeTab } from "@/components/home-tab";
import { ActivitiesTab } from "@/components/activities-tab";
import { InsightsTab } from "@/components/insights-tab";
import { ProfileTab } from "@/components/profile-tab";
import { PetTab } from "@/components/pet-tab";
import { BottomNav } from "@/components/bottom-nav";
import { RechargeModal } from "@/components/recharge-modal";
import { VoiceCheckinModal } from "@/components/voice-checkin-modal";
import { WeeklyReportModal } from "@/components/weekly-report-modal";
import { AddActivityModal } from "@/components/add-activity-modal";
import { TutorialModal } from "@/components/tutorial-modal";
import { DailyDebriefModal } from "@/components/daily-debrief-modal";
import { ChatCoachModal } from "@/components/chat-coach-modal";
import { ImageCheckinModal } from "@/components/image-checkin-modal";
import { AddEventModal } from "@/components/add-event-modal";
import { PetCustomizationModal } from "@/components/pet-customization-modal";
import { PetSettingsModal } from "@/components/pet-settings-modal";
import { LoaderCircle } from "lucide-react";
import { AgeGateModal } from "@/components/age-gate-modal";
import { QRCodeModal } from "@/components/qr-code-modal";
import { ReadinessSurveyModal } from "@/components/readiness-survey-modal";
import { ParentalControlModal } from "@/components/parental-control-modal";
import { MembershipModal } from "@/components/membership-modal";


const locations = ['Home', 'School'];

export default function HomePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { 
      firebaseUser, appUser, setAppUser, loading: authLoading, 
      friends, setFriends, chatHistory, addChatMessage, signOut, 
      petTasks, setPetTasks, gainPetExp, addJourneyEntry,
      activities, setActivities, upcomingEvents, setUpcomingEvents
  } = useAuth();
  
  const [showTutorial, setShowTutorial] = useState(false);
  
  const [currentEnergy, setCurrentEnergy] = useState(75);
  const [energyDebt, setEnergyDebt] = useState(15);
  const [activeTab, setActiveTab] = useState("home");

  const [modals, setModals] = useState({
    recharge: false,
    voiceCheckIn: false,
    weeklyReport: false,
    addActivity: false,
    dailyDebrief: false,
    chatCoach: false,
    imageCheckin: false,
    addEvent: false,
    petCustomization: false,
    petSettings: false,
    qrCode: false,
    readinessSurvey: false,
    parentalControls: false,
    membership: false,
  });

  const [communityMode, setCommunityMode] = useState(false);
  const [achievements, setAchievements] = useState<Achievement[]>(INITIAL_ACHIEVEMENTS);
  const [selfCareStreak, setSelfCareStreak] = useState(5);

  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [actionableSuggestion, setActionableSuggestion] = useState<ActionableSuggestion | null>(null);
  const [isSuggestionLoading, setIsSuggestionLoading] = useState(true);
  
  const [goals, setGoals] = useState<Goal[]>(INITIAL_GOALS);
  const [challenges, setChallenges] = useState<Challenge[]>(INITIAL_CHALLENGES);
  const [isGoalsLoading, setIsGoalsLoading] = useState(false);
  
  const [locationIndex, setLocationIndex] = useState(0);
  const currentUserLocation = locations[locationIndex];

  // Advanced features state
  const [readinessReport, setReadinessReport] = useState<ReadinessReport | null>(null);
  const [isReadinessLoading, setIsReadinessLoading] = useState(false);
  const [energyStory, setEnergyStory] = useState<string | null>(null);
  const [isStoryLoading, setIsStoryLoading] = useState(false);
  const [isChatting, setIsChatting] = useState(false);
  const [energyForecast, setEnergyForecast] = useState<EnergyForecastData[] | null>(null);
  const [isForecastLoading, setIsForecastLoading] = useState(false);
  const [energyHotspots, setEnergyHotspots] = useState<EnergyHotspotAnalysis | null>(null);
  const [isHotspotsLoading, setIsHotspotsLoading] = useState(false);
  const [isParentModeUnlocked, setIsParentModeUnlocked] = useState(false);

  // Pet feature state
  const [petInteractions, setPetInteractions] = useState<number>(0);
  
  const petHappiness = currentEnergy;

  const showToast = useCallback((title: string, description: string, icon: string = '✨') => {
    // Defer toast to avoid state updates during render
    setTimeout(() => {
        toast({
            title: `${icon} ${title}`,
            description: description,
        });
    }, 0);
  }, [toast]);

  const unlockAchievement = useCallback((name: string) => {
    let achievementAlreadyUnlocked = false;
    let achievementExists = false;
    let achievementName = '';
    let achievementIcon = '✨';

    setAchievements(prevAchievements => {
        const achievement = prevAchievements.find((a) => a.name === name);
        if (achievement) {
            achievementExists = true;
            achievementName = achievement.name;
            achievementIcon = achievement.icon;
            if (achievement.unlocked) {
                achievementAlreadyUnlocked = true;
                return prevAchievements;
            }
            return prevAchievements.map(a => (a.name === name ? { ...a, unlocked: true } : a));
        }
        return prevAchievements;
    });

    if (achievementExists && !achievementAlreadyUnlocked) {
        showToast(`Achievement Unlocked!`, `You've earned: ${achievementName}`, achievementIcon);
    }
  }, [showToast]);


  // REDIRECT AND ONBOARDING LOGIC
  useEffect(() => {
    if (!authLoading && !firebaseUser) {
      router.push('/welcome');
    }
  }, [firebaseUser, authLoading, router]);
  
  useEffect(() => {
    if (appUser && !appUser.tutorialSeen) {
        setShowTutorial(true);
    }
  }, [appUser]);


  const isProMember = useMemo(() => {
    if (!appUser) return false;
    if (appUser.membershipTier === 'pro') return true;
    if (appUser.proTrialEndDate) {
        return new Date(appUser.proTrialEndDate) > new Date();
    }
    return false;
  }, [appUser]);
  
  const fetchProactiveSuggestion = useCallback(async () => {
    if (!isProMember || (appUser?.ageGroup !== 'under14' && !appUser?.petEnabled)) {
        setAiSuggestion(null);
        setIsSuggestionLoading(false);
        return;
    }
    setIsSuggestionLoading(true);
    try {
      const recentActivities = activities.slice(0, 5);
      const result = await getProactiveSuggestion({ 
        currentEnergy, 
        upcomingEvents, 
        recentActivities,
        currentUserLocation
      });
      setAiSuggestion(result.suggestion);
      setActionableSuggestion(result.action || null);
    } catch (error) {
      console.error("Failed to get proactive suggestion:", error);
      setAiSuggestion("Could not load a suggestion at this time.");
      setActionableSuggestion(null);
    } finally {
      setIsSuggestionLoading(false);
    }
  }, [activities, upcomingEvents, currentEnergy, currentUserLocation, isProMember, appUser]);
  
  const fetchEnergyForecast = useCallback(async () => {
    if (!isProMember || !readinessReport) return;
    setIsForecastLoading(true);
    try {
      const result = await getEnergyForecast({
        readinessReport,
        currentEnergy,
        upcomingEvents: upcomingEvents.filter(e => e.date === 'Today' || e.date === 'Tonight'),
        recentActivities: activities.slice(0, 10),
      });
      setEnergyForecast(result);
    } catch (error) {
      console.error("Failed to get energy forecast:", error);
      setEnergyForecast(null);
       toast({
        title: "Forecast Failed",
        description: "Could not generate your energy forecast.",
        variant: "destructive",
      });
    } finally {
      setIsForecastLoading(false);
    }
  }, [isProMember, readinessReport, currentEnergy, upcomingEvents, activities, toast]);

  const fetchEnergyHotspots = useCallback(async () => {
    if (!isProMember) return;
    setIsHotspotsLoading(true);
    try {
        const result = await analyzeEnergyHotspots({ activities });
        setEnergyHotspots(result);
    } catch (error) {
        console.error("Failed to analyze energy hotspots:", error);
        setEnergyHotspots(null);
        toast({
            title: "Analysis Failed",
            description: "Could not analyze your energy hotspots.",
            variant: "destructive",
        });
    } finally {
        setIsHotspotsLoading(false);
    }
}, [isProMember, activities, toast]);

  useEffect(() => {
    if (activeTab === 'home' && appUser) {
      fetchProactiveSuggestion();
      if(readinessReport) {
        fetchEnergyForecast();
      }
    }
    if (activeTab === 'insights' && appUser?.featureVisibility?.insights) {
        fetchEnergyHotspots();
    }
  }, [activeTab, appUser, fetchProactiveSuggestion, readinessReport, fetchEnergyForecast, fetchEnergyHotspots]);

  const handleTierChange = (newTier: 'free' | 'pro') => {
    if (appUser) {
        setAppUser({ membershipTier: newTier, proTrialEndDate: null });
        toast({
            title: `Membership Updated!`,
            description: `You are now on the ${newTier === 'pro' ? 'Pro' : 'Free'} plan.`,
        });
        if (newTier === 'pro') {
            unlockAchievement('Upgraded to Pro!');
        }
    }
  };

  const handleTogglePet = (enabled: boolean) => {
    if (appUser) {
      setAppUser({ petEnabled: enabled });
      if (!enabled && activeTab === 'pet') {
        setActiveTab('home');
      }
    }
  };
  
  const handleTutorialComplete = () => {
    setShowTutorial(false);
    setAppUser({ tutorialSeen: true });
  };

  const handleShowTutorial = () => {
    setShowTutorial(true);
  };
  
  const handleUpdateUser = (updatedData: Partial<User>) => {
    if(appUser) {
      setAppUser(updatedData);
      if (updatedData.avatar) {
        const userIndex = friends.findIndex(f => f.isMe);
        if (userIndex !== -1) {
            const newFriends = [...friends];
            newFriends[userIndex] = { ...newFriends[userIndex], avatar: updatedData.avatar! };
            setFriends(newFriends);
        }
      }
    }
  };

  const handleLogActivity = (newActivityData: Omit<Activity, 'id' | 'date' | 'autoDetected' | 'recoveryTime'>) => {
    const newActivity: Activity = {
      ...newActivityData,
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      autoDetected: false,
      recoveryTime: 0,
    };
    const newActivities = [newActivity, ...activities].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setActivities(newActivities);
    
    showToast('Activity Logged!', `Great job logging '${newActivity.name}'!`, '📝');
    unlockAchievement('Mindful Logger');

    if (newActivity.impact > 0) {
        gainPetExp(newActivity.impact);
    }

    closeModal('addActivity');
    closeModal('imageCheckin'); // Close image modal if it was used
  };

  const handleDeleteActivity = (activityId: number) => {
    const newActivities = activities.filter(activity => activity.id !== activityId);
    setActivities(newActivities);
    toast({
      title: "Activity Deleted",
      description: "The activity has been removed from your history.",
    });
  };

  const handleLogEvent = (newEventData: Omit<UpcomingEvent, 'id' | 'conflictRisk' | 'bufferSuggested'>) => {
    const newEvent: UpcomingEvent = {
        ...newEventData,
        id: Date.now(),
        conflictRisk: 'low', // Default value
        bufferSuggested: 0 // Default value
    };
    const newEvents = [...upcomingEvents, newEvent];
    setUpcomingEvents(newEvents);
    toast({
        title: "Event Added!",
        description: `"${newEvent.name}" is now on your schedule.`,
    });
    closeModal('addEvent');
  };

  const handleDeleteEvent = (eventId: number) => {
    const newEvents = upcomingEvents.filter(event => event.id !== eventId);
    setUpcomingEvents(newEvents);
    toast({
      title: "Event Deleted",
      description: "The event has been removed from your schedule.",
    });
  };

  const handleRecharge = (rechargeAmount: number, debtReduction: number) => {
    const wasInDebt = energyDebt > 0;
    setCurrentEnergy(prev => Math.min(100, prev + rechargeAmount));
    setEnergyDebt(prev => Math.max(0, prev - debtReduction));

    if (wasInDebt && (energyDebt - debtReduction) <= 0) {
      showToast("Energy Debt Cleared!", "You're back in the green.", "🎉");
      unlockAchievement('Self-Care Pro');
    } else {
      showToast(`Energy Recharged!`, `+${rechargeAmount}% Energy`, '🔋');
    }
    gainPetExp(rechargeAmount);
  };

  const handleCustomRecharge = (rechargeData: Omit<Activity, 'id' | 'date' | 'autoDetected' | 'recoveryTime'>) => {
    const newActivity: Activity = {
        ...rechargeData,
        id: Date.now(),
        date: new Date().toISOString().split('T')[0],
        autoDetected: false,
        recoveryTime: 0,
    };
    const newActivities = [newActivity, ...activities].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setActivities(newActivities);
    handleRecharge(newActivity.impact, newActivity.impact);
    closeModal('recharge');
  };

  const getEnergyStatus = (energy: number) => {
    if (energy >= 80) return "Feeling great 🌟";
    if (energy >= 50) return "Doing okay 😊";
    if (energy >= 20) return "Running on low 😴";
    return "Need to recharge 🔋";
  };

  const handleShareStatus = () => {
    if (!appUser) return;
  
    const meFriend: Friend = {
      id: appUser.userId,
      name: appUser.name,
      avatar: appUser.avatar || 'https://placehold.co/100x100.png',
      avatarHint: 'profile picture',
      energyStatus: getEnergyStatus(currentEnergy),
      currentEnergy: currentEnergy,
      isMe: true,
      hasUpdatedToday: true,
    };

    const otherFriends = friends.filter(f => !f.isMe);
    setFriends([meFriend, ...otherFriends]);

    toast({
      title: 'Status Shared',
      description: 'Your status is now at the top of your Friend Network.',
    });
    
    if (appUser?.featureVisibility?.insights) {
        setActiveTab('insights');
    }
  };

  const openModal = (modalName: keyof typeof modals) => setModals(prev => ({ ...prev, [modalName]: true }));
  const closeModal = (modalName: keyof typeof modals) => setModals(prev => ({ ...prev, [modalName]: false }));

  const handleVoiceCheckinComplete = (result: { energyImpact: number; summary: string }) => {
    setCurrentEnergy(prev => Math.max(0, Math.min(100, prev + result.energyImpact)));
    const toastMessage = `${result.energyImpact > 0 ? '+' : ''}${result.energyImpact}% - ${result.summary}`;
    showToast('Voice Check-in Complete', toastMessage, '🎤');
    if (result.energyImpact > 0) {
        gainPetExp(result.energyImpact);
    }
    closeModal('voiceCheckIn');
  };

  const toggleCommunityMode = (isOn: boolean) => {
    setCommunityMode(isOn);
    if (isOn) {
      unlockAchievement('Community Member');
    }
  };
  
  const handleScheduleAction = (action: ActionableSuggestion) => {
    if (!action) return;
    const eventName = `(${action.type}) ${action.activityName}`;
    const newEvent: UpcomingEvent = {
        id: Date.now(),
        name: eventName,
        type: 'personal',
        estimatedImpact: action.impact,
        date: 'Today',
        time: 'In your schedule',
        emoji: action.emoji,
        conflictRisk: 'low',
        bufferSuggested: 0
    };
    setUpcomingEvents([...upcomingEvents, newEvent]);
    toast({
        title: "Action Scheduled!",
        description: `We've added "${eventName}" to your smart schedule.`,
    });
    setActionableSuggestion(null); // Clear the suggestion after scheduling
    unlockAchievement('Scheduler Supreme');
  };

  const handleReadinessSurveyComplete = useCallback(async (surveyData: any) => {
    if (!isProMember) return;
    closeModal('readinessSurvey');
    setIsReadinessLoading(true);
    setReadinessReport(null);
    try {
        const recentActivities = activities.slice(0, 3);
        const report = await getReadinessScore({ surveyData, recentActivities });
        setReadinessReport(report);
        toast({
            title: "Readiness Score Calculated!",
            description: "We've analyzed your survey to generate your readiness score.",
        });
        unlockAchievement('Bio-Scanner');
    } catch (error) {
        console.error("Failed to get readiness score:", error);
        toast({ title: "Sync Failed", description: "Could not get readiness score.", variant: "destructive" });
    } finally {
        setIsReadinessLoading(false);
    }
  }, [activities, unlockAchievement, toast, isProMember]);

  const handleShowDebrief = useCallback(async () => {
    if (!isProMember) return;
    openModal('dailyDebrief');
    setIsStoryLoading(true);
    try {
        const yesterday = startOfDay(subDays(new Date(), 1));
        const yesterdayActivities = activities.filter(a => startOfDay(new Date(a.date)).getTime() === yesterday.getTime());
        if (yesterdayActivities.length === 0) {
            setEnergyStory("You didn't log any activities yesterday. Log some today to get your story tomorrow!");
            return;
        }
        const result = await getEnergyStory({ activities: yesterdayActivities });
        setEnergyStory(result.story);
        unlockAchievement('Storyteller');
    } catch (error) {
        console.error("Failed to get energy story:", error);
        setEnergyStory("Could not generate your energy story at this time.");
    } finally {
        setIsStoryLoading(false);
    }
  }, [activities, unlockAchievement, isProMember]);
  
  const handleChatSubmit = useCallback(async (query: string) => {
      if (!isProMember) return;
      
      const userMessage: ChatMessage = { role: 'user', content: query };
      addChatMessage(userMessage);
      setIsChatting(true);
      
      try {
          const result = await chatWithCoach({
              query,
              chatHistory: [...chatHistory, userMessage],
              currentEnergy,
              activities: JSON.stringify(activities.slice(0, 10)),
              events: JSON.stringify(upcomingEvents),
          });
          addChatMessage({ role: 'model', content: result.response });
          unlockAchievement('Chatterbox');
      } catch (error) {
          console.error("Chat error:", error);
          addChatMessage({ role: 'model', content: "Sorry, I'm having trouble connecting right now." });
      } finally {
          setIsChatting(false);
      }
  }, [addChatMessage, chatHistory, currentEnergy, upcomingEvents, activities, unlockAchievement, isProMember]);

  const changeLocation = () => {
    setLocationIndex((prevIndex) => {
        const newIndex = (prevIndex + 1) % locations.length;
        toast({ title: 'Location Changed', description: `Your location is now set to ${locations[newIndex]}.` });
        return newIndex;
    });
  };
  
  const handleGoalComplete = (goalId: number) => {
    const goal = goals.find(g => g.id === goalId);
    if (goal) {
      const wasCompleted = goal.completed;
      setGoals(prev => prev.map(g => g.id === goalId ? { ...g, completed: !g.completed } : g));
      if (!wasCompleted) {
        unlockAchievement('Goal Getter');
        showToast('Goal Complete!', `You've completed: ${goal.name}`, '🎯');
        gainPetExp(50);
      }
    }
  };

  const handleSuggestGoals = useCallback(async () => {
    if (!isProMember) return;
    setIsGoalsLoading(true);
    try {
        const recentActivities = activities.slice(0, 15);
        const currentGoalNames = goals.map(g => ({ name: g.name }));
        const result = await suggestGoals({ activities: recentActivities, currentGoals: currentGoalNames });
        const newGoals = result.goals.map((g, i) => ({ ...g, id: Date.now() + i, completed: false }));
        const newChallenges = result.challenges.map((c, i) => ({ ...c, id: Date.now() + i }));
        setGoals(newGoals);
        setChallenges(newChallenges);
        toast({ title: "Suggestions Loaded!", description: "New AI goals and challenges are ready." });
        unlockAchievement('Goal Setter');
    } catch (error) {
        console.error("Failed to suggest goals:", error);
        toast({ title: "Suggestion Failed", description: "Could not get AI suggestions.", variant: "destructive" });
    } finally {
        setIsGoalsLoading(false);
    }
  }, [activities, goals, isProMember, toast, unlockAchievement]);

  const dynamicInsights = useMemo(() => {
    const drainers = activities.filter(a => a.impact < 0);
    if (drainers.length === 0) return { drainPattern: 'No draining activities logged yet.', rechargePattern: 'Log some activities to see patterns.' };
    const mostDraining = drainers.reduce((max, act) => act.impact < max.impact ? act : max);
    const rechargers = activities.filter(a => a.impact > 0);
    const mostEffectiveRecharge = rechargers.length > 0 ? rechargers.reduce((max, act) => act.impact > max.impact ? act : max) : null;
    return {
      drainPattern: `'${mostDraining.name}' activities seem to be your biggest energy drain (${mostDraining.impact}%).`,
      rechargePattern: mostEffectiveRecharge ? `'${mostEffectiveRecharge.name}' gives you the biggest boost (+${mostEffectiveRecharge.impact}%).` : 'Try logging a recharge activity!'
    };
  }, [activities]);

  const handleTaskComplete = (taskId: number) => {
    if (!appUser) return;
    const task = petTasks.find(t => t.id === taskId);
    if (!task) return;

    const wasCompleted = task.completed;
    
    const newTasks = petTasks.map(t => t.id === taskId ? { ...t, completed: !wasCompleted } : t)
    setPetTasks(newTasks);

    if (!wasCompleted) {
        setPetInteractions(prev => prev + 5);
        gainPetExp(10);
        addJourneyEntry(`Completed task: "${task.name}"`, task.icon);
        toast({ title: "Task Complete!", description: "You've earned 5 interactions & 10 pet XP! 🎉" });
        setAppUser({ lastTaskCompletionTime: Date.now() });
    } else {
        setPetInteractions(prev => Math.max(0, prev - 5));
    }
  };

  const handlePetInteraction = (actionToast: {title: string, description: string}) => {
    if (petInteractions > 0) {
        setPetInteractions(prev => prev - 1);
        toast(actionToast);
        unlockAchievement('Pet Pal');
    }
  };

  const handlePurchaseAndEquipItem = (
    category: 'color' | 'accessory' | 'background' | 'outline', 
    item: string, 
    cost: number
  ) => {
    if (!appUser) return;

    if (petInteractions < cost) {
      toast({ title: 'Not enough interactions!', description: `You need ${cost} interactions to buy this.`, variant: 'destructive' });
      return;
    }

    setPetInteractions(prev => prev - cost);

    const updatedCustomization: PetCustomization = JSON.parse(JSON.stringify(appUser.petCustomization));
    if (category === 'color') {
      updatedCustomization.unlockedColors.push(item);
      updatedCustomization.color = item;
    } else if (category === 'outline') {
      updatedCustomization.unlockedOutlineColors.push(item);
      updatedCustomization.outlineColor = item;
    } else if (category === 'accessory') {
      updatedCustomization.unlockedAccessories.push(item);
      updatedCustomization.accessory = item as 'none' | 'bowtie';
    } else if (category === 'background') {
      updatedCustomization.unlockedBackgrounds.push(item);
      updatedCustomization.background = item as 'default' | 'park' | 'cozy';
    }
    
    setAppUser({ petCustomization: updatedCustomization });
    toast({ title: 'Item Purchased!', description: 'You can equip it from the customization menu.' });
    unlockAchievement('Pet Customizer');
  };

  const handleEquipItem = (
    category: 'color' | 'accessory' | 'background' | 'outline', 
    item: string
  ) => {
    if (!appUser) return;
    const updatedCustomization = { ...appUser.petCustomization };
    if (category === 'color') updatedCustomization.color = item;
    if (category === 'outline') updatedCustomization.outlineColor = item;
    if (category === 'accessory') updatedCustomization.accessory = item as 'none' | 'bowtie';
    if (category === 'background') updatedCustomization.background = item as 'default' | 'park' | 'cozy';
    setAppUser({ petCustomization: updatedCustomization });
    toast({ title: 'Item Equipped!', description: 'Your pet has a new look!' });
  };
  
  const handleSavePetSettings = (newName: string, newType: 'cat' | 'dog' | 'horse' | 'chicken') => {
    if (appUser) {
        setAppUser({ petName: newName, petType: newType });
        toast({ title: 'Pet Updated!', description: `Say hello to your ${newType}, ${newName}!` });
        closeModal('petSettings');
    }
  };
  
  const handlePinSet = (pin: string, email: string) => {
    if (appUser) {
      handleUpdateUser({ parentalPin: pin, parentEmail: email });
      setIsParentModeUnlocked(true); // Unlock automatically after setting
      toast({ title: "Parental PIN Set!", description: "Sensitive settings are now protected." });
      router.push('/parent-dashboard');
    }
  };

  const handlePinVerified = () => {
    setIsParentModeUnlocked(true);
    closeModal('parentalControls');
    toast({ title: "Controls Unlocked", description: "Taking you to the Parent Dashboard." });
    router.push('/parent-dashboard');
  };


  if (authLoading) {
    return (
        <main className="min-h-dvh bg-background flex items-center justify-center">
            <LoaderCircle className="w-12 h-12 animate-spin text-primary" />
        </main>
    );
  }
  
  if (!firebaseUser) {
    // This case is handled by the redirect in the useEffect hook.
    // This UI will be briefly shown while the redirect happens.
    return (
        <main className="min-h-dvh bg-background flex items-center justify-center">
            <LoaderCircle className="w-12 h-12 animate-spin text-primary" />
        </main>
    );
  }

  if (!appUser) {
    // This state means we are logged in with Firebase, but the app user profile
    // from Firestore hasn't loaded yet. This is expected during the first login,
    // so we show a spinner and wait for AuthContext to provide the appUser.
    return (
        <main className="min-h-dvh bg-background flex items-center justify-center">
            <LoaderCircle className="w-12 h-12 animate-spin text-primary" />
        </main>
    );
  }

  return (
    <main className="min-h-dvh bg-background">
      <div className="max-w-md mx-auto bg-card/60 backdrop-blur-lg min-h-dvh shadow-2xl relative">
        <div className="p-4 h-dvh overflow-y-auto pb-32 custom-scrollbar">

          {activeTab === "home" && (
            <HomeTab
              user={appUser}
              isProMember={isProMember}
              ageGroup={appUser.ageGroup}
              currentEnergy={currentEnergy}
              energyDebt={energyDebt}
              upcomingEvents={upcomingEvents}
              communityMode={communityMode}
              setCommunityMode={toggleCommunityMode}
              getEnergyStatus={getEnergyStatus}
              onShareStatus={handleShareStatus}
              openModal={openModal}
              aiSuggestion={aiSuggestion}
              actionableSuggestion={actionableSuggestion}
              handleScheduleAction={handleScheduleAction}
              isSuggestionLoading={isSuggestionLoading}
              currentUserLocation={currentUserLocation}
              changeLocation={changeLocation}
              readinessReport={readinessReport}
              isReadinessLoading={isReadinessLoading}
              onSyncHealth={() => openModal('readinessSurvey')}
              onDeleteEvent={handleDeleteEvent}
              energyForecast={energyForecast}
              isForecastLoading={isForecastLoading}
            />
          )}
          {activeTab === "activities" && (
            <ActivitiesTab
              activities={activities}
              openModal={openModal}
              isProMember={isProMember}
              onDeleteActivity={handleDeleteActivity}
              ageGroup={appUser.ageGroup}
            />
          )}
           {activeTab === 'pet' && appUser.petEnabled && (
              <PetTab
                tasks={petTasks}
                onTaskComplete={handleTaskComplete}
                interactions={petInteractions}
                petHappiness={petHappiness}
                onPetInteraction={handlePetInteraction}
                customization={appUser.petCustomization}
                openCustomization={() => openModal('petCustomization')}
                openSettings={() => openModal('petSettings')}
                level={appUser.petLevel}
                exp={appUser.petExp}
                petName={appUser.petName}
                petType={appUser.petType}
                lastTaskCompletionTime={appUser.lastTaskCompletionTime}
              />
           )}
          {activeTab === "insights" && appUser.featureVisibility?.insights && (
            <InsightsTab
              user={appUser}
              isProMember={isProMember}
              ageGroup={appUser.ageGroup}
              dynamicInsights={dynamicInsights}
              selfCareStreak={selfCareStreak}
              achievements={achievements}
              currentEnergy={currentEnergy}
              activities={activities}
              openModal={openModal}
              goals={goals}
              challenges={challenges}
              onGoalComplete={handleGoalComplete}
              onSuggestGoals={handleSuggestGoals}
              isGoalsLoading={isGoalsLoading}
              energyHotspots={energyHotspots}
              isHotspotsLoading={isHotspotsLoading}
              friends={friends}
            />
          )}
          {activeTab === "profile" && (
            <ProfileTab
              user={appUser}
              onShowTutorial={handleShowTutorial}
              onShowDebrief={handleShowDebrief}
              isProMember={isProMember}
              ageGroup={appUser.ageGroup}
              onTierChange={handleTierChange}
              onTogglePet={handleTogglePet}
              onUpdateUser={handleUpdateUser}
              openModal={openModal}
              isParentModeUnlocked={isParentModeUnlocked}
            />
          )}
        </div>

        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} petEnabled={appUser.petEnabled} featureVisibility={appUser.featureVisibility} />
        
        <RechargeModal
          open={modals.recharge}
          onOpenChange={() => closeModal('recharge')}
          handleRecharge={handleRecharge}
          activities={activities}
          currentEnergy={currentEnergy}
          onCustomRecharge={handleCustomRecharge}
          onLogActivity={handleLogActivity}
          isProMember={isProMember}
          ageGroup={appUser.ageGroup}
        />
        <VoiceCheckinModal
            open={modals.voiceCheckIn}
            onOpenChange={() => closeModal('voiceCheckIn')}
            onCheckinComplete={handleVoiceCheckinComplete}
            ageGroup={appUser.ageGroup}
        />
        <WeeklyReportModal
            open={modals.weeklyReport}
            onOpenChange={() => closeModal('weeklyReport')}
            activities={activities}
            isProMember={isProMember}
            ageGroup={appUser.ageGroup}
        />
        <AddActivityModal
            open={modals.addActivity}
            onOpenChange={() => closeModal('addActivity')}
            onLogActivity={handleLogActivity}
            isProMember={isProMember}
            ageGroup={appUser.ageGroup}
        />
        <TutorialModal
            open={showTutorial}
            onOpenChange={setShowTutorial}
            onComplete={handleTutorialComplete}
            ageGroup={appUser.ageGroup}
        />
        <DailyDebriefModal
          open={modals.dailyDebrief}
          onOpenChange={() => closeModal('dailyDebrief')}
          story={energyStory}
          loading={isStoryLoading}
          isProMember={isProMember}
          ageGroup={appUser.ageGroup}
        />
        <ChatCoachModal
            open={modals.chatCoach}
            onOpenChange={() => closeModal('chatCoach')}
            chatHistory={chatHistory}
            isThinking={isChatting}
            onSendMessage={handleChatSubmit}
            isProMember={isProMember}
            ageGroup={appUser.ageGroup}
        />
        <ImageCheckinModal
            open={modals.imageCheckin}
            onOpenChange={() => closeModal('imageCheckin')}
            onLogActivity={handleLogActivity}
            ageGroup={appUser.ageGroup}
        />
        <AddEventModal
            open={modals.addEvent}
            onOpenChange={() => closeModal('addEvent')}
            onLogEvent={handleLogEvent}
            isProMember={isProMember}
            ageGroup={appUser.ageGroup}
        />
        {appUser && (
            <PetCustomizationModal
                open={modals.petCustomization}
                onOpenChange={() => closeModal('petCustomization')}
                customization={appUser.petCustomization}
                interactions={petInteractions}
                onPurchase={handlePurchaseAndEquipItem}
                onEquip={handleEquipItem}
            />
        )}
        {appUser && (
            <PetSettingsModal
                open={modals.petSettings}
                onOpenChange={() => closeModal('petSettings')}
                currentName={appUser.petName}
                currentType={appUser.petType}
                onSave={handleSavePetSettings}
            />
        )}
        {appUser && (
            <QRCodeModal
                open={modals.qrCode}
                onOpenChange={() => closeModal('qrCode')}
                user={appUser}
            />
        )}
         <AgeGateModal open={false} onSelect={() => {}} />
         <ReadinessSurveyModal
            open={modals.readinessSurvey}
            onOpenChange={() => closeModal('readinessSurvey')}
            onComplete={handleReadinessSurveyComplete}
            isProMember={isProMember}
         />
         {appUser && (
            <ParentalControlModal
                open={modals.parentalControls}
                onOpenChange={(isOpen) => {
                    if (!isOpen) {
                        closeModal('parentalControls');
                    }
                }}
                mode={appUser.parentalPin ? 'verify' : 'set'}
                correctPin={appUser.parentalPin}
                onPinSet={handlePinSet}
                onPinVerified={handlePinVerified}
            />
         )}
         {appUser && (
            <MembershipModal
                open={modals.membership}
                onOpenChange={() => closeModal('membership')}
                onUpgrade={() => handleTierChange('pro')}
                currentTier={appUser.membershipTier}
            />
         )}
      </div>
    </main>
  );
}
