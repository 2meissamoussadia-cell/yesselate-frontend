/**
 * Portefeuille chantiers — Vue DG (ERP-BTP)
 *
 * Tableau + filtres (Segment, Prestation, Phase, Risque).
 * Résumé rapide (totaux chantiers, CA, retards).
 * Actions ligne : Voir, Prioriser, Bloquer, Envoyer à l'huissier.
 * Préparé pour clic vers fiche chantier / cockpit chantier.
 */

'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { cn } from '@/lib/cn';
import { Download, Plus, Eye, AlertTriangle, Ban, FileText, ChevronUp, ChevronDown } from 'lucide-react';
import { ChantierDetailModal } from '../modals/ChantierDetailModal';
import type { ChantierMock } from '../../data/chantiersMock';
import { FilterBar, ErpButton } from '@/components/erp';
import type { ErpFilters } from '@/components/erp';
import { useAlertToast } from '@/components/ui/toast';
import { toast } from 'sonner';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type RisqueLevel = 'Aucun' | 'Moyen' | 'Critique';

interface ChantierRow {
  id: string;
  client: string;
  segment: string;
  prestation: string;
  phase: string;
  sante: number;
  ca: number;
  retardJours: number;
  risque: RisqueLevel;
}

type SortKey = keyof ChantierRow;

type SummaryTone = 'neutral' | 'good' | 'bad';

// ---------------------------------------------------------------------------
// Données de référence (à brancher sur API)
// ---------------------------------------------------------------------------

const SEGMENTS = ['Tous', 'Diaspora', 'Commerçants', 'Commerce informel', 'Établissements', 'Particuliers'];
const PHASES = ['Toutes', 'Qualification', 'Étude technique', 'Contractualisation', 'Exécution', 'Réception', 'Clôture'];
const PRESTATIONS = ['Toutes', 'Rénovation', 'Réparations', 'Aménagement', 'Décoration', 'Assistance admin'];
const RISQUES = ['Tous', 'Aucun', 'Moyen', 'Critique'];

const CHANTIERS_MOCK: ChantierRow[] = [
  {
    id: 'RENOV-042',
    client: 'Famille Ndiaye',
    segment: 'Diaspora',
    prestation: 'Rénovation second œuvre',
    phase: 'Exécution',
    sante: 0.62,
    ca: 1_200_000,
    retardJours: 12,
    risque: 'Critique',
  },
  {
    id: 'REPAR-015',
    client: 'Boutique Médina',
    segment: 'Commerçants',
    prestation: 'Petites réparations',
    phase: 'Étude technique',
    sante: 0.81,
    ca: 450_000,
    retardJours: 0,
    risque: 'Moyen',
  },
  {
    id: 'AMEN-008',
    client: 'SARL Dakar Pro',
    segment: 'Établissements',
    prestation: 'Aménagement intérieur',
    phase: 'Contractualisation',
    sante: 0.95,
    ca: 2_800_000,
    retardJours: 0,
    risque: 'Aucun',
  },
  {
    id: 'REPAR-022',
    client: 'M. Sow',
    segment: 'Particuliers',
    prestation: 'Petites réparations',
    phase: 'Réception',
    sante: 0.78,
    ca: 320_000,
    retardJours: 3,
    risque: 'Moyen',
  },
  {
    id: 'RENOV-033',
    client: 'Famille Diallo',
    segment: 'Diaspora',
    prestation: 'Rénovation second œuvre',
    phase: 'Exécution',
    sante: 0.45,
    ca: 980_000,
    retardJours: 18,
    risque: 'Critique',
  },
];

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

/** Adapte une ligne portefeuille vers le format ChantierMock (modal détail / cockpit). */
function rowToChantierMock(row: ChantierRow): ChantierMock {
  const phaseMap: Record<string, number> = {
    Qualification: 5,
    'Étude technique': 10,
    Contractualisation: 15,
    Exécution: 19,
    Réception: 22,
    Clôture: 25,
  };
  return {
    id: row.id,
    segment: row.segment,
    prestation: row.prestation,
    phase: phaseMap[row.phase] ?? 0,
    ca: row.ca,
    marge: 0.23,
    sante: row.sante,
    gpsLive: false,
    bureauControle: '',
    photosGps: 0,
    photosManquantes: 0,
    chefChantierName: row.client,
  };
}

// ---------------------------------------------------------------------------
// Sous-composants
// ---------------------------------------------------------------------------

