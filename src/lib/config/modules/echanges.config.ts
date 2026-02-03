/** Configuration du module Échanges */
import type { ModuleConfig } from '@/lib/types/module.types';

export const echangesModuleConfig: ModuleConfig = {
  id: 'echanges',
  name: 'Échanges inter-structures',
  layout: 'triple-pane',
  subSidebar: {
    sections: [
      { title: 'ÉTATS', items: [
        { id: 'ouverts', label: 'Ouverts', icon: 'Inbox' },
        { id: 'resolus', label: 'Résolus', icon: 'CheckCircle' },
      ]},
    ],
  },
};
