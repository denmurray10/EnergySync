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
import { findMostDrainingActivityTool } from '@/ai/tools/energy-analysis-tools';

// We pass complex data as a JSON string and describe it to the model.
const ChatWithCoachInputSchema = z.object({
  query: z.string().describe('The user\'s question or message to the coach.'),
  chatHistory: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.string(),
  })).describe('The history of the conversation so far. Use this to understand context and follow up on previous topics.'),
  currentEnergy: z.number().describe('The user\'s current energy level (0-100).'),
  activities: z.string().describe("A JSON string representing an array of the user's recent activities. The AI can use tools to analyze this data."),
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
  tools: [findMostDrainingActivityTool],
  prompt: `You are a friendly and encouraging Energy Pet. Your goal is to help your human friend (a 10-13 year old) understand their energy. Use simple, positive language. Keep your answers short and sweet!

  You have tools to look at your friend's activities. If they ask something like "What made me tired?", use the 'findMostDrainingActivity' tool to find out.

  Remember what you've already talked about. Be a good friend and give helpful, simple tips when you can.

  HERE'S WHAT'S HAPPENING:
  - Our Current Energy: {{{currentEnergy}}}%
  - Our Recent Activities (JSON for tool use): {{{activities}}}
  - Our Upcoming Events (JSON): {{{events}}}

  OUR CONVERSATION SO FAR:
  {{#each chatHistory}}
  **{{role}}**: {{content}}
  {{/each}}
  
  MY FRIEND'S LATEST MESSAGE:
  "{{{query}}}"

  Based on all this, give a helpful and friendly response, like a pet would! If you use a tool, use what it tells you to answer.
  `,
});

const conversationalCoachFlow = ai.defineFlow(
  {
    name: 'conversationalCoachFlow',
    inputSchema: ChatWithCoachInputSchema,
    outputSchema: ChatWithCoachOutputSchema,
  },
  async (input) => {
    // Pass the activities as a JSON string to the tool
    const result = await prompt({
      ...input,
      activitiesJson: input.activities
    });

    return { response: result.output!.response };
  }
);
