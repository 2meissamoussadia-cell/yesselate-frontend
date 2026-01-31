/**
 * Page : Historique & gouvernance > Escalades & suivis
 */

'use client';

import React from 'react';
import { TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';

export function EscaladesPage() {
  const escalades = [
    {
      id: '1',
      alerte: 'Paiement bloqué - Facture #12345',
      escaladeVers: 'Direction Financière',
      raison: 'Dépassement délai critique',
      priorite: 'critical',
      dateEscalade: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      statut: 'pending',
    },
    {
      id: '2',
      alerte: 'Validation BC en attente',
      escaladeVers: 'Responsable Validation',
      raison: 'SLA dépassé',
      priorite: 'warning',
      dateEscalade: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      statut: 'acknowledged',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-200 mb-1">Escalades & suivis</h2>
        <p className="text-sm text-slate-400">
          Liste des escalades et leur suivi
        </p>
      </div>

      <div className="space-y-3">
        {escalades.map((escalade) => (
          <div
            key={escalade.id}
            className={`
              p-4 rounded-lg border
              ${escalade.statut === 'pending'
                ? 'border-amber-500/30 bg-amber-500/10'
                : 'border-blue-500/30 bg-blue-500/10'
              }
            `}
          >
            <div className="flex items-start gap-3">
              <TrendingUp className={`
                h-5 w-5 mt-0.5
                ${escalade.statut === 'pending' 
                  ? 'text-amber-400' 
                  : 'text-blue-400'
                }
              `} />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium text-slate-200">{escalade.alerte}</h3>
                  <span className={`
                    px-2 py-0.5 rounded text-xs border
                    ${escalade.priorite === 'critical'
                      ? 'bg-red-500/20 text-red-400 border-red-500/30'
                      : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                    }
                  `}>
                    {escalade.priorite}
                  </span>
                </div>
                <p className="text-sm text-slate-400 mb-2">
                  Escalade vers: <span className="text-slate-300">{escalade.escaladeVers}</span>
                </p>
                <p className="text-sm text-slate-400 mb-2">
                  Raison: {escalade.raison}
                </p>
                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <span>
                    Escaladée: {escalade.dateEscalade.toLocaleDateString('fr-FR')}
                  </span>
                  <span className={`
                    px-2 py-0.5 rounded border
                    ${escalade.statut === 'pending'
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                      : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                    }
                  `}>
                    {escalade.statut === 'pending' ? 'En attente' : 'Acquittée'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
        {escalades.length === 0 && (
          <div className="text-center py-8 text-slate-400">
            Aucune escalade enregistrée
          </div>
        )}
      </div>
    </div>
  );
}

