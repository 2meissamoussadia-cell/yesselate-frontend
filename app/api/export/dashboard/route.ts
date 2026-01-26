// app/api/export/dashboard/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { extractContextFromHeaders } from '@/lib/server/dashboard/context';
import { hydrateContext } from '@/lib/server/dashboard/context_ext';
import { can } from '@/lib/server/security/policy';
import { DashboardReadService } from '@/lib/server/dashboard/services/dashboardReadService';
import { InMemoryReadModelsRepo } from '@/lib/server/dashboard/repositories/InMemoryReadModelsRepo';
import { SqlReadModelsRepo } from '@/lib/server/dashboard/repositories/SqlReadModelsRepo';
import crypto from 'node:crypto';

const Query = z.object({
  main: z.enum(['overview','performance','actions','risks','decisions','realtime']),
  sub: z.string().optional().nullable(),
  leaf: z.string().optional().nullable(),
  format: z.enum(['csv','json','excel','pdf']).default('csv'),
  filename: z.string().optional()
});

function sanitizeFilename(name: string) {
  return name.replace(/[^a-zA-Z0-9_\-\.]+/g, '_').slice(0, 120);
}
function safeCell(v: unknown): string {
  let s = v == null ? '' : String(v);
  if (/^[=\-+@]/.test(s)) s = `'${s}`;       // anti CSV injection
  s = s.replace(/"/g, '""');                 // escape quotes
  return `"${s}"`;
}
function inferRows(data: any): any[] {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.rows)) return data.rows;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.projets)) return data.projets;
  if (Array.isArray(data?.demandes)) return data.demandes;
  if (Array.isArray(data?.monthly)) return data.monthly;
  if (Array.isArray(data?.trends)) return data.trends;
  if (Array.isArray(data?.tableData)) return data.tableData;
  return [data];
}
function toCsv(rows: any[]): string {
  if (!rows.length) return '';
  const cols = Array.from(rows.reduce<Set<string>>((acc, r) => { Object.keys(r ?? {}).forEach(k => acc.add(k)); return acc; }, new Set()));
  const header = cols.map(c => safeCell(c)).join(',');
  const body = rows.map(r => cols.map(c => safeCell((r ?? {})[c])).join(',')).join('\n');
  return [header, body].join('\n');
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const parsed = Query.safeParse({
    main: url.searchParams.get('main') ?? undefined,
    sub: url.searchParams.get('sub'),
    leaf: url.searchParams.get('leaf'),
    format: url.searchParams.get('format') ?? undefined,
    filename: url.searchParams.get('filename') ?? undefined,
  });
  if (!parsed.success) return NextResponse.json({ error: 'BadRequest', details: parsed.error.flatten() }, { status: 400 });

  const { main, sub, leaf, format, filename } = parsed.data;

  // Phase P10: Hydrater le contexte avec RBAC depuis DB
  const baseCtx = extractContextFromHeaders(req.headers);
  const ctx = await hydrateContext(baseCtx);

  // Phase P10: Contrôle générique de lecture du dashboard
  if (!can(ctx, { perm: 'dashboard:read' })) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Phase P10: Vérifier permission export spécifique
  if (!can(ctx, { perm: 'export:read' })) {
    return NextResponse.json({ error: 'Forbidden: export non autorisé' }, { status: 403 });
  }

  // Même service/DI que /api/dashboard (garantie d'alignement des données)
  const repo = process.env.DATABASE_URL ? new SqlReadModelsRepo() : new InMemoryReadModelsRepo();
  const svc = new DashboardReadService(repo as any);
  const data = await svc.getData(main, sub ?? null, leaf ?? null, ctx);

  const baseName = sanitizeFilename(filename ?? `${main}_${sub ?? 'all'}_${leaf ?? 'view'}`);
  const now = new Date().toISOString().replace(/[:T]/g, '-').slice(0, 19);

  // JSON
  if (format === 'json') {
    const buf = Buffer.from(JSON.stringify(data, null, 2));
    const hash = crypto.createHash('sha256').update(buf).digest('hex');
    return new NextResponse(buf, {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': `attachment; filename="${baseName}_${now}.json"`,
        'X-Content-Hash': `sha256:${hash}`,
      },
    });
  }

  // CSV (stream "simulé" via Buffer ; peut être rendu réellement stream si besoin)
  if (format === 'csv') {
    const csv = toCsv(inferRows(data));
    const buf = Buffer.from(csv, 'utf8');
    const hash = crypto.createHash('sha256').update(buf).digest('hex');
    return new NextResponse(buf, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${baseName}_${now}.csv"`,
        'X-Content-Hash': `sha256:${hash}`,
      },
    });
  }

  // Excel léger (CSV avec mime Excel pour compat) ; passer à 'exceljs' si besoin xlsx stylé
  if (format === 'excel') {
    const csv = toCsv(inferRows(data));
    const buf = Buffer.from(csv, 'utf8');
    const hash = crypto.createHash('sha256').update(buf).digest('hex');
    return new NextResponse(buf, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.ms-excel; charset=utf-8',
        'Content-Disposition': `attachment; filename="${baseName}_${now}.xls"`,
        'X-Content-Hash': `sha256:${hash}`,
      },
    });
  }

  // PDF placeholder (pour un PDF riche: HTML->PDF via Chromium headless / pdf-lib)
  if (format === 'pdf') {
    const plain = JSON.stringify(data, null, 2);
    const buf = Buffer.from(plain, 'utf8');
    const hash = crypto.createHash('sha256').update(buf).digest('hex');
    return new NextResponse(buf, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${baseName}_${now}.pdf"`,
        'X-Content-Hash': `sha256:${hash}`,
      },
    });
  }

  return NextResponse.json({ error: 'Unsupported format' }, { status: 400 });
}
