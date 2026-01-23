/* -----------------------------------------------------------------------
   FILE: app/maitre-ouvrage/dashboard/page.tsx
   VERSION: 5.7 - FINALISÉ AVEC INDICATEURS VISUELS ET UX OPTIMISÉE
   
   AMÉLIORATIONS:
   - Design moderne avec animations fluides et effets visuels
   - KPIs enrichis avec icônes, visualisations (sparklines) et animations
   - KPIs cliquables avec indicateurs visuels (icône info au hover, ring bleu)
   - Transitions optimisées avec ErrorBoundary
   - Accessibilité complète (ARIA labels, roles, live regions, atomic)
   - Performance optimisée (useMemo, useCallback, memo)
   - Gestion d'erreurs robuste avec retry automatique (exponential backoff)
   - Timeout et cleanup appropriés pour éviter les memory leaks
   - Sparklines stables avec générateur pseudo-aléatoire
   - Raccourcis clavier étendus (Ctrl+K, Ctrl+R, Ctrl+E, Escape, Ctrl+/)
   - Export de données (CSV et JSON) avec menu déroulant
   - Notifications interactives (max 5 affichées, cliquables)
   - Persistance des préférences (localStorage pour filtres)
   - Modals détaillés avec graphiques historiques et métadonnées
   - Tooltips enrichis avec indication de clic
   - Effets visuels avancés (brillance, shimmer, scale, active states)
   - Types consolidés et code organisé
   - Responsive design complet
   - Annonces de statut pour l'accessibilité
   - Navigation clavier complète (Enter/Espace sur KPIs)
------------------------------------------------------------------------ */

'use client';

import React, { Suspense, useMemo, memo, useCallback, useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';
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
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  RefreshCw,
  Info,
  Zap,
  TrendingDown,
  Search,
  X,
  Download,
  Calendar,
  BarChart3,
  Settings
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';

// ✅ Importer le store Zustand
import { useDashboardCommandCenterStore } from '@/lib/stores/dashboardCommandCenterStore';
import { useDashboardNavigationStore } from '@/lib/stores/dashboardNavigationStore';
import type { DashboardMainCategory } from '@/modules/dashboard/types/dashboardNavigationTypes';

// ✅ Importer les composants de navigation existants
import { 
  DashboardSidebar, 
  DashboardSubNavigation, 
  DashboardViewRouter,
} from '@/modules/dashboard';
import { DashboardBreadcrumbs } from '@/modules/dashboard/components/DashboardBreadcrumbs';

// ✅ Importer les modals
import { DashboardModals } from '@/components/features/bmo/dashboard/command-center/DashboardModals';
import { getKPIMappingByLabel } from '@/lib/mappings/dashboardKPIMapping';
import { useDashboardKPIs } from '@/lib/hooks/useDashboardKPIs';
import { KPIAlertsSystem } from '@/components/features/bmo/dashboard/command-center/KPIAlertsSystem';
import { useLogger } from '@/lib/utils/logger';

/* =========================
   Loading Fallback
========================= */

function DashboardSkeleton() {
  return (
    <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
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

/* =========================
   Page Wrapper
========================= */

export default function DashboardPage() {
  return (
    <TooltipProvider delayDuration={200}>
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </TooltipProvider>
  );
}

/* =========================
   Composants mémorisés (définis avant utilisation)
========================= */

// Composant mémorisé pour KPIAlertsSystem
const KPIAlertsSystemMemoized = memo(function KPIAlertsSystemMemoized({ 
  kpis, 
  onAlert 
}: { 
  kpis: KPIData[]; 
  onAlert: (alert: { id: string; kpiLabel: string; message: string; timestamp: Date }) => void;
}) {
  const kpisForAlerts = useMemo(() => 
    kpis.map(kpi => ({
      label: kpi.label,
      value: kpi.value,
      delta: kpi.delta,
      tone: kpi.tone,
      trend: kpi.trend,
      icon: kpi.icon,
    })),
    [kpis]
  );

  return <KPIAlertsSystem kpis={kpisForAlerts} onAlert={onAlert} />;
});

// Composant mémorisé pour le contenu du Tooltip auto-refresh
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
    <div className="space-y-1 text-xs">
      <p className="font-semibold">
        {autoRefreshEnabled ? 'Refresh automatique activé' : 'Refresh automatique désactivé'}
      </p>
      <p className="text-slate-400">
        Intervalle: {Math.round(refreshInterval / 1000 / 60)} min
      </p>
      {!isTabVisible && (
        <p className="text-amber-400">⏸️ En pause (onglet invisible)</p>
      )}
      {!isOnline && (
        <p className="text-red-400">🔴 Hors ligne - Refresh suspendu</p>
      )}
      <p className="text-slate-500 pt-1 border-t border-slate-700 mt-1">
        Alt+A pour basculer
      </p>
    </div>
  );
});

// Composant mémorisé pour le contenu du Tooltip refresh
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
    <div className="space-y-1">
      <p>Actualiser les indicateurs (Ctrl+R)</p>
      {refreshCount > 0 && (
        <p className="text-xs text-slate-400">
          {refreshCount} actualisation{refreshCount > 1 ? 's' : ''}
        </p>
      )}
      {loadTime > 0 && (
        <p className="text-xs text-slate-400">
          Dernier chargement: {loadTime.toFixed(0)}ms
        </p>
      )}
      {!isTabVisible && (
        <p className="text-xs text-amber-400 mt-1">
          ⏸️ Refresh en pause (onglet invisible)
        </p>
      )}
    </div>
  );
});

// Composant mémorisé pour le contenu du Tooltip de comptage KPI
const KPICountTooltipContent = memo(function KPICountTooltipContent({
  count,
  total,
  filter,
}: {
  count: number;
  total: number;
  filter: string;
}) {
  return (
    <p className="text-xs">
      {filter 
        ? `${count} résultat${count > 1 ? 's' : ''} pour "${filter}"`
        : `${count} indicateur${count > 1 ? 's' : ''} affiché${count > 1 ? 's' : ''}`
      }
    </p>
  );
});

/* =========================
   Dashboard Content
========================= */

