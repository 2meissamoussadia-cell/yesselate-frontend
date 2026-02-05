'use client';

import { useState, useEffect } from 'react';
import { useDepensesWorkspaceStore } from '@/lib/stores/depensesWorkspaceStore';
import { depensesApiService, type Depense } from '@/lib/services/depensesApiService';
import { FileText, PiggyBank, FolderTree, CheckSquare, Search, Clock, CheckCircle, XCircle, DollarSign, Building2, Calendar, User, ChevronRight, Eye } from 'lucide-react';
import { cn } from '@/lib/cn';
import { logger } from '@/lib/utils/logger';

const STATUS_STYLES = {
  pending: { border: 'border-l-amber-500', badge: 'bg-amber-500/20 text-amber-600' },
  approved: { border: 'border-l-blue-500', badge: 'bg-blue-500/20 text-blue-600' },
  rejected: { border: 'border-l-red-500', badge: 'bg-red-500/20 text-red-600' },
  paid: { border: 'border-l-emerald-500', badge: 'bg-emerald-500/20 text-emerald-600' },
};

const STATUS_ICONS = { pending: Clock, approved: CheckCircle, rejected: XCircle, paid: DollarSign };

export function DepensesWorkspaceContent() {
  const { tabs, activeTabId, openTab, currentFilter } = useDepensesWorkspaceStore();
  const activeTab = tabs.find(t => t.id === activeTabId);
  const [depenses, setDepenses] = useState<Depense[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const queue = activeTab?.data?.queue as string | undefined;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const filter = { ...currentFilter };
        if (queue && queue !== 'all') filter.status = queue as Depense['status'];
        if (searchQuery) filter.search = searchQuery;
        const result = await depensesApiService.getAll(filter, 'date', 1, 50);
        setDepenses(result.data);
      } catch (error) { logger.error('Depenses load failed', error as Error, { context: 'DepensesWorkspaceContent' }); }
      finally { setLoading(false); }
    };
    load();
  }, [currentFilter, queue, searchQuery]);

  const handleOpenDetail = (depense: Depense) => {
    openTab({ type: 'depense', id: `depense:${depense.id}`, title: depense.id, icon: '💸', data: { depenseId: depense.id } });
  };

  if (!activeTab) return <div className="flex items-center justify-center h-64 text-slate-400"><div className="text-center"><FileText className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>Aucun onglet</p></div></div>;

  if (activeTab.type === 'budgets') return <PlaceholderView icon={<PiggyBank className="w-12 h-12" />} title="Suivi des budgets" />;
  if (activeTab.type === 'categories') return <PlaceholderView icon={<FolderTree className="w-12 h-12" />} title="Par catégorie" />;
  if (activeTab.type === 'validation') return <PlaceholderView icon={<CheckSquare className="w-12 h-12" />} title="En attente de validation" />;
  if (activeTab.type === 'depense') return <PlaceholderView icon={<FileText className="w-12 h-12" />} title="Détail de la dépense" />;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {queue === 'pending' ? 'En attente' : queue === 'approved' ? 'Approuvées' : queue === 'rejected' ? 'Rejetées' : queue === 'paid' ? 'Payées' : 'Toutes les dépenses'}
          </h2>
          <p className="text-sm text-slate-400">{depenses.length} dépense(s)</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Rechercher..." className="pl-10 pr-4 py-2 w-64 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50" />
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-24 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />)}</div>
      ) : depenses.length === 0 ? (
        <div className="py-12 text-center text-slate-400"><DollarSign className="w-12 h-12 mx-auto mb-3 opacity-30" /><p className="font-medium">Aucune dépense trouvée</p></div>
      ) : (
        <div className="space-y-2">
          {depenses.map(depense => {
            const style = STATUS_STYLES[depense.status] || STATUS_STYLES.pending;
            const StatusIcon = STATUS_ICONS[depense.status] || Clock;
            const isExpanded = expandedId === depense.id;

            return (
              <div key={depense.id} className={cn("rounded-xl border-l-4 bg-white dark:bg-slate-900/50 border border-slate-200/70 dark:border-slate-800 transition-all hover:shadow-md", style.border)} onClick={() => setExpandedId(isExpanded ? null : depense.id)}>
                <div className="p-4 cursor-pointer">
                  <div className="flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">{depense.id}</span>
                        <span className={cn("text-xs font-medium px-2 py-0.5 rounded", style.badge)}><StatusIcon className="w-3 h-3 inline mr-1" />{depensesApiService.getStatusLabel(depense.status)}</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-purple-500/10 text-purple-600">{depense.category}</span>
                      </div>
                      <p className="font-medium text-slate-900 dark:text-slate-100">{depense.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                        <span className="flex items-center gap-1"><User className="w-3 h-3" />{depense.demandeur}</span>
                        <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{depense.bureau}</span>
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(depense.date).toLocaleDateString('fr-FR')}</span>
                      </div>
                    </div>
                    <div className="text-right flex-none">
                      <p className="font-mono font-bold text-purple-600 dark:text-purple-400">{depensesApiService.formatMontant(depense.montant)} FCFA</p>
                      <div className="flex items-center justify-end gap-2 mt-2">
                        <button onClick={e => { e.stopPropagation(); handleOpenDetail(depense); }} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700"><Eye className="w-4 h-4 text-slate-400" /></button>
                        <ChevronRight className={cn("w-4 h-4 text-slate-400 transition-transform", isExpanded && "rotate-90")} />
                      </div>
                    </div>
                  </div>
                </div>
                {isExpanded && (
                  <div className="px-4 pb-4 pt-0 border-t border-slate-200/70 dark:border-slate-800">
                    <div className="grid grid-cols-3 gap-4 py-4">
                      <div><p className="text-xs text-slate-400 mb-1">Projet</p><p className="font-medium text-slate-900 dark:text-slate-100">{depense.projet || 'N/A'}</p></div>
                      <div><p className="text-xs text-slate-400 mb-1">Justificatif</p><p className="font-medium text-slate-900 dark:text-slate-100">{depense.justificatif ? '✅ Fourni' : '❌ Manquant'}</p></div>
                      <div><p className="text-xs text-slate-400 mb-1">Bureau</p><p className="font-medium text-slate-900 dark:text-slate-100">{depense.bureau}</p></div>
                    </div>
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-200/70 dark:border-slate-800">
                      <button onClick={() => handleOpenDetail(depense)} className="flex-1 px-4 py-2 rounded-lg bg-purple-500 text-white text-sm font-medium hover:bg-purple-600">Voir le détail</button>
                      {depense.status === 'pending' && <button className="px-4 py-2 rounded-lg bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600">Approuver</button>}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function PlaceholderView({ icon, title }: { icon: React.ReactNode; title: string }) {
  return <div className="flex items-center justify-center h-64 text-slate-400"><div className="text-center"><div className="mx-auto mb-4 opacity-30">{icon}</div><p className="font-semibold">{title}</p><p className="text-xs mt-4 text-slate-400">En cours de développement</p></div></div>;
}

