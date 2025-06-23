'use server';

/**
 * @fileOverview Analyzes a user's text check-in to determine sentiment and energy impact.
 * 
 * - analyzeCheckin - A function that takes a text string and returns a structured analysis.
 * - AnalyzeCheckinInput - The input type.
 * - AnalyzeCheckinOutput - The output type.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AnalyzeCheckinInputSchema = z.object({
    checkInText: z.string().describe("The user's spoken or typed check-in message."),
});
export type AnalyzeCheckinInput = z.infer<typeof AnalyzeCheckinInputSchema>;

const AnalyzeCheckinOutputSchema = z.object({
    energyImpact: z.number().min(-50).max(50).describe("The estimated energy impact, from -50 (very draining) to +50 (very recharging), based on the text's sentiment."),
    summary: z.string().describe("A short, encouraging summary acknowledging the user's feeling. e.g., 'Sounds like you had a tough meeting.'"),
});
export type AnalyzeCheckinOutput = z.infer<typeof AnalyzeCheckinOutputSchema>;

export async function analyzeCheckin(input: AnalyzeCheckinInput): Promise<AnalyzeCheckinOutput> {
  return analyzeCheckinFlow(input);
}

const prompt = ai.definePrompt({
    name: 'analyzeCheckinPrompt',
    input: { schema: AnalyzeCheckinInputSchema },
    output: { schema: AnalyzeCheckinOutputSchema },
    prompt: `You are an empathetic AI assistant in an energy tracking app. Analyze the user's text check-in for its emotional sentiment.

    Based on the sentiment, determine the energy impact:
    - Very positive (e.g., "I feel fantastic!"): +20 to +40
    - Mildly positive (e.g., "Feeling pretty good."): +5 to +15
    - Neutral or mixed: 0
    - Mildly negative (e.g., "A bit tired."): -5 to -15
    - Very negative (e.g., "I'm totally exhausted."): -20 to -40

    Then, write a short, one-sentence summary that acknowledges their feeling in a supportive tone.

    User's check-in: "{{{checkInText}}}"
    `
});

const analyzeCheckinFlow = ai.defineFlow({
    name: 'analyzeCheckinFlow',
    inputSchema: AnalyzeCheckinInputSchema,
    outputSchema: AnalyzeCheckinOutputSchema,
}, async (input) => {
    const { output } = await prompt(input);
    return output!;
});
