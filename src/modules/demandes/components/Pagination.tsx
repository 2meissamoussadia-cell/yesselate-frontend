/**
 * Composant de pagination réutilisable
 */

'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  showPageSize?: boolean;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  showPageSize = true,
  className,
}: PaginationProps) {
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const visiblePages = pages.filter((page) => {
    if (totalPages <= 7) return true;
    return (
      page === 1 ||
      page === totalPages ||
      (page >= currentPage - 1 && page <= currentPage + 1)
    );
  });

  return (
    <div className={cn('flex items-center justify-between gap-4 py-4', className)}>
      {/* Info */}
      <div className="text-sm text-slate-400">
        Affichage de <span className="font-medium text-slate-300">{startItem}</span> à{' '}
        <span className="font-medium text-slate-300">{endItem}</span> sur{' '}
        <span className="font-medium text-slate-300">{totalItems}</span> résultats
      </div>

      <div className="flex items-center gap-2">
        {/* Page Size Selector */}
        {showPageSize && onPageSizeChange && (
          <div className="flex items-center gap-2 mr-4">
            <span className="text-xs text-slate-400">Par page:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(parseInt(e.target.value))}
              className="px-2 py-1 text-xs bg-slate-800/50 border border-slate-700/50 rounded text-slate-300"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className="h-8 w-8 p-0"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {/* Page Numbers */}
          <div className="flex items-center gap-1">
            {visiblePages.map((page, index) => {
              const showEllipsis =
                index > 0 && page - visiblePages[index - 1] > 1;
              
              return (
                <React.Fragment key={page}>
                  {showEllipsis && (
                    <span className="px-2 text-slate-400">...</span>
                  )}
                  <Button
                    variant={currentPage === page ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => onPageChange(page)}
                    className={cn(
                      'h-8 min-w-[32px]',
                      currentPage === page && 'bg-blue-600 hover:bg-blue-700'
                    )}
                  >
                    {page}
                  </Button>
                </React.Fragment>
              );
            })}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="h-8 w-8 p-0"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

