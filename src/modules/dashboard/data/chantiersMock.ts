/**
 * Données mock chantiers NICE RÉNOVATION — Phase 1 Health Spheres
 * Structure alignée sur le cockpit DG (santé, CA, phase, Bureau Contrôle, etc.)
 */

export interface ChantierMock {
  id: string;
  segment: string;
  prestation: string;
  phase: number;
  ca: number;
  marge: number;
  sante: number; // 0–1 : vert > 0.8, jaune > 0.6, rouge sinon
  gpsLive: boolean;
  bureauControle: string;
  photosGps: number;
  photosManquantes?: number;
  stockPeinture?: number;
  /** Téléphone chef chantier (tel: / Appeler) */
  chefChantierPhone?: string;
  /** Nom du chef chantier */
  chefChantierName?: string;
}

export const chantiers: ChantierMock[] = [
  {
    id: 'RENOV-042',
    segment: 'Diaspora',
    prestation: 'Rénovation',
    phase: 19,
    ca: 1_200_000,
    marge: 0.23,
    sante: 0.87,
    gpsLive: true,
    bureauControle: '2/3',
    photosGps: 27,
    photosManquantes: 0,
    stockPeinture: 0.02,
  },
  {
    id: 'REPAR-015',
    segment: 'Commerçants',
    prestation: 'Réparations',
    phase: 16,
    ca: 800_000,
    marge: 0.19,
    sante: 0.62,
    gpsLive: false,
    bureauControle: '1/3',
    photosGps: 12,
    photosManquantes: 5,
  },
  {
    id: 'RENOV-038',
    segment: 'Diaspora',
    prestation: 'Rénovation',
    phase: 22,
    ca: 2_100_000,
    marge: 0.25,
    sante: 0.92,
    gpsLive: true,
    bureauControle: '3/3',
    photosGps: 45,
    photosManquantes: 0,
  },
  {
    id: 'REPAR-009',
    segment: 'Particuliers',
    prestation: 'Réparations',
    phase: 8,
    ca: 450_000,
    marge: 0.18,
    sante: 0.55,
    gpsLive: false,
    bureauControle: '0/3',
    photosGps: 5,
    photosManquantes: 8,
  },
  {
    id: 'RENOV-031',
    segment: 'Établissements',
    prestation: 'Rénovation',
    phase: 14,
    ca: 1_800_000,
    marge: 0.21,
    sante: 0.78,
    gpsLive: true,
    bureauControle: '2/3',
    photosGps: 22,
    photosManquantes: 2,
  },
  {
    id: 'RENOV-027',
    segment: 'Commerçants',
    prestation: 'Rénovation',
    phase: 26,
    ca: 950_000,
    marge: 0.24,
    sante: 0.95,
    gpsLive: true,
    bureauControle: '3/3',
    photosGps: 38,
  },
  {
    id: 'REPAR-022',
    segment: 'Diaspora',
    prestation: 'Réparations',
    phase: 11,
    ca: 620_000,
    marge: 0.17,
    sante: 0.68,
    gpsLive: true,
    bureauControle: '1/3',
    photosGps: 15,
    photosManquantes: 3,
  },
  {
    id: 'RENOV-005',
    segment: 'Particuliers',
    prestation: 'Rénovation',
    phase: 4,
    ca: 380_000,
    marge: 0.2,
    sante: 0.72,
    gpsLive: false,
    bureauControle: '1/3',
    photosGps: 8,
  },
  {
    id: 'RENOV-018',
    segment: 'Établissements',
    prestation: 'Rénovation',
    phase: 18,
    ca: 1_500_000,
    marge: 0.22,
    sante: 0.84,
    gpsLive: true,
    bureauControle: '2/3',
    photosGps: 30,
    stockPeinture: 0.15,
  },
  {
    id: 'REPAR-033',
    segment: 'Commerçants',
    prestation: 'Réparations',
    phase: 7,
    ca: 290_000,
    marge: 0.16,
    sante: 0.48,
    gpsLive: false,
    bureauControle: '0/3',
    photosGps: 2,
    photosManquantes: 12,
  },
  { id: 'RENOV-012', segment: 'Particuliers', prestation: 'Rénovation', phase: 10, ca: 720_000, marge: 0.2, sante: 0.81, gpsLive: true, bureauControle: '2/3', photosGps: 18 },
  { id: 'REPAR-028', segment: 'Établissements', prestation: 'Réparations', phase: 13, ca: 540_000, marge: 0.18, sante: 0.58, gpsLive: false, bureauControle: '1/3', photosGps: 9, photosManquantes: 6 },
  { id: 'RENOV-044', segment: 'Diaspora', prestation: 'Rénovation', phase: 24, ca: 1_900_000, marge: 0.26, sante: 0.91, gpsLive: true, bureauControle: '3/3', photosGps: 42 },
  { id: 'REPAR-007', segment: 'Commerçants', prestation: 'Réparations', phase: 5, ca: 310_000, marge: 0.15, sante: 0.52, gpsLive: false, bureauControle: '0/3', photosGps: 4, photosManquantes: 9 },
  { id: 'RENOV-021', segment: 'Particuliers', prestation: 'Rénovation', phase: 15, ca: 1_100_000, marge: 0.22, sante: 0.76, gpsLive: true, bureauControle: '2/3', photosGps: 25 },
  { id: 'RENOV-035', segment: 'Établissements', prestation: 'Rénovation', phase: 20, ca: 1_650_000, marge: 0.23, sante: 0.88, gpsLive: true, bureauControle: '2/3', photosGps: 33 },
  { id: 'REPAR-019', segment: 'Diaspora', prestation: 'Réparations', phase: 12, ca: 480_000, marge: 0.17, sante: 0.64, gpsLive: true, bureauControle: '1/3', photosGps: 11, photosManquantes: 4 },
  { id: 'RENOV-029', segment: 'Commerçants', prestation: 'Rénovation', phase: 17, ca: 1_350_000, marge: 0.24, sante: 0.79, gpsLive: true, bureauControle: '2/3', photosGps: 28 },
  { id: 'REPAR-041', segment: 'Particuliers', prestation: 'Réparations', phase: 9, ca: 390_000, marge: 0.16, sante: 0.45, gpsLive: false, bureauControle: '0/3', photosGps: 3, photosManquantes: 10 },
  { id: 'RENOV-003', segment: 'Établissements', prestation: 'Rénovation', phase: 3, ca: 580_000, marge: 0.19, sante: 0.71, gpsLive: false, bureauControle: '1/3', photosGps: 7 },
];

