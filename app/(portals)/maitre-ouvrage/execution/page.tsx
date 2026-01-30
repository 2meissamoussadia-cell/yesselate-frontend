'use client';

/**
 * Suivi Exécution Chantier — Phase 6–8 : DPR, avancement, planning, coûts.
 * KPIs, tableau chantiers, tableau rapports journaliers, modal Nouveau rapport (DPR).
 */

import { useState, useMemo, useCallback } from 'react';
import { BusinessWindow } from '@/components/ui/BusinessWindow';
import { CommandBar } from '@/components/ui/CommandBar';
import { KPICard } from '@/modules/dashboard/components/shared/KPICard';
import type { KPICardData } from '@/modules/dashboard/components/shared/KPICard';
import { ErpDataTable } from '@/components/erp/ErpDataTable';
import type { ErpColumnDef } from '@/components/erp/types';
import { DailyReportModal, type DailyReportRow } from '@/components/bmo/execution';
import { ChantierModal, type ChantierRow } from '@/components/bmo/chantiers';
import { Plus, Filter, Download, FileText, MapPin, AlertTriangle, TrendingUp } from 'lucide-react';
import type { DailyReportFormData } from '@/components/bmo/execution';

// Chantiers pour le tableau (avec ville, phase exécution, nb non-conformités)
interface ExecutionChantierRow extends ChantierRow {
  ville?: string;
  phaseExecution?: string;
  nbNonConformites?: number;
}

const INITIAL_CHANTIERS: ExecutionChantierRow[] = [
  {
    id: '1',
    code: 'CH-2026-001-GO',
    projet: 'Immeuble Almadies',
    lot: 'Gros œuvre',
    entreprise: 'Entreprise NDIAYE',
    statut: 'En cours',
    avancement: 45,
    budgetLot: 1_450_000_000,
    realise: 620_000_000,
    dateDebut: '2026-01-15',
    dateFinPrevue: '2026-08-30',
    retardJours: 0,
    ville: 'Dakar',
    phaseExecution: 'GO',
    nbNonConformites: 3,
  },
  {
    id: '2',
    code: 'CH-2026-002-CVC',
    projet: 'Hôtel Saly',
    lot: 'CVC',
    entreprise: 'Climax Sénégal',
    statut: 'En retard',
    avancement: 20,
    budgetLot: 220_000_000,
    realise: 48_000_000,
    dateDebut: '2026-02-01',
    dateFinPrevue: '2026-05-15',
    retardJours: 12,
    ville: 'Saly',
    phaseExecution: 'SO',
    nbNonConformites: 1,
  },
];

const INITIAL_RAPPORTS: DailyReportRow[] = [
  { id: '1', chantierCode: 'CH-2026-001-GO', chantierNom: 'Immeuble Almadies', date: '2026-01-28', numeroRapport: 'DPR-001-028', chefChantier: 'M. Ndiaye', entreprisePrincipale: 'Entreprise NDIAYE' },
  { id: '2', chantierCode: 'CH-2026-001-GO', chantierNom: 'Immeuble Almadies', date: '2026-01-27', numeroRapport: 'DPR-001-027', chefChantier: 'M. Ndiaye', entreprisePrincipale: 'Entreprise NDIAYE' },
  { id: '3', chantierCode: 'CH-2026-002-CVC', chantierNom: 'Hôtel Saly', date: '2026-01-28', numeroRapport: 'DPR-002-028', chefChantier: 'M. Fall', entreprisePrincipale: 'Climax Sénégal' },
];

function getEcartPct(realise: number, budget: number): number {
  if (!budget) return 0;
  return Math.round(((realise - budget) / budget) * 1000) / 10;
}

