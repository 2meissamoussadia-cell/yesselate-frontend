/**
 * DataTable Component pour Dashboard
 * Wrapper autour du DataTable existant avec styles dashboard
 */

'use client';

import React from 'react';
import { DataTable as BaseDataTable, type Column } from '@/presentation/components/DataTable/DataTable';
import { cn } from '@/lib/utils';

export interface DashboardDataTableProps<T extends Record<string, any>> {
  data: T[];
  columns: Column<T>[];
  searchable?: boolean;
  searchKeys?: (keyof T)[];
  sortable?: boolean;
  pagination?: boolean;
  pageSize?: number;
  className?: string;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
}

export function DashboardDataTable<T extends Record<string, any>>({
  data,
  columns,
  searchable = false,
  searchKeys,
  sortable = true,
  pagination = true,
  pageSize = 20,
  className,
  emptyMessage = 'Aucune donnée disponible',
  onRowClick,
}: DashboardDataTableProps<T>) {
  return (
    <div className={cn('rounded-lg border border-slate-800/60 bg-slate-900/30', className)}>
      <BaseDataTable
        data={data}
        columns={columns}
        searchable={searchable}
        searchKeys={searchKeys}
        sortable={sortable}
        pagination={pagination}
        pageSize={pageSize}
        emptyMessage={emptyMessage}
        onRowClick={onRowClick}
      />
    </div>
  );
}
