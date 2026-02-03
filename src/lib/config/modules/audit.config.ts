/** Configuration du module Audit */
import type { ModuleConfig } from '@/lib/types/module.types';

export const auditModuleConfig: ModuleConfig = {
  id: 'audit',
  name: 'Audit',
  layout: 'triple-pane',
  subSidebar: {
    sections: [
      { title: 'VUES', items: [
        { id: 'toutes', label: 'Toutes', icon: 'ScrollText' },
      ]},
    ],
  },
};
