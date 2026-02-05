'use client';

/**
 * ====================================================================
 * PAGE: Dossiers Bloqués - Command Center v2.0
 * ====================================================================
 * 
 * Interface de gestion des blocages pour le Bureau Maître d'Ouvrage (BMO).
 * Architecture harmonisée avec Analytics Command Center.
 * Instance suprême avec pouvoir de substitution et d'arbitrage.
 * 
 * ====================================================================
 */

import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ChevronLeft,
  Bell,
  AlertCircle,
  MoreHorizontal,
  RefreshCw,
  Download,
  Search,
  Zap,
  BarChart3,
  Settings,
  Filter,
  HelpCircle,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { useBlockedCommandCenterStore, type BlockedSubCategory } from '@/lib/stores/blockedCommandCenterStore';
import {
  BlockedKPIBar,
  BlockedModals,
  BlockedFiltersPanel,
  countActiveFiltersUtil,
  blockedCategories,
  type BlockedActiveFilters,
} from '@/components/features/bmo/workspace/blocked/command-center';
// New 3-level navigation module
import {
  BlockedSidebar,
  BlockedSubNavigation,
  BlockedContentRouter,
  type BlockedMainCategory,
} from '@/modules/blocked';
import { BlockedCommandPalette } from '@/components/features/bmo/workspace/blocked/BlockedCommandPalette';
import { BlockedToastProvider, useBlockedToast } from '@/components/features/bmo/workspace/blocked/BlockedToast';
import { BlockedHelpModal } from '@/components/features/bmo/workspace/blocked/modals/BlockedHelpModal';
import { blockedApi, type BlockedFilter } from '@/lib/services/blockedApiService';
import type { BlockedDossier } from '@/lib/types/bmo.types';
import { useRealtimeBlocked } from '@/lib/hooks/useRealtimeBlocked';

// ================================
// Utility: Convert UI Filters to API Filters
// ================================
function convertToApiFilter(filters: BlockedActiveFilters): BlockedFilter {
  const apiFilter: BlockedFilter = {};

  // Impact - prend le premier si plusieurs (API ne supporte qu'un seul)
  if (filters.impact.length === 1) {
    apiFilter.impact = filters.impact[0];
  }

  // Bureau - prend le premier si plusieurs
  if (filters.bureaux.length === 1) {
    apiFilter.bureau = filters.bureaux[0];
  }

  // Status - prend le premier si plusieurs
  if (filters.status.length === 1) {
    apiFilter.status = filters.status[0];
  }

  // Delay range
  if (filters.delayRange.min !== undefined) {
    apiFilter.minDelay = filters.delayRange.min;
  }
  if (filters.delayRange.max !== undefined) {
    apiFilter.maxDelay = filters.delayRange.max;
  }

  // Date range
  if (filters.dateRange?.start) {
    apiFilter.dateFrom = filters.dateRange.start;
  }
  if (filters.dateRange?.end) {
    apiFilter.dateTo = filters.dateRange.end;
  }

  return apiFilter;
}

// ================================
// Helpers
// ================================
const IMPACT_WEIGHT: Record<string, number> = { critical: 100, high: 50, medium: 20, low: 5 };

function parseAmountFCFA(amount: unknown): number {
  const s = String(amount ?? '').replace(/[^\d]/g, '');
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
}

function computePriority(d: BlockedDossier): number {
  const w = IMPACT_WEIGHT[d.impact] ?? 1;
  const delay = Math.max(0, d.delay ?? 0) + 1;
  const amount = parseAmountFCFA(d.amount);
  const factor = 1 + amount / 1_000_000;
  return Math.round(w * delay * factor);
}

// Mapping des catégories vers labels
const mainCategoryLabels = {
  overview: 'Vue d\'ensemble',
  queue: 'Files d\'attente',
  critical: 'Critiques',
  matrix: 'Matrice urgence',
  bureaux: 'Par bureau',
  timeline: 'Timeline',
  decisions: 'Décisions',
  audit: 'Audit',
} as const;

