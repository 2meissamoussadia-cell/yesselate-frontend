/** Configuration du module Engagements */
import type { ModuleConfig } from '@/lib/types/module.types';

export const engagementsModuleConfig: ModuleConfig = {
  id: 'engagements',
  name: 'Engagements',
  layout: 'two-pane',
  subSidebar: {
    sections: [
      { title: 'NAVIGATION', items: [
        { id: 'bc', label: 'Bons de commande', icon: 'FileText' },
        { id: 'factures', label: 'Factures', icon: 'Receipt' },
        { id: 'paiements', label: 'Paiements', icon: 'CreditCard' },
        { id: 'demandes', label: 'Demandes', icon: 'Inbox' },
      ]},
    ],
  },
};
