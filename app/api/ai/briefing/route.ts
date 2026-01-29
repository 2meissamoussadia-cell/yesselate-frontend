/**
 * API IA Briefing DG — V5 Ultimate
 * GET /api/ai/briefing
 * Analyse les chantiers et génère un briefing 3 phrases (GPT-4) : status 🔴🟡🟢, top 3 risques, opportunités.
 * Rate limit 100 req/h, cache 5 min.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getOpenAIClient, getBriefingCache, setBriefingCache } from '@/lib/ai';
import { RateLimiter, RATE_LIMITS } from '@/lib/middleware/rateLimiter';
import { chantiers } from '@/modules/dashboard/data/chantiersMock';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  const realIp = req.headers.get('x-real-ip');
  if (realIp) return realIp;
  return 'unknown';
}

function buildChantiersSummary(): string {
  const lines = chantiers.map(
    (c) =>
      `- ${c.id} | ${c.segment} | ${c.prestation} | phase ${c.phase} | CA ${(c.ca / 1e6).toFixed(2)}M | marge ${(c.marge * 100).toFixed(0)}% | santé ${(c.sante * 100).toFixed(0)}% | BC ${c.bureauControle} | photos ${c.photosGps}${c.photosManquantes != null ? ` (manquantes ${c.photosManquantes})` : ''}`
  );
  return lines.join('\n');
}

const SYSTEM_PROMPT = `Tu es un assistant DG pour NICE RÉNOVATION (BTP, Sénégal). Tu analyses les chantiers et produis un briefing exécutif en français.
Réponds UNIQUEMENT avec un JSON valide, sans markdown ni texte autour, de la forme :
{"status":"red"|"yellow"|"green","briefing":"Exactement 3 phrases concises.","topRisks":["risque 1","risque 2","risque 3"],"opportunities":["opportunité 1","opportunité 2","opportunité 3"]}
- status : "green" si globalement sain (marges OK, santé > 0.7, peu de photos manquantes), "yellow" si vigilance, "red" si problèmes majeurs.
- briefing : 3 phrases max, synthèse pour le DG.
- topRisks : 3 risques concrets (retards, budget, qualité, BC, stock).
- opportunities : 3 opportunités (chantiers à booster, synergies, gains).`;

export async function GET(req: NextRequest) {
  const ip = getClientIp(req);
  const key = `ai-briefing:${ip}`;
  const limiter = RateLimiter.getInstance();
  const { allowed, info } = await limiter.check(key, RATE_LIMITS.AI_BRIEFING);

  if (!allowed) {
    return NextResponse.json(
      {
        error: RATE_LIMITS.AI_BRIEFING.message,
        retryAfter: info.retryAfter,
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': String(info.limit),
          'X-RateLimit-Remaining': String(info.remaining),
          'Retry-After': String(info.retryAfter ?? 3600),
        },
      }
    );
  }

  const cached = getBriefingCache();
  if (cached) {
    return NextResponse.json({
      status: cached.status,
      briefing: cached.briefing,
      topRisks: cached.topRisks,
      opportunities: cached.opportunities,
      fromCache: true,
    });
  }

  const openai = getOpenAIClient();
  if (!openai) {
    return NextResponse.json(
      {
        error: 'IA non configurée',
        hint: 'Définir OPENAI_API_KEY pour activer le briefing GPT-4.',
      },
      { status: 503 }
    );
  }

  const summary = buildChantiersSummary();
  const userPrompt = `Voici les ${chantiers.length} chantiers actuels :\n\n${summary}\n\nGénère le briefing DG (JSON uniquement).`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 600,
    });

    const raw = completion.choices[0]?.message?.content?.trim();
    if (!raw) {
      return NextResponse.json(
        { error: 'Réponse GPT vide' },
        { status: 502 }
      );
    }

    const parsed = JSON.parse(raw) as {
      status?: 'red' | 'yellow' | 'green';
      briefing?: string;
      topRisks?: string[];
      opportunities?: string[];
    };

    const status = parsed.status ?? 'yellow';
    const briefing = parsed.briefing ?? 'Briefing non disponible.';
    const topRisks = Array.isArray(parsed.topRisks) ? parsed.topRisks.slice(0, 3) : [];
    const opportunities = Array.isArray(parsed.opportunities) ? parsed.opportunities.slice(0, 3) : [];

    setBriefingCache({
      status,
      briefing,
      topRisks,
      opportunities,
    });

    return NextResponse.json({
      status,
      briefing,
      topRisks,
      opportunities,
      fromCache: false,
    });
  } catch (err) {
    console.error('[api/ai/briefing]', err);
    return NextResponse.json(
      {
        error: 'Erreur lors de la génération du briefing',
        detail: err instanceof Error ? err.message : String(err),
      },
      { status: 502 }
    );
  }
}
