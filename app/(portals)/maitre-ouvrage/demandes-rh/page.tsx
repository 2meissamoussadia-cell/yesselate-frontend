'use client';

/**
 * Centre de Commandement Demandes RH - Version 2.0
 * Architecture cohérente avec la page Analytics
 */

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Search,
  Bell,
  ChevronLeft,
} from 'lucide-react';
import { useDemandesRHCommandCenterStore } from '@/lib/stores/demandesRHCommandCenterStore';
import {
  DemandesRHKPIBar,
  ActionsMenu,
  DemandesRHDetailModal,
  DemandesRHFiltersPanel,
  demandesRHCategories,
} from '@/components/features/bmo/demandes-rh/command-center';
// New 3-level navigation module
import {
  DemandesRhSidebar,
  DemandesRhSubNavigation,
  DemandesRhContentRouter,
  type DemandesRhMainCategory,
} from '@/modules/demandes-rh';

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
  conges: [
    { id: 'all', label: 'Toutes' },
    { id: 'pending', label: 'En attente', badge: 12, badgeType: 'warning' },
    { id: 'approved', label: 'Approuvées', badge: 67 },
    { id: 'rejected', label: 'Rejetées', badge: 10 },
  ],
  depenses: [
    { id: 'all', label: 'Toutes' },
    { id: 'pending', label: 'En attente', badge: 8, badgeType: 'warning' },
    { id: 'validated', label: 'Validées', badge: 52 },
    { id: 'rejected', label: 'Rejetées', badge: 7 },
  ],
  deplacements: [
    { id: 'all', label: 'Tous' },
    { id: 'pending', label: 'En attente', badge: 5, badgeType: 'warning' },
    { id: 'approved', label: 'Approuvés', badge: 35 },
    { id: 'rejected', label: 'Rejetés', badge: 5 },
  ],
  avances: [
    { id: 'all', label: 'Toutes' },
    { id: 'pending', label: 'En attente', badge: 2, badgeType: 'warning' },
    { id: 'validated', label: 'Validées', badge: 7 },
    { id: 'rejected', label: 'Rejetées', badge: 1 },
  ],
  urgent: [
    { id: 'all', label: 'Toutes', badge: 5 },
    { id: 'conges', label: 'Congés', badge: 2, badgeType: 'critical' },
    { id: 'depenses', label: 'Dépenses', badge: 1, badgeType: 'critical' },
    { id: 'deplacements', label: 'Déplacements', badge: 2, badgeType: 'critical' },
  ],
  pending: [
    { id: 'all', label: 'Toutes', badge: 23 },
    { id: 'conges', label: 'Congés', badge: 12, badgeType: 'warning' },
    { id: 'depenses', label: 'Dépenses', badge: 8, badgeType: 'warning' },
    { id: 'deplacements', label: 'Déplacements', badge: 3 },
  ],
  validated: [
    { id: 'all', label: 'Toutes', badge: 178 },
    { id: 'conges', label: 'Congés', badge: 67 },
    { id: 'depenses', label: 'Dépenses', badge: 52 },
    { id: 'deplacements', label: 'Déplacements', badge: 35 },
    { id: 'avances', label: 'Avances', badge: 7 },
  ],
  analytics: [
    { id: 'overview', label: 'Vue d\'ensemble' },
    { id: 'performance', label: 'Performance' },
    { id: 'trends', label: 'Tendances' },
    { id: 'reports', label: 'Rapports' },
  ],
};

// ================================
// Main Component
// ================================
export default function DemandesRHPage() {
  return <DemandesRHPageContent />;
}

