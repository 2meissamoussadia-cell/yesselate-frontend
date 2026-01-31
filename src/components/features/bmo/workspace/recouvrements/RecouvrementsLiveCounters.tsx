'use client';

import { useState, useEffect } from 'react';
import { DollarSign, Clock, CheckCircle, AlertTriangle, XCircle, TrendingUp, CalendarClock, Percent } from 'lucide-react';
import { cn } from '@/lib/utils';
import { recouvrementsApiService, type RecouvrementsStats } from '@/lib/services/recouvrementsApiService';

interface Props {
  onOpenQueue: (queue: string, title: string, icon: string) => void;
}

export function RecouvrementsLiveCounters({ onOpenQueue }: Props) {
  const [stats, setStats] = useState<RecouvrementsStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try { const data = await recouvrementsApiService.getStats(); setStats(data); }
      catch (error) { console.error('Failed:', error); }
      finally { setLoading(false); }
    };
    loadStats();
    const interval = setInterval(loadStats, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !stats) {
    return <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 animate-pulse">{[...Array(8)].map((_, i) => <div key={i} className="h-24 rounded-xl bg-slate-100 dark:bg-slate-800" />)}</div>;
  }

  const counters = [
    { key: 'total', label: 'Total créances', value: recouvrementsApiService.formatMontant(stats.montantTotal), suffix: 'FCFA', icon: DollarSign, color: 'blue', action: () => onOpenQueue('all', 'Toutes', '💰') },
    { key: 'pending', label: 'En attente', value: stats.pending, icon: Clock, color: stats.pending > 0 ? 'amber' : 'slate', action: () => onOpenQueue('pending', 'En attente', '⏳') },
    { key: 'in_progress', label: 'En cours', value: stats.in_progress, icon: TrendingUp, color: stats.in_progress > 0 ? 'blue' : 'slate', action: () => onOpenQueue('in_progress', 'En cours', '🔄') },
    { key: 'paid', label: 'Payées', value: stats.paid, icon: CheckCircle, color: 'emerald', action: () => onOpenQueue('paid', 'Payées', '✅') },
    { key: 'litige', label: 'En litige', value: stats.litige, icon: AlertTriangle, color: stats.litige > 0 ? 'red' : 'slate', action: () => onOpenQueue('litige', 'En litige', '⚠️') },
    { key: 'overdue', label: 'En retard', value: recouvrementsApiService.formatMontant(stats.montantEnRetard), suffix: 'FCFA', icon: CalendarClock, color: stats.montantEnRetard > 0 ? 'red' : 'slate', action: () => onOpenQueue('overdue', 'En retard', '⏰') },
    { key: 'irrecoverable', label: 'Irrécouvrables', value: stats.irrecoverable, icon: XCircle, color: stats.irrecoverable > 0 ? 'slate' : 'slate', action: () => onOpenQueue('irrecoverable', 'Irrécouvrables', '❌') },
    { key: 'taux', label: 'Taux recouvrement', value: `${stats.tauxRecouvrement}%`, icon: Percent, color: stats.tauxRecouvrement >= 80 ? 'emerald' : stats.tauxRecouvrement >= 50 ? 'amber' : 'red', action: () => {} },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
      {counters.map((counter) => {
        const Icon = counter.icon;
        return (
          <button key={counter.key} onClick={counter.action} className={cn("p-4 rounded-xl border text-left transition-all hover:shadow-md", `bg-${counter.color}-500/10 border-${counter.color}-500/30`)}>
            <div className="flex items-center gap-2 mb-2">
              <Icon className={cn("w-4 h-4", counter.color === 'emerald' ? 'text-emerald-500' : counter.color === 'blue' ? 'text-blue-500' : counter.color === 'amber' ? 'text-amber-500' : counter.color === 'red' ? 'text-red-500' : 'text-slate-400')} />
              <span className="text-xs text-slate-400 font-medium truncate">{counter.label}</span>
            </div>
            <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{counter.value}{counter.suffix && <span className="text-xs font-normal text-slate-400 ml-1">{counter.suffix}</span>}</p>
          </button>
        );
      })}
    </div>
  );
}

