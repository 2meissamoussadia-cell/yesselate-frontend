/**
 * API Cockpit — Chantiers (Phase 5)
 * GET /api/cockpit/chantiers
 * Filtre par scope RBAC : DG/admin voit tout, autres rôles voient uniquement leurs chantiers.
 */

import { NextRequest, NextResponse } from 'next/server';
import { chantiers as allChantiers } from '@/modules/dashboard/data/chantiersMock';
import { extractContextFromHeaders } from '@lib-root/server/dashboard/context';
import { enrichContextWithRbac } from '@lib-root/server/dashboard/context';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const base = extractContextFromHeaders(req.headers);
    const ctx = await enrichContextWithRbac(base);

    const isDgOrAdmin =
      ctx.roles?.includes('dg') ||
      ctx.roles?.includes('admin') ||
      (ctx.roles?.length === 0 && base.userId === 'anonymous');

    let chantiers = allChantiers;

    if (!isDgOrAdmin && ctx.scopes?.length) {
      const allowedChantierCodes = ctx.scopes
        .filter((s) => s.startsWith('chantier:'))
        .map((s) => s.replace(/^chantier:/, ''));
      if (allowedChantierCodes.length > 0) {
        chantiers = allChantiers.filter(
          (c) =>
            allowedChantierCodes.includes(c.id) ||
            allowedChantierCodes.includes((c as { code?: string }).code ?? '')
        );
      } else {
        chantiers = [];
      }
    }

    return NextResponse.json({ ok: true, chantiers });
  } catch (error) {
    console.error('[cockpit/chantiers]', error);
    return NextResponse.json(
      { ok: false, error: 'Erreur serveur', chantiers: [] },
      { status: 500 }
    );
  }
}
