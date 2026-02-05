'use client';

/**
 * Centre de Commandement Échanges Structurés - Version 3.0
 * Architecture cohérente avec Analytics et Gouvernance
 */

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mail, Search, Bell, ChevronLeft } from 'lucide-react';
import {
  useEchangesStructuresCommandCenterStore,
} from '@/lib/stores/echangesStructuresCommandCenterStore';
import {
  EchangesStructuresKPIBar,
  echangesStructuresCategories,
  EchangesStructuresCommandPalette,
} from '@/components/features/bmo/echanges-structures/command-center';
// New 3-level navigation module
import {
  EchangesStructuresSidebar,
  EchangesStructuresSubNavigation,
  EchangesStructuresContentRouter,
  type EchangesStructuresMainCategory,
} from '@/modules/echanges-structures';
import { useBMOStore } from '@/lib/stores';
import { coordinationStats } from '@/lib/data';

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
    { id: 'recent', label: 'Récents', badge: 5 },
  ],
  ouvert: [
    { id: 'all', label: 'Tous', badge: coordinationStats.echanges.ouverts },
    { id: 'demande_info', label: 'Demandes info' },
    { id: 'alerte_risque', label: 'Alertes risque', badgeType: 'critical' },
    { id: 'demande_validation', label: 'Demandes validation' },
    { id: 'signalement_blocage', label: 'Blocages', badgeType: 'warning' },
  ],
  en_traitement: [
    { id: 'all', label: 'Tous' },
    { id: 'urgente', label: 'Urgentes', badgeType: 'warning' },
    { id: 'normale', label: 'Normales' },
  ],
  escalade: [
    { id: 'all', label: 'Tous', badge: coordinationStats.echanges.escalades, badgeType: 'critical' },
    { id: 'critique', label: 'Critiques', badgeType: 'critical' },
    { id: 'urgente', label: 'Urgentes', badgeType: 'warning' },
  ],
  resolu: [
    { id: 'all', label: 'Tous' },
    { id: 'recent', label: 'Récents' },
    { id: 'archives', label: 'Archives' },
  ],
  critiques: [
    { id: 'all', label: 'Tous', badge: coordinationStats.echanges.critiques, badgeType: 'critical' },
    { id: 'en_retard', label: 'En retard', badgeType: 'critical' },
    { id: 'escalades', label: 'Escaladés', badgeType: 'critical' },
  ],
  en_retard: [
    { id: 'all', label: 'Tous', badge: coordinationStats.echanges.enRetard, badgeType: 'critical' },
    { id: 'critiques', label: 'Critiques', badgeType: 'critical' },
    { id: 'urgentes', label: 'Urgentes', badgeType: 'warning' },
  ],
  analytics: [
    { id: 'all', label: 'Tous' },
    { id: 'performance', label: 'Performance' },
    { id: 'trends', label: 'Tendances' },
  ],
  settings: [
    { id: 'all', label: 'Général' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'escalade', label: 'Escalade' },
  ],
};

// ================================
// Main Component
// ================================
export default function EchangesStructuresPage() {
  return <EchangesStructuresPageContent />;
}

