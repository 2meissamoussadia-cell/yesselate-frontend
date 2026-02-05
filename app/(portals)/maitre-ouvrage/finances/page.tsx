'use client';

/**
 * Centre de Commandement Finances - Version 2.0
 * Plateforme de pilotage financier
 * Architecture cohérente avec Gouvernance et Analytics
 */

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Wallet,
  Search,
  Bell,
  ChevronLeft,
  RefreshCw,
  Plus,
  Download,
  Settings,
  MoreHorizontal,
  BarChart3,
} from 'lucide-react';
import { useFinancesWorkspaceStore } from '@/lib/stores/financesWorkspaceStore';
import {
  FinancesKPIBar,
  FinancesFiltersPanel,
  financesCategories,
  financesSubCategoriesMap,
  financesFiltersMap,
  type FinancesKPIData,
} from '@/components/features/bmo/finances/command-center';
// New 3-level navigation module
import {
  FinancesSidebar,
  FinancesSubNavigation,
  FinancesContentRouter,
  type FinancesMainCategory,
} from '@/modules/finances';
import { FinancesCommandPalette } from '@/components/features/bmo/workspace/finances';
import {
  TransactionDetailModal,
  InvoiceFormModal,
  ExportModal,
} from '@/components/features/bmo/finances/modals';
import { useDeleteTransaction, useUpdateTransaction } from '@/lib/hooks/useFinancesData';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// ================================
// Notifications Panel Component
// ================================
function NotificationsPanel({ onClose }: { onClose: () => void }) {
  const notifications = [
    {
      id: '1',
      type: 'critical',
      title: 'Budget projet dépassé',
      time: 'il y a 15 min',
      read: false,
    },
    {
      id: '2',
      type: 'warning',
      title: 'Facture impayée depuis 45 jours',
      time: 'il y a 1h',
      read: false,
    },
    {
      id: '3',
      type: 'info',
      title: 'Nouveau paiement reçu',
      time: 'il y a 3h',
      read: true,
    },
    {
      id: '4',
      type: 'warning',
      title: '5 factures en attente validation',
      time: 'il y a 5h',
      read: true,
    },
    {
      id: '5',
      type: 'info',
      title: 'Rapport mensuel disponible',
      time: 'hier',
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
            <Bell className="h-4 w-4 text-cyan-400" />
            <h3 className="text-sm font-medium text-slate-200">Notifications</h3>
            <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs">
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
                      ? 'bg-rose-500'
                      : notif.type === 'warning'
                      ? 'bg-amber-500'
                      : 'bg-cyan-500'
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

// ================================
// Stats Modal Component
// ================================
function StatsModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl mx-4 rounded-2xl border border-slate-700/50 bg-slate-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-700/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10">
              <BarChart3 className="w-5 h-5 text-cyan-400" />
            </div>
            <h2 className="text-lg font-bold text-slate-200">Statistiques Financières</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:bg-slate-800"
          >
            ✕
          </button>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
              <p className="text-3xl font-bold text-emerald-400">4.55 Md</p>
              <p className="text-sm text-slate-500 mt-1">Revenus</p>
            </div>
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-center">
              <p className="text-3xl font-bold text-rose-400">3.12 Md</p>
              <p className="text-sm text-slate-500 mt-1">Dépenses</p>
            </div>
            <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-center">
              <p className="text-3xl font-bold text-cyan-400">1.43 Md</p>
              <p className="text-sm text-slate-500 mt-1">Bénéfice</p>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4 mt-6">
            <div className="p-3 rounded-lg bg-slate-800/50 text-center">
              <p className="text-lg font-semibold text-slate-200">892M</p>
              <p className="text-xs text-slate-500">Trésorerie</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-800/50 text-center">
              <p className="text-lg font-semibold text-amber-400">12</p>
              <p className="text-xs text-slate-500">En attente</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-800/50 text-center">
              <p className="text-lg font-semibold text-rose-400">3</p>
              <p className="text-xs text-slate-500">Impayés</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-800/50 text-center">
              <p className="text-lg font-semibold text-emerald-400">57%</p>
              <p className="text-xs text-slate-500">Budget consommé</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ================================
// Main Component
// ================================
export default function FinancesPage() {
  const {
    activeCategory,
    activeSubCategory,
    activeFilter,
    sidebarCollapsed,
    kpiBarCollapsed,
    navigationHistory,
    setActiveCategory,
    setActiveSubCategory,
    setActiveFilter,
    toggleSidebar,
    toggleKpiBar,
    goBack,
    commandPaletteOpen,
    setCommandPaletteOpen,
    statsModalOpen,
    setStatsModalOpen,
    filtersPanelOpen,
    setFiltersPanelOpen,
    notificationsPanelOpen,
    setNotificationsPanelOpen,
    isFullScreen,
    toggleFullScreen,
  } = useFinancesWorkspaceStore();

  // UI state
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  // Detail Modals (pattern tickets-clients)
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [invoiceFormOpen, setInvoiceFormOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);

  // Mutations hooks
  const { deleteTransaction } = useDeleteTransaction();
  const { updateTransaction } = useUpdateTransaction();

  // Mock KPI data
  const kpiData: FinancesKPIData = useMemo(
    () => ({
      totalRevenue: 4550000000,
      totalExpenses: 3120000000,
      netProfit: 1430000000,
      pendingAmount: 320000000,
      overdueAmount: 85000000,
      cashBalance: 892000000,
      budgetUtilization: 57,
      profitMargin: 31.4,
      trends: {
        revenue: 'up',
        expenses: 'up',
        profit: 'up',
        cashBalance: 'up',
      },
    }),
    []
  );

  // ================================
  // Computed values
  // ================================
  const currentCategoryLabel = useMemo(() => {
    return (
      financesCategories.find((c) => c.id === activeCategory)?.label || 'Finances'
    );
  }, [activeCategory]);

  const currentSubCategories = useMemo(() => {
    return financesSubCategoriesMap[activeCategory] || [];
  }, [activeCategory]);

  const currentFilters = useMemo(() => {
    const key = `${activeCategory}:${activeSubCategory}`;
    return financesFiltersMap[key] || [];
  }, [activeCategory, activeSubCategory]);

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

  const handleApplyFilters = useCallback(
    (filters: Record<string, string[]>) => {
      console.log('Filtres appliqués:', filters);
      // Here you would apply the filters to your data fetching logic
    },
    []
  );

  // Navigation handlers - 3-level navigation
  const handleCategoryChange = useCallback((category: string, subCategory?: string) => {
    if (category !== activeCategory) {
      setActiveCategory(category);
      setActiveSubCategory(subCategory || 'all');
      setActiveFilter(null);
    } else if (subCategory) {
      setActiveSubCategory(subCategory);
      setActiveFilter(null);
    }
  }, [activeCategory, setActiveCategory, setActiveSubCategory, setActiveFilter]);

  const handleSubCategoryChange = useCallback((subCategory: string) => {
    setActiveSubCategory(subCategory);
    setActiveFilter(null);
  }, [setActiveSubCategory, setActiveFilter]);

  const handleSubSubCategoryChange = useCallback((subSubCategory: string) => {
    setActiveFilter(subSubCategory);
  }, [setActiveFilter]);

  // Handlers pour les modales (pattern tickets-clients)
  const handleViewTransaction = useCallback((transaction: any) => {
    setSelectedTransactionId(transaction.id);
  }, [setSelectedTransactionId]);

  const handleEditTransaction = useCallback((transaction: any) => {
    // Logique d'édition
    console.log('Edit transaction:', transaction);
  }, []);

  const handleDeleteTransaction = useCallback(async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette transaction ?')) {
      await deleteTransaction(id);
      setSelectedTransactionId(null);
    }
  }, [deleteTransaction, setSelectedTransactionId]);

  const handleExport = useCallback((config: any) => {
    console.log('Export config:', config);
    // Logique d'export
  }, []);

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

      // Ctrl+B : Toggle sidebar
      if (isMod && e.key === 'b') {
        e.preventDefault();
        toggleSidebar();
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

      // Escape : Close modals
      if (e.key === 'Escape') {
        if (commandPaletteOpen) setCommandPaletteOpen(false);
        if (notificationsPanelOpen) setNotificationsPanelOpen(false);
        if (filtersPanelOpen) setFiltersPanelOpen(false);
        if (statsModalOpen) setStatsModalOpen(false);
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    commandPaletteOpen,
    notificationsPanelOpen,
    filtersPanelOpen,
    statsModalOpen,
    setCommandPaletteOpen,
    setNotificationsPanelOpen,
    setFiltersPanelOpen,
    setStatsModalOpen,
    toggleSidebar,
    toggleFullScreen,
    goBack,
  ]);

  // Custom events listener
  useEffect(() => {
    const handleOpenCommandPalette = () => setCommandPaletteOpen(true);
    window.addEventListener('finances:open-command-palette', handleOpenCommandPalette);
    return () => {
      window.removeEventListener('finances:open-command-palette', handleOpenCommandPalette);
    };
  }, [setCommandPaletteOpen]);

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
      <FinancesSidebar
        activeCategory={activeCategory}
        activeSubCategory={activeSubCategory}
        collapsed={sidebarCollapsed}
        stats={{
          transactions: 24,
          invoices: 18,
          payments: 8,
          budgets: 12,
        }}
        onCategoryChange={handleCategoryChange}
        onToggleCollapse={toggleSidebar}
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
              <Wallet className="h-5 w-5 text-cyan-400" />
              <h1 className="text-base font-semibold text-slate-200">Finances</h1>
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

            {/* New Transaction Button */}
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
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-amber-500 rounded-full text-xs text-white flex items-center justify-center">
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
                  <RefreshCw
                    className={cn('h-4 w-4 mr-2', isRefreshing && 'animate-spin')}
                  />
                  Rafraîchir
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFiltersPanelOpen(true)}>
                  <Settings className="h-4 w-4 mr-2" />
                  Filtres avancés
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setExportModalOpen(true)}>
                  <Download className="h-4 w-4 mr-2" />
                  Exporter
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setStatsModalOpen(true)}>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Statistiques
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Sub Navigation - Level 2 & 3 */}
        <FinancesSubNavigation
          mainCategory={activeCategory as FinancesMainCategory}
          subCategory={activeSubCategory}
          subSubCategory={activeFilter || undefined}
          onSubCategoryChange={handleSubCategoryChange}
          onSubSubCategoryChange={handleSubSubCategoryChange}
          stats={{
            transactions: 24,
            invoices: 18,
            payments: 8,
            budgets: 12,
          }}
        />

        {/* KPI Bar */}
        <FinancesKPIBar
          data={kpiData}
          collapsed={kpiBarCollapsed}
          onToggleCollapse={toggleKpiBar}
          currency="XOF"
        />

        {/* Main Content */}
        <main className="flex-1 overflow-hidden">
          <div className="h-full overflow-x-hidden overflow-y-auto p-4">
            <FinancesContentRouter
              mainCategory={activeCategory as FinancesMainCategory}
              subCategory={activeSubCategory}
              subSubCategory={activeFilter || undefined}
            />
          </div>
        </main>

        {/* Status Bar */}
        <footer className="flex items-center justify-between px-4 py-1.5 border-t border-slate-800/50 bg-slate-900/60 text-xs">
          <div className="flex items-center gap-4">
            <span className="text-slate-600">MàJ: {formatLastUpdate()}</span>
            <span className="text-slate-700">•</span>
            <span className="text-slate-600">
              156 transactions • 12 en attente • 3 impayés
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
      <FinancesCommandPalette
        open={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onOpenStats={() => setStatsModalOpen(true)}
        onRefresh={handleRefresh}
      />

      {/* Modals */}
      {statsModalOpen && <StatsModal onClose={() => setStatsModalOpen(false)} />}

      {/* Detail Modals - Pattern Tickets Clients */}
      <TransactionDetailModal
        transactionId={selectedTransactionId}
        isOpen={!!selectedTransactionId}
        onClose={() => setSelectedTransactionId(null)}
        onEdit={handleEditTransaction}
        onDelete={handleDeleteTransaction}
      />

      <InvoiceFormModal
        isOpen={invoiceFormOpen}
        onClose={() => setInvoiceFormOpen(false)}
        onSave={(invoice) => {
          console.log('Save invoice:', invoice);
          setInvoiceFormOpen(false);
        }}
      />

      <ExportModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        onExport={handleExport}
      />

      {/* Notifications Panel */}
      {notificationsPanelOpen && (
        <NotificationsPanel onClose={() => setNotificationsPanelOpen(false)} />
      )}

      {/* Filters Panel */}
      <FinancesFiltersPanel
        isOpen={filtersPanelOpen}
        onClose={() => setFiltersPanelOpen(false)}
        onApplyFilters={handleApplyFilters}
      />
    </div>
  );
}
