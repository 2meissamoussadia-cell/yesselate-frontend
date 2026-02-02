/**
 * Widget HSE & Conformité — Phase 3 audit ERP BTP 2026.
 * Obligation légale BTP : document unique, PPSPS, plan de prévention.
 * Inspiré Procore : accidents/incidents, TF/TG, conformité documentaire.
 */

'use client';

import React, { memo } from 'react';
import { ShieldAlert, FileCheck, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface DocConformite {
  doc: string;
  statut: 'valide' | 'à_renouveler' | 'manquant';
  expire: string | null; // dd/mm/yyyy
}

const MOCK_DOCS: DocConformite[] = [
  { doc: 'PPSPS Chantier #042', statut: 'valide', expire: '15/03/2026' },
  { doc: 'Document unique', statut: 'à_renouveler', expire: '01/02/2026' },
  { doc: 'Plan de prévention', statut: 'valide', expire: '30/06/2026' },
  { doc: 'PPSPS Chantier #038', statut: 'manquant', expire: null },
];

export interface HSEConformiteWidgetProps {
  /** Accidents avec arrêt (30 derniers jours) */
  accidentsArret?: number;
  /** Incidents bénins */
  incidentsBenins?: number;
  /** Presqu'accidents */
  presquAccidents?: number;
  /** Taux de fréquence (TF) — objectif < 10 */
  tauxFrequence?: number;
  /** Taux de gravité (TG) */
  tauxGravite?: number;
  /** Documents conformité */
  documents?: DocConformite[];
  className?: string;
  /** Clic "Déclarer un incident" */
  onDeclarerIncident?: () => void;
  /** Masquer le titre du widget (si utilisé dans un DashboardPanel) */
  showHeader?: boolean;
}

function DocStatutBadge({ statut }: { statut: DocConformite['statut'] }) {
  const config = {
    valide: { label: '✓ Valide', className: 'bg-emerald-900/50 text-emerald-400' },
    'à_renouveler': { label: 'À renouveler', className: 'bg-amber-900/50 text-amber-400' },
    manquant: { label: 'Manquant', className: 'bg-rose-900/50 text-rose-400' },
  };
  const c = config[statut];
  return (
    <span className={cn('rounded px-2 py-0.5 text-[10px] font-medium', c.className)}>
      {c.label}
    </span>
  );
}

export const HSEConformiteWidget = memo(function HSEConformiteWidget({
  accidentsArret = 0,
  incidentsBenins = 3,
  presquAccidents = 7,
  tauxFrequence = 2.4,
  tauxGravite = 0.08,
  documents = MOCK_DOCS,
  className,
  onDeclarerIncident,
  showHeader = true,
}: HSEConformiteWidgetProps) {
  return (
    <div className={cn('rounded-xl border overflow-hidden border-slate-200 bg-white dark:border-slate-800/80 dark:bg-slate-950/80', className)}>
      {showHeader && (
        <div className="px-4 py-3 border-b border-slate-800/60 flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-emerald-400" aria-hidden />
          <div>
            <h3 className="text-sm font-semibold text-slate-100">HSE & Conformité</h3>
            <p className="text-[10px] text-slate-400">Hygiène, Sécurité, Environnement — obligation légale BTP</p>
          </div>
        </div>
      )}
      <div className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[11px]">
        {/* Accidents & Incidents */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/80 p-3 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-emerald-400" aria-hidden />
            <h4 className="font-semibold text-slate-200">Accidents & Incidents</h4>
          </div>
          <p className="text-[10px] text-slate-400">30 derniers jours</p>
          <div className="text-center">
            <div className="text-3xl font-bold text-emerald-500">{accidentsArret}</div>
            <p className="text-[10px] text-slate-400">Accidents avec arrêt</p>
          </div>
          <div className="space-y-1.5 text-[10px]">
            <div className="flex justify-between">
              <span className="text-slate-400">Incidents bénins</span>
              <span className="font-medium text-slate-200">{incidentsBenins}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Presqu&apos;accidents</span>
              <span className="font-medium text-slate-200">{presquAccidents}</span>
            </div>
          </div>
          {onDeclarerIncident && (
            <button
              type="button"
              onClick={onDeclarerIncident}
              className="mt-2 w-full rounded-lg bg-sky-600/80 py-2 text-[11px] font-medium text-white hover:bg-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:ring-offset-2 focus:ring-offset-slate-900"
            >
              + Déclarer un incident
            </button>
          )}
        </div>

        {/* Taux TF / TG */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/80 p-3 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <FileCheck className="h-4 w-4 text-sky-400" aria-hidden />
            <h4 className="font-semibold text-slate-200">Indicateurs réglementaires</h4>
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-[10px] mb-1">
                <span className="text-slate-400">Taux de fréquence (TF)</span>
                <span className="font-bold text-emerald-500">{tauxFrequence}</span>
              </div>
              <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{ width: `${Math.min(100, (tauxFrequence / 10) * 100)}%` }}
                />
              </div>
              <p className="mt-1 text-[10px] text-slate-400">
                Objectif : &lt; 10 · Secteur BTP : 12,3
              </p>
            </div>
            <div>
              <div className="flex justify-between text-[10px] mb-1">
                <span className="text-slate-400">Taux de gravité (TG)</span>
                <span className="font-bold text-emerald-500">{tauxGravite}</span>
              </div>
              <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{ width: `${Math.min(100, tauxGravite * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Conformité documentaire */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/80 p-3 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-400" aria-hidden />
            <h4 className="font-semibold text-slate-200">Conformité documentaire</h4>
          </div>
          <div className="space-y-2">
            {documents.map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-2 rounded-lg bg-slate-800/50 p-2 text-[11px]"
              >
                <div className="min-w-0">
                  <p className="font-medium text-slate-200 truncate">{item.doc}</p>
                  {item.expire && (
                    <p className="text-[10px] text-slate-400">Expire le {item.expire}</p>
                  )}
                </div>
                <DocStatutBadge statut={item.statut} />
              </div>
            ))}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
});
