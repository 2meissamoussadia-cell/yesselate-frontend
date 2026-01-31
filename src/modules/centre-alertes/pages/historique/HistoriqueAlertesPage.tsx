/**
 * Page : Historique & gouvernance > Historique des alertes
 */

'use client';

import React from 'react';
import { useAlertesData } from '../../hooks';
import { History, CheckCircle2, AlertCircle } from 'lucide-react';

export function HistoriqueAlertesPage() {
  const { data: alertes, isLoading } = useAlertesData();

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-slate-400">Chargement...</div>
      </div>
    );
  }

  // Trier par date décroissante
  const historique = [...(alertes || [])].sort((a, b) => 
    new Date(b.dateDeclenchement).getTime() - new Date(a.dateDeclenchement).getTime()
  );

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-200 mb-1">Historique des alertes</h2>
        <p className="text-sm text-slate-400">
          Historique complet de toutes les alertes
        </p>
      </div>

      <div className="space-y-3">
        {historique.map((alerte) => (
          <div
            key={alerte.id}
            className={`
              p-4 rounded-lg border
              ${alerte.statut === 'RESOLUE' 
                ? 'border-emerald-500/30 bg-emerald-500/10' 
                : alerte.statut === 'ACQUITTEE'
                ? 'border-blue-500/30 bg-blue-500/10'
                : 'border-slate-700/50 bg-slate-800/30'
              }
            `}
          >
            <div className="flex items-start gap-3">
              {alerte.statut === 'RESOLUE' ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 text-slate-400 mt-0.5" />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium text-slate-200">{alerte.titre}</h3>
                  <span className={`
                    px-2 py-0.5 rounded text-xs border
                    ${alerte.typologie === 'CRITIQUE' 
                      ? 'bg-red-500/20 text-red-400 border-red-500/30'
                      : alerte.typologie === 'SLA'
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                      : 'bg-slate-700/50 text-slate-400 border-slate-700/50'
                    }
                  `}>
                    {alerte.typologie}
                  </span>
                </div>
                {alerte.description && (
                  <p className="text-sm text-slate-400 mb-2">{alerte.description}</p>
                )}
                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <span>Bureau: {alerte.bureau}</span>
                  <span>Responsable: {alerte.responsable}</span>
                  <span>
                    Déclenchée: {new Date(alerte.dateDeclenchement).toLocaleDateString('fr-FR')}
                  </span>
                  {alerte.dateResolution && (
                    <span>
                      Résolue: {new Date(alerte.dateResolution).toLocaleDateString('fr-FR')}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        {historique.length === 0 && (
          <div className="text-center py-8 text-slate-400">
            Aucun historique disponible
          </div>
        )}
      </div>
    </div>
  );
}

