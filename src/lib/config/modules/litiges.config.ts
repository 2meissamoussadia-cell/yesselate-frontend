/**
 * Configuration du module Litiges
 */
import type { ModuleConfig } from '@/lib/types/module.types';

export const litigesModuleConfig: ModuleConfig = {
  id: 'litiges',
  name: 'Litiges',
  layout: 'triple-pane',

  subSidebar: {
    sections: [
      {
        title: 'NAVIGATION',
        items: [
          { id: 'tous', label: 'Tous les litiges', icon: 'Scale', badge: 0 },
          { id: 'actifs', label: 'Actifs', icon: 'AlertCircle', badge: 0 },
          { id: 'en-attente', label: 'En attente', icon: 'Clock', badge: 0 },
          { id: 'resolus', label: 'Résolus', icon: 'CheckCircle', badge: 0 },
        ],
      },
      {
        title: 'STATUT',
        collapsible: true,
        defaultOpen: true,
        items: [
          { id: 'ouvert', label: 'Ouverts', icon: 'FileText', badge: 0 },
          { id: 'en-cours', label: 'En cours', icon: 'RefreshCw', badge: 0 },
          { id: 'clos', label: 'Clos', icon: 'Archive', badge: 0 },
        ],
      },
    ],
  },

  filterBar: {
    views: [
      { id: 'tous', label: 'Tous', badge: 0 },
      { id: 'urgents', label: 'Urgents', badge: 0 },
      { id: 'en-audience', label: 'En audience', badge: 0 },
    ],
    sort: [
      { id: 'date', label: 'Date' },
      { id: 'montant', label: 'Montant' },
      { id: 'priorite', label: 'Priorité' },
    ],
  },
};
