/**
 * ====================================================================
 * PAGE: Projets en Cours - BMO Command Center
 * ====================================================================
 * 
 * Architecture sophistiquée alignée avec Blocked Command Center
 * Layout: Sidebar + Header + SubNav + KPIBar + Content + StatusBar + Modals
 */

'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Briefcase,
  Search,
  Bell,
  ChevronLeft,
  RefreshCw,
  Plus,
  Download,
  Settings,
  MoreHorizontal,
  Maximize2,
  Minimize2,
  Filter,
  LayoutGrid,
  List,
  Columns,
  GanttChart,
  HelpCircle,
} from 'lucide-react';
import { ProjetsHelpModal } from '@/components/features/bmo/projets/modals/ProjetsHelpModal';

// Command Center Components
import {
  ProjetsKPIBar,
  ProjetsModals,
  projetsCategories,
  projetsSubCategoriesMap,
  projetsFiltersMap,
  useProjetsCommandCenterStore,
  type ProjetsKPIData,
  type ProjetsMainCategory,
  type ProjetsSubCategoryMap,
} from '@/components/features/bmo/projets/command-center';
// New 3-level navigation module
import {
  ProjetsSidebar,
  ProjetsSubNavigation,
  ProjetsContentRouter,
} from '@/modules/projets-en-cours';

