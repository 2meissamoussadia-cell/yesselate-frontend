/**
 * Vue Processus & Workflows
 * Workflows, validations, délégations, RACI, procédures
 */

'use client';

import React from 'react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Workflow,
  GitPullRequest,
  CheckSquare,
  Handshake,
  Network,
  BookOpen,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ChevronRight,
  User,
  ArrowRight,
  Play,
} from 'lucide-react';
import { useGovernanceCommandCenterStore } from '@/lib/stores/governanceCommandCenterStore';
import { SurveillanceTable } from '../SurveillanceTable';
import type { SurveillanceItem } from '../types';

// Données de démonstration
const validationsData: SurveillanceItem[] = [
  {
    id: '1',
    reference: 'VAL-2024-0125',
    designation: 'Validation BC acier lot 3',
    project: 'Tours Horizon',
    responsable: 'Dir. Achats',
    dateEcheance: '12/01/2026',
    status: 'at-risk',
    priority: 'critical',
    metadata: { type: 'BC', amount: 125000, step: 2, totalSteps: 3 },
  },
  {
    id: '2',
    reference: 'VAL-2024-0126',
    designation: 'Approbation avenant planning',
    project: 'Centre Commercial',
    responsable: 'Dir. Projet',
    dateEcheance: '15/01/2026',
    status: 'on-track',
    priority: 'high',
    metadata: { type: 'Avenant', step: 1, totalSteps: 2 },
  },
  {
    id: '3',
    reference: 'VAL-2024-0127',
    designation: 'Validation fiche technique',
    project: 'Résidence Jardins',
    responsable: 'Resp. Qualité',
    dateEcheance: '10/01/2026',
    status: 'late',
    priority: 'medium',
    alerts: 1,
    metadata: { type: 'Technique', step: 3, totalSteps: 3 },
  },
];

const workflows = [
  { id: '1', name: 'Validation Bon de Commande', type: 'Achats', instances: 12, avgTime: '2.5j', status: 'active' },
  { id: '2', name: 'Approbation Avenant', type: 'Contrat', instances: 3, avgTime: '5j', status: 'active' },
  { id: '3', name: 'Demande de congés', type: 'RH', instances: 8, avgTime: '1j', status: 'active' },
  { id: '4', name: 'Validation technique', type: 'Qualité', instances: 5, avgTime: '3j', status: 'active' },
];

const delegations = [
  { id: '1', from: 'Jean Dupont', to: 'Marie Martin', type: 'Validation BC', startDate: '01/01/2026', endDate: '15/01/2026', status: 'active' },
  { id: '2', from: 'Pierre Bernard', to: 'Sophie Durand', type: 'Approbation devis', startDate: '10/01/2026', endDate: '20/01/2026', status: 'active' },
  { id: '3', from: 'Thomas Martin', to: 'Claire Petit', type: 'Signature contrat', startDate: '05/01/2026', endDate: '05/02/2026', status: 'pending' },
];

const raciMatrix = [
  { activity: 'Validation BC > 50k€', responsible: 'Dir. Achats', accountable: 'DG', consulted: 'DAF', informed: 'Chef projet' },
  { activity: 'Approbation avenant', responsible: 'Dir. Projet', accountable: 'DG', consulted: 'Juridique', informed: 'Client' },
  { activity: 'Recrutement', responsible: 'RH', accountable: 'Dir. Ops', consulted: 'Manager', informed: 'Équipe' },
  { activity: 'Commande matériel', responsible: 'Chef chantier', accountable: 'Dir. Achats', consulted: 'Logistique', informed: 'Fournisseur' },
];

export function ProcessesView() {
  const { navigation } = useGovernanceCommandCenterStore();

  switch (navigation.subCategory as any) {
    case 'workflows':
      return <WorkflowsView data={workflows} />;
    case 'delegations':
      return <DelegationsView data={delegations} />;
    case 'raci':
      return <RACIView data={raciMatrix} />;
    case 'procedures':
      return <ProceduresView />;
    default:
      return <ValidationsView data={validationsData} />;
  }
}

