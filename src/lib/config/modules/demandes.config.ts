/**
 * Configuration du module Demandes
 */
import type { ModuleConfig } from '@/lib/types/module.types';

export const demandesModuleConfig: ModuleConfig = {
  id: 'demandes',
  name: 'Demandes',
  layout: 'triple-pane',

  subSidebar: {
    sections: [
      {
        title: 'ÉTATS',
        items: [
          { id: 'en-cours', label: 'En cours', icon: 'Inbox', badge: 24 },
          { id: 'validees', label: 'Validées', icon: 'CheckCircle', badge: 156 },
          { id: 'rejetees', label: 'Rejetées', icon: 'XCircle', badge: 12 },
          { id: 'a-surveiller', label: 'À surveiller', icon: 'Eye', badge: 8 },
        ],
      },
    ],
  },

  quickActions: {
    primary: { label: 'Nouvelle demande', icon: 'Plus' },
    secondary: [
      { id: 'valider', label: 'Valider', icon: 'Check', disabledWithoutSelection: true },
      { id: 'rejeter', label: 'Rejeter', icon: 'X', disabledWithoutSelection: true },
    ],
  },

  filterBar: {
    views: [
      { id: 'en-attente-moi', label: 'En attente de moi', badge: 5 },
      { id: 'toutes', label: 'Toutes' },
      { id: 'cloturees', label: 'Clôturées' },
    ],
    quickFilters: [
      { id: 'en-retard', icon: 'Clock', label: 'En retard' },
      { id: 'montant-eleve', icon: 'DollarSign', label: '> 10k€' },
    ],
  },
};
