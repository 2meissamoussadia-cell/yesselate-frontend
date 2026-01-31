/**
 * Vue Calendrier - Validation BC
 * Calendrier des échéances de validation et paiements planifiés
 */

'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  AlertTriangle,
  FileText,
  DollarSign,
  Eye,
  Filter,
} from 'lucide-react';

// ================================
// Types
// ================================
interface CalendarEvent {
  id: string;
  date: string;
  type: 'validation' | 'payment' | 'deadline' | 'meeting';
  title: string;
  description?: string;
  documentId?: string;
  documentType?: 'bc' | 'facture' | 'avenant';
  montant?: number;
  urgent?: boolean;
  status: 'pending' | 'completed' | 'overdue';
}

type ViewMode = 'month' | 'week' | 'day';

// ================================
// Component
// ================================
export function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    loadEvents();
  }, [currentDate, viewMode]);

  const loadEvents = async () => {
    // Mock events
    const mockEvents: CalendarEvent[] = [
      {
        id: 'ev-1',
        date: '2024-01-20',
        type: 'validation',
        title: 'Validation BC-2024-001',
        description: 'Fourniture équipements électriques - SENELEC',
        documentId: 'BC-2024-001',
        documentType: 'bc',
        montant: 10030000,
        urgent: true,
        status: 'pending',
      },
      {
        id: 'ev-2',
        date: '2024-01-22',
        type: 'validation',
        title: 'Validation FC-2024-015',
        description: 'Travaux construction - EIFFAGE',
        documentId: 'FC-2024-015',
        documentType: 'facture',
        montant: 29500000,
        status: 'pending',
      },
      {
        id: 'ev-3',
        date: '2024-01-18',
        type: 'deadline',
        title: 'Échéance BC-2024-003',
        documentId: 'BC-2024-003',
        urgent: true,
        status: 'overdue',
      },
      {
        id: 'ev-4',
        date: '2024-01-25',
        type: 'payment',
        title: 'Paiement fournisseur ORANGE',
        montant: 5900000,
        status: 'pending',
      },
      {
        id: 'ev-5',
        date: '2024-01-23',
        type: 'meeting',
        title: 'Comité validation mensuel',
        description: 'Revue des documents en attente',
        status: 'pending',
      },
      {
        id: 'ev-6',
        date: '2024-01-19',
        type: 'validation',
        title: 'Validation AV-2024-003',
        documentId: 'AV-2024-003',
        documentType: 'avenant',
        status: 'completed',
      },
    ];

    setEvents(mockEvents);
  };

  // Navigation
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Helpers
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDay = firstDay.getDay();

    return { daysInMonth, startDay, firstDay };
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(event => {
      if (filterType !== 'all' && event.type !== filterType) return false;
      return event.date === dateStr;
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      notation: 'compact',
      compactDisplay: 'short',
      maximumFractionDigits: 1,
    }).format(amount) + ' FCFA';
  };

  const getEventColor = (event: CalendarEvent) => {
    if (event.status === 'overdue') return 'bg-red-500/20 border-red-500 text-red-400';
    if (event.urgent) return 'bg-amber-500/20 border-amber-500 text-amber-400';
    
    switch (event.type) {
      case 'validation':
        return 'bg-blue-500/20 border-blue-500 text-blue-400';
      case 'payment':
        return 'bg-emerald-500/20 border-emerald-500 text-emerald-400';
      case 'deadline':
        return 'bg-purple-500/20 border-purple-500 text-purple-400';
      case 'meeting':
        return 'bg-cyan-500/20 border-cyan-500 text-cyan-400';
      default:
        return 'bg-slate-500/20 border-slate-500 text-slate-400';
    }
  };

  const getEventIcon = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'validation':
        return <FileText className="h-3 w-3" />;
      case 'payment':
        return <DollarSign className="h-3 w-3" />;
      case 'deadline':
        return <Clock className="h-3 w-3" />;
      case 'meeting':
        return <CalendarIcon className="h-3 w-3" />;
      default:
        return null;
    }
  };

  // Render Month View
  const renderMonthView = () => {
    const { daysInMonth, startDay } = getDaysInMonth(currentDate);
    const days = [];
    const weekDays = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

    // Empty cells before first day
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="min-h-[120px] bg-slate-900/20 border border-slate-800" />);
    }

    // Days of month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dayEvents = getEventsForDate(date);
      const isToday = date.toDateString() === new Date().toDateString();
      const isSelected = selectedDate?.toDateString() === date.toDateString();

      days.push(
        <div
          key={day}
          className={cn(
            'min-h-[120px] p-2 border border-slate-800 bg-slate-900/40 hover:bg-slate-800/60 transition-colors cursor-pointer',
            isToday && 'ring-2 ring-blue-500',
            isSelected && 'bg-slate-800/80'
          )}
          onClick={() => setSelectedDate(date)}
        >
          <div className="flex items-center justify-between mb-2">
            <span className={cn(
              'text-sm font-semibold',
              isToday ? 'text-blue-400' : 'text-slate-300'
            )}>
              {day}
            </span>
            {dayEvents.length > 0 && (
              <Badge variant="outline" className="h-5 text-xs bg-slate-800">
                {dayEvents.length}
              </Badge>
            )}
          </div>
          <div className="space-y-1">
            {dayEvents.slice(0, 3).map((event) => (
              <div
                key={event.id}
                className={cn(
                  'text-xs p-1.5 rounded border flex items-center gap-1 truncate',
                  getEventColor(event)
                )}
              >
                {getEventIcon(event.type)}
                <span className="truncate flex-1">{event.title}</span>
              </div>
            ))}
            {dayEvents.length > 3 && (
              <div className="text-xs text-slate-400 pl-1.5">
                +{dayEvents.length - 3} autre{dayEvents.length - 3 > 1 ? 's' : ''}
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {/* Week days header */}
        <div className="grid grid-cols-7 gap-0">
          {weekDays.map((day) => (
            <div key={day} className="text-center text-sm font-semibold text-slate-400 py-2">
              {day}
            </div>
          ))}
        </div>
        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-0 border-t border-l border-slate-800">
          {days}
        </div>
      </div>
    );
  };

  // Render Week View
  const renderWeekView = () => {
    const weekDays = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

    return (
      <div className="space-y-2">
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((dayName, index) => {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + index);
            const dayEvents = getEventsForDate(date);
            const isToday = date.toDateString() === new Date().toDateString();

            return (
              <div key={index} className="space-y-2">
                <div className={cn(
                  'text-center py-2 rounded-lg',
                  isToday ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-900/40 text-slate-300'
                )}>
                  <div className="text-xs font-medium">{dayName}</div>
                  <div className="text-lg font-bold">{date.getDate()}</div>
                </div>
                <div className="space-y-2 min-h-[400px]">
                  {dayEvents.map((event) => (
                    <Card
                      key={event.id}
                      className={cn('cursor-pointer hover:scale-105 transition-transform', getEventColor(event))}
                    >
                      <CardContent className="p-2">
                        <div className="flex items-start gap-2">
                          {getEventIcon(event.type)}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold truncate">{event.title}</p>
                            {event.montant && (
                              <p className="text-xs mt-1">{formatCurrency(event.montant)}</p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render Day View
  const renderDayView = () => {
    const dayEvents = getEventsForDate(currentDate);

    return (
      <div className="space-y-4">
        <div className="text-center py-4 bg-slate-900/40 rounded-lg">
          <div className="text-3xl font-bold text-slate-200">
            {currentDate.getDate()}
          </div>
          <div className="text-slate-400">
            {currentDate.toLocaleDateString('fr-FR', { weekday: 'long', month: 'long', year: 'numeric' })}
          </div>
        </div>

        {dayEvents.length > 0 ? (
          <div className="space-y-3">
            {dayEvents.map((event) => (
              <Card key={event.id} className={cn('border-l-4', getEventColor(event))}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getEventIcon(event.type)}
                        <h3 className="font-semibold text-slate-200">{event.title}</h3>
                        {event.urgent && (
                          <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/30">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Urgent
                          </Badge>
                        )}
                      </div>
                      {event.description && (
                        <p className="text-sm text-slate-400 mb-2">{event.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm">
                        {event.documentId && (
                          <span className="text-blue-400 font-medium">{event.documentId}</span>
                        )}
                        {event.montant && (
                          <span className="text-emerald-400 font-medium">
                            {formatCurrency(event.montant)}
                          </span>
                        )}
                        <Badge variant="outline" className={cn('capitalize', getEventColor(event))}>
                          {event.status === 'pending' ? 'En attente' : event.status === 'completed' ? 'Complété' : 'En retard'}
                        </Badge>
                      </div>
                    </div>
                    {event.documentId && (
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        Voir
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-slate-400">
            <CalendarIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Aucun événement pour cette journée</p>
          </div>
        )}
      </div>
    );
  };

  const monthName = currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

  return (
    <div className="h-full flex flex-col p-6">
      {/* Header */}
      <div className="flex-shrink-0 space-y-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-200 capitalize">{monthName}</h1>
            <p className="text-slate-400 mt-1">Échéances de validation et paiements</p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px] bg-slate-900 border-slate-700">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Tous les types" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-700">
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="validation">Validations</SelectItem>
                <SelectItem value="payment">Paiements</SelectItem>
                <SelectItem value="deadline">Échéances</SelectItem>
                <SelectItem value="meeting">Réunions</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={goToToday}>
              Aujourd'hui
            </Button>
            <Button variant="outline" size="sm" onClick={goToNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'month' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('month')}
            >
              Mois
            </Button>
            <Button
              variant={viewMode === 'week' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('week')}
            >
              Semaine
            </Button>
            <Button
              variant={viewMode === 'day' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('day')}
            >
              Jour
            </Button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-sm flex-wrap">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-blue-500" />
            <span className="text-slate-400">Validation</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-emerald-500" />
            <span className="text-slate-400">Paiement</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-purple-500" />
            <span className="text-slate-400">Échéance</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-cyan-500" />
            <span className="text-slate-400">Réunion</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-red-500" />
            <span className="text-slate-400">En retard</span>
          </div>
        </div>
      </div>

      {/* Calendar Content */}
      <div className="flex-1 overflow-auto">
        {viewMode === 'month' && renderMonthView()}
        {viewMode === 'week' && renderWeekView()}
        {viewMode === 'day' && renderDayView()}
      </div>
    </div>
  );
}

