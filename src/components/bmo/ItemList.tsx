'use client';

/**
 * ItemList — Liste générique type Outlook pour items (alertes, demandes, validations, etc.).
 * Réutilisable pour tous les modules BMO avec renderItem personnalisé.
 *
 * Contrat :
 * - Présentation uniquement : pas de fetch, pas de store.
 * - Props : items, selectedId, onSelect, renderItem, emptyMessage, virtualizeThreshold.
 * - Page gère : chargement, sélection, tri, filtrage.
 * - Virtualisation automatique si items.length > virtualizeThreshold (défaut 50).
 */

import React from 'react';
import { VirtualizedList } from '@/components/shared/VirtualizedList';
import { cn } from '@/lib/utils';

export interface ItemListProps<T extends { id: string }> {
  items: T[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  /** Rendu personnalisé de chaque ligne */
  renderItem: (item: T, options: { isSelected: boolean }) => React.ReactNode;
  emptyMessage?: string;
  /** Seuil pour activer la virtualisation (défaut 50) */
  virtualizeThreshold?: number;
  /** Callback pour menu contextuel (clic droit ou bouton …) */
  onContextMenuRequest?: (item: T, event: { clientX: number; clientY: number }) => void;
  className?: string;
}

export function ItemList<T extends { id: string }>({
  items,
  selectedId,
  onSelect,
  renderItem,
  emptyMessage = 'Aucun élément',
  virtualizeThreshold = 50,
  className,
}: ItemListProps<T>) {
  const useVirtualization = items.length > virtualizeThreshold;

  if (items.length === 0) {
    return (
      <div
        className={cn(
          'flex-1 flex items-center justify-center p-6 text-sm text-slate-500 dark:text-slate-400 text-center',
          className
        )}
        role="status"
      >
        {emptyMessage}
      </div>
    );
  }

  if (useVirtualization) {
    return (
      <div
        className={cn('flex flex-col h-full overflow-hidden', className)}
        role="listbox"
        aria-label="Liste"
        aria-multiselectable="false"
      >
        <VirtualizedList<T>
          items={items}
          estimateSize={itemHeight}
          containerHeight="100%"
          containerClassName="flex-1 overflow-auto"
          renderItem={(item) => (
            <div
              role="option"
              aria-selected={selectedId === item.id}
              onClick={() => onSelect?.(item.id)}
              className="cursor-pointer"
            >
              {renderItem(item, { isSelected: selectedId === item.id })}
            </div>
          )}
        />
      </div>
    );
  }

  return (
    <div
      className={cn('flex flex-col h-full overflow-y-auto', className)}
      role="listbox"
      aria-label="Liste"
      aria-multiselectable="false"
    >
      {items.map((item) => (
        <div
          key={item.id}
          role="option"
          aria-selected={selectedId === item.id}
          onClick={() => onSelect?.(item.id)}
          className="cursor-pointer"
        >
          {renderItem(item, { isSelected: selectedId === item.id })}
        </div>
      ))}
    </div>
  );
}
