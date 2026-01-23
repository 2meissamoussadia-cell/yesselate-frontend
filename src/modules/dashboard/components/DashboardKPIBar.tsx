/**
 * Composant DashboardKPIBar
 * Affiche la barre KPI avec filtre, refresh, export et grille de KPIs
 * Extrait de DashboardContent pour améliorer la maintenabilité
 */

'use client';

import { useState, useCallback, useMemo, memo } from 'react';
import { 
  Search, 
  X, 
  Activity, 
  RefreshCw, 
  Download, 
  FileText, 
  BarChart3,
  Info,
  Zap
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useKPIFilter } from '@/modules/dashboard/hooks/useKPIFilter';
import { useDashboardRefresh } from '@/modules/dashboard/hooks/useDashboardRefresh';
import { KPIAlertsSystem } from '@/components/features/bmo/dashboard/command-center/KPIAlertsSystem';
import { useDashboardCommandCenterStore } from '@/lib/stores/dashboardCommandCenterStore';
import { getKPIMappingByLabel } from '@/lib/mappings/dashboardKPIMapping';
import { useLogger } from '@/lib/utils/logger';

// Types
type KPITone = 'ok' | 'warn' | 'crit' | 'info';
type KPITrend = 'up' | 'down' | 'neutral';

export interface KPIData {
  label: string;
  value: string | number;
  delta: string;
  tone: KPITone;
  trend: KPITrend;
  icon: React.ComponentType<{ className?: string }>;
}

interface DashboardKPIBarProps {
  kpis: KPIData[];
  onKPIClick?: (kpi: KPIData) => void;
  onExport?: (format: 'csv' | 'json' | 'pdf' | 'excel') => Promise<void>;
  onRefresh?: () => Promise<void> | void;
  refreshInterval?: number;
  autoRefreshEnabled?: boolean;
  onAutoRefreshToggle?: (enabled: boolean) => void;
  onRefreshIntervalChange?: (interval: number) => void;
  isOnline?: boolean;
  isTabVisible?: boolean;
  lastUpdate?: Date;
  performanceMetrics?: {
    loadTime: number;
    renderTime?: number;
  };
}

// Composant KPICard (extrait de page.tsx)
interface KPICardProps {
  kpi: KPIData;
  icon: React.ComponentType<{ className?: string }>;
  index: number;
  isPositive: boolean;
  isNegative: boolean;
  onClick?: () => void;
}

const KPICard = memo(function KPICard({ 
  kpi, 
  icon: Icon, 
  index, 
  isPositive, 
  isNegative,
  onClick
}: KPICardProps) {
  const getTrendIcon = () => {
    if (kpi.trend === 'up') {
      return <ArrowUpRight className="h-3 w-3 text-emerald-400" />;
    }
    if (kpi.trend === 'down') {
      return <ArrowDownRight className="h-3 w-3 text-red-400" />;
    }
    return <Minus className="h-3 w-3 text-slate-400" />;
  };

  const getToneStyles = () => {
    switch (kpi.tone) {
      case 'ok':
        return 'bg-emerald-500/10 border-emerald-500/30';
      case 'warn':
        return 'bg-amber-500/10 border-amber-500/30';
      case 'crit':
        return 'bg-red-500/10 border-red-500/30';
      default:
        return 'bg-slate-800/50 border-slate-700/50';
    }
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        'relative p-3 rounded-lg border transition-all duration-200',
        'hover:scale-105 hover:shadow-lg hover:shadow-black/20',
        'active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500/50',
        getToneStyles()
      )}
      aria-label={`KPI ${kpi.label}: ${kpi.value} ${kpi.delta}`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-slate-400" />
          <span className="text-[10px] text-slate-500 uppercase tracking-wide">
            {kpi.label}
          </span>
        </div>
        {getTrendIcon()}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-lg font-semibold text-slate-200">
          {kpi.value}
        </span>
        <span className={cn(
          'text-xs',
          isPositive && 'text-emerald-400',
          isNegative && 'text-red-400',
          !isPositive && !isNegative && 'text-slate-400'
        )}>
          {kpi.delta}
        </span>
      </div>
    </button>
  );
});

