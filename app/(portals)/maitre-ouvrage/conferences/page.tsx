'use client';

/**
 * Centre de Commandement Conférences - Version 2.0
 * Plateforme de gestion des conférences décisionnelles
 * Architecture cohérente avec Analytics et Gouvernance
 */

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Video,
  Search,
  Bell,
  ChevronLeft,
} from 'lucide-react';
import {
  useConferencesCommandCenterStore,
  type ConferencesMainCategory,
} from '@/lib/stores/conferencesCommandCenterStore';
import {
  ConferencesCommandSidebar,
  ConferencesSubNavigation,
  ConferencesKPIBar,
  ConferencesContentRouter,
  ConferencesCommandPalette,
  ConferencesModals,
  ConferencesDetailPanel,
  ConferencesBatchActionsBar,
  ConferencesFiltersPanel,
  ActionsMenu,
  conferencesCategories,
} from '@/components/features/bmo/conferences/command-center';
import { coordinationStats, conferencesDecisionnelles } from '@/lib/data';

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
  planned: [
    { id: 'all', label: 'Toutes' },
    { id: 'soon', label: 'Bientôt', badge: 0, badgeType: 'warning' },
    { id: 'today', label: "Aujourd'hui" },
    { id: 'week', label: 'Cette semaine' },
  ],
  ongoing: [
    { id: 'all', label: 'Toutes' },
    { id: 'active', label: 'Actives' },
    { id: 'starting', label: 'En début' },
  ],
  completed: [
    { id: 'all', label: 'Toutes' },
    { id: 'recent', label: 'Récentes' },
    { id: 'with-summary', label: 'Avec CR', badge: 0 },
  ],
  crisis: [
    { id: 'all', label: 'Toutes' },
    { id: 'active', label: 'Actives', badge: 0, badgeType: 'critical' },
    { id: 'resolved', label: 'Résolues' },
  ],
  arbitrage: [
    { id: 'all', label: 'Toutes' },
    { id: 'pending', label: 'En attente' },
    { id: 'resolved', label: 'Résolues' },
  ],
  revue_projet: [
    { id: 'all', label: 'Toutes' },
    { id: 'weekly', label: 'Hebdomadaires' },
    { id: 'monthly', label: 'Mensuelles' },
  ],
  comite_direction: [
    { id: 'all', label: 'Toutes' },
    { id: 'strategic', label: 'Stratégiques' },
    { id: 'operational', label: 'Opérationnelles' },
  ],
  resolution_blocage: [
    { id: 'all', label: 'Toutes' },
    { id: 'critical', label: 'Critiques', badge: 0, badgeType: 'critical' },
    { id: 'resolved', label: 'Résolues' },
  ],
};

// ================================
// Main Component
// ================================
export default function ConferencesPage() {
  return <ConferencesPageContent />;
}

