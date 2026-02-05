/**
 * Escalades & Blocages critiques - Onglet 3
 * Agrège toutes les escalades critiques provenant des différents modules opérationnels
 */

'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertOctagon,
  ArrowUpRight,
  Bell,
  FolderKanban,
  Scale,
  Ticket,
  Gavel,
  Clock,
  Users,
  ExternalLink,
  Play,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { useGovernanceCommandCenterStore } from '@/lib/stores/governanceCommandCenterStore';

// Types d'escalades par module
const escalationModules = {
  alertes: { icon: Bell, label: 'Centre d\'alertes', color: 'red' },
  blocked: { icon: FolderKanban, label: 'Dossiers bloqués', color: 'amber' },
  substitution: { icon: Users, label: 'Substitution', color: 'blue' },
  arbitrages: { icon: Scale, label: 'Arbitrages', color: 'purple' },
  tickets: { icon: Ticket, label: 'Tickets critiques', color: 'orange' },
  litiges: { icon: Gavel, label: 'Litiges', color: 'red' },
};

// Données mock pour la démo
const escalations = [
  {
    id: '1',
    ref: 'ESC-001',
    title: 'Retard livraison matériaux site B - Projet Alpha',
    module: 'alertes' as const,
    level: 2,
    daysOpen: 5,
    severity: 'critical' as const,
    origin: 'Centre d\'alertes',
    impact: '450K€',
    status: 'open' as const,
  },
  {
    id: '2',
    ref: 'ESC-002',
    title: 'Dossier bloqué - Validation BC #2847',
    module: 'blocked' as const,
    level: 3,
    daysOpen: 12,
    severity: 'critical' as const,
    origin: 'Dossiers bloqués',
    impact: '680K€',
    status: 'open' as const,
  },
  {
    id: '3',
    ref: 'ESC-003',
    title: 'Substitution non résolue - Projet Gamma',
    module: 'substitution' as const,
    level: 2,
    daysOpen: 4,
    severity: 'high' as const,
    origin: 'Substitution',
    impact: '120K€',
    status: 'open' as const,
  },
  {
    id: '4',
    ref: 'ESC-004',
    title: 'Arbitrage bloqué - Goulot ressources',
    module: 'arbitrages' as const,
    level: 3,
    daysOpen: 8,
    severity: 'critical' as const,
    origin: 'Arbitrages',
    impact: '850K€',
    status: 'open' as const,
  },
  {
    id: '5',
    ref: 'ESC-005',
    title: 'Ticket client critique - Réclamation majeure',
    module: 'tickets' as const,
    level: 2,
    daysOpen: 3,
    severity: 'high' as const,
    origin: 'Tickets critiques',
    impact: 'Réputation',
    status: 'open' as const,
  },
  {
    id: '6',
    ref: 'ESC-006',
    title: 'Litige à haut risque - Enjeu financier majeur',
    module: 'litiges' as const,
    level: 3,
    daysOpen: 15,
    severity: 'critical' as const,
    origin: 'Litiges',
    impact: '1.2M€',
    status: 'open' as const,
  },
];

