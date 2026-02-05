/**
 * Indicateur de progression pour actions groupées
 * Affiche le nombre de contrats traités et une barre de progression
 */

'use client';

import React from 'react';
import { cn } from '@/lib/cn';
import { Loader2 } from 'lucide-react';

interface BulkActionsProgressProps {
  current: number;
  total: number;
  action: 'validate' | 'reject' | 'escalate';
}

export function BulkActionsProgress({ current, total, action }: BulkActionsProgressProps) {
  const percentage = Math.round((current / total) * 100);

  const actionLabels = {
    validate: 'Validation en cours',
    reject: 'Rejet en cours',
    escalate: 'Escalade en cours',
  };

  const actionColors = {
    validate: 'bg-emerald-500',
    reject: 'bg-red-500',
    escalate: 'bg-orange-500',
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <Loader2 className="h-5 w-5 text-purple-400 animate-spin" />
          <h3 className="text-lg font-semibold text-slate-200">
            {actionLabels[action]}...
          </h3>
        </div>

        <div className="space-y-3">
          {/* Progress bar */}
          <div className="relative h-3 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={cn(
                'absolute inset-y-0 left-0 rounded-full transition-all duration-300',
                actionColors[action]
              )}
              style={{ width: `${percentage}%` }}
            />
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">
              {current} / {total} contrats traités
            </span>
            <span className="text-slate-300 font-medium">
              {percentage}%
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-400 mt-4 text-center">
          Veuillez patienter, cette opération peut prendre quelques instants...
        </p>
      </div>
    </div>
  );
}

