/**
 * Composant DashboardKPIBar
 * Affiche la barre KPI avec filtre, refresh, export et grille de KPIs
 * Extrait de DashboardContent pour améliorer la maintenabilité
 */

'use client';

import { useState, useCallback, useMemo, memo, useRef, useEffect } from 'react';
import { 
  Search, 
  X, 
  Activity, 
  RefreshCw, 
  Download, 
  FileText, 
  BarChart3,
  Info,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useKPIFilter } from '@/modules/dashboard/hooks/useKPIFilter';
import { useDashboardRefresh } from '@/modules/dashboard/hooks/useDashboardRefresh';
import { KPIAlertsSystem } from '@/components/features/bmo/dashboard/command-center/KPIAlertsSystem';
import type { KPIDisplayData } from '@/lib/mappings/dashboardKPIMapping';
import { useDashboardCommandCenterStore } from '@/lib/stores/dashboardCommandCenterStore';
import { getKPIMappingByLabel } from '@/lib/mappings/dashboardKPIMapping';
import { useLogger } from '@/lib/utils/logger';
import { useVirtualizer } from '@tanstack/react-virtual';
import { zIndexClass } from '../utils/zIndex';
import { KpiTile, type KpiTileColor, type KpiTileTrendSentiment } from './KpiTile';
// Import avec alias pour éviter le conflit de nom avec LegacyKPICard
// Note: On utilise un alias car on a aussi un composant LegacyKPICard local
import { KPICard as ModernKPICard } from '@/components/features/bmo/dashboard/components/KPICard';

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
  kpis?: KPIData[];
  onKPIClick?: (kpi: KPIData) => void;
  onExport?: (format: 'csv' | 'json' | 'pdf' | 'excel') => Promise<void>;
  onRefresh?: () => Promise<void> | void;
  /** Affichage plus dense en tuiles compactes (style SaaS) */
  compact?: boolean;
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

// Composant LegacyKPICard (ancien composant, à migrer progressivement)
// IMPORTANT: Ne pas renommer en KPICard car cela créerait un conflit avec l'import ModernKPICard
// Le nom doit rester LegacyKPICard pour éviter le conflit avec l'import: import { KPICard as ModernKPICard }
interface LegacyKPICardProps {
  kpi: KPIData;
  icon: React.ComponentType<{ className?: string }>;
  index: number;
  isPositive: boolean;
  isNegative: boolean;
  onClick?: () => void;
}

