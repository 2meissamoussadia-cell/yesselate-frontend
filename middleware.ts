/**
 * Next.js Middleware
 * Phase P4: Observabilité & Robustesse
 * 
 * Injecte x-request-id pour corrélation des logs/traces
 * S'exécute avant toutes les routes (pages et API)
 */

import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';

export function middleware(req: Request) {
  const res = NextResponse.next();
  const reqId = req.headers.get('x-request-id') ?? randomUUID();
  res.headers.set('x-request-id', reqId);
  return res;
}
