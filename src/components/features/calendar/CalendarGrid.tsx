/**
 * CalendarGrid - Grille calendrier visuelle interactive
 * Vue mensuelle/hebdomadaire avec événements et conflits
 */

'use client';

import React, { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Plus,
  AlertTriangle,
  Clock,
  Users,
  MapPin,
} from 'lucide-react';

// ================================
// TYPES
// ================================

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  startTime?: string;
  endTime?: string;
  type: 'meeting' | 'deadline' | 'milestone' | 'task' | 'reminder';
  priority: 'high' | 'medium' | 'low';
  project?: string;
  participants?: string[];
  location?: string;
  hasConflict?: boolean;
  conflictWith?: string[];
}

interface CalendarGridProps {
  events?: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  onDateClick?: (date: Date) => void;
  onCreateEvent?: (date: Date) => void;
  view?: 'month' | 'week';
}

// ================================
// SAMPLE DATA
// ================================

const sampleEvents: CalendarEvent[] = [
  {
    id: 'EVT-001',
    title: 'Comité de pilotage',
    date: new Date(),
    startTime: '09:00',
    endTime: '11:00',
    type: 'meeting',
    priority: 'high',
    project: 'Projet Alpha',
    participants: ['M. Dupont', 'Mme Martin', 'M. Koné'],
    location: 'Salle A',
  },
  {
    id: 'EVT-002',
    title: 'Deadline BC-2024-0847',
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    type: 'deadline',
    priority: 'high',
    project: 'Chantier Phase 3',
    hasConflict: true,
    conflictWith: ['EVT-003'],
  },
  {
    id: 'EVT-003',
    title: 'Réunion fournisseurs',
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    startTime: '14:00',
    endTime: '16:00',
    type: 'meeting',
    priority: 'medium',
    hasConflict: true,
    conflictWith: ['EVT-002'],
  },
  {
    id: 'EVT-004',
    title: 'Jalon J5 - Phase 2',
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    type: 'milestone',
    priority: 'high',
    project: 'Projet Beta',
  },
  {
    id: 'EVT-005',
    title: 'Validation contrats',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    startTime: '10:00',
    endTime: '12:00',
    type: 'task',
    priority: 'medium',
  },
  {
    id: 'EVT-006',
    title: 'Point budget mensuel',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    startTime: '15:00',
    endTime: '16:30',
    type: 'meeting',
    priority: 'medium',
    location: 'Salle B',
  },
];

// ================================
// UTILS
// ================================

const DAYS_FR = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const MONTHS_FR = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

function getDaysInMonth(year: number, month: number): Date[] {
  const days: Date[] = [];
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  // Get first day of week (Monday = 0)
  let startDay = firstDay.getDay() - 1;
  if (startDay < 0) startDay = 6;
  
  // Add previous month days
  for (let i = startDay - 1; i >= 0; i--) {
    const day = new Date(year, month, -i);
    days.push(day);
  }
  
  // Add current month days
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push(new Date(year, month, i));
  }
  
  // Add next month days to complete 6 weeks
  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
    days.push(new Date(year, month + 1, i));
  }
  
  return days;
}

function isSameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

// ================================
// COMPONENT
// ================================

