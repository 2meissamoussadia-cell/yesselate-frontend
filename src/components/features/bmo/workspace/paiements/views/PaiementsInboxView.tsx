'use client';

import { useState, useEffect, useMemo } from 'react';
import { usePaiementsWorkspaceStore } from '@/lib/stores/paiementsWorkspaceStore';
import { paiementsApiService, type Paiement } from '@/lib/services/paiementsApiService';
import { Search, ChevronRight, Clock, AlertTriangle, CheckCircle, Ban, Building2, Calendar, FileText, Star, StarOff, Eye, CheckSquare, Square } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  tabId: string;
  data: Record<string, unknown>;
}

const URGENCY_STYLES = {
  critical: { border: 'border-l-red-500', badge: 'bg-red-500/20 text-red-600 dark:text-red-400' },
  high: { border: 'border-l-amber-500', badge: 'bg-amber-500/20 text-amber-600 dark:text-amber-400' },
  medium: { border: 'border-l-blue-500', badge: 'bg-blue-500/20 text-blue-600 dark:text-blue-400' },
  low: { border: 'border-l-slate-400', badge: 'bg-slate-500/20 text-slate-600 dark:text-slate-400' },
};

const STATUS_ICONS = {
  pending: Clock,
  validated: CheckCircle,
  rejected: Ban,
  scheduled: Calendar,
  paid: CheckCircle,
  blocked: AlertTriangle,
};

