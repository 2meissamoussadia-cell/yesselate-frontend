/** Configuration du module Opportunities */
import type { ModuleConfig } from '@/lib/types/module.types';

export const opportunitiesModuleConfig: ModuleConfig = {
  id: 'opportunities',
  name: 'Opportunités',
  layout: 'triple-pane',
  subSidebar: {
    sections: [
      { title: 'VUES', items: [
        { id: 'toutes', label: 'Toutes', icon: 'Lightbulb' },
        { id: 'actives', label: 'Actives', icon: 'Zap' },
      ]},
    ],
  },
};
