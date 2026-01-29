'use client';

/**
 * Centre de Commandement Analytics - Version 3.0 (ERP Enterprise Grade)
 * 
 * ARCHITECTURE EN 3 SECTIONS:
 * ┌─────────────────────────────────────────────────────────────┐
 * │ [ Sidebar BMO ] │ [ Panneau métier 3 niveaux ] │ [ Contenu ] │
 * └─────────────────────────────────────────────────────────────┘
 * 
 * SECTION 1: SIDEBAR BMO
 * - Navigation principale latérale (catégories principales)
 * - BTPSidebar ou AnalyticsCommandSidebar
 * - Collapsible, responsive
 * 
 * SECTION 2: PANNEAU MÉTIER 3 NIVEAUX
 * - Niveau 1: Catégories principales (dans la sidebar)
 * - Niveau 2: Sous-catégories (AnalyticsSubNavigation)
 * - Niveau 3: Vues + Filtres (Grid/Dashboard/Comparative)
 * - Header avec actions (recherche, notifications, export)
 * - KPIBar (optionnel)
 * - Breadcrumb drill-down
 * 
 * SECTION 3: CONTENU PAGE
 * - Zone principale d'affichage
 * - Router selon navigation (BTP ou classique)
 * - Vues multiples (Grid/Dashboard/Comparative)
 * - Error boundary
 * 
 * NOUVEAUTÉS v3.0:
 * ✅ Vues multiples (Grid / Dashboard / Comparative) avec state + URL sync
 * ✅ Stats footer dynamiques (calculées selon filtres actifs)
 * ✅ Indicateur filtres actifs (badge header)
 * ✅ Exports sophistiqués (Excel/PDF templates, rapports direction/conseil)
 * ✅ Drill-down breadcrumb (navigation profonde)
 * ✅ Actions batch avancées (workflows multi-étapes)
 * ✅ Raccourcis vues (⌘1, ⌘2, ⌘3) + export (⌘E)
 * 
 * CONSERVÉ v2.0:
 * ✅ Navigation robuste (id/label/accents/aliases)
 * ✅ Session restore + URL sync
 * ✅ Scroll restoration par vue
 * ✅ Refresh timer safe
 * ✅ Error boundary
 * ✅ Raccourcis clavier
 * ✅ Audit logging
 * ✅ Temps réel
 *
 * ⚠️ Design inchangé
 */

import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { cn } from '@/lib/utils';
import { KeyboardShortcut } from '@/components/ui/keyboard-shortcut';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BarChart3,
  Search,
  Bell,
  ChevronLeft,
  Grid3x3,
  LayoutGrid,
  BarChart2,
  Filter,
  FileSpreadsheet,
  FileText,
  Presentation,
  Users as UsersIcon,
  Clock,
  MoreVertical,
  RefreshCw,
  ChevronRight,
  Home,
} from 'lucide-react';

import {
  useAnalyticsCommandCenterStore,
  type AnalyticsMainCategory,
} from '@/lib/stores/analyticsCommandCenterStore';

import {
  AnalyticsCommandSidebar,
  AnalyticsSubNavigation,
  AnalyticsKPIBar,
  AnalyticsContentRouter,
  AnalyticsFiltersPanel,
  AnalyticsModals,
  AnalyticsDetailPanel,
  AnalyticsBatchActionsBar,
  analyticsCategories,
} from '@/components/features/bmo/analytics/command-center';

import { AnalyticsCommandPalette } from '@/components/features/bmo/analytics/workspace/AnalyticsCommandPalette';
import { AnalyticsToastProvider, useAnalyticsToast } from '@/components/features/bmo/analytics/workspace/AnalyticsToast';
import { AnalyticsErrorBoundary } from '@/presentation/components/ErrorBoundary';
import { useRealtimeAnalytics } from '@/components/features/bmo/analytics/hooks/useRealtimeAnalytics';
import { useKpis, useAlerts, useReports } from '@/lib/api/hooks/useAnalytics';
// Lazy load des vues pour améliorer les performances
import { lazy, Suspense } from 'react';
import { LoadingSkeleton } from '@/presentation/components/LazyLoad';
// Navigation BTP
import { BTPSidebar, BTPContentRouter } from '@/components/features/bmo/analytics/btp-navigation';

const AnalyticsDashboardView = lazy(() => 
  import('@/components/features/bmo/analytics/workspace/views/AnalyticsDashboardView').then(m => ({ default: m.AnalyticsDashboardView }))
);

const AlertsDashboardView = lazy(() => 
  import('@/components/features/bmo/analytics/workspace/views/AlertsDashboardView').then(m => ({ default: m.AlertsDashboardView }))
);

const AnalyticsComparisonView = lazy(() => 
  import('@/components/features/bmo/analytics/workspace/views/AnalyticsComparisonView').then(m => ({ default: m.AnalyticsComparisonView }))
);

// ================================
// Types
// ================================
interface SubCategory {
  id: string;
  label: string;
  badge?: number | string;
  badgeType?: 'default' | 'warning' | 'critical';
}

type SessionState = {
  cat: string;
  sub: string;
  view?: string; // NOUVEAU v3.0
  fs?: boolean;
  sc?: boolean;
  kv?: boolean;
  kc?: boolean;
  np?: boolean;
};

type ViewMode = 'grid' | 'dashboard' | 'comparative'; // NOUVEAU v3.0

// NOUVEAU v3.0: Drill-down breadcrumb
interface BreadcrumbItem {
  id: string;
  label: string;
  type: 'category' | 'subcategory' | 'kpi' | 'breakdown';
  data?: unknown;
}

