/**
 * Page : Alertes SLA > SLA en attente
 */

'use client';

import React from 'react';
import { useAlertesData } from '../../hooks';
import { Clock } from 'lucide-react';

export function SlaEnAttentePage() {
  const { data: alertes, isLoading } = useAlertesData({
    typologies: ['SLA'],
    statuts: ['EN_COURS'],
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-slate-400">Chargement...</div>
      </div>
    );
  }

  const slaEnAttente = alertes?.filter((a) => a.estSla) || [];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-200 mb-1">SLA en attente</h2>
        <p className="text-sm text-slate-400">
          Liste des SLA en cours de traitement
        </p>
      </div>

      <div className="space-y-3">
        {slaEnAttente.map((alerte) => (
          <div
            key={alerte.id}
            className="p-4 rounded-lg border border-slate-700/50 bg-slate-800/30"
          >
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-slate-400 mt-0.5" />
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
              <button className="px-4 py-2 rounded-lg bg-slate-700/50 text-slate-300 border border-slate-700/50 hover:bg-slate-700 transition-colors">
                Voir
              </button>
            </div>
          </div>
        ))}
        {slaEnAttente.length === 0 && (
          <div className="text-center py-8 text-slate-400">
            Aucun SLA en attente
          </div>
        )}
      </div>
    </div>
  );
}

