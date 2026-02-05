'use client';

/**
 * Centre de Commandement Logs - Version 2.0
 * Plateforme de consultation et analyse des logs
 * Architecture cohérente avec la page Analytics
 */

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Terminal,
  Search,
  Bell,
  ChevronLeft,
} from 'lucide-react';
import {
  useLogsCommandCenterStore,
} from '@/lib/stores/logsCommandCenterStore';
import {
  LogsKPIBar,
  ActionsMenu,
  LogsDetailPanel,
  LogsModals,
  logsCategories,
} from '@/components/features/bmo/logs/command-center';
// New 3-level navigation module
import {
  LogsSidebar,
  LogsSubNavigation,
  LogsContentRouter,
  type LogsMainCategory,
} from '@/modules/logs';
import { LogsCommandPalette } from '@/components/features/bmo/workspace/logs/LogsCommandPalette';
import { LogsStatsModal } from '@/components/features/bmo/workspace/logs/LogsStatsModal';
import { LogsDirectionPanel } from '@/components/features/bmo/workspace/logs/LogsDirectionPanel';
import { useBMOStore } from '@/lib/stores';

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
    { id: 'recent', label: 'Récents', badge: 24 },
  ],
  errors: [
    { id: 'all', label: 'Toutes', badge: 24 },
    { id: 'critical', label: 'Critiques', badge: 3, badgeType: 'critical' },
    { id: 'recent', label: 'Récentes', badge: 8, badgeType: 'warning' },
    { id: 'resolved', label: 'Résolues' },
  ],
  warnings: [
    { id: 'all', label: 'Tous', badge: 12 },
    { id: 'active', label: 'Actifs', badge: 8, badgeType: 'warning' },
    { id: 'resolved', label: 'Résolus' },
  ],
  system: [
    { id: 'all', label: 'Tous' },
    { id: 'processes', label: 'Processus' },
    { id: 'resources', label: 'Ressources' },
    { id: 'performance', label: 'Performance' },
  ],
  api: [
    { id: 'all', label: 'Tous' },
    { id: 'requests', label: 'Requêtes' },
    { id: 'responses', label: 'Réponses' },
    { id: 'errors', label: 'Erreurs', badge: 5, badgeType: 'warning' },
  ],
  security: [
    { id: 'all', label: 'Tous', badge: 3, badgeType: 'critical' },
    { id: 'auth', label: 'Authentification' },
    { id: 'access', label: 'Accès' },
    { id: 'threats', label: 'Menaces', badge: 2, badgeType: 'critical' },
  ],
  audit: [
    { id: 'all', label: 'Tous' },
    { id: 'actions', label: 'Actions' },
    { id: 'changes', label: 'Modifications' },
    { id: 'access', label: 'Accès' },
  ],
  'user-actions': [
    { id: 'all', label: 'Toutes' },
    { id: 'recent', label: 'Récentes' },
    { id: 'critical', label: 'Critiques' },
  ],
  analysis: [
    { id: 'all', label: 'Toutes' },
    { id: 'trends', label: 'Tendances' },
    { id: 'patterns', label: 'Patterns' },
    { id: 'anomalies', label: 'Anomalies', badge: 2, badgeType: 'warning' },
  ],
};

// ================================
// Main Component
// ================================
export default function LogsPage() {
  return <LogsPageContent />;
}