function ConferencesPageContent() {
  const {
    navigation,
    fullscreen,
    sidebarCollapsed,
    commandPaletteOpen,
    notificationsPanelOpen,
    kpiConfig,
    navigationHistory,
    toggleFullscreen,
    toggleCommandPalette,
    toggleNotificationsPanel,
    toggleSidebar,
    goBack,
    navigate,
    setKPIConfig,
    filters,
    detailPanel,
    openDetailPanel,
    openModal,
    closeModal,
    modal,
  } = useConferencesCommandCenterStore();

  // État local pour refresh
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Navigation state (depuis le store)
  const activeCategory = navigation.mainCategory;
  const activeSubCategory = navigation.subCategory || 'all';

  // Stats pour la sidebar et KPI bar
  const stats = useMemo(() => {
    const baseStats = coordinationStats.conferences;
    const nowMs = Date.now();
    const DAY_MS = 24 * 60 * 60 * 1000;

    // Calculer les stats par type
    const typeStats = {
      crise: conferencesDecisionnelles.filter((c) => c.type === 'crise' && c.status === 'planifiee').length,
      arbitrage: conferencesDecisionnelles.filter((c) => c.type === 'arbitrage' && c.status === 'planifiee').length,
      revue_projet: conferencesDecisionnelles.filter((c) => c.type === 'revue_projet' && c.status === 'planifiee').length,
      comite_direction: conferencesDecisionnelles.filter((c) => c.type === 'comite_direction' && c.status === 'planifiee').length,
      resolution_blocage: conferencesDecisionnelles.filter((c) => c.type === 'resolution_blocage' && c.status === 'planifiee').length,
    };

    // Calculer en cours
    const enCours = conferencesDecisionnelles.filter((c) => c.status === 'en_cours').length;

    // Calculer critiques
    const critiques = conferencesDecisionnelles.filter(
      (c) => c.status === 'planifiee' && c.priority === 'critique'
    ).length;

    return {
      ...baseStats,
      enCours,
      crise: typeStats.crise,
      arbitrage: typeStats.arbitrage,
      revue_projet: typeStats.revue_projet,
      comite_direction: typeStats.comite_direction,
      resolution_blocage: typeStats.resolution_blocage,
      critiques,
      tauxParticipation: 85, // Placeholder
      tempsMoyen: 45, // Placeholder
    };
  }, []);

  // ================================
  // Computed values
  // ================================
  const currentCategoryLabel = useMemo(() => {
    return conferencesCategories.find((c) => c.id === activeCategory)?.label || 'Conférences';
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
    }, 1500);
  }, []);

  const handleCategoryChange = useCallback((category: string) => {
    navigate(category as ConferencesMainCategory, 'all', null);
  }, [navigate]);

  const handleSubCategoryChange = useCallback((subCategory: string) => {
    navigate(activeCategory, subCategory, null);
  }, [activeCategory, navigate]);

  const handleSelectConference = useCallback((id: string) => {
    openDetailPanel('conference', id, {});
  }, [openDetailPanel]);

  const handleBatchAction = useCallback((actionId: string, ids: string[]) => {
    switch (actionId) {
      case 'export':
        openModal('export', { selectedIds: ids });
        break;
      case 'view':
        if (ids.length > 0) {
          openModal('detail', { conferenceId: ids[0] });
        }
        break;
      case 'delete':
        openModal('confirm', {
          title: 'Supprimer les conférences',
          message: `Êtes-vous sûr de vouloir supprimer ${ids.length} conférence(s) ?`,
          variant: 'danger',
          onConfirm: async () => {
            // TODO: Implémenter suppression
            console.log('Suppression de', ids);
          },
        });
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
      {/* Sidebar Navigation */}
      <ConferencesCommandSidebar
        activeCategory={activeCategory}
        collapsed={sidebarCollapsed}
        onCategoryChange={handleCategoryChange}
        onToggleCollapse={toggleSidebar}
        onOpenCommandPalette={toggleCommandPalette}
        stats={stats}
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
              <Video className="h-5 w-5 text-purple-400" />
              <h1 className="text-base font-semibold text-slate-200">Conférences</h1>
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
            <ActionsMenu
              onRefresh={handleRefresh}
              isRefreshing={isRefreshing}
              fullscreen={fullscreen}
              onToggleFullscreen={toggleFullscreen}
              onToggleCommandPalette={toggleCommandPalette}
            />
          </div>
        </header>

        {/* Sub Navigation */}
        <ConferencesSubNavigation
          mainCategory={activeCategory}
          mainCategoryLabel={currentCategoryLabel}
          subCategory={activeSubCategory}
          subCategories={currentSubCategories}
          onSubCategoryChange={handleSubCategoryChange}
        />

        {/* KPI Bar */}
        {kpiConfig.visible && (
          <ConferencesKPIBar
            visible={true}
            collapsed={kpiConfig.collapsed}
            onToggleCollapse={() => setKPIConfig({ collapsed: !kpiConfig.collapsed })}
            onRefresh={handleRefresh}
            data={{
              total: stats.total,
              planifiees: stats.planifiees,
              enCours: stats.enCours,
              terminees: stats.terminees,
              critiques: stats.critiques,
              decisionsGenerees: stats.decisionsGenerees,
              tauxParticipation: stats.tauxParticipation,
              tempsMoyen: stats.tempsMoyen,
            }}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-hidden">
          <div className="h-full overflow-x-hidden overflow-y-auto">
            <ConferencesContentRouter
              category={activeCategory}
              subCategory={activeSubCategory}
              filters={filters}
              onSelectConference={handleSelectConference}
              selectedConferenceId={detailPanel.entityId}
            />
          </div>
        </main>

        {/* Status Bar */}
        <footer className="flex items-center justify-between px-4 py-1.5 border-t border-slate-800/50 bg-slate-900/60 text-xs">
          <div className="flex items-center gap-4">
            <span className="text-slate-600">MàJ: {formatLastUpdate()}</span>
            <span className="text-slate-700">•</span>
            <span className="text-slate-600">
              {stats.total} conférences • {stats.planifiees} planifiées • {stats.terminees} terminées
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
      {commandPaletteOpen && <ConferencesCommandPalette />}

      {/* Modals */}
      <ConferencesModals />

      {/* Detail Panel */}
      <ConferencesDetailPanel />

      {/* Batch Actions Bar */}
      <ConferencesBatchActionsBar onAction={handleBatchAction} />

      {/* Notifications Panel */}
      {notificationsPanelOpen && (
        <NotificationsPanel onClose={toggleNotificationsPanel} />
      )}

      {/* Filters Panel */}
      {modal.type === 'filters' && modal.isOpen && (
        <ConferencesFiltersPanel
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
      title: 'Conférence critique bientôt',
      time: 'il y a 15 min',
      read: false,
    },
    {
      id: '2',
      type: 'warning',
      title: 'Conférence planifiée sans participants',
      time: 'il y a 1h',
      read: false,
    },
    {
      id: '3',
      type: 'info',
      title: 'Nouveau compte-rendu disponible',
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
            <Bell className="h-4 w-4 text-purple-400" />
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