const chantierColumns: ErpColumnDef<ExecutionChantierRow>[] = [
  { id: 'code', header: 'Code chantier', accessorKey: 'code', width: 140 },
  { id: 'projet', header: 'Nom', accessorKey: 'projet', width: 180 },
  { id: 'ville', header: 'Ville', accessorKey: 'ville', width: 100 },
  {
    id: 'phaseExecution',
    header: 'Phase',
    width: 100,
    cell: (row) => (
      <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[0.65rem] text-slate-200">
        {row.phaseExecution ?? row.lot}
      </span>
    ),
  },
  {
    id: 'avancement',
    header: 'Avancement %',
    width: 110,
    align: 'right',
    cell: (row) => <span className="tabular-nums text-slate-200">{row.avancement} %</span>,
  },
  {
    id: 'retardJours',
    header: 'Déviation (j)',
    width: 110,
    align: 'right',
    cell: (row) => (
      <span className={row.retardJours > 0 ? 'tabular-nums text-red-300' : 'tabular-nums text-slate-400'}>
        {row.retardJours > 0 ? `+${row.retardJours}` : '0'}
      </span>
    ),
  },
  {
    id: 'ecart',
    header: 'Coût vs budget %',
    width: 120,
    align: 'right',
    cell: (row) => {
      const pct = getEcartPct(row.realise, row.budgetLot);
      const cls = pct > 10 ? 'text-red-300' : pct > 0 ? 'text-amber-300' : 'text-emerald-300';
      return <span className={`tabular-nums text-[0.75rem] ${cls}`}>{pct > 0 ? '+' : ''}{pct} %</span>;
    },
  },
  {
    id: 'nbNonConformites',
    header: 'Non-conformités',
    width: 120,
    align: 'right',
    cell: (row) => (
      <span className={row.nbNonConformites && row.nbNonConformites > 0 ? 'tabular-nums text-amber-300' : 'tabular-nums text-slate-400'}>
        {row.nbNonConformites ?? 0}
      </span>
    ),
  },
];

