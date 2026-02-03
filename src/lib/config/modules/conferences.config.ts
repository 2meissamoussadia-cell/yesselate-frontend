/** Configuration du module Conférences */
import type { ModuleConfig } from '@/lib/types/module.types';

export const conferencesModuleConfig: ModuleConfig = {
  id: 'conferences',
  name: 'Conférences',
  layout: 'calendar',
  subSidebar: {
    sections: [
      { title: 'VUES', items: [
        { id: 'calendrier', label: 'Calendrier', icon: 'Video' },
      ]},
    ],
  },
};
