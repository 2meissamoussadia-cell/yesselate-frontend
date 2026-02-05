// ============================================
// Hook pour gérer la logique Alertes de la page Governance
// ============================================

import { useState, useMemo, useCallback, useDeferredValue } from 'react';
import { useDebouncedValue } from './useDebouncedValue';
import type { Alert, Incident, Severity } from '@/lib/types/alerts.types';
import { correlateAlertsToIncidents } from '@/lib/types/alerts.types';
import { useAlertPredictions } from './useAlertPredictions';
import type { GovernanceFilters, SavedView } from './useGovernanceFilters';
import {
  systemAlerts,
  blockedDossiers,
  paymentsN1,
  contractsToSign,
} from '@/lib/data';

// Utilitaires de parsing de dates
const parseFRDate = (str?: string | null): Date | null => {
  if (!str) return null;
  const raw = String(str).trim();
  if (!raw) return null;
  const [dd, mm, yyyy] = raw.split('/').map((n) => Number(n));
  if (!dd || !mm || !yyyy) return null;
  const d = new Date(yyyy, mm - 1, dd);
  return Number.isNaN(d.getTime()) ? null : d;
};

const parseAnyDate = (str?: string | null): Date | null => {
  if (!str) return null;
  const raw = String(str).trim();
  if (!raw) return null;
  if (raw.includes('T') || raw.includes('-')) {
    const d = new Date(raw);
    if (!Number.isNaN(d.getTime())) return d;
  }
  const fr = parseFRDate(raw);
  if (fr) return fr;
  const d2 = new Date(raw);
  return Number.isNaN(d2.getTime()) ? null : d2;
};

