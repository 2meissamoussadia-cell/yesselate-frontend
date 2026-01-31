'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/stores';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, Plus, Check, Calendar as CalendarIcon } from 'lucide-react';
import { bureaux } from '@/lib/data';
import type { CalendarEvent } from '@/lib/types/bmo.types';

interface CalendarSidebarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  selectedBureaux: string[];
  onBureauToggle: (bureauCode: string) => void;
  activities: CalendarEvent[];
}

export function CalendarSidebar({
  selectedDate,
  onDateSelect,
  selectedBureaux,
  onBureauToggle,
  activities,
}: CalendarSidebarProps) {
  const { darkMode } = useAppStore();
  const [isBureauxExpanded, setIsBureauxExpanded] = useState(true);

  // Générer le calendrier mensuel
  const monthYear = selectedDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  const firstDayOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
  const lastDayOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startDay = firstDayOfMonth.getDay() === 0 ? 6 : firstDayOfMonth.getDay() - 1; // Lundi = 0

  const prevMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1);
  const nextMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1);

  // Semaine contenant la date sélectionnée
  const selectedWeekStart = new Date(selectedDate);
  selectedWeekStart.setDate(selectedDate.getDate() - (selectedDate.getDay() === 0 ? 6 : selectedDate.getDay() - 1));

  const isDateInSelectedWeek = (date: Date) => {
    const weekStart = new Date(selectedWeekStart);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    return date >= weekStart && date <= weekEnd;
  };

  const getDateAtPosition = (dayIndex: number) => {
    const date = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), dayIndex - startDay);
    // Si on est dans le mois précédent
    if (dayIndex < startDay) {
      date.setMonth(date.getMonth() - 1);
      date.setDate(lastDayOfMonth.getDate() - (startDay - dayIndex - 1));
    }
    // Si on est dans le mois suivant
    if (dayIndex >= startDay + daysInMonth) {
      date.setMonth(date.getMonth() + 1);
      date.setDate(dayIndex - startDay - daysInMonth + 1);
    }
    return date;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  const getActivityCount = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return activities.filter(a => a.date === dateStr).length;
  };

  // Compteur d'activités par bureau
  const bureauActivityCounts = bureaux.map(bureau => {
    const bureauActivities = activities.filter(a => a.bureau === bureau.code);
    return {
      code: bureau.code,
      name: bureau.name,
      count: bureauActivities.length,
    };
  });

  return (
    <div className="w-64 flex-shrink-0 space-y-3">
      {/* Mini calendrier mensuel */}
      <Card>
        <CardContent className="p-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Button
                size="xs"
                variant="ghost"
                onClick={() => onDateSelect(prevMonth)}
                className="h-6 w-6 p-0"
              >
                ←
              </Button>
              <h3 className="text-sm font-semibold capitalize">{monthYear}</h3>
              <Button
                size="xs"
                variant="ghost"
                onClick={() => onDateSelect(nextMonth)}
                className="h-6 w-6 p-0"
              >
                →
              </Button>
            </div>
          </div>

          {/* En-têtes des jours */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, i) => (
              <div
                key={i}
                className="text-center text-[10px] font-semibold text-slate-400"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Grille des jours */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 42 }).map((_, index) => {
              const date = getDateAtPosition(index);
              const dateStr = date.toISOString().split('T')[0];
              const activityCount = getActivityCount(date);
              const inSelectedWeek = isDateInSelectedWeek(date);
              const isSelectedDay = isSelected(date);
              const isTodayDay = isToday(date);

              // Vérifier si le jour est dans le mois actuel
              const isCurrentMonth = date.getMonth() === selectedDate.getMonth();

              return (
                <button
                  key={index}
                  onClick={() => onDateSelect(date)}
                  className={cn(
                    'h-7 rounded text-[10px] font-medium transition-all relative',
                    !isCurrentMonth && 'text-slate-400',
                    isSelectedDay && 'bg-orange-500 text-white font-bold',
                    !isSelectedDay && isTodayDay && 'bg-blue-500/20 text-blue-400 font-semibold',
                    !isSelectedDay && !isTodayDay && inSelectedWeek && 'bg-slate-700/30',
                    !isSelectedDay && !isTodayDay && !inSelectedWeek && darkMode
                      ? 'hover:bg-slate-700/20'
                      : 'hover:bg-gray-100'
                  )}
                >
                  {date.getDate()}
                  {activityCount > 0 && !isSelectedDay && (
                    <span className={cn(
                      'absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full',
                      isCurrentMonth ? 'bg-orange-400' : 'bg-slate-500'
                    )} />
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Ajouter un calendrier */}
      <Button
        variant="outline"
        size="sm"
        className="w-full"
        onClick={() => {
          // TODO: Implémenter ajout de calendrier
        }}
      >
        <Plus className="w-4 h-4 mr-2" />
        Ajouter un calendrier
      </Button>

      {/* Mes calendriers (Bureaux) */}
      <Card>
        <CardContent className="p-3">
          <button
            onClick={() => setIsBureauxExpanded(!isBureauxExpanded)}
            className="w-full flex items-center justify-between mb-2"
          >
            <span className="text-sm font-semibold">Mes Calendriers</span>
            {isBureauxExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronUp className="w-4 h-4" />
            )}
          </button>

          {isBureauxExpanded && (
            <div className="space-y-1">
              {/* Tous les bureaux */}
              <button
                onClick={() => {
                  // Toggle tous
                }}
                className={cn(
                  'w-full flex items-center gap-2 p-2 rounded text-xs transition-all',
                  selectedBureaux.length === bureaux.length
                    ? 'bg-orange-500/20 text-orange-400'
                    : darkMode
                    ? 'hover:bg-slate-700/30'
                    : 'hover:bg-gray-100'
                )}
              >
                <Check className={cn(
                  'w-4 h-4',
                  selectedBureaux.length === bureaux.length ? 'opacity-100' : 'opacity-0'
                )} />
                <CalendarIcon className="w-4 h-4" />
                <span className="flex-1 text-left">Tous les bureaux</span>
                <Badge variant="info" className="text-[9px]">
                  {activities.length}
                </Badge>
              </button>

              {/* Liste des bureaux */}
              {bureauActivityCounts.map((bureau) => {
                const isActive = selectedBureaux.includes(bureau.code);
                return (
                  <button
                    key={bureau.code}
                    onClick={() => onBureauToggle(bureau.code)}
                    className={cn(
                      'w-full flex items-center gap-2 p-2 rounded text-xs transition-all',
                      isActive
                        ? 'bg-orange-500/20 text-orange-400'
                        : darkMode
                        ? 'hover:bg-slate-700/30'
                        : 'hover:bg-gray-100'
                    )}
                  >
                    <Check className={cn(
                      'w-4 h-4',
                      isActive ? 'opacity-100' : 'opacity-0'
                    )} />
                    <div className="w-3 h-3 rounded border-2" style={{
                      borderColor: isActive ? '#f97316' : '#64748b',
                    }} />
                    <span className="flex-1 text-left">{bureau.code}</span>
                    {bureau.count > 0 && (
                      <Badge variant="info" className="text-[9px]">
                        {bureau.count}
                      </Badge>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          <button className="w-full text-left text-xs text-slate-400 mt-2 hover:text-slate-300">
            Afficher tout
          </button>
        </CardContent>
      </Card>
    </div>
  );
}

