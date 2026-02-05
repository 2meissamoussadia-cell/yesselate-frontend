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
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/cn';

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
  /** (id, event?) pour permettre Ctrl+clic / Shift+clic (sélection multiple) */
  onSelect?: (id: string, e?: React.MouseEvent) => void;
  /** Rendu personnalisé de chaque ligne */
  renderItem: (item: T, options: { isSelected: boolean }) => React.ReactNode;
  /** Message liste vide (simple) */
  emptyMessage?: string;
  /** État vide enrichi (titre, description, action) */
  emptyState?: EmptyStateConfig;
  /** Seuil pour activer la virtualisation (défaut 30) */
  virtualizeThreshold?: number;
  /** Hauteur estimée par item pour virtualisation (défaut 64) */
  itemHeight?: number;
  /** Animation du skeleton : 'default' (pulse) ou 'slow' (pulse-slow, plus apaisant) */
  skeletonAnimation?: 'default' | 'slow';
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
  virtualizeThreshold = 30,
  itemHeight = 64,
  skeletonAnimation = 'default',
  onRetry,
  className,
}: ItemListProps<T>) {
  const useVirtualization = items.length > virtualizeThreshold;
  const skeletonAnim = skeletonAnimation === 'slow' ? 'pulse-slow' : 'pulse';

  if (isLoading) {
    return (
      <div
        className={cn(
          'flex flex-col h-full w-full min-w-0 px-4 py-2 space-y-2 bg-slate-50 dark:bg-slate-900/50',
          className
        )}
        role="status"
        aria-label="Chargement de la liste"
      >
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex items-center gap-3 py-2.5 border-b border-slate-100 dark:border-slate-800/40">
            <Skeleton animation={skeletonAnim as 'pulse' | 'pulse-slow'} className="h-4 w-4 shrink-0 rounded-sm" />
            <Skeleton animation={skeletonAnim as 'pulse' | 'pulse-slow'} className="h-4 w-4 shrink-0 rounded-sm" />
            <div className="flex-1 min-w-0 space-y-1.5">
              <div className="flex items-center gap-2">
                <Skeleton animation={skeletonAnim as 'pulse' | 'pulse-slow'} className="h-5 w-16" />
                <Skeleton animation={skeletonAnim as 'pulse' | 'pulse-slow'} className="h-4 flex-1 max-w-[60%]" />
                <Skeleton animation={skeletonAnim as 'pulse' | 'pulse-slow'} className="h-5 w-14" />
                <Skeleton animation={skeletonAnim as 'pulse' | 'pulse-slow'} className="h-4 w-20" />
              </div>
              <Skeleton animation={skeletonAnim as 'pulse' | 'pulse-slow'} className="h-3 w-3/4" />
            </div>
          </div>
        ))}
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
          containerClassName="flex-1 overflow-auto min-w-0 overflow-x-hidden"
          renderItem={(item) => (
            <div
              role="option"
              aria-selected={selectedId === item.id}
              onClick={(e) => onSelect?.(item.id, e)}
              className="cursor-pointer shrink-0 overflow-hidden w-full min-w-0"
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
      className={cn('flex flex-col h-full overflow-y-auto w-full min-w-0', className)}
      role="listbox"
      aria-label="Liste"
      aria-multiselectable="false"
    >
      {items.map((item) => (
        <div
          key={item.id}
          role="option"
          aria-selected={selectedId === item.id}
          onClick={(e) => onSelect?.(item.id, e)}
          className="cursor-pointer shrink-0 overflow-hidden w-full min-w-0"
        >
          {renderItem(item, { isSelected: selectedId === item.id })}
        </div>
      ))}
    </div>
  );
}
