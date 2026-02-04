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
        'px-4 py-3 border-b cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-inset',
        selected && 'bg-sky-50 dark:bg-sky-900/20'
      )}
    >
      <div className="flex items-center gap-2">
        <Lightbulb className="w-4 h-4 text-yellow-600" />
        <Badge variant="secondary" className="text-xs font-semibold">{item.numero}</Badge>
        <span className="font-semibold text-sm flex-1">{item.titre}</span>
        <Badge variant="outline" className="text-xs">{item.statut}</Badge>
      </div>
    </div>
  );
});
