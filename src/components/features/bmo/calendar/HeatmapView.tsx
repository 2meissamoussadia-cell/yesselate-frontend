'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/cn';
import { useAppStore } from '@/lib/stores';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingDown, TrendingUp } from 'lucide-react';
import type { CalendarEvent } from '@/lib/types/bmo.types';

interface HeatmapViewProps {
  activities: CalendarEvent[];
  selectedDate: Date;
}

export function HeatmapView({ activities, selectedDate }: HeatmapViewProps) {
  const { darkMode } = useAppStore();

  // Générer les 28 prochains jours (4 semaines)
  const next28Days = useMemo(() => {
    const days: Date[] = [];
    const start = new Date(selectedDate);
    for (let i = 0; i < 28; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      days.push(day);
    }
    return days;
  }, [selectedDate]);

  // Calculer la charge par jour
  const dayLoads = useMemo(() => {
    return next28Days.map(day => {
      const dateStr = day.toISOString().split('T')[0];
      const dayEvents = activities.filter(a => a.date === dateStr);
      const totalCharge = dayEvents.reduce((sum, a) => sum + (a.estimatedCharge || 1), 0);
      const criticalCount = dayEvents.filter(a => 
        a.priority === 'critical' || a.priority === 'urgent'
      ).length;
      const bureauCount = new Set(dayEvents.map(e => e.bureau).filter(Boolean)).size;

      return {
        date: dateStr,
        day,
        eventCount: dayEvents.length,
        totalCharge,
        criticalCount,
        bureauCount,
        isOverloaded: dayEvents.length > 3,
        isCritical: criticalCount > 0,
      };
    });
  }, [next28Days, activities]);

  // Trouver les jours les plus chargés
  const maxLoad = Math.max(...dayLoads.map(d => d.eventCount), 1);
  const avgLoad = dayLoads.reduce((sum, d) => sum + d.eventCount, 0) / dayLoads.length;

  const getHeatmapIntensity = (count: number) => {
    if (count === 0) return 'opacity-20';
    const ratio = count / maxLoad;
    if (ratio >= 0.8) return 'opacity-100 bg-red-500';
    if (ratio >= 0.6) return 'opacity-90 bg-orange-500';
    if (ratio >= 0.4) return 'opacity-70 bg-amber-500';
    if (ratio >= 0.2) return 'opacity-50 bg-blue-500';
    return 'opacity-40 bg-green-500';
  };

  const formatDayLabel = (day: Date) => {
    return day.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' });
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center justify-between">
          <span className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Heatmap de charge (28 prochains jours)
          </span>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <TrendingDown className="w-3 h-3" />
            <span>Chargé</span>
            <TrendingUp className="w-3 h-3" />
            <span>Peu chargé</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2">
          {dayLoads.map((dayLoad, i) => {
            const isToday = dayLoad.date === new Date().toISOString().split('T')[0];
            const isWeekend = dayLoad.day.getDay() === 0 || dayLoad.day.getDay() === 6;
            
            return (
              <div
                key={i}
                className={cn(
                  'relative p-2 rounded-lg border transition-all hover:scale-110 cursor-pointer group',
                  isToday && 'ring-2 ring-orange-500',
                  isWeekend && 'opacity-60',
                  dayLoad.isCritical && 'border-red-500/50'
                )}
                title={`${dayLoad.eventCount} activité(s) - ${dayLoad.totalCharge}h - ${dayLoad.bureauCount} bureau(x)`}
              >
                <div className={cn(
                  'absolute inset-0 rounded-lg',
                  getHeatmapIntensity(dayLoad.eventCount)
                )} />
                <div className="relative z-10">
                  <p className={cn(
                    'text-[10px] font-bold mb-1',
                    isToday ? 'text-orange-400' : 'text-white'
                  )}>
                    {dayLoad.day.getDate()}
                  </p>
                  <div className="flex flex-col gap-0.5">
                    <Badge
                      variant={dayLoad.isOverloaded ? 'urgent' : 'default'}
                      className="text-[8px] px-1 py-0 bg-white/20 text-white border-white/30"
                    >
                      {dayLoad.eventCount}
                    </Badge>
                    {dayLoad.criticalCount > 0 && (
                      <Badge
                        variant="urgent"
                        className="text-[8px] px-1 py-0"
                      >
                        {dayLoad.criticalCount}!
                      </Badge>
                    )}
                    {dayLoad.bureauCount > 0 && (
                      <span className="text-[8px] text-white/80">
                        {dayLoad.bureauCount}B
                      </span>
                    )}
                  </div>
                </div>

                {/* Tooltip au survol */}
                <div className={cn(
                  'absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 p-2 rounded-lg shadow-xl z-20',
                  'bg-slate-900 text-white text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none',
                  'border border-slate-700'
                )}>
                  <p className="font-semibold">{formatDayLabel(dayLoad.day)}</p>
                  <p>{dayLoad.eventCount} activité(s)</p>
                  <p>{dayLoad.totalCharge}h de charge</p>
                  <p>{dayLoad.bureauCount} bureau(x) concerné(s)</p>
                  {dayLoad.isOverloaded && (
                    <Badge variant="warning" className="text-[9px] mt-1">Surcharge</Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Légende */}
        <div className="mt-4 pt-3 border-t border-slate-700/30">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-4">
              <span>Intensité de charge :</span>
              <div className="flex items-center gap-1">
                <div className="w-6 h-6 rounded bg-green-500 opacity-40"></div>
                <span>Faible</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-6 h-6 rounded bg-amber-500 opacity-50"></div>
                <span>Moyenne</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-6 h-6 rounded bg-orange-500 opacity-70"></div>
                <span>Forte</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-6 h-6 rounded bg-red-500 opacity-100"></div>
                <span>Critique</span>
              </div>
            </div>
            <div className="text-slate-400">
              Moyenne: {avgLoad.toFixed(1)} activités/jour
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

