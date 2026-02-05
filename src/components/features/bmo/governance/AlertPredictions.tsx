'use client';

/**
 * Prédictions d'alertes basées sur les patterns historiques
 * Anticipe les alertes futures en analysant les tendances
 */

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/cn';
import { useAppStore } from '@/lib/stores';
import { TrendingUp, Calendar, AlertCircle } from 'lucide-react';

interface AlertPrediction {
  id: string;
  type: 'payment' | 'contract' | 'blocked' | 'system';
  severity: 'critical' | 'warning';
  title: string;
  predictedDate: string; // ISO date
  confidence: number; // 0-100
  reason: string;
  suggestedAction: string;
}

interface AlertPredictionsProps {
  alerts: Array<{
    id: string;
    type: string;
    severity: string;
    createdAt: string;
    slaDueAt?: string;
    bureau?: string;
  }>;
  payments?: Array<{ id: string; dueDate: string }>;
  contracts?: Array<{ id: string; expiry: string }>;
}

const parseDate = (dateStr: string): Date | null => {
  if (!dateStr) return null;
  // Format DD/MM/YYYY
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    const [dd, mm, yyyy] = parts.map(Number);
    return new Date(yyyy, mm - 1, dd);
  }
  // Format ISO
  const d = new Date(dateStr);
  return Number.isNaN(d.getTime()) ? null : d;
};

const formatDate = (isoDate: string) => {
  const d = new Date(isoDate);
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export function AlertPredictions({ alerts, payments = [], contracts = [] }: AlertPredictionsProps) {
  const { darkMode } = useAppStore();

  const predictions = useMemo(() => {
    const items: AlertPrediction[] = [];
    const now = new Date();

    // 1. Prédire les paiements à risque (échéance dans 7-14 jours)
    payments.forEach(payment => {
      const dueDate = parseDate(payment.dueDate);
      if (!dueDate) return;
      
      const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysUntilDue >= 7 && daysUntilDue <= 14) {
        items.push({
          id: `pred-payment-${payment.id}`,
          type: 'payment',
          severity: daysUntilDue <= 10 ? 'warning' : 'critical',
          title: `Paiement à risque • J-${daysUntilDue}`,
          predictedDate: dueDate.toISOString(),
          confidence: 85,
          reason: `Paiement prévu dans ${daysUntilDue} jours. Risque de retard si non traité rapidement.`,
          suggestedAction: 'Préparer la validation et vérifier les justificatifs',
        });
      }
    });

    // 2. Prédire les contrats à expiration proche
    contracts.forEach(contract => {
      const expDate = parseDate(contract.expiry);
      if (!expDate) return;
      
      const daysUntilExp = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysUntilExp >= 7 && daysUntilExp <= 30) {
        items.push({
          id: `pred-contract-${contract.id}`,
          type: 'contract',
          severity: daysUntilExp <= 14 ? 'warning' : 'critical',
          title: `Contrat à renouveler • J-${daysUntilExp}`,
          predictedDate: expDate.toISOString(),
          confidence: 95,
          reason: `Le contrat expire dans ${daysUntilExp} jours. Nécessite un renouvellement ou une nouvelle signature.`,
          suggestedAction: 'Initiier la procédure de renouvellement ou préparer le nouveau contrat',
        });
      }
    });

    // 3. Prédire les blocages futurs basés sur les patterns (simulation)
    // Analyser les alertes historiques de type "blocked"
    const blockedAlerts = alerts.filter(a => a.type === 'blocked');
    if (blockedAlerts.length > 0) {
      // Pattern: si plusieurs blocages dans le même bureau, risque de récurrence
      const bureauBlockCounts: Record<string, number> = {};
      blockedAlerts.forEach(a => {
        if (a.bureau) {
          bureauBlockCounts[a.bureau] = (bureauBlockCounts[a.bureau] || 0) + 1;
        }
      });

      Object.entries(bureauBlockCounts).forEach(([bureau, count]) => {
        if (count >= 2) {
          const futureDate = new Date();
          futureDate.setDate(futureDate.getDate() + 14); // Prédiction à 14 jours
          
          items.push({
            id: `pred-blocked-${bureau}`,
            type: 'blocked',
            severity: 'warning',
            title: `Risque de blocage récurrent • ${bureau}`,
            predictedDate: futureDate.toISOString(),
            confidence: 60,
            reason: `${count} blocage(s) détecté(s) récemment dans ce bureau. Pattern de récurrence possible.`,
            suggestedAction: 'Renforcer le suivi et mettre en place des mesures préventives',
          });
        }
      });
    }

    // Trier par date prédite puis par sévérité
    return items.sort((a, b) => {
      const dateA = new Date(a.predictedDate).getTime();
      const dateB = new Date(b.predictedDate).getTime();
      if (dateA !== dateB) return dateA - dateB;
      const severityRank = { critical: 2, warning: 1 };
      return severityRank[b.severity] - severityRank[a.severity];
    });
  }, [alerts, payments, contracts]);

  if (predictions.length === 0) {
    return (
      <Card className="bg-blue-400/8 border-blue-400/20">
        <CardContent className="p-4 text-center">
          <Calendar className="w-6 h-6 mx-auto mb-2 text-blue-300/80" />
          <p className="text-sm text-blue-300/80 font-semibold">
            Aucune prédiction disponible
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Les alertes futures seront affichées ici
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-purple-400/80" />
          Prédictions d'alertes ({predictions.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {predictions.map((prediction) => (
          <div
            key={prediction.id}
            className={cn(
              'p-3 rounded-lg border transition-all',
              prediction.severity === 'critical'
                ? 'bg-red-400/8 border-red-400/30'
                : 'bg-amber-400/8 border-amber-400/30'
            )}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 flex-1">
                <AlertCircle className={cn(
                  "w-4 h-4 flex-shrink-0",
                  prediction.severity === 'critical' ? 'text-red-300/80' : 'text-amber-300/80'
                )} />
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-xs sm:text-sm font-semibold">{prediction.title}</h4>
                    <Badge
                      variant={prediction.severity === 'critical' ? 'urgent' : 'warning'}
                      className="text-[9px]"
                    >
                      {prediction.severity}
                    </Badge>
                    <Badge variant="info" className="text-[9px]">
                      {prediction.confidence}% confiance
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[10px] sm:text-xs">
                <Calendar className="w-3 h-3 text-slate-400" />
                <span className="text-slate-300">
                  Prévu pour le <span className="font-mono font-semibold">{formatDate(prediction.predictedDate)}</span>
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-300">{prediction.reason}</p>
              <div className={cn(
                "p-2 rounded text-[9px] sm:text-[10px] mt-2",
                darkMode ? 'bg-slate-700/30' : 'bg-gray-100'
              )}>
                <span className="font-semibold text-blue-300/80">💡 Action suggérée:</span>
                <p className="text-slate-300 mt-0.5">{prediction.suggestedAction}</p>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

