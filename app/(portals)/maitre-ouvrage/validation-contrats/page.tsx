'use client';

/**
 * Centre de Commandement Validation Contrats - Version 2.0
 * Architecture cohérente avec Analytics et Gouvernance
 * 
 * ARCHITECTURE:
 * - Sidebar collapsible avec 9 catégories
 * - Sub-navigation avec breadcrumb
 * - KPI Bar temps réel avec 8 indicateurs
 * - Content Router par catégorie
 * - Status Bar avec indicateurs
 * - Command Palette (⌘K)
 * - Panneau notifications
 * - Raccourcis clavier
 */

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  FileCheck,
  Search,
  Bell,
  ChevronLeft,
  RefreshCw,
  Plus,
  Download,
  Settings,
  MoreHorizontal,
  Filter,
  HelpCircle,
} from 'lucide-react';
import { useContratsWorkspaceStore } from '@/lib/stores/contratsWorkspaceStore';
import { useNotifications } from '@/hooks/useNotifications';
import {
  ValidationContratsKPIBar,
  ValidationContratsFiltersPanel,
  validationContratsCategories,
  type ValidationContratsFilters,
} from '@/components/features/bmo/validation-contrats/command-center';
import {
  ContratsSidebar,
  ContratsSubNavigation,
  ContratsContentRouter,
  getSubCategories,
  type ContratsMainCategory,
} from '@/modules/validation-contrats';
import { useContratsStats } from '@/modules/validation-contrats/hooks';
import { ContratsCommandPalette } from '@/components/features/bmo/workspace/contrats';
import { useContratToast } from '@/hooks/useContratToast';
import { ToastProvider } from '@/components/ui/toast';
import {
  ContratHelpModal,
} from '@/components/features/bmo/validation-contrats/modals';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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
    { id: 'dashboard', label: 'Tableau de bord' },
    { id: 'recent', label: 'Récents', badge: 8 },
  ],
  pending: [
    { id: 'all', label: 'Tous', badge: 12 },
    { id: 'priority', label: 'Prioritaires', badge: 5, badgeType: 'warning' },
    { id: 'standard', label: 'Standard', badge: 7 },
  ],
  urgent: [
    { id: 'all', label: 'Tous', badge: 3, badgeType: 'critical' },
    { id: 'overdue', label: 'En retard', badge: 1, badgeType: 'critical' },
    { id: 'due-today', label: 'Aujourd\'hui', badge: 2, badgeType: 'warning' },
  ],
  validated: [
    { id: 'all', label: 'Tous', badge: 45 },
    { id: 'today', label: 'Aujourd\'hui', badge: 8 },
    { id: 'this-week', label: 'Cette semaine', badge: 23 },
    { id: 'this-month', label: 'Ce mois', badge: 45 },
  ],
  rejected: [
    { id: 'all', label: 'Tous', badge: 8 },
    { id: 'recent', label: 'Récents', badge: 3 },
    { id: 'archived', label: 'Archivés' },
  ],
  negotiation: [
    { id: 'all', label: 'Tous', badge: 5 },
    { id: 'active', label: 'Actifs', badge: 3 },
    { id: 'pending-response', label: 'En attente', badge: 2 },
  ],
  analytics: [
    { id: 'overview', label: 'Vue d\'ensemble' },
    { id: 'trends', label: 'Tendances' },
    { id: 'performance', label: 'Performance' },
  ],
  financial: [
    { id: 'overview', label: 'Vue d\'ensemble' },
    { id: 'by-status', label: 'Par statut' },
    { id: 'by-period', label: 'Par période' },
  ],
  documents: [
    { id: 'all', label: 'Tous' },
    { id: 'pending', label: 'En attente' },
    { id: 'validated', label: 'Validés' },
  ],
};

