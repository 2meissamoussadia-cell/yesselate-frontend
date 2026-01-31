/**
 * Vue Risques & Alertes
 * Registre des risques, alertes actives et plans de mitigation
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertTriangle,
  AlertCircle,
  Shield,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  XCircle,
  Bell,
  BellOff,
  Eye,
  ChevronRight,
  Filter,
  Plus,
} from 'lucide-react';
import { useGovernanceCommandCenterStore } from '@/lib/stores/governanceCommandCenterStore';
import { SurveillanceTable } from '../SurveillanceTable';
import type { SurveillanceItem, AlertItem } from '../types';

// Données de démonstration
const risksData: SurveillanceItem[] = [
  {
    id: '1',
    reference: 'RSK-001',
    designation: 'Retard approvisionnement acier',
    project: 'Tours Horizon',
    responsable: 'Resp. Achats',
    dateEcheance: '20/01/2026',
    status: 'at-risk',
    priority: 'critical',
    progress: 30,
    alerts: 2,
    metadata: { probability: 'haute', impact: 'majeur', mitigation: 'en cours' },
  },
  {
    id: '2',
    reference: 'RSK-002',
    designation: 'Conditions météo défavorables Q1',
    project: 'Tous projets',
    responsable: 'Direction Ops',
    dateEcheance: '28/02/2026',
    status: 'on-track',
    priority: 'medium',
    progress: 60,
    metadata: { probability: 'moyenne', impact: 'modéré', mitigation: 'planifié' },
  },
  {
    id: '3',
    reference: 'RSK-003',
    designation: 'Pénurie main d\'œuvre qualifiée',
    project: 'Centre Commercial',
    responsable: 'RH',
    dateEcheance: '15/02/2026',
    status: 'late',
    priority: 'high',
    progress: 15,
    alerts: 1,
    metadata: { probability: 'haute', impact: 'majeur', mitigation: 'bloqué' },
  },
];

const alertsData: AlertItem[] = [
  {
    id: '1',
    type: 'critical',
    title: 'Dépassement budget lot 4',
    description: 'Le budget du lot 4 a dépassé le seuil d\'alerte de 15%',
    source: 'Système Finance',
    timestamp: 'il y a 15 min',
    project: 'Tours Horizon',
    assignee: 'Jean Dupont',
    isRead: false,
  },
  {
    id: '2',
    type: 'critical',
    title: 'Non-conformité détectée',
    description: 'Écart constaté lors du contrôle qualité béton B35',
    source: 'Qualité',
    timestamp: 'il y a 45 min',
    project: 'Résidence Jardins',
    isRead: false,
  },
  {
    id: '3',
    type: 'warning',
    title: 'Retard validation BC #2847',
    description: 'Le bon de commande est en attente de validation depuis 5 jours',
    source: 'Workflow',
    timestamp: 'il y a 2h',
    project: 'Centre Commercial',
    isRead: true,
  },
  {
    id: '4',
    type: 'warning',
    title: 'Ressource indisponible',
    description: 'L\'ingénieur structure sera absent la semaine prochaine',
    source: 'Planning',
    timestamp: 'il y a 3h',
    project: 'Gare Est',
    isRead: true,
  },
  {
    id: '5',
    type: 'info',
    title: 'Jalon J5 atteint',
    description: 'Le jalon J5 du projet Beta a été validé avec succès',
    source: 'Projet',
    timestamp: 'il y a 5h',
    project: 'Centre Commercial',
    isRead: true,
  },
];

export function RisksView() {
  const { navigation, openModal } = useGovernanceCommandCenterStore();

  // Router selon la sous-catégorie
  if ((navigation.subCategory as any) === 'alerts') {
    return <AlertsListView alerts={alertsData} />;
  }

  if ((navigation.subCategory as any) === 'mitigation') {
    return <MitigationView />;
  }

  if ((navigation.subCategory as any) === 'monitoring') {
    return <MonitoringView />;
  }

  // Vue registre des risques par défaut
  return <RiskRegisterView risks={risksData} />;
}

function RiskRegisterView({ risks }: { risks: SurveillanceItem[] }) {
  const { openModal, openDetailPanel } = useGovernanceCommandCenterStore();

  // Stats
  const criticalCount = risks.filter(r => r.priority === 'critical').length;
  const highCount = risks.filter(r => r.priority === 'high').length;

  return (
    <div className="flex flex-col h-full">
      {/* Stats Header */}
      <div className="grid grid-cols-4 gap-4 p-4 border-b border-slate-800/50">
        <div className="bg-slate-900/60 rounded-lg p-3 border border-slate-800/50">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Risques actifs</span>
            <AlertTriangle className="h-4 w-4 text-slate-400" />
          </div>
          <p className="text-xl font-bold text-slate-200 mt-1">{risks.length}</p>
        </div>
        <div className="bg-slate-900/60 rounded-lg p-3 border border-red-500/20">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Critiques</span>
            <XCircle className="h-4 w-4 text-red-400" />
          </div>
          <p className="text-xl font-bold text-red-400 mt-1">{criticalCount}</p>
        </div>
        <div className="bg-slate-900/60 rounded-lg p-3 border border-orange-500/20">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Élevés</span>
            <AlertTriangle className="h-4 w-4 text-orange-400" />
          </div>
          <p className="text-xl font-bold text-orange-400 mt-1">{highCount}</p>
        </div>
        <div className="bg-slate-900/60 rounded-lg p-3 border border-emerald-500/20">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Mitigés ce mois</span>
            <Shield className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="text-xl font-bold text-emerald-400 mt-1">8</p>
        </div>
      </div>

      {/* Risk Matrix Preview */}
      <div className="p-4 border-b border-slate-800/50">
        <h4 className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-3">
          Matrice Probabilité / Impact
        </h4>
        <div className="grid grid-cols-4 gap-1 h-24">
          {/* Impact: Majeur */}
          <div className="bg-amber-500/20 rounded-tl flex items-center justify-center">
            <span className="text-xs text-amber-400">2</span>
          </div>
          <div className="bg-red-500/30 flex items-center justify-center">
            <span className="text-xs text-red-400">3</span>
          </div>
          <div className="bg-red-500/40 flex items-center justify-center">
            <span className="text-xs text-red-400">1</span>
          </div>
          <div className="bg-red-500/50 rounded-tr flex items-center justify-center">
            <span className="text-xs text-red-400 font-bold">2</span>
          </div>
          {/* Impact: Modéré */}
          <div className="bg-emerald-500/20 flex items-center justify-center">
            <span className="text-xs text-emerald-400">1</span>
          </div>
          <div className="bg-amber-500/20 flex items-center justify-center">
            <span className="text-xs text-amber-400">4</span>
          </div>
          <div className="bg-amber-500/30 flex items-center justify-center">
            <span className="text-xs text-amber-400">2</span>
          </div>
          <div className="bg-red-500/30 flex items-center justify-center">
            <span className="text-xs text-red-400">1</span>
          </div>
          {/* Impact: Mineur */}
          <div className="bg-emerald-500/10 rounded-bl flex items-center justify-center">
            <span className="text-xs text-slate-400">0</span>
          </div>
          <div className="bg-emerald-500/20 flex items-center justify-center">
            <span className="text-xs text-emerald-400">3</span>
          </div>
          <div className="bg-amber-500/10 flex items-center justify-center">
            <span className="text-xs text-amber-400">1</span>
          </div>
          <div className="bg-amber-500/20 rounded-br flex items-center justify-center">
            <span className="text-xs text-amber-400">0</span>
          </div>
        </div>
        <div className="flex items-center justify-between mt-2 text-xs text-slate-600">
          <span>Faible</span>
          <span>← Probabilité →</span>
          <span>Très haute</span>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-hidden">
        <SurveillanceTable
          tableId="risks-register"
          items={risks}
          onItemClick={(item) => openDetailPanel('risk', item.id, item)}
          onAction={(action, item) => {
            if (action === 'view') openModal('risk-detail', item);
          }}
        />
      </div>
    </div>
  );
}

