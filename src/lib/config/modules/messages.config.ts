/**
 * Configuration du module Messages
 */
import type { ModuleConfig } from '@/lib/types/module.types';

export const messagesModuleConfig: ModuleConfig = {
  id: 'messages',
  name: 'Messages',
  layout: 'triple-pane',

  subSidebar: {
    sections: [
      {
        title: 'DOSSIERS',
        items: [
          { id: 'inbox', label: 'Boîte de réception', icon: 'Inbox', systemType: 'inbox', badge: 3 },
          { id: 'sent', label: 'Éléments envoyés', icon: 'Send', systemType: 'sent' },
          { id: 'drafts', label: 'Brouillons', icon: 'FileEdit', systemType: 'drafts', badge: 1 },
          { id: 'trash', label: 'Éléments supprimés', icon: 'Trash2', systemType: 'trash' },
          { id: 'archive', label: 'Archive', icon: 'Archive', systemType: 'archive' },
        ],
      },
    ],
  },

  quickActions: {
    primary: { label: 'Nouveau message', icon: 'Mail' },
  },

  filterBar: {
    views: [
      { id: 'prioritaire', label: 'Prioritaire' },
      { id: 'autres', label: 'Autres' },
    ],
    quickFilters: [
      { id: 'unread', icon: 'Mail', label: 'Non lus' },
      { id: 'attachments', icon: 'Paperclip', label: 'Avec pièces jointes' },
    ],
  },
};
