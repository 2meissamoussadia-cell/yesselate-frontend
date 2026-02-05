/**
 * Modal Validations en attente — déclenché par clic sur "21 / 45".
 * Liste des validations, priorisation par impact cash, action rapide Valider/Rejeter.
 */

'use client';

import React, { useState } from 'react';
import { X, FileText, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import { cn } from '@/lib/cn';
import { formatMoneyCompact } from '@lib-root/dashboard/kpi';
import type { ValidationEnAttente } from '../../types/cockpitModals';

const CURRENCY = 'XOF';

export interface ValidationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  validations: ValidationEnAttente[];
  /** Ex. "21" validations en attente */
  enAttenteCount?: number;
  /** Ex. "45" total */
  totalCount?: number;
}

const defaultValidations: ValidationEnAttente[] = [
  { id: 'v1', type: 'paiement', chantier: '#042', montant: 1_200_000, impactCash: true, delaiImpactJours: 3, demandeur: 'Équipe chantier', dateDemande: '2026-01-28', urgence: 'haute' },
  { id: 'v2', type: 'modification_budget', chantier: '#038', impactCash: true, delaiImpactJours: 7, demandeur: 'MO', dateDemande: '2026-01-27', urgence: 'haute' },
  { id: 'v3', type: 'changement_planning', chantier: '#051', impactCash: false, delaiImpactJours: 14, demandeur: 'Pilotage', dateDemande: '2026-01-26', urgence: 'moyenne' },
  { id: 'v4', type: 'paiement', chantier: '#033', montant: 450_000, impactCash: true, delaiImpactJours: 5, demandeur: 'Compta', dateDemande: '2026-01-25', urgence: 'haute' },
  { id: 'v5', type: 'paiement', chantier: '#047', montant: 2_100_000, impactCash: true, delaiImpactJours: 2, demandeur: 'Équipe chantier', dateDemande: '2026-01-29', urgence: 'haute' },
];

function getTypeLabel(t: ValidationEnAttente['type']): string {
  const labels = { paiement: 'Paiement', modification_budget: 'Modif. budget', changement_planning: 'Changement planning' };
  return labels[t] ?? t;
}

function getUrgenceClass(u: ValidationEnAttente['urgence']): string {
  const classes = { haute: 'text-rose-400', moyenne: 'text-amber-400', basse: 'text-slate-400' };
  return classes[u] ?? 'text-slate-400';
}

export function ValidationsModal({
  isOpen,
  onClose,
  validations = defaultValidations,
  enAttenteCount = 21,
  totalCount = 45,
}: ValidationsModalProps) {
  const [processed, setProcessed] = useState<Set<string>>(new Set());
  const list = validations.length > 0 ? validations : defaultValidations;
  const { showToast } = useToast();

  const handleValidate = (id: string) => {
    setProcessed((prev) => new Set(prev).add(id));
    showToast({ type: 'success', title: 'Validé', message: 'Validation enregistrée.' });
  };

  const handleReject = (id: string) => {
    setProcessed((prev) => new Set(prev).add(id));
    showToast({ type: 'warning', title: 'Rejeté', message: 'Validation rejetée.' });
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="validations-modal-title"
    >
      <div className="w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/40 shrink-0">
          <h2 id="validations-modal-title" className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <FileText className="h-5 w-5 text-amber-400" />
            Validations en attente
            <span className="text-sm font-normal text-slate-400">
              {enAttenteCount} / {totalCount}
            </span>
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto flex-1">
          <p className="text-xs text-slate-400 mb-3">
            Priorisation par impact cash. 5 impactent le cash sous 7 jours.
          </p>
          <div className="space-y-2">
            {list.map((v) => {
              const done = processed.has(v.id);
              return (
                <div
                  key={v.id}
                  className={cn(
                    'rounded-xl border border-slate-800 bg-slate-950/60 p-3 flex flex-wrap items-center justify-between gap-2',
                    done && 'opacity-60'
                  )}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-slate-200">{getTypeLabel(v.type)}</span>
                      <span className="text-xs text-slate-400">{v.chantier}</span>
                      {v.montant != null && (
                        <span className="text-xs font-medium text-slate-300 tabular-nums">
                          {formatMoneyCompact(v.montant, CURRENCY)}
                        </span>
                      )}
                      <span className={cn('text-[11px] font-medium', getUrgenceClass(v.urgence))}>
                        {v.urgence}
                      </span>
                      {v.impactCash && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300">
                          Impact cash
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {v.demandeur} · {new Date(v.dateDemande).toLocaleDateString('fr-FR')}
                      {v.delaiImpactJours > 0 && ` · Délai ${v.delaiImpactJours} j`}
                    </p>
                  </div>
                  {!done && (
                    <div className="flex gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleValidate(v.id)}
                        aria-label="Valider cette validation"
                        className="inline-flex items-center gap-1 px-3 py-2 min-h-[44px] rounded-lg text-[11px] font-medium bg-emerald-600/80 text-white hover:bg-emerald-500 focus-visible:outline focus-visible:ring-2 focus-visible:ring-sky-500"
                      >
                        <CheckCircle className="h-3.5 w-3.5" aria-hidden />
                        Valider
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReject(v.id)}
                        aria-label="Rejeter cette validation"
                        className="inline-flex items-center gap-1 px-3 py-2 min-h-[44px] rounded-lg text-[11px] font-medium border border-slate-600 text-slate-300 hover:bg-slate-800 focus-visible:outline focus-visible:ring-2 focus-visible:ring-sky-500"
                      >
                        <XCircle className="h-3.5 w-3.5" aria-hidden />
                        Rejeter
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="px-4 py-3 border-t border-slate-800 bg-slate-950/40 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full px-4 py-2 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-800"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
