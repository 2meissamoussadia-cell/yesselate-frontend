// app/api/rbac/permissions/route.ts
// Phase P10: API pour charger les permissions utilisateur côté frontend

import { NextRequest, NextResponse } from 'next/server';
import { extractContextFromHeaders, enrichContextWithRbac } from '@lib-root/server/dashboard/context';
import { hydrateContext } from '@lib-root/server/dashboard/context_ext';

export async function GET(req: NextRequest) {
  try {
    const ctxBase = extractContextFromHeaders(req.headers);
    const ctx = await enrichContextWithRbac(ctxBase);

    // Extraire les scopes depuis le contexte
    const bureaux: string[] = [];
    const chantiers: string[] = [];
    for (const s of ctx.scopes) {
      const [k, v] = s.split(':');
      if (k === 'bureau') bureaux.push(v);
      if (k === 'chantier') chantiers.push(v);
    }

    return NextResponse.json({
      roles: ctx.roles,
      permissions: ctx.perms ?? ctx.permissions ?? [],
      scopes: { bureaux, chantiers },
      featureFlags: ctx.flags ?? ctx.featureFlags ?? {},
    });
  } catch (error) {
    console.error('[RBAC] Failed to load permissions', error);
    // Fallback : retourner un objet vide (l'utilisateur n'aura pas d'accès)
    return NextResponse.json({
      roles: [],
      permissions: [],
      scopes: { bureaux: [], chantiers: [] },
      featureFlags: {},
    });
  }
}
