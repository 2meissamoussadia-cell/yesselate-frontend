/**
 * Page Audit gouvernance
 * Liste des audits de gouvernance
 */

'use client';

import React from 'react';
import { GouvernanceHeader } from '../../components/GouvernanceHeader';
import { useGouvernanceData } from '../../hooks/useGouvernanceData';
import type { AuditGouvernance } from '../../types/gouvernanceTypes';
import { FileCheck } from 'lucide-react';
import { cn, exportDataAsCSV } from '@/lib/utils';
import { normalizeToArray } from '../../utils/dataNormalization';

export default function AuditGouvernancePage() {
  const { data, isLoading } = useGouvernanceData('audit-gouvernance');

  const audits = normalizeToArray<AuditGouvernance>(data);

  return (
    <div className="h-full w-full bg-white dark:bg-slate-950 text-slate-900 dark:text-white p-6">
      <GouvernanceHeader
        title="Audit gouvernance"
        subtitle="Liste des audits de gouvernance programmés et réalisés"
        onExport={() => {
          const rows = audits.map((a: AuditGouvernance) => ({
            id: a.id,
            reference: a.reference,
            type: a.type,
            date: a.date,
            statut: a.statut,
            non_conformites_count: a.non_conformites_count,
          }));
          exportDataAsCSV(rows, 'audits_gouvernance');
        }}
      />

      {isLoading ? (
        <div className="text-center text-slate-400 py-12">Chargement...</div>
      ) : audits.length === 0 ? (
        <div className="text-center text-slate-400 py-12">Aucun audit disponible</div>
      ) : (
        <div className="space-y-2">
          {audits.map((audit: AuditGouvernance) => (
            <div
              key={audit.id}
              className="flex items-center justify-between gap-3 rounded-xl bg-white/5 px-4 py-3 ring-1 ring-white/10 hover:bg-white/10"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <FileCheck className="h-4 w-4 text-blue-400" />
                  <span className="font-mono text-xs text-slate-400">{audit.reference}</span>
                  <span
                    className={cn(
                      'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1',
                      audit.type === 'interne'
                        ? 'bg-blue-500/15 text-blue-200 ring-blue-500/30'
                        : audit.type === 'externe'
                          ? 'bg-purple-500/15 text-purple-200 ring-purple-500/30'
                          : 'bg-slate-500/15 text-slate-200 ring-slate-500/30'
                    )}
                  >
                    {audit.type === 'interne' ? 'Interne' : audit.type === 'externe' ? 'Externe' : 'Conformité'}
                  </span>
                </div>
                <div className="text-sm font-medium">{audit.reference}</div>
                <div className="text-xs text-slate-400 mt-1">
                  Date : {new Date(audit.date).toLocaleDateString('fr-FR')}
                  {audit.non_conformites_count !== undefined && (
                    <>
                      {' • '}
                      {audit.non_conformites_count} non-conformité{audit.non_conformites_count > 1 ? 's' : ''}
                    </>
                  )}
                  {audit.actions_correctives_count !== undefined && (
                    <>
                      {' • '}
                      {audit.actions_correctives_count} action{audit.actions_correctives_count > 1 ? 's' : ''}{' '}
                      corrective{audit.actions_correctives_count > 1 ? 's' : ''}
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1',
                    audit.statut === 'termine'
                      ? 'bg-emerald-500/15 text-emerald-200 ring-emerald-500/30'
                      : audit.statut === 'en-cours'
                        ? 'bg-blue-500/15 text-blue-200 ring-blue-500/30'
                        : 'bg-slate-500/15 text-slate-200 ring-slate-500/30'
                  )}
                >
                  {audit.statut === 'termine'
                    ? 'Terminé'
                    : audit.statut === 'en-cours'
                      ? 'En cours'
                      : 'Programmé'}
                </span>
                {audit.resultat && (
                  <span
                    className={cn(
                      'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1',
                      audit.resultat === 'conforme'
                        ? 'bg-emerald-500/15 text-emerald-200 ring-emerald-500/30'
                        : audit.resultat === 'non-conforme'
                          ? 'bg-rose-500/15 text-rose-200 ring-rose-500/30'
                          : 'bg-amber-500/15 text-amber-200 ring-amber-500/30'
                    )}
                  >
                    {audit.resultat === 'conforme'
                      ? 'Conforme'
                      : audit.resultat === 'non-conforme'
                        ? 'Non conforme'
                        : 'À améliorer'}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

