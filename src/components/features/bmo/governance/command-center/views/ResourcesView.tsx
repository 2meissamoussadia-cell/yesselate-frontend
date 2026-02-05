/**
 * Vue Ressources & Équipes
 * Affectations, plan de charge, compétences, sous-traitants
 */

'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  UserCog,
  BarChart3,
  Brain,
  Truck,
  Building2,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Plus,
  Filter,
  Calendar,
} from 'lucide-react';
import { useGovernanceCommandCenterStore } from '@/lib/stores/governanceCommandCenterStore';
import { SurveillanceTable } from '../SurveillanceTable';
import type { SurveillanceItem } from '../types';

// Données de démonstration
const allocationsData: SurveillanceItem[] = [
  {
    id: '1',
    reference: 'RES-001',
    designation: 'Jean Dupont - Ingénieur Structure',
    project: 'Tours Horizon',
    responsable: 'Dir. Technique',
    dateEcheance: '31/03/2026',
    status: 'on-track',
    priority: 'high',
    progress: 85,
    metadata: { role: 'Ingénieur', allocation: 100 },
  },
  {
    id: '2',
    reference: 'RES-002',
    designation: 'Marie Martin - Chef de chantier',
    project: 'Centre Commercial',
    responsable: 'Dir. Ops',
    dateEcheance: '28/06/2026',
    status: 'at-risk',
    priority: 'critical',
    progress: 120,
    alerts: 1,
    metadata: { role: 'Chef chantier', allocation: 120 },
  },
  {
    id: '3',
    reference: 'RES-003',
    designation: 'Pierre Bernard - Conducteur travaux',
    project: 'Résidence Jardins',
    responsable: 'Dir. Ops',
    dateEcheance: '15/02/2026',
    status: 'on-track',
    priority: 'medium',
    progress: 75,
    metadata: { role: 'Conducteur', allocation: 75 },
  },
];

const capacityData = [
  { team: 'Ingénierie', capacity: 85, projects: 5, members: 12 },
  { team: 'Chantier A', capacity: 110, projects: 2, members: 25 },
  { team: 'Chantier B', capacity: 95, projects: 3, members: 18 },
  { team: 'Qualité', capacity: 70, projects: 8, members: 6 },
  { team: 'Méthodes', capacity: 60, projects: 4, members: 8 },
];

const skillsMatrix = [
  { skill: 'Gestion de projet', available: 8, required: 10, gap: -2 },
  { skill: 'Béton armé', available: 15, required: 12, gap: 3 },
  { skill: 'Électricité HT', available: 3, required: 5, gap: -2 },
  { skill: 'Plomberie', available: 6, required: 6, gap: 0 },
  { skill: 'Soudure', available: 4, required: 8, gap: -4 },
];

const subcontractors = [
  { id: '1', name: 'Électricité Martin', domain: 'Électricité', status: 'active', performance: 92, contracts: 3 },
  { id: '2', name: 'Plomberie Durand', domain: 'Plomberie', status: 'active', performance: 88, contracts: 2 },
  { id: '3', name: 'Béton Express', domain: 'Gros œuvre', status: 'warning', performance: 75, contracts: 1 },
  { id: '4', name: 'Peinture Pro', domain: 'Finitions', status: 'active', performance: 95, contracts: 4 },
];

export function ResourcesView() {
  const { navigation, openModal } = useGovernanceCommandCenterStore();

  switch (navigation.subCategory as any) {
    case 'capacity':
      return <CapacityView data={capacityData} />;
    case 'skills':
      return <SkillsView data={skillsMatrix} />;
    case 'subcontractors':
      return <SubcontractorsView data={subcontractors} />;
    case 'mobilization':
      return <MobilizationView />;
    default:
      return <AllocationView data={allocationsData} />;
  }
}

function AllocationView({ data }: { data: SurveillanceItem[] }) {
  const { openDetailPanel } = useGovernanceCommandCenterStore();

  // Stats
  const overloaded = data.filter(d => (d.metadata?.allocation || 0) > 100).length;
  const underloaded = data.filter(d => (d.metadata?.allocation || 0) < 50).length;

  return (
    <div className="flex flex-col h-full">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 p-4 border-b border-slate-800/50">
        <StatCard icon={Users} iconColor="text-blue-400" label="Ressources affectées" value={data.length} />
        <StatCard icon={CheckCircle2} iconColor="text-emerald-400" label="Charge optimale" value={data.length - overloaded - underloaded} />
        <StatCard icon={AlertTriangle} iconColor="text-red-400" label="Surcharge" value={overloaded} />
        <StatCard icon={Clock} iconColor="text-amber-400" label="Sous-charge" value={underloaded} />
      </div>

      {/* Table */}
      <div className="flex-1 overflow-hidden">
        <SurveillanceTable
          tableId="resources-allocation"
          items={data}
          columns={['selection', 'reference', 'designation', 'project', 'status', 'progress', 'actions']}
          onItemClick={(item) => openDetailPanel('resource', item.id, item)}
        />
      </div>
    </div>
  );
}

