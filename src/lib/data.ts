
import type { Activity, UpcomingEvent, Achievement, Goal, Challenge, PetTask, Friend } from './types';
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
    { id: 8, name: 'Walk in the Park', type: 'recharge', impact: 15, duration: 30, date: format(subDays(today, 2), 'yyyy-MM-dd'), emoji: '🌳', location: 'City Park', autoDetected: false, recoveryTime: 0 },

    // 3 days ago
    { id: 9, name: 'Read a book', type: 'recharge', impact: 25, duration: 75, date: format(subDays(today, 3), 'yyyy-MM-dd'), emoji: '📖', location: 'Home', autoDetected: false, recoveryTime: 0 },
    { id: 10, name: 'Client Presentation', type: 'work', impact: -30, duration: 120, date: format(subDays(today, 3), 'yyyy-MM-dd'), emoji: '📊', location: 'Downtown Office', autoDetected: false, recoveryTime: 60 },

    // 4 days ago
    { id: 11, name: 'Coffee with Colleague', type: 'social', impact: -5, duration: 30, date: format(subDays(today, 4), 'yyyy-MM-dd'), emoji: '☕', location: 'Cafe', autoDetected: false, recoveryTime: 15 },
    { id: 12, name: 'Work from Downtown Office', type: 'work', impact: -15, duration: 480, date: format(subDays(today, 4), 'yyyy-MM-dd'), emoji: '🏢', location: 'Downtown Office', autoDetected: false, recoveryTime: 15 },
    
    // 5 days ago
    { id: 13, name: 'Meditation', type: 'recharge', impact: 15, duration: 20, date: format(subDays(today, 5), 'yyyy-MM-dd'), emoji: '🧘', location: 'Home', autoDetected: true, recoveryTime: 0 },
    { id: 14, name: 'Networking Event', type: 'social', impact: -20, duration: 180, date: format(subDays(today, 5), 'yyyy-MM-dd'), emoji: '🤝', location: 'Conference Hall', autoDetected: false, recoveryTime: 90 },
    { id: 15, name: 'Morning Stroll', type: 'recharge', impact: 10, duration: 20, date: format(subDays(today, 5), 'yyyy-MM-dd'), emoji: '🚶‍♀️', location: 'City Park', autoDetected: false, recoveryTime: 0 },

    // 6 days ago
    { id: 16, name: 'Long Commute', type: 'work', impact: -10, duration: 60, date: format(subDays(today, 6), 'yyyy-MM-dd'), emoji: '🚗', location: 'City', autoDetected: true, recoveryTime: 20 },
    { id: 17, name: 'Movie Marathon', type: 'recharge', impact: 10, duration: 240, date: format(subDays(today, 6), 'yyyy-MM-dd'), emoji: '🎬', location: 'Home', autoDetected: false, recoveryTime: 0 },

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
    { id: 12, name: 'Goal Setter', unlocked: false, icon: '💡' },
    { id: 13, name: 'Pet Pal', unlocked: false, icon: '🐾' },
    { id: 14, name: 'Pet Customizer', unlocked: false, icon: '🎨' },
    { id: 15, name: 'Pet Trainer', unlocked: false, icon: '🏆' },
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

export const INITIAL_PET_TASKS: PetTask[] = [
    { id: 1, name: "Make Your Bed", completed: false, icon: '🛏️' },
    { id: 2, name: "Drink a Glass of Water", completed: false, icon: '💧' },
    { id: 3, name: "Stretch for 5 Minutes", completed: false, icon: '🧘' },
    { id: 4, name: "Tidy Up Your Workspace", completed: false, icon: '🧹' },
    { id: 5, name: "Step Outside for Fresh Air", completed: false, icon: '🌳' },
];

export const INITIAL_FRIENDS: Friend[] = [
    { id: 'friend-1', name: 'Liam Smith', avatar: 'https://placehold.co/100x100.png', avatarHint: 'man smiling', energyStatus: 'Feeling energized!', currentEnergy: 85 },
    { id: 'friend-2', name: 'Olivia Johnson', avatar: 'https://placehold.co/100x100.png', avatarHint: 'woman face', energyStatus: 'A bit tired today.', currentEnergy: 45 },
    { id: 'friend-3', name: 'Noah Williams', avatar: 'https://placehold.co/100x100.png', avatarHint: 'man portrait', energyStatus: 'Ready to take on the day!', currentEnergy: 92 },
    { id: 'friend-4', name: 'Emma Brown', avatar: 'https://placehold.co/100x100.png', avatarHint: 'woman coffee', energyStatus: 'Need a coffee break.', currentEnergy: 55 },
    { id: 'friend-5', name: 'Oliver Jones', avatar: 'https://placehold.co/100x100.png', avatarHint: 'man glasses', energyStatus: 'Focused and in the zone.', currentEnergy: 78 },
    { id: 'friend-6', name: 'Ava Garcia', avatar: 'https://placehold.co/100x100.png', avatarHint: 'woman nature', energyStatus: 'Relaxing after a long week.', currentEnergy: 65 },
    { id: 'friend-7', name: 'Elijah Miller', avatar: 'https://placehold.co/100x100.png', avatarHint: 'man desk', energyStatus: 'Super productive morning!', currentEnergy: 88 },
    { id: 'friend-8', name: 'Sophia Davis', avatar: 'https://placehold.co/100x100.png', avatarHint: 'woman outdoors', energyStatus: 'Enjoying the sunshine.', currentEnergy: 72 },
    { id: 'friend-9', name: 'James Rodriguez', avatar: 'https://placehold.co/100x100.png', avatarHint: 'man tired', energyStatus: 'Could use a nap.', currentEnergy: 38 },
    { id: 'friend-10', name: 'Isabella Martinez', avatar: 'https://placehold.co/100x100.png', avatarHint: 'woman happy', energyStatus: 'Excited for the weekend!', currentEnergy: 95 },
];
