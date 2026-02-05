'use client';

import React from 'react';
import { Lightbulb } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/cn';

export interface PreProjetItem {
  id: string;
  numero: string;
  titre: string;
  statut: 'etude' | 'valide' | 'rejete';
}

export interface PreProjetListRowProps {
  item: PreProjetItem;
  selected: boolean;
  onClick?: () => void;
}

export const PreProjetListRow = React.memo(function PreProjetListRow({ 
  item, 
  selected, 
  onClick 
}: PreProjetListRowProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
      aria-selected={selected}
      className={cn(
        'group relative w-full min-w-0 overflow-hidden shrink-0',
        'grid grid-cols-[auto_auto_minmax(0,1fr)_auto] gap-x-2 px-4 py-3 border-b border-slate-100 dark:border-slate-800/40',
        'cursor-pointer transition-all duration-150',
        'hover:bg-slate-50 dark:hover:bg-slate-800/30',
        'before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[3px] before:bg-transparent before:transition-colors',
        'hover:before:bg-sky-400',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-inset',
        selected && 'bg-sky-50 dark:bg-sky-900/20 before:bg-sky-500'
      )}
    >
      <Lightbulb className="w-4 h-4 text-yellow-600 shrink-0 self-center" aria-hidden />
      <Badge variant="secondary" className="text-xs font-semibold shrink-0 self-center">{item.numero}</Badge>
      <span className="font-semibold text-sm truncate min-w-0 self-center">{item.titre}</span>
      <Badge variant="outline" className="text-xs shrink-0 self-center">{item.statut}</Badge>
    </div>
  );
});