function AlertsListView({ alerts }: { alerts: AlertItem[] }) {
  const { navigation, openModal } = useGovernanceCommandCenterStore();
  const [filter, setFilter] = React.useState<'all' | 'unread' | 'critical'>('all');

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'unread') return !alert.isRead;
    if (filter === 'critical') return alert.type === 'critical';
    if (navigation.subSubCategory === 'critical') return alert.type === 'critical';
    if (navigation.subSubCategory === 'warning') return alert.type === 'warning';
    return true;
  });

  const typeConfig = {
    critical: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
    warning: { icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
    info: { icon: AlertCircle, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800/50">
        <div className="flex items-center gap-4">
          <h3 className="text-sm font-medium text-slate-300">Alertes actives</h3>
          <div className="flex items-center gap-1">
            {(['all', 'unread', 'critical'] as const).map((f) => (
              <Button
                key={f}
                variant="ghost"
                size="sm"
                className={cn(
                  'h-7 px-2 text-xs',
                  filter === f
                    ? 'bg-slate-800 text-slate-200'
                    : 'text-slate-400 hover:text-slate-300'
                )}
                onClick={() => setFilter(f)}
              >
                {f === 'all' ? 'Toutes' : f === 'unread' ? 'Non lues' : 'Critiques'}
              </Button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="h-8 text-slate-400">
            <BellOff className="h-4 w-4 mr-1" />
            Tout marquer lu
          </Button>
        </div>
      </div>

      {/* Alerts List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-800/50">
        {filteredAlerts.map((alert) => {
          const config = typeConfig[alert.type];
          const Icon = config.icon;

          return (
            <div
              key={alert.id}
              className={cn(
                'flex items-start gap-3 p-4 transition-colors cursor-pointer hover:bg-slate-800/30',
                !alert.isRead && 'bg-slate-800/20'
              )}
              onClick={() => openModal('alert-detail', alert)}
            >
              <div className={cn('p-2 rounded-lg flex-shrink-0', config.bg)}>
                <Icon className={cn('h-4 w-4', config.color)} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className={cn(
                      'text-sm',
                      !alert.isRead ? 'text-slate-200 font-medium' : 'text-slate-400'
                    )}>
                      {alert.title}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                      {alert.description}
                    </p>
                  </div>
                  {!alert.isRead && (
                    <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />
                  )}
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <Badge variant="default" className="text-xs bg-slate-800 text-slate-400 border-slate-700">
                    {alert.project}
                  </Badge>
                  <span className="text-xs text-slate-600">{alert.source}</span>
                  <span className="text-xs text-slate-600">{alert.timestamp}</span>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-600 flex-shrink-0 mt-1" />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MitigationView() {
  const mitigations = [
    {
      id: '1',
      risk: 'Retard approvisionnement acier',
      plan: 'Diversification fournisseurs',
      status: 'en-cours',
      progress: 60,
      owner: 'Achats',
    },
    {
      id: '2',
      risk: 'Pénurie main d\'œuvre',
      plan: 'Partenariat écoles + intérim',
      status: 'planifié',
      progress: 20,
      owner: 'RH',
    },
  ];

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-slate-300">Plans de mitigation</h3>
        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-1" />
          Nouveau plan
        </Button>
      </div>

      <div className="space-y-3">
        {mitigations.map((m) => (
          <div
            key={m.id}
            className="p-4 rounded-lg bg-slate-900/60 border border-slate-800/50"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-300">{m.plan}</p>
                <p className="text-xs text-slate-400 mt-1">Risque: {m.risk}</p>
              </div>
              <Badge
                className={cn(
                  'text-xs',
                  m.status === 'en-cours'
                    ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                    : 'bg-slate-500/20 text-slate-400 border-slate-500/30'
                )}
              >
                {m.status}
              </Badge>
            </div>
            <div className="mt-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-slate-400">Avancement</span>
                <span className="text-xs text-slate-400">{m.progress}%</span>
              </div>
              <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${m.progress}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MonitoringView() {
  return (
    <div className="flex items-center justify-center h-full text-slate-400">
      <div className="text-center">
        <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p className="text-sm">Surveillance en temps réel</p>
        <p className="text-xs text-slate-600 mt-1">Indicateurs et seuils d'alerte</p>
      </div>
    </div>
  );
}

