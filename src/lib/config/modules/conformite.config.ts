/** Configuration du module Conformité */
import type { ModuleConfig } from '@/lib/types/module.types';

export const conformiteModuleConfig: ModuleConfig = {
  id: 'conformite',
  name: 'Conformité',
  layout: 'triple-pane',
  subSidebar: {
    sections: [
      { title: 'VUES', items: [
        { id: 'audit', label: 'Audit', icon: 'ShieldCheck' },
        { id: 'engagements', label: 'Engagements', icon: 'FileCheck' },
      ]},
    ],
  },
};
