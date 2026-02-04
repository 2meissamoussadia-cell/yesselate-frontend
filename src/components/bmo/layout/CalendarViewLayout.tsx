'use client';

/**
 * CalendarViewLayout — Layout calendrier complet pour Planning & Conférences.
 * Vues : mois, semaine, jour, agenda.
 */

import React, { useState, useMemo, Fragment } from 'react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  List,
  Grid3x3,
  Clock,
} from 'lucide-react';
import {
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isToday,
} from 'date-fns';
import { fr } from 'date-fns/locale';

export type CalendarView = 'month' | 'week' | 'day' | 'agenda';

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  color?: string;
  category?: string;
  location?: string;
  attendees?: { id: string; name: string }[];
  description?: string;
}

export interface CalendarViewLayoutProps {
  sidebar?: React.ReactNode;
  sidebarWidth?: number;
  sidebarCollapsible?: boolean;

  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  onSlotClick?: (date: Date) => void;
  onEventDrop?: (event: CalendarEvent, newStart: Date, newEnd: Date) => void;

  defaultView?: CalendarView;
  views?: CalendarView[];

  detailPanel?: React.ReactNode;
  detailPanelOpen?: boolean;

  eventColors?: Record<string, string>;
  businessHours?: { start: number; end: number };

  className?: string;
}