// Composants Tooltip (simplifiés)
const AutoRefreshTooltipContent = memo(function AutoRefreshTooltipContent({
  autoRefreshEnabled,
  refreshInterval,
  isTabVisible,
  isOnline,
}: {
  autoRefreshEnabled: boolean;
  refreshInterval: number;
  isTabVisible: boolean;
  isOnline: boolean;
}) {
  return (
    <div className="text-xs space-y-1">
      <p>Auto-refresh: {autoRefreshEnabled ? 'Activé' : 'Désactivé'}</p>
      <p>Intervalle: {refreshInterval / 1000}s</p>
      {!isTabVisible && <p className="text-amber-400">Onglet inactif</p>}
      {!isOnline && <p className="text-red-400">Hors ligne</p>}
    </div>
  );
});

const RefreshTooltipContent = memo(function RefreshTooltipContent({
  refreshCount,
  loadTime,
  isTabVisible,
}: {
  refreshCount: number;
  loadTime: number;
  isTabVisible: boolean;
}) {
  return (
    <div className="text-xs space-y-1">
      <p>Actualisations: {refreshCount}</p>
      <p>Temps de chargement: {loadTime.toFixed(0)}ms</p>
      {!isTabVisible && <p className="text-amber-400">Onglet inactif</p>}
    </div>
  );
});

const KPICountTooltipContent = memo(function KPICountTooltipContent({
  count,
  total,
  filter,
}: {
  count: number;
  total: number;
  filter?: string;
}) {
  return (
    <div className="text-xs space-y-1">
      <p>{count} sur {total} indicateurs affichés</p>
      {filter && <p>Filtre: "{filter}"</p>}
    </div>
  );
});

const LastUpdateDisplay = memo(function LastUpdateDisplay({ 
  lastUpdate 
}: { 
  lastUpdate?: Date 
}) {
  if (!lastUpdate) return null;
  
  const now = new Date();
  const diff = now.getTime() - lastUpdate.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  
  let display: string;
  if (seconds < 60) {
    display = `Il y a ${seconds}s`;
  } else if (minutes < 60) {
    display = `Il y a ${minutes}min`;
  } else {
    display = lastUpdate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }
  
  return (
    <span className="text-[10px] text-slate-500">
      {display}
    </span>
  );
});

