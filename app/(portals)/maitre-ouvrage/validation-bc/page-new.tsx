'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useValidationBCWorkspaceStore, type ValidationTabType } from '@/lib/stores/validationBCWorkspaceStore';

import { ValidationBCWorkspaceTabs } from '@/components/features/validation-bc/workspace/ValidationBCWorkspaceTabs';
import { ValidationBCWorkspaceContent } from '@/components/features/validation-bc/workspace/ValidationBCWorkspaceContent';
import { ValidationBCLiveCounters } from '@/components/features/validation-bc/workspace/ValidationBCLiveCounters';
import { ValidationBCCommandPalette } from '@/components/features/validation-bc/workspace/ValidationBCCommandPalette';
import { ValidationBCDirectionPanel } from '@/components/features/validation-bc/workspace/ValidationBCDirectionPanel';
import { ValidationBCAlertsBanner } from '@/components/features/validation-bc/workspace/ValidationBCAlertsBanner';
import { ValidationBCNotifications } from '@/components/features/validation-bc/workspace/ValidationBCNotifications';
import { ValidationBCToastProvider, useValidationBCToast } from '@/components/features/validation-bc/workspace/ValidationBCToast';
import { ValidationBCDashboardSkeleton } from '@/components/features/validation-bc/workspace/ValidationBCSkeletons';
import { ValidationBCExportModal } from '@/components/features/validation-bc/workspace/ValidationBCExportModal';
import { ValidationBCStatsModal } from '@/components/features/validation-bc/workspace/ValidationBCStatsModal';
import { ValidationBCWorkflowEngine } from '@/components/features/validation-bc/workspace/ValidationBCWorkflowEngine';
import { ValidationBCPredictiveAnalytics } from '@/components/features/validation-bc/workspace/ValidationBCPredictiveAnalytics';
import { ValidationBCDelegationManager } from '@/components/features/validation-bc/workspace/ValidationBCDelegationManager';
import { ValidationBCRemindersSystem } from '@/components/features/validation-bc/workspace/ValidationBCRemindersSystem';
import { ValidationBCActivityHistory } from '@/components/features/validation-bc/workspace/ValidationBCActivityHistory';
import { 
  ValidationBCFavoritesProvider, 
  ValidationBCQuickFavorites 
} from '@/components/features/validation-bc/workspace/ValidationBCFavorites';

import { getValidationStats, exportDocuments, downloadExport } from '@/lib/services/validation-bc-api';
import type { ValidationStats } from '@/lib/services/validation-bc-api';

import { WorkspaceShell, type ShellAction, type ShellBadge } from '@/components/features/workspace/WorkspaceShell';
import { FluentModal } from '@/components/ui/fluent-modal';
import { FluentButton } from '@/components/ui/fluent-button';

import { useHotkeys } from '@/hooks/useHotkeys';
import {
  FileText,
  Activity,
  HelpCircle,
  RefreshCw,
  Clock,
  Download,
  Shield,
  ToggleLeft,
  ToggleRight,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Receipt,
  FileEdit,
  Bell,
  BellOff,
  ListChecks,
  PieChart,
  TrendingUp,
  AlertCircle,
  Workflow,
  Brain,
  UserCheck,
  Calendar,
  Zap,
  Star,
  StarOff,
  Gavel,
} from 'lucide-react';
import { cn } from '@/lib/cn';

// ================================
// Types
// ================================
type ExportFormat = 'csv' | 'json' | 'pdf';
type ExportQueue = 'all' | 'pending' | 'validated' | 'rejected';
type LoadReason = 'init' | 'manual' | 'auto';

// ================================
// Helpers
// ================================
function safeFRDate(dateStr?: string): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('fr-FR');
}

function downloadBlob(blob: Blob, filename: string): void {
  const a = document.createElement('a');
  const href = URL.createObjectURL(blob);
  a.href = href;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(href);
}

const ActionLabel = ({
  icon,
  text,
  right,
}: {
  icon?: React.ReactNode;
  text: React.ReactNode;
  right?: React.ReactNode;
}) => (
  <span className="inline-flex items-center gap-2 whitespace-nowrap leading-none">
    {icon}
    <span className="leading-none">{text}</span>
    {right}
  </span>
);

