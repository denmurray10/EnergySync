// Pet Accessory System
// Defines all available accessories, their unlock conditions, and display properties

export type AccessorySlot = 'hat' | 'glasses' | 'collar' | 'toy';

export interface Accessory {
    id: string;
    name: string;
    emoji: string; // For display in AR
    slot: AccessorySlot;
    unlockCondition: {
        type: 'level' | 'achievement' | 'seasonal' | 'default';
        value?: number | string;
        season?: 'halloween' | 'christmas' | 'summer';
    };
    description: string;
    proOnly?: boolean;
}

export const ACCESSORIES: Record<string, Accessory> = {
    // === HATS ===
    tophat: {
        id: 'tophat',
        name: 'Top Hat',
        emoji: '🎩',
        slot: 'hat',
        unlockCondition: { type: 'level', value: 5 },
        description: 'A classy top hat for sophisticated pets'
    },
    crown: {
        id: 'crown',
        name: 'Royal Crown',
        emoji: '👑',
        slot: 'hat',
        unlockCondition: { type: 'level', value: 10 },
        description: 'Fit for a royal pet!'
    },
    santa: {
        id: 'santa',
        name: 'Santa Hat',
        emoji: '🎅',
        slot: 'hat',
        unlockCondition: { type: 'seasonal', season: 'christmas' },
        description: 'Ho ho ho! Limited time Christmas accessory'
    },
    witch: {
        id: 'witch',
        name: 'Witch Hat',
        emoji: '🧙',
        slot: 'hat',
        unlockCondition: { type: 'seasonal', season: 'halloween' },
        description: 'Spooky! Limited time Halloween accessory'
    },
    party: {
        id: 'party',
        name: 'Party Hat',
        emoji: '🎉',
        slot: 'hat',
        unlockCondition: { type: 'achievement', value: 'First Recharge' },
        description: 'Celebrate your first recharge!'
    },
    cowboy: {
        id: 'cowboy',
        name: 'Cowboy Hat',
        emoji: '🤠',
        slot: 'hat',
        unlockCondition: { type: 'level', value: 15 },
        description: 'Yeehaw! For adventurous pets'
    },

    // === GLASSES ===
    cool: {
        id: 'cool',
        name: 'Cool Shades',
        emoji: '😎',
        slot: 'glasses',
        unlockCondition: { type: 'level', value: 3 },
        description: 'Too cool for school'
    },
    nerd: {
        id: 'nerd',
        name: 'Nerd Glasses',
        emoji: '🤓',
        slot: 'glasses',
        unlockCondition: { type: 'achievement', value: 'Mindful Logger' },
        description: 'For the smartest pets'
    },
    heart: {
        id: 'heart',
        name: 'Heart Glasses',
        emoji: '😍',
        slot: 'glasses',
        unlockCondition: { type: 'level', value: 7 },
        description: 'Spread the love!'
    },
    star: {
        id: 'star',
        name: 'Star Glasses',
        emoji: '🤩',
        slot: 'glasses',
        unlockCondition: { type: 'level', value: 12 },
        description: 'You\'re a star!'
    },

    // === COLLARS ===
    bowtie: {
        id: 'bowtie',
        name: 'Bow Tie',
        emoji: '🎀',
        slot: 'collar',
        unlockCondition: { type: 'default' },
        description: 'Classic and elegant'
    },
    bandana: {
        id: 'bandana',
        name: 'Bandana',
        emoji: '🔴',
        slot: 'collar',
        unlockCondition: { type: 'level', value: 2 },
        description: 'Stylish neck accessory'
    },
    scarf: {
        id: 'scarf',
        name: 'Warm Scarf',
        emoji: '🧣',
        slot: 'collar',
        unlockCondition: { type: 'level', value: 8 },
        description: 'Cozy and warm'
    },
    bell: {
        id: 'bell',
        name: 'Bell Collar',
        emoji: '🔔',
        slot: 'collar',
        unlockCondition: { type: 'achievement', value: 'Self-Care Pro' },
        description: 'Jingle all the way!'
    },

    // === TOYS ===
    ball: {
        id: 'ball',
        name: 'Tennis Ball',
        emoji: '🎾',
        slot: 'toy',
        unlockCondition: { type: 'default' },
        description: 'A classic toy for fetch!'
    },
    bone: {
        id: 'bone',
        name: 'Chew Bone',
        emoji: '🦴',
        slot: 'toy',
        unlockCondition: { type: 'level', value: 3 },
        description: 'Tasty and durable.'
    },
    frisbee: {
        id: 'frisbee',
        name: 'Frisbee',
        emoji: '🥏',
        slot: 'toy',
        unlockCondition: { type: 'level', value: 8 },
        description: 'Great for outdoor fun!'
    },
    laser: {
        id: 'laser',
        name: 'Laser Pointer',
        emoji: '🔴',
        slot: 'toy',
        unlockCondition: { type: 'achievement', value: 'Pet Trainer' },
        description: 'Drive your pet crazy!'
    },
};

// Helper function to check if accessory is unlocked
export function isAccessoryUnlocked(
    accessory: Accessory,
    userLevel: number,
    achievements: string[],
    isPro: boolean
): boolean {
    // Pro-only check
    if (accessory.proOnly && !isPro) return false;

    const { type, value, season } = accessory.unlockCondition;

    switch (type) {
        case 'default':
            return true;
        case 'level':
            return userLevel >= (value as number);
        case 'achievement':
            return achievements.includes(value as string);
        case 'seasonal':
            // Check if current season matches
            const now = new Date();
            const month = now.getMonth();
            if (season === 'halloween' && month === 9) return true; // October
            if (season === 'christmas' && (month === 11 || month === 0)) return true; // Dec/Jan
            if (season === 'summer' && (month >= 5 && month <= 7)) return true; // Jun-Aug
            return false;
        default:
            return false;
    }
}

// Get all accessories for a specific slot
export function getAccessoriesForSlot(slot: AccessorySlot): Accessory[] {
    return Object.values(ACCESSORIES).filter(acc => acc.slot === slot);
}

// Get unlocked accessories for a slot
export function getUnlockedAccessories(
    slot: AccessorySlot,
    userLevel: number,
    achievements: string[],
    isPro: boolean
): Accessory[] {
    return getAccessoriesForSlot(slot).filter(acc =>
        isAccessoryUnlocked(acc, userLevel, achievements, isPro)
    );
}
