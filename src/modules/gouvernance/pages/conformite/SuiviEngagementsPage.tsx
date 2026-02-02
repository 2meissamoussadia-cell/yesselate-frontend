/**
 * Page Suivi des engagements
 * Dashboard des engagements (budgets, délais, qualité)
 */

'use client';

import React from 'react';
import { GouvernanceHeader } from '../../components/GouvernanceHeader';
import { useGouvernanceData } from '../../hooks/useGouvernanceData';
import type { EngagementGouvernance } from '../../types/gouvernanceTypes';
import { cn, exportDataAsCSV } from '@/lib/utils';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';
import { normalizeToArray } from '../../utils/dataNormalization';

export default function SuiviEngagementsPage() {
  const { data, isLoading } = useGouvernanceData('suivi-engagements');

  const engagements = normalizeToArray<EngagementGouvernance>(data);

  const stats = {
    total: engagements.length,
    enCours: engagements.filter((e: EngagementGouvernance) => e.statut === 'en-cours').length,
    respectes: engagements.filter((e: EngagementGouvernance) => e.statut === 'respecte').length,
    nonRespectes: engagements.filter((e: EngagementGouvernance) => e.statut === 'non-respecte').length,
  };

  return (
    <div className="h-full w-full bg-white dark:bg-slate-950 text-slate-900 dark:text-white p-6">
      <GouvernanceHeader
        title="Suivi des engagements"
        subtitle="Dashboard des engagements financiers, calendaires et qualité"
        onExport={() => {
          const rows = engagements.map((e: EngagementGouvernance) => ({
            reference: e.reference,
            description: e.description,
            type: e.type,
            statut: e.statut,
            projet: e.projet_nom ?? '',
            date_engagement: e.date_engagement ?? '',
            date_echeance: e.date_echeance ?? '',
            montant: e.montant ?? '',
          }));
          exportDataAsCSV(rows, 'suivi-engagements');
        }}
      />

      {isLoading ? (
        <div className="text-center text-slate-400 py-12">Chargement...</div>
      ) : (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
              <div className="text-xs text-slate-400 mb-2">Total</div>
              <div className="text-2xl font-semibold">{stats.total}</div>
            </div>
            <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
              <div className="text-xs text-slate-400 mb-2">En cours</div>
              <div className="text-2xl font-semibold">{stats.enCours}</div>
            </div>
            <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
              <div className="text-xs text-slate-400 mb-2">Respectés</div>
              <div className="text-2xl font-semibold text-emerald-400">{stats.respectes}</div>
            </div>
            <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
              <div className="text-xs text-slate-400 mb-2">Non respectés</div>
              <div className="text-2xl font-semibold text-rose-400">{stats.nonRespectes}</div>
            </div>
          </div>

          {/* Liste des engagements */}
          {engagements.length === 0 ? (
            <div className="text-center text-slate-400 py-12">Aucun engagement</div>
          ) : (
            <div className="space-y-2">
              {engagements.map((engagement: EngagementGouvernance) => (
                <div
                  key={engagement.id}
                  className="flex items-center justify-between gap-3 rounded-xl bg-white/5 px-4 py-3 ring-1 ring-white/10 hover:bg-white/10"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {engagement.statut === 'respecte' ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      ) : engagement.statut === 'non-respecte' ? (
                        <XCircle className="h-4 w-4 text-rose-400" />
                      ) : (
                        <Clock className="h-4 w-4 text-amber-400" />
                      )}
                      <span className="font-mono text-xs text-slate-400">{engagement.reference}</span>
                      <span
                        className={cn(
                          'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1',
                          engagement.type === 'budget'
                            ? 'bg-blue-500/15 text-blue-200 ring-blue-500/30'
                            : engagement.type === 'delai'
                              ? 'bg-amber-500/15 text-amber-200 ring-amber-500/30'
                              : 'bg-slate-500/15 text-slate-200 ring-slate-500/30'
                        )}
                      >
                        {engagement.type}
                      </span>
                    </div>
                    <div className="text-sm font-medium">{engagement.description}</div>
                    <div className="text-xs text-slate-400 mt-1">
                      {engagement.projet_nom && `Projet : ${engagement.projet_nom} • `}
                      Date engagement : {new Date(engagement.date_engagement).toLocaleDateString('fr-FR')}
                      {engagement.date_echeance && (
                        <>
                          {' • '}
                          Échéance : {new Date(engagement.date_echeance).toLocaleDateString('fr-FR')}
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {engagement.montant && (
                      <div className="text-sm font-semibold">
                        {engagement.montant.toLocaleString('fr-FR')}€
                      </div>
                    )}
                    <span
                      className={cn(
                        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1',
                        engagement.statut === 'respecte'
                          ? 'bg-emerald-500/15 text-emerald-200 ring-emerald-500/30'
                          : engagement.statut === 'non-respecte'
                            ? 'bg-rose-500/15 text-rose-200 ring-rose-500/30'
                            : 'bg-amber-500/15 text-amber-200 ring-amber-500/30'
                      )}
                    >
                      {engagement.statut === 'respecte'
                        ? 'Respecté'
                        : engagement.statut === 'non-respecte'
                          ? 'Non respecté'
                          : 'En cours'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

