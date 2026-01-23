'use client';

/**
 * Centre de Commandement Validation-BC - Version 2.0
 * Architecture cohérente avec Alerts et Gouvernance
 * Navigation à 3 niveaux: Sidebar + SubNavigation + KPIBar
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Nouvelle navigation hiérarchique
import { ValidationSidebar } from '@/modules/validation-bc/navigation/ValidationSidebar';
import {
  ValidationSubNavigation,
  ValidationContentRouter,
  KpiPanel,
  FilterBar,
  ValidationHeader,
  ValidationCommandPalette,
} from '@/modules/validation-bc/components';
import { findNavNodeById } from '@/modules/validation-bc/navigation/validationNavigationConfig';
import {
  useValidationBCCommandCenterStore,
  type ValidationBCMainCategory,
  type ValidationBCSubCategory,
} from '@/lib/stores/validationBCCommandCenterStore';
import { useValidationStats } from '@/modules/validation-bc/hooks';

import {
  FileCheck,
  Search,
  Bell,
  ChevronLeft,
  RefreshCw,
  MoreHorizontal,
  Maximize2,
  Minimize2,
  Filter,
  Settings,
  Keyboard,
  Download,
  BarChart3,
  Activity,
} from 'lucide-react';
import { NotificationsPanel } from '@/components/shared/NotificationsPanel';

// ================================
// Main Component
// ================================
function ValidationBCPageContent() {
  const router = useRouter();
  const pathname = usePathname();

  // Nouvelle navigation avec store Zustand
  const {
    navigation,
    sidebarCollapsed,
    kpiBarCollapsed,
    filtersPanelOpen,
    fullscreen,
    toggleSidebar,
    toggleKpiBar,
    toggleFiltersPanel,
    toggleFullscreen,
    navigate,
    goBack,
  } = useValidationBCCommandCenterStore();

  // Stats depuis le hook
  const { data: statsData, isLoading: statsLoading, refetch: refetchStats } = useValidationStats();

  // Initialiser la navigation depuis l'URL
  useEffect(() => {
    if (pathname) {
      // Détecter la catégorie depuis l'URL
      if (pathname.includes('/overview/indicateurs')) {
        navigate('overview', 'indicateurs');
      } else if (pathname.includes('/overview/stats')) {
        navigate('overview', 'stats');
      } else if (pathname.includes('/overview/tendances')) {
        navigate('overview', 'tendances');
      } else if (pathname.includes('/types/bc')) {
        navigate('types', 'bc');
      } else if (pathname.includes('/types/factures')) {
        navigate('types', 'factures');
      } else if (pathname.includes('/types/avenants')) {
        navigate('types', 'avenants');
      } else if (pathname.includes('/statut/en-attente')) {
        navigate('statut', 'en-attente');
      } else if (pathname.includes('/statut/valides')) {
        navigate('statut', 'valides');
      } else if (pathname.includes('/statut/rejetes')) {
        navigate('statut', 'rejetes');
      } else if (pathname.includes('/statut/urgents')) {
        navigate('statut', 'urgents');
      } else if (pathname.includes('/historique/validations')) {
        navigate('historique', 'validations');
      } else if (pathname.includes('/historique/rejets')) {
        navigate('historique', 'rejets');
      } else if (pathname.includes('/analyse/tendances')) {
        navigate('analyse', 'tendances');
      } else if (pathname.includes('/analyse/validateurs')) {
        navigate('analyse', 'validateurs');
      } else if (pathname.includes('/analyse/services')) {
        navigate('analyse', 'services');
      } else if (pathname.includes('/analyse/regles-metier')) {
        navigate('analyse', 'regles-metier');
      } else if (pathname.includes('/overview')) {
        navigate('overview', 'indicateurs');
      } else if (pathname === '/maitre-ouvrage/validation-bc' || pathname.endsWith('/validation-bc')) {
        navigate('overview', 'indicateurs');
        router.push('/maitre-ouvrage/validation-bc/overview/indicateurs');
      }
    }
  }, [pathname, navigate, router]);

  const activeCategory = navigation.mainCategory;
  const activeSubCategory = navigation.subCategory;

  // UI state
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [notificationsPanelOpen, setNotificationsPanelOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // ================================
  // Computed values
  // ================================
  const stats = useMemo(() => {
    if (!statsData) {
      return {
        totalDocuments: 0,
        enAttente: 0,
        valides: 0,
        rejetes: 0,
        urgents: 0,
        tauxValidation: 0,
        delaiMoyen: 0,
        anomalies: 0,
      };
    }
    return statsData;
  }, [statsData]);

  const currentCategoryLabel = useMemo(() => {
    const node = findNavNodeById(activeCategory);
    return node?.label || 'Validation-BC';
  }, [activeCategory]);

  const hasUrgentItems = useMemo(
    () => stats && stats.urgents > 0,
    [stats]
  );

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
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await refetchStats();
    setTimeout(() => {
      setIsRefreshing(false);
      setLastUpdate(new Date());
    }, 500);
  }, [refetchStats]);

  const handleCategoryChange = useCallback(
    (category: string) => {
      navigate(category as ValidationBCMainCategory, null);
      // Naviguer vers la route par défaut de la catégorie
      const node = findNavNodeById(category as ValidationBCMainCategory);
      if (node?.children && node.children.length > 0) {
        const defaultRoute = node.children[0].route;
        router.push(defaultRoute);
      }
    },
    [navigate, router]
  );

  const handleSubCategoryChange = useCallback(
    (subCategory: string) => {
      navigate(activeCategory, subCategory as ValidationBCSubCategory);
      const node = findNavNodeById(activeCategory);
      const subNode = node?.children?.find((c) => c.id === subCategory);
      if (subNode?.route) {
        router.push(subNode.route);
      }
    },
    [activeCategory, navigate, router]
  );

  const handleGoBack = useCallback(() => {
    goBack();
    // TODO: Naviguer vers la route précédente
  }, [goBack]);

  const openCommandPalette = useCallback(() => {
    setCommandPaletteOpen(true);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.isContentEditable) return;
      if (['input', 'textarea', 'select'].includes(target?.tagName?.toLowerCase() || ''))
        return;

      const isMod = e.metaKey || e.ctrlKey;

      // ⌘K - Palette de commandes
      if (isMod && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        openCommandPalette();
        return;
      }

      // ⌘R - Rafraîchir
      if (isMod && e.key.toLowerCase() === 'r') {
        e.preventDefault();
        handleRefresh();
        return;
      }

      // ⌘B - Toggle sidebar
      if (isMod && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        toggleSidebar();
        return;
      }

      // Alt+← - Retour
      if (e.altKey && e.key === 'ArrowLeft') {
        e.preventDefault();
        handleGoBack();
        return;
      }

      // Escape - Fermer panels
      if (e.key === 'Escape') {
        setNotificationsPanelOpen(false);
        toggleFiltersPanel();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleRefresh, toggleSidebar, handleGoBack, openCommandPalette, toggleFiltersPanel]);

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
      {/* Sidebar Navigation hiérarchique */}
      {!sidebarCollapsed && (
        <div
          className="fixed inset-0 bg-black/50 z-30 sm:hidden"
          onClick={() => toggleSidebar()}
        />
      )}
      <ValidationSidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => toggleSidebar()}
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <ValidationHeader
          onRefresh={handleRefresh}
          onSearch={openCommandPalette}
          isRefreshing={isRefreshing}
          hasUrgentItems={hasUrgentItems}
        />

        {/* Sub Navigation */}
        <ValidationSubNavigation
          mainCategory={activeCategory}
          mainCategoryLabel={currentCategoryLabel}
          subCategory={activeSubCategory}
          onSubCategoryChange={handleSubCategoryChange}
          stats={{
            enAttente: stats.enAttente,
            valides: stats.valides,
            rejetes: stats.rejetes,
            urgents: stats.urgents,
            bc: 0,
            factures: 0,
            avenants: 0,
          }}
        />

        {/* Filter Bar */}
        {filtersPanelOpen && <FilterBar open={filtersPanelOpen} onToggle={toggleFiltersPanel} />}

        {/* KPI Bar */}
        <KpiPanel collapsed={kpiBarCollapsed} onToggleCollapse={toggleKpiBar} />

        {/* Main Content */}
        <main className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto bg-slate-950/50">
            <ValidationContentRouter
              mainCategory={activeCategory}
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
              {stats.totalDocuments} documents • {stats.enAttente} en attente •{' '}
              {stats.valides} validés
            </span>
          </div>
          <div className="flex items-center gap-4">
            {/* Sync Status */}
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
      <ValidationCommandPalette />

      {/* Notifications Panel */}
      <NotificationsPanel
        isOpen={notificationsPanelOpen}
        onClose={() => setNotificationsPanelOpen(false)}
        moduleName="Validation-BC"
      />
    </div>
  );
}

// Wrapper with providers
export default function ValidationBCPage() {
  return <ValidationBCPageContent />;
}
