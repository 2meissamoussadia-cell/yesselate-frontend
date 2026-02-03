/**
 * Configuration du module Centre d'alertes
 */
import type { ModuleConfig } from '@/lib/types/module.types';

export const alertsModuleConfig: ModuleConfig = {
  id: 'alerts',
  name: "Centre d'alertes",
  layout: 'triple-pane',

  subSidebar: {
    sections: [
      {
        title: 'DOSSIERS',
        items: [
          { id: 'toutes', label: "Toutes les alertes", icon: 'Inbox', badge: 47 },
          { id: 'critiques', label: 'Critiques', icon: 'AlertCircle', badge: 8, color: '#ef4444' },
          { id: 'importantes', label: 'Importantes', icon: 'AlertTriangle', badge: 12, color: '#f97316' },
          { id: 'en-attente', label: 'En attente', icon: 'Clock', badge: 15 },
        ],
      },
      {
        title: 'CATÉGORIES',
        collapsible: true,
        defaultOpen: true,
        items: [
          { id: 'technique', label: 'Technique', icon: 'Wrench', color: '#3B82F6', badge: 15 },
          { id: 'planning', label: 'Planning', icon: 'Calendar', color: '#f59e0b', badge: 12 },
          { id: 'qualite', label: 'Qualité', icon: 'CheckCircle', color: '#10b981', badge: 8 },
          { id: 'securite', label: 'Sécurité', icon: 'Shield', color: '#ef4444', badge: 5 },
          { id: 'financier', label: 'Financier', icon: 'DollarSign', color: '#8b5cf6', badge: 7 },
        ],
      },
    ],
  },

  quickActions: {
    primary: {
      label: 'Nouvelle alerte',
      icon: 'Plus',
      dropdown: [
        { id: 'technique', label: 'Alerte technique', icon: 'Wrench' },
        { id: 'budget', label: 'Alerte budget', icon: 'DollarSign' },
      ],
    },
    secondary: [
      { id: 'traiter', label: 'Traiter', icon: 'Check', shortcut: 'Ctrl+T', disabledWithoutSelection: true },
      { id: 'assigner', label: 'Assigner', icon: 'UserPlus', shortcut: 'Ctrl+A', disabledWithoutSelection: true },
    ],
  },

  filterBar: {
    views: [
      { id: 'critiques', label: 'Critiques', badge: 12, color: 'red' },
      { id: 'toutes', label: 'Toutes', badge: 89 },
    ],
    quickFilters: [
      { id: 'non-traitee', icon: 'Circle', label: 'Non traitées' },
      { id: 'en-retard', icon: 'Clock', label: 'En retard' },
    ],
    sort: [
      { id: 'date', label: 'Date création' },
      { id: 'echeance', label: 'Échéance' },
    ],
  },
};
