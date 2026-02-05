import { useMemo } from 'react';
import type { Alert } from '@/lib/types/alerts.types';

/**
 * Hook pour prédire les alertes futures basé sur les patterns historiques
 * Utilise l'analyse des tendances pour anticiper les problèmes
 */
export function useAlertPredictions(alerts: Alert[]) {
  return useMemo(() => {
    const predictions = {
      upcoming: [] as Array<{ type: string; reason: string; estimatedDate: string; confidence: number }>,
      trends: {
        increasing: [] as string[],
        decreasing: [] as string[],
        stable: [] as string[],
      },
      riskFactors: [] as Array<{ factor: string; impact: 'high' | 'medium' | 'low'; description: string }>,
    };

    // Analyser les patterns par type
    const typeCounts: Record<string, number> = {};
    const typeDates: Record<string, string[]> = {};

    alerts.forEach((alert) => {
      const typeKey = alert.type ?? 'unknown';
      const createdAtVal = alert.createdAt ?? '';
      typeCounts[typeKey] = (typeCounts[typeKey] || 0) + 1;
      if (!typeDates[typeKey]) typeDates[typeKey] = [];
      typeDates[typeKey].push(createdAtVal);
    });

    // Détecter les tendances (simplifié - en prod, utiliser une vraie analyse de séries temporelles)
    Object.entries(typeCounts).forEach(([type, count]) => {
      if (count >= 5) {
        predictions.trends.increasing.push(type);
      } else if (count <= 2) {
        predictions.trends.decreasing.push(type);
      } else {
        predictions.trends.stable.push(type);
      }
    });

    // Prédictions basées sur les patterns
    // Exemple : Si beaucoup de paiements en retard → prédire d'autres retards
    if (typeCounts.payment && typeCounts.payment >= 3) {
      predictions.upcoming.push({
        type: 'payment',
        reason: 'Tendance de retards de paiement détectée',
        estimatedDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        confidence: 75,
      });
    }

    // Facteurs de risque
    const criticalCount = alerts.filter(a => a.severity === 'critical').length;
    if (criticalCount > 5) {
      predictions.riskFactors.push({
        factor: 'Volume élevé d\'alertes critiques',
        impact: 'high',
        description: `${criticalCount} alertes critiques actives - risque de surcharge opérationnelle`,
      });
    }

    const blockedCount = alerts.filter(a => a.type === 'blocked').length;
    if (blockedCount > 3) {
      predictions.riskFactors.push({
        factor: 'Dossiers bloqués multiples',
        impact: 'medium',
        description: `${blockedCount} dossiers bloqués - risque de cascade de retards`,
      });
    }

    return predictions;
  }, [alerts]);
}

