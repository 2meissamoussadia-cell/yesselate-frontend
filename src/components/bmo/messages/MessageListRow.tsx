'use client';

/**
 * MessageListRow — Ligne de liste type Outlook (avatar, expéditeur, objet, aperçu, date).
 *
 * Contrat :
 * - Présentation uniquement : pas de fetch.
 * - Props : item (BmoMessage), isSelected, onClick, onContextMenuRequest (clic droit ou bouton « … »).
 * - Page gère : sélection (onClick remonte l'id), ouverture du menu contextuel (position), actions du menu.
 */

import React from 'react';
import { Paperclip, MoreHorizontal, Flag, Archive, Trash2 } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/cn';
import type { BmoMessage } from './types';

export interface MessageListRowContextMenuEvent {
  clientX: number;
  clientY: number;
}

export interface MessageListRowProps {
  item: BmoMessage;
  isSelected?: boolean;
  onClick?: () => void;
  /** Clic droit sur la ligne ou clic sur le bouton « … » : la page ouvre le menu contextuel à la position fournie. */
  onContextMenuRequest?: (item: BmoMessage, event: MessageListRowContextMenuEvent) => void;
  className?: string;
}

function getInitials(from: BmoMessage['from']): string {
  if (from.name) {
    const parts = from.name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return from.name.slice(0, 2).toUpperCase();
  }
  if (from.address) {
    const local = from.address.split('@')[0];
    return local.slice(0, 2).toUpperCase();
  }
  return '?';
}

function formatDate(date: Date): string {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  if (diffHours < 24) {
    return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export const MessageListRow = React.memo(function MessageListRow({
  item,
  isSelected,
  onClick,
  onContextMenuRequest,
  className,
}: MessageListRowProps) {
  const senderLabel = item.from.name || item.from.address || 'Inconnu';

  const handleContextMenu = (e: React.MouseEvent) => {
    if (!onContextMenuRequest) return;
    e.preventDefault();
    e.stopPropagation();
    onContextMenuRequest(item, { clientX: e.clientX, clientY: e.clientY });
  };

  const handleMoreClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!onContextMenuRequest) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    onContextMenuRequest(item, { clientX: rect.right - 8, clientY: rect.bottom + 4 });
  };

  return (
    <div
      role="row"
      aria-selected={isSelected}
      aria-label={`${senderLabel}, ${item.subject}`}
      onContextMenu={handleContextMenu}
      className={cn(
        'group relative w-full min-w-0 overflow-hidden shrink-0',
        'grid grid-cols-[auto_minmax(0,1fr)] gap-x-2 gap-y-0',
        'px-2 py-2 border-b border-slate-100 dark:border-slate-800/50 text-left transition-colors',
        isSelected
          ? 'bg-sky-50 dark:bg-sky-900/30 border-l-2 border-l-sky-500'
          : 'hover:bg-slate-50 dark:hover:bg-slate-800/40',
        !item.isRead && 'font-medium',
        'before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[3px] before:bg-transparent before:transition-colors',
        'hover:before:bg-sky-400',
        isSelected && 'before:bg-sky-500',
        className
      )}
    >
      <button
        type="button"
        onClick={onClick}
        className={cn(
          'col-span-2 flex items-start gap-2 px-2 py-1 min-w-0 rounded-md transition-colors text-left',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sky-500'
        )}
        aria-current={isSelected ? 'true' : undefined}
      >
        <Avatar className="h-9 w-9 shrink-0 rounded-full bg-slate-600 dark:bg-slate-500 text-white text-xs font-semibold row-span-3 self-start">
          <AvatarFallback>{getInitials(item.from)}</AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0 overflow-hidden pr-16 grid grid-cols-1 gap-y-0.5">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-2 min-w-0">
            <span
              className={cn(
                'text-sm truncate min-w-0',
                !item.isRead ? 'font-semibold text-slate-900 dark:text-slate-100' : 'text-slate-700 dark:text-slate-300'
              )}
            >
              {senderLabel}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 shrink-0 truncate max-w-[80px]">
              {formatDate(item.date)}
            </span>
          </div>
          <div className="text-sm text-slate-900 dark:text-slate-100 truncate min-w-0">
            {item.subject || '(Sans objet)'}
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-400 truncate min-w-0 flex items-center gap-1 flex-nowrap">
            {item.hasAttachments && (
              <Paperclip className="h-3.5 w-3.5 shrink-0 text-slate-500 dark:text-slate-400" aria-hidden />
            )}
            <span className="truncate min-w-0">{item.snippet}</span>
          </div>
        </div>
      </button>

      {/* Quick Actions au survol — position fixe, ne participe pas au flux */}
      <div
        className={cn(
          'absolute right-2 top-1/2 -translate-y-1/2 z-10',
          'flex items-center gap-0.5',
          'opacity-0 group-hover:opacity-100 group-focus-within:opacity-100',
          'transition-opacity duration-150',
          'bg-white dark:bg-slate-900 rounded-md shadow-sm border border-slate-200 dark:border-slate-700 p-0.5'
        )}
        role="group"
        aria-label="Actions rapides"
      >
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/30"
          onClick={(e) => { e.stopPropagation(); }}
          aria-label="Marquer important"
          title="Marquer important"
        >
          <Flag className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-slate-500 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-900/30"
          onClick={(e) => { e.stopPropagation(); }}
          aria-label="Archiver"
          title="Archiver"
        >
          <Archive className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
          onClick={(e) => { e.stopPropagation(); }}
          aria-label="Supprimer"
          title="Supprimer"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
        {onContextMenuRequest && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            onClick={handleMoreClick}
            aria-label="Plus d'actions"
            aria-haspopup="true"
          >
            <MoreHorizontal className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
});
