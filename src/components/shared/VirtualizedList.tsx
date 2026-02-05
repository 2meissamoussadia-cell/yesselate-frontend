/**
 * Composant générique pour virtualiser les listes
 * Utilise @tanstack/react-virtual pour optimiser le rendu
 */

'use client';

import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface VirtualizedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  estimateSize?: number;
  overscan?: number;
  className?: string;
  containerClassName?: string;
  containerHeight?: number | string;
}

export function VirtualizedList<T>({
  items,
  renderItem,
  estimateSize = 60,
  overscan = 5,
  className,
  containerClassName,
  containerHeight = '100%'
}: VirtualizedListProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize,
    overscan
  });

  return (
    <div
      ref={parentRef}
      className={cn('overflow-auto min-w-0 overflow-x-hidden', containerClassName)}
      style={{ height: containerHeight }}
    >
      <div
        className={cn('min-w-0', className)}
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          minWidth: 0,
          position: 'relative'
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            data-index={virtualItem.index}
            className="overflow-hidden min-w-0 w-full"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`
            }}
          >
            {renderItem(items[virtualItem.index], virtualItem.index)}
          </div>
        ))}
      </div>
    </div>
  );
}

