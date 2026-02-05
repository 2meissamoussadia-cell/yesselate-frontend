'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDelegationWorkspaceStore, type DelegationTabType } from '@/lib/stores/delegationWorkspaceStore';

import { DelegationWorkspaceTabs } from '@/components/features/delegations/workspace/DelegationWorkspaceTabs';
import { DelegationWorkspaceContent } from '@/components/features/delegations/workspace/DelegationWorkspaceContent';
import { DelegationLiveCounters } from '@/components/features/delegations/workspace/DelegationLiveCounters';
import { DelegationCommandPalette } from '@/components/features/delegations/workspace/DelegationCommandPalette';
import { DelegationDirectionPanel } from '@/components/features/delegations/workspace/DelegationDirectionPanel';
import { DelegationAlertsBanner } from '@/components/features/delegations/workspace/DelegationAlertsBanner';
import { DelegationBatchActions } from '@/components/features/delegations/workspace/DelegationBatchActions';
import { DelegationTimeline } from '@/components/features/delegations/workspace/DelegationTimeline';
import { DelegationNotifications } from '@/components/features/delegations/workspace/DelegationNotifications';
import { DelegationToastProvider, useDelegationToast } from '@/components/features/delegations/workspace/DelegationToast';
import { DelegationDashboardSkeleton } from '@/components/features/delegations/workspace/DelegationSkeletons';
import { DelegationExportModal } from '@/components/features/delegations/workspace/DelegationExportModal';
import { DelegationSearchPanel } from '@/components/features/delegations/workspace/DelegationSearchPanel';
import { DelegationActiveFilters } from '@/components/features/delegations/workspace/DelegationActiveFilters';
import { DelegationStatsModal } from '@/components/features/delegations/workspace/DelegationStatsModal';

import { WorkspaceShell, type ShellAction, type ShellBadge } from '@/components/features/workspace/WorkspaceShell';
import { FluentModal } from '@/components/ui/fluent-modal';
import { FluentButton } from '@/components/ui/fluent-button';

import { useHotkeys } from '@/hooks/useHotkeys';
import {
  Key,
  Activity,
  HelpCircle,
  RefreshCw,
  Clock,
  Download,
  Building2,
  Shield,
  ToggleLeft,
  ToggleRight,
  FileText,
  Plus,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  Star,
  StarOff,
  ArrowRight,
  ListChecks,
  Search,
  Bell,
  BellOff,
  CheckSquare,
  Square,
  Trash2,
  Play,
  Pause,
  RotateCcw,
  ArrowUpDown,
  Filter,
  X,
  ChevronDown,
  ChevronUp,
  Calendar,
  Users,
  Zap,
  TrendingUp,
  AlertCircle,
  Copy,
  ExternalLink,
  PieChart,
  BarChart2,
} from 'lucide-react';
import { cn } from '@/lib/cn';

// ================================
// Types
// ================================
interface DelegationStats {
  total: number;
  active: number;
  expired: number;
  revoked: number;
  suspended: number;
  expiringSoon: number;
  totalUsage: number;
  byBureau: { bureau: string; count: number }[];
  byType: { type: string; count: number }[];
  recentActivity: {
    id: string;
    delegationId: string;
    delegationType: string;
    agentName: string;
    action: string;
    actorName: string;
    details: string | null;
    createdAt: string;
  }[];
  ts: string;
}

interface VerifyResult {
  id: string;
  valid: boolean;
  message: string;
}

// Items minimalistes pour "centre de décision" (API /api/delegations)
type DelegationQueue = 'all' | 'active' | 'expiring_soon' | 'expired' | 'revoked' | 'suspended';

interface DelegationListItem {
  id: string;
  code?: string;
  title?: string;
  type?: string;
  status?: string;
  bureau?: string;
  agentName?: string;
  actorName?: string;
  expiresAt?: string;
  updatedAt?: string;
  maxAmount?: number;
  usageCount?: number;
  daysLeft?: number;
}

// Tri & Filtres avancés
type SortField = 'id' | 'expiresAt' | 'bureau' | 'type' | 'daysLeft';
type SortDirection = 'asc' | 'desc';

interface DecisionFilters {
  bureau: string;
  type: string;
  daysLeftMax: number | null;
}

// Notifications
interface CriticalNotification {
  id: string;
  delegationId: string;
  type: 'expiring_critical' | 'suspended_long' | 'high_usage' | 'anomaly';
  message: string;
  severity: 'critical' | 'warning' | 'info';
  createdAt: string;
  dismissed?: boolean;
}

// Bulk action types
type BulkAction = 'extend' | 'suspend' | 'revoke' | 'export' | 'pin';

// Export
type ExportFormat = 'csv' | 'json' | 'pdf';
type ExportQueue = DelegationQueue;
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

// IMPORTANT : empêche les labels de "casser" en colonne dans certains boutons
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

