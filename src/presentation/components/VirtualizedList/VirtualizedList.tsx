/**
 * VirtualizedList
 * Composant de liste virtualisée pour améliorer les performances
 * Utilise @tanstack/react-virtual pour le rendu efficace de grandes listes
 */

'use client';

import { useRef, useMemo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { cn } from '@/lib/cn';

interface VirtualizedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  estimateSize?: number | ((index: number) => number);
  overscan?: number;
  className?: string;
  containerClassName?: string;
  emptyMessage?: string;
  getItemKey?: (item: T, index: number) => string | number;
}

/**
 * Composant de liste virtualisée générique
 */
export function VirtualizedList<T>({
  items,
  renderItem,
  estimateSize = 80,
  overscan = 5,
  className,
  containerClassName,
  emptyMessage = 'Aucun élément à afficher',
  getItemKey,
}: VirtualizedListProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: typeof estimateSize === 'function' 
      ? estimateSize 
      : () => estimateSize,
    overscan,
  });

  const itemsToRender = virtualizer.getVirtualItems();

  if (items.length === 0) {
    return (
      <div className={cn('flex items-center justify-center py-12', className)}>
        <p className="text-slate-400 text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div
      ref={parentRef}
      className={cn('h-full overflow-auto', containerClassName)}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
        className={className}
      >
        {itemsToRender.map((virtualRow) => {
          const item = items[virtualRow.index];
          const key = getItemKey 
            ? getItemKey(item, virtualRow.index)
            : virtualRow.key;

          return (
            <div
              key={key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              {renderItem(item, virtualRow.index)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Hook pour calculer la taille estimée dynamiquement
 */
export function useEstimatedSize<T>(
  items: T[],
  getSize: (item: T) => number
) {
  return useMemo(() => {
    return (index: number) => {
      if (index >= items.length) return 80;
      return getSize(items[index]);
    };
  }, [items, getSize]);
}