function EchangesStructuresPageContent() {
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
    filters,
    setFilter,
    resetFilters,
  } = useEchangesStructuresCommandCenterStore();

  // État local pour refresh
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Navigation state (depuis le store)
  const activeCategory = navigation.mainCategory;
  const activeSubCategory = navigation.subCategory || 'all';

  // ================================
  // Computed values
  // ================================
  const stats = coordinationStats.echanges;

  const currentCategoryLabel = useMemo(() => {
    return echangesStructuresCategories.find((c) => c.id === activeCategory)?.label || 'Échanges Structurés';
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
      addActionLog({
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
        action: 'audit',
        module: 'echanges-structures',
        targetId: 'REFRESH',
        targetType: 'system',
        targetLabel: 'Rafraîchissement',
        details: 'Rafraîchissement manuel des échanges',
        bureau: 'BMO',
      });
    }, 1500);
  }, [addToast, addActionLog, currentUser]);

  const handleCategoryChange = useCallback(
    (category: string) => {
      navigate(category as EchangesStructuresMainCategory, 'all', null);
    },
    [navigate]
  );

  const handleSubCategoryChange = useCallback(
    (subCategory: string) => {
      navigate(activeCategory, subCategory, null);
    },
    [activeCategory, navigate]
  );

  const handleCreateEchange = useCallback(() => {
    openModal('create', {});
    addActionLog({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action: 'create',
      module: 'echanges-structures',
      targetId: 'NEW',
      targetType: 'EchangeStructure',
      details: 'Création nouvel échange structuré',
      bureau: 'BMO',
    });
  }, [openModal, addActionLog, currentUser]);

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
        goBack();
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
  }, [toggleCommandPalette, toggleFullscreen, toggleSidebar, goBack]);

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
      <EchangesStructuresSidebar
        activeCategory={activeCategory}
        activeSubCategory={activeSubCategory}
        collapsed={sidebarCollapsed}
        stats={{
          overview: stats.total || 0,
          ouvert: stats.ouverts || 0,
          escalade: stats.escalades || 0,
          resolu: stats.resolus || 0,
          critiques: stats.critiques || 0,
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
              <Mail className="h-5 w-5 text-blue-400" />
              <h1 className="text-base font-semibold text-slate-200">Échanges Structurés</h1>
              <Badge variant="default" className="text-xs bg-slate-800/50 text-slate-300 border-slate-700/50">
                v3.0
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
              {stats.escalades > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                  {stats.escalades > 9 ? '9+' : stats.escalades}
                </span>
              )}
            </Button>

            <div className="w-px h-4 bg-slate-700/50 mx-1" />

            {/* Create Button */}
            <Button
              variant="default"
              size="sm"
              onClick={handleCreateEchange}
              className="h-8 px-3 text-xs"
            >
              + Nouvel échange
            </Button>
          </div>
        </header>

        {/* Sub Navigation */}
        <EchangesStructuresSubNavigation
          mainCategory={activeCategory}
          subCategory={activeSubCategory}
          onSubCategoryChange={handleSubCategoryChange}
        />

        {/* KPI Bar */}
        {kpiConfig.visible && (
          <EchangesStructuresKPIBar
            visible={true}
            collapsed={kpiConfig.collapsed}
            onToggleCollapse={() => setKPIConfig({ collapsed: !kpiConfig.collapsed })}
            onRefresh={handleRefresh}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto">
            <EchangesStructuresContentRouter
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
              {stats.total} échanges • {stats.ouverts} ouverts • {stats.escalades} escaladés
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
              <span className="text-slate-500">{isRefreshing ? 'Synchronisation...' : 'Connecté'}</span>
            </div>
          </div>
        </footer>
      </div>

      <EchangesStructuresCommandPalette />

      {/* Notifications Panel */}
      {notificationsPanelOpen && (
        <NotificationsPanel onClose={toggleNotificationsPanel} stats={stats} />
      )}
    </div>
  );
}

// ================================
// Notifications Panel
// ================================
function NotificationsPanel({
  onClose,
  stats,
}: {
  onClose: () => void;
  stats: typeof coordinationStats.echanges;
}) {
  const notifications = [
    {
      id: '1',
      type: 'critical',
      title: `${stats.escalades} échange(s) escaladé(s)`,
      time: 'à l\'instant',
      read: false,
    },
    {
      id: '2',
      type: 'warning',
      title: `${stats.enRetard} échange(s) en retard`,
      time: 'il y a 5 min',
      read: false,
    },
    {
      id: '3',
      type: 'info',
      title: `${stats.ouverts} échange(s) ouvert(s)`,
      time: 'il y a 1h',
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
              {notifications.filter((n) => !n.read).length} nouvelles
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
