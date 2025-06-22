'use server';

/**
 * @fileOverview Suggests details for a new activity based on its name.
 *
 * - suggestActivityDetails - A function that takes an activity name and returns suggested details.
 * - SuggestActivityDetailsInput - The input type for the suggestActivityDetails function.
 * - SuggestActivityDetailsOutput - The return type for the suggestActivityDetails function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestActivityDetailsInputSchema = z.object({
  name: z.string().describe('The name of the activity the user wants to log.'),
});
export type SuggestActivityDetailsInput = z.infer<typeof SuggestActivityDetailsInputSchema>;

const SuggestActivityDetailsOutputSchema = z.object({
    type: z.enum(["social", "work", "recharge", "personal"]).describe('The category of the activity.'),
    impact: z.number().min(-50).max(50).describe('The estimated energy impact percentage, from -50 (draining) to +50 (recharging).'),
    duration: z.coerce.number().min(5).describe('The typical duration for this activity in minutes.'),
    emoji: z.string().max(2).describe('A single emoji that represents the activity.'),
});
export type SuggestActivityDetailsOutput = z.infer<typeof SuggestActivityDetailsOutputSchema>;

export async function suggestActivityDetails(input: SuggestActivityDetailsInput): Promise<SuggestActivityDetailsOutput> {
  return suggestDetailsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestActivityDetailsPrompt',
  input: {schema: SuggestActivityDetailsInputSchema},
  output: {schema: SuggestActivityDetailsOutputSchema},
  prompt: `You are an intelligent assistant helping a user log their daily activities in an energy tracking app.
  Based on the activity name provided by the user, predict and suggest the most likely details for this activity.

  - The 'type' should be one of: "social", "work", "recharge", "personal".
  - The 'impact' should be a number between -50 and 50, representing the energy change. A social event might be -15, while reading a book could be +20.
  - The 'duration' should be a sensible default in minutes.
  - The 'emoji' should be a single, relevant emoji.

  Activity Name: {{{name}}}
  `,
});

const suggestDetailsFlow = ai.defineFlow(
  {
    name: 'suggestDetailsFlow',
    inputSchema: SuggestActivityDetailsInputSchema,
    outputSchema: SuggestActivityDetailsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
