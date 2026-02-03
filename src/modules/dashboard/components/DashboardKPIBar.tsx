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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useKPIFilter } from '@/modules/dashboard/hooks/useKPIFilter';
import { useDashboardRefresh } from '@/modules/dashboard/hooks/useDashboardRefresh';
import { useDashboardPermissions } from '@/modules/dashboard/hooks/useDashboardPermissions';
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
import { KPICard as SharedKPICard, type KPICardData } from './shared/KPICard';
import { parseTrendPercent, toneToColor } from '@lib-root/dashboard/kpi';
import { useI18n } from '@/lib/i18n';
import { useKpiBarTelemetry } from '../telemetry/instruments/kpiBar';

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
// ⚠️ IMPORTANT: Ce composant DOIT s'appeler LegacyKPICard (pas KPICard) pour éviter le conflit avec l'import
const LegacyKPICard = memo(function LegacyKPICard({ 
  kpi, 
  icon: Icon, 
  index, 
  isPositive, 
  isNegative,
  onClick
}: LegacyKPICardProps) {
  const { t } = useI18n();
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
            'bg-slate-900/40',
            'ring-1 ring-slate-800/60',
            'transition-colors duration-200 hover:bg-slate-900/55 hover:ring-slate-700/60',
            'focus:outline-none focus:ring-2 focus:ring-blue-500/40',
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
              {kpi.tone === 'ok' ? t('kpi.tone.ok') : kpi.tone === 'warn' ? t('kpi.tone.warn') : kpi.tone === 'crit' ? t('kpi.tone.crit') : t('kpi.tone.info')}
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
  const { t } = useI18n();
  return (
    <div className="text-xs space-y-1">
      <p>{t('kpi.autoRefresh.label')}: {autoRefreshEnabled ? t('kpi.autoRefresh.enabled') : t('kpi.autoRefresh.disabled')}</p>
      <p>{t('kpi.autoRefresh.interval')}: {refreshInterval / 1000}s</p>
      {!isTabVisible && <p className="text-amber-400">{t('kpi.autoRefresh.tabInactive')}</p>}
      {!isOnline && <p className="text-red-400">{t('kpi.autoRefresh.offline')}</p>}
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
  const { t, fmt } = useI18n();
  return (
    <div className="text-xs space-y-1">
      <p>{t('kpi.refresh.count')}: {fmt.number(refreshCount)}</p>
      <p>{t('kpi.refresh.loadTime')}: {fmt.number(loadTime, { maximumFractionDigits: 0 })}ms</p>
      {!isTabVisible && <p className="text-amber-400">{t('kpi.autoRefresh.tabInactive')}</p>}
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
  const { t, fmt } = useI18n();
  return (
    <div className="text-xs space-y-1">
      <p>{t('kpi.count.display', { count: fmt.number(count), total: fmt.number(total) })}</p>
      {filter ? (
        <p>
          {t('kpi.count.filter')}:{' '}
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
  const { t, fmt } = useI18n();
  if (!lastUpdate) return null;
  
  const now = new Date();
  const diff = now.getTime() - lastUpdate.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  
  let display: string;
  if (seconds < 60) {
    display = t('kpi.lastUpdate.secondsAgo', { seconds: fmt.number(seconds) });
  } else if (minutes < 60) {
    display = t('kpi.lastUpdate.minutesAgo', { minutes: fmt.number(minutes) });
  } else {
    display = fmt.date(lastUpdate, { hour: '2-digit', minute: '2-digit' });
  }
  
  return (
    <span className="text-[10px] text-slate-400">
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
  const { t, fmt } = useI18n();
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

  // Phase P10: Vérifier permission export
  const { canExport } = useDashboardPermissions();
  
  // Phase P14: Télémetrie - instrumentation KPI Bar
  const telemetry = useKpiBarTelemetry();
  
  // Récupérer la route courante pour le tracking
  const nav = useDashboardCommandCenterStore((s) => s.navigation);
  const routeKey = `${nav.mainCategory}::${nav.subCategory || ''}::${nav.subSubCategory || ''}`;

  // Handler pour cliquer sur un KPI
  const handleKPIClick = useCallback((kpi: KPIData) => {
    // Phase P14: Télémetrie - tracker le clic KPI
    telemetry.onKpiClick(kpi.label, kpi.value);
    
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
  }, [onKPIClick, openModal, telemetry]);

  // Handlers d'export
  const handleExportCSV = useCallback(async () => {
    if (onExport && canExport) {
      telemetry.onExport('csv', routeKey);
      await onExport('csv');
    }
    setShowExportMenu(false);
  }, [onExport, canExport, telemetry, routeKey]);

  const handleExportJSON = useCallback(async () => {
    if (onExport && canExport) {
      telemetry.onExport('json', routeKey);
      await onExport('json');
    }
    setShowExportMenu(false);
  }, [onExport, canExport, telemetry, routeKey]);

  const handleExportPDF = useCallback(async () => {
    if (onExport && canExport) {
      telemetry.onExport('pdf', routeKey);
      await onExport('pdf');
    }
    setShowExportMenu(false);
  }, [onExport, canExport, telemetry, routeKey]);

  const handleExportExcel = useCallback(async () => {
    if (onExport && canExport) {
      telemetry.onExport('excel', routeKey);
      await onExport('excel');
    }
    setShowExportMenu(false);
  }, [onExport, canExport, telemetry, routeKey]);

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
      aria-labelledby="kpi-bar-heading"
    >
      <h1 id="kpi-bar-heading" className="sr-only">{t('kpi.title')}</h1>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 grid h-9 w-9 place-items-center rounded-2xl bg-emerald-500/10 ring-1 ring-emerald-500/20">
            <Activity className="h-4 w-4 text-emerald-200" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 id="kpi-bar-title" className="font-semibold text-white" style={{ fontSize: 'clamp(0.875rem, 1vw, 1rem)' }}>{t('kpi.title')}</h2>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-emerald-200 ring-1 ring-emerald-500/20" style={{ fontSize: 'clamp(0.625rem, 0.75vw, 0.6875rem)' }}>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {t('kpi.live')}
              </span>
              {lastUpdate ? (
                <span className="hidden sm:inline text-[11px] text-slate-400">
                  • {t('kpi.lastUpdate.label')} <LastUpdateDisplay lastUpdate={lastUpdate} />
                </span>
              ) : null}
              {topKpis.length !== safeKpis.length ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="hidden sm:inline text-slate-400 cursor-help" style={{ fontSize: 'clamp(0.625rem, 0.75vw, 0.6875rem)' }}>
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
              {t('kpi.description')}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Recherche KPI */}
          <div className="relative hidden sm:block">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" style={{ width: 'clamp(0.875rem, 1vw, 0.875rem)', height: 'clamp(0.875rem, 1vw, 0.875rem)', minWidth: '0.875rem', minHeight: '0.875rem' }} />
            <input
              type="text"
              placeholder={t('kpi.search.placeholder')}
              value={kpiFilter}
              onChange={(e) => setKpiFilter(e.target.value)}
              className={cn(
                'w-56 pl-8 pr-8 py-2 text-xs rounded-lg',
                'bg-slate-900/40 border border-slate-800/70',
                'text-slate-200 placeholder:text-slate-400',
                'focus:outline-none focus:ring-2 focus:ring-blue-500/40'
              )}
              aria-label="Rechercher un indicateur"
            />
            {kpiFilter && (
              <button
                type="button"
                onClick={handleClearKpiFilter}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 rounded"
                style={{ minWidth: '32px', minHeight: '32px' }}
                aria-label={t('kpi.search.clear')}
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
                <Select
                  value={String(refreshInterval)}
                  onValueChange={(v) => onRefreshIntervalChange?.(Number(v))}
                >
                  <SelectTrigger
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    className="w-full min-h-[44px] px-3 py-2 text-xs bg-slate-800/50 border-slate-700/50 rounded-xl text-slate-300 focus:ring-sky-500/50"
                    aria-label="Intervalle de refresh"
                  >
                    <SelectValue placeholder="Intervalle" />
                  </SelectTrigger>
                  <SelectContent className="border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 text-slate-900 dark:text-slate-100" onCloseAutoFocus={(e) => e.preventDefault()}>
                    <SelectItem value="60000">1 minute</SelectItem>
                    <SelectItem value="120000">2 minutes</SelectItem>
                    <SelectItem value="300000">5 minutes</SelectItem>
                    <SelectItem value="600000">10 minutes</SelectItem>
                    <SelectItem value="900000">15 minutes</SelectItem>
                    <SelectItem value="1800000">30 minutes</SelectItem>
                  </SelectContent>
                </Select>
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
                aria-label={t('kpi.refresh.label')}
              >
                <RefreshCw 
                  className={cn((refreshStatus === "loading" || refreshStatus === "retrying") && 'animate-spin')} 
                  style={{ width: 'clamp(0.875rem, 1vw, 1rem)', height: 'clamp(0.875rem, 1vw, 1rem)', minWidth: '0.875rem', minHeight: '0.875rem' }} 
                />
                <span className="hidden sm:inline">{t('kpi.refresh.label')}</span>
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t('kpi.refresh.shortcut')}</p>
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
            {/* Phase P10: Masquer le bouton Export si pas de permission */}
            {canExport && (
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
                aria-label={t('actions.export')}
              >
                <Download className="h-4 w-4" style={{ width: 'clamp(0.875rem, 1vw, 1rem)', height: 'clamp(0.875rem, 1vw, 1rem)', minWidth: '0.875rem', minHeight: '0.875rem' }} />
                <span>{t('actions.export')}</span>
              </button>
            )}
            {showExportMenu && canExport && (
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
                      <span>{t('actions.export.csv')}</span>
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
                      <span>{t('actions.export.json')}</span>
                    </div>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* KPI Rail (scan line) */}
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
      ) : (
        <div className="mt-3">
          <div className="flex items-center justify-between gap-3">
            <div className="text-xs text-slate-400">
              <span className="font-medium text-slate-200">{safeKpis.length}</span> indicateurs • scan rapide
            </div>

            <div className="hidden md:flex items-center gap-2">
              {/* petit rappel (optionnel) */}
              <div className="text-[11px] text-slate-400">Astuce : molette + shift</div>
            </div>
          </div>

          <div
            className={cn(
              "mt-3 -mx-1 px-1",
              "flex gap-3 overflow-x-auto pb-3",
              "snap-x snap-mandatory",
              "scrollbar-thin scrollbar-thumb-slate-700/50 scrollbar-track-transparent"
            )}
          >
            {topKpis.map((kpi) => {
              const Icon = kpi.icon;
              // Utiliser directement kpi.trend qui est déjà de type 'up' | 'down' | 'neutral'
              const trendType: 'up' | 'down' | 'neutral' = kpi.trend;
              
              // Convertir delta (string formatée comme "+5%" ou "-10%") en nombre pour trend
              const trendValue = parseTrendPercent(kpi.delta);
              
              // Mapper tone vers color avec tous les cas
              const color: KPICardData['color'] = toneToColor(kpi.tone);
              
              const kpiCardData: KPICardData = {
                id: kpi.label,
                label: kpi.label,
                value: kpi.value,
                trend: trendValue,
                trendType,
                icon: Icon,
                color,
                onClick: kpiClickHandlers.get(kpi.label),
              };
              
              return (
                <div key={kpi.label} className="snap-start min-w-[260px] max-w-[320px] w-[280px] flex-shrink-0">
                  <SharedKPICard kpi={kpiCardData} size="md" />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
});
