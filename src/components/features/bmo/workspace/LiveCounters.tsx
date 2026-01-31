'use client';

import { useEffect, useState, useCallback } from 'react';
import { 
  Inbox, AlertTriangle, Clock, CheckCircle2, XCircle, 
  TrendingUp, TrendingDown, Minus, RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';

type Stats = {
  total: number;
  pending: number;
  validated: number;
  rejected: number;
  urgent: number;
  overdue: number;
  avgDelay: number;
};

type CounterConfig = {
  key: keyof Stats;
  label: string;
  icon: typeof Inbox;
  color: string;
  bgColor: string;
  critical?: boolean;
};

const COUNTERS: CounterConfig[] = [
  { key: 'pending', label: 'À traiter', icon: Inbox, color: 'text-amber-500', bgColor: 'bg-amber-500/10' },
  { key: 'urgent', label: 'Urgentes', icon: AlertTriangle, color: 'text-rose-500', bgColor: 'bg-rose-500/10', critical: true },
  { key: 'overdue', label: 'En retard', icon: Clock, color: 'text-orange-500', bgColor: 'bg-orange-500/10', critical: true },
  { key: 'validated', label: 'Validées', icon: CheckCircle2, color: 'text-emerald-500', bgColor: 'bg-emerald-500/10' },
  { key: 'rejected', label: 'Rejetées', icon: XCircle, color: 'text-slate-400', bgColor: 'bg-slate-500/10' },
];

type Props = {
  onOpenQueue?: (queue: string) => void;
  compact?: boolean;
};

export function LiveCounters({ onOpenQueue, compact = false }: Props) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [prevStats, setPrevStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/demands/stats', { cache: 'no-store' });
      if (!res.ok) throw new Error('Stats unavailable');
      const data = await res.json();
      
      setPrevStats(stats);
      setStats(data);
      setLastUpdate(new Date());
    } catch (e) {
      console.error('Erreur stats:', e);
    } finally {
      setLoading(false);
    }
  }, [stats]);

  useEffect(() => {
    fetchStats();
    // Auto-refresh toutes les 30 secondes
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getTrend = (key: keyof Stats): 'up' | 'down' | 'same' => {
    if (!stats || !prevStats) return 'same';
    const current = stats[key];
    const prev = prevStats[key];
    if (current > prev) return 'up';
    if (current < prev) return 'down';
    return 'same';
  };

  const TrendIcon = ({ trend }: { trend: 'up' | 'down' | 'same' }) => {
    if (trend === 'up') return <TrendingUp className="w-3 h-3 text-rose-500" />;
    if (trend === 'down') return <TrendingDown className="w-3 h-3 text-emerald-500" />;
    return <Minus className="w-3 h-3 text-slate-400" />;
  };

  if (loading) {
    return (
      <div className={cn(
        "flex items-center gap-2",
        compact ? "flex-wrap" : "grid grid-cols-5 gap-3"
      )}>
        {COUNTERS.map((c) => (
          <div
            key={c.key}
            className={cn(
              "rounded-xl animate-pulse",
              compact 
                ? "h-10 w-24 bg-slate-200 dark:bg-slate-800" 
                : "h-20 bg-slate-200 dark:bg-slate-800"
            )}
          />
        ))}
      </div>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center gap-1 flex-wrap">
        {COUNTERS.map((c) => {
          const Icon = c.icon;
          const value = stats?.[c.key] ?? 0;
          const isCritical = c.critical && value > 0;
          
          return (
            <button
              key={c.key}
              onClick={() => onOpenQueue?.(c.key === 'pending' ? 'pending' : c.key)}
              className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium transition-all",
                c.bgColor,
                c.color,
                isCritical && "animate-pulse ring-2 ring-rose-500/50",
                "hover:scale-105 active:scale-95"
              )}
              title={c.label}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="font-bold tabular-nums">{value}</span>
            </button>
          );
        })}
        
        {/* Indicateur de mise à jour */}
        <button
          onClick={fetchStats}
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-400"
          title={lastUpdate ? `Mis à jour: ${lastUpdate.toLocaleTimeString()}` : 'Actualiser'}
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {COUNTERS.map((c) => {
        const Icon = c.icon;
        const value = stats?.[c.key] ?? 0;
        const trend = getTrend(c.key);
        const isCritical = c.critical && value > 0;
        
        return (
          <button
            key={c.key}
            onClick={() => onOpenQueue?.(c.key === 'pending' ? 'pending' : c.key)}
            className={cn(
              "p-4 rounded-2xl border transition-all text-left",
              "hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]",
              c.bgColor,
              isCritical 
                ? "border-rose-500/50 ring-2 ring-rose-500/30 animate-pulse" 
                : "border-transparent"
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <Icon className={cn("w-5 h-5", c.color)} />
              <TrendIcon trend={trend} />
            </div>
            <div className={cn("text-2xl font-bold tabular-nums", c.color)}>
              {value}
            </div>
            <div className="text-xs text-slate-400 mt-1">{c.label}</div>
          </button>
        );
      })}
    </div>
  );
}