function DemandesRHPageContent() {
  // Store Zustand
  const {
    navigation,
    navigationHistory,
    sidebarCollapsed,
    fullscreen,
    commandPaletteOpen,
    notificationsPanelOpen,
    kpiConfig,
    detailModalOpen,
    selectedDemandeId,
    isRefreshing,
    modal,
    navigate,
    goBack,
    toggleSidebar,
    toggleFullscreen,
    toggleCommandPalette,
    toggleNotificationsPanel,
    setKPIConfig,
    openDetailModal,
    closeDetailModal,
    openModal,
    closeModal,
    startRefresh,
    endRefresh,
  } = useDemandesRHCommandCenterStore();

  // Navigation state (from store)
  const activeCategory = navigation.mainCategory;
  const activeSubCategory = navigation.subCategory || 'all';

  // UI state local
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // ================================
  // Computed values
  // ================================
  const currentCategoryLabel = useMemo(() => {
    return demandesRHCategories.find((c) => c.id === activeCategory)?.label || 'Demandes RH';
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
    startRefresh();
    setTimeout(() => {
      endRefresh();
      setLastUpdate(new Date());
    }, 1500);
  }, [startRefresh, endRefresh]);

  // Navigation handlers - 3-level navigation
  const handleCategoryChange = useCallback((category: string, subCategory?: string) => {
    navigate(category as any, subCategory || 'all');
  }, [navigate]);

  const handleSubCategoryChange = useCallback((subCategory: string) => {
    navigate(activeCategory, subCategory);
  }, [activeCategory, navigate]);

  const handleSubSubCategoryChange = useCallback((subSubCategory: string) => {
    navigate(activeCategory, activeSubCategory, subSubCategory);
  }, [activeCategory, activeSubCategory, navigate]);

  const handleGoBack = useCallback(() => {
    goBack();
  }, [goBack]);

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

      // F11 : Fullscreen
      if (e.key === 'F11') {
        e.preventDefault();
        toggleFullscreen();
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
        toggleSidebar();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleCommandPalette, toggleFullscreen, toggleSidebar, handleGoBack]);

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
      <DemandesRhSidebar
        activeCategory={activeCategory as DemandesRhMainCategory}
        activeSubCategory={activeSubCategory}
        collapsed={sidebarCollapsed}
        stats={{
          pending: 23,
          inProgress: 12,
          approved: 178,
          rejected: 0,
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
                onClick={handleGoBack}
                className="h-8 w-8 p-0 text-slate-500 hover:text-slate-300"
                title="Retour (Alt+←)"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}

            {/* Title */}
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-400" />
              <h1 className="text-base font-semibold text-slate-200">Demandes RH</h1>
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
                8
              </span>
            </Button>

            {/* Actions Menu (consolidated) */}
            <ActionsMenu
              onRefresh={handleRefresh}
              isRefreshing={isRefreshing}
              onFullscreen={toggleFullscreen}
              fullscreen={fullscreen}
              onCommandPalette={toggleCommandPalette}
              onToggleKPI={() => setKPIConfig({ collapsed: !kpiConfig.collapsed })}
              kpiVisible={!kpiConfig.collapsed}
              onFilters={() => openModal('filters')}
            />
          </div>
        </header>

        {/* Sub Navigation - Level 2 & 3 */}
        <DemandesRhSubNavigation
          mainCategory={activeCategory as DemandesRhMainCategory}
          subCategory={activeSubCategory}
          subSubCategory={navigation.filter ?? undefined}
          onSubCategoryChange={handleSubCategoryChange}
          onSubSubCategoryChange={handleSubSubCategoryChange}
          stats={{
            pending: 23,
            inProgress: 12,
            approved: 178,
            rejected: 0,
          }}
        />

        {/* KPI Bar */}
        {kpiConfig.visible && (
          <DemandesRHKPIBar
            visible={true}
            collapsed={kpiConfig.collapsed}
            onToggleCollapse={() => setKPIConfig({ collapsed: !kpiConfig.collapsed })}
            onRefresh={handleRefresh}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto p-4">
            <DemandesRhContentRouter
              mainCategory={activeCategory as DemandesRhMainCategory}
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
              234 demandes • 23 en attente • 178 validées
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

      {/* Notifications Panel */}
      {notificationsPanelOpen && (
        <NotificationsPanel onClose={toggleNotificationsPanel} />
      )}

      {/* Detail Modal (Pattern Overlay) */}
      {detailModalOpen && selectedDemandeId && (
        <DemandesRHDetailModal
          demandeId={selectedDemandeId}
          onClose={closeDetailModal}
          // TODO: Implémenter navigation précédent/suivant
          hasPrevious={false}
          hasNext={false}
        />
      )}

      {/* Filters Panel */}
      {modal.type === 'filters' && modal.isOpen && (
        <DemandesRHFiltersPanel
          isOpen={modal.isOpen}
          onClose={closeModal}
        />
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
      title: 'Demande urgente nécessite attention',
      time: 'il y a 15 min',
      read: false,
    },
    {
      id: '2',
      type: 'warning',
      title: '5 demandes en attente de validation',
      time: 'il y a 1h',
      read: false,
    },
    {
      id: '3',
      type: 'info',
      title: 'Nouvelle demande de congés',
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
            <Bell className="h-4 w-4 text-blue-400" />
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

