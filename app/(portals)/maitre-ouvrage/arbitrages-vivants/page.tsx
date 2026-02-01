'use client';

/**
 * Centre de Commandement Arbitrages & Goulots - Version 3.0
 * Plateforme de pilotage et résolution de conflits
 * Architecture multi-niveaux cohérente avec Analytics et Gouvernance
 */

import React, { Suspense, useState, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Scale,
  Search,
  Bell,
  ChevronLeft,
  RefreshCw,
  Plus,
  Download,
  Settings,
  MoreHorizontal,
  HelpCircle,
} from 'lucide-react';
import { ArbitragesHelpModal } from '@/components/features/bmo/workspace/arbitrages/modals/ArbitragesHelpModal';
import { useArbitragesWorkspaceStore } from '@/lib/stores/arbitragesWorkspaceStore';
import { useArbitragesNavigationStore } from '@/lib/stores/arbitragesNavigationStore';
import { useBMOStore } from '@/lib/stores';
import {
  ArbitragesKPIBar,
  arbitragesCategories,
} from '@/components/features/bmo/workspace/arbitrages';
// New 3-level navigation module
import {
  ArbitragesSidebar,
  ArbitragesSubNavigation,
  ArbitragesContentRouter,
  type ArbitragesMainCategory,
  useArbitragesNavigationSync,
  useArbitragesRefresh,
  useArbitragesKeyboardShortcuts,
  useFormatTimeAgo,
} from '@/modules/arbitrages-vivants';
import { ArbitragesCommandPalette } from '@/components/features/bmo/workspace/arbitrages/ArbitragesCommandPalette';
import { ArbitragesStatsModal } from '@/components/features/bmo/workspace/arbitrages/ArbitragesStatsModal';
import { ArbitragesDirectionPanel } from '@/components/features/bmo/workspace/arbitrages/ArbitragesDirectionPanel';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { NotificationsPanel } from '@/components/shared/NotificationsPanel';

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
    { id: 'highlights', label: 'Points clés', badge: 5 },
  ],
  critical: [
    { id: 'all', label: 'Tous', badge: 7, badgeType: 'critical' },
    { id: 'immediate', label: 'Immédiats', badge: 3, badgeType: 'critical' },
    { id: 'urgent', label: 'Urgents', badge: 4, badgeType: 'warning' },
  ],
  pending: [
    { id: 'all', label: 'Tous', badge: 23 },
    { id: 'recent', label: 'Récents', badge: 8 },
    { id: 'old', label: 'Anciens', badge: 15, badgeType: 'warning' },
  ],
  resolved: [
    { id: 'all', label: 'Tous' },
    { id: 'this-week', label: 'Cette semaine' },
    { id: 'this-month', label: 'Ce mois' },
    { id: 'archived', label: 'Archivés' },
  ],
  escalated: [
    { id: 'all', label: 'Tous', badge: 7 },
    { id: 'dg', label: 'Direction Générale', badge: 4, badgeType: 'critical' },
    { id: 'comex', label: 'COMEX', badge: 3, badgeType: 'warning' },
  ],
  categories: [
    { id: 'budget', label: 'Budgétaire', badge: 28 },
    { id: 'ressources', label: 'Ressources', badge: 24 },
    { id: 'planning', label: 'Planning', badge: 19 },
    { id: 'technique', label: 'Technique', badge: 12 },
  ],
  bureaux: [
    { id: 'all', label: 'Tous' },
    { id: 'daf', label: 'DAF', badge: 32 },
    { id: 'drh', label: 'DRH', badge: 21 },
    { id: 'dsi', label: 'DSI', badge: 18 },
  ],
};

