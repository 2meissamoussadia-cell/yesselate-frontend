/**
 * ============================================================================
 * DASHBOARD PAGE - Page principale du Dashboard
 * ============================================================================
 * 
 * @file app/(portals)/maitre-ouvrage/dashboard/page.tsx
 * @version 6.0 - Réorganisé et optimisé
 * 
 * DESCRIPTION:
 * Page principale du dashboard qui orchestre tous les composants :
 * - Sidebar de navigation
 * - Sub-navigation (niveaux 2 et 3)
 * - Breadcrumbs
 * - KPI Bar avec indicateurs en temps réel
 * - Router de contenu dynamique
 * - Footer avec métriques
 * - Notifications et modals
 * 
 * ARCHITECTURE:
 * - Utilise useDashboardNavigationStore pour la navigation (main, sub, leaf)
 * - Utilise useDashboardCommandCenterStore pour l'UI (modals, sidebar, etc.)
 * - Charge dynamiquement les composants via DashboardViewRouter
 * - Gère l'auto-refresh avec pause intelligente (onglet invisible, hors ligne)
 * - Exporte les données KPIs (CSV, JSON, PDF, Excel)
 * - Raccourcis clavier complets (Ctrl+K, Ctrl+R, Alt+A, etc.)
 * 
 * PERFORMANCE:
 * - Lazy loading des modals
 * - Mémorisation des composants et handlers
 * - Sélecteurs individuels pour éviter les re-renders
 * - Code splitting avec Suspense
 * 
 * ACCESSIBILITÉ:
 * - ARIA labels complets
 * - Navigation clavier
 * - Live regions pour les annonces
 * - Skip to main content link
 * 
 * ============================================================================
 */

'use client';

/* ============================================================================
   IMPORTS - Organisés par catégories
   ============================================================================ */

// ───────────────────────────────────────────────────────────────────────────
// 1. REACT & REACT HOOKS
// ───────────────────────────────────────────────────────────────────────────
import React, { 
  Suspense, 
  useMemo, 
  memo, 
  useCallback, 
  useEffect, 
  useState, 
  useRef, 
  lazy 
} from 'react';

// ───────────────────────────────────────────────────────────────────────────
// 2. LIBRAIRIES EXTERNES - UI Components
// ───────────────────────────────────────────────────────────────────────────
import { 
  Loader2, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  DollarSign, 
  Clock, 
  TrendingUp,
  Activity,
} from 'lucide-react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';

// ───────────────────────────────────────────────────────────────────────────
// 3. STORES ZUSTAND - État global
// ───────────────────────────────────────────────────────────────────────────
import { useDashboardCommandCenterStore } from '@/lib/stores/dashboardCommandCenterStore';
import { useDashboardNavigationStore } from '@/lib/stores/dashboardNavigationStore';

// ───────────────────────────────────────────────────────────────────────────
// 4. MODULES DASHBOARD - Composants, hooks, types
// ───────────────────────────────────────────────────────────────────────────
import { 
  DashboardSidebar, 
  DashboardSubNavigation, 
  DashboardViewRouter,
  DashboardKPIBar,
  DashboardFooter,
  DashboardBreadcrumbs,
  KPINotifications,
  ContentLoadingSkeleton,
  useAutoRefresh,
} from '@/modules/dashboard';
import type { 
  KPINotification,
  KPITone,
  KPITrend,
} from '@/modules/dashboard';

// ───────────────────────────────────────────────────────────────────────────
// 5. HOOKS DASHBOARD - Logique métier
// ───────────────────────────────────────────────────────────────────────────
import { useKPIFilter } from '@/modules/dashboard/hooks/useKPIFilter';
import { useKPINotifications, useKPIDiff } from '@/modules/dashboard/hooks/useKPINotifications';
import { useDashboardRefresh } from '@/modules/dashboard/hooks/useDashboardRefresh';
import { usePerformanceMetrics } from '@/modules/dashboard/hooks/usePerformanceMetrics';

// ───────────────────────────────────────────────────────────────────────────
// 6. HOOKS & UTILS - Utilitaires généraux
// ───────────────────────────────────────────────────────────────────────────
import { getKPIMappingByLabel } from '@/lib/mappings/dashboardKPIMapping';
import { useDashboardKPIs } from '@/lib/hooks/useDashboardKPIs';
import { useLogger } from '@/lib/utils/logger';
import { cn } from '@/lib/utils';

