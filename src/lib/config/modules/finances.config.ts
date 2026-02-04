/**
 * Configuration du module Finances
 */
import type { ModuleConfig } from '@/lib/types/module.types';

export const financesModuleConfig: ModuleConfig = {
  id: 'finances',
  name: 'Finances',
  layout: 'triple-pane',

  subSidebar: {
    sections: [
      {
        title: 'NAVIGATION',
        items: [
          { id: 'toutes', label: 'Toutes les transactions', icon: 'Wallet', badge: 0 },
          { id: 'revenus', label: 'Revenus', icon: 'TrendingUp', badge: 0 },
          { id: 'depenses', label: 'Dépenses', icon: 'TrendingDown', badge: 0 },
          { id: 'en-attente', label: 'En attente', icon: 'Clock', badge: 0 },
        ],
      },
      {
        title: 'CATÉGORIES',
        collapsible: true,
        defaultOpen: true,
        items: [
          { id: 'factures', label: 'Factures', icon: 'Receipt', badge: 0 },
          { id: 'paiements', label: 'Paiements', icon: 'CreditCard', badge: 0 },
          { id: 'budgets', label: 'Budgets', icon: 'DollarSign', badge: 0 },
        ],
      },
    ],
  },

  filterBar: {
    views: [
      { id: 'toutes', label: 'Toutes', badge: 0 },
      { id: 'ce-mois', label: 'Ce mois', badge: 0 },
      { id: 'en-retard', label: 'En retard', badge: 0 },
    ],
    sort: [
      { id: 'date', label: 'Date' },
      { id: 'montant', label: 'Montant' },
      { id: 'statut', label: 'Statut' },
    ],
  },
};
