/**
 * Configuration du module Dashboard (page d'accueil BMO)
 */
import type { ModuleConfig } from '@/lib/types/module.types';

export const dashboardModuleConfig: ModuleConfig = {
  id: 'dashboard',
  name: 'Tableau de bord',
  layout: 'dashboard',

  subSidebar: {
    sections: [
      {
        title: 'VUE',
        items: [
          { id: 'vue-generale', label: 'Vue générale', icon: 'LayoutDashboard', route: '/maitre-ouvrage' },
          { id: 'performance', label: 'Performance', icon: 'TrendingUp', route: '/maitre-ouvrage?section=performance' },
        ],
      },
    ],
  },
};
