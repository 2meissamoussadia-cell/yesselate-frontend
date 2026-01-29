/**
 * Cache in-memory pour le briefing IA — TTL 5 min (compat Redis plus tard).
 * V5 Ultimate — évite d'appeler GPT-4 à chaque refresh 60s du dashboard.
 */

export interface BriefingCacheEntry {
  status: 'red' | 'yellow' | 'green';
  briefing: string;
  topRisks: string[];
  opportunities: string[];
  fetchedAt: number;
}

const TTL_MS = 5 * 60 * 1000; // 5 min

let cache: BriefingCacheEntry | null = null;

export function getBriefingCache(): BriefingCacheEntry | null {
  if (!cache) return null;
  if (Date.now() - cache.fetchedAt > TTL_MS) {
    cache = null;
    return null;
  }
  return cache;
}

export function setBriefingCache(entry: Omit<BriefingCacheEntry, 'fetchedAt'>): void {
  cache = {
    ...entry,
    fetchedAt: Date.now(),
  };
}

export function clearBriefingCache(): void {
  cache = null;
}
