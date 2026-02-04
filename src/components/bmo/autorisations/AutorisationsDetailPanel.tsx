'use client';

import React from 'react';
import { Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { AutorisationItem } from './AutorisationsListRow';

export interface AutorisationsDetailPanelProps {
  item: AutorisationItem | null;
  loading?: boolean;
}

export const AutorisationsDetailPanel = React.memo(function AutorisationsDetailPanel({ 
  item, 
  loading 
}: AutorisationsDetailPanelProps) {
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
          <Shield className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto" />
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">
              Aucune autorisation sélectionnée
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Sélectionnez une autorisation dans la liste
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
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">{item.titre}</h2>
        <Badge variant="outline">{item.statut}</Badge>
      </div>
      <div className="text-sm text-slate-600 dark:text-slate-400">
        Type: {item.type}
      </div>
    </div>
  );
});
