'use client';

import React from 'react';
import { Clock, DollarSign, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/cn';
import type { Demande, DemandeStatus } from '@/modules/demandes/types/demandesTypes';

export interface DemandeListRowProps {
  demande: Demande;
  selected: boolean;
  onClick?: () => void;
}

const statusConfig: Record<
  DemandeStatus | string,
  { label: string; color: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
> = {
  pending: { label: 'En attente', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300', variant: 'secondary' },
  urgent: { label: 'Urgente', color: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300', variant: 'destructive' },
  validated: { label: 'Validée', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300', variant: 'default' },
  rejected: { label: 'Rejetée', color: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300', variant: 'destructive' },
  overdue: { label: 'En retard', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300', variant: 'secondary' },
};

export const DemandeListRow = React.memo(function DemandeListRow({ demande, selected, onClick }: DemandeListRowProps) {
  const statusConf = statusConfig[demande.status] ?? statusConfig.pending;
  const dateCreation =
    demande.createdAt instanceof Date ? demande.createdAt : new Date(demande.createdAt);

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
        'grid grid-cols-1 gap-y-1.5 px-4 py-3 border-b border-slate-100 dark:border-slate-800/40',
        'cursor-pointer transition-all duration-150',
        'hover:bg-slate-50 dark:hover:bg-slate-800/30',
        'before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[3px] before:bg-transparent before:transition-colors',
        'hover:before:bg-sky-400',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-inset',
        selected && 'bg-sky-50 dark:bg-sky-900/20 before:bg-sky-500'
      )}
    >
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-2 min-w-0">
        <span className="font-medium text-sm text-slate-900 dark:text-slate-100 truncate min-w-0">
          {demande.title}
        </span>
        <span className="text-xs text-slate-500 shrink-0 truncate max-w-[90px]">
          {formatDistanceToNow(dateCreation, { addSuffix: true, locale: fr })}
        </span>
      </div>
      <div className="flex items-center gap-2 min-w-0 overflow-hidden flex-nowrap text-xs text-slate-600 dark:text-slate-400">
        <span className="truncate shrink-0">{demande.reference}</span>
        <span className="shrink-0 text-slate-300 dark:text-slate-600">•</span>
        <span className="truncate min-w-0 capitalize">{demande.service}</span>
        {demande.montant != null && demande.montant > 0 && (
          <>
            <span className="shrink-0 text-slate-300 dark:text-slate-600">•</span>
            <span className="shrink-0 font-medium text-slate-700 dark:text-slate-300 flex items-center gap-0.5">
              <DollarSign className="h-3 w-3" />
              {demande.montant.toLocaleString()} FCFA
            </span>
          </>
        )}
      </div>
      <div className="flex items-center gap-2 flex-nowrap min-w-0 overflow-hidden">
        <Badge variant={statusConf.variant} className={cn('text-[10px] font-medium shrink-0', statusConf.color)}>
          {statusConf.label}
        </Badge>
        {demande.status === 'urgent' && (
          <Badge variant="destructive" className="text-[10px] gap-0.5 shrink-0">
            <AlertCircle className="h-3 w-3" />
            Urgent
          </Badge>
        )}
      </div>
    </div>
  );
});
