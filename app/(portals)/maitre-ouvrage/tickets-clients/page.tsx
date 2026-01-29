'use client';

/**
 * Centre de Commandement Tickets Clients - Version 2.0
 * Plateforme de gestion des tickets et support client
 * Architecture cohérente avec Analytics, Gouvernance et Blocked
 */

import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Ticket,
  Search,
  Bell,
  ChevronLeft,
  RefreshCw,
  Plus,
  Download,
  Settings,
  MoreHorizontal,
  HelpCircle,
  Maximize,
  Minimize,
  BarChart2,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Star,
  StarOff,
  History,
  Activity,
  ArrowUpRight,
  Zap,
  MessageSquare,
  Users,
  Filter,
  X,
  ExternalLink,
  Copy,
  Keyboard,
} from 'lucide-react';
import { useTicketsWorkspaceStore } from '@/lib/stores/ticketsWorkspaceStore';
import {
  TicketsKPIBar,
  TicketsModals,
  TicketsFiltersPanel,
  TicketsToastProvider,
  countActiveTicketsFilters,
  ticketsCategories,
  ticketsSubCategoriesMap,
  ticketsFiltersMap,
  type TicketsActiveFilters,
} from '@/components/features/bmo/workspace/tickets/command-center';
// New 3-level navigation module
import {
  TicketsSidebar,
  TicketsSubNavigation,
  TicketsContentRouter,
  type TicketsMainCategory,
} from '@/modules/tickets-clients';
import {
  TicketsCommandPalette,
  TicketsStatsModal,
  TicketsDirectionPanel,
} from '@/components/features/bmo/workspace/tickets';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { FluentModal } from '@/components/ui/fluent-modal';
import { ticketsApi } from '@/lib/services/ticketsApiService';
import { useRealtimeTickets } from '@/lib/hooks/useRealtimeTickets';

// ================================
// Types
// ================================
type ModalId = 
  | 'create-ticket'
  | 'ticket-detail'
  | 'quick-reply'
  | 'escalate'
  | 'batch-action'
  | 'stats'
  | 'analytics'
  | 'export'
  | 'help'
  | 'sla-breached'
  | 'critical-queue'
  | 'send-reminder'
  | null;

interface ModalState {
  id: ModalId;
  data?: any;
}

// ================================
// Local Storage Keys
// ================================
const LS_PINNED_VIEWS = 'bmo.tickets.pinnedViews.v1';

interface PinnedView {
  key: string;
  title: string;
  icon: string;
  queue: string;
}

const readPinnedViews = (): PinnedView[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LS_PINNED_VIEWS);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.slice(0, 20) : [];
  } catch {
    return [];
  }
};

const writePinnedViews = (views: PinnedView[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LS_PINNED_VIEWS, JSON.stringify(views.slice(0, 20)));
  } catch {}
};

// ================================
// Helpers
// ================================
function useInterval(fn: () => void, delay: number | null): void {
  const ref = useRef(fn);
  useEffect(() => {
    ref.current = fn;
  }, [fn]);
  useEffect(() => {
    if (delay === null) return;
    const id = window.setInterval(() => ref.current(), delay);
    return () => window.clearInterval(id);
  }, [delay]);
}

