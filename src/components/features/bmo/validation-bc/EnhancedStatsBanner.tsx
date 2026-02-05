'use client';

import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Clock, FileText } from 'lucide-react';
import type { EnrichedBC, EnrichedFacture, EnrichedAvenant } from '@/lib/types/document-validation.types';

interface EnhancedStatsBannerProps {
  bcs: EnrichedBC[];
  factures: EnrichedFacture[];
  avenants: EnrichedAvenant[];
}

export function EnhancedStatsBanner({ bcs, factures, avenants }: EnhancedStatsBannerProps) {
  const stats = useMemo(() => {
    const allDocs = [...bcs, ...factures, ...avenants];
    
    const pending = allDocs.filter(d => d.status === 'pending').length;
    const anomalyDetected = allDocs.filter(d => d.status === 'anomaly_detected').length;
    const correctionRequested = allDocs.filter(d => d.status === 'correction_requested').length;
    const corrected = allDocs.filter(d => d.status === 'corrected').length;
    const validated = allDocs.filter(d => d.status === 'validated').length;
    const rejected = allDocs.filter(d => d.status === 'rejected').length;
    
    // Compter les anomalies non résolues
    const totalAnomalies = allDocs.reduce((sum, doc) => {
      return sum + (doc.anomalies?.filter(a => !a.resolved).length || 0);
    }, 0);
    
    // Calculer les montants
    const totalPendingAmount = allDocs
      .filter(d => d.status === 'pending' || d.status === 'anomaly_detected' || d.status === 'correction_requested')
      .reduce((sum, doc) => {
        if ('montantTTC' in doc) {
          return sum + doc.montantTTC;
        }
        if ('impactFinancier' in doc) {
          return sum + doc.impactFinancier;
        }
        return sum;
      }, 0);
    
    const totalValidatedAmount = allDocs
      .filter(d => d.status === 'validated')
      .reduce((sum, doc) => {
        if ('montantTTC' in doc) {
          return sum + doc.montantTTC;
        }
        if ('impactFinancier' in doc) {
          return sum + doc.impactFinancier;
        }
        return sum;
      }, 0);
    
    return {
      total: allDocs.length,
      pending,
      anomalyDetected,
      correctionRequested,
      corrected,
      validated,
      rejected,
      totalAnomalies,
      totalPendingAmount,
      totalValidatedAmount,
    };
  }, [bcs, factures, avenants]);

  const cards = [
    {
      label: 'Total documents',
      value: stats.total,
      icon: FileText,
      color: 'blue',
      variant: 'info' as const,
    },
    {
      label: 'En attente',
      value: stats.pending,
      icon: Clock,
      color: 'orange',
      variant: 'warning' as const,
    },
    {
      label: 'Anomalies détectées',
      value: stats.anomalyDetected,
      icon: AlertTriangle,
      color: 'red',
      variant: 'urgent' as const,
      badge: stats.totalAnomalies > 0 ? `${stats.totalAnomalies} anomalie(s)` : undefined,
    },
    {
      label: 'Correction demandée',
      value: stats.correctionRequested,
      icon: TrendingDown,
      color: 'orange',
      variant: 'warning' as const,
    },
    {
      label: 'Corrigés',
      value: stats.corrected,
      icon: CheckCircle,
      color: 'emerald',
      variant: 'success' as const,
    },
    {
      label: 'Validés',
      value: stats.validated,
      icon: CheckCircle,
      color: 'emerald',
      variant: 'success' as const,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Cartes de statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card
              key={card.label}
              className={cn(
                'border-l-4',
                card.color === 'blue' ? 'border-blue-500' :
                card.color === 'orange' ? 'border-orange-500' :
                card.color === 'red' ? 'border-red-500' :
                'border-emerald-500'
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Icon className={cn(
                    'w-5 h-5',
                    card.color === 'blue' ? 'text-blue-400' :
                    card.color === 'orange' ? 'text-orange-400' :
                    card.color === 'red' ? 'text-red-400' :
                    'text-emerald-400'
                  )} />
                  <Badge variant={card.variant} className="text-xs">
                    {card.value}
                  </Badge>
                </div>
                <p className="text-xs text-slate-400 mb-1">{card.label}</p>
                {card.badge && (
                  <p className="text-[10px] text-orange-400 mt-1">{card.badge}</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Montants */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-orange-500/30 bg-orange-500/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 mb-1">Montant total en attente</p>
                <p className="text-2xl font-bold text-orange-400">
                  {stats.totalPendingAmount.toLocaleString('fr-FR')} FCFA
                </p>
              </div>
              <TrendingDown className="w-8 h-8 text-orange-400 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-emerald-500/30 bg-emerald-500/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 mb-1">Montant total validé</p>
                <p className="text-2xl font-bold text-emerald-400">
                  {stats.totalValidatedAmount.toLocaleString('fr-FR')} FCFA
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-emerald-400 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { cn } from '@/lib/cn';

