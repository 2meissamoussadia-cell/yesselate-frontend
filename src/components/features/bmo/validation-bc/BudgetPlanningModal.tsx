'use client';

import { useState, useMemo } from 'react';
import { cn } from '@/lib/cn';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  X, DollarSign, TrendingUp, TrendingDown, AlertTriangle,
  BarChart3, PieChart, Calendar, ArrowRight, Info
} from 'lucide-react';
import type { EnrichedBC } from '@/lib/types/document-validation.types';

interface BudgetPlanningModalProps {
  isOpen: boolean;
  onClose: () => void;
  bc: EnrichedBC;
  allBCs?: EnrichedBC[]; // Pour calculer l'impact total
  onValidate?: () => void;
}

export function BudgetPlanningModal({
  isOpen,
  onClose,
  bc,
  allBCs = [],
  onValidate,
}: BudgetPlanningModalProps) {
  const { darkMode } = useAppStore();
  const { addToast } = useBMOStore();
  const [viewMode, setViewMode] = useState<'impact' | 'timeline' | 'scenarios'>('impact');

  // Calculer l'impact budgétaire
  const budgetImpact = useMemo(() => {
    if (!bc.projetDetails) {
      return null;
    }

    const { budgetTotal, budgetUtilise, budgetRestant } = bc.projetDetails;
    const bcAmount = bc.montantTTC || bc.montantHT || 0;

    // BCs en attente pour le même projet
    const pendingBCsForProject = allBCs.filter(b => 
      b.projet === bc.projet && 
      b.id !== bc.id &&
      (b.status === 'pending' || b.status === 'pending_bmo' || b.status === 'audit_required')
    );

    const totalPendingAmount = pendingBCsForProject.reduce((sum, b) => {
      return sum + (b.montantTTC || b.montantHT || 0);
    }, 0);

    // Impact si ce BC est validé
    const impactIfValidated = (budgetRestant ?? 0) - bcAmount;
    const total = budgetTotal ?? 0;
    const utilise = budgetUtilise ?? 0;
    const restant = budgetRestant ?? 0;
    const impactPercentIfValidated = total > 0 ? ((utilise + bcAmount) / total) * 100 : 0;

    // Impact si TOUS les BCs en attente sont validés
    const impactIfAllPending = restant - bcAmount - totalPendingAmount;
    const impactPercentIfAllPending = total > 0 
      ? ((utilise + bcAmount + totalPendingAmount) / total) * 100 
      : 0;

    // Seuils d'alerte
    const isOverBudget = bcAmount > restant;
    const isCloseToLimit = restant > 0 ? (bcAmount / restant) * 100 > 80 : false;
    const wouldExceedIfAll = (bcAmount + totalPendingAmount) > restant;

    return {
      budgetTotal: total,
      budgetUtilise: utilise,
      budgetRestant: restant,
      bcAmount,
      impactIfValidated,
      impactPercentIfValidated,
      pendingBCsCount: pendingBCsForProject.length,
      totalPendingAmount,
      impactIfAllPending,
      impactPercentIfAllPending,
      isOverBudget,
      isCloseToLimit,
      wouldExceedIfAll,
    };
  }, [bc, allBCs]);

  // Scénarios de validation
  const scenarios = useMemo(() => {
    if (!budgetImpact) return [];

    return [
      {
        id: 'current',
        label: 'Situation actuelle',
        description: 'Avant validation de ce BC',
        budgetUsed: budgetImpact.budgetUtilise,
        budgetRemaining: budgetImpact.budgetRestant,
        percentUsed: budgetImpact.budgetTotal > 0 
          ? (budgetImpact.budgetUtilise / budgetImpact.budgetTotal) * 100 
          : 0,
        color: 'blue',
      },
      {
        id: 'this_bc',
        label: 'Si ce BC est validé',
        description: `Impact de ${budgetImpact.bcAmount.toLocaleString('fr-FR')} FCFA`,
        budgetUsed: budgetImpact.budgetUtilise + budgetImpact.bcAmount,
        budgetRemaining: budgetImpact.impactIfValidated,
        percentUsed: budgetImpact.impactPercentIfValidated,
        color: budgetImpact.isOverBudget ? 'red' : budgetImpact.isCloseToLimit ? 'orange' : 'green',
      },
      {
        id: 'all_pending',
        label: 'Si tous les BCs en attente sont validés',
        description: `${budgetImpact.pendingBCsCount} BC(s) en attente + ce BC`,
        budgetUsed: budgetImpact.budgetUtilise + budgetImpact.bcAmount + budgetImpact.totalPendingAmount,
        budgetRemaining: budgetImpact.impactIfAllPending,
        percentUsed: budgetImpact.impactPercentIfAllPending,
        color: budgetImpact.wouldExceedIfAll ? 'red' : 'orange',
      },
    ];
  }, [budgetImpact]);

  if (!isOpen || !budgetImpact) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={onClose} />
      <div className={cn(
        'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2',
        'w-full max-w-5xl max-h-[90vh] z-50',
        'rounded-xl shadow-2xl overflow-hidden',
        darkMode ? 'bg-slate-900 border border-slate-700' : 'bg-white border border-gray-200'
      )}>
        {/* Header */}
        <div className={cn(
          'p-6 border-b',
          budgetImpact.isOverBudget 
            ? darkMode ? 'bg-gradient-to-r from-red-500/20 to-orange-500/20 border-slate-700' : 'bg-gradient-to-r from-red-50 to-orange-50 border-gray-200'
            : darkMode ? 'bg-gradient-to-r from-emerald-500/20 to-green-500/20 border-slate-700' : 'bg-gradient-to-r from-emerald-50 to-green-50 border-gray-200'
        )}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className={cn(
                  'p-2 rounded-lg',
                  budgetImpact.isOverBudget 
                    ? darkMode ? 'bg-red-500/20' : 'bg-red-100'
                    : darkMode ? 'bg-emerald-500/20' : 'bg-emerald-100'
                )}>
                  <DollarSign className={cn(
                    'w-6 h-6',
                    budgetImpact.isOverBudget 
                      ? darkMode ? 'text-red-400' : 'text-red-600'
                      : darkMode ? 'text-emerald-400' : 'text-emerald-600'
                  )} />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Planification Budgétaire</h2>
                  <p className="text-sm text-slate-400 mt-1">
                    Projet: {bc.projet} • BC: {bc.id}
                  </p>
                </div>
              </div>
              {budgetImpact.isOverBudget && (
                <div className={cn(
                  'p-3 rounded-lg mt-3 flex items-center gap-2',
                  darkMode ? 'bg-red-500/20 border border-red-500/30' : 'bg-red-50 border border-red-200'
                )}>
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  <span className="text-sm font-semibold text-red-400">
                    ⚠️ Dépassement budgétaire: {Math.abs(budgetImpact.impactIfValidated).toLocaleString('fr-FR')} FCFA
                  </span>
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className={cn(
                'p-2 rounded-lg transition-colors',
                darkMode ? 'hover:bg-slate-800' : 'hover:bg-gray-100'
              )}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <div className="flex gap-2 mt-4">
            {(['impact', 'timeline', 'scenarios'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                  viewMode === mode
                    ? darkMode
                      ? 'bg-emerald-500/30 text-emerald-300'
                      : 'bg-emerald-100 text-emerald-700'
                    : darkMode
                      ? 'hover:bg-slate-800 text-slate-300'
                      : 'hover:bg-gray-100 text-gray-700'
                )}
              >
                {mode === 'impact' && 'Impact'}
                {mode === 'timeline' && 'Timeline'}
                {mode === 'scenarios' && 'Scénarios'}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-250px)] p-6 space-y-4">
          {viewMode === 'impact' && (
            <>
              {/* Vue d'ensemble */}
              <div className="grid grid-cols-3 gap-4">
                <Card className={cn(darkMode ? 'bg-slate-800/50' : 'bg-gray-50')}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-blue-400" />
                      Budget total
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={cn('text-2xl font-bold', darkMode ? 'text-white' : 'text-gray-900')}>
                      {budgetImpact.budgetTotal.toLocaleString('fr-FR')} FCFA
                    </div>
                    <div className={cn('text-xs mt-1', darkMode ? 'text-slate-400' : 'text-gray-500')}>
                      100% du budget projet
                    </div>
                  </CardContent>
                </Card>

                <Card className={cn(darkMode ? 'bg-slate-800/50' : 'bg-gray-50')}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-amber-400" />
                      Budget utilisé
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={cn('text-2xl font-bold text-amber-400', darkMode ? 'text-amber-400' : 'text-amber-600')}>
                      {budgetImpact.budgetUtilise.toLocaleString('fr-FR')} FCFA
                    </div>
                    <div className={cn('text-xs mt-1', darkMode ? 'text-slate-400' : 'text-gray-500')}>
                      {((budgetImpact.budgetUtilise / budgetImpact.budgetTotal) * 100).toFixed(1)}% utilisé
                    </div>
                  </CardContent>
                </Card>

                <Card className={cn(
                  darkMode ? 'bg-slate-800/50' : 'bg-gray-50',
                  budgetImpact.budgetRestant < 0 && 'border-red-500/50 bg-red-500/5'
                )}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <TrendingDown className={cn(
                        'w-4 h-4',
                        budgetImpact.budgetRestant < 0 ? 'text-red-400' : 'text-emerald-400'
                      )} />
                      Budget restant
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={cn(
                      'text-2xl font-bold',
                      budgetImpact.budgetRestant < 0 
                        ? darkMode ? 'text-red-400' : 'text-red-600'
                        : darkMode ? 'text-emerald-400' : 'text-emerald-600'
                    )}>
                      {budgetImpact.budgetRestant.toLocaleString('fr-FR')} FCFA
                    </div>
                    <div className={cn('text-xs mt-1', darkMode ? 'text-slate-400' : 'text-gray-500')}>
                      {((budgetImpact.budgetRestant / budgetImpact.budgetTotal) * 100).toFixed(1)}% restant
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Impact du BC */}
              <Card className={cn(
                budgetImpact.isOverBudget && 'border-red-500/50 bg-red-500/5'
              )}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Info className="w-4 h-4 text-blue-400" />
                    Impact de ce BC
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className={cn('text-xs mb-2', darkMode ? 'text-slate-400' : 'text-gray-500')}>
                        Montant du BC
                      </div>
                      <div className={cn('text-lg font-bold', darkMode ? 'text-white' : 'text-gray-900')}>
                        {budgetImpact.bcAmount.toLocaleString('fr-FR')} FCFA
                      </div>
                    </div>
                    <div>
                      <div className={cn('text-xs mb-2', darkMode ? 'text-slate-400' : 'text-gray-500')}>
                        Budget restant après validation
                      </div>
                      <div className={cn(
                        'text-lg font-bold',
                        budgetImpact.isOverBudget 
                          ? darkMode ? 'text-red-400' : 'text-red-600'
                          : darkMode ? 'text-emerald-400' : 'text-emerald-600'
                      )}>
                        {budgetImpact.impactIfValidated.toLocaleString('fr-FR')} FCFA
                      </div>
                    </div>
                    <div>
                      <div className={cn('text-xs mb-2', darkMode ? 'text-slate-400' : 'text-gray-500')}>
                        % budget utilisé après validation
                      </div>
                      <div className={cn(
                        'text-lg font-bold',
                        budgetImpact.impactPercentIfValidated > 90 
                          ? darkMode ? 'text-red-400' : 'text-red-600'
                          : budgetImpact.impactPercentIfValidated > 80
                          ? darkMode ? 'text-orange-400' : 'text-orange-600'
                          : darkMode ? 'text-white' : 'text-gray-900'
                      )}>
                        {budgetImpact.impactPercentIfValidated.toFixed(1)}%
                      </div>
                    </div>
                    <div>
                      <div className={cn('text-xs mb-2', darkMode ? 'text-slate-400' : 'text-gray-500')}>
                        BCs en attente (même projet)
                      </div>
                      <div className={cn('text-lg font-bold', darkMode ? 'text-white' : 'text-gray-900')}>
                        {budgetImpact.pendingBCsCount} BC(s)
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Barre de progression */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Utilisation du budget</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Barre actuelle */}
                    <div>
                      <div className="flex justify-between text-xs mb-2">
                        <span className={cn(darkMode ? 'text-slate-400' : 'text-gray-500')}>Situation actuelle</span>
                        <span className={cn('font-semibold', darkMode ? 'text-white' : 'text-gray-900')}>
                          {((budgetImpact.budgetUtilise / budgetImpact.budgetTotal) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full h-4 bg-slate-700/30 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-500 transition-all"
                          style={{ width: `${(budgetImpact.budgetUtilise / budgetImpact.budgetTotal) * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Barre après validation */}
                    <div>
                      <div className="flex justify-between text-xs mb-2">
                        <span className={cn(darkMode ? 'text-slate-400' : 'text-gray-500')}>
                          Après validation de ce BC
                        </span>
                        <span className={cn(
                          'font-semibold',
                          budgetImpact.impactPercentIfValidated > 90 
                            ? darkMode ? 'text-red-400' : 'text-red-600'
                            : darkMode ? 'text-white' : 'text-gray-900'
                        )}>
                          {budgetImpact.impactPercentIfValidated.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full h-4 bg-slate-700/30 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            'h-full transition-all',
                            budgetImpact.isOverBudget ? 'bg-red-500' :
                            budgetImpact.impactPercentIfValidated > 90 ? 'bg-orange-500' :
                            'bg-emerald-500'
                          )}
                          style={{ width: `${Math.min(budgetImpact.impactPercentIfValidated, 100)}%` }}
                        />
                        {budgetImpact.isOverBudget && (
                          <div className="w-full h-full bg-red-500/50" />
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {viewMode === 'scenarios' && (
            <div className="space-y-4">
              {scenarios.map((scenario) => (
                <Card
                  key={scenario.id}
                  className={cn(
                    scenario.color === 'red' && 'border-red-500/50 bg-red-500/5',
                    scenario.color === 'orange' && 'border-orange-500/50 bg-orange-500/5',
                    scenario.color === 'green' && 'border-emerald-500/50 bg-emerald-500/5'
                  )}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">{scenario.label}</CardTitle>
                        <p className={cn('text-xs mt-1', darkMode ? 'text-slate-400' : 'text-gray-500')}>
                          {scenario.description}
                        </p>
                      </div>
                      <Badge
                        variant={
                          scenario.percentUsed > 90 ? 'urgent' :
                          scenario.percentUsed > 80 ? 'warning' :
                          'success'
                        }
                        className="text-xs"
                      >
                        {scenario.percentUsed.toFixed(1)}% utilisé
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className={cn('text-xs mb-1', darkMode ? 'text-slate-400' : 'text-gray-500')}>
                          Budget utilisé
                        </div>
                        <div className={cn('font-bold', darkMode ? 'text-white' : 'text-gray-900')}>
                          {scenario.budgetUsed.toLocaleString('fr-FR')} FCFA
                        </div>
                      </div>
                      <div>
                        <div className={cn('text-xs mb-1', darkMode ? 'text-slate-400' : 'text-gray-500')}>
                          Budget restant
                        </div>
                        <div className={cn(
                          'font-bold',
                          scenario.budgetRemaining < 0 
                            ? darkMode ? 'text-red-400' : 'text-red-600'
                            : darkMode ? 'text-emerald-400' : 'text-emerald-600'
                        )}>
                          {scenario.budgetRemaining.toLocaleString('fr-FR')} FCFA
                        </div>
                      </div>
                      <div>
                        <div className={cn('text-xs mb-1', darkMode ? 'text-slate-400' : 'text-gray-500')}>
                          % utilisé
                        </div>
                        <div className={cn(
                          'font-bold',
                          scenario.percentUsed > 90 
                            ? darkMode ? 'text-red-400' : 'text-red-600'
                            : scenario.percentUsed > 80
                            ? darkMode ? 'text-orange-400' : 'text-orange-600'
                            : darkMode ? 'text-white' : 'text-gray-900'
                        )}>
                          {scenario.percentUsed.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                    {/* Barre de progression pour ce scénario */}
                    <div className="mt-4">
                      <div className="w-full h-3 bg-slate-700/30 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            'h-full transition-all',
                            scenario.percentUsed > 100 ? 'bg-red-500' :
                            scenario.percentUsed > 90 ? 'bg-orange-500' :
                            'bg-emerald-500'
                          )}
                          style={{ width: `${Math.min(scenario.percentUsed, 100)}%` }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {viewMode === 'timeline' && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-400" />
                  Timeline budgétaire
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={cn('text-sm text-center py-8', darkMode ? 'text-slate-400' : 'text-gray-500')}>
                  <BarChart3 className={cn('w-12 h-12 mx-auto mb-3', darkMode ? 'text-slate-600' : 'text-gray-400')} />
                  <p>La timeline budgétaire sera disponible prochainement.</p>
                  <p className="text-xs mt-2">
                    Visualisation de l'évolution du budget au fil du temps avec projection.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Footer */}
        <div className={cn(
          'p-4 border-t flex items-center justify-between',
          darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-gray-50 border-gray-200'
        )}>
          <div className="text-xs text-slate-400">
            {budgetImpact.pendingBCsCount} BC{budgetImpact.pendingBCsCount > 1 ? 's' : ''} en attente pour ce projet • 
            Total en attente: {budgetImpact.totalPendingAmount.toLocaleString('fr-FR')} FCFA
          </div>
          <div className="flex gap-2">
            {!budgetImpact.isOverBudget && onValidate && (
              <Button
                variant="success"
                size="sm"
                onClick={() => {
                  onValidate();
                  onClose();
                }}
              >
                Valider ce BC
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onClose}>
              Fermer
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

