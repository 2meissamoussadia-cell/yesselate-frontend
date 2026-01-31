/**
 * Page : Alertes SLA > SLA à risque
 */

'use client';

import React from 'react';
import { useAlertesData } from '../../hooks';
import { AlertTriangle } from 'lucide-react';

export function SlaRisquePage() {
  const { data: alertes, isLoading } = useAlertesData({
    typologies: ['SLA'],
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-slate-400">Chargement...</div>
      </div>
    );
  }

  // Filtrer les SLA qui sont proches du dépassement
  const slaRisque = alertes?.filter((a) => a.estSla && a.statut === 'EN_COURS') || [];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-200 mb-1">SLA à risque</h2>
        <p className="text-sm text-slate-400">
          Liste des SLA proches du dépassement
        </p>
      </div>

      <div className="space-y-3">
        {slaRisque.map((alerte) => (
          <div
            key={alerte.id}
            className="p-4 rounded-lg border border-amber-500/30 bg-amber-500/10"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-400 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium text-slate-200">{alerte.titre}</h3>
                  <span className="px-2 py-0.5 rounded text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    À risque
                  </span>
                </div>
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
        {slaRisque.length === 0 && (
          <div className="text-center py-8 text-slate-400">
            Aucun SLA à risque
          </div>
        )}
      </div>
    </div>
  );
}

