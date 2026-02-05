/**
 * ====================================================================
 * PAGE: Validation des Paiements - BMO
 * Architecture moderne inspirée d'Analytics et Gouvernance
 * ====================================================================
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePaiementsWorkspaceStore } from '@/lib/stores/paiementsWorkspaceStore';
import { paiementsApiService, type PaiementsStats } from '@/lib/services/paiementsApiService';
import {
  PaiementsWorkspaceTabs,
  PaiementsWorkspaceContent,
  PaiementsCommandPalette,
  PaiementsKPIBar,
  PaiementsStatusBar,
  PaiementsToast,
  PaiementsFiltersPanel,
  countActiveFiltersUtil,
  type PaiementsActiveFilters,
  PaiementsModals,
  type PaiementModalType,
  PaiementsNotificationPanel,
} from '@/components/features/bmo/workspace/paiements';
// New 3-level navigation module
import {
  PaiementsSidebar,
  PaiementsSubNavigation,
  PaiementsContentRouter,
  type PaiementsMainCategory,
} from '@/modules/validation-paiements';
import { SavedFiltersManager } from '@/components/shared/SavedFiltersManager';
import { 
  DollarSign, 
  Search, 
  MoreVertical, 
  RefreshCw, 
  BarChart3, 
  Download, 
  Bell,
  Settings,
  ChevronLeft,
  Filter,
  HelpCircle,
} from 'lucide-react';
import { PaiementsHelpModal } from '@/components/features/bmo/workspace/paiements/modals/PaiementsHelpModal';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Fonction pour calculer dynamiquement les sous-catégories avec badges
const getSubCategoriesMap = (stats: PaiementsStats | null): Record<string, Array<{ id: string; label: string; badge?: number; badgeType?: 'default' | 'warning' | 'critical' }>> => {
  const totalPending = stats?.pending || 0;
  const urgentCritical = stats?.byUrgency?.critical || 0;
  const urgentHigh = stats?.byUrgency?.high || 0;
  const scheduled = stats?.scheduled || 0;
  
  // Estimation: 60% BF, 40% DG (en production, vient de l'API)
  const bfPending = Math.floor(totalPending * 0.6);
  const dgPending = totalPending - bfPending;
  
  // Estimation: 40% critiques, 60% haute priorité
  const criticalCount = Math.floor((urgentCritical + urgentHigh) * 0.4);
  const highCount = (urgentCritical + urgentHigh) - criticalCount;
  
  // Estimation scheduled: 60% à venir, 40% en cours
  const upcomingCount = Math.floor(scheduled * 0.6);
  const inProgressCount = scheduled - upcomingCount;

  return {
    overview: [
      { id: 'dashboard', label: 'Tableau de bord' },
      { id: 'kpis', label: 'Indicateurs clés' },
      { id: 'alerts', label: 'Alertes', badge: (urgentCritical + urgentHigh) || undefined, badgeType: 'warning' },
    ],
    pending: [
      { id: 'all', label: 'Tous', badge: totalPending || undefined },
      { id: 'bf-pending', label: 'Bureau Finance', badge: bfPending || undefined },
      { id: 'dg-pending', label: 'Direction Générale', badge: dgPending || undefined, badgeType: dgPending > 0 ? 'critical' : 'default' },
    ],
    urgent: [
      { id: 'critical', label: 'Critiques', badge: criticalCount || undefined, badgeType: 'critical' },
      { id: 'high', label: 'Haute priorité', badge: highCount || undefined, badgeType: 'warning' },
    ],
    validated: [
      { id: 'today', label: 'Aujourd\'hui' },
      { id: 'week', label: 'Cette semaine' },
      { id: 'month', label: 'Ce mois' },
    ],
    rejected: [
      { id: 'recent', label: 'Récents' },
      { id: 'archived', label: 'Archivés' },
    ],
    scheduled: [
      { id: 'upcoming', label: 'À venir', badge: upcomingCount || undefined },
      { id: 'in-progress', label: 'En cours', badge: inProgressCount || undefined },
    ],
    tresorerie: [
      { id: 'overview', label: 'Vue d\'ensemble' },
      { id: 'forecast', label: 'Prévisions' },
      { id: 'history', label: 'Historique' },
    ],
    fournisseurs: [
      { id: 'all', label: 'Tous' },
      { id: 'active', label: 'Actifs' },
      { id: 'watchlist', label: 'Surveillance' },
    ],
    audit: [
      { id: 'trail', label: 'Piste d\'audit' },
      { id: 'reports', label: 'Rapports' },
      { id: 'compliance', label: 'Conformité' },
    ],
  };
};

const CATEGORY_LABELS: Record<string, string> = {
  overview: 'Vue d\'ensemble',
  pending: 'À valider',
  urgent: 'Urgents',
  validated: 'Validés',
  rejected: 'Rejetés',
  scheduled: 'Planifiés',
  tresorerie: 'Trésorerie',
  fournisseurs: 'Fournisseurs',
  audit: 'Audit',
};

export default function ValidationPaiementsPage() {
  const { commandPaletteOpen, setCommandPaletteOpen } = usePaiementsWorkspaceStore();
  
  // State management
  const [stats, setStats] = useState<PaiementsStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [isConnected, setIsConnected] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  
  // Toast state
  const [toast, setToast] = useState<{
    open: boolean;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message?: string;
  } | null>(null);
  
  // Filters state
  const [filtersPanelOpen, setFiltersPanelOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<PaiementsActiveFilters>({
    urgency: [],
    bureaux: [],
    types: [],
    status: [],
    amountRange: {},
  });
  
  // Navigation state - 3-level navigation
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeCategory, setActiveCategory] = useState('overview');
  const [activeSubCategory, setActiveSubCategory] = useState<string | null>('dashboard');
  const [activeSubSubCategory, setActiveSubSubCategory] = useState<string | undefined>(undefined);
  
  // Modal state
  const [modal, setModal] = useState<{
    isOpen: boolean;
    type: PaiementModalType | null;
    data?: any;
  }>({
    isOpen: false,
    type: null,
  });
  
  // Notification panel state
  const [notificationPanelOpen, setNotificationPanelOpen] = useState(false);
  const [navigationHistory, setNavigationHistory] = useState<Array<{ category: string; subCategory: string | null }>>([]);
  
  // UI State
  const [notificationsPanelOpen, setNotificationsPanelOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [kpiBarCollapsed, setKpiBarCollapsed] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [helpModalOpen, setHelpModalOpen] = useState(false);

  // Load stats
  const loadStats = useCallback(async (mode: 'auto' | 'manual' = 'auto') => {
    if (mode === 'manual') setStatsLoading(true);
    try {
      const data = await paiementsApiService.getStats();
      setStats(data);
      setLastUpdate(new Date());
      setIsConnected(true);
      
      // Show success toast on manual refresh
      if (mode === 'manual') {
        setToast({
          open: true,
          type: 'success',
          title: 'Données actualisées',
          message: 'Les statistiques ont été mises à jour avec succès.',
        });
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
      setIsConnected(false);
      setToast({
        open: true,
        type: 'error',
        title: 'Erreur de chargement',
        message: 'Impossible de charger les statistiques. Vérifiez votre connexion.',
      });
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // Initial load & auto-refresh
  useEffect(() => { loadStats('manual'); }, [loadStats]);
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => loadStats('auto'), 60000);
    return () => clearInterval(interval);
  }, [autoRefresh, loadStats]);

  // Navigation handlers - 3-level navigation
  const handleCategoryChange = (category: string, subCategory?: string) => {
    if (category !== activeCategory) {
      setNavigationHistory(prev => [...prev, { category: activeCategory, subCategory: activeSubCategory }]);
      setActiveCategory(category);
      const subCats = getSubCategoriesMap(stats)[category] || [];
      setActiveSubCategory(subCategory || subCats[0]?.id || null);
      setActiveSubSubCategory(undefined); // Reset level 3
    } else if (subCategory) {
      setActiveSubCategory(subCategory);
      setActiveSubSubCategory(undefined); // Reset level 3
    }
  };

  const handleSubCategoryChange = (subCategory: string) => {
    setActiveSubCategory(subCategory);
    setActiveSubSubCategory(undefined); // Reset level 3 when changing level 2
  };

  const handleSubSubCategoryChange = (subSubCategory: string) => {
    setActiveSubSubCategory(subSubCategory);
  };

  const handleGoBack = () => {
    if (navigationHistory.length === 0) return;
    const prev = navigationHistory[navigationHistory.length - 1];
    setNavigationHistory(navigationHistory.slice(0, -1));
    setActiveCategory(prev.category);
    setActiveSubCategory(prev.subCategory);
  };

  const handleApplyFilters = useCallback(async (filters: PaiementsActiveFilters) => {
    setActiveFilters(filters);
    
    // Appliquer les filtres aux données
    try {
      const hasActiveFilters = countActiveFiltersUtil(filters) > 0;
      
      if (hasActiveFilters) {
        // Utiliser la nouvelle méthode avec filtres avancés
        const result = await paiementsApiService.getAllWithAdvancedFilters(filters);
        console.log(`Filtres appliqués: ${result.total} résultats trouvés`);
      }
      
      setToast({
        open: true,
        type: 'success',
        title: 'Filtres appliqués',
        message: `${countActiveFiltersUtil(filters)} filtre(s) actif(s)`,
      });
      
      // Recharger les statistiques avec les filtres
      await loadStats('auto');
    } catch (error) {
      console.error('Erreur lors de l\'application des filtres:', error);
      setToast({
        open: true,
        type: 'error',
        title: 'Erreur',
        message: 'Impossible d\'appliquer les filtres',
      });
    }
  }, [loadStats]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ⌘K / Ctrl+K - Command Palette
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
      // ⌘B / Ctrl+B - Toggle Sidebar
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault();
        setSidebarCollapsed(prev => !prev);
      }
      // ⌘I / Ctrl+I - Stats Modal
      if ((e.metaKey || e.ctrlKey) && e.key === 'i') {
        e.preventDefault();
        setModal({ isOpen: true, type: 'stats' });
      }
      // ⌘E / Ctrl+E - Export Modal
      if ((e.metaKey || e.ctrlKey) && e.key === 'e') {
        e.preventDefault();
        setModal({ isOpen: true, type: 'export' });
      }
      // ⌘F / Ctrl+F - Filters Panel
      if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
        e.preventDefault();
        setFiltersPanelOpen(prev => !prev);
      }
      // Alt+← - Go Back
      if (e.altKey && e.key === 'ArrowLeft') {
        e.preventDefault();
        handleGoBack();
      }
      // F11 - Fullscreen
      if (e.key === 'F11') {
        e.preventDefault();
        setIsFullScreen(prev => !prev);
      }
      // F1 - Help Modal
      if (e.key === 'F1') {
        e.preventDefault();
        setHelpModalOpen(true);
      }
      // Esc - Close modals/panels
      if (e.key === 'Escape') {
        if (modal.isOpen) {
          setModal({ isOpen: false, type: null });
        } else if (commandPaletteOpen) {
          setCommandPaletteOpen(false);
        } else if (filtersPanelOpen) {
          setFiltersPanelOpen(false);
        } else if (notificationPanelOpen) {
          setNotificationPanelOpen(false);
        } else if (helpModalOpen) {
          setHelpModalOpen(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setCommandPaletteOpen, navigationHistory, modal.isOpen, commandPaletteOpen, filtersPanelOpen, notificationPanelOpen, helpModalOpen]);

  // Generate KPIs from stats
  const kpis = stats ? [
    {
      id: 'total',
      label: 'Total',
      value: stats.total,
      trend: 'stable' as const,
      status: 'neutral' as const,
    },
    {
      id: 'pending',
      label: 'En attente',
      value: stats.pending,
      trend: 'stable' as const,
      status: 'warning' as const,
      sparkline: [8, 10, 9, 11, 12, 11, 12],
      onClick: () => handleCategoryChange('pending'),
    },
    {
      id: 'urgent',
      label: 'Urgents',
      value: stats.byUrgency.critical || 0,
      trend: 'down' as const,
      trendValue: '-1',
      status: 'critical' as const,
      onClick: () => handleCategoryChange('urgent'),
    },
    {
      id: 'validated',
      label: 'Validés',
      value: stats.validated,
      trend: 'up' as const,
      trendValue: '+3',
      status: 'success' as const,
      sparkline: [15, 18, 20, 22, 25, 28, 30],
    },
    {
      id: 'rejected',
      label: 'Rejetés',
      value: stats.rejected,
      trend: 'stable' as const,
      status: 'neutral' as const,
    },
    {
      id: 'scheduled',
      label: 'Planifiés',
      value: stats.scheduled,
      trend: 'stable' as const,
      status: 'neutral' as const,
    },
    {
      id: 'tresorerie',
      label: 'Trésorerie',
      value: `${(stats.tresorerieDisponible / 1_000_000_000).toFixed(1)}Md`,
      trend: 'up' as const,
      trendValue: '+120M',
      status: 'success' as const,
      sparkline: [720, 730, 750, 780, 820, 840, 850],
    },
    {
      id: 'avg-montant',
      label: 'Montant moyen',
      value: `${(stats.avgMontant / 1_000_000).toFixed(1)}M`,
      trend: 'stable' as const,
      status: 'neutral' as const,
    },
  ] : [];

  return (
    <div
      className={cn(
        'flex h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden',
        isFullScreen && 'fixed inset-0 z-50'
      )}
    >
      {/* Sidebar Navigation - 3-level */}
      <PaiementsSidebar
        activeCategory={activeCategory}
        activeSubCategory={activeSubCategory || undefined}
        collapsed={sidebarCollapsed}
        stats={stats ? {
          pending: stats.pending,
          urgent: (stats.byUrgency?.critical || 0) + (stats.byUrgency?.high || 0),
          validated: stats.validated,
          rejected: stats.rejected,
        } : undefined}
        onCategoryChange={handleCategoryChange}
        onToggleCollapse={() => setSidebarCollapsed(prev => !prev)}
        onOpenCommandPalette={() => setCommandPaletteOpen(true)}
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
              <DollarSign className="h-5 w-5 text-emerald-400" />
              <h1 className="text-base font-semibold text-slate-200">Validation Paiements</h1>
              <Badge
                variant="default"
                className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30"
              >
                {stats?.pending || 0} en attente
              </Badge>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCommandPaletteOpen(true)}
              className="h-8 gap-2 text-slate-400 hover:text-slate-200"
            >
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline text-sm">Rechercher</span>
              <kbd className="hidden sm:inline px-1.5 py-0.5 text-xs rounded bg-slate-800 border border-slate-700">⌘K</kbd>
            </Button>

            {/* Filters */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFiltersPanelOpen(true)}
              className={cn(
                'h-8 gap-1.5 text-slate-400 hover:text-slate-200',
                countActiveFiltersUtil(activeFilters) > 0 && 'text-emerald-400'
              )}
              title="Filtres avancés"
            >
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline text-sm">Filtres</span>
              {countActiveFiltersUtil(activeFilters) > 0 && (
                <span className="text-xs font-medium px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                  {countActiveFiltersUtil(activeFilters)}
                </span>
              )}
            </Button>

            {/* Saved Filters */}
            <SavedFiltersManager
              module="paiements"
              currentFilters={activeFilters}
              onApplyFilter={handleApplyFilters}
              countActiveFilters={countActiveFiltersUtil}
            />

            {/* Notifications */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setNotificationsPanelOpen(true)}
              className="h-8 w-8 p-0 text-slate-400 hover:text-slate-200 relative"
            >
              <Bell className="h-4 w-4" />
              {stats && (stats.byUrgency.critical || 0) > 0 && (
                <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500" />
              )}
            </Button>

            {/* Stats */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setModal({ isOpen: true, type: 'stats' })}
              className="h-8 gap-2 text-slate-400 hover:text-slate-200"
              title="Statistiques (⌘I)"
            >
              <BarChart3 className="h-4 w-4 text-emerald-400" />
              <span className="hidden sm:inline text-sm">Stats</span>
            </Button>

            {/* Menu */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMenuOpen(!menuOpen)}
                className="h-8 w-8 p-0 text-slate-400 hover:text-slate-200"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-1 w-56 rounded-xl border border-slate-700 bg-slate-900 shadow-lg z-50 overflow-hidden">
                    <div className="py-1">
                      <button
                        onClick={() => { loadStats('manual'); setMenuOpen(false); }}
                        disabled={statsLoading}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800 disabled:opacity-50"
                      >
                        <RefreshCw className={cn("w-4 h-4 text-slate-400", statsLoading && "animate-spin")} />
                        Rafraîchir
                      </button>
                      <button
                        onClick={() => { setAutoRefresh(!autoRefresh); setMenuOpen(false); }}
                        className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800"
                      >
                        <span className="flex items-center gap-3">
                          <Settings className="w-4 h-4 text-slate-400" />
                          Auto-refresh
                        </span>
                        <span className={cn("text-xs px-1.5 py-0.5 rounded", autoRefresh ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-700 text-slate-400")}>
                          {autoRefresh ? 'ON' : 'OFF'}
                        </span>
                      </button>
                      <div className="h-px bg-slate-700 my-1" />
                      <button
                        onClick={() => { setModal({ isOpen: true, type: 'export' }); setMenuOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800"
                      >
                        <Download className="w-4 h-4 text-emerald-400" />
                        Exporter
                      </button>
                      <div className="h-px bg-slate-700 my-1" />
                      <button
                        onClick={() => { setHelpModalOpen(true); setMenuOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800"
                      >
                        <HelpCircle className="w-4 h-4 text-slate-400" />
                        Aide
                      </button>
                      <button
                        onClick={() => { setModal({ isOpen: true, type: 'settings' }); setMenuOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800"
                      >
                        <Settings className="w-4 h-4 text-slate-400" />
                        Paramètres
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Sub Navigation - 3-level */}
        <PaiementsSubNavigation
          mainCategory={activeCategory as PaiementsMainCategory}
          subCategory={activeSubCategory || undefined}
          subSubCategory={activeSubSubCategory}
          onSubCategoryChange={handleSubCategoryChange}
          onSubSubCategoryChange={handleSubSubCategoryChange}
          stats={stats ? {
            pending: stats.pending,
            urgent: (stats.byUrgency?.critical || 0) + (stats.byUrgency?.high || 0),
            validated: stats.validated,
            rejected: stats.rejected,
          } : undefined}
        />

        {/* KPI Bar */}
        {stats && (
          <PaiementsKPIBar
            kpis={kpis}
            visible={true}
            collapsed={kpiBarCollapsed}
            onToggleCollapse={() => setKpiBarCollapsed(prev => !prev)}
            onRefresh={() => loadStats('manual')}
            isRefreshing={statsLoading}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-hidden bg-slate-950/50">
          <div className="h-full overflow-x-hidden overflow-y-auto">
            <div className="p-4">
              {/* Content Router basé sur la navigation 3-level */}
              <PaiementsContentRouter
                mainCategory={activeCategory as PaiementsMainCategory}
                subCategory={activeSubCategory || undefined}
                subSubCategory={activeSubSubCategory}
              />
            </div>
          </div>
        </main>

        {/* Status Bar */}
        <PaiementsStatusBar
          lastUpdate={lastUpdate}
          isConnected={isConnected}
          autoRefresh={autoRefresh}
          stats={stats}
        />
      </div>

      {/* Command Palette */}
      <PaiementsCommandPalette
        open={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onOpenStats={() => setModal({ isOpen: true, type: 'stats' })}
        onOpenExport={() => setModal({ isOpen: true, type: 'export' })}
        onRefresh={() => loadStats('manual')}
      />

      {/* Modals */}
      <PaiementsModals
        modal={modal}
        onClose={() => setModal({ isOpen: false, type: null })}
      />

      {/* Notifications Panel */}
      <PaiementsNotificationPanel
        isOpen={notificationPanelOpen}
        onClose={() => setNotificationPanelOpen(false)}
      />
      
      {/* Toast Notifications */}
      {toast && (
        <PaiementsToast
          open={toast.open}
          type={toast.type}
          title={toast.title}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {/* Filters Panel */}
      <PaiementsFiltersPanel
        isOpen={filtersPanelOpen}
        onClose={() => setFiltersPanelOpen(false)}
        onApplyFilters={handleApplyFilters}
        currentFilters={activeFilters}
      />

      {/* Help Modal */}
      <PaiementsHelpModal
        open={helpModalOpen}
        onClose={() => setHelpModalOpen(false)}
      />
    </div>
  );
}
