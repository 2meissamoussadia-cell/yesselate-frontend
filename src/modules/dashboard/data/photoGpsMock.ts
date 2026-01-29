/**
 * Phase 6 — Données mock Photos GPS + Plan AR
 * Photos géolocalisées par chantier ; plans et photos "réelle" pour comparaison AR.
 */

export interface PhotoGpsMock {
  id: string;
  chantierId: string;
  url: string;
  thumbUrl: string;
  lat: number;
  lng: number;
  label: string;
  date: string;
  phase?: number;
}

export interface PlanARMock {
  chantierId: string;
  planUrl: string;
  photoReelleUrl: string;
  label: string;
  ecartCm?: number; // décalage simulé en cm
}

// Placeholder local pour éviter 503 picsum.photos (réseau/CORS) ; en prod = URLs stock/CDN
const PLACEHOLDER_PHOTO = '/images/placeholder-photo.svg';
function thumb(_id: string) {
  return PLACEHOLDER_PHOTO;
}
function large(_id: string) {
  return PLACEHOLDER_PHOTO;
}

/** Libellés des phases (Fondations, Gros œuvre, Finitions, etc.) */
export const PHASE_LABELS: Record<number, string> = {
  1: 'Phase 1 - Fondations',
  2: 'Phase 2 - Gros œuvre',
  3: 'Phase 3 - Second œuvre',
  4: 'Phase 4 - Finitions',
  5: 'Phase 5 - Équipements',
  6: 'Phase 6 - Livraison',
};
export function getPhaseLabel(phase: number): string {
  return PHASE_LABELS[phase] ?? `Phase ${phase}`;
}

export const photosGps: PhotoGpsMock[] = [
  { id: 'p1', chantierId: 'RENOV-042', url: large('r042-1'), thumbUrl: thumb('r042-1'), lat: 14.7925, lng: -16.9264, label: 'Façade nord', date: '2025-01-28T09:15:00', phase: 4 },
  { id: 'p2', chantierId: 'RENOV-042', url: large('r042-2'), thumbUrl: thumb('r042-2'), lat: 14.7926, lng: -16.9265, label: 'Chantier Phase 4', date: '2025-01-28T14:00:00', phase: 4 },
  { id: 'p3', chantierId: 'RENOV-042', url: large('r042-3'), thumbUrl: thumb('r042-3'), lat: 14.7924, lng: -16.9263, label: 'Stock peinture', date: '2025-01-27T11:00:00', phase: 4 },
  { id: 'p1a', chantierId: 'RENOV-042', url: large('r042-f1'), thumbUrl: thumb('r042-f1'), lat: 14.7923, lng: -16.9262, label: 'Fondations décaissement', date: '2024-09-10T08:00:00', phase: 1 },
  { id: 'p1b', chantierId: 'RENOV-042', url: large('r042-f2'), thumbUrl: thumb('r042-f2'), lat: 14.7924, lng: -16.9263, label: 'Fondations coulage', date: '2024-09-15T10:00:00', phase: 1 },
  { id: 'p2a', chantierId: 'RENOV-042', url: large('r042-g1'), thumbUrl: thumb('r042-g1'), lat: 14.7925, lng: -16.9264, label: 'Gros œuvre murs', date: '2024-10-20T09:00:00', phase: 2 },
  { id: 'p2b', chantierId: 'RENOV-042', url: large('r042-g2'), thumbUrl: thumb('r042-g2'), lat: 14.7926, lng: -16.9265, label: 'Gros œuvre charpente', date: '2024-11-05T14:00:00', phase: 2 },
  { id: 'p3a', chantierId: 'RENOV-042', url: large('r042-s1'), thumbUrl: thumb('r042-s1'), lat: 14.7925, lng: -16.9264, label: 'Second œuvre cloisons', date: '2024-12-01T11:00:00', phase: 3 },
  { id: 'p4', chantierId: 'REPAR-015', url: large('r015-1'), thumbUrl: thumb('r015-1'), lat: 14.8012, lng: -16.9100, label: 'Toiture', date: '2025-01-26T10:30:00' },
  { id: 'p5', chantierId: 'REPAR-015', url: large('r015-2'), thumbUrl: thumb('r015-2'), lat: 14.8013, lng: -16.9101, label: 'Électricité', date: '2025-01-25T15:00:00' },
  { id: 'p6', chantierId: 'RENOV-038', url: large('r038-1'), thumbUrl: thumb('r038-1'), lat: 14.7550, lng: -16.9400, label: 'Bureau contrôle 3/3', date: '2025-01-28T08:00:00', phase: 6 },
  { id: 'p7', chantierId: 'RENOV-038', url: large('r038-2'), thumbUrl: thumb('r038-2'), lat: 14.7551, lng: -16.9401, label: 'Livraison matériaux', date: '2025-01-27T12:00:00' },
  { id: 'p8', chantierId: 'RENOV-031', url: large('r031-1'), thumbUrl: thumb('r031-1'), lat: 14.7700, lng: -16.9200, label: 'Phase 14 avancement', date: '2025-01-28T07:45:00', phase: 14 },
];

export const plansAR: PlanARMock[] = [
  { chantierId: 'RENOV-042', planUrl: large('plan-042'), photoReelleUrl: large('real-042'), label: 'Phase 4 — Façade nord', ecartCm: 12 },
  { chantierId: 'REPAR-015', planUrl: large('plan-015'), photoReelleUrl: large('real-015'), label: 'Toiture — Plan vs Réel', ecartCm: 8 },
  { chantierId: 'RENOV-038', planUrl: large('plan-038'), photoReelleUrl: large('real-038'), label: 'Bureau contrôle — AR', ecartCm: 5 },
];
