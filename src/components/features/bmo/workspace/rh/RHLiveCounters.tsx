'use client';

import { useState, useCallback, useMemo } from 'react';
import { 
  Inbox, AlertTriangle, Clock, CheckCircle2, XCircle, 
  TrendingUp, TrendingDown, Minus, RefreshCw,
  HeartPulse, Wallet, Plane
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { demandesRH } from '@/lib/data/bmo-mock-2';

type Stats = {
  total: number;
  pending: number;
  validated: number;
  rejected: number;
  urgent: number;
  conges: number;
  depenses: number;
  maladies: number;
  deplacements: number;
  paie: number;
};

type CounterConfig = {
  key: keyof Stats;
  label: string;
  icon: typeof Inbox;
  color: string;
  bgColor: string;
  critical?: boolean;
  queue?: string;
};

const COUNTERS: CounterConfig[] = [
  { key: 'pending', label: 'À traiter', icon: Inbox, color: 'text-amber-500', bgColor: 'bg-amber-500/10', queue: 'pending' },
  { key: 'urgent', label: 'Urgentes', icon: AlertTriangle, color: 'text-rose-500', bgColor: 'bg-rose-500/10', critical: true, queue: 'urgent' },
  { key: 'conges', label: 'Congés', icon: HeartPulse, color: 'text-emerald-500', bgColor: 'bg-emerald-500/10', queue: 'Congé' },
  { key: 'depenses', label: 'Dépenses', icon: Wallet, color: 'text-amber-500', bgColor: 'bg-amber-500/10', queue: 'Dépense' },
  { key: 'deplacements', label: 'Déplacements', icon: Plane, color: 'text-blue-500', bgColor: 'bg-blue-500/10', queue: 'Déplacement' },
  { key: 'validated', label: 'Validées', icon: CheckCircle2, color: 'text-emerald-500', bgColor: 'bg-emerald-500/10', queue: 'validated' },
];

type Props = {
  onOpenQueue?: (queue: string) => void;
  compact?: boolean;
};

export function RHLiveCounters({ onOpenQueue, compact = false }: Props) {
  const [prevStats, setPrevStats] = useState<Stats | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Calculer les stats en temps réel à partir des données mockées
  const stats = useMemo<Stats>(() => {
    return {
      total: demandesRH.length,
      pending: demandesRH.filter(d => d.status === 'pending').length,
      validated: demandesRH.filter(d => d.status === 'validated').length,
      rejected: demandesRH.filter(d => d.status === 'rejected').length,
      urgent: demandesRH.filter(d => d.priority === 'urgent' && d.status === 'pending').length,
      conges: demandesRH.filter(d => d.type === 'Congé').length,
      depenses: demandesRH.filter(d => d.type === 'Dépense').length,
      maladies: demandesRH.filter(d => d.type === 'Maladie').length,
      deplacements: demandesRH.filter(d => d.type === 'Déplacement').length,
      paie: demandesRH.filter(d => d.type === 'Paie').length,
    };
  }, []);

  const fetchStats = useCallback(() => {
    setPrevStats(stats);
    setLastUpdate(new Date());
  }, [stats]);

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

  if (compact) {
    return (
      <div className="flex items-center gap-1 flex-wrap">
        {COUNTERS.map((c) => {
          const Icon = c.icon;
          const value = stats[c.key];
          const isCritical = c.critical && value > 0;
          
          return (
            <button
              key={c.key}
              onClick={() => onOpenQueue?.(c.queue || c.key)}
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
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {COUNTERS.map((c) => {
        const Icon = c.icon;
        const value = stats[c.key];
        const trend = getTrend(c.key);
        const isCritical = c.critical && value > 0;
        
        return (
          <button
            key={c.key}
            onClick={() => onOpenQueue?.(c.queue || c.key)}
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
              {prevStats && <TrendIcon trend={trend} />}
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