function DashboardContent() {
  // ✅ Initialiser le logger
  const log = useLogger('DashboardContent');
  
  // ✅ LIRE LE STORE DE NAVIGATION (source unique de vérité pour la navigation)
  // PATCH: Utiliser des sélecteurs spécifiques pour éviter les re-renders inutiles
  const main = useDashboardNavigationStore((state) => state.main);
  const sub = useDashboardNavigationStore((state) => state.sub);
  const leaf = useDashboardNavigationStore((state) => state.leaf);
  
  // ✅ LIRE LE STORE COMMAND CENTER (uniquement pour UI: modals, sidebar collapse, etc.)
  const sidebarCollapsed = useDashboardCommandCenterStore((state) => state.sidebarCollapsed);
  const toggleSidebar = useDashboardCommandCenterStore((state) => state.toggleSidebar);
  const toggleCommandPalette = useDashboardCommandCenterStore((state) => state.toggleCommandPalette);
  
  // ✅ Log de navigation avec timestamp
  // PATCH: Retirer log des dépendances car useLogger retourne une référence stable
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      log.debug('NAVIGATION:', { main, sub, leaf, timestamp: Date.now() });
    }
  }, [main, sub, leaf]); // log retiré des dépendances car stable

  // ✅ États locaux - déclarés en premier
  // Persister le filtre dans localStorage
  const [kpiFilter, setKpiFilter] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('dashboard-kpi-filter') || '';
    }
    return '';
  });
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [refreshStatus, setRefreshStatus] = useState<"idle" | "loading" | "error" | "paused" | "retrying">("idle");
  const [refreshCount, setRefreshCount] = useState(0);
  const [kpiChangeNotifications, setKpiChangeNotifications] = useState<Array<{
    id: string;
    label: string;
    oldValue: string | number;
    newValue: string | number;
    timestamp: Date;
  }>>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<{
    loadTime: number;
    renderTime: number;
    memoryDelta?: number;
    webVitals?: {
      fcp?: number; // First Contentful Paint
      lcp?: number; // Largest Contentful Paint
      fid?: number; // First Input Delay
      cls?: number; // Cumulative Layout Shift
      ttfb?: number; // Time to First Byte
    };
  }>({
    loadTime: 0,
    renderTime: 0,
  });
  const [retryCount, setRetryCount] = useState(0);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const maxRetries = 3;

  // ✅ Log du render avec navigation
  useEffect(() => {
    log.debug('Render avec navigation', {
      main,
      sub,
      leaf,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [main, sub, leaf]); // log est stable

  // ✅ Handler pour ouvrir le modal KPI
  const openModal = useDashboardCommandCenterStore((state) => state.openModal);
  const handleKPIClick = useCallback((kpi: KPIData) => {
    // Utiliser le système de mapping pour trouver l'ID du KPI
    const mapping = getKPIMappingByLabel(kpi.label);
    if (mapping) {
      openModal('kpi-drilldown', { kpi, kpiId: mapping.metadata.id });
    } else {
      openModal('kpi-drilldown', { kpi });
    }
  }, [openModal]);

  /* =========================
     KPI Configuration avec données réelles de l'API
  ========================= */

  // ✅ Utiliser le hook pour récupérer les données réelles
  const { kpis: apiKpis, isLoading: kpisLoading, error: kpisError, lastUpdate: apiLastUpdate, refetch: refetchKPIsFromAPI } = useDashboardKPIs('year');
  
  // PATCH: Mémoriser refetchKPIsFromAPI avec useRef pour éviter les changements de référence
  // Ne jamais mettre à jour la ref dans le corps du composant
  const refetchKPIsFromAPIRef = useRef(refetchKPIsFromAPI);
  useEffect(() => {
    refetchKPIsFromAPIRef.current = refetchKPIsFromAPI;
  }, [refetchKPIsFromAPI]);

  // ✅ Convertir les données de l'API au format KPIData
  // Utiliser une comparaison stable pour éviter les re-renders inutiles
  // PATCH: Utiliser une clé de comparaison basée sur les valeurs pour éviter les recalculs inutiles
  const apiKpisKey = useMemo(() => {
    if (!apiKpis || apiKpis.length === 0) return '';
    return apiKpis.map(k => `${k.label}:${k.value}:${k.delta}`).join('|');
  }, [apiKpis]);
  
  const allKpis = useMemo<KPIData[]>(() => {
    // Si les données de l'API sont disponibles, les utiliser
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
    
    // Sinon, utiliser les valeurs par défaut (référence stable)
    return [
      { 
        label: 'Demandes', 
        value: 247, 
        delta: '+12', 
        tone: 'ok' as const,
        icon: FileText,
        trend: 'up' as const
      },
      { 
        label: 'Validations', 
        value: '89%', 
        delta: '+3%', 
        tone: 'ok' as const,
        icon: CheckCircle2,
        trend: 'up' as const
      },
      { 
        label: 'Blocages', 
        value: 5, 
        delta: '-2', 
        tone: 'warn' as const,
        icon: AlertTriangle,
        trend: 'down' as const
      },
      { 
        label: 'Risques critiques', 
        value: 3, 
        delta: '+1', 
        tone: 'crit' as const,
        icon: AlertCircle,
        trend: 'up' as const
      },
      { 
        label: 'Budget consommé', 
        value: '67%', 
        delta: '—', 
        tone: 'info' as const,
        icon: DollarSign,
        trend: 'neutral' as const
      },
      { 
        label: 'Décisions en attente', 
        value: 8, 
        delta: '—', 
        tone: 'warn' as const,
        icon: Clock,
        trend: 'neutral' as const
      },
      { 
        label: 'Temps réponse', 
        value: '2.4j', 
        delta: '-0.3j', 
        tone: 'warn' as const,
        icon: Activity,
        trend: 'down' as const
      },
      { 
        label: 'Conformité SLA', 
        value: '94%', 
        delta: '+2%', 
        tone: 'ok' as const,
        icon: TrendingUp,
        trend: 'up' as const
      },
    ];
  }, [apiKpisKey]); // Utiliser la clé au lieu de apiKpis directement

  // ✅ Mettre à jour lastUpdate si l'API fournit une date
  // PATCH: Utiliser une comparaison pour éviter les mises à jour inutiles
  const lastUpdateRef = useRef<string | undefined>(apiLastUpdate);
  useEffect(() => {
    if (apiLastUpdate && apiLastUpdate !== lastUpdateRef.current) {
      lastUpdateRef.current = apiLastUpdate;
      setLastUpdate(new Date(apiLastUpdate));
    }
  }, [apiLastUpdate]);

  // ✅ Persister le filtre dans localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (kpiFilter) {
        localStorage.setItem('dashboard-kpi-filter', kpiFilter);
      } else {
        localStorage.removeItem('dashboard-kpi-filter');
      }
    }
  }, [kpiFilter]);

  // ✅ Debounce pour le filtre de recherche KPI (optimisation performance)
  const [debouncedKpiFilter, setDebouncedKpiFilter] = useState(kpiFilter);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKpiFilter(kpiFilter);
    }, 200); // Debounce de 200ms
    
    return () => clearTimeout(timer);
  }, [kpiFilter]);

  // ✅ KPIs filtrés avec optimisation de recherche et cache
  const topKpis = useMemo(() => {
    if (!debouncedKpiFilter.trim()) return allKpis;
    const filterLower = debouncedKpiFilter.toLowerCase().trim();
    return allKpis.filter(kpi => {
      const labelLower = kpi.label.toLowerCase();
      return labelLower.includes(filterLower);
    });
  }, [allKpis, debouncedKpiFilter]);

  const stats = useMemo(
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

  // ✅ Mesure des performances avec tracking amélioré
  // PATCH: Utiliser useRef pour éviter les re-renders inutiles
  const renderStartTimeRef = useRef<number>(0);
  const renderCountRef = useRef<number>(0);
  
  useEffect(() => {
    renderStartTimeRef.current = performance.now();
    renderCountRef.current += 1;
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - renderStartTimeRef.current;
      
      // Ne mettre à jour que si le temps de rendu est significatif (> 10ms)
      if (renderTime > 10) {
        // Type guard pour performance.memory (Chrome/Edge uniquement)
        const perfMemory = (performance as any).memory;
        const endMemory = perfMemory ? perfMemory.usedJSHeapSize : 0;
        const startMemory = perfMemory ? perfMemory.usedJSHeapSize : 0;
        
        setPerformanceMetrics(prev => ({
          ...prev,
          renderTime,
          // Log uniquement si le temps de rendu est significatif (dev mode)
          ...(process.env.NODE_ENV === 'development' && renderTime > 50 && perfMemory && {
            memoryDelta: endMemory - startMemory,
          }),
        }));
        
        // Log de performance en dev uniquement
        if (process.env.NODE_ENV === 'development' && renderTime > 100) {
          log.warn('Rendu lent détecté', {
            renderTime: `${renderTime.toFixed(2)}ms`,
            route: `${main}/${sub || ''}/${leaf || ''}`,
          });
        }
      }
    };
  }, [main, sub, leaf]); // log retiré des dépendances car stable

  // ✅ Stocker les KPIs précédents pour détecter les changements
  const previousKpisRef = useRef<KPIData[] | null>(null);
  const hasInitializedRef = useRef(false);
  
  // ✅ Détecter les changements de KPIs après mise à jour
  // PATCH 2 — Correction du bug de duplication des notifications
  // PATCH 4 — Amélioration de la comparaison pour éviter les boucles infinies
  // PATCH 5 — Utiliser une clé de comparaison stable pour éviter les mises à jour inutiles
  const allKpisKeyRef = useRef<string>('');
  
  useEffect(() => {
    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true;
      // Créer une clé stable pour la première initialisation
      const initialKey = allKpis.map(k => `${k.label}:${k.value}`).join('|');
      allKpisKeyRef.current = initialKey;
      previousKpisRef.current = allKpis;
      return;
    }

    // Comparaison profonde pour éviter les déclenchements inutiles
    // Créer une clé de comparaison basée sur les valeurs réelles
    const currentKey = allKpis.map(k => `${k.label}:${k.value}`).join('|');
    
    // Si les valeurs sont identiques, ne rien faire (même si la référence change)
    if (currentKey === allKpisKeyRef.current) {
      // Ne PAS mettre à jour previousKpisRef.current si les valeurs sont identiques
      // Cela évite de créer une nouvelle référence qui déclencherait le useEffect à nouveau
      return;
    }

    // Les valeurs ont changé, mettre à jour la clé et la référence
    allKpisKeyRef.current = currentKey;
    const prev = previousKpisRef.current;
    previousKpisRef.current = allKpis; // ✅ IMPORTANT: on "commit" le snapshot TOUT DE SUITE

    if (prev === null || prev.length !== allKpis.length) return;

    const changes: typeof kpiChangeNotifications = [];

    allKpis.forEach((kpi, index) => {
      const previousKpi = prev[index];
      if (previousKpi && previousKpi.value !== kpi.value) {
        changes.push({
          id: `${Date.now()}-${index}-${Math.random()}`,
          label: kpi.label,
          oldValue: previousKpi.value,
          newValue: kpi.value,
          timestamp: new Date(),
        });
      }
    });

    if (changes.length === 0) return;

    // Utiliser une fonction de mise à jour pour éviter les dépendances
    setKpiChangeNotifications((p) => [...p, ...changes]);

    const timeouts = changes.map((change) =>
      window.setTimeout(() => {
        setKpiChangeNotifications((p) => p.filter((n) => n.id !== change.id));
      }, 5000)
    );

    return () => timeouts.forEach((t) => clearTimeout(t));
  }, [allKpis]);

  // ✅ Fonction interne de refresh avec retry - utilise maintenant l'API réelle
  const timeoutsRef = useRef<number[]>([]);
  const retryTimeoutsRef = useRef<number[]>([]); // PATCH 3 — Registre pour les timeouts de retry
  const refreshStatusRef = useRef(refreshStatus);
  const isMountedRef = useRef(true); // ✅ Ref pour savoir si le composant est monté
  const initialRefreshDoneRef = useRef(false); // PATCH: Ref pour éviter les déclenchements multiples du refresh initial
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null); // PATCH: Ref pour l'intervalle de refresh périodique
  
  // Synchroniser la ref avec l'état
  useEffect(() => {
    refreshStatusRef.current = refreshStatus;
  }, [refreshStatus]);
  
  // ✅ Marquer le composant comme démonté au cleanup
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      // Annuler tous les retries en cours
      retryTimeoutsRef.current.forEach(clearTimeout);
      retryTimeoutsRef.current = [];
    };
  }, []);
  
  const refreshKPIsInternal = useCallback(async (retryAttempt = 0): Promise<void> => {
    // ✅ Vérifier si le composant est encore monté
    if (!isMountedRef.current) {
      return;
    }
    // Si le refresh est en pause, on n'arrête pas tout silencieusement : on assume l'état
    if (refreshStatusRef.current === "paused") {
      return;
    }

    // Éviter les refreshes multiples simultanés
    if (refreshStatusRef.current === "loading" || refreshStatusRef.current === "retrying") {
      if (process.env.NODE_ENV === 'development') {
        log.warn('Refresh déjà en cours, ignoré', { retryAttempt, status: refreshStatusRef.current });
      }
      return;
    }

    const startTime = performance.now();
    
    try {
      // Définir le statut selon si c'est un retry ou non
      if (retryAttempt > 0) {
        setRefreshStatus("retrying");
        setRetryCount(retryAttempt);
      } else {
        setRefreshStatus("loading");
      }
      
      // Utiliser l'API réelle via le hook (via ref pour éviter les dépendances)
      if (refetchKPIsFromAPIRef.current) {
        await refetchKPIsFromAPIRef.current();
      }
      
      // Réinitialiser le compteur de retry en cas de succès
      if (retryAttempt > 0) {
        setRetryCount(0);
      }

      setLastUpdate(new Date());
      setRefreshCount(prev => prev + 1);
      setRefreshStatus("idle");
      
      const loadTime = performance.now() - startTime;
      
      // ✅ Collecter les Web Vitals si disponibles
      let webVitals: typeof performanceMetrics.webVitals = {};
      if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
        try {
          // Récupérer les métriques depuis Performance API
          const perfEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
          if (perfEntries.length > 0) {
            const navTiming = perfEntries[0];
            webVitals.ttfb = navTiming.responseStart - navTiming.requestStart;
          }
          
          // Récupérer FCP si disponible
          const paintEntries = performance.getEntriesByType('paint') as PerformancePaintTiming[];
          const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
          if (fcpEntry) {
            webVitals.fcp = fcpEntry.startTime;
          }
        } catch (e) {
          // Ignorer les erreurs de Web Vitals
          if (process.env.NODE_ENV === 'development') {
            log.debug('Web Vitals non disponibles', { error: e instanceof Error ? e.message : String(e) });
          }
        }
      }
      
      setPerformanceMetrics(prev => ({ 
        ...prev, 
        loadTime,
        webVitals: Object.keys(webVitals).length > 0 ? webVitals : prev.webVitals
      }));
      
      // ✅ Marquer le timestamp du dernier refresh réussi (pour éviter les doubles)
      if (typeof window !== 'undefined') {
        (window as any).__lastDashboardRefresh = Date.now();
      }
      
      if (process.env.NODE_ENV === 'development') {
        log.performance('KPIs refresh', loadTime);
        if (Object.keys(webVitals).length > 0) {
          log.debug('Web Vitals', webVitals);
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      const err = error instanceof Error ? error : new Error(errorMessage);
      log.error('Erreur lors du refresh des KPIs', err, { retryAttempt, maxRetries });
      
      // Retry automatique avec exponential backoff
      if (retryAttempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, retryAttempt), 10000); // Max 10s
        
        if (process.env.NODE_ENV === 'development') {
          log.info(`Retry ${retryAttempt + 1}/${maxRetries} dans ${delay}ms`, {
            retryAttempt: retryAttempt + 1,
            maxRetries,
            delay,
          });
        }
        
        // Planifier le retry - PATCH 3 : utiliser retryTimeoutsRef
        // ✅ Vérifier si le composant est encore monté avant de planifier le retry
        if (!isMountedRef.current) {
          return;
        }
        const t = window.setTimeout(() => {
          // ✅ Vérifier à nouveau avant d'exécuter le retry
          if (isMountedRef.current) {
            refreshKPIsInternal(retryAttempt + 1);
          }
        }, delay);
        retryTimeoutsRef.current.push(t);
        return;
      }
      
      // Après épuisement des retries, afficher l'erreur
      setRefreshStatus("error");
      const errorNotification = {
        id: `error-${Date.now()}-${Math.random()}`,
        label: errorMessage.includes('Timeout') ? 'Timeout de chargement' : 'Erreur de chargement',
        oldValue: 'Échec' as string | number,
        newValue: `Après ${maxRetries} tentatives` as string | number,
        timestamp: new Date(),
      };
      
      setKpiChangeNotifications(prev => [...prev, errorNotification]);
      setRetryCount(0); // Reset après affichage de l'erreur
      
      // Auto-dismiss après 10 secondes pour les erreurs finales
      const timeoutId = window.setTimeout(() => {
        setKpiChangeNotifications(prev => 
          prev.filter(n => n.id !== errorNotification.id)
        );
      }, 10000);
      timeoutsRef.current.push(timeoutId);
    }
  }, [maxRetries]); // refetchKPIsFromAPI retiré, utilisant refetchKPIsFromAPIRef à la place

  // ✅ Cleanup des timeouts au démontage
  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(clearTimeout);
      timeoutsRef.current = [];
    };
  }, []);

  // PATCH 3 — Cleanup des timeouts de retry au démontage
  useEffect(() => {
    return () => {
      retryTimeoutsRef.current.forEach(clearTimeout);
      retryTimeoutsRef.current = [];
    };
  }, []);

  // ✅ Fonction publique de refresh (pour les handlers d'événements)
  // PATCH: Utiliser directement refreshKPIsInternalRef pour éviter les dépendances
  const refreshKPIs = useCallback(() => {
    refreshKPIsInternalRef.current(0);
  }, []); // Dépendances vides - utiliser la ref directement

  // ✅ Fonction d'export des données KPIs améliorée avec PDF/Excel
  const exportKPIs = useCallback(async (format: 'csv' | 'json' | 'pdf' | 'excel' = 'csv') => {
    const data = topKpis.map(kpi => ({
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
        // Utiliser l'API pour générer PDF/Excel
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
            // Si l'API retourne une URL de téléchargement
            if (result.downloadUrl) {
              window.open(result.downloadUrl, '_blank');
            } else {
              // Sinon, télécharger directement le blob
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
          // Fallback: exporter en CSV si PDF/Excel échoue
          exportKPIs('csv');
          return;
        }
      }

      // Notification de succès (utiliser le système de notifications existant)
      const successNotification = {
        id: `export-success-${Date.now()}`,
        label: 'Export réussi',
        oldValue: format.toUpperCase(),
        newValue: `${data.length} indicateur${data.length > 1 ? 's' : ''} exporté${data.length > 1 ? 's' : ''}`,
        timestamp: new Date(),
      };
      setKpiChangeNotifications(prev => [...prev, successNotification]);
      
      // Auto-dismiss après 3 secondes
      setTimeout(() => {
        setKpiChangeNotifications(prev => 
          prev.filter(n => n.id !== successNotification.id)
        );
      }, 3000);

    } catch (error) {
      log.error('Erreur lors de l\'export', error instanceof Error ? error : new Error(String(error)));
      const errorNotification = {
        id: `export-error-${Date.now()}`,
        label: 'Erreur d\'export',
        oldValue: format.toUpperCase(),
        newValue: 'Échec',
        timestamp: new Date(),
      };
      setKpiChangeNotifications(prev => [...prev, errorNotification]);
      
      setTimeout(() => {
        setKpiChangeNotifications(prev => 
          prev.filter(n => n.id !== errorNotification.id)
        );
      }, 5000);
    }

    setShowExportMenu(false);
  }, [topKpis, log]);

  // ✅ Gestion intelligente du refresh avec pause automatique
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('dashboard-auto-refresh');
      return saved !== null ? saved === 'true' : true;
    }
    return true;
  });
  
  // PATCH: Mémoriser le handler pour éviter les re-renders inutiles
  // Ajouter une protection contre les clics multiples rapides et les boucles infinies
  const isTogglingRef = useRef(false);
  // Handler mémorisé avec protection renforcée contre les boucles infinies
  const handleToggleAutoRefresh = useRef(() => {
    // Éviter les appels multiples - protection contre les boucles infinies
    if (isTogglingRef.current) {
      return;
    }
    
    isTogglingRef.current = true;
    
    // Utiliser une fonction de mise à jour pour éviter les dépendances
    setAutoRefreshEnabled(prev => {
      const newValue = !prev;
      // Réinitialiser le flag après un délai
      setTimeout(() => {
        isTogglingRef.current = false;
      }, 1000);
      return newValue;
    });
  }).current;
  
  const [refreshInterval, setRefreshInterval] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('dashboard-refresh-interval');
      return saved ? parseInt(saved, 10) : 5 * 60 * 1000; // 5 minutes par défaut
    }
    return 5 * 60 * 1000;
  });

  // ✅ Détection de la visibilité de l'onglet (pause automatique)
  const [isTabVisible, setIsTabVisible] = useState(true);
  const isTabVisibleRef = useRef(true);
  
  // ✅ Détection de la connexion réseau (déclaré avant les useEffects qui l'utilisent)
  const [isOnline, setIsOnline] = useState(() => {
    if (typeof window !== 'undefined') {
      return navigator.onLine;
    }
    return true;
  });
  const isOnlineRef = useRef(isOnline);
  
  // Ne plus utiliser useMemo pour le bouton - cela cause des boucles infinies
  // Le bouton sera créé directement dans le JSX
  
  // Synchroniser les refs avec les états
  useEffect(() => {
    isTabVisibleRef.current = isTabVisible;
  }, [isTabVisible]);
  
  useEffect(() => {
    isOnlineRef.current = isOnline;
  }, [isOnline]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      const visible = !document.hidden;
      // PATCH: Ne mettre à jour que si la valeur change vraiment
      if (isTabVisibleRef.current !== visible) {
        setIsTabVisible(visible);
        // Utiliser autoRefreshEnabledRef au lieu de autoRefreshEnabled pour éviter les dépendances
        if (visible && autoRefreshEnabledRef.current && refreshStatusRef.current === 'idle') {
          // Reprendre le refresh si l'onglet redevient visible
          if (process.env.NODE_ENV === 'development') {
            log.debug('Onglet visible, reprise du refresh automatique');
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []); // Dépendances vides - utiliser les refs pour éviter les re-renders

  // ✅ Utiliser useRef pour stocker les fonctions et éviter les re-renders
  // PATCH: refreshKPIs est stable (dépendances vides), donc refreshKPIsPublicRef n'a pas besoin d'être mis à jour
  const refreshKPIsPublicRef = useRef(refreshKPIs);
  const refreshKPIsInternalRef = useRef(refreshKPIsInternal);
  
  // Mettre à jour seulement refreshKPIsInternalRef car refreshKPIsInternal peut changer
  // refreshKPIs est stable (dépendances vides), donc refreshKPIsPublicRef n'a pas besoin d'être mis à jour
  useEffect(() => {
    refreshKPIsInternalRef.current = refreshKPIsInternal;
    // refreshKPIs est stable, donc on peut le mettre à jour une seule fois
    refreshKPIsPublicRef.current = refreshKPIs;
  }, [refreshKPIsInternal]); // Seulement refreshKPIsInternal, car refreshKPIs est stable

  // ✅ Persister les préférences avec debounce pour éviter les écritures excessives
  // PATCH: Utiliser des refs pour éviter les déclenchements inutiles et les boucles infinies
  const lastPersistedAutoRefreshRef = useRef<string | null>(null);
  const lastPersistedIntervalRef = useRef<number | null>(null);
  const persistTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    // Ne persister que si les valeurs ont vraiment changé
    const autoRefreshStr = String(autoRefreshEnabled);
    const intervalStr = String(refreshInterval);
    
    if (lastPersistedAutoRefreshRef.current === autoRefreshStr && 
        lastPersistedIntervalRef.current === refreshInterval) {
      return; // Pas de changement, pas besoin de persister
    }
    
    // Nettoyer le timeout précédent si existant
    if (persistTimeoutRef.current) {
      clearTimeout(persistTimeoutRef.current);
    }
    
    if (typeof window !== 'undefined') {
      persistTimeoutRef.current = setTimeout(() => {
        localStorage.setItem('dashboard-auto-refresh', autoRefreshStr);
        localStorage.setItem('dashboard-refresh-interval', intervalStr);
        // Mettre à jour les refs après la persistance
        lastPersistedAutoRefreshRef.current = autoRefreshStr;
        lastPersistedIntervalRef.current = refreshInterval;
        persistTimeoutRef.current = null;
      }, 500); // Debounce de 500ms
      
      return () => {
        if (persistTimeoutRef.current) {
          clearTimeout(persistTimeoutRef.current);
          persistTimeoutRef.current = null;
        }
      };
    }
  }, [autoRefreshEnabled, refreshInterval]);

  // ✅ Refresh initial après 5 secondes (seulement si auto-refresh activé, onglet visible et en ligne)
  // PATCH: Utiliser les refs pour éviter les dépendances instables et les déclenchements multiples
  const autoRefreshEnabledRef = useRef(autoRefreshEnabled);
  
  // Mettre à jour la ref de manière synchrone pour éviter les problèmes de timing
  autoRefreshEnabledRef.current = autoRefreshEnabled;
  
  useEffect(() => {
    // Ne déclencher le refresh initial qu'une seule fois au montage si auto-refresh est activé
    if (initialRefreshDoneRef.current) return;
    
    // Utiliser les refs pour éviter les dépendances instables
    if (!autoRefreshEnabledRef.current || !isTabVisibleRef.current || !isOnlineRef.current) return;
    
    initialRefreshDoneRef.current = true;
    const id = window.setTimeout(() => {
      // Utiliser les refs pour vérifier les conditions
      if (isMountedRef.current && 
          autoRefreshEnabledRef.current && 
          isTabVisibleRef.current && 
          isOnlineRef.current && 
          refreshStatusRef.current !== 'paused') {
        refreshKPIsInternalRef.current(0);
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
  }, []); // Dépendances vides - ne se déclenche qu'une seule fois au montage

  // ✅ Refresh périodique avec intervalle configurable et pause si onglet invisible ou hors ligne
  // PATCH: Utiliser un seul useEffect avec une protection contre les boucles infinies
  useEffect(() => {
    // Toujours nettoyer l'intervalle précédent avant d'en créer un nouveau
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
    
    // Ne créer l'intervalle que si auto-refresh est activé et en ligne
    if (!autoRefreshEnabled || !isOnlineRef.current) {
      return;
    }
    
    // Créer le nouvel intervalle
    refreshIntervalRef.current = setInterval(() => {
      // Utiliser les refs pour vérifier les conditions (évite les dépendances)
      if (isMountedRef.current && 
          autoRefreshEnabledRef.current && 
          isTabVisibleRef.current && 
          isOnlineRef.current && 
          refreshStatusRef.current !== 'paused') {
        // Vérifier que le dernier refresh n'est pas trop récent (éviter les doubles)
        const now = Date.now();
        const lastRefreshTime = (window as any).__lastDashboardRefresh || 0;
        const minInterval = 10000; // Minimum 10 secondes entre refreshes
        
        if (now - lastRefreshTime > minInterval) {
          (window as any).__lastDashboardRefresh = now;
          refreshKPIsPublicRef.current();
        }
      }
    }, refreshInterval);

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    };
  }, [autoRefreshEnabled, refreshInterval]); // Dépendances nécessaires pour réagir aux changements

  // ✅ Gestion des événements réseau (online/offline)
  // PATCH: Utiliser refreshKPIsPublicRef et autoRefreshEnabledRef pour éviter les dépendances instables
  useEffect(() => {
    const handleOnline = () => {
      // PATCH: Ne mettre à jour que si la valeur change vraiment
      if (!isOnlineRef.current) {
        setIsOnline(true);
        if (process.env.NODE_ENV === 'development') {
          log.info('Connexion rétablie');
        }
        // Relancer le refresh si auto-refresh est activé (utiliser la ref)
        if (autoRefreshEnabledRef.current && refreshStatusRef.current === 'idle') {
          setTimeout(() => refreshKPIsPublicRef.current(), 2000);
        }
      }
    };

    const handleOffline = () => {
      // PATCH: Ne mettre à jour que si la valeur change vraiment
      if (isOnlineRef.current) {
        setIsOnline(false);
        if (process.env.NODE_ENV === 'development') {
          log.warn('Connexion perdue');
        }
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []); // Dépendances vides - utiliser les refs pour éviter les re-renders

  // ✅ Raccourcis clavier avec gestion améliorée et étendue
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignorer si on tape dans un input/textarea/contenteditable
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

      // Ctrl/Cmd + K pour ouvrir le command palette
      if (isMod && e.key === 'k') {
        e.preventDefault();
        toggleCommandPalette();
        return;
      }

      // Ctrl/Cmd + R pour refresh
      if (isMod && e.key === 'r' && !isShift) {
        e.preventDefault();
        refreshKPIs();
        return;
      }

      // Ctrl/Cmd + Shift + R pour refresh forcé (ignorer cache)
      if (isMod && isShift && e.key === 'R') {
        e.preventDefault();
        refreshKPIs();
        return;
      }

      // Echap pour fermer les notifications ou menus
      if (e.key === 'Escape') {
        if (kpiChangeNotifications.length > 0) {
          setKpiChangeNotifications([]);
          return;
        }
        if (showExportMenu) {
          setShowExportMenu(false);
          return;
        }
      }

      // Ctrl/Cmd + E pour exporter CSV
      if (isMod && e.key === 'e' && !isShift) {
        e.preventDefault();
        exportKPIs('csv');
        return;
      }

      // Ctrl/Cmd + Shift + E pour exporter JSON
      if (isMod && isShift && e.key === 'E') {
        e.preventDefault();
        exportKPIs('json');
        return;
      }

      // Ctrl/Cmd + / pour afficher les raccourcis
      if (isMod && e.key === '/') {
        e.preventDefault();
        const openModal = useDashboardCommandCenterStore.getState().openModal;
        openModal('shortcuts');
        return;
      }

      // Ctrl/Cmd + F pour focus sur la recherche KPI
      if (isMod && e.key === 'f' && !isShift) {
        e.preventDefault();
        const searchInput = document.querySelector('input[placeholder*="Rechercher un indicateur"]') as HTMLInputElement;
        searchInput?.focus();
        return;
      }

      // Alt + A pour toggle auto-refresh
      if (isAlt && e.key === 'a') {
        e.preventDefault();
        handleToggleAutoRefresh();
        return;
      }

      // Ctrl/Cmd + B pour toggle sidebar
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
    handleToggleAutoRefresh
  ]);

  /* =========================
     Render
  ========================= */

  // Mémoriser les className pour éviter les re-renders avec TooltipTrigger asChild
  const autoRefreshButtonClassName = useMemo(() => cn(
    'p-1.5 rounded-md transition-all duration-200',
    'hover:bg-slate-800/50 active:scale-95',
    'focus:outline-none focus:ring-2 focus:ring-blue-500/50',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    autoRefreshEnabled && isOnline 
      ? 'bg-emerald-500/10 text-emerald-400' 
      : 'bg-slate-800/50 text-slate-400'
  ), [autoRefreshEnabled, isOnline]);

  const autoRefreshIconClassName = useMemo(() => cn(
    "h-3.5 w-3.5",
    autoRefreshEnabled && isOnline && "animate-pulse"
  ), [autoRefreshEnabled, isOnline]);

  // Mémoriser l'aria-label pour éviter les re-renders
  const autoRefreshAriaLabel = useMemo(() => 
    autoRefreshEnabled ? 'Désactiver le refresh automatique' : 'Activer le refresh automatique',
    [autoRefreshEnabled]
  );

  // Mémoriser le handler onClick pour éviter les re-renders
  // handleToggleAutoRefresh est stable (useRef), donc pas besoin de dépendances
  const handleAutoRefreshClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    handleToggleAutoRefresh();
  }, []); // Pas de dépendances car handleToggleAutoRefresh est stable via useRef

  // Mémoriser tous les handlers de boutons pour éviter les re-renders
  const handleClearKpiFilter = useCallback(() => {
    setKpiFilter('');
  }, []);

  const handleToggleExportMenu = useCallback(() => {
    setShowExportMenu(prev => !prev);
  }, []);

  const handleExportCSV = useCallback(() => {
    exportKPIs('csv');
  }, [exportKPIs]);

  const handleExportJSON = useCallback(() => {
    exportKPIs('json');
  }, [exportKPIs]);

  const handleExportPDF = useCallback(() => {
    exportKPIs('pdf');
  }, [exportKPIs]);

  const handleExportExcel = useCallback(() => {
    exportKPIs('excel');
  }, [exportKPIs]);

  const handleOpenStatsModal = useCallback(() => {
    const openModal = useDashboardCommandCenterStore.getState().openModal;
    openModal('stats');
    setShowExportMenu(false);
  }, []);

  const handleCloseExportMenu = useCallback(() => {
    setShowExportMenu(false);
  }, []);

  return (
    <>
      <div className="h-full w-full flex min-h-0">
        {/* ===== SIDEBAR DASHBOARD (utilise useDashboardNavigationStore) ===== */}
        <DashboardSidebar
          collapsed={sidebarCollapsed}
          stats={stats}
          onToggleCollapse={toggleSidebar}
          onOpenCommandPalette={toggleCommandPalette}
        />

        {/* ===== CONTENT PRINCIPAL ===== */}
        <section 
          className="flex-1 min-w-0 flex flex-col overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 min-h-0"
          aria-label="Zone de contenu principal du dashboard"
          role="main"
        >
        
        {/* Sub Navigation (niveaux 2 et 3) - utilise useDashboardNavigationStore */}
        <div className="relative">
          <DashboardSubNavigation stats={stats} />
        </div>

        {/* Breadcrumbs - Fil d'Ariane pour la navigation */}
        <DashboardBreadcrumbs />

        {/* KPI Strip - Amélioré avec animations */}
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
                {topKpis.length !== allKpis.length && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="text-[10px] text-slate-500 cursor-help">
                        ({topKpis.length}/{allKpis.length})
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <KPICountTooltipContent 
                        count={topKpis.length}
                        total={allKpis.length}
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
                    onChange={(e) => {
                      const value = e.target.value;
                      setKpiFilter(value);
                      // ✅ Le debounce est géré par debouncedKpiFilter
                    }}
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
                {/* Contrôle auto-refresh avec menu de configuration */}
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
                          <Activity 
                            className={autoRefreshIconClassName} 
                          />
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
                        onChange={(e) => setRefreshInterval(Number(e.target.value))}
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
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="inline-block">
                      <button
                        type="button"
                        onClick={refreshKPIs}
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
                      loadTime={performanceMetrics.loadTime}
                      isTabVisible={isTabVisible}
                    />
                  </TooltipContent>
                </Tooltip>
                {/* Système d'alertes KPI */}
                <div className="hidden md:block">
                  <KPIAlertsSystemMemoized 
                    kpis={allKpis}
                    onAlert={(alert) => {
                      // Ajouter l'alerte aux notifications
                      setKpiChangeNotifications(prev => [...prev, {
                        id: alert.id,
                        label: alert.kpiLabel,
                        oldValue: 'Alerte',
                        newValue: alert.message,
                        timestamp: alert.timestamp,
                      }]);
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
                            const openModal = useDashboardCommandCenterStore.getState().openModal;
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
                          {retryCount > 0 ? `Tentative ${retryCount}/${maxRetries}...` : 'Actualisation...'}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          {retryCount > 0 
                            ? `Nouvelle tentative (${retryCount}/${maxRetries})` 
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
              aria-label={`Liste des indicateurs de performance${topKpis.length !== allKpis.length ? ` (${topKpis.length} sur ${allKpis.length} affichés)` : ''}`}
            >
              {topKpis.map((kpi, index) => {
                const Icon = kpi.icon;
                // ✅ Calculs optimisés avec cache implicite via memo
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

        {/* ARIA Live Region pour les annonces d'accessibilité */}
        <div 
          aria-live="polite" 
          aria-atomic="true" 
          className="sr-only"
          id="dashboard-announcements"
        >
          {refreshStatus === 'loading' && 'Actualisation des données en cours'}
          {refreshStatus === 'error' && 'Erreur lors de l\'actualisation des données'}
          {refreshStatus === 'idle' && refreshCount > 0 && `Données actualisées. ${topKpis.length} indicateur${topKpis.length > 1 ? 's' : ''} affiché${topKpis.length > 1 ? 's' : ''}`}
          {kpiChangeNotifications.length > 0 && `${kpiChangeNotifications.length} notification${kpiChangeNotifications.length > 1 ? 's' : ''} nouvelle${kpiChangeNotifications.length > 1 ? 's' : ''}`}
        </div>

        {/* Main Scroll Area - Amélioré avec transitions et ErrorBoundary */}
        <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          <div className="p-4 sm:p-6 max-w-[1920px] mx-auto">
            {/* ✅ CONTENT SWITCH basé sur le registry avec transitions */}
            <ErrorBoundary>
              <div 
                key={`${main}-${sub || ''}-${leaf || ''}`}
                className="animate-fadeIn"
              >
                <Suspense fallback={<ContentLoadingSkeleton />}>
                  <DashboardViewRouter />
                </Suspense>
              </div>
            </ErrorBoundary>
          </div>
        </div>

        {/* Footer - Amélioré avec métriques et actions */}
        <div className="border-t border-slate-800/60 bg-gradient-to-r from-slate-900/60 via-slate-900/40 to-slate-900/60 backdrop-blur-xl px-4 py-3 text-xs text-slate-500 flex items-center justify-between shadow-lg shadow-black/10">
          <div className="flex items-center gap-3 flex-wrap">
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="font-medium text-slate-400 cursor-help">Dashboard v5.7</span>
              </TooltipTrigger>
              <TooltipContent>
                <div className="space-y-1 text-xs">
                  <div className="font-semibold">Version 5.7</div>
                  <div className="text-slate-400">Dernière mise à jour: {new Date().toLocaleDateString('fr-FR')}</div>
                </div>
              </TooltipContent>
            </Tooltip>
            <span className="text-slate-600">•</span>
            <span className="text-slate-500">Store Zustand</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-500">Navigation synchronisée</span>
            {topKpis.length > 0 && (
              <>
                <span className="text-slate-600 hidden md:inline">•</span>
                <span className="text-slate-500 hidden md:inline">
                  {topKpis.length} indicateur{topKpis.length > 1 ? 's' : ''} actif{topKpis.length > 1 ? 's' : ''}
                </span>
              </>
            )}
            <span className="text-slate-600 hidden sm:inline">•</span>
            {performanceMetrics.renderTime > 0 && (
              <>
                <span className="text-slate-600 hidden lg:inline">•</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className={cn(
                      "hidden lg:inline-flex items-center gap-1 text-slate-500",
                      performanceMetrics.renderTime < 50 && "text-emerald-400",
                      performanceMetrics.renderTime >= 50 && performanceMetrics.renderTime < 100 && "text-amber-400",
                      performanceMetrics.renderTime >= 100 && "text-red-400"
                    )}>
                      <Zap className={cn(
                        "h-3 w-3",
                        performanceMetrics.renderTime < 50 && "text-emerald-400",
                        performanceMetrics.renderTime >= 50 && performanceMetrics.renderTime < 100 && "text-amber-400",
                        performanceMetrics.renderTime >= 100 && "text-red-400"
                      )} />
                      <span>{performanceMetrics.renderTime.toFixed(0)}ms</span>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="space-y-1 text-xs">
                      <p className="font-semibold">Performance</p>
                      <p>Temps de rendu: {performanceMetrics.renderTime.toFixed(2)}ms</p>
                      {performanceMetrics.loadTime > 0 && (
                        <p>Temps de chargement: {performanceMetrics.loadTime.toFixed(2)}ms</p>
                      )}
                      <p className={cn(
                        "pt-1 border-t border-slate-700 mt-1",
                        performanceMetrics.renderTime < 50 && "text-emerald-400",
                        performanceMetrics.renderTime >= 50 && performanceMetrics.renderTime < 100 && "text-amber-400",
                        performanceMetrics.renderTime >= 100 && "text-red-400"
                      )}>
                        {performanceMetrics.renderTime < 50 ? "✅ Excellent" : 
                         performanceMetrics.renderTime < 100 ? "⚠️ Bon" : "🔴 À optimiser"}
                      </p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </>
            )}
            <span className="text-slate-600 hidden sm:inline">•</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="inline-block">
                  <button
                    type="button"
                    className="hidden sm:inline-flex items-center gap-1 text-slate-500 hover:text-slate-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 rounded px-1"
                    aria-label="Raccourcis clavier"
                  >
                    <Info className="h-3 w-3" />
                    <span className="text-[10px]">Raccourcis</span>
                  </button>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <div className="space-y-1.5 text-xs">
                  <div className="font-semibold mb-2">Raccourcis clavier</div>
                  <div className="flex items-center justify-between gap-4">
                    <span>Ouvrir la palette</span>
                    <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-[10px]">Ctrl+K</kbd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span>Actualiser</span>
                    <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-[10px]">Ctrl+R</kbd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span>Exporter CSV</span>
                    <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-[10px]">Ctrl+E</kbd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span>Exporter JSON</span>
                    <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-[10px]">Ctrl+Shift+E</kbd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span>Focus recherche</span>
                    <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-[10px]">Ctrl+F</kbd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span>Toggle auto-refresh</span>
                    <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-[10px]">Alt+A</kbd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span>Toggle sidebar</span>
                    <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-[10px]">Ctrl+B</kbd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span>Raccourcis</span>
                    <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-[10px]">Ctrl+/</kbd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span>Fermer notifications</span>
                    <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-[10px]">Esc</kbd>
                  </div>
                  {performanceMetrics.loadTime > 0 && (
                    <div className="pt-2 mt-2 border-t border-slate-700">
                      <div className="flex items-center justify-between gap-4">
                        <span>Dernier chargement</span>
                        <span className="text-emerald-400">{performanceMetrics.loadTime.toFixed(0)}ms</span>
                      </div>
                      {performanceMetrics.renderTime > 0 && (
                        <div className="flex items-center justify-between gap-4 mt-1">
                          <span>Temps de rendu</span>
                          <span className="text-emerald-400">{performanceMetrics.renderTime.toFixed(0)}ms</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="flex items-center gap-3">
            {/* Indicateur de connexion réseau amélioré */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className={cn(
                  "inline-flex items-center gap-2 px-2.5 py-1 rounded-md border transition-all cursor-help",
                  isOnline 
                    ? "bg-emerald-500/10 border-emerald-500/20 hover:border-emerald-500/40" 
                    : "bg-amber-500/10 border-amber-500/20 hover:border-amber-500/40"
                )}>
                  <span className="relative flex h-2 w-2">
                    {isOnline ? (
                      <>
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                      </>
                    ) : (
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
                    )}
                  </span>
                  <span className={cn(
                    "font-medium text-xs",
                    isOnline ? "text-emerald-400" : "text-amber-400"
                  )}>
                    {isOnline ? "Connecté" : "Hors ligne"}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <div className="space-y-1 text-xs">
                  <p className="font-semibold">
                    {isOnline ? "✅ Connexion active" : "⚠️ Connexion perdue"}
                  </p>
                  {!isOnline && (
                    <>
                      <p className="text-amber-400">
                        Le refresh automatique est suspendu
                      </p>
                      <p className="text-slate-400 text-[10px] pt-1 border-t border-slate-700 mt-1">
                        Reconnexion automatique à la restauration du réseau
                      </p>
                    </>
                  )}
                  {isOnline && autoRefreshEnabled && (
                    <p className="text-slate-400">
                      Refresh automatique: {Math.round(refreshInterval / 1000 / 60)} min
                    </p>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </section>
      </div>

      {/* Notifications de changements de KPIs */}
      <KPINotifications notifications={kpiChangeNotifications} onDismiss={(id) => {
        setKpiChangeNotifications(prev => prev.filter(n => n.id !== id));
      }} />

      {/* Overlay pour fermer le menu d'export */}
      {showExportMenu && (
        <div
          className="fixed inset-0 z-40 pointer-events-auto"
          onClick={handleCloseExportMenu}
          aria-hidden="true"
        />
      )}

      {/* Modals */}
      <DashboardModals />
    </>
  );
}

/* =========================
   Types et Interfaces - Consolidés
========================= */

// Types réutilisés pour les KPIs
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
  const [isAnimating, setIsAnimating] = useState(false);

  // Animation lors du changement de valeur
  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 600);
    return () => clearTimeout(timer);
  }, [kpi.value, kpi.delta]);

  const getTrendIcon = () => {
    if (kpi.trend === 'up') {
      return <ArrowUpRight className="h-3 w-3" />;
    }
    if (kpi.trend === 'down') {
      return <ArrowDownRight className="h-3 w-3" />;
    }
    return <Minus className="h-3 w-3" />;
  };

  const getTooltipContent = () => {
    const trendText = kpi.trend === 'up' ? 'augmentation' : kpi.trend === 'down' ? 'diminution' : 'stable';
    const toneText = kpi.tone === 'ok' ? 'Normal' : kpi.tone === 'warn' ? 'Attention' : kpi.tone === 'crit' ? 'Critique' : 'Information';
    return (
      <div className="space-y-1">
        <div className="font-semibold">{kpi.label}</div>
        <div className="text-xs text-slate-300">
          Valeur actuelle: <span className="font-medium">{kpi.value}</span>
        </div>
        <div className="text-xs text-slate-400">
          Variation: <span className={cn(
            isPositive && 'text-emerald-400',
            isNegative && 'text-red-400',
            !isPositive && !isNegative && 'text-slate-400'
          )}>{kpi.delta}</span> ({trendText})
        </div>
        <div className="text-xs text-slate-500 pt-1 border-t border-slate-700">
          Statut: {toneText}
        </div>
        {onClick && (
          <div className="text-xs text-blue-400 pt-1 border-t border-slate-700 mt-1 flex items-center gap-1">
            <Info className="h-3 w-3" />
            <span>Cliquer pour voir les détails</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={cn(
            'group relative rounded-xl border backdrop-blur-xl px-4 py-3',
            'transition-all duration-300 ease-out',
            onClick ? 'cursor-pointer active:scale-[0.98]' : 'cursor-help',
            'hover:scale-[1.02] hover:shadow-lg hover:shadow-black/20',
            onClick && 'hover:ring-2 hover:ring-blue-500/30',
            'animate-fadeIn',
            'focus-within:ring-2 focus-within:ring-blue-500/50 focus-within:outline-none',
            kpi.tone === 'ok' && 'border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-emerald-500/0 hover:border-emerald-500/30',
            kpi.tone === 'warn' && 'border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-amber-500/0 hover:border-amber-500/30',
            kpi.tone === 'crit' && 'border-red-500/20 bg-gradient-to-br from-red-500/5 to-red-500/0 hover:border-red-500/30',
            kpi.tone === 'info' && 'border-slate-500/20 bg-gradient-to-br from-slate-500/5 to-slate-500/0 hover:border-slate-500/30'
          )}
          style={{
            animationDelay: `${index * 50}ms`,
          }}
          tabIndex={0}
          role="button"
          aria-label={`${kpi.label}: ${kpi.value}, ${kpi.delta}. ${onClick ? 'Cliquez pour voir les détails' : ''}`}
          onClick={onClick}
          onKeyDown={(e) => {
            if ((e.key === 'Enter' || e.key === ' ') && onClick) {
              e.preventDefault();
              onClick();
            }
          }}
        >
      {/* Background glow effect - pointer-events-none pour ne pas bloquer les clics */}
      <div
        className={cn(
          'absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none',
          kpi.tone === 'ok' && 'bg-emerald-500/5',
          kpi.tone === 'warn' && 'bg-amber-500/5',
          kpi.tone === 'crit' && 'bg-red-500/5',
          kpi.tone === 'info' && 'bg-slate-500/5'
        )}
      />

      {/* Contenu cliquable - pointer-events-auto pour rétablir les événements */}
      <div className="relative z-10 pointer-events-auto">
        {/* Header with icon and label */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                'p-1.5 rounded-lg transition-all duration-200',
                kpi.tone === 'ok' && 'bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20',
                kpi.tone === 'warn' && 'bg-amber-500/10 text-amber-400 group-hover:bg-amber-500/20',
                kpi.tone === 'crit' && 'bg-red-500/10 text-red-400 group-hover:bg-red-500/20',
                kpi.tone === 'info' && 'bg-slate-500/10 text-slate-400 group-hover:bg-slate-500/20'
              )}
            >
              <Icon className="h-3.5 w-3.5" />
            </div>
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wide truncate">
              {kpi.label}
            </span>
            {onClick && (
              <Info className="h-2.5 w-2.5 text-blue-400/60 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            )}
          </div>
        </div>

        {/* Value and delta */}
        <div className="flex items-end justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div
              className={cn(
                'text-xl font-bold truncate transition-all duration-300',
                'text-slate-100 group-hover:text-white',
                'relative',
                isAnimating && 'scale-110 text-blue-300'
              )}
            >
              <span className="relative z-10">{String(kpi.value)}</span>
              {/* Effet de brillance sur la valeur */}
              {isAnimating && (
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/20 to-transparent animate-shimmer" />
              )}
            </div>
            {/* Mini sparkline graph - masqué sur très petits écrans */}
            <div className="hidden xs:block mt-1.5">
              <KPISparkline 
                tone={kpi.tone} 
                trend={kpi.trend}
                aria-label={`Graphique de tendance pour ${kpi.label}`}
              />
            </div>
          </div>
          <div
            className={cn(
              'flex items-center gap-0.5 text-[10px] font-semibold whitespace-nowrap transition-all duration-300',
              isPositive && 'text-emerald-400',
              isNegative && 'text-red-400',
              !isPositive && !isNegative && 'text-slate-400',
              'group-hover:scale-110',
              isAnimating && 'scale-125'
            )}
          >
            {getTrendIcon()}
            <span>{kpi.delta}</span>
          </div>
        </div>
      </div>
        </div>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs">
        {getTooltipContent()}
      </TooltipContent>
    </Tooltip>
  );
});

/* =========================
   Utility Functions
========================= */

/* =========================
   Content Loading Skeleton - Amélioré
========================= */

function ContentLoadingSkeleton() {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header skeleton */}
      <div className="space-y-3">
        <div className="h-10 bg-gradient-to-r from-slate-800/40 via-slate-800/60 to-slate-800/40 rounded-xl w-1/3 animate-shimmer" />
        <div className="h-4 bg-slate-800/30 rounded-lg w-2/3" />
      </div>

      {/* Cards grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div 
            key={i} 
            className="h-40 bg-gradient-to-br from-slate-800/30 via-slate-800/20 to-slate-800/30 rounded-xl border border-slate-700/30 p-4 space-y-3 animate-shimmer"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="h-4 bg-slate-700/40 rounded w-1/2" />
            <div className="h-8 bg-slate-700/40 rounded w-3/4" />
            <div className="h-3 bg-slate-700/30 rounded w-full" />
            <div className="h-3 bg-slate-700/30 rounded w-2/3" />
          </div>
        ))}
      </div>

      {/* Chart/Table skeleton */}
      <div className="space-y-4">
        <div className="h-6 bg-slate-800/40 rounded-lg w-1/4" />
        <div className="h-80 bg-gradient-to-br from-slate-800/30 via-slate-800/20 to-slate-800/30 rounded-xl border border-slate-700/30 p-6">
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-slate-700/30 rounded-lg" />
            ))}
          </div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-slate-700/20 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================
   Dashboard Content Switch Wrapper avec transitions
========================= */

// DashboardContentSwitchWrapper supprimé - DashboardViewRouter gère directement la navigation via useDashboardNavigationStore

/* =========================
   KPI Notifications Component
========================= */

interface KPINotification {
  id: string;
  label: string;
  oldValue: string | number;
  newValue: string | number;
  timestamp: Date;
}

interface KPINotificationsProps {
  notifications: KPINotification[];
  onDismiss: (id: string) => void;
}

function KPINotifications({ notifications, onDismiss }: KPINotificationsProps) {
  if (notifications.length === 0) return null;

  // Limiter le nombre de notifications affichées (max 5)
  const displayedNotifications = notifications.slice(-5);

  // Mémoriser le handler de dismiss pour éviter les re-renders
  const handleDismiss = useCallback((id: string) => {
    onDismiss(id);
  }, [onDismiss]);

  return (
    <div 
      className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm"
      role="region"
      aria-label="Notifications de changements de KPIs"
      aria-live="polite"
      aria-atomic="false"
    >
                  {displayedNotifications.map((notification, idx) => {
        const isIncrease = typeof notification.oldValue === 'number' && typeof notification.newValue === 'number'
          ? notification.newValue > notification.oldValue
          : false;
        
        return (
          <div
            key={notification.id}
            className={cn(
              'rounded-lg border p-3 shadow-lg backdrop-blur-xl animate-fadeIn',
              'bg-slate-900/95 border-slate-700/50',
              'flex items-start gap-3',
              'hover:shadow-xl hover:scale-[1.02] transition-all duration-200',
              'cursor-pointer'
            )}
            style={{
              animationDelay: `${idx * 100}ms`,
            }}
            onClick={() => handleDismiss(notification.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onDismiss(notification.id);
              }
            }}
            aria-label={`Notification: ${notification.label} - ${notification.oldValue} → ${notification.newValue}`}
          >
            <div className={cn(
              'p-1.5 rounded-md',
              isIncrease ? 'bg-emerald-500/20' : 'bg-amber-500/20'
            )}>
              {isIncrease ? (
                <TrendingUp className="h-4 w-4 text-emerald-400" />
              ) : (
                <TrendingDown className="h-4 w-4 text-amber-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-slate-200 mb-0.5">
                {notification.label}
              </div>
              <div className="text-xs text-slate-400">
                <span className="line-through text-slate-500 mr-1.5" aria-label={`Ancienne valeur: ${notification.oldValue}`}>
                  {notification.oldValue}
                </span>
                <span 
                  className={cn(
                    'font-semibold',
                    isIncrease ? 'text-emerald-400' : 'text-amber-400'
                  )}
                  aria-label={`Nouvelle valeur: ${notification.newValue}`}
                >
                  → {notification.newValue}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleDismiss(notification.id);
              }}
              className="text-slate-500 hover:text-slate-300 transition-all duration-200 hover:scale-110 active:scale-95 flex-shrink-0"
              aria-label="Fermer la notification"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
      {notifications.length > 5 && (
        <div className="text-xs text-slate-500 text-center pt-2">
          {notifications.length - 5} autre{notifications.length - 5 > 1 ? 's' : ''} notification{notifications.length - 5 > 1 ? 's' : ''} masquée{notifications.length - 5 > 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}

/* =========================
   KPI Sparkline Component - Mini graphique
========================= */

interface KPISparklineProps {
  tone: KPITone;
  trend: KPITrend;
  'aria-label'?: string;
}

const KPISparkline = memo(function KPISparkline({ tone, trend, 'aria-label': ariaLabel }: KPISparklineProps) {
  // Générer des données mock stables pour le mini graphique
  // Utiliser un seed basé sur tone+trend pour avoir des valeurs cohérentes
  const sparklineData = useMemo(() => {
    const points = 7;
    const baseValue = 50;
    const variation = trend === 'up' ? 15 : trend === 'down' ? -15 : 5;
    
    // Seed simple pour générer des valeurs pseudo-aléatoires mais stables
    const seed = (tone.charCodeAt(0) + trend.charCodeAt(0)) % 100;
    
    // Fonction pseudo-aléatoire simple basée sur le seed
    let currentSeed = seed;
    const pseudoRandom = () => {
      currentSeed = (currentSeed * 9301 + 49297) % 233280;
      return currentSeed / 233280;
    };
    
    return Array.from({ length: points }, (_, i) => {
      const progress = i / (points - 1);
      // Utiliser pseudoRandom au lieu de Math.random pour stabilité
      const randomVariation = (pseudoRandom() - 0.5) * 10;
      return Math.max(0, Math.min(100, baseValue + variation * progress + randomVariation));
    });
  }, [tone, trend]);

  const getColor = () => {
    if (tone === 'ok') return 'stroke-emerald-400';
    if (tone === 'warn') return 'stroke-amber-400';
    if (tone === 'crit') return 'stroke-red-400';
    return 'stroke-slate-400';
  };

  const height = 20;
  const width = 40;
  const padding = 2;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;
  const maxValue = Math.max(...sparklineData, 1);
  const minValue = Math.min(...sparklineData, 0);

  const points = sparklineData
    .map((value, index) => {
      const x = padding + (index / (sparklineData.length - 1 || 1)) * chartWidth;
      const y = padding + chartHeight - ((value - minValue) / (maxValue - minValue || 1)) * chartHeight;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div 
      className="mt-1.5 opacity-60 group-hover:opacity-100 transition-opacity duration-300" 
      aria-label={ariaLabel}
    >
      <svg 
        width={width} 
        height={height} 
        className="overflow-visible transition-transform duration-300 group-hover:scale-105"
        aria-hidden="true"
        role="img"
      >
        <polyline
          points={points}
          fill="none"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={getColor()}
          style={{ filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.3))' }}
        />
        {/* Point final pour accent */}
        <circle
          cx={padding + chartWidth}
          cy={padding + chartHeight - ((sparklineData[sparklineData.length - 1] - minValue) / (maxValue - minValue || 1)) * chartHeight}
          r="1.5"
          className={cn('fill-current', getColor())}
        />
      </svg>
    </div>
  );
});

/* =========================
   Composants mémorisés pour éviter les re-renders
========================= */

// KPIAlertsSystemMemoized est maintenant défini dans DashboardContent avant utilisation

// Composant mémorisé pour afficher la dernière mise à jour
const LastUpdateDisplay = memo(function LastUpdateDisplay({ lastUpdate }: { lastUpdate: Date }) {
  const [timeAgo, setTimeAgo] = useState(() => formatTimeAgo(lastUpdate));

  useEffect(() => {
    // Mettre à jour immédiatement quand lastUpdate change
    setTimeAgo(formatTimeAgo(lastUpdate));
    
    // Puis mettre à jour toutes les minutes
    const interval = setInterval(() => {
      setTimeAgo(formatTimeAgo(lastUpdate));
    }, 60000); // 1 minute

    return () => clearInterval(interval);
  }, [lastUpdate]);

  return (
    <span className="text-[10px] text-slate-500 normal-case">
      Mise à jour : {timeAgo}
    </span>
  );
});

/* =========================
   Utility Functions
========================= */

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'à l\'instant';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `il y a ${diffInMinutes} min`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `il y a ${diffInHours}h`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  return `il y a ${diffInDays}j`;
}

