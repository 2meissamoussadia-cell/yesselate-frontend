/**
 * AnalyticsInboxView.tsx
 * =======================
 * 
 * Vue liste des KPIs et métriques avec filtres et recherche
 * Affichage en cartes ou liste avec tri et filtrage avancé
 */

'use client';

import { useState, useMemo } from 'react';
import type { AnalyticsTab } from '@/lib/stores/analyticsWorkspaceStore';
import { useAnalyticsWorkspaceStore } from '@/lib/stores/analyticsWorkspaceStore';
import { FluentCard, FluentCardContent } from '@/components/ui/fluent-card';
import { FluentButton } from '@/components/ui/fluent-button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, SlidersHorizontal, LayoutGrid, List, ArrowUpDown,
  TrendingUp, TrendingDown, Minus, AlertTriangle, Target, Activity 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { calculateKPIs, calculateBureauPerformance, detectAlerts } from '@/lib/data/analytics';
import type { KPIMetric, BureauPerformance, Alert } from '@/lib/data/analytics';

interface AnalyticsInboxViewProps {
  tab: AnalyticsTab;
}

type ViewMode = 'cards' | 'list' | 'compact';
type SortBy = 'name' | 'value' | 'trend' | 'status';

export function AnalyticsInboxView({ tab }: AnalyticsInboxViewProps) {
  const { setTabUI, getTabUI } = useAnalyticsWorkspaceStore();
  const ui = getTabUI(tab.id);
  
  const queue = (ui?.queue || tab.data?.queue || 'all') as string;
  const [viewMode, setViewMode] = useState<ViewMode>((ui?.viewMode as ViewMode) || 'cards');
  const [search, setSearch] = useState(ui?.searchQuery || '');
  const [filterCategory, setFilterCategory] = useState<string>(ui?.filterType || 'all');
  const [sortBy, setSortBy] = useState<SortBy>((ui?.sortBy as SortBy) || 'status');

  // Charger les données selon la file
  const data = useMemo(() => {
    if (queue === 'performance' || queue === 'financial' || queue === 'operations' || queue === 'quality') {
      return {
        type: 'kpis' as const,
        items: calculateKPIs().filter(kpi => (queue as string) === 'all' || kpi.category === (queue as any)),
      };
    } else if (queue === 'alerts') {
      return {
        type: 'alerts' as const,
        items: detectAlerts(),
      };
    } else if (queue === 'trends') {
      return {
        type: 'bureaux' as const,
        items: calculateBureauPerformance(),
      };
    } else {
      // 'all' ou 'overview'
      return {
        type: 'kpis' as const,
        items: calculateKPIs(),
      };
    }
  }, [queue]);

  // Filtrage et tri
  const filteredItems = useMemo(() => {
    let items = [...data.items];

    // Recherche
    if (search) {
      const query = search.toLowerCase();
      items = items.filter(item => {
        if (data.type === 'kpis') {
          const kpi = item as KPIMetric;
          return kpi.name.toLowerCase().includes(query) || 
                 kpi.description.toLowerCase().includes(query) ||
                 kpi.category.toLowerCase().includes(query);
        } else if (data.type === 'alerts') {
          const alert = item as Alert;
          return alert.title.toLowerCase().includes(query) ||
                 alert.description.toLowerCase().includes(query);
        } else {
          const bureau = item as BureauPerformance;
          return bureau.bureauName.toLowerCase().includes(query) ||
                 bureau.bureauCode.toLowerCase().includes(query);
        }
      });
    }

    // Filtre par catégorie
    if (filterCategory !== 'all' && data.type === 'kpis') {
      items = items.filter(item => (item as KPIMetric).category === filterCategory);
    }

    // Tri
    if (data.type === 'kpis') {
      items.sort((a, b) => {
        const kpiA = a as KPIMetric;
        const kpiB = b as KPIMetric;
        
        if (sortBy === 'name') return kpiA.name.localeCompare(kpiB.name);
        if (sortBy === 'value') return kpiB.value - kpiA.value;
        if (sortBy === 'trend') {
          const trendOrder = { up: 0, stable: 1, down: 2 };
          return trendOrder[kpiA.trend] - trendOrder[kpiB.trend];
        }
        if (sortBy === 'status') {
          const statusOrder = { critical: 0, warning: 1, good: 2 };
          return statusOrder[kpiA.status] - statusOrder[kpiB.status];
        }
        return 0;
      });
    } else if (data.type === 'bureaux') {
      items.sort((a, b) => (b as BureauPerformance).score - (a as BureauPerformance).score);
    } else if (data.type === 'alerts') {
      // Les alertes sont déjà triées par priorité
    }

    return items;
  }, [data, search, filterCategory, sortBy]);

  // Sauvegarder l'état UI
  const updateUI = (updates: Record<string, unknown>) => {
    setTabUI(tab.id, updates);
  };

  return (
    <FluentCard className="min-h-[600px]">
      <FluentCardContent className="p-6">
        {/* Header avec titre et actions */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">{tab.title}</h2>
            <p className="text-sm text-slate-400 mt-1">
              {filteredItems.length} {data.type === 'kpis' ? 'indicateurs' : data.type === 'alerts' ? 'alertes' : 'bureaux'}
            </p>
          </div>

          {/* Modes d'affichage */}
          <div className="flex items-center gap-2">
            <FluentButton
              size="xs"
              variant={viewMode === 'cards' ? 'primary' : 'secondary'}
              onClick={() => { setViewMode('cards'); updateUI({ viewMode: 'cards' }); }}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </FluentButton>
            <FluentButton
              size="xs"
              variant={viewMode === 'list' ? 'primary' : 'secondary'}
              onClick={() => { setViewMode('list'); updateUI({ viewMode: 'list' }); }}
            >
              <List className="w-3.5 h-3.5" />
            </FluentButton>
          </div>
        </div>

        {/* Barre de recherche et filtres */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          {/* Recherche */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 
                       outline-none focus:ring-2 focus:ring-orange-500/30 
                       text-white text-sm placeholder:text-slate-400"
              value={search}
              onChange={(e) => { setSearch(e.target.value); updateUI({ searchQuery: e.target.value }); }}
            />
          </div>

          {/* Filtre par catégorie (KPIs uniquement) */}
          {data.type === 'kpis' && (
            <Select
              value={filterCategory}
              onValueChange={(v) => { setFilterCategory(v); updateUI({ filterType: v }); }}
            >
              <SelectTrigger className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 
                       focus:ring-2 focus:ring-orange-500/30 text-white text-sm h-11">
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes catégories</SelectItem>
                <SelectItem value="performance">Performance</SelectItem>
                <SelectItem value="financial">Financier</SelectItem>
                <SelectItem value="operations">Opérations</SelectItem>
                <SelectItem value="quality">Qualité</SelectItem>
              </SelectContent>
            </Select>
          )}

          {/* Tri */}
          {data.type === 'kpis' && (
            <Select
              value={sortBy}
              onValueChange={(v) => { setSortBy(v as SortBy); updateUI({ sortBy: v }); }}
            >
              <SelectTrigger className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 
                       focus:ring-2 focus:ring-orange-500/30 text-white text-sm h-11">
                <SelectValue placeholder="Tri" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="status">Par statut</SelectItem>
                <SelectItem value="name">Par nom</SelectItem>
                <SelectItem value="value">Par valeur</SelectItem>
                <SelectItem value="trend">Par tendance</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Contenu */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Activity className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Aucun résultat trouvé</p>
          </div>
        ) : (
          <>
            {/* Affichage KPIs */}
            {data.type === 'kpis' && (
              <div className={cn(
                viewMode === 'cards' && 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4',
                viewMode === 'list' && 'space-y-3',
                viewMode === 'compact' && 'space-y-2'
              )}>
                {filteredItems.map((item) => {
                  const kpi = item as KPIMetric;
                  return viewMode === 'cards' ? (
                    <KPICard key={kpi.id} kpi={kpi} />
                  ) : (
                    <KPIListItem key={kpi.id} kpi={kpi} />
                  );
                })}
              </div>
            )}

            {/* Affichage Alertes */}
            {data.type === 'alerts' && (
              <div className="space-y-3">
                {filteredItems.map((item) => {
                  const alert = item as Alert;
                  return <AlertItem key={alert.id} alert={alert} />;
                })}
              </div>
            )}

            {/* Affichage Bureaux */}
            {data.type === 'bureaux' && (
              <div className="space-y-4">
                {filteredItems.map((item) => {
                  const bureau = item as BureauPerformance;
                  return <BureauPerformanceCard key={bureau.bureauCode} bureau={bureau} />;
                })}
              </div>
            )}
          </>
        )}
      </FluentCardContent>
    </FluentCard>
  );
}

// ============================================
// SUB-COMPONENTS
// ============================================

function KPICard({ kpi }: { kpi: KPIMetric }) {
  return (
    <div className={cn(
      'p-5 rounded-2xl border-2 transition-all hover:scale-105 cursor-pointer',
      kpi.status === 'good' && 'border-emerald-500/30 bg-emerald-950/20',
      kpi.status === 'warning' && 'border-amber-500/30 bg-amber-950/20',
      kpi.status === 'critical' && 'border-red-500/30 bg-red-950/20'
    )}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <Badge variant="default" className="text-[10px] mb-2">
            {kpi.category}
          </Badge>
          <h3 className="font-semibold text-sm">{kpi.name}</h3>
        </div>
        <div className="flex items-center gap-1">
          {kpi.trend === 'up' && <TrendingUp className="w-4 h-4 text-emerald-500" />}
          {kpi.trend === 'down' && <TrendingDown className="w-4 h-4 text-red-500" />}
          {kpi.trend === 'stable' && <Minus className="w-4 h-4 text-slate-400" />}
          <span className={cn(
            'text-xs font-semibold',
            kpi.trend === 'up' && 'text-emerald-400',
            kpi.trend === 'down' && 'text-red-400',
            kpi.trend === 'stable' && 'text-slate-400'
          )}>
            {kpi.trendValue > 0 ? '+' : ''}{kpi.trendValue}%
          </span>
        </div>
      </div>

      <div className="mb-3">
        <div className="text-3xl font-bold text-slate-200">
          {kpi.value}
          <span className="text-lg font-normal text-slate-400 ml-1">{kpi.unit}</span>
        </div>
        {kpi.target && (
          <div className="text-xs text-slate-400 mt-1">
            Objectif: {kpi.target}{kpi.unit}
          </div>
        )}
      </div>

      <p className="text-xs text-slate-400">{kpi.description}</p>

      {/* Progress bar si target */}
      {kpi.target && (
        <div className="mt-3">
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full transition-all',
                kpi.status === 'good' && 'bg-emerald-500',
                kpi.status === 'warning' && 'bg-amber-500',
                kpi.status === 'critical' && 'bg-red-500'
              )}
              style={{ width: `${Math.min((kpi.value / kpi.target) * 100, 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function KPIListItem({ kpi }: { kpi: KPIMetric }) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl border border-slate-700 hover:bg-slate-800/50 transition-colors">
      <div className={cn(
        'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
        kpi.status === 'good' && 'bg-emerald-500/10',
        kpi.status === 'warning' && 'bg-amber-500/10',
        kpi.status === 'critical' && 'bg-red-500/10'
      )}>
        <Target className={cn(
          'w-6 h-6',
          kpi.status === 'good' && 'text-emerald-500',
          kpi.status === 'warning' && 'text-amber-500',
          kpi.status === 'critical' && 'text-red-500'
        )} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-semibold text-sm truncate">{kpi.name}</h3>
          <Badge variant="default" className="text-[10px]">{kpi.category}</Badge>
        </div>
        <p className="text-xs text-slate-400 truncate">{kpi.description}</p>
      </div>

      <div className="flex items-center gap-4 flex-shrink-0">
        <div className="text-right">
          <div className="text-xl font-bold">
            {kpi.value}<span className="text-sm font-normal text-slate-400">{kpi.unit}</span>
          </div>
          {kpi.target && (
            <div className="text-xs text-slate-400">/ {kpi.target}{kpi.unit}</div>
          )}
        </div>

        <div className="flex items-center gap-1">
          {kpi.trend === 'up' && <TrendingUp className="w-4 h-4 text-emerald-500" />}
          {kpi.trend === 'down' && <TrendingDown className="w-4 h-4 text-red-500" />}
          {kpi.trend === 'stable' && <Minus className="w-4 h-4 text-slate-400" />}
          <span className={cn(
            'text-xs font-semibold',
            kpi.trend === 'up' && 'text-emerald-400',
            kpi.trend === 'down' && 'text-red-400',
            kpi.trend === 'stable' && 'text-slate-400'
          )}>
            {kpi.trendValue > 0 ? '+' : ''}{kpi.trendValue}%
          </span>
        </div>
      </div>
    </div>
  );
}

function AlertItem({ alert }: { alert: Alert }) {
  return (
    <div className={cn(
      'p-4 rounded-xl border-l-4',
      alert.type === 'critical' && 'border-l-red-500 bg-red-950/20',
      alert.type === 'warning' && 'border-l-amber-500 bg-amber-950/20',
      alert.type === 'info' && 'border-l-blue-500 bg-blue-950/20'
    )}>
      <div className="flex items-start gap-3">
        <AlertTriangle className={cn(
          'w-5 h-5 flex-shrink-0 mt-0.5',
          alert.type === 'critical' && 'text-red-500',
          alert.type === 'warning' && 'text-amber-500',
          alert.type === 'info' && 'text-blue-500'
        )} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-sm">{alert.title}</h3>
            <Badge variant={alert.type === 'critical' ? 'urgent' : alert.type === 'warning' ? 'warning' : 'info'} className="text-[10px]">
              {alert.type}
            </Badge>
          </div>
          <p className="text-sm text-slate-300 mb-2">{alert.description}</p>
          <div className="text-xs text-slate-400">
            {alert.metric}: <span className="font-semibold">{alert.value}</span> (seuil: {alert.threshold})
          </div>
        </div>
      </div>
    </div>
  );
}

function BureauPerformanceCard({ bureau }: { bureau: BureauPerformance }) {
  return (
    <div className="p-5 rounded-2xl border border-slate-700 hover:border-orange-500/50 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-bold text-lg">{bureau.bureauName}</h3>
          <p className="text-xs text-slate-400">{bureau.bureauCode}</p>
        </div>
        <div className="text-right">
          <div className={cn(
            'text-3xl font-bold',
            bureau.score >= 80 && 'text-emerald-500',
            bureau.score >= 60 && bureau.score < 80 && 'text-amber-500',
            bureau.score < 60 && 'text-red-500'
          )}>
            {bureau.score}
          </div>
          <div className="text-xs text-slate-400">Score</div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-4">
        <div className="text-center p-2 rounded-lg bg-blue-500/10">
          <div className="text-lg font-bold">{bureau.totalDemands}</div>
          <div className="text-xs text-slate-400">Total</div>
        </div>
        <div className="text-center p-2 rounded-lg bg-emerald-500/10">
          <div className="text-lg font-bold text-emerald-600">{bureau.validated}</div>
          <div className="text-xs text-slate-400">Validées</div>
        </div>
        <div className="text-center p-2 rounded-lg bg-amber-500/10">
          <div className="text-lg font-bold text-amber-600">{bureau.pending}</div>
          <div className="text-xs text-slate-400">Attente</div>
        </div>
        <div className="text-center p-2 rounded-lg bg-red-500/10">
          <div className="text-lg font-bold text-red-600">{bureau.overdue}</div>
          <div className="text-xs text-slate-400">Retard</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <div className="text-xs text-slate-400 mb-1">Validation</div>
          <div className="text-sm font-bold">{bureau.validationRate}%</div>
        </div>
        <div>
          <div className="text-xs text-slate-400 mb-1">SLA</div>
          <div className="text-sm font-bold">{bureau.slaCompliance}%</div>
        </div>
        <div>
          <div className="text-xs text-slate-400 mb-1">Délai moy.</div>
          <div className="text-sm font-bold">{bureau.avgDelay}j</div>
        </div>
      </div>
    </div>
  );
}

