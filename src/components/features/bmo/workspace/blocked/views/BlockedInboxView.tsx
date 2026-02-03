'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { 
  Search, Filter, SortAsc, SortDesc, AlertCircle, AlertTriangle, Clock, 
  Building2, CheckCircle2, Zap, ArrowUpRight, FileText, ChevronRight,
  MoreHorizontal, Eye
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { blockedDossiers } from '@/lib/data';
import { useBlockedWorkspaceStore } from '@/lib/stores/blockedWorkspaceStore';
import { useBlockedToast } from '../BlockedToast';
import type { BlockedDossier } from '@/lib/types/bmo.types';

type Props = {
  tabId: string;
  data?: {
    queue?: string;
    impact?: 'critical' | 'high' | 'medium' | 'low';
    bureauId?: string;
    [key: string]: unknown;
  };
};

type SortMode = 'priority_desc' | 'priority_asc' | 'delay_desc' | 'delay_asc' | 'impact' | 'amount_desc' | 'amount_asc';

const IMPACT_ORDER: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
const IMPACT_WEIGHT: Record<string, number> = { critical: 100, high: 50, medium: 20, low: 5 };

function parseAmountFCFA(amount: unknown): number {
  const s = String(amount ?? '').replace(/[^\d]/g, '');
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
}

function computePriority(d: BlockedDossier): number {
  const w = IMPACT_WEIGHT[d.impact] ?? 1;
  const delay = Math.max(0, d.delay ?? 0) + 1;
  const amount = parseAmountFCFA(d.amount);
  const factor = 1 + amount / 1_000_000;
  return Math.round(w * delay * factor);
}

// Design épuré: bordures colorées, textes neutres
const IMPACT_STYLES: Record<string, { border: string; badge: string; text: string; iconColor: string }> = {
  critical: { 
    border: 'border-l-red-500', 
    badge: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
    text: 'text-slate-900 dark:text-slate-100',
    iconColor: 'text-red-500'
  },
  high: { 
    border: 'border-l-amber-500', 
    badge: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
    text: 'text-slate-900 dark:text-slate-100',
    iconColor: 'text-amber-500'
  },
  medium: { 
    border: 'border-l-blue-500', 
    badge: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
    text: 'text-slate-900 dark:text-slate-100',
    iconColor: 'text-blue-500'
  },
  low: { 
    border: 'border-l-slate-400', 
    badge: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
    text: 'text-slate-900 dark:text-slate-100',
    iconColor: 'text-slate-400'
  },
};

