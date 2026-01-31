'use client';

import { useMemo, useState } from 'react';
import { AlertCircle, Clock, TrendingUp, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { blockedDossiers } from '@/lib/data';
import { useBlockedWorkspaceStore } from '@/lib/stores/blockedWorkspaceStore';
import type { BlockedDossier } from '@/lib/types/bmo.types';

type Props = {
  tabId: string;
  data?: Record<string, unknown>;
};

const IMPACT_ORDER = ['critical', 'high', 'medium', 'low'] as const;
const DELAY_RANGES = [
  { label: '30j+', min: 30, max: Infinity },
  { label: '15-30j', min: 15, max: 29 },
  { label: '8-14j', min: 8, max: 14 },
  { label: '0-7j', min: 0, max: 7 },
] as const;

const IMPACT_COLORS: Record<string, string> = {
  critical: 'bg-red-500',
  high: 'bg-amber-500',
  medium: 'bg-blue-500',
  low: 'bg-slate-400',
};

const IMPACT_LABELS: Record<string, string> = {
  critical: 'Critique',
  high: 'Élevé',
  medium: 'Moyen',
  low: 'Faible',
};

export function BlockedMatrixView({ tabId, data }: Props) {
  const { openTab, toggleSelected, selectedIds } = useBlockedWorkspaceStore();
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);

  const allData = blockedDossiers as unknown as BlockedDossier[];

  // Créer la matrice
  const matrix = useMemo(() => {
    const result: Record<string, Record<string, BlockedDossier[]>> = {};
    
    // Initialiser la matrice
    for (const range of DELAY_RANGES) {
      result[range.label] = {};
      for (const impact of IMPACT_ORDER) {
        result[range.label][impact] = [];
      }
    }

    // Remplir la matrice
    allData.forEach(d => {
      const delay = d.delay ?? 0;
      const range = DELAY_RANGES.find(r => delay >= r.min && delay <= r.max);
      if (range && result[range.label][d.impact]) {
        result[range.label][d.impact].push(d);
      }
    });

    return result;
  }, [allData]);

  // Stats globales
  const stats = useMemo(() => {
    let urgent = 0;
    let attention = 0;
    let normal = 0;

    // Urgent = critique + délai > 14j
    // Attention = high OU délai > 7j
    // Normal = le reste

    allData.forEach(d => {
      const delay = d.delay ?? 0;
      if (d.impact === 'critical' || (d.impact === 'high' && delay > 14)) {
        urgent++;
      } else if (d.impact === 'high' || delay > 7) {
        attention++;
      } else {
        normal++;
      }
    });

    return { urgent, attention, normal, total: allData.length };
  }, [allData]);

  const getCellStyle = (delayRange: string, impact: string) => {
    // Zone rouge = critique + délai long
    if (impact === 'critical' && (delayRange === '30j+' || delayRange === '15-30j')) {
      return 'bg-red-500/20 border-red-500/50 hover:bg-red-500/30';
    }
    // Zone orange = high + délai moyen OU critique + délai court
    if ((impact === 'high' && delayRange !== '0-7j') || (impact === 'critical' && delayRange === '8-14j')) {
      return 'bg-amber-500/20 border-amber-500/50 hover:bg-amber-500/30';
    }
    // Zone jaune = attention
    if (impact === 'high' || delayRange === '15-30j' || delayRange === '30j+') {
      return 'bg-yellow-500/10 border-yellow-500/30 hover:bg-yellow-500/20';
    }
    // Zone verte = normal
    return 'bg-slate-50 dark:bg-slate-800/30 border-slate-200/50 dark:border-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-800/50';
  };

  const handleCellClick = (dossiers: BlockedDossier[]) => {
    if (dossiers.length === 1) {
      openTab({
        type: 'dossier',
        id: `dossier:${dossiers[0].id}`,
        title: dossiers[0].id,
        icon: dossiers[0].impact === 'critical' ? '🚨' : '📄',
        data: { dossierId: dossiers[0].id, impact: dossiers[0].impact },
      });
    } else if (dossiers.length > 1) {
      // Sélectionner tous les dossiers de la cellule
      dossiers.forEach(d => {
        if (!selectedIds.has(d.id)) {
          toggleSelected(d.id);
        }
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-orange-500" />
          Matrice d'urgence
        </h2>
        <p className="text-sm text-slate-400">Impact × Délai - Priorisation visuelle des blocages</p>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30">
          <p className="text-xs text-slate-400 mb-1">Zone critique</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.urgent}</p>
        </div>
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
          <p className="text-xs text-slate-400 mb-1">Attention requise</p>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.attention}</p>
        </div>
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
          <p className="text-xs text-slate-400 mb-1">Normal</p>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.normal}</p>
        </div>
        <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50">
          <p className="text-xs text-slate-400 mb-1">Total</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
      </div>

      {/* Matrice */}
      <div className="rounded-xl border border-slate-200/70 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50">
                <th className="p-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider border-b border-slate-200/70 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Délai
                  </div>
                </th>
                {IMPACT_ORDER.map(impact => (
                  <th 
                    key={impact}
                    className="p-3 text-center text-xs font-medium uppercase tracking-wider border-b border-slate-200/70 dark:border-slate-800"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <span className={cn("w-3 h-3 rounded-full", IMPACT_COLORS[impact])} />
                      {IMPACT_LABELS[impact]}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DELAY_RANGES.map((range, rowIdx) => (
                <tr key={range.label}>
                  <td className={cn(
                    "p-3 text-sm font-medium border-b border-slate-200/70 dark:border-slate-800",
                    rowIdx < 2 ? "text-red-600 dark:text-red-400" : "text-slate-600 dark:text-slate-400"
                  )}>
                    <div className="flex items-center gap-2">
                      {rowIdx < 2 && <AlertCircle className="w-4 h-4" />}
                      {range.label}
                    </div>
                  </td>
                  {IMPACT_ORDER.map(impact => {
                    const dossiers = matrix[range.label][impact];
                    const count = dossiers.length;
                    const cellKey = `${range.label}-${impact}`;
                    
                    return (
                      <td 
                        key={impact}
                        className="p-2 border-b border-slate-200/70 dark:border-slate-800"
                      >
                        <button
                          onClick={() => count > 0 && handleCellClick(dossiers)}
                          onMouseEnter={() => setHoveredCell(cellKey)}
                          onMouseLeave={() => setHoveredCell(null)}
                          disabled={count === 0}
                          className={cn(
                            "w-full h-20 rounded-lg border transition-all flex flex-col items-center justify-center",
                            getCellStyle(range.label, impact),
                            count === 0 && "opacity-50 cursor-not-allowed"
                          )}
                        >
                          <span className={cn(
                            "text-2xl font-bold",
                            count > 0 && impact === 'critical' && "text-red-600 dark:text-red-400",
                            count > 0 && impact === 'high' && "text-amber-600 dark:text-amber-400"
                          )}>
                            {count}
                          </span>
                          {count > 0 && hoveredCell === cellKey && (
                            <span className="text-xs text-slate-400 mt-1">
                              Cliquer pour voir
                            </span>
                          )}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Légende */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
        <span className="font-medium">Légende:</span>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded bg-red-500/20 border border-red-500/50" />
          <span>Zone critique - Action immédiate</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded bg-amber-500/20 border border-amber-500/50" />
          <span>Attention requise</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded bg-yellow-500/10 border border-yellow-500/30" />
          <span>À surveiller</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded bg-slate-50 dark:bg-slate-800/30 border border-slate-200/50 dark:border-slate-700/50" />
          <span>Normal</span>
        </div>
      </div>
    </div>
  );
}

