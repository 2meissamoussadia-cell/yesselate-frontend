'use client';

/**
 * Centre de Commandement IA - Version 2.0
 * Plateforme de gestion des modules d'intelligence artificielle
 * Architecture cohérente avec Analytics et Gouvernance
 */

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Brain,
  Search,
  Bell,
  ChevronLeft,
  RefreshCw,
} from 'lucide-react';
import {
  useIACommandCenterStore,
} from '@/lib/stores/iaCommandCenterStore';
import {
  IAKPIBar,
  IAModuleDetailModal,
  IAModals,
  IABatchActionsBar,
  IAActionsMenu,
  IACommandPalette,
  iaCategories,
} from '@/components/features/bmo/ia/command-center';
// New 3-level navigation module
import {
  IASidebar,
  IASubNavigation,
  IAContentRouter,
  type IAMainCategory,
} from '@/modules/ia';
import { useBMOStore } from '@/lib/stores';
import { aiModules, aiHistory } from '@/lib/data';

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
  modules: [
    { id: 'all', label: 'Tous' },
    { id: 'recent', label: 'Récents' },
    { id: 'favorites', label: 'Favoris' },
  ],
  active: [],
  training: [],
  disabled: [],
  error: [],
  history: [
    { id: 'all', label: 'Toutes' },
    { id: 'completed', label: 'Complétées' },
    { id: 'processing', label: 'En traitement' },
    { id: 'failed', label: 'Échouées' },
  ],
  analysis: [],
  prediction: [],
  anomaly: [],
  reports: [],
  recommendations: [],
  settings: [],
};

// ================================
// Main Component
// ================================
export default function IAPage() {
  return <IAPageContent />;
}

