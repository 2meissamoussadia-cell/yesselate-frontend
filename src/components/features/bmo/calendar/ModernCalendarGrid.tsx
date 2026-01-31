'use client';

import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/stores';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EventCard } from './EventCard';
import { Plus, ChevronDown } from 'lucide-react';
import type { CalendarEvent } from '@/lib/types/bmo.types';

interface ModernCalendarGridProps {
  activities: CalendarEvent[];
  selectedDate: Date;
  viewType: 'day' | 'workweek' | 'week' | 'month';
  onActivityClick: (activity: CalendarEvent) => void;
  onTimeSlotClick?: (date: Date, hour: number) => void;
  onDateClick?: (date: Date) => void;
}

export function ModernCalendarGrid({
  activities,
  selectedDate,
  viewType,
  onActivityClick,
  onTimeSlotClick,
  onDateClick,
}: ModernCalendarGridProps) {
  const { darkMode } = useAppStore();
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());

  // Générer les jours selon la vue
  const days = useMemo(() => {
    const result: Date[] = [];
    const today = new Date();
    
    if (viewType === 'day') {
      result.push(new Date(selectedDate));
    } else if (viewType === 'workweek' || viewType === 'week') {
      const startOfWeek = new Date(selectedDate);
      const dayOfWeek = startOfWeek.getDay();
      const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Lundi = 0
      startOfWeek.setDate(startOfWeek.getDate() - diff);
      
      const daysInView = viewType === 'workweek' ? 5 : 7;
      for (let i = 0; i < daysInView; i++) {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + i);
        result.push(date);
      }
    } else {
      // Month view
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const startDate = new Date(firstDay);
      startDate.setDate(startDate.getDate() - (firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1));
      
      for (let i = 0; i < 42; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        result.push(date);
      }
    }
    
    return result;
  }, [selectedDate, viewType]);

  // Grouper les activités par date
  const activitiesByDate = useMemo(() => {
    const grouped: Record<string, CalendarEvent[]> = {};
    days.forEach(day => {
      const dateStr = day.toISOString().split('T')[0];
      grouped[dateStr] = activities.filter(a => a.date === dateStr);
    });
    return grouped;
  }, [days, activities]);

  const toggleDayExpansion = (dateStr: string) => {
    setExpandedDays(prev => {
      const next = new Set(prev);
      if (next.has(dateStr)) {
        next.delete(dateStr);
      } else {
        next.add(dateStr);
      }
      return next;
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  if (viewType === 'month') {
    return (
      <div className="grid grid-cols-7 gap-2">
        {/* Headers */}
        {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
          <div
            key={day}
            className={cn(
              'text-center text-xs font-semibold py-2',
              darkMode ? 'text-slate-400' : 'text-gray-600'
            )}
          >
            {day}
          </div>
        ))}

        {/* Days */}
        {days.map((day, idx) => {
          const dateStr = day.toISOString().split('T')[0];
          const dayActivities = activitiesByDate[dateStr] || [];
          const isCurrentMonth = day.getMonth() === selectedDate.getMonth();
          const isSelected = day.toDateString() === selectedDate.toDateString();
          const isExpanded = expandedDays.has(dateStr);
          const maxVisible = isExpanded ? dayActivities.length : 3;

          return (
            <Card
              key={idx}
              className={cn(
                'min-h-[120px] transition-all duration-200 cursor-pointer',
                'hover:shadow-lg hover:border-orange-500/50',
                !isCurrentMonth && 'opacity-50',
                isToday(day) && 'ring-2 ring-orange-500 shadow-lg',
                isSelected && 'border-2 border-orange-500',
                darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'
              )}
              onClick={() => onDateClick?.(day)}
            >
              <CardHeader className="p-2 pb-1">
                <div className={cn(
                  'flex items-center justify-between',
                  isToday(day) && 'text-orange-400 font-bold'
                )}>
                  <span className={cn(
                    'text-sm font-semibold',
                    !isCurrentMonth && 'text-slate-400'
                  )}>
                    {day.getDate()}
                  </span>
                  {dayActivities.length > 0 && (
                    <Badge variant="info" className="text-[8px] px-1 py-0">
                      {dayActivities.length}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-2 space-y-1">
                {dayActivities.length === 0 ? (
                  <div className="text-center py-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onTimeSlotClick?.(day, 10);
                      }}
                      className={cn(
                        'w-full py-1 rounded text-[10px] transition-colors',
                        'opacity-0 group-hover:opacity-100',
                        darkMode ? 'hover:bg-slate-700/50' : 'hover:bg-gray-100'
                      )}
                    >
                      <Plus className="w-3 h-3 mx-auto" />
                    </button>
                  </div>
                ) : (
                  <>
                    {dayActivities.slice(0, maxVisible).map(activity => (
                      <EventCard
                        key={activity.id}
                        event={activity}
                        compact
                        onClick={(e) => {
                          e?.stopPropagation();
                          onActivityClick(activity);
                        }}
                      />
                    ))}
                    {dayActivities.length > 3 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleDayExpansion(dateStr);
                        }}
                        className={cn(
                          'w-full flex items-center justify-center gap-1 py-1 text-[10px] rounded transition-colors',
                          darkMode ? 'text-slate-400 hover:bg-slate-700/50' : 'text-gray-500 hover:bg-gray-100'
                        )}
                      >
                        {isExpanded ? (
                          <>
                            <span>Voir moins</span>
                            <ChevronDown className="w-3 h-3 rotate-180" />
                          </>
                        ) : (
                          <>
                            <span>+{dayActivities.length - 3} autres</span>
                            <ChevronDown className="w-3 h-3" />
                          </>
                        )}
                      </button>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  }

  // Week/Day view avec timeline
  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="flex gap-2 overflow-x-auto">
      {days.map((day, dayIdx) => {
        const dateStr = day.toISOString().split('T')[0];
        const dayActivities = activitiesByDate[dateStr] || [];
        const isSelected = day.toDateString() === selectedDate.toDateString();

        return (
          <div
            key={dayIdx}
            className={cn(
              'flex-1 min-w-[200px] border rounded-lg transition-all',
              isSelected && 'ring-2 ring-orange-500 shadow-lg',
              darkMode ? 'border-slate-700 bg-slate-800/30' : 'border-gray-200 bg-white'
            )}
          >
            {/* Day header */}
            <div className={cn(
              'p-3 border-b text-center',
              isToday(day) && 'bg-orange-500/10',
              darkMode ? 'border-slate-700' : 'border-gray-200'
            )}>
              <div className={cn(
                'font-bold text-sm mb-1',
                isToday(day) && 'text-orange-400'
              )}>
                {day.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' })}
              </div>
              <Badge variant="info" className="text-[9px]">
                {dayActivities.length} événement{dayActivities.length > 1 ? 's' : ''}
              </Badge>
            </div>

            {/* Timeline */}
            <div className="relative">
              {hours.map(hour => (
                <div
                  key={hour}
                  onClick={() => onTimeSlotClick?.(day, hour)}
                  className={cn(
                    'h-16 border-b cursor-pointer transition-colors group',
                    darkMode ? 'border-slate-700/50 hover:bg-slate-700/30' : 'border-gray-100 hover:bg-gray-50'
                  )}
                >
                  <div className="px-2 py-1 text-[10px] text-slate-400">
                    {hour.toString().padStart(2, '0')}:00
                  </div>
                  <div className="px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Plus className="w-4 h-4 text-orange-400" />
                  </div>
                </div>
              ))}

              {/* Events positioned by time */}
              {dayActivities.map(activity => {
                const [hours, minutes] = (activity.time || '10:00').split(':').map(Number);
                const top = (hours * 64) + (minutes / 60 * 64);

                return (
                  <div
                    key={activity.id}
                    onClick={() => onActivityClick(activity)}
                    className="absolute left-2 right-2 z-10"
                    style={{ top: `${top}px` }}
                  >
                    <EventCard
                      event={activity}
                      compact
                      onClick={() => onActivityClick(activity)}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

