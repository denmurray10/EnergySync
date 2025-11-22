
'use server';

/**
 * @fileOverview Suggests details for a new recharge activity based on its name.
 *
 * - suggestRechargeDetails - A function that takes an activity name and returns suggested details.
 * - SuggestRechargeDetailsInput - The input type for the suggestRechargeDetails function.
 * - SuggestRechargeDetailsOutput - The return type for the suggestRechargeDetails function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestRechargeDetailsInputSchema = z.object({
  name: z.string().describe('The name of the recharge activity the user wants to log.'),
});
export type SuggestRechargeDetailsInput = z.infer<typeof SuggestRechargeDetailsInputSchema>;

const SuggestRechargeDetailsOutputSchema = z.object({
    impact: z.number().min(5).max(50).describe('The estimated positive energy impact percentage, from 5 (mildly recharging) to 50 (very recharging).'),
    duration: z.coerce.number().min(5).describe('The typical duration for this activity in minutes.'),
    emoji: z.string().min(1).describe('A single emoji that represents the activity.'),
});
export type SuggestRechargeDetailsOutput = z.infer<typeof SuggestRechargeDetailsOutputSchema>;

export async function suggestRechargeDetails(input: SuggestRechargeDetailsInput): Promise<SuggestRechargeDetailsOutput> {
  return suggestDetailsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestRechargeDetailsPrompt',
  input: {schema: SuggestRechargeDetailsInputSchema},
  output: {schema: SuggestRechargeDetailsOutputSchema},
  prompt: `You are an intelligent assistant helping a user log a custom recharge activity in an energy tracking app.
  Based on the activity name provided by the user, predict and suggest the most likely details for this activity.

  - The 'impact' must be a positive number between 5 and 50, representing the energy gain. A short walk might be +10, while a nap could be +30.
  - The 'duration' should be a sensible default in minutes.
  - The 'emoji' should be a single, relevant emoji.

  Activity Name: {{{name}}}
  `,
});

const suggestDetailsFlow = ai.defineFlow(
  {
    name: 'suggestRechargeDetailsFlow',
    inputSchema: SuggestRechargeDetailsInputSchema,
    outputSchema: SuggestRechargeDetailsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

    