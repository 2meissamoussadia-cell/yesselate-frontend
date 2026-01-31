/**
 * Panel d'actions rapides pour le module Gouvernance
 * Affiche les actions fréquentes
 */

'use client';

import React from 'react';
import { Plus, Bell, Link2, Download, FileText, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickActionsPanelProps {
  className?: string;
  onAction?: (action: string) => void;
}

interface QuickAction {
  id: string;
  label: string;
  icon: React.ElementType;
}

const quickActions: QuickAction[] = [
  { id: 'create-event', label: 'Créer événement', icon: Plus },
  { id: 'activate-alert', label: 'Activer alerte', icon: Bell },
  { id: 'export-period', label: 'Exporter période', icon: Download },
  { id: 'view-contracts', label: 'Voir contrats', icon: FileText },
  { id: 'link-item', label: 'Lier élément', icon: Link2 },
  { id: 'schedule-meeting', label: 'Planifier réunion', icon: Calendar },
];

export function QuickActionsPanel({ className, onAction }: QuickActionsPanelProps) {
  return (
    <div className={cn('rounded-2xl bg-slate-950/40 p-3 ring-1 ring-white/10', className)}>
      <div className="text-xs text-slate-400 mb-2">Actions rapides</div>
      <div className="grid grid-cols-2 gap-2">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              type="button"
              onClick={() => onAction?.(action.id)}
              aria-label={action.label}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/5 px-3 py-2 min-h-[44px] text-xs font-medium text-slate-200 ring-1 ring-white/10 hover:bg-white/10 transition-colors focus-visible:outline focus-visible:ring-2 focus-visible:ring-sky-500"
            >
              <Icon className="h-4 w-4" aria-hidden />
              {action.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