function LogsPageContent() {
  const { addToast, addActionLog, currentUser } = useBMOStore();
  const {
    navigation,
    fullscreen,
    sidebarCollapsed,
    commandPaletteOpen,
    notificationsPanelOpen,
    kpiConfig,
    navigationHistory,
    modal,
    toggleFullscreen,
    toggleCommandPalette,
    toggleNotificationsPanel,
    toggleSidebar,
    goBack,
    openModal,
    closeModal,
    navigate,
    setKPIConfig,
  } = useLogsCommandCenterStore();

  // État local pour refresh
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Navigation state (depuis le store)
  const activeCategory = navigation.mainCategory;
  const activeSubCategory = navigation.subCategory || 'all';

  // ================================
  // Computed values
  // ================================
  const currentCategoryLabel = useMemo(() => {
    return logsCategories.find((c) => c.id === activeCategory)?.label || 'Logs';
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
    addToast('Logs rafraîchis', 'success');
    addActionLog({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action: 'audit',
      module: 'logs',
      targetId: 'REFRESH',
      targetType: 'system',
      targetLabel: 'Rafraîchissement',
      details: 'Rafraîchissement manuel des logs',
      bureau: 'BMO',
    });
    setTimeout(() => {
      setIsRefreshing(false);
      setLastUpdate(new Date());
    }, 1500);
  }, [addToast, addActionLog, currentUser]);

  const handleCategoryChange = useCallback((category: string) => {
    navigate(category as LogsMainCategory, 'all', null);
  }, [navigate]);

  const handleSubCategoryChange = useCallback((subCategory: string) => {
    navigate(activeCategory, subCategory, null);
  }, [activeCategory, navigate]);

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

      // Ctrl+F : Filters
      if (isMod && e.key === 'f') {
        e.preventDefault();
        openModal('filters');
        return;
      }

      // Ctrl+E : Export
      if (isMod && e.key === 'e') {
        e.preventDefault();
        openModal('export');
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

      // Ctrl+I : Stats
      if (isMod && e.key === 'i') {
        e.preventDefault();
        openModal('stats');
        return;
      }

      // ? : Shortcuts
      if (e.key === '?' && !isMod && !e.altKey) {
        e.preventDefault();
        openModal('shortcuts');
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleCommandPalette, toggleFullscreen, toggleSidebar, goBack, openModal]);

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
      <LogsSidebar
        activeCategory={activeCategory}
        activeSubCategory={activeSubCategory}
        collapsed={sidebarCollapsed}
        stats={{}}
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
                onClick={goBack}
                className="h-8 w-8 p-0 text-slate-500 hover:text-slate-300"
                title="Retour (Alt+←)"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}

            {/* Title */}
            <div className="flex items-center gap-2">
              <Terminal className="h-5 w-5 text-blue-400" />
              <h1 className="text-base font-semibold text-slate-200">Logs</h1>
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
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                3
              </span>
            </Button>

            {/* Actions Menu (consolidated) */}
            <ActionsMenu onRefresh={handleRefresh} isRefreshing={isRefreshing} />
          </div>
        </header>

        {/* Sub Navigation - Level 2 & 3 */}
        <LogsSubNavigation
          mainCategory={activeCategory}
          subCategory={activeSubCategory}
          subSubCategory={navigation.filter || undefined}
          onSubCategoryChange={handleSubCategoryChange}
          onSubSubCategoryChange={(subSubCategory) => navigate(activeCategory, activeSubCategory, subSubCategory)}
          stats={{}}
        />

        {/* KPI Bar */}
        {kpiConfig.visible && (
          <LogsKPIBar
            visible={true}
            collapsed={kpiConfig.collapsed}
            onToggleCollapse={() => setKPIConfig({ collapsed: !kpiConfig.collapsed })}
            onRefresh={handleRefresh}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-hidden">
          <div className="h-full overflow-x-hidden overflow-y-auto">
            <LogsContentRouter
              mainCategory={activeCategory}
              subCategory={activeSubCategory}
              subSubCategory={navigation.filter || undefined}
            />
          </div>
        </main>

        {/* Status Bar */}
        <footer className="flex items-center justify-between px-4 py-1.5 border-t border-slate-800/50 bg-slate-900/60 text-xs">
          <div className="flex items-center gap-4">
            <span className="text-slate-600">MàJ: {formatLastUpdate()}</span>
            <span className="text-slate-700">•</span>
            <span className="text-slate-600">
              24 erreurs • 12 avertissements • 8 API
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
      {commandPaletteOpen && (
        <LogsCommandPalette
          open={commandPaletteOpen}
          onClose={() => toggleCommandPalette()}
          onOpenStats={() => openModal('stats')}
          onRefresh={handleRefresh}
        />
      )}

      {/* Modals Router */}
      <LogsModals />

      {/* Detail Panel */}
      <LogsDetailPanel />

      {/* Direction Panel (Notifications) */}
      {notificationsPanelOpen && (
        <LogsDirectionPanel
          open={notificationsPanelOpen}
          onClose={toggleNotificationsPanel}
        />
      )}
    </div>
  );
}
