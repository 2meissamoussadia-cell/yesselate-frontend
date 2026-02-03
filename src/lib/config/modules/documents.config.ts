/** Configuration du module Documents */
import type { ModuleConfig } from '@/lib/types/module.types';

export const documentsModuleConfig: ModuleConfig = {
  id: 'documents',
  name: 'Documents',
  layout: 'two-pane',
  subSidebar: {
    sections: [
      { title: 'DOSSIERS', items: [
        { id: 'tous', label: 'Tous les documents', icon: 'FolderOpen' },
        { id: 'avenants', label: 'Avenants', icon: 'FileEdit' },
      ]},
    ],
  },
};
