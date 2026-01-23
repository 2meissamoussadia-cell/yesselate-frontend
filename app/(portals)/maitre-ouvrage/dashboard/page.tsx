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

import React, { Suspense, useMemo, memo, useCallback, useEffect, useLayoutEffect, useState, useRef, lazy } from 'react';
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

// ✅ Importer tous les composants depuis le module centralisé
import { 
  DashboardSidebar, 
  DashboardSubNavigation, 
  DashboardViewRouter,
  DashboardKPIBar,
  DashboardFooter,
  KPINotifications,
  LastUpdateDisplay,
  ContentLoadingSkeleton,
  KPISparkline,
  useAutoRefresh,
} from '@/modules/dashboard';
import { TrendIcon } from '@/modules/dashboard/components/shared/getTrendIcon';
import { useKPIFilter } from '@/modules/dashboard/hooks/useKPIFilter';
import { useKPINotifications, useKPIDiff } from '@/modules/dashboard/hooks/useKPINotifications';
import { useDashboardRefresh } from '@/modules/dashboard/hooks/useDashboardRefresh';
import { usePerformanceMetrics } from '@/modules/dashboard/hooks/usePerformanceMetrics';

// ✅ Importer les types depuis le module centralisé
import type { 
  KPINotification,
  KPITone,
  KPITrend,
} from '@/modules/dashboard';

// ✅ Importer les modals (lazy loading pour améliorer Fast Refresh)
const DashboardModals = lazy(() => 
  import('@/components/features/bmo/dashboard/command-center/DashboardModals').then(m => ({ default: m.DashboardModals }))
);
const KPIAlertsSystem = lazy(() => 
  import('@/components/features/bmo/dashboard/command-center/KPIAlertsSystem').then(m => ({ default: m.KPIAlertsSystem }))
);

import { getKPIMappingByLabel } from '@/lib/mappings/dashboardKPIMapping';
import { useDashboardKPIs } from '@/lib/hooks/useDashboardKPIs';
import { useLogger } from '@/lib/utils/logger';

/* =========================
   Types & Interfaces Globaux
========================= */

// ✅ Type safety amélioré pour performance.memory (Chrome/Edge uniquement)
interface PerformanceMemory {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

// ✅ Type safety amélioré pour window.__lastDashboardRefresh
interface WindowWithRefresh extends Window {
  __lastDashboardRefresh?: number;
}

// ✅ Extension du type Performance pour inclure memory
interface PerformanceWithMemory extends Performance {
  memory?: PerformanceMemory;
}

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

