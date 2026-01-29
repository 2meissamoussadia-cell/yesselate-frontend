'use client';

/**
 * Centre de Commandement Decisions - Version 2.0
 * Plateforme de gestion et suivi des décisions
 * Architecture cohérente avec la page Analytics
 */

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Gavel,
  Search,
  Bell,
  ChevronLeft,
} from 'lucide-react';
import {
  useDecisionsCommandCenterStore,
  type DecisionsMainCategory,
} from '@/lib/stores/decisionsCommandCenterStore';
import {
  DecisionsCommandSidebar,
  DecisionsSubNavigation,
  DecisionsKPIBar,
  DecisionsContentRouter,
  DecisionsModals,
  DecisionsDetailPanel,
  decisionsCategories,
} from '@/components/features/bmo/workspace/decisions/command-center';
import { DecisionsCommandPalette, DecisionsStatsModal, DecisionsDirectionPanel } from '@/components/features/bmo/workspace/decisions';
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
    { id: 'highlights', label: 'Points clés', badge: 5 },
  ],
  pending: [
    { id: 'all', label: 'Toutes', badge: 23 },
    { id: 'recent', label: 'Récentes', badge: 8 },
    { id: 'old', label: 'Anciennes', badge: 15, badgeType: 'warning' },
    { id: 'blocked', label: 'Bloquées', badge: 3, badgeType: 'critical' },
  ],
  critical: [
    { id: 'all', label: 'Toutes', badge: 7, badgeType: 'critical' },
    { id: 'immediate', label: 'Immédiates', badge: 3, badgeType: 'critical' },
    { id: 'urgent', label: 'Urgentes', badge: 4, badgeType: 'warning' },
  ],
  strategique: [
    { id: 'all', label: 'Toutes', badge: 12 },
    { id: 'pending', label: 'En attente', badge: 5, badgeType: 'warning' },
    { id: 'approved', label: 'Approuvées', badge: 7 },
  ],
  operationnel: [
    { id: 'all', label: 'Toutes', badge: 18 },
    { id: 'pending', label: 'En attente', badge: 8, badgeType: 'warning' },
    { id: 'approved', label: 'Approuvées', badge: 10 },
  ],
  approved: [
    { id: 'all', label: 'Toutes', badge: 45 },
    { id: 'today', label: "Aujourd'hui", badge: 12 },
    { id: 'this-week', label: 'Cette semaine', badge: 28 },
    { id: 'this-month', label: 'Ce mois', badge: 45 },
  ],
  history: [
    { id: 'all', label: 'Tout' },
    { id: 'recent', label: 'Récent' },
    { id: 'archived', label: 'Archivé' },
  ],
  analytics: [
    { id: 'overview', label: 'Vue d\'ensemble' },
    { id: 'performance', label: 'Performance' },
    { id: 'trends', label: 'Tendances' },
  ],
  types: [
    { id: 'strategique', label: 'Stratégiques', badge: 12 },
    { id: 'operationnel', label: 'Opérationnelles', badge: 18 },
    { id: 'financier', label: 'Financières', badge: 8 },
    { id: 'rh', label: 'RH', badge: 5 },
    { id: 'technique', label: 'Techniques', badge: 9 },
  ],
};

// ================================
// Main Component
// ================================
export default function DecisionsPage() {
  return <DecisionsPageContent />;
}

