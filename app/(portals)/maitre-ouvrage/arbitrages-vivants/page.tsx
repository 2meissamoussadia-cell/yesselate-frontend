'use client';

/**
 * Centre de Commandement Arbitrages & Goulots - Version 3.0
 * Plateforme de pilotage et résolution de conflits
 * Architecture multi-niveaux cohérente avec Analytics et Gouvernance
 */

import React, { useEffect, useState, useCallback, useMemo } from 'react';
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
export default function ArbitragesVivantsPage() {
  const { addToast, addActionLog, currentUser } = useBMOStore();
  const {
    commandPaletteOpen,
    setCommandPaletteOpen,
    statsModalOpen,
    setStatsModalOpen,
    directionPanelOpen,
    setDirectionPanelOpen,
  } = useArbitragesWorkspaceStore();

  // Navigation state - 3-level navigation
  const [activeCategory, setActiveCategory] = useState('overview');
  const [activeSubCategory, setActiveSubCategory] = useState('all');
  const [activeSubSubCategory, setActiveSubSubCategory] = useState<string | undefined>(undefined);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // UI state
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
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
    return arbitragesCategories.find((c) => c.id === activeCategory)?.label || 'Arbitrages';
  }, [activeCategory]);

  const currentSubCategories = useMemo(() => {
    return subCategoriesMap[activeCategory] || [];
  }, [activeCategory]);

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
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setLastUpdate(new Date());
      addToast('Données rafraîchies', 'success');
    }, 1500);
  }, [addToast]);

  const handleCategoryChange = useCallback((category: string, subCategory?: string) => {
    setNavigationHistory((prev) => [...prev, activeCategory]);
    setActiveCategory(category);
    setActiveSubCategory(subCategory || 'all');
    setActiveSubSubCategory(undefined); // Reset level 3
  }, [activeCategory]);

  const handleSubCategoryChange = useCallback((subCategory: string) => {
    setActiveSubCategory(subCategory);
    setActiveSubSubCategory(undefined); // Reset level 3 when changing level 2
  }, []);

  const handleSubSubCategoryChange = useCallback((subSubCategory: string) => {
    setActiveSubSubCategory(subSubCategory);
  }, []);

  const handleGoBack = useCallback(() => {
    if (navigationHistory.length > 0) {
      const previousCategory = navigationHistory[navigationHistory.length - 1];
      setNavigationHistory((prev) => prev.slice(0, -1));
      setActiveCategory(previousCategory);
      setActiveSubCategory('all');
    }
  }, [navigationHistory]);

  const handleToggleFullscreen = useCallback(() => {
    setFullscreen((prev) => !prev);
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
        setCommandPaletteOpen(true);
        return;
      }

      // Ctrl+E : Export
      if (isMod && e.key === 'e') {
        e.preventDefault();
        // Open export modal
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
        handleToggleFullscreen();
        return;
      }

      // Alt+Left : Back
      if (e.altKey && e.key === 'ArrowLeft') {
        e.preventDefault();
        handleGoBack();
        return;
      }

      // Ctrl+B : Toggle sidebar
      if (isMod && e.key === 'b') {
        e.preventDefault();
        setSidebarCollapsed((prev) => !prev);
        return;
      }

      // Ctrl+R : Refresh
      if (isMod && e.key === 'r') {
        e.preventDefault();
        handleRefresh();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setCommandPaletteOpen, handleToggleFullscreen, handleGoBack, handleRefresh, helpModalOpen]);

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
        activeCategory={activeCategory}
        activeSubCategory={activeSubCategory || undefined}
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
          mainCategory={activeCategory as ArbitragesMainCategory}
          subCategory={activeSubCategory || undefined}
          subSubCategory={activeSubSubCategory}
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
          <div className="h-full overflow-y-auto">
            <ArbitragesContentRouter
              mainCategory={activeCategory as ArbitragesMainCategory}
              subCategory={activeSubCategory || undefined}
              subSubCategory={activeSubSubCategory}
            />
          </div>
        </main>

        {/* Status Bar */}
        <footer className="flex items-center justify-between px-4 py-1.5 border-t border-slate-800/50 bg-slate-900/60 text-xs">
          <div className="flex items-center gap-4">
            <span className="text-slate-600">Màj: {formatLastUpdate()}</span>
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

// ================================
// Notifications Panel
// ================================
function NotificationsPanel({ onClose }: { onClose: () => void }) {
  const notifications = [
    {
      id: '1',
      type: 'critical',
      title: 'Arbitrage critique: Budget lot 4',
      time: 'il y a 15 min',
      read: false,
    },
    {
      id: '2',
      type: 'warning',
      title: 'Délai proche: Ressources projet X',
      time: 'il y a 1h',
      read: false,
    },
    {
      id: '3',
      type: 'info',
      title: 'Arbitrage résolu: Planning infra',
      time: 'il y a 3h',
      read: true,
    },
    {
      id: '4',
      type: 'warning',
      title: 'Escalade vers DG: Budget Q4',
      time: 'il y a 5h',
      read: true,
    },
    {
      id: '5',
      type: 'info',
      title: 'Nouvelle décision disponible',
      time: 'hier',
      read: true,
    },
  ];

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />

      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 w-96 bg-slate-900 border-l border-slate-700/50 z-50 flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/50">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-orange-400" />
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

        <div className="flex-1 overflow-y-auto divide-y divide-slate-800/50">
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