// ================================
// Main Component
// ================================
function TicketsClientsPageContent() {
  const {
    navigation,
    navigationHistory,
    sidebarCollapsed,
    kpiConfig,
    fullscreen,
    notificationsPanelOpen,
    commandPaletteOpen,
    statsModalOpen,
    directionPanelOpen,
    filtersPanelOpen,
    navigate,
    goBack,
    toggleSidebar,
    setKPIConfig,
    toggleFullscreen,
    toggleNotificationsPanel,
    toggleFiltersPanel,
    openCommandPalette,
    setCommandPaletteOpen,
    setStatsModalOpen,
    setDirectionPanelOpen,
    openModal,
    closeModal,
  } = useTicketsWorkspaceStore();

  // WebSocket temps réel
  const { isConnected: wsConnected, subscriptionsCount } = useRealtimeTickets({
    autoConnect: true,
    showToasts: true,
    autoInvalidateQueries: true,
  });

  // Refs pour cleanup
  const abortRef = useRef<AbortController | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // UI state
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [helpOpen, setHelpOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);

  // Modal state (legacy - pour modales locales)
  const [modal, setModal] = useState<ModalState>({ id: null });

  // Filters state
  const [activeFilters, setActiveFilters] = useState<TicketsActiveFilters>({
    status: [],
    priority: [],
    category: [],
    assigneeId: null,
    clientId: null,
    tags: [],
    slaBreached: null,
    unassigned: null,
    vipOnly: false,
    dateFrom: '',
    dateTo: '',
    search: '',
  });

  // Pinned views / Watchlist
  const [pinnedViews, setPinnedViews] = useState<PinnedView[]>([]);

  // Stats (will be loaded from API)
  const [stats, setStats] = useState({
    total: 42,
    open: 15,
    critical: 5,
    slaBreached: 3,
    resolvedToday: 28,
    avgResponseTime: 24,
    satisfactionScore: 4.6,
  });
  const [statsLoading, setStatsLoading] = useState(false);

  // ================================
  // Initialize
  // ================================
  useEffect(() => {
    setPinnedViews(readPinnedViews());
  }, []);

  useEffect(() => {
    writePinnedViews(pinnedViews);
  }, [pinnedViews]);

  // Cleanup refs on unmount
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      if (pollingRef.current) {
        clearTimeout(pollingRef.current);
      }
    };
  }, []);

  // Fullscreen handling
  useEffect(() => {
    if (!fullscreen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [fullscreen]);

  // Auto refresh
  useInterval(
    () => {
      if (autoRefresh && !isRefreshing) {
        handleRefresh('auto');
      }
    },
    autoRefresh ? 60000 : null
  );

  // ================================
  // Computed values
  // ================================
  const currentCategoryLabel = useMemo(() => {
    return ticketsCategories.find((c) => c.id === navigation.mainCategory)?.label || 'Tickets';
  }, [navigation.mainCategory]);

  const currentSubCategories = useMemo(() => {
    return ticketsSubCategoriesMap[navigation.mainCategory] || [];
  }, [navigation.mainCategory]);

  const currentFilters = useMemo(() => {
    return ticketsFiltersMap[`${navigation.mainCategory}:${navigation.subCategory}`] || [];
  }, [navigation.mainCategory, navigation.subCategory]);

  const activeFiltersCount = useMemo(() => 
    countActiveTicketsFilters(activeFilters), 
    [activeFilters]
  );

  const formatLastUpdate = useCallback(() => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastUpdate.getTime()) / 1000);
    if (diff < 60) return "à l'instant";
    if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
    return `il y a ${Math.floor(diff / 3600)}h`;
  }, [lastUpdate]);

  // ================================
  // Load Stats from API
  // ================================
  const loadStats = useCallback(async (signal?: AbortSignal) => {
    try {
      setStatsLoading(true);
      const apiStats = await ticketsApi.getStats();
      
      setStats({
        total: apiStats.total,
        open: (apiStats.open || 0) + (apiStats.inProgress || 0),
        critical: apiStats.critical || 0,
        slaBreached: apiStats.slaBreached || 0,
        resolvedToday: apiStats.resolvedToday || 0,
        avgResponseTime: apiStats.avgResponseTime || 0,
        satisfactionScore: apiStats.satisfactionScore || 0,
      });
    } catch (error: any) {
      if (error?.name !== 'AbortError') {
        console.error('[TicketsPage] Erreur chargement stats:', error);
      }
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // Load stats on mount
  useEffect(() => {
    const controller = new AbortController();
    abortRef.current = controller;
    loadStats(controller.signal);
    
    return () => {
      controller.abort();
    };
  }, [loadStats]);

  // ================================
  // Callbacks
  // ================================
  const handleRefresh = useCallback(async (reason: 'init' | 'manual' | 'auto' = 'manual') => {
    setIsRefreshing(true);
    
    try {
      // Annuler la requête précédente si elle existe
      abortRef.current?.abort();
      
      // Créer un nouveau controller
      const controller = new AbortController();
      abortRef.current = controller;
      
      // Charger les stats
      await loadStats(controller.signal);
      
      setLastUpdate(new Date());
      
      if (reason === 'manual') {
        // Success toast could be shown here
        console.log('[TicketsPage] Refresh manual réussi');
      }
    } catch (error: any) {
      if (error?.name !== 'AbortError') {
        console.error('[TicketsPage] Erreur refresh:', error);
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [loadStats]);

  const handleApplyFilters = useCallback((filters: TicketsActiveFilters) => {
    setActiveFilters(filters);
    // Les filtres seront utilisés par TicketsContentRouter pour filtrer les résultats
  }, []);

  const handleCategoryChange = useCallback((category: string, subCategory?: string) => {
    if (category !== navigation.mainCategory) {
      navigate(category, subCategory || 'all', null);
    } else if (subCategory) {
      navigate(category, subCategory, null);
    }
  }, [navigate, navigation.mainCategory]);

  const handleSubCategoryChange = useCallback((subCategory: string) => {
    navigate(navigation.mainCategory, subCategory, null);
  }, [navigate, navigation.mainCategory]);

  const handleSubSubCategoryChange = useCallback((subSubCategory: string) => {
    navigate(navigation.mainCategory, navigation.subCategory, subSubCategory);
  }, [navigate, navigation.mainCategory, navigation.subCategory]);

  const handleOpenTicket = useCallback((ticketId: string) => {
    setModal({ id: 'ticket-detail', data: { ticketId } });
  }, []);

  const handleOpenModal = useCallback((modalId: string, data?: any) => {
    setModal({ id: modalId as ModalId, data });
  }, []);

  const handleCloseModal = useCallback(() => {
    setModal({ id: null });
  }, []);

  const pinView = useCallback((view: PinnedView) => {
    setPinnedViews((prev) => {
      const exists = prev.some((x) => x.key === view.key);
      return exists ? prev : [view, ...prev].slice(0, 20);
    });
  }, []);

  const unpinView = useCallback((key: string) => {
    setPinnedViews((prev) => prev.filter((x) => x.key !== key));
  }, []);

  const handleExport = useCallback(async (format: 'csv' | 'pdf' | 'json') => {
    setExportOpen(false);
    // Simulate export
    console.log('Exporting in format:', format);
  }, []);

  // ================================
  // Keyboard shortcuts
  // ================================
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      const isMod = e.metaKey || e.ctrlKey;

      // Ctrl+K : Command Palette
      if (isMod && e.key === 'k') {
        e.preventDefault();
        openCommandPalette();
        return;
      }

      // Ctrl+R : Refresh
      if (isMod && e.key === 'r') {
        e.preventDefault();
        handleRefresh('manual');
        return;
      }

      // Ctrl+N : New ticket
      if (isMod && e.key === 'n') {
        e.preventDefault();
        setModal({ id: 'create-ticket' });
        return;
      }

      // Ctrl+E : Export
      if (isMod && e.key === 'e') {
        e.preventDefault();
        setExportOpen(true);
        return;
      }

      // F11 : Fullscreen
      if (e.key === 'F11') {
        e.preventDefault();
        toggleFullscreen();
        return;
      }

      // Alt+Left : Back
      if (e.altKey && e.key === 'ArrowLeft') {
        e.preventDefault();
        goBack();
        return;
      }

      // Ctrl+B : Toggle sidebar
      if (isMod && e.key === 'b') {
        e.preventDefault();
        toggleSidebar();
        return;
      }

      // ? : Help
      if (e.key === '?' && !isMod) {
        e.preventDefault();
        setHelpOpen(true);
        return;
      }

      // Ctrl+F : Filtres avancés
      if (isMod && e.key === 'f') {
        e.preventDefault();
        toggleFiltersPanel();
        return;
      }

      // Ctrl+D : Decision Center (via centralized modals)
      if (isMod && e.key === 'd') {
        e.preventDefault();
        openModal('decision-center');
        return;
      }

      // Escape : Close modals
      if (e.key === 'Escape') {
        if (modal.id) handleCloseModal();
        else if (commandPaletteOpen) setCommandPaletteOpen(false);
        else if (notificationsPanelOpen) toggleNotificationsPanel();
        else if (filtersPanelOpen) toggleFiltersPanel();
        else if (helpOpen) setHelpOpen(false);
        else if (exportOpen) setExportOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    openCommandPalette,
    handleRefresh,
    toggleFullscreen,
    goBack,
    toggleSidebar,
    toggleFiltersPanel,
    openModal,
    commandPaletteOpen,
    notificationsPanelOpen,
    filtersPanelOpen,
    modal.id,
    helpOpen,
    exportOpen,
    handleCloseModal,
    setCommandPaletteOpen,
    toggleNotificationsPanel,
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
      {/* Sidebar Navigation - 3-level */}
      <TicketsSidebar
        activeCategory={navigation.mainCategory}
        activeSubCategory={navigation.subCategory}
        collapsed={sidebarCollapsed}
        stats={{
          open: stats.open,
          inProgress: 0,
          pending: stats.open - stats.critical,
          resolved: stats.resolvedToday,
        }}
        onCategoryChange={handleCategoryChange}
        onToggleCollapse={toggleSidebar}
        onOpenCommandPalette={openCommandPalette}
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
                onClick={goBack}
                className="h-8 w-8 p-0 text-slate-500 hover:text-slate-300"
                title="Retour (Alt+←)"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}

            {/* Title */}
            <div className="flex items-center gap-2">
              <Ticket className="h-5 w-5 text-purple-400" />
              <h1 className="text-base font-semibold text-slate-200">Tickets Clients</h1>
              <Badge
                variant="default"
                className="text-xs bg-slate-800/50 text-slate-300 border-slate-700/50"
              >
                v2.0
              </Badge>
            </div>

            {/* Live Stats */}
            <div className="hidden lg:flex items-center gap-3 ml-4 text-xs">
              <div className="flex items-center gap-1.5 text-slate-400">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Temps réel</span>
              </div>
              <div className="w-px h-4 bg-slate-700" />
              <span className="text-slate-500">
                {stats.open} ouverts • {stats.critical} critiques
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {/* Search */}
            <Button
              variant="ghost"
              size="sm"
              onClick={openCommandPalette}
              className="h-8 px-3 text-slate-500 hover:text-slate-300 hover:bg-slate-800/50"
            >
              <Search className="h-4 w-4 mr-2" />
              <span className="text-xs hidden sm:inline">Rechercher</span>
              <kbd className="ml-2 text-xs bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded hidden sm:inline">
                ⌘K
              </kbd>
            </Button>

            <div className="w-px h-4 bg-slate-700/50 mx-1" />

            {/* New Ticket Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setModal({ id: 'create-ticket' })}
              className="h-8 px-3 text-slate-500 hover:text-slate-300 hover:bg-slate-800/50"
            >
              <Plus className="h-4 w-4 mr-1" />
              <span className="text-xs hidden sm:inline">Nouveau</span>
            </Button>

            {/* Refresh */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleRefresh('manual')}
              className="h-8 w-8 p-0 text-slate-500 hover:text-slate-300"
              title="Rafraîchir (⌘R)"
            >
              <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
            </Button>

            {/* Filters */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFiltersPanel}
              className={cn(
                'h-8 w-8 p-0 relative',
                filtersPanelOpen
                  ? 'text-purple-400 bg-purple-500/10'
                  : 'text-slate-500 hover:text-slate-300'
              )}
              title="Filtres avancés (⌘F)"
            >
              <Filter className="h-4 w-4" />
              {activeFiltersCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-purple-500 rounded-full text-xs text-white flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </Button>

            {/* Stats */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStatsModalOpen(true)}
              className="h-8 w-8 p-0 text-slate-500 hover:text-slate-300"
              title="Statistiques"
            >
              <BarChart2 className="h-4 w-4" />
            </Button>

            {/* Notifications */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleNotificationsPanel}
              className={cn(
                'h-8 w-8 p-0 relative',
                notificationsPanelOpen
                  ? 'text-slate-200 bg-slate-800/50'
                  : 'text-slate-500 hover:text-slate-300'
              )}
              title="Notifications"
            >
              <Bell className="h-4 w-4" />
              {stats.critical > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rose-500 rounded-full text-xs text-white flex items-center justify-center">
                  {stats.critical}
                </span>
              )}
            </Button>

            {/* Fullscreen */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFullscreen}
              className="h-8 w-8 p-0 text-slate-500 hover:text-slate-300"
              title="Plein écran (F11)"
            >
              {fullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            </Button>

            {/* Help */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setHelpOpen(true)}
              className="h-8 w-8 p-0 text-slate-500 hover:text-slate-300"
              title="Aide (?)"
            >
              <HelpCircle className="h-4 w-4" />
            </Button>

            {/* Help */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setHelpOpen(true)}
              className="h-8 w-8 p-0 text-slate-500 hover:text-slate-300"
              title="Aide (?)"
            >
              <HelpCircle className="h-4 w-4" />
            </Button>

            {/* Actions Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-slate-500 hover:text-slate-300"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => handleRefresh('manual')}>
                  <RefreshCw className={cn('h-4 w-4 mr-2', isRefreshing && 'animate-spin')} />
                  Rafraîchir
                  <span className="ml-auto text-xs text-slate-500">⌘R</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setModal({ id: 'create-ticket' })}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nouveau ticket
                  <span className="ml-auto text-xs text-slate-500">⌘N</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setExportOpen(true)}>
                  <Download className="h-4 w-4 mr-2" />
                  Exporter
                  <span className="ml-auto text-xs text-slate-500">⌘E</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatsModalOpen(true)}>
                  <BarChart2 className="h-4 w-4 mr-2" />
                  Statistiques
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => openModal('decision-center')}>
                  <Zap className="h-4 w-4 mr-2" />
                  Centre de décision
                  <span className="ml-auto text-xs text-slate-500">⌘D</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={toggleFiltersPanel}>
                  <Filter className="h-4 w-4 mr-2" />
                  Filtres avancés
                  {activeFiltersCount > 0 && (
                    <Badge className="ml-auto bg-purple-500/20 text-purple-400 text-xs">
                      {activeFiltersCount}
                    </Badge>
                  )}
                  <span className="ml-auto text-xs text-slate-500">⌘F</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setDirectionPanelOpen(!directionPanelOpen)}>
                  <Activity className="h-4 w-4 mr-2" />
                  Panneau direction
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setAutoRefresh(!autoRefresh)}>
                  <Clock className="h-4 w-4 mr-2" />
                  Auto-refresh: {autoRefresh ? 'ON' : 'OFF'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setHelpOpen(true)}>
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Aide & Raccourcis
                  <span className="ml-auto text-xs text-slate-500">?</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Sub Navigation - Level 2 & 3 */}
        <TicketsSubNavigation
          mainCategory={navigation.mainCategory as TicketsMainCategory}
          subCategory={navigation.subCategory}
          subSubCategory={navigation.filter ?? undefined}
          onSubCategoryChange={handleSubCategoryChange}
          onSubSubCategoryChange={currentFilters.length > 0 ? handleSubSubCategoryChange : undefined}
          stats={{
            open: stats.open,
            inProgress: 0,
            pending: stats.open - stats.critical,
            resolved: stats.resolvedToday,
          }}
        />

        {/* KPI Bar */}
        <TicketsKPIBar
          visible={kpiConfig.visible}
          collapsed={kpiConfig.collapsed}
          onToggleCollapse={() => setKPIConfig({ collapsed: !kpiConfig.collapsed })}
          onRefresh={() => handleRefresh('manual')}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-hidden">
          <div className="h-full overflow-x-hidden overflow-y-auto">
            <TicketsContentRouter
              mainCategory={navigation.mainCategory as TicketsMainCategory}
              subCategory={navigation.subCategory}
              subSubCategory={navigation.filter ?? undefined}
            />
          </div>
        </main>

        {/* Status Bar */}
        <footer className="flex items-center justify-between px-4 py-1.5 border-t border-slate-800/50 bg-slate-900/60 text-xs">
          <div className="flex items-center gap-4">
            <span className="text-slate-600">MàJ: {formatLastUpdate()}</span>
            <span className="text-slate-700">•</span>
            <span className="text-slate-600">
              {stats.total} tickets • {stats.critical} critiques • {stats.slaBreached} SLA
            </span>
            {autoRefresh && (
              <>
                <span className="text-slate-700">•</span>
                <span className="text-slate-600 flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Auto-refresh 60s
                </span>
              </>
            )}
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setHelpOpen(true)}
              className="text-slate-600 hover:text-slate-400 flex items-center gap-1"
            >
              <Keyboard className="w-3 h-3" />
              Raccourcis
            </button>
            <div className="flex items-center gap-1.5">
              <div
                className={cn(
                  'w-2 h-2 rounded-full',
                  isRefreshing ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'
                )}
              />
              <span className="text-slate-500">
                {isRefreshing ? 'Synchronisation...' : 'Connecté'}
              </span>
            </div>
          </div>
        </footer>
      </div>

      {/* Command Palette */}
      <TicketsCommandPalette
        open={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onOpenStats={() => setStatsModalOpen(true)}
        onRefresh={() => handleRefresh('manual')}
      />

      {/* Stats Modal */}
      <TicketsStatsModal
        open={statsModalOpen}
        onClose={() => setStatsModalOpen(false)}
      />

      {/* Direction Panel */}
      <TicketsDirectionPanel
        open={directionPanelOpen}
        onClose={() => setDirectionPanelOpen(false)}
      />

      {/* Notifications Panel */}
      {notificationsPanelOpen && (
        <NotificationsPanel 
          onClose={toggleNotificationsPanel}
          criticalCount={stats.critical}
        />
      )}

      {/* Help Modal */}
      <HelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />

      {/* Export Modal */}
      <ExportModal 
        open={exportOpen} 
        onClose={() => setExportOpen(false)}
        onExport={handleExport}
      />

      {/* Dynamic Modals */}
      {modal.id === 'create-ticket' && (
        <CreateTicketModal onClose={handleCloseModal} />
      )}
      {modal.id === 'ticket-detail' && (
        <TicketDetailModal ticketId={modal.data?.ticketId} onClose={handleCloseModal} />
      )}
      {modal.id === 'quick-reply' && (
        <QuickReplyModal onClose={handleCloseModal} />
      )}
      {modal.id === 'escalate' && (
        <EscalateModal onClose={handleCloseModal} />
      )}
      {modal.id === 'batch-action' && (
        <BatchActionModal onClose={handleCloseModal} />
      )}

      {/* ======================================== */}
      {/* SOPHISTICATED COMPONENTS - NEW */}
      {/* ======================================== */}
      
      {/* Centralized Modals System */}
      <TicketsModals />

      {/* Advanced Filters Panel */}
      <TicketsFiltersPanel />
    </div>
  );
}

export default function TicketsClientsPage() {
  return (
    <TicketsToastProvider>
      <TicketsClientsPageContent />
    </TicketsToastProvider>
  );
}

// ================================
// Notifications Panel
// ================================
function NotificationsPanel({ 
  onClose,
  criticalCount,
}: { 
  onClose: () => void;
  criticalCount: number;
}) {
  const notifications = [
    { id: '1', type: 'critical', title: 'Ticket critique TK-2024-0142', description: 'SLA en risque - Facturation Acme Corp', time: 'il y a 5 min', read: false },
    { id: '2', type: 'warning', title: 'SLA en risque - 3 tickets', description: 'Temps de réponse dépassé', time: 'il y a 15 min', read: false },
    { id: '3', type: 'info', title: 'Ticket TK-2024-0135 résolu', description: 'Résolu par Jean Pierre', time: 'il y a 1h', read: true },
    { id: '4', type: 'warning', title: 'Nouveau ticket VIP', description: 'Client MegaCorp - Priorité haute', time: 'il y a 2h', read: true },
    { id: '5', type: 'info', title: 'Rapport hebdomadaire prêt', description: '234 tickets traités cette semaine', time: 'hier', read: true },
  ];

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />

      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 w-96 bg-slate-900 border-l border-slate-700/50 z-50 flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/50">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-purple-400" />
            <h3 className="text-sm font-medium text-slate-200">Notifications</h3>
            {criticalCount > 0 && (
              <Badge className="bg-rose-500/20 text-rose-400 border-rose-500/30 text-xs">
                {criticalCount} critiques
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-7 w-7 p-0 text-slate-500 hover:text-slate-300"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={cn(
                'px-4 py-3 border-b border-slate-800/30 hover:bg-slate-800/30 cursor-pointer transition-colors',
                !notif.read && 'bg-slate-800/20'
              )}
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    'w-2 h-2 rounded-full mt-1.5 flex-shrink-0',
                    notif.type === 'critical'
                      ? 'bg-rose-500 animate-pulse'
                      : notif.type === 'warning'
                      ? 'bg-amber-500'
                      : 'bg-blue-500'
                  )}
                />
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      'text-sm',
                      !notif.read ? 'text-slate-200 font-medium' : 'text-slate-400'
                    )}
                  >
                    {notif.title}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">{notif.description}</p>
                  <p className="text-xs text-slate-600 mt-1">{notif.time}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-slate-800/50 space-y-2">
          <Button variant="outline" size="sm" className="w-full border-slate-700 text-slate-400">
            Voir toutes les notifications
          </Button>
          <Button variant="ghost" size="sm" className="w-full text-slate-500">
            Marquer tout comme lu
          </Button>
        </div>
      </div>
    </>
  );
}

