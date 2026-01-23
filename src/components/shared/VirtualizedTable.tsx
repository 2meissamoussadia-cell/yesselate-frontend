/**
 * Composant générique pour virtualiser les tableaux
 * Utilise @tanstack/react-virtual pour optimiser le rendu des lignes
 */

'use client';

import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface Column<T> {
  key: string;
  header: string;
  render: (item: T) => ReactNode;
  width?: number | string;
  className?: string;
}

interface VirtualizedTableProps<T extends { id: string }> {
  data: T[];
  columns: Column<T>[];
  rowHeight?: number;
  className?: string;
  containerHeight?: number | string;
  headerClassName?: string;
  rowClassName?: string;
}

export function VirtualizedTable<T extends { id: string }>({
  data,
  columns,
  rowHeight = 50,
  className,
  containerHeight = '600px',
  headerClassName,
  rowClassName
}: VirtualizedTableProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan: 10
  });

  return (
    <div
      ref={parentRef}
      className={cn('overflow-auto border border-slate-200 dark:border-slate-800 rounded-lg', className)}
      style={{ height: containerHeight }}
    >
      <table className="w-full border-collapse">
        <thead className={cn('sticky top-0 bg-slate-50 dark:bg-slate-900 z-10', headerClassName)}>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn('px-4 py-2 text-left text-sm font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800', col.className)}
                style={{ width: col.width }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            position: 'relative'
          }}
        >
          {virtualizer.getVirtualItems().map((virtualRow) => {
            const item = data[virtualRow.index];
            return (
              <tr
                key={item.id}
                className={cn('border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50', rowClassName)}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`
                }}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn('px-4 py-2 text-sm text-slate-600 dark:text-slate-400', col.className)}
                  >
                    {col.render(item)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

