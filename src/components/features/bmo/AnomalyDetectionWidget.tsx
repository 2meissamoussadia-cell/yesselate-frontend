'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/stores';
import { DashboardCard } from './DashboardCard';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, TrendingDown, TrendingUp, Activity } from 'lucide-react';

interface AnomalyDetectionWidgetProps {
  periodData: Array<{ month?: string; demandes: number; validations: number; rejets: number; budget: number }>;
  className?: string;
}

interface Anomaly {
  type: 'spike' | 'drop' | 'anomaly' | 'threshold';
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  description: string;
  date: string;
  value: number;
  expected?: number;
  deviation: number;
}

export function AnomalyDetectionWidget({
  periodData,
  className,
}: AnomalyDetectionWidgetProps) {
  const { darkMode } = useAppStore();

  const anomalies = useMemo(() => {
    const detected: Anomaly[] = [];

    if (periodData.length < 3) return detected;

    // Calculer les moyennes mobiles
    const calculateMovingAverage = (data: number[], window: number) => {
      const result: number[] = [];
      for (let i = 0; i < data.length; i++) {
        const start = Math.max(0, i - window + 1);
        const windowData = data.slice(start, i + 1);
        result.push(windowData.reduce((a, b) => a + b, 0) / windowData.length);
      }
      return result;
    };

    const demandes = periodData.map((d) => d.demandes);
    const validations = periodData.map((d) => d.validations);
    const rejets = periodData.map((d) => d.rejets);

    const maDemandes = calculateMovingAverage(demandes, 3);
    const maValidations = calculateMovingAverage(validations, 3);
    const maRejets = calculateMovingAverage(rejets, 3);

    // Détecter les anomalies pour les demandes
    demandes.forEach((value, index) => {
      if (index < 2) return;
      const expected = maDemandes[index - 1];
      if (expected === 0) return;
      const deviation = Math.abs((value - expected) / expected) * 100;

      if (deviation > 30) {
        detected.push({
          type: value > expected ? 'spike' : 'drop',
          severity: deviation > 50 ? 'critical' : deviation > 40 ? 'high' : 'medium',
          category: 'Demandes',
          description: value > expected
            ? `Pic inattendu de ${value} demandes (+${deviation.toFixed(1)}%)`
            : `Chute inattendue à ${value} demandes (-${deviation.toFixed(1)}%)`,
          date: periodData[index].month || `M${index + 1}`,
          value,
          expected,
          deviation,
        });
      }
    });

    // Détecter les anomalies pour les rejets
    rejets.forEach((value, index) => {
      if (index < 2) return;
      const expected = maRejets[index - 1];
      if (expected === 0 && value === 0) return;
      const deviation = expected > 0 ? Math.abs((value - expected) / expected) * 100 : value > 0 ? 100 : 0;

      if (value > 0 && deviation > 40) {
        detected.push({
          type: 'anomaly',
          severity: deviation > 60 ? 'critical' : 'high',
          category: 'Taux de rejet',
          description: `Taux de rejet anormalement élevé: ${value} rejets (+${deviation.toFixed(1)}%)`,
          date: periodData[index].month || `M${index + 1}`,
          value,
          expected,
          deviation,
        });
      }
    });

    // Détecter les seuils critiques
    periodData.forEach((data, index) => {
      const tauxRejet = data.demandes > 0 ? (data.rejets / data.demandes) * 100 : 0;
      if (tauxRejet > 30 && data.demandes > 50) {
        detected.push({
          type: 'threshold',
          severity: tauxRejet > 50 ? 'critical' : 'high',
          category: 'Seuil critique',
          description: `Taux de rejet critique: ${tauxRejet.toFixed(1)}% (${data.rejets} rejets sur ${data.demandes} demandes)`,
          date: data.month || `M${index + 1}`,
          value: tauxRejet,
          deviation: tauxRejet - 30,
        });
      }
    });

    // Trier par sévérité
    const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    return detected.sort((a, b) => severityOrder[b.severity] - severityOrder[a.severity]).slice(0, 5);
  }, [periodData]);

  const getSeverityColor = (severity: Anomaly['severity']) => {
    switch (severity) {
      case 'critical':
        return 'border-red-400/60 bg-red-400/5';
      case 'high':
        return 'border-amber-400/60 bg-amber-400/5';
      case 'medium':
        return 'border-blue-400/60 bg-blue-400/5';
      default:
        return 'border-slate-400/60 bg-slate-400/5';
    }
  };

  const getIcon = (type: Anomaly['type']) => {
    switch (type) {
      case 'spike':
        return <TrendingUp className="w-4 h-4 text-red-400" />;
      case 'drop':
        return <TrendingDown className="w-4 h-4 text-blue-400" />;
      case 'threshold':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      default:
        return <Activity className="w-4 h-4 text-purple-400" />;
    }
  };

  return (
    <DashboardCard
      title="🔍 Détection d'Anomalies"
      subtitle="Identification automatique des écarts"
      icon="🔍"
      borderColor="#EC4899"
      badge={anomalies.length}
      badgeVariant={anomalies.some((a) => a.severity === 'critical') ? 'urgent' : 'warning'}
      className={className}
    >
      {anomalies.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">✅</div>
          <p className="text-xs text-slate-400">Aucune anomalie détectée</p>
        </div>
      ) : (
        <div className="space-y-2">
          {anomalies.map((anomaly, idx) => (
            <div
              key={idx}
              className={cn('p-3 rounded-lg border-l-4 transition-colors', getSeverityColor(anomaly.severity))}
            >
              <div className="flex items-start gap-2">
                <div className="flex-shrink-0 mt-0.5">{getIcon(anomaly.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-xs font-semibold">{anomaly.category}</h4>
                    <Badge
                      variant={
                        anomaly.severity === 'critical'
                          ? 'urgent'
                          : anomaly.severity === 'high'
                          ? 'warning'
                          : 'default'
                      }
                      className="text-[9px]"
                    >
                      {anomaly.severity}
                    </Badge>
                  </div>
                  <p className="text-[10px] text-slate-400 mb-1">{anomaly.description}</p>
                  <div className="flex items-center gap-2 text-[9px] text-slate-400">
                    <span>{anomaly.date}</span>
                    {anomaly.expected !== undefined && (
                      <span>
                        Attendu: {anomaly.expected.toFixed(0)} • Observé: {anomaly.value}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardCard>
  );
}

