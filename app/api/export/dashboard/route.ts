// app/api/export/dashboard/route.ts
// Phase P9: Export CSV/JSON/Excel/PDF
// Phase P12: Support séparateurs localisés
// Phase P12.b: XLSX natif et PDF riche
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { extractContextFromHeaders } from '@/lib/server/dashboard/context';
import { hydrateContext } from '@/lib/server/dashboard/context_ext';
import { can } from '@/lib/server/security/policy';
import { DashboardReadService } from '@/lib/server/dashboard/services/dashboardReadService';
import { InMemoryReadModelsRepo } from '@/lib/server/dashboard/repositories/InMemoryReadModelsRepo';
import { SqlReadModelsRepo } from '@/lib/server/dashboard/repositories/SqlReadModelsRepo';
import { resolveLocaleContext } from '@/lib/server/i18n';
import { formatAsXLSX } from '@/lib/server/dashboard/export/xlsxFormatter';
import { rateLimitRedis } from '@/lib/server/observability/rateLimitRedis';
import crypto from 'node:crypto';

// Phase P12.b: Limites de sécurité pour exports lourds
const MAX_EXPORT_ROWS = 100_000; // Limite de lignes
const MAX_EXPORT_SIZE_MB = 50; // Limite de taille (MB)
const EXPORT_TIMEOUT_MS = 60_000; // Timeout 60s

const Query = z.object({
  main: z.enum(['overview','performance','actions','risks','decisions','realtime']),
  sub: z.string().optional().nullable(),
  leaf: z.string().optional().nullable(),
  format: z.enum(['csv','json','excel','xlsx','pdf']).default('csv'), // Phase P12.b: 'xlsx' pour natif
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
/**
 * Détermine le séparateur CSV selon la locale
 * Phase P12: Support séparateurs localisés
 */
function getCsvSeparator(locale: string): string {
  // Français utilise le point-virgule
  if (locale.startsWith('fr')) {
    return ';';
  }
  // Autres locales utilisent la virgule
  return ',';
}

function toCsv(rows: any[], separator: string = ','): string {
  if (!rows.length) return '';
  const cols = Array.from(rows.reduce<Set<string>>((acc, r) => { Object.keys(r ?? {}).forEach(k => acc.add(k)); return acc; }, new Set()));
  const header = cols.map(c => safeCell(c)).join(separator);
  const body = rows.map(r => cols.map(c => safeCell((r ?? {})[c])).join(separator)).join('\n');
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

  // Phase P12.b: Rate limiting pour exports (plus restrictif que dashboard read)
  const ip = req.headers.get('x-forwarded-for') ?? '127.0.0.1';
  const rl = await rateLimitRedis(`export:${ip}`, 20, 1); // 20 exports, refill 1/s
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Too Many Requests', retryAfter: 60 },
      { status: 429, headers: { 'Retry-After': '60', 'X-RateLimit-Remaining': String(rl.remaining) } }
    );
  }

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

  // Phase P12: Résoudre la locale pour les séparateurs CSV
  const localeBundle = await resolveLocaleContext(
    req.headers,
    baseCtx.tenantId,
    baseCtx.userId
  );

  // Même service/DI que /api/dashboard (garantie d'alignement des données)
  const repo = process.env.DATABASE_URL ? new SqlReadModelsRepo() : new InMemoryReadModelsRepo();
  const svc = new DashboardReadService(repo as any);
  
  // Phase P12.b: Timeout pour exports lourds
  const dataPromise = svc.getData(main, sub ?? null, leaf ?? null, ctx);
  const timeoutPromise = new Promise((_, reject) => 
    setTimeout(() => reject(new Error('Export timeout')), EXPORT_TIMEOUT_MS)
  );
  
  const data = await Promise.race([dataPromise, timeoutPromise]) as any;
  
  // Phase P12.b: Vérifier la taille des données
  const rows = inferRows(data);
  if (rows.length > MAX_EXPORT_ROWS) {
    return NextResponse.json(
      { error: `Too many rows (max ${MAX_EXPORT_ROWS})`, rows: rows.length },
      { status: 400 }
    );
  }

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
  // Phase P12: Séparateur localisé (; pour fr-FR, , pour en-GB)
  if (format === 'csv') {
    const separator = getCsvSeparator(localeBundle.locale);
    const csv = toCsv(inferRows(data), separator);
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

  // Excel léger (CSV avec mime Excel pour compat) - Phase P12: Séparateur localisé
  // Phase P12.b: 'excel' reste pour compatibilité (CSV), 'xlsx' pour natif
  if (format === 'excel') {
    const separator = getCsvSeparator(localeBundle.locale);
    const csv = toCsv(inferRows(data), separator);
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

  // Phase P12.b: XLSX natif avec formatage localisé (exceljs)
  if (format === 'xlsx') {
    try {
      const buffer = await formatAsXLSX(data, {
        locale: localeBundle.locale,
        currency: localeBundle.currency,
        timezone: localeBundle.timezone,
        direction: localeBundle.direction,
      }, 'Export');
      
      // Phase P12.b: Vérifier la taille du fichier
      const sizeMB = buffer.length / (1024 * 1024);
      if (sizeMB > MAX_EXPORT_SIZE_MB) {
        return NextResponse.json(
          { error: `File too large (max ${MAX_EXPORT_SIZE_MB}MB)`, sizeMB: sizeMB.toFixed(2) },
          { status: 400 }
        );
      }
      
      // Hash (scellement)
      const hash = crypto.createHash('sha256').update(buffer).digest('hex');
      
      return new NextResponse(buffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="${baseName}_${now}.xlsx"`,
          'X-Content-Hash': `sha256:${hash}`,
          'X-Export-Rows': String(rows.length),
          'X-Export-Size-MB': sizeMB.toFixed(2),
        },
      });
    } catch (error) {
      console.error('[Export XLSX] Error:', error);
      return NextResponse.json(
        { error: 'Failed to generate XLSX', details: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      );
    }
  }

  // Phase P12.b: PDF riche (HTML→PDF via Chromium headless)
  // TODO: Implémenter avec puppeteer/playwright pour PDF stylé avec RTL/CJK
  // Pour l'instant, placeholder JSON (sera remplacé par HTML→PDF)
  if (format === 'pdf') {
    // Phase P12.b: Placeholder - sera remplacé par formatAsPDF() avec template HTML
    // Voir lib/server/dashboard/export/pdfFormatter.ts pour notes d'implémentation
    const plain = JSON.stringify(data, null, 2);
    const buf = Buffer.from(plain, 'utf8');
    const hash = crypto.createHash('sha256').update(buf).digest('hex');
    return new NextResponse(buf, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${baseName}_${now}.pdf"`,
        'X-Content-Hash': `sha256:${hash}`,
        'X-PDF-Status': 'placeholder', // Indique que c'est un placeholder
      },
    });
  }

  return NextResponse.json({ error: 'Unsupported format' }, { status: 400 });
}
