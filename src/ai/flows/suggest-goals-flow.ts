'use server';

/**
 * @fileOverview Suggests personalized goals and challenges based on user activity.
 *
 * - suggestGoals - A function that returns AI-generated goals and challenges.
 * - SuggestGoalsInput - The input type for the flow.
 * - SuggestGoalsOutput - The output type for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SuggestGoalsInputSchema = z.object({
    activities: z.array(z.object({
        name: z.string(),
        type: z.string(),
        impact: z.number(),
    })).describe("An array of the user's recent activities."),
    currentGoals: z.array(z.object({
        name: z.string(),
    })).describe("An array of the user's current goals to avoid suggesting duplicates."),
});
export type SuggestGoalsInput = z.infer<typeof SuggestGoalsInputSchema>;

const GoalSuggestionSchema = z.object({
    name: z.string().describe("A short, motivational name for the goal."),
    description: z.string().describe("A one-sentence description of what the user needs to do to complete the goal."),
    icon: z.string().max(2).describe("A single emoji that represents the goal."),
});

const ChallengeSuggestionSchema = z.object({
    name: z.string().describe("A fun, catchy name for the community challenge."),
    description: z.string().describe("A one-sentence description of the challenge."),
    icon: z.string().max(2).describe("A single emoji that represents the challenge."),
    participants: z.number().describe("A realistic number of participants for a community challenge (e.g., between 50 and 250)."),
    daysLeft: z.number().describe("The number of days remaining for the challenge (e.g., between 3 and 7)."),
});

const SuggestGoalsOutputSchema = z.object({
    goals: z.array(GoalSuggestionSchema).describe("An array of 2-3 personalized goal suggestions."),
    challenges: z.array(ChallengeSuggestionSchema).describe("An array of 1-2 community challenge suggestions."),
});
export type SuggestGoalsOutput = z.infer<typeof SuggestGoalsOutputSchema>;


export async function suggestGoals(input: SuggestGoalsInput): Promise<SuggestGoalsOutput> {
  return suggestGoalsFlow(input);
}

const prompt = ai.definePrompt({
    name: 'suggestGoalsPrompt',
    input: { schema: SuggestGoalsInputSchema },
    output: { schema: SuggestGoalsOutputSchema },
    prompt: `You are an expert life coach and motivational assistant in an energy tracking app. Your task is to generate personalized goals and fun community challenges for the user based on their recent activity.

    Analyze the provided activity list to identify patterns. For example:
    - Does the user log a lot of draining 'work' activities?
    - Are they forgetting to log 'recharge' activities?
    - Do they have a good balance?
    - Is there a specific type of activity they do often?

    Based on your analysis, create:
    1.  **2-3 Personalized Goals:** These should be actionable and directly related to the user's activity log. Make them encouraging and achievable. Do not suggest goals that are already in their current goal list.
    2.  **1-2 Community Challenges:** These should be fun, engaging, and framed for a wider community. They can be more general but still relevant.

    For all items, provide a relevant single emoji for the icon.
    For challenges, also generate a realistic number of participants and days left.

    CONTEXT:
    - User's Current Goals: {{#each currentGoals}}'{{name}}', {{/each}}
    - User's Recent Activities:
    {{#each activities}}
    - {{name}} (Type: {{type}}, Impact: {{impact}})
    {{/each}}
    
    Now, generate a fresh set of goals and challenges.
    `
});

const suggestGoalsFlow = ai.defineFlow({
    name: 'suggestGoalsFlow',
    inputSchema: SuggestGoalsInputSchema,
    outputSchema: SuggestGoalsOutputSchema,
}, async (input) => {
    const { output } = await prompt(input);
    return output!;
});