const daysUntil = (date: Date | null): number | null => {
  if (!date) return null;
  const today = new Date();
  const a = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const b = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diff = b.getTime() - a.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

export interface AlertsStats {
  total: number;
  critical: number;
  warning: number;
  info: number;
  success: number;
  open: number;
  resolved: number;
}

export interface PerformanceStats {
  avgResolutionTime: string;
  resolutionRate: number;
  escalationRate: number;
  criticalResolved: number;
  criticalTotal: number;
}

export interface AlertsState {
  selectedAlertIds: Set<string>;
  selectedAlert: string | null;
  escalateModalOpen: boolean;
  resolveModalOpen: boolean;
  alertToAction: Alert | null;
  focusMode: boolean;
  showPredictions: boolean;
}

/**
 * Hook pour gérer l'état et la logique des alertes
 */
export function useGovernanceAlerts(
  search: string,
  filters: GovernanceFilters,
  activeView: SavedView,
  focusMode: boolean
) {
  // Debounce la recherche pour éviter les recalculs excessifs
  const debouncedSearch = useDebouncedValue(search, 300);
  const deferredSearch = useDeferredValue(debouncedSearch);

  // État des alertes
  const [selectedAlertIds, setSelectedAlertIds] = useState<Set<string>>(new Set());
  const [selectedAlert, setSelectedAlert] = useState<string | null>(null);
  const [escalateModalOpen, setEscalateModalOpen] = useState(false);
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [alertToAction, setAlertToAction] = useState<Alert | null>(null);
  const [showPredictions, setShowPredictions] = useState(true);

  // Alerts enrichies (conversion vers type Alert standard)
  const alerts: Alert[] = useMemo(() => {
    const list: Alert[] = [];

    // System alerts
    systemAlerts.forEach(a => {
      if (a.type === 'critical' || a.type === 'warning') {
        list.push({
          id: a.id,
          severity: a.type,
          type: 'system',
          bureau: undefined,
          title: a.title,
          description: a.action,
          createdAt: new Date().toISOString(),
          entity: undefined,
          impact: undefined,
          slaDueAt: undefined,
          status: 'open',
        });
      }
    });

    // Blocked dossiers
    blockedDossiers.filter(d => d.delay >= 3).forEach(d => {
      list.push({
        id: d.id,
        severity: d.delay >= 5 || d.impact === 'critical' ? 'critical' : 'warning',
        type: 'blocked',
        bureau: d.bureau,
        title: `${d.type} bloqué • ${d.delay}j`,
        description: d.subject,
        createdAt: parseAnyDate(d.blockedSince)?.toISOString() || new Date().toISOString(),
        entity: { kind: 'validation', id: d.id, projectId: d.project },
        impact: { 
          money: typeof d.amount === 'number' 
            ? d.amount 
            : parseFloat(String(d.amount || 0).replace(/[^\d]/g, '')) || 0, 
          scheduleDays: d.delay 
        },
        status: 'open',
      });
    });

    // Payments
    paymentsN1.forEach(p => {
      const due = parseFRDate(p.dueDate);
      const days = daysUntil(due);
      if (days !== null && (days < 0 || days <= 5)) {
        list.push({
          id: p.id,
          severity: days < 0 ? 'critical' : 'warning',
          type: 'payment',
          bureau: p.bureau,
          title: days < 0 ? `Paiement en retard • ${Math.abs(days)}j` : `Paiement à échéance • J-${days}`,
          description: `${p.beneficiary} • ${p.amount ?? '—'} FCFA`,
          createdAt: new Date().toISOString(),
          entity: { kind: 'payment', id: p.id },
          impact: { money: parseFloat(String(p.amount || 0).replace(/[^\d]/g, '')) || 0 },
          slaDueAt: due?.toISOString(),
          status: 'open',
        });
      }
    });

    // Contracts
    contractsToSign.filter(c => c.status === 'pending').forEach(c => {
      const exp = parseFRDate(c.expiry);
      const days = daysUntil(exp);
      if (days !== null && days <= 7) {
        list.push({
          id: c.id,
          severity: days < 0 ? 'critical' : 'warning',
          type: 'contract',
          bureau: undefined,
          title: days < 0 ? `Contrat expiré • ${Math.abs(days)}j` : `Contrat à sécuriser • J-${days}`,
          description: `${c.subject} • ${c.amount ?? '—'} FCFA`,
          createdAt: new Date().toISOString(),
          entity: { kind: 'contract', id: c.id },
          impact: { money: parseFloat(String(c.amount || 0).replace(/[^\d]/g, '')) || 0, legal: true },
          slaDueAt: exp?.toISOString(),
          status: 'open',
        });
      }
    });

    return list;
  }, []);

  // Prédictions d'alertes
  const alertPredictions = useAlertPredictions(alerts);

  // Incidents (corrélations)
  const incidents = useMemo(() => correlateAlertsToIncidents(alerts), [alerts]);

  // Filtered alerts (avec vue active + mode focus)
  const filteredAlerts = useMemo(() => {
    let result = alerts.filter(a => {
      // 🎯 Mode Focus : ne montrer que les alertes critiques
      if (focusMode && a.severity !== 'critical') return false;

      // View filters
      if (activeView.filters.severity && a.severity !== activeView.filters.severity) return false;
      if (activeView.filters.type && a.type !== activeView.filters.type) return false;
      if (activeView.filters.bureau && a.bureau !== activeView.filters.bureau) return false;
      if (activeView.filters.status && activeView.filters.status !== 'all') {
        if (activeView.filters.status === 'open' && a.status !== 'open') return false;
        if (activeView.filters.status === 'acknowledged' && a.status !== 'ack') return false;
        if (activeView.filters.status === 'resolved' && a.status !== 'resolved') return false;
      }

      // Search
      if (deferredSearch) {
        const q = deferredSearch.toLowerCase();
        if (
          !a.title.toLowerCase().includes(q) &&
          !a.description?.toLowerCase().includes(q) &&
          !a.id.toLowerCase().includes(q) &&
          !a.bureau?.toLowerCase().includes(q)
        ) return false;
      }

      return true;
    });

    // Sort by severity then date
    const severityRank: Record<string, number> = { critical: 4, warning: 3, info: 2, success: 1 };
    result = result.sort((a, b) => {
      const sevDiff = (severityRank[String(b.severity)] ?? 0) - (severityRank[String(a.severity)] ?? 0);
      if (sevDiff !== 0) return sevDiff;
      return (b.createdAt || '').localeCompare(a.createdAt || '');
    });

    return result;
  }, [alerts, activeView, deferredSearch, focusMode]);

  // Alerts stats
  const alertsStats: AlertsStats = useMemo(() => {
    const critical = alerts.filter(a => a.severity === 'critical').length;
    const warning = alerts.filter(a => a.severity === 'warning').length;
    const info = alerts.filter(a => a.severity === 'info').length;
    const success = alerts.filter(a => a.severity === 'success').length;
    const open = alerts.filter(a => a.status === 'open').length;
    const resolved = alerts.filter(a => a.status === 'resolved').length;
    return { total: alerts.length, critical, warning, info, success, open, resolved };
  }, [alerts]);

  // Performance stats
  const performanceStats: PerformanceStats = useMemo(() => {
    return {
      avgResolutionTime: '2.4h',
      resolutionRate: Math.round((alertsStats.resolved / (alertsStats.total || 1)) * 100),
      escalationRate: 12,
      criticalResolved: alertsStats.resolved,
      criticalTotal: alertsStats.critical,
    };
  }, [alertsStats]);

  // Selected alert data
  const selectedAlertData = useMemo(() => {
    if (!selectedAlert) return null;
    const alert = alerts.find(a => a.id === selectedAlert);
    if (!alert) return null;

    // Trouver les données enrichies (dossier bloqué, etc.)
    let data: unknown = undefined;
    if (alert.type === 'blocked') {
      data = blockedDossiers.find(d => d.id === alert.id);
    } else if (alert.type === 'system') {
      data = systemAlerts.find(a => a.id === alert.id);
    }

    return {
      id: alert.id,
      type: alert.type as 'system' | 'blocked' | 'payment' | 'contract',
      severity: alert.severity,
      title: alert.title,
      description: alert.description || '',
      bureau: alert.bureau,
      data,
    };
  }, [selectedAlert, alerts]);

  // Export CSV
  const handleExport = useCallback((
    filteredAlerts: Alert[],
    activeView: SavedView,
    filters: GovernanceFilters,
    addToast: (msg: string, type?: 'success' | 'warning' | 'info' | 'error') => void,
    addActionLog: (log: {
      userId: string;
      userName: string;
      userRole: string;
      module: string;
      action: 'export' | 'modification' | 'validation' | 'creation' | 'suppression';
      targetId?: string;
      targetType?: string;
      details?: string;
    }) => void
  ) => {
    const now = new Date();
    const criticalCount = filteredAlerts.filter(a => a.severity === 'critical').length;
    const totalImpact = filteredAlerts.reduce((sum, a) => {
      const money = typeof a.impact === 'object' && a.impact !== null && 'money' in a.impact
        ? (a.impact as { money?: number }).money
        : 0;
      return sum + (money ?? 0);
    }, 0);
    
    const header = [
      `Rapport d'Alertes - Export ${now.toLocaleDateString('fr-FR')} ${now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`,
      `Total alertes filtrées: ${filteredAlerts.length}`,
      `Alertes critiques: ${criticalCount}`,
      `Impact financier total: ${totalImpact.toLocaleString('fr-FR')} FCFA`,
      `Vue active: ${activeView.name}`,
      `Filtres appliqués: ${JSON.stringify(filters)}`,
      '',
    ];
    
    const csvContent = [
      ...header,
      ['ID', 'Type', 'Sévérité', 'Titre', 'Description', 'Bureau', 'Date création', 'Statut', 'Impact financier (FCFA)', 'Échéance SLA', 'Rôle RACI'],
      ...filteredAlerts.map(a => [
        a.id,
        a.type,
        a.severity,
        a.title,
        a.description || '',
        a.bureau || '',
        a.createdAt ? new Date(a.createdAt).toLocaleDateString('fr-FR') : '',
        a.status || 'open',
        (typeof a.impact === 'object' && a.impact !== null && 'money' in a.impact ? (a.impact as { money: number }).money : undefined)?.toString() ?? '',
        a.slaDueAt ? new Date(a.slaDueAt).toLocaleDateString('fr-FR') : '',
        '', // RACI role si disponible
      ])
    ].map(row => Array.isArray(row) ? row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',') : row).join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `alertes_${now.toISOString().slice(0, 10)}_${now.getHours()}h${now.getMinutes()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    addToast('Export CSV alertes généré avec rapport narratif', 'success');
    addActionLog({
      userId: 'USR-001',
      userName: 'A. DIALLO',
      userRole: 'Directeur Général',
      module: 'governance',
      action: 'export',
      targetId: 'ALERTS',
      targetType: 'Export',
      details: `Export alertes - ${filteredAlerts.length} alertes, ${criticalCount} critiques, ${totalImpact.toLocaleString('fr-FR')} FCFA`,
    });
  }, []);

  // Memoizer le retour pour éviter les re-renders inutiles
  return useMemo(
    () => ({
      // État
      selectedAlertIds,
      selectedAlert,
      escalateModalOpen,
      resolveModalOpen,
      alertToAction,
      showPredictions,
      alerts,
      filteredAlerts,
      incidents,
      alertPredictions,
      alertsStats,
      performanceStats,
      selectedAlertData,

      // Actions (stable grâce à useState)
      setSelectedAlertIds,
      setSelectedAlert,
      setEscalateModalOpen,
      setResolveModalOpen,
      setAlertToAction,
      setShowPredictions,
      handleExport,
    }),
    [
      selectedAlertIds,
      selectedAlert,
      escalateModalOpen,
      resolveModalOpen,
      alertToAction,
      showPredictions,
      alerts,
      filteredAlerts,
      incidents,
      alertPredictions,
      alertsStats,
      performanceStats,
      selectedAlertData,
      setSelectedAlertIds,
      setSelectedAlert,
      setEscalateModalOpen,
      setResolveModalOpen,
      setAlertToAction,
      setShowPredictions,
      handleExport,
    ]
  );
}

