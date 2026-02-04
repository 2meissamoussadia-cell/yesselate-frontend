/**
 * Page Arbitrages en attente
 * Liste des arbitrages nécessitant une décision
 */

'use client';

import React, { useCallback, useMemo, useState } from 'react';
import { GouvernanceHeader } from '../../components/GouvernanceHeader';
import { useGouvernanceData } from '../../hooks/useGouvernanceData';
import type { ArbitrageGouvernance } from '../../types/gouvernanceTypes';
import { Scale, Clock } from 'lucide-react';
import { cn } from '@/lib/cn';
import { exportDataAsCSV } from '@/lib/utils/export';
import { normalizeToArray } from '../../utils/dataNormalization';
import { FilterBar } from '@/components/erp';
import type { ErpFilters } from '@/components/erp';

export default function ArbitragesEnAttentePage() {
  const { data, isLoading } = useGouvernanceData('arbitrages-en-attente');
  const [filters, setFilters] = useState<ErpFilters>({ gravite: '' });

  const onFilterChange = useCallback((key: string, value: unknown) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const arbitrages = useMemo(() => normalizeToArray<ArbitrageGouvernance>(data), [data]);
  const filteredArbitrages = useMemo(() => {
    const enAttente = arbitrages.filter((a) => a.statut === 'en-attente');
    const niveauFilter = String(filters.gravite ?? '').trim();
    if (!niveauFilter || niveauFilter === 'Tous') return enAttente;
    const niveau = parseInt(niveauFilter, 10);
    if (Number.isNaN(niveau)) return enAttente;
    return enAttente.filter((a) => a.niveau === niveau);
  }, [arbitrages, filters.gravite]);

  return (
    <div className="h-full w-full bg-white dark:bg-slate-950 text-slate-900 dark:text-white p-6">
      <GouvernanceHeader
        title="Arbitrages en attente"
        subtitle="Arbitrages nécessitant une décision urgente"
        onExport={() => {
          const rows = filteredArbitrages.map((a: ArbitrageGouvernance) => ({
            id: a.id,
            reference: a.reference,
            titre: a.titre,
            niveau: a.niveau,
            statut: a.statut,
            projet_nom: a.projet_nom,
            demandeur: a.demandeur,
            date_echeance: a.date_echeance,
            impact_financier: a.impact_financier,
            impact_planning: a.impact_planning,
            description: a.description ?? '',
          }));
          exportDataAsCSV(rows, 'arbitrages_en_attente');
        }}
      />

      {!isLoading && arbitrages.length > 0 && (
        <FilterBar
          filters={filters}
          onFilterChange={onFilterChange}
          options={{ gravites: ['Tous', '1', '2', '3'] }}
          hideSections={['perimetre', 'etats', 'dates', 'avances', 'savedViews']}
          className="mb-4 rounded-xl border border-slate-800/60 bg-slate-900/60"
        />
      )}

      {isLoading ? (
        <div className="text-center text-slate-400 py-12">Chargement...</div>
      ) : filteredArbitrages.length === 0 ? (
        <div className="text-center text-slate-400 py-12">
          {arbitrages.length === 0 ? 'Aucun arbitrage en attente' : 'Aucun arbitrage ne correspond aux filtres'}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredArbitrages
            .map((arbitrage: ArbitrageGouvernance) => (
              <div
                key={arbitrage.id}
                className="flex items-center justify-between gap-3 rounded-xl bg-amber-500/10 px-4 py-3 ring-1 ring-amber-500/20"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Scale className="h-4 w-4 text-amber-400" />
                    <span className="font-mono text-xs text-slate-400">{arbitrage.reference}</span>
                    <span
                      className={cn(
                        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1',
                        arbitrage.niveau === 3
                          ? 'bg-rose-500/15 text-rose-200 ring-rose-500/30'
                          : arbitrage.niveau === 2
                            ? 'bg-amber-500/15 text-amber-200 ring-amber-500/30'
                            : 'bg-slate-500/15 text-slate-200 ring-slate-500/30'
                      )}
                    >
                      Niveau {arbitrage.niveau}
                    </span>
                  </div>
                  <div className="text-sm font-medium">{arbitrage.titre}</div>
                  {arbitrage.description && (
                    <div className="text-sm text-slate-300 mt-1">{arbitrage.description}</div>
                  )}
                  <div className="text-xs text-slate-400 mt-1">
                    {arbitrage.projet_nom && `Projet : ${arbitrage.projet_nom} • `}
                    Demandeur : {arbitrage.demandeur}
                    {arbitrage.date_echeance && (
                      <>
                        {' • '}
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Échéance : {new Date(arbitrage.date_echeance).toLocaleDateString('fr-FR')}
                        </span>
                      </>
                    )}
                  </div>
                  {(arbitrage.impact_financier || arbitrage.impact_planning) && (
                    <div className="text-xs text-amber-400 mt-1">
                      Impact :{' '}
                      {arbitrage.impact_financier &&
                        `${arbitrage.impact_financier.toLocaleString('fr-FR')}€`}
                      {arbitrage.impact_financier && arbitrage.impact_planning && ' • '}
                      {arbitrage.impact_planning && `+${arbitrage.impact_planning} jours`}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  aria-label="Traiter l'arbitrage"
                  className="rounded-xl bg-amber-500/20 px-3 py-2 min-h-[44px] text-xs font-medium text-amber-200 ring-1 ring-amber-500/30 hover:bg-amber-500/30 focus-visible:outline focus-visible:ring-2 focus-visible:ring-amber-500"
                >
                  Traiter
                </button>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

