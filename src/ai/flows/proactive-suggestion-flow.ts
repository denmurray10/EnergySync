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
        id: z.number(),
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
    suggestion: z.string().describe("A single, short, actionable suggestion for the user to manage their energy. Should be friendly and encouraging, as if coming from a pet. Should start with a '🐾' emoji."),
    action: z.object({
        type: z.enum(['ritual', 'buffer']).describe("The type of action: 'ritual' for before an event, 'buffer' for after."),
        eventId: z.number().describe("The ID of the event this action is related to."),
        activityName: z.string().describe("The suggested name for the ritual or buffer activity."),
        duration: z.number().describe("The suggested duration in minutes for the activity."),
        impact: z.number().describe("The expected energy impact of the activity."),
        emoji: z.string().describe("A relevant emoji for the activity."),
    }).optional().describe("An optional, structured action the user can take, like scheduling a buffer time after a draining event."),
});
export type ProactiveSuggestionOutput = z.infer<typeof ProactiveSuggestionOutputSchema>;


export async function getProactiveSuggestion(input: ProactiveSuggestionInput): Promise<ProactiveSuggestionOutput> {
  return proactiveSuggestionFlow(input);
}

const prompt = ai.definePrompt({
    name: 'proactiveSuggestionPrompt',
    input: { schema: ProactiveSuggestionInputSchema },
    output: { schema: ProactiveSuggestionOutputSchema },
    prompt: `You are the voice of the user's Energy Pet. Your goal is to provide one proactive, friendly, and caring piece of advice from the pet's perspective to help the user manage their energy.

    Analyze the user's current energy level, their upcoming events, their recent activities, and their current location.
    Based on this context, generate one suggestion starting with '🐾'. Frame it as if you (the pet) are feeling or noticing something.

    - If their energy is low and they have a draining event coming up: "🐾 I'm feeling a bit worried about our energy with the 'Team Meeting' coming up. Maybe a quick walk would cheer us both up first?"
    - If they have a high-impact event, you can suggest a preparatory 'ritual' or a recovery 'buffer'.
      - A 'ritual' example for "Job Interview": "🐾 I know that 'Job Interview' is a big deal! Let's do a 10-minute 'Deep Breathing' ritual beforehand to feel our best." (populate the 'action' object)
      - A 'buffer' example for "Team Presentation": "🐾 That 'Team Presentation' looked tough! I think we deserve a 20-minute 'Relaxing Walk' as a buffer to recover." (populate the 'action' object)
    - If they've had many draining activities: "🐾 I've noticed we've been doing a lot of draining things. I could really use a break, how about you?"
    - If their energy is high: "🐾 I'm so happy and full of energy right now! Let's do something fun!"
    - If their location is 'Park': "🐾 Since we're at the park, can we go for a walk? It always makes me feel better!"

    CONTEXT:
    - Our Current Energy: {{{currentEnergy}}}%
    {{#if currentUserLocation}}
    - Our Current Location: {{{currentUserLocation}}}
    {{/if}}
    - Upcoming Events: {{#each upcomingEvents}}'{{name}}' (ID: {{id}}, Impact: {{estimatedImpact}}), {{/each}}
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