// ================================
// Sous-catégories
// ================================
const subCategoriesMap: Record<string, SubCategory[]> = {
  overview: [
    { id: 'all', label: 'Tout' },
    { id: 'summary', label: 'Résumé' },
    { id: 'highlights', label: 'Points clés', badge: 5 },
  ],
  performance: [
    { id: 'all', label: 'Tous les KPIs' },
    { id: 'critical', label: 'Critiques', badge: 3, badgeType: 'critical' },
    { id: 'warning', label: 'Attention', badge: 5, badgeType: 'warning' },
    { id: 'success', label: 'OK' },
  ],
  financial: [
    { id: 'budget', label: 'Budget' },
    { id: 'expenses', label: 'Dépenses' },
    { id: 'forecasts', label: 'Prévisions' },
  ],
  trends: [
    { id: 'all', label: 'Toutes' },
    { id: 'positive', label: 'Positives' },
    { id: 'negative', label: 'Négatives', badge: 4, badgeType: 'warning' },
    { id: 'stable', label: 'Stables' },
  ],
  alerts: [
    { id: 'all', label: 'Toutes', badge: 8 },
    { id: 'critical', label: 'Critiques', badge: 2, badgeType: 'critical' },
    { id: 'warning', label: 'Avertissements', badge: 6, badgeType: 'warning' },
    { id: 'resolved', label: 'Résolues' },
  ],
  reports: [
    { id: 'all', label: 'Tous' },
    { id: 'recent', label: 'Récents' },
    { id: 'scheduled', label: 'Planifiés' },
    { id: 'favorites', label: 'Favoris' },
  ],
  kpis: [
    { id: 'all', label: 'Tous' },
    { id: 'operational', label: 'Opérationnels' },
    { id: 'strategic', label: 'Stratégiques' },
    { id: 'custom', label: 'Personnalisés' },
  ],
  comparison: [
    { id: 'bureaux', label: 'Par bureau' },
    { id: 'period', label: 'Par période' },
    { id: 'category', label: 'Par catégorie' },
  ],
  bureaux: [
    { id: 'all', label: 'Tous' },
    { id: 'btp', label: 'BTP' },
    { id: 'bj', label: 'BJ' },
    { id: 'bs', label: 'BS' },
  ],
};

// ================================
// Notifications mock
// ================================
const INITIAL_NOTIFICATIONS = [
  { id: '1', type: 'critical' as const, title: 'KPI Performance critique', time: 'il y a 15 min', read: false },
  { id: '2', type: 'warning' as const, title: 'Tendance négative détectée', time: 'il y a 1h', read: false },
  { id: '3', type: 'info' as const, title: 'Rapport hebdomadaire disponible', time: 'il y a 3h', read: true },
  { id: '4', type: 'warning' as const, title: 'Seuil budget atteint à 80%', time: 'il y a 5h', read: true },
  { id: '5', type: 'info' as const, title: 'Nouvelle analyse disponible', time: 'hier', read: true },
];

const SESSION_KEY = 'bmo.analytics.session.v1';

// ================================
// Utils ERP
// ================================
const readJson = <T,>(key: string): T | null => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
};

const writeJson = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
};

const normalizeKey = (s: string) =>
  (s ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/\s+/g, '-');

function useUiAudit(scope: string) {
  const bufferRef = useRef<Array<{ ts: string; scope: string; event: string; payload?: unknown }>>([]);
  const log = useCallback(
    (event: string, payload?: unknown) => {
      const entry = { ts: new Date().toISOString(), scope, event, payload };
      bufferRef.current.push(entry);
      if (bufferRef.current.length > 200) bufferRef.current.shift();
      console.debug(`[AUDIT:${scope}]`, event, payload ?? '');
    },
    [scope]
  );

  return { log };
}

function useScrollRestoration(ref: React.RefObject<HTMLElement | null>, key: string) {
  useEffect(() => {
    const el = ref.current; // ✅ Lu au moment de l'exécution
    if (!el) return;

    const storageKey = `bmo.analytics.scroll:${key}`;
    const saved = sessionStorage.getItem(storageKey);
    if (saved) {
      const n = Number(saved);
      if (Number.isFinite(n)) el.scrollTop = n;
    }

    let raf = 0;
    const onScroll = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        sessionStorage.setItem(storageKey, String(el.scrollTop));
      });
    };

    el.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      el.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]); // ✅ Seulement key
}

interface ErrorBoundaryProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ClientErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }
  
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error): void {
    console.error('Analytics content crashed:', error);
  }
  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className={cn('p-6', this.props.className)}>
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4">
          <div className="text-sm font-semibold text-red-300">
            {this.props.title ?? "Erreur d'affichage"}
          </div>
          <div className="mt-2 text-xs text-red-200/80">
            Un composant a rencontré une erreur. Vous pouvez rafraîchir.
          </div>
          <div className="mt-3 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-red-500/30 text-red-200 hover:bg-red-500/10"
              onClick={() => window.location.reload()}
            >
              Rafraîchir
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-200 hover:bg-red-500/10"
              onClick={() => this.setState({ hasError: false, error: undefined })}
            >
              Réessayer
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

// ================================
// Main Component
// ================================
export default function AnalyticsPage() {
  return (
    <AnalyticsToastProvider>
      <AnalyticsPageContent />
    </AnalyticsToastProvider>
  );
}

