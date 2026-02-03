/** Configuration du module Achats */
import type { ModuleConfig } from '@/lib/types/module.types';

export const achatsModuleConfig: ModuleConfig = {
  id: 'achats',
  name: 'Achats',
  layout: 'triple-pane',
  subSidebar: {
    sections: [
      { title: 'VUES', items: [
        { id: 'toutes', label: 'Toutes', icon: 'ShoppingCart' },
      ]},
    ],
  },
};
