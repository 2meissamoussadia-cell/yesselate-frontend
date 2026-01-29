'use client';

import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useDepensesWorkspaceStore } from '@/lib/stores/depensesWorkspaceStore';
import { depensesApiService } from '@/lib/services/depensesApiService';
import { useBMOStore } from '@/lib/stores';
import { DepensesWorkspaceTabs, DepensesLiveCounters, DepensesCommandPalette, DepensesWorkspaceContent } from '@/components/features/bmo/workspace/depenses';
import { CreditCard, Search, RefreshCw, BarChart3, MoreHorizontal, Download, Keyboard, Command } from 'lucide-react';

export default function DepensesPage() {
  const { openTab, commandPaletteOpen, setCommandPaletteOpen, statsModalOpen, setStatsModalOpen } = useDepensesWorkspaceStore();
  const { addToast, addActionLog, currentUser } = useBMOStore();
  const [refreshKey, setRefreshKey] = useState(0);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  const handleRefresh = useCallback(() => {
    setRefreshKey(k => k + 1);
    addToast('Données rafraîchies', 'success');
    addActionLog({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action: 'audit',
      module: 'depenses',
      targetId: 'REFRESH',
      targetType: 'system',
      targetLabel: 'Rafraîchissement',
      details: 'Rafraîchissement manuel des dépenses',
      bureau: 'DAF',
    });
  }, [addToast, addActionLog, currentUser]);

  const handleOpenQueue = useCallback((queue: string, title: string, icon: string) => {
    const tabId = queue === 'all' ? 'inbox:all' : `inbox:${queue}`;
    openTab({ type: 'inbox', id: tabId, title, icon, data: { queue } });
  }, [openTab]);

  const handleExport = useCallback(async () => {
    addToast('Export des dépenses en cours...', 'info');
    setTimeout(() => addToast('Export généré avec succès', 'success'), 1500);
  }, [addToast]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); setCommandPaletteOpen(true); }
      if (e.key === 'Escape' && commandPaletteOpen) { setCommandPaletteOpen(false); }
      if (e.key === 'r' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); handleRefresh(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [commandPaletteOpen, setCommandPaletteOpen, handleRefresh]);

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-50 via-white to-purple-50/20 dark:from-[#0f0f0f] dark:via-[#1a1a1a] dark:to-purple-950/10">
      {/* Header */}
      <header className="flex-none border-b border-slate-200/70 dark:border-slate-800/70 bg-white/80 dark:bg-[#1f1f1f]/80 backdrop-blur-xl">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg shadow-purple-500/25">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Gestion des Dépenses</h1>
                <p className="text-sm text-slate-500">Suivi et validation des dépenses</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button onClick={() => setCommandPaletteOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-500 hover:border-purple-500/50 transition-colors">
                <Search className="w-4 h-4" />
                <span className="hidden md:inline">Rechercher...</span>
                <kbd className="ml-2 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-xs font-mono">⌘K</kbd>
              </button>

              <button onClick={handleRefresh} className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors" title="Rafraîchir">
                <RefreshCw className="w-4 h-4 text-slate-500" />
              </button>

              <button onClick={() => setStatsModalOpen(true)} className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors" title="Statistiques">
                <BarChart3 className="w-4 h-4 text-slate-500" />
              </button>

              <div className="relative">
                <button onClick={() => setMoreMenuOpen(!moreMenuOpen)} className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  <MoreHorizontal className="w-4 h-4 text-slate-500" />
                </button>
                {moreMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setMoreMenuOpen(false)} />
                    <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl z-20 py-2">
                      <button onClick={() => { handleExport(); setMoreMenuOpen(false); }} className="w-full px-4 py-2.5 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-3">
                        <Download className="w-4 h-4 text-slate-400" />Exporter les dépenses
                      </button>
                      <button onClick={() => { setCommandPaletteOpen(true); setMoreMenuOpen(false); }} className="w-full px-4 py-2.5 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-3">
                        <Command className="w-4 h-4 text-slate-400" />Palette de commande
                      </button>
                      <div className="border-t border-slate-200 dark:border-slate-700 my-2" />
                      <div className="px-4 py-2 text-xs text-slate-500"><Keyboard className="w-3 h-3 inline mr-1" /> ⌘K recherche • ⌘R rafraîchir</div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 pb-2">
          <DepensesWorkspaceTabs />
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto min-w-0 max-w-full">
        <div className="p-6 space-y-6">
          <DepensesLiveCounters key={refreshKey} onOpenQueue={handleOpenQueue} />
          <DepensesWorkspaceContent />
        </div>
      </main>

      {/* Command Palette */}
      <DepensesCommandPalette open={commandPaletteOpen} onClose={() => setCommandPaletteOpen(false)} onOpenStats={() => setStatsModalOpen(true)} onRefresh={handleRefresh} />

      {/* Stats Modal */}
      {statsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setStatsModalOpen(false)}>
          <div className="w-full max-w-3xl mx-4 rounded-2xl border border-slate-200/70 bg-white dark:border-slate-800 dark:bg-[#1f1f1f] shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-200/70 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-purple-500/10"><BarChart3 className="w-5 h-5 text-purple-500" /></div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Statistiques Dépenses</h2>
              </div>
              <button onClick={() => setStatsModalOpen(false)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">✕</button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-center">
                  <p className="text-3xl font-bold text-purple-600">5.15 M</p>
                  <p className="text-sm text-slate-500 mt-1">Total dépenses</p>
                </div>
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
                  <p className="text-3xl font-bold text-amber-600">2</p>
                  <p className="text-sm text-slate-500 mt-1">En attente</p>
                </div>
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                  <p className="text-3xl font-bold text-emerald-600">3</p>
                  <p className="text-sm text-slate-500 mt-1">Payées</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
