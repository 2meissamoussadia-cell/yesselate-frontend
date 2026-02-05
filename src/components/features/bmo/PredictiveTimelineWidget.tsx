'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/cn';
import { useAppStore } from '@/lib/stores';
import { DashboardCard } from './DashboardCard';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, AlertTriangle, Calendar } from 'lucide-react';
import { TrendChart } from './TrendChart';

interface PredictiveTimelineWidgetProps {
  historical: Array<{ period: string; value: number }>;
  predictedMonths?: number;
  className?: string;
}

interface TimelineEvent {
  period: string;
  type: 'historical' | 'predicted' | 'risk';
  value: number;
  risk?: 'low' | 'medium' | 'high';
  description?: string;
}

export function PredictiveTimelineWidget({
  historical,
  predictedMonths = 6,
  className,
}: PredictiveTimelineWidgetProps) {
  const { darkMode } = useAppStore();

  const timeline = useMemo(() => {
    const events: TimelineEvent[] = [];

    // Ajouter les données historiques
    historical.forEach((item) => {
      events.push({
        period: item.period,
        type: 'historical',
        value: item.value,
      });
    });

    // Calculer la tendance pour les prédictions
    if (historical.length >= 2) {
      const recent = historical.slice(-3);
      const avgGrowth = recent.length > 1
        ? (recent[recent.length - 1].value - recent[0].value) / recent.length
        : 0;

      const lastValue = historical[historical.length - 1].value;

      // Générer les prédictions
      for (let i = 1; i <= predictedMonths; i++) {
        const predictedValue = Math.max(0, lastValue + avgGrowth * i);
        const risk: 'low' | 'medium' | 'high' =
          Math.abs(avgGrowth) > lastValue * 0.2
            ? 'high'
            : Math.abs(avgGrowth) > lastValue * 0.1
            ? 'medium'
            : 'low';

        events.push({
          period: `M+${i}`,
          type: 'predicted',
          value: predictedValue,
          risk,
          description:
            risk === 'high'
              ? 'Variation importante prévue'
              : risk === 'medium'
              ? 'Variation modérée prévue'
              : 'Tendance stable',
        });
      }
    }

    return events;
  }, [historical, predictedMonths]);

  const risks = useMemo(() => {
    return timeline.filter((e) => e.type === 'predicted' && e.risk === 'high');
  }, [timeline]);

  const chartData = useMemo(() => {
    return timeline.map((e) => ({
      period: e.period,
      value: e.value,
      isPredicted: e.type === 'predicted',
    }));
  }, [timeline]);

  return (
    <DashboardCard
      title="🔮 Timeline Prédictive"
      subtitle="Projections sur 6 mois avec identification des risques"
      icon="🔮"
      borderColor="#EC4899"
      badge={risks.length}
      badgeVariant={risks.length > 0 ? 'warning' : 'default'}
      className={className}
    >
      <div className="space-y-4">
        {/* Graphique */}
        <div className="h-48">
          <TrendChart
            data={chartData.map((d) => ({ period: d.period, value: d.value }))}
            color="#EC4899"
            height={192}
            type="line"
          />
        </div>

        {/* Légende */}
        <div className="flex items-center gap-4 text-[9px] text-slate-400">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-purple-400" />
            <span>Historique</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full border-2 border-dashed border-purple-400" />
            <span>Prévision</span>
          </div>
        </div>

        {/* Risques identifiés */}
        {risks.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="w-3 h-3 text-amber-400" />
              Risques futurs identifiés
            </h4>
            <div className="space-y-1">
              {risks.slice(0, 3).map((risk, idx) => (
                <div
                  key={idx}
                  className={cn(
                    'p-2 rounded-lg border-l-4',
                    darkMode ? 'bg-amber-400/10' : 'bg-amber-50',
                    'border-l-amber-400/60'
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-3 h-3 text-amber-400" />
                    <span className="text-[10px] font-semibold">{risk.period}</span>
                    <Badge variant="warning" className="text-[9px]">
                      {risk.risk}
                    </Badge>
                  </div>
                  {risk.description && (
                    <p className="text-[9px] text-slate-400">{risk.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Statistiques de tendance */}
        {historical.length >= 2 && (
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-700">
            <div className="text-center">
              <p className="text-[9px] text-slate-400 mb-1">Tendance</p>
              <div className="flex items-center justify-center gap-1">
                {(() => {
                  const recent = historical.slice(-3);
                  const trend = recent.length > 1
                    ? recent[recent.length - 1].value - recent[0].value
                    : 0;
                  const Icon = trend > 0 ? TrendingUp : TrendingDown;
                  return (
                    <>
                      <Icon className={cn('w-3 h-3', trend > 0 ? 'text-emerald-400' : 'text-red-400')} />
                      <span className={cn('text-xs font-semibold', trend > 0 ? 'text-emerald-400' : 'text-red-400')}>
                        {trend > 0 ? '+' : ''}
                        {trend.toFixed(0)}
                      </span>
                    </>
                  );
                })()}
              </div>
            </div>
            <div className="text-center">
              <p className="text-[9px] text-slate-400 mb-1">Projection</p>
              <p className="text-xs font-semibold">
                {timeline.filter((e) => e.type === 'predicted').length} mois
              </p>
            </div>
          </div>
        )}
      </div>
    </DashboardCard>
  );
}

