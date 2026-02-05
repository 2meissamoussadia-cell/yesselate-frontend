'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/cn';
import { useAppStore } from '@/lib/stores';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BureauTag } from '@/components/features/bmo/BureauTag';
import { TrendingUp, Clock, AlertCircle, CheckCircle, Users } from 'lucide-react';
import type { CalendarEvent } from '@/lib/types/bmo.types';
import { bureaux } from '@/lib/data';

interface PilotingStatisticsProps {
  activities: CalendarEvent[];
  actionLogs: Array<{
    module: string;
    action: string;
    timestamp: string;
    targetId: string;
  }>;
}

export function PilotingStatistics({ activities, actionLogs }: PilotingStatisticsProps) {
  const { darkMode } = useAppStore();

  // Charge par bureau
  const workloadByBureau = useMemo(() => {
    return bureaux.map((bureau) => {
      const bureauActivities = activities.filter(a => a.bureau === bureau.code);
      const totalCharge = bureauActivities.reduce((sum, a) => sum + (a.estimatedCharge || 1), 0);
      const todayActivities = bureauActivities.filter(a => {
        const today = new Date().toISOString().split('T')[0];
        return a.date === today;
      });
      const upcomingActivities = bureauActivities.filter(a => {
        const activityDate = new Date(a.date);
        const today = new Date();
        return activityDate >= today && activityDate <= new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      });

      return {
        bureau: bureau.code,
        bureauName: bureau.name,
        totalActivities: bureauActivities.length,
        totalCharge,
        todayActivities: todayActivities.length,
        upcomingActivities: upcomingActivities.length,
        completed: bureauActivities.filter(a => a.status === 'completed').length,
        pending: bureauActivities.filter(a => a.status === 'planned' || !a.status).length,
        critical: bureauActivities.filter(a => a.priority === 'critical' || a.priority === 'urgent').length,
      };
    });
  }, [activities]);

  // Taux de résolution
  const resolutionRate = useMemo(() => {
    const calendarActions = actionLogs.filter(log => log.module === 'calendar');
    const resolvedCount = calendarActions.filter(log => log.action === 'validation' && log.action.includes('terminé')).length;
    const totalActions = calendarActions.length;
    return totalActions > 0 ? Math.round((resolvedCount / totalActions) * 100) : 0;
  }, [actionLogs]);

  // Activités critiques non résolues
  const criticalUnresolved = useMemo(() => {
    return activities.filter(a => 
      (a.priority === 'critical' || a.priority === 'urgent') &&
      a.status !== 'completed' &&
      new Date(a.date) < new Date()
    ).length;
  }, [activities]);

  // Temps moyen de traitement
  const avgProcessingTime = useMemo(() => {
    const calendarActions = actionLogs.filter(log => log.module === 'calendar');
    if (calendarActions.length < 2) return 'N/A';
    
    // Simulation : calcul basé sur les timestamps
    const times = calendarActions
      .map((log, i) => {
        if (i === 0) return null;
        const prevTime = new Date(calendarActions[i - 1].timestamp).getTime();
        const currentTime = new Date(log.timestamp).getTime();
        return (currentTime - prevTime) / (1000 * 60 * 60); // en heures
      })
      .filter(t => t !== null && t > 0 && t < 48) as number[]; // Filtrer les valeurs aberrantes

    if (times.length === 0) return 'N/A';
    const avg = times.reduce((sum, t) => sum + t, 0) / times.length;
    return avg < 24 ? `${avg.toFixed(1)}h` : `${(avg / 24).toFixed(1)}j`;
  }, [actionLogs]);

  return (
    <div className="space-y-4">
      {/* Statistiques globales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-blue-500/30 bg-blue-500/5">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-blue-400 font-semibold">Résolution</span>
            </div>
            <p className="text-xl font-bold text-blue-400">{resolutionRate}%</p>
            <p className="text-[9px] text-slate-400 mt-1">Taux de résolution</p>
          </CardContent>
        </Card>

        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-2">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <span className="text-xs text-amber-400 font-semibold">Critiques</span>
            </div>
            <p className="text-xl font-bold text-amber-400">{criticalUnresolved}</p>
            <p className="text-[9px] text-slate-400 mt-1">Non résolues</p>
          </CardContent>
        </Card>

        <Card className="border-emerald-500/30 bg-emerald-500/5">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-emerald-400 font-semibold">Temps moyen</span>
            </div>
            <p className="text-xl font-bold text-emerald-400">{avgProcessingTime}</p>
            <p className="text-[9px] text-slate-400 mt-1">Traitement</p>
          </CardContent>
        </Card>

        <Card className="border-blue-500/30 bg-blue-500/5">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-blue-400 font-semibold">Bureaux</span>
            </div>
            <p className="text-xl font-bold text-blue-400">
              {workloadByBureau.filter(b => b.totalActivities > 0).length}
            </p>
            <p className="text-[9px] text-slate-400 mt-1">Actifs</p>
          </CardContent>
        </Card>
      </div>

      {/* Charge par bureau */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Charge par bureau
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {workloadByBureau
              .filter(b => b.totalActivities > 0)
              .sort((a, b) => b.totalCharge - a.totalCharge)
              .map((bureau) => {
                const completionRate = bureau.totalActivities > 0
                  ? Math.round((bureau.completed / bureau.totalActivities) * 100)
                  : 0;
                const overload = bureau.todayActivities > 3;

                return (
                  <div
                    key={bureau.bureau}
                    className={cn(
                      'p-3 rounded-lg border',
                      overload
                        ? 'border-amber-500/30 bg-amber-500/5'
                        : darkMode
                        ? 'bg-slate-700/30 border-slate-600'
                        : 'bg-gray-50 border-gray-200'
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <BureauTag bureau={bureau.bureau} />
                        <span className="text-sm font-semibold">{bureau.bureauName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {overload && (
                          <Badge variant="warning" className="text-[9px]">
                            Surcharge
                          </Badge>
                        )}
                        <Badge variant="info" className="text-[9px]">
                          {bureau.totalActivities} activités
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-2 text-xs">
                      <div>
                        <p className="text-slate-400 text-[10px]">Charge totale</p>
                        <p className="font-bold">{bureau.totalCharge}h</p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-[10px]">Aujourd'hui</p>
                        <p className="font-bold">{bureau.todayActivities}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-[10px]">À venir (7j)</p>
                        <p className="font-bold">{bureau.upcomingActivities}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-[10px]">Complétées</p>
                        <p className="font-bold text-emerald-400">{completionRate}%</p>
                      </div>
                    </div>

                    {/* Barre de progression */}
                    <div className="mt-2 h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all',
                          completionRate >= 80
                            ? 'bg-emerald-500'
                            : completionRate >= 50
                            ? 'bg-amber-500'
                            : 'bg-red-500'
                        )}
                        style={{ width: `${completionRate}%` }}
                      />
                    </div>

                    {bureau.critical > 0 && (
                      <div className="mt-2 pt-2 border-t border-slate-700/30">
                        <Badge variant="urgent" className="text-[9px]">
                          {bureau.critical} activité(s) critique(s) en cours
                        </Badge>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

