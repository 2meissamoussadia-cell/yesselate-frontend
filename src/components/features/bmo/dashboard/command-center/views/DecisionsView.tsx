/**
 * Vue Décisions du Dashboard
 * Timeline des décisions et suivi
 */

'use client';

import React, { useMemo } from 'react';
import { cn } from '@/lib/cn';
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
import { SectionTitle, DataCard } from '@/components/features/bmo/dashboard/components';

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
  const openModal = useDashboardCommandCenterStore((s) => s.openModal);
  const subCategory = useDashboardCommandCenterStore((s) => s.navigation.subCategory);
  const subSubCategory = useDashboardCommandCenterStore((s) => s.navigation.subSubCategory);
  const navigation = { subCategory, subSubCategory } as const;

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

  // Filtrer selon le sous-onglet (Version 4)
  const filteredDecisions = useMemo(() => {
    let decisions = [...baseDecisions];

    switch (navigation.subCategory) {
      case 'pending': // En attente
        switch (navigation.subSubCategory) {
          case 'urgentes':
            decisions = decisions.filter((d) => d.status === 'pending' && d.priority === 'high');
            break;
          case 'normales':
            decisions = decisions.filter((d) => d.status === 'pending' && d.priority !== 'high');
            break;
          case 'planifiees':
            // TODO: Implémenter logique planifiées
            decisions = decisions.filter((d) => d.status === 'pending');
            break;
          default:
            decisions = decisions.filter((d) => d.status === 'pending');
        }
        break;
      case 'executed': // Exécutées
        switch (navigation.subSubCategory) {
          case 'recentes':
            // Dernières 30 jours
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            decisions = decisions.filter((d) => {
              if (d.status !== 'executed') return false;
              const decisionDate = new Date(d.date.split('/').reverse().join('-'));
              return decisionDate >= thirtyDaysAgo;
            });
            break;
          case 'anciennes':
            const thirtyDaysAgoOld = new Date();
            thirtyDaysAgoOld.setDate(thirtyDaysAgoOld.getDate() - 30);
            decisions = decisions.filter((d) => {
              if (d.status !== 'executed') return false;
              const decisionDate = new Date(d.date.split('/').reverse().join('-'));
              return decisionDate < thirtyDaysAgoOld;
            });
            break;
          case 'par-type':
            // Grouper par type
            break;
          default:
            decisions = decisions.filter((d) => d.status === 'executed');
        }
        break;
      case 'timeline': // Timeline
        // Toutes les décisions pour timeline
        break;
      case 'audit': // Audit
        // Toutes les décisions pour audit
        break;
      case 'modeles': // Modèles (Version 4)
        // Filtrer selon le type de modèle
        switch (navigation.subSubCategory) {
          case 'substitution':
            decisions = decisions.filter((d) => d.type === 'substitution');
            break;
          case 'delegation':
            decisions = decisions.filter((d) => d.type === 'delegation');
            break;
          case 'arbitrage':
            decisions = decisions.filter((d) => d.type === 'arbitrage');
            break;
        }
        break;
    }

    return decisions;
  }, [baseDecisions, navigation.subCategory, navigation.subSubCategory]);

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
    <div className="p-6 space-y-8 max-w-[1920px] mx-auto">
      {/* Header harmonisé - Version 4 */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <SectionTitle
          icon={Scale}
          title={
            navigation.subCategory === 'modeles' ? 'Modèles de décisions' :
            navigation.subCategory === 'timeline' ? 'Timeline des décisions' :
            navigation.subCategory === 'audit' ? 'Audit des décisions' :
            'Décisions'
          }
          subtitle={
            navigation.subCategory === 'modeles' ? 'Modèles réutilisables pour substitutions, délégations et arbitrages' :
            navigation.subCategory === 'timeline' ? 'Chronologie complète des décisions' :
            navigation.subCategory === 'audit' ? 'Traces, rapports et conformité' :
            'Suivi et traçabilité des décisions de gouvernance'
          }
          size="lg"
        />

        <div className="flex items-center gap-4">
          <DataCard
            value={stats.pending}
            label="En attente"
            badgeVariant="warning"
            icon={Clock}
          />
          <DataCard
            value={stats.executed}
            label="Exécutées"
            badgeVariant="success"
            icon={CheckCircle}
          />
          {stats.highPriority > 0 && (
            <DataCard
              value={stats.highPriority}
              label="Urgentes"
              badgeVariant="critical"
              icon={AlertCircle}
            />
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
                    'relative z-10 w-9 h-9 rounded-full border flex items-center justify-center flex-shrink-0',
                    'bg-slate-950/30 border-slate-800/60'
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
                        <span className="text-xs font-mono text-slate-400">{decision.id}</span>
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
                      <p className="text-xs text-slate-400 mt-1">{decision.description}</p>

                      <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
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

