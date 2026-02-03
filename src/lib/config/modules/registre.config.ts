/** Configuration du module Registre */
import type { ModuleConfig } from '@/lib/types/module.types';

export const registreModuleConfig: ModuleConfig = {
  id: 'registre',
  name: 'Registre des décisions',
  layout: 'triple-pane',
  subSidebar: {
    sections: [
      { title: 'VUES', items: [
        { id: 'toutes', label: 'Toutes', icon: 'BookOpen' },
      ]},
    ],
  },
};
