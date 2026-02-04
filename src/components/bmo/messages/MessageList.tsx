'use client';

/**
 * MessageList — Liste scrollable d'éléments type Outlook (messages, alertes).
 *
 * Contrat :
 * - Présentation uniquement : pas de fetch, pas de store.
 * - Props : items (BmoMessage[]), selectedId, onSelect, onContextMenuRequest, emptyMessage.
 * - Page gère : chargement des items (fetch par dossier/filtres), sélection, tri, menu contextuel (position + actions).
 */

import React from 'react';
import { MessageListRow } from './MessageListRow';
import { cn } from '@/lib/cn';
import type { BmoMessage } from './types';
import type { MessageListRowContextMenuEvent } from './MessageListRow';

export interface MessageListProps {
  items: BmoMessage[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  /** Clic droit ou bouton « … » sur une ligne : la page ouvre le menu contextuel à la position fournie. */
  onContextMenuRequest?: (item: BmoMessage, event: MessageListRowContextMenuEvent) => void;
  emptyMessage?: string;
  className?: string;
}

export function MessageList({
  items,
  selectedId,
  onSelect,
  onContextMenuRequest,
  emptyMessage = 'Aucun élément',
  className,
}: MessageListProps) {
  return (
    <div
      className={cn('flex flex-col h-full overflow-y-auto', className)}
      role="listbox"
      aria-label="Liste des messages"
      aria-multiselectable="false"
    >
      {items.length === 0 ? (
        <div className="flex-1 flex items-center justify-center p-6 text-sm text-slate-500 dark:text-slate-400 text-center">
          {emptyMessage}
        </div>
      ) : (
        items.map((item) => (
          <MessageListRow
            key={item.id}
            item={item}
            isSelected={selectedId === item.id}
            onClick={() => onSelect?.(item.id)}
            onContextMenuRequest={onContextMenuRequest}
          />
        ))
      )}
    </div>
  );
}
