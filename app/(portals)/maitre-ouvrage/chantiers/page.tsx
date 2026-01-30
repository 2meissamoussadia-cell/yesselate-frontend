'use client';

/**
 * Chantiers & Suivi — Phases 6–8 : Lancement → Exécution → Fin de chantier.
 * Tableau chantiers, KPIs, fiche chantier (ChantierModal) : Général, Planning, Coûts, Points de suivi.
 */

import { useState, useMemo, useCallback } from 'react';
import { BusinessWindow } from '@/components/ui/BusinessWindow';
import { CommandBar } from '@/components/ui/CommandBar';
import { KPICard } from '@/modules/dashboard/components/shared/KPICard';
import type { KPICardData } from '@/modules/dashboard/components/shared/KPICard';
import { ErpDataTable } from '@/components/erp/ErpDataTable';
import type { ErpColumnDef } from '@/components/erp/types';
import { ChantierModal, type ChantierRow } from '@/components/bmo/chantiers';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Filter, Download, FolderKanban, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

const INITIAL_CHANTIERS: ChantierRow[] = [
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
  },
  {
    id: '3',
    code: 'CH-2026-003-VRD',
    projet: 'Résidence Les Mamelles',
    lot: 'VRD',
    entreprise: 'BTP Dakar',
    statut: 'Préparation',
    avancement: 0,
    budgetLot: 85_000_000,
    realise: 0,
    dateDebut: '2026-04-01',
    dateFinPrevue: '2026-06-30',
    retardJours: 0,
  },
];

function formatBudgetFCFA(value: number): string {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1).replace('.', ',')} Md FCFA`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(0)} M FCFA`;
  return value.toLocaleString('fr-FR', { maximumFractionDigits: 0 }) + ' FCFA';
}

function getEcartPct(realise: number, budget: number): number {
  if (!budget) return 0;
  return Math.round(((realise - budget) / budget) * 1000) / 10;
}

const columns: ErpColumnDef<ChantierRow>[] = [
  { id: 'code', header: 'Code', accessorKey: 'code', width: 130 },
  { id: 'projet', header: 'Projet', accessorKey: 'projet', width: 170 },
  { id: 'lot', header: 'Lot', accessorKey: 'lot', width: 110 },
  { id: 'entreprise', header: 'Entreprise', accessorKey: 'entreprise', width: 150 },
  {
    id: 'statut',
    header: 'Statut',
    width: 110,
    cell: (row) => (
      <span
        className={
          row.statut === 'Clôturé'
            ? 'rounded-full bg-emerald-900/40 px-2 py-0.5 text-[0.65rem] text-emerald-200'
            : row.statut === 'En retard'
              ? 'rounded-full bg-red-900/40 px-2 py-0.5 text-[0.65rem] text-red-200'
              : row.statut === 'En cours'
                ? 'rounded-full bg-amber-900/40 px-2 py-0.5 text-[0.65rem] text-amber-200'
                : 'rounded-full bg-slate-700 px-2 py-0.5 text-[0.65rem] text-slate-300'
        }
      >
        {row.statut}
      </span>
    ),
  },
  {
    id: 'avancement',
    header: 'Avancement',
    width: 100,
    align: 'right',
    cell: (row) => <span className="tabular-nums text-slate-200">{row.avancement} %</span>,
  },
  {
    id: 'budgetLot',
    header: 'Budget (FCFA)',
    width: 120,
    align: 'right',
    cell: (row) => <span className="tabular-nums text-[0.75rem] text-slate-300">{formatBudgetFCFA(row.budgetLot)}</span>,
  },
  {
    id: 'realise',
    header: 'Réalisé (FCFA)',
    width: 120,
    align: 'right',
    cell: (row) => <span className="tabular-nums text-[0.75rem] text-slate-200">{formatBudgetFCFA(row.realise)}</span>,
  },
  {
    id: 'ecart',
    header: 'Écart vs budget',
    width: 110,
    align: 'right',
    cell: (row) => {
      const pct = getEcartPct(row.realise, row.budgetLot);
      const cls = pct > 10 ? 'text-red-300' : pct > 0 ? 'text-amber-300' : 'text-emerald-300';
      return <span className={`tabular-nums text-[0.75rem] ${cls}`}>{pct > 0 ? '+' : ''}{pct} %</span>;
    },
  },
  { id: 'dateFinPrevue', header: 'Fin prévue', accessorKey: 'dateFinPrevue', width: 110 },
  {
    id: 'retardJours',
    header: 'Retard (j)',
    width: 80,
    align: 'right',
    cell: (row) => (
      <span className={row.retardJours > 0 ? 'tabular-nums text-red-300' : 'tabular-nums text-slate-400'}>
        {row.retardJours > 0 ? row.retardJours : '—'}
      </span>
    ),
  },
];

