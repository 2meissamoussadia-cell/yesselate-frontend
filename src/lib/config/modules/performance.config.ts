/** Configuration du module Performance */
import type { ModuleConfig } from '@/lib/types/module.types';

export const performanceModuleConfig: ModuleConfig = {
  id: 'performance',
  name: 'Performance',
  layout: 'triple-pane',
  subSidebar: {
    sections: [
      { title: 'VUES', items: [
        { id: 'toutes', label: 'Toutes', icon: 'Activity' },
        { id: 'retards', label: 'Retards', icon: 'Clock', badge: 0 },
      ]},
    ],
  },
};