const rapportColumns: ErpColumnDef<DailyReportRow>[] = [
  { id: 'date', header: 'Date', accessorKey: 'date', width: 110 },
  { id: 'chantierNom', header: 'Chantier', accessorKey: 'chantierNom', width: 180 },
  { id: 'numeroRapport', header: 'N° rapport', accessorKey: 'numeroRapport', width: 120 },
  { id: 'chefChantier', header: 'Chef de chantier', accessorKey: 'chefChantier', width: 140 },
  { id: 'entreprisePrincipale', header: 'Entreprise', accessorKey: 'entreprisePrincipale', width: 150 },
];

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function ExecutionPage() {
  const [chantiers, setChantiers] = useState<ExecutionChantierRow[]>(INITIAL_CHANTIERS);
  const [rapports, setRapports] = useState<DailyReportRow[]>(INITIAL_RAPPORTS);
  const [selectedChantier, setSelectedChantier] = useState<ChantierRow | null>(null);
  const [selectedRapport, setSelectedRapport] = useState<DailyReportRow | null>(null);
  const [dprModalOpen, setDprModalOpen] = useState(false);
  const [chantierForNewDpr, setChantierForNewDpr] = useState<{ code: string; nom: string } | undefined>();
  /** Filtre date rapports : null = toutes les dates, sinon YYYY-MM-DD (ex. rapports du jour) */
  const [filterDateRapports, setFilterDateRapports] = useState<string | null>(null);

  const handleSaveChantier = useCallback((row: ChantierRow) => {
    setChantiers((prev) => prev.map((r) => (r.id === row.id ? { ...r, ...row } : r)));
    setSelectedChantier(null);
  }, []);

  const handleSaveDpr = useCallback((data: DailyReportFormData) => {
    const row: DailyReportRow = {
      id: selectedRapport?.id ?? String(rapports.length + 1),
      chantierCode: data.chantierCode ?? '',
      chantierNom: data.chantierNom ?? '',
      date: data.date ?? '',
      numeroRapport: data.numeroRapport ?? `DPR-${Date.now()}`,
      chefChantier: data.chefChantier ?? '',
      entreprisePrincipale: data.entreprisePrincipale,
    };
    setRapports((prev) =>
      selectedRapport ? prev.map((r) => (r.id === selectedRapport.id ? row : r)) : [row, ...prev]
    );
    setDprModalOpen(false);
    setSelectedRapport(null);
    setChantierForNewDpr(undefined);
  }, [rapports.length, selectedRapport]);

  const openNewDpr = useCallback((chantier?: { code: string; nom: string }) => {
    setChantierForNewDpr(chantier);
    setSelectedRapport(null);
    setDprModalOpen(true);
  }, []);

  const openEditDpr = useCallback((report: DailyReportRow) => {
    setSelectedRapport(report);
    setChantierForNewDpr(undefined);
    setDprModalOpen(true);
  }, []);

  const rapportsFiltres = useMemo(() => {
    if (!filterDateRapports) return rapports;
    return rapports.filter((r) => r.date === filterDateRapports);
  }, [rapports, filterDateRapports]);

  const voirRapportsDuJour = useCallback(() => {
    setFilterDateRapports(todayISO());
  }, []);

  const avancementMoyen = useMemo(() => {
    if (chantiers.length === 0) return 0;
    return Math.round(chantiers.reduce((s, c) => s + c.avancement, 0) / chantiers.length);
  }, [chantiers]);

  const retardsCritiques = useMemo(() => chantiers.filter((c) => c.retardJours > 7).length, [chantiers]);

  const kpis: KPICardData[] = useMemo(
    () => [
      { id: 'ouverts', label: 'Chantiers ouverts', value: String(chantiers.filter((c) => c.statut !== 'Clôturé').length), icon: FileText, color: 'blue' },
      { id: 'avancement', label: 'Avancement moyen %', value: `${avancementMoyen} %`, icon: TrendingUp, color: 'emerald' },
      { id: 'retards', label: 'Retards critiques', value: String(retardsCritiques), icon: AlertTriangle, color: retardsCritiques > 0 ? 'rose' : 'blue' },
      { id: 'incidents', label: 'Incidents HSE (mois)', value: '2', icon: AlertTriangle, color: 'amber' },
    ],
    [chantiers, avancementMoyen, retardsCritiques]
  );

  const commandBarActions = useMemo(
    () => [
      { id: 'new-dpr', label: 'Nouveau rapport journalier', icon: Plus, onClick: () => openNewDpr() },
      { id: 'rapports-jour', label: 'Voir rapports du jour', icon: FileText, onClick: voirRapportsDuJour },
      { id: 'import', label: 'Importer rapport', icon: Download, onClick: () => {} },
      { id: 'carte', label: 'Afficher carte chantiers', icon: MapPin, onClick: () => {} },
    ],
    [openNewDpr, voirRapportsDuJour]
  );

  return (
    <>
      <BusinessWindow title="Suivi Exécution Chantier — Phase 6–8 (DPR, avancement)">
        <CommandBar actions={commandBarActions} />

        <div className="grid grid-cols-2 gap-3 mb-4 sm:grid-cols-4">
          {kpis.map((kpi) => (
            <KPICard key={kpi.id} kpi={kpi} size="sm" />
          ))}
        </div>

        <section className="mb-6">
          <h3 className="text-xs font-medium text-slate-400 mb-2">Chantiers</h3>
          <ErpDataTable<ExecutionChantierRow>
            data={chantiers}
            columns={chantierColumns}
            getRowId={(row) => row.id}
            onRowClick={(row) => setSelectedChantier(row)}
            maxHeight="280px"
          />
          <div className="flex justify-end mt-2">
            <button
              type="button"
              className="text-xs text-slate-400 hover:text-slate-200"
              onClick={() => openNewDpr()}
            >
              + Nouveau rapport pour un chantier
            </button>
          </div>
        </section>

        <section>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <h3 className="text-xs font-medium text-slate-400">
              {filterDateRapports
                ? `Rapports du ${new Date(filterDateRapports + 'T12:00:00').toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}`
                : 'Rapports journaliers (DPR)'}
            </h3>
            <div className="flex items-center gap-2 text-xs">
              <label className="text-slate-500">Date :</label>
              <input
                type="date"
                value={filterDateRapports ?? ''}
                onChange={(e) => setFilterDateRapports(e.target.value || null)}
                className="h-8 rounded-md border border-slate-700 bg-slate-900/80 px-2 text-slate-200 text-[0.75rem]"
              />
              <button
                type="button"
                onClick={() => setFilterDateRapports(todayISO())}
                className="px-2 py-1 rounded border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 text-[0.7rem]"
              >
                Aujourd'hui
              </button>
              <button
                type="button"
                onClick={() => setFilterDateRapports(null)}
                className="px-2 py-1 rounded border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 text-[0.7rem]"
              >
                Toutes les dates
              </button>
            </div>
          </div>
          <ErpDataTable<DailyReportRow>
            data={rapportsFiltres}
            columns={rapportColumns}
            getRowId={(row) => row.id}
            onRowClick={(row) => openEditDpr(row)}
            maxHeight="280px"
          />
        </section>
      </BusinessWindow>

      <ChantierModal
        open={!!selectedChantier}
        onClose={() => setSelectedChantier(null)}
        chantier={selectedChantier}
        onSave={handleSaveChantier}
      />

      <DailyReportModal
        open={dprModalOpen}
        onClose={() => {
          setDprModalOpen(false);
          setSelectedRapport(null);
          setChantierForNewDpr(undefined);
        }}
        report={selectedRapport}
        chantierPreselection={chantierForNewDpr}
        onSave={handleSaveDpr}
      />
    </>
  );
}