export const DashboardKPIBar = memo(function DashboardKPIBar({
  kpis,
  onKPIClick,
  onExport,
  refreshInterval = 60000,
  autoRefreshEnabled = true,
  onAutoRefreshToggle,
  onRefreshIntervalChange,
  isOnline = true,
  isTabVisible = true,
  lastUpdate,
  performanceMetrics = { loadTime: 0 },
}: DashboardKPIBarProps) {
  const log = useLogger('DashboardKPIBar');
  const openModal = useDashboardCommandCenterStore((state) => state.openModal);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [kpiChangeNotifications, setKpiChangeNotifications] = useState<Array<{
    id: string;
    label: string;
    oldValue: string;
    newValue: string;
    timestamp: Date;
  }>>([]);

  // Utiliser le hook de filtre
  const {
    filter: kpiFilter,
    debouncedFilter: debouncedKpiFilter,
    filteredItems: topKpis,
    updateFilter: setKpiFilter,
    clearFilter: handleClearKpiFilter,
    filteredCount,
    totalCount,
  } = useKPIFilter({
    items: kpis,
    filterFn: (kpi, filter) => {
      const filterLower = filter.toLowerCase().trim();
      return kpi.label.toLowerCase().includes(filterLower);
    },
  });

  // Utiliser le hook de refresh
  const {
    refresh,
    status: refreshStatus,
    refreshCount,
    retryCount,
    loadTime,
  } = useDashboardRefresh({
    onRefresh: onRefresh || (async () => {
      // Fallback: ne rien faire si pas de callback
      if (process.env.NODE_ENV === 'development') {
        log.warn('DashboardKPIBar: onRefresh callback not provided');
      }
    }),
    onSuccess: (calculatedLoadTime) => {
      if (process.env.NODE_ENV === 'development') {
        log.performance('KPIs refresh', calculatedLoadTime);
      }
    },
  });

  // Handler pour cliquer sur un KPI
  const handleKPIClick = useCallback((kpi: KPIData) => {
    if (onKPIClick) {
      onKPIClick(kpi);
    } else {
      // Fallback: utiliser le système de modal
      const mapping = getKPIMappingByLabel(kpi.label);
      if (mapping) {
        openModal('kpi-drilldown', { kpi, kpiId: mapping.metadata.id });
      } else {
        openModal('kpi-drilldown', { kpi });
      }
    }
  }, [onKPIClick, openModal]);

  // Handlers d'export
  const handleExportCSV = useCallback(async () => {
    if (onExport) {
      await onExport('csv');
    }
    setShowExportMenu(false);
  }, [onExport]);

  const handleExportJSON = useCallback(async () => {
    if (onExport) {
      await onExport('json');
    }
    setShowExportMenu(false);
  }, [onExport]);

  const handleExportPDF = useCallback(async () => {
    if (onExport) {
      await onExport('pdf');
    }
    setShowExportMenu(false);
  }, [onExport]);

  const handleExportExcel = useCallback(async () => {
    if (onExport) {
      await onExport('excel');
    }
    setShowExportMenu(false);
  }, [onExport]);

  const handleToggleExportMenu = useCallback(() => {
    setShowExportMenu(prev => !prev);
  }, []);

  // Handler pour auto-refresh
  const handleAutoRefreshClick = useCallback(() => {
    if (onAutoRefreshToggle) {
      onAutoRefreshToggle(!autoRefreshEnabled);
    }
  }, [autoRefreshEnabled, onAutoRefreshToggle]);

  // Styles conditionnels
  const autoRefreshButtonClassName = cn(
    'p-1.5 rounded-md transition-all duration-200',
    'hover:bg-slate-800/50 active:scale-95',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'focus:outline-none focus:ring-2 focus:ring-blue-500/50',
    autoRefreshEnabled && isOnline && isTabVisible && 'bg-emerald-500/10 text-emerald-400',
    !autoRefreshEnabled && 'text-slate-400',
    !isOnline && 'text-slate-600'
  );

  const autoRefreshIconClassName = cn(
    'h-3.5 w-3.5 transition-colors',
    autoRefreshEnabled && isOnline && isTabVisible && 'text-emerald-400 animate-pulse',
    !autoRefreshEnabled && 'text-slate-400',
    !isOnline && 'text-slate-600'
  );

  const autoRefreshAriaLabel = autoRefreshEnabled
    ? 'Désactiver l\'actualisation automatique'
    : 'Activer l\'actualisation automatique';

  // Calculer les KPIs pour les alertes
  const kpisForAlerts = useMemo(() => {
    return topKpis.map(kpi => ({
      id: kpi.label,
      kpiLabel: kpi.label,
      value: typeof kpi.value === 'number' ? kpi.value : 0,
      tone: kpi.tone,
      trend: kpi.trend,
    }));
  }, [topKpis]);

  return (
    <div 
      className="border-b border-slate-800/60 bg-gradient-to-b from-slate-900/60 via-slate-900/40 to-slate-900/60 backdrop-blur-xl px-4 py-4 shadow-lg shadow-black/20 relative overflow-hidden"
      role="region"
      aria-label="Indicateurs de performance en temps réel"
    >
      {/* Effet de brillance animé subtil */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-shimmer pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div 
            className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" 
            aria-hidden="true"
          />
          <h2 className="text-[11px] uppercase tracking-wide text-slate-400 font-medium">
            Indicateurs en temps réel
          </h2>
          {topKpis.length !== kpis.length && (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-[10px] text-slate-500 cursor-help">
                  ({topKpis.length}/{kpis.length})
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <KPICountTooltipContent 
                  count={topKpis.length}
                  total={kpis.length}
                  filter={debouncedKpiFilter}
                />
              </TooltipContent>
            </Tooltip>
          )}
          {debouncedKpiFilter && debouncedKpiFilter !== kpiFilter && (
            <span className="text-[10px] text-blue-400 animate-pulse" aria-label="Recherche en cours">
              <Search className="h-3 w-3 inline" />
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2 flex-1 justify-end min-w-[200px]">
          {/* Filtre de recherche KPI */}
          <div className="relative hidden sm:block">
            <input
              type="text"
              placeholder="Rechercher un indicateur..."
              value={kpiFilter}
              onChange={(e) => setKpiFilter(e.target.value)}
              className={cn(
                'w-48 px-3 py-1.5 text-xs rounded-md',
                'bg-slate-800/50 border border-slate-700/50',
                'text-slate-300 placeholder:text-slate-500',
                'focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50',
                'transition-all duration-200'
              )}
              aria-label="Rechercher un indicateur"
            />
            {kpiFilter && (
              <button
                onClick={handleClearKpiFilter}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-all duration-200 hover:scale-110 active:scale-95"
                aria-label="Effacer la recherche"
              >
                <X className="h-3 w-3" />
              </button>
            )}
            {!kpiFilter && (
              <Search className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-500 pointer-events-none" />
            )}
          </div>

          {/* Contrôle auto-refresh */}
          <div className="relative group">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="inline-block">
                  <button
                    type="button"
                    onClick={handleAutoRefreshClick}
                    disabled={!isOnline}
                    className={autoRefreshButtonClassName}
                    aria-label={autoRefreshAriaLabel}
                  >
                    <Activity className={autoRefreshIconClassName} />
                  </button>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <AutoRefreshTooltipContent 
                  autoRefreshEnabled={autoRefreshEnabled}
                  refreshInterval={refreshInterval}
                  isTabVisible={isTabVisible}
                  isOnline={isOnline}
                />
              </TooltipContent>
            </Tooltip>
            
            {/* Menu déroulant pour configurer l'intervalle */}
            <div className="absolute right-0 top-full mt-2 w-48 bg-slate-900/95 border border-slate-700/50 rounded-lg shadow-xl backdrop-blur-xl z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none group-hover:pointer-events-auto">
              <div className="p-2 space-y-2">
                <label className="text-xs text-slate-400 block">Intervalle de refresh</label>
                <select
                  value={refreshInterval}
                  onChange={(e) => onRefreshIntervalChange?.(Number(e.target.value))}
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                  className="w-full px-2 py-1.5 text-xs bg-slate-800/50 border border-slate-700/50 rounded text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  <option value={60000}>1 minute</option>
                  <option value={2 * 60000}>2 minutes</option>
                  <option value={5 * 60000}>5 minutes</option>
                  <option value={10 * 60000}>10 minutes</option>
                  <option value={15 * 60000}>15 minutes</option>
                  <option value={30 * 60000}>30 minutes</option>
                </select>
                <p className="text-[10px] text-slate-500 pt-1 border-t border-slate-700">
                  Cliquez sur le bouton pour activer/désactiver
                </p>
              </div>
            </div>
          </div>
          
          {/* Bouton refresh */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="inline-block">
                <button
                  type="button"
                  onClick={refresh}
                  disabled={refreshStatus === "loading" || refreshStatus === "retrying"}
                  className={cn(
                    'p-1.5 rounded-md transition-all duration-200',
                    'hover:bg-slate-800/50 active:scale-95',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    'focus:outline-none focus:ring-2 focus:ring-blue-500/50',
                    (refreshStatus === "loading" || refreshStatus === "retrying") && 'bg-blue-500/10'
                  )}
                  aria-label="Actualiser les indicateurs"
                >
                  <RefreshCw 
                    className={cn(
                      'h-3.5 w-3.5 text-slate-400 transition-colors',
                      (refreshStatus === "loading" || refreshStatus === "retrying") && 'animate-spin text-blue-400'
                    )} 
                  />
                </button>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <RefreshTooltipContent 
                refreshCount={refreshCount}
                loadTime={performanceMetrics.loadTime || loadTime}
                isTabVisible={isTabVisible}
              />
            </TooltipContent>
          </Tooltip>

          {/* Système d'alertes KPI */}
          <div className="hidden md:block">
            <KPIAlertsSystem
              kpis={kpisForAlerts}
              onAlert={(alert) => {
                setKpiChangeNotifications(prev => {
                  const updated = [...prev, {
                    id: alert.id,
                    label: alert.kpiLabel,
                    oldValue: 'Alerte',
                    newValue: alert.message,
                    timestamp: alert.timestamp,
                  }];
                  return updated.slice(-10);
                });
              }}
            />
          </div>

          {/* Menu d'export */}
          <div className="relative hidden md:block z-[55]">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="inline-block">
                  <button
                    type="button"
                    onClick={handleToggleExportMenu}
                    className={cn(
                      'p-1.5 rounded-md transition-all duration-200',
                      'hover:bg-slate-800/50 active:scale-95',
                      'focus:outline-none focus:ring-2 focus:ring-blue-500/50',
                      showExportMenu && 'bg-blue-500/10'
                    )}
                    aria-label="Exporter les données"
                    aria-expanded={showExportMenu}
                  >
                    <Download className="h-3.5 w-3.5 text-slate-400" />
                  </button>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Exporter les données (Ctrl+E)</p>
              </TooltipContent>
            </Tooltip>
            {showExportMenu && (
              <div className="absolute right-0 top-full mt-2 w-52 bg-slate-900/95 border border-slate-700/50 rounded-lg shadow-xl backdrop-blur-xl z-[60] animate-fadeIn pointer-events-auto">
                <div className="p-2 space-y-1">
                  <div className="px-2 py-1.5 text-[10px] uppercase tracking-wide text-slate-500 font-medium">
                    Format d'export
                  </div>
                  <button
                    type="button"
                    onClick={handleExportCSV}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:bg-slate-800/50 rounded-md transition-colors"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    Exporter en CSV
                  </button>
                  <button
                    type="button"
                    onClick={handleExportJSON}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:bg-slate-800/50 rounded-md transition-colors"
                  >
                    <BarChart3 className="h-3.5 w-3.5" />
                    Exporter en JSON
                  </button>
                  <button
                    type="button"
                    onClick={handleExportPDF}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:bg-slate-800/50 rounded-md transition-colors"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    Exporter en PDF
                  </button>
                  <button
                    type="button"
                    onClick={handleExportExcel}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:bg-slate-800/50 rounded-md transition-colors"
                  >
                    <BarChart3 className="h-3.5 w-3.5" />
                    Exporter en Excel
                  </button>
                  <div className="border-t border-slate-700/50 my-1" />
                  <button
                    onClick={() => {
                      openModal('stats');
                      setShowExportMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:bg-slate-800/50 rounded-md transition-colors"
                  >
                    <BarChart3 className="h-3.5 w-3.5" />
                    Statistiques
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <LastUpdateDisplay lastUpdate={lastUpdate} />
            {(refreshStatus === "loading" || refreshStatus === "retrying") && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex items-center gap-1 text-[10px] text-blue-400 animate-pulse">
                    <Zap className="h-2.5 w-2.5" />
                    {retryCount > 0 ? `Tentative ${retryCount}/3...` : 'Actualisation...'}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {retryCount > 0 
                      ? `Nouvelle tentative (${retryCount}/3)` 
                      : 'Mise à jour des indicateurs en cours'}
                  </p>
                </TooltipContent>
              </Tooltip>
            )}
            {kpiChangeNotifications.length > 0 && refreshStatus === "idle" && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400">
                    <Activity className="h-2.5 w-2.5 animate-pulse" />
                    {kpiChangeNotifications.length} changement{kpiChangeNotifications.length > 1 ? 's' : ''}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Des indicateurs ont été mis à jour</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
      </div>

      {/* Grille de KPIs */}
      {topKpis.length === 0 ? (
        <div className="py-8 text-center" role="status" aria-live="polite" aria-atomic="true">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-800/50 mb-3">
            <Info className="h-6 w-6 text-slate-500" aria-hidden="true" />
          </div>
          <p className="text-sm text-slate-400 mb-2">Aucun indicateur trouvé</p>
          <p className="text-xs text-slate-500 mb-3">
            {kpiFilter 
              ? `Aucun résultat pour "${kpiFilter}"` 
              : "Essayez avec d'autres mots-clés"}
          </p>
          {kpiFilter && (
            <button
              type="button"
              onClick={handleClearKpiFilter}
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 rounded px-2 py-1"
              aria-label="Effacer le filtre de recherche"
            >
              Effacer le filtre
            </button>
          )}
        </div>
      ) : (
        <div 
          className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3"
          role="list"
          aria-label={`Liste des indicateurs de performance${topKpis.length !== kpis.length ? ` (${topKpis.length} sur ${kpis.length} affichés)` : ''}`}
        >
          {topKpis.map((kpi, index) => {
            const Icon = kpi.icon;
            const isPositive = kpi.trend === 'up' && kpi.tone === 'ok';
            const isNegative = kpi.trend === 'down' && (kpi.tone === 'warn' || kpi.tone === 'crit');
            
            return (
              <div key={kpi.label} role="listitem">
                <KPICard
                  kpi={kpi}
                  icon={Icon}
                  index={index}
                  isPositive={isPositive}
                  isNegative={isNegative}
                  onClick={() => handleKPIClick(kpi)}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
});
