/**
 * Configuration du module Gouvernance & Suivi (indicateurs pilotage)
 */
import type { ModuleConfig } from '@/lib/types/module.types';

export const governanceModuleConfig: ModuleConfig = {
  id: 'governance',
  name: 'Gouvernance & Suivi',
  layout: 'dashboard',

  subSidebar: {
    sections: [
      {
        title: 'TABLEAUX DE BORD',
        items: [
          {
            id: 'vue-generale',
            label: 'Vue générale',
            icon: 'LayoutDashboard',
            route: '/maitre-ouvrage/governance?view=generale',
          },
          {
            id: 'performance',
            label: 'Performance globale',
            icon: 'TrendingUp',
            route: '/maitre-ouvrage/governance?view=performance',
          },
          {
            id: 'budget',
            label: 'Suivi budgétaire',
            icon: 'DollarSign',
            route: '/maitre-ouvrage/governance?view=budget',
          },
          {
            id: 'planning',
            label: 'Suivi planning',
            icon: 'Calendar',
            route: '/maitre-ouvrage/governance?view=planning',
          },
          {
            id: 'qualite',
            label: 'Suivi qualité',
            icon: 'Award',
            route: '/maitre-ouvrage/governance?view=qualite',
          },
          {
            id: 'risques',
            label: 'Gestion des risques',
            icon: 'AlertTriangle',
            route: '/maitre-ouvrage/governance?view=risques',
          },
        ],
      },
      {
        title: 'INDICATEURS',
        collapsible: true,
        defaultOpen: true,
        items: [
          {
            id: 'kpi-critiques',
            label: 'KPI critiques',
            icon: 'Target',
            color: '#EF4444',
            badge: 0,
            route: '/maitre-ouvrage/governance?kpi=critiques',
          },
          {
            id: 'kpi-alerte',
            label: 'KPI en alerte',
            icon: 'AlertCircle',
            color: '#F59E0B',
            badge: 0,
            route: '/maitre-ouvrage/governance?kpi=alerte',
          },
          {
            id: 'kpi-ok',
            label: 'KPI conformes',
            icon: 'CheckCircle',
            color: '#10B981',
            badge: 0,
            route: '/maitre-ouvrage/governance?kpi=ok',
          },
        ],
      },
      {
        title: 'RAPPORTS',
        collapsible: true,
        defaultOpen: false,
        items: [
          {
            id: 'rapport-mensuel',
            label: 'Rapports mensuels',
            icon: 'FileText',
            route: '/maitre-ouvrage/governance?rapport=mensuel',
          },
          {
            id: 'rapport-trimestriel',
            label: 'Rapports trimestriels',
            icon: 'FileBarChart',
            route: '/maitre-ouvrage/governance?rapport=trimestriel',
          },
          {
            id: 'rapport-comite',
            label: 'Rapports comité',
            icon: 'FileCheck',
            route: '/maitre-ouvrage/governance?rapport=comite',
          },
        ],
      },
      {
        title: 'CHANTIERS',
        collapsible: true,
        defaultOpen: false,
        items: [
          {
            id: 'chantier-vdp2',
            label: 'Villa Dakar Phase 2',
            icon: 'Building2',
            route: '/maitre-ouvrage/governance?chantier=vdp2',
          },
          {
            id: 'chantier-imd',
            label: 'Immeuble Diamniadio',
            icon: 'Building2',
            route: '/maitre-ouvrage/governance?chantier=imd',
          },
        ],
      },
    ],
  },

  quickActions: {
    primary: {
      id: 'create-rapport',
      label: 'Nouveau rapport',
      icon: 'Plus',
      variant: 'default',
      dropdown: [
        {
          id: 'rapport-hebdo',
          label: 'Rapport hebdomadaire',
          icon: 'Calendar',
        },
        {
          id: 'rapport-mensuel',
          label: 'Rapport mensuel',
          icon: 'CalendarDays',
        },
        {
          id: 'rapport-comite',
          label: 'Rapport comité',
          icon: 'Users',
        },
        {
          id: 'rapport-custom',
          label: 'Rapport personnalisé',
          icon: 'FileEdit',
        },
      ],
    },
    secondary: [
      {
        id: 'export-excel',
        label: 'Exporter Excel',
        icon: 'FileSpreadsheet',
      },
      {
        id: 'export-pdf',
        label: 'Exporter PDF',
        icon: 'FileText',
      },
      {
        id: 'print',
        label: 'Imprimer',
        icon: 'Printer',
      },
      {
        id: 'share',
        label: 'Partager',
        icon: 'Share2',
      },
      {
        id: 'schedule',
        label: 'Planifier envoi',
        icon: 'Clock',
      },
    ],
  },

  filterBar: {
    views: [
      {
        id: 'generale',
        label: 'Vue générale',
      },
      {
        id: 'performance',
        label: 'Performance',
        color: 'blue',
      },
      {
        id: 'budget',
        label: 'Budget',
        color: 'green',
      },
      {
        id: 'planning',
        label: 'Planning',
        color: 'orange',
      },
    ],

    quickFilters: [
      {
        id: 'kpi-critiques',
        icon: 'AlertTriangle',
        label: 'KPI critiques',
      },
      {
        id: 'ecarts-budget',
        icon: 'DollarSign',
        label: 'Écarts budget',
      },
      {
        id: 'retards-planning',
        icon: 'Clock',
        label: 'Retards planning',
      },
      {
        id: 'nc-qualite',
        icon: 'XCircle',
        label: 'NC Qualité',
      },
    ],

    sort: [
      { id: 'criticite', label: 'Criticité', icon: 'AlertTriangle' },
      { id: 'chantier', label: 'Chantier', icon: 'Building2' },
      { id: 'date', label: 'Date', icon: 'Calendar' },
    ],
  },
};