export function PaiementsInboxView({ tabId, data }: Props) {
  const { openTab, currentFilter, selectedIds, toggleSelected, selectAll, clearSelection, watchlist, addToWatchlist, removeFromWatchlist } = usePaiementsWorkspaceStore();
  const [paiements, setPaiements] = useState<Paiement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const queue = data.queue as string | undefined;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const filter = { ...currentFilter };
        if (queue === 'pending') filter.status = 'pending';
        else if (queue === 'validated') filter.status = 'validated';
        else if (queue === 'blocked') filter.status = 'blocked';
        else if (queue === 'scheduled') filter.status = 'scheduled';
        else if (queue === 'critical') filter.urgency = 'critical';
        if (searchQuery) filter.search = searchQuery;

        const result = await paiementsApiService.getAll(filter, 'urgency', page, 10);
        setPaiements(result.data);
        setTotalPages(result.totalPages);
      } catch (error) {
        console.error('Failed to load:', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [currentFilter, queue, searchQuery, page]);

  const handleOpenDetail = (paiement: Paiement) => {
    openTab({
      type: 'paiement',
      id: `paiement:${paiement.id}`,
      title: paiement.reference,
      icon: paiement.urgency === 'critical' ? '🚨' : '💳',
      data: { paiementId: paiement.id },
    });
  };

  const handleToggleWatchlist = (e: React.MouseEvent, paiementId: string) => {
    e.stopPropagation();
    watchlist.includes(paiementId) ? removeFromWatchlist(paiementId) : addToWatchlist(paiementId);
  };

  const allSelected = paiements.length > 0 && paiements.every(p => selectedIds.has(p.id));

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {queue === 'pending' ? 'Paiements à valider' :
             queue === 'validated' ? 'Paiements validés' :
             queue === 'blocked' ? 'Paiements bloqués' :
             queue === 'scheduled' ? 'Paiements planifiés' :
             queue === 'critical' ? 'Paiements urgents' : 'Tous les paiements'}
          </h2>
          <p className="text-sm text-slate-400">{paiements.length} paiement(s)</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Rechercher..." className="pl-10 pr-4 py-2 w-64 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
          </div>
          <button onClick={() => allSelected ? clearSelection() : selectAll(paiements.map(p => p.id))} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm hover:bg-slate-50 dark:hover:bg-slate-800">
            {allSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
            <span className="hidden sm:inline">{allSelected ? 'Désélectionner' : 'Tout sélectionner'}</span>
          </button>
        </div>
      </div>

      {/* Selection actions */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
          <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">{selectedIds.size} sélectionné(s)</span>
          <div className="flex-1" />
          <button className="px-3 py-1.5 rounded-lg bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600">Valider</button>
          <button className="px-3 py-1.5 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600">Planifier</button>
          <button className="px-3 py-1.5 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600">Rejeter</button>
          <button onClick={clearSelection} className="text-sm text-slate-400 hover:text-slate-700">Annuler</button>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-24 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />)}</div>
      ) : paiements.length === 0 ? (
        <div className="py-12 text-center text-slate-400">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">Aucun paiement trouvé</p>
        </div>
      ) : (
        <div className="space-y-2">
          {paiements.map(paiement => {
            const isSelected = selectedIds.has(paiement.id);
            const isExpanded = expandedId === paiement.id;
            const isInWatchlist = watchlist.includes(paiement.id);
            const style = URGENCY_STYLES[paiement.urgency];
            const StatusIcon = STATUS_ICONS[paiement.status];

            return (
              <div key={paiement.id} className={cn("rounded-xl border-l-4 bg-white dark:bg-slate-900/50 border border-slate-200/70 dark:border-slate-800 transition-all", style.border, isSelected && "ring-2 ring-emerald-500", paiement.urgency === 'critical' && "shadow-md")}>
                <div className="p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/30" onClick={() => setExpandedId(isExpanded ? null : paiement.id)}>
                  <div className="flex items-start gap-4">
                    <label className="flex items-center mt-1" onClick={e => e.stopPropagation()}>
                      <input type="checkbox" checked={isSelected} onChange={() => toggleSelected(paiement.id)} className="w-4 h-4 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500" />
                    </label>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">{paiement.reference}</span>
                        <span className={cn("text-xs font-medium px-2 py-0.5 rounded", style.badge)}>{paiement.urgency.toUpperCase()}</span>
                        <span className="text-xs text-slate-400 flex items-center gap-1"><StatusIcon className="w-3 h-3" />{paiementsApiService.getStatusLabel(paiement.status)}</span>
                        <span className="text-xs text-slate-400">{paiementsApiService.getTypeLabel(paiement.type)}</span>
                      </div>
                      <p className="font-medium text-slate-900 dark:text-slate-100 line-clamp-1">{paiement.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                        <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{paiement.fournisseur.name}</span>
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Échéance: {new Date(paiement.dateEcheance).toLocaleDateString('fr-FR')}</span>
                      </div>
                    </div>
                    <div className="text-right flex-none">
                      <p className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{paiementsApiService.formatMontant(paiement.montant)} FCFA</p>
                      <div className="flex items-center justify-end gap-2 mt-2">
                        <button onClick={e => handleToggleWatchlist(e, paiement.id)} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700" title={isInWatchlist ? 'Retirer' : 'Ajouter aux favoris'}>
                          {isInWatchlist ? <Star className="w-4 h-4 text-amber-500 fill-current" /> : <StarOff className="w-4 h-4 text-slate-400" />}
                        </button>
                        <button onClick={e => { e.stopPropagation(); handleOpenDetail(paiement); }} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700"><Eye className="w-4 h-4 text-slate-400" /></button>
                        <ChevronRight className={cn("w-4 h-4 text-slate-400 transition-transform", isExpanded && "rotate-90")} />
                      </div>
                    </div>
                  </div>
                </div>
                {isExpanded && (
                  <div className="px-4 pb-4 pt-0 border-t border-slate-200/70 dark:border-slate-800">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4">
                      <div><p className="text-xs text-slate-400 mb-1">Bureau</p><p className="font-medium text-slate-900 dark:text-slate-100">{paiement.bureau}</p></div>
                      <div><p className="text-xs text-slate-400 mb-1">Responsable</p><p className="font-medium text-slate-900 dark:text-slate-100">{paiement.responsible}</p></div>
                      <div><p className="text-xs text-slate-400 mb-1">Date facture</p><p className="font-medium text-slate-900 dark:text-slate-100">{new Date(paiement.dateFacture).toLocaleDateString('fr-FR')}</p></div>
                      <div><p className="text-xs text-slate-400 mb-1">Date échéance</p><p className="font-medium text-slate-900 dark:text-slate-100">{new Date(paiement.dateEcheance).toLocaleDateString('fr-FR')}</p></div>
                    </div>
                    <div className="mb-4">
                      <p className="text-xs text-slate-400 mb-2">Validations</p>
                      <div className="flex items-center gap-2">
                        {Object.entries(paiement.validations).map(([key, done]) => (
                          <span key={key} className={cn("px-2 py-1 rounded text-xs font-medium", done ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400")}>
                            {done && <CheckCircle className="w-3 h-3 inline mr-1" />}{key.charAt(0).toUpperCase() + key.slice(1)}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-200/70 dark:border-slate-800">
                      <button onClick={() => handleOpenDetail(paiement)} className="flex-1 px-4 py-2 rounded-lg bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600">Voir le détail</button>
                      <button className="px-4 py-2 rounded-lg bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600">Valider</button>
                      <button className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800">Planifier</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm disabled:opacity-50">Précédent</button>
          <span className="text-sm text-slate-400">Page {page} / {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm disabled:opacity-50">Suivant</button>
        </div>
      )}
    </div>
  );
}

