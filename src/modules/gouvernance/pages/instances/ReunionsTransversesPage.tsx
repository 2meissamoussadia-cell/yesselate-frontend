/**
 * Page Réunions transverses
 * Liste des réunions transverses
 */

'use client';

import React from 'react';
import { GouvernanceHeader } from '../../components/GouvernanceHeader';
import { useGouvernanceData } from '../../hooks/useGouvernanceData';
import type { InstanceGouvernance } from '../../types/gouvernanceTypes';
import { Users, Calendar } from 'lucide-react';
import { normalizeToArray } from '../../utils/dataNormalization';

export default function ReunionsTransversesPage() {
  const { data, isLoading } = useGouvernanceData('reunions-transverses');

  const reunions = normalizeToArray<InstanceGouvernance>(data);

  return (
    <div className="h-full w-full bg-slate-950 text-white p-6">
      <GouvernanceHeader
        title="Réunions transverses"
        subtitle="Calendrier des réunions transverses"
        onExport={() => { /* TODO: export réunions transverses */ }}
      />

      {isLoading ? (
        <div className="text-center text-slate-400 py-12">Chargement...</div>
      ) : reunions.length === 0 ? (
        <div className="text-center text-slate-400 py-12">Aucune réunion transverse programmée</div>
      ) : (
        <div className="space-y-2">
          {reunions
            .filter((r: InstanceGouvernance) => r.type === 'TRANSVERSE')
            .map((reunion: InstanceGouvernance) => (
              <div
                key={reunion.id}
                className="flex items-center justify-between gap-3 rounded-xl bg-white/5 px-4 py-3 ring-1 ring-white/10 hover:bg-white/10"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="h-4 w-4 text-emerald-400" />
                    <span className="font-medium">{reunion.nom}</span>
                    <span className="text-xs text-slate-400">
                      {new Date(reunion.date).toLocaleDateString('fr-FR')}
                      {reunion.heure && ` à ${reunion.heure}`}
                    </span>
                  </div>
                  <div className="text-sm text-slate-300 mt-1 flex items-center gap-4">
                    <span className="inline-flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {reunion.participants_count} participant{reunion.participants_count > 1 ? 's' : ''}
                    </span>
                    {reunion.decisions_count !== undefined && (
                      <span>{reunion.decisions_count} décisions</span>
                    )}
                  </div>
                </div>
                <button type="button" aria-label="Voir la réunion" className="rounded-xl bg-emerald-500/15 px-3 py-2 min-h-[44px] text-xs font-medium text-emerald-200 ring-1 ring-emerald-500/30 hover:bg-emerald-500/25 focus-visible:outline focus-visible:ring-2 focus-visible:ring-emerald-500">
                  Voir détails
                </button>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

