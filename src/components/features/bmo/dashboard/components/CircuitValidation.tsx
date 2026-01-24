/**
 * Composant CircuitValidation - Circuit de validation harmonisé
 * Affiche le flow de validation avec étapes, goulots et métriques
 */

'use client';

import React, { memo } from 'react';
import { cn } from '@/lib/utils';
import { AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export interface WorkflowStage {
  id: string;
  label: string;
  count: number;
  color: 'blue' | 'purple' | 'green' | 'orange';
  bureau?: string;
  avgTime: number; // en jours
  targetTime: number; // en jours
  isBottleneck: boolean;
}

interface CircuitValidationProps {
  stages: WorkflowStage[];
  className?: string;
}

const colorConfig = {
  blue: {
    bg: 'bg-blue-500/20',
    border: 'border-blue-500',
    text: 'text-blue-400',
  },
  purple: {
    bg: 'bg-purple-500/20',
    border: 'border-purple-500',
    text: 'text-purple-400',
  },
  green: {
    bg: 'bg-green-500/20',
    border: 'border-green-500',
    text: 'text-green-400',
  },
  orange: {
    bg: 'bg-orange-500/20',
    border: 'border-orange-500',
    text: 'text-orange-400',
  },
};

/**
 * Composant CircuitValidation harmonisé
 */
export const CircuitValidation = memo(function CircuitValidation({
  stages,
  className,
}: CircuitValidationProps) {
  return (
    <div className={cn('bg-slate-800 rounded-xl border border-slate-700 p-6', className)}>
      {/* Flow horizontal avec étapes */}
      <div className="flex items-stretch gap-4 overflow-x-auto pb-2">
        {stages.map((stage, idx) => {
          const colors = colorConfig[stage.color];
          const timeDiff = stage.avgTime - stage.targetTime;
          const isDelayed = timeDiff > 0;

          return (
            <React.Fragment key={stage.id}>
              {/* Flèche de connexion */}
              {idx > 0 && (
                <div className="flex items-center">
                  <div className="w-4 h-0.5 bg-slate-700" />
                  <div className="w-0 h-0 border-t-4 border-b-4 border-l-4 border-transparent border-l-slate-700" />
                </div>
              )}

              {/* Étape */}
              <div className="flex-1 min-w-[140px]">
                <div
                  className={cn(
                    'rounded-xl p-4 text-center relative border border-slate-800/60 bg-slate-950/25 h-full flex flex-col',
                    colors.bg,
                    stage.isBottleneck && 'ring-2 ring-orange-500/50 ring-offset-2 ring-offset-slate-800'
                  )}
                >
                  {/* Badge goulot */}
                  {stage.isBottleneck && (
                    <div className="absolute -top-2 -right-2 px-2 py-0.5 bg-orange-500 text-white text-[10px] font-bold rounded-full z-10 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Goulot
                    </div>
                  )}

                  {/* Bureau */}
                  {stage.bureau && (
                    <div className="mb-2">
                      <Badge
                        variant="default"
                        className="text-[10px] bg-slate-700/50 text-slate-300 border border-slate-600/50"
                      >
                        {stage.bureau}
                      </Badge>
                    </div>
                  )}

                  {/* Nombre */}
                  <div className={cn('text-3xl font-bold mb-1', colors.text)}>
                    {stage.count}
                  </div>
                  <div className="text-xs text-slate-400 mb-3">{stage.label}</div>

                  {/* Métriques temps */}
                  {stage.avgTime > 0 && (
                    <div className="mt-auto space-y-1 pt-3 border-t border-slate-700/50">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Moyen:</span>
                        <span
                          className={cn(
                            'font-semibold',
                            isDelayed ? 'text-orange-400' : 'text-green-400'
                          )}
                        >
                          {stage.avgTime.toFixed(1)}j
                        </span>
                      </div>
                      {stage.targetTime > 0 && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400">Objectif:</span>
                          <span className="text-slate-300">{stage.targetTime.toFixed(1)}j</span>
                        </div>
                      )}
                      {isDelayed && (
                        <div className="flex items-center justify-center gap-1 text-xs text-orange-400 font-semibold">
                          <AlertTriangle className="w-3 h-3" />
                          <span>+{timeDiff.toFixed(1)}j écart</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
});

CircuitValidation.displayName = 'CircuitValidation';
