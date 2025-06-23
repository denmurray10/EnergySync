"use client";

import { useState, useMemo, useEffect } from "react";
import type { Activity, UpcomingEvent, Achievement, BiometricData, User, Goal, Challenge } from "@/lib/types";
import { INITIAL_ACTIVITIES, INITIAL_UPCOMING_EVENTS, INITIAL_ACHIEVEMENTS, INITIAL_GOALS, INITIAL_CHALLENGES } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { getProactiveSuggestion } from "@/ai/flows/proactive-suggestion-flow";

import { HomeTab } from "@/components/home-tab";
import { ActivitiesTab } from "@/components/activities-tab";
import { InsightsTab } from "@/components/insights-tab";
import { ProfileTab } from "@/components/profile-tab";
import { BottomNav } from "@/components/bottom-nav";
import { RechargeModal } from "@/components/recharge-modal";
import { VoiceCheckinModal } from "@/components/voice-checkin-modal";
import { WeeklyReportModal } from "@/components/weekly-report-modal";
import { AddActivityModal } from "@/components/add-activity-modal";
import { OnboardingScreen } from "@/components/onboarding-screen";
import { TutorialModal } from "@/components/tutorial-modal";

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
  });

  const [communityMode, setCommunityMode] = useState(false);
  const [achievements, setAchievements] = useState<Achievement[]>(INITIAL_ACHIEVEMENTS);
  const [selfCareStreak, setSelfCareStreak] = useState(5);

  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [isSuggestionLoading, setIsSuggestionLoading] = useState(true);
  
  const [goals, setGoals] = useState<Goal[]>(INITIAL_GOALS);
  const [challenges, setChallenges] = useState<Challenge[]>(INITIAL_CHALLENGES);
  
  const [locationIndex, setLocationIndex] = useState(0);
  const currentUserLocation = locations[locationIndex];

  useEffect(() => {
    // In a real app, you'd check for user data in localStorage or from an API
    const storedUser = localStorage.getItem('energysync_user');
    if (storedUser) {
        setUser(JSON.parse(storedUser));
        setIsOnboarding(false);
    }
  }, []);

  useEffect(() => {
    const fetchSuggestion = async () => {
      if (activeTab !== 'home') return;
      
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
      } catch (error) {
        console.error("Failed to get proactive suggestion:", error);
        setAiSuggestion("Could not load a suggestion at this time.");
      } finally {
        setIsSuggestionLoading(false);
      }
    };

    fetchSuggestion();
  }, [activities, upcomingEvents, currentEnergy, activeTab, currentUserLocation]);

  const handleOnboardingComplete = (newUser: User) => {
    setUser(newUser);
    setIsOnboarding(false);
    localStorage.setItem('energysync_user', JSON.stringify(newUser));

    const hasSeenTutorial = localStorage.getItem('energysync_tutorial_seen');
    if (!hasSeenTutorial) {
      setShowTutorial(true);
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

  const unlockAchievement = (name: string) => {
    const alreadyUnlocked = achievements.find(a => a.name === name)?.unlocked;
    if (!alreadyUnlocked) {
      setAchievements(prev => prev.map(a => a.name === name ? { ...a, unlocked: true } : a));
      showToast(`Achievement Unlocked!`, `You've earned: ${name}`, '🏆');
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
    setActivities(prev => [newActivity, ...prev].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    showToast('Activity Logged!', `Great job logging '${newActivity.name}'!`, '📝');
    unlockAchievement('Mindful Logger');
    closeModal('addActivity');
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

  const simulateCalendarSync = () => {
    const newEvents: UpcomingEvent[] = [
      { id: Date.now(), name: 'Team Presentation (Synced)', type: 'work', estimatedImpact: -30, date: 'Wednesday', time: '11:00 AM', emoji: '📊', conflictRisk: 'medium', bufferSuggested: 60 },
      { id: Date.now() + 1, name: 'Dentist Appointment (Synced)', type: 'personal', estimatedImpact: -5, date: 'Thursday', time: '3:00 PM', emoji: '🦷', conflictRisk: 'low', bufferSuggested: 0 }
    ];
    setUpcomingEvents(prev => {
        const existingNames = new Set(prev.map(e => e.name));
        const uniqueNewEvents = newEvents.filter(e => !existingNames.has(e.name));
        return [...prev, ...uniqueNewEvents];
    });
    toast({
        title: "Calendar Synced!",
        description: "New events added to your schedule.",
    });
    unlockAchievement('Scheduler Supreme');
  };

  const simulateHealthSync = () => {
    const newHeartRate = Math.floor(Math.random() * (85 - 60 + 1)) + 60;
    const newStressLevel = Math.floor(Math.random() * (50 - 20 + 1)) + 20;
    const newSleepQuality = Math.floor(Math.random() * (95 - 70 + 1)) + 70;
    setBiometricData({ heartRate: newHeartRate, stressLevel: newStressLevel, sleepQuality: newSleepQuality });
    toast({
      title: "Health Data Updated!",
      description: "Biometrics have been synced from your health provider.",
    });
    unlockAchievement('Bio-Scanner');
  };

  const changeLocation = () => {
    setLocationIndex((prevIndex) => (prevIndex + 1) % locations.length);
    toast({
        title: 'Location Changed',
        description: `Your location is now set to ${locations[(locationIndex + 1) % locations.length]}.`,
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
              currentEnergy={currentEnergy}
              energyDebt={energyDebt}
              biometricData={biometricData}
              upcomingEvents={upcomingEvents}
              communityMode={communityMode}
              setCommunityMode={toggleCommunityMode}
              getEnergyStatus={getEnergyStatus}
              copyToClipboard={copyToClipboard}
              openModal={openModal}
              simulateCalendarSync={simulateCalendarSync}
              aiSuggestion={aiSuggestion}
              isSuggestionLoading={isSuggestionLoading}
              currentUserLocation={currentUserLocation}
              changeLocation={changeLocation}
            />
          )}
          {activeTab === "activities" && (
            <ActivitiesTab activities={activities} openModal={openModal} />
          )}
          {activeTab === "insights" && (
            <InsightsTab
              dynamicInsights={dynamicInsights}
              selfCareStreak={selfCareStreak}
              achievements={achievements}
              currentEnergy={currentEnergy}
              activities={activities}
              openModal={openModal}
              simulateHealthSync={simulateHealthSync}
              goals={goals}
              challenges={challenges}
              onGoalComplete={handleGoalComplete}
            />
          )}
          {activeTab === "profile" && (
            <ProfileTab
              user={user}
              onLogout={handleLogout}
              onShowTutorial={handleShowTutorial}
            />
          )}
        </div>

        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <RechargeModal
          open={modals.recharge}
          onOpenChange={(isOpen) => setModals(m => ({ ...m, recharge: isOpen }))}
          handleRecharge={handleRecharge}
          activities={activities}
          currentEnergy={currentEnergy}
          onCustomRecharge={handleCustomRecharge}
        />
        <VoiceCheckinModal
            open={modals.voiceCheckIn}
            onOpenChange={(isOpen) => closeModal('voiceCheckIn')}
            onCheckinComplete={handleVoiceCheckinComplete}
        />
        <WeeklyReportModal
            open={modals.weeklyReport}
            onOpenChange={(isOpen) => closeModal('weeklyReport')}
            activities={activities}
        />
        <AddActivityModal
            open={modals.addActivity}
            onOpenChange={(isOpen) => closeModal('addActivity')}
            onLogActivity={handleLogActivity}
        />
        <TutorialModal
            open={showTutorial}
            onOpenChange={setShowTutorial}
            onComplete={handleTutorialComplete}
        />
      </div>
    </main>
  );
}
