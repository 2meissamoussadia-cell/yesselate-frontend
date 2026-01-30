/**
 * Validation des paiements — ERP-BTP (DG / DAF)
 *
 * Vue claire de tous les paiements à valider.
 * Lien chantier / jalon (25/50/75/100%) / mode (Orange Money, Wave, virement…).
 * Actions : valider, refuser, demander pièces, envoyer à l'huissier.
 */

'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { cn } from '@/lib/utils';
import {
  DashboardPageLayout,
  DashboardSection,
} from '../shared';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type PaiementStatut = 'En attente' | 'Validé' | 'Refusé';
export type PaiementMode = 'Orange Money' | 'Wave' | 'Virement' | 'Chèque';
export type UrgenceLevel = 'Haute' | 'Normale' | 'Basse';

export interface PaiementRow {
  id: string;
  chantier: string;
  jalon: string;
  beneficiaire: string;
  montant: number;
  mode: PaiementMode;
  statut: PaiementStatut;
  pieces: string[];
  urgence: UrgenceLevel;
  segment?: string;
}

// ---------------------------------------------------------------------------
// Données mock (à brancher sur API)
// ---------------------------------------------------------------------------

const PAIEMENTS_MOCK: PaiementRow[] = [
  {
    id: 'PAY-001',
    chantier: 'RENOV-042',
    jalon: '50%',
    beneficiaire: 'Ouvriers équipe 1',
    montant: 450_000,
    mode: 'Orange Money',
    statut: 'En attente',
    pieces: ['Facture', 'PV jalon', 'Photos GPS'],
    urgence: 'Haute',
    segment: 'Diaspora',
  },
  {
    id: 'PAY-002',
    chantier: 'AMEN-015',
    jalon: '25%',
    beneficiaire: 'Quincaillerie Peinture Dakar',
    montant: 320_000,
    mode: 'Virement',
    statut: 'En attente',
    pieces: ['Facture', 'BL fournisseur'],
    urgence: 'Normale',
    segment: 'Établissements',
  },
  {
    id: 'PAY-003',
    chantier: 'REPAR-022',
    jalon: '75%',
    beneficiaire: 'M. Sow (artisan)',
    montant: 180_000,
    mode: 'Wave',
    statut: 'En attente',
    pieces: ['Facture', 'PV jalon'],
    urgence: 'Normale',
    segment: 'Particuliers',
  },
  {
    id: 'PAY-004',
    chantier: 'RENOV-033',
    jalon: '100%',
    beneficiaire: 'Équipe finition',
    montant: 300_000,
    mode: 'Orange Money',
    statut: 'En attente',
    pieces: ['Facture', 'PV réception'],
    urgence: 'Haute',
    segment: 'Diaspora',
  },
  {
    id: 'PAY-005',
    chantier: 'AMEN-008',
    jalon: '50%',
    beneficiaire: 'SARL Dakar Pro',
    montant: 1_400_000,
    mode: 'Virement',
    statut: 'En attente',
    pieces: ['Facture', 'PV jalon', 'BL'],
    urgence: 'Normale',
    segment: 'Établissements',
  },
];

