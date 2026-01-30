/* -----------------------------------------------------------------------
   FILE: app/maitre-ouvrage/dashboard/page.tsx
   VERSION: 6.0 - SHELL + UI PLUS "LOGICIEL MÉTIER"
------------------------------------------------------------------------ */

'use client';

import React, { Suspense, useMemo, memo, useCallback, useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Loader2,
  RefreshCw,
  Download,
  Zap,
  Activity,
  Info,
  FileText,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  DollarSign,
  Clock,
  TrendingUp,
  BarChart3,
  Settings,
  FileSpreadsheet,
  ChevronDown,
} from 'lucide-react';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';

import { useDashboardCommandCenterStore } from '@/lib/stores/dashboardCommandCenterStore';
import type { DashboardMainCategory } from '@/modules/dashboard/types/dashboardNavigationTypes';

import {
  DashboardSidebar,
  DashboardSubNavigation,
  DashboardSubSidebar,
  DashboardUrlSync,
  DashboardViewRouter,
  DashboardBreadcrumbs,
  ContentLoadingSkeleton,
  DashboardModulesBar,
  DashboardCleanLayout,
  DashboardAccueil3P,
} from '@/modules/dashboard';
import { DashboardShell } from '@/modules/dashboard/components/shared/DashboardShell';

import { DashboardModals } from '@/components/features/bmo/dashboard/command-center/DashboardModals';
import { DashboardCommandPalette } from '@/components/features/bmo/dashboard/command-center/DashboardCommandPalette';
import { DashboardBottomNav } from '@/modules/dashboard/components/mobile/DashboardBottomNav';
import { getKPIMappingByLabel } from '@/lib/mappings/dashboardKPIMapping';
import { useDashboardKPIs } from '@/lib/hooks/useDashboardKPIs';
import { useDashboardExport } from '@/modules/dashboard/hooks/useDashboardExport';
import { KPIAlertsSystem } from '@/components/features/bmo/dashboard/command-center/KPIAlertsSystem';
import { useLogger } from '@/lib/utils/logger';
import { clearCache } from '@/modules/dashboard/api/client';

/* =========================
   Loading
========================= */

function DashboardSkeleton() {
  return (
    <div className="h-full w-full flex items-center justify-center bg-slate-950">
      <div className="flex flex-col items-center gap-3 animate-pulse">
        <Loader2 className="h-7 w-7 animate-spin text-blue-400" />
        <p className="text-slate-400 text-sm font-medium">Chargement du dashboard…</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <TooltipProvider delayDuration={150}>
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </TooltipProvider>
  );
}

/* =========================
   Types
========================= */

type KPITone = 'ok' | 'warn' | 'crit' | 'info';
type KPITrend = 'up' | 'down' | 'neutral';

interface KPIData {
  label: string;
  value: string | number;
  delta: string;
  tone: KPITone;
  trend: KPITrend;
  icon: React.ComponentType<{ className?: string }>;
}

/* =========================
   Content
========================= */

