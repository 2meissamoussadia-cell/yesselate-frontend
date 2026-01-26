// app/api/dashboard/[main]/[sub]/[leaf]/route.ts
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
import { rateLimit } from '@/lib/server/observability/rateLimit';

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

  // Rate limiting
  const ip = req.headers.get('x-forwarded-for') ?? '127.0.0.1';
  const rl = rateLimit(`dash:${ip}`, 120, 2); // 120 req, refill 2/s
  if (!rl.allowed) return NextResponse.json({ error: 'Too Many Requests' }, { status: 429 });

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

    // Choix du repo : SQL si DATABASE_URL est défini, sinon InMemory (fallback)
    const repo = process.env.DATABASE_URL ? new SqlReadModelsRepo() : new InMemoryReadModelsRepo();
    const svc = new DashboardReadService(repo);

    // Récupération des données (les vérifications module + flag sont déjà faites ci-dessus)
    const data = await svc.getData(parsed.data.main, parsed.data.sub ?? null, parsed.data.leaf ?? null, ctx as any);

    const res = NextResponse.json(data, { status: 200 });
    const seconds = (performance.now() - t0) / 1000;
    observeHttp('GET', '/api/dashboard/[main]/[sub]/[leaf]', 200, seconds);
    log.info({ route: parsed.data, seconds }, 'dashboard api served');
    return res;
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