function SummaryCard({
  label,
  value,
  sub,
  tone = 'neutral',
}: {
  label: string;
  value: string;
  sub: string;
  tone?: SummaryTone;
}) {
  const border =
    tone === 'bad'
      ? 'border-rose-500/40 bg-rose-500/5'
      : tone === 'good'
        ? 'border-emerald-500/40 bg-emerald-500/5'
        : 'border-slate-700 bg-slate-900/60';

  return (
    <div className={cn('rounded-xl border p-4', border)}>
      <div className="text-slate-400 mb-1 text-[11px]">{label}</div>
      <div className="text-lg font-semibold mb-1">{value}</div>
      <div className="text-[11px] text-slate-400">{sub}</div>
    </div>
  );
}

function Th({
  children,
  className = '',
  sortKey,
  currentSortBy,
  currentSortDir,
  onSort,
}: {
  children: React.ReactNode;
  className?: string;
  sortKey?: SortKey;
  currentSortBy?: SortKey | null;
  currentSortDir?: 'asc' | 'desc';
  onSort?: (key: SortKey) => void;
}) {
  const isSorted = sortKey != null && currentSortBy === sortKey;
  const content = (
    <>
      {children}
      {sortKey != null && onSort && (
        <span className="inline-flex ml-1 opacity-70" aria-hidden>
          {isSorted ? (currentSortDir === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />) : <ChevronUp className="h-3 w-3 opacity-50" />}
        </span>
      )}
    </>
  );
  if (sortKey != null && onSort) {
    return (
      <th
        role="columnheader"
        aria-sort={isSorted ? (currentSortDir === 'asc' ? 'ascending' : 'descending') : undefined}
        className={cn('text-left py-2 px-3 font-medium text-slate-400 text-[11px] cursor-pointer select-none hover:text-slate-300 hover:bg-slate-800/50 transition-colors', className)}
        onClick={() => onSort(sortKey)}
      >
        {content}
      </th>
    );
  }
  return (
    <th className={cn('text-left py-2 px-3 font-medium text-slate-400 text-[11px]', className)}>
      {content}
    </th>
  );
}

