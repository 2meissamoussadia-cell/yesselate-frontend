/**
 * Configuration du module Recouvrements
 */
import type { ModuleConfig } from '@/lib/types/module.types';

export const recouvrementsModuleConfig: ModuleConfig = {
  id: 'recouvrements',
  name: 'Recouvrements',
  layout: 'triple-pane',

  subSidebar: {
    sections: [
      {
        title: 'NAVIGATION',
        items: [
          { id: 'toutes', label: 'Toutes les créances', icon: 'DollarSign', badge: 0 },
          { id: 'en-attente', label: 'En attente', icon: 'Clock', badge: 0 },
          { id: 'en-cours', label: 'En cours', icon: 'RefreshCw', badge: 0 },
          { id: 'payees', label: 'Payées', icon: 'CheckCircle', badge: 0 },
        ],
      },
      {
        title: 'STATUT',
        collapsible: true,
        defaultOpen: true,
        items: [
          { id: 'en-retard', label: 'En retard', icon: 'AlertTriangle', badge: 0 },
          { id: 'litige', label: 'En litige', icon: 'Scale', badge: 0 },
          { id: 'irrecouvrable', label: 'Irrecouvrables', icon: 'XCircle', badge: 0 },
        ],
      },
    ],
  },

  filterBar: {
    views: [
      { id: 'toutes', label: 'Toutes', badge: 0 },
      { id: 'urgentes', label: 'Urgentes', badge: 0 },
      { id: 'en-retard', label: 'En retard', badge: 0 },
    ],
    sort: [
      { id: 'date', label: 'Date' },
      { id: 'montant', label: 'Montant' },
      { id: 'delai', label: 'Délai' },
    ],
  },
};