function DashboardContent() {
  const log = useLogger('DashboardContent');

  // stores
  const navigation = useDashboardCommandCenterStore((s) => s.navigation);
  const navigate = useDashboardCommandCenterStore((s) => s.navigate);
  const sidebarCollapsed = useDashboardCommandCenterStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useDashboardCommandCenterStore((s) => s.toggleSidebar);
  const toggleCommandPalette = useDashboardCommandCenterStore((s) => s.toggleCommandPalette);
  const openModal = useDashboardCommandCenterStore((s) => s.openModal);
  const invalidateAllViews = useDashboardCommandCenterStore((s) => s.invalidateAllViews);

  const { mainCategory, subCategory, subSubCategory } = navigation;

  useEffect(() => {
    log.debug('Navigation', { mainCategory, subCategory, subSubCategory });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mainCategory, subCategory, subSubCategory]);

  // UI state
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;
  const [kpiStripCollapsed, setKpiStripCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      return localStorage.getItem('dashboard-kpi-strip-collapsed') === 'true';
    } catch {
      return false;
    }
  });
  const toggleKpiStrip = useCallback(() => {
    setKpiStripCollapsed((c) => {
      const next = !c;
      try {
        localStorage.setItem('dashboard-kpi-strip-collapsed', String(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const [showExportMenu, setShowExportMenu] = useState(false);
  const [exportingFormat, setExportingFormat] = useState<'pdf' | 'excel' | null>(null);
  const exportMenuRef = useRef<HTMLDivElement | null>(null);
  const { exportData } = useDashboardExport();

  // 🔒 IMPORTANT : si on change de vue, on ferme les menus.
  // (évite un overlay restant ouvert qui "mange" tous les clics)
  useEffect(() => {
    setShowExportMenu(false);
  }, [mainCategory, subCategory, subSubCategory]);

  // Fermer menu export si clic hors menu
  useEffect(() => {
    if (!showExportMenu) return;

    const onDown = (e: MouseEvent) => {
      const el = exportMenuRef.current;
      if (!el) return;
      if (!el.contains(e.target as Node)) setShowExportMenu(false);
    };
    window.addEventListener('mousedown', onDown, { capture: true });
    return () => window.removeEventListener('mousedown', onDown, { capture: true } as any);
  }, [showExportMenu]);

  // Note: Les handlers de navigation ne sont plus nécessaires car DashboardSidebar et DashboardSubNavigation
  // utilisent directement le store via useDashboardCommandCenterStore

  const handleKPIClick = useCallback(
    (kpi: KPIData) => {
      const mapping = getKPIMappingByLabel(kpi.label);
      if (mapping) openModal('kpi-drilldown', { kpi, kpiId: mapping.metadata.id });
      else openModal('kpi-drilldown', { kpi });
    },
    [openModal]
  );

  // API KPIs
  const {
    kpis: apiKpis,
    lastUpdate: apiLastUpdate,
    refetch: refetchKPIsFromAPI,
  } = useDashboardKPIs('year');

  const allKpis = useMemo<KPIData[]>(() => {
    if (apiKpis && apiKpis.length > 0) {
      return apiKpis.map((kpi) => {
        const mapping = getKPIMappingByLabel(kpi.label);
        return {
          label: kpi.label,
          value: kpi.value,
          delta: kpi.delta,
          tone: kpi.tone,
          trend: kpi.trend,
          icon: mapping?.display.icon || kpi.icon || Activity,
        };
      });
    }
    // fallback
    return [
      { label: 'Demandes', value: 247, delta: '+12', tone: 'ok', icon: FileText, trend: 'up' },
      { label: 'Validations', value: '89%', delta: '+3%', tone: 'ok', icon: CheckCircle2, trend: 'up' },
      { label: 'Blocages', value: 5, delta: '-2', tone: 'warn', icon: AlertTriangle, trend: 'down' },
      { label: 'Risques critiques', value: 3, delta: '+1', tone: 'crit', icon: AlertCircle, trend: 'up' },
      { label: 'Budget consommé', value: '67%', delta: '—', tone: 'info', icon: DollarSign, trend: 'neutral' },
      { label: 'Décisions en attente', value: 8, delta: '—', tone: 'warn', icon: Clock, trend: 'neutral' },
      { label: 'Temps réponse', value: '2.4j', delta: '-0.3j', tone: 'warn', icon: Activity, trend: 'down' },
      { label: 'Conformité SLA', value: '94%', delta: '+2%', tone: 'ok', icon: TrendingUp, trend: 'up' },
    ];
  }, [apiKpis]);

  useEffect(() => {
    if (apiLastUpdate) setLastUpdate(new Date(apiLastUpdate));
  }, [apiLastUpdate]);

  const topKpis = allKpis;

  // stats sidebar (clés alignées sur DashboardMainCategory)
  const stats = useMemo(
    () => ({
      pilotage: 3,
      chantiers: 5,
      finance: 12,
      clients: 4,
      rh: 8,
      systeme: 2,
    }),
    []
  );

  // refresh hardened
  const isRefreshingRef = useRef(false);
  const refreshKPIsInternal = useCallback(
    async (retryAttempt = 0): Promise<void> => {
      if (isRefreshingRef.current) return;
      isRefreshingRef.current = true;
      setIsRefreshing(true);

      try {
        await refetchKPIsFromAPI?.();
        if (retryAttempt > 0) setRetryCount(0);
        setLastUpdate(new Date());
        setRefreshCount((p) => p + 1);
      } catch (e) {
        if (retryAttempt < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, retryAttempt), 8000);
          setRetryCount(retryAttempt + 1);
          setTimeout(() => refreshKPIsInternal(retryAttempt + 1), delay);
          return;
        }
        setRetryCount(0);
      } finally {
        if (retryAttempt === 0 || retryAttempt >= maxRetries) {
          isRefreshingRef.current = false;
          setIsRefreshing(false);
        }
      }
    },
    [refetchKPIsFromAPI]
  );

  const refreshKPIs = useCallback(() => refreshKPIsInternal(0), [refreshKPIsInternal]);

  const refreshAllKPIsRef = useRef<((retryAttempt?: number) => Promise<void>) | null>(null);
  /** Rafraîchit tout : cache API, cache des vues, et barre KPIs. */
  const refreshAllKPIs = useCallback(
    async (retryAttempt = 0): Promise<void> => {
      if (isRefreshingRef.current) return;
      isRefreshingRef.current = true;
      setIsRefreshing(true);
      try {
        clearCache();
        invalidateAllViews();
        await refetchKPIsFromAPI?.();
        if (retryAttempt > 0) setRetryCount(0);
        setLastUpdate(new Date());
        setRefreshCount((p) => p + 1);
      } catch (e) {
        if (retryAttempt < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, retryAttempt), 8000);
          setRetryCount(retryAttempt + 1);
          setTimeout(() => refreshAllKPIsRef.current?.(retryAttempt + 1), delay);
          return;
        }
        setRetryCount(0);
      } finally {
        if (retryAttempt === 0 || retryAttempt >= maxRetries) {
          isRefreshingRef.current = false;
          setIsRefreshing(false);
        }
      }
    },
    [invalidateAllViews, refetchKPIsFromAPI, maxRetries]
  );
  refreshAllKPIsRef.current = refreshAllKPIs;

  const handleExportDirect = useCallback(
    async (format: 'pdf' | 'excel') => {
      setShowExportMenu(false);
      setExportingFormat(format);
      try {
        await exportData(format);
      } finally {
        setExportingFormat(null);
      }
    },
    [exportData]
  );

  // keyboard shortcuts
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t instanceof HTMLInputElement || t instanceof HTMLTextAreaElement || t.isContentEditable) return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        toggleCommandPalette();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'r') {
        e.preventDefault();
        refreshAllKPIs();
      }
      if (e.key === 'Escape') {
        setShowExportMenu(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [toggleCommandPalette, refreshAllKPIs]);

  // page title (simple mais efficace)
  const pageTitle = useMemo(() => {
    const parts = [mainCategory, subCategory, subSubCategory].filter(Boolean);
    return parts.length ? parts.join(' • ') : "Vue d'ensemble";
  }, [mainCategory, subCategory, subSubCategory]);

  const pathname = usePathname();
  // Vue d'accueil Cockpit DG = page dashboard (ou pilotage/dashboard en store). Afficher directement DashboardAccueil3P sans ViewRouter pour éviter la barre "DG Cockpit" en double.
  const isCockpitHome =
    (typeof pathname === 'string' && pathname.includes('/maitre-ouvrage/dashboard')) ||
    (mainCategory === 'pilotage' && subCategory === 'dashboard') ||
    ((mainCategory as string) === 'overview' && (subCategory === 'summary' || !subCategory));
  const useCleanLayout = true; // Refonte UX — layout Procore / SAP Fiori

  if (useCleanLayout) {
    return (
      <>
        <Suspense fallback={null}>
          <DashboardUrlSync />
        </Suspense>
        <DashboardCommandPalette kpis={allKpis} />
        <DashboardCleanLayout lastUpdate={formatTimeAgo(lastUpdate)} hideHeader>
          {isCockpitHome ? (
            <div className="flex-1 min-h-0 min-w-0 flex overflow-hidden">
              <DashboardSubSidebar />
              <div className="flex-1 min-h-0 min-w-0 flex flex-col overflow-hidden">
                <div className="shrink-0 border-b border-slate-800/60 bg-slate-950/50">
                  <DashboardSubNavigation stats={stats} mainTabsOnly />
                  <div className={cn('border-b border-slate-800/60 bg-slate-950/40')}>
                    <button
                      type="button"
                      onClick={toggleKpiStrip}
                      className={cn(
                        'w-full px-4 sm:px-6 py-2.5 flex items-center justify-between gap-2 text-left text-sm font-medium text-slate-300 hover:bg-slate-800/50 transition-colors',
                        'focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500/50'
                      )}
                      aria-expanded={!kpiStripCollapsed}
                      aria-controls="dashboard-kpi-strip"
                      id="dashboard-kpi-strip-toggle"
                    >
                      <span className="text-[10px] uppercase tracking-wider text-slate-400">Indicateurs clés</span>
                      <ChevronDown className={cn('h-4 w-4 shrink-0 text-slate-500 transition-transform duration-200', kpiStripCollapsed && '-rotate-90')} aria-hidden />
                    </button>
                    {!kpiStripCollapsed && (
                      <div id="dashboard-kpi-strip" className={cn('px-4 sm:px-6 pb-3 pt-0')} role="region" aria-labelledby="dashboard-kpi-strip-toggle">
                        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-dashboard min-w-0" role="list" style={{ scrollbarGutter: 'stable' }}>
                          {topKpis.slice(0, 6).map((kpi) => (
                            <KPICardPro key={kpi.label} kpi={kpi} onClick={() => handleKPIClick(kpi)} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="px-4 sm:px-6 py-2 flex items-center justify-between gap-3 border-b border-slate-800/60 bg-slate-950/30">
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <span>Dernière MAJ : {formatTimeAgo(lastUpdate)}</span>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            onClick={() => refreshAllKPIs()}
                            disabled={isRefreshing}
                            className="p-1.5 rounded-lg hover:bg-slate-800/60 text-slate-400 hover:text-slate-200 disabled:opacity-50"
                            aria-label="Rafraîchir"
                          >
                            <RefreshCw className={cn('h-3.5 w-3.5', isRefreshing && 'animate-spin')} />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>Rafraîchir (Ctrl+R)</TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="relative" ref={exportMenuRef}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            onClick={() => setShowExportMenu((v) => !v)}
                            disabled={!!exportingFormat}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-700/60 bg-slate-800/40 text-[11px] text-slate-300 hover:bg-slate-700/50 disabled:opacity-50"
                            aria-label="Exporter"
                            aria-expanded={showExportMenu}
                          >
                            <Download className="h-3.5 w-3.5" />
                            <span>Exporter</span>
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>Exporter en PDF ou Excel</TooltipContent>
                      </Tooltip>
                      {showExportMenu && (
                        <div className="absolute right-0 top-full mt-1 w-44 z-50 rounded-lg border border-slate-700/70 bg-slate-900 shadow-xl overflow-hidden">
                          <button
                            type="button"
                            disabled={!!exportingFormat}
                            onClick={() => handleExportDirect('pdf')}
                            className="w-full px-3 py-2 text-left text-[11px] text-slate-200 hover:bg-slate-800 flex items-center gap-2 disabled:opacity-60"
                          >
                            <FileText className="h-3 w-3" /> PDF
                          </button>
                          <button
                            type="button"
                            disabled={!!exportingFormat}
                            onClick={() => handleExportDirect('excel')}
                            className="w-full px-3 py-2 text-left text-[11px] text-slate-200 hover:bg-slate-800 flex items-center gap-2 disabled:opacity-60"
                          >
                            <FileSpreadsheet className="h-3 w-3" /> Excel
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="px-4 sm:px-6 py-2">
                    <KPIAlertsSystem
                      kpis={allKpis.map((k) => ({
                        label: k.label,
                        value: k.value,
                        delta: k.delta,
                        tone: k.tone,
                        trend: k.trend,
                        icon: k.icon,
                      }))}
                      onAlert={(alert) => {
                        log.info('Alerte KPI', {
                          kpiId: alert.kpiId,
                          kpiLabel: alert.kpiLabel,
                          message: alert.message,
                          severity: alert.severity,
                          timestamp: alert.timestamp?.toISOString?.(),
                        });
                      }}
                    />
                  </div>
                </div>
                <div className="flex-1 min-h-0 overflow-auto animate-fadeIn pb-20 md:pb-0">
                  <DashboardAccueil3P kpis={allKpis} />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 min-h-0 min-w-0 flex overflow-hidden">
              <DashboardSubSidebar />
              <div className="flex-1 min-h-0 min-w-0 flex flex-col overflow-hidden">
                <div className="shrink-0 border-b border-slate-800/60 bg-slate-950/50">
                  <DashboardSubNavigation stats={stats} mainTabsOnly />
                  <div className={cn('border-b border-slate-800/60 bg-slate-950/40')}>
                    <button
                      type="button"
                      onClick={toggleKpiStrip}
                      className={cn(
                        'w-full px-4 sm:px-6 py-2.5 flex items-center justify-between gap-2 text-left text-sm font-medium text-slate-300 hover:bg-slate-800/50 transition-colors',
                        'focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500/50'
                      )}
                      aria-expanded={!kpiStripCollapsed}
                      aria-controls="dashboard-kpi-strip-other"
                      id="dashboard-kpi-strip-toggle-other"
                    >
                      <span className="text-[10px] uppercase tracking-wider text-slate-400">Indicateurs clés</span>
                      <ChevronDown className={cn('h-4 w-4 shrink-0 text-slate-500 transition-transform duration-200', kpiStripCollapsed && '-rotate-90')} aria-hidden />
                    </button>
                    {!kpiStripCollapsed && (
                      <div id="dashboard-kpi-strip-other" className={cn('px-4 sm:px-6 pb-3 pt-0')} role="region" aria-labelledby="dashboard-kpi-strip-toggle-other">
                        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-dashboard min-w-0" role="list" style={{ scrollbarGutter: 'stable' }}>
                          {topKpis.slice(0, 6).map((kpi) => (
                            <KPICardPro key={kpi.label} kpi={kpi} onClick={() => handleKPIClick(kpi)} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="px-4 sm:px-6 py-2 flex items-center justify-between gap-3 border-b border-slate-800/60 bg-slate-950/30">
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <span>Dernière MAJ : {formatTimeAgo(lastUpdate)}</span>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            onClick={() => refreshAllKPIs()}
                            disabled={isRefreshing}
                            className="p-1.5 rounded-lg hover:bg-slate-800/60 text-slate-400 hover:text-slate-200 disabled:opacity-50"
                            aria-label="Rafraîchir"
                          >
                            <RefreshCw className={cn('h-3.5 w-3.5', isRefreshing && 'animate-spin')} />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>Rafraîchir (Ctrl+R)</TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="relative" ref={exportMenuRef}>
                      <button
                        type="button"
                        onClick={() => setShowExportMenu((v) => !v)}
                        disabled={!!exportingFormat}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-700/60 bg-slate-800/40 text-[11px] text-slate-300 hover:bg-slate-700/50 disabled:opacity-50"
                        aria-label="Exporter"
                        aria-expanded={showExportMenu}
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>Exporter</span>
                      </button>
                      {showExportMenu && (
                        <div className="absolute right-0 top-full mt-1 w-44 z-50 rounded-lg border border-slate-700/70 bg-slate-900 shadow-xl overflow-hidden">
                          <button
                            type="button"
                            disabled={!!exportingFormat}
                            onClick={() => handleExportDirect('pdf')}
                            className="w-full px-3 py-2 text-left text-[11px] text-slate-200 hover:bg-slate-800 flex items-center gap-2 disabled:opacity-60"
                          >
                            <FileText className="h-3 w-3" /> PDF
                          </button>
                          <button
                            type="button"
                            disabled={!!exportingFormat}
                            onClick={() => handleExportDirect('excel')}
                            className="w-full px-3 py-2 text-left text-[11px] text-slate-200 hover:bg-slate-800 flex items-center gap-2 disabled:opacity-60"
                          >
                            <FileSpreadsheet className="h-3 w-3" /> Excel
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="px-4 sm:px-6 py-2">
                    <KPIAlertsSystem
                      kpis={allKpis.map((k) => ({
                        label: k.label,
                        value: k.value,
                        delta: k.delta,
                        tone: k.tone,
                        trend: k.trend,
                        icon: k.icon,
                      }))}
                      onAlert={(alert) => {
                        log.info('Alerte KPI', {
                          kpiId: alert.kpiId,
                          kpiLabel: alert.kpiLabel,
                          message: alert.message,
                          severity: alert.severity,
                          timestamp: alert.timestamp?.toISOString?.(),
                        });
                      }}
                    />
                  </div>
                </div>
                <div className="flex-1 min-h-0 overflow-auto pb-20 md:pb-0">
                  <ErrorBoundary>
                    <div key={`${mainCategory}-${subCategory}-${subSubCategory}`} className="animate-fadeIn p-4 sm:p-6">
                      <Suspense fallback={<ContentLoadingSkeleton showCharts={true} showTable={false} kpiCount={6} />}>
                        <DashboardViewRouter />
                      </Suspense>
                    </div>
                  </ErrorBoundary>
                </div>
              </div>
            </div>
          )}
        </DashboardCleanLayout>
        <DashboardModals />
        <DashboardBottomNav />
      </>
    );
  }

  return (
    <>
      <Suspense fallback={null}>
        <DashboardUrlSync />
      </Suspense>
      <DashboardCommandPalette kpis={allKpis} />

      <div className="h-full w-full max-w-full min-w-0 flex min-h-0 overflow-x-hidden bg-slate-950">
        <DashboardSidebar
          collapsed={sidebarCollapsed}
          stats={stats}
          onToggleCollapse={toggleSidebar}
          onOpenCommandPalette={toggleCommandPalette}
        />

        {/* MAIN — embedded pour éviter doublon main#main-content (déjà dans BmoLayoutShell) */}
        <DashboardShell
          embedded
          header={
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1 flex items-center gap-3">
                <DashboardBreadcrumbs className="text-xs" />
                <div className="h-4 w-px bg-slate-800/60" />
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[10px] uppercase tracking-wider text-slate-500 font-medium whitespace-nowrap">Maître d'ouvrage</span>
                  <h1 className="text-xs font-medium text-slate-400 truncate">{pageTitle}</h1>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => refreshAllKPIs()}
                      disabled={isRefreshing}
                      className={cn(
                        'inline-flex items-center gap-2 rounded-lg border min-h-[36px] px-3 py-2',
                        'border-slate-800/70 bg-slate-900/40 text-xs text-slate-200',
                        'hover:bg-slate-800/50 hover:border-slate-700/60 transition-colors duration-200',
                        'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
                        'disabled:opacity-60 disabled:cursor-not-allowed'
                      )}
                      aria-label="Rafraîchir tous les KPIs"
                    >
                      <RefreshCw className={cn('h-3.5 w-3.5 flex-shrink-0', isRefreshing && 'animate-spin')} />
                      <span className="hidden sm:inline">{isRefreshing ? 'Actualisation…' : 'Rafraîchir tout'}</span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Rafraîchir tous les KPIs et la vue actuelle (Ctrl+R)</p>
                  </TooltipContent>
                </Tooltip>
                <button
                  type="button"
                  disabled={!!exportingFormat}
                  onClick={() => handleExportDirect('pdf')}
                  className={cn(
                    'inline-flex items-center gap-2 rounded-lg border min-h-[36px] px-3 py-2',
                    'border-slate-800/70 bg-slate-900/40 text-xs text-slate-200',
                    'hover:bg-slate-800/50 hover:border-slate-700/60 transition-colors duration-200',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
                    'disabled:opacity-60 disabled:cursor-not-allowed'
                  )}
                  title="Exporter la page en PDF"
                >
                  <Download className="h-3.5 w-3.5 text-slate-300 flex-shrink-0" />
                  <span className="hidden sm:inline">Exporter PDF</span>
                </button>

                <Link
                  href="/maitre-ouvrage/analytics"
                  className={cn(
                    'inline-flex items-center gap-2 rounded-lg border min-h-[36px] px-3 py-2',
                    'border-slate-800/70 bg-slate-900/40 text-xs text-slate-200',
                    'hover:bg-slate-800/50 hover:border-slate-700/60 transition-colors duration-200',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950'
                  )}
                  title="Analytics intégrés (BI)"
                >
                  <BarChart3 className="h-3.5 w-3.5 text-slate-300 flex-shrink-0" />
                  <span className="hidden sm:inline">Analytics</span>
                </Link>

                <button
                  type="button"
                  className={cn(
                    'inline-flex items-center gap-2 rounded-lg border min-h-[36px] px-3 py-2',
                    'border-slate-800/70 bg-slate-900/40 text-xs text-slate-200',
                    'hover:bg-slate-800/50 hover:border-slate-700/60 transition-colors duration-200',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950'
                  )}
                  onClick={() => openModal('stats')}
                  title="Pilotage"
                >
                  <TrendingUp className="h-3.5 w-3.5 text-slate-300 flex-shrink-0" />
                  <span className="hidden sm:inline">Pilotage</span>
                </button>

                <button
                  type="button"
                  className={cn(
                    'inline-flex items-center gap-2 rounded-lg border min-h-[36px] px-3 py-2',
                    'border-slate-800/70 bg-slate-900/40 text-xs text-slate-200',
                    'hover:bg-slate-800/50 hover:border-slate-700/60 transition-colors duration-200',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950'
                  )}
                  onClick={() => openModal('settings')}
                  title="Paramètres"
                >
                  <Settings className="h-3.5 w-3.5 text-slate-300 flex-shrink-0" />
                  <span className="hidden sm:inline">Paramètres</span>
                </button>
              </div>
            </div>
          }
          subnav={<DashboardSubNavigation stats={stats} />}
        >

          {/* Action bar compacte — raccourcis métier + accès modules (sans titres 3P / Accès modules) */}
          <DashboardModulesBar />

          {/* KPI BAR (plus sobre, plus "produit") */}
          <div
            className={cn(
              'border-b border-slate-800/60',
              'bg-slate-950/40 backdrop-blur',
              'px-4 sm:px-6 py-3'
            )}
            role="region"
            aria-label="Indicateurs clés"
          >
            <div className="flex items-center justify-between gap-3 mb-2.5">
              <div className="flex items-center gap-2 min-w-0">
                <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <div className="text-[10px] uppercase tracking-wide text-slate-400 font-medium">
                  Indicateurs clés
                </div>
                <div className="text-[10px] text-slate-500">
                  ({topKpis.length}/{allKpis.length})
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Refresh (même comportement que « Rafraîchir tout » du header) */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => refreshAllKPIs()}
                      disabled={isRefreshing}
                      className={cn(
                        'p-2 rounded-lg border border-slate-800/70 bg-slate-900/40',
                        'hover:bg-slate-900/70 transition-colors',
                        'disabled:opacity-50 disabled:cursor-not-allowed',
                        'focus:outline-none focus:ring-2 focus:ring-blue-500/40'
                      )}
                      aria-label="Actualiser"
                    >
                      <RefreshCw className={cn('h-5 w-5', isRefreshing ? 'animate-spin text-blue-400' : 'text-slate-300')} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="space-y-1">
                      <div>Actualiser tout (Ctrl+R)</div>
                      {refreshCount > 0 && <div className="text-xs text-slate-400">{refreshCount} actualisation(s)</div>}
                      {retryCount > 0 && <div className="text-xs text-amber-300">Tentative {retryCount}/{maxRetries}</div>}
                    </div>
                  </TooltipContent>
                </Tooltip>

                {/* Export */}
                <div className="relative" ref={exportMenuRef}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => setShowExportMenu((v) => !v)}
                        className={cn(
                          'p-2 rounded-lg border border-slate-800/70 bg-slate-900/40',
                          'hover:bg-slate-900/70 transition-colors',
                          'focus:outline-none focus:ring-2 focus:ring-blue-500/40',
                          showExportMenu && 'ring-2 ring-blue-500/20'
                        )}
                        aria-label="Exporter"
                        aria-expanded={showExportMenu}
                      >
                        <Download className="h-5 w-5 text-slate-300" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Exporter</TooltipContent>
                  </Tooltip>

                  {showExportMenu && (
                    <div className="absolute right-0 top-full mt-2 w-56 z-50 rounded-xl border border-slate-800/70 bg-slate-950/95 shadow-2xl backdrop-blur-xl overflow-hidden">
                      <button
                        type="button"
                        disabled={!!exportingFormat}
                        onClick={() => handleExportDirect('pdf')}
                        className="w-full px-3 py-2.5 text-left text-xs text-slate-200 hover:bg-slate-900/60 flex items-center gap-2 disabled:opacity-60"
                      >
                        <FileText className="h-3 w-3" />
                        Export PDF
                      </button>
                      <button
                        type="button"
                        disabled={!!exportingFormat}
                        onClick={() => handleExportDirect('excel')}
                        className="w-full px-3 py-2.5 text-left text-xs text-slate-200 hover:bg-slate-900/60 flex items-center gap-2 disabled:opacity-60"
                      >
                        <FileSpreadsheet className="h-3 w-3" />
                        Export Excel (graphiques)
                      </button>
                      <div className="h-px bg-slate-800/70" />
                      <button
                        type="button"
                        onClick={() => {
                          openModal('export');
                          setShowExportMenu(false);
                        }}
                        className="w-full px-3 py-2.5 text-left text-xs text-slate-200 hover:bg-slate-900/60 flex items-center gap-2"
                      >
                        <FileText className="h-3 w-3" />
                        Export CSV
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          openModal('export');
                          setShowExportMenu(false);
                        }}
                        className="w-full px-3 py-2.5 text-left text-xs text-slate-200 hover:bg-slate-900/60 flex items-center gap-2"
                      >
                        <BarChart3 className="h-3 w-3" />
                        Export JSON
                      </button>
                      <div className="h-px bg-slate-800/70" />
                      <button
                        type="button"
                        onClick={() => {
                          openModal('share');
                          setShowExportMenu(false);
                        }}
                        className="w-full px-3 py-2.5 text-left text-xs text-slate-200 hover:bg-slate-900/60 flex items-center gap-2"
                      >
                        <Activity className="h-3 w-3" />
                        Partager (lien 7 jours)
                      </button>
                      <div className="h-px bg-slate-800/70" />
                      <button
                        type="button"
                        onClick={() => {
                          openModal('stats');
                          setShowExportMenu(false);
                        }}
                        className="w-full px-3 py-2.5 text-left text-xs text-slate-200 hover:bg-slate-900/60 flex items-center gap-2"
                      >
                        <BarChart3 className="h-3 w-3" />
                        Statistiques
                      </button>
                    </div>
                  )}
                </div>

                <div className="text-[11px] text-slate-500 flex items-center gap-2">
                  <span>Mise à jour : {formatTimeAgo(lastUpdate)}</span>
                  {isRefreshing && (
                    <span className="inline-flex items-center gap-1 text-blue-400">
                      <Zap className="h-5 w-5" />
                      sync…
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* KPI strip : horizontal scroll (très "produit") */}
            {topKpis.length === 0 ? (
              <div className="py-10 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-900/50 border border-slate-800/70 mb-3">
                  <Info className="h-5 w-5 text-slate-500" />
                </div>
                <div className="text-sm text-slate-300">Aucun indicateur trouvé</div>
                <div className="text-xs text-slate-500 mt-1">Affiner la recherche ou effacer le filtre.</div>
              </div>
            ) : (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-dashboard">
                {topKpis.map((kpi) => (
                  <KPICardPro key={kpi.label} kpi={kpi} onClick={() => handleKPIClick(kpi)} />
                ))}
              </div>
            )}

            {/* Système d'alertes KPI — visible sur tous les breakpoints */}
            <div className="mt-3">
              <KPIAlertsSystem
                kpis={allKpis.map((k) => ({
                  label: k.label,
                  value: k.value,
                  delta: k.delta,
                  tone: k.tone,
                  trend: k.trend,
                  icon: k.icon,
                }))}
                onAlert={(alert) => {
                  // tu peux brancher ton système de notif ici
                  log.info('Alerte KPI', {
                    kpiId: alert.kpiId,
                    kpiLabel: alert.kpiLabel,
                    message: alert.message,
                    severity: alert.severity,
                    timestamp: alert.timestamp.toISOString(),
                  });
                }}
              />
            </div>
          </div>

          {/* CONTENT */}
          <ErrorBoundary>
            <div key={`${mainCategory}-${subCategory}-${subSubCategory}`} className="animate-fadeIn">
              <Suspense fallback={<ContentLoadingSkeleton showCharts={true} showTable={false} kpiCount={6} />}>
                <DashboardViewRouter />
              </Suspense>
            </div>
          </ErrorBoundary>
        </DashboardShell>
      </div>

      <DashboardModals />
    </>
  );
}

/* =========================
   KPI Card PRO (horizontal tile)
========================= */

const KPICardPro = memo(function KPICardPro({
  kpi,
  onClick,
}: {
  kpi: KPIData;
  onClick?: () => void;
}) {
  const Icon = kpi.icon;

  const toneClasses =
    kpi.tone === 'ok'
      ? 'border-emerald-500/20 bg-emerald-500/5 hover:border-emerald-500/35'
      : kpi.tone === 'warn'
      ? 'border-amber-500/20 bg-amber-500/5 hover:border-amber-500/35'
      : kpi.tone === 'crit'
      ? 'border-red-500/20 bg-red-500/5 hover:border-red-500/35'
      : 'border-slate-500/20 bg-slate-500/5 hover:border-slate-500/35';

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={onClick}
          title={kpi.label}
          className={cn(
            'flex-shrink-0 min-w-[200px] w-[200px] sm:min-w-[220px] sm:w-[220px] rounded-2xl border',
            'px-4 py-3 text-left',
            'transition-all duration-200 ease-out',
            'hover:translate-y-[-2px] hover:shadow-xl hover:shadow-black/20',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
            toneClasses
          )}
          aria-label={`${kpi.label}: ${kpi.value} (${kpi.delta})`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1 overflow-hidden">
              <div className="text-[11px] text-slate-400 uppercase tracking-wide break-words line-clamp-2 leading-tight" style={{ wordBreak: 'break-word' }}>
                {kpi.label}
              </div>
              <div className="text-xl font-semibold text-slate-100 mt-0.5 leading-tight tabular-nums">{String(kpi.value)}</div>
              <div className="text-xs text-slate-400 mt-1.5 flex items-center gap-1">
                <Activity className="h-4 w-4 text-slate-500 flex-shrink-0" aria-hidden />
                <span>{kpi.delta}</span>
              </div>
            </div>
            <div className="h-9 w-9 flex-shrink-0 rounded-xl bg-slate-900/40 border border-slate-800/70 flex items-center justify-center">
              <Icon className="h-4 w-4 text-slate-200" aria-hidden />
            </div>
          </div>
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-[280px]">
        <div className="text-xs">
          <div className="font-semibold text-slate-100">{kpi.label}</div>
          <div className="text-slate-300 mt-0.5">Valeur : {String(kpi.value)}</div>
          <div className="text-slate-400">Variation : {kpi.delta}</div>
          <p className="text-blue-300 mt-2 text-[11px]">Cliquer pour détails</p>
        </div>
      </TooltipContent>
    </Tooltip>
  );
});

KPICardPro.displayName = 'KPICardPro';

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return "à l'instant";
  const m = Math.floor(diff / 60);
  if (m < 60) return `il y a ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `il y a ${h}h`;
  const d = Math.floor(h / 24);
  return `il y a ${d}j`;
}
