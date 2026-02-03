/**
 * Configuration du module Programmation
 */
import type { ModuleConfig } from '@/lib/types/module.types';

export const programmationModuleConfig: ModuleConfig = {
  id: 'programmation',
  name: 'Programmation',
  layout: 'triple-pane',

  subSidebar: {
    sections: [
      {
        title: 'DOSSIERS',
        items: [
          { id: 'tous', label: 'Toutes les programmations', icon: 'Inbox', badge: 0 },
          { id: 'actifs', label: 'Actifs', icon: 'Circle', badge: 0 },
          { id: 'archives', label: 'Archivés', icon: 'Archive' },
        ],
      },
    ],
  },

  quickActions: {
    primary: { label: 'Nouvelle programmation', icon: 'Plus' },
    secondary: [
      { id: 'edit', label: 'Modifier', icon: 'Edit', disabledWithoutSelection: true },
      { id: 'delete', label: 'Supprimer', icon: 'Trash2', disabledWithoutSelection: true },
    ],
  },

  filterBar: {
    views: [
      { id: 'tous', label: 'Tous', badge: 0 },
      { id: 'actifs', label: 'Actifs', badge: 0, color: 'blue' },
    ],
    quickFilters: [
      { id: 'recent', icon: 'Clock', label: 'Récents' },
    ],
    sort: [
      { id: 'date', label: 'Date', defaultOrder: 'desc' },
      { id: 'titre', label: 'Titre' },
    ],
  },
};
