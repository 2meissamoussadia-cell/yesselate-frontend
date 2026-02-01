/**
 * Structure hiérarchique Pilotage — dossier > sous-dossier > sous-sous-dossier …
 * Arborescence multi-niveaux (1, 1.1, 1.1.1, 1.1.1.1, 1.1.1.1.1)
 *
 * @see docs/dashboard/AUDIT_DASHBOARD_MODULES_INTERLIEN.md
 */

import type { ModuleLinkTarget } from '@/lib/navigation/moduleLinks';

export interface PilotageHierarchyNode {
  id: string;
  label: string;
  /** Enfants récursifs (sous-dossiers) */
  children?: PilotageHierarchyNode[];
  /** Cible de navigation (feuille = noeud sans enfants) */
  target: ModuleLinkTarget;
  /** Numéro hiérarchique affiché (ex. "1", "1.1", "1.1.1") */
  level?: string;
}

/**
 * Arbre hiérarchique Pilotage — structure dossier / sous-dossier
 */
export const PILOTAGE_HIERARCHY: PilotageHierarchyNode[] = [
  {
    id: 'vue-dg',
    level: '1',
    label: 'Vue DG',
    target: { type: 'dashboard', main: 'pilotage', sub: 'dashboard', leaf: 'cockpit-detail' },
    children: [
      {
        id: 'vue-dg-kpis',
        level: '1.1',
        label: 'KPIs clés',
        target: { type: 'dashboard', main: 'pilotage', sub: 'dashboard', leaf: 'vue-dg-kpis' },
        children: [
          {
            id: 'vue-dg-kpis-financiers',
            level: '1.1.1',
            label: 'Indicateurs financiers',
            target: { type: 'dashboard', main: 'pilotage', sub: 'dashboard', leaf: 'vue-dg-kpis' },
            children: [
              { id: 'vue-dg-kpis-budget', level: '1.1.1.1', label: 'Budget', target: { type: 'dashboard', main: 'pilotage', sub: 'dashboard', leaf: 'vue-dg-kpis-budget' } },
              { id: 'vue-dg-kpis-consommation', level: '1.1.1.2', label: 'Consommation', target: { type: 'dashboard', main: 'pilotage', sub: 'dashboard', leaf: 'vue-dg-kpis-consommation' } },
              { id: 'vue-dg-kpis-tresorerie', level: '1.1.1.3', label: 'Trésorerie', target: { type: 'dashboard', main: 'pilotage', sub: 'dashboard', leaf: 'vue-dg-kpis-tresorerie' } },
            ],
          },
          {
            id: 'vue-dg-kpis-operations',
            level: '1.1.2',
            label: 'Indicateurs opérationnels',
            target: { type: 'dashboard', main: 'pilotage', sub: 'dashboard', leaf: 'vue-dg-kpis' },
            children: [
              { id: 'vue-dg-kpis-chantiers', level: '1.1.2.1', label: 'Chantiers actifs', target: { type: 'dashboard', main: 'pilotage', sub: 'dashboard', leaf: 'vue-dg-kpis-chantiers' } },
              { id: 'vue-dg-kpis-avancement', level: '1.1.2.2', label: 'Avancement', target: { type: 'dashboard', main: 'pilotage', sub: 'dashboard', leaf: 'vue-dg-kpis-avancement' } },
            ],
          },
          {
            id: 'vue-dg-kpis-hse',
            level: '1.1.3',
            label: 'Indicateurs HSE',
            target: { type: 'dashboard', main: 'pilotage', sub: 'dashboard', leaf: 'vue-dg-kpis' },
            children: [
              { id: 'vue-dg-kpis-accidents', level: '1.1.3.1', label: 'Taux accidents', target: { type: 'dashboard', main: 'pilotage', sub: 'dashboard', leaf: 'vue-dg-kpis-accidents' } },
              { id: 'vue-dg-kpis-conformite', level: '1.1.3.2', label: 'Conformité', target: { type: 'dashboard', main: 'pilotage', sub: 'dashboard', leaf: 'vue-dg-kpis-conformite' } },
            ],
          },
        ],
      },
      {
        id: 'vue-dg-sante',
        level: '1.2',
        label: 'Santé portefeuille',
        target: { type: 'dashboard', main: 'pilotage', sub: 'dashboard', leaf: 'vue-dg-sante' },
        children: [
          { id: 'vue-dg-sante-synthese', level: '1.2.1', label: 'Vue synthèse', target: { type: 'dashboard', main: 'pilotage', sub: 'dashboard', leaf: 'vue-dg-sante-synthese' } },
          {
            id: 'vue-dg-sante-phase4',
            level: '1.2.2',
            label: 'Exécution Phase 4',
            target: { type: 'dashboard', main: 'pilotage', sub: 'dashboard', leaf: 'vue-dg-sante-phase4' },
            children: [
              { id: 'vue-dg-sante-critiques', level: '1.2.2.1', label: 'Chantiers critiques', target: { type: 'dashboard', main: 'pilotage', sub: 'dashboard', leaf: 'vue-dg-sante-critiques' } },
              { id: 'vue-dg-sante-tous', level: '1.2.2.2', label: 'Tous chantiers', target: { type: 'dashboard', main: 'pilotage', sub: 'dashboard', leaf: 'vue-dg-sante-tous' } },
            ],
          },
          { id: 'vue-dg-sante-finances', level: '1.2.3', label: 'Vue finances détaillée', target: { type: 'dashboard', main: 'pilotage', sub: 'dashboard', leaf: 'vue-dg-sante-finances' } },
        ],
      },
    ],
  },
  {
    id: 'tresorerie',
    level: '2',
    label: 'Trésorerie & budget',
    target: { type: 'route', href: '/maitre-ouvrage/engagements' },
    children: [
      {
        id: 'tresorerie-synthese',
        level: '2.1',
        label: 'Synthèse',
        target: { type: 'route', href: '/maitre-ouvrage/engagements' },
        children: [
          { id: 'tresorerie-budget', level: '2.1.1', label: 'Budget', target: { type: 'route', href: '/maitre-ouvrage/engagements' } },
          { id: 'tresorerie-previsionnel', level: '2.1.2', label: 'Prévisionnel', target: { type: 'route', href: '/maitre-ouvrage/engagements' } },
        ],
      },
      {
        id: 'tresorerie-details',
        level: '2.2',
        label: 'Détails financiers',
        target: { type: 'route', href: '/maitre-ouvrage/engagements/factures' },
        children: [
          { id: 'tresorerie-factures', level: '2.2.1', label: 'Factures', target: { type: 'route', href: '/maitre-ouvrage/engagements/factures' } },
          { id: 'tresorerie-engagements', level: '2.2.2', label: 'Engagements', target: { type: 'route', href: '/maitre-ouvrage/engagements' } },
        ],
      },
      {
        id: 'tresorerie-tensions',
        level: '2.3',
        label: 'Tensions & actions',
        target: { type: 'route', href: '/maitre-ouvrage/recouvrements' },
        children: [
          { id: 'tresorerie-recouvrements', level: '2.3.1', label: 'Recouvrements', target: { type: 'route', href: '/maitre-ouvrage/recouvrements' } },
          { id: 'tresorerie-creances', level: '2.3.2', label: 'Créances', target: { type: 'route', href: '/maitre-ouvrage/engagements' } },
        ],
      },
    ],
  },
  {
    id: 'risques',
    level: '3',
    label: 'Risques & alertes',
    target: { type: 'route', href: '/maitre-ouvrage/alerts' },
    children: [
      {
        id: 'risques-delais',
        level: '3.1',
        label: 'Risques délais & budget',
        target: { type: 'route', href: '/maitre-ouvrage/performance' },
        children: [
          { id: 'risques-delais-chantiers', level: '3.1.1', label: 'Par chantier', target: { type: 'route', href: '/maitre-ouvrage/performance' } },
          { id: 'risques-delais-global', level: '3.1.2', label: 'Vue globale', target: { type: 'route', href: '/maitre-ouvrage/performance' } },
        ],
      },
      {
        id: 'risques-preditives',
        level: '3.2',
        label: 'Alertes prédictives',
        target: { type: 'route', href: '/maitre-ouvrage/alerts' },
        children: [
          { id: 'risques-preditives-actives', level: '3.2.1', label: 'Alertes actives', target: { type: 'route', href: '/maitre-ouvrage/alerts' } },
          { id: 'risques-preditives-historique', level: '3.2.2', label: 'Historique', target: { type: 'route', href: '/maitre-ouvrage/alerts' } },
        ],
      },
      { id: 'risques-centre', level: '3.3', label: "Centre d'alertes", target: { type: 'route', href: '/maitre-ouvrage/alerts' } },
    ],
  },
  {
    id: 'hse',
    level: '4',
    label: 'HSE & conformité',
    target: { type: 'route', href: '/maitre-ouvrage/conformite' },
    children: [
      {
        id: 'hse-indicateurs',
        level: '4.1',
        label: 'Indicateurs HSE',
        target: { type: 'route', href: '/maitre-ouvrage/conformite' },
        children: [
          { id: 'hse-accidents', level: '4.1.1', label: 'Taux accidents', target: { type: 'route', href: '/maitre-ouvrage/conformite' } },
          { id: 'hse-formation', level: '4.1.2', label: 'Formations', target: { type: 'route', href: '/maitre-ouvrage/conformite' } },
        ],
      },
      {
        id: 'hse-documents',
        level: '4.2',
        label: 'Documents à risque',
        target: { type: 'route', href: '/maitre-ouvrage/conformite' },
        children: [
          { id: 'hse-docs-expiration', level: '4.2.1', label: 'À renouveler', target: { type: 'route', href: '/maitre-ouvrage/conformite' } },
          { id: 'hse-docs-valides', level: '4.2.2', label: 'Valides', target: { type: 'route', href: '/maitre-ouvrage/conformite' } },
        ],
      },
      { id: 'hse-non-conformites', level: '4.3', label: 'Non-conformités', target: { type: 'route', href: '/maitre-ouvrage/conformite' } },
    ],
  },
  {
    id: 'chantiers',
    level: '5',
    label: 'Portefeuille chantiers',
    target: { type: 'route', href: '/maitre-ouvrage/chantiers' },
    children: [
      {
        id: 'chantiers-critiques',
        level: '5.1',
        label: 'Chantiers critiques',
        target: { type: 'route', href: '/maitre-ouvrage/chantiers' },
        children: [
          { id: 'chantiers-critiques-phase4', level: '5.1.1', label: 'Phase 4', target: { type: 'route', href: '/maitre-ouvrage/chantiers' } },
          { id: 'chantiers-critiques-retard', level: '5.1.2', label: 'En retard', target: { type: 'route', href: '/maitre-ouvrage/chantiers' } },
        ],
      },
      { id: 'chantiers-vue', level: '5.2', label: "Vue d'ensemble", target: { type: 'route', href: '/maitre-ouvrage/chantiers' } },
      { id: 'chantiers-analyse', level: '5.3', label: 'Analyse portefeuille', target: { type: 'route', href: '/maitre-ouvrage/chantiers' } },
    ],
  },
  {
    id: 'activite',
    level: '6',
    label: 'Activité & décisions',
    target: { type: 'dashboard', main: 'pilotage', sub: 'gouvernance' },
    children: [
      { id: 'activite-recente', level: '6.1', label: 'Activité récente', target: { type: 'dashboard', main: 'pilotage', sub: 'gouvernance' } },
      {
        id: 'activite-decisions',
        level: '6.2',
        label: 'Décisions en attente',
        target: { type: 'dashboard', main: 'pilotage', sub: 'gouvernance', leaf: 'decisions' },
        children: [
          { id: 'activite-decisions-arbitrage', level: '6.2.1', label: 'Arbitrages', target: { type: 'dashboard', main: 'pilotage', sub: 'gouvernance', leaf: 'decisions' } },
          { id: 'activite-decisions-litiges', level: '6.2.2', label: 'Litiges', target: { type: 'dashboard', main: 'pilotage', sub: 'gouvernance', leaf: 'decisions' } },
        ],
      },
      { id: 'activite-historique', level: '6.3', label: 'Historique décisions', target: { type: 'dashboard', main: 'pilotage', sub: 'gouvernance' } },
    ],
  },
  { id: 'alertes', level: '7', label: "Centre d'alertes", target: { type: 'dashboard', main: 'pilotage', sub: 'alertes' } },
  { id: 'gouvernance', level: '8', label: 'Gouvernance & décisions', target: { type: 'dashboard', main: 'pilotage', sub: 'gouvernance' } },
  { id: 'calendrier', level: '9', label: 'Calendrier & échéances', target: { type: 'dashboard', main: 'pilotage', sub: 'calendrier' } },
  { id: 'analytics', level: '10', label: 'Analytics & rapports', target: { type: 'dashboard', main: 'pilotage', sub: 'analytics' } },
];
