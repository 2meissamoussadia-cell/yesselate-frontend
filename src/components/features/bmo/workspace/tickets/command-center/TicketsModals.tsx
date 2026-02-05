/**
 * Modales du Tickets Command Center
 * Toutes les modales centralisées
 */

'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { cn } from '@/lib/cn';
import { logger } from '@/lib/utils/logger';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTicketsWorkspaceStore } from '@/lib/stores/ticketsWorkspaceStore';
import { ticketsApi, type Ticket, type TicketStats, type ResponseTemplate } from '@/lib/services/ticketsApiService';
import { TicketsDecisionCenter } from './TicketsDecisionCenter';
import {
  TicketsTrendChart,
  TicketsPriorityChart,
  TicketsCategoryChart,
  TicketsResponseTimeChart,
  TicketsAgentPerformanceChart,
  TicketsSatisfactionChart,
  TicketsSLAComplianceChart,
  TicketsHourlyVolumeChart,
} from './TicketsAnalyticsCharts';
import {
  X,
  Download,
  Keyboard,
  Settings,
  FileText,
  AlertCircle,
  Clock,
  Building2,
  Loader2,
  Check,
  ChevronRight,
  Search,
  SlidersHorizontal,
  Eye,
  Trash2,
  Star,
  TrendingUp,
  Users,
  MessageSquare,
  BarChart3,
  Target,
  Send,
  Copy,
} from 'lucide-react';

// ================================
// Main Modal Router
// ================================
export function TicketsModals() {
  const { modal, closeModal } = useTicketsWorkspaceStore();

  if (!modal.isOpen || !modal.type) return null;

  // Stats Modal
  if (modal.type === 'stats') {
    return <StatsModal onClose={closeModal} />;
  }

  // Decision Center
  if (modal.type === 'decision-center') {
    return <TicketsDecisionCenter open={true} onClose={closeModal} />;
  }

  // Export Modal
  if (modal.type === 'export') {
    return <ExportModal onClose={closeModal} />;
  }

  // Shortcuts Modal
  if (modal.type === 'shortcuts') {
    return <ShortcutsModal onClose={closeModal} />;
  }

  // Settings Modal
  if (modal.type === 'settings') {
    return <SettingsModal onClose={closeModal} />;
  }

  // Ticket Detail Modal
  if (modal.type === 'ticket-detail') {
    return <TicketDetailModal onClose={closeModal} data={modal.data} />;
  }

  // KPI Drilldown Modal
  if (modal.type === 'kpi-drilldown') {
    return <KPIDrilldownModal onClose={closeModal} data={modal.data} />;
  }

  // Templates Modal
  if (modal.type === 'templates') {
    return <TemplatesModal onClose={closeModal} />;
  }

  // Confirm Modal
  if (modal.type === 'confirm') {
    return <ConfirmModal onClose={closeModal} data={modal.data} />;
  }

  return null;
}

