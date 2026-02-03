'use client';

import React from 'react';
import { Clock, DollarSign, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
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

export function DemandeListRow({ demande, selected, onClick }: DemandeListRowProps) {
  const statusConf = statusConfig[demande.status] ?? statusConfig.pending;
  const dateCreation =
    demande.createdAt instanceof Date ? demande.createdAt : new Date(demande.createdAt);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
      className={cn(
        'flex flex-col gap-1.5 px-4 py-3 border-b border-slate-100 dark:border-slate-800/40 cursor-pointer transition-colors',
        selected && 'bg-sky-50 dark:bg-sky-900/20'
      )}
    >
      <div className="flex justify-between items-start gap-2">
        <span className="font-medium text-sm text-slate-900 dark:text-slate-100 line-clamp-1">
          {demande.title}
        </span>
        <span className="text-xs text-slate-500 shrink-0">
          {formatDistanceToNow(dateCreation, { addSuffix: true, locale: fr })}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-slate-600 dark:text-slate-400">{demande.reference}</span>
        <span className="text-slate-300 dark:text-slate-600">•</span>
        <span className="text-xs text-slate-600 dark:text-slate-400 capitalize">{demande.service}</span>
        {demande.montant != null && demande.montant > 0 && (
          <>
            <span className="text-slate-300 dark:text-slate-600">•</span>
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-0.5">
              <DollarSign className="h-3 w-3" />
              {demande.montant.toLocaleString()} FCFA
            </span>
          </>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Badge variant={statusConf.variant} className={cn('text-[10px] font-medium', statusConf.color)}>
          {statusConf.label}
        </Badge>
        {demande.status === 'urgent' && (
          <Badge variant="destructive" className="text-[10px] gap-0.5">
            <AlertCircle className="h-3 w-3" />
            Urgent
          </Badge>
        )}
      </div>
    </div>
  );
}
