/**
 * Demandes - Command Center v3.0
 * Architecture identique à Governance/Dashboard
 * Gestion des demandes de validation BMO
 */

'use client';

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ChevronLeft,
  Bell,
  Search,
  FileCheck,
  MoreVertical,
  RefreshCw,
  Download,
  Settings,
  Maximize2,
  Keyboard,
} from 'lucide-react';
import { useDemandesCommandCenterStore } from '@/lib/stores/demandesCommandCenterStore';
import {
  DemandesKPIBar,
  DemandesSubNavigation,
  DemandesCommandPalette,
  DemandesModals,
  demandesSubCategoriesMap,
  demandesCategories,
} from '@/components/features/bmo/demandes/command-center';
// Nouveau module modulaire
import {
  DemandesSidebar as DemandesSidebarModule,
  DemandesSubNavigation as DemandesSubNavigationModule,
  DemandesContentRouter,
  useDemandesStats,
} from '@/modules/demandes';

export default function DemandesPage() {
  const {
    fullscreen,
    notificationsPanelOpen,
    liveStats,
    navigation,
    navigate,
    toggleFullscreen,
    toggleCommandPalette,
    toggleNotificationsPanel,
    goBack,
    navigationHistory,
    openModal,
    startRefresh,
    endRefresh,
    setLiveStats,
    sidebarCollapsed,
    toggleSidebar,
  } = useDemandesCommandCenterStore();

  // Utiliser les stats du nouveau module
  const { data: stats } = useDemandesStats();

  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Load initial stats (utiliser les stats du nouveau module si disponibles)
  useEffect(() => {
    if (stats) {
      setLiveStats({
        total: stats.total || 453,
        pending: stats.pending || 45,
        urgent: stats.urgent || 12,
        validated: stats.validated || 378,
        rejected: stats.rejected || 15,
        overdue: stats.overdue || 8,
        avgDelay: stats.avgResponseTime || 2.3,
        totalMontant: 125000000000,
      });
    } else {
      // Fallback si stats non disponibles
      setLiveStats({
        total: 453,
        pending: 45,
        urgent: 12,
        validated: 378,
        rejected: 15,
        overdue: 8,
        avgDelay: 2.3,
        totalMontant: 125000000000,
      });
    }
  }, [stats, setLiveStats]);

  // Gérer la navigation vers le nouveau module
  const handleCategoryChange = (category: string, subCategory?: string, subSubCategory?: string) => {
    // Mapper les catégories du nouveau module vers le store existant
    navigate(category as any, subCategory as any, subSubCategory || null);
  };

  // Gérer le changement de sub-category (niveau 2)
  const handleSubCategoryChange = (subCategory: string) => {
    navigate(navigation.mainCategory, subCategory as any, null);
  };

  // Gérer le changement de sub-sub-category (niveau 3)
  const handleSubSubCategoryChange = (subSubCategory: string) => {
    navigate(navigation.mainCategory, navigation.subCategory, subSubCategory);
  };

  const handleRefresh = () => {
    startRefresh();
    setTimeout(() => {
      endRefresh();
      setLastUpdate(new Date());
    }, 1500);
  };

  // Raccourcis clavier globaux
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K : Command Palette
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        toggleCommandPalette();
        return;
      }

      // Ctrl/Cmd + E : Export
      if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
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

      // Alt + Left : Back
      if (e.altKey && e.key === 'ArrowLeft') {
        e.preventDefault();
        goBack();
        return;
      }

      // ? : Help (when not in input)
      if (e.key === '?' && !e.ctrlKey && !e.altKey && !e.metaKey) {
        const target = e.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          openModal('shortcuts');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleCommandPalette, toggleFullscreen, goBack, openModal]);

  const formatLastUpdate = () => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastUpdate.getTime()) / 1000);
    if (diff < 60) return 'à l\'instant';
    if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
    return `il y a ${Math.floor(diff / 3600)}h`;
  };

  return (
    <div
      className={cn(
        'flex h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden',
        fullscreen && 'fixed inset-0 z-50'
      )}
    >
      {/* Sidebar Navigation - Nouveau module */}
      <DemandesSidebarModule
        activeCategory={navigation.mainCategory}
        activeSubCategory={navigation.subCategory}
        collapsed={sidebarCollapsed}
        stats={{
          pending: liveStats.pending || 45,
          urgent: liveStats.urgent || 12,
          overdue: liveStats.overdue || 8,
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
              <FileCheck className="h-5 w-5 text-orange-400" />
              <h1 className="text-base font-semibold text-slate-200">
                Demandes
              </h1>
              <Badge
                variant="default"
                className="text-xs bg-orange-500/10 text-orange-400 border-orange-500/30"
              >
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
                  ? 'text-orange-400 bg-slate-800/50'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
              )}
              title="Notifications"
            >
              <Bell className="h-4 w-4" />
              {liveStats.urgent > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                  {liveStats.urgent}
                </span>
              )}
            </Button>

            {/* Actions Menu */}
            <ActionsMenu onRefresh={handleRefresh} isRefreshing={liveStats.isRefreshing} />
          </div>
        </header>

        {/* Sub Navigation - Nouveau module (niveaux 2 et 3) */}
        <DemandesSubNavigationModule
          mainCategory={navigation.mainCategory as any}
          subCategory={navigation.subCategory || undefined}
          subSubCategory={navigation.subSubCategory || undefined}
          onSubCategoryChange={handleSubCategoryChange}
          onSubSubCategoryChange={handleSubSubCategoryChange}
          stats={{
            pending: liveStats.pending || 45,
            urgent: liveStats.urgent || 12,
            overdue: liveStats.overdue || 8,
          }}
        />

        {/* KPI Bar */}
        <DemandesKPIBar
          data={{
            totalDemandes: liveStats.total || 0,
            newToday: 0, // TODO: Calculate from liveStats or API
            pendingCount: liveStats.pending || 0,
            urgentCount: liveStats.urgent || 0,
            avgResponseTime: liveStats.avgDelay || 0,
            approvalRate: liveStats.total > 0 ? Math.round((liveStats.validated / liveStats.total) * 100) : 0,
            completionRate: liveStats.total > 0 ? Math.round(((liveStats.validated + liveStats.rejected) / liveStats.total) * 100) : 0,
            satisfactionScore: 4.2, // TODO: Get from API
            trends: {
              total: 'stable',
              pending: 'stable',
              urgent: 'stable',
              satisfaction: 'stable',
            },
          }}
        />

        {/* Main Content - Nouveau module */}
        <main className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto">
            <DemandesContentRouter
              mainCategory={navigation.mainCategory as any}
              subCategory={navigation.subCategory}
              subSubCategory={navigation.subSubCategory || undefined}
            />
          </div>
        </main>

        {/* Status Bar */}
        <footer className="flex items-center justify-between px-4 py-1.5 border-t border-slate-800/50 bg-slate-900/60 text-xs">
          <div className="flex items-center gap-4">
            <span className="text-slate-600">
              Màj: {formatLastUpdate()}
            </span>
            <span className="text-slate-700">•</span>
            <span className="text-slate-600">
              {liveStats.total} demandes • {liveStats.pending} en attente • {liveStats.urgent} urgentes
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
                {liveStats.isRefreshing ? 'Synchronisation...' : 'Connecté'}
              </span>
            </div>
          </div>
        </footer>
      </div>

      {/* Modals */}
      <DemandesModals />

      {/* Command Palette */}
      <DemandesCommandPalette />

      {/* Notifications Panel */}
      {notificationsPanelOpen && (
        <NotificationsPanel onClose={toggleNotificationsPanel} />
      )}
    </div>
  );
}

