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
import { LastUpdateDisplay } from '../LastUpdateDisplay';
import { 
  DashboardPageLayout, 
  DashboardSection, 
  DashboardGrid, 
  DashboardPanel,
  KPICard,
  type KPICardData,
} from '../shared';

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

  const convertIndicatorToKPICardData = (indicator: Indicator): KPICardData => {
    // Convertir trend string en nombre
    const trendMatch = indicator.trend.match(/([+-]?\d+)/);
    const trendValue = trendMatch ? parseFloat(trendMatch[1]) : undefined;

    const color =
      indicator.color === 'orange'
        ? ('amber' as const)
        : indicator.color === 'red'
          ? ('rose' as const)
          : indicator.color === 'emerald'
            ? ('emerald' as const)
            : indicator.color === 'cyan'
              ? ('cyan' as const)
              : indicator.color === 'purple'
                ? ('purple' as const)
                : ('blue' as const);

    return {
      id: indicator.id,
      label: indicator.label,
      value: indicator.value,
      trend: trendValue,
      trendType: indicator.trendDirection,
      icon: indicator.icon,
      color,
      description: indicator.period
        ? `${indicator.description} • ${indicator.period}`
        : indicator.description,
    };
  };

  return (
    <TooltipProvider delayDuration={200}>
      <DashboardPageLayout maxWidth="xl" padding="md">
        {/* Header */}
        <div className="min-w-0">
          <h1 className="text-slate-50 font-semibold text-xl sm:text-2xl">
            Points Clés
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Indicateurs stratégiques essentiels organisés par thème
          </p>
        </div>

        {/* Groupes d'indicateurs */}
        {indicatorGroups.map((group) => {
          const groupColor = 
            group.color === 'orange' ? 'amber' :
            group.color === 'red' ? 'rose' :
            group.color;

          return (
            <DashboardSection
              key={group.id}
              title={group.title}
              icon={group.icon}
            >
              <DashboardGrid columns={3} gap="md">
                {group.indicators.map((indicator) => {
                  const kpiData = convertIndicatorToKPICardData(indicator);
                  return (
                    <div key={indicator.id} className="min-w-0">
                      <KPICard
                        kpi={kpiData}
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
                })}
              </DashboardGrid>
            </DashboardSection>
          );
        })}

        {/* Métadonnées */}
        <DashboardSection
          title="Contexte et Métadonnées"
        >
          <DashboardGrid columns={2} gap="md">
            <DashboardPanel padding="md">
              <p className="text-slate-400 text-sm mb-2">Dernière mise à jour</p>
              <p className="font-medium text-slate-200">
                {lastUpdate ? <LastUpdateDisplay lastUpdate={lastUpdate} /> : <span className="text-slate-500">—</span>}
              </p>
            </DashboardPanel>
            <DashboardPanel padding="md">
              <p className="text-slate-400 text-sm mb-2">Période d'analyse</p>
              <p className="font-medium text-slate-200">Mois en cours</p>
            </DashboardPanel>
          </DashboardGrid>
        </DashboardSection>
      </DashboardPageLayout>
    </TooltipProvider>
  );
});

export default SummaryPointsPage;