// ───────────────────────────────────────────────────────────────────────────
// 7. COMPOSANTS LAZY LOADED - Code splitting
// ───────────────────────────────────────────────────────────────────────────
const DashboardModals = lazy(() => 
  import('@/components/features/bmo/dashboard/command-center/DashboardModals').then(m => ({ default: m.DashboardModals }))
);

/* ============================================================================
   TYPES & INTERFACES
   ============================================================================ */

/**
 * Données d'un KPI affiché dans la barre
 */
interface KPIData {
  label: string;
  value: string | number;
  delta: string;
  tone: KPITone;
  trend: KPITrend;
  icon: React.ComponentType<{ className?: string }>;
}

/**
 * Statistiques pour la sidebar (compteurs par section)
 */
interface DashboardStats {
  overview: number;
  performance: number;
  actions: number;
  risks: number;
  decisions: number;
  realtime: number;
}

/* ============================================================================
   COMPOSANTS UTILITAIRES
   ============================================================================ */

/**
 * Skeleton de chargement initial de la page
 */
function DashboardSkeleton() {
  return (
    <div className="h-full w-full flex items-center justify-center bg-slate-950">
      <div className="flex flex-col items-center gap-4 animate-pulse">
        <div className="relative">
          <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
          <div className="absolute inset-0 h-8 w-8 animate-ping text-blue-400/20" />
        </div>
        <p className="text-slate-400 text-sm font-medium">Chargement du dashboard...</p>
      </div>
    </div>
  );
}

/* ============================================================================
   COMPOSANT PRINCIPAL - DashboardPage
   ============================================================================ */

/**
 * Page wrapper avec TooltipProvider et Suspense
 */
export default function DashboardPage() {
  return (
    <TooltipProvider delayDuration={200}>
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </TooltipProvider>
  );
}

/* ============================================================================
   COMPOSANT PRINCIPAL - DashboardContent
   ============================================================================ */

/**
 * Composant principal du dashboard
 * 
 * Responsabilités:
 * - Gestion de l'état de navigation (via stores)
 * - Récupération et affichage des KPIs
 * - Gestion du refresh automatique
 * - Gestion des notifications
 * - Export des données
 * - Raccourcis clavier
 * 
 * Architecture:
 * - Header: SubNavigation + Breadcrumbs + KPIBar
 * - Main: Zone de contenu scrollable avec DashboardViewRouter
 * - Footer: Métriques et informations
 * - Overlays: Notifications, Modals
 */
