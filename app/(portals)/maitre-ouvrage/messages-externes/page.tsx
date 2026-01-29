'use client';

/**
 * Centre de Commandement Messages Externes - Version 2.0
 * Architecture cohérente avec Analytics et Gouvernance
 */

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Mail,
  Search,
  Bell,
  ChevronLeft,
  MoreVertical,
  Download,
  RefreshCw,
} from 'lucide-react';
import {
  useMessagesExternesCommandCenterStore,
} from '@/lib/stores/messagesExternesCommandCenterStore';
import {
  MessagesExternesKPIBar,
  messagesExternesCategories,
} from '@/components/features/bmo/messages-externes/command-center';
// New 3-level navigation module
import {
  MessagesExternesSidebar,
  MessagesExternesSubNavigation,
  MessagesExternesContentRouter,
  type MessagesExternesMainCategory,
} from '@/modules/messages-externes';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { messagesExternes } from '@/lib/data';
import type { ExternalMessage } from '@/lib/types/bmo.types';

// Type pour les messages
type MessageItem = typeof messagesExternes[number];

// Sous-catégories par catégorie principale
interface SubCategory {
  id: string;
  label: string;
  badge?: number | string;
  badgeType?: 'default' | 'warning' | 'critical';
}

const subCategoriesMap: Record<string, SubCategory[]> = {
  overview: [
    { id: 'all', label: 'Tout' },
    { id: 'recent', label: 'Récents' },
    { id: 'priority', label: 'Prioritaires' },
  ],
  unread: [
    { id: 'all', label: 'Tous les non lus' },
    { id: 'urgent', label: 'Urgents', badgeType: 'critical' },
    { id: 'high', label: 'Haute priorité', badgeType: 'warning' },
  ],
  requires_response: [
    { id: 'all', label: 'Tous à répondre' },
    { id: 'overdue', label: 'En retard', badgeType: 'critical' },
    { id: 'due_soon', label: 'Échéance proche', badgeType: 'warning' },
  ],
  replied: [
    { id: 'all', label: 'Tous les répondus' },
    { id: 'today', label: "Aujourd'hui" },
    { id: 'this_week', label: 'Cette semaine' },
  ],
  archived: [
    { id: 'all', label: 'Tous les archivés' },
    { id: 'this_month', label: 'Ce mois' },
    { id: 'older', label: 'Plus anciens' },
  ],
  by_type: [
    { id: 'all', label: 'Tous les types' },
    { id: 'courrier', label: 'Courrier' },
    { id: 'email', label: 'Email' },
    { id: 'fax', label: 'Fax' },
    { id: 'recommande', label: 'Recommandé' },
  ],
  by_priority: [
    { id: 'all', label: 'Toutes priorités' },
    { id: 'urgent', label: 'Urgent', badgeType: 'critical' },
    { id: 'high', label: 'Haute', badgeType: 'warning' },
    { id: 'normal', label: 'Normale' },
    { id: 'low', label: 'Basse' },
  ],
  analytics: [
    { id: 'overview', label: 'Vue d\'ensemble' },
    { id: 'trends', label: 'Tendances' },
    { id: 'performance', label: 'Performance' },
  ],
  settings: [
    { id: 'general', label: 'Général' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'export', label: 'Export' },
  ],
};

