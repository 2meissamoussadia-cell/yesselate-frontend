'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/cn';
import { demandesRH } from '@/lib/data/bmo-mock-2';
import { 
  ChevronLeft, ChevronRight, Calendar, Users, AlertTriangle,
  Filter, Download, Eye, X
} from 'lucide-react';

// ============================================
// TYPES
// ============================================

type AbsenceEvent = {
  id: string;
  agent: string;
  agentId: string;
  bureau: string;
  type: 'Congé' | 'Maladie' | 'Déplacement';
  startDate: Date;
  endDate: Date;
  status: 'pending' | 'validated' | 'rejected';
  days: number;
};

type DayCell = {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isWeekend: boolean;
  absences: AbsenceEvent[];
};

// ============================================
// CONSTANTES
// ============================================

const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

const TYPE_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  Congé: { bg: 'bg-emerald-500/20', border: 'border-emerald-500/50', text: 'text-emerald-600' },
  Maladie: { bg: 'bg-red-500/20', border: 'border-red-500/50', text: 'text-red-600' },
  Déplacement: { bg: 'bg-blue-500/20', border: 'border-blue-500/50', text: 'text-blue-600' },
};

const BUREAU_COLORS: Record<string, string> = {
  BA: 'bg-orange-500',
  BM: 'bg-teal-500',
  BCT: 'bg-purple-500',
  BJ: 'bg-pink-500',
  BF: 'bg-indigo-500',
};

// ============================================
// HELPERS
// ============================================

function parseDate(dateStr: string): Date {
  const [day, month, year] = dateStr.split('/').map(Number);
  return new Date(year, month - 1, day);
}

function isSameDay(date1: Date, date2: Date): boolean {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
}

function isDateInRange(date: Date, start: Date, end: Date): boolean {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const s = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const e = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  return d >= s && d <= e;
}

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

