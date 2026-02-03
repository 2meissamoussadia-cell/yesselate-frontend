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
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface EmptyStateConfig {
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface ItemListProps<T extends { id: string }> {
  items: T[];
  /** État de chargement */
  isLoading?: boolean;
  /** Erreur à afficher */
  error?: Error | null;
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  /** Rendu personnalisé de chaque ligne */
  renderItem: (item: T, options: { isSelected: boolean }) => React.ReactNode;
  /** Message liste vide (simple) */
  emptyMessage?: string;
  /** État vide enrichi (titre, description, action) */
  emptyState?: EmptyStateConfig;
  /** Seuil pour activer la virtualisation (défaut 50) */
  virtualizeThreshold?: number;
  /** Hauteur estimée par item pour virtualisation (défaut 64) */
  itemHeight?: number;
  /** Callback pour menu contextuel (clic droit ou bouton …) */
  onContextMenuRequest?: (item: T, event: { clientX: number; clientY: number }) => void;
  /** Callback retry en cas d'erreur */
  onRetry?: () => void;
  className?: string;
}

export function ItemList<T extends { id: string }>({
  items,
  isLoading = false,
  error = null,
  selectedId,
  onSelect,
  renderItem,
  emptyMessage = 'Aucun élément',
  emptyState,
  virtualizeThreshold = 50,
  itemHeight = 64,
  onRetry,
  className,
}: ItemListProps<T>) {
  const useVirtualization = items.length > virtualizeThreshold;

  if (isLoading) {
    return (
      <div
        className={cn(
          'flex items-center justify-center h-full bg-slate-50 dark:bg-slate-900/50',
          className
        )}
      >
        <div className="text-center space-y-2">
          <Loader2 className="w-8 h-8 text-sky-600 dark:text-sky-400 animate-spin mx-auto" />
          <p className="text-sm text-slate-500 dark:text-slate-400">Chargement...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={cn(
          'flex items-center justify-center h-full bg-slate-50 dark:bg-slate-900/50',
          className
        )}
      >
        <div className="text-center space-y-3">
          <AlertTriangle className="w-12 h-12 text-red-500 dark:text-red-400 mx-auto" />
          <div className="space-y-1">
            <p className="font-medium text-slate-900 dark:text-slate-100">Une erreur est survenue</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{error.message}</p>
          </div>
          <Button variant="outline" onClick={onRetry ?? (() => window.location.reload())}>
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    if (emptyState) {
      return (
        <div
          className={cn(
            'flex items-center justify-center h-full bg-slate-50 dark:bg-slate-900/50',
            className
          )}
        >
          <div className="text-center space-y-3 max-w-sm">
            <div className="w-16 h-16 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8 text-slate-400" />
            </div>
            <div className="space-y-1">
              <p className="font-medium text-slate-900 dark:text-slate-100">{emptyState.title}</p>
              {emptyState.description && (
                <p className="text-sm text-slate-500 dark:text-slate-400">{emptyState.description}</p>
              )}
            </div>
            {emptyState.action && (
              <Button onClick={emptyState.action.onClick}>{emptyState.action.label}</Button>
            )}
          </div>
        </div>
      );
    }
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
