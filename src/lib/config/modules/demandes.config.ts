/**
 * Configuration du module Demandes (architecture Outlook-like)
 * Génération via npm run generate:module
 */
import type { ModuleConfig } from '@/lib/types/module.types';

export const demandesModuleConfig: ModuleConfig = {
  id: 'demandes',
  name: 'Demandes',
  layout: 'triple-pane',

  subSidebar: {
    sections: [
      {
        title: 'MES DEMANDES',
        items: [
          {
            id: 'toutes',
            label: 'Toutes mes demandes',
            icon: 'Inbox',
            badge: 0,
            route: '/maitre-ouvrage/demandes?folder=toutes',
          },
          {
            id: 'en-attente',
            label: 'En attente de validation',
            icon: 'Clock',
            badge: 0,
            color: '#F59E0B',
            route: '/maitre-ouvrage/demandes?folder=en-attente',
          },
          {
            id: 'approuvees',
            label: 'Approuvées',
            icon: 'CheckCircle',
            color: '#10B981',
            route: '/maitre-ouvrage/demandes?folder=approuvees',
          },
          {
            id: 'rejetees',
            label: 'Rejetées',
            icon: 'XCircle',
            color: '#EF4444',
            route: '/maitre-ouvrage/demandes?folder=rejetees',
          },
          {
            id: 'brouillons',
            label: 'Brouillons',
            icon: 'FileEdit',
            route: '/maitre-ouvrage/demandes?folder=brouillons',
          },
        ],
      },
      {
        title: 'TYPES DE DEMANDES',
        collapsible: true,
        defaultOpen: true,
        items: [
          {
            id: 'type-travaux',
            label: 'Demandes de travaux',
            icon: 'Hammer',
            color: '#3B82F6',
            badge: 0,
            route: '/maitre-ouvrage/demandes?type=travaux',
          },
          {
            id: 'type-budget',
            label: 'Demandes budgétaires',
            icon: 'DollarSign',
            color: '#10B981',
            badge: 0,
            route: '/maitre-ouvrage/demandes?type=budget',
          },
          {
            id: 'type-fourniture',
            label: 'Demandes de fournitures',
            icon: 'Package',
            color: '#8B5CF6',
            badge: 0,
            route: '/maitre-ouvrage/demandes?type=fourniture',
          },
          {
            id: 'type-personnel',
            label: 'Demandes RH',
            icon: 'Users',
            color: '#EC4899',
            badge: 0,
            route: '/maitre-ouvrage/demandes?type=personnel',
          },
          {
            id: 'type-modification',
            label: 'Demandes de modification',
            icon: 'FileEdit',
            color: '#F59E0B',
            badge: 0,
            route: '/maitre-ouvrage/demandes?type=modification',
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
            badge: 0,
            route: '/maitre-ouvrage/demandes?chantier=vdp2',
          },
          {
            id: 'chantier-imd',
            label: 'Immeuble Diamniadio',
            icon: 'Building2',
            badge: 0,
            route: '/maitre-ouvrage/demandes?chantier=imd',
          },
        ],
      },
    ],
  },

  quickActions: {
    primary: {
      id: 'create',
      label: 'Nouvelle demande',
      icon: 'Plus',
      variant: 'default',
      dropdown: [
        {
          id: 'travaux',
          label: 'Demande de travaux',
          icon: 'Hammer',
          description: 'Travaux supplémentaires ou modificatifs',
        },
        {
          id: 'budget',
          label: 'Demande budgétaire',
          icon: 'DollarSign',
          description: 'Déblocage ou ajustement budgétaire',
        },
        {
          id: 'fourniture',
          label: 'Demande de fournitures',
          icon: 'Package',
          description: 'Matériaux ou équipements',
        },
        {
          id: 'personnel',
          label: 'Demande RH',
          icon: 'Users',
          description: 'Recrutement ou affectation',
        },
        {
          id: 'modification',
          label: 'Demande de modification',
          icon: 'FileEdit',
          description: 'Modification de plans ou specs',
        },
      ],
    },
    secondary: [
      {
        id: 'valider',
        label: 'Valider',
        icon: 'Check',
        shortcut: 'Ctrl+V',
        variant: 'default',
        disabledWithoutSelection: true,
      },
      {
        id: 'rejeter',
        label: 'Rejeter',
        icon: 'X',
        shortcut: 'Ctrl+R',
        variant: 'destructive',
        disabledWithoutSelection: true,
        confirmDialog: true,
      },
      {
        id: 'transferer',
        label: 'Transférer',
        icon: 'Forward',
        disabledWithoutSelection: true,
      },
      {
        id: 'dupliquer',
        label: 'Dupliquer',
        icon: 'Copy',
        disabledWithoutSelection: true,
      },
      {
        id: 'exporter',
        label: 'Exporter',
        icon: 'Download',
        variant: 'default',
        dropdown: [
          { id: 'pdf', label: 'PDF', icon: 'FileText' },
          { id: 'excel', label: 'Excel', icon: 'FileSpreadsheet' },
          { id: 'csv', label: 'CSV', icon: 'File' },
        ],
      },
    ],
  },

  filterBar: {
    views: [
      {
        id: 'en-attente',
        label: 'En attente',
        badge: 0,
        color: 'orange',
      },
      {
        id: 'approuvees',
        label: 'Approuvées',
        badge: 0,
        color: 'green',
      },
      {
        id: 'rejetees',
        label: 'Rejetées',
        badge: 0,
        color: 'red',
      },
      {
        id: 'toutes',
        label: 'Toutes',
        badge: 0,
      },
    ],

    quickFilters: [
      {
        id: 'urgentes',
        icon: 'AlertCircle',
        label: 'Urgentes',
      },
      {
        id: 'ma-validation',
        icon: 'UserCheck',
        label: 'Ma validation requise',
      },
      {
        id: 'delai-court',
        icon: 'Clock',
        label: 'Délai court',
      },
      {
        id: 'impact-budget',
        icon: 'DollarSign',
        label: 'Impact budgétaire',
      },
      {
        id: 'documents',
        icon: 'Paperclip',
        label: 'Documents attachés',
      },
    ],

    sort: [
      { id: 'date', label: 'Date création', icon: 'Calendar' },
      { id: 'deadline', label: 'Date limite', icon: 'Clock' },
      { id: 'priorite', label: 'Priorité', icon: 'Flag' },
      { id: 'montant', label: 'Montant', icon: 'DollarSign' },
      { id: 'chantier', label: 'Chantier', icon: 'Building2' },
    ],
  },
};
