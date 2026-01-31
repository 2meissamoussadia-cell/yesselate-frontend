/**
 * Page : Alertes SLA > SLA dépassés
 */

'use client';

import React from 'react';
import { useAlertesData } from '../../hooks';
import { Clock, AlertTriangle } from 'lucide-react';

export function SlaDepassesPage() {
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

  const slaDepasses = alertes?.filter((a) => a.estSla) || [];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-200 mb-1">SLA dépassés</h2>
        <p className="text-sm text-slate-400">
          Liste des SLA qui ont été dépassés
        </p>
      </div>

      <div className="space-y-3">
        {slaDepasses.map((alerte) => (
          <div
            key={alerte.id}
            className="p-4 rounded-lg border border-red-500/30 bg-red-500/10"
          >
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-red-400 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium text-slate-200">{alerte.titre}</h3>
                  <span className="px-2 py-0.5 rounded text-xs bg-red-500/20 text-red-400 border border-red-500/30">
                    Dépassé
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
              <button className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-colors">
                Traiter
              </button>
            </div>
          </div>
        ))}
        {slaDepasses.length === 0 && (
          <div className="text-center py-8 text-slate-400">
            Aucun SLA dépassé
          </div>
        )}
      </div>
    </div>
  );
}

