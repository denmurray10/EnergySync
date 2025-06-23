'use server';

/**
 * @fileOverview Analyzes user activities to identify energy "hotspots".
 * 
 * - analyzeEnergyHotspots - A function that returns top draining and recharging locations.
 * - EnergyHotspotAnalysisInput - The input type for the flow.
 * - EnergyHotspotAnalysis - The output type for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { Activity } from '@/lib/types';

const EnergyHotspotAnalysisInputSchema = z.object({
    activities: z.array(z.custom<Activity>()).describe("An array of the user's logged activities."),
});
export type EnergyHotspotAnalysisInput = z.infer<typeof EnergyHotspotAnalysisInputSchema>;

const EnergyHotspotSchema = z.object({
  location: z.string().describe('The name of the location.'),
  averageImpact: z.number().describe('The average energy impact at this location.'),
});

const EnergyHotspotAnalysisOutputSchema = z.object({
    drainingHotspots: z.array(EnergyHotspotSchema).describe("An array of up to 2 locations that are most consistently draining for the user."),
    rechargingHotspots: z.array(EnergyHotspotSchema).describe("An array of up to 2 locations that are most consistently recharging for the user."),
});
export type EnergyHotspotAnalysis = z.infer<typeof EnergyHotspotAnalysisOutputSchema>;

export async function analyzeEnergyHotspots(input: EnergyHotspotAnalysisInput): Promise<EnergyHotspotAnalysis> {
  return energyHotspotFlow(input);
}

const prompt = ai.definePrompt({
    name: 'energyHotspotPrompt',
    input: { schema: EnergyHotspotAnalysisInputSchema },
    output: { schema: EnergyHotspotAnalysisOutputSchema },
    prompt: `You are a data analyst specializing in personal energy management. Your task is to analyze a user's activity log to find "Energy Hotspots"—locations that consistently drain or recharge their energy.

    - Group activities by location.
    - For each location, calculate the average energy impact. Ignore locations with only one entry.
    - Identify the top 1-2 locations with the most negative average impact (draining hotspots).
    - Identify the top 1-2 locations with the most positive average impact (recharging hotspots).
    - If there are no clear hotspots (e.g., not enough data), return empty arrays.

    Here is the user's activity data:
    {{#each activities}}
    - Location: {{location}}, Impact: {{impact}}
    {{/each}}
    `
});

const energyHotspotFlow = ai.defineFlow({
    name: 'energyHotspotFlow',
    inputSchema: EnergyHotspotAnalysisInputSchema,
    outputSchema: EnergyHotspotAnalysisOutputSchema,
}, async (input) => {
    // Basic pre-processing in case the LLM needs help
    const locationStats: { [key: string]: { totalImpact: number, count: number } } = {};
    
    input.activities.forEach(activity => {
        if (!locationStats[activity.location]) {
            locationStats[activity.location] = { totalImpact: 0, count: 0 };
        }
        locationStats[activity.location].totalImpact += activity.impact;
        locationStats[activity.location].count++;
    });

    if (Object.keys(locationStats).length < 2) {
        return { drainingHotspots: [], rechargingHotspots: [] };
    }
    
    const { output } = await prompt(input);
    return output!;
});
