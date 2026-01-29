'use client';

/**
 * Centre de Commandement Recouvrements - Version 2.0
 * Architecture cohérente avec Analytics et Gouvernance
 * Navigation à 3 niveaux: Sidebar + SubNavigation + KPIBar
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DollarSign,
  Search,
  Bell,
  ChevronLeft,
  RefreshCw,
  MoreVertical,
  Download,
  Settings,
  Maximize2,
  Minimize2,
  BarChart3,
  Plus,
  Filter,
} from 'lucide-react';
import { useRecouvrementsWorkspaceStore } from '@/lib/stores/recouvrementsWorkspaceStore';
import { recouvrementsApiService, type RecouvrementsStats } from '@/lib/services/recouvrementsApiService';
import { useBMOStore } from '@/lib/stores';

// Command Center Components
import {
  RecouvrementsKPIBar,
  RecouvrementsModals,
  recouvrementsCategories,
  type RecouvrementsModalType,
} from '@/components/features/bmo/workspace/recouvrements/command-center';
import { NotificationsPanel } from '@/components/shared/NotificationsPanel';
// New 3-level navigation module
import {
  RecouvrementsSidebar,
  RecouvrementsSubNavigation,
  RecouvrementsContentRouter,
  type RecouvrementsMainCategory,
} from '@/modules/recouvrements';

// Workspace Components
import {
  RecouvrementsCommandPalette,
} from '@/components/features/bmo/workspace/recouvrements';

// ================================
// Types
// ================================
interface SubCategory {
  id: string;
  label: string;
  badge?: number | string;
  badgeType?: 'default' | 'warning' | 'critical';
}

// Sous-catégories par catégorie principale
const subCategoriesMap: Record<string, SubCategory[]> = {
  overview: [
    { id: 'all', label: 'Tout' },
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'highlights', label: 'Points clés', badge: 5 },
  ],
  pending: [
    { id: 'all', label: 'Toutes' },
    { id: 'recent', label: 'Récentes' },
    { id: 'urgent', label: 'Urgentes', badgeType: 'critical' },
  ],
  in_progress: [
    { id: 'all', label: 'Toutes' },
    { id: 'active', label: 'Actives' },
    { id: 'contacted', label: 'Contactées' },
  ],
  paid: [
    { id: 'all', label: 'Toutes' },
    { id: 'today', label: "Aujourd'hui" },
    { id: 'this_month', label: 'Ce mois' },
  ],
  litige: [
    { id: 'all', label: 'Tous' },
    { id: 'open', label: 'Ouverts', badgeType: 'critical' },
    { id: 'resolved', label: 'Résolus' },
  ],
  overdue: [
    { id: 'all', label: 'Toutes' },
    { id: 'critical', label: 'Critiques', badgeType: 'critical' },
    { id: 'high', label: 'Élevées', badgeType: 'warning' },
  ],
  irrecoverable: [
    { id: 'all', label: 'Toutes' },
    { id: 'recent', label: 'Récentes' },
    { id: 'archived', label: 'Archivées' },
  ],
  relances: [
    { id: 'all', label: 'Toutes' },
    { id: 'scheduled', label: 'Planifiées' },
    { id: 'sent', label: 'Envoyées' },
  ],
  contentieux: [
    { id: 'all', label: 'Tous' },
    { id: 'active', label: 'Actifs', badgeType: 'critical' },
    { id: 'closed', label: 'Clôturés' },
  ],
  statistiques: [
    { id: 'all', label: 'Vue globale' },
    { id: 'by_client', label: 'Par client' },
    { id: 'by_period', label: 'Par période' },
  ],
};

// ================================
// Main Component
// ================================
export default function RecouvrementsPage() {
  return <RecouvrementsPageContent />;
}

function RecouvrementsPageContent() {
  const { commandPaletteOpen, setCommandPaletteOpen } = useRecouvrementsWorkspaceStore();
  const { addToast, addActionLog, currentUser } = useBMOStore();

  // Navigation state
  const [activeCategory, setActiveCategory] = useState('overview');
  const [activeSubCategory, setActiveSubCategory] = useState('all');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // UI state
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [kpiBarCollapsed, setKpiBarCollapsed] = useState(false);
  const [notificationsPanelOpen, setNotificationsPanelOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Stats state
  const [statsData, setStatsData] = useState<RecouvrementsStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // Navigation history for back button
  const [navigationHistory, setNavigationHistory] = useState<string[]>([]);

  // Filters state
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});

  // Modal state
  const [modal, setModal] = useState<{ isOpen: boolean; type: RecouvrementsModalType }>({
    isOpen: false,
    type: null,
  });

  // ================================
  // Computed values
  // ================================
  const currentCategoryLabel = useMemo(() => {
    return recouvrementsCategories.find((c) => c.id === activeCategory)?.label || 'Recouvrements';
  }, [activeCategory]);

  const currentSubCategories = useMemo(() => {
    return subCategoriesMap[activeCategory] || [];
  }, [activeCategory]);

  // Calculer les catégories avec badges dynamiques
  const categoriesWithBadges = useMemo(() => {
    if (!statsData) return recouvrementsCategories;

    return recouvrementsCategories.map((cat) => {
      switch (cat.id) {
        case 'pending':
          return { ...cat, badge: statsData.pending, badgeType: statsData.pending > 10 ? 'warning' as const : 'default' as const };
        case 'in_progress':
          return { ...cat, badge: statsData.in_progress };
        case 'paid':
          return { ...cat, badge: statsData.paid };
        case 'litige':
          return { ...cat, badge: statsData.litige, badgeType: statsData.litige > 0 ? 'critical' as const : 'default' as const };
        case 'overdue':
          return { ...cat, badge: statsData.total - statsData.paid - statsData.litige, badgeType: 'critical' as const };
        default:
          return cat;
      }
    });
  }, [statsData]);

  const formatLastUpdate = useCallback(() => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastUpdate.getTime()) / 1000);
    if (diff < 60) return "à l'instant";
    if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
    return `il y a ${Math.floor(diff / 3600)}h`;
  }, [lastUpdate]);

  // ================================
  // Callbacks
  // ================================
  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const stats = await recouvrementsApiService.getStats();
      setStatsData(stats);
    } catch (error) {
      console.error('Erreur chargement stats:', error);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadStats();
    setLastUpdate(new Date());
    addToast('Données rafraîchies', 'success');
    addActionLog({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action: 'audit',
      module: 'recouvrements',
      targetId: 'REFRESH',
      targetType: 'system',
      targetLabel: 'Rafraîchissement',
      details: 'Rafraîchissement manuel des créances',
      bureau: 'DAF',
    });
    setTimeout(() => setIsRefreshing(false), 1000);
  }, [loadStats, addToast, addActionLog, currentUser]);

  // Navigation handlers - 3-level navigation
  const handleCategoryChange = useCallback((category: string, subCategory?: string) => {
    if (category !== activeCategory) {
      setNavigationHistory((prev) => [...prev, activeCategory]);
      setActiveCategory(category);
      setActiveSubCategory(subCategory || 'all');
    } else if (subCategory) {
      setActiveSubCategory(subCategory);
    }
  }, [activeCategory]);

  const handleSubCategoryChange = useCallback((subCategory: string) => {
    setActiveSubCategory(subCategory);
  }, []);

  const handleSubSubCategoryChange = useCallback((subSubCategory: string) => {
    // Level 3 navigation - to be implemented if needed
    console.log('Sub-sub category changed:', subSubCategory);
  }, []);

  const handleApplyFilters = useCallback((filters: Record<string, string[]>) => {
    setActiveFilters(filters);
    // TODO: Apply filters to content
    console.log('Filters applied:', filters);
  }, []);

  const handleGoBack = useCallback(() => {
    if (navigationHistory.length > 0) {
      const previousCategory = navigationHistory[navigationHistory.length - 1];
      setNavigationHistory((prev) => prev.slice(0, -1));
      setActiveCategory(previousCategory);
      setActiveSubCategory('all');
    }
  }, [navigationHistory]);

  // Load stats on mount
  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 60000);
    return () => clearInterval(interval);
  }, [loadStats]);

  // ================================
  // Keyboard shortcuts
  // ================================
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey;

      // ⌘K - Command Palette
      if (isMod && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(true);
        return;
      }

      // Escape - Close overlays
      if (e.key === 'Escape') {
        e.preventDefault();
        setCommandPaletteOpen(false);
        setNotificationsPanelOpen(false);
        return;
      }

      // ⌘B - Toggle Sidebar
      if (isMod && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setSidebarCollapsed((prev) => !prev);
        return;
      }

      // F11 - Fullscreen
      if (e.key === 'F11') {
        e.preventDefault();
        setIsFullScreen((prev) => !prev);
        return;
      }

      // Alt+← - Go Back
      if (e.altKey && e.key === 'ArrowLeft') {
        e.preventDefault();
        handleGoBack();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setCommandPaletteOpen, handleGoBack, modal.isOpen]);

  // ================================
  // Render
  // ================================
  return (
    <div
      className={cn(
        'flex h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden',
        isFullScreen && 'fixed inset-0 z-50'
      )}
    >
      {/* Sidebar Navigation - 3-level */}
      <RecouvrementsSidebar
        activeCategory={activeCategory}
        activeSubCategory={activeSubCategory}
        collapsed={sidebarCollapsed}
        stats={statsData ? {
          pending: statsData.pending,
          inProgress: statsData.in_progress,
          resolved: statsData.paid,
          failed: statsData.total - statsData.paid - statsData.litige,
        } : undefined}
        onCategoryChange={handleCategoryChange}
        onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
        onOpenCommandPalette={() => setCommandPaletteOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar - Simplified */}
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
              <DollarSign className="h-5 w-5 text-amber-400" />
              <h1 className="text-base font-semibold text-slate-200">
                Recouvrements
              </h1>
              <Badge
                variant="default"
                className="text-xs bg-slate-800/50 text-slate-300 border-slate-700/50"
              >
                v2.0
              </Badge>
            </div>
          </div>

          {/* Actions - Consolidated */}
          <div className="flex items-center gap-1">
            {/* Search */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCommandPaletteOpen(true)}
              className="h-8 px-3 text-slate-500 hover:text-slate-300 hover:bg-slate-800/50"
            >
              <Search className="h-4 w-4 mr-2" />
              <span className="text-xs hidden sm:inline">Rechercher</span>
              <kbd className="ml-2 text-xs bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded hidden sm:inline">
                ⌘K
              </kbd>
            </Button>

            <div className="w-px h-4 bg-slate-700/50 mx-1" />

            {/* Notifications */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setNotificationsPanelOpen((prev) => !prev)}
              className={cn(
                'h-8 w-8 p-0 relative',
                notificationsPanelOpen
                  ? 'text-slate-200 bg-slate-800/50'
                  : 'text-slate-500 hover:text-slate-300'
              )}
              title="Notifications"
            >
              <Bell className="h-4 w-4" />
              {statsData && (statsData.litige > 0 || statsData.montantEnRetard > 0) && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                  {statsData.litige}
                </span>
              )}
            </Button>

            {/* Actions Menu (consolidated) */}
            <ActionsMenu
              onRefresh={handleRefresh}
              isRefreshing={isRefreshing}
              onExport={() => setModal({ isOpen: true, type: 'export' })}
              onStats={() => setModal({ isOpen: true, type: 'stats' })}
              onFilters={() => {
                if (modal.type === 'filters' && modal.isOpen) {
                  setModal({ isOpen: false, type: null });
                } else {
                  setModal({ isOpen: true, type: 'filters' });
                }
              }}
              onFullscreen={() => setIsFullScreen(!isFullScreen)}
              fullscreen={isFullScreen}
              onHelp={() => setModal({ isOpen: true, type: 'help' })}
            />
          </div>
        </header>

        {/* Sub Navigation - Level 2 & 3 */}
        <RecouvrementsSubNavigation
          mainCategory={activeCategory as RecouvrementsMainCategory}
          subCategory={activeSubCategory}
          subSubCategory={undefined}
          onSubCategoryChange={handleSubCategoryChange}
          onSubSubCategoryChange={handleSubSubCategoryChange}
          stats={statsData ? {
            pending: statsData.pending,
            inProgress: statsData.in_progress,
            resolved: statsData.paid,
            failed: statsData.total - statsData.paid - statsData.litige,
          } : undefined}
        />

        {/* KPI Bar */}
        <RecouvrementsKPIBar
          visible={true}
          collapsed={kpiBarCollapsed}
          onToggleCollapse={() => setKpiBarCollapsed((prev) => !prev)}
          onRefresh={handleRefresh}
          stats={statsData}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-hidden">
          <div className="h-full overflow-x-hidden overflow-y-auto">
            <RecouvrementsContentRouter
              mainCategory={activeCategory as RecouvrementsMainCategory}
              subCategory={activeSubCategory}
              subSubCategory={undefined}
            />
          </div>
        </main>

        {/* Status Bar */}
        <footer className="flex items-center justify-between px-4 py-1.5 border-t border-slate-800/50 bg-slate-900/60 text-xs">
          <div className="flex items-center gap-4">
            <span className="text-slate-600">
              Màj: {formatLastUpdate()}
            </span>
            {statsData && (
              <>
                <span className="text-slate-700">•</span>
                <span className="text-slate-600">
                  {statsData.total} créances • {statsData.pending} en attente • {recouvrementsApiService.formatMontant(statsData.montantEnRetard)} en retard
                </span>
              </>
            )}
          </div>
          <div className="flex items-center gap-4">
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
      <RecouvrementsCommandPalette
        open={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onOpenStats={() => setModal({ isOpen: true, type: 'stats' })}
        onRefresh={handleRefresh}
      />

      {/* Modals */}
      <RecouvrementsModals
        modal={modal}
        onClose={() => setModal({ isOpen: false, type: null })}
        onApplyFilters={handleApplyFilters}
      />

      {/* Notifications Panel */}
      <NotificationsPanel
        isOpen={notificationsPanelOpen}
        onClose={() => setNotificationsPanelOpen(false)}
        moduleName="Recouvrements"
      />
    </div>
  );
}

