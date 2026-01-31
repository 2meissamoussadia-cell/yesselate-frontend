/**
 * Page : Alertes RH > Sur-allocation ressources
 */

'use client';

import React from 'react';
import { useAlertesData } from '../../hooks';
import { TrendingUp, AlertTriangle } from 'lucide-react';

export function SurallocationPage() {
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

  const surallocations = alertes?.filter((a) => a.titre.toLowerCase().includes('allocation') || a.titre.toLowerCase().includes('sur')) || [];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-200 mb-1">Sur-allocation ressources</h2>
        <p className="text-sm text-slate-400">
          Liste des ressources sur-allouées
        </p>
      </div>

      <div className="space-y-3">
        {surallocations.map((alerte) => (
          <div
            key={alerte.id}
            className="p-4 rounded-lg border border-amber-500/30 bg-amber-500/10"
          >
            <div className="flex items-start gap-3">
              <TrendingUp className="h-5 w-5 text-amber-400 mt-0.5" />
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
        {surallocations.length === 0 && (
          <div className="text-center py-8 text-slate-400">
            Aucune sur-allocation détectée
          </div>
        )}
      </div>
    </div>
  );
}

