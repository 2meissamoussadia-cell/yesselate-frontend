/**
 * Page Synthèse validations
 * Liste des validations en attente et bloquantes
 */

'use client';

import React from 'react';
import { GouvernanceHeader } from '../../components/GouvernanceHeader';
import { useGouvernanceData } from '../../hooks/useGouvernanceData';
import type { ValidationGouvernance } from '../../types/gouvernanceTypes';
import { cn } from '@/lib/cn';
import { exportDataAsCSV } from '@/lib/utils/export';
import { AlertCircle } from 'lucide-react';
import { normalizeToArray } from '../../utils/dataNormalization';

export default function SyntheseValidationsPage() {
  const { data, isLoading } = useGouvernanceData('synthese-validations');

  const validations = normalizeToArray<ValidationGouvernance>(data);

  return (
    <div className="h-full w-full bg-white dark:bg-slate-950 text-slate-900 dark:text-white p-6">
      <GouvernanceHeader
        title="Synthèse validations"
        subtitle="Liste des validations en attente, bloquantes et validées"
        onExport={() => {
          const rows = validations.map((v: ValidationGouvernance) => ({
            id: v.id,
            reference: v.reference,
            type: v.type,
            bloqueur: v.bloqueur,
            montant: v.montant,
            projet_nom: v.projet_nom,
            statut: v.statut,
            titre: v.titre,
          }));
          exportDataAsCSV(rows, 'synthese_validations');
        }}
      />

      {isLoading ? (
        <div className="text-center text-slate-400 py-12">Chargement...</div>
      ) : validations.length === 0 ? (
        <div className="text-center text-slate-400 py-12">Aucune validation disponible</div>
      ) : (
        <div className="space-y-2">
          {validations.map((validation: ValidationGouvernance) => (
            <div
              key={validation.id}
              className={cn(
                'flex items-center justify-between gap-3 rounded-xl px-4 py-3 ring-1 ring-white/10',
                validation.bloqueur
                  ? 'bg-rose-500/10 ring-rose-500/20'
                  : 'bg-white/5 hover:bg-white/10'
              )}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono text-slate-400">{validation.reference}</span>
                  <span
                    className={cn(
                      'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1',
                      validation.type === 'BC'
                        ? 'bg-blue-500/15 text-blue-200 ring-blue-500/30'
                        : validation.type === 'AVENANT'
                          ? 'bg-purple-500/15 text-purple-200 ring-purple-500/30'
                          : 'bg-slate-500/15 text-slate-200 ring-slate-500/30'
                    )}
                  >
                    {validation.type}
                  </span>
                  {validation.bloqueur && (
                    <span className="inline-flex items-center gap-1 text-xs text-rose-400">
                      <AlertCircle className="h-3 w-3" />
                      Bloquant
                    </span>
                  )}
                </div>
                <div className="text-sm font-medium">{validation.titre}</div>
                <div className="mt-1 flex items-center gap-3 text-xs text-slate-400">
                  <span>Projet : {validation.projet_nom}</span>
                  {validation.date_echeance && (
                    <>
                      <span>•</span>
                      <span>Échéance : {new Date(validation.date_echeance).toLocaleDateString('fr-FR')}</span>
                    </>
                  )}
                  {validation.jours_attente !== undefined && (
                    <>
                      <span>•</span>
                      <span>{validation.jours_attente} jour{validation.jours_attente > 1 ? 's' : ''} d'attente</span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {validation.montant && (
                  <div className="text-sm font-semibold">
                    {validation.montant.toLocaleString('fr-FR')}€
                  </div>
                )}
                <span
                  className={cn(
                    'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1',
                    validation.statut === 'en-attente'
                      ? 'bg-amber-500/15 text-amber-200 ring-amber-500/30'
                      : validation.statut === 'valide'
                        ? 'bg-emerald-500/15 text-emerald-200 ring-emerald-500/30'
                        : validation.statut === 'bloque'
                          ? 'bg-rose-500/15 text-rose-200 ring-rose-500/30'
                          : 'bg-slate-500/15 text-slate-200 ring-slate-500/30'
                  )}
                >
                  {validation.statut === 'en-attente'
                    ? 'En attente'
                    : validation.statut === 'valide'
                      ? 'Validé'
                      : validation.statut === 'bloque'
                        ? 'Bloqué'
                        : 'Rejeté'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

