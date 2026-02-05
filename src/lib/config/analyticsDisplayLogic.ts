/**
 * Configuration des Logiques d'Affichage Analytics BTP
 * Définit ce qui s'affiche, quelles données sont chargées, quelles actions sont disponibles
 * pour chaque niveau de navigation et chaque interaction
 */

import type { AnalyticsDomain, AnalyticsModule, AnalyticsSubModule } from './analyticsBTPArchitecture';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

/** Configuration d'une source de données (utilisé par analyticsDataService) */
export interface DataSourceConfig {
  id: string;
  endpoint?: string;
  [key: string]: unknown;
}

export interface KPIDefinition {
  id: string;
  label: string;
  unit?: string;
  target?: number;
  apiEndpoint: string;
  calculation?: string;
  visualization?: 'number' | 'sparkline' | 'progress' | 'gauge';
  clickAction?: 'modal' | 'drill-down' | 'comparison';
}

export interface AlertDefinition {
  id: string;
  type: 'critical' | 'warning' | 'info' | 'opportunity';
  category: 'budget' | 'delay' | 'qse' | 'quality' | 'risk' | 'opportunity';
  apiEndpoint: string;
  displayRules: {
    showInList: boolean;
    showInHeader: boolean;
    showAsToast: boolean;
    priority: number;
  };
}

export interface ActionDefinition {
  id: string;
  label: string;
  icon?: string;
  type: 'analytical' | 'simulation' | 'comparison' | 'filtering' | 'reporting' | 'ia' | 'crud';
  modal?: string;
  apiEndpoint?: string;
  permissions?: string[];
  conditions?: (context: any) => boolean;
}

export interface ModalDefinition {
  id: string;
  title: string;
  size: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  components: string[];
  dataSources: string[];
  actions: string[];
}

export interface VisualizationDefinition {
  id: string;
  type: 'line' | 'bar' | 'pie' | 'donut' | 'radar' | 'heatmap' | 'scatter' | 'area' | 'timeline' | 'map';
  dataSource: string;
  config: Record<string, any>;
  interactions: {
    click?: 'drill-down' | 'modal' | 'filter';
    hover?: 'tooltip' | 'highlight';
    zoom?: boolean;
  };
}

export interface DisplayLogic {
  domainId: string;
  moduleId?: string;
  subModuleId?: string;
  
  // Affichage
  header: {
    title: string;
    description?: string;
    badges?: Array<{ label: string; value: any; color?: string }>;
    actions?: string[];
  };
  
  kpis: KPIDefinition[];
  alerts: AlertDefinition[];
  visualizations: VisualizationDefinition[];
  tables?: Array<{
    id: string;
    dataSource: string;
    columns: Array<{ key: string; label: string; sortable?: boolean; render?: string }>;
    actions?: string[];
  }>;
  cards?: Array<{
    id: string;
    dataSource: string;
    template: string;
    actions?: string[];
  }>;
  
  // Actions disponibles
  actions: ActionDefinition[];
  
  // Modales accessibles
  modals: ModalDefinition[];
  
  // Données à charger
  dataSources: Array<{
    id: string;
    endpoint: string;
    params?: Record<string, any>;
    cache?: {
      ttl: number;
      key: string;
    };
  }>;
  
  // Filtres applicables
  filters: Array<{
    id: string;
    type: 'temporal' | 'geographical' | 'hierarchical' | 'status' | 'custom';
    options?: any;
  }>;
}

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATIONS PAR DOMAINE
// ═══════════════════════════════════════════════════════════════════════════

