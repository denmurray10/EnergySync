'use server';

/**
 * @fileOverview Calculates a user's daily readiness score based on biometric and activity data.
 * 
 * - getReadinessScore - A function that returns a readiness score and advice.
 * - ReadinessScoreInput - The input type for the flow.
 * - ReadinessScoreOutput - The output type for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ReadinessScoreInputSchema = z.object({
    biometrics: z.object({
        heartRate: z.number().describe("Resting heart rate in BPM."),
        sleepQuality: z.number().describe("Sleep quality percentage (0-100)."),
        stressLevel: z.number().describe("A stress level score (0-100)."),
    }).describe("The user's latest biometric data."),
    recentActivities: z.array(z.object({
        name: z.string(),
        impact: z.number(),
    })).describe("A list of the user's recent activities from the past 24 hours."),
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
    prompt: `You are a sophisticated health and wellness AI. Your task is to calculate a user's daily "Readiness Score" based on their biometric data and recent activity.

    Analyze the provided data to generate a score from 0 (very poor readiness) to 100 (peak readiness).

    - **High Readiness (75-100)**: Indicated by good sleep (>80%), low stress (<40), and low resting heart rate.
    - **Moderate Readiness (40-74)**: Indicated by average sleep (60-80%), moderate stress, or a high number of recent draining activities.
    - **Low Readiness (<40)**: Indicated by poor sleep (<60%), high stress (>60), or very draining recent activities.

    After calculating the score, provide a short title and a one-sentence summary that explains the score and offers simple advice.

    USER DATA:
    - Biometrics:
        - Resting Heart Rate: {{{biometrics.heartRate}}} BPM
        - Sleep Quality: {{{biometrics.sleepQuality}}}%
        - Stress Level: {{{biometrics.stressLevel}}}
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
