/**
 * Données mock pour le cockpit dashboard (périmètres, score qualité, typologie blocages, KPIs).
 * Phase 2 audit (mock) : cohérence par périmètre — KPIs, score qualité, typologie blocages,
 * indicateurs complémentaires (délai paiement, taux utilisation, bilan carbone) varient selon
 * getKpisForPerimetre / getIndicateursComplementaires. CA mois et CA cumulé (FinancesGlobalesWidget)
 * à aligner sur le même périmètre lorsque les APIs seront branchées.
 * À remplacer par les appels API lorsque l'activité est lancée.
 */

export type PerimetreId = 'nice-renovation' | 'tous';

export interface PerimetreMock {
  id: PerimetreId;
  label: string;
}

export const PERIMETRES_MOCK: PerimetreMock[] = [
  { id: 'nice-renovation', label: 'NICE RÉNOVATION' },
  { id: 'tous', label: 'Tous les périmètres' },
];

/** Période pour les filtres date (mock) */
export type DateFilterId = 'annee' | 'mois' | 'semaine';
export interface DateFilterOption {
  id: DateFilterId;
  label: string;
}
export const DATE_FILTER_OPTIONS: DateFilterOption[] = [
  { id: 'annee', label: 'Année' },
  { id: 'mois', label: 'Mois' },
  { id: 'semaine', label: 'Semaine' },
];

/** Chantiers pour filtre header (mock) */
export interface ChantierFilterOption {
  id: string;
  label: string;
}
export const CHANTIERS_FILTER_MOCK: ChantierFilterOption[] = [
  { id: 'tous', label: 'Tous les chantiers' },
  { id: 'CH-2024-001', label: 'CH-2024-001 — Résidence Les Oliviers' },
  { id: 'CH-2024-002', label: 'CH-2024-002 — Lycée Jean Moulin' },
  { id: 'CH-2024-003', label: 'CH-2024-003 — Centre sportif Nord' },
];

/** Équipes pour filtre header (mock) */
export interface EquipeFilterOption {
  id: string;
  label: string;
}
export const EQUIPES_FILTER_MOCK: EquipeFilterOption[] = [
  { id: 'toutes', label: 'Toutes les équipes' },
  { id: 'eq-a', label: 'Équipe A — Gros œuvre' },
  { id: 'eq-b', label: 'Équipe B — Second œuvre' },
  { id: 'eq-c', label: 'Équipe C — Fluides' },
];

export interface ScoreQualiteBreakdown {
  finitions: number;
  delais: number;
  conformite: number;
  satisfaction: number;
  global: number;
}

export interface TypologieBlocages {
  technique: number;
  administratif: number;
  financier: number;
  rh: number;
  total: number;
}

export interface KpiMockItem {
  label: string;
  value: string | number;
  delta: string;
  tone: 'ok' | 'warn' | 'crit' | 'info';
  trend: 'up' | 'down' | 'neutral';
}

const SCORE_QUALITE_BY_PERIMETRE: Record<PerimetreId, ScoreQualiteBreakdown> = {
  'nice-renovation': {
    finitions: 40,
    delais: 60,
    conformite: 45,
    satisfaction: 35,
    global: 45,
  },
  tous: {
    finitions: 38,
    delais: 58,
    conformite: 42,
    satisfaction: 40,
    global: 44,
  },
};

const BLOCAGES_BY_PERIMETRE: Record<PerimetreId, TypologieBlocages> = {
  'nice-renovation': {
    technique: 2,
    administratif: 1,
    financier: 1,
    rh: 1,
    total: 5,
  },
  tous: {
    technique: 4,
    administratif: 2,
    financier: 2,
    rh: 2,
    total: 10,
  },
};