// ================================
// Actions Menu Component
// ================================
function ActionsMenu({
  onRefresh,
  isRefreshing,
  onExport,
  onStats,
  onFilters,
  onFullscreen,
  fullscreen,
  onHelp,
}: {
  onRefresh: () => void;
  isRefreshing: boolean;
  onExport: () => void;
  onStats: () => void;
  onFilters: () => void;
  onFullscreen: () => void;
  fullscreen: boolean;
  onHelp: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(!open)}
        className="h-8 w-8 p-0 text-slate-500 hover:text-slate-300 hover:bg-slate-800/50"
        title="Actions"
      >
        <MoreVertical className="h-4 w-4" />
      </Button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 w-56 rounded-lg bg-slate-900 border border-slate-700/50 shadow-xl z-50 py-1">
            <button
              onClick={() => {
                onRefresh();
                setOpen(false);
              }}
              disabled={isRefreshing}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800/50 disabled:opacity-50"
            >
              <RefreshCw className={cn('w-4 h-4', isRefreshing && 'animate-spin')} />
              Rafraîchir
            </button>

            <div className="border-t border-slate-700/50 my-1" />

            <button
              onClick={() => {
                onExport();
                setOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800/50"
            >
              <Download className="w-4 h-4" />
              Exporter
              <kbd className="ml-auto text-xs bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded">
                ⌘E
              </kbd>
            </button>

            <div className="border-t border-slate-700/50 my-1" />

            <button
              onClick={() => {
                onStats();
                setOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800/50"
            >
              <BarChart3 className="w-4 h-4" />
              Statistiques
            </button>

            <button
              onClick={() => {
                onFilters();
                setOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800/50"
            >
              <Filter className="w-4 h-4" />
              Filtres avancés
            </button>

            <button
              onClick={() => {
                onFullscreen();
                setOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800/50"
            >
              {fullscreen ? (
                <>
                  <Minimize2 className="w-4 h-4" />
                  Quitter plein écran
                </>
              ) : (
                <>
                  <Maximize2 className="w-4 h-4" />
                  Plein écran
                </>
              )}
              <kbd className="ml-auto text-xs bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded">
                F11
              </kbd>
            </button>

            <div className="border-t border-slate-700/50 my-1" />

            <button
              onClick={() => {
                setOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800/50"
            >
              <Settings className="w-4 h-4" />
              Paramètres
            </button>
          </div>
        </>
      )}
    </div>
  );
}


