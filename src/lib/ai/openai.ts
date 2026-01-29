/**
 * Client OpenAI — V5 Ultimate
 * GPT-4 pour briefing DG temps réel (NICE RÉNOVATION Cockpit DG).
 * Lazy init, clé via OPENAI_API_KEY.
 */

import OpenAI from 'openai';

let client: OpenAI | null = null;

function getApiKey(): string | undefined {
  return process.env.OPENAI_API_KEY;
}

/**
 * Client OpenAI singleton (lazy).
 * Retourne null si OPENAI_API_KEY absent.
 */
export function getOpenAIClient(): OpenAI | null {
  if (client != null) return client;
  const key = getApiKey();
  if (!key?.trim()) return null;
  client = new OpenAI({ apiKey: key });
  return client;
}

/**
 * Vérifie si l'IA est disponible (clé configurée).
 */
export function isAIAvailable(): boolean {
  return Boolean(getApiKey()?.trim());
}

export type { OpenAI };
