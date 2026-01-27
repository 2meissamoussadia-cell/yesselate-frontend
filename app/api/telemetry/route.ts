// app/api/telemetry/route.ts
// Phase P14: Observabilité produit - Endpoint pour recevoir les événements de télémetrie

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { TelemetryBatch } from '@/lib/telemetry/schema';
import { extractContextFromHeaders } from '@/lib/server/dashboard/context';
import { pgPool } from '@/lib/server/db/pool';
import { rateLimitRedis } from '@/lib/server/observability/rateLimitRedis';
import crypto from 'node:crypto';

/**
 * POST /api/telemetry
 * 
 * Reçoit un batch d'événements de télémetrie et les enregistre en DB
 * Phase P14: Observabilité produit
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // Phase P14: Rate limiting pour éviter les abus
    const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'unknown';
    const rl = await rateLimitRedis(`telemetry:${ip}`, 1000, 10); // 1000 req, refill 10/s
    
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Too Many Requests', ok: false },
        { status: 429 }
      );
    }

    // Extraire le contexte (tenant, user)
    const baseCtx = extractContextFromHeaders(req.headers);
    
    // Parser le body
    const body = await req.json();
    const parsed = TelemetryBatch.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid telemetry batch', details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    
    const { items } = parsed.data;
    
    // Extraire IP et User-Agent pour pseudonymisation
    const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'unknown';
    const userAgent = req.headers.get('user-agent') ?? null;
    
    // Hash IP pour pseudonymisation (optionnel, selon RGPD)
    const ipHash = process.env.TELEMETRY_SALT
      ? crypto.createHash('sha256').update(`${ip}:${process.env.TELEMETRY_SALT}`).digest('hex')
      : null;
    
    // Insérer les événements en batch
    const client = await pgPool.connect();
    try {
      // Insertion batch pour performance
      const values = items.map((item, idx) => {
        const base = idx * 7;
        return `($${base + 1}::uuid, $${base + 2}::text, $${base + 3}::timestamptz, $${base + 4}::text, $${base + 5}::text, $${base + 6}::jsonb, $${base + 7}::text, $${base + 8}::text)`;
      }).join(', ');
      
      const params: any[] = [];
      items.forEach((item) => {
        params.push(
          baseCtx.tenantId,
          baseCtx.userId || null,
          new Date(item.at),
          item.event,
          item.routeKey || null,
          item.props || null,
          userAgent,
          ipHash
        );
      });
      
      await client.query(
        `INSERT INTO telemetry_events 
         (tenant_id, user_id, occurred_at, event_name, route_key, props, user_agent, ip_hash)
         VALUES ${values}`,
        params
      );
      
      return NextResponse.json({ ok: true, count: items.length }, { status: 200 });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('[Telemetry] Error processing batch:', error);
    // Best effort : ne pas faire échouer la requête
    return NextResponse.json(
      { error: 'Failed to process telemetry', ok: false },
      { status: 500 }
    );
  }
}
