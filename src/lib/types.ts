export interface Activity {
  id: number;
  name: string;
  type: 'social' | 'work' | 'recharge' | 'personal';
  impact: number;
  duration: number;
  date: string;
  emoji: string;
  location: string;
  autoDetected: boolean;
  recoveryTime: number;
}

export interface UpcomingEvent {
  id: number;
  name:string;
  type: 'social' | 'work' | 'personal';
  estimatedImpact: number;
  date: string;
  time: string;
  emoji: string;
  conflictRisk: 'high' | 'medium' | 'low';
  bufferSuggested: number;
}

export interface Achievement {
  id: number;
  name: string;
  unlocked: boolean;
  icon: string;
}

export interface BiometricData {
  heartRate: number;
  sleepQuality: number;
  stressLevel: number;
}

export interface PetCustomization {
  color: string;
  accessory: 'none' | 'bowtie';
  background: 'default' | 'park' | 'cozy';
  unlockedColors: string[];
  unlockedAccessories: string[];
  unlockedBackgrounds: string[];
}

export interface User {
  name: string;
  membershipTier: 'free' | 'pro';
  petCustomization: PetCustomization;
  petLevel: number;
  petExp: number;
}

export interface Goal {
  id: number;
  name: string;
  description: string;
  completed: boolean;
  icon: string;
}

export interface Challenge {
  id: number;
  name: string;
  description: string;
  icon: string;
  participants: number;
  daysLeft: number;
}

export interface ReadinessReport {
    score: number;
    title: string;
    summary: string;
}

export interface ChatMessage {
    role: 'user' | 'model';
    content: string;
}

export interface ActionableSuggestion {
    type: 'ritual' | 'buffer';
    eventId: number;
    activityName: string;
    duration: number;
    impact: number;
    emoji: string;
}

export interface EnergyForecastData {
    hour: string;
    predictedEnergy: number;
}

export interface PetTask {
  id: number;
  name: string;
  completed: boolean;
  icon: string;
}

export interface EnergyHotspot {
  location: string;
  averageImpact: number;
}

export interface EnergyHotspotAnalysis {
  drainingHotspots: EnergyHotspot[];
  rechargingHotspots: EnergyHotspot[];
}
