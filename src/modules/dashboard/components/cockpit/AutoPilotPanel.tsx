'use client';

import React, { useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Check, X, Zap, AlertTriangle } from 'lucide-react';
import type { AutoPilotDecision } from '../../types/cockpitV2';
import { approveDecision } from '../../cockpit-v2/autopilot-engine';
import { colors } from '../../utils/dashboardDesignTokens';

interface AutoPilotPanelProps {
  decisions: AutoPilotDecision[];
  onApprove: (id: string, approved: boolean) => void;
  className?: string;
}

export function AutoPilotPanel({ decisions, onApprove, className }: AutoPilotPanelProps) {
  const handleApprove = useCallback(
    (id: string, approved: boolean) => {
      approveDecision(id, approved);
      onApprove(id, approved);
    },
    [onApprove]
  );

  const pending = decisions.filter((d) => d.status === 'pending_dg');
  const executed = decisions.filter((d) => d.status === 'auto_executed' || d.status === 'completed');

  return (
    <div
      className={cn(
        'rounded-xl border overflow-hidden flex flex-col',
        colors.border.default,
        colors.bg.secondary,
        'min-h-[200px]',
        className
      )}
    >
      <div className="px-4 py-3 border-b border-slate-800/60 bg-slate-950/40 flex items-center gap-2">
        <Zap className="h-4 w-4 text-amber-400" />
        <h3 className="text-sm font-semibold text-slate-100">Auto-pilot</h3>
        {pending.length > 0 && (
          <span className="ml-auto text-xs font-medium text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
            {pending.length} en attente
          </span>
        )}
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {pending.length === 0 && executed.length === 0 && (
          <p className="text-xs text-slate-500">Aucune décision pour l’instant.</p>
        )}
        {pending.map((d) => (
          <div
            key={d.id}
            className={cn(
              'rounded-lg border p-3',
              colors.border.default,
              colors.bg.tertiary
            )}
          >
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-slate-200 line-clamp-2">
                  {d.insight.prediction}
                </p>
                <p className="text-[10px] text-slate-500 mt-1">
                  {d.insight.chantier_id} • {d.insight.confidence}% conf.
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Impact : {d.insight.impact_financial.toLocaleString('fr-FR')} FCFA
                </p>
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <button
                type="button"
                onClick={() => handleApprove(d.id, true)}
                className={cn(
                  'inline-flex items-center gap-1 rounded-lg border px-2 py-1.5 text-xs',
                  'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
                  'hover:bg-emerald-500/20'
                )}
              >
                <Check className="h-3 w-3" />
                Approuver
              </button>
              <button
                type="button"
                onClick={() => handleApprove(d.id, false)}
                className={cn(
                  'inline-flex items-center gap-1 rounded-lg border px-2 py-1.5 text-xs',
                  colors.border.default,
                  colors.bg.tertiary,
                  'text-slate-400 hover:bg-slate-800/50'
                )}
              >
                <X className="h-3 w-3" />
                Rejeter
              </button>
            </div>
          </div>
        ))}
        {executed.slice(0, 5).map((d) => (
          <div
            key={d.id}
            className={cn(
              'rounded-lg border p-2 opacity-80',
              colors.border.default,
              'bg-slate-900/30'
            )}
          >
            <p className="text-[10px] text-slate-400 line-clamp-1">{d.insight.prediction}</p>
            <p className="text-[10px] text-emerald-500/80 mt-0.5">
              {d.status === 'auto_executed' ? 'Auto-exécuté' : 'Exécuté'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
