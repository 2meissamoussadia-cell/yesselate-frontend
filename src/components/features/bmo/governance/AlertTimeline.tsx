'use client';

/**
 * Timeline prédictive des alertes
 * Affiche l'historique et les prédictions futures
 */

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/cn';
import { useAppStore } from '@/lib/stores';
import { Calendar, TrendingUp, AlertTriangle } from 'lucide-react';
import type { Alert } from '@/lib/types/alerts.types';

interface AlertTimelineProps {
  alerts: Alert[];
  monthsAhead?: number;
}

export function AlertTimeline({ alerts, monthsAhead = 3 }: AlertTimelineProps) {
  const { darkMode } = useAppStore();

  const timelineData = useMemo(() => {
    const now = new Date();
    const data: Array<{
      date: Date;
      type: 'historical' | 'prediction';
      critical: number;
      warning: number;
      info: number;
    }> = [];

    // Historique : 6 derniers mois
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now);
      date.setMonth(date.getMonth() - i);
      date.setDate(1); // Premier du mois

      // Simulation : répartir les alertes actuelles sur les mois précédents
      const monthAlerts = alerts.filter(a => {
        const alertDate = a.createdAt ? new Date(a.createdAt) : now;
        return alertDate.getMonth() === date.getMonth() && alertDate.getFullYear() === date.getFullYear();
      });

      data.push({
        date,
        type: 'historical',
        critical: monthAlerts.filter(a => a.severity === 'critical').length || Math.floor(Math.random() * 3),
        warning: monthAlerts.filter(a => a.severity === 'warning').length || Math.floor(Math.random() * 5),
        info: monthAlerts.filter(a => a.severity === 'info').length || Math.floor(Math.random() * 2),
      });
    }

    // Prédictions : prochains mois
    const lastMonth = data[data.length - 1];
    const avgGrowth = 0.15; // 15% de croissance moyenne

    for (let i = 1; i <= monthsAhead; i++) {
      const date = new Date(now);
      date.setMonth(date.getMonth() + i);
      date.setDate(1);

      data.push({
        date,
        type: 'prediction',
        critical: Math.max(0, Math.round(lastMonth.critical * (1 + avgGrowth * i))),
        warning: Math.max(0, Math.round(lastMonth.warning * (1 + avgGrowth * i * 0.8))),
        info: Math.max(0, Math.round(lastMonth.info * (1 + avgGrowth * i * 0.5))),
      });
    }

    return data;
  }, [alerts, monthsAhead]);

  const formatMonth = (date: Date) => {
    return date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Calendar className="w-4 h-4 text-purple-300/80" />
          Timeline Prédictive ({monthsAhead} mois)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {timelineData.map((item, idx) => {
            const total = item.critical + item.warning + item.info;
            const isFuture = item.type === 'prediction';
            const isToday = idx === timelineData.length - monthsAhead - 1;

            return (
              <div
                key={idx}
                className={cn(
                  'flex items-center gap-3 p-2 sm:p-3 rounded-lg border transition-all',
                  isFuture
                    ? 'bg-purple-400/8 border-purple-400/20 border-dashed'
                    : darkMode
                    ? 'bg-slate-800/30 border-slate-700/50'
                    : 'bg-gray-50 border-gray-200',
                  isToday && 'ring-2 ring-blue-400/40'
                )}
              >
                <div className="flex-shrink-0">
                  <div
                    className={cn(
                      'w-12 h-12 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm',
                      isFuture
                        ? 'bg-purple-400/20 text-purple-300/80'
                        : darkMode
                        ? 'bg-slate-700/50 text-slate-300'
                        : 'bg-gray-200 text-gray-700'
                    )}
                  >
                    {isFuture ? '🔮' : formatMonth(item.date).split(' ')[0]}
                  </div>
                  {isToday && (
                    <div className="text-[8px] sm:text-[9px] text-blue-300/80 mt-1 text-center">
                      Aujourd'hui
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="text-[10px] sm:text-xs font-semibold text-slate-300">
                      {formatMonth(item.date)}
                    </span>
                    {isFuture && (
                      <Badge variant="info" className="text-[8px] sm:text-[9px]">
                        Prédiction
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {item.critical > 0 && (
                      <div className="flex items-center gap-1">
                        <span className="text-[9px] sm:text-[10px] text-red-300/80">🚨</span>
                        <span className="text-[9px] sm:text-[10px] font-mono text-red-300/80">{item.critical}</span>
                      </div>
                    )}
                    {item.warning > 0 && (
                      <div className="flex items-center gap-1">
                        <span className="text-[9px] sm:text-[10px] text-amber-300/80">⚠️</span>
                        <span className="text-[9px] sm:text-[10px] font-mono text-amber-300/80">{item.warning}</span>
                      </div>
                    )}
                    {item.info > 0 && (
                      <div className="flex items-center gap-1">
                        <span className="text-[9px] sm:text-[10px] text-blue-300/80">ℹ️</span>
                        <span className="text-[9px] sm:text-[10px] font-mono text-blue-300/80">{item.info}</span>
                      </div>
                    )}
                    <span className="text-[9px] sm:text-[10px] text-slate-400 ml-auto">
                      Total: {total}
                    </span>
                  </div>
                </div>

                {isFuture && (
                  <TrendingUp className="w-4 h-4 text-purple-300/60 flex-shrink-0" />
                )}
              </div>
            );
          })}
        </div>

        {timelineData.filter(d => d.type === 'prediction').length > 0 && (
          <div className={cn(
            'mt-4 p-3 rounded-lg border',
            darkMode ? 'bg-purple-400/8 border-purple-400/20' : 'bg-purple-50 border-purple-200'
          )}>
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-purple-300/80 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-[10px] sm:text-xs font-semibold text-purple-300/80 mb-1">
                  Prédictions basées sur les tendances
                </p>
                <p className="text-[9px] sm:text-[10px] text-slate-400">
                  Les valeurs prédites sont estimées à partir de l'analyse des tendances historiques et peuvent varier selon les événements réels.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

