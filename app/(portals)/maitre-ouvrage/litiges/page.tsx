'use client';

import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLitigesWorkspaceStore } from '@/lib/stores/litigesWorkspaceStore';
import { litigesApiService } from '@/lib/services/litigesApiService';
import { useBMOStore } from '@/lib/stores';
import { LitigesWorkspaceTabs, LitigesLiveCounters, LitigesCommandPalette, LitigesWorkspaceContent } from '@/components/features/bmo/workspace/litiges';
import { Scale, Search, RefreshCw, BarChart3, MoreHorizontal, Download, Keyboard, Command, ChevronLeft, Bell } from 'lucide-react';
// New 3-level navigation module
import {
  LitigesSidebar,
  LitigesSubNavigation,
  LitigesContentRouter,
  type LitigesMainCategory,
} from '@/modules/litiges';

export default function LitigesPage() {
  const { openTab, commandPaletteOpen, setCommandPaletteOpen, statsModalOpen, setStatsModalOpen } = useLitigesWorkspaceStore();
  const { addToast, addActionLog, currentUser } = useBMOStore();
  const [refreshKey, setRefreshKey] = useState(0);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  
  // Navigation state - 3-level navigation
  const [activeCategory, setActiveCategory] = useState<LitigesMainCategory>('overview');
  const [activeSubCategory, setActiveSubCategory] = useState<string | undefined>('all');
  const [activeSubSubCategory, setActiveSubSubCategory] = useState<string | undefined>(undefined);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [navigationHistory, setNavigationHistory] = useState<Array<{ category: string; subCategory?: string }>>([]);
  
  // Stats state
  const [stats, setStats] = useState<{
    active?: number;
    pending?: number;
    resolved?: number;
    closed?: number;
  }>({});

  const handleRefresh = useCallback(() => {
    setRefreshKey(k => k + 1);
    addToast('Données rafraîchies', 'success');
    addActionLog({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action: 'audit',
      module: 'litiges',
      targetId: 'REFRESH',
      targetType: 'system',
      targetLabel: 'Rafraîchissement',
      details: 'Rafraîchissement manuel des données litiges',
      bureau: 'BJ',
    });
  }, [addToast, addActionLog, currentUser]);

  const handleOpenQueue = useCallback((queue: string, title: string, icon: string) => {
    const tabId = queue === 'all' ? 'inbox:all' : `inbox:${queue}`;
    openTab({ type: 'inbox', id: tabId, title, icon, data: { queue } });
  }, [openTab]);

  const handleExport = useCallback(async () => {
    addToast('Export des litiges en cours...', 'info');
    setTimeout(() => addToast('Export généré avec succès', 'success'), 1500);
  }, [addToast]);

  // Navigation handlers - 3-level navigation
  const handleCategoryChange = useCallback((category: string, subCategory?: string) => {
    if (category !== activeCategory) {
      setNavigationHistory(prev => [...prev, { category: activeCategory, subCategory: activeSubCategory }]);
      setActiveCategory(category as LitigesMainCategory);
      setActiveSubCategory(subCategory || 'all');
      setActiveSubSubCategory(undefined);
    } else if (subCategory) {
      setActiveSubCategory(subCategory);
      setActiveSubSubCategory(undefined);
    }
  }, [activeCategory, activeSubCategory]);

  const handleSubCategoryChange = useCallback((subCategory: string) => {
    setActiveSubCategory(subCategory);
    setActiveSubSubCategory(undefined);
  }, []);

  const handleSubSubCategoryChange = useCallback((subSubCategory: string) => {
    setActiveSubSubCategory(subSubCategory);
  }, []);

  const handleGoBack = useCallback(() => {
    if (navigationHistory.length === 0) return;
    const prev = navigationHistory[navigationHistory.length - 1];
    setNavigationHistory(navigationHistory.slice(0, -1));
    setActiveCategory(prev.category as LitigesMainCategory);
    setActiveSubCategory(prev.subCategory || 'all');
    setActiveSubSubCategory(undefined);
  }, [navigationHistory]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); setCommandPaletteOpen(true); }
      if (e.key === 'Escape' && commandPaletteOpen) { setCommandPaletteOpen(false); }
      if (e.key === 'r' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); handleRefresh(); }
      // ⌘B / Ctrl+B - Toggle Sidebar
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault();
        setSidebarCollapsed(prev => !prev);
      }
      // Alt+← - Go Back
      if (e.altKey && e.key === 'ArrowLeft') {
        e.preventDefault();
        handleGoBack();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [commandPaletteOpen, setCommandPaletteOpen, handleRefresh, handleGoBack]);

  return (
    <div className={cn('flex h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden')}>
      {/* Sidebar Navigation - 3-level */}
      <LitigesSidebar
        activeCategory={activeCategory}
        activeSubCategory={activeSubCategory}
        collapsed={sidebarCollapsed}
        stats={stats}
        onCategoryChange={handleCategoryChange}
        onToggleCollapse={() => setSidebarCollapsed(prev => !prev)}
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
              <Scale className="h-5 w-5 text-rose-400" />
              <h1 className="text-base font-semibold text-slate-200">Contentieux & Litiges</h1>
              <Badge
                variant="default"
                className="text-xs bg-slate-800/50 text-slate-300 border-slate-700/50"
              >
                v2.0
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-2">

            <div className="flex items-center gap-3">
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

            {/* Notifications */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStatsModalOpen(true)}
              className="h-8 w-8 p-0 relative text-slate-500 hover:text-slate-300"
              title="Statistiques"
            >
              <Bell className="h-4 w-4" />
              {(stats.active || 0) > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                  {stats.active}
                </span>
              )}
            </Button>

            {/* Refresh */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              className="h-8 w-8 p-0 text-slate-500 hover:text-slate-300"
              title="Rafraîchir"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>

            {/* More Menu */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                className="h-8 w-8 p-0 text-slate-500 hover:text-slate-300"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
              {moreMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMoreMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-700/50 bg-slate-900 shadow-xl z-20 py-2">
                    <button onClick={() => { handleExport(); setMoreMenuOpen(false); }} className="w-full px-4 py-2.5 text-left text-sm text-slate-300 hover:bg-slate-800/50 flex items-center gap-3">
                      <Download className="w-4 h-4 text-slate-400" />Exporter les litiges
                    </button>
                    <button onClick={() => { setCommandPaletteOpen(true); setMoreMenuOpen(false); }} className="w-full px-4 py-2.5 text-left text-sm text-slate-300 hover:bg-slate-800/50 flex items-center gap-3">
                      <Command className="w-4 h-4 text-slate-400" />Palette de commande
                    </button>
                    <div className="border-t border-slate-700/50 my-2" />
                    <div className="px-4 py-2 text-xs text-slate-500"><Keyboard className="w-3 h-3 inline mr-1" /> ⌘K recherche • ⌘R rafraîchir</div>
                  </div>
                </>
              )}
            </div>
            </div>
          </div>
        </header>

        {/* Sub Navigation - Level 2 & 3 */}
        <LitigesSubNavigation
          mainCategory={activeCategory}
          subCategory={activeSubCategory}
          subSubCategory={activeSubSubCategory}
          onSubCategoryChange={handleSubCategoryChange}
          onSubSubCategoryChange={handleSubSubCategoryChange}
          stats={stats}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-hidden">
          <div className="h-full overflow-x-hidden overflow-y-auto">
            <LitigesContentRouter
              mainCategory={activeCategory}
              subCategory={activeSubCategory}
              subSubCategory={activeSubSubCategory}
            />
          </div>
        </main>

        {/* Status Bar */}
        <footer className="flex items-center justify-between px-4 py-1.5 border-t border-slate-800/50 bg-slate-900/60 text-xs">
          <div className="flex items-center gap-4">
            <span className="text-slate-600">Litiges</span>
            {stats.active !== undefined && (
              <>
                <span className="text-slate-700">•</span>
                <span className="text-slate-600">
                  {stats.active || 0} actifs • {stats.pending || 0} en attente • {stats.resolved || 0} résolus
                </span>
              </>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-slate-500">Connecté</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Command Palette */}
      <LitigesCommandPalette open={commandPaletteOpen} onClose={() => setCommandPaletteOpen(false)} onOpenStats={() => setStatsModalOpen(true)} onRefresh={handleRefresh} />

      {/* Stats Modal */}
      {statsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setStatsModalOpen(false)}>
          <div className="w-full max-w-3xl mx-4 rounded-2xl border border-slate-700/50 bg-slate-900 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-700/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-rose-500/10"><BarChart3 className="w-5 h-5 text-rose-400" /></div>
                <h2 className="text-lg font-bold text-slate-200">Statistiques Litiges</h2>
              </div>
              <button onClick={() => setStatsModalOpen(false)} className="p-2 rounded-lg text-slate-400 hover:bg-slate-800">✕</button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-center">
                  <p className="text-3xl font-bold text-rose-400">12</p>
                  <p className="text-sm text-slate-500 mt-1">Litiges actifs</p>
                </div>
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
                  <p className="text-3xl font-bold text-amber-400">4</p>
                  <p className="text-sm text-slate-500 mt-1">Audiences prévues</p>
                </div>
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                  <p className="text-3xl font-bold text-emerald-400">8</p>
                  <p className="text-sm text-slate-500 mt-1">Litiges clos</p>
                </div>
              </div>
              <div className="mt-6 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                <h4 className="font-semibold text-slate-200 mb-2">Exposition totale</h4>
                <p className="text-2xl font-mono font-bold text-rose-400">1.25 Md FCFA</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
