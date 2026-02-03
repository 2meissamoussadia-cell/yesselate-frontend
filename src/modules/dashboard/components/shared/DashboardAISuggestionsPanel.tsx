/**
 * Phase 3 #10 — Panel Suggestions IA : prédictions, anomalies, recommandations
 * Consomme GET /api/ai/suggestions (mock ou modèle réel)
 */

'use client';

import React, { useEffect, useState } from 'react';
import { Brain, TrendingUp, AlertTriangle, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAchievementsStore } from '@/lib/stores/achievementsStore';

export type SuggestionType = 'prediction' | 'anomaly' | 'recommendation';
export interface AISuggestion {
  id: string;
  type: SuggestionType;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  context?: string;
  actionLabel?: string;
  actionRoute?: string;
  createdAt: string;
}

const TYPE_CONFIG: Record<SuggestionType, { icon: React.ComponentType<{ className?: string }>; label: string; color: string }> = {
  prediction: { icon: TrendingUp, label: 'Prédiction', color: 'text-blue-400' },
  anomaly: { icon: AlertTriangle, label: 'Anomalie', color: 'text-amber-400' },
  recommendation: { icon: Lightbulb, label: 'Recommandation', color: 'text-emerald-400' },
};

export function DashboardAISuggestionsPanel() {
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);

  const unlockAchievement = useAchievementsStore((s) => s.unlock);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/ai/suggestions')
      .then((res) => res.ok ? res.json() : Promise.reject(new Error('Failed')))
      .then((data) => {
        if (!cancelled) {
          setSuggestions(data.suggestions ?? []);
          unlockAchievement('ia_suggestions');
        }
      })
      .catch(() => {
        if (!cancelled) setSuggestions([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [unlockAchievement]);

  if (loading || suggestions.length === 0) return null;

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700/50 bg-white/50 dark:bg-slate-900/50 overflow-hidden">
      <button
        type="button"
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center justify-between gap-2 px-4 py-3 text-left hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors"
        aria-expanded={!collapsed}
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
          <Brain className="h-4 w-4 text-violet-500" />
          Suggestions IA
        </span>
        {collapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
      </button>
      {!collapsed && (
        <div className="px-4 pb-4 space-y-3">
          {suggestions.map((s) => {
            const config = TYPE_CONFIG[s.type];
            const Icon = config.icon;
            return (
              <div
                key={s.id}
                className={cn(
                  'rounded-lg border p-3',
                  s.severity === 'critical' && 'border-rose-500/30 bg-rose-500/5',
                  s.severity === 'high' && 'border-amber-500/30 bg-amber-500/5',
                  (s.severity === 'medium' || s.severity === 'low') && 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30'
                )}
              >
                <div className="flex items-start gap-2">
                  <Icon className={cn('h-4 w-4 shrink-0 mt-0.5', config.color)} />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{config.label}</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{s.title}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{s.description}</p>
                    {s.actionLabel && s.actionRoute && (
                      <a
                        href={s.actionRoute}
                        className="inline-block mt-2 text-xs font-medium text-sky-500 hover:text-sky-400"
                      >
                        {s.actionLabel} →
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
