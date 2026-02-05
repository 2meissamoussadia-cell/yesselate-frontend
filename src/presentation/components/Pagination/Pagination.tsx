/**
 * Pagination Component
 * Pagination avancée
 */

'use client';

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { cn } from '@/lib/cn';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showFirstLast?: boolean;
  showPrevNext?: boolean;
  maxVisible?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  showFirstLast = true,
  showPrevNext = true,
  maxVisible = 5,
  className,
  size = 'md',
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  const getVisiblePages = () => {
    const pages: (number | string)[] = [];
    const half = Math.floor(maxVisible / 2);

    let start = Math.max(1, currentPage - half);
    let end = Math.min(totalPages, currentPage + half);

    if (currentPage <= half) {
      end = Math.min(totalPages, maxVisible);
    } else if (currentPage >= totalPages - half) {
      start = Math.max(1, totalPages - maxVisible + 1);
    }

    if (start > 1) {
      pages.push(1);
      if (start > 2) pages.push('...');
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < totalPages) {
      if (end < totalPages - 1) pages.push('...');
      pages.push(totalPages);
    }

    return pages;
  };

  const visiblePages = getVisiblePages();

  return (
    <nav
      aria-label="Pagination"
      className={cn('flex items-center justify-center gap-1', className)}
    >
      {showFirstLast && (
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className={cn(
            'rounded-lg border border-slate-700/50 bg-slate-800 text-slate-300 transition-colors',
            'hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed',
            sizeClasses[size]
          )}
          aria-label="Première page"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>
      )}

      {showPrevNext && (
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={cn(
            'rounded-lg border border-slate-700/50 bg-slate-800 text-slate-300 transition-colors',
            'hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed',
            sizeClasses[size]
          )}
          aria-label="Page précédente"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      )}

      {visiblePages.map((page, index) => {
        if (page === '...') {
          return (
            <span
              key={`ellipsis-${index}`}
              className={cn('px-2 text-slate-400', sizeClasses[size])}
            >
              ...
            </span>
          );
        }

        const pageNum = page as number;
        const isActive = pageNum === currentPage;

        return (
          <button
            key={pageNum}
            onClick={() => onPageChange(pageNum)}
            className={cn(
              'rounded-lg border transition-colors',
              sizeClasses[size],
              isActive
                ? 'border-blue-500 bg-blue-500/20 text-blue-400 font-semibold'
                : 'border-slate-700/50 bg-slate-800 text-slate-300 hover:bg-slate-700'
            )}
            aria-label={`Page ${pageNum}`}
            aria-current={isActive ? 'page' : undefined}
          >
            {pageNum}
          </button>
        );
      })}

      {showPrevNext && (
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={cn(
            'rounded-lg border border-slate-700/50 bg-slate-800 text-slate-300 transition-colors',
            'hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed',
            sizeClasses[size]
          )}
          aria-label="Page suivante"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}

      {showFirstLast && (
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className={cn(
            'rounded-lg border border-slate-700/50 bg-slate-800 text-slate-300 transition-colors',
            'hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed',
            sizeClasses[size]
          )}
          aria-label="Dernière page"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      )}
    </nav>
  );
}

