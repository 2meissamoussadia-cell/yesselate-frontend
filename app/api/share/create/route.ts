/**
 * POST /api/share/create
 * Crée un lien de partage sécurisé (7 jours par défaut).
 * Body: { role: 'client' | 'associe', chantierIds?: string[], scope?: string, expiryDays?: 7 }
 * Client : voit uniquement son/ses chantier(s). Associé : voit tout.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createShareToken } from '@lib-root/server/share/shareStore';

const DEFAULT_EXPIRY_DAYS = 7;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const role = body.role === 'associe' ? 'associe' : 'client';
    const chantierIds = Array.isArray(body.chantierIds) ? body.chantierIds : [];
    const scope = typeof body.scope === 'string' ? body.scope : undefined;
    const expiryDays = typeof body.expiryDays === 'number' ? Math.min(30, Math.max(1, body.expiryDays)) : DEFAULT_EXPIRY_DAYS;

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;
    const { token, expiresAt } = createShareToken({
      role,
      chantierIds: role === 'client' ? chantierIds : undefined,
      scope,
      expiryDays,
    });
    const url = `${baseUrl}/share/${token}`;

    return NextResponse.json({
      token,
      url,
      expiresAt: new Date(expiresAt).toISOString(),
      role,
      expiryDays,
    });
  } catch (e) {
    console.error('[share/create]', e);
    return NextResponse.json(
      { error: 'Failed to create share link', message: e instanceof Error ? e.message : 'Unknown' },
      { status: 500 }
    );
  }
}
