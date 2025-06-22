"use client";

import { useState, useMemo, useEffect } from "react";
import type { Activity, UpcomingEvent, Achievement, BiometricData, User } from "@/lib/types";
import { INITIAL_ACTIVITIES, INITIAL_UPCOMING_EVENTS, INITIAL_ACHIEVEMENTS } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";

import { HomeTab } from "@/components/home-tab";
import { ActivitiesTab } from "@/components/activities-tab";
import { InsightsTab } from "@/components/insights-tab";
import { BottomNav } from "@/components/bottom-nav";
import { RechargeModal } from "@/components/recharge-modal";
import { VoiceCheckinModal } from "@/components/voice-checkin-modal";
import { WeeklyReportModal } from "@/components/weekly-report-modal";
import { AddActivityModal } from "@/components/add-activity-modal";
import { OnboardingScreen } from "@/components/onboarding-screen";


export default function Home() {
  const { toast } = useToast();

  const [user, setUser] = useState<User | null>(null);
  const [isOnboarding, setIsOnboarding] = useState(true);

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

  useEffect(() => {
    // In a real app, you'd check for user data in localStorage or from an API
    const storedUser = localStorage.getItem('energysync_user');
    if (storedUser) {
        setUser(JSON.parse(storedUser));
        setIsOnboarding(false);
    }
  }, []);

  const handleOnboardingComplete = (newUser: User) => {
    setUser(newUser);
    setIsOnboarding(false);
    localStorage.setItem('energysync_user', JSON.stringify(newUser));
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

  const simulateVoiceCheckIn = (energyChange: number, message: string) => {
    setCurrentEnergy(prev => Math.max(0, Math.min(100, prev + energyChange)));
    showToast('Voice Check-in complete', message, '🎤');
    closeModal('voiceCheckIn');
  };

  const simulateCalendarSync = () => {
    const newEvents: UpcomingEvent[] = [
      { id: Date.now(), name: 'Team Presentation (Synced)', type: 'work', estimatedImpact: -30, date: 'Wednesday', time: '11:00 AM', emoji: '📊', conflictRisk: 'medium', bufferSuggested: 60 },
      { id: Date.now() + 1, name: 'Dentist Appointment (Synced)', type: 'personal', estimatedImpact: -5, date: 'Thursday', time: '3:00 PM', emoji: '🦷', conflictRisk: 'low', bufferSuggested: 0 }
    ];
    setUpcomingEvents(prev => [...prev, ...newEvents]);
    showToast("Calendar Synced!", "New events added to your schedule.", "📅");
  };

  const simulateHealthSync = () => {
    const newHeartRate = Math.floor(Math.random() * (85 - 60 + 1)) + 60;
    const newStressLevel = Math.floor(Math.random() * (50 - 20 + 1)) + 20;
    setBiometricData(prev => ({ ...prev, heartRate: newHeartRate, stressLevel: newStressLevel }));
    showToast("Health Data Updated!", "Biometrics have been synced.", "❤️");
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
              setCommunityMode={setCommunityMode}
              getEnergyStatus={getEnergyStatus}
              copyToClipboard={copyToClipboard}
              openModal={openModal}
              simulateCalendarSync={simulateCalendarSync}
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
            simulateVoiceCheckIn={simulateVoiceCheckIn}
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
      </div>
    </main>
  );
}