export const displayLogicByDomain: Record<string, DisplayLogic> = {
  // Domaine : Chantiers
  'chantiers': {
    domainId: 'chantiers',
    header: {
      title: 'Gestion de Chantiers',
      description: 'Analyse complète des chantiers, lots, avancement et performance',
      badges: [
        { label: 'Chantiers actifs', value: 'dynamic', color: 'blue' },
        { label: 'En retard', value: 'dynamic', color: 'red' },
      ],
      actions: ['export', 'share', 'configure'],
    },
    kpis: [
      {
        id: 'chantiers-actifs',
        label: 'Chantiers actifs',
        unit: '',
        apiEndpoint: '/api/analytics/domains/chantiers/kpis/chantiers-actifs',
        visualization: 'number',
        clickAction: 'modal',
      },
      {
        id: 'ca-total',
        label: 'CA total',
        unit: 'FCFA',
        apiEndpoint: '/api/analytics/domains/chantiers/kpis/ca-total',
        visualization: 'number',
        clickAction: 'drill-down',
      },
      {
        id: 'marge-globale',
        label: 'Marge globale',
        unit: '%',
        target: 15,
        apiEndpoint: '/api/analytics/domains/chantiers/kpis/marge-globale',
        visualization: 'progress',
        clickAction: 'modal',
      },
      {
        id: 'taux-avancement',
        label: 'Taux d\'avancement moyen',
        unit: '%',
        target: 100,
        apiEndpoint: '/api/analytics/domains/chantiers/kpis/taux-avancement',
        visualization: 'gauge',
        clickAction: 'modal',
      },
    ],
    alerts: [
      {
        id: 'chantiers-retard',
        type: 'critical',
        category: 'delay',
        apiEndpoint: '/api/analytics/domains/chantiers/alerts/retard',
        displayRules: {
          showInList: true,
          showInHeader: true,
          showAsToast: true,
          priority: 1,
        },
      },
      {
        id: 'chantiers-risque',
        type: 'warning',
        category: 'risk',
        apiEndpoint: '/api/analytics/domains/chantiers/alerts/risque',
        displayRules: {
          showInList: true,
          showInHeader: true,
          showAsToast: false,
          priority: 2,
        },
      },
      {
        id: 'derives-budgetaires',
        type: 'warning',
        category: 'budget',
        apiEndpoint: '/api/analytics/domains/chantiers/alerts/derive-budgetaire',
        displayRules: {
          showInList: true,
          showInHeader: false,
          showAsToast: false,
          priority: 3,
        },
      },
    ],
    visualizations: [
      {
        id: 'evolution-chantiers',
        type: 'line',
        dataSource: 'chantiers-trends',
        config: {
          xAxis: 'date',
          yAxis: 'count',
          comparison: true,
        },
        interactions: {
          click: 'drill-down',
          hover: 'tooltip',
          zoom: true,
        },
      },
      {
        id: 'repartition-statuts',
        type: 'donut',
        dataSource: 'chantiers-status',
        config: {
          valueKey: 'count',
          labelKey: 'status',
        },
        interactions: {
          click: 'filter',
        },
      },
      {
        id: 'carte-geographique',
        type: 'map',
        dataSource: 'chantiers-geo',
        config: {
          latKey: 'latitude',
          lngKey: 'longitude',
          cluster: true,
        },
        interactions: {
          click: 'drill-down',
          hover: 'tooltip',
        },
      },
    ],
    tables: [
      {
        id: 'liste-chantiers',
        dataSource: 'chantiers-list',
        columns: [
          { key: 'nom', label: 'Nom', sortable: true },
          { key: 'statut', label: 'Statut', sortable: true },
          { key: 'avancement', label: 'Avancement', sortable: true },
          { key: 'budget', label: 'Budget', sortable: true },
          { key: 'realise', label: 'Réalisé', sortable: true },
          { key: 'marge', label: 'Marge', sortable: true },
          { key: 'responsable', label: 'Responsable', sortable: true },
        ],
        actions: ['view', 'edit', 'duplicate', 'archive'],
      },
    ],
    cards: [
      {
        id: 'carte-chantier',
        dataSource: 'chantiers-list',
        template: 'chantier-card',
        actions: ['view', 'edit', 'analyze'],
      },
    ],
    actions: [
      {
        id: 'nouveau-chantier',
        label: 'Nouveau chantier',
        type: 'crud',
        modal: 'create-chantier',
        permissions: ['chantiers:create'],
      },
      {
        id: 'analyse-comparative',
        label: 'Analyse comparative',
        type: 'comparison',
        modal: 'comparison-chantiers',
      },
      {
        id: 'export-complet',
        label: 'Export complet',
        type: 'reporting',
        apiEndpoint: '/api/analytics/domains/chantiers/export',
      },
      {
        id: 'simulation',
        label: 'Simulation',
        type: 'simulation',
        modal: 'simulation-chantiers',
      },
      {
        id: 'recommandations-ia',
        label: 'Recommandations IA',
        type: 'ia',
        modal: 'ia-recommendations',
      },
    ],
    modals: [
      {
        id: 'detail-chantier',
        title: 'Détail du chantier',
        size: 'xl',
        components: ['chantier-detail', 'chantier-kpis', 'chantier-timeline'],
        dataSources: ['chantier-detail', 'chantier-kpis', 'chantier-timeline'],
        actions: ['edit', 'duplicate', 'archive', 'export'],
      },
      {
        id: 'analyse-chantier',
        title: 'Analyse du chantier',
        size: 'lg',
        components: ['chantier-analysis', 'chantier-charts'],
        dataSources: ['chantier-analysis'],
        actions: ['export', 'share'],
      },
      {
        id: 'comparison-chantiers',
        title: 'Comparaison de chantiers',
        size: 'xl',
        components: ['comparison-matrix', 'comparison-charts'],
        dataSources: ['chantiers-comparison'],
        actions: ['export'],
      },
      {
        id: 'simulation-chantiers',
        title: 'Simulation',
        size: 'lg',
        components: ['simulation-params', 'simulation-results'],
        dataSources: ['simulation-data'],
        actions: ['save', 'export'],
      },
    ],
    dataSources: [
      {
        id: 'chantiers-summary',
        endpoint: '/api/analytics/domains/chantiers/summary',
        cache: { ttl: 300000, key: 'chantiers-summary' },
      },
      {
        id: 'chantiers-list',
        endpoint: '/api/analytics/domains/chantiers/list',
        cache: { ttl: 60000, key: 'chantiers-list' },
      },
      {
        id: 'chantiers-trends',
        endpoint: '/api/analytics/domains/chantiers/trends',
        cache: { ttl: 300000, key: 'chantiers-trends' },
      },
      {
        id: 'chantiers-alerts',
        endpoint: '/api/analytics/domains/chantiers/alerts',
        cache: { ttl: 30000, key: 'chantiers-alerts' },
      },
    ],
    filters: [
      { id: 'periode', type: 'temporal' },
      { id: 'statut', type: 'status', options: ['actif', 'en-cours', 'termine', 'archive'] },
      { id: 'geographie', type: 'geographical' },
      { id: 'responsable', type: 'custom' },
    ],
  },
  
  // Domaine : Financier
  'financier': {
    domainId: 'financier',
    header: {
      title: 'Gestion Financière',
      description: 'Analyse budgétaire, coûts, marges, trésorerie et facturation',
      badges: [
        { label: 'CA total', value: 'dynamic', color: 'green' },
        { label: 'Trésorerie', value: 'dynamic', color: 'blue' },
      ],
      actions: ['export', 'share', 'configure'],
    },
    kpis: [
      {
        id: 'ca-total',
        label: 'CA total',
        unit: 'FCFA',
        apiEndpoint: '/api/analytics/domains/financier/kpis/ca-total',
        visualization: 'number',
        clickAction: 'drill-down',
      },
      {
        id: 'tresorerie',
        label: 'Trésorerie',
        unit: 'FCFA',
        apiEndpoint: '/api/analytics/domains/financier/kpis/tresorerie',
        visualization: 'number',
        clickAction: 'modal',
      },
      {
        id: 'bfr',
        label: 'BFR',
        unit: 'FCFA',
        apiEndpoint: '/api/analytics/domains/financier/kpis/bfr',
        visualization: 'number',
        clickAction: 'modal',
      },
      {
        id: 'marge-globale',
        label: 'Marge globale',
        unit: '%',
        target: 15,
        apiEndpoint: '/api/analytics/domains/financier/kpis/marge-globale',
        visualization: 'progress',
        clickAction: 'modal',
      },
    ],
    alerts: [
      {
        id: 'tresorerie-critique',
        type: 'critical',
        category: 'budget',
        apiEndpoint: '/api/analytics/domains/financier/alerts/tresorerie-critique',
        displayRules: {
          showInList: true,
          showInHeader: true,
          showAsToast: true,
          priority: 1,
        },
      },
      {
        id: 'depassement-budgetaire',
        type: 'warning',
        category: 'budget',
        apiEndpoint: '/api/analytics/domains/financier/alerts/depassement-budgetaire',
        displayRules: {
          showInList: true,
          showInHeader: true,
          showAsToast: false,
          priority: 2,
        },
      },
    ],
    visualizations: [
      {
        id: 'evolution-ca',
        type: 'line',
        dataSource: 'financier-trends',
        config: {
          xAxis: 'date',
          yAxis: 'ca',
          comparison: true,
        },
        interactions: {
          click: 'drill-down',
          hover: 'tooltip',
        },
      },
      {
        id: 'repartition-couts',
        type: 'donut',
        dataSource: 'financier-couts',
        config: {
          valueKey: 'montant',
          labelKey: 'categorie',
        },
        interactions: {
          click: 'filter',
        },
      },
    ],
    actions: [
      {
        id: 'nouvelle-facture',
        label: 'Nouvelle facture',
        type: 'crud',
        modal: 'create-facture',
        permissions: ['financier:create'],
      },
      {
        id: 'nouveau-budget',
        label: 'Nouveau budget',
        type: 'crud',
        modal: 'create-budget',
        permissions: ['financier:create'],
      },
      {
        id: 'analyse-financiere',
        label: 'Analyse financière',
        type: 'analytical',
        modal: 'analyse-financiere',
      },
    ],
    modals: [
      {
        id: 'analyse-financiere',
        title: 'Analyse financière',
        size: 'xl',
        components: ['financial-analysis', 'financial-charts'],
        dataSources: ['financial-analysis'],
        actions: ['export', 'share'],
      },
    ],
    dataSources: [
      {
        id: 'financier-summary',
        endpoint: '/api/analytics/domains/financier/summary',
        cache: { ttl: 300000, key: 'financier-summary' },
      },
    ],
    filters: [
      { id: 'periode', type: 'temporal' },
      { id: 'centre-cout', type: 'hierarchical' },
      { id: 'type', type: 'custom' },
    ],
  },
  
  // Domaine : Ressources Humaines
  'ressources-humaines': {
    domainId: 'ressources-humaines',
    header: {
      title: 'Ressources Humaines',
      description: 'Analyse de la main d\'œuvre, absences, compétences et performance RH',
      badges: [
        { label: 'Effectif total', value: 'dynamic', color: 'blue' },
        { label: 'Taux d\'absentéisme', value: 'dynamic', color: 'amber' },
      ],
      actions: ['export', 'share', 'configure'],
    },
    kpis: [
      {
        id: 'effectif-total',
        label: 'Effectif total',
        unit: '',
        apiEndpoint: '/api/analytics/domains/ressources-humaines/kpis/effectif-total',
        visualization: 'number',
        clickAction: 'modal',
      },
      {
        id: 'heures-travaillees',
        label: 'Heures travaillées',
        unit: 'h',
        apiEndpoint: '/api/analytics/domains/ressources-humaines/kpis/heures-travaillees',
        visualization: 'number',
        clickAction: 'drill-down',
      },
      {
        id: 'couts-main-oeuvre',
        label: 'Coûts main d\'œuvre',
        unit: 'FCFA',
        apiEndpoint: '/api/analytics/domains/ressources-humaines/kpis/couts-main-oeuvre',
        visualization: 'number',
        clickAction: 'modal',
      },
      {
        id: 'taux-absenteisme',
        label: 'Taux d\'absentéisme',
        unit: '%',
        target: 5,
        apiEndpoint: '/api/analytics/domains/ressources-humaines/kpis/taux-absenteisme',
        visualization: 'gauge',
        clickAction: 'modal',
      },
    ],
    alerts: [
      {
        id: 'absenteisme-eleve',
        type: 'warning',
        category: 'risk',
        apiEndpoint: '/api/analytics/domains/ressources-humaines/alerts/absenteisme-eleve',
        displayRules: {
          showInList: true,
          showInHeader: true,
          showAsToast: false,
          priority: 2,
        },
      },
      {
        id: 'surcharge',
        type: 'warning',
        category: 'risk',
        apiEndpoint: '/api/analytics/domains/ressources-humaines/alerts/surcharge',
        displayRules: {
          showInList: true,
          showInHeader: false,
          showAsToast: false,
          priority: 3,
        },
      },
    ],
    visualizations: [
      {
        id: 'evolution-effectifs',
        type: 'line',
        dataSource: 'rh-trends',
        config: { xAxis: 'date', yAxis: 'effectif', comparison: true },
        interactions: { click: 'drill-down', hover: 'tooltip' },
      },
      {
        id: 'repartition-absences',
        type: 'donut',
        dataSource: 'rh-absences',
        config: { valueKey: 'count', labelKey: 'type' },
        interactions: { click: 'filter' },
      },
    ],
    actions: [
      {
        id: 'nouveau-personnel',
        label: 'Nouveau personnel',
        type: 'crud',
        modal: 'create-personnel',
        permissions: ['rh:create'],
      },
      {
        id: 'analyse-rh',
        label: 'Analyse RH',
        type: 'analytical',
        modal: 'analyse-rh',
      },
    ],
    modals: [
      {
        id: 'analyse-rh',
        title: 'Analyse RH',
        size: 'xl',
        components: ['rh-analysis', 'rh-charts'],
        dataSources: ['rh-analysis'],
        actions: ['export', 'share'],
      },
    ],
    dataSources: [
      {
        id: 'rh-summary',
        endpoint: '/api/analytics/domains/ressources-humaines/summary',
        cache: { ttl: 300000, key: 'rh-summary' },
      },
    ],
    filters: [
      { id: 'periode', type: 'temporal' },
      { id: 'equipe', type: 'hierarchical' },
      { id: 'statut', type: 'status' },
    ],
  },
  
  // Domaine : Sous-traitants
  'sous-traitants': {
    domainId: 'sous-traitants',
    header: {
      title: 'Sous-traitants',
      description: 'Performance, contrats et risques des sous-traitants',
      badges: [
        { label: 'Sous-traitants actifs', value: 'dynamic', color: 'blue' },
        { label: 'CA sous-traitance', value: 'dynamic', color: 'green' },
      ],
      actions: ['export', 'share', 'configure'],
    },
    kpis: [
      {
        id: 'nombre-sous-traitants',
        label: 'Nombre de sous-traitants',
        unit: '',
        apiEndpoint: '/api/analytics/domains/sous-traitants/kpis/nombre',
        visualization: 'number',
        clickAction: 'modal',
      },
      {
        id: 'ca-sous-traitance',
        label: 'CA sous-traitance',
        unit: 'FCFA',
        apiEndpoint: '/api/analytics/domains/sous-traitants/kpis/ca',
        visualization: 'number',
        clickAction: 'drill-down',
      },
      {
        id: 'performance-moyenne',
        label: 'Performance moyenne',
        unit: '%',
        target: 80,
        apiEndpoint: '/api/analytics/domains/sous-traitants/kpis/performance',
        visualization: 'gauge',
        clickAction: 'modal',
      },
      {
        id: 'taux-satisfaction',
        label: 'Taux de satisfaction',
        unit: '%',
        target: 90,
        apiEndpoint: '/api/analytics/domains/sous-traitants/kpis/satisfaction',
        visualization: 'gauge',
        clickAction: 'modal',
      },
    ],
    alerts: [
      {
        id: 'sous-traitants-retard',
        type: 'critical',
        category: 'delay',
        apiEndpoint: '/api/analytics/domains/sous-traitants/alerts/retard',
        displayRules: {
          showInList: true,
          showInHeader: true,
          showAsToast: true,
          priority: 1,
        },
      },
      {
        id: 'performance-faible',
        type: 'warning',
        category: 'quality',
        apiEndpoint: '/api/analytics/domains/sous-traitants/alerts/performance',
        displayRules: {
          showInList: true,
          showInHeader: true,
          showAsToast: false,
          priority: 2,
        },
      },
    ],
    visualizations: [
      {
        id: 'evolution-performance',
        type: 'line',
        dataSource: 'sous-traitants-performance',
        config: { xAxis: 'date', yAxis: 'performance', comparison: true },
        interactions: { click: 'drill-down', hover: 'tooltip' },
      },
      {
        id: 'repartition-performance',
        type: 'bar',
        dataSource: 'sous-traitants-repartition',
        config: { xAxis: 'sous-traitant', yAxis: 'score' },
        interactions: { click: 'drill-down', hover: 'tooltip' },
      },
    ],
    actions: [
      {
        id: 'nouveau-contrat',
        label: 'Nouveau contrat',
        type: 'crud',
        modal: 'create-contrat',
        permissions: ['sous-traitants:create'],
      },
      {
        id: 'analyse-performance',
        label: 'Analyse performance',
        type: 'analytical',
        modal: 'analyse-performance',
      },
    ],
    modals: [
      {
        id: 'analyse-performance',
        title: 'Analyse Performance',
        size: 'xl',
        components: ['performance-analysis', 'performance-charts'],
        dataSources: ['performance-analysis'],
        actions: ['export'],
      },
    ],
    dataSources: [
      {
        id: 'sous-traitants-summary',
        endpoint: '/api/analytics/domains/sous-traitants/summary',
        cache: { ttl: 300000, key: 'sous-traitants-summary' },
      },
    ],
    filters: [
      { id: 'periode', type: 'temporal' },
      { id: 'performance', type: 'custom' },
      { id: 'statut', type: 'status' },
    ],
  },
  
  // Domaine : Matériel
  'materiel': {
    domainId: 'materiel',
    header: {
      title: 'Matériel et Équipements',
      description: 'Utilisation, maintenance, location/achat et stocks',
      badges: [
        { label: 'Taux d\'utilisation', value: 'dynamic', color: 'blue' },
        { label: 'Disponibilité', value: 'dynamic', color: 'green' },
      ],
      actions: ['export', 'share', 'configure'],
    },
    kpis: [
      {
        id: 'taux-utilisation',
        label: 'Taux d\'utilisation',
        unit: '%',
        target: 75,
        apiEndpoint: '/api/analytics/domains/materiel/kpis/utilisation',
        visualization: 'gauge',
        clickAction: 'modal',
      },
      {
        id: 'couts-maintenance',
        label: 'Coûts maintenance',
        unit: 'FCFA',
        apiEndpoint: '/api/analytics/domains/materiel/kpis/maintenance',
        visualization: 'number',
        clickAction: 'drill-down',
      },
      {
        id: 'disponibilite',
        label: 'Disponibilité',
        unit: '%',
        target: 90,
        apiEndpoint: '/api/analytics/domains/materiel/kpis/disponibilite',
        visualization: 'gauge',
        clickAction: 'modal',
      },
      {
        id: 'roi-equipements',
        label: 'ROI équipements',
        unit: '%',
        apiEndpoint: '/api/analytics/domains/materiel/kpis/roi',
        visualization: 'number',
        clickAction: 'modal',
      },
    ],
    alerts: [
      {
        id: 'pannes',
        type: 'critical',
        category: 'risk',
        apiEndpoint: '/api/analytics/domains/materiel/alerts/pannes',
        displayRules: {
          showInList: true,
          showInHeader: true,
          showAsToast: true,
          priority: 1,
        },
      },
      {
        id: 'maintenance-due',
        type: 'warning',
        category: 'risk',
        apiEndpoint: '/api/analytics/domains/materiel/alerts/maintenance',
        displayRules: {
          showInList: true,
          showInHeader: true,
          showAsToast: false,
          priority: 2,
        },
      },
    ],
    visualizations: [
      {
        id: 'evolution-utilisation',
        type: 'area',
        dataSource: 'materiel-utilisation',
        config: { xAxis: 'date', yAxis: 'taux' },
        interactions: { click: 'drill-down', hover: 'tooltip' },
      },
      {
        id: 'repartition-equipements',
        type: 'donut',
        dataSource: 'materiel-repartition',
        config: { valueKey: 'count', labelKey: 'type' },
        interactions: { click: 'filter' },
      },
    ],
    actions: [
      {
        id: 'nouvel-equipement',
        label: 'Nouvel équipement',
        type: 'crud',
        modal: 'create-equipement',
        permissions: ['materiel:create'],
      },
      {
        id: 'planification-maintenance',
        label: 'Planification maintenance',
        type: 'crud',
        modal: 'planification-maintenance',
      },
    ],
    modals: [
      {
        id: 'analyse-materiel',
        title: 'Analyse Matériel',
        size: 'xl',
        components: ['materiel-analysis', 'materiel-charts'],
        dataSources: ['materiel-analysis'],
        actions: ['export', 'share'],
      },
    ],
    dataSources: [
      {
        id: 'materiel-summary',
        endpoint: '/api/analytics/domains/materiel/summary',
        cache: { ttl: 300000, key: 'materiel-summary' },
      },
    ],
    filters: [
      { id: 'periode', type: 'temporal' },
      { id: 'type-equipement', type: 'custom' },
      { id: 'statut', type: 'status' },
    ],
  },
  
  // Domaine : Commercial
  'commercial': {
    domainId: 'commercial',
    header: {
      title: 'Commercial et Appels d\'Offres',
      description: 'Pipeline commercial, appels d\'offres, clients et marchés',
      badges: [
        { label: 'Pipeline', value: 'dynamic', color: 'blue' },
        { label: 'Taux de conversion', value: 'dynamic', color: 'green' },
      ],
      actions: ['export', 'share', 'configure'],
    },
    kpis: [
      {
        id: 'pipeline-commercial',
        label: 'Pipeline commercial',
        unit: 'FCFA',
        apiEndpoint: '/api/analytics/domains/commercial/kpis/pipeline',
        visualization: 'number',
        clickAction: 'drill-down',
      },
      {
        id: 'taux-conversion',
        label: 'Taux de conversion',
        unit: '%',
        target: 30,
        apiEndpoint: '/api/analytics/domains/commercial/kpis/conversion',
        visualization: 'gauge',
        clickAction: 'modal',
      },
      {
        id: 'ca-previsionnel',
        label: 'CA prévisionnel',
        unit: 'FCFA',
        apiEndpoint: '/api/analytics/domains/commercial/kpis/ca-previsionnel',
        visualization: 'number',
        clickAction: 'modal',
      },
      {
        id: 'nombre-appels-offres',
        label: 'Nombre d\'appels d\'offres',
        unit: '',
        apiEndpoint: '/api/analytics/domains/commercial/kpis/appels-offres',
        visualization: 'number',
        clickAction: 'drill-down',
      },
    ],
    alerts: [
      {
        id: 'opportunites-risque',
        type: 'warning',
        category: 'risk',
        apiEndpoint: '/api/analytics/domains/commercial/alerts/opportunites-risque',
        displayRules: {
          showInList: true,
          showInHeader: true,
          showAsToast: false,
          priority: 2,
        },
      },
      {
        id: 'appels-offres-repondre',
        type: 'info',
        category: 'opportunity',
        apiEndpoint: '/api/analytics/domains/commercial/alerts/appels-offres',
        displayRules: {
          showInList: true,
          showInHeader: false,
          showAsToast: false,
          priority: 3,
        },
      },
    ],
    visualizations: [
      {
        id: 'evolution-pipeline',
        type: 'line',
        dataSource: 'commercial-pipeline',
        config: { xAxis: 'date', yAxis: 'montant', comparison: true },
        interactions: { click: 'drill-down', hover: 'tooltip' },
      },
      {
        id: 'repartition-pipeline',
        type: 'bar',
        dataSource: 'commercial-repartition',
        config: { xAxis: 'etape', yAxis: 'montant' },
        interactions: { click: 'filter', hover: 'tooltip' },
      },
    ],
    actions: [
      {
        id: 'nouveau-devis',
        label: 'Nouveau devis',
        type: 'crud',
        modal: 'create-devis',
        permissions: ['commercial:create'],
      },
      {
        id: 'nouvel-appel-offres',
        label: 'Nouvel appel d\'offres',
        type: 'crud',
        modal: 'create-appel-offres',
        permissions: ['commercial:create'],
      },
      {
        id: 'analyse-commerciale',
        label: 'Analyse commerciale',
        type: 'analytical',
        modal: 'analyse-commerciale',
      },
    ],
    modals: [
      {
        id: 'analyse-commerciale',
        title: 'Analyse Commerciale',
        size: 'xl',
        components: ['commercial-analysis', 'commercial-charts'],
        dataSources: ['commercial-analysis'],
        actions: ['export', 'share'],
      },
    ],
    dataSources: [
      {
        id: 'commercial-summary',
        endpoint: '/api/analytics/domains/commercial/summary',
        cache: { ttl: 300000, key: 'commercial-summary' },
      },
    ],
    filters: [
      { id: 'periode', type: 'temporal' },
      { id: 'etape', type: 'status' },
      { id: 'commercial', type: 'custom' },
    ],
  },
  
  // Domaine : QSE
  'qse': {
    domainId: 'qse',
    header: {
      title: 'Qualité, Sécurité, Environnement',
      description: 'Indicateurs qualité, sécurité, environnement et QSE intégré',
      badges: [
        { label: 'Incidents', value: 'dynamic', color: 'red' },
        { label: 'Non-conformités', value: 'dynamic', color: 'amber' },
      ],
      actions: ['export', 'share', 'configure'],
    },
    kpis: [
      {
        id: 'indicateurs-qualite',
        label: 'Indicateurs qualité',
        unit: '%',
        target: 95,
        apiEndpoint: '/api/analytics/domains/qse/kpis/qualite',
        visualization: 'gauge',
        clickAction: 'modal',
      },
      {
        id: 'indicateurs-securite',
        label: 'Indicateurs sécurité',
        unit: '%',
        target: 100,
        apiEndpoint: '/api/analytics/domains/qse/kpis/securite',
        visualization: 'gauge',
        clickAction: 'modal',
      },
      {
        id: 'indicateurs-environnement',
        label: 'Indicateurs environnement',
        unit: '%',
        target: 90,
        apiEndpoint: '/api/analytics/domains/qse/kpis/environnement',
        visualization: 'gauge',
        clickAction: 'modal',
      },
      {
        id: 'taux-incidents',
        label: 'Taux d\'incidents',
        unit: '',
        apiEndpoint: '/api/analytics/domains/qse/kpis/incidents',
        visualization: 'number',
        clickAction: 'drill-down',
      },
    ],
    alerts: [
      {
        id: 'incidents',
        type: 'critical',
        category: 'qse',
        apiEndpoint: '/api/analytics/domains/qse/alerts/incidents',
        displayRules: {
          showInList: true,
          showInHeader: true,
          showAsToast: true,
          priority: 1,
        },
      },
      {
        id: 'non-conformites',
        type: 'warning',
        category: 'quality',
        apiEndpoint: '/api/analytics/domains/qse/alerts/non-conformites',
        displayRules: {
          showInList: true,
          showInHeader: true,
          showAsToast: false,
          priority: 2,
        },
      },
    ],
    visualizations: [
      {
        id: 'evolution-qse',
        type: 'line',
        dataSource: 'qse-trends',
        config: { xAxis: 'date', yAxis: 'score' },
        interactions: { click: 'drill-down', hover: 'tooltip' },
      },
      {
        id: 'repartition-incidents',
        type: 'bar',
        dataSource: 'qse-incidents',
        config: { xAxis: 'type', yAxis: 'count' },
        interactions: { click: 'filter', hover: 'tooltip' },
      },
    ],
    actions: [
      {
        id: 'nouvel-incident',
        label: 'Nouvel incident',
        type: 'crud',
        modal: 'create-incident',
        permissions: ['qse:create'],
      },
      {
        id: 'nouvelle-non-conformite',
        label: 'Nouvelle non-conformité',
        type: 'crud',
        modal: 'create-non-conformite',
        permissions: ['qse:create'],
      },
      {
        id: 'analyse-qse',
        label: 'Analyse QSE',
        type: 'analytical',
        modal: 'analyse-qse',
      },
    ],
    modals: [
      {
        id: 'analyse-qse',
        title: 'Analyse QSE',
        size: 'xl',
        components: ['qse-analysis', 'qse-charts'],
        dataSources: ['qse-analysis'],
        actions: ['export', 'share'],
      },
    ],
    dataSources: [
      {
        id: 'qse-summary',
        endpoint: '/api/analytics/domains/qse/summary',
        cache: { ttl: 300000, key: 'qse-summary' },
      },
    ],
    filters: [
      { id: 'periode', type: 'temporal' },
      { id: 'type', type: 'custom' },
      { id: 'severite', type: 'status' },
    ],
  },
  
  // Domaine : Planification
  'planification': {
    domainId: 'planification',
    header: {
      title: 'Planification',
      description: 'Respect des délais, charge de travail, optimisation planning et chemin critique',
      badges: [
        { label: 'Respect délais', value: 'dynamic', color: 'green' },
        { label: 'Charge moyenne', value: 'dynamic', color: 'blue' },
      ],
      actions: ['export', 'share', 'configure'],
    },
    kpis: [
      {
        id: 'respect-delais',
        label: 'Respect des délais',
        unit: '%',
        target: 90,
        apiEndpoint: '/api/analytics/domains/planification/kpis/delais',
        visualization: 'gauge',
        clickAction: 'modal',
      },
      {
        id: 'charge-travail',
        label: 'Charge de travail',
        unit: '%',
        target: 80,
        apiEndpoint: '/api/analytics/domains/planification/kpis/charge',
        visualization: 'gauge',
        clickAction: 'modal',
      },
      {
        id: 'optimisation-planning',
        label: 'Optimisation planning',
        unit: '%',
        apiEndpoint: '/api/analytics/domains/planification/kpis/optimisation',
        visualization: 'number',
        clickAction: 'modal',
      },
      {
        id: 'chemin-critique',
        label: 'Chemin critique',
        unit: '',
        apiEndpoint: '/api/analytics/domains/planification/kpis/chemin-critique',
        visualization: 'number',
        clickAction: 'drill-down',
      },
    ],
    alerts: [
      {
        id: 'retards',
        type: 'critical',
        category: 'delay',
        apiEndpoint: '/api/analytics/domains/planification/alerts/retards',
        displayRules: {
          showInList: true,
          showInHeader: true,
          showAsToast: true,
          priority: 1,
        },
      },
      {
        id: 'surcharges',
        type: 'warning',
        category: 'risk',
        apiEndpoint: '/api/analytics/domains/planification/alerts/surcharges',
        displayRules: {
          showInList: true,
          showInHeader: true,
          showAsToast: false,
          priority: 2,
        },
      },
    ],
    visualizations: [
      {
        id: 'evolution-delais',
        type: 'line',
        dataSource: 'planification-delais',
        config: { xAxis: 'date', yAxis: 'taux' },
        interactions: { click: 'drill-down', hover: 'tooltip' },
      },
      {
        id: 'charge-ressources',
        type: 'bar',
        dataSource: 'planification-charge',
        config: { xAxis: 'ressource', yAxis: 'charge' },
        interactions: { click: 'drill-down', hover: 'tooltip' },
      },
    ],
    actions: [
      {
        id: 'nouveau-planning',
        label: 'Nouveau planning',
        type: 'crud',
        modal: 'create-planning',
        permissions: ['planification:create'],
      },
      {
        id: 'optimiser',
        label: 'Optimiser',
        type: 'simulation',
        modal: 'optimisation-planning',
      },
      {
        id: 'analyser',
        label: 'Analyser',
        type: 'analytical',
        modal: 'analyse-planification',
      },
    ],
    modals: [
      {
        id: 'analyse-planification',
        title: 'Analyse Planification',
        size: 'xl',
        components: ['planification-analysis', 'planification-charts'],
        dataSources: ['planification-analysis'],
        actions: ['export', 'share'],
      },
    ],
    dataSources: [
      {
        id: 'planification-summary',
        endpoint: '/api/analytics/domains/planification/summary',
        cache: { ttl: 300000, key: 'planification-summary' },
      },
    ],
    filters: [
      { id: 'periode', type: 'temporal' },
      { id: 'ressource', type: 'custom' },
      { id: 'statut', type: 'status' },
    ],
  },
  
  // Domaine : Multi-Agences
  'multi-agences': {
    domainId: 'multi-agences',
    header: {
      title: 'Multi-Agences',
      description: 'Performance par agence, consolidation, synergies et gouvernance',
      badges: [
        { label: 'Agences actives', value: 'dynamic', color: 'blue' },
        { label: 'Performance moyenne', value: 'dynamic', color: 'green' },
      ],
      actions: ['export', 'share', 'configure'],
    },
    kpis: [
      {
        id: 'performance-agence',
        label: 'Performance par agence',
        unit: '%',
        apiEndpoint: '/api/analytics/domains/multi-agences/kpis/performance',
        visualization: 'number',
        clickAction: 'drill-down',
      },
      {
        id: 'consolidation',
        label: 'Consolidation',
        unit: 'FCFA',
        apiEndpoint: '/api/analytics/domains/multi-agences/kpis/consolidation',
        visualization: 'number',
        clickAction: 'modal',
      },
      {
        id: 'synergies',
        label: 'Synergies',
        unit: '%',
        apiEndpoint: '/api/analytics/domains/multi-agences/kpis/synergies',
        visualization: 'gauge',
        clickAction: 'modal',
      },
      {
        id: 'gouvernance',
        label: 'Gouvernance',
        unit: '%',
        apiEndpoint: '/api/analytics/domains/multi-agences/kpis/gouvernance',
        visualization: 'gauge',
        clickAction: 'modal',
      },
    ],
    alerts: [
      {
        id: 'agences-sous-performantes',
        type: 'warning',
        category: 'risk',
        apiEndpoint: '/api/analytics/domains/multi-agences/alerts/sous-performance',
        displayRules: {
          showInList: true,
          showInHeader: true,
          showAsToast: false,
          priority: 2,
        },
      },
      {
        id: 'incoherences',
        type: 'warning',
        category: 'risk',
        apiEndpoint: '/api/analytics/domains/multi-agences/alerts/incoherences',
        displayRules: {
          showInList: true,
          showInHeader: false,
          showAsToast: false,
          priority: 3,
        },
      },
    ],
    visualizations: [
      {
        id: 'comparaison-agences',
        type: 'bar',
        dataSource: 'multi-agences-comparison',
        config: { xAxis: 'agence', yAxis: 'performance' },
        interactions: { click: 'drill-down', hover: 'tooltip' },
      },
      {
        id: 'consolidation-temporelle',
        type: 'area',
        dataSource: 'multi-agences-consolidation',
        config: { xAxis: 'date', yAxis: 'montant' },
        interactions: { click: 'drill-down', hover: 'tooltip' },
      },
    ],
    actions: [
      {
        id: 'analyse-comparative',
        label: 'Analyse comparative',
        type: 'comparison',
        modal: 'comparison-agences',
      },
      {
        id: 'consolidation',
        label: 'Consolidation',
        type: 'analytical',
        modal: 'consolidation',
      },
      {
        id: 'reporting',
        label: 'Reporting',
        type: 'reporting',
        modal: 'reporting-multi-agences',
      },
    ],
    modals: [
      {
        id: 'comparison-agences',
        title: 'Comparaison Agences',
        size: 'xl',
        components: ['comparison-matrix', 'comparison-charts'],
        dataSources: ['agences-comparison'],
        actions: ['export'],
      },
    ],
    dataSources: [
      {
        id: 'multi-agences-summary',
        endpoint: '/api/analytics/domains/multi-agences/summary',
        cache: { ttl: 300000, key: 'multi-agences-summary' },
      },
    ],
    filters: [
      { id: 'periode', type: 'temporal' },
      { id: 'agence', type: 'hierarchical' },
      { id: 'type', type: 'custom' },
    ],
  },
  
  // Domaine : Performance
  'performance': {
    domainId: 'performance',
    header: {
      title: 'Performance Opérationnelle',
      description: 'Tableaux de bord exécutifs, analyse prédictive et benchmarking',
      badges: [
        { label: 'Performance globale', value: 'dynamic', color: 'green' },
        { label: 'Rentabilité', value: 'dynamic', color: 'blue' },
      ],
      actions: ['export', 'share', 'configure'],
    },
    kpis: [
      {
        id: 'performance-globale',
        label: 'Performance globale',
        unit: '%',
        target: 85,
        apiEndpoint: '/api/analytics/domains/performance/kpis/globale',
        visualization: 'gauge',
        clickAction: 'modal',
      },
      {
        id: 'rentabilite',
        label: 'Rentabilité',
        unit: '%',
        target: 15,
        apiEndpoint: '/api/analytics/domains/performance/kpis/rentabilite',
        visualization: 'gauge',
        clickAction: 'modal',
      },
      {
        id: 'efficacite',
        label: 'Efficacité',
        unit: '%',
        apiEndpoint: '/api/analytics/domains/performance/kpis/efficacite',
        visualization: 'number',
        clickAction: 'modal',
      },
      {
        id: 'satisfaction',
        label: 'Satisfaction',
        unit: '%',
        target: 90,
        apiEndpoint: '/api/analytics/domains/performance/kpis/satisfaction',
        visualization: 'gauge',
        clickAction: 'modal',
      },
    ],
    alerts: [
      {
        id: 'performances-faibles',
        type: 'warning',
        category: 'risk',
        apiEndpoint: '/api/analytics/domains/performance/alerts/faibles',
        displayRules: {
          showInList: true,
          showInHeader: true,
          showAsToast: false,
          priority: 2,
        },
      },
      {
        id: 'risques-strategiques',
        type: 'critical',
        category: 'risk',
        apiEndpoint: '/api/analytics/domains/performance/alerts/strategiques',
        displayRules: {
          showInList: true,
          showInHeader: true,
          showAsToast: true,
          priority: 1,
        },
      },
    ],
    visualizations: [
      {
        id: 'evolution-performance',
        type: 'line',
        dataSource: 'performance-trends',
        config: { xAxis: 'date', yAxis: 'score', comparison: true },
        interactions: { click: 'drill-down', hover: 'tooltip' },
      },
      {
        id: 'radar-performance',
        type: 'radar',
        dataSource: 'performance-radar',
        config: { labelKey: 'critere', valueKey: 'score' },
        interactions: { hover: 'tooltip' },
      },
    ],
    actions: [
      {
        id: 'analyse-strategique',
        label: 'Analyse stratégique',
        type: 'analytical',
        modal: 'analyse-strategique',
      },
      {
        id: 'benchmarking',
        label: 'Benchmarking',
        type: 'comparison',
        modal: 'benchmarking',
      },
      {
        id: 'predictions',
        label: 'Prédictions',
        type: 'ia',
        modal: 'predictions',
      },
    ],
    modals: [
      {
        id: 'analyse-strategique',
        title: 'Analyse Stratégique',
        size: 'xl',
        components: ['strategic-analysis', 'strategic-charts'],
        dataSources: ['strategic-analysis'],
        actions: ['export', 'share'],
      },
    ],
    dataSources: [
      {
        id: 'performance-summary',
        endpoint: '/api/analytics/domains/performance/summary',
        cache: { ttl: 300000, key: 'performance-summary' },
      },
    ],
    filters: [
      { id: 'periode', type: 'temporal' },
      { id: 'segment', type: 'custom' },
      { id: 'type', type: 'custom' },
    ],
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Obtient la logique d'affichage pour un domaine
 */
export function getDisplayLogicForDomain(domainId: string): DisplayLogic | null {
  return displayLogicByDomain[domainId] || null;
}

/**
 * Obtient la logique d'affichage pour un module
 */
export function getDisplayLogicForModule(
  domainId: string,
  moduleId: string
): DisplayLogic | null {
  // Pour l'instant, retourner la logique du domaine
  // À étendre avec des logiques spécifiques par module
  return getDisplayLogicForDomain(domainId);
}

/**
 * Obtient les KPIs pour un contexte
 */
export function getKPIsForContext(
  domainId: string,
  moduleId?: string,
  subModuleId?: string
): KPIDefinition[] {
  const logic = getDisplayLogicForDomain(domainId);
  return logic?.kpis || [];
}

/**
 * Obtient les alertes pour un contexte
 */
export function getAlertsForContext(
  domainId: string,
  moduleId?: string,
  subModuleId?: string
): AlertDefinition[] {
  const logic = getDisplayLogicForDomain(domainId);
  return logic?.alerts || [];
}

/**
 * Obtient les actions disponibles pour un contexte
 */
export function getActionsForContext(
  domainId: string,
  moduleId?: string,
  subModuleId?: string,
  userPermissions?: string[]
): ActionDefinition[] {
  const logic = getDisplayLogicForDomain(domainId);
  if (!logic) return [];
  
  return logic.actions.filter((action) => {
    // Filtrer par permissions
    if (action.permissions && userPermissions) {
      return action.permissions.some((perm) => userPermissions.includes(perm));
    }
    return true;
  });
}

