/**
 * Composant d'en-tête de tableau avec tri
 */

'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/cn';

export type SortOrder = 'asc' | 'desc' | null;

interface TableSortHeaderProps {
  label: string;
  sortKey: string;
  currentSortKey?: string | null;
  currentSortOrder?: SortOrder;
  onSort: (key: string, order: SortOrder) => void;
  className?: string;
}

export function TableSortHeader({
  label,
  sortKey,
  currentSortKey,
  currentSortOrder,
  onSort,
  className,
}: TableSortHeaderProps) {
  const isActive = currentSortKey === sortKey;

  const handleClick = () => {
    if (!isActive) {
      onSort(sortKey, 'asc');
    } else if (currentSortOrder === 'asc') {
      onSort(sortKey, 'desc');
    } else if (currentSortOrder === 'desc') {
      onSort(sortKey, null);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      className={cn(
        'h-8 px-2 -ml-2 gap-1 text-xs font-medium text-slate-400 hover:text-slate-200',
        isActive && 'text-slate-200',
        className
      )}
    >
      <span>{label}</span>
      {!isActive && <ArrowUpDown className="h-3 w-3 opacity-50" />}
      {isActive && currentSortOrder === 'asc' && <ArrowUp className="h-3 w-3" />}
      {isActive && currentSortOrder === 'desc' && <ArrowDown className="h-3 w-3" />}
    </Button>
  );
}

