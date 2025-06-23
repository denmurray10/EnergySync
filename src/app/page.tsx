"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import type { Activity, UpcomingEvent, Achievement, BiometricData, User, Goal, Challenge, ReadinessReport, ChatMessage, ActionableSuggestion, EnergyForecastData, PetTask } from "@/lib/types";
import { INITIAL_ACTIVITIES, INITIAL_UPCOMING_EVENTS, INITIAL_ACHIEVEMENTS, INITIAL_GOALS, INITIAL_CHALLENGES, INITIAL_PET_TASKS } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { getProactiveSuggestion } from "@/ai/flows/proactive-suggestion-flow";
import { getReadinessScore } from "@/ai/flows/readiness-score-flow";
import { getEnergyStory } from "@/ai/flows/energy-story-flow";
import { chatWithCoach } from "@/ai/flows/conversational-coach-flow";
import { suggestGoals } from "@/ai/flows/suggest-goals-flow";
import { getEnergyForecast } from "@/ai/flows/energy-forecast-flow";
import { subDays, startOfDay, format } from 'date-fns';


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
import { OnboardingScreen } from "@/components/onboarding-screen";
import { TutorialModal } from "@/components/tutorial-modal";
import { DailyDebriefModal } from "@/components/daily-debrief-modal";
import { ChatCoachModal } from "@/components/chat-coach-modal";
import { ImageCheckinModal } from "@/components/image-checkin-modal";
import { AddEventModal } from "@/components/add-event-modal";


const locations = ['Home', 'Office', 'Park', 'Cafe'];

