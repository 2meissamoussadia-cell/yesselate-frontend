'use client';

import { useState, useMemo } from 'react';
import { cn } from '@/lib/cn';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, CheckCircle, AlertTriangle, Calendar, Clock } from 'lucide-react';
import { BureauTag } from '@/components/features/bmo/BureauTag';
import type { CalendarEvent } from '@/lib/types/bmo.types';
import { plannedAbsences } from '@/lib/data';

interface RescheduleSimulatorProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (newDate: string, newTime: string) => void;
  activity: CalendarEvent;
  allActivities: CalendarEvent[];
}

export function RescheduleSimulator({
  isOpen,
  onClose,
  onConfirm,
  activity,
  allActivities,
}: RescheduleSimulatorProps) {
  const { darkMode } = useAppStore();
  const { addToast } = useBMOStore();
  interface Slot {
    date: string;
    time: string;
    conflicts: Array<{ type: string; description: string; severity: string }>;
    score: number;
  }
  
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);

  // Générer des créneaux alternatifs (7 jours suivants, heures de travail)
  const alternativeSlots = useMemo(() => {
    const slots: Array<{
      date: string;
      time: string;
      conflicts: Array<{ type: string; description: string; severity: string }>;
      score: number; // Score de qualité du créneau (0-100)
    }> = [];

    const workHours = ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];
    const today = new Date();
    
    // Générer créneaux pour 7 jours suivants
    for (let day = 1; day <= 7; day++) {
      const date = new Date(today);
      date.setDate(today.getDate() + day);
      const dateStr = date.toISOString().split('T')[0];

      workHours.forEach((time) => {
        const conflicts: Array<{ type: string; description: string; severity: string }> = [];
        let score = 100;

        // 1. Vérifier chevauchement avec autres activités
        const overlapping = allActivities.filter(a =>
          a.id !== activity.id &&
          a.date === dateStr &&
          a.bureau === activity.bureau &&
          a.time &&
          Math.abs(parseInt(a.time.split(':')[0]) - parseInt(time.split(':')[0])) < 2
        );
        if (overlapping.length > 0) {
          conflicts.push({
            type: 'overlap',
            description: `${overlapping.length} activité(s) au même moment`,
            severity: 'high',
          });
          score -= 30;
        }

        // 2. Vérifier surcharge du bureau ce jour
        const sameDayCount = allActivities.filter(a =>
          a.id !== activity.id &&
          a.date === dateStr &&
          a.bureau === activity.bureau
        ).length;
        if (sameDayCount >= 3) {
          conflicts.push({
            type: 'overload',
            description: `${sameDayCount} activités déjà planifiées`,
            severity: sameDayCount >= 5 ? 'critical' : 'high',
          });
          score -= 20;
        }

        // 3. Vérifier absences des participants
        if (activity.participants) {
          const absentParticipants = activity.participants.filter(p => {
            const absence = plannedAbsences.find(a =>
              a.bureau === p.bureau &&
              a.employeeName.includes(p.name.split(' ')[0]) &&
              new Date(a.startDate.split('/').reverse().join('-')) <= new Date(dateStr) &&
              new Date(a.endDate.split('/').reverse().join('-')) >= new Date(dateStr)
            );
            return absence;
          });
          if (absentParticipants.length > 0) {
            conflicts.push({
              type: 'absence',
              description: `${absentParticipants.length} participant(s) absent(s)`,
              severity: absentParticipants.length === activity.participants.length ? 'critical' : 'high',
            });
            score -= 40;
          }
        }

        // 4. Vérifier dépendances
        if (activity.dependencies && activity.dependencies.length > 0) {
          const unmetDeps = activity.dependencies.filter(depId => {
            const depActivity = allActivities.find(a => a.id === depId);
            if (!depActivity) return true;
            const depDate = new Date(depActivity.date);
            const actDate = new Date(dateStr);
            return depDate > actDate || depActivity.status === 'cancelled';
          });
          if (unmetDeps.length > 0) {
            conflicts.push({
              type: 'dependency',
              description: `${unmetDeps.length} dépendance(s) non respectée(s)`,
              severity: 'critical',
            });
            score -= 50;
          }
        }

        // 5. Vérifier projet simultané
        if (activity.project) {
          const sameProjectSameDay = allActivities.filter(a =>
            a.id !== activity.id &&
            a.project === activity.project &&
            a.date === dateStr
          );
          if (sameProjectSameDay.length > 0) {
            conflicts.push({
              type: 'resource',
              description: `${sameProjectSameDay.length} autre(s) activité(s) sur ce projet`,
              severity: 'medium',
            });
            score -= 10;
          }
        }

        slots.push({
          date: dateStr,
          time,
          conflicts,
          score: Math.max(0, score),
        });
      });
    }

    // Trier par score décroissant (meilleurs créneaux en premier)
    return slots.sort((a, b) => b.score - a.score).slice(0, 20); // Top 20
  }, [activity, allActivities]);

  const handleConfirm = () => {
    if (!selectedSlot) {
      addToast('Veuillez sélectionner un créneau', 'error');
      return;
    }

    const criticalConflicts = selectedSlot.conflicts?.filter((c: { severity: string }) => c.severity === 'critical') || [];
    if (criticalConflicts.length > 0) {
      const proceed = window.confirm(
        `${criticalConflicts.length} conflit(s) critique(s) détecté(s) pour ce créneau. Voulez-vous continuer ?`
      );
      if (!proceed) return;
    }

    onConfirm(selectedSlot.date, selectedSlot.time);
  };

  const formatDateDisplay = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
        onClick={onClose}
      />
      <div
        className={cn(
          'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[101]',
          'w-full max-w-3xl max-h-[90vh] overflow-y-auto',
          darkMode ? 'bg-slate-900' : 'bg-white',
          'rounded-xl shadow-2xl border'
        )}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Calendar className="w-5 h-5 text-orange-400" />
                Simulateur de replanification
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                {activity.title}
              </p>
            </div>
            <button
              onClick={onClose}
              className={cn(
                'p-2 rounded-lg transition-colors',
                darkMode ? 'hover:bg-slate-800' : 'hover:bg-gray-100'
              )}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Info activité actuelle */}
          <div className="mb-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
            <div className="flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400">Actuellement planifié :</span>
                <span className="font-semibold ml-2">{activity.date} à {activity.time}</span>
              </div>
              {activity.bureau && <BureauTag bureau={activity.bureau} />}
            </div>
          </div>

          {/* Créneaux recommandés */}
          <div className="mb-4">
            <h3 className="text-sm font-semibold mb-3">Créneaux alternatifs recommandés</h3>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {alternativeSlots.map((slot, i) => {
                const isSelected = selectedSlot?.date === slot.date && selectedSlot?.time === slot.time;
                const hasCriticalConflict = slot.conflicts.some((c: { severity: string }) => c.severity === 'critical');
                const quality = slot.score >= 80 ? 'excellent' : slot.score >= 60 ? 'good' : slot.score >= 40 ? 'fair' : 'poor';

                return (
                  <div
                    key={i}
                    onClick={() => setSelectedSlot(slot)}
                    className={cn(
                      'p-3 rounded-lg border cursor-pointer transition-all',
                      isSelected
                        ? 'border-orange-500 bg-orange-500/10'
                        : darkMode
                        ? 'bg-slate-700/30 border-slate-600 hover:border-slate-500'
                        : 'bg-gray-50 border-gray-200 hover:border-gray-300',
                      hasCriticalConflict && 'border-red-500/50'
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="text-center">
                          <p className="text-xs font-bold">{formatDateDisplay(slot.date)}</p>
                          <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                            <Clock className="w-3 h-3" />
                            {slot.time}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {slot.conflicts.length === 0 ? (
                            <Badge variant="success" className="text-[9px]">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Disponible
                            </Badge>
                          ) : (
                            <Badge
                              variant={hasCriticalConflict ? 'urgent' : 'warning'}
                              className="text-[9px]"
                            >
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              {slot.conflicts.length} conflit(s)
                            </Badge>
                          )}
                          <Badge
                            variant={
                              quality === 'excellent'
                                ? 'success'
                                : quality === 'good'
                                ? 'info'
                                : quality === 'fair'
                                ? 'warning'
                                : 'urgent'
                            }
                            className="text-[9px]"
                          >
                            Score: {slot.score}%
                          </Badge>
                        </div>
                      </div>
                      {isSelected && (
                        <CheckCircle className="w-5 h-5 text-orange-400" />
                      )}
                    </div>

                    {slot.conflicts.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-slate-700/30">
                        <ul className="space-y-1">
                          {slot.conflicts.map((conflict: { type: string; description: string; severity: string }, ci: number) => (
                            <li key={`conflict-${i}-${ci}`} className="text-xs flex items-center gap-2">
                              <Badge
                                variant={conflict.severity === 'critical' ? 'urgent' : conflict.severity === 'high' ? 'warning' : 'info'}
                                className="text-[8px]"
                              >
                                {conflict.type}
                              </Badge>
                              <span className="text-slate-400">{conflict.description}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 pt-4 border-t border-slate-700/30">
            <Button variant="ghost" onClick={onClose} className="flex-1">
              Annuler
            </Button>
            <Button
              onClick={handleConfirm}
              variant="warning"
              className="flex-1"
              disabled={!selectedSlot}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Confirmer la replanification
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