// ================================
// Stats Modal
// ================================
function StatsModal({ onClose }: { onClose: () => void }) {
  const [stats, setStats] = useState<TicketStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeChart, setActiveChart] = useState<'trend' | 'priority' | 'category' | 'response' | 'agents' | 'satisfaction'>('trend');

  useEffect(() => {
    ticketsApi.getStats().then(data => {
      setStats(data);
      setLoading(false);
    });
  }, []);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-5xl max-h-[90vh] rounded-2xl border border-slate-700/50 bg-slate-900 flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/30">
              <BarChart3 className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Statistiques Détaillées</h2>
              <p className="text-sm text-slate-400">Analyse complète des tickets clients</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
            </div>
          ) : stats ? (
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MetricCard
                  icon={FileText}
                  label="Total ouvert"
                  value={stats.open + stats.inProgress + stats.pending}
                  color="blue"
                />
                <MetricCard
                  icon={AlertCircle}
                  label="Critiques"
                  value={stats.critical}
                  color="rose"
                />
                <MetricCard
                  icon={Clock}
                  label="SLA dépassés"
                  value={stats.slaBreached}
                  color="amber"
                />
                <MetricCard
                  icon={Star}
                  label="Satisfaction"
                  value={`${stats.satisfactionScore}/5`}
                  color="emerald"
                />
              </div>

              {/* Chart Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {[
                  { id: 'trend', label: 'Tendances' },
                  { id: 'priority', label: 'Priorités' },
                  { id: 'category', label: 'Catégories' },
                  { id: 'response', label: 'Temps réponse' },
                  { id: 'agents', label: 'Agents' },
                  { id: 'satisfaction', label: 'Satisfaction' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveChart(tab.id as any)}
                    className={cn(
                      'px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap',
                      activeChart === tab.id
                        ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Chart Container */}
              <div className="p-6 rounded-xl border border-slate-700/50 bg-slate-800/30">
                {activeChart === 'trend' && <TicketsTrendChart />}
                {activeChart === 'priority' && <TicketsPriorityChart />}
                {activeChart === 'category' && <TicketsCategoryChart />}
                {activeChart === 'response' && <TicketsResponseTimeChart />}
                {activeChart === 'agents' && <TicketsAgentPerformanceChart />}
                {activeChart === 'satisfaction' && <TicketsSatisfactionChart />}
              </div>

              {/* Additional Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 rounded-xl border border-slate-700/50 bg-slate-800/30">
                  <h3 className="text-sm font-semibold text-slate-300 mb-4">Volume horaire</h3>
                  <TicketsHourlyVolumeChart />
                </div>
                <div className="p-4 rounded-xl border border-slate-700/50 bg-slate-800/30">
                  <h3 className="text-sm font-semibold text-slate-300 mb-4">Conformité SLA</h3>
                  <TicketsSLAComplianceChart />
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400">
              Impossible de charger les statistiques
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ================================
// Export Modal
// ================================
function ExportModal({ onClose }: { onClose: () => void }) {
  const [exporting, setExporting] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<'json' | 'csv' | 'xlsx' | 'pdf' | null>(null);

  const formats = [
    { format: 'json' as const, desc: 'Données brutes JSON', icon: '📄' },
    { format: 'xlsx' as const, desc: 'Fichier Excel', icon: '📊' },
    { format: 'pdf' as const, desc: 'Rapport PDF', icon: '📑' },
    { format: 'csv' as const, desc: 'Données CSV', icon: '📋' },
  ];

  const handleExport = async (format: 'json' | 'csv' | 'xlsx' | 'pdf') => {
    setExporting(true);
    setSelectedFormat(format);
    
    try {
      const blob = await ticketsApi.exportData(format);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tickets-export-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      onClose();
    } catch (error) {
      logger.error('Export failed', error instanceof Error ? error : undefined, { component: 'TicketsModals' });
    } finally {
      setExporting(false);
      setSelectedFormat(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-slate-700/50 bg-slate-900 p-6"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold flex items-center gap-2 text-slate-100">
            <Download className="w-5 h-5 text-purple-400" />
            Exporter les données
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded-lg">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {formats.map(({ format, desc, icon }) => (
            <button
              key={format}
              onClick={() => handleExport(format)}
              disabled={exporting}
              className={cn(
                'flex items-center gap-3 p-4 rounded-xl border transition-all text-left',
                exporting && selectedFormat === format
                  ? 'border-purple-500/50 bg-purple-500/10'
                  : 'border-slate-700/50 bg-slate-800/30 hover:border-purple-500/30'
              )}
            >
              <span className="text-2xl">{icon}</span>
              <div>
                <p className="text-sm font-medium text-slate-200">{format.toUpperCase()}</p>
                <p className="text-xs text-slate-400">{desc}</p>
              </div>
              {exporting && selectedFormat === format && (
                <Loader2 className="w-4 h-4 animate-spin text-purple-400 ml-auto" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ================================
// Shortcuts Modal
// ================================
function ShortcutsModal({ onClose }: { onClose: () => void }) {
  const shortcuts = [
    { keys: ['⌘', 'K'], desc: 'Palette de commandes' },
    { keys: ['⌘', 'F'], desc: 'Recherche rapide' },
    { keys: ['⌘', 'N'], desc: 'Nouveau ticket' },
    { keys: ['⌘', 'E'], desc: 'Exporter' },
    { keys: ['⌘', 'R'], desc: 'Rafraîchir' },
    { keys: ['Échap'], desc: 'Fermer la modale' },
    { keys: ['←'], desc: 'Retour' },
    { keys: ['1-5'], desc: 'Navigation onglets' },
    { keys: ['⌘', '↵'], desc: 'Action principale' },
    { keys: ['⌘', 'S'], desc: 'Sauvegarder' },
  ];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-slate-700/50 bg-slate-900 p-6"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold flex items-center gap-2 text-slate-100">
            <Keyboard className="w-5 h-5 text-purple-400" />
            Raccourcis clavier
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded-lg">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="space-y-2">
          {shortcuts.map(({ keys, desc }) => (
            <div
              key={desc}
              className="flex items-center justify-between py-2 border-b border-slate-800/50"
            >
              <span className="text-sm text-slate-400">{desc}</span>
              <div className="flex items-center gap-1">
                {keys.map((key, i) => (
                  <span key={i}>
                    <kbd className="px-2 py-1 text-xs font-mono bg-slate-800 border border-slate-700 rounded text-slate-300">
                      {key}
                    </kbd>
                    {i < keys.length - 1 && <span className="text-slate-600 mx-1">+</span>}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ================================
// Settings Modal
// ================================
function SettingsModal({ onClose }: { onClose: () => void }) {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [soundNotifications, setSoundNotifications] = useState(true);
  const [desktopNotifications, setDesktopNotifications] = useState(true);
  const [compactView, setCompactView] = useState(false);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-slate-700/50 bg-slate-900 p-6"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold flex items-center gap-2 text-slate-100">
            <Settings className="w-5 h-5 text-purple-400" />
            Paramètres
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded-lg">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Auto Refresh */}
          <div className="flex items-center justify-between p-3 rounded-lg border border-slate-700/50 bg-slate-800/30">
            <div>
              <p className="text-sm font-medium text-slate-200">Actualisation automatique</p>
              <p className="text-xs text-slate-400">Rafraîchir les données périodiquement</p>
            </div>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={cn(
                'w-12 h-6 rounded-full transition-colors relative',
                autoRefresh ? 'bg-purple-500' : 'bg-slate-700'
              )}
            >
              <div className={cn(
                'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
                autoRefresh ? 'left-7' : 'left-1'
              )} />
            </button>
          </div>

          {autoRefresh && (
            <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-700/50 bg-slate-800/30">
              <span className="text-sm text-slate-400">Intervalle:</span>
              <Select value={String(refreshInterval)} onValueChange={(v) => setRefreshInterval(Number(v))}>
                <SelectTrigger className="flex-1 h-9 rounded bg-slate-900 border-slate-700 text-slate-200 text-sm">
                  <SelectValue placeholder="Intervalle" />
                </SelectTrigger>
                <SelectContent className="border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                  <SelectItem value="15">15 secondes</SelectItem>
                  <SelectItem value="30">30 secondes</SelectItem>
                  <SelectItem value="60">1 minute</SelectItem>
                  <SelectItem value="300">5 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Sound Notifications */}
          <div className="flex items-center justify-between p-3 rounded-lg border border-slate-700/50 bg-slate-800/30">
            <div>
              <p className="text-sm font-medium text-slate-200">Sons de notification</p>
              <p className="text-xs text-slate-400">Alertes sonores pour nouveaux tickets</p>
            </div>
            <button
              onClick={() => setSoundNotifications(!soundNotifications)}
              className={cn(
                'w-12 h-6 rounded-full transition-colors relative',
                soundNotifications ? 'bg-purple-500' : 'bg-slate-700'
              )}
            >
              <div className={cn(
                'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
                soundNotifications ? 'left-7' : 'left-1'
              )} />
            </button>
          </div>

          {/* Desktop Notifications */}
          <div className="flex items-center justify-between p-3 rounded-lg border border-slate-700/50 bg-slate-800/30">
            <div>
              <p className="text-sm font-medium text-slate-200">Notifications bureau</p>
              <p className="text-xs text-slate-400">Alertes système</p>
            </div>
            <button
              onClick={() => setDesktopNotifications(!desktopNotifications)}
              className={cn(
                'w-12 h-6 rounded-full transition-colors relative',
                desktopNotifications ? 'bg-purple-500' : 'bg-slate-700'
              )}
            >
              <div className={cn(
                'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
                desktopNotifications ? 'left-7' : 'left-1'
              )} />
            </button>
          </div>

          {/* Compact View */}
          <div className="flex items-center justify-between p-3 rounded-lg border border-slate-700/50 bg-slate-800/30">
            <div>
              <p className="text-sm font-medium text-slate-200">Vue compacte</p>
              <p className="text-xs text-slate-400">Affichage condensé des listes</p>
            </div>
            <button
              onClick={() => setCompactView(!compactView)}
              className={cn(
                'w-12 h-6 rounded-full transition-colors relative',
                compactView ? 'bg-purple-500' : 'bg-slate-700'
              )}
            >
              <div className={cn(
                'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
                compactView ? 'left-7' : 'left-1'
              )} />
            </button>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button onClick={onClose} variant="default">
            Enregistrer
          </Button>
        </div>
      </div>
    </div>
  );
}

