'use client';

import React, { useMemo, useState, useCallback } from 'react';
import { useValidationContratsWorkspaceStore, type ContractQueue } from '@/lib/stores/validationContratsWorkspaceStore';
import { useContratToast } from '../ContratToast';
import { contractsToSign, raciMatrix, employees } from '@/lib/data';
import type { Contract } from '@/lib/types/bmo.types';
import { FluentButton } from '@/components/ui/fluent-button';
import { FluentTabs, FluentTabsTrigger, FluentTabsContent } from '@/components/ui/fluent-tabs';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

import {
  Search,
  Filter,
  SortAsc,
  SortDesc,
  CheckSquare,
  Square,
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Shield,
  Signature,
  MoreVertical,
  Eye,
  ChevronRight,
  ChevronDown,
  Download,
  Trash2,
  RefreshCw,
  ArrowUpDown,
  Building2,
  Calendar,
  DollarSign,
  AlertCircle,
  User,
  Hash,
} from 'lucide-react';

// ================================
// Utils
// ================================
const parseMoney = (v: unknown): number => {
  if (typeof v === 'number') return Number.isFinite(v) ? v : 0;
  const raw = String(v ?? '')
    .replace(/\s/g, '')
    .replace(/FCFA|XOF|F\s?CFA/gi, '')
    .replace(/[^\d,.-]/g, '');
  const normalized = raw.replace(/,/g, '');
  const n = Number(normalized);
  return Number.isFinite(n) ? n : 0;
};

const formatFCFA = (v: unknown): string => {
  const n = parseMoney(v);
  return `${n.toLocaleString('fr-FR')} F`;
};

const parseFRDate = (d?: string | null): Date | null => {
  if (!d || d === '—') return null;
  const parts = d.split('/');
  if (parts.length !== 3) return null;
  const [dd, mm, yy] = parts.map((x) => Number(x));
  if (!dd || !mm || !yy) return null;
  return new Date(yy, mm - 1, dd, 0, 0, 0, 0);
};