export function CalendarViewLayout({
  sidebar,
  sidebarWidth = 280,
  sidebarCollapsible = true,
  events = [],
  onEventClick,
  onSlotClick,
  onEventDrop,
  defaultView = 'month',
  views = ['month', 'week', 'day', 'agenda'],
  detailPanel,
  detailPanelOpen = false,
  eventColors = {},
  businessHours = { start: 8, end: 18 },
  className,
}: CalendarViewLayoutProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>(defaultView);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const goToPrevious = () => {
    switch (view) {
      case 'month':
        setCurrentDate(subMonths(currentDate, 1));
        break;
      case 'week':
      case 'day':
        setCurrentDate(view === 'day' ? subDays(currentDate, 1) : subWeeks(currentDate, 1));
        break;
    }
  };

  const goToNext = () => {
    switch (view) {
      case 'month':
        setCurrentDate(addMonths(currentDate, 1));
        break;
      case 'week':
      case 'day':
        setCurrentDate(view === 'day' ? addDays(currentDate, 1) : addWeeks(currentDate, 1));
        break;
    }
  };

  const goToToday = () => setCurrentDate(new Date());

  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentDate), { locale: fr });
    const end = endOfWeek(endOfMonth(currentDate), { locale: fr });
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  const eventsByDay = useMemo(() => {
    const grouped: Record<string, CalendarEvent[]> = {};
    events.forEach((event) => {
      const dayKey = format(event.start, 'yyyy-MM-dd');
      if (!grouped[dayKey]) grouped[dayKey] = [];
      grouped[dayKey].push(event);
    });
    return grouped;
  }, [events]);

  const getEventColor = (event: CalendarEvent) =>
    (event.category && eventColors[event.category]) || event.color || '#3b82f6';

  const renderMonthView = () => (
    <div className="flex-1 bg-white dark:bg-slate-950/40 p-4 overflow-auto">
      <div className="grid grid-cols-7 gap-px mb-px border-b border-slate-200 dark:border-slate-700 pb-2">
        {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
          <div key={day} className="text-center text-xs font-semibold text-slate-600 dark:text-slate-400 py-2">
            {day}
          </div>
        ))}
      </div>
      <div
        className="grid grid-cols-7 gap-px bg-slate-200 dark:bg-slate-800"
        style={{ gridAutoRows: 'minmax(120px, 1fr)' }}
      >
        {calendarDays.map((day) => {
          const dayKey = format(day, 'yyyy-MM-dd');
          const dayEvents = eventsByDay[dayKey] || [];
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isTodayDate = isToday(day);

          return (
            <div
              key={dayKey}
              className={cn(
                'bg-white dark:bg-slate-900 p-2 min-h-[120px] cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors',
                !isCurrentMonth && 'bg-slate-50 dark:bg-slate-950/50 text-slate-400'
              )}
              onClick={() => onSlotClick?.(day)}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={cn(
                    'text-sm font-medium',
                    isTodayDate && 'w-7 h-7 bg-sky-600 text-white rounded-full flex items-center justify-center'
                  )}
                >
                  {format(day, 'd')}
                </span>
              </div>
              <div className="space-y-1">
                {dayEvents.slice(0, 3).map((event) => (
                  <div
                    key={event.id}
                    className="text-xs px-2 py-1 rounded cursor-pointer truncate"
                    style={{ backgroundColor: `${getEventColor(event)}20`, color: getEventColor(event) }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick?.(event);
                    }}
                  >
                    {!event.allDay && (
                      <span className="font-medium mr-1">{format(event.start, 'HH:mm')}</span>
                    )}
                    {event.title}
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <div className="text-xs text-slate-500 dark:text-slate-400 px-2">
                    +{dayEvents.length - 3} autres
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderWeekView = () => {
    const startWeek = startOfWeek(currentDate, { locale: fr });
    const endWeek = endOfWeek(currentDate, { locale: fr });
    const weekDays = eachDayOfInterval({ start: startWeek, end: endWeek });
    const hours = Array.from(
      { length: businessHours.end - businessHours.start },
      (_, i) => i + businessHours.start
    );

    return (
      <div className="flex-1 overflow-auto bg-white dark:bg-slate-950/40">
        <div className="grid grid-cols-8 border-b border-slate-200 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-950 z-10">
          <div className="p-2 border-r border-slate-200 dark:border-slate-700" />
          {weekDays.map((day) => (
            <div
              key={format(day, 'yyyy-MM-dd')}
              className={cn(
                'p-2 text-center border-r border-slate-200 dark:border-slate-700',
                isToday(day) && 'bg-sky-50 dark:bg-sky-950/30'
              )}
            >
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {format(day, 'EEE', { locale: fr })}
              </div>
              <div
                className={cn(
                  'text-lg font-semibold mt-1',
                  isToday(day) &&
                    'w-8 h-8 bg-sky-600 text-white rounded-full flex items-center justify-center mx-auto'
                )}
              >
                {format(day, 'd')}
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-8">
          {hours.map((hour) => (
            <Fragment key={hour}>
              <div className="p-2 border-r border-b border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400 text-right">
                {hour}:00
              </div>
              {weekDays.map((day) => {
                const dayKey = format(day, 'yyyy-MM-dd');
                const hourEvents = (eventsByDay[dayKey] || []).filter(
                  (event) => new Date(event.start).getHours() === hour
                );

                return (
                  <div
                    key={`${dayKey}-${hour}`}
                    className="border-r border-b border-slate-200 dark:border-slate-700 min-h-[60px] p-1 relative cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40"
                    onClick={() => {
                      const slotDate = new Date(day);
                      slotDate.setHours(hour, 0, 0, 0);
                      onSlotClick?.(slotDate);
                    }}
                  >
                    {hourEvents.map((event) => (
                      <div
                        key={event.id}
                        className="text-xs px-2 py-1 rounded mb-1 cursor-pointer truncate"
                        style={{ backgroundColor: `${getEventColor(event)}30`, color: getEventColor(event) }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventClick?.(event);
                        }}
                      >
                        <div className="font-medium">
                          {format(event.start, 'HH:mm')} - {format(event.end, 'HH:mm')}
                        </div>
                        <div className="truncate">{event.title}</div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </Fragment>
          ))}
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    const dayOnly = currentDate;
    const hours = Array.from(
      { length: businessHours.end - businessHours.start },
      (_, i) => i + businessHours.start
    );
    const dayKey = format(dayOnly, 'yyyy-MM-dd');
    const dayEvents = eventsByDay[dayKey] || [];

    return (
      <div className="flex-1 overflow-auto bg-white dark:bg-slate-950/40">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold">
            {format(dayOnly, 'EEEE d MMMM yyyy', { locale: fr })}
          </h3>
        </div>
        <div className="p-4 space-y-2">
          {hours.map((hour) => {
            const hourEvents = dayEvents.filter((event) => new Date(event.start).getHours() === hour);
            const slotDate = new Date(dayOnly);
            slotDate.setHours(hour, 0, 0, 0);

            return (
              <div
                key={hour}
                className="flex gap-4 border-b border-slate-100 dark:border-slate-800 pb-2 min-h-[48px] cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/30 rounded px-2 -mx-2"
                onClick={() => onSlotClick?.(slotDate)}
              >
                <div className="w-16 shrink-0 text-sm text-slate-600 dark:text-slate-400">
                  {hour}:00
                </div>
                <div className="flex-1">
                  {hourEvents.map((event) => (
                    <div
                      key={event.id}
                      className="text-sm px-3 py-2 rounded mb-1 cursor-pointer"
                      style={{ backgroundColor: `${getEventColor(event)}20` }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick?.(event);
                      }}
                    >
                      <span className="font-medium">{event.title}</span>
                      <span className="text-slate-500 dark:text-slate-400 ml-2">
                        {format(event.start, 'HH:mm')} - {format(event.end, 'HH:mm')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderAgendaView = () => {
    const sortedEvents = [...events].sort((a, b) => a.start.getTime() - b.start.getTime());

    return (
      <div className="flex-1 overflow-auto bg-white dark:bg-slate-950/40 p-4">
        <div className="space-y-4">
          {sortedEvents.map((event) => (
            <div
              key={event.id}
              className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
              onClick={() => onEventClick?.(event)}
            >
              <div className="flex items-start gap-4">
                <div className="text-center min-w-[60px]">
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    {format(event.start, 'EEE', { locale: fr })}
                  </div>
                  <div className="text-2xl font-bold">{format(event.start, 'd')}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {format(event.start, 'MMM', { locale: fr })}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{event.title}</h3>
                  <div className="flex items-center gap-4 mt-2 text-sm text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {format(event.start, 'HH:mm')} - {format(event.end, 'HH:mm')}
                    </div>
                    {event.location && <div>📍 {event.location}</div>}
                  </div>
                  {event.description && (
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{event.description}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={cn('flex h-screen bg-slate-100 dark:bg-slate-950', className)}>
      {sidebar && !sidebarCollapsed && (
        <div
          className="flex-shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 overflow-y-auto"
          style={{ width: sidebarWidth }}
        >
          {sidebar}
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={goToPrevious}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={goToToday}>
              Aujourd'hui
            </Button>
            <Button variant="outline" size="sm" onClick={goToNext}>
              <ChevronRight className="w-4 h-4" />
            </Button>
            <h2 className="text-lg font-semibold ml-4">
              {view === 'month' && format(currentDate, 'MMMM yyyy', { locale: fr })}
              {view === 'week' &&
                `Semaine du ${format(startOfWeek(currentDate, { locale: fr }), 'd MMM', { locale: fr })}`}
              {view === 'day' && format(currentDate, 'EEEE d MMMM yyyy', { locale: fr })}
              {view === 'agenda' && 'Agenda'}
            </h2>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
            {views.includes('month') && (
              <Button
                variant={view === 'month' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setView('month')}
              >
                <Grid3x3 className="w-4 h-4 mr-2" />
                Mois
              </Button>
            )}
            {views.includes('week') && (
              <Button
                variant={view === 'week' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setView('week')}
              >
                <CalendarIcon className="w-4 h-4 mr-2" />
                Semaine
              </Button>
            )}
            {views.includes('day') && (
              <Button
                variant={view === 'day' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setView('day')}
              >
                <Clock className="w-4 h-4 mr-2" />
                Jour
              </Button>
            )}
            {views.includes('agenda') && (
              <Button
                variant={view === 'agenda' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setView('agenda')}
              >
                <List className="w-4 h-4 mr-2" />
                Agenda
              </Button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-hidden flex">
          {view === 'month' && renderMonthView()}
          {view === 'week' && renderWeekView()}
          {view === 'day' && renderDayView()}
          {view === 'agenda' && renderAgendaView()}

          {detailPanelOpen && detailPanel && (
            <div className="w-96 shrink-0 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-y-auto">
              {detailPanel}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
