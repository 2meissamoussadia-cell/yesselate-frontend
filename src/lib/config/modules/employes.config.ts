/**
 * Configuration du module Employés
 */
import type { ModuleConfig } from '@/lib/types/module.types';

export const employesModuleConfig: ModuleConfig = {
  id: 'employes',
  name: 'Employés',
  layout: 'triple-pane',

  subSidebar: {
    sections: [
      {
        title: 'NAVIGATION',
        items: [
          { id: 'tous', label: 'Tous les employés', icon: 'Users', badge: 0 },
          { id: 'actifs', label: 'Actifs', icon: 'UserCheck', badge: 0 },
          { id: 'en-conges', label: 'En congés', icon: 'Calendar', badge: 0 },
          { id: 'en-mission', label: 'En mission', icon: 'Plane', badge: 0 },
        ],
      },
      {
        title: 'DÉPARTEMENTS',
        collapsible: true,
        defaultOpen: true,
        items: [
          { id: 'btp', label: 'BTP', icon: 'Hammer', badge: 0 },
          { id: 'finance', label: 'Finance', icon: 'DollarSign', badge: 0 },
          { id: 'rh', label: 'RH', icon: 'Users', badge: 0 },
          { id: 'it', label: 'IT', icon: 'Monitor', badge: 0 },
        ],
      },
    ],
  },

  filterBar: {
    views: [
      { id: 'tous', label: 'Tous', badge: 0 },
      { id: 'actifs', label: 'Actifs', badge: 0 },
      { id: 'en-conges', label: 'En congés', badge: 0 },
    ],
    sort: [
      { id: 'nom', label: 'Nom' },
      { id: 'date-embauche', label: 'Date embauche' },
      { id: 'departement', label: 'Département' },
    ],
  },
};