function Td({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={cn('py-2 px-3 align-top text-[11px]', className)}>{children}</td>;
}

function HealthBar({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const color =
    pct >= 80 ? 'bg-emerald-500' : pct >= 60 ? 'bg-amber-500' : 'bg-rose-500';
  return (
    <div className="w-20 h-2 bg-slate-800 rounded-full overflow-hidden" title={`${pct}%`}>
      <div className={cn('h-full transition-all', color)} style={{ width: `${pct}%` }} />
    </div>
  );
}

function RiskBadge({ level }: { level: RisqueLevel }) {
  const map: Record<RisqueLevel, string> = {
    Aucun: 'bg-emerald-500/20 text-emerald-300',
    Moyen: 'bg-amber-500/20 text-amber-300',
    Critique: 'bg-rose-500/20 text-rose-300',
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

function ActionButtons({
  chantierId,
  onVoir,
  onPrioriser,
  onBloquer,
  onHuissier,
}: {
  chantierId: string;
  onVoir?: (id: string) => void;
  onPrioriser?: (id: string) => void;
  onBloquer?: (id: string) => void;
  onHuissier?: (id: string) => void;
}) {
  return (
    <div className="flex justify-end gap-1 flex-wrap text-[10px]">
      <button
        type="button"
        onClick={() => onVoir?.(chantierId)}
        className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200"
      >
        <Eye className="h-3 w-3" aria-hidden />
        Voir
      </button>
      <button
        type="button"
        onClick={() => onPrioriser?.(chantierId)}
        className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-amber-600/80 hover:bg-amber-600 text-white"
      >
        <AlertTriangle className="h-3 w-3" aria-hidden />
        Prioriser
      </button>
      <button
        type="button"
        onClick={() => onBloquer?.(chantierId)}
        className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-rose-600/80 hover:bg-rose-600 text-white"
      >
        <Ban className="h-3 w-3" aria-hidden />
        Bloquer
      </button>
      <button
        type="button"
        onClick={() => onHuissier?.(chantierId)}
        className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-700 hover:bg-slate-600 text-slate-200"
        title="Envoyer à l'huissier"
      >
        <FileText className="h-3 w-3" aria-hidden />
        Huissier
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page principale
// ---------------------------------------------------------------------------

const INITIAL_FILTERS: ErpFilters = {
  programme: '',
  statut: '',
  priorite: '',
  gravite: '',
};

const RISQUE_ORDER: Record<RisqueLevel, number> = { Aucun: 0, Moyen: 1, Critique: 2 };

export function PortefeuilleChantiersPage() {
  const [filters, setFilters] = useState<ErpFilters>(INITIAL_FILTERS);
  const [sortBy, setSortBy] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [selectedChantier, setSelectedChantier] = useState<ChantierRow | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    type: ConfirmActionType;
    chantierId: string;
  } | null>(null);
  const [exporting, setExporting] = useState(false);

  const toggleSort = useCallback((key: SortKey) => {
    setSortBy((prev) => {
      if (prev === key) {
        setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
        return key;
      }
      setSortDir('asc');
      return key;
    });
  }, []);

  const onVoir = useCallback((id: string) => {
    const row = CHANTIERS_MOCK.find((c) => c.id === id) ?? null;
    setSelectedChantier(row);
  }, []);

  const onPrioriser = useCallback((id: string) => {
    setConfirmAction({ type: 'prioriser', chantierId: id });
  }, []);

  const onBloquer = useCallback((id: string) => {
    setConfirmAction({ type: 'bloquer', chantierId: id });
  }, []);

  const onHuissier = useCallback((id: string) => {
    setConfirmAction({ type: 'huissier', chantierId: id });
  }, []);

  const onConfirmAction = useCallback(() => {
    if (!confirmAction) return;
    // TODO: appels API réels (prioriser / bloquer / huissier)
    setConfirmAction(null);
  }, [confirmAction]);

  const onCancelConfirm = useCallback(() => {
    setConfirmAction(null);
  }, []);

  const onFilterChange = useCallback((key: string, value: unknown) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const filterOptions = useMemo(
    () => ({
      programmes: SEGMENTS.map((s) => ({ value: s === 'Tous' ? '' : s, label: s })),
      statuts: PHASES,
      priorites: PRESTATIONS,
      gravites: RISQUES,
    }),
    []
  );

  // Filtrage côté client (à remplacer par API)
  const filtered = CHANTIERS_MOCK.filter((c) => {
    const programme = String(filters.programme ?? '');
    const statut = String(filters.statut ?? '');
    const priorite = String(filters.priorite ?? '');
    const gravite = String(filters.gravite ?? '');
    if (programme && programme !== 'Tous' && c.segment !== programme) return false;
    if (statut && statut !== 'Toutes' && c.phase !== statut) return false;
    if (priorite && priorite !== 'Toutes' && !c.prestation.toLowerCase().includes(priorite.toLowerCase())) return false;
    if (gravite && gravite !== 'Tous' && c.risque !== gravite) return false;
    return true;
  });

  // Tri côté client (audit : tri tableau chantiers)
  const sortedRows = useMemo(() => {
    if (!sortBy) return filtered;
    const dir = sortDir === 'asc' ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const va = a[sortBy];
      const vb = b[sortBy];
      if (sortBy === 'risque') {
        const na = RISQUE_ORDER[(va as RisqueLevel) ?? 'Aucun'];
        const nb = RISQUE_ORDER[(vb as RisqueLevel) ?? 'Aucun'];
        return (na - nb) * dir;
      }
      if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * dir;
      return String(va ?? '').localeCompare(String(vb ?? ''), 'fr') * dir;
    });
  }, [filtered, sortBy, sortDir]);

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-50">
      {/* HEADER */}
      <header className="h-16 flex-shrink-0 flex items-center justify-between px-6 sm:px-8 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
        <div>
          <div className="text-lg font-semibold">Portefeuille chantiers</div>
          <div className="text-[11px] text-slate-400">
            Vue consolidée des chantiers (DG)
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ErpButton
            variant="default"
            size="sm"
            className="border border-slate-700"
            onClick={() => toast.info('Nouveau chantier', { description: 'Formulaire de création à venir. En attendant, contactez l’équipe projet.' })}
          >
            <Plus className="h-3.5 w-3.5" aria-hidden />
            Nouveau chantier
          </ErpButton>
          <ErpButton
            variant="outline"
            size="sm"
            loading={exporting}
            onClick={() => {
              setExporting(true);
              setTimeout(() => {
                setExporting(false);
                toast.exportSuccess('CSV');
              }, 1200);
            }}
          >
            <Download className="h-3.5 w-3.5" aria-hidden />
            Exporter
          </ErpButton>
        </div>
      </header>

      {/* CONTENT */}
      <main className="flex-1 overflow-y-auto px-6 sm:px-8 py-6 space-y-6">
        {/* FILTRES ERP (FilterBar réutilisable) */}
        <FilterBar
          filters={filters}
          onFilterChange={onFilterChange}
          options={{
            programmes: filterOptions.programmes,
            statuts: filterOptions.statuts,
            priorites: filterOptions.priorites,
            gravites: filterOptions.gravites,
          }}
          hideSections={['dates', 'avances', 'savedViews']}
          className="rounded-2xl border border-slate-800/60 bg-slate-900/80"
        />

        {/* RÉSUMÉ */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4" aria-label="Résumé">
          <SummaryCard
            label="Chantiers actifs"
            value={String(filtered.length)}
            sub="dont 18 Diaspora, 24 locaux"
          />
          <SummaryCard
            label="CA total chantiers"
            value={formatCFA(filtered.reduce((s, c) => s + c.ca, 0))}
            sub="Marge nette moyenne 23%"
          />
          <SummaryCard
            label="Projets en retard"
            value={String(filtered.filter((c) => c.retardJours > 0).length)}
            sub="retard moyen 8 jours"
            tone="bad"
          />
        </section>

        {/* TABLEAU PRINCIPAL */}
        <section
          className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-lg"
          aria-labelledby="table-title"
        >
          <div id="table-title" className="p-4 border-b border-slate-800 text-sm font-semibold">
            Liste des chantiers (vue DG)
          </div>
          <div className="overflow-auto max-h-[calc(100vh-320px)]">
            <table className="w-full text-[11px]">
              <thead className="bg-slate-900 sticky top-0 z-10">
                <tr>
                  <Th sortKey="id" currentSortBy={sortBy} currentSortDir={sortDir} onSort={toggleSort}>Chantier</Th>
                  <Th sortKey="client" currentSortBy={sortBy} currentSortDir={sortDir} onSort={toggleSort}>Client</Th>
                  <Th sortKey="segment" currentSortBy={sortBy} currentSortDir={sortDir} onSort={toggleSort}>Segment</Th>
                  <Th sortKey="prestation" currentSortBy={sortBy} currentSortDir={sortDir} onSort={toggleSort}>Prestation</Th>
                  <Th sortKey="phase" currentSortBy={sortBy} currentSortDir={sortDir} onSort={toggleSort}>Phase</Th>
                  <Th sortKey="sante" currentSortBy={sortBy} currentSortDir={sortDir} onSort={toggleSort}>Santé</Th>
                  <Th sortKey="ca" currentSortBy={sortBy} currentSortDir={sortDir} onSort={toggleSort}>CA</Th>
                  <Th sortKey="retardJours" currentSortBy={sortBy} currentSortDir={sortDir} onSort={toggleSort}>Retard</Th>
                  <Th sortKey="risque" currentSortBy={sortBy} currentSortDir={sortDir} onSort={toggleSort}>Risque</Th>
                  <Th className="text-right">Actions</Th>
                </tr>
              </thead>
              <tbody>
                {sortedRows.map((c) => (
                  <tr
                    key={c.id}
                    className="border-t border-slate-800/70 hover:bg-slate-900/80 transition-colors"
                  >
                    <Td>
                      <span className="font-medium text-slate-200">{c.id}</span>
                    </Td>
                    <Td>{c.client}</Td>
                    <Td>{c.segment}</Td>
                    <Td className="truncate max-w-[160px]" title={c.prestation}>
                      {c.prestation}
                    </Td>
                    <Td>{c.phase}</Td>
                    <Td>
                      <HealthBar value={c.sante} />
                    </Td>
                    <Td>{formatCFA(c.ca)}</Td>
                    <Td
                      className={
                        c.retardJours > 0 ? 'text-rose-400 font-medium' : 'text-emerald-400'
                      }
                    >
                      {c.retardJours > 0 ? `${c.retardJours} j` : 'On time'}
                    </Td>
                    <Td>
                      <RiskBadge level={c.risque} />
                    </Td>
                    <Td className="text-right">
                      <ActionButtons
                        chantierId={c.id}
                        onVoir={onVoir}
                        onPrioriser={onPrioriser}
                        onBloquer={onBloquer}
                        onHuissier={onHuissier}
                      />
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="p-8 text-center text-slate-400 text-sm">
              Aucun chantier ne correspond aux filtres.
            </div>
          )}
        </section>
      </main>

      {/* Modal détail chantier (fiche / cockpit) */}
      {selectedChantier && (
        <ChantierDetailModal
          chantier={rowToChantierMock(selectedChantier)}
          onClose={() => setSelectedChantier(null)}
        />
      )}

      {/* Modal confirmation action (prioriser / bloquer / huissier) */}
      {confirmAction && (
        <ConfirmActionModal
          type={confirmAction.type}
          chantierId={confirmAction.chantierId}
          onConfirm={onConfirmAction}
          onCancel={onCancelConfirm}
        />
      )}
    </div>
  );
}

export default PortefeuilleChantiersPage;
