
'use server';

/**
 * @fileOverview Suggests details for a new event based on its name.
 *
 * - suggestEventDetails - A function that takes an event name and returns suggested details.
 * - SuggestEventDetailsInput - The input type for the suggestEventDetails function.
 * - SuggestEventDetailsOutput - The return type for the suggestEventDetails function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestEventDetailsInputSchema = z.object({
  name: z.string().describe('The name of the event the user wants to schedule.'),
});
export type SuggestEventDetailsInput = z.infer<typeof SuggestEventDetailsInputSchema>;

const SuggestEventDetailsOutputSchema = z.object({
    type: z.enum(["social", "work", "personal"]).describe('The category of the event.'),
    estimatedImpact: z.number().min(-50).max(50).describe('The estimated energy impact percentage, from -50 (draining) to +50 (recharging).'),
    emoji: z.string().describe('A single emoji that represents the event.'),
});
export type SuggestEventDetailsOutput = z.infer<typeof SuggestEventDetailsOutputSchema>;

export async function suggestEventDetails(input: SuggestEventDetailsInput): Promise<SuggestEventDetailsOutput> {
  return suggestEventDetailsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestEventDetailsPrompt',
  input: {schema: SuggestEventDetailsInputSchema},
  output: {schema: SuggestEventDetailsOutputSchema},
  prompt: `You are an intelligent assistant helping a user schedule an event in an energy tracking app.
  Based on the event name provided by the user, predict and suggest the most likely details.

  - The 'type' should be one of: "social", "work", or "personal".
  - The 'estimatedImpact' should be a number between -50 and 50, representing the energy change. A work meeting might be -20, while a personal hobby could be +15.
  - The 'emoji' should be a single, relevant emoji.

  Event Name: {{{name}}}
  `,
});

const suggestEventDetailsFlow = ai.defineFlow(
  {
    name: 'suggestEventDetailsFlow',
    inputSchema: SuggestEventDetailsInputSchema,
    outputSchema: SuggestEventDetailsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

    
