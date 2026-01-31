'use client';

import { useState, useEffect } from 'react';
import { Users, CheckCircle, AlertTriangle, Clock, UserPlus, Building2, Crown, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import { clientsApiService, type ClientsStats } from '@/lib/services/clientsApiService';

interface Props { onOpenQueue: (queue: string, title: string, icon: string) => void; }

export function ClientsLiveCounters({ onOpenQueue }: Props) {
  const [stats, setStats] = useState<ClientsStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try { const data = await clientsApiService.getStats(); setStats(data); }
      catch (error) { console.error('Failed:', error); }
      finally { setLoading(false); }
    };
    loadStats();
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !stats) {
    return <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 animate-pulse">{[...Array(8)].map((_, i) => <div key={i} className="h-24 rounded-xl bg-slate-100 dark:bg-slate-800" />)}</div>;
  }

  const counters = [
    { key: 'total', label: 'Total', value: stats.total, icon: Users, color: 'cyan', action: () => onOpenQueue('all', 'Tous', '👥') },
    { key: 'active', label: 'Actifs', value: stats.active, icon: CheckCircle, color: stats.active > 0 ? 'emerald' : 'slate', action: () => onOpenQueue('active', 'Actifs', '✅') },
    { key: 'litige', label: 'En litige', value: stats.litige, icon: AlertTriangle, color: stats.litige > 0 ? 'red' : 'slate', action: () => onOpenQueue('litige', 'En litige', '⚠️') },
    { key: 'prospect', label: 'Prospects', value: stats.prospect, icon: UserPlus, color: stats.prospect > 0 ? 'blue' : 'slate', action: () => onOpenQueue('prospect', 'Prospects', '🆕') },
    { key: 'premium', label: 'Premium', value: stats.bySegment.premium || 0, icon: Crown, color: 'amber', action: () => onOpenQueue('premium', 'Premium', '👑') },
    { key: 'projets', label: 'Projets en cours', value: stats.projetsEnCours, icon: Building2, color: 'indigo', action: () => {} },
    { key: 'ca', label: 'CA Total', value: clientsApiService.formatMontant(stats.chiffreAffairesTotal), icon: DollarSign, color: 'emerald', action: () => {} },
    { key: 'termine', label: 'Terminés', value: stats.termine, icon: Clock, color: 'slate', action: () => onOpenQueue('termine', 'Terminés', '🏁') },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
      {counters.map((counter) => {
        const Icon = counter.icon;
        return (
          <button key={counter.key} onClick={counter.action} className={cn("p-4 rounded-xl border text-left transition-all hover:shadow-md", `bg-${counter.color}-500/10 border-${counter.color}-500/30`)}>
            <div className="flex items-center gap-2 mb-2">
              <Icon className={cn("w-4 h-4", counter.color === 'cyan' ? 'text-cyan-500' : counter.color === 'red' ? 'text-red-500' : counter.color === 'blue' ? 'text-blue-500' : counter.color === 'amber' ? 'text-amber-500' : counter.color === 'emerald' ? 'text-emerald-500' : counter.color === 'indigo' ? 'text-indigo-500' : 'text-slate-400')} />
              <span className="text-xs text-slate-400 font-medium truncate">{counter.label}</span>
            </div>
            <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{counter.value}</p>
          </button>
        );
      })}
    </div>
  );
}

