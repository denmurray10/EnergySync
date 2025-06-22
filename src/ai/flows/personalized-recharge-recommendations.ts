// src/ai/flows/personalized-recharge-recommendations.ts
'use server';

/**
 * @fileOverview Provides personalized recharge activity recommendations based on user's logged activities and energy levels.
 *
 * - getRechargeRecommendations - A function that takes user's activities and energy level as input and returns personalized recharge recommendations.
 * - RechargeRecommendationsInput - The input type for the getRechargeRecommendations function.
 * - RechargeRecommendationsOutput - The return type for the getRechargeRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RechargeRecommendationsInputSchema = z.object({
  activities: z.array(
    z.object({
      name: z.string(),
      type: z.string(),
      impact: z.number(),
      duration: z.number(),
      date: z.string(),
      emoji: z.string(),
      location: z.string(),
      autoDetected: z.boolean(),
      recoveryTime: z.number(),
    })
  ).describe('Array of user activities with details like name, type, impact, duration, etc.'),
  currentEnergy: z.number().describe('The current energy level of the user (0-100).'),
});
export type RechargeRecommendationsInput = z.infer<typeof RechargeRecommendationsInputSchema>;

const RechargeRecommendationsOutputSchema = z.array(
  z.object({
    name: z.string().describe('The name of the recommended recharge activity.'),
    description: z.string().describe('A short description of the recharge activity and its benefits.'),
    expectedImpact: z.number().describe('The estimated impact of the activity on energy levels.'),
    duration: z.number().describe('The recommended duration for the activity in minutes.'),
    emoji: z.string().describe('An emoji representing the activity.'),
  })
).describe('Array of personalized recharge activity recommendations.');
export type RechargeRecommendationsOutput = z.infer<typeof RechargeRecommendationsOutputSchema>;

export async function getRechargeRecommendations(input: RechargeRecommendationsInput): Promise<RechargeRecommendationsOutput> {
  return personalizedRechargeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'rechargeRecommendationsPrompt',
  input: {schema: RechargeRecommendationsInputSchema},
  output: {schema: RechargeRecommendationsOutputSchema},
  prompt: `You are an AI assistant specialized in providing personalized recharge activity recommendations.

  Based on the user's activity history and current energy level, suggest recharge activities that can help them quickly recover energy.
  Consider the impact, duration, and type of activities when making recommendations.

  Current Energy Level: {{{currentEnergy}}}
  Activity History: {{#each activities}}{{{name}}} (impact: {{{impact}}}, duration: {{{duration}}}), {{/each}}

  Provide a list of recharge activities with a short description, expected impact, and duration.
  The response should be a JSON array.
  Ensure that only activities are provided in the JSON response.
  `,
});

const personalizedRechargeFlow = ai.defineFlow(
  {
    name: 'personalizedRechargeFlow',
    inputSchema: RechargeRecommendationsInputSchema,
    outputSchema: RechargeRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
