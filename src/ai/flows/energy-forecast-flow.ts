'use server';

/**
 * @fileOverview Predicts a user's energy levels over the next 24 hours.
 * 
 * - getEnergyForecast - A function that returns an hourly energy forecast.
 * - EnergyForecastInput - The input type for the flow.
 * - EnergyForecastOutput - The output type for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { ReadinessReport } from '@/lib/types';

const EnergyForecastInputSchema = z.object({
    readinessReport: z.custom<ReadinessReport>().describe("The user's current readiness report, including score, title, and summary."),
    currentEnergy: z.number().describe("The user's current energy level (0-100)."),
    upcomingEvents: z.array(z.object({
        name: z.string(),
        estimatedImpact: z.number(),
        time: z.string().describe("Time of the event, e.g., '2:00 PM'"),
    })).describe("A list of the user's upcoming events for today."),
    recentActivities: z.array(z.object({
        name: z.string(),
        impact: z.number(),
    })).describe("A list of the user's recent activities from the past 24 hours to understand their general patterns."),
});
export type EnergyForecastInput = z.infer<typeof EnergyForecastInputSchema>;

const EnergyForecastOutputSchema = z.array(z.object({
    hour: z.string().describe("The hour of the day in a 'ha' format, e.g., '9am', '1pm', '10pm'."),
    predictedEnergy: z.number().min(0).max(100).describe("The predicted energy level for that hour."),
}));
export type EnergyForecastOutput = z.infer<typeof EnergyForecastOutputSchema>;


export async function getEnergyForecast(input: EnergyForecastInput): Promise<EnergyForecastOutput> {
  return energyForecastFlow(input);
}

const prompt = ai.definePrompt({
    name: 'energyForecastPrompt',
    input: { schema: EnergyForecastInputSchema },
    output: { schema: EnergyForecastOutputSchema },
    prompt: `You are an expert energy data scientist. Your task is to create a 24-hour energy forecast for a user, starting from the next hour.
    
    Analyze the user's readiness score, current energy, upcoming events, and recent activity patterns to predict their energy levels for each hour of the upcoming day.

    - **Baseline**: Use the readiness score and current energy as the starting point. A high readiness score means energy drains slower and recovers faster. A low readiness score means the opposite.
    - **Events**: The 'upcomingEvents' list shows scheduled demands. Create significant energy dips around the time of events with negative impacts. The size of the dip should correspond to the 'estimatedImpact'.
    - **Natural Rhythm**: Assume a natural, gradual decrease in energy throughout the day, with a slight dip in the early afternoon (post-lunch). Energy should recover slightly overnight during sleep hours (e.g., after 11pm).
    - **Patterns**: Use 'recentActivities' to understand the user's typical behavior, but the primary drivers for the forecast should be the readiness and upcoming events.
    - **Output**: Return an array of hourly predictions for the next 24 hours. The 'hour' format should be like '9am', '1pm', '10pm'. The 'predictedEnergy' must be between 0 and 100.

    CONTEXT:
    - Current Energy: {{{currentEnergy}}}%
    - Today's Readiness Report: "{{readinessReport.title}}" (Score: {{readinessReport.score}}). Summary: {{readinessReport.summary}}
    - Upcoming Events Today: {{#each upcomingEvents}}'{{name}}' at {{time}} (Impact: {{estimatedImpact}}), {{/each}}
    - Recent Activity Patterns: {{#each recentActivities}}'{{name}}' (Impact: {{impact}}), {{/each}}
    `
});

const energyForecastFlow = ai.defineFlow({
    name: 'energyForecastFlow',
    inputSchema: EnergyForecastInputSchema,
    outputSchema: EnergyForecastOutputSchema,
}, async (input) => {
    const { output } = await prompt(input);
    return output!;
});
