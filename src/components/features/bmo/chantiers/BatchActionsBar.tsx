/**
 * Barre d'actions groupées pour Chantiers
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { FluentButton } from '@/components/ui/fluent-button';
import { Badge } from '@/components/ui/badge';
import {
  PlayCircle,
  PauseCircle,
  CheckCircle,
  ClipboardCheck,
  DollarSign,
  Users,
  AlertTriangle,
  Download,
  FileText,
  X,
} from 'lucide-react';

interface BatchActionsBarProps {
  selectedCount: number;
  onStart?: () => void;
  onPause?: () => void;
  onComplete?: () => void;
  onInspect?: () => void;
  onUpdateBudget?: () => void;
  onAssignCrew?: () => void;
  onReportIncident?: () => void;
  onExport?: () => void;
  onGenerateReport?: () => void;
  onClear: () => void;
}

export function BatchActionsBar({
  selectedCount,
  onStart,
  onPause,
  onComplete,
  onInspect,
  onUpdateBudget,
  onAssignCrew,
  onReportIncident,
  onExport,
  onGenerateReport,
  onClear,
}: BatchActionsBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4">
      <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl px-4 py-3 flex items-center gap-3">
        <div className="flex items-center gap-2 pr-3 border-r border-slate-700">
          <div className="h-2 w-2 rounded-full bg-teal-400 animate-pulse" />
          <Badge variant="gray" className="bg-teal-500/20 text-teal-400 border-teal-500/30">
            {selectedCount} chantier{selectedCount > 1 ? 's' : ''}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          {onStart && (
            <FluentButton variant="ghost" size="sm" onClick={onStart} className="hover:bg-emerald-500/10 hover:text-emerald-400">
              <PlayCircle className="w-4 h-4 mr-1.5" />
              Démarrer
            </FluentButton>
          )}

          {onPause && (
            <FluentButton variant="ghost" size="sm" onClick={onPause} className="hover:bg-amber-500/10 hover:text-amber-400">
              <PauseCircle className="w-4 h-4 mr-1.5" />
              Suspendre
            </FluentButton>
          )}

          {onComplete && (
            <FluentButton variant="ghost" size="sm" onClick={onComplete} className="hover:bg-emerald-500/10 hover:text-emerald-400">
              <CheckCircle className="w-4 h-4 mr-1.5" />
              Terminer
            </FluentButton>
          )}

          {onInspect && (
            <FluentButton variant="ghost" size="sm" onClick={onInspect} className="hover:bg-blue-500/10 hover:text-blue-400">
              <ClipboardCheck className="w-4 h-4 mr-1.5" />
              Inspecter
            </FluentButton>
          )}

          {onAssignCrew && (
            <FluentButton variant="ghost" size="sm" onClick={onAssignCrew} className="hover:bg-purple-500/10 hover:text-purple-400">
              <Users className="w-4 h-4 mr-1.5" />
              Équipe
            </FluentButton>
          )}

          {onUpdateBudget && (
            <FluentButton variant="ghost" size="sm" onClick={onUpdateBudget} className="hover:bg-cyan-500/10 hover:text-cyan-400">
              <DollarSign className="w-4 h-4 mr-1.5" />
              Budget
            </FluentButton>
          )}

          {onReportIncident && (
            <FluentButton variant="ghost" size="sm" onClick={onReportIncident} className="hover:bg-rose-500/10 hover:text-rose-400">
              <AlertTriangle className="w-4 h-4 mr-1.5" />
              Incident
            </FluentButton>
          )}

          {onGenerateReport && (
            <FluentButton variant="ghost" size="sm" onClick={onGenerateReport} className="hover:bg-indigo-500/10 hover:text-indigo-400">
              <FileText className="w-4 h-4 mr-1.5" />
              Rapport
            </FluentButton>
          )}

          {onExport && (
            <FluentButton variant="ghost" size="sm" onClick={onExport} className="hover:bg-slate-500/10 hover:text-slate-400">
              <Download className="w-4 h-4 mr-1.5" />
              Exporter
            </FluentButton>
          )}
        </div>

        <div className="h-6 w-px bg-slate-700" />

        <FluentButton variant="ghost" size="sm" onClick={onClear} className="hover:bg-slate-700">
          <X className="w-4 h-4" />
        </FluentButton>
      </div>
    </div>
  );
}

