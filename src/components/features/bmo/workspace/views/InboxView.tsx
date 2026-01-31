'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useWorkspaceStore, WorkspaceTab } from '@/lib/stores/workspaceStore';
import { FluentModal } from '@/components/ui/fluent-modal';
import { 
  Search, RefreshCw, ArrowUpDown, Users, FileText,
  Inbox, AlertTriangle, Clock, CheckCircle2, XCircle,
  Building2, ChevronRight, Filter, Download
} from 'lucide-react';

type DemandRow = {
  id: string;
  subject: string;
  bureau: string;
  type: string;
  priority: string;
  status: string;
  delayDays: number;
  isOverdue: boolean;
  amount?: number | null;
};

const QUEUE_CONFIG: Record<string, { label: string; icon: typeof Inbox; color: string }> = {
  pending: { label: 'À traiter', icon: Inbox, color: 'text-amber-500' },
  urgent: { label: 'Urgences Critiques', icon: AlertTriangle, color: 'text-rose-500' },
  overdue: { label: 'Retards SLA', icon: Clock, color: 'text-orange-500' },
  validated: { label: 'Validées', icon: CheckCircle2, color: 'text-emerald-500' },
  rejected: { label: 'Rejetées', icon: XCircle, color: 'text-rose-500' },
  all: { label: 'Toutes', icon: FileText, color: 'text-slate-400' },
};

const PRIORITY_COLORS: Record<string, string> = {
  urgent: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
  high: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  normal: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  low: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
};

type SortKey = 'id' | 'subject' | 'bureau' | 'priority' | 'delayDays' | 'amount';
type SortDir = 'asc' | 'desc';

