/**
 * Composant pour virtualiser les grilles (grid layout)
 * Optimise le rendu pour les grandes listes en grille
 */

'use client';

import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef, useMemo } from 'react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface VirtualizedGridProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  columns?: number;
  gap?: number;
  estimateSize?: number;
  overscan?: number;
  className?: string;
  containerClassName?: string;
  containerHeight?: number | string;
  /**
   * Responsive columns: [mobile, tablet, desktop]
   * Ex: [1, 2, 3] = 1 col mobile, 2 tablet, 3 desktop
   */
  responsiveColumns?: [number, number, number];
}

export function VirtualizedGrid<T>({
  items,
  renderItem,
  columns = 3,
  gap = 16,
  estimateSize = 200,
  overscan = 5,
  className,
  containerClassName,
  containerHeight = 'auto',
  responsiveColumns,
}: VirtualizedGridProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);

  // Calculer le nombre de colonnes selon la taille de l'écran
  const effectiveColumns = useMemo(() => {
    if (!responsiveColumns) return columns;
    if (typeof window === 'undefined') return responsiveColumns[2]; // desktop par défaut
    
    const width = window.innerWidth;
    if (width < 640) return responsiveColumns[0]; // mobile
    if (width < 1024) return responsiveColumns[1]; // tablet
    return responsiveColumns[2]; // desktop
  }, [columns, responsiveColumns]);

  // Calculer le nombre de lignes
  const rowCount = Math.ceil(items.length / effectiveColumns);

  const virtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize + gap,
    overscan,
  });

  // Fonction pour obtenir les items d'une ligne
  const getRowItems = (rowIndex: number): T[] => {
    const start = rowIndex * effectiveColumns;
    return items.slice(start, start + effectiveColumns);
  };

  return (
    <div
      ref={parentRef}
      className={cn('overflow-auto', containerClassName)}
      style={{ height: containerHeight }}
    >
      <div
        className={className}
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const rowItems = getRowItems(virtualRow.index);
          
          return (
            <div
              key={virtualRow.key}
              data-index={virtualRow.index}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
                display: 'grid',
                gridTemplateColumns: `repeat(${effectiveColumns}, 1fr)`,
                gap: `${gap}px`,
                padding: `0 ${gap / 2}px`,
              }}
            >
              {rowItems.map((item, colIndex) => {
                const globalIndex = virtualRow.index * effectiveColumns + colIndex;
                return (
                  <div key={globalIndex}>
                    {renderItem(item, globalIndex)}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