// ================================
// Main Component
// ================================
function ValidationContratsPageContent() {
  const {
    commandPaletteOpen,
    setCommandPaletteOpen,
  } = useContratsWorkspaceStore();
  
  const toast = useContratToast();
  const {
    notifications: allNotifications,
    unreadCount,
    isLoading: notificationsLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllRead,
    refresh: refreshNotifications,
  } = useNotifications();

  // Navigation state
  const [activeCategory, setActiveCategory] = useState<ContratsMainCategory>('overview');
  // Initialiser avec la première sous-catégorie de 'overview'
  const [activeSubCategory, setActiveSubCategory] = useState<string | undefined>('indicateurs');
  const [activeSubSubCategory, setActiveSubSubCategory] = useState<string | undefined>(undefined);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Stats pour badges dynamiques
  const { data: stats } = useContratsStats();

  // UI state
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [kpiBarCollapsed, setKpiBarCollapsed] = useState(false);
  const [notificationsPanelOpen, setNotificationsPanelOpen] = useState(false);
  const [filtersPanelOpen, setFiltersPanelOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Modals state
  const [statsModalOpen, setStatsModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  
  // Filters state
  const [activeFilters, setActiveFilters] = useState<ValidationContratsFilters>({
    status: [],
    urgency: [],
    type: [],
    montantRange: { min: 0, max: 0 },
    dureeRange: { min: 0, max: 0 },
    dateRange: { start: '', end: '' },
    bureau: [],
    fournisseur: '',
    validations: {},
    clausesStatus: [],
  });

  // Navigation history for back button
  const [navigationHistory, setNavigationHistory] = useState<string[]>([]);

  // ================================
  // Computed values
  // ================================
  const currentCategoryLabel = useMemo(() => {
    return validationContratsCategories.find((c) => c.id === activeCategory)?.label || 'Validation Contrats';
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
      toast.syncSuccess();
    }, 1500);
  }, [toast]);

  const handleCategoryChange = useCallback((category: string) => {
    setNavigationHistory((prev) => [...prev, activeCategory]);
    const newCategory = category as ContratsMainCategory;
    setActiveCategory(newCategory);
    // Initialiser avec la première sous-catégorie
    const subCats = getSubCategories(newCategory);
    setActiveSubCategory(subCats.length > 0 ? subCats[0].id : undefined);
    setActiveSubSubCategory(undefined);
  }, [activeCategory]);

  const handleSubCategoryChange = useCallback((subCategory: string) => {
    setActiveSubCategory(subCategory);
    setActiveSubSubCategory(undefined); // Reset niveau 3 quand on change niveau 2
  }, []);

  const handleSubSubCategoryChange = useCallback((subSubCategory: string) => {
    setActiveSubSubCategory(subSubCategory);
  }, []);

  const handleGoBack = useCallback(() => {
    if (navigationHistory.length > 0) {
      const previousCategory = navigationHistory[navigationHistory.length - 1];
      setNavigationHistory((prev) => prev.slice(0, -1));
      setActiveCategory(previousCategory as ContratsMainCategory);
      setActiveSubCategory('all');
    }
  }, [navigationHistory]);

  const handleApplyFilters = useCallback((filters: ValidationContratsFilters) => {
    setActiveFilters(filters);
    
    // Compter le nombre de filtres actifs
    let count = 0;
    count += filters.status.length;
    count += filters.urgency.length;
    count += filters.type.length;
    count += filters.bureau.length;
    count += filters.clausesStatus.length;
    if (filters.montantRange.min > 0 || filters.montantRange.max > 0) count++;
    if (filters.dureeRange.min > 0 || filters.dureeRange.max > 0) count++;
    if (filters.dateRange.start || filters.dateRange.end) count++;
    if (filters.fournisseur) count++;
    count += Object.values(filters.validations).filter(Boolean).length;
    
    if (count > 0) {
      toast.filtersApplied(count);
    } else {
      toast.filtersCleared();
    }
    
    // TODO: Appliquer les filtres au contenu
    console.log('Filtres appliqués:', filters);
  }, [toast]);

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
        setExportModalOpen(true);
        return;
      }

      // F11 : Fullscreen
      if (e.key === 'F11') {
        e.preventDefault();
        setIsFullScreen((prev) => !prev);
        return;
      }

      // F1 : Help
      if (e.key === 'F1') {
        e.preventDefault();
        setHelpModalOpen(true);
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

      // Ctrl+F : Toggle filters
      if (isMod && e.key === 'f') {
        e.preventDefault();
        setFiltersPanelOpen((prev) => !prev);
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleGoBack, setCommandPaletteOpen]);

  // ================================
  // Render
  // ================================
  return (
    <div
      className={cn(
        'flex h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden',
        isFullScreen && 'fixed inset-0 z-50'
      )}
    >
      {/* Sidebar Navigation */}
      <ContratsSidebar
        activeCategory={activeCategory}
        activeSubCategory={activeSubCategory}
        collapsed={sidebarCollapsed}
        stats={stats ? {
          enAttente: stats.enAttente,
          urgents: stats.urgents,
          valides: stats.valides,
          rejetes: stats.rejetes,
          negociation: stats.negociation,
        } : undefined}
        onCategoryChange={(category, subCategory) => {
          setActiveCategory(category as ContratsMainCategory);
          // Si une sous-catégorie est fournie, l'utiliser, sinon prendre la première
          if (subCategory) {
            setActiveSubCategory(subCategory);
          } else {
            const subCats = getSubCategories(category as ContratsMainCategory);
            setActiveSubCategory(subCats.length > 0 ? subCats[0].id : undefined);
          }
          setActiveSubSubCategory(undefined);
        }}
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
              <FileCheck className="h-5 w-5 text-purple-400" />
              <h1 className="text-base font-semibold text-slate-200">Validation Contrats</h1>
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
              onClick={() => setCommandPaletteOpen(true)}
              className="h-8 px-3 text-slate-500 hover:text-slate-300 hover:bg-slate-800/50"
            >
              <Search className="h-4 w-4 mr-2" />
              <span className="text-xs hidden sm:inline">Rechercher</span>
              <kbd className="ml-2 text-xs bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded hidden sm:inline">
                ⌘K
              </kbd>
            </Button>

            <div className="w-px h-4 bg-slate-700/50 mx-1" />

            {/* Filters Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFiltersPanelOpen((prev) => !prev)}
              className={cn(
                'h-8 px-3 relative',
                filtersPanelOpen
                  ? 'text-slate-200 bg-slate-800/50'
                  : 'text-slate-500 hover:text-slate-300'
              )}
            >
              <Filter className="h-4 w-4 mr-1" />
              <span className="text-xs hidden sm:inline">Filtres</span>
              {(activeFilters.status.length > 0 || activeFilters.urgency.length > 0) && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-purple-500 rounded-full text-xs text-white flex items-center justify-center">
                  {activeFilters.status.length + activeFilters.urgency.length}
                </span>
              )}
            </Button>

            {/* New Contract Button */}
            <Button
              variant="ghost"
              size="sm"
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
                5
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
                <DropdownMenuItem onClick={() => setExportModalOpen(true)}>
                  <Download className="h-4 w-4 mr-2" />
                  Exporter
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setStatsModalOpen(true)}>
                  <Settings className="h-4 w-4 mr-2" />
                  Statistiques
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setHelpModalOpen(true)}>
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Aide (F1)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Sub Navigation */}
        <ContratsSubNavigation
          mainCategory={activeCategory}
          subCategory={activeSubCategory}
          subSubCategory={activeSubSubCategory}
          onSubCategoryChange={handleSubCategoryChange}
          onSubSubCategoryChange={handleSubSubCategoryChange}
          stats={stats ? {
            enAttente: stats.enAttente,
            urgents: stats.urgents,
            valides: stats.valides,
            rejetes: stats.rejetes,
            negociation: stats.negociation,
          } : undefined}
        />

        {/* KPI Bar */}
        <ValidationContratsKPIBar
          visible={true}
          collapsed={kpiBarCollapsed}
          onToggleCollapse={() => setKpiBarCollapsed((prev) => !prev)}
          onRefresh={handleRefresh}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-hidden">
          <div className="h-full overflow-x-hidden overflow-y-auto p-4">
            <ContratsContentRouter
              mainCategory={activeCategory}
              subCategory={activeSubCategory}
              subSubCategory={activeSubSubCategory}
            />
          </div>
        </main>

        {/* Status Bar */}
        <footer className="flex items-center justify-between px-4 py-1.5 border-t border-slate-800/50 bg-slate-900/60 text-xs">
          <div className="flex items-center gap-4">
            <span className="text-slate-600">MàJ: {formatLastUpdate()}</span>
            <span className="text-slate-700">•</span>
            <span className="text-slate-600">
              73 contrats • 12 en attente • 87% validés
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
        <ContratsCommandPalette
          open={commandPaletteOpen}
          onClose={() => setCommandPaletteOpen(false)}
          onOpenStats={() => setStatsModalOpen(true)}
          onOpenExport={() => setExportModalOpen(true)}
          onRefresh={handleRefresh}
        />
      )}

      {/* Notifications Panel */}
      {notificationsPanelOpen && (
        <NotificationsPanel
          onClose={() => setNotificationsPanelOpen(false)}
          notifications={allNotifications}
          unreadCount={unreadCount}
          isLoading={notificationsLoading}
          onMarkAsRead={markAsRead}
          onMarkAllAsRead={markAllAsRead}
          onDeleteNotification={deleteNotification}
          onDeleteAllRead={deleteAllRead}
          onRefresh={refreshNotifications}
        />
      )}

      {/* Filters Panel */}
      {filtersPanelOpen && (
        <ValidationContratsFiltersPanel
          isOpen={filtersPanelOpen}
          onClose={() => setFiltersPanelOpen(false)}
          onApplyFilters={handleApplyFilters}
          currentFilters={activeFilters}
        />
      )}

      {/* Help Modal */}
      <ContratHelpModal
        open={helpModalOpen}
        onClose={() => setHelpModalOpen(false)}
      />
    </div>
  );
}

