// app/api/dashboard/[main]/[sub]/[leaf]/route.ts
// Phase P11: Cache serveur - par défaut "no-store", override pour reporting
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { extractContextFromHeaders } from '@/lib/server/dashboard/context';
import { hydrateContext } from '@/lib/server/dashboard/context_ext';
import { can } from '@/lib/server/security/policy';
import { InMemoryReadModelsRepo } from '@/lib/server/dashboard/repositories/InMemoryReadModelsRepo';
import { SqlReadModelsRepo } from '@/lib/server/dashboard/repositories/SqlReadModelsRepo';
import { DashboardReadService } from '@/lib/server/dashboard/services/dashboardReadService';
import { observeHttp } from '@/app/api/internal/metrics/route';
import { withReq } from '@/lib/server/logging';
import { rateLimitRedis } from '@/lib/server/observability/rateLimitRedis';
import { recordTTFB } from '@/lib/server/dashboard/cache';
import { parsePaginationParams } from '@/lib/server/dashboard/types';
import { getBudgetForRoute, exceedsBudget } from '@/app/api/internal/metrics/budgets';
import { sloBudgetExceededCounter } from '@/lib/server/observability/metrics';

// Cache par défaut "no-store"; override pour reporting
export const revalidate = 0; // défaut

const Params = z.object({
  main: z.enum(['overview','performance','actions','risks','decisions','realtime']),
  sub: z.string().nullable().optional(),
  leaf: z.string().nullable().optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ main: string; sub?: string; leaf?: string }> }
) {
  const t0 = performance.now();
  const reqId = req.headers.get('x-request-id') ?? 'no-reqid';
  const log = withReq(reqId);

  // Phase P11: Rate limiting Redis - écrêter les bursts lourds sans impacter la navigation normale
  const ip = req.headers.get('x-forwarded-for') ?? '127.0.0.1';
  const rl = await rateLimitRedis(`dash:${ip}`, 240, 4); // 240 req, refill 4/s
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too Many Requests' }, { status: 429 });
  }

  try {
    // Dans Next.js 16+, les params sont des Promises
    const resolvedParams = await params;

    const parsed = Params.safeParse({
      main: resolvedParams.main,
      sub: resolvedParams.sub ?? null,
      leaf: resolvedParams.leaf ?? null,
    });

    if (!parsed.success) {
      const seconds = (performance.now() - t0) / 1000;
      observeHttp('GET', '/api/dashboard/[main]/[sub]/[leaf]', 400, seconds);
      log.info({ route: resolvedParams, seconds, error: 'Invalid route' }, 'dashboard api error');
      return NextResponse.json({ error: 'Invalid route' }, { status: 400 });
    }

    const baseCtx = extractContextFromHeaders(req.headers);
    // Phase P10: Hydrater le contexte avec RBAC depuis DB
    const ctx = await hydrateContext(baseCtx);

    // Phase P10: Contrôle générique de lecture du dashboard
    if (!can(ctx, { perm: 'dashboard:read' })) {
      const seconds = (performance.now() - t0) / 1000;
      observeHttp('GET', '/api/dashboard/[main]/[sub]/[leaf]', 403, seconds);
      log.info({ route: parsed.data, seconds, error: 'Forbidden: dashboard:read required' }, 'dashboard api forbidden');
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Phase P10: Contrôles module selon la route demandée
    const { main, sub } = parsed.data;
    if (main === 'performance' && sub === 'achats' && !can(ctx, { perm: 'achats:view', flag: 'module.achats' })) {
      const seconds = (performance.now() - t0) / 1000;
      observeHttp('GET', '/api/dashboard/[main]/[sub]/[leaf]', 403, seconds);
      log.info({ route: parsed.data, seconds, error: 'Forbidden: achats module' }, 'dashboard api forbidden');
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    if (main === 'performance' && sub === 'stocks' && !can(ctx, { perm: 'stocks:view', flag: 'module.stocks' })) {
      const seconds = (performance.now() - t0) / 1000;
      observeHttp('GET', '/api/dashboard/[main]/[sub]/[leaf]', 403, seconds);
      log.info({ route: parsed.data, seconds, error: 'Forbidden: stocks module' }, 'dashboard api forbidden');
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    if (main === 'performance' && sub === 'materiel' && !can(ctx, { perm: 'materiel:view', flag: 'module.materiel' })) {
      const seconds = (performance.now() - t0) / 1000;
      observeHttp('GET', '/api/dashboard/[main]/[sub]/[leaf]', 403, seconds);
      log.info({ route: parsed.data, seconds, error: 'Forbidden: materiel module' }, 'dashboard api forbidden');
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    if (main === 'performance' && sub === 'reporting' && !can(ctx, { perm: 'reporting:view', flag: 'module.reporting' })) {
      const seconds = (performance.now() - t0) / 1000;
      observeHttp('GET', '/api/dashboard/[main]/[sub]/[leaf]', 403, seconds);
      log.info({ route: parsed.data, seconds, error: 'Forbidden: reporting module' }, 'dashboard api forbidden');
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    if (main === 'performance' && sub === 'compliance' && !can(ctx, { perm: 'compliance:view', flag: 'module.compliance' })) {
      const seconds = (performance.now() - t0) / 1000;
      observeHttp('GET', '/api/dashboard/[main]/[sub]/[leaf]', 403, seconds);
      log.info({ route: parsed.data, seconds, error: 'Forbidden: compliance module' }, 'dashboard api forbidden');
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Phase P11: Parse des paramètres de pagination (optionnel)
    const url = new URL(req.url);
    const pagination = parsePaginationParams(url);
    
    // Choix du repo : SQL si DATABASE_URL est défini, sinon InMemory (fallback)
    const repo = process.env.DATABASE_URL ? new SqlReadModelsRepo() : new InMemoryReadModelsRepo();
    const svc = new DashboardReadService(repo);

    // Récupération des données (les vérifications module + flag sont déjà faites ci-dessus)
    // Phase P11: Passer les options de pagination si nécessaire
    const data = await svc.getData(
      parsed.data.main, 
      parsed.data.sub ?? null, 
      parsed.data.leaf ?? null, 
      ctx as any,
      { pagination }
    );

    // Phase P11: Calculer le TTFB (Time To First Byte)
    const ttfbSeconds = (performance.now() - t0) / 1000;
    const route = `/api/dashboard/${parsed.data.main}/${parsed.data.sub || ''}/${parsed.data.leaf || ''}`;
    
    // Phase P11: Déterminer si c'est une route reporting pour le cache
    const isReporting = parsed.data.main === 'performance' && parsed.data.sub === 'reporting';
    const cacheStrategy = isReporting ? 'reporting' : 'no-store';
    recordTTFB(route, 'GET', ttfbSeconds, cacheStrategy as any);
    
    // Phase P11: Headers de cache - par défaut "no-store", override pour reporting
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-TTFB-Ms': String(Math.round(ttfbSeconds * 1000)),
    };
    
    if (isReporting) {
      // Cache public pour reporting (30s max-age, 60s stale-while-revalidate)
      headers['Cache-Control'] = 'public, max-age=30, s-maxage=30, stale-while-revalidate=60';
    } else {
      // Par défaut: no-store (pas de cache)
      headers['Cache-Control'] = 'no-store';
    }
    
    const dur = (performance.now() - t0) / 1000;
    const durationMs = Math.round(dur * 1000);
    
    // Phase P11: Vérifier les budgets SLO et alerter si dépassé
    const budget = getBudgetForRoute(route);
    if (budget) {
      if (durationMs > budget.p95_ms) {
        // Alerte P95 dépassé
        sloBudgetExceededCounter.inc({ route, budget_type: 'p95' });
        log.warn(
          {
            route: parsed.data,
            durationMs,
            budgetP95: budget.p95_ms,
            exceeded: durationMs - budget.p95_ms,
          },
          '[SLO] P95 budget exceeded'
        );
      }
      if (durationMs > budget.p99_ms) {
        // Alerte P99 dépassé
        sloBudgetExceededCounter.inc({ route, budget_type: 'p99' });
        log.warn(
          {
            route: parsed.data,
            durationMs,
            budgetP99: budget.p99_ms,
            exceeded: durationMs - budget.p99_ms,
          },
          '[SLO] P99 budget exceeded'
        );
      }
    }
    
    // Phase P11: Observer la métrique HTTP (P4 étendu)
    observeHttp('GET', route, 200, dur);
    log.info(
      { 
        route: parsed.data, 
        seconds: dur, 
        durationMs,
        ttfbMs: Math.round(ttfbSeconds * 1000),
        cacheStrategy,
        isReporting,
        budgetP95: budget?.p95_ms,
        budgetP99: budget?.p99_ms,
      }, 
      'dashboard api served'
    );
    
    return new NextResponse(JSON.stringify(data), { status: 200, headers });
  } catch (error) {
    const seconds = (performance.now() - t0) / 1000;
    observeHttp('GET', '/api/dashboard/[main]/[sub]/[leaf]', 500, seconds);
    log.error(
      {
        err: error,
        route: (await params).main,
      },
      'dashboard api error'
    );

    return NextResponse.json(
      { error: 'Failed to fetch dashboard data', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
