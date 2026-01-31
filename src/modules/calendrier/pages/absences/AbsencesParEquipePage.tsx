/**
 * Page Absences - Par équipe
 */

'use client';

import React, { useState, useMemo } from 'react';
import { CalendarHeader } from '../../components/CalendarHeader';
import { useAbsences, useCalendrierData } from '../../hooks/useCalendrierData';
import { useCalendrierFilters } from '../../hooks/useCalendrierFilters';
import { UserMinus, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function AbsencesParEquipePage() {
  const { periode, vue, chantierId, equipeId, dateDebut, dateFin } = useCalendrierFilters();
  // Mémoriser les filtres pour éviter les re-renders infinis
  const filters = React.useMemo(() => ({
    periode,
    vue,
    chantier_id: chantierId || undefined,
    equipe_id: equipeId || undefined,
    date_debut: dateDebut || undefined,
    date_fin: dateFin || undefined,
  }), [periode, vue, chantierId, equipeId, dateDebut, dateFin]);
  const { data: calendrierData } = useCalendrierData(filters);
  const [selectedEquipeId, setSelectedEquipeId] = useState<number | null>(null);
  const { absences, loading, error } = useAbsences(
    selectedEquipeId ? { equipe_id: selectedEquipeId } : undefined
  );

  // Extraire les équipes uniques depuis les absences
  const equipes = useMemo(() => {
    const equipesMap = new Map<number, { id: number; nom: string }>();
    absences.forEach((absence) => {
      if (absence.equipe_id && !equipesMap.has(absence.equipe_id)) {
        equipesMap.set(absence.equipe_id, {
          id: absence.equipe_id,
          nom: `Équipe ${absence.equipe_id}`,
        });
      }
    });
    return Array.from(equipesMap.values());
  }, [absences]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400">
        Chargement...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-red-400">
        Erreur: {error.message}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full">
      <CalendarHeader breadcrumb={['Calendrier', 'Absences & Congés', 'Par équipe']} />
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-slate-400" />
              <h2 className="text-xl font-semibold text-slate-200">
                Absences & Congés - Par équipe
              </h2>
            </div>
            <div className="flex items-center gap-2">
              {equipes.length > 0 ? (
                equipes.map((equipe) => (
                  <Button
                    key={equipe.id}
                    variant={selectedEquipeId === equipe.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() =>
                      setSelectedEquipeId(
                        selectedEquipeId === equipe.id ? null : equipe.id
                      )
                    }
                  >
                    {equipe.nom}
                  </Button>
                ))
              ) : (
                <span className="text-sm text-slate-400">Aucune équipe disponible</span>
              )}
            </div>
          </div>

          {absences.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              {selectedEquipeId
                ? 'Aucune absence pour cette équipe'
                : 'Sélectionnez une équipe pour voir les absences'}
            </div>
          ) : (
            <div className="space-y-3">
              {absences.map((absence) => (
                <div
                  key={absence.id}
                  className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700/50"
                >
                  <div className="p-2 bg-slate-500/10 rounded">
                    <UserMinus className="h-5 w-5 text-slate-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-slate-200">{absence.employe_nom || `User ${absence.user_id}`}</span>
                      <span className="px-2 py-0.5 bg-slate-500/20 text-slate-400 rounded text-xs">
                        {absence.type || 'ABSENCE'}
                      </span>
                    </div>
                    {absence.date_debut && absence.date_fin && (
                      <div className="text-sm text-slate-400">
                        {new Date(absence.date_debut).toLocaleDateString()} -{' '}
                        {new Date(absence.date_fin).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

