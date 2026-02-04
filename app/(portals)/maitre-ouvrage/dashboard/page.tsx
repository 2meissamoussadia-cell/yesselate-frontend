/* -----------------------------------------------------------------------
   FILE: app/maitre-ouvrage/dashboard/page.tsx
   VERSION: 6.0 - SHELL + UI PLUS "LOGICIEL MÉTIER"
------------------------------------------------------------------------ */

'use client';

import React, { Suspense, useMemo, memo, useCallback, useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
  Building2,
  Settings,
  FileSpreadsheet,
  MoreVertical,
  ArrowLeft,
  Wallet,
} from 'lucide-react';

import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import { DashboardErrorBoundary } from '@/modules/dashboard/components/shared/DashboardErrorBoundary';

import { useDashboardCommandCenterStore } from '@/lib/stores/dashboardCommandCenterStore';
import { useTickerCardsSettingsStore } from '@/lib/stores/tickerCardsSettingsStore';
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
  DashboardHome,
  PilotageHome,
  TickerBar,
  DashboardBottomNav,
  type KpiForStrip,
} from '@/modules/dashboard';
import { getSectionFocusForLeaf } from '@/modules/dashboard/navigation/leafToSectionMap';
import { DashboardShell } from '@/modules/dashboard/components/shared/DashboardShell';

import { DashboardModals } from '@/components/features/bmo/dashboard/command-center/DashboardModals';
import { DashboardCommandPalette } from '@/components/features/bmo/dashboard/command-center/DashboardCommandPalette';
import { getKPIMappingByLabel } from '@/lib/mappings/dashboardKPIMapping';
import { useDashboardKPIs } from '@/lib/hooks/useDashboardKPIs';
import {
  getKpisForPerimetre,
  DATE_FILTER_OPTIONS,
  CHANTIERS_FILTER_MOCK,
  EQUIPES_FILTER_MOCK,
  type DateFilterId,
} from '@/modules/dashboard/data/dashboardCockpitMock';
import { useDashboardExport } from '@/modules/dashboard/hooks/useDashboardExport';
import { useDashboardLive } from '@/modules/dashboard/hooks/useDashboardLive';
import { LiveStatusBadge } from '@/modules/dashboard/components/cockpit/LiveStatusBadge';
import { KPIAlertsSystem } from '@/components/features/bmo/dashboard/command-center/KPIAlertsSystem';
import { useLogger } from '@/lib/utils/logger';
import { clearCache } from '@/modules/dashboard/api/client';
import { RisquesCritiquesModal } from '@/modules/dashboard/components/modals/RisquesCritiquesModal';

/** Section sidebar (bleu) → actions (rouge). La bande rouge n’apparaît que si une section bleue avec actions est sélectionnée. */
const ACTIONS_BY_SECTION: Record<
  string,
  Array<{ id: string; label: string; href: string; icon: React.ComponentType<{ className?: string }>; tone: string }>
> = {
  'tresorerie-synthese': [
    { id: 'budget', label: 'Budget', href: '/maitre-ouvrage/dashboard/r/finance/budget/default', icon: Wallet, tone: 'emerald' },
    { id: 'previsionnel', label: 'Prévisionnel', href: '/maitre-ouvrage/engagements', icon: TrendingUp, tone: 'sky' },
  ],
};

/* =========================
   Loading
========================= */

function DashboardSkeleton() {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center gap-6 bg-white dark:bg-slate-950 p-8" role="status" aria-label="Chargement du dashboard">
      <Loader2 className="h-10 w-10 animate-spin text-blue-500 dark:text-blue-400" aria-hidden />
      <div className="space-y-3 w-full max-w-md">
        <div className="h-6 w-48 rounded-lg bg-slate-200 dark:bg-slate-700 animate-pulse mx-auto" />
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 rounded-xl bg-slate-100 dark:bg-slate-800/50 animate-pulse" />
          ))}
        </div>
      </div>
      <span className="sr-only">Chargement du dashboard en cours</span>
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

