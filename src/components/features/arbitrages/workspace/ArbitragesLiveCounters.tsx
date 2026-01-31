'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useArbitragesWorkspaceStore } from '@/lib/stores/arbitragesWorkspaceStore';
import { cn } from '@/lib/utils';
import { 
  Scale, Clock, AlertTriangle, CheckCircle, RefreshCw, Building2 
} from 'lucide-react';

type ArbitrageStats = {
  total: number;
  ouverts: number;
  tranches: number;
  critiques: number;
  enRetard: number;
  expositionTotale: number;
  simplesPending: number;
  simplesResolved: number;
  simplesUrgent: number;
  bureauxSurcharge: number;
  totalGoulots: number;
  ts: string;
};

type CounterConfig = {
  key: keyof ArbitrageStats;
  label: string;
  icon: typeof Scale;
  bgClass: string;
  bgHoverClass: string;
  textClass: string;
  queue: string;
  type: 'arbitrages' | 'bureaux';
  critical?: boolean;
};

const COUNTERS: CounterConfig[] = [
  { 
    key: 'ouverts', label: 'Ouverts', icon: Scale, 
    bgClass: 'bg-amber-100/50 dark:bg-amber-900/20', 
    bgHoverClass: 'hover:bg-amber-200/50 dark:hover:bg-amber-800/30', 
    textClass: 'text-amber-600/90 dark:text-amber-400/90', 
    queue: 'ouverts', type: 'arbitrages'
  },
  { 
    key: 'critiques', label: 'Critiques', icon: AlertTriangle, 
    bgClass: 'bg-red-100/50 dark:bg-red-900/20', 
    bgHoverClass: 'hover:bg-red-200/50 dark:hover:bg-red-800/30', 
    textClass: 'text-red-600/90 dark:text-red-400/90', 
    queue: 'critiques', type: 'arbitrages', critical: true
  },
  { 
    key: 'simplesUrgent', label: 'Urgents', icon: Clock, 
    bgClass: 'bg-orange-100/50 dark:bg-orange-900/20', 
    bgHoverClass: 'hover:bg-orange-200/50 dark:hover:bg-orange-800/30', 
    textClass: 'text-orange-600/90 dark:text-orange-400/90', 
    queue: 'urgents', type: 'arbitrages', critical: true
  },
  { 
    key: 'tranches', label: 'Tranchés', icon: CheckCircle, 
    bgClass: 'bg-emerald-100/50 dark:bg-emerald-900/20', 
    bgHoverClass: 'hover:bg-emerald-200/50 dark:hover:bg-emerald-800/30', 
    textClass: 'text-emerald-600/90 dark:text-emerald-400/90', 
    queue: 'tranches', type: 'arbitrages'
  },
  { 
    key: 'bureauxSurcharge', label: 'Surcharge', icon: Building2, 
    bgClass: 'bg-rose-100/50 dark:bg-rose-900/20', 
    bgHoverClass: 'hover:bg-rose-200/50 dark:hover:bg-rose-800/30', 
    textClass: 'text-rose-600/90 dark:text-rose-400/90', 
    queue: 'surcharge', type: 'bureaux', critical: true
  },
];

export function ArbitragesLiveCounters({ compact = false }: { compact?: boolean }) {
  const { openTab } = useArbitragesWorkspaceStore();
  const [stats, setStats] = useState<ArbitrageStats | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/arbitrages/stats', { cache: 'no-store' });
      if (res.ok) {
        const stats = await res.json();
        setStats(stats);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  const handleClick = (queue: string, label: string, type: 'arbitrages' | 'bureaux') => {
    const icons: Record<string, string> = {
      ouverts: '⏳',
      critiques: '🚨',
      urgents: '⏰',
      tranches: '✅',
      surcharge: '🔥',
      goulots: '⚠️',
    };

    openTab({
      id: `inbox:${queue}`,
      type: 'inbox',
      title: label,
      icon: icons[queue] || '📋',
      data: { queue, type },
    });
  };

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        {COUNTERS.map(c => {
          const value = stats?.[c.key as keyof ArbitrageStats] ?? 0;
          const Icon = c.icon;
          const isCritical = c.critical && (typeof value === 'number' && value > 0);
          
          return (
            <button
              key={c.key}
              className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-lg transition-colors",
                c.bgHoverClass,
                isCritical && "animate-pulse"
              )}
              onClick={() => handleClick(c.queue, c.label, c.type)}
              title={`${c.label}: ${value}`}
            >
              <Icon className={cn("w-3 h-3", c.textClass)} />
              <span className={cn("text-xs font-semibold", c.textClass)}>
                {typeof value === 'number' ? value : 0}
              </span>
            </button>
          );
        })}
        
        <button
          onClick={fetchStats}
          className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
          disabled={loading}
        >
          <RefreshCw className={cn("w-3 h-3", loading && "animate-spin")} />
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200/60 bg-white/70 p-4 dark:border-slate-700/50 dark:bg-[#1f1f1f]/60 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold flex items-center gap-2 text-slate-700 dark:text-slate-300">
          <Scale className="w-4 h-4 text-slate-400" />
          Compteurs live
        </h3>
        <button
          onClick={fetchStats}
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
          disabled={loading}
          title="Rafraîchir"
        >
          <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
        </button>
      </div>

      <div className="grid grid-cols-3 lg:grid-cols-5 gap-2">
        {COUNTERS.map(c => {
          const value = stats?.[c.key as keyof ArbitrageStats] ?? 0;
          const Icon = c.icon;
          const isCritical = c.critical && (typeof value === 'number' && value > 0);
          
          return (
            <button
              key={c.key}
              className={cn(
                "p-3 rounded-xl transition-all text-center",
                c.bgClass,
                c.bgHoverClass,
                isCritical && "ring-2 ring-red-500/30 animate-pulse"
              )}
              onClick={() => handleClick(c.queue, c.label, c.type)}
            >
              <Icon className={cn("w-5 h-5 mx-auto mb-1", c.textClass)} />
              <div className={cn("text-2xl font-bold", c.textClass)}>
                {typeof value === 'number' ? value : 0}
              </div>
              <div className="text-[10px] text-slate-400 dark:text-slate-400 mt-0.5">
                {c.label}
              </div>
            </button>
          );
        })}
      </div>

      {stats && (
        <div className="mt-3 text-xs text-slate-400 text-right">
          MAJ: {new Date(stats.ts).toLocaleTimeString('fr-FR')}
        </div>
      )}
    </div>
  );
}


