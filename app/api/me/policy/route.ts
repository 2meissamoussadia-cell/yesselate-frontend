// app/api/me/policy/route.ts
// Phase P10: Endpoint léger pour exposer perms[] et flags{} au front
// Cache court (60s) pour réduire la charge DB

import { NextRequest, NextResponse } from 'next/server';
import { extractContextFromHeaders } from '@/lib/server/dashboard/context';
import { hydrateContext } from '@/lib/server/dashboard/context_ext';

export async function GET(req: NextRequest) {
  try {
    const base = extractContextFromHeaders(req.headers);
    const ctx = await hydrateContext(base);
    
    return NextResponse.json(
      { 
        perms: ctx.perms || [], 
        flags: ctx.flags || {} 
      },
      { 
        status: 200,
        headers: { 
          'Cache-Control': 'private, max-age=60',
          'Content-Type': 'application/json',
        } 
      }
    );
  } catch (error) {
    console.error('[Policy API] Failed to load policy', error);
    // Fallback : retourner des permissions vides en cas d'erreur
    return NextResponse.json(
      { perms: [], flags: {} },
      { 
        status: 200,
        headers: { 
          'Cache-Control': 'private, max-age=60',
          'Content-Type': 'application/json',
        } 
      }
    );
  }
}
