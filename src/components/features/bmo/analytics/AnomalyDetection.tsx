'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/stores';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, TrendingDown, TrendingUp, Activity, Zap } from 'lucide-react';

interface AnomalyDetectionProps {
  performanceData: any[];
  enrichedData: any[];
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

export function AnomalyDetection({ performanceData, enrichedData }: AnomalyDetectionProps) {
  const { darkMode } = useAppStore();

  const anomalies = useMemo(() => {
    const detected: Anomaly[] = [];
    const monthOrder = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    const monthIdx = (m: string) => {
      const i = monthOrder.indexOf(m);
      return i >= 0 ? i : -1;
    };

    if (enrichedData.length < 3) return detected;

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

    const demandes = enrichedData.map(d => d.demandes);
    const validations = enrichedData.map(d => d.validations);
    const rejets = enrichedData.map(d => d.rejets);

    const maDemandes = calculateMovingAverage(demandes, 3);
    const maValidations = calculateMovingAverage(validations, 3);
    const maRejets = calculateMovingAverage(rejets, 3);

    // Détecter les anomalies pour les demandes
    demandes.forEach((value, index) => {
      if (index < 2) return;
      const expected = maDemandes[index - 1];
      const deviation = Math.abs((value - expected) / expected) * 100;

      if (deviation > 30) {
        detected.push({
          type: value > expected ? 'spike' : 'drop',
          severity: deviation > 50 ? 'critical' : deviation > 40 ? 'high' : 'medium',
          category: 'Demandes',
          description: value > expected 
            ? `Pic inattendu de ${value} demandes (+${deviation.toFixed(1)}%)`
            : `Chute inattendue à ${value} demandes (-${deviation.toFixed(1)}%)`,
          date: enrichedData[index].month,
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
      const deviation = Math.abs((value - expected) / expected) * 100;

      if (value > 0 && deviation > 40) {
        detected.push({
          type: 'anomaly',
          severity: deviation > 60 ? 'critical' : 'high',
          category: 'Taux de rejet',
          description: `Taux de rejet anormalement élevé: ${value} rejets (+${deviation.toFixed(1)}%)`,
          date: enrichedData[index].month,
          value,
          expected,
          deviation,
        });
      }
    });

    // Détecter les seuils critiques
    enrichedData.forEach((data) => {
      const demandes = Number(data.demandes ?? 0);
      const rejets = Number(data.rejets ?? 0);
      const tauxRejet = demandes > 0 ? (rejets / demandes) * 100 : 0;
      if (tauxRejet > 30 && data.demandes > 50) {
        detected.push({
          type: 'threshold',
          severity: tauxRejet > 40 ? 'critical' : 'high',
          category: 'Seuil critique',
          description: `Taux de rejet critique: ${tauxRejet.toFixed(1)}% (>30%)`,
          date: data.month,
          value: tauxRejet,
          deviation: tauxRejet - 30,
        });
      }
    });

    // Trier par sévérité et date
    return detected.sort((a, b) => {
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      if (severityOrder[a.severity] !== severityOrder[b.severity]) {
        return severityOrder[a.severity] - severityOrder[b.severity];
      }
      return monthIdx(b.date) - monthIdx(a.date);
    });
  }, [enrichedData]);

  const severityColors = {
    critical: 'border-l-red-500 bg-red-500/10',
    high: 'border-l-orange-500 bg-orange-500/10',
    medium: 'border-l-amber-500 bg-amber-500/10',
    low: 'border-l-blue-500 bg-blue-500/10',
  };

  const severityIcons = {
    critical: '🚨',
    high: '⚠️',
    medium: '📊',
    low: 'ℹ️',
  };

  return (
    <Card className={cn(
      'border-red-500/30',
      'bg-slate-800/50 border-slate-700'
    )}>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Activity className="w-4 h-4 text-red-400" />
          Détection d'anomalies
          <Badge variant="urgent" className="ml-auto">
            {anomalies.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {anomalies.length === 0 ? (
          <div className="text-center py-8">
            <Zap className="w-12 h-12 text-emerald-400 mx-auto mb-2" />
            <p className="text-sm text-slate-400">Aucune anomalie détectée</p>
            <p className="text-xs text-slate-500 mt-1">Les données suivent les tendances attendues</p>
          </div>
        ) : (
          <div className="space-y-3">
            {anomalies.slice(0, 10).map((anomaly, idx) => (
              <div
                key={idx}
                className={cn(
                  'p-3 rounded-lg border-l-4 transition-all hover:shadow-md',
                  severityColors[anomaly.severity]
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 flex-1">
                    <span className="text-xl">{severityIcons[anomaly.severity]}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge
                          variant={
                            anomaly.severity === 'critical' ? 'urgent' :
                            anomaly.severity === 'high' ? 'warning' :
                            'info'
                          }
                          className="text-[9px]"
                        >
                          {anomaly.severity}
                        </Badge>
                        <Badge variant="default" className="text-[9px]">
                          {anomaly.category}
                        </Badge>
                      </div>
                      <p className="text-sm font-semibold mb-1">{anomaly.description}</p>
                      <div className="flex items-center gap-4 text-xs text-slate-400">
                        <span>📅 {anomaly.date}</span>
                        {anomaly.expected && (
                          <span>
                            Attendu: {anomaly.expected.toFixed(0)} | Observé: {anomaly.value.toFixed(0)}
                          </span>
                        )}
                        <span className={cn(
                          'font-semibold',
                          anomaly.type === 'drop' || anomaly.type === 'threshold' 
                            ? 'text-red-400' 
                            : 'text-amber-400'
                        )}>
                          {anomaly.deviation > 0 ? '+' : ''}{anomaly.deviation.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                  {anomaly.type === 'spike' ? (
                    <TrendingUp className="w-5 h-5 text-amber-400 flex-shrink-0" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-red-400 flex-shrink-0" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

