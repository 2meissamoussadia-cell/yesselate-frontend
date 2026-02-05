'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/cn';
import { useAppStore } from '@/lib/stores';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BureauTag } from '@/components/features/bmo/BureauTag';
import type { CalendarEvent } from '@/lib/types/bmo.types';

interface WorkWeekViewProps {
  selectedDate: Date;
  activities: CalendarEvent[];
  onActivityClick: (activity: CalendarEvent) => void;
  onTimeSlotClick?: (date: Date, hour: number) => void;
}

export function WorkWeekView({
  selectedDate,
  activities,
  onActivityClick,
  onTimeSlotClick,
}: WorkWeekViewProps) {
  const { darkMode } = useAppStore();

  // Calculer la semaine de travail (Lundi à Vendredi)
  const workWeek = useMemo(() => {
    const weekStart = new Date(selectedDate);
    // Aller au lundi de la semaine
    const day = weekStart.getDay();
    const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1); // Ajuster pour que lundi = 1
    weekStart.setDate(diff);

    const days: Date[] = [];
    for (let i = 0; i < 5; i++) { // Lundi à Vendredi
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      days.push(date);
    }
    return days;
  }, [selectedDate]);

  // Heures de la journée (0-23)
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Organiser les activités par jour et heure
  const activitiesByDay = useMemo(() => {
    const organized: Record<string, CalendarEvent[]> = {};
    workWeek.forEach((day) => {
      const dateStr = day.toISOString().split('T')[0];
      organized[dateStr] = activities.filter(a => a.date === dateStr);
    });
    return organized;
  }, [workWeek, activities]);

  // Obtenir l'heure depuis un time string (format "HH:MM")
  const getHourFromTime = (time: string) => {
    const [hour] = time.split(':').map(Number);
    return hour || 0;
  };

  // Obtenir la position verticale en pourcentage
  const getTopPosition = (time: string) => {
    const hour = getHourFromTime(time);
    const [minutes] = time.split(':').map(Number).slice(1);
    return ((hour + (minutes || 0) / 60) / 24) * 100;
  };

  // Obtenir la hauteur en pourcentage (basé sur estimatedCharge ou 1h par défaut)
  const getHeight = (activity: CalendarEvent) => {
    const charge = activity.estimatedCharge || 1;
    return (charge / 24) * 100;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const formatDayLabel = (date: Date) => {
    const dayNum = date.getDate();
    const dayName = date.toLocaleDateString('fr-FR', { weekday: 'short' });
    return `${dayNum} ${dayName}`;
  };

  const eventTypes: Record<string, { icon: string; color: string }> = {
    meeting: { icon: '👥', color: 'bg-blue-500/30 border-blue-500/50' },
    visio: { icon: '💻', color: 'bg-purple-500/30 border-purple-500/50' },
    deadline: { icon: '📅', color: 'bg-red-500/30 border-red-500/50' },
    site: { icon: '🏗️', color: 'bg-green-500/30 border-green-500/50' },
    intervention: { icon: '🔧', color: 'bg-orange-500/30 border-orange-500/50' },
    audit: { icon: '📋', color: 'bg-amber-500/30 border-amber-500/50' },
    formation: { icon: '🎓', color: 'bg-cyan-500/30 border-cyan-500/50' },
    training: { icon: '🎓', color: 'bg-cyan-500/30 border-cyan-500/50' },
  };

  return (
    <Card className="flex-1">
      <div className="flex h-full">
        {/* Colonne des heures */}
        <div className="w-16 flex-shrink-0 border-r border-slate-700/50">
          <div className="h-12 border-b border-slate-700/50"></div>
          {hours.map((hour) => (
            <div
              key={hour}
              className="h-12 border-b border-slate-700/30 text-[10px] text-slate-400 pt-1 pl-2"
            >
              {hour}
            </div>
          ))}
        </div>

        {/* Colonnes des jours */}
        <div className="flex-1 flex">
          {workWeek.map((day, dayIndex) => {
            const dateStr = day.toISOString().split('T')[0];
            const dayActivities = activitiesByDay[dateStr] || [];
            const isTodayDay = isToday(day);

            return (
              <div
                key={dayIndex}
                className={cn(
                  'flex-1 border-r border-slate-700/50 relative',
                  dayIndex === workWeek.length - 1 && 'border-r-0',
                  isTodayDay && 'bg-orange-500/5'
                )}
              >
                {/* En-tête du jour */}
                <div
                  className={cn(
                    'h-12 border-b border-slate-700/50 p-2 text-center',
                    isTodayDay && 'border-b-2 border-orange-500 bg-orange-500/10'
                  )}
                >
                  <p className={cn(
                    'text-xs font-semibold',
                    isTodayDay ? 'text-orange-400' : 'text-slate-300'
                  )}>
                    {formatDayLabel(day)}
                  </p>
                  <Badge variant="info" className="text-[9px] mt-1">
                    {dayActivities.length}
                  </Badge>
                </div>

                {/* Créneaux horaires */}
                <div className="relative" style={{ height: 'calc(24 * 48px)' }}>
                  {/* Grille des heures */}
                  {hours.map((hour) => (
                    <div
                      key={hour}
                      className={cn(
                        'h-12 border-b border-slate-700/20 cursor-pointer transition-colors',
                        darkMode ? 'hover:bg-slate-700/10' : 'hover:bg-gray-50/50'
                      )}
                      onClick={() => onTimeSlotClick?.(day, hour)}
                    />
                  ))}

                  {/* Ligne du temps actuel (si aujourd'hui) */}
                  {isTodayDay && (() => {
                    const now = new Date();
                    const currentHour = now.getHours();
                    const currentMinutes = now.getMinutes();
                    const position = ((currentHour + currentMinutes / 60) / 24) * 100;
                    return (
                      <div
                        className="absolute left-0 right-0 border-t-2 border-dashed border-orange-500 z-10"
                        style={{ top: `${position}%` }}
                      >
                        <div className="absolute -left-2 -top-1.5 w-3 h-3 bg-orange-500 rounded-full" />
                      </div>
                    );
                  })()}

                  {/* Événements */}
                  {dayActivities.map((activity, actIndex) => {
                    const typeInfo = eventTypes[activity.type] || { icon: '📌', color: 'bg-slate-500/30 border-slate-500/50' };
                    const top = getTopPosition(activity.time);
                    const height = getHeight(activity);
                    const priority = activity.priority === 'critical' || activity.priority === 'urgent' 
                      ? 'urgent' 
                      : activity.priority === 'high' 
                      ? 'warning' 
                      : 'default';

                    return (
                      <div
                        key={`${activity.id}-${actIndex}`}
                        onClick={() => onActivityClick(activity)}
                        className={cn(
                          'absolute left-1 right-1 rounded border-l-4 cursor-pointer transition-all hover:scale-[1.02] hover:z-20',
                          typeInfo.color,
                          activity.priority === 'critical' || activity.priority === 'urgent' 
                            ? 'border-red-500' 
                            : activity.priority === 'high' 
                            ? 'border-orange-500' 
                            : 'border-blue-500',
                          darkMode ? 'bg-slate-800/80' : 'bg-white/90'
                        )}
                        style={{
                          top: `${top}%`,
                          height: `${height}%`,
                          minHeight: '24px',
                        }}
                      >
                        <div className="p-1.5 h-full overflow-hidden">
                          <div className="flex items-center gap-1 mb-0.5">
                            <span className="text-[10px]">{activity.time}</span>
                            <span className="text-xs">{typeInfo.icon}</span>
                            {activity.priority === 'critical' || activity.priority === 'urgent' ? (
                              <Badge variant="urgent" className="text-[8px] px-1 py-0">
                                !
                              </Badge>
                            ) : null}
                          </div>
                          <p className="text-[10px] font-semibold truncate">{activity.title}</p>
                          {activity.bureau && (
                            <BureauTag bureau={activity.bureau} className="text-[8px] mt-0.5" />
                          )}
                          {activity.project && (
                            <p className="text-[9px] text-slate-400 font-mono mt-0.5 truncate">
                              {activity.project}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

