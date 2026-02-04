/**
 * Page : Analyse > Validateurs
 */

'use client';

import React from 'react';
import { getValidateurs } from '../../api/validationApi';
import { useQuery } from '@tanstack/react-query';
import { Users, Mail, Phone } from 'lucide-react';
import { cn } from '@/lib/cn';

export function ValidateursPage() {
  const { data: validateurs, isLoading, error } = useQuery({
    queryKey: ['validation-bc-validateurs'],
    queryFn: getValidateurs,
    staleTime: 60000, // 1 minute
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-slate-400">Chargement des validateurs...</div>
      </div>
    );
  }

  if (error || !validateurs) {
    return (
      <div className="p-6">
        <div className="text-red-400">Erreur lors du chargement des validateurs</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Users className="h-5 w-5 text-slate-400" />
          <h2 className="text-lg font-semibold text-slate-200">Validateurs</h2>
        </div>
        <p className="text-sm text-slate-400">
          Liste des validateurs et leurs performances ({validateurs.length})
        </p>
      </div>

      {validateurs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {validateurs.map((validateur) => (
            <div
              key={validateur.id}
              className="p-4 rounded-lg border bg-slate-800/50 border-slate-700/50"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-slate-200">{validateur.nom}</h3>
                  <p className="text-sm text-slate-400">{validateur.service}</p>
                </div>
              </div>

              {validateur.email && (
                <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                  <Mail className="h-3 w-3" />
                  <span>{validateur.email}</span>
                </div>
              )}

              {validateur.telephone && (
                <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
                  <Phone className="h-3 w-3" />
                  <span>{validateur.telephone}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-700/50">
                <div>
                  <div className="text-xs text-slate-400 mb-1">En cours</div>
                  <div className="text-lg font-bold text-amber-400">{validateur.documentsEnCours}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 mb-1">Validés</div>
                  <div className="text-lg font-bold text-emerald-400">{validateur.documentsValides}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 mb-1">Rejetés</div>
                  <div className="text-lg font-bold text-red-400">{validateur.documentsRejetes}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 mb-1">Taux validation</div>
                  <div className="text-lg font-bold text-slate-300">{validateur.tauxValidation}%</div>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-700/50">
                <div className="text-xs text-slate-400 mb-1">Délai moyen</div>
                <div className="text-sm font-medium text-slate-300">{validateur.delaiMoyen.toFixed(1)} jours</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-8 rounded-lg border border-slate-700/50 bg-slate-800/30 text-center">
          <div className="text-slate-400">Aucun validateur trouvé</div>
        </div>
      )}
    </div>
  );
}

