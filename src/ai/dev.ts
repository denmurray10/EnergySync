import { config } from 'dotenv';
config();

import '@/ai/flows/personalized-recharge-recommendations.ts';
import '@/ai/flows/suggest-activity-details.ts';
import '@/ai/flows/suggest-recharge-details.ts';
import '@/ai/flows/proactive-suggestion-flow.ts';
import '@/ai/flows/analyze-checkin-flow.ts';
import '@/ai/flows/readiness-score-flow.ts';
import '@/ai/flows/energy-story-flow.ts';
import '@/ai/flows/conversational-coach-flow.ts';
import '@/ai/flows/image-checkin-flow.ts';
import '@/ai/flows/text-to-speech-flow.ts';
import '@/ai/flows/suggest-event-details.ts';
import '@/ai/flows/suggest-goals-flow.ts';
