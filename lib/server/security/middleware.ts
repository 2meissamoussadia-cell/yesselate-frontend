// lib/server/security/middleware.ts
// Phase P18: Middleware helper pour sécurité (CSRF, audit, etc.)

import { NextRequest, NextResponse } from 'next/server';
import { requireCsrfToken } from './csrf';
import { pgPool } from '../db/pool';
import { extractContextFromHeaders } from '../dashboard/context';

/**
 * Middleware wrapper pour protéger les endpoints mutation avec CSRF
 * 
 * Usage:
 * ```ts
 * export async function POST(req: NextRequest) {
 *   const csrfCheck = await withCsrfProtection(req);
 *   if (!csrfCheck.valid) {
 *     return NextResponse.json({ error: csrfCheck.error }, { status: 403 });
 *   }
 *   // ... reste du handler
 * }
 * ```
 */
export async function withCsrfProtection(req: NextRequest): Promise<{
  valid: boolean;
  error?: string;
}> {
  return requireCsrfToken(req);
}

/**
 * Log un événement de sécurité dans security_audit_log
 */
export async function logSecurityEvent(
  eventType: string,
  severity: 'low' | 'medium' | 'high' | 'critical',
  req: NextRequest,
  ctx?: { tenantId?: string; userId?: string },
  details?: Record<string, any>
): Promise<void> {
  const client = await pgPool.connect();
  try {
    const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? null;
    const userAgent = req.headers.get('user-agent') ?? null;
    const path = req.nextUrl.pathname;
    const method = req.method;

    await client.query(
      `INSERT INTO security_audit_log (
        tenant_id, user_id, event_type, severity, ip_address, user_agent,
        request_path, request_method, details
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        ctx?.tenantId || null,
        ctx?.userId || null,
        eventType,
        severity,
        ip,
        userAgent,
        path,
        method,
        details ? JSON.stringify(details) : null,
      ]
    );
  } catch (error) {
    // Ne pas faire échouer la requête si le log échoue
    console.error('Failed to log security event:', error);
  } finally {
    client.release();
  }
}

/**
 * Wrapper complet pour endpoints mutation avec CSRF + audit
 */
export async function secureMutationHandler(
  req: NextRequest,
  handler: (req: NextRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  // Vérifier CSRF
  const csrfCheck = await withCsrfProtection(req);
  if (!csrfCheck.valid) {
    const baseCtx = extractContextFromHeaders(req.headers);
    await logSecurityEvent('csrf_reject', 'high', req, baseCtx, {
      reason: csrfCheck.error,
    });
    
    return NextResponse.json(
      { error: csrfCheck.error || 'Invalid CSRF token' },
      { status: 403 }
    );
  }

  // Exécuter le handler
  try {
    return await handler(req);
  } catch (error) {
    const baseCtx = extractContextFromHeaders(req.headers);
    await logSecurityEvent('handler_error', 'medium', req, baseCtx, {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}
