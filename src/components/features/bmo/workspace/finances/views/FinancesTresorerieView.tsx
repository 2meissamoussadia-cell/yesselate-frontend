'use client';

import { useState, useEffect } from 'react';
import { financesApiService, type MouvementFinancier } from '@/lib/services/financesApiService';
import { Search, ArrowUpRight, ArrowDownRight, Clock, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/cn';
import { logger } from '@/lib/utils/logger';

export function FinancesTresorerieView() {
  const [mouvements, setMouvements] = useState<MouvementFinancier[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const result = await financesApiService.getMouvements({ search: searchQuery || undefined });
        setMouvements(result.data);
      } catch (error) { logger.error('Finances trésorerie load failed', error as Error, { context: 'FinancesTresorerieView' }); }
      finally { setLoading(false); }
    };
    load();
  }, [searchQuery]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Mouvements de trésorerie</h2>
          <p className="text-sm text-slate-400">{mouvements.length} mouvement(s)</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Rechercher..." className="pl-10 pr-4 py-2 w-64 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-20 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />)}</div>
      ) : mouvements.length === 0 ? (
        <div className="py-12 text-center text-slate-400"><p className="font-medium">Aucun mouvement trouvé</p></div>
      ) : (
        <div className="space-y-2">
          {mouvements.map(mouvement => (
            <div key={mouvement.id} className={cn("p-4 rounded-xl border-l-4 bg-white dark:bg-slate-900/50 border border-slate-200/70 dark:border-slate-800 transition-all hover:shadow-md", mouvement.type === 'credit' ? 'border-l-emerald-500' : 'border-l-red-500')}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={cn("p-2 rounded-lg", mouvement.type === 'credit' ? 'bg-emerald-500/10' : 'bg-red-500/10')}>
                    {mouvement.type === 'credit' ? <ArrowUpRight className="w-5 h-5 text-emerald-500" /> : <ArrowDownRight className="w-5 h-5 text-red-500" />}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-slate-100">{mouvement.libelle}</p>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                      <span>{new Date(mouvement.date).toLocaleDateString('fr-FR')}</span>
                      <span>•</span>
                      <span>{mouvement.categorie}</span>
                      <span>•</span>
                      <span>{mouvement.compte}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className={cn("text-lg font-mono font-bold", mouvement.type === 'credit' ? 'text-emerald-600' : 'text-red-600')}>{mouvement.type === 'credit' ? '+' : '-'}{financesApiService.formatMontant(mouvement.montant)}</p>
                  <span className={cn("inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded mt-1", mouvement.statut === 'valide' ? 'bg-emerald-500/10 text-emerald-600' : mouvement.statut === 'en_attente' ? 'bg-amber-500/10 text-amber-600' : 'bg-red-500/10 text-red-600')}>
                    {mouvement.statut === 'valide' ? <CheckCircle className="w-3 h-3" /> : mouvement.statut === 'en_attente' ? <Clock className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    {mouvement.statut === 'valide' ? 'Validé' : mouvement.statut === 'en_attente' ? 'En attente' : 'Rejeté'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

