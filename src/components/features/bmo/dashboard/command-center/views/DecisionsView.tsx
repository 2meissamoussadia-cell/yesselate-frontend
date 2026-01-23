/**
 * Vue Décisions du Dashboard
 * Timeline des décisions et suivi
 */

'use client';

import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Scale,
  CheckCircle,
  Clock,
  AlertCircle,
  ArrowRight,
  FileText,
  User,
  Calendar,
  RotateCcw,
  Key,
} from 'lucide-react';
import { useDashboardCommandCenterStore } from '@/lib/stores/dashboardCommandCenterStore';
import { useApiQuery } from '@/lib/api/hooks/useApiQuery';
import { dashboardAPI } from '@/lib/api/pilotage/dashboardClient';

// Types
interface Decision {
  id: string;
  type: 'validation' | 'substitution' | 'delegation' | 'arbitrage';
  subject: string;
  description: string;
  author: string;
  date: string;
  status: 'pending' | 'executed' | 'cancelled';
  priority: 'high' | 'medium' | 'low';
  relatedItem?: string;
}

// Données de démo
const mockDecisions: Decision[] = [
  {
    id: 'DEC-2024-001',
    type: 'substitution',
    subject: 'Substitution validation BC urgente',
    description: 'Substitution de M. Dupont par Mme Martin pour validation BC-2024-0847',
    author: 'Direction Générale',
    date: '10/01/2026',
    status: 'pending',
    priority: 'high',
    relatedItem: 'BC-2024-0847',
  },
  {
    id: 'DEC-2024-002',
    type: 'delegation',
    subject: 'Délégation pouvoir signature',
    description: 'Délégation temporaire du pouvoir de signature pour contrats < 50M FCFA',
    author: 'Mme Martin',
    date: '09/01/2026',
    status: 'executed',
    priority: 'medium',
  },
  {
    id: 'DEC-2024-003',
    type: 'arbitrage',
    subject: 'Arbitrage conflit ressources Lot 4',
    description: 'Décision sur allocation des ressources entre BOP et BF',
    author: 'Comité de pilotage',
    date: '08/01/2026',
    status: 'pending',
    priority: 'high',
    relatedItem: 'ARB-2024-0089',
  },
  {
    id: 'DEC-2024-004',
    type: 'validation',
    subject: 'Validation budget supplémentaire Phase 3',
    description: 'Approbation de l\'enveloppe additionnelle de 250M FCFA',
    author: 'Direction Financière',
    date: '07/01/2026',
    status: 'executed',
    priority: 'high',
  },
  {
    id: 'DEC-2024-005',
    type: 'substitution',
    subject: 'Substitution temporaire Chef de projet',
    description: 'M. Koné remplace M. Diallo pendant son absence',
    author: 'DRH',
    date: '05/01/2026',
    status: 'executed',
    priority: 'low',
  },
];

const typeIcons = {
  validation: CheckCircle,
  substitution: RotateCcw,
  delegation: Key,
  arbitrage: Scale,
};

const typeIconColors = {
  validation: 'text-emerald-400',
  substitution: 'text-orange-400',
  delegation: 'text-blue-400',
  arbitrage: 'text-purple-400',
};

const typeLabels = {
  validation: 'Validation',
  substitution: 'Substitution',
  delegation: 'Délégation',
  arbitrage: 'Arbitrage',
};

