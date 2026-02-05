/**
 * Tableau de Données BTP
 * Tableau réutilisable avec tri, recherche et pagination
 */

'use client';

import React, { useState, useMemo } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, Search } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Input } from '@/components/ui/input';

export interface BTPDataTableColumn<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  className?: string;
}

interface BTPDataTableProps<T> {
  data: T[];
  columns: BTPDataTableColumn<T>[];
  searchable?: boolean;
  searchKeys?: (keyof T)[];
  className?: string;
  onRowClick?: (row: T) => void;
}

type SortDirection = 'asc' | 'desc' | null;

export function BTPDataTable<T extends Record<string, any>>({
  data,
  columns,
  searchable = true,
  searchKeys,
  className,
  onRowClick,
}: BTPDataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [sortColumn, setSortColumn] = useState<keyof T | string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const filteredData = useMemo(() => {
    let result = [...data];

    // Search
    if (searchable && search) {
      const keys = searchKeys || (columns.map((c) => c.key) as (keyof T)[]);
      result = result.filter((row) =>
        keys.some((key) => {
          const value = row[key];
          return value?.toString().toLowerCase().includes(search.toLowerCase());
        })
      );
    }

    // Sort
    if (sortColumn && sortDirection) {
      result.sort((a, b) => {
        const aValue = a[sortColumn];
        const bValue = b[sortColumn];

        if (aValue === bValue) return 0;

        const comparison = aValue > bValue ? 1 : -1;
        return sortDirection === 'asc' ? comparison : -comparison;
      });
    }

    return result;
  }, [data, search, sortColumn, sortDirection, searchable, searchKeys, columns]);

  const handleSort = (columnKey: keyof T | string) => {
    if (sortColumn === columnKey) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortColumn(null);
        setSortDirection(null);
      } else {
        setSortDirection('asc');
      }
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  return (
    <div className={cn('bg-slate-800/50 rounded-lg border border-slate-700', className)}>
      {/* Search */}
      {searchable && (
        <div className="p-4 border-b border-slate-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-slate-900 border-slate-700"
            />
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700">
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className={cn(
                    'px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider',
                    column.sortable && 'cursor-pointer hover:bg-slate-800/50',
                    column.className
                  )}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center gap-2">
                    {column.label}
                    {column.sortable && (
                      <div className="flex flex-col">
                        {sortColumn === column.key && sortDirection === 'asc' ? (
                          <ArrowUp className="h-3 w-3 text-blue-400" />
                        ) : sortColumn === column.key && sortDirection === 'desc' ? (
                          <ArrowDown className="h-3 w-3 text-blue-400" />
                        ) : (
                          <ArrowUpDown className="h-3 w-3 text-slate-600" />
                        )}
                      </div>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-slate-400 text-sm">
                  Aucune donnée trouvée
                </td>
              </tr>
            ) : (
              filteredData.map((row, index) => (
                <tr
                  key={index}
                  className={cn(
                    'hover:bg-slate-800/30 transition-colors',
                    onRowClick && 'cursor-pointer'
                  )}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((column) => (
                    <td key={String(column.key)} className={cn('px-4 py-3 text-sm text-slate-300', column.className)}>
                      {column.render
                        ? column.render(row[column.key], row)
                        : String(row[column.key] ?? '-')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-slate-700 text-xs text-slate-400">
        {filteredData.length} résultat{filteredData.length > 1 ? 's' : ''} sur {data.length}
      </div>
    </div>
  );
}

