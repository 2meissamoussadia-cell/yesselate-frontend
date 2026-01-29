/**
 * Phase 5 — Santé chantier & Health Spheres
 * Aligné backend NestJS ChantierService.calculateSante.
 */

export interface HealthSphereInput {
  phase: number;
  stockPeinture?: number;
  bureauControle?: string;
  photosManquantes?: number;
}

export interface HealthSphereRaw {
  id: string;
  ca: number;
  sante: number;
  phase: number;
  segment: string;
  stockPeinture?: number;
}

/**
 * Calcule la santé projet 0–1 (phase bloquante, stock, BC, photos).
 * Phase 16–21 → ×0.7 ; stock < 0.05 → ×0.3 ; BC ✗ ou 0/3 ou 1/3 → ×0.6 ; photos manq. > 3 → ×0.5.
 */
export function calculateSante(c: HealthSphereInput): number {
  let score = 1.0;

  if (c.phase >= 16 && c.phase <= 21) score *= 0.7;
  if ((c.stockPeinture ?? 1) < 0.05) score *= 0.3;
  const bc = c.bureauControle ?? '';
  if (bc.includes('✗') || bc.startsWith('0/') || bc.startsWith('1/3')) score *= 0.6;
  if ((c.photosManquantes ?? 0) > 3) score *= 0.5;

  return Math.max(0.1, score);
}

/**
 * Mappe HealthSphereRaw → ChantierMock pour HealthSphereGrid.
 */
export function healthToChantierMock(
  h: HealthSphereRaw,
  overrides?: Partial<{ prestation: string; marge: number; gpsLive: boolean; bureauControle: string; photosGps: number; photosManquantes: number }>
) {
  return {
    id: h.id,
    segment: h.segment,
    prestation: overrides?.prestation ?? 'Rénovation',
    phase: h.phase,
    ca: h.ca,
    marge: overrides?.marge ?? 0.2,
    sante: h.sante,
    gpsLive: overrides?.gpsLive ?? true,
    bureauControle: overrides?.bureauControle ?? '2/3',
    photosGps: overrides?.photosGps ?? 0,
    photosManquantes: overrides?.photosManquantes ?? 0,
    stockPeinture: h.stockPeinture,
  };
}
