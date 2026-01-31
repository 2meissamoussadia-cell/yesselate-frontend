'use client';

import { useState, useEffect } from 'react';
import { useFinancesWorkspaceStore } from '@/lib/stores/financesWorkspaceStore';
import { financesApiService, type CompteBancaire, type FinancesStats } from '@/lib/services/financesApiService';
import { Wallet, CreditCard, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function FinancesDashboardView() {
  const { openTab } = useFinancesWorkspaceStore();
  const [comptes, setComptes] = useState<CompteBancaire[]>([]);
  const [stats, setStats] = useState<FinancesStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [comptesData, statsData] = await Promise.all([
          financesApiService.getComptes(),
          financesApiService.getStats()
        ]);
        setComptes(comptesData);
        setStats(statsData);
      } catch (error) { console.error('Failed:', error); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const handleOpenCompte = (compte: CompteBancaire) => {
    openTab({ type: 'compte', id: `compte:${compte.id}`, title: compte.nom, icon: '💳', data: { compteId: compte.id } });
  };

  if (loading) return <div className="space-y-4"><div className="h-32 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" /><div className="grid grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <div key={i} className="h-24 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />)}</div></div>;

  return (
    <div className="space-y-6">
      {/* Résumé financier */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-6 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
          <div className="flex items-center gap-3 mb-4"><Wallet className="w-8 h-8 opacity-80" /><span className="text-sm font-medium opacity-80">Trésorerie globale</span></div>
          <p className="text-3xl font-bold">{stats ? financesApiService.formatMontant(stats.tresorerieGlobale) : '---'}</p>
          <p className="text-sm opacity-80 mt-1">FCFA</p>
        </div>
        <div className="p-6 rounded-xl bg-white dark:bg-slate-900/50 border border-slate-200/70 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-4"><TrendingUp className="w-6 h-6 text-blue-500" /><span className="text-sm font-medium text-slate-400">Budget annuel</span></div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats ? financesApiService.formatMontant(stats.budgetTotal) : '---'}</p>
          <div className="mt-2 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden"><div className="h-full bg-blue-500 rounded-full" style={{ width: stats ? `${(stats.budgetConsomme / stats.budgetTotal) * 100}%` : '0%' }} /></div>
          <p className="text-xs text-slate-400 mt-1">{stats ? Math.round((stats.budgetConsomme / stats.budgetTotal) * 100) : 0}% consommé</p>
        </div>
        <div className="p-6 rounded-xl bg-white dark:bg-slate-900/50 border border-slate-200/70 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-4"><ArrowUpRight className="w-6 h-6 text-emerald-500" /><span className="text-sm font-medium text-slate-400">Flux entrants</span></div>
          <p className="text-2xl font-bold text-emerald-600">{stats ? financesApiService.formatMontant(stats.fluxEntrants) : '---'}</p>
          <p className="text-xs text-slate-400 mt-1">Ce mois</p>
        </div>
        <div className="p-6 rounded-xl bg-white dark:bg-slate-900/50 border border-slate-200/70 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-4"><ArrowDownRight className="w-6 h-6 text-red-500" /><span className="text-sm font-medium text-slate-400">Flux sortants</span></div>
          <p className="text-2xl font-bold text-red-600">{stats ? financesApiService.formatMontant(stats.fluxSortants) : '---'}</p>
          <p className="text-xs text-slate-400 mt-1">Ce mois</p>
        </div>
      </div>

      {/* Liste des comptes */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2"><CreditCard className="w-5 h-5 text-emerald-500" />Comptes bancaires</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {comptes.map((compte) => (
            <button key={compte.id} onClick={() => handleOpenCompte(compte)} className="p-5 rounded-xl bg-white dark:bg-slate-900/50 border border-slate-200/70 dark:border-slate-800 text-left hover:shadow-lg hover:border-emerald-500/50 transition-all group">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10"><Building2 className="w-5 h-5 text-emerald-500" /></div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{compte.nom}</p>
                    <p className="text-xs text-slate-400">{compte.banque}</p>
                  </div>
                </div>
                <span className={cn("px-2 py-1 rounded text-xs font-medium", compte.type === 'courant' ? 'bg-blue-500/10 text-blue-600' : compte.type === 'epargne' ? 'bg-purple-500/10 text-purple-600' : 'bg-amber-500/10 text-amber-600')}>{compte.type === 'courant' ? 'Courant' : compte.type === 'epargne' ? 'Épargne' : 'Devise'}</span>
              </div>
              <p className="text-2xl font-mono font-bold text-emerald-600 dark:text-emerald-400">{financesApiService.formatMontant(compte.solde)}<span className="text-sm font-normal text-slate-400 ml-2">{compte.devise}</span></p>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-200/50 dark:border-slate-800">
                <p className="text-xs text-slate-400">ID: {compte.id}</p>
                <p className="text-xs text-slate-400">MAJ: {new Date(compte.lastUpdated).toLocaleDateString('fr-FR')}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

