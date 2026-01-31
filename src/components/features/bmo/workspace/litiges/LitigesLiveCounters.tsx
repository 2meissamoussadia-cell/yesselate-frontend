'use client';

import { useState, useEffect } from 'react';
import { Scale, AlertTriangle, CheckCircle, MessageSquare, Gavel, DollarSign, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { litigesApiService, type LitigesStats } from '@/lib/services/litigesApiService';

interface Props {
  onOpenQueue: (queue: string, title: string, icon: string) => void;
}

export function LitigesLiveCounters({ onOpenQueue }: Props) {
  const [stats, setStats] = useState<LitigesStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try { const data = await litigesApiService.getStats(); setStats(data); }
      catch (error) { console.error('Failed:', error); }
      finally { setLoading(false); }
    };
    loadStats();
    const interval = setInterval(loadStats, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !stats) {
    return <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 animate-pulse">{[...Array(7)].map((_, i) => <div key={i} className="h-24 rounded-xl bg-slate-100 dark:bg-slate-800" />)}</div>;
  }

  const counters = [
    { key: 'active', label: 'Actifs', value: stats.active, icon: Scale, color: stats.active > 0 ? 'red' : 'slate', action: () => onOpenQueue('active', 'Actifs', '⚖️') },
    { key: 'highRisk', label: 'Risque élevé', value: stats.byRisk?.high || 0, icon: AlertTriangle, color: (stats.byRisk?.high || 0) > 0 ? 'red' : 'slate', action: () => onOpenQueue('high-risk', 'Risque élevé', '🚨') },
    { key: 'negotiation', label: 'En négociation', value: stats.negotiation, icon: MessageSquare, color: stats.negotiation > 0 ? 'blue' : 'slate', action: () => onOpenQueue('negotiation', 'Négociation', '💬') },
    { key: 'judgment', label: 'Jugements', value: stats.judgment, icon: Gavel, color: stats.judgment > 0 ? 'purple' : 'slate', action: () => onOpenQueue('judgment', 'Jugements', '🔨') },
    { key: 'closed', label: 'Clos', value: stats.closed, icon: CheckCircle, color: 'emerald', action: () => onOpenQueue('closed', 'Clos', '✅') },
    { key: 'audiences', label: 'Prochaines audiences', value: stats.prochesAudiences, icon: Calendar, color: stats.prochesAudiences > 0 ? 'amber' : 'slate', action: () => {} },
    { key: 'exposure', label: 'Exposition totale', value: litigesApiService.formatMontant(stats.totalExposure), suffix: 'FCFA', icon: DollarSign, color: 'red', action: () => {} },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
      {counters.map((counter) => {
        const Icon = counter.icon;
        const hasValue = typeof counter.value === 'number' ? counter.value > 0 : true;
        return (
          <button key={counter.key} onClick={counter.action} className={cn("p-4 rounded-xl border text-left transition-all hover:shadow-md", hasValue && counter.color !== 'slate' ? `bg-${counter.color}-500/10 border-${counter.color}-500/30` : "bg-slate-50 dark:bg-slate-900/50 border-slate-200/50 dark:border-slate-800/50")}>
            <div className="flex items-center gap-2 mb-2">
              <Icon className={cn("w-4 h-4", hasValue && counter.color !== 'slate' ? counter.color === 'red' ? 'text-red-500' : counter.color === 'amber' ? 'text-amber-500' : counter.color === 'blue' ? 'text-blue-500' : counter.color === 'purple' ? 'text-purple-500' : counter.color === 'emerald' ? 'text-emerald-500' : 'text-slate-400' : 'text-slate-400')} />
              <span className="text-xs text-slate-400 font-medium">{counter.label}</span>
            </div>
            <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{counter.value}{counter.suffix && <span className="text-xs font-normal text-slate-400 ml-1">{counter.suffix}</span>}</p>
          </button>
        );
      })}
    </div>
  );
}

