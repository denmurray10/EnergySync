

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
  taggedFriendIds?: string[];
  location?: 'Home' | 'School';
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
  outlineColor: string;
  accessory: 'none' | 'bowtie';
  background: 'default' | 'park' | 'cozy';
  unlockedColors: string[];
  unlockedOutlineColors: string[];
  unlockedAccessories: string[];
  unlockedBackgrounds: string[];
}

export interface JourneyEntry {
    text: string;
    icon: string;
    timestamp: string;
}

export interface Reminder {
    eventId: number;
    triggeredAt: Date;
}

export interface User {
  userId: string;
  name: string;
  username: string;
  avatar?: string;
  membershipTier: 'free' | 'pro';
  proTrialEndDate?: string | null;
  petCustomization: PetCustomization;
  petLevel: number;
  petExp: number;
  petName: string;
  petType: 'cat' | 'dog' | 'horse' | 'chicken';
  petEnabled: boolean;
  parentalPin?: string | null;
  parentEmail?: string | null;
  featureVisibility?: {
    insights: boolean;
    friends: boolean;
    communityMode: boolean;
  };
  howDidYouHear?: string;
  whatDoYouExpect?: string;
  ageGroup: 'under14' | '14to17' | 'over18' | null;
  tutorialSeen: boolean;
  lastTaskCompletionTime: number | null;
  chatHistory: ChatMessage[];
  friends: Friend[];
  journeys: JourneyEntry[];
  petTasks: PetTask[];
  activities: Activity[];
  upcomingEvents: UpcomingEvent[];
  reminders: Reminder[];
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

export interface Friend {
  id: string;
  name: string;
  avatar: string;
  avatarHint: string;
  energyStatus: string;
  currentEnergy: number;
  isPlaceholder?: boolean;
  isMe?: boolean;
  isFavorite?: boolean;
  hasUpdatedToday?: boolean;
}