// localStorage safe
const LS_PINNED = 'bmo.delegations.pinned.v1';
const readPinned = (): string[] => {
  try {
    const raw = localStorage.getItem(LS_PINNED);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
};
const writePinned = (ids: string[]) => {
  try {
    localStorage.setItem(LS_PINNED, JSON.stringify(ids.slice(0, 50)));
  } catch {
    // no-op
  }
};

// Notifications localStorage
const LS_NOTIFICATIONS_DISMISSED = 'bmo.delegations.notifications.dismissed.v1';
const readDismissedNotifications = (): string[] => {
  try {
    const raw = localStorage.getItem(LS_NOTIFICATIONS_DISMISSED);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
};
const writeDismissedNotifications = (ids: string[]) => {
  try {
    localStorage.setItem(LS_NOTIFICATIONS_DISMISSED, JSON.stringify(ids.slice(0, 100)));
  } catch {
    // no-op
  }
};

// Helpers pour calculs
function getDaysLeft(expiresAt?: string): number | null {
  if (!expiresAt) return null;
  const d = new Date(expiresAt);
  if (Number.isNaN(d.getTime())) return null;
  const diff = d.getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function formatAmount(amount?: number): string {
  if (amount === undefined || amount === null) return '—';
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(amount);
}

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
function DelegationsPageContent() {
  const { tabs, openTab } = useDelegationWorkspaceStore();
  const toast = useDelegationToast();

  // Stats state
  const [statsOpen, setStatsOpen] = useState(false);
  const [statsData, setStatsData] = useState<DelegationStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  // UX state
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [helpOpen, setHelpOpen] = useState(false);
  const [searchPanelOpen, setSearchPanelOpen] = useState(false);

  // Export state
  const [exportOpen, setExportOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat>('csv');
  const [exportQueue, setExportQueue] = useState<ExportQueue>('active');
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  // Verify state
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyResults, setVerifyResults] = useState<VerifyResult[]>([]);

  // Centre de décision (expiring soon)
  const [decisionOpen, setDecisionOpen] = useState(false);
  const [decisionLoading, setDecisionLoading] = useState(false);
  const [decisionError, setDecisionError] = useState<string | null>(null);
  const [decisionItems, setDecisionItems] = useState<DelegationListItem[]>([]);
  const [decisionQuery, setDecisionQuery] = useState('');

  // Watchlist
  const [pinned, setPinned] = useState<string[]>([]);

  // Bulk selection
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [bulkActionOpen, setBulkActionOpen] = useState(false);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  // Decision center enhanced
  const [decisionSort, setDecisionSort] = useState<{ field: SortField; direction: SortDirection }>({ field: 'daysLeft', direction: 'asc' });
  const [decisionFilters, setDecisionFilters] = useState<DecisionFilters>({ bureau: '', type: '', daysLeftMax: null });
  const [decisionFiltersOpen, setDecisionFiltersOpen] = useState(false);

  // Notifications
  const [notifications, setNotifications] = useState<CriticalNotification[]>([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [dismissedNotifications, setDismissedNotifications] = useState<string[]>([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Quick actions modal
  const [quickActionOpen, setQuickActionOpen] = useState(false);
  const [quickActionItem, setQuickActionItem] = useState<DelegationListItem | null>(null);
  const [quickActionLoading, setQuickActionLoading] = useState(false);

  // Batch actions modal
  const [batchOpen, setBatchOpen] = useState(false);
  const [batchAction, setBatchAction] = useState<'extend' | 'revoke' | 'suspend' | 'reactivate'>('extend');
  const [batchItems, setBatchItems] = useState<DelegationListItem[]>([]);

  // Timeline modal
  const [timelineOpen, setTimelineOpen] = useState(false);
  const [timelineDelegationId, setTimelineDelegationId] = useState<string | undefined>(undefined);

  const showDashboard = tabs.length === 0;

  // Abort controllers
  const abortStatsRef = useRef<AbortController | null>(null);
  const abortDecisionRef = useRef<AbortController | null>(null);
  const abortVerifyRef = useRef<AbortController | null>(null);

  // init pinned & dismissed notifications
  useEffect(() => {
    // localStorage only client-side
    setPinned(readPinned());
    setDismissedNotifications(readDismissedNotifications());
  }, []);

  // persist pinned
  useEffect(() => {
    writePinned(pinned);
  }, [pinned]);

  // persist dismissed notifications
  useEffect(() => {
    writeDismissedNotifications(dismissedNotifications);
  }, [dismissedNotifications]);

  // ================================
  // Callbacks
  // ================================
  const openInbox = useCallback(
    (queue: ExportQueue, title: string, icon: string) => {
      openTab({
        id: `inbox:${queue}`,
        type: 'inbox' as DelegationTabType,
        title,
        icon,
        data: { queue },
      });
    },
    [openTab]
  );

  const openDelegation = useCallback(
    (delegationId: string) => {
      openTab({
        id: `delegation:${delegationId}`,
        type: 'delegation' as DelegationTabType,
        title: delegationId,
        icon: '🔑',
        data: { delegationId },
      });
    },
    [openTab]
  );

  const openCreateWizard = useCallback(() => {
    openTab({
      id: `wizard:create:${Date.now()}`,
      type: 'wizard' as DelegationTabType,
      title: 'Nouvelle délégation',
      icon: '➕',
      data: { action: 'create' },
    });
  }, [openTab]);

  const togglePin = useCallback((id: string) => {
    setPinned((prev) => {
      const has = prev.includes(id);
      const next = has ? prev.filter((x) => x !== id) : [id, ...prev];
      return next.slice(0, 50);
    });
  }, []);

  // Bulk selection
  const toggleSelectItem = useCallback((id: string) => {
    setSelectedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const selectAllItems = useCallback((items: DelegationListItem[]) => {
    setSelectedItems(new Set(items.map((it) => it.id)));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedItems(new Set());
  }, []);

  // Quick action sur une délégation (placeholder - will be updated later)
  const openQuickAction = useCallback((item: DelegationListItem) => {
    setQuickActionItem(item);
    setQuickActionOpen(true);
  }, []);

  // Dismiss notification
  const dismissNotification = useCallback((id: string) => {
    setDismissedNotifications((prev) => [...prev, id].slice(0, 100));
  }, []);

  // Generate notifications from stats
  const generateNotifications = useCallback((stats: DelegationStats, items: DelegationListItem[]): CriticalNotification[] => {
    const notifs: CriticalNotification[] = [];
    const now = Date.now();
    
    // Délégations expirant dans moins de 3 jours
    items.forEach((item) => {
      const daysLeft = getDaysLeft(item.expiresAt);
      if (daysLeft !== null && daysLeft <= 3 && daysLeft >= 0) {
        notifs.push({
          id: `expiring-${item.id}`,
          delegationId: item.id,
          type: 'expiring_critical',
          message: `${item.id} expire dans ${daysLeft} jour${daysLeft > 1 ? 's' : ''}`,
          severity: daysLeft <= 1 ? 'critical' : 'warning',
          createdAt: new Date(now).toISOString(),
        });
      }
    });
    
    // Alerte si beaucoup de révoquées
    if (stats.revoked > 5) {
      notifs.push({
        id: `high-revoked-${stats.ts}`,
        delegationId: '',
        type: 'anomaly',
        message: `${stats.revoked} délégations révoquées - vérifier les anomalies`,
        severity: 'warning',
        createdAt: stats.ts,
      });
    }
    
    return notifs;
  }, []);

  // ================================
  // Load Stats
  // ================================
  const loadStats = useCallback(async (reason: LoadReason = 'manual') => {
    abortStatsRef.current?.abort();
    const ac = new AbortController();
    abortStatsRef.current = ac;

    setStatsLoading(true);
    setStatsError(null);

    try {
      const res = await fetch('/api/delegations/stats', {
        cache: 'no-store',
        signal: ac.signal,
        headers: { 'x-bmo-reason': reason },
      });

      if (!res.ok) {
        const errorMsg = `Stats indisponibles (HTTP ${res.status})`;
        setStatsData(null);
        setStatsError(errorMsg);
        if (reason === 'manual') {
          toast.error('Erreur de chargement', errorMsg);
        }
        return;
      }

      const data = (await res.json()) as DelegationStats;
      setStatsData(data);
      setLastUpdated(new Date().toISOString());
      
      if (reason === 'manual') {
        toast.success('Statistiques actualisées', `${data.total} délégations au total`);
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
  }, [toast]);

  // ================================
  // Centre de décision (enhanced)
  // ================================
  const loadDecision = useCallback(async () => {
    abortDecisionRef.current?.abort();
    const ac = new AbortController();
    abortDecisionRef.current = ac;

    setDecisionLoading(true);
    setDecisionError(null);

    try {
      const res = await fetch('/api/delegations?queue=expiring_soon&limit=100', {
        cache: 'no-store',
        signal: ac.signal,
      });

      if (!res.ok) {
        setDecisionItems([]);
        setDecisionError(`Chargement impossible (HTTP ${res.status}).`);
        return;
      }

      const data = await res.json();
      const rawItems = (data.items ?? []) as DelegationListItem[];
      
      // Enrichir avec daysLeft
      const items = rawItems.map((item) => ({
        ...item,
        daysLeft: getDaysLeft(item.expiresAt) ?? 999,
      }));
      
      setDecisionItems(Array.isArray(items) ? items : []);
      
      // Générer notifications si on a des stats
      if (statsData) {
        const notifs = generateNotifications(statsData, items);
        setNotifications(notifs);
      }
    } catch (e: unknown) {
      if (e instanceof Error && e.name === 'AbortError') return;
      setDecisionItems([]);
      setDecisionError('Erreur réseau/API sur la file "Expirent bientôt".');
    } finally {
      setDecisionLoading(false);
    }
  }, [statsData, generateNotifications]);

  const openDecisionCenter = useCallback(() => {
    setDecisionOpen(true);
    loadDecision();
  }, [loadDecision]);

  // Bulk actions (après loadStats et loadDecision)
  const executeBulkAction = useCallback(async (action: BulkAction) => {
    if (selectedItems.size === 0) return;
    
    setBulkActionLoading(true);
    const ids = Array.from(selectedItems);
    
    try {
      switch (action) {
        case 'pin':
          setPinned((prev) => {
            const newPinned = [...prev];
            ids.forEach((id) => {
              if (!newPinned.includes(id)) newPinned.push(id);
            });
            return newPinned.slice(0, 50);
          });
          break;
        
        case 'extend':
          // Ouvre un onglet wizard pour prolongation en masse
          openTab({
            id: `wizard:bulk-extend:${Date.now()}`,
            type: 'wizard' as DelegationTabType,
            title: `Prolonger ${ids.length} délégation(s)`,
            icon: '⏰',
            data: { action: 'bulk-extend', delegationIds: ids },
          });
          break;
        
        case 'suspend':
          // API call pour suspension en masse
          await fetch('/api/delegations/bulk-action', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'suspend', delegationIds: ids }),
          });
          loadStats('manual');
          loadDecision();
          break;
        
        case 'revoke':
          // API call pour révocation en masse
          await fetch('/api/delegations/bulk-action', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'revoke', delegationIds: ids }),
          });
          loadStats('manual');
          loadDecision();
          break;
        
        case 'export': {
          // Export des sélectionnés
          const url = `/api/delegations/export?format=csv&ids=${ids.join(',')}`;
          const res = await fetch(url, { cache: 'no-store' });
          if (res.ok) {
            const blob = await res.blob();
            const date = new Date().toISOString().slice(0, 10);
            downloadBlob(blob, `delegations_selection_${date}.csv`);
          }
          break;
        }
      }
      
      clearSelection();
      setBulkActionOpen(false);
    } catch (error) {
      console.error('Bulk action error:', error);
    } finally {
      setBulkActionLoading(false);
    }
  }, [selectedItems, openTab, loadStats, loadDecision, clearSelection]);

  // Quick action execution
  const executeQuickAction = useCallback(async (action: 'extend' | 'suspend' | 'revoke' | 'view') => {
    if (!quickActionItem) return;
    
    setQuickActionLoading(true);
    
    try {
      switch (action) {
        case 'view':
          openDelegation(quickActionItem.id);
          break;
        
        case 'extend':
          openTab({
            id: `wizard:extend:${quickActionItem.id}`,
            type: 'wizard' as DelegationTabType,
            title: `Prolonger ${quickActionItem.id}`,
            icon: '⏰',
            data: { action: 'extend', delegationId: quickActionItem.id },
          });
          break;
        
        case 'suspend':
          await fetch(`/api/delegations/${encodeURIComponent(quickActionItem.id)}/suspend`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reason: 'Suspension rapide depuis le centre de décision' }),
          });
          loadStats('manual');
          loadDecision();
          break;
        
        case 'revoke':
          await fetch(`/api/delegations/${encodeURIComponent(quickActionItem.id)}/revoke`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reason: 'Révocation rapide depuis le centre de décision' }),
          });
          loadStats('manual');
          loadDecision();
          break;
      }
      
      setQuickActionOpen(false);
      setQuickActionItem(null);
    } catch (error) {
      console.error('Quick action error:', error);
    } finally {
      setQuickActionLoading(false);
    }
  }, [quickActionItem, openDelegation, openTab, loadStats, loadDecision]);

  // ================================
  // Verification (robuste + concurrente)
  // ================================
  const runVerification = useCallback(async () => {
    abortVerifyRef.current?.abort();
    const ac = new AbortController();
    abortVerifyRef.current = ac;

    setVerifyLoading(true);
    setVerifyResults([]);

    try {
      const res = await fetch('/api/delegations?queue=active&limit=100', {
        cache: 'no-store',
        signal: ac.signal,
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      const delegationsToVerify = (data.items?.slice(0, 20) ?? []) as { id: string }[];

      // Limite de concurrence (évite de DDOS ton API)
      const CONCURRENCY = 6;
      const queue = [...delegationsToVerify];

      const results: VerifyResult[] = [];
      const worker = async () => {
        while (queue.length > 0) {
          const d = queue.shift();
          if (!d?.id) continue;

          try {
            const verifyRes = await fetch(`/api/delegations/${encodeURIComponent(d.id)}/verify`, {
              cache: 'no-store',
              signal: ac.signal,
            });

            if (!verifyRes.ok) {
              results.push({ id: d.id, valid: false, message: `Vérif KO (HTTP ${verifyRes.status})` });
              continue;
            }

            const verifyData = await verifyRes.json();
            results.push({
              id: d.id,
              valid: Boolean(verifyData.valid),
              message: String(verifyData.message ?? 'Vérification effectuée'),
            });
          } catch (e: unknown) {
            if (e instanceof Error && e.name === 'AbortError') return;
            results.push({ id: d.id, valid: false, message: 'Erreur de vérification' });
          }
        }
      };

      await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));
      // Tri stable pour affichage
      results.sort((a, b) => a.id.localeCompare(b.id));
      setVerifyResults(results);
    } catch (e: unknown) {
      if (e instanceof Error && e.name === 'AbortError') return;
      setVerifyResults([{ id: 'global', valid: false, message: 'Erreur lors de la vérification' }]);
    } finally {
      setVerifyLoading(false);
    }
  }, []);

  // ================================
  // Export
  // ================================
  const doExport = useCallback(async () => {
    setExporting(true);
    setExportError(null);

    try {
      const queueParam = exportQueue === 'all' ? '' : `&queue=${encodeURIComponent(exportQueue)}`;

      // PDF: ouvrir dans une nouvelle fenêtre pour impression
      if (exportFormat === 'pdf') {
        const url = `/api/delegations/export?format=html${queueParam}&print=true`;
        const w = window.open(url, '_blank', 'noopener,noreferrer');
        w?.focus();
        setExportOpen(false);
        toast.success('Export PDF', 'Document ouvert dans un nouvel onglet');
        return;
      }

      const url = `/api/delegations/export?format=${encodeURIComponent(exportFormat)}${queueParam}`;
      const res = await fetch(url, { cache: 'no-store' });

      if (!res.ok) {
        const errorMsg = `Export impossible (HTTP ${res.status}).`;
        setExportError(errorMsg);
        toast.error('Erreur d\'export', errorMsg);
        return;
      }

      const blob = await res.blob();
      const ext = exportFormat === 'csv' ? 'csv' : 'json';
      const date = new Date().toISOString().slice(0, 10);
      const filename = `delegations_${exportQueue}_${date}.${ext}`;
      downloadBlob(blob, filename);
      setExportOpen(false);
      toast.success('Export réussi', `Fichier ${filename} téléchargé`);
    } catch {
      const errorMsg = 'Export impossible (réseau ou API).';
      setExportError(errorMsg);
      toast.error('Erreur réseau', errorMsg);
    } finally {
      setExporting(false);
    }
  }, [exportFormat, exportQueue, toast]);

  // ================================
  // Effects
  // ================================
  useEffect(() => {
    loadStats('init');
    return () => {
      abortStatsRef.current?.abort();
      abortDecisionRef.current?.abort();
      abortVerifyRef.current?.abort();
    };
  }, [loadStats]);

  // Auto refresh : stats + decision center si ouvert
  useInterval(
    () => {
      if (!autoRefresh) return;
      if (!showDashboard && !statsOpen && !decisionOpen) return;

      loadStats('auto');
      if (decisionOpen) loadDecision();
    },
    autoRefresh ? 60_000 : null
  );

  // Event listeners for CommandPalette
  useEffect(() => {
    const handleOpenStats = () => {
      setStatsOpen(true);
      loadStats('manual');
    };
    const handleOpenExport = () => setExportOpen(true);
    const handleOpenHelp = () => setHelpOpen(true);
    const handleVerifyIntegrity = () => {
      setVerifyOpen(true);
      runVerification();
    };
    const handleOpenDecision = () => openDecisionCenter();

    // Batch actions handlers
    const handleBatchExtend = () => {
      if (decisionItems.length > 0) {
        setBatchItems(decisionItems);
        setBatchAction('extend');
        setBatchOpen(true);
      }
    };
    const handleBatchRevoke = () => {
      if (decisionItems.length > 0) {
        setBatchItems(decisionItems);
        setBatchAction('revoke');
        setBatchOpen(true);
      }
    };

    // Timeline handler
    const handleOpenAuditTrail = () => {
      setTimelineDelegationId(undefined);
      setTimelineOpen(true);
    };

    // Settings handler
    const handleOpenSettings = () => {
      // Dispatch to parent settings modal if exists
      window.dispatchEvent(new CustomEvent('delegation:open-preferences'));
    };

    window.addEventListener('delegation:open-stats', handleOpenStats);
    window.addEventListener('delegation:open-export', handleOpenExport);
    window.addEventListener('delegation:open-help', handleOpenHelp);
    window.addEventListener('delegation:verify-integrity', handleVerifyIntegrity);
    window.addEventListener('delegation:open-decision-center', handleOpenDecision);
    window.addEventListener('delegation:batch-extend', handleBatchExtend);
    window.addEventListener('delegation:batch-revoke', handleBatchRevoke);
    window.addEventListener('delegation:open-audit-trail', handleOpenAuditTrail);
    window.addEventListener('delegation:open-settings', handleOpenSettings);

    return () => {
      window.removeEventListener('delegation:open-stats', handleOpenStats);
      window.removeEventListener('delegation:open-export', handleOpenExport);
      window.removeEventListener('delegation:open-help', handleOpenHelp);
      window.removeEventListener('delegation:verify-integrity', handleVerifyIntegrity);
      window.removeEventListener('delegation:open-decision-center', handleOpenDecision);
      window.removeEventListener('delegation:batch-extend', handleBatchExtend);
      window.removeEventListener('delegation:batch-revoke', handleBatchRevoke);
      window.removeEventListener('delegation:open-audit-trail', handleOpenAuditTrail);
      window.removeEventListener('delegation:open-settings', handleOpenSettings);
    };
  }, [loadStats, runVerification, openDecisionCenter, decisionItems]);

  // ================================
  // Hotkeys
  // ================================
  useHotkeys('ctrl+1', () => openInbox('active', 'Actives', '✅'), [openInbox]);
  useHotkeys('ctrl+2', () => openInbox('expiring_soon', 'Expirent bientôt', '⏰'), [openInbox]);
  useHotkeys('ctrl+3', () => openInbox('expired', 'Expirées', '📅'), [openInbox]);
  useHotkeys('ctrl+4', () => openInbox('revoked', 'Révoquées', '⛔'), [openInbox]);
  useHotkeys('ctrl+5', () => openInbox('suspended', 'Suspendues', '🟠'), [openInbox]);

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

  // ✅ Corrige ton aide : Ctrl+K était affiché mais pas implémenté
  useHotkeys(
    'ctrl+k',
    (e: KeyboardEvent) => {
      e.preventDefault();
      // On laisse le composant palette gérer l'ouverture via event
      window.dispatchEvent(new CustomEvent('delegation:open-command-palette'));
    },
    []
  );

  // Centre de décision
  useHotkeys(
    'ctrl+d',
    (e: KeyboardEvent) => {
      e.preventDefault();
      openDecisionCenter();
    },
    [openDecisionCenter]
  );

  useHotkeys('shift+?', () => setHelpOpen(true), []);

  useHotkeys(
    'escape',
    () => {
      setStatsOpen(false);
      setHelpOpen(false);
      setExportOpen(false);
      setVerifyOpen(false);
      setDecisionOpen(false);
    },
    []
  );

  // ================================
  // Computed Values
  // ================================
  
  // Notifications actives (non dismissed)
  const activeNotifications = useMemo(() => {
    const dismissedSet = new Set(dismissedNotifications);
    return notifications.filter((n) => !dismissedSet.has(n.id));
  }, [notifications, dismissedNotifications]);
  
  // Critical count pour badge
  const criticalCount = useMemo(() => {
    return activeNotifications.filter((n) => n.severity === 'critical').length;
  }, [activeNotifications]);

  // Decision items filtrés et triés
  const sortedDecisionItems = useMemo(() => {
    let items = [...decisionItems];
    
    // Filtrage par query
    if (decisionQuery.trim()) {
      const q = decisionQuery.toLowerCase();
      items = items.filter((it) =>
        it.id?.toLowerCase().includes(q) ||
        (it.bureau ?? '').toLowerCase().includes(q) ||
        (it.agentName ?? '').toLowerCase().includes(q) ||
        (it.type ?? '').toLowerCase().includes(q)
      );
    }
    
    // Filtrage avancé
    if (decisionFilters.bureau) {
      items = items.filter((it) => it.bureau === decisionFilters.bureau);
    }
    if (decisionFilters.type) {
      items = items.filter((it) => it.type === decisionFilters.type);
    }
    if (decisionFilters.daysLeftMax !== null) {
      items = items.filter((it) => {
        const dl = it.daysLeft ?? getDaysLeft(it.expiresAt);
        return dl !== null && dl <= decisionFilters.daysLeftMax!;
      });
    }
    
    // Tri
    items.sort((a, b) => {
      let cmp = 0;
      switch (decisionSort.field) {
        case 'id':
          cmp = a.id.localeCompare(b.id);
          break;
        case 'expiresAt':
          cmp = (a.expiresAt ?? '').localeCompare(b.expiresAt ?? '');
          break;
        case 'bureau':
          cmp = (a.bureau ?? '').localeCompare(b.bureau ?? '');
          break;
        case 'type':
          cmp = (a.type ?? '').localeCompare(b.type ?? '');
          break;
        case 'daysLeft':
          const dlA = a.daysLeft ?? getDaysLeft(a.expiresAt) ?? 999;
          const dlB = b.daysLeft ?? getDaysLeft(b.expiresAt) ?? 999;
          cmp = dlA - dlB;
          break;
      }
      return decisionSort.direction === 'asc' ? cmp : -cmp;
    });
    
    return items;
  }, [decisionItems, decisionQuery, decisionFilters, decisionSort]);

  // Bureaux et types uniques pour filtres
  const uniqueBureaux = useMemo(() => {
    return [...new Set(decisionItems.map((it) => it.bureau).filter(Boolean))] as string[];
  }, [decisionItems]);
  
  const uniqueTypes = useMemo(() => {
    return [...new Set(decisionItems.map((it) => it.type).filter(Boolean))] as string[];
  }, [decisionItems]);

  const riskBadge = useMemo(() => {
    if (!statsData) return null;

    // score "direction": expiringSoon pèse lourd, revoked très lourd, expired medium, suspended low
    const riskScore =
      (statsData.expiringSoon || 0) * 3 +
      (statsData.revoked || 0) * 4 +
      (statsData.expired || 0) * 2 +
      (statsData.suspended || 0) * 1;

    if (riskScore >= 18) return { label: 'Risque élevé', color: 'rose' as const };
    if (riskScore >= 7) return { label: 'Risque modéré', color: 'amber' as const };
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
      { label: `${statsData.active} actives`, color: 'purple' },
      { label: `${statsData.totalUsage} utilisations`, color: 'slate' },
      {
        label: autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF',
        color: autoRefresh ? 'emerald' : 'slate',
      },
    ];

    if (statsData.expiringSoon > 0) {
      result.splice(1, 0, { label: `${statsData.expiringSoon} expirent bientôt`, color: 'amber' });
    }
    if (riskBadge) result.push(riskBadge);
    if (lastUpdated) result.push({ label: `MAJ ${safeFRDate(lastUpdated)}`, color: 'slate' });

    return result;
  }, [statsData, statsLoading, statsError, autoRefresh, lastUpdated, riskBadge]);

  // ================================
  // Actions (corrigées affichage + ajout métier)
  // ================================
  const actions: ShellAction[] = useMemo(() => {
    const n = statsData ?? { active: 0, expiringSoon: 0, expired: 0, revoked: 0, suspended: 0 };

    return [
      {
        id: 'create',
        label: <ActionLabel icon={<Plus className="w-4 h-4" />} text="Nouvelle" />,
        variant: 'primary',
        title: 'Ctrl+N',
        onClick: openCreateWizard,
      },
      {
        id: 'active',
        label: <ActionLabel text={<>✅ Actives</>} right={<CountChip v={n.active} />} />,
        variant: 'success',
        title: 'Ctrl+1',
        onClick: () => openInbox('active', 'Actives', '✅'),
      },
      {
        id: 'expiring',
        label: <ActionLabel text={<>⏰ Expirent</>} right={<CountChip v={n.expiringSoon} />} />,
        variant: 'warning',
        title: 'Ctrl+2',
        onClick: () => openInbox('expiring_soon', 'Expirent bientôt', '⏰'),
      },
      {
        id: 'expired',
        label: <ActionLabel text={<>📅 Expirées</>} right={<CountChip v={n.expired} />} />,
        variant: 'secondary',
        title: 'Ctrl+3',
        onClick: () => openInbox('expired', 'Expirées', '📅'),
      },
      {
        id: 'revoked',
        label: <ActionLabel text={<>⛔ Révoquées</>} right={<CountChip v={n.revoked} />} />,
        variant: 'destructive',
        title: 'Ctrl+4',
        onClick: () => openInbox('revoked', 'Révoquées', '⛔'),
      },
      {
        id: 'suspended',
        label: <ActionLabel text={<>🟠 Suspendues</>} right={<CountChip v={n.suspended} />} />,
        variant: 'secondary',
        title: 'Ctrl+5',
        onClick: () => openInbox('suspended', 'Suspendues', '🟠'),
      },

      // 🔥 Ajout métier : centre de décision
      {
        id: 'decision',
        label: <ActionLabel icon={<ListChecks className="w-4 h-4" />} text="Décider" />,
        variant: n.expiringSoon > 0 ? 'warning' : 'secondary',
        title: 'Ctrl+D — Centre de décision',
        onClick: openDecisionCenter,
      },
      // 🔔 Notifications temps réel
      {
        id: 'notifications',
        label: (
          <ActionLabel
            icon={notificationsEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
            text="Alertes"
            right={criticalCount > 0 ? <CountChip v={criticalCount} /> : undefined}
          />
        ),
        variant: criticalCount > 0 ? 'destructive' : 'secondary',
        title: 'Notifications critiques',
        onClick: () => setNotificationsOpen(true),
      },

      {
        id: 'stats',
        label: <ActionLabel icon={<PieChart className="w-4 h-4" />} text="Stats" />,
        variant: 'primary',
        title: 'Ctrl+S — Statistiques complètes',
        onClick: () => {
          setStatsOpen(true);
          loadStats('manual');
        },
      },
      {
        id: 'verify',
        label: <ActionLabel icon={<FileCheck className="w-4 h-4" />} text="Intégrité" />,
        variant: 'secondary',
        title: "Vérifier la chaîne d'audit",
        onClick: () => {
          setVerifyOpen(true);
          runVerification();
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
  }, [statsData, openInbox, openCreateWizard, openDecisionCenter, loadStats, statsLoading, autoRefresh, runVerification, notificationsEnabled, criticalCount]);

  // ================================
  // Banner
  // ================================
  const banner = useMemo(() => {
    if (!statsData || statsData.expiringSoon <= 0) return null;
    const plural = statsData.expiringSoon > 1;

    return (
      <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 flex flex-col md:flex-row md:items-center gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <Clock className="w-6 h-6 text-amber-700 flex-none mt-0.5" />
          <div className="min-w-0">
            <div className="font-semibold text-amber-900 dark:text-amber-300">
              {statsData.expiringSoon} délégation{plural ? 's' : ''} expire{plural ? 'nt' : ''} bientôt
            </div>
            <p className="text-sm text-amber-800/90 dark:text-amber-200/90">
              Action recommandée : ouvrir la file "Expirent bientôt" et décider (prolonger / remplacer / suspendre / révoquer).
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 md:ml-auto flex-wrap">
          <FluentButton size="sm" variant="warning" onClick={() => openInbox('expiring_soon', 'Expirent bientôt', '⏰')}>
            Voir la file
          </FluentButton>

          <FluentButton size="sm" variant="secondary" onClick={openDecisionCenter} title="Centre de décision">
            <ListChecks className="w-4 h-4 mr-2" />
            Décider
          </FluentButton>

          <FluentButton
            size="sm"
            variant="secondary"
            onClick={() => {
              setExportQueue('expiring_soon');
              setExportOpen(true);
            }}
            title="Préparer un export de la file"
          >
            <FileText className="w-4 h-4 mr-2" />
            Export file
          </FluentButton>
        </div>
      </div>
    );
  }, [statsData, openInbox, openDecisionCenter]);

  // ================================
  // Dashboard
  // ================================
  const dashboard = useMemo(() => {
    const pinnedSet = new Set(pinned);

    const filteredDecisionItems =
      decisionQuery.trim().length === 0
        ? decisionItems
        : decisionItems.filter((it) => {
            const q = decisionQuery.toLowerCase();
            return (
              it.id?.toLowerCase().includes(q) ||
              (it.bureau ?? '').toLowerCase().includes(q) ||
              (it.agentName ?? '').toLowerCase().includes(q) ||
              (it.type ?? '').toLowerCase().includes(q)
            );
          });

    return (
      <div className="space-y-4">
        {/* Bannière d'alertes temps réel */}
        <DelegationAlertsBanner />

        {/* Skeleton loader pendant le chargement initial */}
        {statsLoading && !statsData ? (
          <DelegationDashboardSkeleton />
        ) : (
          <>
            {/* Compteurs live */}
            <DelegationLiveCounters />

            {/* Panneau direction : À décider / Risques / Simulateur */}
            <DelegationDirectionPanel />

        {/* Watchlist */}
        <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 dark:border-slate-800 dark:bg-[#1f1f1f]/70">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500" />
              <h3 className="font-semibold">Watchlist (épinglés)</h3>
              <span className="text-xs text-slate-500">({pinned.length})</span>
            </div>
            <FluentButton
              size="sm"
              variant="secondary"
              onClick={() => window.dispatchEvent(new CustomEvent('delegation:open-command-palette'))}
              title="Ctrl+K"
            >
              <Search className="w-4 h-4 mr-2" />
              Rechercher
            </FluentButton>
          </div>

          {pinned.length === 0 ? (
            <p className="text-sm text-slate-500 mt-2">Aucun épinglé. Épingle depuis "Décider" ou une délégation.</p>
          ) : (
            <div className="mt-3 flex flex-wrap gap-2">
              {pinned.slice(0, 12).map((id) => (
                <button
                  key={id}
                  type="button"
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-700/50 bg-slate-800/50 hover:bg-slate-800 transition-colors text-slate-300"
                  onClick={() => openDelegation(id)}
                  title="Ouvrir"
                >
                  <span className="font-mono text-xs">{id}</span>
                  <span
                    className="inline-flex items-center justify-center w-6 h-6 rounded-lg hover:bg-amber-500/10"
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePin(id);
                    }}
                    title="Retirer"
                  >
                    <StarOff className="w-4 h-4 text-slate-500" />
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Bloc analytics si stats ok */}
        {statsData && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            {/* Par bureau */}
            <div className="xl:col-span-1 rounded-2xl border border-slate-200/70 bg-white/80 p-4 dark:border-slate-800 dark:bg-[#1f1f1f]/70">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-500" />
                Top bureaux (actives)
              </h3>

              <div className="space-y-2">
                {statsData.byBureau.slice(0, 7).map((b) => {
                  const denom = Math.max(1, statsData.active);
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
                {statsData.byBureau.length === 0 && <p className="text-sm text-slate-500">Aucune donnée.</p>}
              </div>
            </div>

            {/* Par type */}
            <div className="xl:col-span-1 rounded-2xl border border-slate-200/70 bg-white/80 p-4 dark:border-slate-800 dark:bg-[#1f1f1f]/70">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Key className="w-4 h-4 text-purple-500" />
                Top types
              </h3>

              <div className="space-y-2">
                {statsData.byType.slice(0, 8).map((t) => (
                  <div key={t.type} className="flex items-center justify-between">
                    <span className="text-sm truncate">{t.type}</span>
                    <span className="text-sm font-mono text-slate-500">{t.count}</span>
                  </div>
                ))}
                {statsData.byType.length === 0 && <p className="text-sm text-slate-500">Aucune donnée.</p>}
              </div>
            </div>

            {/* Activité récente */}
            <div className="xl:col-span-1 rounded-2xl border border-slate-200/70 bg-white/80 p-4 dark:border-slate-800 dark:bg-[#1f1f1f]/70">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-500" />
                Activité récente
              </h3>

              <div className="space-y-2 max-h-[260px] overflow-auto">
                {statsData.recentActivity.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    className="w-full text-left flex items-start gap-2 text-sm p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    onClick={() => openDelegation(a.delegationId)}
                    title={a.details ?? undefined}
                  >
                    <span
                      className={cn(
                        'px-1.5 py-0.5 rounded text-xs capitalize flex-none',
                        a.action === 'created' && 'bg-emerald-500/10 text-emerald-700',
                        a.action === 'used' && 'bg-blue-500/10 text-blue-700',
                        a.action === 'extended' && 'bg-purple-500/10 text-purple-700',
                        a.action === 'suspended' && 'bg-amber-500/10 text-amber-800',
                        a.action === 'revoked' && 'bg-rose-500/10 text-rose-700'
                      )}
                    >
                      {a.action}
                    </span>

                    <div className="flex-1 min-w-0">
                      <div className="truncate">
                        <span className="font-mono text-xs text-purple-600 dark:text-purple-300">{a.delegationId}</span>
                        <span className="mx-1">—</span>
                        <span>{a.agentName}</span>
                      </div>
                      <div className="text-xs text-slate-400">{a.actorName} • {safeFRDate(a.createdAt)}</div>
                    </div>

                    <span
                      className="inline-flex items-center justify-center w-8 h-8 rounded-xl hover:bg-amber-500/10 flex-none"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        togglePin(a.delegationId);
                      }}
                      title={pinnedSet.has(a.delegationId) ? 'Retirer de la watchlist' : 'Ajouter à la watchlist'}
                    >
                      {pinnedSet.has(a.delegationId) ? (
                        <Star className="w-4 h-4 text-amber-500" />
                      ) : (
                        <StarOff className="w-4 h-4 text-slate-500" />
                      )}
                    </span>
                  </button>
                ))}

                {statsData.recentActivity.length === 0 && (
                  <p className="text-sm text-slate-500 text-center py-4">Aucune activité récente.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Bloc "acte sensible" */}
        <div className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-4 dark:border-purple-500/30 dark:bg-purple-500/10">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-purple-500 flex-none" />
            <div className="flex-1">
              <h3 className="font-bold text-purple-700 dark:text-purple-300">Acte sensible — gouvernance &amp; traçabilité</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Chaque action (création, usage, prolongation, suspension, révocation) laisse une empreinte auditée.
                Hash chaîné pour anti-contestation et lecture "instance suprême" de la situation.
              </p>
            </div>
          </div>
        </div>

        {/* Erreur stats (si API down) */}
        {!statsData && statsError && (
          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 flex items-center justify-between gap-3">
            <div className="text-sm text-rose-800 dark:text-rose-300">{statsError}</div>
            <FluentButton size="sm" variant="secondary" onClick={() => loadStats('manual')}>
              Réessayer
            </FluentButton>
          </div>
        )}

        {/* (Optionnel) mini aperçu du centre de décision dans le dashboard */}
        {statsData?.expiringSoon ? (
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 dark:bg-amber-500/10">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="font-semibold text-amber-900 dark:text-amber-200">
                  Centre de décision : {statsData.expiringSoon} à traiter
                </div>
                <div className="text-sm text-amber-800/90 dark:text-amber-200/90">
                  Ouvre la liste, épingle les dossiers sensibles, puis tranche (prolonger / remplacer / suspendre / révoquer) depuis chaque délégation.
                </div>
              </div>
              <FluentButton size="sm" variant="ghost" onClick={openDecisionCenter} title="Ctrl+D">
                Ouvrir <ArrowRight className="w-4 h-4 ml-2" />
              </FluentButton>
            </div>

            {/* aperçu ultra léger si on a déjà chargé */}
            {decisionItems.length > 0 && (
              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                {decisionItems.slice(0, 4).map((it) => (
                  <button
                    key={it.id}
                    type="button"
                    className="text-left p-3 rounded-xl border border-amber-500/20 bg-slate-800/40 hover:bg-slate-800/60 transition-colors"
                    onClick={() => openDelegation(it.id)}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-mono text-xs truncate">{it.id}</div>
                      <span
                        className="inline-flex items-center justify-center w-8 h-8 rounded-xl hover:bg-amber-500/10"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          togglePin(it.id);
                        }}
                      >
                        {pinnedSet.has(it.id) ? (
                          <Star className="w-4 h-4 text-amber-500" />
                        ) : (
                          <StarOff className="w-4 h-4 text-slate-500" />
                        )}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {it.bureau ? `${it.bureau} • ` : ''}{it.type ?? '—'} • échéance {safeFRDate(it.expiresAt)}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : null}

        {/* Ce bloc n'affiche rien si tu n'ouvres pas le centre de décision : c'est volontaire */}
          </>
        )}
      </div>
    );
  }, [statsData, statsError, pinned, decisionItems, decisionQuery, openDelegation, openDecisionCenter, loadStats, togglePin, statsLoading]);

  // ================================
  // Render
  // ================================
  return (
    <>
      <WorkspaceShell
        icon={<Key className="w-6 h-6 text-purple-500" />}
        title="Console métier — Délégations"
        subtitle="Gouvernance, traçabilité, contrôle : une vue direction pour tout décider."
        badges={badges}
        actions={actions}
        actionSeparators={[0, 6]}
        Banner={banner}
        Tabs={<DelegationWorkspaceTabs />}
        showDashboard={showDashboard}
        Dashboard={dashboard}
        Content={<DelegationWorkspaceContent />}
        FooterOverlays={
          <>
            <DelegationCommandPalette />
            <DelegationNotifications />
          </>
        }
      />

      {/* ============================= */}
      {/* MODALES */}
      {/* ============================= */}

      {/* Batch Actions Modal */}
      <DelegationBatchActions
        open={batchOpen}
        action={batchAction}
        delegations={batchItems as any}
        onClose={() => {
          setBatchOpen(false);
          setBatchItems([]);
        }}
        onComplete={() => {
          loadDecision();
          loadStats('manual');
        }}
      />

      {/* Timeline Modal */}
      <DelegationTimeline
        open={timelineOpen}
        delegationId={timelineDelegationId}
        onClose={() => {
          setTimelineOpen(false);
          setTimelineDelegationId(undefined);
        }}
      />

      {/* Centre de décision (enhanced) */}
      <FluentModal
        open={decisionOpen}
        title="Centre de décision — Expirent bientôt"
        onClose={() => {
          setDecisionOpen(false);
          setDecisionError(null);
          setDecisionQuery('');
          clearSelection();
        }}
      >
        <div className="space-y-4">
          {/* Header avec infos */}
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm text-amber-900 dark:text-amber-200 font-semibold">
                  {sortedDecisionItems.length} délégation(s) à traiter
                </div>
                <div className="text-xs text-amber-800/90 dark:text-amber-200/90 mt-1">
                  Sélectionne plusieurs éléments pour des actions en masse
                </div>
              </div>
              {selectedItems.size > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-amber-700 dark:text-amber-300 font-medium">
                    {selectedItems.size} sélectionné(s)
                  </span>
                  <FluentButton size="sm" variant="warning" onClick={() => setBulkActionOpen(true)}>
                    <Zap className="w-4 h-4 mr-1" />
                    Actions
                  </FluentButton>
                  <FluentButton size="sm" variant="secondary" onClick={clearSelection}>
                    <X className="w-4 h-4" />
                  </FluentButton>
                </div>
              )}
            </div>
          </div>

          {/* Barre de recherche et filtres */}
          <div className="flex items-end gap-2 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm text-slate-500">Recherche</label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  value={decisionQuery}
                  onChange={(e) => setDecisionQuery(e.target.value)}
                  placeholder="ID, bureau, agent, type…"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200/70 bg-white/90 outline-none focus:ring-2 focus:ring-amber-400/30 dark:border-slate-800 dark:bg-[#141414]/70 dark:text-white"
                />
              </div>
            </div>
            
            <FluentButton
              size="sm"
              variant={decisionFiltersOpen ? 'primary' : 'secondary'}
              onClick={() => setDecisionFiltersOpen(!decisionFiltersOpen)}
              title="Filtres avancés"
            >
              <Filter className="w-4 h-4 mr-1" />
              Filtres
              {(decisionFilters.bureau || decisionFilters.type || decisionFilters.daysLeftMax !== null) && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full text-xs bg-amber-500 text-white">!</span>
              )}
            </FluentButton>
            
            <FluentButton size="sm" variant="secondary" onClick={() => selectAllItems(sortedDecisionItems)} title="Tout sélectionner">
              <CheckSquare className="w-4 h-4" />
            </FluentButton>
            
            <FluentButton size="sm" variant="secondary" onClick={loadDecision} disabled={decisionLoading} title="Rafraîchir">
              <RefreshCw className={cn('w-4 h-4', decisionLoading && 'animate-spin')} />
            </FluentButton>
          </div>
          
          {/* Filtres avancés (déroulant) */}
          {decisionFiltersOpen && (
            <div className="p-3 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-slate-500">Bureau</label>
                  <select
                    className="mt-1 w-full rounded-lg border border-slate-200/70 bg-white/90 p-2 text-sm outline-none dark:border-slate-800 dark:bg-[#141414]/70 dark:text-white"
                    value={decisionFilters.bureau}
                    onChange={(e) => setDecisionFilters({ ...decisionFilters, bureau: e.target.value })}
                  >
                    <option value="">Tous</option>
                    {uniqueBureaux.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-500">Type</label>
                  <select
                    className="mt-1 w-full rounded-lg border border-slate-200/70 bg-white/90 p-2 text-sm outline-none dark:border-slate-800 dark:bg-[#141414]/70 dark:text-white"
                    value={decisionFilters.type}
                    onChange={(e) => setDecisionFilters({ ...decisionFilters, type: e.target.value })}
                  >
                    <option value="">Tous</option>
                    {uniqueTypes.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-500">Jours restants max</label>
                  <select
                    className="mt-1 w-full rounded-lg border border-slate-200/70 bg-white/90 p-2 text-sm outline-none dark:border-slate-800 dark:bg-[#141414]/70 dark:text-white"
                    value={decisionFilters.daysLeftMax ?? ''}
                    onChange={(e) => setDecisionFilters({ ...decisionFilters, daysLeftMax: e.target.value ? Number(e.target.value) : null })}
                  >
                    <option value="">Tous</option>
                    <option value="1">≤ 1 jour (critique)</option>
                    <option value="3">≤ 3 jours</option>
                    <option value="7">≤ 7 jours</option>
                    <option value="14">≤ 14 jours</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <FluentButton
                  size="sm"
                  variant="secondary"
                  onClick={() => setDecisionFilters({ bureau: '', type: '', daysLeftMax: null })}
                >
                  Réinitialiser
                </FluentButton>
              </div>
            </div>
          )}
          
          {/* Tri */}
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Trier par :</span>
            {[
              { field: 'daysLeft' as SortField, label: 'Urgence' },
              { field: 'id' as SortField, label: 'ID' },
              { field: 'bureau' as SortField, label: 'Bureau' },
              { field: 'type' as SortField, label: 'Type' },
            ].map(({ field, label }) => (
              <button
                key={field}
                className={cn(
                  'px-2 py-1 rounded-lg transition-colors',
                  decisionSort.field === field
                    ? 'bg-amber-500/20 text-amber-700 dark:text-amber-400'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                )}
                onClick={() => {
                  if (decisionSort.field === field) {
                    setDecisionSort({ field, direction: decisionSort.direction === 'asc' ? 'desc' : 'asc' });
                  } else {
                    setDecisionSort({ field, direction: 'asc' });
                  }
                }}
              >
                {label}
                {decisionSort.field === field && (
                  decisionSort.direction === 'asc' ? <ChevronUp className="w-3 h-3 inline ml-1" /> : <ChevronDown className="w-3 h-3 inline ml-1" />
                )}
              </button>
            ))}
          </div>

          {decisionError && (
            <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-800 dark:text-rose-300">
              {decisionError}
            </div>
          )}

          {decisionLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin text-slate-400" />
              <span className="ml-2 text-slate-500">Chargement…</span>
            </div>
          ) : (
            <div className="max-h-[320px] overflow-auto space-y-2">
              {sortedDecisionItems.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-6">Aucun élément.</p>
              ) : (
                sortedDecisionItems.map((it) => {
                  const isSelected = selectedItems.has(it.id);
                  const isPinned = pinned.includes(it.id);
                  const daysLeft = it.daysLeft ?? getDaysLeft(it.expiresAt);
                  const isCritical = daysLeft !== null && daysLeft <= 3;
                  
                  return (
                    <div
                      key={it.id}
                      className={cn(
                        'p-3 rounded-xl border flex items-start gap-3 transition-colors',
                        isSelected
                          ? 'border-amber-500/50 bg-amber-50/50 dark:bg-amber-900/20'
                          : 'border-slate-200/60 dark:border-slate-800 bg-white/70 dark:bg-[#141414]/40',
                        isCritical && !isSelected && 'border-rose-300/50 bg-rose-50/30 dark:bg-rose-900/10'
                      )}
                    >
                      {/* Checkbox */}
                      <button
                        type="button"
                        className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 flex-none"
                        onClick={() => toggleSelectItem(it.id)}
                      >
                        {isSelected ? (
                          <CheckSquare className="w-5 h-5 text-amber-500" />
                        ) : (
                          <Square className="w-5 h-5 text-slate-400" />
                        )}
                      </button>
                      
                      {/* Contenu principal */}
                      <button
                        type="button"
                        className="flex-1 min-w-0 text-left"
                        onClick={() => openDelegation(it.id)}
                        title="Ouvrir"
                      >
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="font-mono text-sm">{it.id}</div>
                          {daysLeft !== null && (
                            <span className={cn(
                              'px-2 py-0.5 rounded-full text-xs font-medium',
                              daysLeft <= 1 ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300' :
                              daysLeft <= 3 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300' :
                              'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                            )}>
                              {daysLeft <= 0 ? 'Expiré' : `${daysLeft}j`}
                            </span>
                          )}
                          {isPinned && <Star className="w-3 h-3 text-amber-500" />}
                        </div>
                        <div className="text-xs text-slate-500 mt-1 flex items-center gap-2 flex-wrap">
                          {it.bureau && <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{it.bureau}</span>}
                          {it.type && <span>• {it.type}</span>}
                          {it.agentName && <span className="flex items-center gap-1"><Users className="w-3 h-3" />{it.agentName}</span>}
                        </div>
                      </button>
                      
                      {/* Actions rapides */}
                      <div className="flex items-center gap-1 flex-none">
                        <button
                          type="button"
                          className="w-8 h-8 rounded-lg hover:bg-amber-500/10 flex items-center justify-center"
                          onClick={() => togglePin(it.id)}
                          title={isPinned ? 'Retirer' : 'Épingler'}
                        >
                          {isPinned ? (
                            <Star className="w-4 h-4 text-amber-500" />
                          ) : (
                            <StarOff className="w-4 h-4 text-slate-400" />
                          )}
                        </button>
                        <button
                          type="button"
                          className="w-8 h-8 rounded-lg hover:bg-blue-500/10 flex items-center justify-center"
                          onClick={() => openQuickAction(it)}
                          title="Actions rapides"
                        >
                          <Zap className="w-4 h-4 text-blue-500" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          <div className="flex justify-between gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <div className="text-xs text-slate-500">
              {selectedItems.size > 0 && `${selectedItems.size} sélectionné(s) • `}
              {sortedDecisionItems.length} résultat(s)
            </div>
            <div className="flex gap-2">
              <FluentButton size="sm" variant="secondary" onClick={() => { setDecisionOpen(false); clearSelection(); }}>
                Fermer
              </FluentButton>
              <FluentButton
                size="sm"
                variant="warning"
                onClick={() => openInbox('expiring_soon', 'Expirent bientôt', '⏰')}
                title="Ouvrir la file complète"
              >
                Voir la file
              </FluentButton>
            </div>
          </div>
        </div>
      </FluentModal>

      {/* Stats Modal */}
      {/* Stats Modal - Composant professionnel complet */}
      <DelegationStatsModal
        open={statsOpen}
        onClose={() => setStatsOpen(false)}
      />

      {/* Export Modal - Nouveau composant professionnel */}
      <DelegationExportModal
        open={exportOpen}
        onClose={() => {
          setExportOpen(false);
          setExportError(null);
        }}
        onExport={async (format) => {
          // Utiliser le format sélectionné pour l'export
          const queueParam = exportQueue === 'all' ? '' : `&queue=${encodeURIComponent(exportQueue)}`;
          
          if (format === 'pdf') {
            const url = `/api/delegations/export?format=html${queueParam}&print=true`;
            const w = window.open(url, '_blank', 'noopener,noreferrer');
            w?.focus();
            toast.success('Export PDF', 'Document ouvert dans un nouvel onglet');
            return;
          }
          
          const url = `/api/delegations/export?format=${encodeURIComponent(format)}${queueParam}`;
          const res = await fetch(url, { cache: 'no-store' });
          
          if (!res.ok) {
            throw new Error(`Export impossible (HTTP ${res.status})`);
          }
          
          const blob = await res.blob();
          const ext = format === 'csv' ? 'csv' : 'json';
          const date = new Date().toISOString().slice(0, 10);
          downloadBlob(blob, `delegations_${exportQueue}_${date}.${ext}`);
          toast.success('Export réussi !', `Fichier téléchargé : delegations_${exportQueue}_${date}.${ext}`);
        }}
      />

      {/* Search Panel - Recherche avancée */}
      <DelegationSearchPanel
        isOpen={searchPanelOpen}
        onClose={() => setSearchPanelOpen(false)}
        onSearch={(filters) => {
          console.log('Filtres de recherche:', filters);
          toast.info('Recherche appliquée', `${Object.values(filters).filter(v => v).length} filtres actifs`);
          // TODO: Appliquer les filtres à la liste
        }}
      />

      {/* Help Modal */}
      <FluentModal open={helpOpen} title="Raccourcis clavier" onClose={() => setHelpOpen(false)}>
        <div className="space-y-3 text-sm">
          <div className="font-semibold text-slate-600 dark:text-slate-300 mb-2">Création</div>
          <div className="flex justify-between">
            <span>Nouvelle délégation</span>
            <kbd className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono">Ctrl+N</kbd>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-700 my-3" />

          <div className="font-semibold text-slate-600 dark:text-slate-300 mb-2">Files</div>
          <div className="flex justify-between">
            <span>Actives</span>
            <kbd className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono">Ctrl+1</kbd>
          </div>
          <div className="flex justify-between">
            <span>Expirent bientôt</span>
            <kbd className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono">Ctrl+2</kbd>
          </div>
          <div className="flex justify-between">
            <span>Expirées</span>
            <kbd className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono">Ctrl+3</kbd>
          </div>
          <div className="flex justify-between">
            <span>Révoquées</span>
            <kbd className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono">Ctrl+4</kbd>
          </div>
          <div className="flex justify-between">
            <span>Suspendues</span>
            <kbd className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono">Ctrl+5</kbd>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-700 my-3" />

          <div className="font-semibold text-slate-600 dark:text-slate-300 mb-2">Actions</div>
          <div className="flex justify-between">
            <span>Stats Live</span>
            <kbd className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono">Ctrl+S</kbd>
          </div>
          <div className="flex justify-between">
            <span>Centre de décision</span>
            <kbd className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono">Ctrl+D</kbd>
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

          <div className="font-semibold text-slate-600 dark:text-slate-300 mb-2">Onglets</div>
          <div className="flex justify-between">
            <span>Onglet suivant</span>
            <kbd className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono">Ctrl+Tab</kbd>
          </div>
          <div className="flex justify-between">
            <span>Onglet précédent</span>
            <kbd className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono">Ctrl+Shift+Tab</kbd>
          </div>
          <div className="flex justify-between">
            <span>Fermer onglet</span>
            <kbd className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono">Ctrl+W</kbd>
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

      {/* Verify Integrity Modal */}
      <FluentModal open={verifyOpen} title="Vérification d'intégrité — Chaîne d'audit" onClose={() => setVerifyOpen(false)}>
        <div className="space-y-4">
          <div className="p-4 rounded-xl border border-purple-500/30 bg-purple-500/5">
            <div className="flex items-center gap-2 mb-2">
              <FileCheck className="w-5 h-5 text-purple-500" />
              <span className="font-semibold text-purple-600 dark:text-purple-400">Vérification cryptographique</span>
            </div>
            <p className="text-sm text-slate-500">
              Chaque événement de délégation est hashé et chaîné pour garantir l&apos;intégrité et l&apos;anti-contestation.
            </p>
          </div>

          {verifyLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin text-slate-400" />
              <span className="ml-2 text-slate-500">Vérification en cours...</span>
            </div>
          ) : verifyResults.length > 0 ? (
            <div className="space-y-2 max-h-[300px] overflow-auto">
              {verifyResults.map((r, i) => (
                <div
                  key={`${r.id}-${i}`}
                  className={cn(
                    'p-3 rounded-xl border flex items-center gap-3',
                    r.valid ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-rose-500/30 bg-rose-500/5'
                  )}
                >
                  {r.valid ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-none" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-rose-500 flex-none" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-mono text-sm">{r.id}</div>
                    <div className={cn('text-xs', r.valid ? 'text-emerald-600' : 'text-rose-600')}>{r.message}</div>
                  </div>
                </div>
              ))}

              <div className="mt-4 p-3 rounded-xl bg-slate-100 dark:bg-slate-800/50">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Résultat</span>
                  <span className={cn('font-semibold', verifyResults.every((x) => x.valid) ? 'text-emerald-600' : 'text-rose-600')}>
                    {verifyResults.filter((x) => x.valid).length}/{verifyResults.length} valides
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-slate-500 text-center py-8">Aucun résultat</p>
          )}

          <div className="flex justify-end gap-2">
            <FluentButton size="sm" variant="secondary" onClick={() => setVerifyOpen(false)}>
              Fermer
            </FluentButton>
            <FluentButton size="sm" variant="primary" onClick={runVerification} disabled={verifyLoading}>
              {verifyLoading ? 'Vérification...' : 'Relancer'}
            </FluentButton>
          </div>
        </div>
      </FluentModal>

      {/* Bulk Actions Modal */}
      <FluentModal
        open={bulkActionOpen}
        title={`Actions en masse — ${selectedItems.size} délégation(s)`}
        onClose={() => setBulkActionOpen(false)}
      >
        <div className="space-y-4">
          <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-3">
            <div className="text-sm text-blue-900 dark:text-blue-200 font-semibold">
              Appliquer une action à {selectedItems.size} délégation(s) sélectionnée(s)
            </div>
            <div className="text-xs text-blue-800/90 dark:text-blue-200/90 mt-1">
              Cette action sera appliquée immédiatement. Certaines actions sont irréversibles.
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              className="p-4 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-white/70 dark:bg-[#141414]/40 hover:border-amber-400 hover:bg-amber-50/50 dark:hover:bg-amber-900/20 transition-colors text-left"
              onClick={() => executeBulkAction('pin')}
              disabled={bulkActionLoading}
            >
              <Star className="w-6 h-6 text-amber-500 mb-2" />
              <div className="font-semibold text-sm">Épingler tout</div>
              <div className="text-xs text-slate-500">Ajouter à la watchlist</div>
            </button>
            
            <button
              className="p-4 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-white/70 dark:bg-[#141414]/40 hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-colors text-left"
              onClick={() => executeBulkAction('extend')}
              disabled={bulkActionLoading}
            >
              <Calendar className="w-6 h-6 text-blue-500 mb-2" />
              <div className="font-semibold text-sm">Prolonger</div>
              <div className="text-xs text-slate-500">Étendre les délégations</div>
            </button>
            
            <button
              className="p-4 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-white/70 dark:bg-[#141414]/40 hover:border-orange-400 hover:bg-orange-50/50 dark:hover:bg-orange-900/20 transition-colors text-left"
              onClick={() => executeBulkAction('suspend')}
              disabled={bulkActionLoading}
            >
              <Pause className="w-6 h-6 text-orange-500 mb-2" />
              <div className="font-semibold text-sm">Suspendre</div>
              <div className="text-xs text-slate-500">Suspension temporaire</div>
            </button>
            
            <button
              className="p-4 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-white/70 dark:bg-[#141414]/40 hover:border-rose-400 hover:bg-rose-50/50 dark:hover:bg-rose-900/20 transition-colors text-left"
              onClick={() => executeBulkAction('revoke')}
              disabled={bulkActionLoading}
            >
              <Trash2 className="w-6 h-6 text-rose-500 mb-2" />
              <div className="font-semibold text-sm">Révoquer</div>
              <div className="text-xs text-slate-500">Révocation définitive</div>
            </button>
            
            <button
              className="p-4 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-white/70 dark:bg-[#141414]/40 hover:border-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20 transition-colors text-left col-span-2"
              onClick={() => executeBulkAction('export')}
              disabled={bulkActionLoading}
            >
              <Download className="w-6 h-6 text-emerald-500 mb-2" />
              <div className="font-semibold text-sm">Exporter la sélection</div>
              <div className="text-xs text-slate-500">Télécharger en CSV</div>
            </button>
          </div>

          {bulkActionLoading && (
            <div className="flex items-center justify-center py-4">
              <RefreshCw className="w-5 h-5 animate-spin text-slate-400 mr-2" />
              <span className="text-sm text-slate-500">Action en cours...</span>
            </div>
          )}

          <div className="flex justify-end">
            <FluentButton size="sm" variant="secondary" onClick={() => setBulkActionOpen(false)}>
              Annuler
            </FluentButton>
          </div>
        </div>
      </FluentModal>

      {/* Quick Actions Modal */}
      <FluentModal
        open={quickActionOpen}
        title={`Actions rapides — ${quickActionItem?.id ?? ''}`}
        onClose={() => { setQuickActionOpen(false); setQuickActionItem(null); }}
      >
        {quickActionItem && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-mono text-sm font-semibold">{quickActionItem.id}</div>
                  <div className="text-sm text-slate-500 mt-1">
                    {quickActionItem.bureau && <span>{quickActionItem.bureau} • </span>}
                    {quickActionItem.type ?? 'Type non défini'}
                  </div>
                  {quickActionItem.agentName && (
                    <div className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                      <Users className="w-3 h-3" />
                      {quickActionItem.agentName}
                    </div>
                  )}
                </div>
                {quickActionItem.expiresAt && (
                  <div className="text-right flex-none">
                    <div className="text-xs text-slate-400">Échéance</div>
                    <div className="text-sm font-medium">{safeFRDate(quickActionItem.expiresAt)}</div>
                    {(() => {
                      const dl = getDaysLeft(quickActionItem.expiresAt);
                      if (dl === null) return null;
                      return (
                        <span className={cn(
                          'px-2 py-0.5 rounded-full text-xs font-medium mt-1 inline-block',
                          dl <= 1 ? 'bg-rose-100 text-rose-700' :
                          dl <= 3 ? 'bg-amber-100 text-amber-700' :
                          'bg-slate-100 text-slate-600'
                        )}>
                          {dl <= 0 ? 'Expiré' : `${dl} jour${dl > 1 ? 's' : ''}`}
                        </span>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                className="p-4 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-white/70 dark:bg-[#141414]/40 hover:border-purple-400 hover:bg-purple-50/50 dark:hover:bg-purple-900/20 transition-colors text-left"
                onClick={() => executeQuickAction('view')}
                disabled={quickActionLoading}
              >
                <ExternalLink className="w-6 h-6 text-purple-500 mb-2" />
                <div className="font-semibold text-sm">Voir détails</div>
                <div className="text-xs text-slate-500">Ouvrir la délégation</div>
              </button>
              
              <button
                className="p-4 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-white/70 dark:bg-[#141414]/40 hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-colors text-left"
                onClick={() => executeQuickAction('extend')}
                disabled={quickActionLoading}
              >
                <Calendar className="w-6 h-6 text-blue-500 mb-2" />
                <div className="font-semibold text-sm">Prolonger</div>
                <div className="text-xs text-slate-500">Étendre la validité</div>
              </button>
              
              <button
                className="p-4 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-white/70 dark:bg-[#141414]/40 hover:border-orange-400 hover:bg-orange-50/50 dark:hover:bg-orange-900/20 transition-colors text-left"
                onClick={() => executeQuickAction('suspend')}
                disabled={quickActionLoading}
              >
                <Pause className="w-6 h-6 text-orange-500 mb-2" />
                <div className="font-semibold text-sm">Suspendre</div>
                <div className="text-xs text-slate-500">Suspension temporaire</div>
              </button>
              
              <button
                className="p-4 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-white/70 dark:bg-[#141414]/40 hover:border-rose-400 hover:bg-rose-50/50 dark:hover:bg-rose-900/20 transition-colors text-left"
                onClick={() => executeQuickAction('revoke')}
                disabled={quickActionLoading}
              >
                <Trash2 className="w-6 h-6 text-rose-500 mb-2" />
                <div className="font-semibold text-sm">Révoquer</div>
                <div className="text-xs text-slate-500">Révocation définitive</div>
              </button>
            </div>

            {quickActionLoading && (
              <div className="flex items-center justify-center py-4">
                <RefreshCw className="w-5 h-5 animate-spin text-slate-400 mr-2" />
                <span className="text-sm text-slate-500">Action en cours...</span>
              </div>
            )}

            <div className="flex justify-end">
              <FluentButton size="sm" variant="secondary" onClick={() => { setQuickActionOpen(false); setQuickActionItem(null); }}>
                Fermer
              </FluentButton>
            </div>
          </div>
        )}
      </FluentModal>

      {/* Notifications Modal */}
      <FluentModal
        open={notificationsOpen}
        title="Alertes & Notifications"
        onClose={() => setNotificationsOpen(false)}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {notificationsEnabled ? (
                <Bell className="w-5 h-5 text-blue-500" />
              ) : (
                <BellOff className="w-5 h-5 text-slate-400" />
              )}
              <span className="text-sm font-medium">
                {notificationsEnabled ? 'Notifications activées' : 'Notifications désactivées'}
              </span>
            </div>
            <FluentButton
              size="sm"
              variant={notificationsEnabled ? 'secondary' : 'primary'}
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
            >
              {notificationsEnabled ? 'Désactiver' : 'Activer'}
            </FluentButton>
          </div>

          {activeNotifications.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-300 mb-3" />
              <div className="text-slate-500">Aucune alerte en cours</div>
              <div className="text-xs text-slate-400 mt-1">Les nouvelles alertes apparaîtront ici</div>
            </div>
          ) : (
            <div className="space-y-2 max-h-[350px] overflow-auto">
              {activeNotifications.map((notif) => (
                <div
                  key={notif.id}
                  className={cn(
                    'p-3 rounded-xl border flex items-start gap-3',
                    notif.severity === 'critical' && 'border-rose-300/50 bg-rose-50/50 dark:border-rose-700/30 dark:bg-rose-900/20',
                    notif.severity === 'warning' && 'border-amber-300/50 bg-amber-50/50 dark:border-amber-700/30 dark:bg-amber-900/20',
                    notif.severity === 'info' && 'border-blue-300/50 bg-blue-50/50 dark:border-blue-700/30 dark:bg-blue-900/20'
                  )}
                >
                  {notif.severity === 'critical' && <AlertCircle className="w-5 h-5 text-rose-500 flex-none mt-0.5" />}
                  {notif.severity === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-500 flex-none mt-0.5" />}
                  {notif.severity === 'info' && <Bell className="w-5 h-5 text-blue-500 flex-none mt-0.5" />}
                  
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">{notif.message}</div>
                    <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                      <span>{safeFRDate(notif.createdAt)}</span>
                      {notif.delegationId && (
                        <button
                          className="text-purple-600 hover:underline"
                          onClick={() => {
                            openDelegation(notif.delegationId);
                            setNotificationsOpen(false);
                          }}
                        >
                          Voir
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <button
                    className="w-8 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center flex-none"
                    onClick={() => dismissNotification(notif.id)}
                    title="Ignorer"
                  >
                    <X className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeNotifications.length > 0 && (
            <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-800">
              <FluentButton
                size="sm"
                variant="secondary"
                onClick={() => {
                  activeNotifications.forEach((n) => dismissNotification(n.id));
                }}
              >
                Tout ignorer
              </FluentButton>
              <FluentButton size="sm" variant="secondary" onClick={() => setNotificationsOpen(false)}>
                Fermer
              </FluentButton>
            </div>
          )}
        </div>
      </FluentModal>
    </>
  );
}

// ================================
// Main Component with Provider
// ================================
export default function DelegationsPage() {
  return (
    <DelegationToastProvider>
      <DelegationsPageContent />
    </DelegationToastProvider>
  );
}