const CountChip = ({ v }: { v: number }) => (
  <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-white/10 dark:bg-black/20 border border-slate-200/20 dark:border-slate-700/40">
    {v}
  </span>
);

// ================================
// Custom Hooks
// ================================
function useInterval(fn: () => void, delay: number | null): void {
  const fnRef = useRef(fn);

  useEffect(() => {
    fnRef.current = fn;
  }, [fn]);

  useEffect(() => {
    if (delay === null) return;
    const id = window.setInterval(() => fnRef.current(), delay);
    return () => window.clearInterval(id);
  }, [delay]);
}

// ================================
// Component
// ================================
function ValidationBCPageContent() {
  const { tabs, openTab } = useValidationBCWorkspaceStore();
  const toast = useValidationBCToast();

  // Stats state
  const [statsOpen, setStatsOpen] = useState(false);
  const [statsData, setStatsData] = useState<ValidationStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  // UX state
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [helpOpen, setHelpOpen] = useState(false);

  // Export state
  const [exportOpen, setExportOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat>('csv');
  const [exportQueue, setExportQueue] = useState<ExportQueue>('pending');
  const [exporting, setExporting] = useState(false);

  // Notifications
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Nouveaux modals avancés
  const [workflowOpen, setWorkflowOpen] = useState(false);
  const [workflowDocumentId, setWorkflowDocumentId] = useState<string | undefined>(undefined);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [delegationsOpen, setDelegationsOpen] = useState(false);
  const [remindersOpen, setRemindersOpen] = useState(false);
  const [decisionCenterOpen, setDecisionCenterOpen] = useState(false);

  // Watchlist (pinned views)
  const [pinnedViews, setPinnedViews] = useState<Array<{ key: string; title: string; icon: string; queue: string }>>([]);

  const showDashboard = tabs.length === 0;

  // Load pinned views from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('bmo.validation-bc.pinnedViews.v1');
      if (stored) {
        setPinnedViews(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load pinned views:', e);
    }
  }, []);

  // Save pinned views to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('bmo.validation-bc.pinnedViews.v1', JSON.stringify(pinnedViews));
    } catch (e) {
      console.error('Failed to save pinned views:', e);
    }
  }, [pinnedViews]);

  const pinView = useCallback((view: { key: string; title: string; icon: string; queue: string }) => {
    setPinnedViews((prev) => {
      const exists = prev.some((x) => x.key === view.key);
      if (exists) return prev;
      return [view, ...prev].slice(0, 10);
    });
  }, []);

  const unpinView = useCallback((key: string) => {
    setPinnedViews((prev) => prev.filter((x) => x.key !== key));
  }, []);

  // Abort controllers
  const abortStatsRef = useRef<AbortController | null>(null);

  // ================================
  // Callbacks
  // ================================
  const openInbox = useCallback(
    (queue: ExportQueue, title: string, icon: string) => {
      openTab({
        id: `inbox:${queue}`,
        type: 'inbox' as ValidationTabType,
        title,
        icon,
        data: { queue },
      });
    },
    [openTab]
  );

  const openDocument = useCallback(
    (documentId: string, type: 'bc' | 'facture' | 'avenant') => {
      openTab({
        id: `document:${type}:${documentId}`,
        type: type as ValidationTabType,
        title: documentId,
        icon: type === 'bc' ? '📄' : type === 'facture' ? '🧾' : '📝',
        data: { documentId, type },
      });
    },
    [openTab]
  );

  const openCreateWizard = useCallback(() => {
    openTab({
      id: `wizard:create:${Date.now()}`,
      type: 'wizard' as ValidationTabType,
      title: 'Nouveau document',
      icon: '➕',
      data: { action: 'create' },
    });
  }, [openTab]);

  // ================================
  // Load Stats
  // ================================
  const loadStats = useCallback(
    async (reason: LoadReason = 'manual') => {
      abortStatsRef.current?.abort();
      const ac = new AbortController();
      abortStatsRef.current = ac;

      setStatsLoading(true);
      setStatsError(null);

      try {
        const stats = await getValidationStats(reason, ac.signal);
        setStatsData(stats);
        setLastUpdated(new Date().toISOString());

        if (reason === 'manual') {
          toast.success('Statistiques actualisées', `${stats.total} documents au total`);
        }
      } catch (e: unknown) {
        if (e instanceof Error && e.name === 'AbortError') return;
        const errorMsg = 'Impossible de charger les stats (réseau ou API).';
        setStatsData(null);
        setStatsError(errorMsg);
        if (reason === 'manual') {
          toast.error('Erreur réseau', errorMsg);
        }
      } finally {
        setStatsLoading(false);
      }
    },
    [toast]
  );

  // ================================
  // Export
  // ================================
  const doExport = useCallback(
    async (format: ExportFormat) => {
      setExporting(true);

      try {
        const blob = await exportDocuments(format, { queue: exportQueue });
        const filename = `validation-bc_${exportQueue}_${new Date().toISOString().slice(0, 10)}.${format}`;
        downloadExport(blob, filename);
        toast.success('Export réussi', `Fichier ${filename} téléchargé`);
      } catch (error) {
        console.error('Export error:', error);
        toast.error('Erreur réseau', 'Export impossible');
      } finally {
        setExporting(false);
      }
    },
    [exportQueue, toast]
  );

  // ================================
  // Effects
  // ================================
  useEffect(() => {
    loadStats('init');
    return () => {
      abortStatsRef.current?.abort();
    };
  }, [loadStats]);

  // Auto refresh
  useInterval(
    () => {
      if (!autoRefresh) return;
      if (!showDashboard && !statsOpen) return;

      loadStats('auto');
    },
    autoRefresh ? 60_000 : null
  );

  // Event listeners
  useEffect(() => {
    const handleOpenStats = () => {
      setStatsOpen(true);
      loadStats('manual');
    };
    const handleOpenExport = () => setExportOpen(true);
    const handleOpenHelp = () => setHelpOpen(true);

    window.addEventListener('validation-bc:open-stats', handleOpenStats);
    window.addEventListener('validation-bc:open-export', handleOpenExport);
    window.addEventListener('validation-bc:open-help', handleOpenHelp);

    return () => {
      window.removeEventListener('validation-bc:open-stats', handleOpenStats);
      window.removeEventListener('validation-bc:open-export', handleOpenExport);
      window.removeEventListener('validation-bc:open-help', handleOpenHelp);
    };
  }, [loadStats]);

  // ================================
  // Hotkeys
  // ================================
  useHotkeys('ctrl+1', () => openInbox('pending', 'En attente', '⏰'), [openInbox]);
  useHotkeys('ctrl+2', () => openInbox('validated', 'Validés', '✅'), [openInbox]);
  useHotkeys('ctrl+3', () => openInbox('rejected', 'Rejetés', '❌'), [openInbox]);

  useHotkeys(
    'ctrl+n',
    (e: KeyboardEvent) => {
      e.preventDefault();
      openCreateWizard();
    },
    [openCreateWizard]
  );

  useHotkeys(
    'ctrl+s',
    (e: KeyboardEvent) => {
      e.preventDefault();
      setStatsOpen(true);
      loadStats('manual');
    },
    [loadStats]
  );

  useHotkeys(
    'ctrl+e',
    (e: KeyboardEvent) => {
      e.preventDefault();
      setExportOpen(true);
    },
    []
  );

  useHotkeys(
    'ctrl+k',
    (e: KeyboardEvent) => {
      e.preventDefault();
      window.dispatchEvent(new CustomEvent('validation-bc:open-command-palette'));
    },
    []
  );

  useHotkeys('shift+?', () => setHelpOpen(true), []);

  useHotkeys(
    'escape',
    () => {
      setStatsOpen(false);
      setHelpOpen(false);
      setExportOpen(false);
    },
    []
  );

  // ================================
  // Computed Values
  // ================================
  const riskBadge = useMemo(() => {
    if (!statsData) return null;

    const riskScore = (statsData.anomalies || 0) * 3 + (statsData.urgent || 0) * 2 + (statsData.pending || 0) * 1;

    if (riskScore >= 30) return { label: 'Risque élevé', color: 'rose' as const };
    if (riskScore >= 15) return { label: 'Risque modéré', color: 'amber' as const };
    return { label: 'Risque maîtrisé', color: 'emerald' as const };
  }, [statsData]);

  const badges: ShellBadge[] = useMemo(() => {
    if (!statsData) {
      return [
        {
          label: statsLoading ? 'Chargement…' : statsError ?? 'Stats non disponibles',
          color: statsError ? 'rose' : 'slate',
        },
        {
          label: autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF',
          color: autoRefresh ? 'emerald' : 'slate',
        },
      ];
    }

    const result: ShellBadge[] = [
      { label: `${statsData.pending} en attente`, color: 'amber' },
      { label: `${statsData.validated} validés`, color: 'emerald' },
      {
        label: autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF',
        color: autoRefresh ? 'emerald' : 'slate',
      },
    ];

    if (statsData.anomalies > 0) {
      result.splice(1, 0, { label: `${statsData.anomalies} anomalies`, color: 'rose' });
    }
    if (riskBadge) result.push(riskBadge);
    if (lastUpdated) result.push({ label: `MAJ ${safeFRDate(lastUpdated)}`, color: 'slate' });

    return result;
  }, [statsData, statsLoading, statsError, autoRefresh, lastUpdated, riskBadge]);

  // ================================
  // Actions
  // ================================
  const actions: ShellAction[] = useMemo(() => {
    const n = statsData ?? { pending: 0, validated: 0, rejected: 0, anomalies: 0, urgent: 0 };

    return [
      {
        id: 'create',
        label: <ActionLabel icon={<Plus className="w-4 h-4" />} text="Nouveau" />,
        variant: 'primary',
        title: 'Ctrl+N',
        onClick: openCreateWizard,
      },
      {
        id: 'pending',
        label: <ActionLabel text={<>⏰ En attente</> } right={<CountChip v={n.pending} />} />,
        variant: 'warning',
        title: 'Ctrl+1',
        onClick: () => openInbox('pending', 'En attente', '⏰'),
      },
      {
        id: 'validated',
        label: <ActionLabel text={<>✅ Validés</>} right={<CountChip v={n.validated} />} />,
        variant: 'success',
        title: 'Ctrl+2',
        onClick: () => openInbox('validated', 'Validés', '✅'),
      },
      {
        id: 'rejected',
        label: <ActionLabel text={<>❌ Rejetés</>} right={<CountChip v={n.rejected} />} />,
        variant: 'destructive',
        title: 'Ctrl+3',
        onClick: () => openInbox('rejected', 'Rejetés', '❌'),
      },
      {
        id: 'notifications',
        label: (
          <ActionLabel
            icon={notificationsEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
            text="Alertes"
            right={n.anomalies > 0 ? <CountChip v={n.anomalies} /> : undefined}
          />
        ),
        variant: n.anomalies > 0 ? 'destructive' : 'secondary',
        title: 'Notifications',
        onClick: () => setNotificationsOpen(true),
      },
      {
        id: 'stats',
        label: <ActionLabel icon={<PieChart className="w-4 h-4" />} text="Stats" />,
        variant: 'primary',
        title: 'Ctrl+S',
        onClick: () => {
          setStatsOpen(true);
          loadStats('manual');
        },
      },
      {
        id: 'export',
        label: <ActionLabel icon={<Download className="w-4 h-4" />} text="Export" />,
        variant: 'secondary',
        title: 'Ctrl+E',
        onClick: () => setExportOpen(true),
      },
      {
        id: 'auto',
        label: (
          <ActionLabel
            icon={autoRefresh ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
            text="Auto"
          />
        ),
        variant: autoRefresh ? 'success' : 'secondary',
        title: 'Auto-refresh (1 min)',
        onClick: () => setAutoRefresh((v) => !v),
      },
      {
        id: 'workflow',
        label: <ActionLabel icon={<Workflow className="w-4 h-4" />} text="Workflow" />,
        variant: 'secondary',
        title: 'Voir le workflow',
        onClick: () => setWorkflowOpen(true),
      },
      {
        id: 'analytics',
        label: <ActionLabel icon={<Brain className="w-4 h-4" />} text="IA" />,
        variant: 'primary',
        title: 'Analytics prédictifs',
        onClick: () => setAnalyticsOpen(true),
      },
      {
        id: 'delegations',
        label: <ActionLabel icon={<UserCheck className="w-4 h-4" />} text="Délégations" />,
        variant: 'secondary',
        title: 'Gérer les délégations',
        onClick: () => setDelegationsOpen(true),
      },
      {
        id: 'reminders',
        label: <ActionLabel icon={<Calendar className="w-4 h-4" />} text="Rappels" />,
        variant: 'secondary',
        title: 'Rappels & Échéances',
        onClick: () => setRemindersOpen(true),
      },
      {
        id: 'decision',
        label: <ActionLabel icon={<Gavel className="w-4 h-4" />} text="Décision" />,
        variant: 'warning',
        title: 'Centre de décision — Arbitrages',
        onClick: () => setDecisionCenterOpen(true),
      },
      {
        id: 'help',
        label: <ActionLabel icon={<HelpCircle className="w-4 h-4" />} text="Aide" />,
        variant: 'secondary',
        title: 'Shift+?',
        onClick: () => setHelpOpen(true),
      },
      {
        id: 'refresh',
        label: <ActionLabel icon={<RefreshCw className={cn('w-4 h-4', statsLoading && 'animate-spin')} />} text="Rafraîchir" />,
        variant: 'secondary',
        title: 'Rafraîchir',
        disabled: statsLoading,
        onClick: () => loadStats('manual'),
      },
    ];
  }, [statsData, openInbox, openCreateWizard, loadStats, statsLoading, autoRefresh, notificationsEnabled]);

  // ================================
  // Banner
  // ================================
  const banner = useMemo(() => {
    if (!statsData || statsData.urgent <= 0) return null;

    return (
      <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 flex flex-col md:flex-row md:items-center gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <Clock className="w-6 h-6 text-amber-700 flex-none mt-0.5" />
          <div className="min-w-0">
            <div className="font-semibold text-amber-900 dark:text-amber-300">
              {statsData.urgent} document{statsData.urgent > 1 ? 's' : ''} urgent{statsData.urgent > 1 ? 's' : ''}
            </div>
            <p className="text-sm text-amber-800/90 dark:text-amber-200/90">
              Ces documents nécessitent une validation rapide pour respecter les délais.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 md:ml-auto flex-wrap">
          <FluentButton size="sm" variant="warning" onClick={() => openInbox('pending', 'En attente', '⏰')}>
            Voir la file
          </FluentButton>
        </div>
      </div>
    );
  }, [statsData, openInbox]);

  // ================================
  // Dashboard
  // ================================
  const dashboard = useMemo(() => {
    return (
      <div className="space-y-4">
        {/* Bannière d'alertes */}
        <ValidationBCAlertsBanner />

        {/* Quick Favorites - Documents épinglés */}
        <div className="flex items-center gap-4 flex-wrap">
          <ValidationBCQuickFavorites onOpenDocument={(id) => openDocument(id, 'bc')} />
        </div>

        {/* Skeleton loader */}
        {statsLoading && !statsData ? (
          <ValidationBCDashboardSkeleton />
        ) : (
          <>
            {/* Compteurs live */}
            <ValidationBCLiveCounters />

            {/* Vues épinglées (Watchlist) */}
            {pinnedViews.length > 0 && (
              <div className="rounded-2xl border border-amber-200/70 bg-amber-50/50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-500" />
                    <span className="font-semibold">Vues épinglées</span>
                    <span className="text-xs text-slate-500">({pinnedViews.length})</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {pinnedViews.map((v) => (
                    <button
                      key={v.key}
                      type="button"
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200/70 dark:border-slate-700/60 bg-white/70 dark:bg-[#141414]/50 hover:bg-white dark:hover:bg-[#141414]/80 transition-colors"
                      onClick={() => openInbox(v.queue as ExportQueue, v.title, v.icon)}
                      title="Ouvrir"
                    >
                      <span className="text-sm">{v.icon}</span>
                      <span className="text-sm">{v.title}</span>
                      <span
                        className="inline-flex items-center justify-center w-6 h-6 rounded-lg hover:bg-amber-500/20"
                        onClick={(e) => {
                          e.stopPropagation();
                          unpinView(v.key);
                        }}
                        title="Retirer"
                      >
                        <StarOff className="w-3.5 h-3.5 text-slate-400" />
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Panneau direction */}
            <ValidationBCDirectionPanel />

            {/* Bloc analytics si stats ok */}
            {statsData && (
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                {/* Par bureau */}
                <div className="xl:col-span-1 rounded-2xl border border-slate-200/70 bg-white/80 p-4 dark:border-slate-800 dark:bg-[#1f1f1f]/70">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-500" />
                    Par bureau
                  </h3>

                  <div className="space-y-2">
                    {statsData.byBureau.slice(0, 7).map((b) => {
                      const denom = Math.max(1, statsData.total);
                      const w = Math.round(Math.min(160, (b.count / denom) * 160));
                      return (
                        <div key={b.bureau} className="flex items-center justify-between gap-3">
                          <span className="text-sm truncate">{b.bureau}</span>
                          <div className="flex items-center gap-2 flex-none">
                            <div className="h-2 bg-blue-500/30 rounded-full" style={{ width: `${w}px` }} />
                            <span className="text-sm font-mono text-slate-500 w-10 text-right">{b.count}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Par type */}
                <div className="xl:col-span-1 rounded-2xl border border-slate-200/70 bg-white/80 p-4 dark:border-slate-800 dark:bg-[#1f1f1f]/70">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-purple-500" />
                    Par type de document
                  </h3>

                  <div className="space-y-2">
                    {statsData.byType.slice(0, 8).map((t) => (
                      <div key={t.type} className="flex items-center justify-between">
                        <span className="text-sm truncate">{t.type}</span>
                        <span className="text-sm font-mono text-slate-500">{t.count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Activité récente - Composant avancé */}
                <div className="xl:col-span-1">
                  <ValidationBCActivityHistory 
                    limit={5} 
                    showFilters={true}
                    onViewDocument={(id) => openDocument(id, 'bc')} 
                  />
                </div>
              </div>
            )}

            {/* Bloc gouvernance */}
            <div className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-4 dark:border-purple-500/30 dark:bg-purple-500/10">
              <div className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-purple-500 flex-none" />
                <div className="flex-1">
                  <h3 className="font-bold text-purple-700 dark:text-purple-300">
                    Traçabilité & Gouvernance
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    Chaque validation est enregistrée avec signature numérique et horodatage pour garantir la traçabilité complète.
                  </p>
                </div>
              </div>
            </div>

            {/* Erreur stats */}
            {!statsData && statsError && (
              <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 flex items-center justify-between gap-3">
                <div className="text-sm text-rose-800 dark:text-rose-300">{statsError}</div>
                <FluentButton size="sm" variant="secondary" onClick={() => loadStats('manual')}>
                  Réessayer
                </FluentButton>
              </div>
            )}
          </>
        )}
      </div>
    );
  }, [statsData, statsError, statsLoading, loadStats]);

  // ================================
  // Render
  // ================================
  return (
    <>
      <WorkspaceShell
        icon={<FileCheck className="w-6 h-6 text-purple-500" />}
        title="Console métier — Validation BC"
        subtitle="Validation intelligente des bons de commande, factures et avenants avec contrôle intégral."
        badges={badges}
        actions={actions}
        actionSeparators={[0, 4]}
        Banner={banner}
        Tabs={<ValidationBCWorkspaceTabs />}
        showDashboard={showDashboard}
        Dashboard={dashboard}
        Content={<ValidationBCWorkspaceContent />}
        FooterOverlays={
          <>
            <ValidationBCCommandPalette />
            <ValidationBCNotifications />
          </>
        }
      />

      {/* ============================= */}
      {/* MODALES */}
      {/* ============================= */}

      {/* Stats Modal */}
      <ValidationBCStatsModal />

      {/* Export Modal */}
      <ValidationBCExportModal open={exportOpen} onClose={() => setExportOpen(false)} onExport={doExport} />

      {/* Workflow Engine */}
      <ValidationBCWorkflowEngine
        open={workflowOpen}
        onClose={() => {
          setWorkflowOpen(false);
          setWorkflowDocumentId(undefined);
        }}
        documentId={workflowDocumentId}
      />

      {/* Predictive Analytics */}
      <ValidationBCPredictiveAnalytics
        open={analyticsOpen}
        onClose={() => setAnalyticsOpen(false)}
      />

      {/* Delegation Manager */}
      <ValidationBCDelegationManager
        open={delegationsOpen}
        onClose={() => setDelegationsOpen(false)}
      />

      {/* Reminders System */}
      <ValidationBCRemindersSystem
        open={remindersOpen}
        onClose={() => setRemindersOpen(false)}
      />

      {/* Help Modal */}
      <FluentModal open={helpOpen} title="Raccourcis clavier" onClose={() => setHelpOpen(false)}>
        <div className="space-y-3 text-sm">
          <div className="font-semibold text-slate-600 dark:text-slate-300 mb-2">Création</div>
          <div className="flex justify-between">
            <span>Nouveau document</span>
            <kbd className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono">Ctrl+N</kbd>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-700 my-3" />

          <div className="font-semibold text-slate-600 dark:text-slate-300 mb-2">Files</div>
          <div className="flex justify-between">
            <span>En attente</span>
            <kbd className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono">Ctrl+1</kbd>
          </div>
          <div className="flex justify-between">
            <span>Validés</span>
            <kbd className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono">Ctrl+2</kbd>
          </div>
          <div className="flex justify-between">
            <span>Rejetés</span>
            <kbd className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono">Ctrl+3</kbd>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-700 my-3" />

          <div className="font-semibold text-slate-600 dark:text-slate-300 mb-2">Actions</div>
          <div className="flex justify-between">
            <span>Stats Live</span>
            <kbd className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono">Ctrl+S</kbd>
          </div>
          <div className="flex justify-between">
            <span>Export</span>
            <kbd className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono">Ctrl+E</kbd>
          </div>
          <div className="flex justify-between">
            <span>Palette de commandes</span>
            <kbd className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono">Ctrl+K</kbd>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-700 my-3" />

          <div className="flex justify-between">
            <span>Aide</span>
            <kbd className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono">Shift+?</kbd>
          </div>
          <div className="flex justify-between">
            <span>Fermer modales</span>
            <kbd className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono">Esc</kbd>
          </div>
        </div>
      </FluentModal>

      {/* Centre de Décision Modal */}
      <FluentModal 
        open={decisionCenterOpen} 
        title="Centre de décision — Arbitrages"
        onClose={() => setDecisionCenterOpen(false)}
      >
        <div className="space-y-4">
          {/* Introduction */}
          <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/10">
            <div className="font-semibold text-amber-900 dark:text-amber-200">
              Objectif : trancher rapidement et garder une traçabilité impeccable.
            </div>
            <div className="text-sm text-amber-800/90 dark:text-amber-200/90 mt-1">
              Raccourcis : Ctrl+1 (En attente) • Ctrl+2 (Validés) • Ctrl+3 (Rejetés)
            </div>
          </div>

          {/* Actions rapides */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button
              type="button"
              className="p-4 rounded-2xl border border-amber-500/20 bg-white/70 dark:bg-[#141414]/40 hover:bg-white dark:hover:bg-[#141414]/70 transition-colors text-left group"
              onClick={() => {
                openInbox('pending', 'En attente', '⏰');
                setDecisionCenterOpen(false);
              }}
            >
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-600 group-hover:scale-110 transition-transform" />
                <div className="font-semibold">Documents en attente</div>
                {statsData && (
                  <span className="ml-auto px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
                    {statsData.pending}
                  </span>
                )}
              </div>
              <div className="text-sm text-slate-500 mt-1">
                Valider ou rejeter les documents en attente.
              </div>
            </button>

            <button
              type="button"
              className="p-4 rounded-2xl border border-rose-500/20 bg-white/70 dark:bg-[#141414]/40 hover:bg-white dark:hover:bg-[#141414]/70 transition-colors text-left group"
              onClick={() => {
                setAnalyticsOpen(true);
                setDecisionCenterOpen(false);
              }}
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-600 group-hover:scale-110 transition-transform" />
                <div className="font-semibold">Anomalies détectées</div>
                {statsData && statsData.anomalies > 0 && (
                  <span className="ml-auto px-2 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700">
                    {statsData.anomalies}
                  </span>
                )}
              </div>
              <div className="text-sm text-slate-500 mt-1">
                Analyser et résoudre les anomalies signalées par l'IA.
              </div>
            </button>

            <button
              type="button"
              className="p-4 rounded-2xl border border-purple-500/20 bg-white/70 dark:bg-[#141414]/40 hover:bg-white dark:hover:bg-[#141414]/70 transition-colors text-left group"
              onClick={() => {
                setWorkflowOpen(true);
                setDecisionCenterOpen(false);
              }}
            >
              <div className="flex items-center gap-2">
                <Workflow className="w-5 h-5 text-purple-600 group-hover:scale-110 transition-transform" />
                <div className="font-semibold">Workflow bloqué</div>
              </div>
              <div className="text-sm text-slate-500 mt-1">
                Débloquer les documents en attente de validation.
              </div>
            </button>

            <button
              type="button"
              className="p-4 rounded-2xl border border-blue-500/20 bg-white/70 dark:bg-[#141414]/40 hover:bg-white dark:hover:bg-[#141414]/70 transition-colors text-left group"
              onClick={() => {
                setDelegationsOpen(true);
                setDecisionCenterOpen(false);
              }}
            >
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
                <div className="font-semibold">Délégations</div>
              </div>
              <div className="text-sm text-slate-500 mt-1">
                Gérer les délégations de pouvoir actives.
              </div>
            </button>
          </div>

          {/* Épingler une vue */}
          <div className="p-4 rounded-xl border border-slate-200/70 bg-slate-50/50 dark:border-slate-700 dark:bg-slate-800/30">
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-4 h-4 text-amber-500" />
              <span className="font-semibold text-sm">Épingler une vue rapide</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'pending', title: 'En attente', icon: '⏰', queue: 'pending' },
                { key: 'validated', title: 'Validés', icon: '✅', queue: 'validated' },
                { key: 'rejected', title: 'Rejetés', icon: '❌', queue: 'rejected' },
                { key: 'urgent', title: 'Urgents', icon: '🚨', queue: 'all' },
              ].map((v) => {
                const isPinned = pinnedViews.some((p) => p.key === v.key);
                return (
                  <button
                    key={v.key}
                    onClick={() => isPinned ? unpinView(v.key) : pinView(v)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2",
                      isPinned
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                        : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200"
                    )}
                  >
                    <span>{v.icon}</span>
                    <span>{v.title}</span>
                    {isPinned ? <Star className="w-3 h-3 fill-current" /> : <Star className="w-3 h-3" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 pt-2">
            <FluentButton size="sm" variant="secondary" onClick={() => setDecisionCenterOpen(false)}>
              Fermer
            </FluentButton>
            <FluentButton size="sm" variant="primary" onClick={() => { openCreateWizard(); setDecisionCenterOpen(false); }}>
              <Plus className="w-4 h-4 mr-2" />
              Nouveau document
            </FluentButton>
          </div>
        </div>
      </FluentModal>
    </>
  );
}

// ================================
// Main Component with Provider
// ================================
export default function ValidationBCPage() {
  return (
    <ValidationBCFavoritesProvider>
      <ValidationBCToastProvider>
        <ValidationBCPageContent />
      </ValidationBCToastProvider>
    </ValidationBCFavoritesProvider>
  );
}

