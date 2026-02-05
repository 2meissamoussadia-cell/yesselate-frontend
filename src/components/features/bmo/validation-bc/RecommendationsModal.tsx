'use client';

import { useState, useMemo, useEffect } from 'react';
import { cn } from '@/lib/cn';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  X, Lightbulb, TrendingUp, AlertTriangle, CheckCircle, 
  FileText, Clock, DollarSign, Building2, Users, ArrowRight,
  Sparkles, BarChart3, History
} from 'lucide-react';
import type { EnrichedBC } from '@/lib/types/document-validation.types';
import type { PurchaseOrder } from '@/lib/types/bmo.types';

interface RecommendationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  bc: EnrichedBC;
  allBCs?: PurchaseOrder[] | EnrichedBC[]; // Pour comparaison avec historique
  onAction?: (action: 'validate' | 'reject' | 'request_complement', reason?: string) => void;
}

interface Recommendation {
  id: string;
  type: 'similar' | 'pattern' | 'risk' | 'budget' | 'supplier' | 'timing';
  severity: 'info' | 'warning' | 'success' | 'urgent';
  title: string;
  description: string;
  confidence: number; // 0-100
  action?: {
    label: string;
    onClick: () => void;
  };
  details?: {
    label: string;
    value: string | number;
  }[];
}

