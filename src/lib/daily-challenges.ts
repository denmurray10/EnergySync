import { DailyChallenge } from "./types";

export const CHALLENGE_POOL: Omit<DailyChallenge, 'id' | 'progress' | 'completed'>[] = [
    {
        type: 'catch_items',
        description: 'Catch 10 items in the AR Game',
        target: 10,
        reward: { type: 'xp', value: 50 },
        icon: '🎯'
    },
    {
        type: 'catch_items',
        description: 'Catch 25 items in the AR Game',
        target: 25,
        reward: { type: 'xp', value: 100 },
        icon: '🏆'
    },
    {
        type: 'feed_treats',
        description: 'Feed your pet 3 treats',
        target: 3,
        reward: { type: 'xp', value: 30 },
        icon: '🍪'
    },
    {
        type: 'feed_treats',
        description: 'Feed your pet 5 treats',
        target: 5,
        reward: { type: 'xp', value: 60 },
        icon: '🍖'
    },
    {
        type: 'play_minigame',
        description: 'Play the Catch Game 3 times',
        target: 3,
        reward: { type: 'xp', value: 45 },
        icon: '🎮'
    },
    {
        type: 'perform_tricks',
        description: 'Do 5 tricks with your pet',
        target: 5,
        reward: { type: 'xp', value: 40 },
        icon: '✨'
    },
    {
        type: 'perform_tricks',
        description: 'Do 10 tricks with your pet',
        target: 10,
        reward: { type: 'xp', value: 80 },
        icon: '🎪'
    }
];

export function generateDailyChallenges(): DailyChallenge[] {
    // Shuffle and pick 3
    const shuffled = [...CHALLENGE_POOL].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 3);

    return selected.map((challenge, index) => ({
        ...challenge,
        id: `daily_${Date.now()}_${index}`,
        progress: 0,
        completed: false
    }));
}