// Sous-catégories par catégorie principale
const subCategoriesMap: Record<string, Array<{ id: string; label: string }>> = {
  overview: [
    { id: 'summary', label: 'Synthèse' },
    { id: 'kpis', label: 'KPIs' },
    { id: 'trends', label: 'Tendances' },
    { id: 'alerts', label: 'Alertes' },
  ],
  queue: [
    { id: 'all', label: 'Tous' },
    { id: 'critical', label: 'Critiques' },
    { id: 'high', label: 'Priorité haute' },
    { id: 'medium', label: 'Priorité moyenne' },
    { id: 'low', label: 'Priorité basse' },
  ],
  critical: [
    { id: 'urgent', label: 'Urgents' },
    { id: 'sla', label: 'SLA dépassés' },
    { id: 'escalated', label: 'Escaladés' },
  ],
  matrix: [
    { id: 'impact', label: 'Par impact' },
    { id: 'delay', label: 'Par délai' },
    { id: 'amount', label: 'Par montant' },
    { id: 'combined', label: 'Combiné' },
  ],
  bureaux: [
    { id: 'all', label: 'Tous les bureaux' },
    { id: 'most', label: 'Plus impactés' },
    { id: 'comparison', label: 'Comparaison' },
  ],
  timeline: [
    { id: 'recent', label: 'Récents' },
    { id: 'week', label: 'Cette semaine' },
    { id: 'month', label: 'Ce mois' },
    { id: 'history', label: 'Historique' },
  ],
  decisions: [
    { id: 'pending', label: 'En attente' },
    { id: 'resolved', label: 'Résolus' },
    { id: 'escalated', label: 'Escaladés' },
    { id: 'substituted', label: 'Substitués' },
  ],
  audit: [
    { id: 'trail', label: 'Trace audit' },
    { id: 'chain', label: 'Chaîne de hash' },
    { id: 'reports', label: 'Rapports' },
    { id: 'export', label: 'Export' },
  ],
} as const;

