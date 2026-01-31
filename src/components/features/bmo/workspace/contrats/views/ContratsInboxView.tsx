'use client';

import { useState, useEffect, useMemo } from 'react';
import { useContratsWorkspaceStore } from '@/lib/stores/contratsWorkspaceStore';
import { contratsApiService, type Contrat } from '@/lib/services/contratsApiService';
import {
  Search, Filter, ChevronRight, Clock, AlertTriangle, CheckCircle,
  XCircle, MessageSquare, Building2, Calendar, FileText, MoreVertical,
  Star, StarOff, Eye, CheckSquare, Square
} from 'lucide-react';
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
  rejected: XCircle,
  negotiation: MessageSquare,
  expired: AlertTriangle,
  signed: CheckCircle,
};

export function ContratsInboxView({ tabId, data }: Props) {
  const { 
    openTab, currentFilter, setFilter, selectedIds, toggleSelected, selectAll, clearSelection,
    watchlist, addToWatchlist, removeFromWatchlist
  } = useContratsWorkspaceStore();
  
  const [contrats, setContrats] = useState<Contrat[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const queue = data.queue as string | undefined;

  // Load contrats
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const filter = { ...currentFilter };
        
        // Apply queue filter
        if (queue === 'pending') filter.status = 'pending';
        else if (queue === 'validated') filter.status = 'validated';
        else if (queue === 'rejected') filter.status = 'rejected';
        else if (queue === 'negotiation') filter.status = 'negotiation';
        else if (queue === 'critical') filter.urgency = 'critical';

        if (searchQuery) filter.search = searchQuery;

        const result = await contratsApiService.getAll(filter, 'urgency', page, 10);
        setContrats(result.data);
        setTotalPages(result.totalPages);
      } catch (error) {
        console.error('Failed to load contrats:', error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [currentFilter, queue, searchQuery, page]);

  // Filter by search
  const filteredContrats = useMemo(() => {
    if (!searchQuery) return contrats;
    const q = searchQuery.toLowerCase();
    return contrats.filter(c =>
      c.id.toLowerCase().includes(q) ||
      c.title.toLowerCase().includes(q) ||
      c.fournisseur.name.toLowerCase().includes(q)
    );
  }, [contrats, searchQuery]);

  const handleOpenDetail = (contrat: Contrat) => {
    openTab({
      type: 'contrat',
      id: `contrat:${contrat.id}`,
      title: contrat.reference,
      icon: contrat.urgency === 'critical' ? '🚨' : '📄',
      data: { contratId: contrat.id },
    });
  };

  const handleToggleWatchlist = (e: React.MouseEvent, contratId: string) => {
    e.stopPropagation();
    if (watchlist.includes(contratId)) {
      removeFromWatchlist(contratId);
    } else {
      addToWatchlist(contratId);
    }
  };

  const allSelected = filteredContrats.length > 0 && filteredContrats.every(c => selectedIds.has(c.id));

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {queue === 'pending' ? 'Contrats à valider' :
             queue === 'validated' ? 'Contrats validés' :
             queue === 'rejected' ? 'Contrats rejetés' :
             queue === 'negotiation' ? 'En négociation' :
             queue === 'critical' ? 'Contrats urgents' :
             'Tous les contrats'}
          </h2>
          <p className="text-sm text-slate-400">{filteredContrats.length} contrat(s)</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher..."
              className="pl-10 pr-4 py-2 w-64 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />
          </div>

          {/* Select all */}
          <button
            onClick={() => allSelected ? clearSelection() : selectAll(filteredContrats.map(c => c.id))}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            {allSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
            <span className="hidden sm:inline">{allSelected ? 'Désélectionner' : 'Tout sélectionner'}</span>
          </button>
        </div>
      </div>

      {/* Selection actions */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-purple-500/10 border border-purple-500/30">
          <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
            {selectedIds.size} sélectionné(s)
          </span>
          <div className="flex-1" />
          <button className="px-3 py-1.5 rounded-lg bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600">
            Valider
          </button>
          <button className="px-3 py-1.5 rounded-lg bg-amber-500 text-white text-sm font-medium hover:bg-amber-600">
            Négocier
          </button>
          <button className="px-3 py-1.5 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600">
            Rejeter
          </button>
          <button onClick={clearSelection} className="text-sm text-slate-400 hover:text-slate-700">
            Annuler
          </button>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      ) : filteredContrats.length === 0 ? (
        <div className="py-12 text-center text-slate-400">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">Aucun contrat trouvé</p>
          <p className="text-sm mt-1">Essayez de modifier vos filtres</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredContrats.map((contrat) => {
            const isSelected = selectedIds.has(contrat.id);
            const isExpanded = expandedId === contrat.id;
            const isInWatchlist = watchlist.includes(contrat.id);
            const style = URGENCY_STYLES[contrat.urgency];
            const StatusIcon = STATUS_ICONS[contrat.status];

            return (
              <div
                key={contrat.id}
                className={cn(
                  "rounded-xl border-l-4 bg-white dark:bg-slate-900/50 border border-slate-200/70 dark:border-slate-800 transition-all",
                  style.border,
                  isSelected && "ring-2 ring-purple-500",
                  contrat.urgency === 'critical' && "shadow-md"
                )}
              >
                {/* Header */}
                <div
                  className="p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/30"
                  onClick={() => setExpandedId(isExpanded ? null : contrat.id)}
                >
                  <div className="flex items-start gap-4">
                    {/* Checkbox */}
                    <label className="flex items-center mt-1" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelected(contrat.id)}
                        className="w-4 h-4 rounded border-slate-300 text-purple-500 focus:ring-purple-500"
                      />
                    </label>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {contrat.reference}
                        </span>
                        <span className={cn("text-xs font-medium px-2 py-0.5 rounded", style.badge)}>
                          {contrat.urgency.toUpperCase()}
                        </span>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <StatusIcon className="w-3 h-3" />
                          {contratsApiService.getStatusLabel(contrat.status)}
                        </span>
                        <span className="text-xs text-slate-400">
                          {contratsApiService.getTypeLabel(contrat.type)}
                        </span>
                      </div>

                      <p className="font-medium text-slate-900 dark:text-slate-100 line-clamp-1">
                        {contrat.title}
                      </p>

                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          {contrat.fournisseur.name}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Échéance: {new Date(contrat.dateEcheance).toLocaleDateString('fr-FR')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {contrat.duree} mois
                        </span>
                      </div>
                    </div>

                    {/* Right side */}
                    <div className="text-right flex-none">
                      <p className="font-mono font-bold text-purple-600 dark:text-purple-400">
                        {contratsApiService.formatMontant(contrat.montant)} FCFA
                      </p>
                      <div className="flex items-center justify-end gap-2 mt-2">
                        <button
                          onClick={(e) => handleToggleWatchlist(e, contrat.id)}
                          className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700"
                          title={isInWatchlist ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                        >
                          {isInWatchlist ? (
                            <Star className="w-4 h-4 text-amber-500 fill-current" />
                          ) : (
                            <StarOff className="w-4 h-4 text-slate-400" />
                          )}
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleOpenDetail(contrat); }}
                          className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700"
                          title="Voir détail"
                        >
                          <Eye className="w-4 h-4 text-slate-400" />
                        </button>
                        <ChevronRight className={cn(
                          "w-4 h-4 text-slate-400 transition-transform",
                          isExpanded && "rotate-90"
                        )} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-0 border-t border-slate-200/70 dark:border-slate-800">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4">
                      <div>
                        <p className="text-xs text-slate-400 mb-1">Bureau responsable</p>
                        <p className="font-medium text-slate-900 dark:text-slate-100">{contrat.bureau}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 mb-1">Responsable</p>
                        <p className="font-medium text-slate-900 dark:text-slate-100">{contrat.responsible}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 mb-1">Date début</p>
                        <p className="font-medium text-slate-900 dark:text-slate-100">
                          {new Date(contrat.dateDebut).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 mb-1">Date fin</p>
                        <p className="font-medium text-slate-900 dark:text-slate-100">
                          {new Date(contrat.dateFin).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>

                    {/* Validations */}
                    <div className="mb-4">
                      <p className="text-xs text-slate-400 mb-2">Validations requises</p>
                      <div className="flex items-center gap-2">
                        {Object.entries(contrat.validations).map(([key, done]) => (
                          <span
                            key={key}
                            className={cn(
                              "px-2 py-1 rounded text-xs font-medium",
                              done
                                ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                            )}
                          >
                            {done && <CheckCircle className="w-3 h-3 inline mr-1" />}
                            {key.charAt(0).toUpperCase() + key.slice(1)}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-200/70 dark:border-slate-800">
                      <button
                        onClick={() => handleOpenDetail(contrat)}
                        className="flex-1 px-4 py-2 rounded-lg bg-purple-500 text-white text-sm font-medium hover:bg-purple-600"
                      >
                        Voir le détail
                      </button>
                      <button className="px-4 py-2 rounded-lg bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600">
                        Valider
                      </button>
                      <button className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800">
                        Négocier
                      </button>
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
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm disabled:opacity-50"
          >
            Précédent
          </button>
          <span className="text-sm text-slate-400">
            Page {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm disabled:opacity-50"
          >
            Suivant
          </button>
        </div>
      )}
    </div>
  );
}

