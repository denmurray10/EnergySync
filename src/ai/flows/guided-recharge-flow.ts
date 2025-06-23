'use server';

/**
 * @fileOverview Generates a script for a guided audio recharge session.
 * 
 * - getGuidedRechargeScript - A function that returns a session script.
 * - GuidedRechargeInput - The input type for the flow.
 * - GuidedRechargeOutput - The output type for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GuidedRechargeInputSchema = z.object({
  type: z.enum(["Breathing", "Mindfulness", "Visualization"]).describe("The type of guided session requested."),
  duration: z.number().min(1).max(10).describe("The desired duration of the session in minutes."),
});
export type GuidedRechargeInput = z.infer<typeof GuidedRechargeInputSchema>;


const GuidedRechargeOutputSchema = z.object({
    script: z.string().describe("A soothing, well-structured script for the guided session. It should be written in a calm, reassuring tone, suitable for text-to-speech. It should guide the user through the specified exercise and be appropriately timed for the requested duration."),
});
export type GuidedRechargeOutput = z.infer<typeof GuidedRechargeOutputSchema>;


export async function getGuidedRechargeScript(input: GuidedRechargeInput): Promise<GuidedRechargeOutput> {
  return guidedRechargeFlow(input);
}

const prompt = ai.definePrompt({
    name: 'guidedRechargePrompt',
    input: { schema: GuidedRechargeInputSchema },
    output: { schema: GuidedRechargeOutputSchema },
    prompt: `You are a world-class mindfulness and meditation coach.
    
    Your task is to write a script for a guided audio session. The script should be calm, soothing, and easy to follow.
    It needs to be tailored to the specified type and duration. Use pauses and gentle instructions.
    
    - For 'Breathing', focus on techniques like box breathing or diaphragmatic breathing.
    - For 'Mindfulness', focus on body scan techniques or observing thoughts without judgment.
    - For 'Visualization', guide the user to imagine a peaceful place, like a forest or a beach.
    
    The script should be structured to last for the requested duration. For a 3-minute session, aim for about 3-4 paragraphs.
    
    Session Type: {{{type}}}
    Duration: {{{duration}}} minutes
    
    Generate the script now.
    `
});

const guidedRechargeFlow = ai.defineFlow({
    name: 'guidedRechargeFlow',
    inputSchema: GuidedRechargeInputSchema,
    outputSchema: GuidedRechargeOutputSchema,
}, async (input) => {
    const { output } = await prompt(input);
    return output!;
});
