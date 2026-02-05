'use client';

/**
 * Centre de Commandement Substitution
 * Architecture cohérente avec Analytics et Gouvernance
 */

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  RefreshCw,
  Search,
  ChevronLeft,
  Plus,
  Download,
  Settings,
  MoreHorizontal,
  Bell,
  Maximize,
  Minimize,
  PanelRight,
  PanelRightClose,
  BarChart3,
} from 'lucide-react';
import { useSubstitutionWorkspaceStore } from '@/lib/stores/substitutionWorkspaceStore';
import { useBMOStore } from '@/lib/stores';
import {
  SubstitutionKPIBar,
  substitutionCategories,
} from '@/components/features/bmo/substitution/command-center';
// New 3-level navigation module
import {
  SubstitutionSidebar,
  SubstitutionSubNavigation,
  SubstitutionContentRouter,
  type SubstitutionMainCategory,
} from '@/modules/substitution';
import {
  SubstitutionWorkspaceContent,
  SubstitutionCommandPalette,
  SubstitutionStatsModal,
  SubstitutionDirectionPanel,
} from '@/components/features/bmo/workspace/substitution';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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
    { id: 'summary', label: 'Résumé' },
    { id: 'today', label: "Aujourd'hui", badge: 8 },
  ],
  critical: [
    { id: 'all', label: 'Toutes', badge: 3, badgeType: 'critical' },
    { id: 'urgent', label: 'Urgentes', badge: 1, badgeType: 'critical' },
    { id: 'high', label: 'Haute priorité', badge: 2, badgeType: 'warning' },
  ],
  pending: [
    { id: 'all', label: 'Toutes', badge: 12 },
    { id: 'no-substitute', label: 'Sans substitut', badge: 5, badgeType: 'warning' },
    { id: 'validation', label: 'En validation', badge: 7 },
  ],
  absences: [
    { id: 'current', label: 'En cours', badge: 8 },
    { id: 'upcoming', label: 'À venir', badge: 15 },
    { id: 'planned', label: 'Planifiées' },
  ],
  delegations: [
    { id: 'active', label: 'Actives', badge: 15 },
    { id: 'temporary', label: 'Temporaires', badge: 10 },
    { id: 'permanent', label: 'Permanentes', badge: 5 },
  ],
  completed: [
    { id: 'recent', label: 'Récentes' },
    { id: 'week', label: 'Cette semaine' },
    { id: 'month', label: 'Ce mois' },
  ],
  historique: [
    { id: 'all', label: 'Tout' },
    { id: 'by-employee', label: 'Par employé' },
    { id: 'by-bureau', label: 'Par bureau' },
  ],
  analytics: [
    { id: 'dashboard', label: 'Tableau de bord' },
    { id: 'statistics', label: 'Statistiques' },
    { id: 'trends', label: 'Tendances' },
  ],
  settings: [
    { id: 'general', label: 'Général' },
    { id: 'rules', label: 'Règles' },
    { id: 'notifications', label: 'Notifications' },
  ],
};

