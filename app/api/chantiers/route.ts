/**
 * Phase 5 — GET /api/chantiers
 * Liste chantiers (phase, segment). findCritiques aligné backend NestJS.
 */

import { NextRequest, NextResponse } from 'next/server';
import { chantiers as allChantiers } from '@/modules/dashboard/data/chantiersMock';
import { calculateSante, type HealthSphereRaw } from '@/modules/dashboard/utils/chantierHealth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const DEFAULT_LIMIT = 42;

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

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const phase = searchParams.get('phase');
    const segment = searchParams.get('segment');
    const limit = Math.min(
      500,
      parseInt(searchParams.get('limit') ?? String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT
    );

    let list = [...allChantiers].sort((a, b) => b.ca - a.ca);

    if (phase != null) {
      const p = parseInt(phase, 10);
      if (!Number.isNaN(p)) list = list.filter((c) => c.phase === p);
    }
    if (segment != null && segment !== '')
      list = list.filter((c) => c.segment.toLowerCase() === segment.toLowerCase());

    const spheres = list.slice(0, limit).map(toHealthSphere);
    return NextResponse.json(spheres);
  } catch (e) {
    console.error('[chantiers]', e);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
