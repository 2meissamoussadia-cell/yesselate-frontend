/**
 * Fil conducteur BTP Sénégal — Phases 0→10 ↔ Modules BMO
 * Aligne le cycle projet (idée → livraison → exploitation → garanties) avec les routes du portail BMO.
 * Référence : docs/bmo/FIL_CONDUCTEUR_MODULES_BMO.md
 */

const base = '/maitre-ouvrage';

export type BMOPhaseId =
  | 'phase-0'
  | 'phase-1'
  | 'phase-2'
  | 'phase-3'
  | 'phase-4'
  | 'phase-5'
  | 'phase-6'
  | 'phase-7'
  | 'phase-8'
  | 'phase-9'
  | 'phase-10';

export interface BMOPhaseEntry {
  id: BMOPhaseId;
  label: string;
  shortLabel: string;
  gateLabel?: string;
  /** Routes BMO principales couvrant cette phase */
  routes: Array<{ path: string; label: string }>;
  /** Modules sidebar (BMOModuleId) concernés */
  modules: Array<'cockpit' | 'chantiers' | 'alerts' | 'engagements' | 'governance' | 'quality' | 'documents' | 'support' | 'foncier' | 'conformite' | 'achats' | 'conception' | 'execution' | 'receptions' | 'maintenance'>;
  /** Module dédié à créer (optionnel) */
  suggestedModule?: string;
}

export const bmoFilConducteurPhases: BMOPhaseEntry[] = [
  {
    id: 'phase-0',
    label: 'Pré-projet & stratégie',
    shortLabel: 'Pré-projet',
    gateLabel: 'Gate #0 : GO étude',
    routes: [
      { path: `${base}/cockpit`, label: 'Cockpit DG' },
      { path: `${base}/governance/decisions`, label: 'Décisions' },
    ],
    modules: ['cockpit', 'governance'],
    suggestedModule: 'Pré-projet & Opportunité',
  },
  {
    id: 'phase-1',
    label: 'Foncier & due diligence',
    shortLabel: 'Foncier',
    gateLabel: 'Gate #1 : OK foncier & constructibilité',
    routes: [
      { path: `${base}/foncier`, label: 'Foncier & Diagnostics' },
      { path: `${base}/chantiers`, label: 'Chantiers' },
    ],
    modules: ['foncier', 'chantiers'],
    suggestedModule: 'Foncier & Due diligence',
  },
  {
    id: 'phase-2',
    label: 'Programmation & exigences',
    shortLabel: 'Programmation',
    gateLabel: 'Gate #2 : Validation du Programme',
    routes: [
      { path: `${base}/chantiers`, label: 'Chantiers & Programmes' },
      { path: `${base}/governance/decisions`, label: 'Décisions' },
    ],
    modules: ['chantiers', 'governance'],
    suggestedModule: 'Programmation',
  },
  {
    id: 'phase-3',
    label: 'Conception (Architecte & BE)',
    shortLabel: 'Conception',
    gateLabel: 'Gate #3 : Gel de conception APD',
    routes: [
      { path: `${base}/documents`, label: 'Documents & Contrats' },
      { path: `${base}/engagements`, label: 'Engagements & Finances' },
      { path: `${base}/demandes`, label: 'Demandes' },
    ],
    modules: ['documents', 'engagements'],
  },
  {
    id: 'phase-4',
    label: 'Autorisations & assurances',
    shortLabel: 'Autorisations',
    gateLabel: 'Gate #4 : Permis & assurances OK',
    routes: [
      { path: `${base}/conformite`, label: 'Conformité & Autorisations' },
      { path: `${base}/documents`, label: 'Documents & Contrats' },
    ],
    modules: ['conformite', 'documents'],
    suggestedModule: 'Conformité & Autorisations',
  },
  {
    id: 'phase-5',
    label: 'Consultation & contractualisation',
    shortLabel: 'Consultation',
    gateLabel: 'Gate #5 : Attribution & signature',
    routes: [
      { path: `${base}/demandes`, label: 'Demandes' },
      { path: `${base}/engagements`, label: 'Engagements & Finances' },
      { path: `${base}/validation-contrats`, label: 'Validation Contrats' },
      { path: `${base}/governance/decisions`, label: 'Décisions' },
    ],
    modules: ['engagements', 'governance'],
  },
  {
    id: 'phase-6',
    label: 'Préparation de chantier',
    shortLabel: 'Préparation chantier',
    gateLabel: 'Gate #6 : Visa EXE & plan qualité',
    routes: [
      { path: `${base}/chantiers`, label: 'Chantiers & Programmes' },
      { path: `${base}/documents`, label: 'Documents' },
    ],
    modules: ['chantiers', 'documents'],
  },
  {
    id: 'phase-7',
    label: 'Exécution (gros œuvre)',
    shortLabel: 'Gros œuvre',
    gateLabel: 'Gate #7 : Structure OK',
    routes: [
      { path: `${base}/chantiers`, label: 'Chantiers' },
      { path: `${base}/quality`, label: 'Qualité & Réserves' },
      { path: `${base}/alerts`, label: 'Alertes & Incidents' },
    ],
    modules: ['chantiers', 'quality', 'alerts'],
  },
  {
    id: 'phase-8',
    label: 'Second œuvre & techniques',
    shortLabel: 'Second œuvre',
    gateLabel: 'Gate #8 : Bâtiment opérationnel',
    routes: [
      { path: `${base}/chantiers`, label: 'Chantiers' },
      { path: `${base}/quality`, label: 'Qualité & Réserves' },
      { path: `${base}/documents`, label: 'Documents' },
    ],
    modules: ['projects', 'quality', 'documents'],
  },
  {
    id: 'phase-9',
    label: 'Réceptions & mise en service',
    shortLabel: 'Réceptions',
    gateLabel: 'Gate #9 : Réception prononcée',
    routes: [
      { path: `${base}/quality`, label: 'Qualité & Réserves' },
      { path: `${base}/documents`, label: 'Documents (DOE)' },
      { path: `${base}/governance`, label: 'Gouvernance' },
    ],
    modules: ['quality', 'documents', 'governance'],
  },
  {
    id: 'phase-10',
    label: 'Exploitation, maintenance & garanties',
    shortLabel: 'Exploitation & garanties',
    gateLabel: 'Gate #10 : Clôture GPA',
    routes: [
      { path: `${base}/quality`, label: 'Qualité & Réserves (GPA)' },
      { path: `${base}/chantiers`, label: 'Chantiers (livrés)' },
    ],
    modules: ['quality', 'chantiers', 'maintenance'],
    suggestedModule: 'Exploitation & Maintenance',
  },
];

/** Retourne la phase correspondant à un path (première correspondance). */
export function getPhaseByPath(pathname: string): BMOPhaseEntry | undefined {
  const normalized = pathname.replace(/\/$/, '');
  for (const phase of bmoFilConducteurPhases) {
    for (const r of phase.routes) {
      const p = r.path.replace(/\/$/, '');
      if (normalized === p || normalized.startsWith(p + '/')) return phase;
    }
  }
  return undefined;
}

/** Liste des phases ayant un module suggéré (à créer). */
export const bmoPhasesWithSuggestedModule = bmoFilConducteurPhases.filter(
  (p) => p.suggestedModule != null
);