export function BlockedInboxView({ tabId, data }: Props) {
  const toast = useBlockedToast();
  const { openTab, selectedIds, toggleSelected, selectAll, clearSelection } = useBlockedWorkspaceStore();
  
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortMode>('priority_desc');
  const [impactFilter, setImpactFilter] = useState<string | null>(data?.impact ?? null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const allData = blockedDossiers as unknown as BlockedDossier[];

  // Filtrer selon le type de queue
  const baseData = useMemo(() => {
    const queue = data?.queue;
    
    if (!queue || queue === 'all') return allData;
    if (queue === 'critical') return allData.filter(d => d.impact === 'critical');
    if (queue === 'high') return allData.filter(d => d.impact === 'high');
    if (queue === 'medium') return allData.filter(d => d.impact === 'medium');
    if (queue === 'low') return allData.filter(d => d.impact === 'low');
    if (queue.startsWith('bureau:')) {
      const bureau = queue.replace('bureau:', '');
      return allData.filter(d => d.bureau === bureau);
    }
    
    return allData;
  }, [allData, data?.queue]);

  // Filtrer et trier
  const filteredDossiers = useMemo(() => {
    const q = query.trim().toLowerCase();

    let filtered = baseData.filter(d => {
      // Filtre impact
      if (impactFilter && d.impact !== impactFilter) return false;
      
      // Filtre recherche
      if (!q) return true;
      const hay = [d.id, d.type, d.subject, d.reason, d.project, d.impact, d.bureau, d.responsible, String(d.amount ?? '')]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });

    // Tri
    filtered = [...filtered].sort((a, b) => {
      const pa = computePriority(a);
      const pb = computePriority(b);

      if (sort === 'priority_desc') return pb - pa;
      if (sort === 'priority_asc') return pa - pb;
      if (sort === 'delay_desc') return (b.delay ?? 0) - (a.delay ?? 0);
      if (sort === 'delay_asc') return (a.delay ?? 0) - (b.delay ?? 0);
      if (sort === 'impact') return (IMPACT_ORDER[a.impact] ?? 99) - (IMPACT_ORDER[b.impact] ?? 99);
      if (sort === 'amount_desc') return parseAmountFCFA(b.amount) - parseAmountFCFA(a.amount);
      if (sort === 'amount_asc') return parseAmountFCFA(a.amount) - parseAmountFCFA(b.amount);
      return 0;
    });

    return filtered;
  }, [baseData, query, sort, impactFilter]);

  const stats = useMemo(() => {
    const total = filteredDossiers.length;
    const critical = filteredDossiers.filter(d => d.impact === 'critical').length;
    const high = filteredDossiers.filter(d => d.impact === 'high').length;
    const avgDelay = total === 0 ? 0 : Math.round(filteredDossiers.reduce((acc, d) => acc + (d.delay ?? 0), 0) / total);
    
    return { total, critical, high, avgDelay };
  }, [filteredDossiers]);

  const handleOpenDetail = useCallback((dossier: BlockedDossier) => {
    openTab({
      type: 'dossier',
      id: `dossier:${dossier.id}`,
      title: dossier.id,
      icon: dossier.impact === 'critical' ? '🚨' : '📄',
      data: { dossierId: dossier.id, impact: dossier.impact },
    });
  }, [openTab]);

  const visibleSelectedCount = useMemo(() => {
    const visibleIds = new Set(filteredDossiers.map(d => d.id));
    return Array.from(selectedIds).filter(id => visibleIds.has(id)).length;
  }, [filteredDossiers, selectedIds]);

  return (
    <div className="space-y-4">
      {/* Header avec stats - design épuré */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold text-slate-900 dark:text-slate-100">{stats.total}</span>
            <span className="text-slate-400">dossiers</span>
            {stats.critical > 0 && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium">
                <AlertCircle className="w-3 h-3 text-red-500" />
                {stats.critical} critiques
              </span>
            )}
          </div>
          <p className="text-sm text-slate-400">Délai moyen: {stats.avgDelay}j</p>
        </div>
        
        {visibleSelectedCount > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-400">{visibleSelectedCount} sélectionné(s)</span>
            <button
              onClick={() => clearSelection()}
              className="text-sm text-orange-600 hover:underline"
            >
              Désélectionner
            </button>
          </div>
        )}
      </div>

      {/* Barre de recherche et filtres */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px] max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher (ID, sujet, bureau...)"
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200/70 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Filtre impact */}
          {(['critical', 'high', 'medium', 'low'] as const).map(impact => (
            <button
              key={impact}
              onClick={() => setImpactFilter(impactFilter === impact ? null : impact)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                impactFilter === impact
                  ? IMPACT_STYLES[impact].badge
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
              )}
            >
              {impact}
            </button>
          ))}
        </div>

        {/* Tri */}
        <Select value={sort} onValueChange={(v: string) => setSort(v as SortMode)}>
          <SelectTrigger className="px-3 py-2 rounded-xl border border-slate-200/70 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-orange-500/50 h-10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="priority_desc">Priorité ↓</SelectItem>
            <SelectItem value="priority_asc">Priorité ↑</SelectItem>
            <SelectItem value="delay_desc">Délai ↓</SelectItem>
            <SelectItem value="delay_asc">Délai ↑</SelectItem>
            <SelectItem value="impact">Impact</SelectItem>
            <SelectItem value="amount_desc">Montant ↓</SelectItem>
            <SelectItem value="amount_asc">Montant ↑</SelectItem>
          </SelectContent>
        </Select>

        {/* Actions masse */}
        {visibleSelectedCount > 0 && (
          <button
            onClick={() => {
              // Open decision center
              window.dispatchEvent(new CustomEvent('blocked:open-decision-center'));
            }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-orange-500 text-white text-sm font-medium hover:bg-orange-600 transition-colors"
          >
            <Zap className="w-4 h-4" />
            Actions ({visibleSelectedCount})
          </button>
        )}
      </div>

      {/* Liste des dossiers */}
      <div className="space-y-2">
        {filteredDossiers.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Aucun dossier ne correspond aux critères</p>
          </div>
        ) : (
          filteredDossiers.map(dossier => {
            const isSelected = selectedIds.has(dossier.id);
            const isExpanded = expandedId === dossier.id;
            const priority = computePriority(dossier);
            const style = IMPACT_STYLES[dossier.impact] || IMPACT_STYLES.low;
            
            return (
              <div
                key={dossier.id}
                className={cn(
                  "rounded-xl border-l-4 bg-white dark:bg-slate-900/50 border border-slate-200/70 dark:border-slate-800 transition-all",
                  style.border,
                  isSelected && "ring-2 ring-orange-500",
                  dossier.impact === 'critical' && "shadow-md"
                )}
              >
                {/* Header row */}
                <div 
                  className="p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/30"
                  onClick={() => setExpandedId(isExpanded ? null : dossier.id)}
                >
                  <div className="flex items-start gap-4">
                    {/* Checkbox */}
                    <label 
                      className="flex items-center mt-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelected(dossier.id)}
                        className="w-4 h-4 rounded border-slate-300 text-orange-500 focus:ring-orange-500"
                      />
                    </label>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {dossier.id}
                        </span>
                        <span className={cn("text-xs font-medium px-2 py-0.5 rounded", style.badge)}>
                          {dossier.impact}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {dossier.type}
                        </span>
                        {dossier.impact === 'critical' && (
                          <span className="flex items-center gap-1 text-xs text-red-500 animate-pulse">
                            <AlertCircle className="w-3 h-3" />
                            Urgent
                          </span>
                        )}
                      </div>
                      
                      <p className="font-medium text-slate-900 dark:text-slate-100">{dossier.subject}</p>
                      <p className="text-sm text-slate-400 mt-0.5 line-clamp-1">{dossier.reason}</p>
                      
                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          {dossier.bureau}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          J+{dossier.delay}
                        </span>
                        <span>Projet: {dossier.project}</span>
                      </div>
                    </div>

                    {/* Right side */}
                    <div className="text-right flex-none">
                      <p className="font-mono font-bold text-amber-600 dark:text-amber-400">{dossier.amount}</p>
                      <p className="text-xs text-slate-400 mt-1">
                        Priorité: <span className={cn("font-bold", priority > 5000 ? "text-red-500" : priority > 2000 ? "text-amber-500" : "text-blue-500")}>{priority}</span>
                      </p>
                      <ChevronRight className={cn(
                        "w-4 h-4 ml-auto mt-2 text-slate-400 transition-transform",
                        isExpanded && "rotate-90"
                      )} />
                    </div>
                  </div>
                </div>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-0 border-t border-slate-200/70 dark:border-slate-800">
                    <div className="pt-4 space-y-4">
                      {/* Détails */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-xs text-slate-400 mb-1">Responsable</p>
                          <p className="font-medium">{dossier.responsible || '—'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400 mb-1">Projet</p>
                          <Link 
                            href={`/maitre-ouvrage/projets-en-cours?id=${dossier.project}`}
                            className="font-medium text-orange-600 hover:underline"
                          >
                            {dossier.project}
                          </Link>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400 mb-1">Délai</p>
                          <p className={cn(
                            "font-medium",
                            (dossier.delay ?? 0) > 14 ? "text-red-500" : (dossier.delay ?? 0) > 7 ? "text-amber-500" : ""
                          )}>
                            J+{dossier.delay} jours
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400 mb-1">Montant</p>
                          <p className="font-mono font-bold">{dossier.amount}</p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2 pt-2">
                        <button
                          onClick={() => handleOpenDetail(dossier)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          Détails
                        </button>
                        <button
                          onClick={() => {
                            toggleSelected(dossier.id);
                            window.dispatchEvent(new CustomEvent('blocked:open-decision-center'));
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-orange-500/10 text-orange-600 hover:bg-orange-500/20 transition-colors"
                        >
                          <ArrowUpRight className="w-4 h-4" />
                          Escalader
                        </button>
                        <button
                          onClick={() => {
                            toggleSelected(dossier.id);
                            window.dispatchEvent(new CustomEvent('blocked:open-decision-center'));
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-purple-500/10 text-purple-600 hover:bg-purple-500/20 transition-colors"
                        >
                          <Zap className="w-4 h-4" />
                          Substituer
                        </button>
                        <button
                          onClick={() => toast.success('Demande envoyée', `Pièce demandée pour ${dossier.id}`)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        >
                          <FileText className="w-4 h-4" />
                          Demander pièce
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Pagination / Load more */}
      {filteredDossiers.length > 0 && (
        <div className="text-center py-4">
          <p className="text-sm text-slate-400">
            Affichage de {filteredDossiers.length} dossiers
          </p>
        </div>
      )}
    </div>
  );
}

