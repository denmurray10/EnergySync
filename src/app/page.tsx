"use client";

import { useState, useMemo } from "react";
import type { Activity, UpcomingEvent, Achievement, BiometricData } from "@/lib/types";
import { INITIAL_ACTIVITIES, INITIAL_UPCOMING_EVENTS, INITIAL_ACHIEVEMENTS } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";

import { HomeTab } from "@/components/home-tab";
import { ActivitiesTab } from "@/components/activities-tab";
import { InsightsTab } from "@/components/insights-tab";
import { BottomNav } from "@/components/bottom-nav";
import { RechargeModal } from "@/components/recharge-modal";
import { VoiceCheckinModal } from "@/components/voice-checkin-modal";
import { WeeklyReportModal } from "@/components/weekly-report-modal";


export default function Home() {
  const { toast } = useToast();

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
  });

  const [communityMode, setCommunityMode] = useState(false);
  const [achievements, setAchievements] = useState<Achievement[]>(INITIAL_ACHIEVEMENTS);
  const [selfCareStreak, setSelfCareStreak] = useState(5);

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


  return (
    <main className="min-h-dvh bg-background">
      <div className="max-w-md mx-auto bg-card/60 backdrop-blur-lg min-h-dvh shadow-2xl relative">
        <div className="p-6 h-dvh overflow-y-auto pb-32 custom-scrollbar">
          {activeTab === "home" && (
            <HomeTab
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
            <ActivitiesTab activities={activities} />
          )}
          {activeTab === "insights" && (
            <InsightsTab
              dynamicInsights={dynamicInsights}
              selfCareStreak={selfCareStreak}
              achievements={achievements}
              currentEnergy={currentEnergy}
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
      </div>
    </main>
  );
}