// Workspace Components
import {
  ProjetsCommandPalette,
} from '@/components/features/bmo/workspace/projets';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Pattern Modal Overlay
import { GenericDetailModal } from '@/components/ui/GenericDetailModal';
import { 
  Building2, 
  Calendar, 
  Users, 
  DollarSign,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

// ================================
// Types
// ================================

interface Notification {
  id: string;
  type: 'critical' | 'warning' | 'info' | 'success';
  title: string;
  time: string;
  read: boolean;
}

// ================================
// Mock Data
// ================================

const mockKPIData: ProjetsKPIData = {
  totalProjects: 58,
  activeProjects: 28,
  completedThisMonth: 4,
  delayedProjects: 5,
  budgetHealth: 82,
  teamUtilization: 78,
  avgCompletionRate: 67,
  onTimeDelivery: 85,
  trends: {
    totalProjects: 'up',
    activeProjects: 'stable',
    delayedProjects: 'down',
    budgetHealth: 'up',
  },
};

const mockNotifications: Notification[] = [
  { id: '1', type: 'critical', title: 'Projet PRJ-002 - Dépassement délai critique', time: 'il y a 15 min', read: false },
  { id: '2', type: 'warning', title: 'Budget à 85% pour Route RN7', time: 'il y a 1h', read: false },
  { id: '3', type: 'success', title: 'Projet Hôpital Sikasso terminé', time: 'il y a 3h', read: true },
  { id: '4', type: 'warning', title: 'Ressources insuffisantes équipe BF', time: 'il y a 5h', read: true },
  { id: '5', type: 'info', title: 'Nouveau projet en planification', time: 'hier', read: true },
];

// ================================
// Main Component
// ================================

export default function ProjetsEnCoursPage() {
  // Store state
  const {
    navigation,
    sidebarCollapsed,
    fullscreen,
    commandPaletteOpen,
    notificationsPanelOpen,
    kpiConfig,
    stats,
    liveStats,
    viewMode,
    navigate,
    goBack,
    toggleSidebar,
    setSidebarCollapsed,
    toggleFullscreen,
    toggleCommandPalette,
    toggleNotificationsPanel,
    toggleKPIBar,
    openModal,
    setStats,
    startRefresh,
    endRefresh,
    setViewMode,
  } = useProjetsCommandCenterStore();

  // 3-level navigation state
  const [activeCategory, setActiveCategory] = useState('overview');
  const [activeSubCategory, setActiveSubCategory] = useState<string | undefined>(undefined);
  const [activeSubSubCategory, setActiveSubSubCategory] = useState<string | undefined>(undefined);

  // Local UI state
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  
  // Pattern Modal Overlay - Détails projet
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<any>(null);

  // ================================
  // Initialize stats
  // ================================
  useEffect(() => {
    if (!stats) {
      // Simulate loading stats
      setStats({
        total: 58,
        active: 28,
        planning: 8,
        delayed: 5,
        completed: 15,
        onHold: 2,
        cancelled: 0,
        avgProgress: 52,
        avgBudgetUsage: 67,
        totalBudget: 45000000000,
        budgetConsumed: 30150000000,
        overdueCount: 5,
        atRiskCount: 8,
        completedThisMonth: 3,
        teamSize: 156,
        onTimeDelivery: 85,
        byBureau: [
          { bureau: 'BF', count: 22, active: 12, delayed: 2 },
          { bureau: 'BM', count: 18, active: 9, delayed: 2 },
          { bureau: 'BJ', count: 12, active: 5, delayed: 1 },
          { bureau: 'BCT', count: 6, active: 2, delayed: 0 },
        ],
        byType: [
          { type: 'Infrastructure', count: 24 },
          { type: 'Bâtiment', count: 18 },
          { type: 'Ouvrage d\'art', count: 8 },
          { type: 'Aménagement', count: 8 },
        ],
        byPriority: [
          { priority: 'high', count: 22 },
          { priority: 'medium', count: 28 },
          { priority: 'low', count: 8 },
        ],
        ts: new Date().toISOString(),
      });
    }
  }, [stats, setStats]);

  // ================================
  // Computed values
  // ================================

  const currentCategoryLabel = useMemo(() => {
    return projetsCategories.find((c) => c.id === navigation.mainCategory)?.label || 'Projets';
  }, [navigation.mainCategory]);

  const currentSubCategories = useMemo(() => {
    return projetsSubCategoriesMap[navigation.mainCategory] || [];
  }, [navigation.mainCategory]);

  const currentFilters = useMemo(() => {
    const key = `${navigation.mainCategory}:${navigation.subCategory}`;
    return projetsFiltersMap[key] || [];
  }, [navigation.mainCategory, navigation.subCategory]);

  const formatLastUpdate = useCallback(() => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastUpdate.getTime()) / 1000);
    if (diff < 60) return "à l'instant";
    if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
    return `il y a ${Math.floor(diff / 3600)}h`;
  }, [lastUpdate]);

  const sidebarStats = useMemo(() => ({
    active: stats?.active ?? 0,
    planning: stats?.planning ?? 0,
    delayed: stats?.delayed ?? 0,
    completed: stats?.completed ?? 0,
    byBureau: stats?.byBureau.length ?? 0,
    byTeam: 5,
    highPriority: stats?.byPriority.find(p => p.priority === 'high')?.count ?? 0,
  }), [stats]);

  // ================================
  // Pattern Modal Overlay Handlers
  // ================================
  
  const handleViewProject = useCallback((project: any) => {
    setSelectedProject(project);
    setSelectedProjectId(project.id);
  }, []);

  const handleEditProject = useCallback((project: any) => {
    console.log('Edit project:', project);
    // Logique d'édition
    setSelectedProjectId(null);
  }, []);

  const handleDeleteProject = useCallback((id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) {
      console.log('Delete project:', id);
      setSelectedProjectId(null);
    }
  }, []);

  // ================================
  // Callbacks
  // ================================

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    startRefresh();
    setTimeout(() => {
      setIsRefreshing(false);
      endRefresh();
      setLastUpdate(new Date());
    }, 1500);
  }, [startRefresh, endRefresh]);

  const handleCategoryChange = useCallback((category: string, subCategory?: string) => {
    setActiveCategory(category);
    setActiveSubCategory(subCategory);
    setActiveSubSubCategory(undefined);
    navigate(category as ProjetsMainCategory, (subCategory || 'all') as any);
  }, [navigate]);

  const handleSubCategoryChange = useCallback((subCategory: string) => {
    setActiveSubCategory(subCategory);
    setActiveSubSubCategory(undefined);
    navigate(navigation.mainCategory, subCategory as any);
  }, [navigate, navigation.mainCategory]);

  const handleSubSubCategoryChange = useCallback((subSubCategory: string) => {
    setActiveSubSubCategory(subSubCategory);
  }, []);

  const handleNewProject = useCallback(() => {
    openModal('new-project');
  }, [openModal]);

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
        toggleCommandPalette();
        return;
      }

      // Ctrl+B : Toggle sidebar
      if (isMod && e.key === 'b') {
        e.preventDefault();
        toggleSidebar();
        return;
      }

      // F1 : Help Modal
      if (e.key === 'F1') {
        e.preventDefault();
        setHelpModalOpen(true);
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

      // Escape : Close panels
      if (e.key === 'Escape') {
        if (helpModalOpen) {
          e.preventDefault();
          setHelpModalOpen(false);
          return;
        }
        if (commandPaletteOpen) toggleCommandPalette();
        if (notificationsPanelOpen) toggleNotificationsPanel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleCommandPalette, toggleSidebar, toggleFullscreen, goBack, commandPaletteOpen, notificationsPanelOpen, toggleNotificationsPanel, helpModalOpen]);

  // Custom events
  useEffect(() => {
    const handleOpenCommandPalette = () => toggleCommandPalette();

    window.addEventListener('projets:open-command-palette', handleOpenCommandPalette);

    return () => {
      window.removeEventListener('projets:open-command-palette', handleOpenCommandPalette);
    };
  }, [toggleCommandPalette]);

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
      <ProjetsSidebar
        activeCategory={activeCategory || navigation.mainCategory}
        activeSubCategory={activeSubCategory}
        collapsed={sidebarCollapsed}
        stats={{
          active: stats?.active ?? 0,
          delayed: stats?.delayed ?? 0,
          completed: stats?.completed ?? 0,
          planning: stats?.planning ?? 0,
        }}
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
            <Button
              variant="ghost"
              size="sm"
              onClick={goBack}
              className="h-8 w-8 p-0 text-slate-500 hover:text-slate-300"
              title="Retour (Alt+←)"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {/* Title */}
            <div className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-emerald-400" />
              <h1 className="text-base font-semibold text-slate-200">
                Projets en cours
              </h1>
              <Badge
                variant="default"
                className="text-xs bg-slate-800/50 text-slate-300 border-slate-700/50"
              >
                v3.0
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
              className="h-8 px-3 text-slate-500 hover:text-slate-300 hover:bg-slate-800/50"
            >
              <Search className="h-4 w-4 mr-2" />
              <span className="text-xs hidden sm:inline">Rechercher</span>
              <kbd className="ml-2 text-xs bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded hidden sm:inline">
                ⌘K
              </kbd>
            </Button>

            <div className="w-px h-4 bg-slate-700/50 mx-1" />

            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-800/50 rounded-lg p-0.5">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode('grid')}
                className={cn(
                  'h-7 w-7 p-0',
                  viewMode === 'grid' ? 'bg-slate-700/50 text-slate-200' : 'text-slate-500 hover:text-slate-300'
                )}
                title="Vue grille"
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode('list')}
                className={cn(
                  'h-7 w-7 p-0',
                  viewMode === 'list' ? 'bg-slate-700/50 text-slate-200' : 'text-slate-500 hover:text-slate-300'
                )}
                title="Vue liste"
              >
                <List className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode('kanban')}
                className={cn(
                  'h-7 w-7 p-0',
                  viewMode === 'kanban' ? 'bg-slate-700/50 text-slate-200' : 'text-slate-500 hover:text-slate-300'
                )}
                title="Vue Kanban"
              >
                <Columns className="h-3.5 w-3.5" />
              </Button>
            </div>

            <div className="w-px h-4 bg-slate-700/50 mx-1" />

            {/* New Project */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNewProject}
              className="h-8 px-3 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
            >
              <Plus className="h-4 w-4 mr-1" />
              <span className="text-xs hidden sm:inline">Nouveau</span>
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
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rose-500 rounded-full text-xs text-white flex items-center justify-center">
                2
              </span>
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
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={handleRefresh}>
                  <RefreshCw className={cn('h-4 w-4 mr-2', isRefreshing && 'animate-spin')} />
                  Rafraîchir
                </DropdownMenuItem>
                <DropdownMenuItem onClick={toggleFullscreen}>
                  {fullscreen ? (
                    <>
                      <Minimize2 className="h-4 w-4 mr-2" />
                      Quitter plein écran
                    </>
                  ) : (
                    <>
                      <Maximize2 className="h-4 w-4 mr-2" />
                      Plein écran
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setHelpModalOpen(true)}>
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Aide
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => openModal('export')}>
                  <Download className="h-4 w-4 mr-2" />
                  Exporter
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => openModal('stats')}>
                  <Settings className="h-4 w-4 mr-2" />
                  Statistiques
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Sub Navigation - 3-level */}
        <ProjetsSubNavigation
          mainCategory={(activeCategory || navigation.mainCategory) as any}
          subCategory={activeSubCategory || navigation.subCategory || undefined}
          subSubCategory={activeSubSubCategory || undefined}
          onSubCategoryChange={handleSubCategoryChange}
          onSubSubCategoryChange={handleSubSubCategoryChange}
          stats={{
            active: stats?.active ?? 0,
            delayed: stats?.delayed ?? 0,
            completed: stats?.completed ?? 0,
            planning: stats?.planning ?? 0,
          }}
        />

        {/* KPI Bar */}
        <ProjetsKPIBar
          data={mockKPIData}
          collapsed={kpiConfig.collapsed}
          onToggleCollapse={toggleKPIBar}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto">
            <ProjetsContentRouter
              mainCategory={(activeCategory || navigation.mainCategory) as any}
              subCategory={activeSubCategory || navigation.subCategory || undefined}
              subSubCategory={activeSubSubCategory || undefined}
            />
          </div>
        </main>

        {/* Status Bar */}
        <footer className="flex items-center justify-between px-4 py-1.5 border-t border-slate-800/50 bg-slate-900/60 text-xs">
          <div className="flex items-center gap-4">
            <span className="text-slate-600">MàJ: {formatLastUpdate()}</span>
            <span className="text-slate-700">•</span>
            <span className="text-slate-600">
              {stats?.total ?? 0} projets • {stats?.delayed ?? 0} en retard • {stats?.active ?? 0} actifs
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div
                className={cn(
                  'w-2 h-2 rounded-full',
                  liveStats.isRefreshing ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'
                )}
              />
              <span className="text-slate-500">
                {liveStats.isRefreshing ? 'Synchronisation...' : liveStats.connectionStatus === 'connected' ? 'Connecté' : 'Déconnecté'}
              </span>
            </div>
          </div>
        </footer>
      </div>

      {/* Modals */}
      <ProjetsModals />

      {/* Help Modal */}
      <ProjetsHelpModal
        open={helpModalOpen}
        onClose={() => setHelpModalOpen(false)}
      />

      {/* Command Palette */}
      <ProjetsCommandPalette
        open={commandPaletteOpen}
        onClose={toggleCommandPalette}
        onOpenStats={() => openModal('stats')}
        onRefresh={handleRefresh}
      />

      {/* Notifications Panel */}
      {notificationsPanelOpen && (
        <NotificationsPanel
          notifications={mockNotifications}
          onClose={toggleNotificationsPanel}
        />
      )}

      {/* Pattern Modal Overlay - Détails Projet */}
      {selectedProject && (
        <GenericDetailModal
          isOpen={!!selectedProjectId}
          onClose={() => {
            setSelectedProjectId(null);
            setSelectedProject(null);
          }}
          title={selectedProject.name || selectedProject.title || 'Détails du projet'}
          subtitle={selectedProject.id}
          statusBadge={selectedProject.status ? {
            label: selectedProject.status,
            variant: selectedProject.status === 'En cours' ? 'info' as const :
                     selectedProject.status === 'Terminé' ? 'success' as const :
                     selectedProject.status === 'En retard' ? 'critical' as const :
                     'default' as const,
          } : undefined}
          tabs={[
            {
              id: 'general',
              label: 'Informations générales',
              icon: <Building2 className="w-4 h-4" />,
              content: (
                <div className="grid grid-cols-2 gap-4">
                  <div><strong>Code projet:</strong> {selectedProject.id}</div>
                  <div><strong>Type:</strong> {selectedProject.type || 'Infrastructure'}</div>
                  <div><strong>Bureau:</strong> {selectedProject.bureau || 'BTP'}</div>
                  <div><strong>Priorité:</strong> {selectedProject.priority || 'Haute'}</div>
                </div>
              )
            },
            {
              id: 'planning',
              label: 'Planning',
              icon: <Calendar className="w-4 h-4" />,
              content: (
                <div className="grid grid-cols-2 gap-4">
                  <div><strong>Date de début:</strong> {selectedProject.startDate ? new Date(selectedProject.startDate).toLocaleDateString('fr-FR') : 'N/A'}</div>
                  <div><strong>Date de fin prévue:</strong> {selectedProject.endDate ? new Date(selectedProject.endDate).toLocaleDateString('fr-FR') : 'N/A'}</div>
                  <div><strong>Progression:</strong> {selectedProject.progress ? `${selectedProject.progress}%` : '0%'}</div>
                  <div><strong>Jours restants:</strong> {selectedProject.daysLeft || 'N/A'}</div>
                </div>
              )
            },
            {
              id: 'budget',
              label: 'Budget',
              icon: <DollarSign className="w-4 h-4" />,
              content: (
                <div className="grid grid-cols-2 gap-4">
                  <div><strong>Budget total:</strong> {selectedProject.budget ? `${(selectedProject.budget / 1000000).toFixed(1)}M XOF` : 'N/A'}</div>
                  <div><strong>Budget consommé:</strong> {selectedProject.budgetUsed ? `${(selectedProject.budgetUsed / 1000000).toFixed(1)}M XOF` : 'N/A'}</div>
                  <div><strong>Taux d'utilisation:</strong> {selectedProject.budgetUsage ? `${selectedProject.budgetUsage}%` : 'N/A'}</div>
                  <div><strong>Budget restant:</strong> {selectedProject.budgetRemaining ? `${(selectedProject.budgetRemaining / 1000000).toFixed(1)}M XOF` : 'N/A'}</div>
                </div>
              )
            },
            {
              id: 'team',
              label: 'Équipe',
              icon: <Users className="w-4 h-4" />,
              content: (
                <div className="grid grid-cols-2 gap-4">
                  <div><strong>Chef de projet:</strong> {selectedProject.manager || 'Non assigné'}</div>
                  <div><strong>Équipe:</strong> {selectedProject.teamSize ? `${selectedProject.teamSize} personnes` : 'N/A'}</div>
                </div>
              )
            },
            ...(selectedProject.description ? [{
              id: 'description',
              label: 'Description',
              content: <div>{selectedProject.description}</div>
            }] : [])
          ]}
          actions={[
            {
              id: 'edit',
              label: 'Modifier',
              variant: 'default',
              onClick: () => handleEditProject(selectedProject),
            },
            {
              id: 'delete',
              label: 'Supprimer',
              variant: 'destructive',
              onClick: () => handleDeleteProject(selectedProject.id),
            },
            {
              id: 'download',
              label: 'Télécharger',
              variant: 'outline',
              onClick: () => console.log('Download project report'),
            },
              {
                id: 'timeline',
                label: 'Voir la timeline',
                icon: <GanttChart className="w-4 h-4" />,
                onClick: () => console.log('View timeline'),
              },
              {
                id: 'reports',
                label: 'Rapports',
                icon: <Download className="w-4 h-4" />,
                onClick: () => console.log('View reports'),
              },
            ]}
        />
      )}
    </div>
  );
}

// ================================
// Notifications Panel
// ================================

function NotificationsPanel({
  notifications,
  onClose,
}: {
  notifications: Notification[];
  onClose: () => void;
}) {
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />

      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 w-96 bg-slate-900 border-l border-slate-700/50 z-50 flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/50">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-emerald-400" />
            <h3 className="text-sm font-medium text-slate-200">Notifications</h3>
            {unreadCount > 0 && (
              <Badge className="bg-rose-500/20 text-rose-400 border-rose-500/30 text-xs">
                {unreadCount} nouvelles
              </Badge>
            )}
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
                      ? 'bg-rose-500'
                      : notif.type === 'warning'
                      ? 'bg-amber-500'
                      : notif.type === 'success'
                      ? 'bg-emerald-500'
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