export default function HomePage() {
  const { toast } = useToast();

  const [user, setUser] = useState<User | null>(null);
  const [isOnboarding, setIsOnboarding] = useState(true);
  const [showTutorial, setShowTutorial] = useState(false);

  const [currentEnergy, setCurrentEnergy] = useState(75);
  const [energyDebt, setEnergyDebt] = useState(15);
  const [activeTab, setActiveTab] = useState("home");
  const [biometricData, setBiometricData] = useState<BiometricData>({ heartRate: 72, sleepQuality: 85, stressLevel: 30 });
  const [activities, setActivities] = useState<Activity[]>(INITIAL_ACTIVITIES);
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>(INITIAL_UPCOMING_EVENTS);

  const [modals, setModals] = useState({
    recharge: false,
    voiceCheckIn: false,
    weeklyReport: false,
    addActivity: false,
    dailyDebrief: false,
    chatCoach: false,
    imageCheckin: false,
    addEvent: false,
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

  // New state for advanced features
  const [readinessReport, setReadinessReport] = useState<ReadinessReport | null>(null);
  const [isReadinessLoading, setIsReadinessLoading] = useState(false);
  const [energyStory, setEnergyStory] = useState<string | null>(null);
  const [isStoryLoading, setIsStoryLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isChatting, setIsChatting] = useState(false);
  const [energyForecast, setEnergyForecast] = useState<EnergyForecastData[] | null>(null);
  const [isForecastLoading, setIsForecastLoading] = useState(false);

  // New state for pet feature
  const [petTasks, setPetTasks] = useState<PetTask[]>(INITIAL_PET_TASKS);
  const [petInteractions, setPetInteractions] = useState<number>(0);
  const [petHunger, setPetHunger] = useState(80);
  const [petEnergy, setPetEnergy] = useState(70);
  const [petHygiene, setPetHygiene] = useState(90);

  const petHappiness = useMemo(() => {
    return (petHunger + petEnergy + petHygiene) / 3;
  }, [petHunger, petEnergy, petHygiene]);
  
  useEffect(() => {
    const statDecayInterval = setInterval(() => {
        setPetHunger(h => Math.max(0, h - 1));
        setPetEnergy(e => Math.max(0, e - 0.75));
        setPetHygiene(h => Math.max(0, h - 0.5));
    }, 15000); // Decrease stats every 15 seconds

    return () => clearInterval(statDecayInterval);
  }, []);


  const isProMember = useMemo(() => user?.membershipTier === 'pro', [user]);

  useEffect(() => {
    const storedUser = localStorage.getItem('energysync_user');
    if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        if (!parsedUser.membershipTier) {
            parsedUser.membershipTier = 'free';
        }
        setUser(parsedUser);
        setIsOnboarding(false);
    }
  }, []);

  const fetchProactiveSuggestion = useCallback(async () => {
    if (!isProMember) {
        setAiSuggestion("Upgrade to Pro to get proactive suggestions from your AI coach.");
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
  }, [activities, upcomingEvents, currentEnergy, currentUserLocation, isProMember]);
  
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


  useEffect(() => {
    if (activeTab === 'home') {
      fetchProactiveSuggestion();
      if(readinessReport) {
        fetchEnergyForecast();
      }
    }
  }, [activeTab, fetchProactiveSuggestion, readinessReport, fetchEnergyForecast]);

  const handleOnboardingComplete = (newUser: Omit<User, 'membershipTier'>) => {
    const userWithTier = { ...newUser, membershipTier: 'free' as const };
    setUser(userWithTier);
    setIsOnboarding(false);
    localStorage.setItem('energysync_user', JSON.stringify(userWithTier));

    const hasSeenTutorial = localStorage.getItem('energysync_tutorial_seen');
    if (!hasSeenTutorial) {
      setShowTutorial(true);
    }
  };

  const handleTierChange = (newTier: 'free' | 'pro') => {
    if (user) {
        const updatedUser = { ...user, membershipTier: newTier };
        setUser(updatedUser);
        localStorage.setItem('energysync_user', JSON.stringify(updatedUser));
        toast({
            title: `Membership Updated!`,
            description: `You are now on the ${newTier === 'pro' ? 'Pro' : 'Free'} plan.`,
        });
        if (newTier === 'pro') {
            unlockAchievement('Upgraded to Pro!');
        }
    }
  };

  const handleTutorialComplete = () => {
    setShowTutorial(false);
    localStorage.setItem('energysync_tutorial_seen', 'true');
  };

  const handleLogout = () => {
    localStorage.removeItem('energysync_user');
    localStorage.removeItem('energysync_tutorial_seen'); // Also clear tutorial status
    setUser(null);
    setIsOnboarding(true);
    setActiveTab('home'); // Reset to home tab on logout
    toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out.',
    });
  };

  const handleShowTutorial = () => {
    setShowTutorial(true);
  };

  const showToast = (title: string, description: string, icon: string = '✨') => {
    toast({
      title: `${icon} ${title}`,
      description: description,
    });
  };

  const unlockAchievement = useCallback((name: string) => {
    const isAlreadyUnlocked = achievements.some(a => a.name === name && a.unlocked);
    if (!isAlreadyUnlocked) {
        setAchievements(prev => prev.map(a => a.name === name ? { ...a, unlocked: true } : a));
        const achievement = INITIAL_ACHIEVEMENTS.find(a => a.name === name);
        if (achievement) {
            showToast(`Achievement Unlocked!`, `You've earned: ${achievement.name}`, achievement.icon);
        }
    }
}, [achievements]);
  
  const handleLogActivity = (newActivityData: Omit<Activity, 'id' | 'date' | 'autoDetected' | 'recoveryTime'>) => {
    const newActivity: Activity = {
      ...newActivityData,
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      autoDetected: false,
      recoveryTime: 0,
    };
    setActivities(prev => [newActivity, ...prev].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    showToast('Activity Logged!', `Great job logging '${newActivity.name}'!`, '📝');
    unlockAchievement('Mindful Logger');
    closeModal('addActivity');
    closeModal('imageCheckin'); // Close image modal if it was used
  };

  const handleDeleteActivity = (activityId: number) => {
    setActivities(prev => prev.filter(activity => activity.id !== activityId));
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
    setUpcomingEvents(prev => [...prev, newEvent]);
    toast({
        title: "Event Added!",
        description: `"${newEvent.name}" is now on your schedule.`,
    });
    closeModal('addEvent');
  };

  const handleDeleteEvent = (eventId: number) => {
    setUpcomingEvents(prev => prev.filter(event => event.id !== eventId));
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
  };

  const handleCustomRecharge = (rechargeData: Omit<Activity, 'id' | 'date' | 'autoDetected' | 'recoveryTime'>) => {
    // 1. Log the activity
    const newActivity: Activity = {
        ...rechargeData,
        id: Date.now(),
        date: new Date().toISOString().split('T')[0],
        autoDetected: false,
        recoveryTime: 0,
    };
    setActivities(prev => [newActivity, ...prev].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    
    // 2. Apply recharge (toast is shown here)
    handleRecharge(newActivity.impact, newActivity.impact);

    // 3. Close modal
    closeModal('recharge');
  };

  const getEnergyStatus = (energy: number) => {
    if (energy >= 80) return "Feeling great 🌟";
    if (energy >= 50) return "Doing okay 😊";
    if (energy >= 20) return "Running on low 😴";
    return "Need to recharge 🔋";
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      showToast('Status Copied!', 'Your energy status is ready to be shared.', '📋');
    }).catch(err => {
      console.error('Failed to copy text: ', err);
      showToast('Copy Failed', 'Could not copy status to clipboard.', '❌');
    });
  };

  const openModal = (modalName: keyof typeof modals) => setModals(prev => ({ ...prev, [modalName]: true }));
  const closeModal = (modalName: keyof typeof modals) => setModals(prev => ({ ...prev, [modalName]: false }));

  const handleVoiceCheckinComplete = (result: { energyImpact: number; summary: string }) => {
    setCurrentEnergy(prev => Math.max(0, Math.min(100, prev + result.energyImpact)));
    const toastMessage = `${result.energyImpact > 0 ? '+' : ''}${result.energyImpact}% - ${result.summary}`;
    showToast('Voice Check-in Complete', toastMessage, '🎤');
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
    setUpcomingEvents(prev => [...prev, newEvent]);
    toast({
        title: "Action Scheduled!",
        description: `We've added "${eventName}" to your smart schedule.`,
    });
    setActionableSuggestion(null); // Clear the suggestion after scheduling
    unlockAchievement('Scheduler Supreme');
  };

  const simulateHealthSync = useCallback(async () => {
    if (!isProMember) return;
    setIsReadinessLoading(true);
    setReadinessReport(null);
    try {
        // Simulate more realistic data for demo
        const newHeartRate = Math.floor(Math.random() * (85 - 60 + 1)) + 60;
        const newStressLevel = Math.floor(Math.random() * (50 - 20 + 1)) + 20;
        const newSleepQuality = Math.floor(Math.random() * (95 - 70 + 1)) + 70;
        const updatedBiometrics = { heartRate: newHeartRate, stressLevel: newStressLevel, sleepQuality: newSleepQuality };
        setBiometricData(updatedBiometrics);
        
        const recentActivities = activities.slice(0, 3);
        const report = await getReadinessScore({ biometrics: updatedBiometrics, recentActivities });
        setReadinessReport(report);
        
        toast({
            title: "Health Readiness Synced!",
            description: "We've analyzed your latest data to generate a readiness score.",
        });
        unlockAchievement('Bio-Scanner');
    } catch (error) {
        console.error("Failed to get readiness score:", error);
        toast({
            title: "Sync Failed",
            description: "Could not get readiness score at this time.",
            variant: "destructive"
        });
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
      const newHistory: ChatMessage[] = [...chatHistory, { role: 'user', content: query }];
      setChatHistory(newHistory);
      setIsChatting(true);

      try {
          const result = await chatWithCoach({
              query,
              chatHistory: newHistory.slice(0, -1),
              currentEnergy,
              activities: JSON.stringify(activities.slice(0, 10)),
              events: JSON.stringify(upcomingEvents),
          });

          setChatHistory(prev => [...prev, { role: 'model', content: result.response }]);
          unlockAchievement('Chatterbox');
      } catch (error) {
          console.error("Chat error:", error);
          setChatHistory(prev => [...prev, { role: 'model', content: "Sorry, I'm having trouble connecting right now." }]);
      } finally {
          setIsChatting(false);
      }
  }, [chatHistory, currentEnergy, upcomingEvents, activities, unlockAchievement, isProMember]);


  const changeLocation = () => {
    setLocationIndex((prevIndex) => {
        const newIndex = (prevIndex + 1) % locations.length;
        toast({
            title: 'Location Changed',
            description: `Your location is now set to ${locations[newIndex]}. AI suggestions will adapt.`,
        });
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

        const newGoals = result.goals.map((g, i) => ({
            ...g,
            id: Date.now() + i,
            completed: false,
        }));

        const newChallenges = result.challenges.map((c, i) => ({
            ...c,
            id: Date.now() + i,
        }));
        
        setGoals(newGoals);
        setChallenges(newChallenges);
        
        toast({
            title: "Suggestions Loaded!",
            description: "Your new AI-powered goals and challenges are ready.",
        });
        unlockAchievement('Goal Setter');

    } catch (error) {
        console.error("Failed to suggest goals:", error);
        toast({
            title: "Suggestion Failed",
            description: "Could not get AI suggestions at this time.",
            variant: "destructive"
        });
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
    let interactionChange = 0;
    const updatedTasks = petTasks.map(task => {
        if (task.id === taskId) {
            if (!task.completed) {
                interactionChange = 5; // Add 5 interactions for completing
            } else {
                interactionChange = -5; // Subtract 5 for un-completing
            }
            return { ...task, completed: !task.completed };
        }
        return task;
    });

    setPetTasks(updatedTasks);
    setPetInteractions(prev => Math.max(0, prev + interactionChange));

    if (interactionChange > 0) {
        toast({
            title: "Task Complete!",
            description: "You've earned 5 interactions with your pet! 🎉",
        });
    }
  };

  const handleFeedPet = () => {
    if (petInteractions > 0) {
        setPetInteractions(prev => prev - 1);
        setPetHunger(prev => Math.min(100, prev + 30));
        toast({ title: "Yum!", description: "Your pet enjoyed the meal!" });
        unlockAchievement('Pet Pal');
    }
  };
  
  const handleSleepPet = () => {
    if (petInteractions > 0) {
        setPetInteractions(prev => prev - 1);
        setPetEnergy(prev => Math.min(100, prev + 40));
        toast({ title: "Zzzz...", description: "Your pet feels rested." });
        unlockAchievement('Pet Pal');
    }
  };
  
  const handleToiletPet = () => {
    if (petInteractions > 0) {
        setPetInteractions(prev => prev - 1);
        setPetHygiene(prev => Math.min(100, prev + 50));
        toast({ title: "Phew!", description: "Your pet feels much better." });
        unlockAchievement('Pet Pal');
    }
  };

  if (isOnboarding) {
    return <OnboardingScreen onComplete={handleOnboardingComplete} />;
  }

  return (
    <main className="min-h-dvh bg-background">
      <div className="max-w-md mx-auto bg-card/60 backdrop-blur-lg min-h-dvh shadow-2xl relative">
        <div className="p-6 h-dvh overflow-y-auto pb-32 custom-scrollbar">

          {activeTab === "home" && (
            <HomeTab
              user={user}
              isProMember={isProMember}
              currentEnergy={currentEnergy}
              energyDebt={energyDebt}
              upcomingEvents={upcomingEvents}
              communityMode={communityMode}
              setCommunityMode={toggleCommunityMode}
              getEnergyStatus={getEnergyStatus}
              copyToClipboard={copyToClipboard}
              openModal={openModal}
              aiSuggestion={aiSuggestion}
              actionableSuggestion={actionableSuggestion}
              handleScheduleAction={handleScheduleAction}
              isSuggestionLoading={isSuggestionLoading}
              currentUserLocation={currentUserLocation}
              changeLocation={changeLocation}
              readinessReport={readinessReport}
              isReadinessLoading={isReadinessLoading}
              onSyncHealth={simulateHealthSync}
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
            />
          )}
          {activeTab === "pet" && (
            <PetTab
              tasks={petTasks}
              onTaskComplete={handleTaskComplete}
              interactions={petInteractions}
              petHappiness={petHappiness}
              petHunger={petHunger}
              petEnergy={petEnergy}
              petHygiene={petHygiene}
              onFeedPet={handleFeedPet}
              onSleepPet={handleSleepPet}
              onToiletPet={handleToiletPet}
            />
          )}
          {activeTab === "insights" && (
            <InsightsTab
              isProMember={isProMember}
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
            />
          )}
          {activeTab === "profile" && (
            <ProfileTab
              user={user}
              onLogout={handleLogout}
              onShowTutorial={handleShowTutorial}
              onShowDebrief={handleShowDebrief}
              isProMember={isProMember}
              onTierChange={handleTierChange}
            />
          )}
        </div>

        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <RechargeModal
          open={modals.recharge}
          onOpenChange={() => closeModal('recharge')}
          handleRecharge={handleRecharge}
          activities={activities}
          currentEnergy={currentEnergy}
          onCustomRecharge={handleCustomRecharge}
          isProMember={isProMember}
        />
        <VoiceCheckinModal
            open={modals.voiceCheckIn}
            onOpenChange={() => closeModal('voiceCheckIn')}
            onCheckinComplete={handleVoiceCheckinComplete}
        />
        <WeeklyReportModal
            open={modals.weeklyReport}
            onOpenChange={() => closeModal('weeklyReport')}
            activities={activities}
            isProMember={isProMember}
        />
        <AddActivityModal
            open={modals.addActivity}
            onOpenChange={() => closeModal('addActivity')}
            onLogActivity={handleLogActivity}
            isProMember={isProMember}
        />
        <TutorialModal
            open={showTutorial}
            onOpenChange={setShowTutorial}
            onComplete={handleTutorialComplete}
        />
        <DailyDebriefModal
          open={modals.dailyDebrief}
          onOpenChange={() => closeModal('dailyDebrief')}
          story={energyStory}
          loading={isStoryLoading}
          isProMember={isProMember}
        />
        <ChatCoachModal
            open={modals.chatCoach}
            onOpenChange={() => closeModal('chatCoach')}
            chatHistory={chatHistory}
            isThinking={isChatting}
            onSendMessage={handleChatSubmit}
            isProMember={isProMember}
        />
        <ImageCheckinModal
            open={modals.imageCheckin}
            onOpenChange={() => closeModal('imageCheckin')}
            onLogActivity={handleLogActivity}
        />
        <AddEventModal
            open={modals.addEvent}
            onOpenChange={() => closeModal('addEvent')}
            onLogEvent={handleLogEvent}
            isProMember={isProMember}
        />
      </div>
    </main>
  );
}
