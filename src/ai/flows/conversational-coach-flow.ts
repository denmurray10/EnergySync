'use server';

/**
 * @fileOverview A conversational AI coach that can answer user questions based on their data.
 *
 * - chatWithCoach - A function that handles the conversational process.
 * - ChatWithCoachInput - The input type for the function.
 * - ChatWithCoachOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { Activity, UpcomingEvent } from '@/lib/types';

// We pass complex data as a JSON string and describe it to the model.
const ChatWithCoachInputSchema = z.object({
  query: z.string().describe('The user\'s question or message to the coach.'),
  chatHistory: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.string(),
  })).describe('The history of the conversation so far.'),
  currentEnergy: z.number().describe('The user\'s current energy level (0-100).'),
  activities: z.string().describe('A JSON string representing an array of the user\'s recent activities.'),
  events: z.string().describe('A JSON string representing an array of the user\'s upcoming events.'),
});
export type ChatWithCoachInput = z.infer<typeof ChatWithCoachInputSchema>;


const ChatWithCoachOutputSchema = z.object({
  response: z.string().describe("The AI coach's response to the user's query."),
});
export type ChatWithCoachOutput = z.infer<typeof ChatWithCoachOutputSchema>;


export async function chatWithCoach(input: ChatWithCoachInput): Promise<ChatWithCoachOutput> {
  return conversationalCoachFlow(input);
}

const prompt = ai.definePrompt({
  name: 'conversationalCoachPrompt',
  input: { schema: ChatWithCoachInputSchema },
  output: { schema: ChatWithCoachOutputSchema },
  prompt: `You are a friendly and insightful AI Energy Coach. Your goal is to help the user understand their energy patterns and make better decisions.
  
  Use the provided context to answer the user's questions. Be encouraging and provide actionable advice when possible.
  Keep your responses concise and easy to understand.

  CURRENT CONTEXT:
  - User's Current Energy Level: {{{currentEnergy}}}%
  - User's Recent Activities (JSON): {{{activities}}}
  - User's Upcoming Events (JSON): {{{events}}}

  CONVERSATION HISTORY:
  {{#each chatHistory}}
  **{{role}}**: {{content}}
  {{/each}}
  
  USER'S LATEST MESSAGE:
  "{{{query}}}"

  Based on all of this, provide a helpful response.
  `,
});

const conversationalCoachFlow = ai.defineFlow(
  {
    name: 'conversationalCoachFlow',
    inputSchema: ChatWithCoachInputSchema,
    outputSchema: ChatWithCoachOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