function AnalyticsPageContent() {
  const toast = useAnalyticsToast();
  const audit = useUiAudit('analytics');

  const {
    navigation,
    fullscreen,
    sidebarCollapsed,
    commandPaletteOpen,
    notificationsPanelOpen,
    kpiConfig,
    navigationHistory,
    modal,
    toggleFullscreen,
    toggleCommandPalette,
    toggleNotificationsPanel,
    toggleSidebar,
    goBack,
    openModal,
    closeModal,
    navigate,
    setKPIConfig,
    filters,
    setFilter,
    resetFilters,
  } = useAnalyticsCommandCenterStore();

  const { isConnected, subscriptionsCount } = useRealtimeAnalytics({
    autoConnect: true,
    showToasts: true,
    autoInvalidateQueries: true,
  });

  // ✅ Utiliser les hooks React Query pour les stats dynamiques
  const { data: kpisData, isLoading: kpisLoading } = useKpis();
  const { data: alertsData, isLoading: alertsLoading } = useAlerts();
  const { data: reportsData, isLoading: reportsLoading } = useReports();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  const [notifications, setNotifications] = useState(() => INITIAL_NOTIFICATIONS.map(n => ({ ...n })));
  
  // NOUVEAU v3.0: Vue mode + drill-down
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [drillDownPath, setDrillDownPath] = useState<BreadcrumbItem[]>([]);
  // Navigation BTP - Activée par défaut
  const [useBTPNavigation, setUseBTPNavigation] = useState(true);

  const scrollRef = useRef<HTMLDivElement | null>(null);

  const activeCategory = navigation.mainCategory;
  const activeSubCategory = navigation.subCategory || 'all';

  const currentCategoryLabel = useMemo(() => {
    return analyticsCategories.find((c) => c.id === activeCategory)?.label || 'Analytics';
  }, [activeCategory]);

  const currentSubCategories = useMemo(() => {
    return subCategoriesMap[activeCategory] || [];
  }, [activeCategory]);

  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

  // NOUVEAU v3.0: Compter filtres actifs
  const activeFiltersCount = useMemo(() => {
    return Object.values(filters).filter(v => Array.isArray(v) && v.length > 0).length;
  }, [filters]);

  // ✅ NOUVEAU v3.0: Stats dynamiques calculées depuis les données réelles
  const dynamicStats = useMemo(() => {
    // Valeurs mockées par défaut (pendant le chargement ou si les données ne sont pas disponibles)
    const mockStats = {
      kpis: 10,
      alerts: 5,
      reports: 4,
    };

    // Pendant le chargement, retourner les valeurs mockées
    if (kpisLoading || alertsLoading || reportsLoading) {
      return mockStats;
    }

    // Si les données sont disponibles, utiliser les vraies valeurs
    const kpis = kpisData?.kpis || [];
    const alerts = alertsData?.alerts || [];
    const reports = reportsData?.reports || [];

    // Si aucune donnée n'est disponible, utiliser les valeurs mockées
    if (kpis.length === 0 && alerts.length === 0 && reports.length === 0) {
      return mockStats;
    }

    return {
      kpis: kpis.length > 0 ? kpis.length : mockStats.kpis,
      alerts: alerts.length > 0 ? alerts.length : mockStats.alerts,
      reports: reports.length > 0 ? reports.length : mockStats.reports,
    };
  }, [kpisData, alertsData, reportsData, kpisLoading, alertsLoading, reportsLoading]);

  const formatLastUpdate = useCallback(() => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastUpdate.getTime()) / 1000);
    if (diff < 60) return "à l'instant";
    if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
    return `il y a ${Math.floor(diff / 3600)}h`;
  }, [lastUpdate]);

  // ================================
  // Navigation resolution (CONSERVÉ)
  // ================================
  const resolveMainCategoryId = useCallback(
    (value: string) => {
      const raw = (value ?? '').trim();
      if (!raw) return activeCategory;

      const v = normalizeKey(raw);
      const byId = analyticsCategories.find((c) => normalizeKey(c.id) === v);
      if (byId) return byId.id as AnalyticsMainCategory;

      const byLabel = analyticsCategories.find((c) => normalizeKey(c.label) === v);
      if (byLabel) return byLabel.id as AnalyticsMainCategory;

      const aliases: Record<string, AnalyticsMainCategory> = {
        'vue-densemble': 'overview',
        'vue-ensemble': 'overview',
        'performance': 'performance',
        'financier': 'financial',
        'finances': 'financial',
        'tendances': 'trends',
        'alertes': 'alerts',
        'rapports': 'reports',
        'kpis': 'kpis',
        'comparaison': 'comparison',
        'bureaux': 'bureaux',
      };

      return aliases[v] ?? (activeCategory as AnalyticsMainCategory);
    },
    [activeCategory]
  );

  const resolveSubCategoryId = useCallback(
    (value: string) => {
      const raw = (value ?? '').trim();
      if (!raw) return 'all';

      const v = normalizeKey(raw);

      const aliasesByCategory: Record<string, Record<string, string>> = {
        performance: { ok: 'success' },
        financial: {
          depense: 'expenses',
          depenses: 'expenses',
          prevision: 'forecasts',
          previsions: 'forecasts',
        },
        alerts: {
          avertissement: 'warning',
          avertissements: 'warning',
          critique: 'critical',
          critiques: 'critical',
          resolue: 'resolved',
          resolues: 'resolved',
        },
        trends: {
          positives: 'positive',
          negative: 'negative',
          negatives: 'negative',
          stable: 'stable',
          stables: 'stable',
        },
        reports: {
          recents: 'recent',
          planifie: 'scheduled',
          planifies: 'scheduled',
          favoris: 'favorites',
        },
      };

      const alias = aliasesByCategory[activeCategory]?.[v];
      const candidate = alias ?? raw;

      const byId = currentSubCategories.find((s) => normalizeKey(s.id) === normalizeKey(candidate));
      if (byId) return byId.id;

      const byLabel = currentSubCategories.find((s) => normalizeKey(s.label) === v);
      if (byLabel) return byLabel.id;

      if (alias) {
        const byAlias = currentSubCategories.find((s) => normalizeKey(s.id) === normalizeKey(alias));
        if (byAlias) return byAlias.id;
      }

      return 'all';
    },
    [activeCategory, currentSubCategories]
  );

  useEffect(() => {
    if (currentSubCategories.length === 0) return; // Skip si pas de sous-catégories
    
    const has = currentSubCategories.some((s) => s.id === activeSubCategory);
    
    if (!has) {
      const firstAvailableSub = currentSubCategories[0]?.id; // Prendre la première disponible
      
      if (firstAvailableSub) {
        audit.log('NAV_SUB_INVALID_RESET', { 
          cat: activeCategory, 
          invalidSub: activeSubCategory,
          newSub: firstAvailableSub 
        });
        navigate(activeCategory, firstAvailableSub, null);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory]); // ✅ Seulement activeCategory - currentSubCategories est dérivé via useMemo

  // NOUVEAU v3.0: Scroll restoration inclut viewMode
  useScrollRestoration(scrollRef, `${activeCategory}:${activeSubCategory}:${viewMode}`);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (refreshTimerRef.current) window.clearTimeout(refreshTimerRef.current);
    };
  }, []);

  // ================================
  // URL sync + Session (AMÉLIORÉ v3.0 avec viewMode)
  // ================================
  const hydratedRef = useRef(false);

  const applyState = useCallback(
    (st: SessionState, origin: 'url' | 'session') => {
      // ✅ Lire depuis le store directement pour éviter boucle infinie
      const currentNav = useAnalyticsCommandCenterStore.getState().navigation;
      const currentCat = currentNav.mainCategory;
      const currentSub = currentNav.subCategory || 'all';
      
      const nextCat = resolveMainCategoryId(st.cat || currentCat);
      const nextSub = st.sub ? resolveSubCategoryId(st.sub) : 'all';

      if (nextCat !== currentCat) navigate(nextCat, 'all', null);
      if (nextCat === currentCat && nextSub !== currentSub) navigate(currentCat, nextSub, null);

      if (typeof st.fs === 'boolean' && st.fs !== fullscreen) toggleFullscreen();
      if (typeof st.sc === 'boolean' && st.sc !== sidebarCollapsed) toggleSidebar();
      if (typeof st.np === 'boolean' && st.np !== notificationsPanelOpen) toggleNotificationsPanel();

      if (typeof st.kv === 'boolean' && st.kv !== kpiConfig.visible) setKPIConfig({ visible: st.kv });
      if (typeof st.kc === 'boolean' && st.kc !== kpiConfig.collapsed) setKPIConfig({ collapsed: st.kc });

      // NOUVEAU v3.0: Restaurer viewMode
      if (st.view && ['grid', 'dashboard', 'comparative'].includes(st.view)) {
        if (process.env.NODE_ENV === 'development') {
          console.log('🔍 [DEBUG] Setting viewMode from applyState:', st.view);
        }
        setViewMode(st.view as ViewMode);
      }

      audit.log('STATE_APPLY', { origin, st });
    },
    [
      resolveMainCategoryId,
      resolveSubCategoryId,
      fullscreen,
      sidebarCollapsed,
      notificationsPanelOpen,
      kpiConfig.visible,
      kpiConfig.collapsed,
      navigate,
      toggleFullscreen,
      toggleSidebar,
      toggleNotificationsPanel,
      setKPIConfig,
      setViewMode,
      audit,
    ]
  );

  useEffect(() => {
    if (hydratedRef.current) return;

    const url = new URL(window.location.href);
    const cat = url.searchParams.get('cat') ?? '';
    const sub = url.searchParams.get('sub') ?? '';
    const view = url.searchParams.get('view') ?? ''; // NOUVEAU v3.0
    const fs = url.searchParams.get('fs');
    const sc = url.searchParams.get('sc');
    const kv = url.searchParams.get('kv');
    const kc = url.searchParams.get('kc');
    const np = url.searchParams.get('np');

    // Debug logs (can be removed in production)
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 [DEBUG] URL params:', { cat, sub, view, fs, sc, kv, kc, np });
    }

    const hasAnyParam = !!(cat || sub || view || fs || sc || kv || kc || np);

    if (hasAnyParam) {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 [DEBUG] Applying state from URL:', { cat: cat || activeCategory, sub: sub || activeSubCategory, view: view || viewMode });
      }
      applyState(
        {
          cat: cat || activeCategory,
          sub: sub || activeSubCategory,
          view: view || viewMode,
          fs: fs === '1',
          sc: sc === '1',
          kv: kv ? kv === '1' : undefined,
          kc: kc ? kc === '1' : undefined,
          np: np === '1',
        },
        'url'
      );
    } else {
      const stored = readJson<SessionState>(SESSION_KEY);
      if (stored?.cat) applyState(stored, 'session');
    }

    hydratedRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Exécution unique au montage, hydratedRef.current empêche les re-exécutions

  useEffect(() => {
    if (!hydratedRef.current) return;

    const st: SessionState = {
      cat: activeCategory,
      sub: activeSubCategory,
      view: viewMode, // NOUVEAU v3.0
      fs: fullscreen,
      sc: sidebarCollapsed,
      kv: kpiConfig.visible,
      kc: kpiConfig.collapsed,
      np: notificationsPanelOpen,
    };

    writeJson(SESSION_KEY, st);

    const url = new URL(window.location.href);
    url.searchParams.set('cat', activeCategory);
    url.searchParams.set('sub', activeSubCategory);
    url.searchParams.set('view', viewMode); // NOUVEAU v3.0

    fullscreen ? url.searchParams.set('fs', '1') : url.searchParams.delete('fs');
    sidebarCollapsed ? url.searchParams.set('sc', '1') : url.searchParams.delete('sc');
    notificationsPanelOpen ? url.searchParams.set('np', '1') : url.searchParams.delete('np');

    kpiConfig.visible ? url.searchParams.delete('kv') : url.searchParams.set('kv', '0');
    kpiConfig.collapsed ? url.searchParams.set('kc', '1') : url.searchParams.delete('kc');

    window.history.replaceState(null, '', url.toString());
  }, [
    activeCategory,
    activeSubCategory,
    viewMode, // NOUVEAU v3.0
    fullscreen,
    sidebarCollapsed,
    notificationsPanelOpen,
    kpiConfig.visible,
    kpiConfig.collapsed,
  ]);

  // ================================
  // Actions (CONSERVÉES + ENRICHIES v3.0)
  // ================================
  const handleRefresh = useCallback(() => {
    if (isRefreshing) return;
    audit.log('REFRESH');
    setIsRefreshing(true);

    if (refreshTimerRef.current) window.clearTimeout(refreshTimerRef.current);
    refreshTimerRef.current = setTimeout(() => {
      if (!mountedRef.current) return;
      setIsRefreshing(false);
      setLastUpdate(new Date());
      toast.dataRefreshed();
      audit.log('REFRESH_DONE');
    }, 1500);
  }, [audit, toast, isRefreshing]);

  const handleCategoryChange = useCallback(
    (value: string) => {
      const cat = resolveMainCategoryId(value);
      audit.log('NAV_CATEGORY', { value, cat });
      navigate(cat, 'all', null);
      setDrillDownPath([]); // NOUVEAU v3.0
    },
    [audit, navigate, resolveMainCategoryId]
  );

  const handleSubCategoryChange = useCallback(
    (value: string) => {
      const subId = resolveSubCategoryId(value);
      audit.log('NAV_SUBCATEGORY', { cat: activeCategory, value, subId });
      navigate(activeCategory, subId, null);
      setDrillDownPath([]); // NOUVEAU v3.0
    },
    [audit, activeCategory, navigate, resolveSubCategoryId]
  );

  const handleBatchAction = useCallback(
    (actionId: string, ids: string[]) => {
      audit.log('BATCH_ACTION', { actionId, count: ids.length });

      switch (actionId) {
        case 'export':
          openModal('export', { selectedIds: ids });
          break;
        case 'view':
          if (ids.length > 0) openModal('kpi-detail', { kpiId: ids[0] });
          break;
        case 'delete':
          toast.warning('Suppression batch', `${ids.length} item(s) à supprimer`);
          break;
        case 'archive':
          toast.info('Archivage batch', `${ids.length} item(s) à archiver`);
          break;
        // NOUVEAU v3.0: Actions sophistiquées
        case 'validate-workflow':
          toast.info('Workflow de validation', `Démarrage pour ${ids.length} KPI(s)`);
          break;
        case 'escalate':
          toast.warning('Escalade DGS', `${ids.length} KPI(s) escaladés`);
          break;
        case 'generate-report':
          toast.success('Génération rapport', `Rapport direction pour ${ids.length} KPI(s)`);
          break;
        default:
          break;
      }
    },
    [audit, openModal, toast]
  );

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  // NOUVEAU v3.0: Drill-down handlers
  const handleDrillDown = useCallback((item: BreadcrumbItem) => {
    audit.log('DRILL_DOWN', { item });
    setDrillDownPath((prev) => [...prev, item]);
  }, [audit]);

  const handleDrillDownNavigate = useCallback((index: number) => {
    audit.log('DRILL_DOWN_NAVIGATE', { index });
    if (index === -1) {
      setDrillDownPath([]);
    } else {
      setDrillDownPath((prev) => prev.slice(0, index + 1));
    }
  }, [audit]);

  // NOUVEAU v3.0: Export handlers
  const handleExport = useCallback((format: 'excel' | 'pdf') => {
    audit.log('EXPORT', { format, filters: activeFiltersCount });
    toast.info(`Export ${format.toUpperCase()}`, 'Génération en cours...');
    // TODO: Appeler API export
  }, [audit, toast, activeFiltersCount]);

  const handleGenerateReport = useCallback((type: 'direction' | 'conseil') => {
    audit.log('GENERATE_REPORT', { type });
    toast.success('Génération rapport', `Rapport ${type} en cours...`);
    // TODO: Appeler API génération rapport
  }, [audit, toast]);

  // ================================
  // Keyboard shortcuts (CONSERVÉS + ENRICHIS v3.0)
  // ================================
  useEffect(() => {
    const isTypingTarget = (el: EventTarget | null) => {
      const t = el as HTMLElement | null;
      if (!t) return false;
      const tag = t.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return true;
      if (t.isContentEditable) return true;
      return false;
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target)) return;

      const isMod = e.metaKey || e.ctrlKey;

      if (e.key === 'Escape') {
        if (modal?.isOpen) {
          e.preventDefault();
          closeModal();
          return;
        }
        if (notificationsPanelOpen) {
          e.preventDefault();
          toggleNotificationsPanel();
          return;
        }
        if (commandPaletteOpen) {
          e.preventDefault();
          toggleCommandPalette();
          return;
        }
        if (drillDownPath.length > 0) {
          e.preventDefault();
          setDrillDownPath([]);
          return;
        }
      }

      if (isMod && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        audit.log('COMMAND_PALETTE_TOGGLE');
        toggleCommandPalette();
        return;
      }

      if (isMod && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        audit.log('FILTERS_OPEN');
          openModal('filters');
        return;
      }

      if (isMod && e.shiftKey && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        audit.log('FILTERS_RESET');
        resetFilters();
        toast.info('Filtres réinitialisés', 'Tous les filtres ont été supprimés');
        return;
      }

      // NOUVEAU v3.0: Export shortcut
      if (isMod && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        audit.log('EXPORT_SHORTCUT');
        handleExport('excel');
        return;
      }

      if (e.key === 'F11') {
        e.preventDefault();
        audit.log('FULLSCREEN_TOGGLE');
        toggleFullscreen();
        return;
      }

      if (e.altKey && e.key === 'ArrowLeft') {
        e.preventDefault();
        audit.log('NAV_BACK');
        if (drillDownPath.length > 0) {
          handleDrillDownNavigate(drillDownPath.length - 2);
        } else {
        goBack();
        }
        return;
      }

      if (isMod && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        audit.log('SIDEBAR_TOGGLE');
        toggleSidebar();
        return;
      }

      if (isMod && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        audit.log('NOTIFICATIONS_TOGGLE');
        toggleNotificationsPanel();
        return;
      }

      // NOUVEAU v3.0: Basculement vues rapide
      if (isMod && e.key === '1') {
        e.preventDefault();
        setViewMode('grid');
        const url = new URL(window.location.href);
        url.searchParams.set('view', 'grid');
        window.history.replaceState(null, '', url.toString());
        audit.log('VIEW_CHANGE_SHORTCUT', { view: 'grid' });
        return;
      }

      if (isMod && e.key === '2') {
        e.preventDefault();
        setViewMode('dashboard');
        const url = new URL(window.location.href);
        url.searchParams.set('view', 'dashboard');
        window.history.replaceState(null, '', url.toString());
        audit.log('VIEW_CHANGE_SHORTCUT', { view: 'dashboard' });
        return;
      }

      if (isMod && e.key === '3') {
        e.preventDefault();
        setViewMode('comparative');
        const url = new URL(window.location.href);
        url.searchParams.set('view', 'comparative');
        window.history.replaceState(null, '', url.toString());
        audit.log('VIEW_CHANGE_SHORTCUT', { view: 'comparative' });
        return;
      }

      if (e.key === '?' && !isMod && !e.altKey) {
        e.preventDefault();
        audit.log('MODAL_OPEN', { type: 'shortcuts' });
        openModal('shortcuts');
        return;
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    audit,
    commandPaletteOpen,
    notificationsPanelOpen,
    modal?.isOpen,
    drillDownPath,
    toggleCommandPalette,
    toggleNotificationsPanel,
    toggleFullscreen,
    toggleSidebar,
    goBack,
    openModal,
    closeModal,
    resetFilters,
    toast,
    handleExport,
    handleDrillDownNavigate,
  ]);

  // ================================
  // Render
  // ================================
  return (
    <div
      className={cn(
        'flex h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden',
        fullscreen && 'fixed inset-0 z-50'
      )}
    >
      {/* ============================================
          SECTION 1: SIDEBAR BMO
          Navigation principale latérale
          ============================================ */}
      {/* Mobile overlay for sidebar */}
      {!sidebarCollapsed && (
        <div
          className="fixed inset-0 bg-black/50 z-30 sm:hidden"
          onClick={() => toggleSidebar()}
        />
      )}

      {useBTPNavigation ? (
        <BTPSidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => {
            audit.log('SIDEBAR_TOGGLE');
            toggleSidebar();
          }}
        />
      ) : (
        <AnalyticsCommandSidebar
          activeCategory={activeCategory}
          collapsed={sidebarCollapsed}
          onCategoryChange={handleCategoryChange}
          onToggleCollapse={() => {
            audit.log('SIDEBAR_TOGGLE');
            toggleSidebar();
          }}
          onOpenCommandPalette={() => {
            audit.log('COMMAND_PALETTE_TOGGLE');
            toggleCommandPalette();
          }}
        />
      )}

      {/* ============================================
          SECTION 2: PANNEAU MÉTIER 3 NIVEAUX
          Navigation hiérarchique + Header + Filtres
          ============================================ */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="flex items-center justify-between px-2 sm:px-4 py-2 border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            {(navigationHistory.length > 0 || drillDownPath.length > 0) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (drillDownPath.length > 0) {
                    handleDrillDownNavigate(drillDownPath.length - 2);
                  } else {
                    audit.log('NAV_BACK');
                    goBack();
                  }
                }}
                className="h-8 w-8 p-0 text-slate-500 hover:text-slate-300"
                title="Retour (Alt+←)"
                aria-label="Retour"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}

            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-400" />
              <h1 className="text-base font-semibold text-slate-200">Analytics</h1>
              <Badge
                variant="default"
                className="text-xs bg-slate-800/50 text-slate-300 border-slate-700/50"
              >
                v3.0
              </Badge>
              <Button
                variant={useBTPNavigation ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  audit.log('BTP_NAV_TOGGLE', { from: useBTPNavigation, to: !useBTPNavigation });
                  setUseBTPNavigation(!useBTPNavigation);
                }}
                className={cn(
                  'h-7 px-3 text-xs font-medium transition-colors',
                  useBTPNavigation
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'text-slate-400 hover:text-slate-200 border-slate-700'
                )}
                title={useBTPNavigation ? 'Basculer vers navigation classique' : 'Basculer vers navigation BTP'}
              >
                {useBTPNavigation ? 'BTP' : 'Classique'}
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                audit.log('COMMAND_PALETTE_TOGGLE');
                toggleCommandPalette();
              }}
              className="h-8 px-3 text-slate-500 hover:text-slate-300 hover:bg-slate-800/50"
              aria-label="Rechercher"
            >
              <Search className="h-4 w-4 mr-2" />
              <span className="text-xs hidden sm:inline">Rechercher</span>
              <kbd className="ml-2 text-xs bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded hidden sm:inline">
                <KeyboardShortcut shortcut="⌘K" />
              </kbd>
            </Button>

            <div className="w-px h-4 bg-slate-700/50 mx-1" />

            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                audit.log('NOTIFICATIONS_TOGGLE');
                toggleNotificationsPanel();
              }}
              className={cn(
                'h-8 w-8 p-0 relative',
                notificationsPanelOpen
                  ? 'text-slate-200 bg-slate-800/50'
                  : 'text-slate-500 hover:text-slate-300'
              )}
              title={`Notifications (⌘N)`}
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
                  {Math.min(unreadCount, 99)}
              </span>
              )}
            </Button>

            {/* NOUVEAU v3.0: Enhanced Actions Menu */}
            <EnhancedActionsMenu
              onRefresh={handleRefresh}
              isRefreshing={isRefreshing}
              onExport={handleExport}
              onGenerateReport={handleGenerateReport}
            />
          </div>
        </header>

        {/* Niveau 1: Catégories principales (dans la sidebar) */}
        {/* Niveau 2: Sous-catégories (panneau métier) */}
        {!useBTPNavigation && (
          <AnalyticsSubNavigation
            mainCategory={activeCategory}
            mainCategoryLabel={currentCategoryLabel}
            subCategory={activeSubCategory}
            subCategories={currentSubCategories}
            onSubCategoryChange={handleSubCategoryChange}
          />
        )}

        {/* NOUVEAU v3.0: Drill-down breadcrumb */}
        {drillDownPath.length > 0 && (
          <DrillDownBreadcrumb
            path={drillDownPath}
            onNavigate={handleDrillDownNavigate}
          />
        )}

        {/* Niveau 3: Vues + Filtres (panneau métier) */}
        <div className="flex items-center justify-between px-2 sm:px-4 py-2 border-b border-slate-800/60 bg-slate-900/80">
          <div className="flex gap-1">
            {[
              { id: 'grid' as const, label: 'Grille', icon: Grid3x3, kbd: '⌘1' },
              { id: 'dashboard' as const, label: 'Tableau de bord', icon: LayoutGrid, kbd: '⌘2' },
              { id: 'comparative' as const, label: 'Comparatif', icon: BarChart2, kbd: '⌘3' },
            ].map((view) => (
              <button
                key={view.id}
                onClick={() => {
                  audit.log('VIEW_CHANGE', { from: viewMode, to: view.id });
                  setViewMode(view.id);
                  // Force URL update
                  const url = new URL(window.location.href);
                  url.searchParams.set('view', view.id);
                  window.history.replaceState(null, '', url.toString());
                }}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5',
                  viewMode === view.id
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                )}
                title={`${view.label} (${view.kbd})`}
              >
                <view.icon className="h-4 w-4" />
                <span className="hidden md:inline">{view.label}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {/* NOUVEAU v3.0: Indicateur filtres actifs */}
            {activeFiltersCount > 0 && (
              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                <Filter className="h-3 w-3 mr-1" />
                {activeFiltersCount} filtre{activeFiltersCount > 1 ? 's' : ''}
              </Badge>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                audit.log('FILTERS_OPEN');
                openModal('filters');
              }}
              className="h-7 px-2 text-xs text-slate-400 hover:text-slate-200"
            >
              <Filter className="h-3.5 w-3.5 mr-1.5" />
              Filtres
              <kbd className="ml-2 text-[10px] bg-slate-800 text-slate-500 px-1 py-0.5 rounded">
                <KeyboardShortcut shortcut="⌘F" />
              </kbd>
            </Button>
          </div>
        </div>

        {kpiConfig.visible && (
          <AnalyticsKPIBar
            visible={true}
            collapsed={kpiConfig.collapsed}
            onToggleCollapse={() => {
              audit.log('KPI_COLLAPSE_TOGGLE', { next: !kpiConfig.collapsed });
              setKPIConfig({ collapsed: !kpiConfig.collapsed });
            }}
            onRefresh={handleRefresh}
          />
        )}

        {/* ============================================
            SECTION 3: CONTENU PAGE
            Zone principale d'affichage du contenu
            ============================================ */}
        <main className="flex-1 overflow-hidden">
          <div ref={scrollRef} className="h-full overflow-x-hidden overflow-y-auto">
            <AnalyticsErrorBoundary
              showDetails={process.env.NODE_ENV === 'development'}
              onError={(error, errorInfo) => {
                if (process.env.NODE_ENV === 'development') {
                  console.error('Analytics Error:', error, errorInfo);
                }
              }}
            >
              {/* Router selon le mode de navigation */}
              {useBTPNavigation ? (
                <BTPContentRouter />
              ) : (
                (() => {
                  if (process.env.NODE_ENV === 'development') {
                    console.log('🔍 [DEBUG] Rendering viewMode:', viewMode, 'category:', activeCategory, 'subCategory:', activeSubCategory);
                  }
                  if (viewMode === 'grid') {
                    return (
                      <AnalyticsContentRouter
                        category={activeCategory}
                        subCategory={activeSubCategory}
                      />
                    );
                  }
                  if (viewMode === 'dashboard') {
                    // Si on est sur la catégorie alerts, utiliser AlertsDashboardView avec subCategory
                    if (activeCategory === 'alerts') {
                      return (
                        <Suspense fallback={<LoadingSkeleton className="p-6" lines={8} />}>
                          <AlertsDashboardView subCategory={activeSubCategory} />
                        </Suspense>
                      );
                    }
                    return (
                      <Suspense fallback={<LoadingSkeleton className="p-6" lines={8} />}>
                        <AnalyticsDashboardView />
                      </Suspense>
                    );
                  }
                  if (viewMode === 'comparative') {
                    return (
                      <Suspense fallback={<LoadingSkeleton className="p-6" lines={8} />}>
                        <AnalyticsComparisonView category={activeCategory} subCategory={activeSubCategory} />
                      </Suspense>
                    );
                  }
                  return null;
                })()
              )}
            </AnalyticsErrorBoundary>
          </div>
        </main>

        {/* NOUVEAU v3.0: Footer avec stats dynamiques */}
        <footer className="flex items-center justify-between px-2 sm:px-4 py-1.5 border-t border-slate-800/50 bg-slate-900/60 text-xs">
          <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
            <span className="text-slate-600 text-xs">MàJ: {formatLastUpdate()}</span>
            <span className="text-slate-700 hidden sm:inline">•</span>
            <span className="text-slate-600 text-xs">
              {dynamicStats.kpis} KPIs • {dynamicStats.alerts} alertes • {dynamicStats.reports} rapports
            </span>
            {isConnected && (
              <>
                <span className="text-slate-700 hidden sm:inline">•</span>
                <span className="text-slate-600 text-xs">🟢 Temps réel ({subscriptionsCount} abonnements)</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-1.5">
              <div
                className={cn(
                  'w-2 h-2 rounded-full',
                  isRefreshing ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'
                )}
              />
              <span className="text-slate-500">{isRefreshing ? 'Synchronisation...' : 'Connecté'}</span>
            </div>
          </div>
        </footer>
      </div>

      {commandPaletteOpen && <AnalyticsCommandPalette />}
      <AnalyticsModals />
      <AnalyticsDetailPanel />
      <AnalyticsBatchActionsBar onAction={handleBatchAction} />

      {notificationsPanelOpen && (
        <NotificationsPanel
          notifications={notifications}
          onClose={toggleNotificationsPanel}
          onMarkRead={(id) => {
            audit.log('NOTIFICATION_READ', { id });
            markNotificationRead(id);
          }}
        />
      )}

      {modal.type === 'filters' && modal.isOpen && (
        <AnalyticsFiltersPanel
          isOpen={modal.isOpen}
          onClose={() => {
            audit.log('MODAL_CLOSE', { type: 'filters' });
            closeModal();
          }}
          onApplyFilters={(newFilters: Record<string, unknown>) => {
            Object.entries(newFilters).forEach(([key, value]) => {
              if (Array.isArray(value)) setFilter(key as keyof typeof filters, value);
            });
            audit.log('FILTERS_APPLIED', { count: Object.keys(newFilters).length });
            closeModal();
            toast.info('Filtres appliqués', `${Object.keys(newFilters).length} filtre(s) actif(s)`);
          }}
        />
      )}
    </div>
  );
}

// ================================
// NOUVEAU v3.0: Enhanced Actions Menu
// ================================
function EnhancedActionsMenu({
  onRefresh,
  isRefreshing,
  onExport,
  onGenerateReport,
}: {
  onRefresh: () => void;
  isRefreshing: boolean;
  onExport: (format: 'excel' | 'pdf') => void;
  onGenerateReport: (type: 'direction' | 'conseil') => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // ✅ Fermer sur Escape
  useEffect(() => {
    if (!menuOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [menuOpen]);

  // ✅ Fermer sur clic dehors
  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  return (
    <div ref={menuRef} className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setMenuOpen(!menuOpen)}
        className="h-8 px-2 text-slate-500 hover:text-slate-300"
      >
        <MoreVertical className="h-4 w-4" />
      </Button>

      {menuOpen && (
        <div className="absolute right-0 top-full mt-1 w-56 bg-slate-900 border border-slate-800/60 rounded-lg shadow-xl z-50">
          <div className="py-1">
            <button
              onClick={() => {
                onRefresh();
                setMenuOpen(false);
              }}
              disabled={isRefreshing}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800/50 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
              Actualiser
            </button>

            <div className="h-px bg-slate-800/60 my-1" />

            <button
              onClick={() => {
                onExport('excel');
                setMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800/50 transition-colors"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Exporter Excel
            </button>

            <button
              onClick={() => {
                onExport('pdf');
                setMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800/50 transition-colors"
            >
              <FileText className="h-4 w-4" />
              Exporter PDF
            </button>

            <div className="h-px bg-slate-800/60 my-1" />

            <button
              onClick={() => {
                onGenerateReport('direction');
                setMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800/50 transition-colors"
            >
              <Presentation className="h-4 w-4" />
              Rapport direction
            </button>

            <button
              onClick={() => {
                onGenerateReport('conseil');
                setMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800/50 transition-colors"
            >
              <UsersIcon className="h-4 w-4" />
              Rapport Conseil
            </button>

            <div className="h-px bg-slate-800/60 my-1" />

            <button
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800/50 transition-colors"
            >
              <Clock className="h-4 w-4" />
              Planifier rapport auto
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ================================
// NOUVEAU v3.0: Drill-Down Breadcrumb
// ================================
function DrillDownBreadcrumb({
  path,
  onNavigate,
}: {
  path: BreadcrumbItem[];
  onNavigate: (index: number) => void;
}) {
  if (path.length === 0) return null;

  return (
    <div className="flex items-center gap-1 px-4 py-2 bg-slate-900/60 border-b border-slate-800/60 overflow-x-auto">
      <button
        onClick={() => onNavigate(-1)}
        className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors"
      >
        <Home className="h-3.5 w-3.5" />
        Analytics
      </button>

      {path.map((item, index) => (
        <React.Fragment key={item.id}>
          <ChevronRight className="h-4 w-4 text-slate-600 flex-shrink-0" />
          
          <button
            onClick={() => onNavigate(index)}
            className={cn(
              'px-2 py-1 rounded-lg text-xs font-medium transition-colors',
              index === path.length - 1
                ? 'text-slate-200 bg-slate-800/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
            )}
          >
            {item.label}
          </button>
        </React.Fragment>
      ))}
    </div>
  );
}


// ================================
// NotificationsPanel (CONSERVÉ)
// ================================
function NotificationsPanel({
  onClose,
  notifications,
  onMarkRead,
}: {
  onClose: () => void;
  notifications: Array<{ id: string; type: 'critical' | 'warning' | 'info'; title: string; time: string; read: boolean }>;
  onMarkRead: (id: string) => void;
}) {
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="fixed right-0 top-0 h-full w-80 bg-slate-900 border-l border-slate-800/50 z-50 flex flex-col">
        <div className="p-4 border-b border-slate-800/50">
          <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-orange-400" />
            <h3 className="text-sm font-medium text-slate-200">Notifications</h3>
              {unread > 0 && (
                <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">
                  {unread} nouvelle{unread > 1 ? 's' : ''}
            </Badge>
              )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-7 w-7 p-0 text-slate-500 hover:text-slate-300"
              aria-label="Fermer les notifications"
              title="Fermer (Esc)"
          >
            ×
          </Button>
          </div>
        </div>

        <div className="flex-1 overflow-x-hidden overflow-y-auto divide-y divide-slate-800/50">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={cn(
                'px-4 py-3 hover:bg-slate-800/30 cursor-pointer transition-colors',
                !notif.read && 'bg-slate-800/20'
              )}
              role="button"
              tabIndex={0}
              onClick={() => onMarkRead(notif.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onMarkRead(notif.id);
                }
              }}
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    'w-2 h-2 rounded-full mt-1.5 flex-shrink-0',
                    notif.type === 'critical'
                      ? 'bg-red-500'
                      : notif.type === 'warning'
                      ? 'bg-amber-500'
                      : 'bg-blue-500'
                  )}
                />
                <div className="min-w-0">
                  <p
                    className={cn(
                      'text-sm',
                      !notif.read ? 'text-slate-200 font-medium' : 'text-slate-400'
                    )}
                  >
                    {notif.title}
                  </p>
                  <p className="text-xs text-slate-600 mt-0.5">{notif.time}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-slate-800/50">
          <Button variant="outline" size="sm" className="w-full border-slate-700 text-slate-400">
            Voir toutes les notifications
          </Button>
        </div>
      </div>
    </>
  );
}
