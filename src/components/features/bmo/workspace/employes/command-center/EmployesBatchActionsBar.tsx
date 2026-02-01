/**
 * Barre d'actions groupées pour Employés
 * Apparaît quand des employés sont sélectionnés
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  X,
  Download,
  UserPlus,
  Star,
  Archive,
  Shield,
  Trash2,
  Eye,
  Users,
  TrendingUp,
} from 'lucide-react';
import { useEmployesCommandCenterStore } from '@/lib/stores/employesCommandCenterStore';

interface BatchActionsBarProps {
  onAction?: (action: string, ids: string[]) => void;
  actions?: Array<{
    id: string;
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    variant?: 'default' | 'warning' | 'danger';
  }>;
}

const defaultActions = [
  { id: 'view', icon: Eye, label: 'Voir', variant: 'default' as const },
  { id: 'export', icon: Download, label: 'Exporter', variant: 'default' as const },
  { id: 'assign', icon: UserPlus, label: 'Assigner', variant: 'default' as const },
  { id: 'evaluate', icon: Star, label: 'Évaluer', variant: 'default' as const },
  { id: 'mark-spof', icon: Shield, label: 'Marquer SPOF', variant: 'warning' as const },
  { id: 'archive', icon: Archive, label: 'Archiver', variant: 'default' as const },
  { id: 'delete', icon: Trash2, label: 'Supprimer', variant: 'danger' as const },
];

export function EmployesBatchActionsBar({
  onAction,
  actions = defaultActions,
}: BatchActionsBarProps) {
  const { selectedItems, clearSelection } = useEmployesCommandCenterStore();

  if (selectedItems.length === 0) return null;

  const handleAction = (actionId: string) => {
    onAction?.(actionId, selectedItems);
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 animate-in slide-in-from-bottom-4">
      <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-slate-900/95 border border-slate-700/50 shadow-xl backdrop-blur-lg">
        {/* Selection count */}
        <div className="flex items-center gap-2 pr-3 border-r border-slate-700/50">
          <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
            <span className="text-xs font-medium text-white">{selectedItems.length}</span>
          </div>
          <span className="text-sm text-slate-300">
            employé{selectedItems.length > 1 ? 's' : ''} sélectionné{selectedItems.length > 1 ? 's' : ''}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.id}
                variant="ghost"
                size="sm"
                onClick={() => handleAction(action.id)}
                className={cn(
                  'h-8 px-3',
                  action.variant === 'danger'
                    ? 'text-red-400 hover:text-red-300 hover:bg-red-500/10'
                    : action.variant === 'warning'
                    ? 'text-amber-400 hover:text-amber-300 hover:bg-amber-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                )}
              >
                <Icon className="h-4 w-4 mr-1.5" />
                <span className="text-xs">{action.label}</span>
              </Button>
            );
          })}
        </div>

        {/* Close */}
        <div className="pl-2 border-l border-slate-700/50">
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSelection}
            className="h-8 w-8 p-0 text-slate-400 hover:text-slate-300"
            title="Désélectionner"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

