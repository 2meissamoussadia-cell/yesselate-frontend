/**
 * Configuration du module Validation BC (architecture Outlook-like)
 */
import type { ModuleConfig } from '@/lib/types/module.types';

export const validationBcModuleConfig: ModuleConfig = {
  id: 'validation-bc',
  name: 'Validation Bons de Commande',
  layout: 'triple-pane',

  subSidebar: {
    sections: [
      {
        title: 'VALIDATION',
        items: [
          {
            id: 'a-valider',
            label: 'À valider',
            icon: 'ClipboardCheck',
            badge: 0,
            color: '#F59E0B',
            route: '/maitre-ouvrage/validation-bc?folder=a-valider',
          },
          {
            id: 'ma-validation',
            label: 'Ma validation requise',
            icon: 'UserCheck',
            badge: 0,
            color: '#EF4444',
            route: '/maitre-ouvrage/validation-bc?folder=ma-validation',
          },
          {
            id: 'en-cours',
            label: 'En cours de validation',
            icon: 'Clock',
            badge: 0,
            color: '#3B82F6',
            route: '/maitre-ouvrage/validation-bc?folder=en-cours',
          },
          {
            id: 'valides',
            label: 'Validés',
            icon: 'CheckCircle2',
            color: '#10B981',
            route: '/maitre-ouvrage/validation-bc?folder=valides',
          },
          {
            id: 'rejetes',
            label: 'Rejetés',
            icon: 'XCircle',
            color: '#EF4444',
            route: '/maitre-ouvrage/validation-bc?folder=rejetes',
          },
          {
            id: 'tous',
            label: 'Tous les BC',
            icon: 'Inbox',
            route: '/maitre-ouvrage/validation-bc?folder=tous',
          },
        ],
      },
      {
        title: 'MONTANTS',
        collapsible: true,
        defaultOpen: true,
        items: [
          {
            id: 'montant-faible',
            label: '< 1M FCFA',
            icon: 'ChevronsDown',
            color: '#10B981',
            badge: 0,
            route: '/maitre-ouvrage/validation-bc?montant=faible',
          },
          {
            id: 'montant-moyen',
            label: '1M - 5M FCFA',
            icon: 'Minus',
            color: '#F59E0B',
            badge: 0,
            route: '/maitre-ouvrage/validation-bc?montant=moyen',
          },
          {
            id: 'montant-eleve',
            label: '> 5M FCFA',
            icon: 'ChevronsUp',
            color: '#EF4444',
            badge: 0,
            route: '/maitre-ouvrage/validation-bc?montant=eleve',
          },
        ],
      },
      {
        title: 'FOURNISSEURS',
        collapsible: true,
        defaultOpen: false,
        items: [
          {
            id: 'fournisseur-referencies',
            label: 'Fournisseurs référencés',
            icon: 'Star',
            color: '#10B981',
            badge: 0,
            route: '/maitre-ouvrage/validation-bc?fournisseur=referencie',
          },
          {
            id: 'fournisseur-nouveaux',
            label: 'Nouveaux fournisseurs',
            icon: 'UserPlus',
            color: '#F59E0B',
            badge: 0,
            route: '/maitre-ouvrage/validation-bc?fournisseur=nouveau',
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
            route: '/maitre-ouvrage/validation-bc?chantier=vdp2',
          },
          {
            id: 'chantier-imd',
            label: 'Immeuble Diamniadio',
            icon: 'Building2',
            badge: 0,
            route: '/maitre-ouvrage/validation-bc?chantier=imd',
          },
        ],
      },
    ],
  },

  quickActions: {
    primary: {
      id: 'create',
      label: 'Nouveau BC',
      icon: 'Plus',
      variant: 'default',
      dropdown: [
        {
          id: 'travaux',
          label: 'BC Travaux',
          icon: 'Hammer',
          description: "Main d'œuvre et prestations",
        },
        {
          id: 'fourniture',
          label: 'BC Fournitures',
          icon: 'Package',
          description: 'Matériaux et équipements',
        },
        {
          id: 'service',
          label: 'BC Services',
          icon: 'Briefcase',
          description: 'Prestations intellectuelles',
        },
        {
          id: 'location',
          label: 'BC Location',
          icon: 'Truck',
          description: 'Location matériel/engins',
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
        id: 'demander-modif',
        label: 'Demander modification',
        icon: 'Edit',
        disabledWithoutSelection: true,
      },
      {
        id: 'transferer',
        label: 'Transférer',
        icon: 'Forward',
        disabledWithoutSelection: true,
      },
      {
        id: 'comparer',
        label: 'Comparer',
        icon: 'ArrowLeftRight',
        disabledWithoutSelection: true,
      },
      {
        id: 'exporter',
        label: 'Exporter',
        icon: 'Download',
        dropdown: [
          { id: 'pdf', label: 'PDF', icon: 'FileText' },
          { id: 'excel', label: 'Excel', icon: 'FileSpreadsheet' },
        ],
      },
    ],
  },

  filterBar: {
    views: [
      {
        id: 'a-valider',
        label: 'À valider',
        badge: 0,
        color: 'orange',
      },
      {
        id: 'valides',
        label: 'Validés',
        badge: 0,
        color: 'green',
      },
      {
        id: 'rejetes',
        label: 'Rejetés',
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
        id: 'ma-validation',
        icon: 'UserCheck',
        label: 'Ma validation',
      },
      {
        id: 'urgent',
        icon: 'AlertCircle',
        label: 'Urgent',
      },
      {
        id: 'montant-eleve',
        icon: 'DollarSign',
        label: 'Montant élevé',
      },
      {
        id: 'nouveau-fournisseur',
        icon: 'UserPlus',
        label: 'Nouveau fournisseur',
      },
      {
        id: 'devis-multiple',
        icon: 'Files',
        label: 'Devis multiples',
      },
    ],

    sort: [
      { id: 'date', label: 'Date création', icon: 'Calendar' },
      { id: 'deadline', label: 'Date limite', icon: 'Clock' },
      { id: 'montant', label: 'Montant', icon: 'DollarSign' },
      { id: 'fournisseur', label: 'Fournisseur', icon: 'Building' },
      { id: 'chantier', label: 'Chantier', icon: 'Building2' },
    ],
  },
};
