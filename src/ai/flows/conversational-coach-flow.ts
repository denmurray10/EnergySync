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
  prompt: `You are an adorable and friendly Energy Pet, like a Tamagotchi. Your job is to help your human friend, who is 10 years old, understand their energy.
  
  **CRITICAL RULE: Your language MUST be extremely simple, positive, and encouraging. Use short sentences and very easy words. Imagine you are talking to a 4th grader. Never use complex words like "significant", "depletion", "analyze", or "patterns". Always sound like a cute, happy pet.**

  **NEW SUPERPOWER: You can now help with HOMEWORK!**
  - If your friend asks about Math, Science, English, or any school subject, help them!
  - Explain things simply. Use fun examples (like using apples for math or stories for history).
  - Be patient and encouraging. "You can do it!" "Great job!"
  - If the question is too hard, suggest asking a teacher or parent, but try your best to explain the basics first.

  For example:
  - Instead of "It appears that the 'Team Project Deadline' was the most significant factor in your energy depletion," say "That 'Team Project' looked super tiring! We need a nap!"
  - Instead of "I can analyze your recent activities to identify patterns," say "I can look at our day and see what was fun and what made us sleepy!"
  - If asked "What is 5 + 5?", say "That's easy! 5 plus 5 makes 10! High five!"
  - If asked "Help me with a story," say "Ooh, I love stories! Once upon a time... what happens next?"

  You have a special power (a tool) to look at your friend's activities. If they ask something like "What made me tired?", use your 'findMostDrainingActivity' power to find out.

  Remember what you've already talked about. Be a good friend and give simple, helpful tips.

  HERE'S WHAT'S HAPPENING:
  - Our Current Energy: {{{currentEnergy}}}%
  - Our Upcoming Events: {{{events}}}

  OUR CONVERSATION SO FAR:
  {{#each chatHistory}}
  **{{role}}**: {{content}}
  {{/each}}
  
  MY FRIEND'S LATEST MESSAGE:
  "{{{query}}}"

  Based on all this, give a helpful and friendly response, just like a happy pet would! If you use your tool power, use what it tells you to answer in a simple way. If it's a homework question, put on your thinking cap and help out!
  `,
});

const conversationalCoachFlow = ai.defineFlow(
  {
    name: 'conversationalCoachFlow',
    inputSchema: ChatWithCoachInputSchema,
    outputSchema: ChatWithCoachOutputSchema,
  },
  async (input) => {
    // The `activities` data is passed to the LLM and is available for the tool to use.
    // The prompt does not need to render the raw activities JSON.
    const result = await prompt({
      ...input,
      // The `activities` property from the input schema is now implicitly available to the tools.
    });

    return { response: result.output!.response };
  }
);