// ================================
// Inner Content Component
// ================================
function BlockedPageContent() {
  const {
    navigation,
    fullscreen,
    notificationsPanelOpen,
    liveStats,
    stats,
    commandPaletteOpen,
    sidebarCollapsed,
    toggleFullscreen,
    toggleCommandPalette,
    toggleNotificationsPanel,
    toggleSidebar,
    goBack,
    navigationHistory,
    openModal,
    setStats,
    setStatsLoading,
    startRefresh,
    endRefresh,
    navigate,
  } = useBlockedCommandCenterStore();

  const toast = useBlockedToast();
  const abortRef = useRef<AbortController | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // WebSocket temps réel
  const { isConnected: wsConnected, subscriptionsCount } = useRealtimeBlocked({
    autoConnect: true,
    showToasts: true,
    autoInvalidateQueries: true,
  });

  // Navigation state - 3-level navigation
  const [activeCategory, setActiveCategory] = useState(navigation.mainCategory);
  const [activeSubCategory, setActiveSubCategory] = useState(navigation.subCategory);
  const [activeSubSubCategory, setActiveSubSubCategory] = useState<string | undefined>(undefined);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Filters state
  const [filtersPanelOpen, setFiltersPanelOpen] = useState(false);
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<BlockedActiveFilters>({
    impact: [],
    bureaux: [],
    types: [],
    status: [],
    delayRange: {},
    amountRange: {},
  });

  // Computed values
  const currentCategoryLabel = useMemo(() => {
    return blockedCategories.find((c) => c.id === activeCategory)?.label || 'Blocages';
  }, [activeCategory]);

  const currentSubCategories = useMemo(() => {
    return subCategoriesMap[activeCategory] || [];
  }, [activeCategory]);

  // Load stats from API
  const loadStats = useCallback(async (showToast = false) => {
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    startRefresh();
    setStatsLoading(true);
    setIsRefreshing(true);

    try {
      // Fetch stats from API
      const apiStats = await blockedApi.getStats();
      
      if (ac.signal.aborted) return;

      setStats(apiStats);
      setLastUpdate(new Date());

      if (showToast) {
        toast.success('Données actualisées', `${apiStats.total} dossiers bloqués`);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
      if (showToast) {
        toast.error('Erreur', 'Impossible de charger les statistiques');
      }
    } finally {
      setStatsLoading(false);
      endRefresh();
      setIsRefreshing(false);
    }
  }, [setStats, setStatsLoading, startRefresh, endRefresh, toast]);

  // Initial load + auto-refresh polling
  useEffect(() => {
    loadStats(false);
    
    // Setup polling for auto-refresh (every 30 seconds)
    const setupPolling = () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
      pollingRef.current = setInterval(() => {
        loadStats(false);
      }, 30000);
    };
    
    setupPolling();
    
    return () => { 
      abortRef.current?.abort();
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [loadStats]);

  // Handle category change - 3-level navigation
  const handleCategoryChange = useCallback((category: string, subCategory?: string) => {
    const cat = category as typeof activeCategory;
    setActiveCategory(cat);
    navigate(cat);
    const defaultSub = (subCategory || subCategoriesMap[cat]?.[0]?.id || null) as BlockedSubCategory | null;
    setActiveSubCategory(defaultSub);
    setActiveSubSubCategory(undefined); // Reset level 3
  }, [navigate]);

  // Handle sub-category change
  const handleSubCategoryChange = useCallback((subCategory: string) => {
    const typedSubCategory = subCategory as BlockedSubCategory | null;
    setActiveSubCategory(typedSubCategory);
    navigate(activeCategory, typedSubCategory);
    setActiveSubSubCategory(undefined); // Reset level 3 when changing level 2
  }, [activeCategory, navigate]);

  // Handle sub-sub-category change
  const handleSubSubCategoryChange = useCallback((subSubCategory: string) => {
    setActiveSubSubCategory(subSubCategory);
  }, []);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    await loadStats(true);
  }, [loadStats]);

  // Récupérer les setters de filtres du store
  const { resetFilters: resetStoreFilters } = useBlockedCommandCenterStore();

  // Handle apply filters - sync with local state AND store
  const handleApplyFilters = useCallback(async (filters: BlockedActiveFilters) => {
    setActiveFilters(filters);
    
    // Mettre à jour le store pour que BlockedContentRouter récupère les filtres
    const store = useBlockedCommandCenterStore.getState();
    
    // Mettre à jour chaque filtre dans le store
    store.setFilter('impact', filters.impact);
    store.setFilter('bureaux', filters.bureaux);
    store.setFilter('types', filters.types);
    store.setFilter('status', filters.status);
    store.setFilter('delayRange', filters.delayRange);
    store.setFilter('amountRange', filters.amountRange || { min: undefined, max: undefined });
    if (filters.dateRange) {
      store.setFilter('dateRange', filters.dateRange);
    }

    // Appliquer les filtres aux données
    try {
      const hasActiveFilters = countActiveFiltersUtil(filters) > 0;
      
      if (hasActiveFilters) {
        // Utiliser la nouvelle méthode avec filtres avancés
        const result = await blockedApi.getAllWithAdvancedFilters(filters);
        console.log(`Filtres appliqués: ${result.total} résultats trouvés`);
      }
      
      // Recharger les stats
      await loadStats(false);
      
      toast.success('Filtres appliqués', `${countActiveFiltersUtil(filters)} filtre(s) actif(s)`);
    } catch (error) {
      console.error('Erreur lors de l\'application des filtres:', error);
      toast.error('Erreur', 'Impossible d\'appliquer les filtres');
    };
  }, [loadStats, toast]);

  // Helper pour compter les filtres
  // Removed: countFilters - now using countActiveFiltersUtil from command-center

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    return countActiveFiltersUtil(activeFilters);
  }, [activeFilters]);

  // Handle go back
  const handleGoBack = useCallback(() => {
    goBack();
    setActiveCategory(navigation.mainCategory);
    setActiveSubCategory(navigation.subCategory);
  }, [goBack, navigation]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.isContentEditable) return;
      if (['input', 'textarea', 'select'].includes(target?.tagName?.toLowerCase() || '')) return;

      const isMod = e.metaKey || e.ctrlKey;

      // ⌘K - Command palette
      if (isMod && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        toggleCommandPalette();
        return;
      }

      // ⌘B - Toggle sidebar
      if (isMod && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        toggleSidebar();
        return;
      }

      // ⌘D - Decision center
      if (isMod && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        openModal('decision-center');
        return;
      }

      // ⌘I - Stats
      if (isMod && e.key.toLowerCase() === 'i') {
        e.preventDefault();
        openModal('stats');
        return;
      }

      // F1 - Help
      if (e.key === 'F1') {
        e.preventDefault();
        setHelpModalOpen(true);
        return;
      }

      // ⌘E - Export
      if (isMod && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        openModal('export');
        return;
      }

      // ⌘F - Filters
      if (isMod && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setFiltersPanelOpen((prev) => !prev);
        return;
      }

      // F11 - Fullscreen
      if (e.key === 'F11') {
        e.preventDefault();
        toggleFullscreen();
        return;
      }

      // Alt + Left - Back
      if (e.altKey && e.key === 'ArrowLeft') {
        e.preventDefault();
        handleGoBack();
        return;
      }

      // ? - Help
      if (e.key === '?' && !isMod) {
        e.preventDefault();
        openModal('shortcuts');
      }

      // Escape
      if (e.key === 'Escape') {
        if (commandPaletteOpen) toggleCommandPalette();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleCommandPalette, toggleFullscreen, handleGoBack, openModal, commandPaletteOpen, toggleSidebar]);

  const formatLastUpdate = useCallback(() => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastUpdate.getTime()) / 1000);
    if (diff < 60) return 'à l\'instant';
    if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
    return `il y a ${Math.floor(diff / 3600)}h`;
  }, [lastUpdate]);

  return (
    <div
      className={cn(
        'flex h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden',
        fullscreen && 'fixed inset-0 z-50'
      )}
    >
      {/* Sidebar Navigation - 3-level */}
      <BlockedSidebar
        activeCategory={activeCategory}
        activeSubCategory={activeSubCategory || undefined}
        collapsed={sidebarCollapsed}
        stats={stats ? {
          total: stats.total,
          critical: stats.critical,
          high: stats.high,
          medium: stats.medium,
          low: stats.low,
        } : undefined}
        onCategoryChange={handleCategoryChange}
        onToggleCollapse={toggleSidebar}
        onOpenCommandPalette={toggleCommandPalette}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar */}
        <header className="flex items-center justify-between px-4 py-2 border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            {/* Back Button */}
            {navigationHistory.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleGoBack}
                className="h-8 w-8 p-0 text-slate-500 hover:text-slate-300"
                title="Retour (Alt+←)"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}

            {/* Title */}
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <h1 className="text-base font-semibold text-slate-200">Dossiers bloqués</h1>
              <Badge
                variant="default"
                className="text-xs bg-slate-800/50 text-slate-300 border-slate-700/50"
              >
                v2.0
              </Badge>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {/* Search */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleCommandPalette}
              className="h-8 gap-1.5 text-slate-400 hover:text-slate-200"
              title="Rechercher (⌘K)"
            >
              <Search className="h-4 w-4" />
            </Button>

            {/* Filters */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFiltersPanelOpen(true)}
              className={cn(
                'h-8 gap-1.5 text-slate-400 hover:text-slate-200',
                activeFiltersCount > 0 && 'text-blue-400 hover:text-blue-300'
              )}
              title="Filtres avancés (⌘F)"
            >
              <Filter className="h-4 w-4" />
              {activeFiltersCount > 0 && (
                <span className="text-xs bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </Button>

            {/* Decision Center */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => openModal('decision-center')}
              className={cn(
                'h-8 gap-1.5 text-slate-400 hover:text-slate-200',
                stats?.critical && stats.critical > 0 && 'text-orange-400 hover:text-orange-300'
              )}
              title="Centre de décision (⌘D)"
            >
              <Zap className="h-4 w-4" />
              <span className="hidden sm:inline text-sm">Décider</span>
            </Button>

            {/* Notifications */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleNotificationsPanel}
              className={cn(
                'h-8 w-8 p-0 relative',
                notificationsPanelOpen
                  ? 'text-blue-400 bg-slate-800/50'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
              )}
              title="Notifications"
            >
              <Bell className="h-4 w-4" />
              {stats?.overdueSLA && stats.overdueSLA > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                  {stats.overdueSLA}
                </span>
              )}
            </Button>

            {/* Actions Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-slate-500 hover:text-slate-300"
                  title="Actions"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={handleRefresh} disabled={isRefreshing}>
                  <RefreshCw className={cn('mr-2 h-4 w-4', isRefreshing && 'animate-spin')} />
                  Rafraîchir
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => openModal('export')}>
                  <Download className="mr-2 h-4 w-4" />
                  Exporter
                  <kbd className="ml-auto text-xs bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded">
                    ⌘E
                  </kbd>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setFiltersPanelOpen(true)}>
                  <Filter className="mr-2 h-4 w-4" />
                  Filtres avancés
                  {activeFiltersCount > 0 && (
                    <span className="ml-1 text-xs text-blue-400">({activeFiltersCount})</span>
                  )}
                  <kbd className="ml-auto text-xs bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded">
                    ⌘F
                  </kbd>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => openModal('stats')}>
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Statistiques
                  <kbd className="ml-auto text-xs bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded">
                    ⌘I
                  </kbd>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setHelpModalOpen(true)}>
                  <HelpCircle className="mr-2 h-4 w-4" />
                  Aide
                  <kbd className="ml-auto text-xs bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded">
                    F1
                  </kbd>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={toggleFullscreen}>
                  <Settings className="mr-2 h-4 w-4" />
                  Plein écran
                  <kbd className="ml-auto text-xs bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded">
                    F11
                  </kbd>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => openModal('shortcuts')}>
                  <span className="mr-2">⌨️</span>
                  Raccourcis
                  <kbd className="ml-auto text-xs bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded">
                    ?
                  </kbd>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Sub Navigation - 3-level */}
        <BlockedSubNavigation
          mainCategory={activeCategory as BlockedMainCategory}
          subCategory={activeSubCategory || undefined}
          subSubCategory={activeSubSubCategory}
          onSubCategoryChange={handleSubCategoryChange}
          onSubSubCategoryChange={handleSubSubCategoryChange}
          stats={stats ? {
            total: stats.total,
            critical: stats.critical,
            high: stats.high,
            medium: stats.medium,
            low: stats.low,
          } : undefined}
        />

        {/* KPI Bar */}
        <BlockedKPIBar 
          onRefresh={handleRefresh} 
          isRefreshing={isRefreshing} 
        />

        {/* Main Content */}
        <main className="flex-1 overflow-hidden">
          <div className="h-full overflow-x-hidden overflow-y-auto">
            <BlockedContentRouter
              mainCategory={activeCategory as BlockedMainCategory}
              subCategory={activeSubCategory || undefined}
              subSubCategory={activeSubSubCategory}
            />
          </div>
        </main>

        {/* Status Bar */}
        <footer className="flex items-center justify-between px-4 py-1.5 border-t border-slate-800/50 bg-slate-900/60 text-xs">
          <div className="flex items-center gap-4">
            <span className="text-slate-600">
              Màj: {formatLastUpdate()}
            </span>
            <span className="text-slate-700">•</span>
            <span className="text-slate-600">
              {stats?.total ?? 0} blocages • {stats?.critical ?? 0} critiques • {stats?.resolvedToday ?? 0} résolus
            </span>
            {wsConnected && (
              <>
                <span className="text-slate-700">•</span>
                <span className="text-slate-600">
                  🔴 Temps réel ({subscriptionsCount} abonnements)
                </span>
              </>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div
                className={cn(
                  'w-2 h-2 rounded-full',
                  liveStats.isRefreshing 
                    ? 'bg-amber-500 animate-pulse' 
                    : wsConnected 
                    ? 'bg-emerald-500 animate-pulse' 
                    : 'bg-emerald-500'
                )}
              />
              <span className="text-slate-500">
                {liveStats.isRefreshing 
                  ? 'Synchronisation...' 
                  : wsConnected 
                  ? 'Temps réel' 
                  : 'Connecté'}
              </span>
            </div>
          </div>
        </footer>
      </div>

      {/* Modals */}
      <BlockedModals />

      {/* Command Palette */}
      <BlockedCommandPalette
        open={commandPaletteOpen}
        onClose={toggleCommandPalette}
        onOpenStats={() => openModal('stats')}
        onOpenDecisionCenter={() => openModal('decision-center')}
        onOpenMatrix={() => {}}
        onRefresh={handleRefresh}
      />

      {/* Notifications Panel */}
      {notificationsPanelOpen && (
        <NotificationsPanel onClose={toggleNotificationsPanel} />
      )}

      {/* Filters Panel */}
      <BlockedFiltersPanel
        isOpen={filtersPanelOpen}
        onClose={() => setFiltersPanelOpen(false)}
        onApplyFilters={handleApplyFilters}
        currentFilters={activeFilters}
      />

      {/* Help Modal */}
      <BlockedHelpModal
        open={helpModalOpen}
        onClose={() => setHelpModalOpen(false)}
      />
    </div>
  );
}

// ================================
// Notifications Panel
// ================================
function NotificationsPanel({ onClose }: { onClose: () => void }) {
  const { stats } = useBlockedCommandCenterStore();

  const notifications = [
    {
      id: '1',
      type: 'critical',
      title: `${stats?.critical ?? 0} blocages critiques en attente`,
      time: 'maintenant',
      read: false,
    },
    {
      id: '2',
      type: 'warning',
      title: `${stats?.overdueSLA ?? 0} SLA dépassés`,
      time: 'il y a 15 min',
      read: false,
    },
    {
      id: '3',
      type: 'info',
      title: 'Statistiques actualisées',
      time: 'il y a 1h',
      read: true,
    },
  ];

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />

      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 w-80 bg-slate-900 border-l border-slate-700/50 z-50 flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/50">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-blue-400" />
            <h3 className="text-sm font-medium text-slate-200">Notifications</h3>
            <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">
              2 nouvelles
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-7 w-7 p-0 text-slate-500 hover:text-slate-300"
          >
            ×
          </Button>
        </div>

        <div className="flex-1 overflow-x-hidden overflow-y-auto divide-y divide-slate-800/50">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={cn(
                'px-4 py-3 hover:bg-slate-800/30 cursor-pointer transition-colors',
                !notif.read && 'bg-slate-800/20'
              )}
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

// ================================
// Main Component (with Provider)
// ================================
export default function BlockedPage() {
  return (
    <BlockedToastProvider>
      <BlockedPageContent />
    </BlockedToastProvider>
  );
}
