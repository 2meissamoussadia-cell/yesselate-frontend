/**
 * Vue avancée du Dashboard avec graphiques, tableaux, filtres et export
 */

'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { 
  FileText, 
  CheckCircle2, 
  DollarSign, 
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Download,
  Filter,
  Calendar,
  BarChart3,
  LineChart,
  PieChart,
  Table,
  X,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Eye,
  EyeOff,
  Settings,
  Search,
} from 'lucide-react';
import { TrendsChart, MonthlyComparisonChart, CategoryDistributionChart } from './DashboardCharts';
import { KPIDrillDownModal } from './KPIDrillDownModal';
import { DashboardNotifications, useDashboardNotifications } from './DashboardNotifications';
import { cn } from '@/lib/cn';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface DashboardAdvancedViewProps {
  data: {
    kpis?: {
      demandes: number;
      validations: number;
      budget: number;
      blocages?: number;
      risques?: number;
      decisions?: number;
      conformite?: number;
    };
    highlights?: Array<{ id: string; text: string; type?: string }>;
    trends?: Array<{ date: string; demandes: number; validations: number; budget: number }>;
    monthlyComparison?: Array<{ month: string; actuel: number; precedent: number }>;
    categoryDistribution?: Array<{ category: string; count: number; percentage: number }>;
    tableData?: Array<{
      id: string;
      type: string;
      statut: string;
      priorite: string;
      date: string;
      bureau: string;
    }>;
    previousPeriod?: {
      demandes: number;
      validations: number;
      budget: number;
    };
  } | null | undefined;
}