function CapacityView({ data }: { data: typeof capacityData }) {
  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-slate-300">Plan de charge par équipe</h3>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="h-8 text-slate-400">
            <Calendar className="h-4 w-4 mr-1" />
            Période
          </Button>
        </div>
      </div>

      {/* Capacity bars */}
      <div className="space-y-3">
        {data.map((team) => (
          <div key={team.team} className="p-4 rounded-lg bg-slate-900/60 border border-slate-800/50">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-medium text-slate-300">{team.team}</p>
                <p className="text-xs text-slate-400">{team.members} membres • {team.projects} projets</p>
              </div>
              <div className="text-right">
                <span className={cn(
                  'text-lg font-bold',
                  team.capacity > 100 ? 'text-red-400' :
                  team.capacity > 85 ? 'text-amber-400' : 'text-emerald-400'
                )}>
                  {team.capacity}%
                </span>
              </div>
            </div>
            <div className="h-3 bg-slate-700/50 rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all',
                  team.capacity > 100 ? 'bg-red-500' :
                  team.capacity > 85 ? 'bg-amber-500' : 'bg-emerald-500'
                )}
                style={{ width: `${Math.min(team.capacity, 100)}%` }}
              />
            </div>
            {team.capacity > 100 && (
              <p className="text-xs text-red-400 mt-2 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Surcharge de {team.capacity - 100}%
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function SkillsView({ data }: { data: typeof skillsMatrix }) {
  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-slate-300">Matrice des compétences</h3>
        <Button size="sm" className="h-8 bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-1" />
          Besoin
        </Button>
      </div>

      {/* Skills matrix */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-800/50">
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Compétence</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-slate-400 uppercase">Disponibles</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-slate-400 uppercase">Requis</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-slate-400 uppercase">Écart</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {data.map((skill) => (
              <tr key={skill.skill} className="hover:bg-slate-800/30">
                <td className="px-4 py-3">
                  <span className="text-sm text-slate-300">{skill.skill}</span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="text-sm text-slate-400">{skill.available}</span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="text-sm text-slate-400">{skill.required}</span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={cn(
                    'text-sm font-medium',
                    skill.gap > 0 ? 'text-emerald-400' :
                    skill.gap < 0 ? 'text-red-400' : 'text-slate-400'
                  )}>
                    {skill.gap > 0 ? '+' : ''}{skill.gap}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Badge
                    variant="default"
                    className={cn(
                      'text-xs',
                      skill.gap >= 0
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-red-500/10 text-red-400 border-red-500/30'
                    )}
                  >
                    {skill.gap >= 0 ? 'OK' : 'Déficit'}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SubcontractorsView({ data }: { data: typeof subcontractors }) {
  const { openModal } = useGovernanceCommandCenterStore();

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-slate-300">Sous-traitants</h3>
        <Button size="sm" className="h-8 bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-1" />
          Ajouter
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.map((sub) => (
          <div
            key={sub.id}
            className="p-4 rounded-lg bg-slate-900/60 border border-slate-800/50 hover:border-slate-700/50 cursor-pointer transition-colors"
            onClick={() => openModal('project-detail', sub)}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center">
                  <Truck className="h-5 w-5 text-slate-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-300">{sub.name}</p>
                  <p className="text-xs text-slate-400">{sub.domain}</p>
                </div>
              </div>
              <Badge
                variant="default"
                className={cn(
                  'text-xs',
                  sub.status === 'active'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                )}
              >
                {sub.status === 'active' ? 'Actif' : 'Attention'}
              </Badge>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-xs text-slate-400">Performance</p>
                  <p className={cn(
                    'text-sm font-medium',
                    sub.performance >= 90 ? 'text-emerald-400' :
                    sub.performance >= 80 ? 'text-amber-400' : 'text-red-400'
                  )}>
                    {sub.performance}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Contrats</p>
                  <p className="text-sm font-medium text-slate-300">{sub.contracts}</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-600" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MobilizationView() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <Building2 className="h-12 w-12 mx-auto mb-4 text-slate-600" />
        <p className="text-sm text-slate-400">Plan de mobilisation</p>
        <p className="text-xs text-slate-600 mt-1">Planification des ressources</p>
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

