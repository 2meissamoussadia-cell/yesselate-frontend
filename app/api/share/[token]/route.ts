/**
 * GET /api/share/[token]
 * Récupère les données partagées selon le rôle.
 * Client : uniquement son/ses chantier(s). Associé : tout.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSharePayload } from '@lib-root/server/share/shareStore';

/** Données chantier mock (à remplacer par vraie source) */
function getChantiers(chantierIds?: string[]) {
  const all = [
    { id: 'CH-001', nom: 'Chantier Alpha', prestation: 'VRD', avancement: 65, risque: 'faible' },
    { id: 'CH-002', nom: 'Chantier Beta', prestation: 'Gros œuvre', avancement: 42, risque: 'moyen' },
    { id: 'CH-003', nom: 'Chantier Gamma', prestation: 'Second œuvre', avancement: 88, risque: 'faible' },
  ];
  if (!chantierIds?.length) return all;
  return all.filter((c) => chantierIds.includes(c.id));
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const payload = getSharePayload(token);
    if (!payload) {
      return NextResponse.json({ error: 'Link expired or invalid' }, { status: 404 });
    }

    const chantiers = getChantiers(
      payload.role === 'client' ? payload.chantierIds : undefined
    );

    return NextResponse.json({
      role: payload.role,
      expiresAt: new Date(payload.expiresAt).toISOString(),
      chantiers,
      scope: payload.scope,
    });
  } catch (e) {
    console.error('[share/[token]]', e);
    return NextResponse.json(
      { error: 'Failed to load shared data', message: e instanceof Error ? e.message : 'Unknown' },
      { status: 500 }
    );
  }
}
