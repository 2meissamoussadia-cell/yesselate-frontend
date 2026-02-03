/** Configuration du module Journal */
import type { ModuleConfig } from '@/lib/types/module.types';

export const journalModuleConfig: ModuleConfig = {
  id: 'journal',
  name: 'Journal des actions',
  layout: 'triple-pane',
  subSidebar: {
    sections: [
      { title: 'CATÉGORIES', items: [
        { id: 'toutes', label: 'Toutes', icon: 'Database' },
      ]},
    ],
  },
};
