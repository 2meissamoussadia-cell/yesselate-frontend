/** Configuration du module Chantiers */
import type { ModuleConfig } from '@/lib/types/module.types';

export const chantiersModuleConfig: ModuleConfig = {
  id: 'chantiers',
  name: 'Chantiers',
  layout: 'two-pane',
  subSidebar: {
    sections: [
      { title: 'NAVIGATION', items: [
        { id: 'liste', label: 'Liste', icon: 'List' },
        { id: 'carte', label: 'Carte', icon: 'Map' },
        { id: 'planning', label: 'Planning', icon: 'Calendar' },
        { id: 'programmes', label: 'Programmes', icon: 'FolderKanban' },
      ]},
    ],
  },
};
