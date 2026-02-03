/** Configuration du module Fournisseurs */
import type { ModuleConfig } from '@/lib/types/module.types';

export const fournisseursModuleConfig: ModuleConfig = {
  id: 'fournisseurs',
  name: 'Fournisseurs',
  layout: 'triple-pane',
  subSidebar: {
    sections: [
      { title: 'VUES', items: [
        { id: 'tous', label: 'Tous', icon: 'Building2' },
      ]},
    ],
  },
};
