/**
 * Page Retards critiques
 * Liste des jalons en retard critique
 */

'use client';

import React from 'react';
import { GouvernanceHeader } from '../../components/GouvernanceHeader';
import { useGouvernanceData } from '../../hooks/useGouvernanceData';
import type { JalonGouvernance } from '../../types/gouvernanceTypes';
import { Clock } from 'lucide-react';
import { normalizeToArray } from '../../utils/dataNormalization';

export default function RetardsCritiquesPage() {
  const { data, isLoading } = useGouvernanceData('retards-critiques');

  const retards = normalizeToArray<JalonGouvernance>(data);

  return (
    <div className="h-full w-full bg-slate-950 text-white p-6">
      <GouvernanceHeader
        title="Retards critiques"
        subtitle="Jalons en retard nécessitant une intervention urgente"
        onExport={() => console.log('Export retards critiques')}
      />

      {isLoading ? (
        <div className="text-center text-slate-400 py-12">Chargement...</div>
      ) : retards.length === 0 ? (
        <div className="text-center text-slate-400 py-12">Aucun retard critique</div>
      ) : (
        <div className="space-y-2">
          {retards
            .filter((j: JalonGouvernance) => j.est_retard && (j.retard_jours || 0) > 7)
            .map((jalon: JalonGouvernance) => (
              <div
                key={jalon.id}
                className="flex items-center justify-between gap-3 rounded-xl bg-amber-500/10 px-4 py-3 ring-1 ring-amber-500/20"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="h-4 w-4 text-amber-400" />
                    <span className="font-medium">{jalon.libelle}</span>
                  </div>
                  <div className="text-sm text-slate-300 mt-1">
                    Projet : {jalon.projet_nom} • Type : {jalon.type}
                  </div>
                  <div className="text-xs text-amber-400 mt-1">
                    Retard : +{jalon.retard_jours} jour{jalon.retard_jours && jalon.retard_jours > 1 ? 's' : ''} • Date
                    prévue : {jalon.date_prevue ? new Date(jalon.date_prevue).toLocaleDateString('fr-FR') : '-'}
                  </div>
                </div>
                <button className="rounded-xl bg-amber-500/20 px-3 py-1.5 text-xs font-medium text-amber-200 ring-1 ring-amber-500/30 hover:bg-amber-500/30">
                  Traiter
                </button>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

