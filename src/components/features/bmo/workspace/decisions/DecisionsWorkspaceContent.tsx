'use client';
import { useState, useEffect } from 'react';
import { useDecisionsWorkspaceStore } from '@/lib/stores/decisionsWorkspaceStore';
import { useDecisionsCommandCenterStore } from '@/lib/stores/decisionsCommandCenterStore';
import { decisionsApiService, type Decision } from '@/lib/services/decisionsApiService';
import { FileText, Target, Settings, History, BarChart3, Search, ChevronRight, Eye, Star, StarOff, Gavel, User, Clock, Zap, DollarSign, CheckCircle, Users } from 'lucide-react';
import { cn } from '@/lib/cn';
import { logger } from '@/lib/utils/logger';
const STATUS_STYLES = { draft: { border: 'border-l-slate-500', badge: 'bg-slate-500/20 text-slate-600' }, pending: { border: 'border-l-amber-500', badge: 'bg-amber-500/20 text-amber-600' }, approved: { border: 'border-l-emerald-500', badge: 'bg-emerald-500/20 text-emerald-600' }, rejected: { border: 'border-l-red-500', badge: 'bg-red-500/20 text-red-600' }, executed: { border: 'border-l-blue-500', badge: 'bg-blue-500/20 text-blue-600' } };
const IMPACT_STYLES = { critical: { badge: 'bg-red-500/20 text-red-600', icon: Zap }, high: { badge: 'bg-amber-500/20 text-amber-600', icon: Zap }, medium: { badge: 'bg-blue-500/20 text-blue-600', icon: Clock }, low: { badge: 'bg-slate-500/20 text-slate-600', icon: Clock } };
export function DecisionsWorkspaceContent() {
  const { tabs, activeTabId, openTab, currentFilter, watchlist, addToWatchlist, removeFromWatchlist } = useDecisionsWorkspaceStore();
  const { openModal, openDetailPanel } = useDecisionsCommandCenterStore();
  const activeTab = tabs.find(t => t.id === activeTabId); const [decisions, setDecisions] = useState<Decision[]>([]); const [loading, setLoading] = useState(true); const [searchQuery, setSearchQuery] = useState(''); const [expandedId, setExpandedId] = useState<string | null>(null);
  const queue = activeTab?.data?.queue as string | undefined;
  useEffect(() => { const load = async () => { setLoading(true); try { const filter = { ...currentFilter }; if (queue && queue !== 'all') { if (['draft', 'pending', 'approved', 'rejected', 'executed'].includes(queue)) filter.status = queue; else if (['strategique', 'operationnel', 'financier', 'rh', 'technique'].includes(queue)) filter.type = queue; else if (queue === 'critical') filter.status = 'pending'; } if (searchQuery) filter.search = searchQuery; const r = await decisionsApiService.getAll(filter, 'impact', 1, 50); setDecisions(r.data); } catch (e) { logger.error('Decisions load failed', e as Error, { context: 'DecisionsWorkspaceContent' }); } finally { setLoading(false); } }; load(); }, [currentFilter, queue, searchQuery]);
  const handleOpenDetail = (dec: Decision, event?: React.MouseEvent) => {
    event?.stopPropagation();
    // Pattern modal overlay - ouvrir la modal au lieu de naviguer
    const currentIndex = decisions.findIndex(d => d.id === dec.id);
    const hasNext = currentIndex < decisions.length - 1;
    const hasPrevious = currentIndex > 0;
    
    openModal('decision-detail', {
      decisionId: dec.id,
      onNext: hasNext ? () => {
        const nextDecision = decisions[currentIndex + 1];
        if (nextDecision) {
          openModal('decision-detail', {
            decisionId: nextDecision.id,
            onNext: currentIndex + 1 < decisions.length - 1 ? () => {
              const next = decisions[currentIndex + 2];
              if (next) openModal('decision-detail', { decisionId: next.id });
            } : undefined,
            onPrevious: () => openModal('decision-detail', { decisionId: dec.id }),
            hasNext: currentIndex + 1 < decisions.length - 1,
            hasPrevious: true,
          });
        }
      } : undefined,
      onPrevious: hasPrevious ? () => {
        const prevDecision = decisions[currentIndex - 1];
        if (prevDecision) {
          openModal('decision-detail', {
            decisionId: prevDecision.id,
            onNext: () => openModal('decision-detail', { decisionId: dec.id }),
            onPrevious: currentIndex - 1 > 0 ? () => {
              const prev = decisions[currentIndex - 2];
              if (prev) openModal('decision-detail', { decisionId: prev.id });
            } : undefined,
            hasNext: true,
            hasPrevious: currentIndex - 1 > 0,
          });
        }
      } : undefined,
      hasNext,
      hasPrevious,
    });
  };
  
  const handleQuickView = (dec: Decision, event?: React.MouseEvent) => {
    event?.stopPropagation();
    // Ouvrir le panel latéral pour vue rapide
    openDetailPanel('decision', dec.id, {
      ref: dec.ref,
      titre: dec.titre,
      status: dec.status,
      impact: dec.impact,
    });
  };
  if (!activeTab) return <div className="flex items-center justify-center h-64 text-slate-400"><Gavel className="w-12 h-12 opacity-30" /></div>;
  if (activeTab.type === 'strategique') return <PlaceholderView icon={<Target className="w-12 h-12" />} title="Décisions stratégiques" />;
  if (activeTab.type === 'operationnel') return <PlaceholderView icon={<Settings className="w-12 h-12" />} title="Décisions opérationnelles" />;
  if (activeTab.type === 'historique') return <PlaceholderView icon={<History className="w-12 h-12" />} title="Historique" />;
  if (activeTab.type === 'analytics') return <PlaceholderView icon={<BarChart3 className="w-12 h-12" />} title="Analytics" />;
  if (activeTab.type === 'detail') return <PlaceholderView icon={<FileText className="w-12 h-12" />} title="Détail de la décision" />;
  return (<div className="space-y-4"><div className="flex flex-wrap items-center justify-between gap-4"><div><h2 className="text-lg font-bold">{queue === 'pending' ? 'En attente' : queue === 'approved' ? 'Approuvées' : queue === 'executed' ? 'Exécutées' : queue === 'critical' ? 'Critiques' : 'Toutes les décisions'}</h2><p className="text-sm text-slate-400">{decisions.length} décision(s)</p></div><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Rechercher..." className="pl-10 pr-4 py-2 w-64 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50" /></div></div>{loading ? <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-28 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />)}</div> : decisions.length === 0 ? <div className="py-12 text-center text-slate-400"><Gavel className="w-12 h-12 mx-auto mb-3 opacity-30" /><p className="font-medium">Aucune décision trouvée</p></div> : <div className="space-y-2">{decisions.map(dec => { const statusStyle = STATUS_STYLES[dec.status] || STATUS_STYLES.draft; const impactStyle = IMPACT_STYLES[dec.impact] || IMPACT_STYLES.medium; const ImpactIcon = impactStyle.icon; const isExpanded = expandedId === dec.id; const isInWatchlist = watchlist.includes(dec.id); return (<div key={dec.id} className={cn("rounded-xl border-l-4 bg-white dark:bg-slate-900/50 border border-slate-200/70 dark:border-slate-800 transition-all hover:shadow-md", statusStyle.border, dec.impact === 'critical' && "ring-1 ring-red-500/20")} onClick={() => setExpandedId(isExpanded ? null : dec.id)}><div className="p-4 cursor-pointer"><div className="flex items-start gap-4"><div className="flex-1 min-w-0"><div className="flex items-center gap-2 flex-wrap mb-1"><span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600">{dec.ref}</span><span className={cn("text-xs font-medium px-2 py-0.5 rounded", statusStyle.badge)}>{decisionsApiService.getStatusLabel(dec.status)}</span><span className={cn("text-xs font-medium px-2 py-0.5 rounded flex items-center gap-1", impactStyle.badge)}><ImpactIcon className="w-3 h-3" />{dec.impact}</span><span className="text-xs px-2 py-0.5 rounded bg-rose-500/10 text-rose-600">{decisionsApiService.getTypeLabel(dec.type)}</span><span className="text-xs px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600">{decisionsApiService.getNiveauLabel(dec.niveau)}</span></div><p className="font-medium text-slate-900 dark:text-slate-100">{dec.titre}</p><div className="flex items-center gap-4 mt-2 text-xs text-slate-400"><span className="flex items-center gap-1"><User className="w-3 h-3" />{dec.auteur.name}</span><span className="flex items-center gap-1"><Users className="w-3 h-3" />{dec.approbateurs.length} approbateur(s)</span><span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(dec.dateCreation).toLocaleDateString('fr-FR')}</span></div></div><div className="text-right flex-none">{dec.montantImpact && <p className="font-mono font-bold text-rose-600 flex items-center gap-1 justify-end"><DollarSign className="w-4 h-4" />{decisionsApiService.formatMontant(dec.montantImpact)}</p>}<div className="flex items-center justify-end gap-2 mt-2"><button onClick={e => { e.stopPropagation(); isInWatchlist ? removeFromWatchlist(dec.id) : addToWatchlist(dec.id); }} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700">{isInWatchlist ? <Star className="w-4 h-4 text-amber-500 fill-current" /> : <StarOff className="w-4 h-4 text-slate-400" />}</button><button onClick={e => { e.stopPropagation(); handleOpenDetail(dec); }} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700"><Eye className="w-4 h-4 text-slate-400" /></button><ChevronRight className={cn("w-4 h-4 text-slate-400 transition-transform", isExpanded && "rotate-90")} /></div></div></div></div>{isExpanded && <div className="px-4 pb-4 pt-0 border-t border-slate-200/70 dark:border-slate-800"><p className="text-sm text-slate-600 dark:text-slate-400 py-4">{dec.description}</p><div className="mb-4"><h4 className="text-sm font-medium mb-2">Approbateurs</h4><div className="flex flex-wrap gap-2">{dec.approbateurs.map(a => <div key={a.id} className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-sm flex items-center gap-2"><span>{a.name}</span><span className={cn("w-2 h-2 rounded-full", a.status === 'approved' ? 'bg-emerald-500' : a.status === 'rejected' ? 'bg-red-500' : 'bg-amber-500')} /></div>)}{dec.approbateurs.length === 0 && <p className="text-sm text-slate-400">Aucun approbateur défini</p>}</div></div><div className="flex items-center gap-2 pt-2 border-t border-slate-200/70 dark:border-slate-800"><button onClick={() => handleOpenDetail(dec)} className="flex-1 px-4 py-2 rounded-lg bg-rose-500 text-white text-sm font-medium hover:bg-rose-600">Voir le détail</button>{dec.status === 'pending' && <button className="px-4 py-2 rounded-lg bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600"><CheckCircle className="w-4 h-4 inline mr-1" />Approuver</button>}</div></div>}</div>); })}</div>}</div>);
}
function PlaceholderView({ icon, title }: { icon: React.ReactNode; title: string }) { return <div className="flex items-center justify-center h-64 text-slate-400"><div className="text-center"><div className="mx-auto mb-4 opacity-30">{icon}</div><p className="font-semibold">{title}</p><p className="text-xs mt-4 text-slate-400">En cours de développement</p></div></div>; }

