import type { Activity, UpcomingEvent, Achievement } from './types';

export const INITIAL_ACTIVITIES: Activity[] = [
    { id: 1, name: 'Online Gaming Session', type: 'social', impact: -10, duration: 120, date: new Date().toLocaleDateString(), emoji: '🎮', location: 'Home', autoDetected: true, recoveryTime: 30 },
    { id: 2, name: 'Study Group', type: 'work', impact: -25, duration: 90, date: new Date().toLocaleDateString(), emoji: '📚', location: 'Library', autoDetected: false, recoveryTime: 60 },
    { id: 3, name: 'Listening to Music', type: 'recharge', impact: 30, duration: 45, date: new Date().toLocaleDateString(), emoji: '🎵', location: 'Bedroom', autoDetected: true, recoveryTime: 0 },
    { id: 4, name: 'Video Call with Friends', type: 'social', impact: -15, duration: 60, date: new Date().toLocaleDateString(), emoji: '📱', location: 'Home', autoDetected: true, recoveryTime: 45 }
];

export const INITIAL_UPCOMING_EVENTS: UpcomingEvent[] = [
    { id: 1, name: 'Movie Night', type: 'social', estimatedImpact: -20, date: 'Tonight', time: '8:00 PM', emoji: '🎬', conflictRisk: 'medium', bufferSuggested: 30 },
    { id: 2, name: 'Job Interview', type: 'work', estimatedImpact: -35, date: 'Tomorrow', time: '2:00 PM', emoji: '💼', conflictRisk: 'high', bufferSuggested: 90 },
];

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
    { id: 1, name: 'First Recharge', unlocked: true, icon: '🔋' },
    { id: 2, name: 'Self-Care Pro', unlocked: false, icon: '🧘‍♀️' },
    { id: 3, name: 'Social Butterfly', unlocked: true, icon: '🦋' },
    { id: 4, name: 'Mindful Logger', unlocked: false, icon: '📝'}
];