export function RecommendationsModal({
  isOpen,
  onClose,
  bc,
  allBCs = [],
  onAction,
}: RecommendationsModalProps) {
  const { darkMode } = useAppStore();
  const { addToast } = useBMOStore();
  const [activeFilter, setActiveFilter] = useState<'all' | 'similar' | 'risk' | 'budget'>('all');

  // Analyser le BC et générer des recommandations
  const recommendations = useMemo(() => {
    const recs: Recommendation[] = [];

    if (!bc || !allBCs || allBCs.length === 0) {
      return recs;
    }

    const bcAmount = bc.montantTTC || bc.montantHT || 0;
    const bcSupplier = bc.fournisseur || '';
    const bcProject = bc.projet || '';

    // 1. BCs similaires validés récemment
    const similarBCs = allBCs.filter((otherBC: any) => {
      if (otherBC.id === bc.id) return false;
      const otherAmount = typeof otherBC.amount === 'string' 
        ? parseFloat(otherBC.amount.replace(/[^\d.,]/g, '').replace(',', '.')) 
        : (otherBC.montantTTC || otherBC.montantHT || 0);
      
      // Similarité : même fournisseur + montant proche (±20%)
      const sameSupplier = (otherBC.supplier || otherBC.fournisseur || '').toLowerCase() === bcSupplier.toLowerCase();
      const amountDiff = Math.abs(otherAmount - bcAmount) / Math.max(bcAmount, 1);
      
      return sameSupplier && amountDiff <= 0.2;
    });

    if (similarBCs.length > 0) {
      const validatedSimilar = similarBCs.filter((sc: any) => 
        sc.status === 'validated' || sc.status === 'approved_bmo' || (sc.decisionBMO && sc.decisionBMO.decision === 'approve')
      );

      if (validatedSimilar.length > 0) {
        recs.push({
          id: 'similar-validated',
          type: 'similar',
          severity: 'success',
          title: `${validatedSimilar.length} BC${validatedSimilar.length > 1 ? 's' : ''} similaire(s) validé(s) récemment`,
          description: `Des BCs avec le même fournisseur et un montant proche ont été validés. Recommandation: Approbation (pattern historique positif).`,
          confidence: 85,
          action: onAction ? {
            label: 'Valider ce BC',
            onClick: () => {
              onAction('validate', 'BC similaire à des BCs validés précédemment');
              onClose();
            },
          } : undefined,
          details: [
            { label: 'BCs similaires validés', value: validatedSimilar.length },
            { label: 'Fournisseur', value: bcSupplier },
            { label: 'Montant', value: `${bcAmount.toLocaleString('fr-FR')} FCFA` },
          ],
        });
      }
    }

    // 2. Fournisseur : historique de commandes
    const supplierBCs = allBCs.filter((otherBC: any) => 
      (otherBC.supplier || otherBC.fournisseur || '').toLowerCase() === bcSupplier.toLowerCase()
    );

    if (supplierBCs.length > 3) {
      const validatedCount = supplierBCs.filter((sc: any) => 
        sc.status === 'validated' || sc.status === 'approved_bmo'
      ).length;
      const rejectionCount = supplierBCs.filter((sc: any) => 
        sc.status === 'rejected' || sc.status === 'rejected_bmo'
      ).length;
      const validationRate = validatedCount / supplierBCs.length;

      if (validationRate >= 0.8) {
        recs.push({
          id: 'supplier-reliable',
          type: 'supplier',
          severity: 'success',
          title: 'Fournisseur fiable',
          description: `Ce fournisseur a un taux de validation de ${(validationRate * 100).toFixed(0)}% (${validatedCount}/${supplierBCs.length} BCs validés). Historique positif.`,
          confidence: 75,
          details: [
            { label: 'BCs avec ce fournisseur', value: supplierBCs.length },
            { label: 'Taux de validation', value: `${(validationRate * 100).toFixed(0)}%` },
            { label: 'BCs rejetés', value: rejectionCount },
          ],
        });
      } else if (rejectionCount > validatedCount && rejectionCount >= 2) {
        recs.push({
          id: 'supplier-risk',
          type: 'supplier',
          severity: 'warning',
          title: 'Fournisseur à risque',
          description: `Ce fournisseur a ${rejectionCount} BC(s) rejeté(s) contre ${validatedCount} validé(s). Vérifier attentivement avant validation.`,
          confidence: 70,
          details: [
            { label: 'BCs rejetés', value: rejectionCount },
            { label: 'BCs validés', value: validatedCount },
            { label: 'Taux de rejet', value: `${((rejectionCount / supplierBCs.length) * 100).toFixed(0)}%` },
          ],
        });
      }
    }

    // 3. Impact budgétaire du projet
    if (bc.projetDetails) {
      const { budgetTotal, budgetUtilise, budgetRestant } = bc.projetDetails;
      const total = budgetTotal ?? 0;
      const utilise = budgetUtilise ?? 0;
      const restant = budgetRestant ?? 0;
      const budgetUsedPercent = total > 0 ? (utilise / total) * 100 : 0;
      const impactPercent = restant > 0 ? (bcAmount / restant) * 100 : 0;

      if (budgetUsedPercent > 80) {
        recs.push({
          id: 'budget-high',
          type: 'budget',
          severity: 'warning',
          title: 'Budget projet élevé',
          description: `Le projet a utilisé ${budgetUsedPercent.toFixed(0)}% de son budget. Ce BC représenterait ${impactPercent.toFixed(1)}% du budget restant.`,
          confidence: 80,
          details: [
            { label: 'Budget utilisé', value: `${budgetUsedPercent.toFixed(0)}%` },
            { label: 'Budget restant', value: `${restant.toLocaleString('fr-FR')} FCFA` },
            { label: 'Impact du BC', value: `${impactPercent.toFixed(1)}%` },
          ],
        });
      }

      if (bcAmount > restant) {
        recs.push({
          id: 'budget-exceed',
          type: 'budget',
          severity: 'urgent',
          title: '⚠️ Dépassement budgétaire',
          description: `Le montant de ce BC (${bcAmount.toLocaleString('fr-FR')} FCFA) dépasse le budget restant (${restant.toLocaleString('fr-FR')} FCFA). Validation impossible sans ajustement.`,
          confidence: 100,
          details: [
            { label: 'Budget restant', value: `${restant.toLocaleString('fr-FR')} FCFA` },
            { label: 'Montant BC', value: `${bcAmount.toLocaleString('fr-FR')} FCFA` },
            { label: 'Dépassement', value: `${(bcAmount - restant).toLocaleString('fr-FR')} FCFA` },
          ],
        });
      }
    }

    // 4. Pattern temporel : BCs créés à la même période
    const recentBCs = allBCs.filter((otherBC: any) => {
      if (otherBC.id === bc.id) return false;
      const bcDate = new Date(bc.dateEmission || bc.createdAt || Date.now());
      const otherDate = new Date(otherBC.date || otherBC.createdAt || Date.now());
      const daysDiff = Math.abs((bcDate.getTime() - otherDate.getTime()) / (1000 * 60 * 60 * 24));
      return daysDiff <= 7; // BCs créés dans les 7 derniers jours
    });

    if (recentBCs.length >= 3) {
      recs.push({
        id: 'timing-cluster',
        type: 'timing',
        severity: 'info',
        title: 'Concentration de BCs récents',
        description: `${recentBCs.length} BC(s) créé(s) dans la même période. Vérifier s'il s'agit d'un besoin légitime ou d'une fragmentation de commande.`,
        confidence: 60,
        details: [
          { label: 'BCs récents (7j)', value: recentBCs.length },
          { label: 'Période', value: 'Dernière semaine' },
        ],
      });
    }

    // 5. Montant élevé : nécessite attention particulière
    if (bcAmount > 10_000_000) {
      recs.push({
        id: 'amount-high',
        type: 'risk',
        severity: 'warning',
        title: 'Montant élevé',
        description: `BC de plus de 10M FCFA. Nécessite validation rigoureuse et possible escalade vers DG si > 20M.`,
        confidence: 90,
        details: [
          { label: 'Montant', value: `${bcAmount.toLocaleString('fr-FR')} FCFA` },
          { label: 'Seuil DG', value: '20 000 000 FCFA' },
        ],
      });
    }

    // 6. Anomalies détectées
    if (bc.anomalies && bc.anomalies.length > 0) {
      const criticalAnomalies = bc.anomalies.filter(a => a.severity === 'critical' || a.severity === 'error');
      if (criticalAnomalies.length > 0) {
        recs.push({
          id: 'anomalies-critical',
          type: 'risk',
          severity: 'urgent',
          title: `${criticalAnomalies.length} anomalie(s) critique(s)`,
          description: `Des anomalies bloquantes ont été détectées. Corriger avant validation.`,
          confidence: 100,
          details: [
            { label: 'Anomalies critiques', value: criticalAnomalies.length },
            { label: 'Total anomalies', value: bc.anomalies.length },
          ],
        });
      }
    }

    return recs.sort((a, b) => {
      // Trier par sévérité puis confiance
      const severityOrder = { urgent: 0, warning: 1, success: 2, info: 3 };
      const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
      if (severityDiff !== 0) return severityDiff;
      return b.confidence - a.confidence;
    });
  }, [bc, allBCs, onAction]);

  const filteredRecommendations = useMemo(() => {
    if (activeFilter === 'all') return recommendations;
    return recommendations.filter(r => {
      if (activeFilter === 'similar') return r.type === 'similar';
      if (activeFilter === 'risk') return r.type === 'risk' || r.severity === 'urgent' || r.severity === 'warning';
      if (activeFilter === 'budget') return r.type === 'budget';
      return true;
    });
  }, [recommendations, activeFilter]);

  if (!isOpen) return null;

  const stats = {
    total: recommendations.length,
    urgent: recommendations.filter(r => r.severity === 'urgent').length,
    warnings: recommendations.filter(r => r.severity === 'warning').length,
    success: recommendations.filter(r => r.severity === 'success').length,
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={onClose} />
      <div className={cn(
        'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2',
        'w-full max-w-4xl max-h-[90vh] z-50',
        'rounded-xl shadow-2xl overflow-hidden',
        darkMode ? 'bg-slate-900 border border-slate-700' : 'bg-white border border-gray-200'
      )}>
        {/* Header */}
        <div className={cn(
          'p-6 border-b',
          darkMode ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 border-slate-700' : 'bg-gradient-to-r from-purple-50 to-blue-50 border-gray-200'
        )}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className={cn(
                  'p-2 rounded-lg',
                  darkMode ? 'bg-purple-500/20' : 'bg-purple-100'
                )}>
                  <Sparkles className={cn('w-6 h-6', darkMode ? 'text-purple-400' : 'text-purple-600')} />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Recommandations Intelligentes</h2>
                  <p className="text-sm text-slate-400 mt-1">BC {bc.id}</p>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <Badge variant={stats.urgent > 0 ? 'urgent' : 'info'} className="text-xs">
                  {stats.urgent} Urgent{stats.urgent > 1 ? 's' : ''}
                </Badge>
                <Badge variant={stats.warnings > 0 ? 'warning' : 'default'} className="text-xs">
                  {stats.warnings} Avertissement{stats.warnings > 1 ? 's' : ''}
                </Badge>
                <Badge variant={stats.success > 0 ? 'success' : 'default'} className="text-xs">
                  {stats.success} Positif{stats.success > 1 ? 's' : ''}
                </Badge>
              </div>
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

          {/* Filtres */}
          <div className="flex gap-2 mt-4">
            {(['all', 'similar', 'risk', 'budget'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                  activeFilter === filter
                    ? darkMode
                      ? 'bg-purple-500/30 text-purple-300'
                      : 'bg-purple-100 text-purple-700'
                    : darkMode
                      ? 'hover:bg-slate-800 text-slate-300'
                      : 'hover:bg-gray-100 text-gray-700'
                )}
              >
                {filter === 'all' && 'Toutes'}
                {filter === 'similar' && 'Similaires'}
                {filter === 'risk' && 'Risques'}
                {filter === 'budget' && 'Budget'}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-200px)] p-6">
          {filteredRecommendations.length === 0 ? (
            <div className={cn(
              'text-center py-12',
              darkMode ? 'text-slate-400' : 'text-gray-500'
            )}>
              <Lightbulb className={cn('w-12 h-12 mx-auto mb-3', darkMode ? 'text-slate-600' : 'text-gray-400')} />
              <p className="text-sm">Aucune recommandation disponible pour ce BC.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRecommendations.map((rec) => (
                <Card
                  key={rec.id}
                  className={cn(
                    'transition-all hover:shadow-lg',
                    rec.severity === 'urgent' && 'border-red-500/50 bg-red-500/5',
                    rec.severity === 'warning' && 'border-orange-500/50 bg-orange-500/5',
                    rec.severity === 'success' && 'border-emerald-500/50 bg-emerald-500/5',
                    rec.severity === 'info' && darkMode ? 'border-blue-500/50 bg-blue-500/5' : 'border-blue-200 bg-blue-50/50'
                  )}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {rec.severity === 'urgent' && <AlertTriangle className="w-5 h-5 text-red-400" />}
                          {rec.severity === 'warning' && <AlertTriangle className="w-5 h-5 text-orange-400" />}
                          {rec.severity === 'success' && <CheckCircle className="w-5 h-5 text-emerald-400" />}
                          {rec.severity === 'info' && <Lightbulb className="w-5 h-5 text-blue-400" />}
                          <CardTitle className="text-base">{rec.title}</CardTitle>
                        </div>
                        <p className={cn('text-sm mt-2', darkMode ? 'text-slate-300' : 'text-gray-700')}>
                          {rec.description}
                        </p>
                      </div>
                      <Badge
                        variant={
                          rec.confidence >= 80 ? 'success' :
                          rec.confidence >= 60 ? 'warning' :
                          'default'
                        }
                        className="text-xs ml-2"
                      >
                        {rec.confidence}% confiance
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {rec.details && rec.details.length > 0 && (
                      <div className={cn(
                        'grid grid-cols-3 gap-3 mb-3 p-3 rounded-lg',
                        darkMode ? 'bg-slate-800/50' : 'bg-gray-50'
                      )}>
                        {rec.details.map((detail, idx) => (
                          <div key={idx}>
                            <div className={cn('text-xs', darkMode ? 'text-slate-400' : 'text-gray-500')}>
                              {detail.label}
                            </div>
                            <div className={cn('text-sm font-semibold mt-1', darkMode ? 'text-white' : 'text-gray-900')}>
                              {typeof detail.value === 'number' 
                                ? detail.value.toLocaleString('fr-FR')
                                : detail.value
                              }
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {rec.action && (
                      <Button
                        variant={rec.severity === 'success' ? 'success' : 'default'}
                        size="sm"
                        onClick={rec.action.onClick}
                        className="w-full"
                      >
                        {rec.action.label}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={cn(
          'p-4 border-t flex items-center justify-between',
          darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-gray-50 border-gray-200'
        )}>
          <div className="text-xs text-slate-400">
            {stats.total} recommandation{stats.total > 1 ? 's' : ''} basée{stats.total > 1 ? 's' : ''} sur l'analyse de {allBCs.length} BC(s) historique{allBCs.length > 1 ? 's' : ''}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Fermer
          </Button>
        </div>
      </div>
    </>
  );
}

