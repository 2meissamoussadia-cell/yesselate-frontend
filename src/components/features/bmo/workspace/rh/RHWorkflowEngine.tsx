'use client';

import React, { useState, useEffect } from 'react';
import { FluentModal } from '@/components/ui/fluent-modal';
import { Badge } from '@/components/ui/badge';
import {
  Workflow,
  Plus,
  Trash2,
  Play,
  Pause,
  Edit,
  Copy,
  CheckCircle,
  AlertCircle,
  Clock,
  Zap,
  Settings,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface WorkflowRule {
  id: string;
  name: string;
  description: string;
  active: boolean;
  priority: number;
  trigger: {
    type: 'on_submit' | 'on_status_change' | 'on_date' | 'on_amount' | 'on_duration';
    conditions: Array<{
      field: string;
      operator: 'equals' | 'greater_than' | 'less_than' | 'contains' | 'in_range';
      value: any;
    }>;
  };
  actions: Array<{
    type: 'auto_validate' | 'auto_reject' | 'assign_to' | 'notify' | 'add_comment' | 'set_priority' | 'request_documents';
    params: Record<string, any>;
  }>;
  stats: {
    executionCount: number;
    lastExecuted?: string;
    successRate: number;
  };
}

interface RHWorkflowEngineProps {
  open: boolean;
  onClose: () => void;
}

export function RHWorkflowEngine({ open, onClose }: RHWorkflowEngineProps) {
  const [workflows, setWorkflows] = useState<WorkflowRule[]>([
    {
      id: 'wf-1',
      name: 'Validation automatique congés courts',
      description: 'Valide automatiquement les demandes de congé ≤ 3 jours si solde suffisant',
      active: true,
      priority: 1,
      trigger: {
        type: 'on_submit',
        conditions: [
          { field: 'type', operator: 'equals', value: 'Congés' },
          { field: 'duration', operator: 'less_than', value: 4 },
          { field: 'balance', operator: 'greater_than', value: 0 },
        ],
      },
      actions: [
        { type: 'auto_validate', params: { reason: 'Auto-validation (durée courte + solde suffisant)' } },
        { type: 'notify', params: { to: 'agent', message: 'Votre demande a été validée automatiquement' } },
        { type: 'add_comment', params: { text: '✅ Validation automatique par workflow' } },
      ],
      stats: {
        executionCount: 156,
        lastExecuted: '2026-01-10T10:30:00',
        successRate: 98.7,
      },
    },
    {
      id: 'wf-2',
      name: 'Escalade urgences non traitées',
      description: 'Notifie le superviseur si une demande urgente n\'est pas traitée sous 2h',
      active: true,
      priority: 2,
      trigger: {
        type: 'on_date',
        conditions: [
          { field: 'priority', operator: 'equals', value: 'urgent' },
          { field: 'status', operator: 'equals', value: 'pending' },
          { field: 'age_hours', operator: 'greater_than', value: 2 },
        ],
      },
      actions: [
        { type: 'notify', params: { to: 'supervisor', message: 'Demande urgente non traitée depuis 2h' } },
        { type: 'set_priority', params: { priority: 'critical' } },
        { type: 'add_comment', params: { text: '⚠️ Escalade automatique - non traité sous 2h' } },
      ],
      stats: {
        executionCount: 23,
        lastExecuted: '2026-01-09T16:45:00',
        successRate: 100,
      },
    },
    {
      id: 'wf-3',
      name: 'Validation multi-niveaux grosses sommes',
      description: 'Demande validation superviseur + DG pour dépenses > 10000 DZD',
      active: true,
      priority: 1,
      trigger: {
        type: 'on_submit',
        conditions: [
          { field: 'type', operator: 'equals', value: 'Dépenses' },
          { field: 'amount', operator: 'greater_than', value: 10000 },
        ],
      },
      actions: [
        { type: 'assign_to', params: { role: 'supervisor', required: true } },
        { type: 'request_documents', params: { documents: ['Facture', 'Bon de commande', 'Devis'] } },
        { type: 'notify', params: { to: 'supervisor,dg', message: 'Validation multi-niveaux requise' } },
        { type: 'add_comment', params: { text: '💰 Montant élevé - validation multi-niveaux activée' } },
      ],
      stats: {
        executionCount: 8,
        lastExecuted: '2026-01-08T14:20:00',
        successRate: 100,
      },
    },
    {
      id: 'wf-4',
      name: 'Détection conflits de planning',
      description: 'Alerte si un agent demande des congés alors qu\'il a un déplacement prévu',
      active: true,
      priority: 2,
      trigger: {
        type: 'on_submit',
        conditions: [
          { field: 'type', operator: 'equals', value: 'Congés' },
        ],
      },
      actions: [
        { type: 'notify', params: { to: 'validator', message: 'Conflit potentiel détecté - vérifier planning' } },
        { type: 'add_comment', params: { text: '⚠️ Vérification automatique des conflits effectuée' } },
      ],
      stats: {
        executionCount: 45,
        lastExecuted: '2026-01-10T09:15:00',
        successRate: 95.6,
      },
    },
    {
      id: 'wf-5',
      name: 'Rappel documents manquants',
      description: 'Envoie un rappel après 24h si les documents requis ne sont pas fournis',
      active: false,
      priority: 3,
      trigger: {
        type: 'on_date',
        conditions: [
          { field: 'documents_requested', operator: 'equals', value: true },
          { field: 'documents_uploaded', operator: 'equals', value: false },
          { field: 'age_hours', operator: 'greater_than', value: 24 },
        ],
      },
      actions: [
        { type: 'notify', params: { to: 'agent', message: 'Rappel: merci de fournir les documents demandés' } },
        { type: 'add_comment', params: { text: '📎 Rappel automatique documents manquants' } },
      ],
      stats: {
        executionCount: 12,
        lastExecuted: '2026-01-07T11:00:00',
        successRate: 91.7,
      },
    },
  ]);

  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowRule | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');

  const toggleWorkflow = (id: string) => {
    setWorkflows((prev) =>
      prev.map((wf) => (wf.id === id ? { ...wf, active: !wf.active } : wf))
    );
  };

  const duplicateWorkflow = (workflow: WorkflowRule) => {
    const newWorkflow = {
      ...workflow,
      id: `wf-${Date.now()}`,
      name: `${workflow.name} (Copie)`,
      active: false,
      stats: {
        executionCount: 0,
        successRate: 0,
      },
    };
    setWorkflows((prev) => [...prev, newWorkflow]);
  };

  const deleteWorkflow = (id: string) => {
    setWorkflows((prev) => prev.filter((wf) => wf.id !== id));
  };

  const filteredWorkflows = workflows.filter((wf) => {
    if (filterActive === 'active') return wf.active;
    if (filterActive === 'inactive') return !wf.active;
    return true;
  });

  const totalExecutions = workflows.reduce((sum, wf) => sum + wf.stats.executionCount, 0);
  const activeCount = workflows.filter((wf) => wf.active).length;

  return (
    <FluentModal
      open={open}
      onClose={onClose}
      title="Moteur de workflow automatisé"
      maxWidth="5xl"
    >
      <div className="space-y-6">
        {/* Statistiques globales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 bg-gradient-to-br from-purple-500/5 to-purple-500/10">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Workflow className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Workflows actifs</p>
                <p className="text-2xl font-bold">{activeCount}/{workflows.length}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 bg-gradient-to-br from-blue-500/5 to-blue-500/10">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Zap className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Exécutions totales</p>
                <p className="text-2xl font-bold">{totalExecutions}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 bg-gradient-to-br from-green-500/5 to-green-500/10">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Taux de succès moyen</p>
                <p className="text-2xl font-bold">
                  {(workflows.reduce((sum, wf) => sum + wf.stats.successRate, 0) / workflows.length).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtres */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilterActive('all')}
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
              filterActive === 'all'
                ? 'bg-purple-500 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'
            )}
          >
            Tous ({workflows.length})
          </button>
          <button
            onClick={() => setFilterActive('active')}
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
              filterActive === 'active'
                ? 'bg-green-500 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'
            )}
          >
            Actifs ({activeCount})
          </button>
          <button
            onClick={() => setFilterActive('inactive')}
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
              filterActive === 'inactive'
                ? 'bg-slate-500 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'
            )}
          >
            Inactifs ({workflows.length - activeCount})
          </button>
        </div>

        {/* Liste des workflows */}
        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
          {filteredWorkflows.map((workflow) => (
            <div
              key={workflow.id}
              className={cn(
                'rounded-xl border p-4 transition-all',
                workflow.active
                  ? 'border-purple-200 bg-purple-500/5 dark:border-purple-800'
                  : 'border-slate-200 bg-slate-50/50 dark:border-slate-700 dark:bg-slate-800/50'
              )}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold">{workflow.name}</h4>
                    <Badge variant={workflow.active ? 'success' : 'default'} className="text-xs">
                      {workflow.active ? (
                        <>
                          <Play className="w-3 h-3 mr-1" /> Actif
                        </>
                      ) : (
                        <>
                          <Pause className="w-3 h-3 mr-1" /> Inactif
                        </>
                      )}
                    </Badge>
                    <Badge variant="info" className="text-xs">
                      Priorité {workflow.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {workflow.description}
                  </p>
                </div>

                <div className="flex gap-1 ml-4">
                  <button
                    onClick={() => toggleWorkflow(workflow.id)}
                    className={cn(
                      'p-2 rounded-lg transition-colors',
                      workflow.active
                        ? 'hover:bg-purple-500/10 text-purple-600'
                        : 'hover:bg-slate-200 text-slate-400 dark:hover:bg-slate-700'
                    )}
                    title={workflow.active ? 'Désactiver' : 'Activer'}
                  >
                    {workflow.active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => {
                      setSelectedWorkflow(workflow);
                      setIsEditMode(true);
                    }}
                    className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 transition-colors"
                    title="Modifier"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => duplicateWorkflow(workflow)}
                    className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 transition-colors"
                    title="Dupliquer"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteWorkflow(workflow.id)}
                    className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Détails du workflow */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <Filter className="w-4 h-4" />
                  <span className="font-medium">Déclencheur:</span>
                  <span>{workflow.trigger.type.replace(/_/g, ' ')}</span>
                  <span className="text-xs">({workflow.trigger.conditions.length} conditions)</span>
                </div>

                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <ArrowRight className="w-4 h-4" />
                  <span className="font-medium">Actions:</span>
                  <span>{workflow.actions.length} action(s)</span>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-500 pt-2 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    {workflow.stats.executionCount} exécutions
                  </div>
                  {workflow.stats.lastExecuted && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Dernière: {new Date(workflow.stats.lastExecuted).toLocaleDateString('fr-FR')}
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    {workflow.stats.successRate}% succès
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredWorkflows.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <Workflow className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Aucun workflow trouvé</p>
          </div>
        )}

        <div className="flex justify-between items-center w-full pt-4 border-t border-slate-200 dark:border-slate-700">
          <div className="flex gap-2">
            <button
              onClick={() => {
                setSelectedWorkflow(null);
                setIsEditMode(true);
              }}
              className="px-4 py-2 rounded-xl bg-purple-500 text-white hover:bg-purple-600 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Nouveau workflow
            </button>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </FluentModal>
  );
}


