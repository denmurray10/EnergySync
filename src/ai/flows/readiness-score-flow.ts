
'use server';

/**
 * @fileOverview Calculates a user's daily readiness score based on a manual survey.
 * 
 * - getReadinessScore - A function that returns a readiness score and advice.
 * - ReadinessScoreInput - The input type for the flow.
 * - ReadinessScoreOutput - The output type for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ReadinessScoreInputSchema = z.object({
    surveyData: z.object({
        sleepQuality: z.number().min(1).max(5).describe("A self-rated sleep quality score from 1 (poor) to 5 (excellent)."),
        stressLevel: z.number().min(1).max(5).describe("A self-rated stress level from 1 (very low) to 5 (very high)."),
        physicalFeeling: z.enum(["energetic", "normal", "tired", "sore"]).describe("How the user's body feels physically."),
        mood: z.enum(["happy", "calm", "anxious", "sad"]).describe("The user's current emotional state."),
        nutrition: z.enum(["balanced", "indulgent", "poor"]).describe("A self-rating of recent nutrition."),
        hydration: z.enum(["good", "okay", "poor"]).describe("A self-rating of recent hydration."),
    }).describe("The user's answers to the daily readiness survey."),
    recentActivities: z.array(z.object({
        name: z.string(),
        impact: z.number(),
    })).describe("A list of the user's recent activities from the past 24 hours to provide context."),
});
export type ReadinessScoreInput = z.infer<typeof ReadinessScoreInputSchema>;


const ReadinessScoreOutputSchema = z.object({
    score: z.number().min(0).max(100).describe("A holistic 'readiness' score from 0 to 100, indicating the user's preparedness for the day."),
    title: z.string().describe("A short, catchy title for the readiness state, e.g., 'Ready to Thrive', 'Pace Yourself', 'Time to Recover'."),
    summary: z.string().describe("A one-sentence summary explaining the score in a supportive and actionable way."),
});
export type ReadinessScoreOutput = z.infer<typeof ReadinessScoreOutputSchema>;


export async function getReadinessScore(input: ReadinessScoreInput): Promise<ReadinessScoreOutput> {
  return readinessScoreFlow(input);
}

const prompt = ai.definePrompt({
    name: 'readinessScorePrompt',
    input: { schema: ReadinessScoreInputSchema },
    output: { schema: ReadinessScoreOutputSchema },
    prompt: `You are a sophisticated health and wellness AI. Your task is to calculate a user's daily "Readiness Score" based on their answers to a short survey and their recent activity.

    Analyze the provided data to generate a score from 0 (very poor readiness) to 100 (peak readiness).

    - **High Readiness (75-100)**: Excellent sleep, low stress, feeling 'energetic', 'happy' mood, 'balanced' nutrition, and 'good' hydration.
    - **Moderate Readiness (40-74)**: Average sleep, moderate stress, 'normal'/'tired' feeling, 'calm'/'anxious' mood, 'indulgent' nutrition, or 'okay' hydration.
    - **Low Readiness (<40)**: Poor sleep, high stress, 'sore'/'tired' feeling, 'sad'/'anxious' mood, 'poor' nutrition, or 'poor' hydration.

    After calculating the score, provide a short title and a one-sentence summary that explains the score and offers simple advice.

    USER DATA:
    - Survey Answers:
        - Sleep Quality (1-5): {{{surveyData.sleepQuality}}}
        - Stress Level (1-5): {{{surveyData.stressLevel}}}
        - How Body Feels: "{{{surveyData.physicalFeeling}}}"
        - Current Mood: "{{{surveyData.mood}}}"
        - Recent Nutrition: "{{{surveyData.nutrition}}}"
        - Hydration Level: "{{{surveyData.hydration}}}"
    - Recent Activities:
    {{#each recentActivities}}
        - {{name}} (Impact: {{impact}})
    {{/each}}
    `
});

const readinessScoreFlow = ai.defineFlow({
    name: 'readinessScoreFlow',
    inputSchema: ReadinessScoreInputSchema,
    outputSchema: ReadinessScoreOutputSchema,
}, async (input) => {
    const { output } = await prompt(input);
    return output!;
});