  return (
    <Suspense fallback={null}>
      <KPIAlertsSystem kpis={kpisForAlerts} onAlert={onAlert} />
    </Suspense>
  );
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

// ✅ Mémoriser DashboardContent pour éviter les re-renders inutiles
const DashboardContent = memo(function DashboardContent() {
  // ✅ Initialiser le logger
  const log = useLogger('DashboardContent');
  
  // ✅ LIRE LE STORE DE NAVIGATION (source unique de vérité pour la navigation)
  // ✅ Utiliser des sélecteurs individuels pour éviter les re-renders si une seule valeur change
  const main = useDashboardNavigationStore((state) => state.main);
  const sub = useDashboardNavigationStore((state) => state.sub);
  const leaf = useDashboardNavigationStore((state) => state.leaf);
  
  // ✅ LIRE LE STORE COMMAND CENTER (uniquement pour UI: modals, sidebar collapse, etc.)
  // ✅ OPTIMISÉ: Utiliser des sélecteurs individuels pour éviter les re-renders inutiles
  // Les fonctions (toggleSidebar, toggleCommandPalette) sont stables et ne causent pas de re-renders
  const sidebarCollapsed = useDashboardCommandCenterStore((state) => state.sidebarCollapsed);
  const toggleSidebar = useDashboardCommandCenterStore((state) => state.toggleSidebar);
  const toggleCommandPalette = useDashboardCommandCenterStore((state) => state.toggleCommandPalette);
  
  // ✅ États locaux - déclarés en premier
  // Utiliser le hook useKPIFilter pour gérer le filtre
  const { kpiFilter, setKpiFilter, debouncedKpiFilter } = useKPIFilter();
  
  // ✅ État pour lastUpdate (déclaré avant useDashboardRefresh)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  
  // ✅ Utiliser le hook pour récupérer les données réelles
  const { kpis: apiKpis, isLoading: kpisLoading, error: kpisError, lastUpdate: apiLastUpdate, refetch: refetchKPIsFromAPI } = useDashboardKPIs('year');
  
  // ✅ Utiliser le hook pour mesurer les performances (déclaré avant useDashboardRefresh)
  const { performanceMetrics, updateLoadMetrics } = usePerformanceMetrics({
    componentName: 'DashboardContent',
    route: `${main}/${sub || ''}/${leaf || ''}`,
    logThreshold: 500,
  });
  
  // ✅ Utiliser le hook pour gérer les notifications (déclaré avant useDashboardRefresh)
  const { notifications: kpiChangeNotifications, addNotification, dismissNotification, clearAll: clearAllNotifications } = useKPINotifications({
    maxNotifications: 10,
    autoDismissMs: 5000,
  });
  
  // ✅ Utiliser le hook pour gérer le refresh
  const refetchKPIsFromAPIRef = useRef(refetchKPIsFromAPI);
  useEffect(() => {
    refetchKPIsFromAPIRef.current = refetchKPIsFromAPI;
  }, [refetchKPIsFromAPI]);
  
  const {
    refresh: refreshKPIs,
    status: refreshStatus,
    refreshCount,
    lastUpdate: refreshLastUpdate,
    retryCount,
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
        const errorNotification = {
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
  
  // ✅ Synchroniser lastUpdate avec refreshLastUpdate
  useEffect(() => {
    if (refreshLastUpdate) {
      setLastUpdate(refreshLastUpdate);
    }
  }, [refreshLastUpdate]);
  const [showExportMenu, setShowExportMenu] = useState(false);

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

  // ✅ Filtre géré par useKPIFilter hook (persistance localStorage + debounce inclus)
  // Note: Le filtrage des KPIs est maintenant géré par DashboardKPIBar via useKPIFilter

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

  // ✅ Mesure des performances gérée par usePerformanceMetrics hook

  // ✅ Utiliser le hook useKPIDiff pour détecter les changements de KPIs
  useKPIDiff({
    currentKpis: allKpis.map((k) => ({ label: k.label, value: k.value })),
    onChangesDetected: (changes) => {
      // Ajouter toutes les notifications détectées
      changes.forEach((change) => addNotification(change));
    },
  });

  // ✅ Refresh géré par useDashboardRefresh hook
  const timeoutsRef = useRef<number[]>([]);

  // ✅ Fonction d'export des données KPIs améliorée avec PDF/Excel
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
      addNotification(successNotification);
      
      // Auto-dismiss après 3 secondes
      const timeoutId = window.setTimeout(() => {
        dismissNotification(successNotification.id);
      }, 3000);
      timeoutsRef.current.push(timeoutId);

    } catch (error) {
      log.error('Erreur lors de l\'export', error instanceof Error ? error : new Error(String(error)));
      const errorNotification = {
        id: `export-error-${Date.now()}`,
        label: 'Erreur d\'export',
        oldValue: format.toUpperCase(),
        newValue: 'Échec',
        timestamp: new Date(),
      };
      // ✅ Ajouter la notification d'erreur
      addNotification(errorNotification);
      
      // Auto-dismiss après 5 secondes (géré par le hook, mais on peut override)
      const timeoutId = window.setTimeout(() => {
        dismissNotification(errorNotification.id);
      }, 5000);
      timeoutsRef.current.push(timeoutId);
    }

    setShowExportMenu(false);
  }, [allKpis, log]);

  // ✅ Gestion intelligente du refresh avec pause automatique
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('dashboard-auto-refresh');
        return saved !== null ? saved === 'true' : true;
      } catch (error) {
        // localStorage peut être désactivé ou plein
        if (process.env.NODE_ENV === 'development') {
          console.warn('[Dashboard] Erreur lors de la lecture de localStorage:', error);
        }
        return true; // Valeur par défaut
      }
    }
    return true;
  });
  
  // PATCH: Mémoriser le handler pour éviter les re-renders inutiles
  // Ajouter une protection contre les clics multiples rapides et les boucles infinies
  const isTogglingRef = useRef(false);
  const toggleTimeoutRef = useRef<number | null>(null);
  
  // Handler mémorisé avec protection renforcée contre les boucles infinies
  const handleToggleAutoRefresh = useRef(() => {
    // Éviter les appels multiples - protection contre les boucles infinies
    if (isTogglingRef.current) {
      return;
    }
    
    // Nettoyer le timeout précédent s'il existe
    if (toggleTimeoutRef.current !== null) {
      clearTimeout(toggleTimeoutRef.current);
      toggleTimeoutRef.current = null;
    }
    
    isTogglingRef.current = true;
    
    // Utiliser une fonction de mise à jour pour éviter les dépendances
    setAutoRefreshEnabled(prev => {
      const newValue = !prev;
      // Réinitialiser le flag après un délai
      toggleTimeoutRef.current = window.setTimeout(() => {
        isTogglingRef.current = false;
        toggleTimeoutRef.current = null;
      }, 1000);
      return newValue;
    });
  }).current;
  
  // ✅ Cleanup du timeout au démontage
  useEffect(() => {
    return () => {
      if (toggleTimeoutRef.current !== null) {
        clearTimeout(toggleTimeoutRef.current);
        toggleTimeoutRef.current = null;
      }
    };
  }, []);
  
  const [refreshInterval, setRefreshInterval] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('dashboard-refresh-interval');
        return saved ? parseInt(saved, 10) : 5 * 60 * 1000; // 5 minutes par défaut
      } catch (error) {
        // localStorage peut être désactivé ou plein
        if (process.env.NODE_ENV === 'development') {
          console.warn('[Dashboard] Erreur lors de la lecture de localStorage:', error);
        }
        return 5 * 60 * 1000; // Valeur par défaut
      }
    }
    return 5 * 60 * 1000;
  });

  // ✅ Utiliser le hook useAutoRefresh pour gérer l'auto-refresh
  // Ce hook gère : visibilité onglet, statut réseau, intervalles, et pause intelligente
  const { pause, resume } = useDashboardRefresh({
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
        const errorNotification = {
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
  
  const { isOnline, isTabVisible } = useAutoRefresh({
    enabled: autoRefreshEnabled,
    interval: refreshInterval,
    onRefresh: refreshKPIs,
    onStatusChange: (status: 'idle' | 'paused') => {
      if (status === 'paused') {
        pause();
      } else {
        resume();
      }
    },
  });

  // ✅ refreshKPIs est stable depuis useDashboardRefresh hook

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
        try {
          localStorage.setItem('dashboard-auto-refresh', autoRefreshStr);
          localStorage.setItem('dashboard-refresh-interval', intervalStr);
          // Mettre à jour les refs après la persistance
          lastPersistedAutoRefreshRef.current = autoRefreshStr;
          lastPersistedIntervalRef.current = refreshInterval;
        } catch (error) {
          // localStorage peut être désactivé ou plein
          if (process.env.NODE_ENV === 'development') {
            console.warn('[Dashboard] Erreur lors de l\'écriture dans localStorage:', error);
          }
        }
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
  const initialRefreshDoneRef = useRef(false);
  
  useEffect(() => {
    // Ne déclencher le refresh initial qu'une seule fois au montage si auto-refresh est activé
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
          clearAllNotifications();
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

  // ✅ Mémoriser handleShowShortcuts pour éviter les re-renders de DashboardFooter
  const handleShowShortcuts = useCallback(() => {
    const openModal = useDashboardCommandCenterStore.getState().openModal;
    openModal('shortcuts');
  }, []);

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
        {/* DashboardBreadcrumbs supprimé - à réimplémenter si nécessaire */}

        {/* KPI Strip - Utilise le composant DashboardKPIBar */}
        <DashboardKPIBar
          kpis={allKpis}
          onKPIClick={handleKPIClick}
          onExport={exportKPIs}
          onRefresh={async () => {
            await refreshKPIs();
          }}
          refreshInterval={refreshInterval}
          autoRefreshEnabled={autoRefreshEnabled}
          onAutoRefreshToggle={useCallback((enabled: boolean) => {
            // Wrapper pour handleToggleAutoRefresh
            // handleToggleAutoRefresh est déjà une fonction (useRef().current)
            if (enabled !== autoRefreshEnabled) {
              handleToggleAutoRefresh();
            }
          }, [autoRefreshEnabled])}
          onRefreshIntervalChange={setRefreshInterval}
          isOnline={isOnline}
          isTabVisible={isTabVisible}
          lastUpdate={lastUpdate}
          performanceMetrics={performanceMetrics}
        />

        {/* ARIA Live Region pour les annonces d'accessibilité */}
        <div 
          aria-live="polite" 
          aria-atomic="true" 
          className="sr-only"
          id="dashboard-announcements"
        >
          {refreshStatus === 'loading' && 'Actualisation des données en cours'}
          {refreshStatus === 'error' && 'Erreur lors de l\'actualisation des données'}
          {refreshStatus === 'idle' && refreshCount > 0 && `Données actualisées. ${allKpis.length} indicateur${allKpis.length > 1 ? 's' : ''} affiché${allKpis.length > 1 ? 's' : ''}`}
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

        {/* Footer - Utilise le composant DashboardFooter */}
        <DashboardFooter
          version="5.7"
          performanceMetrics={performanceMetrics}
          isOnline={isOnline}
          autoRefreshEnabled={autoRefreshEnabled}
          refreshInterval={refreshInterval}
          onShowShortcuts={handleShowShortcuts}
        />
      </section>
      </div>

      {/* Notifications de changements de KPIs */}
      <KPINotifications notifications={kpiChangeNotifications} onDismiss={dismissNotification} />

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
});

/* =========================
   Types et Interfaces - Consolidés
========================= */

// Types réutilisés pour les KPIs
// Types KPITone et KPITrend exportés depuis KPISparkline

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

  // ✅ Utiliser le composant mémorisé TrendIcon
  const trendIcon = useMemo(() => (
    <TrendIcon trend={kpi.trend} />
  ), [kpi.trend]);

  // Mémoriser le contenu du tooltip pour éviter les re-renders
  const tooltipContent = useMemo(() => {
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
  }, [kpi.label, kpi.value, kpi.delta, kpi.trend, kpi.tone, isPositive, isNegative, onClick]);

  // Mémoriser className pour éviter les re-renders
  const cardClassName = useMemo(() => cn(
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
  ), [kpi.tone, onClick]);

  // Mémoriser style pour éviter les re-renders
  const cardStyle = useMemo(() => ({
    animationDelay: `${index * 50}ms`,
  }), [index]);

  // Mémoriser aria-label pour éviter les re-renders
  const ariaLabel = useMemo(() => 
    `${kpi.label}: ${kpi.value}, ${kpi.delta}. ${onClick ? 'Cliquez pour voir les détails' : ''}`,
    [kpi.label, kpi.value, kpi.delta, onClick]
  );

  // Mémoriser onKeyDown handler pour éviter les re-renders
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if ((e.key === 'Enter' || e.key === ' ') && onClick) {
      e.preventDefault();
      onClick();
    }
  }, [onClick]);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={cardClassName}
          style={cardStyle}
          tabIndex={0}
          role="button"
          aria-label={ariaLabel}
          onClick={onClick}
          onKeyDown={handleKeyDown}
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
            {trendIcon}
            <span>{kpi.delta}</span>
          </div>
        </div>
      </div>
        </div>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs">
        {tooltipContent}
      </TooltipContent>
    </Tooltip>
  );
});

/* =========================
   Utility Functions
========================= */


/* =========================
   Dashboard Content Switch Wrapper avec transitions
========================= */

// DashboardContentSwitchWrapper supprimé - DashboardViewRouter gère directement la navigation via useDashboardNavigationStore

/* =========================
   KPI Notifications Component
========================= */



/* =========================
   Composants mémorisés pour éviter les re-renders
========================= */

// KPIAlertsSystemMemoized est maintenant défini dans DashboardContent avant utilisation

// Composant mémorisé pour afficher la dernière mise à jour
/* =========================
   Utility Functions
========================= */

