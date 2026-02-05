'use client';
import { useEffect, useState } from 'react';
import { employesApiService, type EmployesStats } from '@/lib/services/employesApiService';
import { X, Shield, AlertTriangle, DollarSign, Users, Star, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/cn';
import { logger } from '@/lib/utils/logger';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function EmployesDirectionPanel({ open, onClose }: Props) {
  const [stats, setStats] = useState<EmployesStats | null>(null);

  useEffect(() => {
    if (!open) return;

    const load = async () => {
      try {
        setStats(await employesApiService.getStats());
      } catch (e) {
        logger.error('Employes stats load failed', e as Error, { context: 'EmployesDirectionPanel' });
      }
    };

    void load();
    const i = window.setInterval(() => void load(), 30000);
    return () => window.clearInterval(i);
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed top-0 right-0 h-full w-80 bg-white dark:bg-[#1f1f1f] border-l border-slate-200 dark:border-slate-800 shadow-xl z-40 flex flex-col">
      <div className="flex-none p-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Centre de Pilotage RH</h3>
            <p className="text-xs text-slate-400">Effectifs en temps réel</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {!stats ? (
          <div className="space-y-3 animate-pulse">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 rounded-xl bg-slate-100 dark:bg-slate-800" />
            ))}
          </div>
        ) : (
          <>
            {stats.spofCount > 2 && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-red-500" />
                  <span className="font-semibold text-red-600">SPOF Critiques</span>
                </div>
                <p className="text-2xl font-bold text-red-600">{stats.spofCount}</p>
                <p className="text-xs text-red-500/80">Compétences uniques non redondantes</p>
              </div>
            )}

            {stats.riskCount > 0 && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span className="font-semibold text-amber-600">Employés à risque</span>
                </div>
                <p className="text-2xl font-bold text-amber-600">{stats.riskCount}</p>
                <p className="text-xs text-amber-500/80">Score de risque &gt; 50%</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/20">
                <Users className="w-4 h-4 text-teal-500 mb-1" />
                <p className="text-xl font-bold text-teal-600">{stats.actifs}</p>
                <p className="text-xs text-slate-400">Actifs</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <Star className="w-4 h-4 text-blue-500 mb-1" />
                <p className="text-xl font-bold text-blue-600">{stats.avgEvaluation.toFixed(1)}</p>
                <p className="text-xs text-slate-400">Note moy.</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-4 h-4 text-emerald-500" />
                <span className="text-sm font-medium">Masse salariale</span>
              </div>
              <p className="text-xl font-bold text-emerald-600">
                {employesApiService.formatMontant(stats.salaireTotal)} FCFA
              </p>
            </div>
          </>
        )}
      </div>

      <div className="flex-none p-4 border-t border-slate-200 dark:border-slate-800">
        <p className="text-xs text-slate-400 text-center">Mise à jour auto toutes les 30s</p>
      </div>
    </div>
  );
}