// ================================
// Main Component
// ================================
export default function SubstitutionPage() {
  const {
    commandPaletteOpen,
    setCommandPaletteOpen,
    statsModalOpen,
    setStatsModalOpen,
    directionPanelOpen,
    setDirectionPanelOpen,
  } = useSubstitutionWorkspaceStore();
  const { addToast, addActionLog, currentUser } = useBMOStore();

  // Navigation state - 3-level navigation
  const [activeCategory, setActiveCategory] = useState('overview');
  const [activeSubCategory, setActiveSubCategory] = useState('all');
  const [activeSubSubCategory, setActiveSubSubCategory] = useState<string | undefined>(undefined);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [kpiBarCollapsed, setKpiBarCollapsed] = useState(false);

  // UI state
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [notificationsPanelOpen, setNotificationsPanelOpen] = useState(false);
  const [navigationHistory, setNavigationHistory] = useState<Array<{ category: string; subCategory: string }>>([]);

  // Computed values
  const activeCategoryData = useMemo(
    () => substitutionCategories.find((c) => c.id === activeCategory),
    [activeCategory]
  );

  const subCategories = useMemo(
    () => subCategoriesMap[activeCategory] || [],
    [activeCategory]
  );

  // ================================
  // Handlers
  // ================================
  const handleCategoryChange = useCallback(
    (category: string, subCategory?: string) => {
      // Ajouter à l'historique
      setNavigationHistory((prev) => [...prev, { category: activeCategory, subCategory: activeSubCategory }]);
      
      setActiveCategory(category);
      setActiveSubCategory(subCategory || subCategoriesMap[category]?.[0]?.id || 'all');
      setActiveSubSubCategory(undefined); // Reset level 3
      
      addActionLog({
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
        action: 'view',
        module: 'substitution',
        targetId: category,
        targetType: 'category',
        targetLabel: substitutionCategories.find((c) => c.id === category)?.label || category,
        details: `Navigation vers la catégorie ${category}`,
        bureau: 'BMO',
      });
    },
    [activeCategory, activeSubCategory, addActionLog, currentUser]
  );

  const handleSubCategoryChange = useCallback((subCategory: string) => {
    setActiveSubCategory(subCategory);
    setActiveSubSubCategory(undefined); // Reset level 3 when changing level 2
  }, []);

  const handleSubSubCategoryChange = useCallback((subSubCategory: string) => {
    setActiveSubSubCategory(subSubCategory);
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    addToast('Actualisation des données...', 'info');
    
    await new Promise((r) => setTimeout(r, 1000));
    
    addToast('Données actualisées', 'success');
    setIsRefreshing(false);
    
    addActionLog({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action: 'audit',
      module: 'substitution',
      targetId: 'REFRESH',
      targetType: 'system',
      targetLabel: 'Rafraîchissement',
      details: 'Rafraîchissement manuel des données',
      bureau: 'BMO',
    });
  }, [addToast, addActionLog, currentUser]);

  const handleGoBack = useCallback(() => {
    if (navigationHistory.length > 0) {
      const previous = navigationHistory[navigationHistory.length - 1];
      setNavigationHistory((prev) => prev.slice(0, -1));
      setActiveCategory(previous.category);
      setActiveSubCategory(previous.subCategory);
    }
  }, [navigationHistory]);

  const handleExport = useCallback(async () => {
    addToast('Export des données en cours...', 'info');
    await new Promise((r) => setTimeout(r, 1500));
    addToast('Export généré avec succès', 'success');
  }, [addToast]);

  // ================================
  // Keyboard Shortcuts
  // ================================
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // ⌘K / Ctrl+K - Palette de commandes
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }

      // ⌘B / Ctrl+B - Toggle sidebar
      if (e.key === 'b' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSidebarCollapsed((prev) => !prev);
      }

      // F11 - Plein écran
      if (e.key === 'F11') {
        e.preventDefault();
        setIsFullScreen((prev) => !prev);
      }

      // Alt+← - Retour
      if (e.key === 'ArrowLeft' && e.altKey) {
        e.preventDefault();
        handleGoBack();
      }

      // Escape - Fermer les panneaux
      if (e.key === 'Escape') {
        if (commandPaletteOpen) {
          setCommandPaletteOpen(false);
        } else if (notificationsPanelOpen) {
          setNotificationsPanelOpen(false);
        } else if (directionPanelOpen) {
          setDirectionPanelOpen(false);
        }
      }

      // ⌘R / Ctrl+R - Rafraîchir
      if (e.key === 'r' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleRefresh();
      }

      // ⌘I / Ctrl+I - Stats
      if (e.key === 'i' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setStatsModalOpen(true);
      }

      // ⌘E / Ctrl+E - Export
      if (e.key === 'e' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleExport();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [
    commandPaletteOpen,
    notificationsPanelOpen,
    directionPanelOpen,
    setCommandPaletteOpen,
    setDirectionPanelOpen,
    setStatsModalOpen,
    handleGoBack,
    handleRefresh,
    handleExport,
  ]);

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
      <SubstitutionSidebar
        activeCategory={activeCategory}
        activeSubCategory={activeSubCategory || undefined}
        collapsed={sidebarCollapsed}
        stats={{
          critical: 3,
          pending: 12,
          active: 38,
        }}
        onCategoryChange={handleCategoryChange}
        onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
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
              <RefreshCw className="h-5 w-5 text-indigo-400" />
              <h1 className="text-base font-semibold text-slate-200">Substitution</h1>
              <Badge
                variant="default"
                className="text-xs bg-slate-800/50 text-slate-300 border-slate-700/50"
              >
                v1.0
              </Badge>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {/* Global Search */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCommandPaletteOpen(true)}
              className="h-8 px-3 gap-2 text-slate-400 hover:text-slate-200"
            >
              <Search className="h-4 w-4" />
              <span className="hidden md:inline text-sm">Rechercher</span>
              <kbd className="hidden md:inline-flex ml-1 text-xs bg-slate-700/50 px-1.5 py-0.5 rounded">
                ⌘K
              </kbd>
            </Button>

            {/* Notifications */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setNotificationsPanelOpen(!notificationsPanelOpen)}
              className="h-8 w-8 p-0 text-slate-400 hover:text-slate-200 relative"
              title="Notifications"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute -top-0.5 -right-0.5 h-2 w-2 bg-red-500 rounded-full" />
            </Button>

            {/* Refresh */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              className="h-8 w-8 p-0 text-slate-400 hover:text-slate-200"
              title="Rafraîchir (⌘R)"
            >
              <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
            </Button>

            {/* Direction Panel Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDirectionPanelOpen(!directionPanelOpen)}
              className={cn(
                'h-8 w-8 p-0',
                directionPanelOpen
                  ? 'text-indigo-400 bg-indigo-500/10'
                  : 'text-slate-400 hover:text-slate-200'
              )}
              title="Panneau de pilotage"
            >
              {directionPanelOpen ? (
                <PanelRightClose className="h-4 w-4" />
              ) : (
                <PanelRight className="h-4 w-4" />
              )}
            </Button>

            {/* Fullscreen Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFullScreen(!isFullScreen)}
              className="h-8 w-8 p-0 text-slate-400 hover:text-slate-200"
              title="Plein écran (F11)"
            >
              {isFullScreen ? (
                <Minimize className="h-4 w-4" />
              ) : (
                <Maximize className="h-4 w-4" />
              )}
            </Button>

            {/* More Actions Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-slate-400 hover:text-slate-200"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-slate-900 border-slate-700">
                <DropdownMenuItem onClick={() => setStatsModalOpen(true)}>
                  <BarChart3 className="mr-2 h-4 w-4" />
                  <span>Statistiques</span>
                  <kbd className="ml-auto text-xs bg-slate-700/50 px-1.5 py-0.5 rounded">⌘I</kbd>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExport}>
                  <Download className="mr-2 h-4 w-4" />
                  <span>Exporter</span>
                  <kbd className="ml-auto text-xs bg-slate-700/50 px-1.5 py-0.5 rounded">⌘E</kbd>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-slate-700" />
                <DropdownMenuItem onClick={() => handleCategoryChange('settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Paramètres</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Sub Navigation - 3-level */}
        {subCategories.length > 0 && (
          <SubstitutionSubNavigation
            mainCategory={activeCategory as SubstitutionMainCategory}
            subCategory={activeSubCategory || undefined}
            subSubCategory={activeSubSubCategory}
            onSubCategoryChange={handleSubCategoryChange}
            onSubSubCategoryChange={handleSubSubCategoryChange}
            stats={{
              critical: 3,
              pending: 12,
              active: 38,
            }}
          />
        )}

        {/* KPI Bar */}
        <SubstitutionKPIBar
          visible={true}
          collapsed={kpiBarCollapsed}
          onToggleCollapse={() => setKpiBarCollapsed((prev) => !prev)}
          onRefresh={handleRefresh}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto min-w-0 max-w-full">
          <div className="p-6">
            <SubstitutionContentRouter
              mainCategory={activeCategory as SubstitutionMainCategory}
              subCategory={activeSubCategory || undefined}
              subSubCategory={activeSubSubCategory}
            />
          </div>
        </main>

        {/* Status Bar */}
        <footer className="flex items-center justify-between px-4 py-1.5 border-t border-slate-700/50 bg-slate-900/60 text-xs">
          <div className="flex items-center gap-4 text-slate-500">
            <span>Dernière mise à jour: il y a 2 min</span>
            <span>•</span>
            <span>38 substitutions actives</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-slate-400">Connecté</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Notifications Panel */}
      {notificationsPanelOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setNotificationsPanelOpen(false)}
          />
          <div className="fixed right-0 top-0 bottom-0 w-96 bg-slate-900 border-l border-slate-700/50 z-50 shadow-2xl overflow-y-auto">
            <div className="p-4 border-b border-slate-700/50">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-200">Notifications</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setNotificationsPanelOpen(false)}
                  className="h-6 w-6 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="p-4">
              <p className="text-sm text-slate-400 text-center py-8">
                Aucune notification pour le moment
              </p>
            </div>
          </div>
        </>
      )}

      {/* Direction Panel */}
      <SubstitutionDirectionPanel
        open={directionPanelOpen}
        onClose={() => setDirectionPanelOpen(false)}
      />

      {/* Command Palette */}
      <SubstitutionCommandPalette
        open={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />

      {/* Stats Modal */}
      <SubstitutionStatsModal
        open={statsModalOpen}
        onClose={() => setStatsModalOpen(false)}
      />
    </div>
  );
}
