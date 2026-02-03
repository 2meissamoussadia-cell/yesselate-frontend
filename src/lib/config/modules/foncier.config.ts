/** Configuration du module Foncier */
import type { ModuleConfig } from '@/lib/types/module.types';

export const foncierModuleConfig: ModuleConfig = {
  id: 'foncier',
  name: 'Foncier',
  layout: 'triple-pane',
  subSidebar: {
    sections: [
      { title: 'VUES', items: [
        { id: 'toutes', label: 'Toutes', icon: 'MapPin' },
      ]},
    ],
  },
};