// ================================
// Notifications Panel
// ================================
interface NotificationsPanelProps {
  onClose: () => void;
  notifications: any[];
  unreadCount: number;
  isLoading: boolean;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDeleteNotification: (id: string) => void;
  onDeleteAllRead: () => void;
  onRefresh: () => void;
}

function NotificationsPanel({
  onClose,
  notifications,
  unreadCount,
  isLoading,
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteNotification,
  onDeleteAllRead,
  onRefresh,
}: NotificationsPanelProps) {
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
            {unreadCount > 0 && (
              <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">
                {unreadCount} nouvelle{unreadCount > 1 ? 's' : ''}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
              className="h-7 w-7 p-0 text-slate-500 hover:text-slate-300"
              title="Actualiser"
            >
              <RefreshCw className={cn('h-3.5 w-3.5', isLoading && 'animate-spin')} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-7 w-7 p-0 text-slate-500 hover:text-slate-300"
            >
              ×
            </Button>
          </div>
        </div>

        {isLoading && notifications.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-sm text-slate-400">Chargement...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Bell className="h-12 w-12 text-slate-600 mx-auto mb-2" />
              <p className="text-sm text-slate-400">Aucune notification</p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-x-hidden overflow-y-auto divide-y divide-slate-800/50">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={cn(
                    'px-4 py-3 hover:bg-slate-800/30 transition-colors group relative',
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
                          : notif.type === 'success'
                          ? 'bg-emerald-500'
                          : 'bg-blue-500'
                      )}
                    />
                    <div className="min-w-0 flex-1">
                      <p
                        className={cn(
                          'text-sm',
                          !notif.read ? 'text-slate-200 font-medium' : 'text-slate-400'
                        )}
                      >
                        {notif.title}
                      </p>
                      {notif.message && (
                        <p className="text-xs text-slate-500 mt-0.5">{notif.message}</p>
                      )}
                      <p className="text-xs text-slate-600 mt-0.5">{notif.time}</p>
                    </div>
                    
                    {/* Actions on hover */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      {!notif.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onMarkAsRead(notif.id)}
                          className="h-6 w-6 p-0 text-slate-500 hover:text-slate-300"
                          title="Marquer comme lu"
                        >
                          ✓
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteNotification(notif.id)}
                        className="h-6 w-6 p-0 text-slate-500 hover:text-red-400"
                        title="Supprimer"
                      >
                        ×
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-slate-800/50 space-y-2">
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-slate-700 text-slate-400"
                  onClick={onMarkAllAsRead}
                >
                  Tout marquer comme lu
                </Button>
              )}
              {notifications.some((n) => n.read) && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-slate-700 text-slate-400"
                  onClick={onDeleteAllRead}
                >
                  Supprimer notifications lues
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default function ValidationContratsPage() {
  return (
    <ToastProvider>
      <ValidationContratsPageContent />
    </ToastProvider>
  );
}