const DashboardContent = memo(function DashboardContent() {
  // ─────────────────────────────────────────────────────────────────────────
  // LOGGER
  // ─────────────────────────────────────────────────────────────────────────
  const log = useLogger('DashboardContent');
  
  // ─────────────────────────────────────────────────────────────────────────
  // STORES - Navigation & UI State
  // ─────────────────────────────────────────────────────────────────────────
  
  // Navigation (source unique de vérité)
  const main = useDashboardNavigationStore((state) => state.main);
  const sub = useDashboardNavigationStore((state) => state.sub);
  const leaf = useDashboardNavigationStore((state) => state.leaf);
  
  // UI State (modals, sidebar, command palette)
  const sidebarCollapsed = useDashboardCommandCenterStore((state) => state.sidebarCollapsed);
  const toggleSidebar = useDashboardCommandCenterStore((state) => state.toggleSidebar);
  const toggleCommandPalette = useDashboardCommandCenterStore((state) => state.toggleCommandPalette);
  const openModal = useDashboardCommandCenterStore((state) => state.openModal);
  
  // ─────────────────────────────────────────────────────────────────────────
  // ÉTATS LOCAUX
  // ─────────────────────────────────────────────────────────────────────────
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [showExportMenu, setShowExportMenu] = useState(false);
  
  // ─────────────────────────────────────────────────────────────────────────
  // HOOKS - Données & Logique métier
  // ─────────────────────────────────────────────────────────────────────────
  
  // KPIs depuis l'API
  const { kpis: apiKpis, isLoading: kpisLoading, error: kpisError, lastUpdate: apiLastUpdate, refetch: refetchKPIsFromAPI } = useDashboardKPIs('year');
  
  // Filtre KPI (persisté dans localStorage)
  const { setKpiFilter } = useKPIFilter();
  
  // Métriques de performance
  const { performanceMetrics, updateLoadMetrics } = usePerformanceMetrics({
    componentName: 'DashboardContent',
    route: `${main}/${sub || ''}/${leaf || ''}`,
    logThreshold: 500,
  });
  
  // Notifications de changements de KPIs
  const { notifications: kpiChangeNotifications, addNotification, dismissNotification, clearAll: clearAllNotifications } = useKPINotifications({
    maxNotifications: 10,
    autoDismissMs: 5000,
  });
  
  // ─────────────────────────────────────────────────────────────────────────
  // REFRESH LOGIC - Gestion du refresh avec retry
  // ─────────────────────────────────────────────────────────────────────────
  
  // Ref stable pour refetchKPIsFromAPI
  const refetchKPIsFromAPIRef = useRef(refetchKPIsFromAPI);
  useEffect(() => {
    refetchKPIsFromAPIRef.current = refetchKPIsFromAPI;
  }, [refetchKPIsFromAPI]);
  
  // Hook de refresh avec retry automatique
  const {
    refresh: refreshKPIs,
    status: refreshStatus,
    refreshCount,
    lastUpdate: refreshLastUpdate,
  } = useDashboardRefresh({
    maxRetries: 3,
    onRefresh: async () => {
      if (refetchKPIsFromAPIRef.current) {
        await refetchKPIsFromAPIRef.current();
      }
    },
    onSuccess: (loadTime) => {
      setLastUpdate(new Date());
      updateLoadMetrics(loadTime);
    },
    onError: (error, retryAttempt) => {
      if (retryAttempt >= 3) {
        const errorNotification: KPINotification = {
          id: `error-${Date.now()}-${Math.random()}`,
          label: error.message.includes('Timeout') ? 'Timeout de chargement' : 'Erreur de chargement',
          oldValue: 'Échec' as string | number,
          newValue: `Après 3 tentatives` as string | number,
          timestamp: new Date(),
        };
        addNotification(errorNotification);
      }
    },
  });
  
  // Synchroniser lastUpdate avec refreshLastUpdate
  useEffect(() => {
    if (refreshLastUpdate) {
      setLastUpdate(refreshLastUpdate);
    }
  }, [refreshLastUpdate]);
  
  // Synchroniser lastUpdate avec apiLastUpdate
  const lastUpdateRef = useRef<string | undefined>(apiLastUpdate);
  useEffect(() => {
    if (apiLastUpdate && apiLastUpdate !== lastUpdateRef.current) {
      lastUpdateRef.current = apiLastUpdate;
      setLastUpdate(new Date(apiLastUpdate));
    }
  }, [apiLastUpdate]);
  
  // ─────────────────────────────────────────────────────────────────────────
  // AUTO-REFRESH - Gestion intelligente avec pause automatique
  // ─────────────────────────────────────────────────────────────────────────
  
  // État auto-refresh (persisté dans localStorage)
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('dashboard-auto-refresh');
        return saved !== null ? saved === 'true' : true;
      } catch {
        return true;
      }
    }
    return true;
  });
  
  // Intervalle de refresh (persisté dans localStorage)
  const [refreshInterval, setRefreshInterval] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('dashboard-refresh-interval');
        return saved ? parseInt(saved, 10) : 5 * 60 * 1000; // 5 minutes par défaut
      } catch {
        return 5 * 60 * 1000;
      }
    }
    return 5 * 60 * 1000;
  });
  
  // Protection contre les boucles infinies pour toggle auto-refresh
  const isTogglingRef = useRef(false);
  const toggleTimeoutRef = useRef<number | null>(null);
  
  const handleToggleAutoRefresh = useRef(() => {
    if (isTogglingRef.current) return;
    
    if (toggleTimeoutRef.current !== null) {
      clearTimeout(toggleTimeoutRef.current);
      toggleTimeoutRef.current = null;
    }
    
    isTogglingRef.current = true;
    setAutoRefreshEnabled(prev => {
      const newValue = !prev;
      toggleTimeoutRef.current = window.setTimeout(() => {
        isTogglingRef.current = false;
        toggleTimeoutRef.current = null;
      }, 1000);
      return newValue;
    });
  }).current;
  
  // Cleanup du timeout au démontage
  useEffect(() => {
    return () => {
      if (toggleTimeoutRef.current !== null) {
        clearTimeout(toggleTimeoutRef.current);
        toggleTimeoutRef.current = null;
      }
    };
  }, []);
  
  // Hook useAutoRefresh pour gérer l'auto-refresh intelligent
  // Gère la visibilité de l'onglet, le statut réseau, et les intervalles
  const { isOnline, isTabVisible, pause, resume } = useAutoRefresh({
    enabled: autoRefreshEnabled,
    interval: refreshInterval,
    onRefresh: refreshKPIs,
    onStatusChange: (status: 'idle' | 'paused') => {
      // Le hook useAutoRefresh gère automatiquement la pause/reprise
      // selon la visibilité et le statut réseau
      if (process.env.NODE_ENV === 'development') {
        log.debug(`Auto-refresh status: ${status}`);
      }
    },
  });
  
  // Persister les préférences avec debounce
  const lastPersistedAutoRefreshRef = useRef<string | null>(null);
  const lastPersistedIntervalRef = useRef<number | null>(null);
  const persistTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    const autoRefreshStr = String(autoRefreshEnabled);
    const intervalStr = String(refreshInterval);
    
    if (lastPersistedAutoRefreshRef.current === autoRefreshStr && 
        lastPersistedIntervalRef.current === refreshInterval) {
      return;
    }
    
    if (persistTimeoutRef.current) {
      clearTimeout(persistTimeoutRef.current);
    }
    
    if (typeof window !== 'undefined') {
      persistTimeoutRef.current = setTimeout(() => {
        try {
          localStorage.setItem('dashboard-auto-refresh', autoRefreshStr);
          localStorage.setItem('dashboard-refresh-interval', intervalStr);
          lastPersistedAutoRefreshRef.current = autoRefreshStr;
          lastPersistedIntervalRef.current = refreshInterval;
        } catch (error) {
          if (process.env.NODE_ENV === 'development') {
            console.warn('[Dashboard] Erreur lors de l\'écriture dans localStorage:', error);
          }
        }
        persistTimeoutRef.current = null;
      }, 500);
      
      return () => {
        if (persistTimeoutRef.current) {
          clearTimeout(persistTimeoutRef.current);
          persistTimeoutRef.current = null;
        }
      };
    }
  }, [autoRefreshEnabled, refreshInterval]);
  
  // Refresh initial après 5 secondes (une seule fois)
  const initialRefreshDoneRef = useRef(false);
  const timeoutsRef = useRef<number[]>([]);
  
  useEffect(() => {
    if (initialRefreshDoneRef.current) return;
    if (!autoRefreshEnabled || !isTabVisible || !isOnline) return;
    
    initialRefreshDoneRef.current = true;
    const id = window.setTimeout(() => {
      if (autoRefreshEnabled && isTabVisible && isOnline && refreshStatus !== 'paused') {
        refreshKPIs();
      }
    }, 5000);
    timeoutsRef.current.push(id);

    return () => {
      if (id) {
        clearTimeout(id);
        const index = timeoutsRef.current.indexOf(id);
        if (index > -1) {
          timeoutsRef.current.splice(index, 1);
        }
      }
    };
  }, [autoRefreshEnabled, isTabVisible, isOnline, refreshStatus, refreshKPIs]);
  
  // ─────────────────────────────────────────────────────────────────────────
  // KPIs DATA - Conversion et mémorisation
  // ─────────────────────────────────────────────────────────────────────────
  
  // Clé de comparaison stable pour éviter les recalculs inutiles
  const apiKpisKey = useMemo(() => {
    if (!apiKpis || apiKpis.length === 0) return '';
    return apiKpis.map(k => `${k.label}:${k.value}:${k.delta}`).join('|');
  }, [apiKpis]);
  
  // KPIs avec fallback sur valeurs par défaut
  const allKpis = useMemo<KPIData[]>(() => {
    if (apiKpis && apiKpis.length > 0) {
      return apiKpis.map(kpi => ({
        label: kpi.label,
        value: kpi.value,
        delta: kpi.delta,
        tone: kpi.tone,
        trend: kpi.trend,
        icon: kpi.icon,
      }));
    }
    
    // Valeurs par défaut (fallback)
    return [
      { label: 'Demandes', value: 247, delta: '+12', tone: 'ok' as const, icon: FileText, trend: 'up' as const },
      { label: 'Validations', value: '89%', delta: '+3%', tone: 'ok' as const, icon: CheckCircle2, trend: 'up' as const },
      { label: 'Blocages', value: 5, delta: '-2', tone: 'warn' as const, icon: AlertTriangle, trend: 'down' as const },
      { label: 'Risques critiques', value: 3, delta: '+1', tone: 'crit' as const, icon: AlertCircle, trend: 'up' as const },
      { label: 'Budget consommé', value: '67%', delta: '—', tone: 'info' as const, icon: DollarSign, trend: 'neutral' as const },
      { label: 'Décisions en attente', value: 8, delta: '—', tone: 'warn' as const, icon: Clock, trend: 'neutral' as const },
      { label: 'Temps réponse', value: '2.4j', delta: '-0.3j', tone: 'warn' as const, icon: Activity, trend: 'down' as const },
      { label: 'Conformité SLA', value: '94%', delta: '+2%', tone: 'ok' as const, icon: TrendingUp, trend: 'up' as const },
    ];
  }, [apiKpisKey]);
  
  // ─────────────────────────────────────────────────────────────────────────
  // DETECTION DES CHANGEMENTS DE KPIs
  // ─────────────────────────────────────────────────────────────────────────
  
  useKPIDiff({
    currentKpis: allKpis.map((k) => ({ label: k.label, value: k.value })),
    onChangesDetected: (changes) => {
      changes.forEach((change) => addNotification(change));
    },
  });
  
  // ─────────────────────────────────────────────────────────────────────────
  // HANDLERS - Actions utilisateur
  // ─────────────────────────────────────────────────────────────────────────
  
  // Handler pour clic sur KPI
  const handleKPIClick = useCallback((kpi: KPIData) => {
    const mapping = getKPIMappingByLabel(kpi.label);
    if (mapping) {
      openModal('kpi-drilldown', { kpi, kpiId: mapping.metadata.id });
    } else {
      openModal('kpi-drilldown', { kpi });
    }
  }, [openModal]);
  
  // Handler pour export des KPIs
  const exportKPIs = useCallback(async (format: 'csv' | 'json' | 'pdf' | 'excel' = 'csv') => {
    const data = allKpis.map(kpi => ({
      Label: kpi.label,
      Valeur: kpi.value,
      Variation: kpi.delta,
      Statut: kpi.tone,
      Tendance: kpi.trend,
    }));

    const timestamp = new Date().toISOString().split('T')[0];
    const baseFilename = `dashboard-kpis-${timestamp}`;

    try {
      if (format === 'csv') {
        const headers = Object.keys(data[0] || {}).join(',');
        const rows = data.map(row => Object.values(row).join(','));
        const csvContent = [headers, ...rows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${baseFilename}.csv`;
        link.click();
        URL.revokeObjectURL(url);
      } else if (format === 'json') {
        const jsonContent = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonContent], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${baseFilename}.json`;
        link.click();
        URL.revokeObjectURL(url);
      } else if (format === 'pdf' || format === 'excel') {
        try {
          const response = await fetch('/api/dashboard/export', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              format: format === 'pdf' ? 'pdf' : 'excel',
              data: data,
              sections: ['kpis'],
              period: 'year',
              includeGraphs: false,
              includeDetails: true,
            }),
          });

          if (response.ok) {
            const result = await response.json();
            if (result.downloadUrl) {
              window.open(result.downloadUrl, '_blank');
            } else {
              const blob = await response.blob();
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `${baseFilename}.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
              link.click();
              URL.revokeObjectURL(url);
            }
          } else {
            throw new Error('Erreur lors de la génération du fichier');
          }
        } catch (error) {
          log.error('Erreur export PDF/Excel', error instanceof Error ? error : new Error(String(error)));
          // Fallback: exporter en CSV
          exportKPIs('csv');
          return;
        }
      }

      // Notification de succès
      const successNotification: KPINotification = {
        id: `export-success-${Date.now()}`,
        label: 'Export réussi',
        oldValue: format.toUpperCase(),
        newValue: `${data.length} indicateur${data.length > 1 ? 's' : ''} exporté${data.length > 1 ? 's' : ''}`,
        timestamp: new Date(),
      };
      addNotification(successNotification);
      
      const timeoutId = window.setTimeout(() => {
        dismissNotification(successNotification.id);
      }, 3000);
      timeoutsRef.current.push(timeoutId);

    } catch (error) {
      log.error('Erreur lors de l\'export', error instanceof Error ? error : new Error(String(error)));
      const errorNotification: KPINotification = {
        id: `export-error-${Date.now()}`,
        label: 'Erreur d\'export',
        oldValue: format.toUpperCase(),
        newValue: 'Échec',
        timestamp: new Date(),
      };
      addNotification(errorNotification);
      
      const timeoutId = window.setTimeout(() => {
        dismissNotification(errorNotification.id);
      }, 5000);
      timeoutsRef.current.push(timeoutId);
    }

    setShowExportMenu(false);
  }, [allKpis, log, addNotification, dismissNotification]);
  
  // Handler pour afficher les raccourcis
  const handleShowShortcuts = useCallback(() => {
    const openModal = useDashboardCommandCenterStore.getState().openModal;
    openModal('shortcuts');
  }, []);
  
  // ─────────────────────────────────────────────────────────────────────────
  // RACCOURCIS CLAVIER
  // ─────────────────────────────────────────────────────────────────────────
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isTyping = target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target.isContentEditable;
      
      if (isTyping && e.key !== 'Escape') {
        return;
      }

      const isMod = e.ctrlKey || e.metaKey;
      const isShift = e.shiftKey;
      const isAlt = e.altKey;

      // Ctrl/Cmd + K : Command palette
      if (isMod && e.key === 'k') {
        e.preventDefault();
        toggleCommandPalette();
        return;
      }

      // Ctrl/Cmd + R : Refresh
      if (isMod && e.key === 'r' && !isShift) {
        e.preventDefault();
        refreshKPIs();
        return;
      }

      // Ctrl/Cmd + Shift + R : Refresh forcé
      if (isMod && isShift && e.key === 'R') {
        e.preventDefault();
        refreshKPIs();
        return;
      }

      // Escape : Fermer notifications ou menus
      if (e.key === 'Escape') {
        if (kpiChangeNotifications.length > 0) {
          clearAllNotifications();
          return;
        }
        if (showExportMenu) {
          setShowExportMenu(false);
          return;
        }
      }

      // Ctrl/Cmd + E : Export CSV
      if (isMod && e.key === 'e' && !isShift) {
        e.preventDefault();
        exportKPIs('csv');
        return;
      }

      // Ctrl/Cmd + Shift + E : Export JSON
      if (isMod && isShift && e.key === 'E') {
        e.preventDefault();
        exportKPIs('json');
        return;
      }

      // Ctrl/Cmd + / : Afficher raccourcis
      if (isMod && e.key === '/') {
        e.preventDefault();
        const openModal = useDashboardCommandCenterStore.getState().openModal;
        openModal('shortcuts');
        return;
      }

      // Ctrl/Cmd + F : Focus recherche KPI
      if (isMod && e.key === 'f' && !isShift) {
        e.preventDefault();
        const searchInput = document.querySelector('input[placeholder*="Rechercher un indicateur"]') as HTMLInputElement;
        searchInput?.focus();
        return;
      }

      // Alt + A : Toggle auto-refresh
      if (isAlt && e.key === 'a') {
        e.preventDefault();
        handleToggleAutoRefresh();
        return;
      }

      // Ctrl/Cmd + B : Toggle sidebar
      if (isMod && e.key === 'b') {
        e.preventDefault();
        toggleSidebar();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    toggleCommandPalette, 
    refreshKPIs, 
    kpiChangeNotifications.length, 
    showExportMenu, 
    exportKPIs,
    toggleSidebar,
    handleToggleAutoRefresh,
    clearAllNotifications,
  ]);
  
  // ─────────────────────────────────────────────────────────────────────────
  // STATS - Compteurs pour la sidebar
  // ─────────────────────────────────────────────────────────────────────────
  
  const stats: DashboardStats = useMemo(
    () => ({
      overview: 3,
      performance: 5,
      actions: 12,
      risks: 4,
      decisions: 8,
      realtime: 2,
    }),
    []
  );
  
  // ─────────────────────────────────────────────────────────────────────────
  // MÉMORISATION - Props et valeurs calculées
  // ─────────────────────────────────────────────────────────────────────────
  
  // Clé de navigation pour les transitions
  const navigationKey = useMemo(() => `${main}-${sub || ''}-${leaf || ''}`, [main, sub, leaf]);
  
  // Props pour DashboardKPIBar (mémorisées pour éviter les re-renders)
  const kpiBarProps = useMemo(() => ({
    kpis: allKpis,
    onKPIClick: handleKPIClick,
    onExport: exportKPIs,
    onRefresh: async () => {
      await refreshKPIs();
    },
    refreshInterval,
    autoRefreshEnabled,
    onAutoRefreshToggle: (enabled: boolean) => {
      if (enabled !== autoRefreshEnabled) {
        handleToggleAutoRefresh();
      }
    },
    onRefreshIntervalChange: setRefreshInterval,
    isOnline,
    isTabVisible,
    lastUpdate,
    performanceMetrics,
  }), [
    allKpis,
    handleKPIClick,
    exportKPIs,
    refreshKPIs,
    refreshInterval,
    autoRefreshEnabled,
    handleToggleAutoRefresh,
    setRefreshInterval,
    isOnline,
    isTabVisible,
    lastUpdate,
    performanceMetrics,
  ]);
  
  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  
  return (
    <>
      <div className="h-full w-full flex min-h-0 relative">
        {/* SIDEBAR - Navigation principale */}
        <ErrorBoundary>
          <aside
            className={cn(
              'relative z-30 transition-all duration-300 ease-in-out',
              sidebarCollapsed ? 'w-0 opacity-0 overflow-hidden' : 'w-auto opacity-100'
            )}
            aria-label="Navigation principale du dashboard"
          >
            <DashboardSidebar
              collapsed={sidebarCollapsed}
              stats={stats}
              onToggleCollapse={toggleSidebar}
              onOpenCommandPalette={toggleCommandPalette}
            />
          </aside>
        </ErrorBoundary>

        {/* CONTENT PRINCIPAL */}
        <section 
          className={cn(
            "flex-1 min-w-0 flex flex-col overflow-hidden",
            "bg-slate-950",
            "min-h-0 relative",
            "transition-all duration-300 ease-in-out"
          )}
          aria-label="Zone de contenu principal du dashboard"
          role="main"
        >
          {/* HEADER - Navigation et KPIs */}
          <header 
            className={cn(
              "sticky top-0 z-20",
              "bg-slate-950/90 backdrop-blur-xl",
              "border-b border-slate-800/60",
              "shadow-lg shadow-black/20",
              "transition-all duration-300 ease-in-out"
            )}
            aria-label="En-tête du dashboard"
          >
            {/* Sub Navigation (niveaux 2 et 3) */}
            <ErrorBoundary>
              <div className="relative">
                <DashboardSubNavigation stats={stats} />
              </div>
            </ErrorBoundary>

            {/* Breadcrumbs */}
            <ErrorBoundary>
              <DashboardBreadcrumbs />
            </ErrorBoundary>

            {/* KPI Bar */}
            <ErrorBoundary>
              <div className="border-b border-slate-800/40 bg-slate-900/30 transition-colors duration-200">
                <DashboardKPIBar {...kpiBarProps} />
              </div>
            </ErrorBoundary>
          </header>

          {/* ARIA Live Region - Annonces d'accessibilité */}
          <div 
            aria-live="polite" 
            aria-atomic="true" 
            className="sr-only"
            id="dashboard-announcements"
            role="status"
            aria-relevant="additions text"
          >
            {refreshStatus === 'loading' && (
              <span key="loading">Actualisation des données en cours. Veuillez patienter.</span>
            )}
            {refreshStatus === 'error' && (
              <span key="error">Erreur lors de l'actualisation des données. Veuillez réessayer.</span>
            )}
            {refreshStatus === 'idle' && refreshCount > 0 && (
              <span key={`success-${refreshCount}`}>
                Données actualisées avec succès. {allKpis.length} indicateur{allKpis.length > 1 ? 's' : ''} affiché{allKpis.length > 1 ? 's' : ''}.
              </span>
            )}
            {kpiChangeNotifications.length > 0 && (
              <span key={`notifications-${kpiChangeNotifications.length}`}>
                {kpiChangeNotifications.length} notification{kpiChangeNotifications.length > 1 ? 's' : ''} nouvelle{kpiChangeNotifications.length > 1 ? 's' : ''} disponible{kpiChangeNotifications.length > 1 ? 's' : ''}.
              </span>
            )}
          </div>
          
          {/* Skip to main content - Accessibilité */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg focus:shadow-lg"
          >
            Aller au contenu principal
          </a>

          {/* MAIN CONTENT AREA - Zone scrollable */}
          <main 
            id="main-content"
            className={cn(
              "flex-1 min-h-0 overflow-y-auto",
              "scrollbar-thin scrollbar-thumb-slate-700/50 scrollbar-track-transparent",
              "hover:scrollbar-thumb-slate-600/70",
              "focus-within:scrollbar-thumb-slate-500/80",
              "transition-all duration-200",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            )}
            aria-label="Contenu principal du dashboard"
            tabIndex={-1}
          >
            {/* Progress Indicator - Chargement */}
            {refreshStatus === 'loading' && (
              <div 
                className="sticky top-0 z-10 h-1 bg-slate-800/30 overflow-hidden"
                role="progressbar"
                aria-valuenow={100}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Chargement en cours"
                aria-live="polite"
              >
                <div 
                  className={cn(
                    "h-full bg-gradient-to-r",
                    "from-blue-500 via-cyan-400 to-blue-500",
                    "animate-pulse",
                    "relative overflow-hidden"
                  )}
                  style={{ width: '100%' }}
                >
                  <div 
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"
                    style={{ width: '200%', transform: 'translateX(-50%)' }}
                  />
                </div>
              </div>
            )}

            <div className="p-4 sm:p-6 lg:p-8 max-w-[1920px] mx-auto w-full">
              {/* CONTENT ROUTER - Chargement dynamique des vues */}
              <ErrorBoundary>
                <article
                  key={navigationKey}
                  className={cn(
                    "relative",
                    "animate-fadeIn",
                    "transition-all duration-500 ease-out",
                    "min-h-[60vh]",
                    refreshStatus === 'loading' && "opacity-60 pointer-events-none"
                  )}
                  aria-label={`Vue ${main}${sub ? ` - ${sub}` : ''}${leaf ? ` - ${leaf}` : ''}`}
                >
                  {/* Overlay de chargement */}
                  {refreshStatus === 'loading' && (
                    <div 
                      className={cn(
                        "absolute inset-0",
                        "bg-slate-950/30 backdrop-blur-sm",
                        "z-10 pointer-events-none",
                        "rounded-lg",
                        "animate-pulse"
                      )}
                      aria-hidden="true"
                    />
                  )}
                  
                  <Suspense 
                    fallback={
                      <div 
                        className="min-h-[400px] flex flex-col items-center justify-center gap-6"
                        role="status"
                        aria-label="Chargement du contenu"
                      >
                        <div className="relative">
                          <Loader2 className="h-10 w-10 animate-spin text-blue-400" aria-hidden="true" />
                          <div className="absolute inset-0 h-10 w-10 animate-ping text-blue-400/20" aria-hidden="true" />
                        </div>
                        <div className="text-center space-y-2">
                          <p className="text-slate-300 text-sm font-medium">Chargement du contenu...</p>
                          <p className="text-slate-500 text-xs">Veuillez patienter</p>
                        </div>
                        <ContentLoadingSkeleton />
                      </div>
                    }
                  >
                    <DashboardViewRouter />
                  </Suspense>
                </article>
              </ErrorBoundary>
            </div>
          </main>

          {/* FOOTER */}
          <footer 
            className={cn(
              "sticky bottom-0 z-10",
              "border-t border-slate-800/60",
              "bg-slate-950/95 backdrop-blur-xl",
              "shadow-lg shadow-black/10",
              "transition-all duration-300 ease-in-out"
            )}
            aria-label="Pied de page du dashboard"
          >
            <DashboardFooter
              version="6.0"
              performanceMetrics={performanceMetrics}
              isOnline={isOnline}
              autoRefreshEnabled={autoRefreshEnabled}
              refreshInterval={refreshInterval}
              onShowShortcuts={handleShowShortcuts}
            />
          </footer>
        </section>
      </div>

      {/* NOTIFICATIONS - Changements de KPIs */}
      <KPINotifications notifications={kpiChangeNotifications} onDismiss={dismissNotification} />

      {/* OVERLAY - Fermer menu d'export */}
      {showExportMenu && (
        <div
          className="fixed inset-0 z-40 pointer-events-auto"
          onClick={() => setShowExportMenu(false)}
          aria-hidden="true"
        />
      )}

      {/* MODALS - Chargement lazy */}
      <ErrorBoundary>
        <Suspense fallback={null}>
          <DashboardModals />
        </Suspense>
      </ErrorBoundary>
    </>
  );
});

DashboardContent.displayName = 'DashboardContent';
