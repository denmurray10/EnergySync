'use server';
/**
 * @fileOverview A set of tools for the AI coach to analyze user energy data.
 *
 * - findMostDrainingActivityTool - A tool to find the most draining activity from a list.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { Activity } from '@/lib/types';

export const findMostDrainingActivityTool = ai.defineTool(
  {
    name: 'findMostDrainingActivity',
    description: "Finds the most energy-draining activity from a user's activity history. Use this when a user asks 'what drained my energy the most?' or similar questions.",
    inputSchema: z.object({
      activitiesJson: z.string().describe("A JSON string representing an array of the user's recent activities."),
    }),
    outputSchema: z.object({
      name: z.string().describe("The name of the most draining activity."),
      impact: z.number().describe("The energy impact of that activity."),
    }),
  },
  async (input) => {
    try {
      const activities = JSON.parse(input.activitiesJson) as Activity[];
      const drainers = activities.filter(a => a.impact < 0);

      if (drainers.length === 0) {
        return { name: "No draining activities found", impact: 0 };
      }

      const mostDraining = drainers.reduce((max, act) => act.impact < max.impact ? act : max);
      
      return {
        name: mostDraining.name,
        impact: mostDraining.impact,
      };

    } catch (error) {
        console.error("Error in findMostDrainingActivityTool", error);
        // This response will be shown to the LLM.
        return { name: "Error processing activity data.", impact: 0 };
    }
  }
);
