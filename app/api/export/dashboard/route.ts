// app/api/export/dashboard/route.ts
// Phase P9: Export CSV/JSON/Excel/PDF
// Phase P12: Support séparateurs localisés
// Phase P12.b: XLSX natif et PDF riche
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { extractContextFromHeaders } from '@lib-root/server/dashboard/context';
import { hydrateContext } from '@lib-root/server/dashboard/context_ext';
import { can } from '@/lib/server/security/policy';
import { DashboardReadService } from '@lib-root/server/dashboard/services/dashboardReadService';
import { InMemoryReadModelsRepo } from '@lib-root/server/dashboard/repositories/InMemoryReadModelsRepo';
import { SqlReadModelsRepo } from '@lib-root/server/dashboard/repositories/SqlReadModelsRepo';
import { resolveLocaleContext } from '@/lib/server/i18n';
import { formatAsXLSX } from '@lib-root/server/dashboard/export/xlsxFormatter';
import { formatAsPDF } from '@lib-root/server/dashboard/export/pdfFormatter';
import { auditExport } from '@lib-root/server/dashboard/export/auditExport';
import { rateLimitRedis } from '@/lib/server/observability/rateLimitRedis';
import { enforceQuota, recordDenial, recordUsage, getBackpressureSignal, decideBackpressure } from '@lib-root/server/finops';
import crypto from 'node:crypto';