export function EscaladesBlocagesView() {
  const { navigate, openModal } = useGovernanceCommandCenterStore();
  const [selectedModule, setSelectedModule] = useState<string | 'all'>('all');

  const filteredEscalations =
    selectedModule === 'all'
      ? escalations
      : escalations.filter((esc) => esc.module === selectedModule);

  const escalationsByModule = escalations.reduce(
    (acc, esc) => {
      acc[esc.module] = (acc[esc.module] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  // KPIs
  const activeEscalations = escalations.filter((e) => e.status === 'open').length;
  const criticalEscalations = escalations.filter((e) => e.severity === 'critical').length;
  const avgDaysOpen =
    escalations.length > 0
      ? Math.round(escalations.reduce((sum, e) => sum + e.daysOpen, 0) / escalations.length)
      : 0;

  return (
    <div className="p-4 space-y-4">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/60 rounded-lg border border-slate-700/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertOctagon className="h-4 w-4 text-red-400" />
            <span className="text-xs font-medium text-slate-400">Escalades actives</span>
          </div>
          <div className="text-2xl font-bold text-red-400">{activeEscalations}</div>
        </div>
        <div className="bg-slate-900/60 rounded-lg border border-slate-700/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertOctagon className="h-4 w-4 text-red-500" />
            <span className="text-xs font-medium text-slate-400">Escalades critiques</span>
          </div>
          <div className="text-2xl font-bold text-red-500">{criticalEscalations}</div>
        </div>
        <div className="bg-slate-900/60 rounded-lg border border-slate-700/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-amber-400" />
            <span className="text-xs font-medium text-slate-400">Durée moyenne</span>
          </div>
          <div className="text-2xl font-bold text-amber-400">{avgDaysOpen}j</div>
        </div>
      </div>

      {/* Filtres par module */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedModule('all')}
          className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-all',
            selectedModule === 'all'
              ? 'bg-blue-500/15 text-slate-200 border border-blue-500/30'
              : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/60 border border-transparent'
          )}
        >
          <Filter className="h-4 w-4" />
          Tous
          <Badge className="bg-slate-700/50 text-slate-400 border-slate-600/50 text-xs">
            {escalations.length}
          </Badge>
        </button>
        {Object.entries(escalationModules).map(([moduleKey, module]) => {
          const Icon = module.icon;
          const count = escalationsByModule[moduleKey] || 0;
          if (count === 0) return null;
          return (
            <button
              key={moduleKey}
              onClick={() => setSelectedModule(moduleKey)}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-all',
                selectedModule === moduleKey
                  ? 'bg-blue-500/15 text-slate-200 border border-blue-500/30'
                  : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/60 border border-transparent'
              )}
            >
              <Icon className="h-4 w-4" />
              {module.label}
              <Badge className="bg-slate-700/50 text-slate-400 border-slate-600/50 text-xs">
                {count}
              </Badge>
            </button>
          );
        })}
      </div>

      {/* Liste des escalades */}
      <div className="bg-slate-900/60 rounded-lg border border-slate-700/50">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/50">
          <div className="flex items-center gap-2">
            <AlertOctagon className="h-4 w-4 text-red-400" />
            <h3 className="text-sm font-medium text-slate-300">Escalades actives</h3>
            <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">
              {filteredEscalations.length}
            </Badge>
          </div>
        </div>
        <div className="divide-y divide-slate-800/50">
          {filteredEscalations.map((esc) => {
            const moduleConfig = escalationModules[esc.module];
            const ModuleIcon = moduleConfig.icon;
            return (
              <div
                key={esc.id}
                className="flex items-center justify-between px-4 py-3 hover:bg-slate-800/30 transition-colors cursor-pointer"
                onClick={() => openModal('escalation', esc)}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div
                    className={cn(
                      'flex items-center justify-center w-10 h-10 rounded-full',
                      esc.severity === 'critical'
                        ? 'bg-red-500/20'
                        : esc.level === 3
                        ? 'bg-amber-500/20'
                        : 'bg-blue-500/20'
                    )}
                  >
                    <ModuleIcon
                      className={cn(
                        'h-5 w-5',
                        esc.severity === 'critical'
                          ? 'text-red-400'
                          : esc.level === 3
                          ? 'text-amber-400'
                          : 'text-blue-400'
                      )}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm text-slate-300">{esc.title}</p>
                      <Badge
                        className={cn(
                          'text-xs',
                          esc.severity === 'critical'
                            ? 'bg-red-500/20 text-red-400 border-red-500/30'
                            : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                        )}
                      >
                        N{esc.level}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-slate-400">{esc.ref}</span>
                      <span className="text-xs text-slate-600">•</span>
                      <span className="text-xs text-slate-400">{esc.origin}</span>
                      <span className="text-xs text-slate-600">•</span>
                      <span
                        className={cn(
                          'text-xs font-medium',
                          esc.daysOpen > 10
                            ? 'text-red-400'
                            : esc.daysOpen > 5
                            ? 'text-amber-400'
                            : 'text-slate-400'
                        )}
                      >
                        {esc.daysOpen}j ouverts
                      </span>
                      <span className="text-xs text-slate-600">•</span>
                      <span className="text-xs text-amber-400">Impact: {esc.impact}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-slate-400 hover:text-slate-300"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Navigation vers le module source
                      navigate('strategic-view' as any);
                    }}
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Module source
                  </Button>
                  <Button
                    size="sm"
                    className="h-7 px-2 bg-blue-600/80 hover:bg-blue-600 text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      openModal('escalation', { ...esc, action: 'treat' });
                    }}
                  >
                    <Play className="h-3 w-3 mr-1" />
                    Traiter
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
