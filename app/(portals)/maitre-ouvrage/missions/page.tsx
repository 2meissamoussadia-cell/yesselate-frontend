'use client';

/**
 * Centre de Commandement Missions - Version 2.0
 * Plateforme de gestion des missions terrain
 * Architecture cohérente avec la page Gouvernance et Analytics
 */

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Plane,
  Search,
  Bell,
  ChevronLeft,
} from 'lucide-react';
import {
  useMissionsCommandCenterStore,
  type MissionsMainCategory as StoreMissionsMainCategory,
} from '@/lib/stores/missionsCommandCenterStore';
import {
  MissionsKPIBar,
  MissionsModals,
  MissionsDetailPanel,
  MissionsBatchActionsBar,
  ActionsMenu,
  missionsCategories,
  missionsSubCategoriesMap,
  type MissionsKPIData,
} from '@/components/features/bmo/missions/command-center';
// New 3-level navigation module
import {
  MissionsSidebar,
  MissionsSubNavigation,
  MissionsContentRouter,
  type MissionsMainCategory,
} from '@/modules/missions';
import { MissionsCommandPalette } from '@/components/features/bmo/workspace/missions/MissionsCommandPalette';

// Mock KPI Data (à remplacer par des données réelles)
const mockKPIData: MissionsKPIData = {
  totalMissions: 45,
  activeMissions: 12,
  teamsOnField: 8,
  avgDuration: 4.2,
  completionRate: 87,
  onTimeDelivery: 82,
  avgCost: 450000,
  satisfactionScore: 4.3,
  trends: {
    total: 'up',
    active: 'stable',
    completion: 'up',
    satisfaction: 'up',
  },
};

// ================================
// Main Component
// ================================
export default function MissionsPage() {
  return <MissionsPageContent />;
}

function MissionsPageContent() {
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
  } = useMissionsCommandCenterStore();

  // État local pour refresh (comme Governance)
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Navigation state (depuis le store)
  const activeCategory = navigation.mainCategory;
  const activeSubCategory = navigation.subCategory || 'all';

  // ================================
  // Computed values
  // ================================
  const currentCategoryLabel = useMemo(() => {
    return missionsCategories.find((c) => c.id === activeCategory)?.label || 'Missions';
  }, [activeCategory]);

  const currentSubCategories = useMemo(() => {
    return missionsSubCategoriesMap[activeCategory] || [];
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
    }, 1500);
  }, []);

  // Navigation handlers - 3-level navigation
  const handleCategoryChange = useCallback((category: string, subCategory?: string) => {
    navigate(category as StoreMissionsMainCategory, subCategory || 'all', null);
  }, [navigate]);

  const handleSubCategoryChange = useCallback((subCategory: string) => {
    navigate(activeCategory, subCategory, null);
  }, [activeCategory, navigate]);

  const handleSubSubCategoryChange = useCallback((subSubCategory: string) => {
    navigate(activeCategory, activeSubCategory, subSubCategory);
  }, [activeCategory, activeSubCategory, navigate]);

  const handleBatchAction = useCallback((actionId: string, ids: string[]) => {
    switch (actionId) {
      case 'export':
        openModal('export', { selectedIds: ids });
        break;
      case 'view':
        if (ids.length > 0) {
          openModal('mission-detail', { missionId: ids[0] });
        }
        break;
      case 'start':
        // TODO: Implémenter démarrage batch
        break;
      case 'cancel':
        // TODO: Implémenter annulation batch
        break;
      default:
        break;
    }
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
      <MissionsSidebar
        activeCategory={activeCategory}
        activeSubCategory={activeSubCategory}
        collapsed={sidebarCollapsed}
        stats={{
          active: mockKPIData.activeMissions,
          pending: mockKPIData.totalMissions - mockKPIData.activeMissions,
          completed: Math.round(mockKPIData.totalMissions * (mockKPIData.completionRate / 100)),
          cancelled: 0,
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
              <Plane className="h-5 w-5 text-indigo-400" />
              <h1 className="text-base font-semibold text-slate-200">Missions</h1>
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
                5
              </span>
            </Button>

            {/* Actions Menu (consolidated) */}
            <ActionsMenu onRefresh={handleRefresh} isRefreshing={isRefreshing} />
          </div>
        </header>

        {/* Sub Navigation - Level 2 & 3 */}
        <MissionsSubNavigation
          mainCategory={activeCategory as MissionsMainCategory}
          subCategory={activeSubCategory}
          subSubCategory={navigation.filter ?? undefined}
          onSubCategoryChange={handleSubCategoryChange}
          onSubSubCategoryChange={handleSubSubCategoryChange}
          stats={{
            active: mockKPIData.activeMissions,
            pending: mockKPIData.totalMissions - mockKPIData.activeMissions,
            completed: Math.round(mockKPIData.totalMissions * (mockKPIData.completionRate / 100)),
            cancelled: 0,
          }}
        />

        {/* KPI Bar */}
        {kpiConfig.visible && (
          <MissionsKPIBar
            data={mockKPIData}
            collapsed={kpiConfig.collapsed}
            onToggleCollapse={() => setKPIConfig({ collapsed: !kpiConfig.collapsed })}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-hidden">
          <div className="h-full overflow-x-hidden overflow-y-auto">
            <MissionsContentRouter
              mainCategory={activeCategory as MissionsMainCategory}
              subCategory={activeSubCategory}
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
              45 missions • 12 actives • 8 équipes terrain
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
      {commandPaletteOpen && <MissionsCommandPalette open={true} onClose={toggleCommandPalette} onOpenStats={() => openModal('stats')} onRefresh={handleRefresh} />}

      {/* Modals */}
      <MissionsModals />

      {/* Detail Panel */}
      <MissionsDetailPanel />

      {/* Batch Actions Bar */}
      <MissionsBatchActionsBar onAction={handleBatchAction} />

      {/* Notifications Panel */}
      {notificationsPanelOpen && (
        <NotificationsPanel onClose={toggleNotificationsPanel} />
      )}
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
      title: 'Mission en retard',
      time: 'il y a 15 min',
      read: false,
    },
    {
      id: '2',
      type: 'warning',
      title: 'Budget dépassé',
      time: 'il y a 1h',
      read: false,
    },
    {
      id: '3',
      type: 'info',
      title: 'Nouvelle mission assignée',
      time: 'il y a 3h',
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
            <Bell className="h-4 w-4 text-indigo-400" />
            <h3 className="text-sm font-medium text-slate-200">Notifications</h3>
            <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs">
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
