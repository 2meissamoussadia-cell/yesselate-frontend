/**
 * Module IA — V5 Ultimate
 * OpenAI client, cache briefing, hook client.
 */

export { getOpenAIClient, isAIAvailable } from './openai';
export type { OpenAI } from './openai';

export {
  getBriefingCache,
  setBriefingCache,
  clearBriefingCache,
} from './briefing-cache';
export type { BriefingCacheEntry } from './briefing-cache';

export { useAIBriefing } from './useAIBriefing';
export type { AIBriefingResponse, BriefingStatus } from './useAIBriefing';