export function RHAbsenceCalendar() {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedBureaux, setSelectedBureaux] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [showPending, setShowPending] = useState(true);
  const [showValidated, setShowValidated] = useState(true);
  const [selectedDay, setSelectedDay] = useState<DayCell | null>(null);

  // Convertir les demandes en événements d'absence
  const absenceEvents = useMemo<AbsenceEvent[]>(() => {
    return demandesRH
      .filter(d => 
        (d.type === 'Congé' || d.type === 'Maladie' || d.type === 'Déplacement') &&
        d.startDate && d.endDate &&
        (d.status === 'pending' || d.status === 'validated')
      )
      .map(d => ({
        id: d.id,
        agent: d.agent,
        agentId: d.agentId || '',
        bureau: d.bureau,
        type: d.type as 'Congé' | 'Maladie' | 'Déplacement',
        startDate: parseDate(d.startDate!),
        endDate: parseDate(d.endDate!),
        status: d.status as 'pending' | 'validated',
        days: d.days || 1,
      }));
  }, []);

  // Filtrer les événements
  const filteredEvents = useMemo(() => {
    return absenceEvents.filter(e => {
      if (selectedBureaux.length > 0 && !selectedBureaux.includes(e.bureau)) return false;
      if (selectedTypes.length > 0 && !selectedTypes.includes(e.type)) return false;
      if (!showPending && e.status === 'pending') return false;
      if (!showValidated && e.status === 'validated') return false;
      return true;
    });
  }, [absenceEvents, selectedBureaux, selectedTypes, showPending, showValidated]);

  // Générer les cellules du calendrier
  const calendarCells = useMemo<DayCell[]>(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // Ajuster pour commencer le lundi (1) au lieu du dimanche (0)
    let startDayOfWeek = firstDay.getDay() - 1;
    if (startDayOfWeek < 0) startDayOfWeek = 6;
    
    const cells: DayCell[] = [];
    
    // Jours du mois précédent
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthLastDay - i);
      cells.push({
        date,
        isCurrentMonth: false,
        isToday: isSameDay(date, today),
        isWeekend: date.getDay() === 0 || date.getDay() === 6,
        absences: filteredEvents.filter(e => isDateInRange(date, e.startDate, e.endDate)),
      });
    }
    
    // Jours du mois courant
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      cells.push({
        date,
        isCurrentMonth: true,
        isToday: isSameDay(date, today),
        isWeekend: date.getDay() === 0 || date.getDay() === 6,
        absences: filteredEvents.filter(e => isDateInRange(date, e.startDate, e.endDate)),
      });
    }
    
    // Jours du mois suivant pour compléter la grille
    const remainingCells = 42 - cells.length; // 6 semaines x 7 jours
    for (let i = 1; i <= remainingCells; i++) {
      const date = new Date(year, month + 1, i);
      cells.push({
        date,
        isCurrentMonth: false,
        isToday: isSameDay(date, today),
        isWeekend: date.getDay() === 0 || date.getDay() === 6,
        absences: filteredEvents.filter(e => isDateInRange(date, e.startDate, e.endDate)),
      });
    }
    
    return cells;
  }, [currentDate, filteredEvents, today]);

  // Navigation
  const goToPrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
  };

  // Statistiques du mois
  const monthStats = useMemo(() => {
    const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    
    const monthEvents = filteredEvents.filter(e => 
      (e.startDate <= monthEnd && e.endDate >= monthStart)
    );
    
    const uniqueAgents = new Set(monthEvents.map(e => e.agentId)).size;
    const totalDays = monthEvents.reduce((sum, e) => sum + e.days, 0);
    const pendingCount = monthEvents.filter(e => e.status === 'pending').length;
    
    // Jours avec conflits (>2 absences)
    const conflictDays = calendarCells.filter(c => 
      c.isCurrentMonth && c.absences.length >= 2
    ).length;
    
    return { total: monthEvents.length, uniqueAgents, totalDays, pendingCount, conflictDays };
  }, [filteredEvents, currentDate, calendarCells]);

  // Toggle filtres
  const toggleBureau = (bureau: string) => {
    setSelectedBureaux(prev => 
      prev.includes(bureau) ? prev.filter(b => b !== bureau) : [...prev, bureau]
    );
  };

  const toggleType = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const bureaux = [...new Set(absenceEvents.map(e => e.bureau))];

  return (
    <div className="space-y-4">
      {/* En-tête et navigation */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={goToPrevMonth}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <h2 className="text-xl font-bold min-w-[200px] text-center">
              {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            
            <button
              onClick={goToNextMonth}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          
          <Button variant="secondary" size="sm" onClick={goToToday}>
            Aujourd&apos;hui
          </Button>
        </div>

        {/* Statistiques du mois */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800">
            <Users className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-medium">{monthStats.uniqueAgents} agents</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10">
            <Calendar className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">{monthStats.totalDays} jours</span>
          </div>
          {monthStats.pendingCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10">
              <span className="text-sm font-medium text-amber-600 dark:text-amber-400">{monthStats.pendingCount} en attente</span>
            </div>
          )}
          {monthStats.conflictDays > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span className="text-sm font-medium text-red-600 dark:text-red-400">{monthStats.conflictDays} conflits</span>
            </div>
          )}
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-medium">Filtres:</span>
        </div>

        {/* Bureaux */}
        <div className="flex items-center gap-1">
          {bureaux.map(bureau => (
            <button
              key={bureau}
              onClick={() => toggleBureau(bureau)}
              className={cn(
                "px-2 py-1 rounded-lg text-xs font-semibold transition-all",
                selectedBureaux.includes(bureau) || selectedBureaux.length === 0
                  ? `${BUREAU_COLORS[bureau]} text-white`
                  : "bg-slate-200 dark:bg-slate-700 text-slate-400"
              )}
            >
              {bureau}
            </button>
          ))}
        </div>

        <div className="w-px h-6 bg-slate-300 dark:bg-slate-600" />

        {/* Types */}
        <div className="flex items-center gap-1">
          {(['Congé', 'Maladie', 'Déplacement'] as const).map(type => {
            const colors = TYPE_COLORS[type];
            const isActive = selectedTypes.includes(type) || selectedTypes.length === 0;
            return (
              <button
                key={type}
                onClick={() => toggleType(type)}
                className={cn(
                  "px-2 py-1 rounded-lg text-xs font-medium transition-all border",
                  isActive
                    ? `${colors.bg} ${colors.border} ${colors.text}`
                    : "bg-slate-200 dark:bg-slate-700 border-transparent text-slate-400"
                )}
              >
                {type}
              </button>
            );
          })}
        </div>

        <div className="w-px h-6 bg-slate-300 dark:bg-slate-600" />

        {/* Statuts */}
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 text-xs cursor-pointer">
            <input
              type="checkbox"
              checked={showValidated}
              onChange={e => setShowValidated(e.target.checked)}
              className="w-3.5 h-3.5 rounded accent-emerald-500"
            />
            <span>Validées</span>
          </label>
          <label className="flex items-center gap-1.5 text-xs cursor-pointer">
            <input
              type="checkbox"
              checked={showPending}
              onChange={e => setShowPending(e.target.checked)}
              className="w-3.5 h-3.5 rounded accent-amber-500"
            />
            <span>En attente</span>
          </label>
        </div>

        {(selectedBureaux.length > 0 || selectedTypes.length > 0) && (
          <button
            onClick={() => { setSelectedBureaux([]); setSelectedTypes([]); }}
            className="px-2 py-1 rounded-lg text-xs text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
          >
            Réinitialiser
          </button>
        )}
      </div>

      {/* Calendrier */}
      <Card>
        <CardContent className="p-4">
          {/* En-têtes des jours */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAYS.map(day => (
              <div
                key={day}
                className="text-center text-xs font-semibold text-slate-400 py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Grille des jours */}
          <div className="grid grid-cols-7 gap-1">
            {calendarCells.map((cell, idx) => {
              const hasConflict = cell.absences.length >= 2;
              const hasPending = cell.absences.some(a => a.status === 'pending');
              
              return (
                <button
                  key={idx}
                  onClick={() => cell.absences.length > 0 && setSelectedDay(cell)}
                  className={cn(
                    "relative min-h-[80px] p-1 rounded-lg border transition-all text-left",
                    cell.isCurrentMonth
                      ? "bg-white dark:bg-slate-900"
                      : "bg-slate-50 dark:bg-slate-800/30 opacity-50",
                    cell.isToday && "ring-2 ring-orange-500",
                    cell.isWeekend && cell.isCurrentMonth && "bg-slate-50 dark:bg-slate-800/50",
                    hasConflict && "border-red-500/50",
                    !hasConflict && cell.absences.length > 0 && "border-blue-500/30",
                    cell.absences.length === 0 && "border-slate-200 dark:border-slate-700",
                    cell.absences.length > 0 && "cursor-pointer hover:border-orange-500"
                  )}
                >
                  {/* Numéro du jour */}
                  <div className={cn(
                    "text-xs font-medium mb-1",
                    cell.isToday && "text-orange-500 font-bold",
                    cell.isWeekend && "text-slate-400"
                  )}>
                    {cell.date.getDate()}
                  </div>

                  {/* Indicateurs d'absence */}
                  {cell.absences.length > 0 && (
                    <div className="space-y-0.5">
                      {cell.absences.slice(0, 3).map(absence => {
                        const colors = TYPE_COLORS[absence.type];
                        return (
                          <div
                            key={absence.id}
                            className={cn(
                              "text-[10px] px-1 py-0.5 rounded truncate border",
                              colors.bg, colors.border,
                              absence.status === 'pending' && "opacity-70 border-dashed"
                            )}
                            title={`${absence.agent} - ${absence.type}`}
                          >
                            {absence.agent.split(' ')[0]}
                          </div>
                        );
                      })}
                      {cell.absences.length > 3 && (
                        <div className="text-[10px] text-slate-400 text-center">
                          +{cell.absences.length - 3}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Badge conflit */}
                  {hasConflict && (
                    <div className="absolute top-1 right-1">
                      <AlertTriangle className="w-3 h-3 text-red-500" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Légende */}
      <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-emerald-500/30 border border-emerald-500/50" />
          <span>Congé</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-red-500/30 border border-red-500/50" />
          <span>Maladie</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-blue-500/30 border border-blue-500/50" />
          <span>Déplacement</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded border-2 border-dashed border-slate-400" />
          <span>En attente</span>
        </div>
        <div className="flex items-center gap-1.5">
          <AlertTriangle className="w-3 h-3 text-red-500" />
          <span>Conflit (≥2)</span>
        </div>
      </div>

      {/* Modal détails du jour */}
      {selectedDay && (
        <div 
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setSelectedDay(null)}
        >
          <div 
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <h3 className="font-semibold">
                  {selectedDay.date.toLocaleDateString('fr-FR', { 
                    weekday: 'long', 
                    day: 'numeric', 
                    month: 'long' 
                  })}
                </h3>
                <p className="text-sm text-slate-400">
                  {selectedDay.absences.length} absence{selectedDay.absences.length > 1 ? 's' : ''}
                </p>
              </div>
              <button
                onClick={() => setSelectedDay(null)}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
              {selectedDay.absences.map(absence => {
                const colors = TYPE_COLORS[absence.type];
                return (
                  <div
                    key={absence.id}
                    className={cn(
                      "p-3 rounded-xl border",
                      colors.bg, colors.border
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">{absence.agent}</span>
                      <Badge 
                        variant={absence.status === 'validated' ? 'success' : 'warning'}
                        className="text-xs"
                      >
                        {absence.status === 'validated' ? '✓ Validé' : '⏳ En attente'}
                      </Badge>
                    </div>
                    <div className="text-sm space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">Type:</span>
                        <span className={colors.text}>{absence.type}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">Bureau:</span>
                        <span className={cn(
                          "px-1.5 py-0.5 rounded text-xs text-white",
                          BUREAU_COLORS[absence.bureau]
                        )}>
                          {absence.bureau}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">Période:</span>
                        <span>
                          {absence.startDate.toLocaleDateString('fr-FR')} → {absence.endDate.toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">Durée:</span>
                        <span>{absence.days} jour{absence.days > 1 ? 's' : ''}</span>
                      </div>
                    </div>
                    <button className="mt-2 text-xs text-orange-500 hover:text-orange-600 font-medium">
                      Voir la demande {absence.id} →
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

