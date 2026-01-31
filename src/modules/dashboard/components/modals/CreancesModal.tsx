/**
 * Modal Créances — déclenché par clic sur "⚠️ X créances > 30 jours".
 * Liste des créances, montants & échéances, historique de relance, actions.
 */

'use client';

import React from 'react';
import { X, AlertTriangle, Phone, Mail } from 'lucide-react';
import { formatMoneyCompact } from '@lib-root/dashboard/kpi';
import type { Creance } from '../../types/cockpitModals';

const CURRENCY = 'XOF';

export interface CreancesModalProps {
  isOpen: boolean;
  onClose: () => void;
  creances: Creance[];
  /** Nombre total affiché dans le widget (ex. 3) */
  countLabel?: number;
}

/** Données mock si aucune passée */
const defaultCreances: Creance[] = [
  { id: '1', client: 'SARL Bâtiment Plus', montant: 2_400_000, dateEcheance: '2025-11-15', joursRetard: 45, statut: 'en_cours', derniereRelance: '2026-01-10' },
  { id: '2', client: 'Entreprise Diaspora', montant: 1_800_000, dateEcheance: '2025-12-01', joursRetard: 38, statut: 'en_cours', derniereRelance: '2026-01-08' },
  { id: '3', client: 'Particuliers Almadies', montant: 950_000, dateEcheance: '2025-12-20', joursRetard: 25, statut: 'en_cours' },
];

export function CreancesModal({
  isOpen,
  onClose,
  creances = defaultCreances,
  countLabel,
}: CreancesModalProps) {
  const list = creances.length > 0 ? creances : defaultCreances;

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="creances-modal-title"
    >
      <div className="w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/40 shrink-0">
          <h2 id="creances-modal-title" className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-400" />
            Créances &gt; 30 jours
            {countLabel != null && (
              <span className="text-sm font-normal text-slate-400">
                ({countLabel} client{countLabel > 1 ? 's' : ''})
              </span>
            )}
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
            Clients n&apos;ayant pas payé depuis plus de 30 jours. Historique de relance et actions disponibles.
          </p>
          <div className="space-y-3">
            {list.map((c) => (
              <div
                key={c.id}
                className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-slate-200">{c.client}</p>
                    <p className="text-xs text-slate-400">
                      Échéance : {new Date(c.dateEcheance).toLocaleDateString('fr-FR')} · Retard : {c.joursRetard} jours
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-amber-300 tabular-nums">
                    {formatMoneyCompact(c.montant, CURRENCY)}
                  </span>
                </div>
                {c.derniereRelance && (
                  <p className="text-[11px] text-slate-400">
                    Dernière relance : {new Date(c.derniereRelance).toLocaleDateString('fr-FR')}
                  </p>
                )}
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    aria-label="Appeler pour cette créance"
                    className="inline-flex items-center gap-1 px-3 py-2 min-h-[44px] rounded-lg text-[11px] font-medium bg-sky-600/80 text-white hover:bg-sky-500 focus-visible:outline focus-visible:ring-2 focus-visible:ring-sky-500"
                  >
                    <Phone className="h-3 w-3" aria-hidden />
                    Appeler
                  </button>
                  <button
                    type="button"
                    aria-label="Relance email pour cette créance"
                    className="inline-flex items-center gap-1 px-3 py-2 min-h-[44px] rounded-lg text-[11px] font-medium bg-amber-600/80 text-slate-900 hover:bg-amber-500 focus-visible:outline focus-visible:ring-2 focus-visible:ring-sky-500"
                  >
                    <Mail className="h-3 w-3" aria-hidden />
                    Relance email
                  </button>
                </div>
              </div>
            ))}
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