// ================================
// Main Component
// ================================
function ArbitragesVivantsPageContent() {
  const { addToast, addActionLog, currentUser } = useBMOStore();
  const {
    commandPaletteOpen,
    setCommandPaletteOpen,
    statsModalOpen,
    setStatsModalOpen,
    directionPanelOpen,
    setDirectionPanelOpen,
  } = useArbitragesWorkspaceStore();

  // ✅ Navigation state - Utiliser le store centralisé
  const main = useArbitragesNavigationStore((state) => state.main);
  const sub = useArbitragesNavigationStore((state) => state.sub);
  const subSub = useArbitragesNavigationStore((state) => state.subSub);
  const setMain = useArbitragesNavigationStore((state) => state.setMain);
  const setSub = useArbitragesNavigationStore((state) => state.setSub);
  const setSubSub = useArbitragesNavigationStore((state) => state.setSubSub);

  // ✅ Synchroniser URL avec le store
  useArbitragesNavigationSync();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // ✅ Utiliser le hook de refresh
  const { refresh: handleRefresh, isRefreshing, lastUpdate } = useArbitragesRefresh({
    onRefresh: async () => {
      // TODO: Implémenter le refresh réel des données
      await new Promise((resolve) => setTimeout(resolve, 1500));
      addToast('Données rafraîchies', 'success');
    },
  });

  // UI state
  const [kpiBarCollapsed, setKpiBarCollapsed] = useState(false);
  const [notificationsPanelOpen, setNotificationsPanelOpen] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [helpModalOpen, setHelpModalOpen] = useState(false);

  // Navigation history for back button
  const [navigationHistory, setNavigationHistory] = useState<string[]>([]);

  // ================================
  // Computed values
  // ================================
  const currentCategoryLabel = useMemo(() => {
    return arbitragesCategories.find((c) => c.id === main)?.label || 'Arbitrages';
  }, [main]);

  const currentSubCategories = useMemo(() => {
    return subCategoriesMap[main] || [];
  }, [main]);

  // ✅ Utiliser le hook pour formater le temps écoulé
  const formattedLastUpdate = useFormatTimeAgo(lastUpdate);

  // ================================
  // Callbacks
  // ================================
  // handleRefresh est déjà défini par useArbitragesRefresh à la ligne 140

  const handleCategoryChange = useCallback((category: string, subCategory?: string) => {
    setNavigationHistory((prev) => [...prev, main]);
    setMain(category as ArbitragesMainCategory);
    setSub(subCategory || 'all');
    setSubSub(null); // Reset level 3
  }, [main, setMain, setSub, setSubSub]);

  const handleSubCategoryChange = useCallback((subCategory: string) => {
    setSub(subCategory);
    setSubSub(null); // Reset level 3 when changing level 2
  }, [setSub, setSubSub]);

  const handleSubSubCategoryChange = useCallback((subSubCategory: string) => {
    setSubSub(subSubCategory);
  }, [setSubSub]);

  const handleGoBack = useCallback(() => {
    if (navigationHistory.length > 0) {
      const previousCategory = navigationHistory[navigationHistory.length - 1];
      setNavigationHistory((prev) => prev.slice(0, -1));
      setMain(previousCategory as ArbitragesMainCategory);
      setSub('all');
      setSubSub(null);
    }
  }, [navigationHistory, setMain, setSub, setSubSub]);

  const handleToggleFullscreen = useCallback(() => {
    setFullscreen((prev) => !prev);
  }, []);

  // ✅ Utiliser le hook de raccourcis clavier
  useArbitragesKeyboardShortcuts({
    onCommandPalette: () => setCommandPaletteOpen(true),
    onRefresh: handleRefresh,
    onFullscreen: handleToggleFullscreen,
    onGoBack: handleGoBack,
    onToggleSidebar: () => setSidebarCollapsed((prev) => !prev),
    onHelp: () => setHelpModalOpen(true),
  });

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
      <ArbitragesSidebar
        activeCategory={main}
        activeSubCategory={sub || undefined}
        collapsed={sidebarCollapsed}
        stats={{
          critical: 7,
          pending: 23,
          resolved: 45,
        }}
        onCategoryChange={handleCategoryChange}
        onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
        onOpenCommandPalette={() => setCommandPaletteOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar */}
        <header className="flex items-center justify-between px-4 py-2 border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-xl min-h-[48px]">
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
              <Scale className="h-5 w-5 text-orange-400" />
              <h1 className="text-base font-semibold text-slate-200">Arbitrages & Goulots</h1>
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
            {/* Global Search */}
            <div className="w-64 hidden lg:block">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCommandPaletteOpen(true)}
                className="w-full justify-start gap-2 h-8 px-3 text-slate-400 hover:text-slate-300 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50"
              >
                <Search className="h-4 w-4" />
                <span className="text-xs">Rechercher...</span>
                <kbd className="ml-auto text-xs bg-slate-700/50 px-1.5 py-0.5 rounded">⌘K</kbd>
              </Button>
            </div>

            <div className="w-px h-4 bg-slate-700/50 mx-1 hidden lg:block" />

            {/* New Arbitrage Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                addToast('Création d\'arbitrage', 'info');
              }}
              className="h-8 px-3 text-slate-500 hover:text-slate-300 hover:bg-slate-800/50"
            >
              <Plus className="h-4 w-4 mr-1" />
              <span className="text-xs hidden sm:inline">Nouveau</span>
            </Button>

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
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                7
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
                <DropdownMenuItem onClick={() => setStatsModalOpen(true)}>
                  <Settings className="h-4 w-4 mr-2" />
                  Statistiques
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setDirectionPanelOpen(true)}>
                  <Download className="h-4 w-4 mr-2" />
                  Vue Direction
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setHelpModalOpen(true)}>
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Aide
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleToggleFullscreen}>
                  <Settings className="h-4 w-4 mr-2" />
                  {fullscreen ? 'Quitter' : 'Mode'} Plein écran
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Sub Navigation - 3-level */}
        <ArbitragesSubNavigation
          mainCategory={main}
          subCategory={sub || undefined}
          subSubCategory={subSub || undefined}
          onSubCategoryChange={handleSubCategoryChange}
          onSubSubCategoryChange={handleSubSubCategoryChange}
          stats={{
            critical: 7,
            pending: 23,
            resolved: 45,
          }}
        />

        {/* KPI Bar */}
        <ArbitragesKPIBar
          visible={true}
          collapsed={kpiBarCollapsed}
          onToggleCollapse={() => setKpiBarCollapsed((prev) => !prev)}
          onRefresh={handleRefresh}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-hidden">
          <div className="h-full overflow-x-hidden overflow-y-auto dashboard-container">
        <ArbitragesContentRouter
          mainCategory={main}
          subCategory={sub || undefined}
          subSubCategory={subSub || undefined}
        />
          </div>
        </main>

        {/* Status Bar */}
        <footer className="flex items-center justify-between px-4 py-1.5 border-t border-slate-800/50 bg-slate-900/60 text-xs">
          <div className="flex items-center gap-4">
            <span className="text-slate-600">Màj: {formattedLastUpdate}</span>
            <span className="text-slate-700">•</span>
            <span className="text-slate-600">
              89 arbitrages • 7 critiques • 23 en attente
            </span>
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
      <ArbitragesCommandPalette
        open={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onOpenStats={() => setStatsModalOpen(true)}
        onRefresh={handleRefresh}
      />

      {/* Direction Panel */}
      <ArbitragesDirectionPanel
        open={directionPanelOpen}
        onClose={() => setDirectionPanelOpen(false)}
      />

      {/* Stats Modal */}
      <ArbitragesStatsModal
        open={statsModalOpen}
        onClose={() => setStatsModalOpen(false)}
      />

      {/* Notifications Panel */}
      <NotificationsPanel
        isOpen={notificationsPanelOpen}
        onClose={() => setNotificationsPanelOpen(false)}
        moduleName="Arbitrages Vivants"
      />

      {/* Help Modal */}
      <ArbitragesHelpModal
        open={helpModalOpen}
        onClose={() => setHelpModalOpen(false)}
      />
    </div>
  );
}

function ArbitragesVivantsFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-500 border-t-transparent" />
    </div>
  );
}

export default function ArbitragesVivantsPage() {
  return (
    <Suspense fallback={<ArbitragesVivantsFallback />}>
      <ArbitragesVivantsPageContent />
    </Suspense>
  );
}
