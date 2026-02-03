/**
 * Configuration du module Gouvernance
 */
import type { ModuleConfig } from '@/lib/types/module.types';

export const governanceModuleConfig: ModuleConfig = {
  id: 'governance',
  name: 'Gouvernance',
  layout: 'triple-pane',

  subSidebar: {
    sections: [
      {
        title: 'VUES',
        items: [
          { id: 'arbitrages', label: 'Arbitrages', icon: 'Scale', badge: 7 },
          { id: 'decisions', label: 'Décisions', icon: 'Gavel' },
          { id: 'attention', label: 'Points d\'attention', icon: 'AlertTriangle', badge: 4 },
        ],
      },
      {
        title: 'ARBITRAGES',
        collapsible: true,
        items: [
          { id: 'en-attente', label: 'En attente', icon: 'Clock' },
          { id: 'decisions-validees', label: 'Décisions validées', icon: 'CheckCircle' },
          { id: 'historique', label: 'Historique', icon: 'History' },
        ],
      },
    ],
  },

  quickActions: {
    primary: { label: 'Nouvel arbitrage', icon: 'Plus' },
    secondary: [
      { id: 'valider', label: 'Valider', icon: 'Check', disabledWithoutSelection: true },
    ],
  },

  filterBar: {
    views: [
      { id: 'en-attente', label: 'En attente', badge: 7 },
      { id: 'toutes', label: 'Toutes' },
    ],
  },
};
