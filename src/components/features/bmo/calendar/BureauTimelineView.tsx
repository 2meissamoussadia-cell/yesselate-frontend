'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/stores';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BureauTag } from '@/components/features/bmo/BureauTag';
import { TrendingUp, AlertCircle } from 'lucide-react';
import type { CalendarEvent } from '@/lib/types/bmo.types';
import { bureaux } from '@/lib/data';

interface BureauTimelineViewProps {
  activities: CalendarEvent[];
  weekDays: Date[];
}

export function BureauTimelineView({ activities, weekDays }: BureauTimelineViewProps) {
  const { darkMode } = useAppStore();

  // Organiser les activités par bureau et jour
  const timelineData = useMemo(() => {
    const data: Record<string, Record<string, CalendarEvent[]>> = {};
    
    bureaux.forEach((bureau) => {
      data[bureau.code] = {};
      weekDays.forEach((day) => {
        const dateStr = day.toISOString().split('T')[0];
        data[bureau.code][dateStr] = activities.filter(
          a => a.bureau === bureau.code && a.date === dateStr
        );
      });
    });
    
    return data;
  }, [activities, weekDays]);

  // Calculer la charge par bureau
  const bureauLoads = useMemo(() => {
    return bureaux.map((bureau) => {
      const bureauActivities = activities.filter(a => a.bureau === bureau.code);
      const totalCharge = bureauActivities.reduce((sum, a) => sum + (a.estimatedCharge || 1), 0);
      const criticalCount = bureauActivities.filter(a => 
        a.priority === 'critical' || a.priority === 'urgent'
      ).length;
      const overloadedDays = weekDays.filter(day => {
        const dateStr = day.toISOString().split('T')[0];
        return (timelineData[bureau.code]?.[dateStr] || []).length > 3;
      }).length;

      return {
        bureau: bureau.code,
        bureauName: bureau.name,
        totalCharge,
        criticalCount,
        overloadedDays,
        totalActivities: bureauActivities.length,
      };
    }).sort((a, b) => b.totalCharge - a.totalCharge);
  }, [activities, timelineData, weekDays]);

  const formatDayLabel = (day: Date) => {
    return day.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-4">
      {/* En-tête avec jours */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Vue Timeline Multi-Bureaux (Planning Gantt)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            {/* Ligne d'en-tête avec jours */}
            <div className="flex gap-1 mb-2 min-w-max">
              <div className="w-48 flex-shrink-0"></div>
              {weekDays.map((day, i) => {
                const dateStr = day.toISOString().split('T')[0];
                const isToday = dateStr === new Date().toISOString().split('T')[0];
                const dayEvents = activities.filter(a => a.date === dateStr);
                const isOverloaded = dayEvents.length > 3;
                
                return (
                  <div
                    key={i}
                    className={cn(
                      'w-32 flex-shrink-0 text-center p-2 rounded border',
                      isToday
                        ? 'bg-orange-500/20 border-orange-500/50'
                        : darkMode
                        ? 'bg-slate-700/30 border-slate-600'
                        : 'bg-gray-50 border-gray-200'
                    )}
                  >
                    <p className="text-xs font-semibold">{formatDayLabel(day)}</p>
                    <Badge
                      variant={isOverloaded ? 'warning' : 'default'}
                      className="text-[9px] mt-1"
                    >
                      {dayEvents.length} act.
                    </Badge>
                  </div>
                );
              })}
            </div>

            {/* Lignes par bureau */}
            {bureauLoads.map((bureauLoad) => {
              const bureauData = timelineData[bureauLoad.bureau] || {};
              const hasOverload = bureauLoad.overloadedDays > 0;
              
              return (
                <div
                  key={bureauLoad.bureau}
                  className={cn(
                    'flex gap-1 mb-2 min-w-max items-center',
                    hasOverload && 'bg-amber-500/5 rounded-lg p-1'
                  )}
                >
                  {/* Colonne bureau */}
                  <div className="w-48 flex-shrink-0 flex items-center gap-2 p-2">
                    <BureauTag bureau={bureauLoad.bureau} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate">{bureauLoad.bureauName}</p>
                      <div className="flex items-center gap-1 text-[9px] text-slate-400">
                        <span>{bureauLoad.totalActivities} act.</span>
                        <span>•</span>
                        <span>{bureauLoad.totalCharge}h</span>
                        {bureauLoad.criticalCount > 0 && (
                          <>
                            <span>•</span>
                            <Badge variant="urgent" className="text-[8px]">
                              {bureauLoad.criticalCount} crit.
                            </Badge>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Cases pour chaque jour */}
                  {weekDays.map((day, i) => {
                    const dateStr = day.toISOString().split('T')[0];
                    const dayEvents = bureauData[dateStr] || [];
                    const isToday = dateStr === new Date().toISOString().split('T')[0];
                    const isOverloaded = dayEvents.length > 3;
                    const hasCritical = dayEvents.some(e => e.priority === 'critical' || e.priority === 'urgent');

                    return (
                      <div
                        key={i}
                        className={cn(
                          'w-32 flex-shrink-0 min-h-[60px] p-1 rounded border transition-all hover:scale-105 cursor-pointer',
                          isToday
                            ? 'ring-2 ring-orange-500/50 bg-orange-500/10'
                            : isOverloaded
                            ? 'bg-amber-500/20 border-amber-500/50'
                            : hasCritical
                            ? 'bg-red-500/10 border-red-500/30'
                            : darkMode
                            ? 'bg-slate-700/20 border-slate-600'
                            : 'bg-gray-50 border-gray-200'
                        )}
                        title={`${dayEvents.length} activité(s) pour ${bureauLoad.bureau}`}
                      >
                        <div className="space-y-0.5">
                          {dayEvents.slice(0, 3).map((event, ei) => {
                            const priorityColor = 
                              event.priority === 'critical' || event.priority === 'urgent'
                                ? 'bg-red-500/30 border-red-500/50'
                                : event.priority === 'high'
                                ? 'bg-orange-500/30 border-orange-500/50'
                                : 'bg-blue-500/20 border-blue-500/30';
                            
                            return (
                              <div
                                key={ei}
                                className={cn(
                                  'p-1 rounded text-[8px] border truncate',
                                  priorityColor
                                )}
                              >
                                <div className="flex items-center gap-1">
                                  <span className="font-semibold">{event.time}</span>
                                </div>
                                <p className="truncate font-medium">{event.title}</p>
                              </div>
                            );
                          })}
                          {dayEvents.length > 3 && (
                            <div className="text-[8px] text-center text-slate-400 font-semibold">
                              +{dayEvents.length - 3}
                            </div>
                          )}
                          {dayEvents.length === 0 && (
                            <div className="text-[8px] text-center text-slate-400">
                              —
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* Légende */}
          <div className="mt-4 pt-3 border-t border-slate-700/30">
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-orange-500/20 border border-orange-500/50"></div>
                <span>Surcharge ({'>'}3 act.)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-red-500/10 border border-red-500/30"></div>
                <span>Critique/Urgent</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded ring-2 ring-orange-500/50"></div>
                <span>Aujourd'hui</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

