'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useArbitragesWorkspaceStore, type ArbitragesTab } from '@/lib/stores/arbitragesWorkspaceStore';
import { FluentButton } from '@/components/ui/fluent-button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import {
  Search, Filter, RefreshCw, ArrowUpDown, Scale, Clock, AlertTriangle,
  CheckCircle, Building2, ChevronRight, Eye
} from 'lucide-react';

type ArbitrageItem = {
  id: string;
  subject: string;
  status: string;
  type?: string;
  _type: 'vivant' | 'simple';
  context?: {
    riskLevel?: string;
    financialExposure?: number;
    linkedEntity?: {
      type: string;
      label: string;
    };
  };
  timing?: {
    daysRemaining?: number;
    isOverdue?: boolean;
  };
  deadline?: string;
  impact?: string;
  parties?: any[];
  [key: string]: any;
};

type BureauItem = {
  code: string;
  name: string;
  charge: number;
  completion: number;
  agents: number;
  goulots: string[];
  budget: string;
  budgetUsed: string;
  [key: string]: any;
};

type InboxData = {
  items: (ArbitrageItem | BureauItem)[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
};

export function ArbitragesInboxView({ tab }: { tab: ArbitragesTab }) {
  const { openTab } = useArbitragesWorkspaceStore();
  const queue = tab.data?.queue || 'all';
  const type = tab.data?.type || 'arbitrages';

  const [data, setData] = useState<InboxData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortField, setSortField] = useState<string>('default');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Filtres avancés
  const [filters, setFilters] = useState({
    riskLevel: '',
    status: '',
    hasGoulots: false,
    minCharge: 0,
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        queue: String(queue),
        type: String(type),
        limit: '50',
        offset: '0',
      });

      if (searchQuery) params.set('search', searchQuery);

      const res = await fetch(`/api/arbitrages?${params.toString()}`, {
        cache: 'no-store',
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const result = await res.json();
      setData(result);
    } catch (err: any) {
      setError(err.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, [queue, type, searchQuery]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filtrage local supplémentaire
  const filteredItems = useMemo(() => {
    if (!data) return [];

    let items = [...data.items];

    if (type === 'arbitrages') {
      // Filtres arbitrages
      if (filters.riskLevel) {
        items = items.filter((item: any) => 
          item.context?.riskLevel === filters.riskLevel || item.impact === filters.riskLevel
        );
      }
      if (filters.status) {
        items = items.filter((item: any) => item.status === filters.status);
      }
    } else if (type === 'bureaux') {
      // Filtres bureaux
      if (filters.hasGoulots) {
        items = items.filter((item: any) => (item.goulots?.length || 0) > 0);
      }
      if (filters.minCharge > 0) {
        items = items.filter((item: any) => (item.charge || 0) >= filters.minCharge);
      }
    }

    return items;
  }, [data, filters, type]);

  const handleOpenItem = (item: any) => {
    if (type === 'bureaux') {
      openTab({
        id: `bureau:${item.code}`,
        type: 'detail',
        title: item.name,
        icon: '🏢',
        data: { bureauCode: item.code },
      });
    } else {
      openTab({
        id: `arbitrage:${item.id}`,
        type: 'detail',
        title: item.subject || item.id,
        icon: item._type === 'vivant' ? '⚔️' : '⚖️',
        data: { arbitrageId: item.id, arbitrageType: item._type },
      });
    }
  };

  const formatMoney = (amount?: number) => {
    if (!amount) return '—';
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            {type === 'bureaux' ? (
              <Building2 className="w-5 h-5 text-blue-500" />
            ) : (
              <Scale className="w-5 h-5 text-red-500" />
            )}
            {tab.title}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {data ? `${filteredItems.length} résultat${filteredItems.length > 1 ? 's' : ''}` : (
              <span className="inline-flex items-center gap-2">
                <span className="h-3 w-16 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" aria-hidden />
                <span className="sr-only">Chargement...</span>
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <FluentButton
            size="sm"
            variant="secondary"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4" />
            {showFilters ? 'Masquer' : 'Filtres'}
          </FluentButton>
          <FluentButton
            size="sm"
            variant="secondary"
            onClick={loadData}
            disabled={loading}
          >
            <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
          </FluentButton>
        </div>
      </div>

      {/* Search bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={type === 'bureaux' ? 'Rechercher un bureau...' : 'Rechercher un arbitrage...'}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200/70 bg-white/90 
                       outline-none focus:ring-2 focus:ring-blue-500/30 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>
      </div>

      {/* Filtres avancés */}
      {showFilters && (
        <div className="p-4 rounded-xl border border-slate-200/70 bg-white/50 dark:border-slate-800 dark:bg-slate-900/50">
          <h3 className="font-semibold mb-3 text-sm">Filtres avancés</h3>
          
          {type === 'arbitrages' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Niveau de risque</label>
                <Select
                  value={filters.riskLevel || '__all__'}
                  onValueChange={(v) => setFilters({ ...filters, riskLevel: v === '__all__' ? '' : v })}
                >
                  <SelectTrigger className="w-full rounded-lg border border-slate-200/70 bg-white p-2 text-sm dark:border-slate-700 dark:bg-slate-800 h-10">
                    <SelectValue placeholder="Risque" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">Tous</SelectItem>
                    <SelectItem value="critique">Critique</SelectItem>
                    <SelectItem value="eleve">Élevé</SelectItem>
                    <SelectItem value="modere">Modéré</SelectItem>
                    <SelectItem value="faible">Faible</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Statut</label>
                <Select
                  value={filters.status || '__all__'}
                  onValueChange={(v) => setFilters({ ...filters, status: v === '__all__' ? '' : v })}
                >
                  <SelectTrigger className="w-full rounded-lg border border-slate-200/70 bg-white p-2 text-sm dark:border-slate-700 dark:bg-slate-800 h-10">
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">Tous</SelectItem>
                    <SelectItem value="ouvert">Ouvert</SelectItem>
                    <SelectItem value="en_deliberation">En délibération</SelectItem>
                    <SelectItem value="decision_requise">Décision requise</SelectItem>
                    <SelectItem value="tranche">Tranché</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Charge minimum (%)</label>
                <input
                  type="number"
                  value={filters.minCharge}
                  onChange={(e) => setFilters({ ...filters, minCharge: Number(e.target.value) })}
                  className="w-full rounded-lg border border-slate-200/70 bg-white p-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                  min="0"
                  max="100"
                />
              </div>
              <div className="flex items-center pt-5">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={filters.hasGoulots}
                    onChange={(e) => setFilters({ ...filters, hasGoulots: e.target.checked })}
                    className="rounded"
                  />
                  Uniquement avec goulots
                </label>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-900/20 text-rose-800 dark:text-rose-300 text-sm">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && !data && (
        <div className="py-12 space-y-4" role="status" aria-label="Chargement des données">
          <div className="flex items-center justify-center gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-slate-500 dark:text-slate-400" aria-hidden />
            <span className="sr-only">Chargement en cours</span>
          </div>
          <div className="grid gap-3 max-w-2xl mx-auto">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-slate-200 dark:bg-slate-700 animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-[75%] rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
                  <div className="h-3 w-1/2 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Liste */}
      {data && (
        <div className="space-y-2">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center text-slate-400 rounded-xl border border-slate-200/70 dark:border-slate-800">
              Aucun résultat
            </div>
          ) : (
            filteredItems.map((item: any) => (
              <div
                key={item.id || item.code}
                onClick={() => handleOpenItem(item)}
                className="p-4 rounded-xl border border-slate-200/70 bg-white/70 hover:bg-white 
                           dark:border-slate-800 dark:bg-slate-900/50 dark:hover:bg-slate-900/70 
                           cursor-pointer transition-all group"
              >
                {type === 'bureaux' ? (
                  <BureauCard item={item} />
                ) : (
                  <ArbitrageCard item={item} formatMoney={formatMoney} />
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function ArbitrageCard({ item, formatMoney }: { item: ArbitrageItem; formatMoney: (n?: number) => string }) {
  const getRiskColor = (level?: string) => {
    switch (level) {
      case 'critique': return 'bg-red-500/10 text-red-700 dark:text-red-300';
      case 'eleve': return 'bg-orange-500/10 text-orange-700 dark:text-orange-300';
      case 'modere': return 'bg-amber-500/10 text-amber-700 dark:text-amber-300';
      case 'faible': return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300';
      default: return 'bg-slate-500/10 text-slate-700 dark:text-slate-300';
    }
  };

  const isVivant = item._type === 'vivant';
  const riskLevel = item.context?.riskLevel || item.impact;

  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-2">
          <span className="font-mono text-xs text-purple-600 dark:text-purple-400">
            {item.id}
          </span>
          <Badge variant={item.status === 'tranche' || item.status === 'resolved' ? 'success' : 'warning'}>
            {item.status}
          </Badge>
          {riskLevel && (
            <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', getRiskColor(riskLevel))}>
              {riskLevel}
            </span>
          )}
          {isVivant && item.timing?.isOverdue && (
            <Badge variant="urgent">En retard</Badge>
          )}
        </div>

        <h3 className="font-semibold mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {item.subject}
        </h3>

        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
          {isVivant && item.context?.linkedEntity && (
            <span>
              🔗 {item.context.linkedEntity.type}: {item.context.linkedEntity.label}
            </span>
          )}
          {isVivant && item.context?.financialExposure && (
            <span className="text-amber-600 dark:text-amber-400">
              💰 {formatMoney(item.context.financialExposure)}
            </span>
          )}
          {!isVivant && item.deadline && (
            <span>
              📅 Échéance: {item.deadline}
            </span>
          )}
          {item.parties && (
            <span>
              👥 {item.parties.length} partie{item.parties.length > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      <div className="flex-none flex items-center gap-2">
        {isVivant && item.timing && !item.timing.isOverdue && (
          <div className="text-center px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800">
            <div className="text-xl font-bold text-amber-600 dark:text-amber-400">
              {item.timing.daysRemaining}
            </div>
            <div className="text-[10px] text-slate-400">jour{(item.timing.daysRemaining ?? 0) > 1 ? 's' : ''}</div>
          </div>
        )}
        <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
      </div>
    </div>
  );
}

function BureauCard({ item }: { item: BureauItem }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-2">
          <Badge variant="info">{item.code}</Badge>
          <span className="font-semibold">{item.name}</span>
          {item.charge > 85 && <Badge variant="urgent">Surcharge</Badge>}
          {item.goulots.length > 0 && (
            <Badge variant="warning">{item.goulots.length} goulot{item.goulots.length > 1 ? 's' : ''}</Badge>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mb-2">
          <span>👥 {item.agents} agents</span>
          <span>💼 Charge: <span className={cn(
            'font-semibold',
            item.charge > 85 ? 'text-red-600 dark:text-red-400' : 
            item.charge > 70 ? 'text-amber-600 dark:text-amber-400' : 
            'text-emerald-600 dark:text-emerald-400'
          )}>{item.charge}%</span></span>
          <span>✅ Complétion: {item.completion}%</span>
        </div>

        {item.goulots.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {item.goulots.slice(0, 2).map((g: string, idx: number) => (
              <span key={idx} className="px-2 py-1 rounded text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
                ⚠️ {g}
              </span>
            ))}
            {item.goulots.length > 2 && (
              <span className="px-2 py-1 rounded text-xs bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                +{item.goulots.length - 2}
              </span>
            )}
          </div>
        )}
      </div>

      <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-colors flex-none" />
    </div>
  );
}

