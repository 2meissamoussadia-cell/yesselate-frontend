'use client';

import { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, Calendar, AlertTriangle, DollarSign, Ban } from 'lucide-react';
import { cn } from '@/lib/utils';
import { paiementsApiService, type PaiementsStats } from '@/lib/services/paiementsApiService';
import { usePaiementsWorkspaceStore } from '@/lib/stores/paiementsWorkspaceStore';

interface Props {
  onOpenQueue: (queue: string, title: string, icon: string) => void;
}

export function PaiementsLiveCounters({ onOpenQueue }: Props) {
  const { openTab } = usePaiementsWorkspaceStore();
  const [stats, setStats] = useState<PaiementsStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await paiementsApiService.getStats();
        setStats(data);
      } catch (error) {
        console.error('Failed to load stats:', error);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
    const interval = setInterval(loadStats, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !stats) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 animate-pulse">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="h-24 rounded-xl bg-slate-100 dark:bg-slate-800" />
        ))}
      </div>
    );
  }

  const counters = [
    { key: 'pending', label: 'À valider', value: stats.pending, icon: Clock, color: stats.pending > 0 ? 'amber' : 'slate', action: () => onOpenQueue('pending', 'À valider', '⏳') },
    { key: 'critical', label: 'Urgents', value: stats.byUrgency?.critical || 0, icon: AlertTriangle, color: (stats.byUrgency?.critical || 0) > 0 ? 'red' : 'slate', action: () => onOpenQueue('critical', 'Urgents', '🚨') },
    { key: 'blocked', label: 'Bloqués', value: stats.blocked, icon: Ban, color: stats.blocked > 0 ? 'red' : 'slate', action: () => onOpenQueue('blocked', 'Bloqués', '🚫') },
    { key: 'validated', label: 'Validés', value: stats.validated, icon: CheckCircle, color: 'emerald', action: () => onOpenQueue('validated', 'Validés', '✅') },
    { key: 'scheduled', label: 'Planifiés', value: stats.scheduled, icon: Calendar, color: 'blue', action: () => onOpenQueue('scheduled', 'Planifiés', '📅') },
    { key: 'echeancesJ7', label: 'Échéances J+7', value: stats.echeancesJ7, icon: Clock, color: stats.echeancesJ7 > 0 ? 'orange' : 'slate', action: () => openTab({ type: 'echeancier', title: 'Échéancier', icon: '📅', data: {} }) },
    { key: 'tresorerie', label: 'Trésorerie', value: paiementsApiService.formatMontant(stats.tresorerieDisponible), suffix: 'FCFA', icon: DollarSign, color: 'emerald', action: () => openTab({ type: 'tresorerie', title: 'Trésorerie', icon: '💰', data: {} }) },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
      {counters.map((counter) => {
        const Icon = counter.icon;
        const hasValue = typeof counter.value === 'number' ? counter.value > 0 : true;
        
        return (
          <button
            key={counter.key}
            onClick={counter.action}
            className={cn(
              "p-4 rounded-xl border text-left transition-all hover:shadow-md",
              hasValue && counter.color !== 'slate'
                ? `bg-${counter.color}-500/10 border-${counter.color}-500/30 hover:border-${counter.color}-500/50`
                : "bg-slate-50 dark:bg-slate-900/50 border-slate-200/50 dark:border-slate-800/50"
            )}
          >
            <div className="flex items-center gap-2 mb-2">
              <Icon className={cn(
                "w-4 h-4",
                hasValue && counter.color !== 'slate'
                  ? counter.color === 'red' ? 'text-red-500' :
                    counter.color === 'amber' ? 'text-amber-500' :
                    counter.color === 'orange' ? 'text-orange-500' :
                    counter.color === 'blue' ? 'text-blue-500' :
                    counter.color === 'emerald' ? 'text-emerald-500' :
                    'text-slate-400'
                  : 'text-slate-400',
                counter.key === 'critical' && (stats.byUrgency?.critical || 0) > 0 && 'animate-pulse'
              )} />
              <span className="text-xs text-slate-400 font-medium">{counter.label}</span>
            </div>
            <p className={cn(
              "text-xl font-bold",
              hasValue && counter.color !== 'slate'
                ? counter.color === 'red' ? 'text-red-600 dark:text-red-400' :
                  counter.color === 'amber' ? 'text-amber-600 dark:text-amber-400' :
                  counter.color === 'emerald' ? 'text-emerald-600 dark:text-emerald-400' :
                  'text-slate-900 dark:text-slate-100'
                : 'text-slate-900 dark:text-slate-100'
            )}>
              {counter.value}
              {counter.suffix && <span className="text-xs font-normal text-slate-400 ml-1">{counter.suffix}</span>}
            </p>
          </button>
        );
      })}
    </div>
  );
}