// WHY: Export CSV enrichi — traçabilité RACI incluse
const exportMessagesAsCSV = (
  messages: MessageItem[],
  addToast: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void
) => {
  const headers = [
    'ID',
    'Expéditeur',
    'Objet',
    'Type',
    'Statut',
    'Priorité',
    'Réponse requise',
    'Date',
    'Origine décisionnelle',
    'ID décision',
    'Rôle RACI',
    'Hash traçabilité',
    'Statut BMO',
  ];

  const rows = messages.map(m => [
    m.id,
    m.sender,
    `"${m.subject}"`,
    m.type,
    m.status,
    m.priority,
    m.requiresResponse ? 'Oui' : 'Non',
    m.date,
    m.decisionBMO?.origin || 'Hors périmètre BMO',
    m.decisionBMO?.decisionId || '',
    m.decisionBMO?.validatorRole || '',
    m.decisionBMO?.hash || '',
    m.decisionBMO ? 'Piloté' : 'Non piloté',
  ]);

  const csvContent = [
    headers.join(';'),
    ...rows.map(row => row.join(';'))
  ].join('\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `messages_externes_bmo_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  addToast('✅ Export Messages généré (traçabilité RACI incluse)', 'success');
};

export default function MessagesExternesPage() {
  return <MessagesExternesPageContent />;
}

function MessagesExternesPageContent() {
  const { darkMode } = useAppStore();
  const { addToast, addActionLog, currentUser } = useBMOStore();
  const {
    navigation,
    fullscreen,
    sidebarCollapsed,
    commandPaletteOpen,
    notificationsPanelOpen,
    kpiConfig,
    navigationHistory,
    toggleFullscreen,
    toggleCommandPalette,
    toggleNotificationsPanel,
    toggleSidebar,
    goBack,
    navigate,
    setKPIConfig,
  } = useMessagesExternesCommandCenterStore();

  // État local
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Navigation state
  const activeCategory = navigation.mainCategory;
  const activeSubCategory = navigation.subCategory || 'all';

  // Calcul des stats
  const stats = useMemo(() => {
    const unread = messagesExternes.filter(m => m.status === 'unread').length;
    const requiresResponse = messagesExternes.filter(m => m.requiresResponse && m.status !== 'replied').length;
    const replied = messagesExternes.filter(m => m.status === 'replied').length;
    const archived = messagesExternes.filter(m => m.status === 'archived').length;
    return {
      total: messagesExternes.length,
      unread,
      requiresResponse,
      replied,
      archived,
    };
  }, []);

  // Filtrage des messages selon la navigation
  const filteredMessages = useMemo(() => {
    let filtered = [...messagesExternes];

    // Filtrage par catégorie principale
    switch (activeCategory) {
      case 'unread':
        filtered = filtered.filter(m => m.status === 'unread');
        break;
      case 'requires_response':
        filtered = filtered.filter(m => m.requiresResponse && m.status !== 'replied');
        break;
      case 'replied':
        filtered = filtered.filter(m => m.status === 'replied');
        break;
      case 'archived':
        filtered = filtered.filter(m => m.status === 'archived');
        break;
      case 'overview':
      default:
        // Pas de filtre
        break;
    }

    return filtered;
  }, [activeCategory]);

  // Computed values
  const currentCategoryLabel = useMemo(() => {
    return messagesExternesCategories.find((c) => c.id === activeCategory)?.label || 'Messages Externes';
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

  // Callbacks
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setLastUpdate(new Date());
      addToast('✅ Données actualisées', 'success');
    }, 1500);
  }, [addToast]);

  const handleCategoryChange = useCallback((category: string) => {
    navigate(category as MessagesExternesMainCategory, 'all', null);
  }, [navigate]);

  const handleSubCategoryChange = useCallback((subCategory: string) => {
    navigate(activeCategory, subCategory, null);
  }, [activeCategory, navigate]);

  const handleRespond = useCallback((message: MessageItem | null) => {
    if (!message) return;
    addActionLog({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      module: 'messages-externes',
      action: 'modification',
      targetId: message.id,
      targetType: 'ExternalMessage',
      details: `Réponse message ${message.sender}`,
      bureau: 'BMO',
    });
    addToast('✅ Réponse envoyée - Preuve archivée', 'success');
  }, [addActionLog, addToast, currentUser]);

  const handleAssign = useCallback((message: MessageItem | null) => {
    if (!message) return;
    addActionLog({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      module: 'messages-externes',
      action: 'delegation',
      targetId: message.id,
      targetType: 'ExternalMessage',
      details: `Message assigné pour traitement`,
      bureau: 'BMO',
    });
    addToast('📨 Message assigné', 'info');
  }, [addActionLog, addToast, currentUser]);

  const handleArchive = useCallback((message: MessageItem | null) => {
    if (!message) return;
    addActionLog({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      module: 'messages-externes',
      action: 'modification',
      targetId: message.id,
      targetType: 'ExternalMessage',
      details: `Message archivé`,
      bureau: 'BMO',
    });
    addToast('📁 Message archivé', 'success');
  }, [addActionLog, addToast, currentUser]);

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = { courrier: '📬', email: '📧', fax: '📠', recommande: '📮' };
    return icons[type] || '📩';
  };

  const selectedM = selectedMessage ? messagesExternes.find(m => m.id === selectedMessage) : null;

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      const isMod = e.metaKey || e.ctrlKey;

      if (isMod && e.key === 'k') {
        e.preventDefault();
        toggleCommandPalette();
        return;
      }

      if (e.key === 'F11') {
        e.preventDefault();
        toggleFullscreen();
        return;
      }

      if (e.altKey && e.key === 'ArrowLeft') {
        e.preventDefault();
        goBack();
        return;
      }

      if (isMod && e.key === 'b') {
        e.preventDefault();
        toggleSidebar();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleCommandPalette, toggleFullscreen, toggleSidebar, goBack]);

  // Render
  return (
    <div
      className={cn(
        'flex h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden',
        fullscreen && 'fixed inset-0 z-50'
      )}
    >
      {/* Sidebar Navigation - 3-level */}
      <MessagesExternesSidebar
        activeCategory={activeCategory}
        activeSubCategory={activeSubCategory}
        collapsed={sidebarCollapsed}
        stats={{
          overview: stats.total || 0,
          unread: stats.unread || 0,
          requires_response: stats.requiresResponse || 0,
          replied: stats.replied || 0,
          archived: stats.archived || 0,
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
              <Mail className="h-5 w-5 text-blue-400" />
              <h1 className="text-base font-semibold text-slate-200">Messages Externes</h1>
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
              {stats.unread > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                  {stats.unread > 9 ? '9+' : stats.unread}
                </span>
              )}
            </Button>

            {/* Export */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => exportMessagesAsCSV(messagesExternes, addToast)}
              className="h-8 px-3 text-slate-500 hover:text-slate-300 hover:bg-slate-800/50"
              title="Exporter CSV"
            >
              <Download className="h-4 w-4" />
            </Button>

            {/* Refresh */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              className="h-8 w-8 p-0 text-slate-500 hover:text-slate-300 hover:bg-slate-800/50"
              title="Actualiser"
            >
              <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
            </Button>

            {/* More Actions */}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-slate-500 hover:text-slate-300 hover:bg-slate-800/50"
              title="Plus d'actions"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* Sub Navigation - Level 2 & 3 */}
        <MessagesExternesSubNavigation
          mainCategory={activeCategory}
          subCategory={activeSubCategory}
          subSubCategory={navigation.filter || undefined}
          onSubCategoryChange={handleSubCategoryChange}
          onSubSubCategoryChange={(subSubCategory) => navigate(activeCategory, activeSubCategory, subSubCategory)}
          stats={{
            overview: stats.total || 0,
            unread: stats.unread || 0,
            requires_response: stats.requiresResponse || 0,
            replied: stats.replied || 0,
            archived: stats.archived || 0,
          }}
        />

        {/* KPI Bar */}
        {kpiConfig.visible && (
          <MessagesExternesKPIBar
            messages={messagesExternes}
            visible={true}
            collapsed={kpiConfig.collapsed}
            onToggleCollapse={() => setKPIConfig({ collapsed: !kpiConfig.collapsed })}
            onRefresh={handleRefresh}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-hidden">
          <div className="h-full overflow-x-hidden overflow-y-auto">
            <MessagesExternesContentRouter
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
              {stats.total} messages • {stats.unread} non lus • {stats.requiresResponse} à répondre
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
    </div>
  );
}