// ⚠️ ATTENTION: Ne jamais renommer ce composant en "KPICard" car cela créerait un conflit avec l'import
// Le nom DOIT rester LegacyKPICard pour éviter le conflit avec: import { KPICard as ModernKPICard }
// Si vous voyez une erreur "KPICard is defined multiple times", vérifiez que cette ligne contient bien "LegacyKPICard" et non "KPICard"
// ⚠️ CRITIQUE: Ce composant DOIT s'appeler LegacyKPICard, pas KPICard
// Si vous voyez "KPICard is defined multiple times", c'est que ce nom a été changé en KPICard
const LegacyKPICard = memo(function LegacyKPICard({ 
  kpi, 
  icon: Icon, 
  index, 
  isPositive, 
  isNegative,
  onClick
}: LegacyKPICardProps) {
  const clickable = Boolean(onClick);
  const toneStyles = useMemo(() => {
    switch (kpi.tone) {
      case 'ok':
        return {
          accent: 'bg-emerald-400/70',
          badge: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
        };
      case 'warn':
        return {
          accent: 'bg-amber-400/70',
          badge: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
        };
      case 'crit':
        return {
          accent: 'bg-red-400/70',
          badge: 'bg-red-500/10 text-red-300 border-red-500/20',
        };
      default:
        return {
          accent: 'bg-slate-400/70',
          badge: 'bg-slate-500/10 text-slate-200 border-slate-500/20',
        };
    }
  }, [kpi.tone]);

  const trendIcon = useMemo(() => {
    const iconStyle = { width: 'clamp(0.75rem, 0.875vw, 0.875rem)', height: 'clamp(0.75rem, 0.875vw, 0.875rem)', minWidth: '0.75rem', minHeight: '0.75rem' };
    if (kpi.trend === 'up') return <ArrowUpRight style={iconStyle} />;
    if (kpi.trend === 'down') return <ArrowDownRight style={iconStyle} />;
    return <Minus style={iconStyle} />;
  }, [kpi.trend]);

  const deltaClass = cn(
    'inline-flex items-center gap-1 font-medium',
    isPositive && 'text-emerald-300',
    isNegative && 'text-red-300',
    !isPositive && !isNegative && 'text-slate-300'
  );
  
  const deltaStyle = { fontSize: 'clamp(0.625rem, 0.75vw, 0.6875rem)' }; // 10px-11px

  const tooltip = (
    <div className="space-y-1">
      <div className="font-semibold">{kpi.label}</div>
      <div className="text-xs text-slate-300">
        Valeur : <span className="font-medium">{String(kpi.value)}</span>
      </div>
      <div className="text-xs text-slate-400">
        Variation :{' '}
        <span className={cn(isPositive && 'text-emerald-300', isNegative && 'text-red-300')}>
          {kpi.delta}
        </span>
      </div>
    </div>
  );

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={onClick}
          disabled={!onClick}
          className={cn(
            'group relative w-full overflow-hidden rounded-2xl text-left',
            'bg-gradient-to-b from-slate-900/60 to-slate-950/20',
            'ring-1 ring-slate-700/40 shadow-sm',
            'transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:ring-slate-600/50',
            'focus:outline-none focus-within:ring-2 focus-within:ring-emerald-400/30',
            clickable && 'cursor-pointer',
            !clickable && 'cursor-default',
            !clickable && 'opacity-85'
          )}
          style={{ 
            animationDelay: `${index * 35}ms`,
            padding: 'clamp(0.75rem, 1.5vw, 1rem)',
            minHeight: '80px'
          }}
          aria-label={`${kpi.label}: ${String(kpi.value)} (${kpi.delta})`}
        >
          <span className={cn('absolute left-0 top-0 h-full w-[3px] rounded-l-xl', toneStyles.accent)} />

          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center rounded-lg bg-slate-800/50 border border-slate-700/40" style={{ width: 'clamp(1.5rem, 2vw, 1.75rem)', height: 'clamp(1.5rem, 2vw, 1.75rem)', minWidth: '1.5rem', minHeight: '1.5rem' }}>
                  {/* @ts-expect-error - Icon component accepts style prop at runtime */}
                  <Icon className="text-slate-200" style={{ width: 'clamp(0.875rem, 1vw, 1rem)', height: 'clamp(0.875rem, 1vw, 1rem)', minWidth: '0.875rem', minHeight: '0.875rem' }} />
                </span>

                <div className="min-w-0">
                  <div className="text-[11px] font-medium text-slate-300/80 truncate">
                    {kpi.label}
                  </div>
                </div>
              </div>

              <div className="mt-2 flex items-end justify-between gap-2">
                <div className="font-semibold text-slate-50 leading-none truncate" style={{ fontSize: 'clamp(1.25rem, 2vw, 1.5rem)' }}>
                  {String(kpi.value)}
                </div>

                <div className={deltaClass} style={deltaStyle}>
                  {trendIcon}
                  <span>{kpi.delta}</span>
                </div>
              </div>

            </div>

            <span className={cn('shrink-0 rounded-full border px-2 py-0.5 font-medium', toneStyles.badge)} style={{ fontSize: 'clamp(0.5625rem, 0.7vw, 0.625rem)' }}>
              {kpi.tone === 'ok' ? 'OK' : kpi.tone === 'warn' ? 'Alerte' : kpi.tone === 'crit' ? 'Critique' : 'Info'}
            </span>
          </div>
        </button>
      </TooltipTrigger>

      <TooltipContent side="top" className="max-w-xs">
        {tooltip}
      </TooltipContent>
    </Tooltip>
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
      {filter ? (
        <p>
          Filtre:{' '}
          <span className="font-medium text-slate-200">{filter}</span>
        </p>
      ) : null}
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
  onRefresh,
  compact = false,
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

  // ✅ Valeur par défaut pour kpis pour éviter les erreurs
  const safeKpis = kpis ?? [];

  // Utiliser le hook de filtre
  const {
    filter: kpiFilter,
    debouncedFilter: debouncedKpiFilter,
    filteredItems: filteredKpis,
    updateFilter: setKpiFilter,
    clearFilter: handleClearKpiFilter,
    filteredCount,
    totalCount,
  } = useKPIFilter({
    items: safeKpis,
    filterFn: (kpi, filter) => {
      const filterLower = filter.toLowerCase().trim();
      return kpi.label.toLowerCase().includes(filterLower);
    },
  });

  // ✅ Valeur par défaut pour topKpis pour éviter les erreurs
  const topKpis = filteredKpis ?? safeKpis;

  const toneToTileColor = useCallback((tone: KPITone): KpiTileColor => {
    if (tone === 'ok') return 'emerald';
    if (tone === 'warn') return 'amber';
    if (tone === 'crit') return 'rose';
    return 'slate';
  }, []);

  const deltaToSentiment = useCallback((delta?: string): KpiTileTrendSentiment => {
    if (!delta) return 'neutral';
    const d = delta.trim();
    if (d.startsWith('+')) return 'positive';
    if (d.startsWith('-')) return 'negative';
    return 'neutral';
  }, []);

  // Utiliser le hook de refresh
  const {
    refresh,
    status: refreshStatus,
    refreshCount,
    retryCount,
    loadTime,
  } = useDashboardRefresh({
    onRefresh: async () => {
      // Normaliser: `useDashboardRefresh` attend une Promise
      if (onRefresh) {
        await Promise.resolve(onRefresh());
        return;
      }
      // Fallback: ne rien faire si pas de callback
      if (process.env.NODE_ENV === 'development') {
        log.warn('DashboardKPIBar: onRefresh callback not provided');
      }
    },
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

  // ✅ Auto-fit grid (évite le rendu "8 colonnes compressées")
  const kpiDisplaySize = compact ? 'compact' : 'normal';
  const minCardWidth = useMemo(() => {
    if (kpiDisplaySize === 'compact') return 200;
    return 240; // normal
  }, [kpiDisplaySize]);

  const gridStyle = useMemo<React.CSSProperties>(() => {
    return { gridTemplateColumns: `repeat(auto-fit, minmax(${minCardWidth}px, 1fr))` };
  }, [minCardWidth]);

  // Styles conditionnels - Mémorisés pour éviter les re-renders
  // ✅ Touch target minimum 44x44px pour conformité WCAG
  const autoRefreshButtonClassName = useMemo(() => cn(
    'min-h-[44px] min-w-[44px] p-2 sm:p-2.5 rounded-md transition-all duration-200',
    'hover:bg-slate-800/50 active:scale-95',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
    autoRefreshEnabled && isOnline && isTabVisible && 'bg-emerald-500/10 text-emerald-400',
    !autoRefreshEnabled && 'text-slate-400',
    !isOnline && 'text-slate-600'
  ), [autoRefreshEnabled, isOnline, isTabVisible]);

  const autoRefreshIconClassName = useMemo(() => cn(
    'h-3.5 w-3.5 transition-colors',
    autoRefreshEnabled && isOnline && isTabVisible && 'text-emerald-400 animate-pulse',
    !autoRefreshEnabled && 'text-slate-400',
    !isOnline && 'text-slate-600'
  ), [autoRefreshEnabled, isOnline, isTabVisible]);

  const autoRefreshAriaLabel = useMemo(() => autoRefreshEnabled
    ? 'Désactiver l\'actualisation automatique'
    : 'Activer l\'actualisation automatique',
    [autoRefreshEnabled]
  );

  // Calculer les KPIs pour les alertes
  const kpisForAlerts = useMemo<KPIDisplayData[]>(() => {
    return topKpis.map((kpi) => ({
      label: kpi.label,
      value: kpi.value,
      delta: kpi.delta,
      tone: kpi.tone,
      trend: kpi.trend,
      icon: kpi.icon,
    }));
  }, [topKpis]);

  // Mémoriser les KPIs avec leurs propriétés calculées pour éviter les recalculs
  const kpisWithProps = useMemo(() => {
    return topKpis.map((kpi, index) => {
      const Icon = kpi.icon;
      const isPositive = kpi.trend === 'up' && kpi.tone === 'ok';
      const isNegative = kpi.trend === 'down' && (kpi.tone === 'warn' || kpi.tone === 'crit');
      return {
        kpi,
        Icon,
        index,
        isPositive,
        isNegative,
      };
    });
  }, [topKpis]);

  // Mémoriser les handlers onClick pour chaque KPI
  const kpiClickHandlers = useMemo(() => {
    return new Map(
      topKpis.map(kpi => [kpi.label, () => handleKPIClick(kpi)])
    );
  }, [topKpis, handleKPIClick]);

  // Virtualisation conditionnelle si >50 items
  const shouldVirtualize = topKpis.length > 50;
  const parentRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);

  const handleStripKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!stripRef.current) return;
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      stripRef.current.scrollBy({ left: 260, behavior: 'smooth' });
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      stripRef.current.scrollBy({ left: -260, behavior: 'smooth' });
    }
  }, []);

  // Calculer le nombre de colonnes selon la taille de l'écran
  // Pour la virtualisation, on utilise une approche par rangées
  const [colsPerRow, setColsPerRow] = useState(() => {
    // Estimation initiale basée sur les breakpoints Tailwind
    if (typeof window === 'undefined') return 8; // SSR fallback
    const width = window.innerWidth;
    if (width >= 1280) return 8; // xl
    if (width >= 1024) return 6; // lg
    if (width >= 768) return 4;  // md
    if (width >= 640) return 3;  // sm
    if (width >= 475) return 2;  // xs
    return 1;
  });

  // Mettre à jour le nombre de colonnes lors du resize
  useEffect(() => {
    if (!shouldVirtualize) return; // Pas besoin si pas de virtualisation
    
    const updateCols = () => {
      if (typeof window === 'undefined') return;
      const width = window.innerWidth;
      let newCols = 8; // default xl
      if (width >= 1280) newCols = 8; // xl
      else if (width >= 1024) newCols = 6; // lg
      else if (width >= 768) newCols = 4;  // md
      else if (width >= 640) newCols = 3;  // sm
      else if (width >= 475) newCols = 2;  // xs
      else newCols = 1;
      
      setColsPerRow(newCols);
    };
    
    updateCols(); // Initial call
    window.addEventListener('resize', updateCols);
    return () => window.removeEventListener('resize', updateCols);
  }, [shouldVirtualize]);

  const rowsCount = useMemo(() => Math.ceil(topKpis.length / colsPerRow), [topKpis.length, colsPerRow]);
  const rowHeight = 120; // Hauteur estimée d'une rangée

  const virtualizer = useVirtualizer({
    count: rowsCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan: 2, // Nombre de rangées à rendre en dehors de la vue
    enabled: shouldVirtualize,
  });

  // Fermer le menu d'export au clic extérieur
  useEffect(() => {
    if (!showExportMenu) return;
    
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-export-menu]')) {
        setShowExportMenu(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showExportMenu]);

  return (
    <div 
      className="relative z-10 border-b border-slate-800/60 bg-slate-950/40 backdrop-blur-xl"
      style={{ padding: 'clamp(0.75rem, 1.5vw, 1rem)' }}
      role="region"
      aria-label="Indicateurs de performance en temps réel"
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 grid h-9 w-9 place-items-center rounded-2xl bg-emerald-500/10 ring-1 ring-emerald-500/20">
            <Activity className="h-4 w-4 text-emerald-200" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-white" style={{ fontSize: 'clamp(0.875rem, 1vw, 1rem)' }}>Indicateurs en temps réel</h2>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-emerald-200 ring-1 ring-emerald-500/20" style={{ fontSize: 'clamp(0.625rem, 0.75vw, 0.6875rem)' }}>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live
              </span>
              {lastUpdate ? (
                <span className="hidden sm:inline text-[11px] text-slate-500">
                  • Mise à jour <LastUpdateDisplay lastUpdate={lastUpdate} />
                </span>
              ) : null}
              {topKpis.length !== safeKpis.length ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="hidden sm:inline text-slate-500 cursor-help" style={{ fontSize: 'clamp(0.625rem, 0.75vw, 0.6875rem)' }}>
                      • {topKpis.length}/{safeKpis.length}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <KPICountTooltipContent count={topKpis.length} total={safeKpis.length} filter={debouncedKpiFilter} />
                  </TooltipContent>
                </Tooltip>
              ) : null}
            </div>
            <p className="text-slate-400" style={{ fontSize: 'clamp(0.75rem, 1vw, 0.875rem)' }}>
              KPIs transverses — clic sur une carte pour ouvrir le détail
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Recherche KPI */}
          <div className="relative hidden sm:block">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500" style={{ width: 'clamp(0.875rem, 1vw, 0.875rem)', height: 'clamp(0.875rem, 1vw, 0.875rem)', minWidth: '0.875rem', minHeight: '0.875rem' }} />
            <input
              type="text"
              placeholder="Rechercher un indicateur…"
              value={kpiFilter}
              onChange={(e) => setKpiFilter(e.target.value)}
              className={cn(
                'w-56 pl-8 pr-8 py-2 text-xs rounded-lg',
                'bg-slate-900/40 border border-slate-800/70',
                'text-slate-200 placeholder:text-slate-500',
                'focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/30'
              )}
              aria-label="Rechercher un indicateur"
            />
            {kpiFilter && (
              <button
                type="button"
                onClick={handleClearKpiFilter}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-200 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 rounded"
                style={{ minWidth: '32px', minHeight: '32px' }}
                aria-label="Effacer la recherche"
              >
                <X style={{ width: 'clamp(0.875rem, 1vw, 1rem)', height: 'clamp(0.875rem, 1vw, 1rem)', minWidth: '0.875rem', minHeight: '0.875rem' }} />
              </button>
            )}
          </div>

          {/* Contrôle auto-refresh (gardé mais moins proéminent) */}
          <div className="relative group hidden lg:block">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={handleAutoRefreshClick}
                  disabled={!isOnline}
                  className={autoRefreshButtonClassName}
                  aria-label={autoRefreshAriaLabel}
                >
                  <Activity className={autoRefreshIconClassName} />
                </button>
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
            <div className={cn("absolute right-0 top-full mt-2 w-48 bg-slate-900/95 border border-slate-700/50 rounded-lg shadow-xl backdrop-blur-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none group-hover:pointer-events-auto", zIndexClass('dropdownMenu'))}>
              <div className="p-2 space-y-2">
                <label className="text-xs text-slate-400 block">Intervalle de refresh</label>
                <select
                  value={refreshInterval}
                  onChange={(e) => onRefreshIntervalChange?.(Number(e.target.value))}
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                  className="w-full min-h-[44px] px-2 py-2 text-xs bg-slate-800/50 border border-slate-700/50 rounded text-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                >
                  <option value={60000}>1 minute</option>
                  <option value={2 * 60000}>2 minutes</option>
                  <option value={5 * 60000}>5 minutes</option>
                  <option value={10 * 60000}>10 minutes</option>
                  <option value={15 * 60000}>15 minutes</option>
                  <option value={30 * 60000}>30 minutes</option>
                </select>
                <p className="text-[10px] text-slate-400 pt-1 border-t border-slate-700">
                  Cliquez sur le bouton pour activer/désactiver
                </p>
              </div>
            </div>
          </div>
          
          {/* Refresh - Bouton réel */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={refresh}
                disabled={refreshStatus === "loading" || refreshStatus === "retrying"}
                className={cn(
                  'inline-flex items-center gap-2 rounded-lg px-3 py-2',
                  'bg-slate-900/40 border border-slate-800/70',
                  'text-slate-200',
                  'hover:bg-slate-900/60 hover:border-slate-700/70 transition-colors',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40',
                  'min-h-[32px]'
                )}
                style={{ fontSize: 'clamp(0.75rem, 1vw, 0.875rem)' }}
              >
                <RefreshCw 
                  className={cn((refreshStatus === "loading" || refreshStatus === "retrying") && 'animate-spin')} 
                  style={{ width: 'clamp(0.875rem, 1vw, 1rem)', height: 'clamp(0.875rem, 1vw, 1rem)', minWidth: '0.875rem', minHeight: '0.875rem' }} 
                />
                <span className="hidden sm:inline">Actualiser</span>
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Actualiser (Ctrl+R)</p>
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

          {/* Export - Menu déroulant propre */}
          <div className="relative hidden md:block" data-export-menu>
            <button
              type="button"
              onClick={handleToggleExportMenu}
              className={cn(
                'inline-flex items-center gap-2 rounded-lg px-3 py-2',
                'bg-slate-900/40 border border-slate-800/70',
                'text-slate-200',
                'hover:bg-slate-900/60 hover:border-slate-700/70 transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40',
                'min-h-[32px]'
              )}
              style={{ fontSize: 'clamp(0.75rem, 1vw, 0.875rem)' }}
              aria-expanded={showExportMenu}
              aria-haspopup="true"
            >
              <Download className="h-4 w-4" style={{ width: 'clamp(0.875rem, 1vw, 1rem)', height: 'clamp(0.875rem, 1vw, 1rem)', minWidth: '0.875rem', minHeight: '0.875rem' }} />
              <span>Exporter</span>
            </button>
            {showExportMenu && (
              <>
                {/* Overlay pour fermer au clic extérieur - ne bloque pas les clics sur le menu */}
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowExportMenu(false)}
                  aria-hidden="true"
                />
                <div 
                  className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-slate-800/70 bg-slate-950/95 backdrop-blur-xl shadow-xl z-50"
                  onClick={(e) => e.stopPropagation()}
                  role="menu"
                  aria-orientation="vertical"
                >
                  <button
                    type="button"
                    onClick={handleExportCSV}
                    className="w-full text-left px-3 py-2 text-slate-200 hover:bg-slate-900/50 rounded-t-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
                    style={{ fontSize: 'clamp(0.75rem, 1vw, 0.875rem)', minHeight: '36px' }}
                    role="menuitem"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" style={{ width: 'clamp(0.875rem, 1vw, 1rem)', height: 'clamp(0.875rem, 1vw, 1rem)', minWidth: '0.875rem', minHeight: '0.875rem' }} />
                      <span>Exporter en CSV</span>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={handleExportJSON}
                    className="w-full text-left px-3 py-2 text-slate-200 hover:bg-slate-900/50 rounded-b-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
                    style={{ fontSize: 'clamp(0.75rem, 1vw, 0.875rem)', minHeight: '36px' }}
                    role="menuitem"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" style={{ width: 'clamp(0.875rem, 1vw, 1rem)', height: 'clamp(0.875rem, 1vw, 1rem)', minWidth: '0.875rem', minHeight: '0.875rem' }} />
                      <span>Exporter en JSON</span>
                    </div>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Grille de KPIs */}
      {topKpis.length === 0 ? (
        <div className="py-8 text-center" role="status" aria-live="polite" aria-atomic="true">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-800/50 mb-3">
            <Info className="h-6 w-6 text-slate-300" aria-hidden="true" />
          </div>
          <p className="text-sm text-slate-300 mb-2">Aucun indicateur trouvé</p>
          <p className="text-xs text-slate-400 mb-3">
            {kpiFilter 
              ? `Aucun résultat pour "${kpiFilter}"` 
              : "Essayez avec d'autres mots-clés"}
          </p>
          {kpiFilter && (
            <button
              type="button"
              onClick={handleClearKpiFilter}
              className="text-xs min-h-[44px] px-3 py-2 text-blue-400 hover:text-blue-300 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded"
              aria-label="Effacer le filtre de recherche"
            >
              Effacer le filtre
            </button>
          )}
        </div>
      ) : shouldVirtualize ? (
        // Version virtualisée pour >50 items (par rangées)
        <div
          ref={parentRef}
          className="h-[600px] overflow-auto"
          role="list"
          aria-label={`Liste des indicateurs de performance (${topKpis.length} items, virtualisé)`}
          style={{ WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
        >
          <div
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {virtualizer.getVirtualItems().map((virtualRow) => {
              const rowStart = virtualRow.index * colsPerRow;
              const rowItems = kpisWithProps.slice(rowStart, rowStart + colsPerRow);
              
              return (
                <div
                  key={virtualRow.index}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-3">
                    {rowItems.map((item) => (
                      <div key={item.kpi.label} role="listitem">
                        <LegacyKPICard
                          kpi={item.kpi}
                          icon={item.Icon}
                          index={item.index}
                          isPositive={item.isPositive}
                          isNegative={item.isNegative}
                          onClick={kpiClickHandlers.get(item.kpi.label)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : compact ? (
        <div
          className="grid gap-3"
          style={gridStyle}
          role="list"
          aria-label={`Indicateurs de performance (${topKpis.length} éléments)`}
        >
          {kpisWithProps.map((item) => (
            <div key={item.kpi.label} role="listitem">
              <KpiTile
                label={item.kpi.label}
                value={String(item.kpi.value)}
                color={toneToTileColor(item.kpi.tone)}
                Icon={item.Icon as unknown as LucideIcon}
                size="sm"
                trendLabel={item.kpi.delta}
                trendDir={(item.kpi.trend === 'neutral' ? 'flat' : item.kpi.trend) as 'up' | 'down' | 'flat'}
                trendSentiment={deltaToSentiment(item.kpi.delta)}
                onClick={kpiClickHandlers.get(item.kpi.label)}
              />
            </div>
          ))}
        </div>
      ) : (
        // KPI strip (scroll horizontal, pro)
        <div className="mt-3">
          <div className="flex gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {topKpis.map((kpi) => {
              const Icon = kpi.icon;
              const trendType = kpi.trend === 'up' ? 'up' : kpi.trend === 'down' ? 'down' : 'neutral';
              // Convertir delta en nombre pour trend
              const trendValue = typeof kpi.delta === 'string' 
                ? parseFloat(kpi.delta.replace(/[^0-9.-]/g, '')) || 0
                : 0;
              
              return (
                <div key={kpi.label} className="flex-1" style={{ minWidth: 'clamp(200px, 15vw, 220px)', maxWidth: 'clamp(240px, 18vw, 260px)' }}>
                  <ModernKPICard
                    kpi={{
                      id: kpi.label,
                      label: kpi.label,
                      value: kpi.value,
                      trend: trendValue,
                      trendType,
                      // @ts-expect-error - Icon type is compatible at runtime
                      icon: Icon,
                      color: kpi.tone === 'ok' ? 'emerald' : kpi.tone === 'warn' ? 'amber' : kpi.tone === 'crit' ? 'rose' : 'blue',
                      onClick: kpiClickHandlers.get(kpi.label),
                    }}
                    size="sm"
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
});
