'use client';

/**
 * Page pilote Outlook-like — Boîte de réception BMO / Messages.
 * Utilise OutlookLikeLayout + QuickActionsBar + FilterBar + SidebarFolders + MessageList + MessageDetailPanel + MessageListContextMenu.
 * Données mockées uniquement (pas d'API).
 * Responsabilité page : état (sélection dossier/message, vues, filtres, menu contextuel), callbacks, données (mocks puis API).
 */

import React, { useState, useMemo, useCallback } from 'react';
import { Mail, MailOpen, Archive, Trash2, ExternalLink } from 'lucide-react';
import { OutlookLikeLayout } from '@/components/bmo/layout';
import { QuickActionsBar, FilterBar, SidebarFolders } from '@/components/bmo/ui';
import {
  MessageList,
  MessageDetailPanel,
  MessageListContextMenu,
  type BmoMessage,
  type BmoFolder,
  type MessageListContextMenuAction,
} from '@/components/bmo/messages';

// ——— Données mockées ———

const MOCK_FOLDERS: BmoFolder[] = [
  { id: 'inbox', name: 'Boîte de réception', type: 'system', systemType: 'inbox', unreadCount: 3, order: 1 },
  { id: 'sent', name: 'Éléments envoyés', type: 'system', systemType: 'sent', unreadCount: 0, order: 2 },
  { id: 'drafts', name: 'Brouillons', type: 'system', systemType: 'drafts', unreadCount: 1, order: 3 },
  { id: 'trash', name: 'Éléments supprimés', type: 'system', systemType: 'trash', unreadCount: 0, order: 4 },
  { id: 'archive', name: 'Archive', type: 'system', systemType: 'archive', unreadCount: 0, order: 5 },
];

const MOCK_MESSAGES: BmoMessage[] = [
  {
    id: '1',
    from: { name: 'Ndeye Oumou THIOUNE', address: 'nthioune@example.com' },
    to: [{ name: 'MOA', address: 'moa@bmo.fr' }],
    subject: 'Demande distributeur',
    snippet: 'Bonjour Mr Diouf, Votre demande est bien prise en compte...',
    date: new Date('2024-03-28T10:30:00'),
    isRead: false,
    folderId: 'inbox',
    hasAttachments: false,
  },
  {
    id: '2',
    from: { name: 'BALANDIER Pauline (IEP)', address: 'pbalandier@unistra.fr' },
    to: [{ name: 'MOA', address: 'moa@bmo.fr' }],
    subject: 'Relance concours 4ème année de Sciences Po Strasbourg',
    snippet: 'Ne pas attendre le dernier délai pour transmettre vos candidatures.',
    date: new Date('2024-04-30T20:49:00'),
    isRead: true,
    folderId: 'inbox',
    hasAttachments: true,
  },
  {
    id: '3',
    from: { name: 'Direction Chantier Alpha', address: 'chantier-alpha@bmo.fr' },
    to: [{ name: 'MOA', address: 'moa@bmo.fr' }],
    subject: 'Point hebdo — Chantier Alpha',
    snippet: 'Avancement à 78 %. Délai tenu. Prochaine réunion le 15/05.',
    date: new Date('2024-05-02T09:00:00'),
    isRead: false,
    folderId: 'inbox',
    hasAttachments: true,
  },
];

type ContextMenuState = { item: BmoMessage; x: number; y: number } | null;

const CONTEXT_MENU_ACTIONS: MessageListContextMenuAction[] = [
  { id: 'mark-read', label: 'Marquer comme lu', icon: <MailOpen className="h-4 w-4" /> },
  { id: 'mark-unread', label: 'Marquer comme non lu', icon: <Mail className="h-4 w-4" /> },
  { id: 'archive', label: 'Archiver', icon: <Archive className="h-4 w-4" />, separatorAfter: true },
  { id: 'delete', label: 'Supprimer', icon: <Trash2 className="h-4 w-4" /> },
  { id: 'open-new-tab', label: 'Ouvrir dans un nouvel onglet', icon: <ExternalLink className="h-4 w-4" /> },
];

export default function MessagesPage() {
  const [selectedFolderId, setSelectedFolderId] = useState<string>('inbox');
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<string>('prioritaire');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [contextMenu, setContextMenu] = useState<ContextMenuState>(null);

  const selectedMessage = useMemo(
    () => MOCK_MESSAGES.find((m) => m.id === selectedMessageId) ?? null,
    [selectedMessageId]
  );

  const handleFilterToggle = (filterId: string) => {
    setActiveFilters((prev) =>
      prev.includes(filterId) ? prev.filter((id) => id !== filterId) : [...prev, filterId]
    );
  };

  const handleContextMenuRequest = useCallback((item: BmoMessage, event: { clientX: number; clientY: number }) => {
    setContextMenu({ item, x: event.clientX, y: event.clientY });
  }, []);

  const handleContextMenuAction = useCallback((actionId: string) => {
    if (!contextMenu) return;
    // Logique métier : à brancher sur les APIs (marquer lu, archiver, etc.)
    switch (actionId) {
      case 'mark-read':
      case 'mark-unread':
      case 'archive':
      case 'delete':
        break;
      case 'open-new-tab':
        window.open(`/maitre-ouvrage/messages/${contextMenu.item.id}`, '_blank');
        break;
      default:
        break;
    }
  }, [contextMenu]);

  return (
    <>
    <OutlookLikeLayout
      quickActions={
        <QuickActionsBar
          primaryLabel="Nouveau message"
          onPrimaryClick={() => {}}
          selectedCount={0}
          onMoreClick={() => {}}
        />
      }
      filterBar={
        <FilterBar
          activeView={activeView}
          onViewChange={setActiveView}
          activeFilters={activeFilters}
          onFilterToggle={handleFilterToggle}
          onSortClick={() => {}}
        />
      }
      sidebar={
        <SidebarFolders
          folders={MOCK_FOLDERS}
          selectedFolderId={selectedFolderId}
          onFolderSelect={setSelectedFolderId}
          addAccountLabel="Ajouter un compte"
          onAddAccount={() => {}}
          accountLabel="Boîte BMO"
        />
      }
      list={
        <MessageList
          items={MOCK_MESSAGES}
          selectedId={selectedMessageId}
          onSelect={setSelectedMessageId}
          onContextMenuRequest={handleContextMenuRequest}
          emptyMessage="Aucun message dans ce dossier"
        />
      }
      detail={
        <MessageDetailPanel
          item={selectedMessage}
          onReply={() => {}}
          onReplyAll={() => {}}
          onForward={() => {}}
          onMore={() => {}}
          bodyText={selectedMessage?.snippet ?? null}
          emptyMessage="Sélectionnez un message"
        />
      }
    />
    {contextMenu && (
      <MessageListContextMenu
        x={contextMenu.x}
        y={contextMenu.y}
        item={contextMenu.item}
        actions={CONTEXT_MENU_ACTIONS}
        onAction={handleContextMenuAction}
        onClose={() => setContextMenu(null)}
      />
    )}
  </>
  );
}