const KPIS_BY_PERIMETRE: Record<PerimetreId, KpiMockItem[]> = {
  'nice-renovation': [
    { label: 'Demandes', value: 247, delta: '+12', tone: 'ok', trend: 'up' },
    { label: 'Validations', value: '89%', delta: '+3%', tone: 'ok', trend: 'up' },
    { label: 'Blocages', value: 5, delta: '-2', tone: 'warn', trend: 'down' },
    { label: 'Risques critiques', value: 3, delta: '+1', tone: 'crit', trend: 'up' },
    { label: 'Budget consommé', value: '67%', delta: '—', tone: 'info', trend: 'neutral' },
    { label: 'Décisions en attente', value: 8, delta: '—', tone: 'warn', trend: 'neutral' },
    { label: 'Temps réponse', value: '2.4j', delta: '-0.3j', tone: 'warn', trend: 'down' },
    { label: 'Conformité SLA', value: '94%', delta: '+2%', tone: 'ok', trend: 'up' },
    { label: 'Productivité (€/h MO)', value: '42', delta: '+2', tone: 'ok', trend: 'up' },
    { label: 'ROI moyen', value: '1.24', delta: '+0.05', tone: 'ok', trend: 'up' },
  ],
  tous: [
    { label: 'Chantiers en cours', value: 24, delta: '+2', tone: 'ok', trend: 'up' },
    { label: 'Demandes', value: 512, delta: '+28', tone: 'ok', trend: 'up' },
    { label: 'Validations', value: '86%', delta: '+1%', tone: 'warn', trend: 'up' },
    { label: 'Blocages', value: 10, delta: '+2', tone: 'warn', trend: 'up' },
    { label: 'Risques critiques', value: 6, delta: '+2', tone: 'crit', trend: 'up' },
    { label: 'Budget consommé', value: '71%', delta: '—', tone: 'info', trend: 'neutral' },
    { label: 'Décisions en attente', value: 14, delta: '—', tone: 'warn', trend: 'neutral' },
    { label: 'Temps réponse', value: '2.8j', delta: '+0.2j', tone: 'warn', trend: 'down' },
    { label: 'Conformité SLA', value: '91%', delta: '+1%', tone: 'ok', trend: 'up' },
    { label: 'Productivité (€/h MO)', value: '38', delta: '+1', tone: 'ok', trend: 'up' },
    { label: 'ROI moyen', value: '1.18', delta: '+0.03', tone: 'ok', trend: 'up' },
    { label: 'Délai paiement', value: '45 j', delta: '—', tone: 'ok', trend: 'neutral' },
    { label: 'Taux utilisation', value: '74%', delta: '+1%', tone: 'warn', trend: 'up' },
    { label: 'Bilan carbone', value: '285', delta: '-12', tone: 'ok', trend: 'down' },
  ],
};

export function getScoreQualiteBreakdown(perimetreId: PerimetreId): ScoreQualiteBreakdown {
  return SCORE_QUALITE_BY_PERIMETRE[perimetreId] ?? SCORE_QUALITE_BY_PERIMETRE['nice-renovation'];
}

export function getTypologieBlocages(perimetreId: PerimetreId): TypologieBlocages {
  return BLOCAGES_BY_PERIMETRE[perimetreId] ?? BLOCAGES_BY_PERIMETRE['nice-renovation'];
}

export function getKpisForPerimetre(perimetreId: PerimetreId): KpiMockItem[] {
  return KPIS_BY_PERIMETRE[perimetreId] ?? KPIS_BY_PERIMETRE['nice-renovation'];
}

/** ROI par type de chantier (Phase 2 — mock). À brancher sur API. */
export interface RoiParTypeChantierItem {
  typeChantier: string;
  roi: number;
  nbChantiers: number;
  caTotal: number;
}

const ROI_PAR_TYPE_BY_PERIMETRE: Record<PerimetreId, RoiParTypeChantierItem[]> = {
  'nice-renovation': [
    { typeChantier: 'Rénovation', roi: 1.28, nbChantiers: 12, caTotal: 28_500_000 },
    { typeChantier: 'Gros œuvre', roi: 1.15, nbChantiers: 5, caTotal: 12_200_000 },
    { typeChantier: 'Second œuvre', roi: 1.32, nbChantiers: 4, caTotal: 8_100_000 },
    { typeChantier: 'VRD', roi: 1.08, nbChantiers: 3, caTotal: 4_200_000 },
  ],
  tous: [
    { typeChantier: 'Rénovation', roi: 1.24, nbChantiers: 14, caTotal: 32_100_000 },
    { typeChantier: 'Gros œuvre', roi: 1.12, nbChantiers: 6, caTotal: 14_800_000 },
    { typeChantier: 'Second œuvre', roi: 1.28, nbChantiers: 5, caTotal: 9_500_000 },
    { typeChantier: 'VRD', roi: 1.05, nbChantiers: 4, caTotal: 5_600_000 },
    { typeChantier: 'Fluides', roi: 1.18, nbChantiers: 3, caTotal: 3_200_000 },
  ],
};

