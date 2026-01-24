/**
 * Page Points clés (Synthèse / Highlights)
 * VERSION OPTIMISÉE - Regroupement par thème, hiérarchie visuelle améliorée
 * Affiche les indicateurs stratégiques essentiels organisés par catégories
 */

'use client';

import React, { memo, useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Clock, Zap, BarChart3, Users, Wallet, FileCheck, Activity, Shield, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { TooltipProvider } from '@/components/ui/tooltip';
import type { LucideIcon } from 'lucide-react';
import { KPICard } from '@/components/features/bmo/dashboard/components';
import { LastUpdateDisplay } from '../LastUpdateDisplay';
import { DashboardPageShell } from '../shared/DashboardPageShell';
import { DashboardPanel } from '../shared/DashboardPanel';

// Types pour les indicateurs
interface Indicator {
  id: string;
  label: string;
  value: string;
  trend: string;
  trendDirection: 'up' | 'down' | 'neutral';
  icon: LucideIcon;
  color: 'blue' | 'orange' | 'red' | 'purple' | 'emerald' | 'cyan';
  description: string;
  isCritical?: boolean;
  period?: string;
}

interface IndicatorGroup {
  id: string;
  title: string;
  icon: LucideIcon;
  color: 'blue' | 'orange' | 'red' | 'purple' | 'emerald' | 'cyan';
  indicators: Indicator[];
}

export const SummaryPointsPage = memo(function SummaryPointsPage() {
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    const readLast = () => {
      if (typeof window === 'undefined') return;
      const ts = (window as any).__lastDashboardRefresh;
      if (typeof ts === 'number' && Number.isFinite(ts) && ts > 0) {
        setLastUpdate(new Date(ts));
      }
    };
    readLast();
    window.addEventListener('focus', readLast);
    document.addEventListener('visibilitychange', readLast);
    return () => {
      window.removeEventListener('focus', readLast);
      document.removeEventListener('visibilitychange', readLast);
    };
  }, []);

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
    // down = bon pour temps/risques/blocages/budget consommé ; up = bon pour validations/conformité
    const goodWhenDown = new Set(['temps', 'risques', 'blocages', 'budget-consomme']);
    const goodWhenUp = new Set(['validation', 'conformite', 'conformite-budget']);

    const sentimentFor = (id: string, dir: Indicator['trendDirection']) => {
      if (dir === 'neutral') return 'neutral' as const;
      if (goodWhenDown.has(id)) return dir === 'down' ? 'positive' : 'negative';
      if (goodWhenUp.has(id)) return dir === 'up' ? 'positive' : 'negative';
      return 'neutral' as const;
    };

    const color =
      indicator.color === 'orange'
        ? ('amber' as const)
        : indicator.color === 'red'
          ? ('rose' as const)
          : (indicator.color as any);

    return (
      <div key={indicator.id} className="min-w-0">
        <KPICard
          kpi={{
            id: indicator.id,
            label: indicator.label,
            value: indicator.value,
            delta: indicator.trend,
            trendType: indicator.trendDirection,
            icon: indicator.icon as any,
            color,
            description: indicator.period
              ? `${indicator.description} • ${indicator.period}`
              : indicator.description,
          }}
          size="md"
          className={cn(indicator.isCritical && 'ring-1 ring-rose-500/20')}
        />
        {indicator.isCritical ? (
          <div className="mt-2">
            <Badge className="bg-red-600/90 text-white text-xs">Critique</Badge>
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <TooltipProvider delayDuration={200}>
      <DashboardPageShell
        title="Points Clés"
        subtitle="Indicateurs stratégiques essentiels organisés par thème"
      >
        {/* Groupes d'indicateurs */}
        {indicatorGroups.map((group) => {
          const GroupIcon = group.icon;
          return (
            <DashboardPanel key={group.id} className="p-4 sm:p-6">
              <section className="space-y-3 sm:space-y-4 min-w-0">
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
                  <h2 className="text-lg sm:text-xl font-semibold text-white break-words min-w-0">{group.title}</h2>
                </div>

                {/* Grille d'indicateurs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 min-w-0">
                  {group.indicators.map(renderIndicatorCard)}
                </div>
              </section>
            </DashboardPanel>
          );
        })}

        <DashboardPanel className="p-4 sm:p-6">
          {/* Section informations supplémentaires */}
          <div className="min-w-0 overflow-hidden">
            <h2 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 break-words">
              Contexte et Métadonnées
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm text-slate-300 min-w-0">
              <div>
                <p className="text-slate-400 mb-2">Dernière mise à jour</p>
                <p className="font-medium">
                  {lastUpdate ? <LastUpdateDisplay lastUpdate={lastUpdate} /> : <span className="text-slate-500">—</span>}
                </p>
              </div>
              <div>
                <p className="text-slate-300 mb-2">Période d'analyse</p>
                <p className="font-medium">Mois en cours</p>
              </div>
            </div>
          </div>
        </DashboardPanel>
      </DashboardPageShell>
    </TooltipProvider>
  );
});

export default SummaryPointsPage;
