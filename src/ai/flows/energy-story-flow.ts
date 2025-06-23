'use server';

/**
 * @fileOverview Generates a narrative summary of the user's previous day.
 * 
 * - getEnergyStory - A function that returns a personalized story.
 * - EnergyStoryInput - The input type for the flow.
 * - EnergyStoryOutput - The output type for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const EnergyStoryInputSchema = z.object({
    activities: z.array(z.object({
        name: z.string(),
        type: z.string(),
        impact: z.number(),
    })).describe("An array of activities from the user's previous day."),
});
export type EnergyStoryInput = z.infer<typeof EnergyStoryInputSchema>;


const EnergyStoryOutputSchema = z.object({
    story: z.string().describe("A short, engaging, narrative summary of the user's energy journey from the previous day. It should be written in a friendly, encouraging, and slightly story-like tone. It should highlight key moments of energy drain and recharge."),
});
export type EnergyStoryOutput = z.infer<typeof EnergyStoryOutputSchema>;


export async function getEnergyStory(input: EnergyStoryInput): Promise<EnergyStoryOutput> {
  return energyStoryFlow(input);
}

const prompt = ai.definePrompt({
    name: 'energyStoryPrompt',
    input: { schema: EnergyStoryInputSchema },
    output: { schema: EnergyStoryOutputSchema },
    prompt: `You are a creative and empathetic AI storyteller in an energy tracking app.
    
    Your task is to look at a user's list of activities from the previous day and weave them into a short, narrative "Energy Story".
    The tone should be positive and encouraging, even when talking about draining activities.
    
    - Start with a friendly opening like "Yesterday was quite a day!" or "Let's look back at your energy journey from yesterday."
    - Mention 1-2 key activities that drained their energy and 1-2 that recharged it.
    - Connect the activities in a story-like manner.
    - Keep it concise, around 3-4 sentences.

    Here are the activities from yesterday:
    {{#each activities}}
    - {{name}} (Impact: {{impact}})
    {{/each}}
    
    Now, generate the story.
    `
});

const energyStoryFlow = ai.defineFlow({
    name: 'energyStoryFlow',
    inputSchema: EnergyStoryInputSchema,
    outputSchema: EnergyStoryOutputSchema,
}, async (input) => {
    const { output } = await prompt(input);
    return output!;
});
