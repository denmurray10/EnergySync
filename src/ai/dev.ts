import { config } from 'dotenv';
config();

import '@/ai/flows/personalized-recharge-recommendations.ts';
import '@/ai/flows/suggest-activity-details.ts';
import '@/ai/flows/suggest-recharge-details.ts';
import '@/ai/flows/proactive-suggestion-flow.ts';
import '@/ai/flows/analyze-checkin-flow.ts';