// Actions Menu Component
function ActionsMenu({
  onRefresh,
  isRefreshing,
}: {
  onRefresh: () => void;
  isRefreshing: boolean;
}) {
  const { toggleFullscreen, openModal } = useDemandesCommandCenterStore();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(!open)}
        className="h-8 w-8 p-0 text-slate-500 hover:text-slate-300"
      >
        <MoreVertical className="h-4 w-4" />
      </Button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 w-48 rounded-lg bg-slate-900 border border-slate-700/50 shadow-xl z-50 py-1">
            <button
              onClick={() => {
                onRefresh();
                setOpen(false);
              }}
              disabled={isRefreshing}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800/50"
            >
              <RefreshCw className={cn('w-4 h-4', isRefreshing && 'animate-spin')} />
              Rafraîchir
            </button>
            <button
              onClick={() => {
                openModal('export');
                setOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800/50"
            >
              <Download className="w-4 h-4" />
              Exporter
            </button>
            <div className="border-t border-slate-700/50 my-1" />
            <button
              onClick={() => {
                toggleFullscreen();
                setOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800/50"
            >
              <Maximize2 className="w-4 h-4" />
              Plein écran
            </button>
            <button
              onClick={() => {
                openModal('shortcuts');
                setOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800/50"
            >
              <Keyboard className="w-4 h-4" />
              Raccourcis
            </button>
            <button
              onClick={() => {
                openModal('settings');
                setOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800/50"
            >
              <Settings className="w-4 h-4" />
              Paramètres
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// Notifications Panel
function NotificationsPanel({ onClose }: { onClose: () => void }) {
  const notifications = [
    {
      id: '1',
      type: 'critical',
      title: 'BC-2024-0892 en retard critique',
      time: 'il y a 15 min',
      read: false,
    },
    {
      id: '2',
      type: 'warning',
      title: 'Nouvelle demande urgente',
      time: 'il y a 1h',
      read: false,
    },
    {
      id: '3',
      type: 'info',
      title: 'BC-2024-0845 validé',
      time: 'il y a 2h',
      read: true,
    },
  ];

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />

      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 w-80 bg-slate-900 border-l border-slate-700/50 z-50 flex flex-col">
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