// ================================
// Ticket Detail Modal
// ================================
function TicketDetailModal({ onClose, data }: { onClose: () => void; data: Record<string, unknown> }) {
  const ticketId = data.ticketId as string;
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (ticketId) {
      ticketsApi.getById(ticketId).then(t => {
        setTicket(t);
        setLoading(false);
      });
    }
  }, [ticketId]);

  const handleSendMessage = async () => {
    if (!ticket || !newMessage.trim()) return;
    
    setSending(true);
    try {
      await ticketsApi.addMessage(ticket.id, newMessage);
      const updated = await ticketsApi.getById(ticket.id);
      setTicket(updated);
      setNewMessage('');
    } catch (error) {
      logger.error('Failed to send message', error instanceof Error ? error : undefined, { component: 'TicketsModals' });
    } finally {
      setSending(false);
    }
  };

  const priorityColors = {
    critical: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
    high: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    medium: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
    low: 'text-slate-400 bg-slate-500/10 border-slate-500/30',
  };

  const statusColors = {
    open: 'text-blue-400 bg-blue-500/10',
    in_progress: 'text-purple-400 bg-purple-500/10',
    pending: 'text-amber-400 bg-amber-500/10',
    resolved: 'text-emerald-400 bg-emerald-500/10',
    closed: 'text-slate-400 bg-slate-500/10',
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl max-h-[90vh] rounded-2xl border border-slate-700/50 bg-slate-900 flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
          </div>
        ) : ticket ? (
          <>
            {/* Header */}
            <div className="p-6 border-b border-slate-800">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-mono text-slate-400">{ticket.reference}</span>
                    <Badge className={priorityColors[ticket.priority]}>
                      {ticket.priority}
                    </Badge>
                    <Badge className={statusColors[ticket.status]}>
                      {ticket.status.replace('_', ' ')}
                    </Badge>
                    {ticket.client.vip && (
                      <Badge className="text-amber-400 bg-amber-500/10">
                        <Star className="w-3 h-3 mr-1" /> VIP
                      </Badge>
                    )}
                  </div>
                  <h2 className="text-xl font-bold text-slate-100">{ticket.title}</h2>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Info Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 rounded-lg border border-slate-700/50 bg-slate-800/30">
                  <p className="text-xs text-slate-400 mb-1">Client</p>
                  <p className="text-sm font-medium text-slate-200">{ticket.client.name}</p>
                  <p className="text-xs text-slate-400">{ticket.client.email}</p>
                </div>
                <div className="p-3 rounded-lg border border-slate-700/50 bg-slate-800/30">
                  <p className="text-xs text-slate-400 mb-1">Assigné à</p>
                  <p className="text-sm font-medium text-slate-200">
                    {ticket.assignee?.name || 'Non assigné'}
                  </p>
                  {ticket.assignee && (
                    <p className="text-xs text-slate-400">{ticket.assignee.department}</p>
                  )}
                </div>
                <div className="p-3 rounded-lg border border-slate-700/50 bg-slate-800/30">
                  <p className="text-xs text-slate-400 mb-1">Catégorie</p>
                  <p className="text-sm font-medium text-slate-200 capitalize">{ticket.category}</p>
                </div>
                <div className="p-3 rounded-lg border border-slate-700/50 bg-slate-800/30">
                  <p className="text-xs text-slate-400 mb-1">Source</p>
                  <p className="text-sm font-medium text-slate-200 capitalize">
                    {ticket.metadata?.source || 'N/A'}
                  </p>
                </div>
              </div>

              {/* SLA Status */}
              <div className="p-4 rounded-xl border border-slate-700/50 bg-slate-800/30">
                <h3 className="text-sm font-semibold text-slate-300 mb-3">Status SLA</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className={cn(
                    'p-3 rounded-lg border',
                    ticket.sla.firstResponseBreached
                      ? 'border-rose-500/30 bg-rose-500/10'
                      : 'border-emerald-500/30 bg-emerald-500/10'
                  )}>
                    <p className="text-xs text-slate-400 mb-1">Première réponse</p>
                    <p className={cn(
                      'text-sm font-medium',
                      ticket.sla.firstResponseBreached ? 'text-rose-400' : 'text-emerald-400'
                    )}>
                      {ticket.sla.firstResponseBreached ? 'Dépassé' : 'Conforme'}
                    </p>
                  </div>
                  <div className={cn(
                    'p-3 rounded-lg border',
                    ticket.sla.resolutionBreached
                      ? 'border-rose-500/30 bg-rose-500/10'
                      : 'border-emerald-500/30 bg-emerald-500/10'
                  )}>
                    <p className="text-xs text-slate-400 mb-1">Résolution</p>
                    <p className={cn(
                      'text-sm font-medium',
                      ticket.sla.resolutionBreached ? 'text-rose-400' : 'text-emerald-400'
                    )}>
                      {ticket.sla.resolutionBreached ? 'Dépassé' : 'Conforme'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="p-4 rounded-xl border border-slate-700/50 bg-slate-800/30">
                <h3 className="text-sm font-semibold text-slate-300 mb-3">Description</h3>
                <p className="text-sm text-slate-400">{ticket.description}</p>
              </div>

              {/* Messages */}
              <div className="p-4 rounded-xl border border-slate-700/50 bg-slate-800/30">
                <h3 className="text-sm font-semibold text-slate-300 mb-3">
                  Conversation ({ticket.messages.length})
                </h3>
                <div className="space-y-3 max-h-[200px] overflow-y-auto">
                  {ticket.messages.length === 0 ? (
                    <p className="text-sm text-slate-400 text-center py-4">
                      Aucun message pour le moment
                    </p>
                  ) : (
                    ticket.messages.map(msg => (
                      <div
                        key={msg.id}
                        className={cn(
                          'p-3 rounded-lg',
                          msg.authorType === 'client'
                            ? 'bg-slate-800/50 mr-8'
                            : 'bg-purple-500/10 ml-8'
                        )}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-slate-300">
                            {typeof msg.author === 'object' && 'name' in msg.author ? msg.author.name : 'Système'}
                          </span>
                          <span className="text-xs text-slate-600">
                            {new Date(msg.createdAt).toLocaleString('fr-FR')}
                          </span>
                        </div>
                        <p className="text-sm text-slate-400">{msg.content}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* New Message */}
                <div className="mt-4 flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    placeholder="Écrire un message..."
                    className="flex-1 px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                  />
                  <Button onClick={handleSendMessage} disabled={sending || !newMessage.trim()}>
                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12 text-slate-400">
            Ticket non trouvé
          </div>
        )}
      </div>
    </div>
  );
}

// ================================
// KPI Drilldown Modal
// ================================
function KPIDrilldownModal({ onClose, data }: { onClose: () => void; data: Record<string, unknown> }) {
  const kpiId = data.kpiId as string;
  const kpiData = data.kpiData as { label: string; value: number | string; trend?: number };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl border border-slate-700/50 bg-slate-900 p-6"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-slate-100">
            Détail: {kpiData?.label || kpiId}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="p-6 rounded-xl border border-slate-700/50 bg-slate-800/30 mb-6">
          <p className="text-4xl font-bold text-slate-100 text-center">
            {kpiData?.value || '—'}
          </p>
          {kpiData?.trend && (
            <p className={cn(
              'text-center mt-2',
              kpiData.trend > 0 ? 'text-emerald-400' : 'text-rose-400'
            )}>
              {kpiData.trend > 0 ? '↑' : '↓'} {Math.abs(kpiData.trend)}% vs période précédente
            </p>
          )}
        </div>

        <div className="h-64">
          <TicketsTrendChart />
        </div>
      </div>
    </div>
  );
}