export function InboxView({ tab }: { tab: WorkspaceTab }) {
  const queue: string = (tab.data?.queue as string) ?? 'pending';
  const queueConfig = QUEUE_CONFIG[queue] ?? QUEUE_CONFIG.pending;
  const QueueIcon = queueConfig.icon;
  
  const { openTab, updateTab } = useWorkspaceStore();
  
  const [items, setItems] = useState<DemandRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sortKey, setSortKey] = useState<SortKey>('delayDays');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  
  // Modales batch
  const [batchAction, setBatchAction] = useState<'validate' | 'reject' | null>(null);
  const [batchReason, setBatchReason] = useState('');
  const [batchLoading, setBatchLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/demands?queue=${encodeURIComponent(queue)}`, { cache: 'no-store' });
      const data = await res.json();
      const loadedItems = data.items ?? [];
      setItems(loadedItems);
      setSelected(new Set());
      
      // Mettre à jour le titre avec le compteur
      updateTab(tab.id, { 
        title: `${queueConfig.label} (${loadedItems.length})` 
      });
    } catch (e) {
      console.error('Erreur chargement inbox:', e);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [queue, tab.id, queueConfig.label, updateTab]);

  useEffect(() => { load(); }, [load]);

  // Filtrage et tri
  const filteredItems = useMemo(() => {
    let result = items;
    
    // Recherche
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(d => 
        d.id.toLowerCase().includes(q) ||
        d.subject.toLowerCase().includes(q) ||
        d.bureau.toLowerCase().includes(q) ||
        d.type.toLowerCase().includes(q)
      );
    }
    
    // Tri
    result = [...result].sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'amount') {
        cmp = (a.amount ?? 0) - (b.amount ?? 0);
      } else if (sortKey === 'delayDays') {
        cmp = a.delayDays - b.delayDays;
      } else if (sortKey === 'priority') {
        const order = { urgent: 0, high: 1, normal: 2, low: 3 };
        cmp = (order[a.priority as keyof typeof order] ?? 9) - (order[b.priority as keyof typeof order] ?? 9);
      } else {
        cmp = String(a[sortKey]).localeCompare(String(b[sortKey]));
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
    
    return result;
  }, [items, search, sortKey, sortDir]);

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === filteredItems.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filteredItems.map(d => d.id)));
    }
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const executeBatchAction = async () => {
    if (!batchAction || selected.size === 0) return;
    setBatchLoading(true);
    
    try {
      const res = await fetch('/api/demands/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids: Array.from(selected),
          action: batchAction,
          reason: batchAction === 'reject' ? batchReason : undefined,
          details: batchAction === 'reject' ? batchReason : 'Validation en lot',
          actorId: 'USR-001',
          actorName: 'A. DIALLO',
        }),
      });
      
      if (res.ok) {
        await load();
        setBatchAction(null);
        setBatchReason('');
      }
    } catch (e) {
      console.error('Erreur batch:', e);
    } finally {
      setBatchLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const res = await fetch(`/api/demands/export?queue=${queue}&format=csv`);
      if (!res.ok) throw new Error('Export impossible');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `demandes_${queue}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Erreur export:', e);
    }
  };

  const canBatch = queue === 'pending' || queue === 'urgent' || queue === 'overdue';

  // Stats calculées
  const stats = useMemo(() => ({
    total: items.length,
    urgent: items.filter(d => d.priority === 'urgent').length,
    overdue: items.filter(d => d.isOverdue).length,
    avgDelay: items.length > 0 ? Math.round(items.reduce((a, d) => a + d.delayDays, 0) / items.length) : 0,
    totalAmount: items.reduce((a, d) => a + (d.amount ?? 0), 0),
    bureaux: Object.entries(
      items.reduce((acc, d) => {
        acc[d.bureau] = (acc[d.bureau] ?? 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    ).sort((a, b) => b[1] - a[1]).slice(0, 5),
  }), [items]);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_350px] gap-4">
      {/* Liste principale */}
      <div className="rounded-2xl border border-slate-200/70 bg-white/80 dark:border-slate-800 dark:bg-[#1f1f1f]/70 overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-200/70 dark:border-slate-800">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl bg-slate-100 dark:bg-slate-800 ${queueConfig.color}`}>
                <QueueIcon className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">{queueConfig.label}</h2>
                <p className="text-sm text-slate-400">
                  {filteredItems.length} demande{filteredItems.length > 1 ? 's' : ''}
                  {selected.size > 0 && ` • ${selected.size} sélectionnée${selected.size > 1 ? 's' : ''}`}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-400" 
                onClick={handleExport}
                title="Exporter en CSV"
              >
                <Download className="w-4 h-4" />
              </button>
              <button 
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-400" 
                onClick={load}
                disabled={loading}
                title="Rafraîchir"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
          
          {/* Barre de recherche */}
          <div className="mt-3 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher par ID, sujet, bureau, type..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200/70 bg-white/90 
                         dark:border-slate-800 dark:bg-[#141414]/70 dark:text-white
                         focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-shadow"
            />
            {search && (
              <button 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                onClick={() => setSearch('')}
              >
                <XCircle className="w-4 h-4" />
              </button>
            )}
          </div>
          
          {/* Actions batch */}
          {canBatch && selected.size > 0 && (
            <div className="mt-3 flex items-center gap-2 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <Users className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-blue-400 font-medium">{selected.size} sélectionnée(s)</span>
              <div className="flex-1" />
              <button
                onClick={() => setBatchAction('validate')}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-sm hover:bg-emerald-700 flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Valider tout
              </button>
              <button
                onClick={() => setBatchAction('reject')}
                className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-sm hover:bg-rose-700 flex items-center gap-1.5"
              >
                <XCircle className="w-3.5 h-3.5" />
                Rejeter tout
              </button>
            </div>
          )}
        </div>
        
        {/* Table header */}
        <div className="grid grid-cols-[auto_1fr_90px_90px_70px_100px] gap-2 px-4 py-2 border-b border-slate-200/70 dark:border-slate-800 text-xs font-medium text-slate-400 uppercase bg-slate-50/50 dark:bg-slate-900/30">
          {canBatch && (
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={selected.size === filteredItems.length && filteredItems.length > 0}
                onChange={toggleSelectAll}
                className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 accent-blue-600"
              />
            </div>
          )}
          {!canBatch && <div className="w-4" />}
          <button onClick={() => handleSort('subject')} className="flex items-center gap-1 hover:text-slate-700 dark:hover:text-slate-300 text-left">
            Demande {sortKey === 'subject' && <ArrowUpDown className="w-3 h-3" />}
          </button>
          <button onClick={() => handleSort('bureau')} className="flex items-center gap-1 hover:text-slate-700 dark:hover:text-slate-300">
            Bureau {sortKey === 'bureau' && <ArrowUpDown className="w-3 h-3" />}
          </button>
          <button onClick={() => handleSort('priority')} className="flex items-center gap-1 hover:text-slate-700 dark:hover:text-slate-300">
            Priorité {sortKey === 'priority' && <ArrowUpDown className="w-3 h-3" />}
          </button>
          <button onClick={() => handleSort('delayDays')} className="flex items-center gap-1 hover:text-slate-700 dark:hover:text-slate-300">
            J+ {sortKey === 'delayDays' && <ArrowUpDown className="w-3 h-3" />}
          </button>
          <button onClick={() => handleSort('amount')} className="flex items-center gap-1 hover:text-slate-700 dark:hover:text-slate-300 justify-end">
            Montant {sortKey === 'amount' && <ArrowUpDown className="w-3 h-3" />}
          </button>
        </div>
        
        {/* Liste */}
        <div className="max-h-[calc(100vh-380px)] overflow-auto">
          {loading && (
            <div className="p-8 text-center text-slate-400">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
              Chargement...
            </div>
          )}
          
          {!loading && filteredItems.length === 0 && (
            <div className="p-8 text-center text-slate-400">
              <Inbox className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">{search ? 'Aucun résultat pour cette recherche.' : 'Aucune demande dans cette file.'}</p>
              {search && (
                <button 
                  className="mt-2 text-blue-500 hover:underline text-sm"
                  onClick={() => setSearch('')}
                >
                  Effacer la recherche
                </button>
              )}
            </div>
          )}
          
          {!loading && filteredItems.map((d, idx) => (
            <div
              key={d.id}
              className={`grid grid-cols-[auto_1fr_90px_90px_70px_100px] gap-2 px-4 py-3 border-b border-slate-200/50 dark:border-slate-800/50
                         hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-all
                         ${selected.has(d.id) ? 'bg-blue-500/5 border-l-2 border-l-blue-500' : ''}
                         ${idx % 2 === 0 ? '' : 'bg-slate-50/30 dark:bg-slate-900/20'}`}
              onClick={() => {
                openTab({
                  type: 'demand',
                  id: `demand:${d.id}`,
                  title: `${d.id} — ${d.subject.slice(0, 20)}${d.subject.length > 20 ? '…' : ''}`,
                  icon: d.priority === 'urgent' ? '🔥' : d.isOverdue ? '⏰' : '📄',
                  data: { demandId: d.id },
                });
              }}
            >
              {canBatch && (
                <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selected.has(d.id)}
                    onChange={() => toggleSelect(d.id)}
                    className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 accent-blue-600"
                  />
                </div>
              )}
              {!canBatch && <div className="w-4" />}
              
              <div className="min-w-0 flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  <div className="font-mono text-xs text-slate-400">{d.id}</div>
                  <div className="font-semibold truncate">{d.subject}</div>
                  <div className="text-xs text-slate-400">{d.type}</div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 flex-none" />
              </div>
              
              <div className="flex items-center">
                <span className="px-2 py-0.5 rounded text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center gap-1">
                  <Building2 className="w-3 h-3" />
                  {d.bureau}
                </span>
              </div>
              
              <div className="flex items-center">
                <span className={`px-2 py-0.5 rounded text-xs border ${PRIORITY_COLORS[d.priority] ?? PRIORITY_COLORS.normal}`}>
                  {d.priority}
                </span>
              </div>
              
              <div className="flex items-center">
                <span className={`text-sm font-mono ${d.isOverdue ? 'text-rose-500 font-bold' : 'text-slate-400'}`}>
                  J+{d.delayDays}
                  {d.isOverdue && <AlertTriangle className="w-3 h-3 inline ml-0.5" />}
                </span>
              </div>
              
              <div className="flex items-center justify-end">
                <span className="text-sm text-slate-600 dark:text-slate-300 font-mono">
                  {typeof d.amount === 'number' ? d.amount.toLocaleString() : '—'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Panneau latéral : Stats de la file */}
      <div className="space-y-4">
        <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 dark:border-slate-800 dark:bg-[#1f1f1f]/70">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Résumé de la file
          </h3>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/50">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-xs text-slate-400">Total</div>
            </div>
            <div className="p-3 rounded-xl bg-rose-500/10">
              <div className="text-2xl font-bold text-rose-500">{stats.urgent}</div>
              <div className="text-xs text-rose-400">Urgentes</div>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/10">
              <div className="text-2xl font-bold text-amber-500">{stats.overdue}</div>
              <div className="text-xs text-amber-400">En retard</div>
            </div>
            <div className="p-3 rounded-xl bg-blue-500/10">
              <div className="text-2xl font-bold text-blue-500">{stats.avgDelay}j</div>
              <div className="text-xs text-blue-400">Délai moyen</div>
            </div>
          </div>
          
          {stats.totalAmount > 0 && (
            <div className="mt-3 p-3 rounded-xl bg-emerald-500/10">
              <div className="text-lg font-bold text-emerald-500">{stats.totalAmount.toLocaleString()} FCFA</div>
              <div className="text-xs text-emerald-400">Montant total</div>
            </div>
          )}
        </div>
        
        {/* Répartition par bureau */}
        {stats.bureaux.length > 0 && (
          <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 dark:border-slate-800 dark:bg-[#1f1f1f]/70">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Par bureau
            </h3>
            <div className="space-y-2">
              {stats.bureaux.map(([bureau, count]) => (
                <div key={bureau} className="flex items-center justify-between">
                  <span className="text-sm">{bureau}</span>
                  <div className="flex items-center gap-2">
                    <div 
                      className="h-2 bg-blue-500/30 rounded-full" 
                      style={{ width: `${Math.min(100, (count / stats.total) * 100)}px` }}
                    />
                    <span className="text-sm font-mono text-slate-400 w-8 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Instructions */}
        <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 dark:border-slate-800 dark:bg-[#1f1f1f]/70">
          <h3 className="font-semibold mb-2">Actions rapides</h3>
          <ul className="text-sm text-slate-400 space-y-1.5">
            <li className="flex items-center gap-2">
              <ChevronRight className="w-3 h-3" />
              Cliquez sur une ligne pour ouvrir la demande
            </li>
            {canBatch && (
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3 h-3" />
                Cochez plusieurs lignes pour actions en lot
              </li>
            )}
            <li className="flex items-center gap-2">
              <Search className="w-3 h-3" />
              Utilisez la recherche pour filtrer
            </li>
            <li className="flex items-center gap-2">
              <ArrowUpDown className="w-3 h-3" />
              Cliquez sur les en-têtes pour trier
            </li>
            <li className="flex items-center gap-2">
              <Download className="w-3 h-3" />
              Exportez les données en CSV
            </li>
          </ul>
        </div>
      </div>
      
      {/* Modale action batch */}
      <FluentModal
        open={batchAction !== null}
        title={batchAction === 'validate' ? 'Valider en lot' : 'Rejeter en lot'}
        onClose={() => {
          setBatchAction(null);
          setBatchReason('');
        }}
      >
        <div className="space-y-4">
          <div className={`flex items-center gap-3 p-4 rounded-xl ${
            batchAction === 'validate' ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-rose-500/10 border border-rose-500/20'
          }`}>
            {batchAction === 'validate' ? (
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            ) : (
              <XCircle className="w-8 h-8 text-rose-500" />
            )}
            <div>
              <div className={`font-semibold ${batchAction === 'validate' ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}`}>
                {batchAction === 'validate' ? 'Validation en lot' : 'Rejet en lot'}
              </div>
              <div className={`text-sm ${batchAction === 'validate' ? 'text-emerald-600 dark:text-emerald-300' : 'text-rose-600 dark:text-rose-300'}`}>
                Cette action est définitive pour {selected.size} demande{selected.size > 1 ? 's' : ''}.
              </div>
            </div>
          </div>
          
          {batchAction === 'reject' && (
            <div>
              <label className="block text-sm font-medium mb-2">Motif du rejet *</label>
              <textarea
                className="w-full min-h-[100px] rounded-xl border border-slate-200/70 bg-white/90 p-3 outline-none
                           focus:ring-2 focus:ring-rose-500/30 dark:border-slate-800 dark:bg-[#141414]/70 dark:text-white"
                placeholder="Expliquez le motif du rejet (ce motif sera appliqué à toutes les demandes sélectionnées)..."
                value={batchReason}
                onChange={(e) => setBatchReason(e.target.value)}
              />
            </div>
          )}
          
          <div className="flex items-center justify-end gap-2">
            <button
              className="px-4 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60"
              onClick={() => {
                setBatchAction(null);
                setBatchReason('');
              }}
            >
              Annuler
            </button>
            <button
              className={`px-4 py-2 rounded-xl text-white disabled:opacity-50 ${
                batchAction === 'validate' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
              }`}
              disabled={batchLoading || (batchAction === 'reject' && batchReason.trim().length < 5)}
              onClick={executeBatchAction}
            >
              {batchLoading ? 'Traitement...' : `Confirmer (${selected.size})`}
            </button>
          </div>
        </div>
      </FluentModal>
    </div>
  );
}