function ValidationsView({ data }: { data: SurveillanceItem[] }) {
  const { openDetailPanel, openModal } = useGovernanceCommandCenterStore();

  // Stats
  const pendingCount = data.filter(d => d.status === 'on-track').length;
  const lateCount = data.filter(d => d.status === 'late').length;
  const criticalCount = data.filter(d => d.priority === 'critical').length;

  return (
    <div className="flex flex-col h-full">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 p-4 border-b border-slate-800/50">
        <StatCard icon={CheckSquare} iconColor="text-blue-400" label="En attente" value={data.length} />
        <StatCard icon={Clock} iconColor="text-amber-400" label="En cours" value={pendingCount} />
        <StatCard icon={AlertTriangle} iconColor="text-red-400" label="En retard" value={lateCount} />
        <StatCard icon={XCircle} iconColor="text-red-400" label="Critiques" value={criticalCount} />
      </div>

      {/* Table */}
      <div className="flex-1 overflow-hidden">
        <SurveillanceTable
          tableId="processes-validations"
          items={data}
          onItemClick={(item) => openDetailPanel('validation', item.id, item)}
          onAction={(action, item) => {
            if (action === 'view') openModal('validation-detail', item);
          }}
        />
      </div>
    </div>
  );
}

function WorkflowsView({ data }: { data: typeof workflows }) {
  const { openModal } = useGovernanceCommandCenterStore();

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-slate-300">Workflows actifs</h3>
        <Button size="sm" className="h-8 bg-blue-600 hover:bg-blue-700">
          Configurer
        </Button>
      </div>

      <div className="space-y-3">
        {data.map((workflow) => (
          <div
            key={workflow.id}
            className="p-4 rounded-lg bg-slate-900/60 border border-slate-800/50 hover:border-slate-700/50 cursor-pointer transition-colors"
            onClick={() => openModal('project-detail', workflow)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <GitPullRequest className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-300">{workflow.name}</p>
                  <p className="text-xs text-slate-400">{workflow.type}</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-lg font-bold text-slate-200">{workflow.instances}</p>
                  <p className="text-xs text-slate-400">instances</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-slate-200">{workflow.avgTime}</p>
                  <p className="text-xs text-slate-400">temps moy.</p>
                </div>
                <Badge variant="default" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-xs">
                  Actif
                </Badge>
                <ChevronRight className="h-4 w-4 text-slate-600" />
              </div>
            </div>

            {/* Workflow steps visualization */}
            <div className="mt-4 pt-4 border-t border-slate-800/50">
              <div className="flex items-center gap-2">
                {[1, 2, 3].map((step, i) => (
                  <React.Fragment key={step}>
                    <div className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium',
                      'bg-blue-500/20 text-blue-400'
                    )}>
                      {step}
                    </div>
                    {i < 2 && (
                      <ArrowRight className="h-4 w-4 text-slate-600" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DelegationsView({ data }: { data: typeof delegations }) {
  const { openModal } = useGovernanceCommandCenterStore();

  const statusConfig = {
    'active': { label: 'Active', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
    'pending': { label: 'En attente', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
    'expired': { label: 'Expirée', color: 'bg-slate-500/10 text-slate-400 border-slate-500/30' },
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-slate-300">Délégations</h3>
        <Button size="sm" className="h-8 bg-blue-600 hover:bg-blue-700">
          Nouvelle délégation
        </Button>
      </div>

      <div className="space-y-3">
        {data.map((delegation) => {
          const status = statusConfig[delegation.status as keyof typeof statusConfig];
          return (
            <div
              key={delegation.id}
              className="p-4 rounded-lg bg-slate-900/60 border border-slate-800/50 hover:border-slate-700/50 cursor-pointer transition-colors"
              onClick={() => openModal('delegation-detail', delegation)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">
                      <User className="h-4 w-4 text-slate-400" />
                    </div>
                    <div className="text-sm">
                      <p className="text-slate-400">{delegation.from}</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-blue-400" />
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <User className="h-4 w-4 text-blue-400" />
                    </div>
                    <div className="text-sm">
                      <p className="text-slate-300">{delegation.to}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right text-xs text-slate-400">
                    <p>{delegation.startDate} - {delegation.endDate}</p>
                    <p className="text-slate-400">{delegation.type}</p>
                  </div>
                  <Badge variant="default" className={cn('text-xs', status.color)}>
                    {status.label}
                  </Badge>
                  <ChevronRight className="h-4 w-4 text-slate-600" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RACIView({ data }: { data: typeof raciMatrix }) {
  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Network className="h-5 w-5 text-blue-400" />
          <h3 className="text-sm font-medium text-slate-300">Matrice RACI</h3>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-6 h-6 rounded bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold">R</div>
            <span className="text-slate-400">Responsable</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-6 h-6 rounded bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold">A</div>
            <span className="text-slate-400">Approbateur</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-6 h-6 rounded bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold">C</div>
            <span className="text-slate-400">Consulté</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-6 h-6 rounded bg-slate-500/20 flex items-center justify-center text-slate-400 font-bold">I</div>
            <span className="text-slate-400">Informé</span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-800/50">
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Activité</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-slate-400 uppercase">R</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-slate-400 uppercase">A</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-slate-400 uppercase">C</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-slate-400 uppercase">I</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {data.map((row, index) => (
              <tr key={index} className="hover:bg-slate-800/30">
                <td className="px-4 py-3">
                  <span className="text-sm text-slate-300">{row.activity}</span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-block px-2 py-1 rounded bg-blue-500/10 text-xs text-blue-400">
                    {row.responsible}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-block px-2 py-1 rounded bg-purple-500/10 text-xs text-purple-400">
                    {row.accountable}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-block px-2 py-1 rounded bg-amber-500/10 text-xs text-amber-400">
                    {row.consulted}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-block px-2 py-1 rounded bg-slate-500/10 text-xs text-slate-400">
                    {row.informed}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ProceduresView() {
  const procedures = [
    { id: '1', name: 'Procédure achats', version: 'v2.3', lastUpdate: '15/12/2025', status: 'active' },
    { id: '2', name: 'Procédure qualité', version: 'v1.8', lastUpdate: '01/01/2026', status: 'active' },
    { id: '3', name: 'Procédure sécurité chantier', version: 'v3.1', lastUpdate: '10/11/2025', status: 'active' },
    { id: '4', name: 'Procédure gestion des risques', version: 'v2.0', lastUpdate: '20/10/2025', status: 'review' },
  ];

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-slate-300">Procédures</h3>
        <Button size="sm" className="h-8 bg-blue-600 hover:bg-blue-700">
          Nouvelle procédure
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {procedures.map((proc) => (
          <div
            key={proc.id}
            className="p-4 rounded-lg bg-slate-900/60 border border-slate-800/50 hover:border-slate-700/50 cursor-pointer transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-slate-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-300">{proc.name}</p>
                  <p className="text-xs text-slate-400">{proc.version} • Màj {proc.lastUpdate}</p>
                </div>
              </div>
              <Badge
                variant="default"
                className={cn(
                  'text-xs',
                  proc.status === 'active'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                )}
              >
                {proc.status === 'active' ? 'Active' : 'En revue'}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  iconColor,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  label: string;
  value: number | string;
}) {
  return (
    <div className="bg-slate-900/60 rounded-lg p-3 border border-slate-800/50">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={cn('h-4 w-4', iconColor)} />
        <span className="text-xs text-slate-400">{label}</span>
      </div>
      <span className="text-xl font-bold text-slate-200">{value}</span>
    </div>
  );
}

