
'use server';
/**
 * @fileOverview Analyzes an image to suggest details for an activity log.
 *
 * - analyzeImageForActivity - A function that handles the image analysis.
 * - AnalyzeImageInput - The input type for the function.
 * - AnalyzeImageOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeImageInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "A photo provided by the user, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeImageInput = z.infer<typeof AnalyzeImageInputSchema>;

const AnalyzeImageOutputSchema = z.object({
    name: z.string().describe('A descriptive name for the activity inferred from the image.'),
    type: z.enum(["social", "work", "recharge", "personal"]).describe('The category of the activity.'),
    impact: z.number().min(-50).max(50).describe('The estimated energy impact, from -50 (draining) to +50 (recharging).'),
    duration: z.coerce.number().min(5).describe('A typical duration for this activity in minutes.'),
    emoji: z.string().min(1).describe('A single emoji that represents the activity.'),
    location: z.string().describe('The likely location of the activity (e.g., Home, Office, Park, Cafe).'),
});
export type AnalyzeImageOutput = z.infer<typeof AnalyzeImageOutputSchema>;

export async function analyzeImageForActivity(input: AnalyzeImageInput): Promise<AnalyzeImageOutput> {
  return imageCheckinFlow(input);
}

const prompt = ai.definePrompt({
  name: 'imageCheckinPrompt',
  input: {schema: AnalyzeImageInputSchema},
  output: {schema: AnalyzeImageOutputSchema},
  prompt: `You are an intelligent assistant in an energy tracking app. Your task is to analyze the provided image and infer the activity the user is likely doing.

Based on the image's content, objects, and setting, suggest the full details for logging this activity.

- **name**: A short, descriptive name for the activity.
- **type**: The category: "social", "work", "recharge", or "personal".
- **impact**: An estimated energy impact from -50 (very draining) to +50 (very recharging).
- **duration**: A sensible default duration in minutes.
- **emoji**: A single, relevant emoji.
- **location**: The likely location of the activity.

For example:
- An image of a laptop, notebook, and coffee on a desk might be: { name: "Focused Work Session", type: "work", impact: -20, duration: 90, emoji: "💻", location: "Office" }.
- An image of a park bench and trees might be: { name: "Relaxing Walk in the Park", type: "recharge", impact: 20, duration: 30, emoji: "🌳", location: "Park" }.
- An image of a meal with friends at a restaurant might be: { name: "Dinner with Friends", type: "social", impact: -10, duration: 120, emoji: "🍽️", location: "Restaurant" }.

Analyze the following image:
{{media url=imageDataUri}}`,
});

const imageCheckinFlow = ai.defineFlow(
  {
    name: 'imageCheckinFlow',
    inputSchema: AnalyzeImageInputSchema,
    outputSchema: AnalyzeImageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

    