const STATUT_OPTIONS: PaiementStatut[] = ['En attente', 'Validé', 'Refusé'];
const MODE_OPTIONS = ['Tous', 'Orange Money', 'Wave', 'Virement', 'Chèque'];
const URGENCE_OPTIONS = ['Toutes', 'Haute', 'Normale', 'Basse'];
const SEGMENT_OPTIONS = ['Tous', 'Diaspora', 'Commerçants', 'Établissements', 'Particuliers'];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatCFA(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// ---------------------------------------------------------------------------
// Sous-composants
// ---------------------------------------------------------------------------

function FilterSelect({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col text-[11px] space-y-1">
      <span className="text-slate-400">{label}</span>
      <select
        className="h-8 min-w-[140px] bg-slate-900 border border-slate-700 rounded-md px-2 text-[11px] text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

const Th = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <th className={cn('text-left py-2 px-3 font-medium text-slate-400', className)}>{children}</th>
);

const Td = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <td className={cn('py-2 px-3 align-top', className)}>{children}</td>
);

function UrgenceBadge({ level }: { level: UrgenceLevel }) {
  const map: Record<UrgenceLevel, string> = {
    Haute: 'bg-rose-500/20 text-rose-300',
    Normale: 'bg-amber-500/20 text-amber-300',
    Basse: 'bg-slate-500/20 text-slate-300',
  };
  return (
    <span
      className={cn(
        'px-2 py-0.5 rounded-full text-[10px] font-semibold',
        map[level] ?? 'bg-slate-700/60 text-slate-200'
      )}
    >
      {level}
    </span>
  );
}

function PaiementActions({
  paiement,
  onValider,
  onRefuser,
  onDemanderPieces,
  onEnvoyerHuissier,
}: {
  paiement: PaiementRow;
  onValider?: (p: PaiementRow) => void;
  onRefuser?: (p: PaiementRow) => void;
  onDemanderPieces?: (p: PaiementRow) => void;
  onEnvoyerHuissier?: (p: PaiementRow) => void;
}) {
  const handleValider = useCallback(() => onValider?.(paiement), [paiement, onValider]);
  const handleRefuser = useCallback(() => onRefuser?.(paiement), [paiement, onRefuser]);
  const handleDemanderPieces = useCallback(() => onDemanderPieces?.(paiement), [paiement, onDemanderPieces]);
  const handleHuissier = useCallback(() => onEnvoyerHuissier?.(paiement), [paiement, onEnvoyerHuissier]);

  if (paiement.statut !== 'En attente') {
    return <span className="text-[10px] text-slate-500">{paiement.statut}</span>;
  }

  return (
    <div className="flex justify-end flex-wrap gap-1 text-[10px]">
      <button
        type="button"
        className="px-2 py-1 rounded-md bg-emerald-600/80 hover:bg-emerald-600 text-white transition-colors"
        onClick={handleValider}
        aria-label={`Valider ${paiement.id}`}
      >
        Valider
      </button>
      <button
        type="button"
        className="px-2 py-1 rounded-md bg-amber-600/80 hover:bg-amber-600 text-white transition-colors"
        onClick={handleDemanderPieces}
        aria-label={`Demander pièces ${paiement.id}`}
      >
        Demander pièces
      </button>
      <button
        type="button"
        className="px-2 py-1 rounded-md bg-rose-600/80 hover:bg-rose-600 text-white transition-colors"
        onClick={handleRefuser}
        aria-label={`Refuser ${paiement.id}`}
      >
        Refuser
      </button>
      <button
        type="button"
        className="px-2 py-1 rounded-md bg-slate-600/80 hover:bg-slate-600 text-white transition-colors"
        onClick={handleHuissier}
        aria-label={`Envoyer à l'huissier ${paiement.id}`}
      >
        Huissier
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export interface ValidationPaiementsPageProps {
  data?: { paiements?: PaiementRow[] };
}

export function ValidationPaiementsPage({ data: apiData }: ValidationPaiementsPageProps = {}) {
  const paiementsSource = apiData?.paiements ?? PAIEMENTS_MOCK;

  const [statutFilter, setStatutFilter] = useState<string>('En attente');
  const [modeFilter, setModeFilter] = useState<string>('Tous');
  const [urgenceFilter, setUrgenceFilter] = useState<string>('Toutes');
  const [segmentFilter, setSegmentFilter] = useState<string>('Tous');

  const filteredPaiements = useMemo(() => {
    return paiementsSource.filter((p) => {
      if (statutFilter !== 'Tous' && statutFilter !== p.statut) return false;
      if (modeFilter !== 'Tous' && modeFilter !== p.mode) return false;
      if (urgenceFilter !== 'Toutes' && urgenceFilter !== p.urgence) return false;
      if (segmentFilter !== 'Tous' && segmentFilter !== (p.segment ?? '')) return false;
      return true;
    });
  }, [paiementsSource, statutFilter, modeFilter, urgenceFilter, segmentFilter]);

  const summary = useMemo(() => {
    const enAttente = filteredPaiements.filter((p) => p.statut === 'En attente');
    const montantTotal = enAttente.reduce((acc, p) => acc + p.montant, 0);
    return { count: enAttente.length, montantTotal };
  }, [filteredPaiements]);

  const handleReinitFilters = useCallback(() => {
    setStatutFilter('En attente');
    setModeFilter('Tous');
    setUrgenceFilter('Toutes');
    setSegmentFilter('Tous');
  }, []);

  const handleValider = useCallback((p: PaiementRow) => {
    // TODO: appel API
    console.log('Valider', p.id);
  }, []);
  const handleRefuser = useCallback((p: PaiementRow) => {
    console.log('Refuser', p.id);
  }, []);
  const handleDemanderPieces = useCallback((p: PaiementRow) => {
    console.log('Demander pièces', p.id);
  }, []);
  const handleEnvoyerHuissier = useCallback((p: PaiementRow) => {
    console.log('Envoyer à l\'huissier', p.id);
  }, []);

  const formatMontantTotal = (n: number) =>
    n >= 1e6 ? `${(n / 1e6).toFixed(2)}M XOF` : `${(n / 1e3).toFixed(0)}K XOF`;

  return (
    <DashboardPageLayout maxWidth="full" padding="md">
      <DashboardSection
        title="Validation des paiements"
        subtitle="Liste des paiements liés aux chantiers en attente de décision"
        action={
          <div className="flex items-center gap-3 text-[11px]">
            <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-700">
              En attente : <strong>{summary.count}</strong>
            </span>
            <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-700">
              Total : <strong>{formatMontantTotal(summary.montantTotal)}</strong>
            </span>
          </div>
        }
      >
        {null}
      </DashboardSection>
      <DashboardSection className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-wrap gap-4 items-end text-[11px]">
        <FilterSelect
          label="Statut"
          options={['En attente', 'Validé', 'Refusé', 'Tous']}
          value={statutFilter}
          onChange={setStatutFilter}
        />
        <FilterSelect
          label="Mode de paiement"
          options={MODE_OPTIONS}
          value={modeFilter}
          onChange={setModeFilter}
        />
        <FilterSelect
          label="Urgence"
          options={URGENCE_OPTIONS}
          value={urgenceFilter}
          onChange={setUrgenceFilter}
        />
        <FilterSelect
          label="Segment"
          options={SEGMENT_OPTIONS}
          value={segmentFilter}
          onChange={setSegmentFilter}
        />
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            className="h-8 px-3 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-200 text-[11px] transition-colors"
            onClick={handleReinitFilters}
          >
            Réinitialiser
          </button>
        </div>
      </DashboardSection>

      <DashboardSection className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-lg flex-1 flex flex-col min-h-0">
        <div className="p-4 border-b border-slate-800 text-sm font-semibold flex items-center justify-between shrink-0">
          <span>Paiements en attente de validation</span>
          <div className="flex items-center gap-2 text-[11px]">
            <span className="text-slate-400">Actions groupées :</span>
            <button
              type="button"
              className="px-3 py-1 rounded-lg bg-emerald-600/80 hover:bg-emerald-600 text-white transition-colors"
            >
              Valider tout
            </button>
            <button
              type="button"
              className="px-3 py-1 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-white transition-colors"
            >
              Mettre en attente
            </button>
          </div>
        </div>

        <div className="overflow-auto flex-1 min-h-0 max-h-[calc(100vh-340px)]">
          <table className="w-full text-[11px] border-collapse">
            <thead className="bg-slate-900 sticky top-0 z-10">
              <tr>
                <Th>Réf.</Th>
                <Th>Chantier</Th>
                <Th>Jalon</Th>
                <Th>Bénéficiaire</Th>
                <Th>Montant</Th>
                <Th>Mode</Th>
                <Th>Pièces</Th>
                <Th>Urgence</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {filteredPaiements.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 px-3 text-center text-slate-500">
                    Aucun paiement ne correspond aux filtres.
                  </td>
                </tr>
              ) : (
                filteredPaiements.map((p) => (
                  <tr
                    key={p.id}
                    className="border-t border-slate-800/70 hover:bg-slate-900/80 transition-colors"
                  >
                    <Td className="font-mono text-slate-300">{p.id}</Td>
                    <Td>{p.chantier}</Td>
                    <Td>{p.jalon}</Td>
                    <Td className="truncate max-w-[160px]" title={p.beneficiaire}>
                      {p.beneficiaire}
                    </Td>
                    <Td className="tabular-nums text-slate-200">{formatCFA(p.montant)}</Td>
                    <Td>{p.mode}</Td>
                    <Td>
                      <div className="flex flex-wrap gap-1">
                        {p.pieces.map((piece) => (
                          <span
                            key={piece}
                            className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px]"
                          >
                            {piece}
                          </span>
                        ))}
                      </div>
                    </Td>
                    <Td>
                      <UrgenceBadge level={p.urgence} />
                    </Td>
                    <Td className="text-right">
                      <PaiementActions
                        paiement={p}
                        onValider={handleValider}
                        onRefuser={handleRefuser}
                        onDemanderPieces={handleDemanderPieces}
                        onEnvoyerHuissier={handleEnvoyerHuissier}
                      />
                    </Td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </DashboardSection>
    </DashboardPageLayout>
  );
}

export default ValidationPaiementsPage;
