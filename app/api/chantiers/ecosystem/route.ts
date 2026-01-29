/**
 * Phase 5 — GET /api/chantiers/ecosystem
 * Écosystème live : chantiers + ouvriers + quincailleries (stub).
 * Backend NestJS getEcosystemLive ; ici mock pour frontend standalone.
 */

import { NextResponse } from 'next/server';
import { chantiers as allChantiers } from '@/modules/dashboard/data/chantiersMock';
import { calculateSante, type HealthSphereRaw } from '@/modules/dashboard/utils/chantierHealth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function toHealthSphere(
  c: (typeof allChantiers)[number]
): HealthSphereRaw {
  const sante = calculateSante({
    phase: c.phase,
    stockPeinture: c.stockPeinture,
    bureauControle: c.bureauControle,
    photosManquantes: c.photosManquantes,
  });
  return {
    id: c.id,
    ca: c.ca,
    sante,
    phase: c.phase,
    segment: c.segment,
    stockPeinture: c.stockPeinture,
  };
}

export async function GET() {
  try {
    const chantiers = [...allChantiers]
      .sort((a, b) => b.ca - a.ca)
      .slice(0, 42)
      .map(toHealthSphere);

    const ouvriers = [
      { id: 'o1', nom: 'Chef Mbaye', chantierId: 'RENOV-042', isPresent: true },
      { id: 'o2', nom: 'Moussa Diallo', chantierId: 'RENOV-038', isPresent: true },
    ];
    const quincailleries = [
      { id: 'q1', nom: 'Quincaillerie Almadies', stockPeinture: 0.12, critical: true },
      { id: 'q2', nom: 'Dakar Centre', stockPeinture: 0.35, critical: false },
    ];

    return NextResponse.json({
      chantiers,
      ouvriers,
      quincailleries,
      lastUpdated: new Date().toISOString(),
    });
  } catch (e) {
    console.error('[chantiers/ecosystem]', e);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