const getDaysToExpiry = (expiryStr: string): number | null => {
  const expiryDate = parseFRDate(expiryStr);
  if (!expiryDate) return null;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const diffTime = expiryDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// ================================
// Risk Engine
// ================================
const computeRisk = (c: Contract & { daysToExpiry: number | null; amountValue: number }) => {
  const signals: string[] = [];
  let score = 0;

  // Échéance
  if (c.daysToExpiry === null) { score += 8; signals.push("Date d'expiration manquante"); }
  else if (c.daysToExpiry < 0) { score += 35; signals.push('Contrat expiré'); }
  else if (c.daysToExpiry <= 3) { score += 25; signals.push('Échéance ≤ 3 jours'); }
  else if (c.daysToExpiry <= 7) { score += 15; signals.push('Échéance ≤ 7 jours'); }
  else if (c.daysToExpiry <= 14) { score += 8; signals.push('Échéance ≤ 14 jours'); }

  // Montant
  const a = Math.abs(c.amountValue);
  if (a >= 50_000_000) { score += 22; signals.push('Montant très élevé'); }
  else if (a >= 10_000_000) { score += 14; signals.push('Montant élevé'); }
  else if (a >= 2_000_000) { score += 7; signals.push('Montant significatif'); }

  // Données manquantes
  if (!c.subject?.trim()) { score += 10; signals.push('Objet manquant'); }
  if (!(c as any).partner?.trim()) { score += 10; signals.push('Partenaire manquant'); }

  score = Math.min(100, Math.max(0, score));
  const priority: 'NOW' | 'WATCH' | 'OK' = score >= 70 ? 'NOW' : score >= 40 ? 'WATCH' : 'OK';
  
  return { score, signals, priority };
};

// ================================
// Types
// ================================
interface ContractItem extends Contract {
  daysToExpiry: number | null;
  amountValue: number;
  riskScore: number;
  riskSignals: string[];
  priority: 'NOW' | 'WATCH' | 'OK';
}

type SortField = 'risk' | 'amount' | 'expiry' | 'date' | 'type';
type ViewMode = 'list' | 'cards' | 'table';
type SubTab = 'all' | 'urgent' | 'pending' | 'validated';

// ================================
// Component
// ================================
export function ContratInboxView({ queue, tabId }: { queue: string; tabId: string }) {
  const { openTab, selection, toggleSelection, selectAll, clearSelection, isSelected } = 
    useValidationContratsWorkspaceStore();
  const toast = useContratToast();

  // État local
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('risk');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [subTab, setSubTab] = useState<SubTab>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Enrichir les contrats
  const items: ContractItem[] = useMemo(() => {
    return (contractsToSign as Contract[]).map((c) => {
      const amountValue = parseMoney((c as any).amount);
      const daysToExpiry = (c as any).expiry ? getDaysToExpiry(String((c as any).expiry)) : null;
      const risk = computeRisk({ ...c, daysToExpiry, amountValue });
      
      return {
        ...c,
        amountValue,
        daysToExpiry,
        riskScore: risk.score,
        riskSignals: risk.signals,
        priority: risk.priority,
      };
    });
  }, []);

  // Filtrage par queue
  const queueFiltered = useMemo(() => {
    switch (queue) {
      case 'pending_bj':
        return items.filter((i) => i.status === 'pending');
      case 'pending_bmo':
        return items.filter((i) => i.status === 'pending');
      case 'urgent':
        return items.filter((i) => i.daysToExpiry !== null && i.daysToExpiry <= 7 && i.daysToExpiry >= 0);
      case 'expired':
        return items.filter((i) => i.daysToExpiry !== null && i.daysToExpiry < 0);
      case 'signed':
        return items.filter((i) => i.status === 'validated');
      case 'high_risk':
        return items.filter((i) => i.riskScore >= 70);
      case 'marche':
        return items.filter((i) => (i as any).type === 'Marché');
      case 'avenant':
        return items.filter((i) => (i as any).type === 'Avenant');
      case 'sous_traitance':
        return items.filter((i) => (i as any).type === 'Sous-traitance');
      default:
        return items;
    }
  }, [items, queue]);

  // Sous-filtrage par subTab
  const subFiltered = useMemo(() => {
    switch (subTab) {
      case 'urgent':
        return queueFiltered.filter((i) => i.priority === 'NOW');
      case 'pending':
        return queueFiltered.filter((i) => i.status === 'pending');
      case 'validated':
        return queueFiltered.filter((i) => i.status === 'validated');
      default:
        return queueFiltered;
    }
  }, [queueFiltered, subTab]);

  // Recherche
  const searchFiltered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return subFiltered;
    
    return subFiltered.filter((i) => {
      const hay = [
        i.id,
        (i as any).type ?? '',
        i.subject ?? '',
        (i as any).partner ?? '',
        (i as any).bureau ?? '',
      ].join(' ').toLowerCase();
      return hay.includes(q);
    });
  }, [subFiltered, search]);

  // Tri
  const sorted = useMemo(() => {
    const dir = sortDir === 'desc' ? -1 : 1;
    return [...searchFiltered].sort((a, b) => {
      switch (sortField) {
        case 'risk':
          return (a.riskScore - b.riskScore) * dir;
        case 'amount':
          return (a.amountValue - b.amountValue) * dir;
        case 'expiry':
          const ax = a.daysToExpiry === null ? 999999 : a.daysToExpiry;
          const bx = b.daysToExpiry === null ? 999999 : b.daysToExpiry;
          return (ax - bx) * dir;
        case 'type':
          return ((a as any).type ?? '').localeCompare((b as any).type ?? '') * dir;
        default:
          return 0;
      }
    });
  }, [searchFiltered, sortField, sortDir]);

  // Stats
  const stats = useMemo(() => ({
    total: sorted.length,
    urgent: sorted.filter((i) => i.priority === 'NOW').length,
    pending: sorted.filter((i) => i.status === 'pending').length,
    validated: sorted.filter((i) => i.status === 'validated').length,
  }), [sorted]);

  // Sélection
  const selectedCount = useMemo(() => {
    return sorted.filter((i) => isSelected(i.id)).length;
  }, [sorted, isSelected]);

  const handleSelectAll = useCallback(() => {
    if (selectedCount === sorted.length) {
      clearSelection();
    } else {
      selectAll(sorted.map((i) => i.id));
    }
  }, [sorted, selectedCount, selectAll, clearSelection]);

  const openContract = useCallback((id: string) => {
    openTab({
      id: `contrat:${id}`,
      type: 'contrat',
      title: id,
      icon: '📄',
      data: { contractId: id },
    });
  }, [openTab]);

  const toggleSort = useCallback((field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  }, [sortField]);

  // Titre de la queue
  const queueTitle = useMemo(() => {
    const titles: Record<string, string> = {
      pending_bj: 'Validation BJ',
      pending_bmo: 'Signature BMO',
      urgent: 'Urgents',
      expired: 'Expirés',
      signed: 'Signés',
      high_risk: 'Risque élevé',
      marche: 'Marchés',
      avenant: 'Avenants',
      sous_traitance: 'Sous-traitance',
      all: 'Tous les contrats',
    };
    return titles[queue] || queue;
  }, [queue]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-500" />
            {queueTitle}
            <span className="px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 text-sm font-semibold">
              {stats.total}
            </span>
          </h2>
          <p className="text-sm text-slate-500">
            {stats.urgent} urgents • {stats.pending} en attente • {stats.validated} validés
          </p>
        </div>

        <div className="flex items-center gap-2">
          <FluentButton 
            size="sm" 
            variant="secondary"
            onClick={() => window.dispatchEvent(new CustomEvent('contrats:refresh'))}
          >
            <RefreshCw className="w-4 h-4" />
          </FluentButton>
          <FluentButton 
            size="sm" 
            variant="secondary"
            onClick={() => window.dispatchEvent(new CustomEvent('contrats:open-export'))}
          >
            <Download className="w-4 h-4" />
          </FluentButton>
        </div>
      </div>

      {/* Sous-onglets */}
      <div className="flex items-center gap-1 border-b border-slate-200/70 dark:border-slate-700/70">
        {[
          { id: 'all' as SubTab, label: 'Tous', count: queueFiltered.length },
          { id: 'urgent' as SubTab, label: 'Urgents', count: queueFiltered.filter((i) => i.priority === 'NOW').length, color: 'rose' },
          { id: 'pending' as SubTab, label: 'En attente', count: queueFiltered.filter((i) => i.status === 'pending').length, color: 'amber' },
          { id: 'validated' as SubTab, label: 'Validés', count: queueFiltered.filter((i) => i.status === 'validated').length, color: 'emerald' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setSubTab(t.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors',
              subTab === t.id
                ? 'border-purple-500 text-purple-700 dark:text-purple-300'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            )}
          >
            {t.label}
            <span className={cn(
              'px-1.5 py-0.5 rounded-full text-xs',
              t.color === 'rose' && 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300',
              t.color === 'amber' && 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
              t.color === 'emerald' && 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
              !t.color && 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
            )}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Barre de recherche et filtres */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="flex-1 min-w-[200px] max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher (ID, objet, partenaire...)"
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200/70 dark:border-slate-700 bg-white/80 dark:bg-slate-900/50 text-sm outline-none focus:ring-2 focus:ring-purple-500/30"
          />
        </div>

        {/* Sort buttons */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/50 rounded-xl p-1">
          {[
            { id: 'risk' as SortField, label: 'Risque', icon: AlertTriangle },
            { id: 'amount' as SortField, label: 'Montant', icon: DollarSign },
            { id: 'expiry' as SortField, label: 'Échéance', icon: Calendar },
          ].map((s) => {
            const Icon = s.icon;
            const isActive = sortField === s.id;
            return (
              <button
                key={s.id}
                onClick={() => toggleSort(s.id)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                  isActive
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {s.label}
                {isActive && (
                  sortDir === 'desc' 
                    ? <SortDesc className="w-3 h-3" />
                    : <SortAsc className="w-3 h-3" />
                )}
              </button>
            );
          })}
        </div>

        {/* Selection actions */}
        {selectedCount > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-900/30 border border-purple-200/50 dark:border-purple-700/50">
            <span className="text-xs font-medium text-purple-700 dark:text-purple-300">
              {selectedCount} sélectionné{selectedCount > 1 ? 's' : ''}
            </span>
            <FluentButton size="xs" variant="ghost" onClick={clearSelection}>
              Annuler
            </FluentButton>
          </div>
        )}
      </div>

      {/* Liste */}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {sorted.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-12 text-center"
            >
              <FileText className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
              <p className="text-slate-500">Aucun contrat trouvé</p>
            </motion.div>
          ) : (
            sorted.map((item, index) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.02 }}
              >
                <ContractRow
                  item={item}
                  isSelected={isSelected(item.id)}
                  isExpanded={expandedId === item.id}
                  onToggleSelect={() => toggleSelection(item.id)}
                  onToggleExpand={() => setExpandedId((e) => (e === item.id ? null : item.id))}
                  onOpen={() => openContract(item.id)}
                />
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ================================
// Contract Row
// ================================
interface ContractRowProps {
  item: ContractItem;
  isSelected: boolean;
  isExpanded: boolean;
  onToggleSelect: () => void;
  onToggleExpand: () => void;
  onOpen: () => void;
}

function ContractRow({ item, isSelected, isExpanded, onToggleSelect, onToggleExpand, onOpen }: ContractRowProps) {
  return (
    <div
      className={cn(
        'rounded-xl border transition-all',
        isSelected
          ? 'border-purple-300 dark:border-purple-700 bg-purple-50/50 dark:bg-purple-900/20'
          : 'border-slate-200/70 dark:border-slate-700/70 bg-white/80 dark:bg-slate-900/50',
        item.priority === 'NOW' && !isSelected && 'border-l-4 border-l-rose-500',
        item.priority === 'WATCH' && !isSelected && 'border-l-4 border-l-amber-500',
      )}
    >
      {/* Main row */}
      <div className="flex items-center gap-3 p-4">
        {/* Checkbox */}
        <button
          onClick={(e) => { e.stopPropagation(); onToggleSelect(); }}
          className="flex-none p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
          {isSelected ? (
            <CheckSquare className="w-5 h-5 text-purple-600" />
          ) : (
            <Square className="w-5 h-5 text-slate-400" />
          )}
        </button>

        {/* Expand toggle */}
        <button
          onClick={onToggleExpand}
          className="flex-none p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {/* ID & Type */}
        <div className="flex-none w-32">
          <div className="font-mono text-sm font-bold text-purple-700 dark:text-purple-300">
            {item.id}
          </div>
          <div className="text-xs text-slate-500">{(item as any).type}</div>
        </div>

        {/* Subject & Partner */}
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm text-slate-900 dark:text-slate-100 truncate">
            {item.subject || '(Sans objet)'}
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Building2 className="w-3 h-3" />
            <span className="truncate">{(item as any).partner || '—'}</span>
            <span className="text-slate-300 dark:text-slate-600">•</span>
            <span>{(item as any).bureau || '—'}</span>
          </div>
        </div>

        {/* Amount */}
        <div className="flex-none w-32 text-right">
          <div className="font-mono font-bold text-sm text-amber-600 dark:text-amber-400">
            {formatFCFA(item.amountValue)}
          </div>
        </div>

        {/* Expiry */}
        <div className="flex-none w-24 text-right">
          {item.daysToExpiry !== null ? (
            <div className={cn(
              'inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium',
              item.daysToExpiry < 0 && 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300',
              item.daysToExpiry >= 0 && item.daysToExpiry <= 7 && 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
              item.daysToExpiry > 7 && 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
            )}>
              <Clock className="w-3 h-3" />
              {item.daysToExpiry < 0 ? 'Expiré' : `J-${item.daysToExpiry}`}
            </div>
          ) : (
            <span className="text-xs text-slate-400">—</span>
          )}
        </div>

        {/* Risk score */}
        <div className="flex-none w-16 text-right">
          <div className={cn(
            'inline-flex items-center justify-center w-10 h-10 rounded-xl text-sm font-bold',
            item.riskScore >= 70 && 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300',
            item.riskScore >= 40 && item.riskScore < 70 && 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
            item.riskScore < 40 && 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
          )}>
            {item.riskScore}
          </div>
        </div>

        {/* Actions */}
        <div className="flex-none flex items-center gap-1">
          <FluentButton size="sm" variant="primary" onClick={onOpen}>
            <Eye className="w-4 h-4 mr-1" />
            Ouvrir
          </FluentButton>
        </div>
      </div>

      {/* Expanded content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-xs text-slate-500 mb-1">Préparé par</div>
                  <div className="text-sm font-medium flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-400" />
                    {(item as any).preparedBy || '—'}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">Date</div>
                  <div className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    {(item as any).date || '—'}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">Expiration</div>
                  <div className="text-sm font-medium flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    {(item as any).expiry || '—'}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">Status</div>
                  <div className={cn(
                    'inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium',
                    item.status === 'pending' && 'bg-amber-100 text-amber-700 dark:bg-amber-900/50',
                    item.status === 'validated' && 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50',
                  )}>
                    {item.status === 'pending' ? 'En attente' : 'Validé'}
                  </div>
                </div>
              </div>

              {/* Risk signals */}
              {item.riskSignals.length > 0 && (
                <div className="mt-4">
                  <div className="text-xs text-slate-500 mb-2">Signaux de risque</div>
                  <div className="flex flex-wrap gap-2">
                    {item.riskSignals.map((signal, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 text-xs"
                      >
                        <AlertCircle className="w-3 h-3" />
                        {signal}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

