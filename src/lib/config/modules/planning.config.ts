/** Configuration du module Planning */
import type { ModuleConfig } from '@/lib/types/module.types';

export const planningModuleConfig: ModuleConfig = {
  id: 'planning',
  name: 'Planning',
  layout: 'calendar',
  subSidebar: {
    sections: [
      { title: 'VUES', items: [
        { id: 'agenda', label: 'Agenda', icon: 'Calendar' },
        { id: 'jalons', label: 'Jalons', icon: 'Flag' },
        { id: 'gantt', label: 'Gantt', icon: 'BarChart3' },
      ]},
    ],
  },
};
