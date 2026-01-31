/**
 * Page : Alertes RH > Absences bloquantes
 */

'use client';

import React from 'react';
import { useAlertesData } from '../../hooks';
import { Users, AlertCircle } from 'lucide-react';

export function AbsencesBloquantesPage() {
  const { data: alertes, isLoading } = useAlertesData({
    typologies: ['RH'],
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-slate-400">Chargement...</div>
      </div>
    );
  }

  const absences = alertes?.filter((a) => a.titre.toLowerCase().includes('absence')) || [];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-200 mb-1">Absences bloquantes</h2>
        <p className="text-sm text-slate-400">
          Liste des absences qui bloquent des processus
        </p>
      </div>

      <div className="space-y-3">
        {absences.map((alerte) => (
          <div
            key={alerte.id}
            className="p-4 rounded-lg border border-amber-500/30 bg-amber-500/10"
          >
            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 text-amber-400 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-medium text-slate-200 mb-1">{alerte.titre}</h3>
                {alerte.description && (
                  <p className="text-sm text-slate-400 mb-2">{alerte.description}</p>
                )}
                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <span>Bureau: {alerte.bureau}</span>
                  <span>Responsable: {alerte.responsable}</span>
                </div>
              </div>
              <button className="px-4 py-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30 transition-colors">
                Traiter
              </button>
            </div>
          </div>
        ))}
        {absences.length === 0 && (
          <div className="text-center py-8 text-slate-400">
            Aucune absence bloquante
          </div>
        )}
      </div>
    </div>
  );
}

