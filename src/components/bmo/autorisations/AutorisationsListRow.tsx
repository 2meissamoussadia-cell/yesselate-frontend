'use client';

import React from 'react';
import { Shield, FileCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/cn';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

export interface AutorisationItem {
  id: string;
  numero: string;
  titre: string;
  type: 'permis-construire' | 'autorisation-travaux' | 'declaration-prealable';
  statut: 'en-cours' | 'obtenue' | 'refusee';
  dateCreation: Date | string;
}

export interface AutorisationsListRowProps {
  item: AutorisationItem;
  selected: boolean;
  onClick?: () => void;
}

const statutConfig: Record<AutorisationItem['statut'], { color: string; label: string }> = {
  'en-cours': { color: 'bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300', label: 'En cours' },
  'obtenue': { color: 'bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-300', label: 'Obtenue' },
  'refusee': { color: 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300', label: 'Refusée' },
};

export const AutorisationsListRow = React.memo(function AutorisationsListRow({ 
  item, 
  selected, 
  onClick 
}: AutorisationsListRowProps) {
  const dateCreation = item.dateCreation instanceof Date ? item.dateCreation : new Date(item.dateCreation);
  const statutInfo = statutConfig[item.statut];

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      className={cn(
        'px-4 py-3 border-b cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all',
        'before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[3px] before:bg-transparent hover:before:bg-sky-400',
        selected && 'bg-sky-50 dark:bg-sky-900/20 before:bg-sky-500'
      )}
    >
      <div className="flex items-center gap-3">
        {item.statut === 'obtenue' ? (
          <FileCheck className="w-5 h-5 text-green-600" />
        ) : (
          <Shield className="w-5 h-5 text-orange-600" />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="secondary" className="text-xs font-semibold">{item.numero}</Badge>
            <span className="font-semibold text-sm truncate">{item.titre}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <Badge variant="outline" className={cn('text-xs', statutInfo.color)}>
              {statutInfo.label}
            </Badge>
            <span>{formatDistanceToNow(dateCreation, { addSuffix: true, locale: fr })}</span>
          </div>
        </div>
      </div>
    </div>
  );
});