// Phase P12.b: Limites de sécurité pour exports lourds
const MAX_EXPORT_ROWS = 100_000; // Limite de lignes
const MAX_EXPORT_SIZE_MB = 50; // Limite de taille (MB)
const EXPORT_TIMEOUT_MS = 60_000; // Timeout 60s
// Phase P16: Back-pressure — conservative = CSV only, plafond lignes réduit
const CONSERVATIVE_MAX_ROWS = 10_000;

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
  const t0 = performance.now();
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
  const userAgent = req.headers.get('user-agent') ?? undefined;
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

  // Phase P16: FinOps — contrôle de quotas avant export lourd
  const scopeExport = 'route:/api/export/dashboard';
  const quota = await enforceQuota({
    tenantId: baseCtx.tenantId,
    scope: scopeExport,
    isExport: true,
    estimatedRows: MAX_EXPORT_ROWS,
    estimatedBytes: MAX_EXPORT_SIZE_MB * 1024 * 1024,
  });
  if (!quota.allowed) {
    await recordDenial(baseCtx.tenantId, scopeExport, quota.reason!, { format }).catch(() => {});
    return NextResponse.json(
      { error: 'Quota exceeded', retryAfter: 60 },
      { status: 429, headers: { 'Retry-After': '60', 'X-RateLimit-Remaining': '0' } }
    );
  }

  // Phase P16: Back-pressure & dégradation contrôlée (signal /api/internal/health)
  const signal = await getBackpressureSignal();
  const bpMode = decideBackpressure({ replayLagSec: signal.replayLagSec });
  if (bpMode === 'severe') {
    await recordDenial(baseCtx.tenantId, scopeExport, 'backpressure', {
      mode: 'severe',
      replayLagSec: signal.replayLagSec,
    }).catch(() => {});
    return NextResponse.json(
      {
        error: 'Export unavailable',
        message: 'System under pressure. Please retry later.',
        retryAfter: 300,
      },
      { status: 503, headers: { 'Retry-After': '300' } }
    );
  }
  if (bpMode === 'conservative' && format !== 'csv') {
    await recordDenial(baseCtx.tenantId, scopeExport, 'backpressure', {
      mode: 'conservative',
      format,
      replayLagSec: signal.replayLagSec,
    }).catch(() => {});
    return NextResponse.json(
      {
        error: 'Degraded mode',
        message: 'CSV only. Please use format=csv.',
        retryAfter: 120,
      },
      { status: 503, headers: { 'Retry-After': '120' } }
    );
  }
  // conservative + csv: réduire max_rows_per_call (appliqué plus bas)
  const effectiveMaxRows = bpMode === 'conservative' ? Math.min(MAX_EXPORT_ROWS, 10_000) : MAX_EXPORT_ROWS;

  // Phase P12: Résoudre la locale pour les séparateurs CSV
  // Phase P12.b: Priorité query params (si fournis) > resolveLocaleContext
  const queryLocale = url.searchParams.get('locale');
  const queryCurrency = url.searchParams.get('currency');
  let localeBundle = await resolveLocaleContext(
    req.headers,
    baseCtx.tenantId,
    baseCtx.userId
  );
  
  // Override avec query params si fournis (pour XLSX/PDF avec formatage localisé explicite)
  if (queryLocale || queryCurrency) {
    localeBundle = {
      ...localeBundle,
      locale: queryLocale || localeBundle.locale,
      currency: queryCurrency || localeBundle.currency,
      // Direction recalculée depuis locale
      direction: (queryLocale || localeBundle.locale).startsWith('ar') ? 'rtl' : 'ltr',
    };
  }

  // Même service/DI que /api/dashboard (garantie d'alignement des données)
  const repo = process.env.DATABASE_URL ? new SqlReadModelsRepo() : new InMemoryReadModelsRepo();
  const svc = new DashboardReadService(repo as any);
  
  // Phase P12.b: Timeout pour exports lourds
  const dataPromise = svc.getData(main, sub ?? null, leaf ?? null, ctx);
  const timeoutPromise = new Promise((_, reject) => 
    setTimeout(() => reject(new Error('Export timeout')), EXPORT_TIMEOUT_MS)
  );
  
  const data = await Promise.race([dataPromise, timeoutPromise]) as any;
  
  // Phase P12.b: Vérifier la taille des données (avec limite effective selon back-pressure)
  const rows = inferRows(data);
  if (rows.length > effectiveMaxRows) {
    return NextResponse.json(
      { error: `Too many rows (max ${effectiveMaxRows})`, rows: rows.length },
      { status: 400 }
    );
  }

  const baseName = sanitizeFilename(filename ?? `${main}_${sub ?? 'all'}_${leaf ?? 'view'}`);
  const now = new Date().toISOString().replace(/[:T]/g, '-').slice(0, 19);
  const route = `${main}${sub ? `/${sub}` : ''}${leaf ? `/${leaf}` : ''}`;

  // Phase P12.b: Helper pour audit (appelé après chaque export)
  const logExport = async (sizeBytes: number, hash: string, success: boolean, errorMessage?: string) => {
    const durationMs = Math.round(performance.now() - t0);
    await auditExport({
      tenantId: baseCtx.tenantId,
      userId: baseCtx.userId || 'anonymous',
      route,
      format,
      filename: `${baseName}_${now}.${format === 'excel' ? 'xls' : format === 'xlsx' ? 'xlsx' : format}`,
      sizeBytes,
      rows: rows.length,
      hash,
      durationMs,
      ipAddress: ip,
      userAgent,
      success,
      errorMessage,
    }).catch((err) => {
      // Non-bloquant
      console.warn('[Export] Audit logging failed', err);
    });
  };

  // JSON
  if (format === 'json') {
    const buf = Buffer.from(JSON.stringify(data, null, 2));
    const hash = crypto.createHash('sha256').update(buf).digest('hex');
    
    // Audit
    await logExport(buf.length, hash, true);
    recordUsage({ tenantId: baseCtx.tenantId, scope: scopeExport, rows: rows.length, bytes: buf.length, exports: 1 }).catch(() => {});

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
    
    await logExport(buf.length, hash, true);
    recordUsage({ tenantId: baseCtx.tenantId, scope: scopeExport, rows: rows.length, bytes: buf.length, exports: 1 }).catch(() => {});

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
    
    await logExport(buf.length, hash, true);
    recordUsage({ tenantId: baseCtx.tenantId, scope: scopeExport, rows: rows.length, bytes: buf.length, exports: 1 }).catch(() => {});

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
        const errorMsg = `File too large (max ${MAX_EXPORT_SIZE_MB}MB)`;
        await logExport(buffer.length, '', false, errorMsg);
        return NextResponse.json(
          { error: errorMsg, sizeMB: sizeMB.toFixed(2) },
          { status: 400 }
        );
      }
      
      const hash = crypto.createHash('sha256').update(buffer).digest('hex');
      await logExport(buffer.length, hash, true);
      recordUsage({ tenantId: baseCtx.tenantId, scope: scopeExport, rows: rows.length, bytes: buffer.length, exports: 1 }).catch(() => {});

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
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error('[Export XLSX] Error:', error);
      await logExport(0, '', false, errorMsg);
      return NextResponse.json(
        { error: 'Failed to generate XLSX', details: errorMsg },
        { status: 500 }
      );
    }
  }

  // Phase P12.b: PDF riche (HTML→PDF via Chromium headless)
  if (format === 'pdf') {
    try {
      const buffer = await formatAsPDF(data, { main, sub, leaf }, {
        locale: localeBundle.locale,
        currency: localeBundle.currency,
        timezone: localeBundle.timezone,
        direction: localeBundle.direction,
        orientation: 'portrait', // Peut être paramétrable
      });
      
      // Phase P12.b: Vérifier la taille du fichier
      const sizeMB = buffer.length / (1024 * 1024);
      if (sizeMB > MAX_EXPORT_SIZE_MB) {
        const errorMsg = `File too large (max ${MAX_EXPORT_SIZE_MB}MB)`;
        await logExport(buffer.length, '', false, errorMsg);
        return NextResponse.json(
          { error: errorMsg, sizeMB: sizeMB.toFixed(2) },
          { status: 400 }
        );
      }
      
      const hash = crypto.createHash('sha256').update(buffer).digest('hex');
      await logExport(buffer.length, hash, true);
      recordUsage({ tenantId: baseCtx.tenantId, scope: scopeExport, rows: rows.length, bytes: buffer.length, exports: 1 }).catch(() => {});

      return new NextResponse(buffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${baseName}_${now}.pdf"`,
          'X-Content-Hash': `sha256:${hash}`,
          'X-Export-Rows': String(rows.length),
          'X-Export-Size-MB': sizeMB.toFixed(2),
          'X-PDF-Status': 'rendered',
        },
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error('[Export PDF] Error:', error);
      await logExport(0, '', false, errorMsg);
      
      // Fallback : retourner un PDF minimal en cas d'erreur
      const plain = JSON.stringify({ error: 'PDF generation failed', data }, null, 2);
      const buf = Buffer.from(plain, 'utf8');
      const hash = crypto.createHash('sha256').update(buf).digest('hex');
      return new NextResponse(buf, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${baseName}_${now}.pdf"`,
          'X-Content-Hash': `sha256:${hash}`,
          'X-PDF-Status': 'error-fallback',
        },
      });
    }
  }

  return NextResponse.json({ error: 'Unsupported format' }, { status: 400 });
}