function DecisionsPageContent() {
  const { addToast, addActionLog, currentUser } = useBMOStore();
  const {
    navigation,
    fullscreen,
    sidebarCollapsed,
    commandPaletteOpen,
    kpiConfig,
    navigationHistory,
    modal,
    toggleFullscreen,
    toggleCommandPalette,
    toggleSidebar,
    goBack,
    openModal,
    closeModal,
    navigate,
    setKPIConfig,
  } = useDecisionsCommandCenterStore();

  // État local pour refresh
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [statsModalOpen, setStatsModalOpen] = useState(false);
  const [directionPanelOpen, setDirectionPanelOpen] = useState(false);

  // Navigation state (depuis le store)
  const activeCategory = navigation.mainCategory;
  const activeSubCategory = navigation.subCategory || 'all';

  // ================================
  // Computed values
  // ================================
  const currentCategoryLabel = useMemo(() => {
    return decisionsCategories.find((c) => c.id === activeCategory)?.label || 'Décisions';
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
    addToast('Données rafraîchies', 'success');
    addActionLog({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action: 'audit',
      module: 'decisions',
      targetId: 'REFRESH',
      targetType: 'system',
      targetLabel: 'Rafraîchissement',
      details: 'Rafraîchissement manuel des décisions',
      bureau: 'BMO',
    });
    setTimeout(() => {
      setIsRefreshing(false);
      setLastUpdate(new Date());
    }, 1500);
  }, [addToast, addActionLog, currentUser]);

  const handleCategoryChange = useCallback((category: string) => {
    navigate(category as DecisionsMainCategory, 'all', null);
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
        setStatsModalOpen(true);
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
  }, [toggleCommandPalette, toggleFullscreen, toggleSidebar, goBack, handleRefresh]);

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
      <DecisionsCommandSidebar
        activeCategory={activeCategory}
        collapsed={sidebarCollapsed}
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
              <Gavel className="h-5 w-5 text-rose-400" />
              <h1 className="text-base font-semibold text-slate-200">Décisions</h1>
              <Badge
                variant="default"
                className="text-xs bg-slate-800/50 text-slate-300 border-slate-700/50"
              >
                v2.0
              </Badge>
            </div>
          </div>

          {/* Actions */}
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
              onClick={() => setStatsModalOpen(true)}
              className="h-8 w-8 p-0 relative text-slate-500 hover:text-slate-300"
              title="Statistiques"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                3
              </span>
            </Button>
          </div>
        </header>

        {/* Sub Navigation */}
        <DecisionsSubNavigation
          mainCategory={activeCategory}
          mainCategoryLabel={currentCategoryLabel}
          subCategory={activeSubCategory}
          subCategories={currentSubCategories}
          onSubCategoryChange={handleSubCategoryChange}
        />

        {/* KPI Bar */}
        {kpiConfig.visible && (
          <DecisionsKPIBar
            visible={true}
            collapsed={kpiConfig.collapsed}
            onToggleCollapse={() => setKPIConfig({ collapsed: !kpiConfig.collapsed })}
            onRefresh={handleRefresh}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-hidden">
          <div className="h-full overflow-x-hidden overflow-y-auto">
            <DecisionsContentRouter
              category={activeCategory}
              subCategory={activeSubCategory}
            />
          </div>
        </main>

        {/* Status Bar */}
        <footer className="flex items-center justify-between px-4 py-1.5 border-t border-slate-800/50 bg-slate-900/60 text-xs">
          <div className="flex items-center gap-4">
            <span className="text-slate-600">MàJ: {formatLastUpdate()}</span>
            <span className="text-slate-700">•</span>
            <span className="text-slate-600">
              23 en attente • 7 critiques • 45 approuvées
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
        <DecisionsCommandPalette
          open={commandPaletteOpen}
          onClose={toggleCommandPalette}
          onOpenStats={() => setStatsModalOpen(true)}
          onRefresh={handleRefresh}
        />
      )}

      {/* Stats Modal */}
      {statsModalOpen && (
        <DecisionsStatsModal
          open={statsModalOpen}
          onClose={() => setStatsModalOpen(false)}
        />
      )}

      {/* Direction Panel */}
      {directionPanelOpen && (
        <DecisionsDirectionPanel
          open={directionPanelOpen}
          onClose={() => setDirectionPanelOpen(false)}
        />
      )}

      {/* Modals */}
      <DecisionsModals />

      {/* Detail Panel */}
      <DecisionsDetailPanel />
    </div>
  );
}
