'use client';

import { useEffect, useState, useCallback } from 'react';
import { useCalendarWorkspaceStore } from '@/lib/stores/calendarWorkspaceStore';
import { cn } from '@/lib/utils';
import { 
  CalendarDays, Clock, AlertTriangle, CheckCircle2, RefreshCw, Activity 
} from 'lucide-react';

type Stats = {
  total: number;
  today: number;
  thisWeek: number;
  overdueSLA: number;
  conflicts: number;
  completed: number;
  ts: string;
};

type CounterConfig = {
  key: keyof Stats;
  label: string;
  icon: typeof CalendarDays;
  bgClass: string;
  bgHoverClass: string;
  textClass: string;
  queue: string;
  critical?: boolean;
};

/**
 * Palette de couleurs professionnelles (moins saturées)
 */
const COUNTERS: CounterConfig[] = [
  { 
    key: 'today', label: "Aujourd'hui", icon: CalendarDays, 
    bgClass: 'bg-blue-100/50 dark:bg-blue-900/20', 
    bgHoverClass: 'hover:bg-blue-200/50 dark:hover:bg-blue-800/30', 
    textClass: 'text-blue-600/90 dark:text-blue-400/90', 
    queue: 'today',
    critical: true
  },
  { 
    key: 'thisWeek', label: 'Cette semaine', icon: CalendarDays, 
    bgClass: 'bg-emerald-100/50 dark:bg-emerald-900/20', 
    bgHoverClass: 'hover:bg-emerald-200/50 dark:hover:bg-emerald-800/30', 
    textClass: 'text-emerald-600/90 dark:text-emerald-400/90', 
    queue: 'week'
  },
  { 
    key: 'overdueSLA', label: 'Retard SLA', icon: Clock, 
    bgClass: 'bg-amber-100/50 dark:bg-amber-900/20', 
    bgHoverClass: 'hover:bg-amber-200/50 dark:hover:bg-amber-800/30', 
    textClass: 'text-amber-600/90 dark:text-amber-400/90', 
    queue: 'overdue',
    critical: true
  },
  { 
    key: 'conflicts', label: 'Conflits', icon: AlertTriangle, 
    bgClass: 'bg-rose-100/50 dark:bg-rose-900/20', 
    bgHoverClass: 'hover:bg-rose-200/50 dark:hover:bg-rose-800/30', 
    textClass: 'text-rose-600/90 dark:text-rose-400/90', 
    queue: 'conflicts',
    critical: true
  },
  { 
    key: 'completed', label: 'Terminés', icon: CheckCircle2, 
    bgClass: 'bg-slate-100/50 dark:bg-slate-800/30', 
    bgHoverClass: 'hover:bg-slate-200/50 dark:hover:bg-slate-700/40', 
    textClass: 'text-slate-600/90 dark:text-slate-400/90', 
    queue: 'completed'
  },
];

export function CalendarLiveCounters({ compact = false }: { compact?: boolean }) {
  const { openTab } = useCalendarWorkspaceStore();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      // TODO: Brancher sur vraie API
      // const res = await fetch('/api/calendar/stats', { cache: 'no-store' });
      // if (res.ok) setStats(await res.json());
      
      // Mock pour l'instant
      await new Promise(r => setTimeout(r, 300));
      setStats({
        total: 47,
        today: 3,
        thisWeek: 12,
        overdueSLA: 2,
        conflicts: 1,
        completed: 29,
        ts: new Date().toISOString(),
      });
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

  const handleClick = (queue: string, label: string) => {
    const icons: Record<string, string> = {
      today: '📅',
      week: '📆',
      overdue: '⏰',
      conflicts: '⚠️',
      completed: '✅',
    };
    
    openTab({
      id: `inbox:${queue}`,
      type: 'inbox',
      title: label,
      icon: icons[queue] ?? '📄',
      data: { queue },
    });
  };

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        {COUNTERS.map(c => {
          const value = stats?.[c.key as keyof Stats] ?? 0;
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
              onClick={() => handleClick(c.queue, c.label)}
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
          <Activity className="w-4 h-4 text-slate-400" />
          État du calendrier
        </h3>
        <button
          onClick={fetchStats}
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
          disabled={loading}
        >
          <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
        </button>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {COUNTERS.map(c => {
          const value = stats?.[c.key as keyof Stats] ?? 0;
          const Icon = c.icon;
          const isCritical = c.critical && (typeof value === 'number' && value > 0);

          return (
            <button
              key={c.key}
              className={cn(
                "p-3 rounded-xl transition-all group",
                c.bgClass,
                c.bgHoverClass,
                isCritical && "ring-2 ring-amber-500/30 animate-pulse"
              )}
              onClick={() => handleClick(c.queue, c.label)}
            >
              <Icon className={cn("w-5 h-5 mb-1", c.textClass)} />
              <div className={cn("text-2xl font-bold", c.textClass)}>
                {typeof value === 'number' ? value : 0}
              </div>
              <div className="text-xs text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300">
                {c.label}
              </div>
            </button>
          );
        })}
      </div>

      {stats && (
        <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
          <span>{stats.total} événements au total</span>
          <span>Mis à jour {new Date(stats.ts).toLocaleTimeString('fr-FR')}</span>
        </div>
      )}
    </div>
  );
}