/** Audit §9 : éviter d'afficher NaN / undefined dans les KPI. */
function sanitizeKpiValue(v: unknown): string | number {
  if (v === null || v === undefined) return '—';
  if (typeof v === 'number' && Number.isNaN(v)) return '—';
  return typeof v === 'number' ? v : String(v);
}
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
  const router = useRouter();

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
  const [perimetreFilter, setPerimetreFilter] = useState<'nice-renovation' | 'tous'>('nice-renovation');
  const [dateFilter, setDateFilter] = useState<DateFilterId>('annee');
  const [chantierFilter, setChantierFilter] = useState<string>('tous');
  const [equipeFilter, setEquipeFilter] = useState<string>('toutes');
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

  const [risquesModalOpen, setRisquesModalOpen] = useState(false);

  const handleKPIClick = useCallback(
    (kpi: KPIData) => {
      if (kpi.label === 'Risques critiques') {
        setRisquesModalOpen(true);
        return;
      }
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
  const { isConnected: wsConnected } = useDashboardLive({ enabled: true });

  const allKpis = useMemo<KPIData[]>(() => {
    if (apiKpis && apiKpis.length > 0) {
      return apiKpis.map((kpi) => {
        const mapping = getKPIMappingByLabel(kpi.label);
        return {
          label: kpi.label,
          value: sanitizeKpiValue(kpi.value),
          delta: sanitizeKpiValue(kpi.delta) as string,
          tone: kpi.tone,
          trend: kpi.trend,
          icon: mapping?.display.icon || kpi.icon || Activity,
        };
      });
    }
    // fallback mock : KPIs par périmètre (à remplacer par API)
    const mockKpis = getKpisForPerimetre(perimetreFilter);
    const iconByLabel: Record<string, React.ComponentType<{ className?: string }>> = {
      'Chantiers en cours': Building2,
      Demandes: FileText,
      Validations: CheckCircle2,
      Blocages: AlertTriangle,
      'Risques critiques': AlertCircle,
      'Budget consommé': DollarSign,
      'Décisions en attente': Clock,
      'Temps réponse': Activity,
      'Conformité SLA': TrendingUp,
    };
    return mockKpis.map((kpi) => {
      const mapping = getKPIMappingByLabel(kpi.label);
      return {
        label: kpi.label,
        value: sanitizeKpiValue(kpi.value),
        delta: sanitizeKpiValue(kpi.delta) as string,
        tone: kpi.tone,
        trend: kpi.trend,
        icon: mapping?.display.icon || iconByLabel[kpi.label] || Activity,
      };
    });
  }, [apiKpis, perimetreFilter]);

  useEffect(() => {
    if (apiLastUpdate) setLastUpdate(new Date(apiLastUpdate));
  }, [apiLastUpdate]);

  const topKpis = allKpis;

  const veilleBadges = useMemo(() => {
    const badges: Record<string, number> = {};
    for (const kpi of allKpis) {
      const v = typeof kpi.value === 'number' ? kpi.value : parseInt(String(kpi.value), 10);
      if (Number.isNaN(v)) continue;
      if (kpi.label === 'Blocages' || kpi.label?.includes('Blocages')) badges.alertes = v;
      if (kpi.label === 'Décisions en attente' || kpi.label?.includes('Décisions')) badges.decisions = v;
    }
    return badges;
  }, [allKpis]);

  const enabledTickerLabels = useTickerCardsSettingsStore((s) => s.enabledLabels);
  const tickerItems = useMemo(() => {
    let source = allKpis;
    if (enabledTickerLabels.length > 0) {
      const set = new Set(enabledTickerLabels);
      source = allKpis.filter((k) => set.has(k.label));
    }
    const crit: typeof allKpis = [];
    const warn: typeof allKpis = [];
    const rest: typeof allKpis = [];
    for (const k of source.slice(0, 12)) {
      if (k.tone === 'crit') crit.push(k);
      else if (k.tone === 'warn') warn.push(k);
      else rest.push(k);
    }
    const ordered = [...crit, ...warn, ...rest];
    return ordered.map((k) => ({
      label: k.label,
      value: k.value,
      delta: k.delta,
      tone: k.tone as 'ok' | 'warn' | 'crit' | 'info' | undefined,
      trend: k.trend,
      icon: k.icon,
    }));
  }, [allKpis, enabledTickerLabels]);

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
      const toastId = retryAttempt === 0 ? toast.loading('Actualisation en cours…') : undefined;
      try {
        clearCache();
        invalidateAllViews();
        await refetchKPIsFromAPI?.();
        if (toastId) toast.dismiss(toastId);
        if (retryAttempt > 0) setRetryCount(0);
        setLastUpdate(new Date());
        setRefreshCount((p) => p + 1);
        toast.success('Données rafraîchies');
      } catch (e) {
        if (toastId) toast.dismiss(toastId);
        if (retryAttempt < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, retryAttempt), 8000);
          setRetryCount(retryAttempt + 1);
          setTimeout(() => refreshAllKPIsRef.current?.(retryAttempt + 1), delay);
          return;
        }
        setRetryCount(0);
        const msg = e instanceof Error ? e.message : 'Impossible de rafraîchir les données';
        toast.error('Erreur', { description: msg });
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
        toast.success('Export réussi', {
          description: format === 'excel' ? 'Fichier Excel téléchargé' : 'Fichier PDF téléchargé',
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Erreur lors de l\'export';
        toast.error('Erreur export', { description: msg });
      } finally {
        setExportingFormat(null);
      }
    },
    [exportData]
  );

  // Spec Dashboard ERP BTP : Header recherche (⌘K) ouvre la palette de commandes
  useEffect(() => {
    const onOpen = () => toggleCommandPalette();
    document.addEventListener('bmo-open-command-palette', onOpen);
    return () => document.removeEventListener('bmo-open-command-palette', onOpen);
  }, [toggleCommandPalette]);

  // keyboard shortcuts (⌘K palette, ⌘R refresh, ? aide, Escape ferme export)
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
      if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        openModal('shortcuts');
      }
      if (e.key === 'Escape') {
        setShowExportMenu(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [toggleCommandPalette, refreshAllKPIs, openModal]);

  // page title (simple mais efficace)
  const pageTitle = useMemo(() => {
    const parts = [mainCategory, subCategory, subSubCategory].filter(Boolean);
    return parts.length ? parts.join(' • ') : "Vue d'ensemble";
  }, [mainCategory, subCategory, subSubCategory]);

  const pathname = usePathname();
  // Vue d'accueil Dashboard (fusion Cockpit DG) = uniquement quand pilotage + dashboard (pas alertes/gouvernance/calendrier/analytics).
  // Ne pas utiliser pathname seul : sur /maitre-ouvrage/dashboard le contenu doit changer selon la sub (subsidebar).
  const isCockpitHome =
    (mainCategory === 'pilotage' && subCategory === 'dashboard') ||
    ((mainCategory as string) === 'overview' && (subCategory === 'summary' || !subCategory));
  const dashboardSectionFocus = useMemo(
    () => (isCockpitHome ? getSectionFocusForLeaf(subSubCategory) : undefined),
    [isCockpitHome, subSubCategory]
  );
  const hasSectionSelected = Boolean(dashboardSectionFocus);
  const usePilotageHome = isCockpitHome && !hasSectionSelected && subSubCategory !== 'cockpit-detail';
  /** Section sélectionnée dans la sidebar (bleu) → détermine si et quoi afficher dans la bande d’actions (rouge). */
  const selectedSection: string | null = usePilotageHome ? 'tresorerie-synthese' : null;
  const sectionActions = selectedSection != null ? ACTIONS_BY_SECTION[selectedSection] ?? [] : [];
  const showActionsStrip = sectionActions.length > 0;
  const useCleanLayout = true; // Refonte UX — layout Procore / SAP Fiori

  if (useCleanLayout) {
    return (
      <DashboardErrorBoundary>
        <>
        <Suspense fallback={null}>
          <DashboardUrlSync />
        </Suspense>
        <DashboardCommandPalette kpis={allKpis} />
        <DashboardCleanLayout lastUpdate={formatTimeAgo(lastUpdate)} hideHeader>
          {/* BmoSidebar (principal) + SubSidebar (dashboard) + colonne SubNav / KPI / toolbar / contenu */}
          <div className="flex-1 min-h-0 min-w-0 flex overflow-hidden" role="region" aria-labelledby="dashboard-page-title">
            <h1 id="dashboard-page-title" className="sr-only">{pageTitle}</h1>
            <DashboardSubSidebar />
            <div className="flex-1 min-h-0 min-w-0 flex flex-col overflow-hidden">
              {/* Topbar : masquée en vue focalisée pour laisser la place à la barre d'outil de la page */}
              {!hasSectionSelected && (
              <div className="shrink-0 border-b border-slate-200 bg-white/80 dark:border-slate-800/60 dark:bg-slate-950/50">
                <DashboardSubNavigation stats={stats} mainTabsOnly />
              </div>
              )}
              {/* Toolbar : masquée en vue focalisée (la page focus a sa propre barre) */}
              {!hasSectionSelected && (
              <div className="px-4 sm:px-6 py-2 flex items-center justify-end gap-2 sm:gap-3 border-b border-slate-200 bg-gray-50/80 dark:border-slate-800/60 dark:bg-slate-950/30">
                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
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
                  <div className="h-4 w-px bg-slate-300 dark:bg-slate-700/60" aria-hidden />
                </div>
                  <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          className="p-2 rounded-lg border border-slate-300 bg-slate-100 text-slate-600 hover:bg-slate-200 dark:border-slate-700/60 dark:bg-slate-800/40 dark:text-slate-400 dark:hover:bg-slate-700/50 dark:hover:text-slate-200 transition-colors"
                          aria-label="Filtres et actions"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>Filtres, Rafraîchir, Exporter</TooltipContent>
                    </Tooltip>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-72 border-slate-200 bg-white text-slate-800 dark:border-slate-800 dark:bg-slate-900/95 dark:text-slate-100">
                    <div className="px-2 py-3 space-y-3" onClick={(e) => e.stopPropagation()}>
                      <p className="text-[10px] text-slate-400">Dernière MAJ : {formatTimeAgo(lastUpdate)}</p>
                      <div>
                        <label htmlFor="dropdown-perimetre" className="block text-[11px] text-slate-400 mb-1">Périmètre</label>
                        <select
                          id="dropdown-perimetre"
                          value={perimetreFilter}
                          onChange={(e) => setPerimetreFilter(e.target.value as 'nice-renovation' | 'tous')}
                          className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-[11px] text-slate-800 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500/50 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200"
                        >
                          <option value="nice-renovation">NICE RÉNOVATION</option>
                          <option value="tous">Tous les périmètres</option>
                        </select>
                      </div>
                      {!isCockpitHome && (
                        <>
                          <div>
                            <label htmlFor="dropdown-date" className="block text-[11px] text-slate-400 mb-1">Période</label>
                            <select
                              id="dropdown-date"
                              value={dateFilter}
                              onChange={(e) => setDateFilter(e.target.value as DateFilterId)}
                              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-[11px] text-slate-800 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500/50 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200"
                            >
                              {DATE_FILTER_OPTIONS.map((o) => (
                                <option key={o.id} value={o.id}>{o.label}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label htmlFor="dropdown-chantier" className="block text-[11px] text-slate-400 mb-1">Chantier</label>
                            <select
                              id="dropdown-chantier"
                              value={chantierFilter}
                              onChange={(e) => setChantierFilter(e.target.value)}
                              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-[11px] text-slate-800 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500/50 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200"
                            >
                              {CHANTIERS_FILTER_MOCK.map((o) => (
                                <option key={o.id} value={o.id}>{o.label}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label htmlFor="dropdown-equipe" className="block text-[11px] text-slate-400 mb-1">Équipe</label>
                            <select
                              id="dropdown-equipe"
                              value={equipeFilter}
                              onChange={(e) => setEquipeFilter(e.target.value)}
                              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-[11px] text-slate-800 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500/50 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200"
                            >
                              {EQUIPES_FILTER_MOCK.map((o) => (
                                <option key={o.id} value={o.id}>{o.label}</option>
                              ))}
                            </select>
                          </div>
                        </>
                      )}
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => router.push('/maitre-ouvrage/parametres')}
                      className="text-[11px] cursor-pointer"
                    >
                      <Settings className="h-3.5 w-3.5 mr-2" />
                      Paramètres BMO (cartes à défiler)
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => refreshAllKPIs()}
                      disabled={isRefreshing}
                      className="text-[11px] cursor-pointer"
                    >
                      <RefreshCw className={cn('h-3.5 w-3.5 mr-2', isRefreshing && 'animate-spin')} />
                      Rafraîchir
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => { handleExportDirect('pdf'); }}
                      disabled={!!exportingFormat}
                      className="text-[11px] cursor-pointer"
                    >
                      <FileText className="h-3.5 w-3.5 mr-2" />
                      Exporter en PDF
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => { handleExportDirect('excel'); }}
                      disabled={!!exportingFormat}
                      className="text-[11px] cursor-pointer"
                    >
                      <FileSpreadsheet className="h-3.5 w-3.5 mr-2" />
                      Exporter en Excel
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              )}
              <div className="flex-1 min-h-0 overflow-auto animate-fadeIn pb-24" data-testid="dashboard-content">
              {isCockpitHome ? (
                usePilotageHome ? (
                  <div className="flex h-full min-h-0 w-full">
                    {/* Bande rouge : visible uniquement si une section bleue (sidebar) avec actions est sélectionnée ; contenu dynamique selon la section. */}
                    {showActionsStrip && (
                      <aside
                        className={cn(
                          'shrink-0 flex flex-col gap-3 py-4 px-3 border-r border-slate-200 dark:border-slate-800/60',
                          'bg-slate-50/80 dark:bg-slate-950/40 w-[72px] sm:w-20'
                        )}
                        aria-label="Actions selon la section sélectionnée"
                      >
                        {sectionActions.map((action) => {
                          const Icon = action.icon;
                          const toneClasses =
                            action.tone === 'emerald'
                              ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200 hover:bg-emerald-500/20 hover:border-emerald-500/60 focus-visible:ring-emerald-500/50'
                              : 'border-sky-500/40 bg-sky-500/10 text-sky-800 dark:text-sky-200 hover:bg-sky-500/20 hover:border-sky-500/60 focus-visible:ring-sky-500/50';
                          return (
                            <Link
                              key={action.id}
                              href={action.href}
                              className={cn(
                                'flex flex-col items-center gap-1.5 p-2.5 rounded-xl border transition-all duration-200',
                                'focus:outline-none focus-visible:ring-2',
                                toneClasses
                              )}
                              aria-label={action.label}
                              title={action.label}
                            >
                              <Icon className="h-5 w-5 shrink-0" aria-hidden />
                              <span className="text-[10px] font-semibold leading-tight">{action.label}</span>
                            </Link>
                          );
                        })}
                      </aside>
                    )}
                    <div className="flex-1 min-h-0 overflow-auto animate-fadeIn">
                      <PilotageHome
                        veilleBadges={veilleBadges}
                        kpis={
                          topKpis
                            .filter((k) => k.label !== 'Blocages' && k.label !== 'Décisions en attente')
                            .slice(0, 6) as KpiForStrip[]
                        }
                        onKpiClick={(kpi) => handleKPIClick(kpi as KPIData)}
                        onSearchClick={toggleCommandPalette}
                      />
                    </div>
                  </div>
                ) : (
                  <DashboardHome kpis={allKpis} perimetreFilter={perimetreFilter} sectionFocus={dashboardSectionFocus} />
                )
              ) : (
                <ErrorBoundary>
                  <div key={`${mainCategory}-${subCategory}-${subSubCategory}`} className="p-4 sm:p-6">
                    <Suspense fallback={<ContentLoadingSkeleton showCharts={true} showTable={false} kpiCount={6} />}>
                      <DashboardViewRouter />
                    </Suspense>
                  </div>
                </ErrorBoundary>
              )}
            </div>
            </div>
          </div>
        </DashboardCleanLayout>
        {isCockpitHome && tickerItems.length > 0 && (
          <TickerBar
            items={tickerItems}
            intervalMs={5500}
            onClick={(item) => {
              const kpi = allKpis.find((k) => k.label === item.label);
              if (kpi) handleKPIClick(kpi);
            }}
          />
        )}
        <DashboardModals />
        <RisquesCritiquesModal open={risquesModalOpen} onClose={() => setRisquesModalOpen(false)} />
        </>
      </DashboardErrorBoundary>
    );
  }

  return (
    <DashboardErrorBoundary>
      <Suspense fallback={null}>
        <DashboardUrlSync />
      </Suspense>
      <DashboardCommandPalette kpis={allKpis} />

      {/* Layout type Outlook : [Dossiers | Liste | Détail] — 3 panneaux fixes */}
      <div
        className="h-full w-full max-w-full min-w-0 flex min-h-0 overflow-x-hidden bg-slate-950"
        role="application"
        aria-label="Dashboard Maître d'ouvrage (layout Outlook)"
      >
        {/* Panneau 1 — Dossiers (catégories principales, style Outlook) */}
        <DashboardSidebar
          collapsed={sidebarCollapsed}
          stats={stats}
          onToggleCollapse={toggleSidebar}
          onOpenCommandPalette={toggleCommandPalette}
        />

        {/* Panneau 2 — Liste (sous-catégories / vues, style Outlook) */}
        <div
          className="shrink-0 flex flex-col border-r border-slate-800/70 bg-slate-900/80 min-h-0 min-w-0 overflow-hidden"
          role="navigation"
          aria-label="Liste des vues"
        >
          <DashboardSubSidebar alwaysExpanded />
        </div>

        {/* Panneau 3 — Détail (contenu principal / reading pane) */}
        <div className="flex-1 min-w-0 flex flex-col min-h-0">
          <DashboardShell
          embedded
          hasMobileBottomNav
          header={
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1 flex items-center gap-3">
                <DashboardBreadcrumbs className="text-xs" />
                <div className="h-4 w-px bg-slate-800/60" />
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium whitespace-nowrap">Maître d'ouvrage</span>
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

                <div className="text-[11px] text-slate-400 flex items-center gap-2 flex-wrap">
                  <LiveStatusBadge isLive={wsConnected} lastUpdatedAt={lastUpdate.getTime()} compact />
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
                  <Info className="h-5 w-5 text-slate-400" />
                </div>
                <div className="text-sm text-slate-300">Aucun indicateur trouvé</div>
                <div className="text-xs text-slate-400 mt-1">Affiner la recherche ou effacer le filtre.</div>
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
      </div>

      <DashboardModals />
      <DashboardBottomNav />
      <RisquesCritiquesModal open={risquesModalOpen} onClose={() => setRisquesModalOpen(false)} />
    </DashboardErrorBoundary>
  );
}

/* =========================
   KPI Card PRO (horizontal tile)
========================= */

/** Tailles audit : XL = KPIs critiques, L = importants, M = secondaires, S = détails */
const kpiCardProRootSizes = {
  xl: 'min-w-[240px] w-[240px] sm:min-w-[260px] sm:w-[260px] px-5 py-4',
  lg: 'min-w-[220px] w-[220px] sm:min-w-[240px] sm:w-[240px] px-4 py-3.5',
  md: 'min-w-[200px] w-[200px] sm:min-w-[220px] sm:w-[220px] px-4 py-3',
  sm: 'min-w-[180px] w-[180px] sm:min-w-[200px] sm:w-[200px] px-3 py-2.5',
} as const;
const kpiCardProValueSizes = { xl: 'text-2xl sm:text-3xl', lg: 'text-xl sm:text-2xl', md: 'text-xl', sm: 'text-lg' } as const;
const kpiCardProIconSizes = { xl: 'h-10 w-10', lg: 'h-9 w-9', md: 'h-9 w-9', sm: 'h-8 w-8' } as const;

const KPICardPro = memo(function KPICardPro({
  kpi,
  onClick,
  size = 'md',
}: {
  kpi: KPIData;
  onClick?: () => void;
  /** XL = critique (CA, Trésorerie), L = important, M = secondaire, S = détail */
  size?: 'xl' | 'lg' | 'md' | 'sm';
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
            'flex-shrink-0 rounded-2xl border text-left',
            'transition-all duration-200 ease-out',
            'hover:translate-y-[-2px] hover:shadow-xl hover:shadow-black/20',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
            toneClasses,
            kpiCardProRootSizes[size]
          )}
          aria-label={`${kpi.label}: ${kpi.value} (${kpi.delta})`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1 overflow-hidden">
              <div className="kpi-label text-[11px] text-slate-400 uppercase tracking-wide break-words line-clamp-2 leading-tight" style={{ wordBreak: 'break-word' }}>
                {kpi.label}
              </div>
              <div className={cn('font-semibold text-slate-100 mt-0.5 leading-tight tabular-nums', kpiCardProValueSizes[size])}>{String(kpi.value)}</div>
              <div className="text-xs text-slate-400 mt-1.5 flex items-center gap-1">
                <Activity className="h-4 w-4 text-slate-400 flex-shrink-0" aria-hidden />
                <span>{kpi.delta}</span>
              </div>
            </div>
            <div className={cn('flex-shrink-0 rounded-xl bg-slate-900/40 border border-slate-800/70 flex items-center justify-center', kpiCardProIconSizes[size])}>
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
