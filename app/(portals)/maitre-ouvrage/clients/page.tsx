'use client';

/**
 * Centre de Commandement Clients - Version 2.0
 * Plateforme de gestion du portefeuille clients
 * Architecture cohérente avec les pages Gouvernance et Analytics
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
  RefreshCw,
  Plus,
  Download,
  Settings,
  MoreHorizontal,
} from 'lucide-react';
import { useClientsWorkspaceStore, subCategoriesMap } from '@/lib/stores/clientsWorkspaceStore';
import { useBMOStore } from '@/lib/stores';
import {
  ClientsKPIBar,
  ClientsFiltersPanel,
  clientsCategories,
} from '@/components/features/bmo/clients/command-center';
// New 3-level navigation module
import {
  ClientsSidebar,
  ClientsSubNavigation,
  ClientsContentRouter,
  type ClientsMainCategory,
} from '@/modules/clients';
import {
  ClientsCommandPalette,
  ClientsStatsModal,
} from '@/components/features/bmo/workspace/clients';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { NotificationsPanel } from '@/components/shared/NotificationsPanel';

// Pattern Modal Overlay
import { GenericDetailModal, type ActionButton, type TabConfig } from '@/components/ui/GenericDetailModal';
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  DollarSign,
  Edit,
  Trash2,
} from 'lucide-react';

// ================================
// Main Component
// ================================
export default function ClientsPage() {
  const { addToast, currentUser, addActionLog } = useBMOStore();
  const {
    activeCategory,
    activeSubCategory,
    sidebarCollapsed,
    navigationHistory,
    setActiveCategory,
    setActiveSubCategory,
    toggleSidebarCollapsed,
    goBack,
    commandPaletteOpen,
    setCommandPaletteOpen,
    statsModalOpen,
    setStatsModalOpen,
    notificationsPanelOpen,
    setNotificationsPanelOpen,
    filtersPanelOpen,
    setFiltersPanelOpen,
    kpiBarCollapsed,
    setKpiBarCollapsed,
    isFullScreen,
    toggleFullScreen,
  } = useClientsWorkspaceStore();

  // UI state
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});
  
  // Pattern Modal Overlay - Détails client
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [selectedClient, setSelectedClient] = useState<any>(null);

  // ================================
  // Computed values
  // ================================
  const currentCategoryLabel = useMemo(() => {
    return clientsCategories.find((c) => c.id === activeCategory)?.label || 'Clients';
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
    addActionLog({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action: 'audit',
      module: 'clients',
      targetId: 'REFRESH',
      targetType: 'system',
      targetLabel: 'Rafraîchissement',
      details: 'Rafraîchissement manuel des données clients',
      bureau: 'BMO',
    });
    setTimeout(() => {
      setIsRefreshing(false);
      setLastUpdate(new Date());
      addToast('Données clients rafraîchies', 'success');
    }, 1500);
  }, [addToast, addActionLog, currentUser]);

  const handleCategoryChange = useCallback((category: string, subCategory?: string) => {
    if (category !== activeCategory) {
      setActiveCategory(category);
      setActiveSubCategory(subCategory || 'all');
    } else if (subCategory) {
      setActiveSubCategory(subCategory);
    }
  }, [activeCategory, setActiveCategory, setActiveSubCategory]);

  const handleSubCategoryChange = useCallback((subCategory: string) => {
    setActiveSubCategory(subCategory);
  }, [setActiveSubCategory]);

  const handleSubSubCategoryChange = useCallback((subSubCategory: string) => {
    // Level 3 navigation - to be implemented if needed
    console.log('Sub-sub category changed:', subSubCategory);
  }, []);

  const handleApplyFilters = useCallback((filters: Record<string, string[]>) => {
    setActiveFilters(filters);
    const totalFilters = Object.values(filters).reduce((acc, arr) => acc + arr.length, 0);
    if (totalFilters > 0) {
      addToast(`${totalFilters} filtre(s) appliqué(s)`, 'info');
    }
  }, [addToast]);

  const handleExport = useCallback(() => {
    addToast('Export des données clients en cours...', 'info');
    setTimeout(() => addToast('Export généré avec succès', 'success'), 1500);
  }, [addToast]);
  
  // Pattern Modal Overlay Handlers
  const handleViewClient = useCallback((client: any) => {
    setSelectedClient(client);
    setSelectedClientId(client.id);
  }, []);

  const handleEditClient = useCallback((client: any) => {
    console.log('Edit client:', client);
    setSelectedClientId(null);
  }, []);

  const handleDeleteClient = useCallback((id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
      console.log('Delete client:', id);
      setSelectedClientId(null);
    }
  }, []);

  // Actions pour GenericDetailModal
  const clientActions = useMemo<ActionButton[]>(() => {
    if (!selectedClient) return [];

    const acts: ActionButton[] = [];

    acts.push({
      id: 'edit',
      label: 'Modifier',
      variant: 'default',
      icon: <Edit className="w-4 h-4" />,
      onClick: () => handleEditClient(selectedClient),
    });

    acts.push({
      id: 'delete',
      label: 'Supprimer',
      variant: 'destructive',
      icon: <Trash2 className="w-4 h-4" />,
      onClick: () => {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
          handleDeleteClient(selectedClient.id);
        }
      },
    });

    acts.push({
      id: 'view-projects',
      label: 'Voir les projets',
      variant: 'outline',
      icon: <Briefcase className="w-4 h-4" />,
      onClick: () => console.log('View projects'),
    });

    return acts;
  }, [selectedClient, handleEditClient, handleDeleteClient]);

  // Tabs pour GenericDetailModal
  const clientTabs = useMemo<TabConfig[]>(() => {
    if (!selectedClient) return [];

    return [
      {
        id: 'coordonnees',
        label: 'Coordonnées',
        icon: <Mail className="w-4 h-4" />,
        content: (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Email</h4>
                <p className="text-sm text-gray-900 dark:text-white">{selectedClient.email || 'N/A'}</p>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Téléphone</h4>
                <p className="text-sm text-gray-900 dark:text-white">{selectedClient.phone || 'N/A'}</p>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Adresse</h4>
                <p className="text-sm text-gray-900 dark:text-white">{selectedClient.address || 'N/A'}</p>
              </div>
            </div>
          </div>
        ),
      },
      {
        id: 'commercial',
        label: 'Informations commerciales',
        icon: <Briefcase className="w-4 h-4" />,
        content: (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Type</h4>
                <p className="text-sm text-gray-900 dark:text-white">{selectedClient.type || 'Entreprise'}</p>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Secteur</h4>
                <p className="text-sm text-gray-900 dark:text-white">{selectedClient.sector || 'BTP'}</p>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Client depuis</h4>
                <p className="text-sm text-gray-900 dark:text-white">
                  {selectedClient.since ? new Date(selectedClient.since).toLocaleDateString('fr-FR') : 'N/A'}
                </p>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Chiffre d'affaires</h4>
                <p className="text-sm text-gray-900 dark:text-white">
                  {selectedClient.revenue ? `${(selectedClient.revenue / 1000000).toFixed(1)}M XOF` : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        ),
      },
      {
        id: 'projets',
        label: 'Projets',
        icon: <Briefcase className="w-4 h-4" />,
        content: (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Projets actifs</h4>
                <p className="text-sm text-gray-900 dark:text-white">{selectedClient.activeProjects || '0'}</p>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Projets terminés</h4>
                <p className="text-sm text-gray-900 dark:text-white">{selectedClient.completedProjects || '0'}</p>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Budget total</h4>
                <p className="text-sm text-gray-900 dark:text-white">
                  {selectedClient.totalBudget ? `${(selectedClient.totalBudget / 1000000).toFixed(1)}M XOF` : 'N/A'}
                </p>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Satisfaction</h4>
                <p className="text-sm text-gray-900 dark:text-white">
                  {selectedClient.satisfaction ? `${selectedClient.satisfaction}%` : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        ),
      },
    ];
  }, [selectedClient]);

  // StatusBadge pour GenericDetailModal
  const statusBadge = useMemo(() => {
    if (!selectedClient?.status) return undefined;
    
    const getVariant = (status: string) => {
      if (status === 'Actif') return 'success' as const;
      if (status === 'Inactif') return 'default' as const;
      if (status === 'VIP') return 'info' as const;
      return 'default' as const;
    };

    return {
      label: selectedClient.status,
      variant: getVariant(selectedClient.status),
    };
  }, [selectedClient?.status]);

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
        handleExport();
        return;
      }

      // F11 : Fullscreen
      if (e.key === 'F11') {
        e.preventDefault();
        toggleFullScreen();
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
        toggleSidebarCollapsed();
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
  }, [
    setCommandPaletteOpen,
    toggleFullScreen,
    goBack,
    toggleSidebarCollapsed,
    handleRefresh,
    handleExport,
  ]);

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
      {/* Sidebar Navigation - 3-level */}
      <ClientsSidebar
        activeCategory={activeCategory}
        activeSubCategory={activeSubCategory}
        collapsed={sidebarCollapsed}
        stats={{
          active: 120,
          inactive: 36,
          vip: 8,
          prospects: 45,
        }}
        onCategoryChange={handleCategoryChange}
        onToggleCollapse={toggleSidebarCollapsed}
        onOpenCommandPalette={() => setCommandPaletteOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar */}
        <header className="flex items-center justify-between px-4 py-2 border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            {/* Back Button */}
            {navigationHistory?.length > 0 && (
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
              <Users className="h-5 w-5 text-cyan-400" />
              <h1 className="text-base font-semibold text-slate-200">Gestion Clients</h1>
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
            {/* Search Button */}
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

            {/* New Client Button */}
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
              onClick={() => setNotificationsPanelOpen(!notificationsPanelOpen)}
              className={cn(
                'h-8 w-8 p-0 relative',
                notificationsPanelOpen
                  ? 'text-slate-200 bg-slate-800/50'
                  : 'text-slate-500 hover:text-slate-300'
              )}
              title="Notifications"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-cyan-500 rounded-full text-xs text-white flex items-center justify-center">
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
                <DropdownMenuItem onClick={() => setFiltersPanelOpen(true)}>
                  <Settings className="h-4 w-4 mr-2" />
                  Filtres avancés
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExport}>
                  <Download className="h-4 w-4 mr-2" />
                  Exporter
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setStatsModalOpen(true)}>
                  <Settings className="h-4 w-4 mr-2" />
                  Statistiques
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Sub Navigation - Level 2 & 3 */}
        <ClientsSubNavigation
          mainCategory={activeCategory as ClientsMainCategory}
          subCategory={activeSubCategory}
          subSubCategory={undefined}
          onSubCategoryChange={handleSubCategoryChange}
          onSubSubCategoryChange={handleSubSubCategoryChange}
          stats={{
            active: 120,
            inactive: 36,
            vip: 8,
            prospects: 45,
          }}
        />

        {/* KPI Bar */}
        <ClientsKPIBar
          visible={true}
          collapsed={kpiBarCollapsed}
          onToggleCollapse={() => setKpiBarCollapsed(!kpiBarCollapsed)}
          onRefresh={handleRefresh}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-hidden">
          <div className="h-full overflow-x-hidden overflow-y-auto p-4">
            <ClientsContentRouter
              mainCategory={activeCategory as ClientsMainCategory}
              subCategory={activeSubCategory}
              subSubCategory={undefined}
            />
          </div>
        </main>

        {/* Status Bar */}
        <footer className="flex items-center justify-between px-4 py-1.5 border-t border-slate-800/50 bg-slate-900/60 text-xs">
          <div className="flex items-center gap-4">
            <span className="text-slate-600">MàJ: {formatLastUpdate()}</span>
            <span className="text-slate-700">•</span>
            <span className="text-slate-600">
              156 clients • 12 prospects • 3 litiges
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
      <ClientsCommandPalette
        open={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onOpenStats={() => setStatsModalOpen(true)}
        onRefresh={handleRefresh}
      />

      {/* Modals */}
      <ClientsStatsModal open={statsModalOpen} onClose={() => setStatsModalOpen(false)} />

      {/* Notifications Panel */}
      {notificationsPanelOpen && (
        <NotificationsPanel 
          isOpen={notificationsPanelOpen}
          onClose={() => setNotificationsPanelOpen(false)}
          moduleName="Clients"
        />
      )}

      {/* Filters Panel */}
      <ClientsFiltersPanel
        isOpen={filtersPanelOpen}
        onClose={() => setFiltersPanelOpen(false)}
        onApplyFilters={handleApplyFilters}
      />

      {/* Pattern Modal Overlay - Détails Client */}
      {selectedClient && (
        <GenericDetailModal
          isOpen={!!selectedClientId}
          onClose={() => {
            setSelectedClientId(null);
            setSelectedClient(null);
          }}
          title={selectedClient.name || 'Détails du client'}
          subtitle={selectedClient.id}
          statusBadge={statusBadge}
          tabs={clientTabs}
          defaultActiveTab="coordonnees"
          actions={clientActions}
        />
      )}
    </div>
  );
}

