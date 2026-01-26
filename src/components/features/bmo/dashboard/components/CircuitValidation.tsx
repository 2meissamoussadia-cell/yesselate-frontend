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
    bg: 'bg-gradient-to-br from-blue-500/15 to-blue-600/10',
    border: 'border-blue-500/40',
    text: 'text-blue-300',
    glow: 'shadow-blue-500/20',
    badge: 'bg-blue-500/20 border-blue-500/40 text-blue-200',
  },
  purple: {
    bg: 'bg-gradient-to-br from-purple-500/15 to-purple-600/10',
    border: 'border-purple-500/40',
    text: 'text-purple-300',
    glow: 'shadow-purple-500/20',
    badge: 'bg-purple-500/20 border-purple-500/40 text-purple-200',
  },
  green: {
    bg: 'bg-gradient-to-br from-emerald-500/15 to-emerald-600/10',
    border: 'border-emerald-500/40',
    text: 'text-emerald-300',
    glow: 'shadow-emerald-500/20',
    badge: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-200',
  },
  orange: {
    bg: 'bg-gradient-to-br from-orange-500/15 to-orange-600/10',
    border: 'border-orange-500/40',
    text: 'text-orange-300',
    glow: 'shadow-orange-500/20',
    badge: 'bg-orange-500/20 border-orange-500/40 text-orange-200',
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
    <div className={cn('rounded-2xl border border-slate-800/60 bg-slate-900/40 backdrop-blur-sm p-6 shadow-lg', className)}>
      {/* Flow horizontal avec étapes */}
      <div className="flex items-stretch gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800">
        {stages.map((stage, idx) => {
          const colors = colorConfig[stage.color];
          const timeDiff = stage.avgTime - stage.targetTime;
          const isDelayed = timeDiff > 0;

          return (
            <React.Fragment key={stage.id}>
              {/* Flèche de connexion moderne */}
              {idx > 0 && (
                <div className="flex items-center justify-center min-w-[2rem]">
                  <div className="relative flex items-center">
                    <div className="h-px w-8 bg-gradient-to-r from-slate-700/50 to-slate-600/30" />
                    <div className="relative">
                      <div className="w-0 h-0 border-t-[6px] border-b-[6px] border-l-[8px] border-transparent border-l-slate-600/50" />
                      <div className="absolute inset-0 w-0 h-0 border-t-[4px] border-b-[4px] border-l-[6px] border-transparent border-l-slate-700/80" />
                    </div>
                  </div>
                </div>
              )}

              {/* Étape moderne */}
              <div className="flex-1 min-w-[160px] max-w-[200px]">
                <div
                  className={cn(
                    'group relative rounded-2xl p-5 text-center border backdrop-blur-sm',
                    'h-full flex flex-col transition-all duration-300',
                    'hover:shadow-xl hover:scale-[1.02]',
                    colors.bg,
                    colors.border,
                    stage.isBottleneck 
                      ? 'ring-2 ring-orange-500/60 ring-offset-2 ring-offset-slate-900 shadow-lg shadow-orange-500/20 border-orange-500/60' 
                      : 'shadow-md',
                    colors.glow
                  )}
                >
                  {/* Accent bar en haut pour goulot */}
                  {stage.isBottleneck && (
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-orange-500 to-orange-400 rounded-t-2xl" />
                  )}

                  {/* Badge goulot moderne */}
                  {stage.isBottleneck && (
                    <div className="absolute -top-2.5 -right-2.5 z-20">
                      <div className="relative px-2.5 py-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-[10px] font-bold rounded-lg shadow-lg shadow-orange-500/40 flex items-center gap-1.5 border border-orange-400/50">
                        <AlertTriangle className="w-3 h-3 flex-shrink-0" style={{ width: '0.75rem', height: '0.75rem', minWidth: '0.75rem', minHeight: '0.75rem' }} />
                        <span>Goulot</span>
                      </div>
                    </div>
                  )}

                  {/* Bureau badge moderne */}
                  {stage.bureau && (
                    <div className="mb-3 flex justify-center">
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-[10px] font-semibold px-2 py-0.5 rounded-md border',
                          colors.badge
                        )}
                      >
                        {stage.bureau}
                      </Badge>
                    </div>
                  )}

                  {/* Nombre principal */}
                  <div className={cn('text-4xl font-bold mb-2 leading-none', colors.text)}>
                    {stage.count}
                  </div>
                  
                  {/* Label */}
                  <div className="text-xs font-medium text-slate-300 mb-4 leading-snug">
                    {stage.label}
                  </div>

                  {/* Métriques temps */}
                  {stage.avgTime > 0 && (
                    <div className="mt-auto space-y-2 pt-4 border-t border-slate-700/40">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 font-medium">Moyen:</span>
                        <span
                          className={cn(
                            'font-bold',
                            isDelayed ? 'text-orange-300' : 'text-emerald-300'
                          )}
                        >
                          {stage.avgTime.toFixed(1)}j
                        </span>
                      </div>
                      {stage.targetTime > 0 && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500">Objectif:</span>
                          <span className="text-slate-300 font-medium">{stage.targetTime.toFixed(1)}j</span>
                        </div>
                      )}
                      {isDelayed && (
                        <div className="flex items-center justify-center gap-1.5 pt-1">
                          <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-orange-500/15 border border-orange-500/30">
                            <AlertTriangle className="w-3 h-3 text-orange-300 flex-shrink-0" style={{ width: '0.75rem', height: '0.75rem', minWidth: '0.75rem', minHeight: '0.75rem' }} />
                            <span className="text-[10px] text-orange-300 font-semibold">
                              +{timeDiff.toFixed(1)}j écart
                            </span>
                          </div>
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
