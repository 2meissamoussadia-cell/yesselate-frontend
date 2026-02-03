/** Configuration du module Maintenance */
import type { ModuleConfig } from '@/lib/types/module.types';

export const maintenanceModuleConfig: ModuleConfig = {
  id: 'maintenance',
  name: 'Maintenance',
  layout: 'triple-pane',
  subSidebar: {
    sections: [
      { title: 'VUES', items: [
        { id: 'toutes', label: 'Toutes', icon: 'Wrench' },
      ]},
    ],
  },
};
