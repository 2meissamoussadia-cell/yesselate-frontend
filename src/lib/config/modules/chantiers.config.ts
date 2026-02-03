/**
 * Configuration du module Chantiers
 */
import type { ModuleConfig } from '@/lib/types/module.types';

export const chantiersModuleConfig: ModuleConfig = {
  id: 'chantiers',
  name: 'Chantiers',
  layout: 'triple-pane',

  subSidebar: {
    sections: [
      {
        title: 'MES CHANTIERS',
        items: [
          {
            id: 'tous',
            label: 'Tous les chantiers',
            icon: 'Building2',
            badge: 0,
            route: '/maitre-ouvrage/chantiers?folder=tous',
          },
          {
            id: 'en-cours',
            label: 'En cours',
            icon: 'PlayCircle',
            badge: 0,
            color: '#3B82F6',
            route: '/maitre-ouvrage/chantiers?folder=en-cours',
          },
          {
            id: 'en-retard',
            label: 'En retard',
            icon: 'Clock',
            badge: 0,
            color: '#EF4444',
            route: '/maitre-ouvrage/chantiers?folder=en-retard',
          },
          {
            id: 'suspendus',
            label: 'Suspendus',
            icon: 'PauseCircle',
            color: '#F59E0B',
            route: '/maitre-ouvrage/chantiers?folder=suspendus',
          },
          {
            id: 'termines',
            label: 'Terminés',
            icon: 'CheckCircle',
            color: '#10B981',
            route: '/maitre-ouvrage/chantiers?folder=termines',
          },
        ],
      },
      {
        title: 'PAR PHASE',
        collapsible: true,
        defaultOpen: true,
        items: [
          {
            id: 'phase-etude',
            label: 'Études',
            icon: 'FileSearch',
            badge: 0,
            route: '/maitre-ouvrage/chantiers?phase=etude',
          },
          {
            id: 'phase-preparation',
            label: 'Préparation',
            icon: 'ClipboardList',
            badge: 0,
            route: '/maitre-ouvrage/chantiers?phase=preparation',
          },
          {
            id: 'phase-gros-oeuvre',
            label: 'Gros œuvre',
            icon: 'HardHat',
            badge: 0,
            route: '/maitre-ouvrage/chantiers?phase=gros-oeuvre',
          },
          {
            id: 'phase-second-oeuvre',
            label: 'Second œuvre',
            icon: 'Hammer',
            badge: 0,
            route: '/maitre-ouvrage/chantiers?phase=second-oeuvre',
          },
          {
            id: 'phase-finitions',
            label: 'Finitions',
            icon: 'Paintbrush',
            badge: 0,
            route: '/maitre-ouvrage/chantiers?phase=finitions',
          },
          {
            id: 'phase-reception',
            label: 'Réception',
            icon: 'ClipboardCheck',
            badge: 0,
            route: '/maitre-ouvrage/chantiers?phase=reception',
          },
        ],
      },
      {
        title: 'PAR LOCALISATION',
        collapsible: true,
        defaultOpen: false,
        items: [
          {
            id: 'dakar',
            label: 'Dakar',
            icon: 'MapPin',
            badge: 0,
            route: '/maitre-ouvrage/chantiers?location=dakar',
          },
          {
            id: 'diamniadio',
            label: 'Diamniadio',
            icon: 'MapPin',
            badge: 0,
            route: '/maitre-ouvrage/chantiers?location=diamniadio',
          },
          {
            id: 'thies',
            label: 'Thiès',
            icon: 'MapPin',
            badge: 0,
            route: '/maitre-ouvrage/chantiers?location=thies',
          },
        ],
      },
      {
        title: 'PERFORMANCE',
        collapsible: true,
        defaultOpen: false,
        items: [
          {
            id: 'perf-excellente',
            label: 'Excellente (>90%)',
            icon: 'TrendingUp',
            color: '#10B981',
            badge: 0,
            route: '/maitre-ouvrage/chantiers?performance=excellente',
          },
          {
            id: 'perf-bonne',
            label: 'Bonne (70-90%)',
            icon: 'Minus',
            color: '#3B82F6',
            badge: 0,
            route: '/maitre-ouvrage/chantiers?performance=bonne',
          },
          {
            id: 'perf-risque',
            label: 'À risque (<70%)',
            icon: 'TrendingDown',
            color: '#EF4444',
            badge: 0,
            route: '/maitre-ouvrage/chantiers?performance=risque',
          },
        ],
      },
    ],
  },

  quickActions: {
    primary: {
      id: 'create',
      label: 'Nouveau chantier',
      icon: 'Plus',
      variant: 'default',
    },
    secondary: [
      {
        id: 'rapport',
        label: 'Générer rapport',
        icon: 'FileText',
        disabledWithoutSelection: true,
      },
      {
        id: 'planning',
        label: 'Voir planning',
        icon: 'Calendar',
        disabledWithoutSelection: true,
      },
      {
        id: 'budget',
        label: 'Suivi budget',
        icon: 'DollarSign',
        disabledWithoutSelection: true,
      },
      {
        id: 'equipe',
        label: 'Gérer équipe',
        icon: 'Users',
        disabledWithoutSelection: true,
      },
      {
        id: 'export',
        label: 'Exporter',
        icon: 'Download',
        dropdown: [
          { id: 'pdf', label: 'Fiche chantier PDF', icon: 'FileText' },
          { id: 'excel', label: 'Données Excel', icon: 'FileSpreadsheet' },
        ],
      },
    ],
  },

  filterBar: {
    views: [
      {
        id: 'en-cours',
        label: 'En cours',
        badge: 0,
        color: 'blue',
      },
      {
        id: 'en-retard',
        label: 'En retard',
        badge: 0,
        color: 'red',
      },
      {
        id: 'tous',
        label: 'Tous',
        badge: 0,
      },
    ],

    quickFilters: [
      {
        id: 'retard-planning',
        icon: 'Clock',
        label: 'Retard planning',
      },
      {
        id: 'depassement-budget',
        icon: 'DollarSign',
        label: 'Dépassement budget',
      },
      {
        id: 'nc-qualite',
        icon: 'AlertTriangle',
        label: 'NC Qualité',
      },
      {
        id: 'incident-securite',
        icon: 'Shield',
        label: 'Incident sécurité',
      },
    ],

    sort: [
      { id: 'date-debut', label: 'Date début', icon: 'Calendar' },
      { id: 'avancement', label: 'Avancement', icon: 'TrendingUp' },
      { id: 'budget', label: 'Budget', icon: 'DollarSign' },
      { id: 'nom', label: 'Nom', icon: 'Type' },
    ],
  },
};
