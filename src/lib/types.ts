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
  name: string;
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

export interface User {
  name: string;
}