export function DashboardAdvancedView({ data }: DashboardAdvancedViewProps) {
  const d = data ?? ({} as NonNullable<DashboardAdvancedViewProps['data']>);

  const [filters, setFilters] = useState({
    period: '30j',
    category: 'all',
    statut: 'all',
    search: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [visibleSections, setVisibleSections] = useState({
    kpis: true,
    trends: true,
    comparison: true,
    categories: true,
    table: true,
    highlights: true,
  });
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [selectedKPI, setSelectedKPI] = useState<{ label: string; value: string | number; type: 'demandes' | 'validations' | 'budget' | 'other' } | null>(null);
  
  // Gestion des notifications
  const {
    notifications,
    addNotification,
    dismissNotification,
    markAsRead,
  } = useDashboardNotifications();

  // Générer des notifications basées sur les données
  React.useEffect(() => {
    if (d.highlights && d.highlights.length > 0) {
      d.highlights.forEach(highlight => {
        const type = highlight.type === 'critical' ? 'error' as const :
                     highlight.type === 'warning' ? 'warning' as const :
                     'info' as const;
        
        addNotification({
          type,
          title: 'Point clé',
          message: highlight.text,
        });
      });
    }
  }, [d.highlights, addNotification]);

  // Helpers
  const formatPercentage = (value: number): string => `${(value * 100).toFixed(0)}%`;
  const getPercentageValue = (value: number): number => Math.min(100, Math.max(0, value * 100));

  // Calculer les variations
  const variations = useMemo(() => {
    if (!d.previousPeriod || !d.kpis) return null;
    return {
      demandes: d.kpis.demandes - d.previousPeriod.demandes,
      validations: (d.kpis.validations - d.previousPeriod.validations) * 100,
      budget: (d.kpis.budget - d.previousPeriod.budget) * 100,
    };
  }, [d]);

  // Filtrer les données du tableau
  const filteredTableData = useMemo(() => {
    if (!d.tableData) return [];
    let filtered = [...d.tableData];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(item =>
        Object.values(item).some(val => String(val).toLowerCase().includes(searchLower))
      );
    }

    if (filters.statut !== 'all') {
      filtered = filtered.filter(item => item.statut.toLowerCase() === filters.statut.toLowerCase());
    }

    if (filters.category !== 'all') {
      filtered = filtered.filter(item => item.type.toLowerCase().includes(filters.category.toLowerCase()));
    }

    // Tri
    if (sortConfig) {
      filtered.sort((a, b) => {
        const aVal = a[sortConfig.key as keyof typeof a];
        const bVal = b[sortConfig.key as keyof typeof b];
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [d.tableData, filters, sortConfig]);

  // Export de données
  const handleExport = useCallback((format: 'csv' | 'json') => {
    const exportData = {
      kpis: d.kpis,
      highlights: d.highlights,
      tableData: filteredTableData,
      exportedAt: new Date().toISOString(),
    };

    if (format === 'csv') {
      const headers = ['ID', 'Type', 'Statut', 'Priorité', 'Date', 'Bureau'];
      const rows = filteredTableData.map(item => [
        item.id,
        item.type,
        item.statut,
        item.priorite,
        item.date,
        item.bureau,
      ]);
      const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `dashboard-export-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } else {
      const jsonContent = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `dashboard-export-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
    }
  }, [data, filteredTableData]);

  // Trier le tableau
  const handleSort = (key: string) => {
    setSortConfig(prev => {
      if (prev?.key === key) {
        return prev.direction === 'asc' ? { key, direction: 'desc' } : null;
      }
      return { key, direction: 'asc' };
    });
  };

  // Toggle section visibility
  const toggleSection = (section: keyof typeof visibleSections) => {
    setVisibleSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <TooltipProvider>
      <div className="space-y-6 animate-fadeIn">
        <h1 className="sr-only">Dashboard principal</h1>
        {/* Header avec actions */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Dashboard principal</h2>
            <p className="text-slate-400 text-sm">Vue d'ensemble des indicateurs clés</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={cn(
                    'px-3 py-2 rounded-lg border transition-all',
                    showFilters
                      ? 'bg-blue-500/20 border-blue-500/50 text-blue-400'
                      : 'bg-slate-800/50 border-slate-700/50 text-slate-300 hover:border-slate-600'
                  )}
                >
                  <Filter className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Filtres</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => handleExport('csv')}
                  className="px-3 py-2 rounded-lg border bg-slate-800/50 border-slate-700/50 text-slate-300 hover:border-slate-600 transition-all"
                >
                  <Download className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Exporter (CSV/JSON)</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className="px-3 py-2 rounded-lg border bg-slate-800/50 border-slate-700/50 text-slate-300 hover:border-slate-600 transition-all"
                >
                  <Settings className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Paramètres d'affichage</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Panneau de filtres */}
        {showFilters && (
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-200">Filtres</h3>
              <button
                onClick={() => setShowFilters(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Période</label>
                <Select value={filters.period} onValueChange={(v) => setFilters(prev => ({ ...prev, period: v }))}>
                  <SelectTrigger className="w-full px-3 py-2 bg-slate-900/50 border-slate-700/50 rounded-xl text-sm text-slate-200 focus:ring-sky-500/50" aria-label="Période">
                    <SelectValue placeholder="Période" />
                  </SelectTrigger>
                  <SelectContent className="border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                    <SelectItem value="7j">7 derniers jours</SelectItem>
                    <SelectItem value="30j">30 derniers jours</SelectItem>
                    <SelectItem value="90j">90 derniers jours</SelectItem>
                    <SelectItem value="1an">1 an</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs text-slate-400 mb-1 block">Catégorie</label>
                <Select value={filters.category} onValueChange={(v) => setFilters(prev => ({ ...prev, category: v }))}>
                  <SelectTrigger className="w-full px-3 py-2 bg-slate-900/50 border-slate-700/50 rounded-xl text-sm text-slate-200 focus:ring-sky-500/50" aria-label="Catégorie">
                    <SelectValue placeholder="Catégorie" />
                  </SelectTrigger>
                  <SelectContent className="border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                    <SelectItem value="all">Toutes</SelectItem>
                    <SelectItem value="rh">Demandes RH</SelectItem>
                    <SelectItem value="bc">Validation BC</SelectItem>
                    <SelectItem value="decision">Décisions</SelectItem>
                    <SelectItem value="projet">Projets</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs text-slate-400 mb-1 block">Statut</label>
                <Select value={filters.statut} onValueChange={(v) => setFilters(prev => ({ ...prev, statut: v }))}>
                  <SelectTrigger className="w-full px-3 py-2 bg-slate-900/50 border-slate-700/50 rounded-xl text-sm text-slate-200 focus:ring-sky-500/50" aria-label="Statut">
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent className="border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="validé">Validé</SelectItem>
                    <SelectItem value="en attente">En attente</SelectItem>
                    <SelectItem value="en cours">En cours</SelectItem>
                    <SelectItem value="rejeté">Rejeté</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs text-slate-400 mb-1 block">Recherche</label>
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    placeholder="Rechercher..."
                    className="w-full pl-8 pr-3 py-2 bg-slate-900/50 border border-slate-700/50 rounded-lg text-sm text-slate-200 placeholder:text-slate-400"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* KPIs Section */}
        {visibleSections.kpis && d.kpis && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-200">Indicateurs de performance</h3>
              <button
                onClick={() => toggleSection('kpis')}
                className="text-slate-400 hover:text-slate-200"
              >
                <EyeOff className="w-4 h-4" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Demandes KPI */}
              <div 
                className="group bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-xl p-6 border border-blue-500/30 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-200 cursor-pointer"
                onClick={() => setSelectedKPI({ label: 'Demandes', value: d.kpis?.demandes ?? 0, type: 'demandes' })}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                    <FileText className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-slate-400 uppercase tracking-wide">Demandes</p>
                    <p className="text-3xl font-bold text-white mt-1">{d.kpis.demandes ?? 0}</p>
                    {variations && (
                      <div className={cn(
                        'flex items-center gap-1 text-xs mt-1',
                        variations.demandes >= 0 ? 'text-emerald-400' : 'text-red-400'
                      )}>
                        {variations.demandes >= 0 ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        <span>{Math.abs(variations.demandes)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Validations KPI */}
              <div 
                className="group bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 rounded-xl p-6 border border-emerald-500/30 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-200 cursor-pointer"
                onClick={() => setSelectedKPI({ label: 'Validations', value: formatPercentage(d.kpis?.validations ?? 0), type: 'validations' })}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center group-hover:bg-emerald-500/30 transition-colors">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-slate-400 uppercase tracking-wide">Validations</p>
                    <p className="text-3xl font-bold text-white mt-1">
                      {formatPercentage(d.kpis.validations)}
                    </p>
                    {variations && (
                      <div className={cn(
                        'flex items-center gap-1 text-xs mt-1',
                        variations.validations >= 0 ? 'text-emerald-400' : 'text-red-400'
                      )}>
                        {variations.validations >= 0 ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        <span>{Math.abs(variations.validations).toFixed(1)}%</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-3 h-1.5 bg-slate-800/50 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${getPercentageValue(d.kpis.validations)}%` }}
                  />
                </div>
              </div>

              {/* Budget KPI */}
              <div 
                className="group bg-gradient-to-br from-amber-500/20 to-amber-600/10 rounded-xl p-6 border border-amber-500/30 hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-500/10 transition-all duration-200 cursor-pointer"
                onClick={() => setSelectedKPI({ label: 'Budget', value: formatPercentage(d.kpis?.budget ?? 0), type: 'budget' })}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center group-hover:bg-amber-500/30 transition-colors">
                    <DollarSign className="w-5 h-5 text-amber-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-slate-400 uppercase tracking-wide">Budget</p>
                    <p className="text-3xl font-bold text-white mt-1">
                      {formatPercentage(d.kpis.budget)}
                    </p>
                    {variations && (
                      <div className={cn(
                        'flex items-center gap-1 text-xs mt-1',
                        variations.budget >= 0 ? 'text-emerald-400' : 'text-red-400'
                      )}>
                        {variations.budget >= 0 ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        <span>{Math.abs(variations.budget).toFixed(1)}%</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-3 h-1.5 bg-slate-800/50 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-amber-500 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${getPercentageValue(d.kpis.budget)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* KPIs supplémentaires */}
            {d.kpis.blocages !== undefined && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                {d.kpis.blocages !== undefined && (
                  <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/50">
                    <p className="text-xs text-slate-400 mb-1">Blocages</p>
                    <p className="text-2xl font-bold text-amber-400">{d.kpis.blocages}</p>
                  </div>
                )}
                {d.kpis.risques !== undefined && (
                  <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/50">
                    <p className="text-xs text-slate-400 mb-1">Risques critiques</p>
                    <p className="text-2xl font-bold text-red-400">{d.kpis.risques}</p>
                  </div>
                )}
                {d.kpis.decisions !== undefined && (
                  <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/50">
                    <p className="text-xs text-slate-400 mb-1">Décisions en attente</p>
                    <p className="text-2xl font-bold text-blue-400">{d.kpis.decisions}</p>
                  </div>
                )}
                {d.kpis.conformite !== undefined && (
                  <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/50">
                    <p className="text-xs text-slate-400 mb-1">Conformité SLA</p>
                    <p className="text-2xl font-bold text-emerald-400">{formatPercentage(d.kpis.conformite)}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Highlights Section */}
        {visibleSections.highlights && d.highlights && d.highlights.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-200">Points clés</h3>
              <button
                onClick={() => toggleSection('highlights')}
                className="text-slate-400 hover:text-slate-200"
              >
                <EyeOff className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              {d.highlights.map((highlight, index) => (
                <div
                  key={highlight.id}
                  className={cn(
                    'bg-gradient-to-br rounded-xl p-4 border transition-all duration-200',
                    'flex items-start gap-3 animate-fadeIn',
                    highlight.type === 'critical' && 'from-red-500/20 to-red-600/10 border-red-500/30 hover:border-red-500/50',
                    highlight.type === 'warning' && 'from-amber-500/20 to-amber-600/10 border-amber-500/30 hover:border-amber-500/50',
                    highlight.type === 'info' && 'from-blue-500/20 to-blue-600/10 border-blue-500/30 hover:border-blue-500/50',
                  )}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5',
                    highlight.type === 'critical' && 'bg-red-500/20',
                    highlight.type === 'warning' && 'bg-amber-500/20',
                    highlight.type === 'info' && 'bg-blue-500/20',
                  )}>
                    <AlertTriangle className={cn(
                      'w-4 h-4',
                      highlight.type === 'critical' && 'text-red-400',
                      highlight.type === 'warning' && 'text-amber-400',
                      highlight.type === 'info' && 'text-blue-400',
                    )} />
                  </div>
                  <p className="text-sm text-slate-200 font-medium flex-1">
                    {highlight.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Graphiques de tendances */}
        {visibleSections.trends && d.trends && d.trends.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-200">Évolution (30 derniers jours)</h3>
              <button
                onClick={() => toggleSection('trends')}
                className="text-slate-400 hover:text-slate-200"
              >
                <EyeOff className="w-4 h-4" />
              </button>
            </div>
            <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700/50">
              <TrendsChart trends={d.trends} />
            </div>
          </div>
        )}

        {/* Comparaison mensuelle */}
        {visibleSections.comparison && d.monthlyComparison && d.monthlyComparison.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-200">Comparaison mensuelle</h3>
              <button
                onClick={() => toggleSection('comparison')}
                className="text-slate-400 hover:text-slate-200"
              >
                <EyeOff className="w-4 h-4" />
              </button>
            </div>
            <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700/50">
              <MonthlyComparisonChart data={d.monthlyComparison} />
            </div>
          </div>
        )}

        {/* Distribution par catégorie */}
        {visibleSections.categories && d.categoryDistribution && d.categoryDistribution.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-200">Répartition par catégorie</h3>
              <button
                onClick={() => toggleSection('categories')}
                className="text-slate-400 hover:text-slate-200"
              >
                <EyeOff className="w-4 h-4" />
              </button>
            </div>
            <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700/50">
              <CategoryDistributionChart data={d.categoryDistribution} />
            </div>
            {/* Cards supplémentaires avec détails */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {d.categoryDistribution.map((item, index) => (
                <div
                  key={item.category}
                  className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/50 animate-fadeIn"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <p className="text-xs text-slate-400 mb-2 truncate">{item.category}</p>
                  <p className="text-2xl font-bold text-white mb-1">{item.count}</p>
                  <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all duration-500"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{item.percentage}%</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tableau de données */}
        {visibleSections.table && filteredTableData.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-200">
                Données détaillées ({filteredTableData.length})
              </h3>
              <button
                onClick={() => toggleSection('table')}
                className="text-slate-400 hover:text-slate-200"
              >
                <EyeOff className="w-4 h-4" />
              </button>
            </div>
            <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-900/50 border-b border-slate-700/50">
                    <tr>
                      {['id', 'type', 'statut', 'priorite', 'date', 'bureau'].map((key) => (
                        <th
                          key={key}
                          className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide cursor-pointer hover:bg-slate-800/50 transition-colors"
                          onClick={() => handleSort(key)}
                        >
                          <div className="flex items-center gap-2">
                            {key.charAt(0).toUpperCase() + key.slice(1)}
                            {sortConfig?.key === key && (
                              sortConfig.direction === 'asc' ? (
                                <ChevronUp className="w-3 h-3" />
                              ) : (
                                <ChevronDown className="w-3 h-3" />
                              )
                            )}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/30">
                    {filteredTableData.map((row, index) => (
                      <tr
                        key={row.id}
                        className="hover:bg-slate-800/30 transition-colors animate-fadeIn"
                        style={{ animationDelay: `${index * 20}ms` }}
                      >
                        <td className="px-4 py-3 text-sm text-slate-300 font-mono">{row.id}</td>
                        <td className="px-4 py-3 text-sm text-slate-200">{row.type}</td>
                        <td className="px-4 py-3">
                          <span className={cn(
                            'px-2 py-1 rounded-full text-xs font-medium',
                            row.statut === 'Validé' && 'bg-emerald-500/20 text-emerald-400',
                            row.statut === 'En attente' && 'bg-amber-500/20 text-amber-400',
                            row.statut === 'En cours' && 'bg-blue-500/20 text-blue-400',
                            row.statut === 'Rejeté' && 'bg-red-500/20 text-red-400',
                          )}>
                            {row.statut}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn(
                            'px-2 py-1 rounded-full text-xs font-medium',
                            row.priorite === 'Critique' && 'bg-red-500/20 text-red-400',
                            row.priorite === 'Haute' && 'bg-orange-500/20 text-orange-400',
                            row.priorite === 'Moyenne' && 'bg-yellow-500/20 text-yellow-400',
                            row.priorite === 'Basse' && 'bg-slate-500/20 text-slate-400',
                          )}>
                            {row.priorite}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-300">{row.date}</td>
                        <td className="px-4 py-3 text-sm text-slate-300">{row.bureau}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Message si aucune donnée */}
        {(!d.kpis && (!d.highlights || d.highlights.length === 0)) && (
          <div className="text-center py-12">
            <p className="text-slate-400">Aucune donnée disponible</p>
          </div>
        )}

        {/* Modal de drill-down KPI */}
        {selectedKPI && (
          <KPIDrillDownModal
            kpi={selectedKPI}
            isOpen={!!selectedKPI}
            onClose={() => setSelectedKPI(null)}
            historicalData={d.trends?.map(t => ({
              date: t.date,
              value: selectedKPI.type === 'demandes' ? t.demandes : 
                     selectedKPI.type === 'validations' ? t.validations * 100 : 
                     t.budget * 100,
            }))}
          />
        )}

        {/* Système de notifications */}
        <DashboardNotifications
          notifications={notifications}
          onDismiss={dismissNotification}
          onMarkAsRead={markAsRead}
        />
      </div>
    </TooltipProvider>
  );
}

