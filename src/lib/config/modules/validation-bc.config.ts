/**
 * Configuration du module Validation BC
 */
import type { ModuleConfig } from '@/lib/types/module.types';

export const validationBcModuleConfig: ModuleConfig = {
  id: 'validation-bc',
  name: 'Validation BC',
  layout: 'triple-pane',

  subSidebar: {
    sections: [
      {
        title: 'STATUT',
        items: [
          { id: 'en-attente', label: 'En attente', icon: 'Clock', badge: 18 },
          { id: 'urgents', label: 'Urgents', icon: 'AlertCircle', badge: 5, color: '#ef4444' },
          { id: 'valides', label: 'Validés', icon: 'CheckCircle', badge: 89 },
          { id: 'rejetes', label: 'Rejetés', icon: 'XCircle', badge: 3 },
        ],
      },
      {
        title: 'TYPES',
        collapsible: true,
        items: [
          { id: 'bc', label: 'Bons de commande', icon: 'FileText' },
          { id: 'factures', label: 'Factures', icon: 'Receipt' },
          { id: 'avenants', label: 'Avenants', icon: 'FileEdit' },
        ],
      },
    ],
  },

  quickActions: {
    primary: { label: 'Nouveau BC', icon: 'Plus' },
    secondary: [
      { id: 'valider', label: 'Valider', icon: 'Check', disabledWithoutSelection: true },
      { id: 'rejeter', label: 'Rejeter', icon: 'X', disabledWithoutSelection: true },
    ],
  },

  filterBar: {
    views: [
      { id: 'urgents', label: 'Urgents', badge: 5, color: 'red' },
      { id: 'en-attente', label: 'En attente', badge: 18 },
      { id: 'toutes', label: 'Toutes' },
    ],
  },
};
