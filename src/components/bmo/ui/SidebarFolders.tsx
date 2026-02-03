'use client';

/**
 * SidebarFolders — Arborescence de dossiers type Outlook (Boîte de réception, Brouillons, etc.).
 *
 * Contrat :
 * - Présentation uniquement : pas de fetch, pas de store.
 * - Props : folders (BmoFolder[]), selectedFolderId, onFolderSelect, addAccountLabel, onAddAccount, accountLabel.
 * - Page gère : chargement des dossiers, changement de dossier (fetch liste), ajout de compte.
 */

import React from 'react';
import { Inbox, Send, FileEdit, Trash2, Archive, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BmoFolder } from '@/components/bmo/messages/types';

export interface SidebarFoldersProps {
  /** Dossiers à afficher */
  folders: BmoFolder[];
  /** Dossier sélectionné */
  selectedFolderId?: string;
  onFolderSelect?: (folderId: string) => void;
  /** Libellé du bouton "Ajouter un compte" (optionnel, masqué si non fourni) */
  addAccountLabel?: string;
  onAddAccount?: () => void;
  /** Nom du compte / utilisateur affiché en haut (optionnel) */
  accountLabel?: string;
  className?: string;
}

const systemTypeIcons: Record<string, React.ReactNode> = {
  inbox: <Inbox className="h-4 w-4" />,
  sent: <Send className="h-4 w-4" />,
  drafts: <FileEdit className="h-4 w-4" />,
  trash: <Trash2 className="h-4 w-4" />,
  archive: <Archive className="h-4 w-4" />,
};

function FolderRow({
  folder,
  selectedFolderId,
  onSelect,
  level = 0,
}: {
  folder: BmoFolder;
  selectedFolderId?: string;
  onSelect: (id: string) => void;
  level?: number;
}) {
  const icon = folder.systemType ? systemTypeIcons[folder.systemType] : null;
  const selected = selectedFolderId === folder.id;

  return (
    <>
      <button
        type="button"
        onClick={() => onSelect(folder.id)}
        className={cn(
          'w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors text-left',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-1',
          selected
            ? 'bg-sky-100 dark:bg-sky-900/50 text-sky-900 dark:text-sky-100 font-medium'
            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
        )}
        style={{ paddingLeft: `${12 + level * 16}px` }}
        aria-current={selected ? 'true' : undefined}
        aria-label={`${folder.name}${folder.unreadCount > 0 ? `, ${folder.unreadCount} non lu(s)` : ''}`}
      >
        {icon && <span className="shrink-0 text-slate-500 dark:text-slate-400">{icon}</span>}
        <span className="flex-1 truncate">{folder.name}</span>
        {folder.unreadCount > 0 && (
          <span className="shrink-0 text-xs font-semibold text-sky-600 dark:text-sky-400">
            {folder.unreadCount > 99 ? '99+' : folder.unreadCount}
          </span>
        )}
      </button>
      {folder.children?.map((child) => (
        <FolderRow
          key={child.id}
          folder={child}
          selectedFolderId={selectedFolderId}
          onSelect={onSelect}
          level={level + 1}
        />
      ))}
    </>
  );
}

export function SidebarFolders({
  folders,
  selectedFolderId,
  onFolderSelect,
  addAccountLabel = 'Ajouter un compte',
  onAddAccount,
  accountLabel,
  className,
}: SidebarFoldersProps) {
  return (
    <div className={cn('flex flex-col h-full', className)}>
      {accountLabel && (
        <div className="shrink-0 px-3 py-3 border-b border-slate-200 dark:border-slate-800/60">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate" title={accountLabel}>
            {accountLabel}
          </p>
        </div>
      )}

      <nav className="flex-1 overflow-y-auto p-2" aria-label="Dossiers">
        {folders.map((folder) => (
          <FolderRow
            key={folder.id}
            folder={folder}
            selectedFolderId={selectedFolderId}
            onSelect={onFolderSelect ?? (() => {})}
          />
        ))}
      </nav>

      {onAddAccount && addAccountLabel && (
        <div className="shrink-0 p-2 border-t border-slate-200 dark:border-slate-800/60">
          <button
            type="button"
            onClick={onAddAccount}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-900/30 rounded-lg transition-colors"
            aria-label={addAccountLabel}
          >
            <Plus className="h-4 w-4" />
            {addAccountLabel}
          </button>
        </div>
      )}
    </div>
  );
}