export function DecisionsView() {
  const { navigation, openModal } = useDashboardCommandCenterStore();

  const { data: decisionsData } = useApiQuery(async (_signal: AbortSignal) => dashboardAPI.getDecisions({ limit: 50 }), []);

  const baseDecisions: Decision[] = useMemo(() => {
    const api = (decisionsData as any)?.decisions;
    if (!Array.isArray(api) || api.length === 0) return mockDecisions;
    return api.map((d: any) => ({
      id: String(d.id),
      type: (d.type as any) || 'arbitrage',
      subject: String(d.subject ?? d.title ?? ''),
      description: String(d.description ?? ''),
      author: String(d.author ?? '—'),
      date: d.date ? new Date(d.date).toLocaleDateString('fr-FR') : String(d.date ?? ''),
      status: (d.status as any) || 'pending',
      priority: (d.priority as any) || 'medium',
      relatedItem: d.relatedItem ? String(d.relatedItem) : undefined,
    }));
  }, [decisionsData]);

  // Filtrer selon le sous-onglet
  const filteredDecisions = useMemo(() => {
    let decisions = [...baseDecisions];

    switch (navigation.subCategory) {
      case 'pending':
        decisions = decisions.filter((d) => d.status === 'pending');
        break;
      case 'executed':
        decisions = decisions.filter((d) => d.status === 'executed');
        break;
    }

    return decisions;
  }, [baseDecisions, navigation.subCategory]);

  // Stats
  const stats = useMemo(
    () => ({
      pending: baseDecisions.filter((d) => d.status === 'pending').length,
      executed: baseDecisions.filter((d) => d.status === 'executed').length,
      highPriority: baseDecisions.filter((d) => d.priority === 'high' && d.status === 'pending').length,
    }),
    [baseDecisions]
  );

  return (
    <div className="p-6 space-y-6 max-w-[1800px] mx-auto">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-200">Décisions</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Suivi et traçabilité des décisions de gouvernance
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50">
            <Clock className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-medium text-slate-200">{stats.pending} en attente</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-medium text-slate-200">{stats.executed} exécutées</span>
          </div>
          {stats.highPriority > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50">
              <AlertCircle className="w-4 h-4 text-rose-400" />
              <span className="text-sm font-medium text-slate-200">{stats.highPriority} urgentes</span>
            </div>
          )}
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Ligne verticale */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-700/50" />

        <div className="space-y-4">
          {filteredDecisions.map((decision, index) => {
            const Icon = typeIcons[decision.type];

            return (
              <div key={decision.id} className="relative flex gap-4 pl-2">
                {/* Point sur la timeline */}
                <div
                  className={cn(
                    'relative z-10 w-9 h-9 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                    'bg-slate-800/50 border-slate-700'
                  )}
                >
                  <Icon className={cn('w-4 h-4', typeIconColors[decision.type])} />
                </div>

                {/* Contenu */}
                <div
                  className={cn(
                    'flex-1 p-4 rounded-xl border transition-all',
                    decision.status === 'pending'
                      ? 'bg-slate-800/50 border-slate-700/50 hover:bg-slate-800/70'
                      : 'bg-slate-800/30 border-slate-700/30 hover:bg-slate-800/50'
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <span className="text-xs font-mono text-slate-500">{decision.id}</span>
                         <Badge
                           variant={
                             decision.status === 'executed'
                               ? 'success'
                               : decision.status === 'pending'
                               ? 'warning'
                               : 'default'
                           }
                          className="text-xs"
                        >
                          {decision.status === 'executed'
                            ? 'Exécutée'
                            : decision.status === 'pending'
                            ? 'En attente'
                            : 'Annulée'}
                        </Badge>
                        <Badge
                          variant="default"
                          className="text-xs border-slate-700 text-slate-400"
                        >
                          {typeLabels[decision.type]}
                        </Badge>
                        {decision.priority === 'high' && decision.status === 'pending' && (
                          <Badge variant="destructive" className="text-xs">
                            Priorité haute
                          </Badge>
                        )}
                      </div>

                      <p className="text-sm font-medium text-slate-200">{decision.subject}</p>
                      <p className="text-xs text-slate-500 mt-1">{decision.description}</p>

                      <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {decision.author}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {decision.date}
                        </div>
                        {decision.relatedItem && (
                          <div className="flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            {decision.relatedItem}
                          </div>
                        )}
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openModal('decision-detail', { decision })}
                      className="text-slate-400 hover:text-slate-200 flex-shrink-0"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Empty state */}
      {filteredDecisions.length === 0 && (
        <div className="text-center py-12 rounded-xl border border-slate-700/50 bg-slate-800/30">
          <Scale className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">Aucune décision dans cette catégorie</p>
        </div>
      )}
    </div>
  );
}

