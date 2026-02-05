'use client';

/**
 * Calendrier Interactif - Vue calendrier complète avec navigation
 * Supporte les vues jour, semaine, mois
 */

import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/cn';
import type { EcheanceOperationnelle } from '@/lib/types/calendrier.types';

interface CalendrierInteractifProps {
  echeances: EcheanceOperationnelle[];
  onDateClick?: (date: Date) => void;
  onEventClick?: (echeance: EcheanceOperationnelle) => void;
  onCreateEvent?: (date: Date) => void;
  periode?: 'jour' | 'semaine' | 'mois';
  onPeriodeChange?: (periode: 'jour' | 'semaine' | 'mois') => void;
}

const JOURS_SEMAINE = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const MOIS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

export function CalendrierInteractif({
  echeances,
  onDateClick,
  onEventClick,
  onCreateEvent,
  periode = 'mois',
  onPeriodeChange,
}: CalendrierInteractifProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Navigation
  const goToPrevious = () => {
    const newDate = new Date(currentDate);
    if (periode === 'mois') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else if (periode === 'semaine') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() - 1);
    }
    setCurrentDate(newDate);
  };

  const goToNext = () => {
    const newDate = new Date(currentDate);
    if (periode === 'mois') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else if (periode === 'semaine') {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  // Générer les jours selon la période
  const days = useMemo(() => {
    const result: Date[] = [];
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const day = currentDate.getDate();

    if (periode === 'jour') {
      result.push(new Date(year, month, day));
    } else if (periode === 'semaine') {
      const startOfWeek = new Date(year, month, day);
      const dayOfWeek = startOfWeek.getDay();
      const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Lundi = 0
      startOfWeek.setDate(startOfWeek.getDate() - diff);
      
      for (let i = 0; i < 7; i++) {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + i);
        result.push(date);
      }
    } else {
      // Mois
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
  }, [currentDate, periode]);

  // Grouper les échéances par date
  const echeancesByDate = useMemo(() => {
    const grouped: Record<string, EcheanceOperationnelle[]> = {};
    days.forEach(day => {
      const dateStr = day.toISOString().split('T')[0];
      grouped[dateStr] = echeances.filter(e => {
        const echeanceDate = new Date(e.date).toISOString().split('T')[0];
        return echeanceDate === dateStr;
      });
    });
    return grouped;
  }, [days, echeances]);

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const getCriticiteColor = (criticite: string) => {
    switch (criticite) {
      case 'critique':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'majeur':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'mineur':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    onDateClick?.(date);
  };

  const handleEventClick = (echeance: EcheanceOperationnelle, e: React.MouseEvent) => {
    e.stopPropagation();
    onEventClick?.(echeance);
  };

  const handleCreateEvent = (date: Date, e: React.MouseEvent) => {
    e.stopPropagation();
    onCreateEvent?.(date);
  };

  return (
    <div className="space-y-4">
      {/* Header avec navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToPrevious}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={goToToday}>
            Aujourd'hui
          </Button>
          <Button variant="outline" size="sm" onClick={goToNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <div className="ml-4 text-lg font-semibold text-slate-200">
            {periode === 'mois' && `${MOIS[currentDate.getMonth()]} ${currentDate.getFullYear()}`}
            {periode === 'semaine' && `Semaine du ${days[0]?.toLocaleDateString('fr-FR')}`}
            {periode === 'jour' && currentDate.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {onPeriodeChange && (
            <>
              <Button
                variant={periode === 'jour' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onPeriodeChange('jour')}
              >
                Jour
              </Button>
              <Button
                variant={periode === 'semaine' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onPeriodeChange('semaine')}
              >
                Semaine
              </Button>
              <Button
                variant={periode === 'mois' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onPeriodeChange('mois')}
              >
                Mois
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Calendrier */}
      {periode === 'mois' && (
        <div className="border border-slate-700 rounded-lg overflow-hidden bg-slate-800/50">
          {/* En-têtes des jours */}
          <div className="grid grid-cols-7 border-b border-slate-700 bg-slate-900/50">
            {JOURS_SEMAINE.map((day) => (
              <div
                key={day}
                className="py-2 text-center text-xs font-semibold text-slate-400 uppercase"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Grille des jours */}
          <div className="grid grid-cols-7">
            {days.map((day, idx) => {
              const dateStr = day.toISOString().split('T')[0];
              const dayEcheances = echeancesByDate[dateStr] || [];
              const isCurrent = isCurrentMonth(day);
              const isSelected = selectedDate && day.toDateString() === selectedDate.toDateString();

              return (
                <div
                  key={idx}
                  onClick={() => handleDateClick(day)}
                  className={cn(
                    'min-h-[120px] p-2 border-r border-b border-slate-700/50 cursor-pointer transition-colors',
                    !isCurrent && 'bg-slate-900/30 opacity-60',
                    isCurrent && 'bg-slate-800/20 hover:bg-slate-800/40',
                    isToday(day) && 'bg-blue-500/10 ring-1 ring-blue-500/30',
                    isSelected && 'ring-2 ring-blue-500/50 ring-inset'
                  )}
                >
                  {/* Numéro du jour */}
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={cn(
                        'text-sm font-medium',
                        isToday(day) && 'text-blue-400 font-bold',
                        !isCurrent && 'text-slate-400',
                        isCurrent && !isToday(day) && 'text-slate-300'
                      )}
                    >
                      {day.getDate()}
                    </span>
                    {dayEcheances.length > 0 && (
                      <Badge className="h-5 min-w-5 px-1 text-xs bg-slate-700 text-slate-300">
                        {dayEcheances.length}
                      </Badge>
                    )}
                  </div>

                  {/* Échéances */}
                  <div className="space-y-1">
                    {dayEcheances.slice(0, 3).map((echeance) => (
                      <div
                        key={echeance.id}
                        onClick={(e) => handleEventClick(echeance, e)}
                        className={cn(
                          'text-xs p-1 rounded border cursor-pointer hover:opacity-80 transition-opacity',
                          getCriticiteColor(echeance.criticite)
                        )}
                      >
                        <div className="truncate font-medium">{echeance.elementLabel}</div>
                        <div className="text-[10px] opacity-75 truncate">{echeance.type}</div>
                      </div>
                    ))}
                    {dayEcheances.length > 3 && (
                      <div className="text-xs text-slate-400 text-center">
                        +{dayEcheances.length - 3} autre{dayEcheances.length - 3 > 1 ? 's' : ''}
                      </div>
                    )}
                  </div>

                  {/* Bouton créer événement */}
                  {isCurrent && (
                    <button
                      onClick={(e) => handleCreateEvent(day, e)}
                      className="mt-1 w-full opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity"
                    >
                      <Plus className="h-3 w-3 text-slate-400 hover:text-blue-400" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {periode === 'semaine' && (
        <div className="border border-slate-700 rounded-lg overflow-hidden bg-slate-800/50">
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, idx) => {
              const dateStr = day.toISOString().split('T')[0];
              const dayEcheances = echeancesByDate[dateStr] || [];
              const isSelected = selectedDate && day.toDateString() === selectedDate.toDateString();

              return (
                <div
                  key={idx}
                  className={cn(
                    'min-h-[400px] p-3 border-r border-slate-700/50',
                    idx === 6 && 'border-r-0',
                    isToday(day) && 'bg-blue-500/10',
                    isSelected && 'ring-2 ring-blue-500/50'
                  )}
                >
                  <div
                    onClick={() => handleDateClick(day)}
                    className="mb-2 pb-2 border-b border-slate-700 cursor-pointer"
                  >
                    <div className="text-xs text-slate-400 uppercase">{JOURS_SEMAINE[idx]}</div>
                    <div
                      className={cn(
                        'text-lg font-semibold',
                        isToday(day) ? 'text-blue-400' : 'text-slate-200'
                      )}
                    >
                      {day.getDate()}
                    </div>
                  </div>
                  <div className="space-y-2">
                    {dayEcheances.map((echeance) => (
                      <div
                        key={echeance.id}
                        onClick={(e) => handleEventClick(echeance, e)}
                        className={cn(
                          'p-2 rounded border cursor-pointer hover:opacity-80 transition-opacity text-xs',
                          getCriticiteColor(echeance.criticite)
                        )}
                      >
                        <div className="font-medium truncate">{echeance.elementLabel}</div>
                        <div className="text-[10px] opacity-75">{echeance.type}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {periode === 'jour' && (
        <div className="border border-slate-700 rounded-lg overflow-hidden bg-slate-800/50">
          <div className="p-4">
            <div className="mb-4">
              <div className="text-sm text-slate-400 uppercase">
                {currentDate.toLocaleDateString('fr-FR', { weekday: 'long' })}
              </div>
              <div className="text-2xl font-semibold text-slate-200">
                {currentDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
            </div>
            <div className="space-y-2">
              {echeancesByDate[days[0]?.toISOString().split('T')[0]]?.map((echeance) => (
                <div
                  key={echeance.id}
                  onClick={() => onEventClick?.(echeance)}
                  className={cn(
                    'p-3 rounded border cursor-pointer hover:opacity-80 transition-opacity',
                    getCriticiteColor(echeance.criticite)
                  )}
                >
                  <div className="font-medium">{echeance.elementLabel}</div>
                  <div className="text-xs opacity-75 mt-1">{echeance.type} • {echeance.moduleSource}</div>
                  <div className="text-xs opacity-75">
                    {new Date(echeance.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))}
              {(!echeancesByDate[days[0]?.toISOString().split('T')[0]] || echeancesByDate[days[0]?.toISOString().split('T')[0]].length === 0) && (
                <div className="text-center py-8 text-slate-400 text-sm">
                  Aucune échéance ce jour
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

