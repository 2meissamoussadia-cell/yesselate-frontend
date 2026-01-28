'use client';

import React, { useState } from 'react';
import { FluentModal } from '@/components/ui/fluent-modal';
import { Badge } from '@/components/ui/badge';
import {
  Brain,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Calendar,
  Users,
  DollarSign,
  Target,
  Sparkles,
  Info,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Prediction {
  id: string;
  type: 'peak_period' | 'budget_alert' | 'staff_shortage' | 'trend_change';
  title: string;
  description: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high' | 'critical';
  date: string;
  recommendations: string[];
  metrics: {
    label: string;
    current: number;
    predicted: number;
    unit: string;
    change: number;
  }[];
}

interface RHPredictiveAnalyticsProps {
  open: boolean;
  onClose: () => void;
}

export function RHPredictiveAnalytics({ open, onClose }: RHPredictiveAnalyticsProps) {
  const [selectedPrediction, setSelectedPrediction] = useState<Prediction | null>(null);

  const predictions: Prediction[] = [
    {
      id: 'pred-1',
      type: 'peak_period',
      title: 'Pic de demandes prévu - Été 2026',
      description: 'Une augmentation de 45% des demandes de congés est prévue pour la période juin-août 2026',
      confidence: 92.5,
      impact: 'high',
      date: '2026-06-01',
      recommendations: [
        'Anticiper les validations dès mai',
        'Prévoir des remplacement temporaires',
        'Communiquer les dates limites de dépôt',
        'Augmenter la capacité de traitement',
      ],
      metrics: [
        { label: 'Demandes/mois', current: 45, predicted: 65, unit: 'demandes', change: 44.4 },
        { label: 'Taux occupation', current: 75, predicted: 92, unit: '%', change: 22.7 },
        { label: 'Délai moyen', current: 2.5, predicted: 4.2, unit: 'jours', change: 68 },
      ],
    },
    {
      id: 'pred-2',
      type: 'budget_alert',
      title: 'Risque dépassement budget déplacements',
      description: 'Le budget déplacements pourrait être dépassé de 18% d\'ici fin mars 2026 si la tendance actuelle se maintient',
      confidence: 87.3,
      impact: 'critical',
      date: '2026-03-31',
      recommendations: [
        'Réviser les priorités de déplacement',
        'Privilégier les visioconférences',
        'Négocier des tarifs préférentiels',
        'Demander un budget supplémentaire',
      ],
      metrics: [
        { label: 'Budget utilisé', current: 68, predicted: 118, unit: '%', change: 73.5 },
        { label: 'Coût moyen/déplacement', current: 12500, predicted: 15200, unit: 'DZD', change: 21.6 },
        { label: 'Déplacements/mois', current: 18, predicted: 23, unit: 'missions', change: 27.8 },
      ],
    },
    {
      id: 'pred-3',
      type: 'staff_shortage',
      title: 'Pénurie de personnel - Bureau Alger',
      description: 'Un manque de 3 à 5 agents est prévu au bureau d\'Alger en août 2026 dû aux congés simultanés',
      confidence: 89.1,
      impact: 'high',
      date: '2026-08-15',
      recommendations: [
        'Étaler les congés sur la période',
        'Recruter du personnel temporaire',
        'Mettre en place un système de rotation',
        'Prioriser les demandes critiques',
      ],
      metrics: [
        { label: 'Effectif présent', current: 15, predicted: 10, unit: 'agents', change: -33.3 },
        { label: 'Charge de travail', current: 100, predicted: 150, unit: '%', change: 50 },
        { label: 'Risque retard', current: 15, predicted: 65, unit: '%', change: 333 },
      ],
    },
    {
      id: 'pred-4',
      type: 'trend_change',
      title: 'Augmentation dépenses remboursables',
      description: 'Les demandes de remboursement de dépenses augmentent de 12% par mois depuis 3 mois',
      confidence: 94.2,
      impact: 'medium',
      date: '2026-02-28',
      recommendations: [
        'Analyser les causes de l\'augmentation',
        'Réviser les barèmes de remboursement',
        'Former les agents sur les bonnes pratiques',
        'Automatiser les validations récurrentes',
      ],
      metrics: [
        { label: 'Dépenses totales', current: 450000, predicted: 567000, unit: 'DZD', change: 26 },
        { label: 'Demandes/mois', current: 32, predicted: 40, unit: 'demandes', change: 25 },
        { label: 'Montant moyen', current: 14063, predicted: 14175, unit: 'DZD', change: 0.8 },
      ],
    },
    {
      id: 'pred-5',
      type: 'peak_period',
      title: 'Ralentissement période Ramadan',
      description: 'Une baisse de 30% de l\'activité est prévue pendant le mois de Ramadan 2026',
      confidence: 96.8,
      impact: 'medium',
      date: '2026-03-01',
      recommendations: [
        'Anticiper les validations avant Ramadan',
        'Adapter les horaires de traitement',
        'Préparer les équipes à la charge réduite',
        'Profiter pour former et optimiser',
      ],
      metrics: [
        { label: 'Demandes/jour', current: 8, predicted: 5, unit: 'demandes', change: -37.5 },
        { label: 'Délai traitement', current: 2.5, predicted: 1.8, unit: 'jours', change: -28 },
        { label: 'Taux validation', current: 85, predicted: 92, unit: '%', change: 8.2 },
      ],
    },
  ];

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'critical':
        return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'high':
        return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 'medium':
        return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'low':
        return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      default:
        return 'text-slate-500 bg-slate-500/10 border-slate-500/20';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'peak_period':
        return <Calendar className="w-5 h-5" />;
      case 'budget_alert':
        return <DollarSign className="w-5 h-5" />;
      case 'staff_shortage':
        return <Users className="w-5 h-5" />;
      case 'trend_change':
        return <TrendingUp className="w-5 h-5" />;
      default:
        return <Brain className="w-5 h-5" />;
    }
  };

  const averageConfidence =
    predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length;

  return (
    <FluentModal
      open={open}
      onClose={onClose}
      title="Analyses prédictives IA"
      maxWidth="5xl"
    >
      <div className="space-y-6">
        {/* En-tête avec statistiques */}
        <div className="rounded-xl border border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-500/5 to-purple-500/10 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-purple-500/10">
              <Sparkles className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Intelligence artificielle prédictive</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Analyse des tendances et prévisions basées sur l'historique
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600">{predictions.length}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Prédictions actives</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600">{averageConfidence.toFixed(1)}%</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Confiance moyenne</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600">
                {predictions.filter((p) => p.impact === 'critical' || p.impact === 'high').length}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Alertes importantes</p>
            </div>
          </div>
        </div>

        {/* Liste des prédictions */}
        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
          {predictions.map((prediction) => (
            <div
              key={prediction.id}
              className="rounded-xl border border-slate-200 dark:border-slate-700 p-5 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedPrediction(prediction)}
            >
              <div className="flex items-start gap-4">
                <div className={cn('p-3 rounded-xl', getImpactColor(prediction.impact))}>
                  {getTypeIcon(prediction.type)}
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold mb-1">{prediction.title}</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {prediction.description}
                      </p>
                    </div>
                    <Badge
                      variant={
                        prediction.impact === 'critical'
                          ? 'urgent'
                          : prediction.impact === 'high'
                          ? 'warning'
                          : 'info'
                      }
                    >
                      {prediction.impact}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-slate-500 mb-3">
                    <div className="flex items-center gap-1">
                      <Target className="w-4 h-4" />
                      Confiance: {prediction.confidence}%
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(prediction.date).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                      })}
                    </div>
                  </div>

                  {/* Métriques clés */}
                  <div className="grid grid-cols-3 gap-3">
                    {prediction.metrics.slice(0, 3).map((metric, idx) => (
                      <div
                        key={idx}
                        className="rounded-lg border border-slate-200 dark:border-slate-700 p-3 bg-slate-50/50 dark:bg-slate-800/50"
                      >
                        <p className="text-xs text-slate-500 mb-1">{metric.label}</p>
                        <div className="flex items-baseline gap-2">
                          <span className="text-lg font-bold">
                            {metric.predicted.toLocaleString('fr-FR')}
                          </span>
                          <span className="text-xs text-slate-400">{metric.unit}</span>
                        </div>
                        <div
                          className={cn(
                            'flex items-center gap-1 text-xs font-medium mt-1',
                            metric.change > 0 ? 'text-orange-500' : 'text-green-500'
                          )}
                        >
                          {metric.change > 0 ? (
                            <ArrowUpRight className="w-3 h-3" />
                          ) : (
                            <ArrowDownRight className="w-3 h-3" />
                          )}
                          {Math.abs(metric.change).toFixed(1)}%
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Recommandations rapides */}
                  <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2 flex items-center gap-1">
                      <Info className="w-3 h-3" />
                      Recommandations principales:
                    </p>
                    <ul className="space-y-1">
                      {prediction.recommendations.slice(0, 2).map((rec, idx) => (
                        <li key={idx} className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2">
                          <span className="text-purple-500 mt-0.5">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Légende */}
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-4 bg-slate-50/50 dark:bg-slate-800/50">
          <p className="text-xs text-slate-500 mb-2 font-medium">💡 À propos des prédictions</p>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Les prédictions sont générées par analyse de l'historique des 24 derniers mois, des tendances
            saisonnières, et des facteurs externes. Le taux de confiance indique la fiabilité de la prédiction
            basée sur la qualité des données disponibles.
          </p>
        </div>
      </div>
    </FluentModal>
  );
}


