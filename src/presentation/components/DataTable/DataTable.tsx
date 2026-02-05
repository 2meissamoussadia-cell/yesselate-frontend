/**
 * DataTable Component
 * Tableau de données réutilisable avec tri, filtres et pagination
 */

'use client';

import { useState, useMemo } from 'react';
import { cn } from '@/lib/cn';
import { ChevronUp, ChevronDown, ArrowUpDown, Search } from 'lucide-react';
import { FadeIn } from '../Animations';

export interface Column<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

interface DataTableProps<T> {
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

type SortDirection = 'asc' | 'desc' | null;

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  searchable = false,
  searchKeys,
  sortable = true,
  pagination = false,
  pageSize = 10,
  className,
  emptyMessage = 'Aucune donnée disponible',
  onRowClick,
}: DataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [sortColumn, setSortColumn] = useState<keyof T | string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Filtrer les données
  const filteredData = useMemo(() => {
    if (!searchable || !search.trim()) return data;

    const query = search.toLowerCase();
    const keys = searchKeys || columns.map(col => col.key as keyof T);

    return data.filter(row =>
      keys.some(key => {
        const value = row[key];
        return value != null && String(value).toLowerCase().includes(query);
      })
    );
  }, [data, search, searchable, searchKeys, columns]);

  // Trier les données
  const sortedData = useMemo(() => {
    if (!sortable || !sortColumn || !sortDirection) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];

      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;

      const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filteredData, sortColumn, sortDirection, sortable]);

  // Paginer les données
  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData;

    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return sortedData.slice(start, end);
  }, [sortedData, currentPage, pageSize, pagination]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  const handleSort = (column: keyof T | string) => {
    if (!sortable) return;

    if (sortColumn === column) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortColumn(null);
        setSortDirection(null);
      } else {
        setSortDirection('asc');
      }
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (column: keyof T | string) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="w-4 h-4 text-slate-400" />;
    }
    if (sortDirection === 'asc') {
      return <ChevronUp className="w-4 h-4 text-blue-400" />;
    }
    return <ChevronDown className="w-4 h-4 text-blue-400" />;
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Barre de recherche */}
      {searchable && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-700/50 bg-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          />
        </div>
      )}

      {/* Tableau */}
      <div className="overflow-x-auto rounded-lg border border-slate-700/50 bg-slate-800/50">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700/50">
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  style={{ width: column.width }}
                  className={cn(
                    'px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider',
                    column.align === 'center' && 'text-center',
                    column.align === 'right' && 'text-right',
                    sortable && column.sortable !== false && 'cursor-pointer hover:bg-slate-700/30'
                  )}
                  onClick={() => column.sortable !== false && handleSort(column.key)}
                >
                  <div className="flex items-center gap-2">
                    {column.label}
                    {sortable && column.sortable !== false && getSortIcon(column.key)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-slate-400">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((row, idx) => (
                <FadeIn key={idx} delay={idx * 0.02}>
                  <tr
                    className={cn(
                      'hover:bg-slate-700/30 transition-colors',
                      onRowClick && 'cursor-pointer'
                    )}
                    onClick={() => onRowClick?.(row)}
                  >
                    {columns.map((column) => (
                      <td
                        key={String(column.key)}
                        className={cn(
                          'px-4 py-3 text-sm text-slate-200',
                          column.align === 'center' && 'text-center',
                          column.align === 'right' && 'text-right'
                        )}
                      >
                        {column.render
                          ? column.render(row[column.key], row)
                          : String(row[column.key] ?? '')}
                      </td>
                    ))}
                  </tr>
                </FadeIn>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-400">
            Affichage de {(currentPage - 1) * pageSize + 1} à {Math.min(currentPage * pageSize, sortedData.length)} sur {sortedData.length}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded-lg border border-slate-700/50 bg-slate-800 text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700/50"
            >
              Précédent
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={cn(
                      'px-3 py-1 rounded-lg border text-sm',
                      currentPage === pageNum
                        ? 'border-blue-500/50 bg-blue-500/20 text-blue-400'
                        : 'border-slate-700/50 bg-slate-800 text-slate-200 hover:bg-slate-700/50'
                    )}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded-lg border border-slate-700/50 bg-slate-800 text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700/50"
            >
              Suivant
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