export function getRoiParTypeChantier(perimetreId: PerimetreId): RoiParTypeChantierItem[] {
  return ROI_PAR_TYPE_BY_PERIMETRE[perimetreId] ?? ROI_PAR_TYPE_BY_PERIMETRE['nice-renovation'];
}

/** Indicateurs complémentaires DG — Phase 2 audit (mock). Délai paiement, taux utilisation, bilan carbone. */
export interface IndicateursComplementairesMock {
  tauxAccidentsHse: number;
  productiviteHoraire: string;
  delaiPaiementMoyenJours: number;
  delaiPaiementObjectifJours: number;
  roiChantiersPourcent: number;
  tauxUtilisation: number;
  tauxUtilisationObjectif: number;
  bilanCarboneTeqCO2: number;
  bilanCarboneObjectifTeqCO2: number;
}

const INDICATEURS_COMPLEMENTAIRES_BY_PERIMETRE: Record<PerimetreId, IndicateursComplementairesMock> = {
  'nice-renovation': {
    tauxAccidentsHse: 0,
    productiviteHoraire: '18,2 K XOF/h',
    delaiPaiementMoyenJours: 42,
    delaiPaiementObjectifJours: 45,
    roiChantiersPourcent: 22,
    tauxUtilisation: 78,
    tauxUtilisationObjectif: 80,
    bilanCarboneTeqCO2: 124,
    bilanCarboneObjectifTeqCO2: 150,
  },
  tous: {
    tauxAccidentsHse: 0,
    productiviteHoraire: '16,8 K XOF/h',
    delaiPaiementMoyenJours: 45,
    delaiPaiementObjectifJours: 45,
    roiChantiersPourcent: 20,
    tauxUtilisation: 74,
    tauxUtilisationObjectif: 80,
    bilanCarboneTeqCO2: 285,
    bilanCarboneObjectifTeqCO2: 320,
  },
};

export function getIndicateursComplementaires(perimetreId: PerimetreId): IndicateursComplementairesMock {
  return INDICATEURS_COMPLEMENTAIRES_BY_PERIMETRE[perimetreId] ?? INDICATEURS_COMPLEMENTAIRES_BY_PERIMETRE['nice-renovation'];
}

/** Événement d'activité récente (mock) */
export interface ActiviteRecenteItem {
  id: string;
  type: 'validation' | 'chantier' | 'alerte' | 'decision' | 'paiement' | 'autre';
  label: string;
  timeAgo: string;
  ref?: string;
}

export const ACTIVITE_RECENTE_MOCK: ActiviteRecenteItem[] = [
  { id: '1', type: 'validation', label: 'Validation BC #042', timeAgo: 'il y a 2 h', ref: '#042' },
  { id: '2', type: 'chantier', label: 'Nouveau chantier #048', timeAgo: 'il y a 5 h', ref: '#048' },
  { id: '3', type: 'alerte', label: 'Alerte retard #033', timeAgo: 'il y a 1 j', ref: '#033' },
  { id: '4', type: 'decision', label: 'Décision DG #035', timeAgo: 'il y a 1 j', ref: '#035' },
  { id: '5', type: 'paiement', label: 'Paiement reçu CH-041', timeAgo: 'il y a 2 j', ref: '#041' },
  { id: '6', type: 'validation', label: 'Validation BC #036', timeAgo: 'il y a 2 j', ref: '#036' },
  { id: '7', type: 'autre', label: 'Visite chantier #047', timeAgo: 'il y a 3 j', ref: '#047' },
];