// ================================
// Templates Modal
// ================================
function TemplatesModal({ onClose }: { onClose: () => void }) {
  const [templates, setTemplates] = useState<ResponseTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<ResponseTemplate | null>(null);

  useEffect(() => {
    ticketsApi.getResponseTemplates().then(t => {
      setTemplates(t);
      setLoading(false);
    });
  }, []);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl max-h-[80vh] rounded-2xl border border-slate-700/50 bg-slate-900 flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <h2 className="text-lg font-bold flex items-center gap-2 text-slate-100">
            <MessageSquare className="w-5 h-5 text-purple-400" />
            Modèles de réponse
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map(template => (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplate(template)}
                  className={cn(
                    'p-4 rounded-xl border text-left transition-all',
                    selectedTemplate?.id === template.id
                      ? 'border-purple-500/50 bg-purple-500/10'
                      : 'border-slate-700/50 bg-slate-800/30 hover:border-slate-600/50'
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-slate-200">{template.name}</p>
                    <Badge variant="outline" className="text-xs">
                      {template.category}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2">
                    {template.content}
                  </p>
                  <p className="text-xs text-slate-600 mt-2">
                    Utilisé {template.usageCount} fois
                  </p>
                </button>
              ))}
            </div>
          )}

          {selectedTemplate && (
            <div className="mt-6 p-4 rounded-xl border border-purple-500/30 bg-purple-500/10">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-slate-200">{selectedTemplate.name}</h3>
                <Button size="sm" variant="ghost" className="gap-1">
                  <Copy className="w-3 h-3" />
                  Copier
                </Button>
              </div>
              <pre className="text-sm text-slate-400 whitespace-pre-wrap font-sans">
                {selectedTemplate.content}
              </pre>
              {selectedTemplate.variables.length > 0 && (
                <div className="flex items-center gap-2 mt-3">
                  <span className="text-xs text-slate-400">Variables:</span>
                  {selectedTemplate.variables.map(v => (
                    <Badge key={v} variant="outline" className="text-xs">
                      {`{{${v}}}`}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ================================
// Confirm Modal
// ================================
function ConfirmModal({ onClose, data }: { onClose: () => void; data: Record<string, unknown> }) {
  const title = data.title as string || 'Confirmation';
  const message = data.message as string || 'Êtes-vous sûr de vouloir continuer ?';
  const onConfirm = data.onConfirm as (() => void) | undefined;
  const confirmLabel = data.confirmLabel as string || 'Confirmer';
  const variant = data.variant as 'default' | 'destructive' || 'default';

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-slate-700/50 bg-slate-900 p-6"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold text-slate-100 mb-2">{title}</h2>
        <p className="text-sm text-slate-400 mb-6">{message}</p>
        
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            Annuler
          </Button>
          <Button
            variant={variant === 'destructive' ? 'destructive' : 'default'}
            onClick={() => {
              onConfirm?.();
              onClose();
            }}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ================================
// Helper Components
// ================================
interface MetricCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  color: 'blue' | 'rose' | 'amber' | 'emerald' | 'purple';
}

function MetricCard({ icon: Icon, label, value, color }: MetricCardProps) {
  const colors = {
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
    rose: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    purple: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
  };

  return (
    <div className={cn('p-4 rounded-xl border', colors[color])}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4" />
        <span className="text-xs text-slate-400">{label}</span>
      </div>
      <p className="text-2xl font-bold text-slate-100">{value}</p>
    </div>
  );
}