function IAPageContent() {
  const { addToast, addActionLog } = useBMOStore();
  const {
    navigation,
    fullscreen,
    sidebarCollapsed,
    commandPaletteOpen,
    kpiConfig,
    navigationHistory,
    toggleFullscreen,
    toggleCommandPalette,
    toggleSidebar,
    goBack,
    navigate,
    setKPIConfig,
    globalSearch,
    setGlobalSearch,
    openModal,
  } = useIACommandCenterStore();

  // État local
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [moduleDetailModalOpen, setModuleDetailModalOpen] = useState(false);

  // Navigation state (depuis le store)
  const activeCategory = navigation.mainCategory;
  const activeSubCategory = navigation.subCategory || 'all';

  // Calcul des stats pour les KPIs
  const stats = useMemo(() => {
    const active = aiModules.filter(m => m.status === 'active').length;
    const training = aiModules.filter(m => m.status === 'training').length;
    const disabled = aiModules.filter(m => m.status === 'disabled').length;
    const error = aiModules.filter(m => m.status === 'error').length;
    const avgAccuracy = Math.round(
      aiModules
        .filter(m => m.accuracy)
        .reduce((acc, m) => acc + (m.accuracy || 0), 0) /
        (aiModules.filter(m => m.accuracy).length || 1)
    );
    const analysesCompleted = aiHistory.filter(h => h.status === 'completed').length;
    const analysesProcessing = aiHistory.filter(h => h.status === 'processing').length;
    return {
      total: aiModules.length,
      active,
      training,
      disabled,
      error,
      avgAccuracy,
      analysesCompleted,
      analysesProcessing,
    };
  }, []);

  // ================================
  // Computed values
  // ================================
  const currentCategoryLabel = useMemo(() => {
    return iaCategories.find((c) => c.id === activeCategory)?.label || 'Intelligence IA';
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
      addToast('✅ Données rafraîchies', 'success');
    }, 1500);
  }, [addToast]);

  const handleCategoryChange = useCallback((category: string) => {
    navigate(category as IAMainCategory, 'all', null);
    setSelectedModuleId(null);
  }, [navigate]);

  const handleSubCategoryChange = useCallback((subCategory: string) => {
    navigate(activeCategory, subCategory, null);
  }, [activeCategory, navigate]);

  const handleRunAnalysis = useCallback((module: any) => {
    addActionLog({
      userId: 'USR-001',
      userName: 'A. DIALLO',
      userRole: 'Directeur Général',
      module: 'ia',
      action: 'audit',
      targetId: module.id,
      targetType: 'any',
      details: `Lancement analyse ${module.name}`,
    });
    addToast(`Analyse ${module.name} lancée`, 'info');
  }, [addActionLog, addToast]);

  const handleRetrain = useCallback((module: any) => {
    addActionLog({
      userId: 'USR-001',
      userName: 'A. DIALLO',
      userRole: 'Directeur Général',
      module: 'ia',
      action: 'modification',
      targetId: module.id,
      targetType: 'any',
      details: `Ré-entraînement ${module.name}`,
    });
    addToast('Ré-entraînement programmé', 'warning');
  }, [addActionLog, addToast]);

  const handleToggleStatus = useCallback((module: any) => {
    addActionLog({
      userId: 'USR-001',
      userName: 'A. DIALLO',
      userRole: 'Directeur Général',
      module: 'ia',
      action: 'modification',
      targetId: module.id,
      targetType: 'any',
      details: `${module.status === 'active' ? 'Désactivation' : 'Activation'} ${module.name}`,
    });
    addToast(`${module.status === 'active' ? 'Désactivation' : 'Activation'} programmée`, 'info');
  }, [addActionLog, addToast]);

  // Navigation prev/next pour modal
  const filteredModulesForNav = useMemo(() => {
    // Filtrer selon la catégorie active
    let result = [...aiModules];
    if (activeCategory === 'active') result = result.filter(m => m.status === 'active');
    else if (activeCategory === 'training') result = result.filter(m => m.status === 'training');
    else if (activeCategory === 'disabled') result = result.filter(m => m.status === 'disabled');
    else if (activeCategory === 'error') result = result.filter(m => m.status === 'error');
    else if (activeCategory === 'analysis') result = result.filter(m => m.type === 'analysis');
    else if (activeCategory === 'prediction') result = result.filter(m => m.type === 'prediction');
    else if (activeCategory === 'anomaly') result = result.filter(m => m.type === 'anomaly');
    else if (activeCategory === 'reports') result = result.filter(m => m.type === 'report');
    else if (activeCategory === 'recommendations') result = result.filter(m => m.type === 'recommendation');
    return result;
  }, [activeCategory]);

  const handleOpenModuleDetail = useCallback((moduleId: string) => {
    setSelectedModuleId(moduleId);
    setModuleDetailModalOpen(true);
  }, []);

  const handleCloseModuleDetail = useCallback(() => {
    setModuleDetailModalOpen(false);
    // Keep selectedModuleId for potential reopening
  }, []);

  const handleNavigatePrev = useCallback(() => {
    const currentIndex = filteredModulesForNav.findIndex(m => m.id === selectedModuleId);
    if (currentIndex > 0) {
      setSelectedModuleId(filteredModulesForNav[currentIndex - 1].id);
    }
  }, [selectedModuleId, filteredModulesForNav]);

  const handleNavigateNext = useCallback(() => {
    const currentIndex = filteredModulesForNav.findIndex(m => m.id === selectedModuleId);
    if (currentIndex < filteredModulesForNav.length - 1) {
      setSelectedModuleId(filteredModulesForNav[currentIndex + 1].id);
    }
  }, [selectedModuleId, filteredModulesForNav]);

  const hasPrevious = useMemo(() => {
    if (!selectedModuleId) return false;
    const currentIndex = filteredModulesForNav.findIndex(m => m.id === selectedModuleId);
    return currentIndex > 0;
  }, [selectedModuleId, filteredModulesForNav]);

  const hasNext = useMemo(() => {
    if (!selectedModuleId) return false;
    const currentIndex = filteredModulesForNav.findIndex(m => m.id === selectedModuleId);
    return currentIndex < filteredModulesForNav.length - 1;
  }, [selectedModuleId, filteredModulesForNav]);

  const handleBatchAction = useCallback((actionId: string, ids: string[]) => {
    switch (actionId) {
      case 'view':
        if (ids.length > 0) {
          handleOpenModuleDetail(ids[0]);
        }
        break;
      case 'export':
        openModal('export', { selectedIds: ids });
        break;
      case 'activate':
      case 'deactivate':
      case 'retrain':
      case 'delete':
        // TODO: Implémenter actions batch
        addToast(`${actionId} - ${ids.length} module(s)`, 'info');
        break;
      default:
        break;
    }
  }, [handleOpenModuleDetail, openModal, addToast]);

  const verifyAIHash = async (id: string, hash: string): Promise<boolean> => {
    // TODO: Implémenter avec backend ou Web Crypto
    return hash.startsWith('SHA3-256:');
  };

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
      <IASidebar
        activeCategory={activeCategory}
        activeSubCategory={activeSubCategory}
        collapsed={sidebarCollapsed}
        stats={stats}
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
              <Brain className="h-5 w-5 text-purple-400" />
              <h1 className="text-base font-semibold text-slate-200">Intelligence IA</h1>
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
              className="h-8 w-8 p-0 text-slate-500 hover:text-slate-300"
              title="Notifications"
            >
              <Bell className="h-4 w-4" />
            </Button>

            {/* Actions Menu */}
            <IAActionsMenu onRefresh={handleRefresh} isRefreshing={isRefreshing} />
          </div>
        </header>

        {/* Sub Navigation - Level 2 & 3 */}
        {currentSubCategories.length > 0 && (
          <IASubNavigation
            mainCategory={activeCategory}
            subCategory={activeSubCategory}
            subSubCategory={navigation.filter || undefined}
            onSubCategoryChange={handleSubCategoryChange}
            onSubSubCategoryChange={(subSubCategory) => navigate(activeCategory, activeSubCategory, subSubCategory)}
            stats={stats}
          />
        )}

        {/* KPI Bar */}
        {kpiConfig.visible && (
          <IAKPIBar
            visible={true}
            collapsed={kpiConfig.collapsed}
            onToggleCollapse={() => setKPIConfig({ collapsed: !kpiConfig.collapsed })}
            onRefresh={handleRefresh}
            stats={stats}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-hidden">
          <div className="h-full overflow-x-hidden overflow-y-auto">
            <IAContentRouter
              mainCategory={activeCategory as any}
              subCategory={navigation.subCategory || undefined}
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
              {stats.total} modules • {stats.active} actifs • {stats.analysesCompleted} analyses
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
      {commandPaletteOpen && <IACommandPalette />}

      {/* Module Detail Modal */}
      <IAModuleDetailModal
        isOpen={moduleDetailModalOpen}
        onClose={handleCloseModuleDetail}
        moduleId={selectedModuleId}
        onRunAnalysis={handleRunAnalysis}
        onRetrain={handleRetrain}
        onToggleStatus={handleToggleStatus}
        onPrevious={handleNavigatePrev}
        onNext={handleNavigateNext}
        hasPrevious={hasPrevious}
        hasNext={hasNext}
      />

      {/* Modals */}
      <IAModals />

      {/* Batch Actions Bar */}
      <IABatchActionsBar onAction={handleBatchAction} />
    </div>
  );
}
