/**
 * Page Points clés (Synthèse / Highlights)
 * VERSION OPTIMISÉE - Regroupement par thème, hiérarchie visuelle améliorée
 * Affiche les indicateurs stratégiques essentiels organisés par catégories
 */

'use client';

import React from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Clock, Zap, BarChart3, Users, Wallet, FileCheck, Activity, Shield, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

// Types pour les indicateurs
interface Indicator {
  id: string;
  label: string;
  value: string;
  trend: string;
  trendDirection: 'up' | 'down' | 'neutral';
  icon: React.ComponentType<{ className?: string }>;
  color: 'blue' | 'orange' | 'red' | 'purple' | 'emerald' | 'cyan';
  description: string;
  isCritical?: boolean;
  period?: string;
}

interface IndicatorGroup {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  color: 'blue' | 'orange' | 'red' | 'purple' | 'emerald' | 'cyan';
  indicators: Indicator[];
}

export default function SummaryPointsPage() {
  // Regroupement des indicateurs par thème
  const indicatorGroups: IndicatorGroup[] = [
    {
      id: 'activite',
      title: 'Activité',
      icon: Activity,
      color: 'blue',
      indicators: [
        {
          id: 'validation',
          label: 'Validations',
          value: '8',
          trend: '+3%',
          trendDirection: 'up',
          icon: FileCheck,
          color: 'blue',
          description: 'vs semaine dernière',
          period: 'Semaine en cours',
        },
        {
          id: 'temps',
          label: 'Temps réponse moyen',
          value: '2.4h',
          trend: '-0.3h',
          trendDirection: 'down',
          icon: Clock,
          color: 'emerald',
          description: 'amélioration',
          period: 'Mois en cours',
        },
        {
          id: 'conformite',
          label: 'Conformité SLA',
          value: '94%',
          trend: '+2%',
          trendDirection: 'up',
          icon: BarChart3,
          color: 'cyan',
          description: 'objectif atteint',
          period: 'Mois en cours',
        },
      ],
    },
    {
      id: 'risques',
      title: 'Risques & Blocages',
      icon: Shield,
      color: 'red',
      indicators: [
        {
          id: 'risques',
          label: 'Risques identifiés',
          value: '8',
          trend: '-1',
          trendDirection: 'down',
          icon: AlertTriangle,
          color: 'red',
          description: 'risques critiques',
          isCritical: true,
          period: 'Dernière semaine',
        },
        {
          id: 'blocages',
          label: 'Blocages actifs',
          value: '3',
          trend: '+1',
          trendDirection: 'up',
          icon: AlertTriangle,
          color: 'orange',
          description: 'nécessitent attention',
          isCritical: true,
          period: 'En cours',
        },
      ],
    },
    {
      id: 'budget',
      title: 'Budget & Conformité',
      icon: DollarSign,
      color: 'emerald',
      indicators: [
        {
          id: 'budget-consomme',
          label: 'Budget consommé',
          value: '66%',
          trend: '+2%',
          trendDirection: 'up',
          icon: Wallet,
          color: 'emerald',
          description: 'du budget total',
          period: 'Année en cours',
        },
        {
          id: 'conformite-budget',
          label: 'Conformité budget',
          value: '85%',
          trend: '+3%',
          trendDirection: 'up',
          icon: CheckCircle,
          color: 'cyan',
          description: 'des projets',
          period: 'Mois en cours',
        },
      ],
    },
    {
      id: 'decisions',
      title: 'Décisions',
      icon: CheckCircle,
      color: 'purple',
      indicators: [
        {
          id: 'decisions',
          label: 'Décisions en attente',
          value: '5',
          trend: '—',
          trendDirection: 'neutral',
          icon: CheckCircle,
          color: 'purple',
          description: 'en cours de validation',
          period: 'En attente',
        },
        {
          id: 'actions',
          label: 'Actions prioritaires',
          value: '12',
          trend: '+2',
          trendDirection: 'up',
          icon: Zap,
          color: 'orange',
          description: 'nouvelles actions',
          period: 'Dernière semaine',
        },
      ],
    },
  ];

  const renderIndicatorCard = (indicator: Indicator) => {
    const Icon = indicator.icon;
    const isPositive = indicator.trendDirection === 'up';
    const isNegative = indicator.trendDirection === 'down';
    const isNeutral = indicator.trendDirection === 'neutral';

    return (
      <div
        key={indicator.id}
        className={cn(
          'bg-gradient-to-br rounded-xl p-6 border-2 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg',
          indicator.isCritical && 'ring-2 ring-offset-2 ring-offset-slate-900',
          indicator.color === 'blue' && 'from-blue-500/20 to-blue-600/10 border-blue-500/50',
          indicator.color === 'orange' && 'from-orange-500/20 to-orange-600/10 border-orange-500/50',
          indicator.color === 'red' && 'from-red-500/20 to-red-600/10 border-red-500/50',
          indicator.color === 'purple' && 'from-purple-500/20 to-purple-600/10 border-purple-500/50',
          indicator.color === 'emerald' && 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/50',
          indicator.color === 'cyan' && 'from-cyan-500/20 to-cyan-600/10 border-cyan-500/50',
          indicator.isCritical && indicator.color === 'red' && 'ring-red-500/50',
          indicator.isCritical && indicator.color === 'orange' && 'ring-orange-500/50'
        )}
      >
        {/* Header avec icône et badge critique si nécessaire */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-3 sm:mb-4 min-w-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div
              className={cn(
                'w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center flex-shrink-0',
                indicator.color === 'blue' && 'bg-blue-500',
                indicator.color === 'orange' && 'bg-orange-500',
                indicator.color === 'red' && 'bg-red-500',
                indicator.color === 'purple' && 'bg-purple-500',
                indicator.color === 'emerald' && 'bg-emerald-500',
                indicator.color === 'cyan' && 'bg-cyan-500'
              )}
            >
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-slate-300 font-medium">{indicator.label}</p>
              {indicator.period && (
                <p className="text-xs text-slate-400 mt-0.5">{indicator.period}</p>
              )}
            </div>
          </div>
          {indicator.isCritical && (
            <Badge className="bg-red-600 text-white text-xs">Critique</Badge>
          )}
        </div>

        {/* Valeur principale */}
        <div className="mb-3">
          <p className="text-3xl font-bold text-white">{indicator.value}</p>
        </div>

        {/* Évolution séparée */}
        <div
          className={cn(
            'flex items-center gap-2 text-sm font-medium',
            isPositive && 'text-green-400',
            isNegative && 'text-red-400',
            isNeutral && 'text-slate-300'
          )}
        >
          {!isNeutral && (
            <>
              {isPositive ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span className="font-semibold">{indicator.trend}</span>
            </>
          )}
          {isNeutral && <span>{indicator.trend}</span>}
          <span className="text-slate-500">• {indicator.description}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 sm:space-y-8 animate-fadeIn min-w-0 overflow-hidden">
      {/* En-tête */}
      <div className="min-w-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 break-words">Points Clés</h1>
        <p className="text-slate-300 text-sm sm:text-lg break-words">Indicateurs stratégiques essentiels organisés par thème</p>
      </div>

      {/* Groupes d'indicateurs */}
      {indicatorGroups.map((group) => {
        const GroupIcon = group.icon;
        return (
          <section key={group.id} className="space-y-3 sm:space-y-4 min-w-0">
            {/* Titre de section */}
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 min-w-0">
              <div
                className={cn(
                  'w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                  group.color === 'blue' && 'bg-blue-500/20 border border-blue-500/50',
                  group.color === 'orange' && 'bg-orange-500/20 border border-orange-500/50',
                  group.color === 'red' && 'bg-red-500/20 border border-red-500/50',
                  group.color === 'purple' && 'bg-purple-500/20 border border-purple-500/50',
                  group.color === 'emerald' && 'bg-emerald-500/20 border border-emerald-500/50',
                  group.color === 'cyan' && 'bg-cyan-500/20 border border-cyan-500/50'
                )}
              >
                <GroupIcon
                  className={cn(
                    'w-5 h-5',
                    group.color === 'blue' && 'text-blue-400',
                    group.color === 'orange' && 'text-orange-400',
                    group.color === 'red' && 'text-red-400',
                    group.color === 'purple' && 'text-purple-400',
                    group.color === 'emerald' && 'text-emerald-400',
                    group.color === 'cyan' && 'text-cyan-400'
                  )}
                />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white break-words min-w-0">{group.title}</h2>
            </div>

            {/* Grille d'indicateurs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 min-w-0">
              {group.indicators.map(renderIndicatorCard)}
            </div>
          </section>
        );
      })}

      {/* Section informations supplémentaires */}
      <div className="mt-6 sm:mt-8 bg-slate-900/50 border border-slate-800 rounded-xl p-4 sm:p-6 min-w-0 overflow-hidden">
        <h2 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 break-words">Contexte et Métadonnées</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm text-slate-300 min-w-0">
          <div>
            <p className="text-slate-400 mb-2">Dernière mise à jour</p>
            <p className="font-medium">{new Date().toLocaleString('fr-FR', { dateStyle: 'long', timeStyle: 'short' })}</p>
          </div>
          <div>
            <p className="text-slate-300 mb-2">Période d'analyse</p>
            <p className="font-medium">Mois en cours</p>
          </div>
        </div>
      </div>
    </div>
  );
}
