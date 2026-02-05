'use client';

import { useState, useEffect } from 'react';
import { Wallet, TrendingUp, TrendingDown, PiggyBank, CreditCard, ArrowUpRight, ArrowDownRight, Percent } from 'lucide-react';
import { cn } from '@/lib/cn';
import { financesApiService, type FinancesStats } from '@/lib/services/financesApiService';
import { logger } from '@/lib/utils/logger';

interface Props {
  onOpenView: (view: string, title: string) => void;
}

export function FinancesLiveCounters({ onOpenView }: Props) {
  const [stats, setStats] = useState<FinancesStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try { const data = await financesApiService.getStats(); setStats(data); }
      catch (error) { logger.error('Finances stats failed', error as Error, { context: 'FinancesLiveCounters' }); }
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
    { key: 'tresorerie', label: 'Trésorerie globale', value: financesApiService.formatMontant(stats.tresorerieGlobale), suffix: 'FCFA', icon: Wallet, color: 'emerald', action: () => onOpenView('tresorerie', 'Trésorerie') },
    { key: 'budget-total', label: 'Budget total', value: financesApiService.formatMontant(stats.budgetTotal), suffix: 'FCFA', icon: PiggyBank, color: 'blue', action: () => onOpenView('budget', 'Budget') },
    { key: 'budget-consomme', label: 'Consommé', value: financesApiService.formatMontant(stats.budgetConsomme), suffix: 'FCFA', icon: TrendingDown, color: 'amber', action: () => {} },
    { key: 'budget-restant', label: 'Restant', value: financesApiService.formatMontant(stats.budgetRestant), suffix: 'FCFA', icon: TrendingUp, color: 'emerald', action: () => {} },
    { key: 'comptes', label: 'Comptes', value: stats.nbComptes, icon: CreditCard, color: 'purple', action: () => onOpenView('tresorerie', 'Comptes') },
    { key: 'entrants', label: 'Flux entrants', value: financesApiService.formatMontant(stats.fluxEntrants), icon: ArrowUpRight, color: 'emerald', action: () => {} },
    { key: 'sortants', label: 'Flux sortants', value: financesApiService.formatMontant(stats.fluxSortants), icon: ArrowDownRight, color: 'red', action: () => {} },
    { key: 'variation', label: 'Variation', value: `${stats.variationMensuelle > 0 ? '+' : ''}${stats.variationMensuelle.toFixed(1)}%`, icon: Percent, color: stats.variationMensuelle >= 0 ? 'emerald' : 'red', action: () => {} },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
      {counters.map((counter) => {
        const Icon = counter.icon;
        return (
          <button key={counter.key} onClick={counter.action} className={cn("p-4 rounded-xl border text-left transition-all hover:shadow-md", `bg-${counter.color}-500/10 border-${counter.color}-500/30`)}>
            <div className="flex items-center gap-2 mb-2">
              <Icon className={cn("w-4 h-4", counter.color === 'emerald' ? 'text-emerald-500' : counter.color === 'blue' ? 'text-blue-500' : counter.color === 'amber' ? 'text-amber-500' : counter.color === 'purple' ? 'text-purple-500' : counter.color === 'red' ? 'text-red-500' : 'text-slate-400')} />
              <span className="text-xs text-slate-400 font-medium truncate">{counter.label}</span>
            </div>
            <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{counter.value}{counter.suffix && <span className="text-xs font-normal text-slate-400 ml-1">{counter.suffix}</span>}</p>
          </button>
        );
      })}
    </div>
  );
}

