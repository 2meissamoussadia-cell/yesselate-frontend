'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/cn';
import { useAppStore } from '@/lib/stores';
import { DashboardCard } from './DashboardCard';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, AlertTriangle, TrendingUp, Users } from 'lucide-react';

interface AdvancedMetricsWidgetProps {
  totals: {
    demandes: number;
    validations: number;
    rejets: number;
    budget: number;
  };
  periodData: Array<{ month?: string; demandes: number; validations: number; rejets: number; budget: number }>;
  blockedDossiers: Array<{ delay: number }>;
  className?: string;
}

interface Metric {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  trend?: string;
  status?: 'good' | 'warning' | 'critical';
}

export function AdvancedMetricsWidget({
  totals,
  periodData,
  blockedDossiers,
  className,
}: AdvancedMetricsWidgetProps) {
  const { darkMode } = useAppStore();

  const metrics = useMemo(() => {
    const validationRate = totals.demandes > 0 ? (totals.validations / totals.demandes) * 100 : 0;
    const rejectionRate = totals.demandes > 0 ? (totals.rejets / totals.demandes) * 100 : 0;

    // Temps moyen de traitement (simulation)
    const avgProcessingTime = periodData.length > 0
      ? Math.round(periodData.reduce((sum, d) => sum + (d.demandes > 0 ? d.validations / d.demandes * 2.5 : 0), 0) / periodData.length * 10) / 10
      : 0;

    // Taux de résolution des blocages
    const totalBlocked = blockedDossiers.length;
    const resolvedBlocked = blockedDossiers.filter((b) => b.delay < 3).length;
    const resolutionRate = totalBlocked > 0 ? (resolvedBlocked / totalBlocked) * 100 : 100;

    // SLA respectés (simulation)
    const slaRespected = Math.max(0, 100 - rejectionRate * 2 - (totalBlocked * 5));

    // Charge de travail moyenne
    const avgWorkload = periodData.length > 0
      ? Math.round(periodData.reduce((sum, d) => sum + d.demandes, 0) / periodData.length)
      : 0;

    const metricsList: Metric[] = [
      {
        label: 'Temps moyen traitement',
        value: `${avgProcessingTime}j`,
        icon: <Clock className="w-4 h-4" />,
        color: '#3B82F6',
        trend: avgProcessingTime < 2 ? 'Excellent' : avgProcessingTime < 4 ? 'Bon' : 'À améliorer',
        status: avgProcessingTime < 2 ? 'good' : avgProcessingTime < 4 ? 'warning' : 'critical',
      },
      {
        label: 'SLA respectés',
        value: `${slaRespected.toFixed(1)}%`,
        icon: <CheckCircle className="w-4 h-4" />,
        color: slaRespected >= 90 ? '#10B981' : slaRespected >= 70 ? '#F59E0B' : '#EF4444',
        trend: slaRespected >= 90 ? 'Excellent' : slaRespected >= 70 ? 'Acceptable' : 'Critique',
        status: slaRespected >= 90 ? 'good' : slaRespected >= 70 ? 'warning' : 'critical',
      },
      {
        label: 'Taux résolution blocages',
        value: `${resolutionRate.toFixed(1)}%`,
        icon: <AlertTriangle className="w-4 h-4" />,
        color: resolutionRate >= 80 ? '#10B981' : resolutionRate >= 60 ? '#F59E0B' : '#EF4444',
        trend: resolutionRate >= 80 ? 'Bon' : resolutionRate >= 60 ? 'Moyen' : 'Faible',
        status: resolutionRate >= 80 ? 'good' : resolutionRate >= 60 ? 'warning' : 'critical',
      },
      {
        label: 'Charge moyenne',
        value: `${avgWorkload} demandes/mois`,
        icon: <TrendingUp className="w-4 h-4" />,
        color: '#8B5CF6',
        trend: avgWorkload > 100 ? 'Élevée' : avgWorkload > 50 ? 'Normale' : 'Faible',
        status: avgWorkload > 100 ? 'warning' : 'good',
      },
      {
        label: 'Taux satisfaction',
        value: `${Math.max(0, 100 - rejectionRate * 2).toFixed(1)}%`,
        icon: <Users className="w-4 h-4" />,
        color: rejectionRate < 10 ? '#10B981' : rejectionRate < 20 ? '#F59E0B' : '#EF4444',
        trend: rejectionRate < 10 ? 'Excellent' : rejectionRate < 20 ? 'Bon' : 'À améliorer',
        status: rejectionRate < 10 ? 'good' : rejectionRate < 20 ? 'warning' : 'critical',
      },
    ];

    return metricsList;
  }, [totals, periodData, blockedDossiers]);

  return (
    <DashboardCard
      title="📈 Métriques Avancées"
      subtitle="Indicateurs de pilotage fin"
      icon="📈"
      borderColor="#8B5CF6"
      className={className}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {metrics.map((metric, idx) => (
          <div
            key={idx}
            className={cn(
              'p-3 rounded-lg border-l-4 transition-colors',
              darkMode ? 'bg-slate-800/30' : 'bg-gray-50',
              metric.status === 'good'
                ? 'border-l-emerald-400/60'
                : metric.status === 'warning'
                ? 'border-l-amber-400/60'
                : 'border-l-red-400/60'
            )}
          >
            <div className="flex items-start gap-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: `${metric.color}20`, color: metric.color }}
              >
                {metric.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn('text-[10px] uppercase tracking-wide mb-1', darkMode ? 'text-slate-400' : 'text-gray-500')}>
                  {metric.label}
                </p>
                <p className="text-lg font-bold mb-1">{metric.value}</p>
                {metric.trend && (
                  <Badge
                    variant={
                      metric.status === 'good'
                        ? 'success'
                        : metric.status === 'warning'
                        ? 'warning'
                        : 'urgent'
                    }
                    className="text-[9px]"
                  >
                    {metric.trend}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </DashboardCard>
  );
}