export function CalendarGrid({
  events = sampleEvents,
  onEventClick,
  onDateClick,
  onCreateEvent,
  view = 'month',
}: CalendarGridProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const days = useMemo(() => getDaysInMonth(currentYear, currentMonth), [currentYear, currentMonth]);

  const getEventsForDate = (date: Date): CalendarEvent[] => {
    return events.filter((event) => isSameDay(event.date, date));
  };

  const navigateMonth = (direction: number) => {
    setCurrentDate(new Date(currentYear, currentMonth + direction, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    onDateClick?.(date);
  };

  const typeIconColors = {
    meeting: 'text-blue-400',
    deadline: 'text-rose-400',
    milestone: 'text-purple-400',
    task: 'text-emerald-400',
    reminder: 'text-amber-400',
  };

  const typeDotColors = {
    meeting: 'bg-blue-400',
    deadline: 'bg-rose-400',
    milestone: 'bg-purple-400',
    task: 'bg-emerald-400',
    reminder: 'bg-amber-400',
  };

  const typeIcons = {
    meeting: Users,
    deadline: Clock,
    milestone: CalendarIcon,
    task: CalendarIcon,
    reminder: Clock,
  };

  return (
    <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50 bg-slate-900/40">
        <div className="flex items-center gap-3">
          <CalendarIcon className="w-5 h-5 text-blue-400" />
          <h2 className="text-lg font-semibold text-slate-200">
            {MONTHS_FR[currentMonth]} {currentYear}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={goToToday}
            className="border-slate-700 text-slate-400 hover:text-slate-200"
          >
            Aujourd'hui
          </Button>
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateMonth(-1)}
              className="h-8 w-8 p-0 text-slate-400 hover:text-slate-200"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateMonth(1)}
              className="h-8 w-8 p-0 text-slate-400 hover:text-slate-200"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          {onCreateEvent && (
            <Button
              size="sm"
              className="bg-slate-800/60 border border-slate-700/50 text-slate-200 hover:bg-slate-800/80"
              onClick={() => onCreateEvent(selectedDate || new Date())}
            >
              <Plus className="w-4 h-4 mr-1 text-blue-400" />
              Événement
            </Button>
          )}
        </div>
      </div>

      {/* Days Header */}
      <div className="grid grid-cols-7 border-b border-slate-700/50 bg-slate-900/20">
        {DAYS_FR.map((day) => (
          <div
            key={day}
            className="py-2 text-center text-xs font-medium text-slate-400 uppercase"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7">
        {days.map((date, index) => {
          const isCurrentMonth = date.getMonth() === currentMonth;
          const dayEvents = getEventsForDate(date);
          const hasConflict = dayEvents.some((e) => e.hasConflict);
          const isSelected = selectedDate && isSameDay(date, selectedDate);
          const isHovered = hoveredDate && isSameDay(date, hoveredDate);

          return (
            <div
              key={index}
              onClick={() => handleDateClick(date)}
              onMouseEnter={() => setHoveredDate(date)}
              onMouseLeave={() => setHoveredDate(null)}
              className={cn(
                'min-h-[100px] p-2 border-r border-b border-slate-700/30 cursor-pointer transition-all',
                !isCurrentMonth && 'bg-slate-900/40',
                isCurrentMonth && 'bg-slate-800/20 hover:bg-slate-800/40',
                isToday(date) && 'bg-slate-800/30',
                isSelected && 'ring-2 ring-blue-500/50 ring-inset',
                isHovered && 'bg-slate-800/50'
              )}
            >
              {/* Date Number */}
              <div className="flex items-center justify-between mb-1">
                <span
                  className={cn(
                    'w-6 h-6 flex items-center justify-center text-sm rounded-full',
                    isToday(date) && 'bg-slate-200 text-slate-900 font-bold',
                    !isToday(date) && isCurrentMonth && 'text-slate-300',
                    !isCurrentMonth && 'text-slate-600'
                  )}
                >
                  {date.getDate()}
                </span>
                {hasConflict && (
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                )}
              </div>

              {/* Events */}
              <div className="space-y-1">
                {dayEvents.slice(0, 3).map((event) => {
                  const Icon = typeIcons[event.type];

                  return (
                    <button
                      key={event.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick?.(event);
                      }}
                      className={cn(
                        'w-full text-left px-1.5 py-0.5 rounded text-xs truncate border transition-all',
                        'border-slate-700/50 bg-slate-900/40 text-slate-200 hover:bg-slate-800/50',
                        event.hasConflict && 'ring-1 ring-amber-500/50'
                      )}
                      title={event.title}
                    >
                      <div className="flex items-center gap-1">
                        <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', typeDotColors[event.type])} />
                        <Icon className={cn('w-3 h-3 flex-shrink-0', typeIconColors[event.type])} />
                        <span className="truncate">{event.title}</span>
                      </div>
                    </button>
                  );
                })}
                {dayEvents.length > 3 && (
                  <div className="text-xs text-slate-400 pl-1">
                    +{dayEvents.length - 3} autres
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 px-4 py-2 border-t border-slate-700/50 bg-slate-900/40">
        <span className="text-xs text-slate-400">Légende:</span>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-xs text-slate-400">Réunion</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-rose-500" />
            <span className="text-xs text-slate-400">Deadline</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-purple-500" />
            <span className="text-xs text-slate-400">Jalon</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-xs text-slate-400">Tâche</span>
          </div>
          <div className="flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            <span className="text-xs text-slate-400">Conflit</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ================================
// EVENT DETAIL TOOLTIP
// ================================

interface EventDetailProps {
  event: CalendarEvent;
  onClose: () => void;
}

export function EventDetail({ event, onClose }: EventDetailProps) {
  const typeColors = {
    meeting: 'text-blue-400',
    deadline: 'text-rose-400',
    milestone: 'text-purple-400',
    task: 'text-emerald-400',
    reminder: 'text-amber-400',
  };

  return (
    <div className="absolute z-50 w-72 p-4 rounded-xl bg-slate-900 border border-slate-700/50 shadow-xl">
      <div className="flex items-start justify-between mb-3">
        <div>
          <Badge
            variant="outline"
            className={cn('text-xs mb-1', typeColors[event.type])}
          >
            {event.type}
          </Badge>
          <h3 className="text-sm font-semibold text-slate-200">{event.title}</h3>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-300">
          ×
        </button>
      </div>

      <div className="space-y-2 text-xs">
        <div className="flex items-center gap-2 text-slate-400">
          <CalendarIcon className="w-3.5 h-3.5" />
          <span>{event.date.toLocaleDateString('fr-FR')}</span>
          {event.startTime && (
            <span>
              {event.startTime} - {event.endTime}
            </span>
          )}
        </div>

        {event.location && (
          <div className="flex items-center gap-2 text-slate-400">
            <MapPin className="w-3.5 h-3.5" />
            <span>{event.location}</span>
          </div>
        )}

        {event.participants && event.participants.length > 0 && (
          <div className="flex items-center gap-2 text-slate-400">
            <Users className="w-3.5 h-3.5" />
            <span>{event.participants.join(', ')}</span>
          </div>
        )}

        {event.project && (
          <div className="text-slate-400 italic">
            Projet: {event.project}
          </div>
        )}

        {event.hasConflict && (
          <div className="flex items-center gap-2 text-slate-300 mt-2 p-2 rounded bg-slate-800/40 border border-slate-700/50">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Conflit détecté avec {event.conflictWith?.length} événement(s)</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ================================
// MINI CALENDAR
// ================================

interface MiniCalendarProps {
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
  highlightedDates?: Date[];
}

export function MiniCalendar({
  selectedDate,
  onDateSelect,
  highlightedDates = [],
}: MiniCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const days = useMemo(() => getDaysInMonth(currentYear, currentMonth), [currentYear, currentMonth]);

  const isHighlighted = (date: Date) =>
    highlightedDates.some((d) => isSameDay(d, date));

  return (
    <div className="p-3 rounded-xl bg-slate-800/30 border border-slate-700/50">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-slate-200">
          {MONTHS_FR[currentMonth].slice(0, 3)} {currentYear}
        </span>
        <div className="flex">
          <button
            onClick={() => setCurrentDate(new Date(currentYear, currentMonth - 1, 1))}
            className="p-1 text-slate-400 hover:text-slate-300"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentDate(new Date(currentYear, currentMonth + 1, 1))}
            className="p-1 text-slate-400 hover:text-slate-300"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {DAYS_FR.map((day) => (
          <div key={day} className="text-center text-[10px] text-slate-600 py-1">
            {day.charAt(0)}
          </div>
        ))}
        {days.map((date, index) => {
          const isCurrentMonth = date.getMonth() === currentMonth;
          const isSelected = selectedDate && isSameDay(date, selectedDate);

          return (
            <button
              key={index}
              onClick={() => onDateSelect?.(date)}
              className={cn(
                'w-6 h-6 text-xs rounded-full flex items-center justify-center transition-all',
                !isCurrentMonth && 'text-slate-700',
                isCurrentMonth && 'text-slate-400 hover:bg-slate-700/50',
                isToday(date) && 'bg-slate-800/30 text-slate-200',
                isSelected && 'bg-slate-200 text-slate-900',
                isHighlighted(date) && !isSelected && 'ring-1 ring-blue-500/50'
              )}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

