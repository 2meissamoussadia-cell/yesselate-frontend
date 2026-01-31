/**
 * Panel de détail latéral pour Organigramme
 * Affiche les détails d'une entité sélectionnée
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useOrganigrammeCommandCenterStore } from '@/lib/stores/organigrammeCommandCenterStore';

export const OrganigrammeDetailPanel = React.memo(function OrganigrammeDetailPanel() {
  const { detailPanel, closeDetailPanel } = useOrganigrammeCommandCenterStore();

  if (!detailPanel.isOpen) return null;

  return (
    <div className="fixed right-0 top-0 bottom-0 w-96 bg-slate-900 border-l border-slate-700/50 z-50 flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/50">
        <h3 className="text-sm font-medium text-slate-200">Détails</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={closeDetailPanel}
          className="h-7 w-7 p-0 text-slate-400 hover:text-slate-300"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="text-sm text-slate-400">
          Détails de {detailPanel.type} - {detailPanel.entityId}
        </div>
      </div>
    </div>
  );
});

