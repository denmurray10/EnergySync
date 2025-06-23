'use server';

/**
 * @fileOverview Provides proactive energy management suggestions based on user's context.
 * 
 * - getProactiveSuggestion - A function that returns a single, actionable suggestion.
 * - ProactiveSuggestionInput - The input type for the flow.
 * - ProactiveSuggestionOutput - The output type for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ProactiveSuggestionInputSchema = z.object({
    currentEnergy: z.number().describe("The user's current energy level (0-100)."),
    upcomingEvents: z.array(z.object({
        name: z.string(),
        type: z.string(),
        estimatedImpact: z.number(),
    })).describe("A list of the user's upcoming events."),
    recentActivities: z.array(z.object({
        name: z.string(),
        type: z.string(),
        impact: z.number(),
    })).describe("A list of the user's recent activities."),
    currentUserLocation: z.string().optional().describe("The user's current physical location, like 'Home', 'Office', or 'Park'.")
});
export type ProactiveSuggestionInput = z.infer<typeof ProactiveSuggestionInputSchema>;


const ProactiveSuggestionOutputSchema = z.object({
    suggestion: z.string().describe("A single, short, actionable suggestion for the user to manage their energy. Should be friendly and encouraging. Should start with a relevant emoji."),
});
export type ProactiveSuggestionOutput = z.infer<typeof ProactiveSuggestionOutputSchema>;


export async function getProactiveSuggestion(input: ProactiveSuggestionInput): Promise<ProactiveSuggestionOutput> {
  return proactiveSuggestionFlow(input);
}

const prompt = ai.definePrompt({
    name: 'proactiveSuggestionPrompt',
    input: { schema: ProactiveSuggestionInputSchema },
    output: { schema: ProactiveSuggestionOutputSchema },
    prompt: `You are an AI Energy Coach. Your goal is to provide a single, short, friendly, and actionable piece of advice to help the user manage their energy.

    Analyze the user's current energy level, their upcoming events, their recent activities, and their current location.
    Based on this context, generate one proactive suggestion.

    - If their energy is low and they have a draining event coming up, suggest a quick recharge activity.
    - If they have a high-impact event soon, suggest a buffer or preparation.
    - If they've had many draining activities recently, recommend a break.
    - If their energy is high, give them an encouraging message.
    - If their location is provided, try to make the suggestion relevant to it. For example, if they are at a 'Park', suggest a walk. If at 'Home', suggest a home-based activity.
    - Make the suggestion concise and start it with a relevant emoji.

    CONTEXT:
    - Current Energy: {{{currentEnergy}}}%
    {{#if currentUserLocation}}
    - Current Location: {{{currentUserLocation}}}
    {{/if}}
    - Upcoming Events: {{#each upcomingEvents}}'{{name}}' (Impact: {{estimatedImpact}}), {{/each}}
    - Recent Activities: {{#each recentActivities}}'{{name}}' (Impact: {{impact}}), {{/each}}
    `
});

const proactiveSuggestionFlow = ai.defineFlow({
    name: 'proactiveSuggestionFlow',
    inputSchema: ProactiveSuggestionInputSchema,
    outputSchema: ProactiveSuggestionOutputSchema,
}, async (input) => {
    const { output } = await prompt(input);
    return output!;
});
