/**
 * Actions rapides pour Calendrier
 * Actions minimales : créer événement, ajouter absence, lier à chantier, exporter, activer alerte
 */

'use client';

import React from 'react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Calendar,
  Link as LinkIcon,
  Download,
  Bell,
  ArrowRight,
  Building2,
  Users,
  FileSpreadsheet,
} from 'lucide-react';

interface CalendrierQuickActionsProps {
  onCreateEvent?: () => void;
  onAddAbsence?: () => void;
  onLinkToChantier?: () => void;
  onExport?: () => void;
  onActivateAlert?: () => void;
  className?: string;
}

export function CalendrierQuickActions({
  onCreateEvent,
  onAddAbsence,
  onLinkToChantier,
  onExport,
  onActivateAlert,
  className,
}: CalendrierQuickActionsProps) {
  const actions = [
    {
      id: 'create-event',
      label: 'Créer événement',
      icon: Plus,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30',
      description: 'Ajouter un événement calendaire',
      onClick: onCreateEvent,
    },
    {
      id: 'add-absence',
      label: 'Ajouter absence',
      icon: Users,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/30',
      description: 'Redirection vers module RH',
      onClick: onAddAbsence,
      redirect: true,
    },
    {
      id: 'link-chantier',
      label: 'Lier à chantier',
      icon: Building2,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/30',
      description: 'Redirection vers Gestion Chantiers',
      onClick: onLinkToChantier,
      redirect: true,
    },
    {
      id: 'export',
      label: 'Exporter période',
      icon: Download,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/30',
      description: 'iCal, Excel',
      onClick: onExport,
    },
    {
      id: 'activate-alert',
      label: 'Activer alerte',
      icon: Bell,
      color: 'text-rose-400',
      bgColor: 'bg-rose-500/10',
      borderColor: 'border-rose-500/30',
      description: 'Configurer une alerte',
      onClick: onActivateAlert,
    },
  ];

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center gap-2 px-1">
        <h3 className="text-sm font-semibold text-slate-300">Actions rapides</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              onClick={action.onClick}
              className={cn(
                'group relative flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all',
                'hover:scale-[1.02] hover:shadow-lg',
                action.bgColor,
                action.borderColor,
                'text-left'
              )}
            >
              <div className={cn('p-1.5 rounded', action.bgColor)}>
                <Icon className={cn('h-4 w-4', action.color)} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-200">{action.label}</span>
                  {action.redirect && (
                    <ArrowRight className="h-3 w-3 text-slate-400" />
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-0.5 truncate">{action.description}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