const STATUT_OPTIONS = [
  { value: 'all', label: 'Tous' },
  { value: 'Préparation', label: 'Préparation' },
  { value: 'En cours', label: 'En cours' },
  { value: 'En retard', label: 'En retard' },
  { value: 'Suspendu', label: 'Suspendu' },
  { value: 'Clôturé', label: 'Clôturé' },
];

export default function ChantiersPage() {
  const [chantiers, setChantiers] = useState<ChantierRow[]>(INITIAL_CHANTIERS);
  const [selected, setSelected] = useState<ChantierRow | null>(null);
  const [filterStatut, setFilterStatut] = useState('all');

  const filteredData = useMemo(() => {
    if (filterStatut === 'all') return chantiers;
    return chantiers.filter((r) => r.statut === filterStatut);
  }, [chantiers, filterStatut]);

  const handleSaveDetail = useCallback((row: ChantierRow) => {
    setChantiers((prev) => prev.map((r) => (r.id === row.id ? row : r)));
    setSelected(null);
  }, []);

  const kpis: KPICardData[] = useMemo(
    () => [
      { id: 'total', label: 'Chantiers actifs', value: String(chantiers.filter((c) => c.statut !== 'Clôturé').length), icon: FolderKanban, color: 'blue' },
      { id: 'cours', label: 'En cours', value: String(chantiers.filter((c) => c.statut === 'En cours').length), icon: TrendingUp, color: 'amber' },
      { id: 'retard', label: 'En retard', value: String(chantiers.filter((c) => c.statut === 'En retard').length), icon: AlertTriangle, color: 'rose' },
      { id: 'clotures', label: 'Clôturés', value: String(chantiers.filter((c) => c.statut === 'Clôturé').length), icon: CheckCircle, color: 'emerald' },
    ],
    [chantiers]
  );

  const commandBarActions = useMemo(
    () => [
      { id: 'new', label: 'Nouveau chantier', icon: Plus, onClick: () => {} },
      { id: 'filter', label: 'Filtres', icon: Filter, onClick: () => {} },
      { id: 'export', label: 'Export', icon: Download, onClick: () => {} },
    ],
    []
  );

  return (
    <>
      <BusinessWindow title="Chantiers & Suivi — Phases 6–8 (Exécution)">
        <CommandBar actions={commandBarActions} />
        <div className="grid grid-cols-2 gap-3 mb-4 sm:grid-cols-4">
          {kpis.map((kpi) => (
            <KPICard key={kpi.id} kpi={kpi} size="sm" />
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2 mb-3 text-xs">
          <span className="text-slate-500 flex items-center gap-1"><Filter className="h-3.5 w-3.5" aria-hidden /> Filtres</span>
          <Select value={filterStatut} onValueChange={setFilterStatut}>
            <SelectTrigger className="w-[140px] h-8 bg-slate-900/80 border-slate-700 text-slate-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUT_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <ErpDataTable<ChantierRow>
          data={filteredData}
          columns={columns}
          getRowId={(row) => row.id}
          onRowClick={(row) => setSelected(row)}
          maxHeight="520px"
        />
      </BusinessWindow>
      <ChantierModal open={!!selected} onClose={() => setSelected(null)} chantier={selected} onSave={handleSaveDetail} />
    </>
  );
}
