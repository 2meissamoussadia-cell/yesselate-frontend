'use client';

/**
 * Centre de Commandement Audit - Version 3.0
 * Plateforme de surveillance et conformité système
 * Architecture cohérente avec la page Analytics et Gouvernance
 */

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Shield,
  Search,
  Bell,
  ChevronLeft,
} from 'lucide-react';
import {
  useAuditCommandCenterStore,
} from '@/lib/stores/auditCommandCenterStore';
import {
  AuditKPIBar,
  ActionsMenu,
  AuditModals,
  AuditDetailPanel,
  AuditFiltersPanel,
  auditCategories,
} from '@/components/features/bmo/audit/command-center';
// New 3-level navigation module
import {
  AuditSidebar,
  AuditSubNavigation,
  AuditContentRouter,
  type AuditMainCategory,
} from '@/modules/audit';
import { AuditCommandPalette } from '@/components/features/bmo/workspace/audit/AuditCommandPalette';
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
  events: [
    { id: 'all', label: 'Tous les événements', badge: 156 },
    { id: 'critical', label: 'Critiques', badge: 8, badgeType: 'critical' },
    { id: 'warning', label: 'Avertissements', badge: 24, badgeType: 'warning' },
    { id: 'info', label: 'Informatifs' },
    { id: 'resolved', label: 'Résolus' },
  ],
  security: [
    { id: 'all', label: 'Toutes', badge: 12 },
    { id: 'critical', label: 'Critiques', badge: 3, badgeType: 'critical' },
    { id: 'threats', label: 'Menaces', badge: 5, badgeType: 'warning' },
    { id: 'vulnerabilities', label: 'Vulnérabilités', badge: 4 },
  ],
  compliance: [
    { id: 'all', label: 'Tout', badge: 8 },
    { id: 'violations', label: 'Violations', badge: 2, badgeType: 'warning' },
    { id: 'checks', label: 'Vérifications' },
    { id: 'reports', label: 'Rapports' },
  ],
  performance: [
    { id: 'all', label: 'Tous' },
    { id: 'metrics', label: 'Métriques' },
    { id: 'alerts', label: 'Alertes', badge: 6, badgeType: 'warning' },
    { id: 'optimization', label: 'Optimisations' },
  ],
  'system-logs': [
    { id: 'all', label: 'Tous', badge: 234 },
    { id: 'errors', label: 'Erreurs', badge: 12, badgeType: 'warning' },
    { id: 'warnings', label: 'Avertissements', badge: 34 },
    { id: 'info', label: 'Info' },
  ],
  traceability: [
    { id: 'all', label: 'Tout' },
    { id: 'actions', label: 'Actions utilisateur' },
    { id: 'changes', label: 'Modifications', badge: 45 },
    { id: 'access', label: 'Accès' },
  ],
  reports: [
    { id: 'all', label: 'Tous', badge: 24 },
    { id: 'recent', label: 'Récents' },
    { id: 'scheduled', label: 'Planifiés' },
    { id: 'custom', label: 'Personnalisés' },
  ],
  settings: [
    { id: 'general', label: 'Général' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'retention', label: 'Rétention' },
    { id: 'exports', label: 'Exports' },
  ],
};

// ================================
// Main Component
// ================================
export default function AuditPage() {
  return <AuditPageContent />;
}

function AuditPageContent() {
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
  } = useAuditCommandCenterStore();

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
    return auditCategories.find((c) => c.id === activeCategory)?.label || 'Audit';
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
    navigate(category as AuditMainCategory, 'all', null);
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
      <AuditSidebar
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
              <Shield className="h-5 w-5 text-cyan-400" />
              <h1 className="text-base font-semibold text-slate-200">Audit & Traçabilité</h1>
              <Badge
                variant="default"
                className="text-xs bg-slate-800/50 text-slate-300 border-slate-700/50"
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
            <ActionsMenu onRefresh={handleRefresh} isRefreshing={isRefreshing} />
          </div>
        </header>

        {/* Sub Navigation - Level 2 & 3 */}
        <AuditSubNavigation
          mainCategory={activeCategory}
          subCategory={activeSubCategory}
          subSubCategory={navigation.filter || undefined}
          onSubCategoryChange={handleSubCategoryChange}
          onSubSubCategoryChange={(subSubCategory) => navigate(activeCategory, activeSubCategory, subSubCategory)}
          stats={{}}
        />

        {/* KPI Bar */}
        {kpiConfig.visible && (
          <AuditKPIBar
            visible={true}
            collapsed={kpiConfig.collapsed}
            onToggleCollapse={() => setKPIConfig({ collapsed: !kpiConfig.collapsed })}
            onRefresh={handleRefresh}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-hidden">
          <div className="h-full overflow-x-hidden overflow-y-auto">
            <AuditContentRouter
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
              156 événements • 12 alertes sécurité • 24 rapports
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
        <AuditCommandPalette
          open={commandPaletteOpen}
          onClose={toggleCommandPalette}
          onOpenStats={() => openModal('stats')}
          onRefresh={handleRefresh}
        />
      )}

      {/* Notifications Panel */}
      {notificationsPanelOpen && (
        <NotificationsPanel 
          isOpen={notificationsPanelOpen}
          onClose={toggleNotificationsPanel}
          moduleName="Audit"
        />
      )}

      {/* Modals */}
      <AuditModals />

      {/* Detail Panel */}
      <AuditDetailPanel />

      {/* Filters Panel */}
      {modal.type === 'filters' && modal.isOpen && (
        <AuditFiltersPanel
          isOpen={modal.isOpen}
          onClose={closeModal}
          onApplyFilters={(newFilters) => {
            // Convertir les filtres au format du store
            Object.entries(newFilters).forEach(([key, value]) => {
              if (Array.isArray(value)) {
                setFilter(key as keyof typeof filters, value);
              }
            });
            closeModal();
          }}
        />
      )}
    </div>
  );
}

