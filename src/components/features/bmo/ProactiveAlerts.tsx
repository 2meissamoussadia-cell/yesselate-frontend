'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/stores';
import { DashboardCard } from './DashboardCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, TrendingDown, Clock, Zap, ArrowRight } from 'lucide-react';

interface ProactiveAlertsProps {
  periodData: Array<{ period: string; demandes: number; validations: number; rejets: number }>;
  risks: number;
  blockedDossiers: number;
  className?: string;
}

interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  prediction: string;
  action?: { label: string; route: string };
  severity: number;
}

export function ProactiveAlerts({
  periodData,
  risks,
  blockedDossiers,
  className,
}: ProactiveAlertsProps) {
  const { darkMode } = useAppStore();

  const alerts = useMemo(() => {
    const alertsList: Alert[] = [];

    // Analyser les tendances
    if (periodData.length >= 3) {
      const recent = periodData.slice(-3);
      const previous = periodData.slice(-6, -3);

      const recentAvg = {
        demandes: recent.reduce((sum, m) => sum + m.demandes, 0) / recent.length,
        validations: recent.reduce((sum, m) => sum + m.validations, 0) / recent.length,
        rejets: recent.reduce((sum, m) => sum + m.rejets, 0) / recent.length,
      };

      const previousAvg = {
        demandes: previous.length > 0 ? previous.reduce((sum, m) => sum + m.demandes, 0) / previous.length : recentAvg.demandes,
        validations: previous.length > 0 ? previous.reduce((sum, m) => sum + m.validations, 0) / previous.length : recentAvg.validations,
        rejets: previous.length > 0 ? previous.reduce((sum, m) => sum + m.rejets, 0) / previous.length : recentAvg.rejets,
      };

      // Alerte : Hausse des rejets
      if (recentAvg.rejets > previousAvg.rejets * 1.2) {
        alertsList.push({
          id: 'reject-trend',
          type: 'warning',
          title: 'Hausse des rejets détectée',
          description: `Les rejets ont augmenté de ${((recentAvg.rejets / previousAvg.rejets - 1) * 100).toFixed(0)}% sur les 3 derniers mois`,
          prediction: 'Si cette tendance se poursuit, le taux de rejet pourrait atteindre 25% dans 2 mois',
          action: { label: 'Analyser les causes', route: '/maitre-ouvrage/demandes?filter=rejected' },
          severity: 7,
        });
      }

      // Alerte : Baisse des validations
      if (recentAvg.validations < previousAvg.validations * 0.9) {
        alertsList.push({
          id: 'validation-drop',
          type: 'critical',
          title: 'Baisse des validations',
          description: `Les validations ont diminué de ${((1 - recentAvg.validations / previousAvg.validations) * 100).toFixed(0)}%`,
          prediction: 'Risque de retard sur les objectifs trimestriels',
          action: { label: 'Voir les actions', route: '/maitre-ouvrage/dashboard' },
          severity: 9,
        });
      }

      // Alerte : Surcharge prévue
      if (recentAvg.demandes > previousAvg.demandes * 1.3) {
        alertsList.push({
          id: 'overload-prediction',
          type: 'warning',
          title: 'Surcharge prévue',
          description: `Le volume de demandes a augmenté de ${((recentAvg.demandes / previousAvg.demandes - 1) * 100).toFixed(0)}%`,
          prediction: 'Risque de goulot d\'étranglement dans 1 mois si la tendance continue',
          action: { label: 'Planifier les ressources', route: '/maitre-ouvrage/calendrier' },
          severity: 6,
        });
      }
    }

    // Alerte : Dossiers bloqués critiques
    if (blockedDossiers > 5) {
      alertsList.push({
        id: 'blocked-critical',
        type: 'critical',
        title: `${blockedDossiers} dossiers bloqués`,
        description: 'Plusieurs dossiers nécessitent une intervention urgente',
        prediction: 'Risque d\'impact sur les SLA si non résolu rapidement',
        action: { label: 'Intervenir', route: '/maitre-ouvrage/arbitrages-vivants' },
        severity: 10,
      });
    }

    // Alerte : Risques accumulés
    if (risks > 10) {
      alertsList.push({
        id: 'risks-accumulated',
        type: 'warning',
        title: `${risks} risques identifiés`,
        description: 'Un nombre élevé de risques nécessite une attention',
        prediction: 'Recommandation de revue de risques hebdomadaire',
        action: { label: 'Voir les risques', route: '/maitre-ouvrage/alerts' },
        severity: 7,
      });
    }

    // Trier par sévérité
    return alertsList.sort((a, b) => b.severity - a.severity);
  }, [periodData, risks, blockedDossiers]);

  const criticalAlerts = alerts.filter((a) => a.type === 'critical');
  const warningAlerts = alerts.filter((a) => a.type === 'warning');

  if (alerts.length === 0) {
    return (
      <DashboardCard
        title="🔮 Alertes Proactives"
        subtitle="Prédictions et recommandations"
        icon="🔮"
        borderColor="#8B5CF6"
        className={className}
      >
        <div className="text-center py-4">
          <div className="text-2xl mb-2">✅</div>
          <p className="text-xs text-slate-400">Aucune alerte proactive pour le moment</p>
          <p className="text-[10px] text-slate-500 mt-1">Tout semble normal</p>
        </div>
      </DashboardCard>
    );
  }

  return (
    <DashboardCard
      title="🔮 Alertes Proactives"
      subtitle="Prédictions et recommandations basées sur les tendances"
      icon="🔮"
      borderColor="#8B5CF6"
      badge={alerts.length}
      badgeVariant={criticalAlerts.length > 0 ? 'urgent' : 'warning'}
      className={className}
    >
      <div className="space-y-3">
        {alerts.slice(0, 5).map((alert) => (
          <div
            key={alert.id}
            className={cn(
              'p-3 rounded-lg border-l-4',
              alert.type === 'critical'
                ? 'border-l-red-400/60 bg-red-400/10'
                : alert.type === 'warning'
                ? 'border-l-amber-400/60 bg-amber-400/10'
                : 'border-l-blue-400/60 bg-blue-400/10'
            )}
          >
            <div className="flex items-start gap-2 mb-2">
              <div
                className={cn(
                  'flex-shrink-0 mt-0.5',
                  alert.type === 'critical'
                    ? 'text-red-400'
                    : alert.type === 'warning'
                    ? 'text-amber-400'
                    : 'text-blue-400'
                )}
              >
                {alert.type === 'critical' ? (
                  <AlertTriangle className="w-4 h-4" />
                ) : alert.type === 'warning' ? (
                  <TrendingDown className="w-4 h-4" />
                ) : (
                  <Clock className="w-4 h-4" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-xs font-semibold">{alert.title}</h4>
                  <Badge
                    variant={alert.type === 'critical' ? 'destructive' : 'warning'}
                    className="text-[9px]"
                  >
                    {alert.severity}/10
                  </Badge>
                </div>
                <p className="text-[10px] text-slate-400 mb-2">{alert.description}</p>
                <div className="flex items-start gap-1 mb-2">
                  <Zap className="w-3 h-3 text-purple-400 flex-shrink-0 mt-0.5" />
                  <p className="text-[9px] text-purple-300 italic">{alert.prediction}</p>
                </div>
                {alert.action && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-xs h-6"
                    onClick={() => {
                      if (alert.action) {
                        window.location.href = alert.action.route;
                      }
                    }}
                  >
                    {alert.action.label}
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}

        {alerts.length > 5 && (
          <div className="text-center pt-2 border-t border-slate-700">
            <p className="text-[10px] text-slate-400">
              +{alerts.length - 5} autre(s) alerte(s)
            </p>
          </div>
        )}
      </div>
    </DashboardCard>
  );
}

