/**
 * Barre d'actions groupées pour les évaluations
 * Apparaît quand des évaluations sont sélectionnées
 */

'use client';

import React from 'react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';
import {
  X,
  Archive,
  Download,
  CheckCircle2,
  Trash2,
  Mail,
  FileText,
} from 'lucide-react';

interface EvaluationsBatchActionsBarProps {
  selectedCount: number;
  onAction?: (action: string, ids: string[]) => void;
  onClearSelection?: () => void;
  actions?: Array<{
    id: string;
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    variant?: 'default' | 'warning' | 'danger';
  }>;
}

const defaultActions = [
  { id: 'export', icon: Download, label: 'Exporter', variant: 'default' as const },
  { id: 'validate', icon: CheckCircle2, label: 'Valider', variant: 'default' as const },
  { id: 'archive', icon: Archive, label: 'Archiver', variant: 'default' as const },
  { id: 'generate-report', icon: FileText, label: 'Générer rapport', variant: 'default' as const },
  { id: 'send-email', icon: Mail, label: 'Envoyer par email', variant: 'default' as const },
  { id: 'delete', icon: Trash2, label: 'Supprimer', variant: 'danger' as const },
];

export function EvaluationsBatchActionsBar({
  selectedCount,
  onAction,
  onClearSelection,
  actions = defaultActions,
}: EvaluationsBatchActionsBarProps) {
  if (selectedCount === 0) return null;

  const handleAction = (actionId: string) => {
    // Les IDs sélectionnés seront gérés par le parent
    onAction?.(actionId, []);
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
      <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-slate-900/95 border border-slate-700/50 shadow-xl backdrop-blur-lg">
        {/* Selection count */}
        <div className="flex items-center gap-2 pr-3 border-r border-slate-700/50">
          <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
            <span className="text-xs font-medium text-white">{selectedCount}</span>
          </div>
          <span className="text-sm text-slate-300">
            évaluation{selectedCount > 1 ? 's' : ''} sélectionnée{selectedCount > 1 ? 's' : ''}
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
            onClick={onClearSelection}
            className="h-8 w-8 p-0 text-slate-400 hover:text-slate-300"
            title="Désélectionner tout"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

