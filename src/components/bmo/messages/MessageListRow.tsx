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
import { Paperclip, MoreHorizontal } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
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

export function MessageListRow({
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
        'w-full flex items-start gap-2 px-2 py-2 border-b border-slate-100 dark:border-slate-800/50 text-left transition-colors group',
        isSelected
          ? 'bg-sky-50 dark:bg-sky-900/30 border-l-2 border-l-sky-500'
          : 'hover:bg-slate-50 dark:hover:bg-slate-800/40',
        !item.isRead && 'font-medium',
        className
      )}
    >
      <button
        type="button"
        onClick={onClick}
        className={cn(
          'flex-1 flex items-start gap-3 px-2 py-1 min-w-0 rounded-md transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sky-500 text-left'
        )}
        aria-current={isSelected ? 'true' : undefined}
      >
        <Avatar className="h-9 w-9 shrink-0 rounded-full bg-slate-600 dark:bg-slate-500 text-white text-xs font-semibold">
          <AvatarFallback>{getInitials(item.from)}</AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-2 mb-0.5">
            <span
              className={cn(
                'text-sm truncate',
                !item.isRead ? 'font-semibold text-slate-900 dark:text-slate-100' : 'text-slate-700 dark:text-slate-300'
              )}
            >
              {senderLabel}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap shrink-0">
              {formatDate(item.date)}
            </span>
          </div>
          <div className="text-sm text-slate-900 dark:text-slate-100 truncate mb-0.5">
            {item.subject || '(Sans objet)'}
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-400 truncate flex items-center gap-1">
            {item.hasAttachments && (
              <Paperclip className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden />
            )}
            <span className="truncate">{item.snippet}</span>
          </div>
        </div>
      </button>

      {onContextMenuRequest && (
        <button
          type="button"
          onClick={handleMoreClick}
          className={cn(
            'shrink-0 p-1.5 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-300',
            'hover:bg-slate-200/60 dark:hover:bg-slate-700/60 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500'
          )}
          aria-label="Actions"
          aria-haspopup="true"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
