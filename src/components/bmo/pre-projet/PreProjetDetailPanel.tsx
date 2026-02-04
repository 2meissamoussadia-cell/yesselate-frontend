'use client';

import React from 'react';
import { Lightbulb } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { PreProjetItem } from './PreProjetListRow';

export interface PreProjetDetailPanelProps {
  item: PreProjetItem | null;
  loading?: boolean;
}

export const PreProjetDetailPanel = React.memo(function PreProjetDetailPanel({ 
  item, 
  loading 
}: PreProjetDetailPanelProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-sky-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-3">
          <Lightbulb className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto" />
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">
              Aucun pré-projet sélectionné
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Sélectionnez un pré-projet dans la liste
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <div>
        <Badge variant="secondary" className="mb-2">{item.numero}</Badge>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{item.titre}</h2>
      </div>
      <Badge variant="outline">{item.statut}</Badge>
    </div>
  );
});