// ================================
// Help Modal
// ================================
function HelpModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;

  const shortcuts = [
    { keys: ['⌘', 'K'], description: 'Ouvrir la recherche' },
    { keys: ['⌘', 'N'], description: 'Nouveau ticket' },
    { keys: ['⌘', 'R'], description: 'Rafraîchir' },
    { keys: ['⌘', 'E'], description: 'Exporter' },
    { keys: ['⌘', 'B'], description: 'Toggle sidebar' },
    { keys: ['F11'], description: 'Plein écran' },
    { keys: ['Alt', '←'], description: 'Retour' },
    { keys: ['?'], description: 'Aide' },
    { keys: ['Esc'], description: 'Fermer modal' },
  ];

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-50" onClick={onClose} />
      <div className="fixed inset-x-4 top-[10%] bottom-[10%] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-[500px] bg-slate-900 border border-slate-700/50 rounded-xl z-50 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50">
          <h2 className="text-lg font-semibold text-slate-200">Aide & Raccourcis</h2>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <h3 className="text-sm font-medium text-slate-300 mb-4">Raccourcis clavier</h3>
          <div className="space-y-3">
            {shortcuts.map((s, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-sm text-slate-400">{s.description}</span>
                <div className="flex items-center gap-1">
                  {s.keys.map((key, j) => (
                    <kbd
                      key={j}
                      className="px-2 py-1 text-xs font-mono bg-slate-800 border border-slate-700 rounded text-slate-300"
                    >
                      {key}
                    </kbd>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

// ================================
// Export Modal
// ================================
function ExportModal({ 
  open, 
  onClose,
  onExport,
}: { 
  open: boolean; 
  onClose: () => void;
  onExport: (format: 'csv' | 'pdf' | 'json') => void;
}) {
  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-50" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] bg-slate-900 border border-slate-700/50 rounded-xl z-50 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50">
          <h2 className="text-lg font-semibold text-slate-200">Exporter les tickets</h2>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="p-6 space-y-4">
          <button
            onClick={() => onExport('csv')}
            className="w-full p-4 rounded-lg border border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/50 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <Download className="w-5 h-5 text-emerald-400" />
              <div>
                <p className="font-medium text-slate-200">Export CSV</p>
                <p className="text-xs text-slate-500">Format tableur compatible Excel</p>
              </div>
            </div>
          </button>
          <button
            onClick={() => onExport('pdf')}
            className="w-full p-4 rounded-lg border border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/50 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <Download className="w-5 h-5 text-rose-400" />
              <div>
                <p className="font-medium text-slate-200">Export PDF</p>
                <p className="text-xs text-slate-500">Rapport imprimable</p>
              </div>
            </div>
          </button>
          <button
            onClick={() => onExport('json')}
            className="w-full p-4 rounded-lg border border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/50 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <Download className="w-5 h-5 text-blue-400" />
              <div>
                <p className="font-medium text-slate-200">Export JSON</p>
                <p className="text-xs text-slate-500">Format API / Développeurs</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </>
  );
}

// ================================
// Create Ticket Modal
// ================================
function CreateTicketModal({ onClose }: { onClose: () => void }) {
  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-50" onClick={onClose} />
      <div className="fixed inset-x-4 top-[5%] bottom-[5%] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-[600px] bg-slate-900 border border-slate-700/50 rounded-xl z-50 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50">
          <h2 className="text-lg font-semibold text-slate-200">Nouveau Ticket</h2>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Client</label>
            <input
              type="text"
              placeholder="Rechercher un client..."
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Titre</label>
            <input
              type="text"
              placeholder="Titre du ticket"
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
            <textarea
              rows={4}
              placeholder="Description détaillée..."
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Priorité</label>
              <select className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200">
                <option value="low">Basse</option>
                <option value="medium">Moyenne</option>
                <option value="high">Haute</option>
                <option value="critical">Critique</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Catégorie</label>
              <select className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200">
                <option value="technique">Technique</option>
                <option value="commercial">Commercial</option>
                <option value="facturation">Facturation</option>
                <option value="livraison">Livraison</option>
                <option value="qualite">Qualité</option>
              </select>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-700/50">
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button className="bg-purple-500 hover:bg-purple-600">
            Créer le ticket
          </Button>
        </div>
      </div>
    </>
  );
}

// ================================
// Ticket Detail Modal
// ================================
function TicketDetailModal({ 
  ticketId, 
  onClose 
}: { 
  ticketId: string; 
  onClose: () => void;
}) {
  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-50" onClick={onClose} />
      <div className="fixed inset-4 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-[900px] md:top-[5%] md:bottom-[5%] bg-slate-900 border border-slate-700/50 rounded-xl z-50 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-slate-200">TK-2024-0142</h2>
            <Badge variant="destructive">Critique</Badge>
            <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">VIP</Badge>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-slate-200 mb-2">Problème de facturation récurrent</h3>
                <p className="text-slate-400">
                  Le client signale des erreurs récurrentes sur ses factures mensuelles depuis 3 mois.
                  Les montants ne correspondent pas aux prestations effectuées.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                <h4 className="text-sm font-medium text-slate-300 mb-3">Conversation</h4>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-sm font-medium">
                      C
                    </div>
                    <div className="flex-1 p-3 rounded-lg bg-slate-700/30">
                      <p className="text-sm text-slate-300">J'ai encore reçu une facture incorrecte ce mois-ci. C'est la 3ème fois !</p>
                      <p className="text-xs text-slate-500 mt-1">Il y a 2 heures</p>
                    </div>
                  </div>
                  <div className="flex gap-3 justify-end">
                    <div className="flex-1 p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                      <p className="text-sm text-slate-300">Nous nous excusons pour ce désagrément. Notre équipe facturation analyse le problème.</p>
                      <p className="text-xs text-slate-500 mt-1">Il y a 1 heure • Marie D.</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 text-sm font-medium">
                      M
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                <h4 className="text-sm font-medium text-slate-300 mb-3">Détails</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Statut</span>
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Ouvert</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Priorité</span>
                    <span className="text-rose-400">Critique</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Catégorie</span>
                    <span className="text-slate-300">Facturation</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Assigné à</span>
                    <span className="text-slate-300">Marie D.</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Créé le</span>
                    <span className="text-slate-300">10/01/2024</span>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                <h4 className="text-sm font-medium text-slate-300 mb-3">Client</h4>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 font-medium">
                    A
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-200">Acme Corp</p>
                    <p className="text-xs text-slate-500">contact@acme.com</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-700/50">
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <ArrowUpRight className="w-4 h-4 mr-1" />
              Escalader
            </Button>
            <Button variant="outline" size="sm">
              <Users className="w-4 h-4 mr-1" />
              Réassigner
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">Fermer</Button>
            <Button className="bg-purple-500 hover:bg-purple-600">
              <MessageSquare className="w-4 h-4 mr-1" />
              Répondre
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

// ================================
// Quick Reply Modal
// ================================
function QuickReplyModal({ onClose }: { onClose: () => void }) {
  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-50" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] bg-slate-900 border border-slate-700/50 rounded-xl z-50 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50">
          <h2 className="text-lg font-semibold text-slate-200">Réponse Rapide</h2>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Modèle</label>
            <select className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200">
              <option>Accusé de réception</option>
              <option>Demande d'informations</option>
              <option>Résolution en cours</option>
              <option>Ticket résolu</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Message</label>
            <textarea
              rows={4}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 resize-none"
              defaultValue="Bonjour, nous avons bien reçu votre demande. Notre équipe l'analyse et vous répondra dans les plus brefs délais."
            />
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-700/50">
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button className="bg-purple-500 hover:bg-purple-600">
            Envoyer
          </Button>
        </div>
      </div>
    </>
  );
}

// ================================
// Escalate Modal
// ================================
function EscalateModal({ onClose }: { onClose: () => void }) {
  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-50" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] bg-slate-900 border border-slate-700/50 rounded-xl z-50 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50">
          <h2 className="text-lg font-semibold text-slate-200">Escalader le ticket</h2>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Escalader vers</label>
            <select className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200">
              <option>Superviseur</option>
              <option>Direction</option>
              <option>CODIR</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Raison</label>
            <textarea
              rows={3}
              placeholder="Expliquez la raison de l'escalade..."
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 resize-none"
            />
          </div>
          <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span className="text-sm text-amber-400">Cette action notifiera immédiatement le niveau supérieur</span>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-700/50">
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button className="bg-orange-500 hover:bg-orange-600">
            <ArrowUpRight className="w-4 h-4 mr-1" />
            Escalader
          </Button>
        </div>
      </div>
    </>
  );
}

// ================================
// Batch Action Modal
// ================================
function BatchActionModal({ onClose }: { onClose: () => void }) {
  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-50" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] bg-slate-900 border border-slate-700/50 rounded-xl z-50 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50">
          <h2 className="text-lg font-semibold text-slate-200">Actions en lot</h2>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="p-6 space-y-3">
          <button className="w-full p-4 rounded-lg border border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/50 transition-colors text-left flex items-center gap-3">
            <Users className="w-5 h-5 text-blue-400" />
            <div>
              <p className="font-medium text-slate-200">Assigner à</p>
              <p className="text-xs text-slate-500">Assigner les tickets sélectionnés</p>
            </div>
          </button>
          <button className="w-full p-4 rounded-lg border border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/50 transition-colors text-left flex items-center gap-3">
            <MessageSquare className="w-5 h-5 text-purple-400" />
            <div>
              <p className="font-medium text-slate-200">Réponse groupée</p>
              <p className="text-xs text-slate-500">Envoyer une réponse à tous</p>
            </div>
          </button>
          <button className="w-full p-4 rounded-lg border border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/50 transition-colors text-left flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <div>
              <p className="font-medium text-slate-200">Marquer comme résolu</p>
              <p className="text-xs text-slate-500">Fermer les tickets sélectionnés</p>
            </div>
          </button>
          <button className="w-full p-4 rounded-lg border border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/50 transition-colors text-left flex items-center gap-3">
            <ArrowUpRight className="w-5 h-5 text-orange-400" />
            <div>
              <p className="font-medium text-slate-200">Escalader</p>
              <p className="text-xs text-slate-500">Escalader au niveau supérieur</p>
            </div>
          </button>
        </div>
      </div>
    </>
  );
}
