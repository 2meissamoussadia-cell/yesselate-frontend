'use client';

import * as React from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { cn } from '@/lib/cn';

interface FluentVirtualizedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  estimateSize?: number;
  className?: string;
  containerClassName?: string;
  overscan?: number;
}

/**
 * FluentVirtualizedList - Liste virtualisée style Windows 11
 * 
 * Performance optimale pour les listes longues (5k+ items)
 * Utilise @tanstack/react-virtual pour le rendu efficace
 */
export function FluentVirtualizedList<T>({
  items,
  renderItem,
  estimateSize = 100,
  className,
  containerClassName,
  overscan = 5,
}: FluentVirtualizedListProps<T>) {
  const parentRef = React.useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize,
    overscan,
  });

  return (
    <div
      ref={parentRef}
      className={cn(
        'h-full w-full overflow-auto',
        'scrollbar-subtle',
        containerClassName
      )}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
        className={className}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            {renderItem(items[virtualItem.index], virtualItem.index)}
          </div>
        ))}
      </div>
    </div>
  );
}

