import type { Activity, UpcomingEvent, Achievement, Goal, Challenge } from './types';
import { subDays, format } from 'date-fns';

const today = new Date();

export const INITIAL_ACTIVITIES: Activity[] = [
    // Today
    { id: 1, name: 'Online Gaming Session', type: 'social', impact: -10, duration: 120, date: format(today, 'yyyy-MM-dd'), emoji: '🎮', location: 'Home', autoDetected: true, recoveryTime: 30 },
    { id: 2, name: 'Study Group', type: 'work', impact: -25, duration: 90, date: format(today, 'yyyy-MM-dd'), emoji: '📚', location: 'Library', autoDetected: false, recoveryTime: 60 },
    
    // Yesterday
    { id: 3, name: 'Listening to Music', type: 'recharge', impact: 30, duration: 45, date: format(subDays(today, 1), 'yyyy-MM-dd'), emoji: '🎵', location: 'Bedroom', autoDetected: true, recoveryTime: 0 },
    { id: 4, name: 'Video Call with Friends', type: 'social', impact: -15, duration: 60, date: format(subDays(today, 1), 'yyyy-MM-dd'), emoji: '📱', location: 'Home', autoDetected: true, recoveryTime: 45 },
    { id: 5, name: 'Team Project Deadline', type: 'work', impact: -40, duration: 240, date: format(subDays(today, 1), 'yyyy-MM-dd'), emoji: '🚀', location: 'Office', autoDetected: false, recoveryTime: 120 },

    // 2 days ago
    { id: 6, name: 'Gym Workout', type: 'recharge', impact: 20, duration: 60, date: format(subDays(today, 2), 'yyyy-MM-dd'), emoji: '💪', location: 'Gym', autoDetected: false, recoveryTime: 0 },
    { id: 7, name: 'Dinner with Family', type: 'social', impact: 10, duration: 90, date: format(subDays(today, 2), 'yyyy-MM-dd'), emoji: '👨‍👩‍👧', location: 'Restaurant', autoDetected: false, recoveryTime: 0 },

    // 3 days ago
    { id: 8, name: 'Read a book', type: 'recharge', impact: 25, duration: 75, date: format(subDays(today, 3), 'yyyy-MM-dd'), emoji: '📖', location: 'Home', autoDetected: false, recoveryTime: 0 },
    { id: 9, name: 'Client Presentation', type: 'work', impact: -30, duration: 120, date: format(subDays(today, 3), 'yyyy-MM-dd'), emoji: '📊', location: 'Office', autoDetected: false, recoveryTime: 60 },

    // 4 days ago
    { id: 10, name: 'Coffee with Colleague', type: 'social', impact: -5, duration: 30, date: format(subDays(today, 4), 'yyyy-MM-dd'), emoji: '☕', location: 'Cafe', autoDetected: false, recoveryTime: 15 },
    
    // 5 days ago
    { id: 11, name: 'Meditation', type: 'recharge', impact: 15, duration: 20, date: format(subDays(today, 5), 'yyyy-MM-dd'), emoji: '🧘', location: 'Home', autoDetected: true, recoveryTime: 0 },
    { id: 12, name: 'Networking Event', type: 'social', impact: -20, duration: 180, date: format(subDays(today, 5), 'yyyy-MM-dd'), emoji: '🤝', location: 'Conference Hall', autoDetected: false, recoveryTime: 90 },

    // 6 days ago
    { id: 13, name: 'Long Commute', type: 'work', impact: -10, duration: 60, date: format(subDays(today, 6), 'yyyy-MM-dd'), emoji: '🚗', location: 'City', autoDetected: true, recoveryTime: 20 },
    { id: 14, name: 'Movie Marathon', type: 'recharge', impact: 10, duration: 240, date: format(subDays(today, 6), 'yyyy-MM-dd'), emoji: '🎬', location: 'Home', autoDetected: false, recoveryTime: 0 },

];

export const INITIAL_UPCOMING_EVENTS: UpcomingEvent[] = [
    { id: 1, name: 'Movie Night', type: 'social', estimatedImpact: -20, date: 'Tonight', time: '8:00 PM', emoji: '🎬', conflictRisk: 'medium', bufferSuggested: 30 },
    { id: 2, name: 'Job Interview', type: 'work', estimatedImpact: -35, date: 'Tomorrow', time: '2:00 PM', emoji: '💼', conflictRisk: 'high', bufferSuggested: 90 },
];

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
    { id: 1, name: 'First Recharge', unlocked: true, icon: '🔋' },
    { id: 2, name: 'Self-Care Pro', unlocked: false, icon: '🧘‍♀️' },
    { id: 3, name: 'Social Butterfly', unlocked: true, icon: '🦋' },
    { id: 4, name: 'Mindful Logger', unlocked: false, icon: '📝'},
    { id: 5, name: 'Scheduler Supreme', unlocked: false, icon: '📅' },
    { id: 6, name: 'Bio-Scanner', unlocked: false, icon: '❤️' },
    { id: 7, name: 'Community Member', unlocked: false, icon: '🤝' },
    { id: 8, name: 'Goal Getter', unlocked: false, icon: '🎯' },
    { id: 9, name: 'Storyteller', unlocked: false, icon: '📖' },
    { id: 10, name: 'Chatterbox', unlocked: false, icon: '💬' },
    { id: 11, name: 'Pixel Perfect', unlocked: false, icon: '📸' },
];

export const INITIAL_GOALS: Goal[] = [
    { id: 1, name: "Recharge Weekly", description: "Complete 3 recharge activities this week.", completed: false, icon: '🔋' },
    { id: 2, name: "Energy Awareness", description: "Log your energy daily for 5 days straight.", completed: true, icon: '🧠' },
    { id: 3, name: "Beat the Slump", description: "Stay above 40% energy for 3 consecutive days.", completed: false, icon: '🚀' },
];

export const INITIAL_CHALLENGES: Challenge[] = [
    { id: 1, name: "7-Day Meditation Streak", description: "Meditate every day for one week.", icon: '🧘', participants: 142, daysLeft: 5 },
    { id: 2, name: "Weekend Warrior", description: "Log one social and one recharge activity this weekend.", icon: '🎉', participants: 89, daysLeft: 2 },
];
