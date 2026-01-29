/**
 * V5 Ultimate — Commandes vocales multilingues (FR / EN / Wolof)
 * Patterns + fuzzy match (Levenshtein) pour intent detection côté client.
 */

import type { ExecutiveCommandV5 } from './executiveCommandsV5';
import { EXECUTIVE_COMMANDS_V5 } from './executiveCommandsV5';

/** Phrases reconnues → id de la commande (FR / EN / Wolof) */
const VOICE_PATTERNS: Array<{ patterns: string[]; commandId: string }> = [
  { patterns: ['urgence', 'emergency', 'urgent', 'woyofal', 'dogg', 'xale', 'now'], commandId: 'emergency' },
  { patterns: ['orange money', 'orange', 'payer orange', 'pay orange', 'pay now', 'send money'], commandId: 'pay-orange' },
  { patterns: ['wave', 'payer wave', 'pay wave', 'weyv', 'weev'], commandId: 'pay-wave' },
  { patterns: ['huissier', 'certification', 'ucie', 'certif', 'certificate', 'official'], commandId: 'huissier' },
  { patterns: ['contrat', 'contract', 'générer contrat', 'generate contract'], commandId: 'contract' },
  { patterns: ['appel', 'call', 'call team', 'équipe', 'team', 'woyofal', 'telephone', 'phone', 'ring'], commandId: 'call' },
  { patterns: ['broadcast', 'annonce', 'diffuser', 'announce', 'send to all'], commandId: 'broadcast' },
  { patterns: ['boost', 'prioriser', 'priorité', 'ressources', 'priority', 'prioritize'], commandId: 'boost' },
  { patterns: ['relance', 'relancer', 'fournisseur', 'client', 'reminder', 'follow up'], commandId: 'relance' },
  { patterns: ['forecast', 'prédiction', 'prévision', 'ia', 'forecast ia', 'prediction'], commandId: 'forecast' },
  { patterns: ['rapport', 'report', 'export', 'pdf', 'rapport dg', 'dg report'], commandId: 'report' },
  { patterns: ['archiver', 'archive', 'fermer dossier', 'close file', 'archive it'], commandId: 'archive' },
  { patterns: ['phase 4', 'phase4', 'phase 5', 'filtre phase'], commandId: 'forecast' },
];

/** Similarité Levenshtein entre deux chaînes (0–1) */
export function levenshteinSimilarity(a: string, b: string): number {
  const la = a.length;
  const lb = b.length;
  if (la === 0 || lb === 0) return 0;
  const matrix: number[][] = [];
  for (let i = 0; i <= lb; i++) matrix[i] = [i];
  for (let j = 0; j <= la; j++) matrix[0][j] = j;
  for (let i = 1; i <= lb; i++) {
    for (let j = 1; j <= la; j++) {
      const cost = b[i - 1] === a[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j - 1] + cost,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j] + 1
      );
    }
  }
  const distance = matrix[lb][la];
  const maxLen = Math.max(la, lb);
  return 1 - distance / maxLen;
}

const FUZZY_THRESHOLD = 0.55;

/** Détecte la commande à partir du transcript vocal (exact + fuzzy) */
export function detectVoiceCommand(transcript: string): { command: ExecutiveCommandV5; confidence: number } | null {
  const lower = transcript.toLowerCase().trim();
  if (!lower) return null;

  // 1. Match exact par pattern
  for (const { patterns, commandId } of VOICE_PATTERNS) {
    for (const p of patterns) {
      if (lower.includes(p)) {
        const cmd = EXECUTIVE_COMMANDS_V5.find((c) => c.id === commandId);
        if (cmd) return { command: cmd, confidence: 1 };
      }
    }
  }

  // 2. Fuzzy match sur les labels / ids
  let best: { command: ExecutiveCommandV5; similarity: number } | null = null;
  for (const cmd of EXECUTIVE_COMMANDS_V5) {
    const simLabel = levenshteinSimilarity(lower, cmd.label.toLowerCase().replace(/[^\w\s]/g, ''));
    const simId = levenshteinSimilarity(lower, cmd.id.replace(/-/g, ' '));
    const sim = Math.max(simLabel, simId);
    if (sim >= FUZZY_THRESHOLD && (!best || sim > best.similarity)) {
      best = { command: cmd, similarity: sim };
    }
  }
  if (best) return { command: best.command, confidence: best.similarity };

  return null;
}

/** Suggestions de commandes pour affichage (FR / EN / Wolof) */
export function getVoiceSuggestions(): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const { patterns } of VOICE_PATTERNS) {
    for (const p of patterns) {
      if (!seen.has(p) && out.length < 10) {
        seen.add(p);
        out.push(p);
      }
    }
  }
  return out.slice(0, 8);
}

/** Langues supportées pour la reconnaissance vocale (Web Speech API) */
export type VoiceLang = 'fr' | 'en' | 'wo';

export const VOICE_LANG_CODES: Record<VoiceLang, string> = {
  fr: 'fr-FR',
  en: 'en-US',
  wo: 'fr-FR', // Wolof: patterns via fr-FR (wo-SN peu supporté)
};

/** Exemples par langue pour l’UI (Wolof = reconnu via patterns en fr-FR) */
export const VOICE_EXAMPLES: Record<VoiceLang, string[]> = {
  fr: ['urgence', 'payer orange', 'call team', 'huissier', 'rapport dg'],
  en: ['emergency', 'pay orange', 'call team', 'certificate', 'dg report'],
  wo: ['woyofal', 'dogg', 'xale', 'urgence', 'payer orange'],
};
