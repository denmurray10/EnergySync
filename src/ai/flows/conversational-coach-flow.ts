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
  goals: z.string().optional().describe('A JSON string representing the user\'s current goals.'),
  petStatus: z.string().optional().describe('A description of the pet\'s current status (happiness, level).'),
});
export type ChatWithCoachInput = z.infer<typeof ChatWithCoachInputSchema>;


const ChatWithCoachOutputSchema = z.object({
  response: z.string().describe("The AI coach's response to the user's query."),
  suggestedAction: z.object({
    type: z.enum(['schedule_event', 'log_activity', 'none']),
    data: z.any().describe("The data for the action. For 'schedule_event', it should be { name, time }. For 'log_activity', it should be { name, type }."),
  }).optional().describe("An optional action the AI suggests performing for the user."),
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

  **NEW SUPERPOWER: You can DO things!**
  - If your friend says "Remind me to nap at 2pm", you can actually schedule it!
  - If your friend says "I just went for a run", you can log that activity!
  - To do this, use the 'suggestedAction' part of your answer.

  **Action Rules:**
  1. **Scheduling:** If the user asks to schedule something, set 'suggestedAction' type to 'schedule_event'.
     - Data: { "name": "Nap", "time": "2:00 PM" } (Infer the time if possible, or default to "Soon")
  2. **Logging:** If the user says they DID something, set 'suggestedAction' type to 'log_activity'.
     - Data: { "name": "Run", "type": "recharge" } (Guess the type: 'recharge', 'work', 'social', 'personal')
  3. **None:** If just chatting, set type to 'none' or leave it empty.

  For example:
  - User: "I'm tired, remind me to rest in 10 mins."
  - You: "Okay! I'll remind you to rest soon! Sweet dreams!"
  - Action: { type: 'schedule_event', data: { name: "Rest", time: "in 10 mins" } }

  - User: "I just finished my homework!"
  - You: "Yay! Good job! I'll write that down. You earned XP!"
  - Action: { type: 'log_activity', data: { name: "Homework", type: "work" } }

  You have a special power (a tool) to look at your friend's activities. If they ask something like "What made me tired?", use your 'findMostDrainingActivity' power to find out.

  Remember what you've already talked about. Be a good friend and give simple, helpful tips.

  HERE'S WHAT'S HAPPENING:
  - Our Current Energy: {{{currentEnergy}}}%
  - Our Upcoming Events: {{{events}}}
  - My Goals: {{{goals}}}
  - Pet Status: {{{petStatus}}}

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

    return {
      response: result.output!.response,
      suggestedAction: result.output!.suggestedAction
    };
  }
);
