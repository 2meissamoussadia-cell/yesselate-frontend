'use client';

/**
 * Achats & Appels d'Offres — Phase 5 : DCE → consultation → offres → attribution.
 * Tableau AO/lots, KPIs, fiche AO (TenderModal) avec onglets DCE, Invités, Offres, Analyse.
 */

import { useState, useMemo, useCallback } from 'react';
import { BusinessWindow } from '@/components/ui/BusinessWindow';
import { CommandBar } from '@/components/ui/CommandBar';
import { KPICard } from '@/modules/dashboard/components/shared/KPICard';
import type { KPICardData } from '@/modules/dashboard/components/shared/KPICard';
import { ErpDataTable } from '@/components/erp/ErpDataTable';
import type { ErpColumnDef } from '@/components/erp/types';
import { TenderModal, type TenderRow } from '@/components/bmo/achats';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Filter, Download, ShoppingCart, FileCheck, AlertTriangle } from 'lucide-react';

const INITIAL_TENDERS: TenderRow[] = [
  {
    id: '1',
    code: 'AO-2026-001-GO',
    projet: 'Immeuble Almadies',
    lot: 'Gros œuvre',
    type: 'AO',
    statut: 'Clôturé',
    invites: 6,
    offres: 4,
    bestPrice: 1_450_000_000,
    budgetLot: 1_500_000_000,
    deadline: '2026-04-15',
  },
  {
    id: '2',
    code: 'AO-2026-002-CVC',
    projet: 'Hôtel Saly',
    lot: 'CVC',
    type: 'RFQ',
    statut: 'En cours',
    invites: 3,
    offres: 1,
    bestPrice: 220_000_000,
    budgetLot: 210_000_000,
    deadline: '2026-03-30',
  },
  {
    id: '3',
    code: 'AO-2026-003-VRD',
    projet: 'Résidence Les Mamelles',
    lot: 'VRD',
    type: 'AO',
    statut: 'En préparation',
    invites: 0,
    offres: 0,
    bestPrice: 0,
    budgetLot: 85_000_000,
    deadline: '2026-05-10',
  },
];

function formatBudgetFCFA(value: number): string {
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1).replace('.', ',')} Md FCFA`;
  }
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(0)} M FCFA`;
  }
  return value.toLocaleString('fr-FR', { maximumFractionDigits: 0 }) + ' FCFA';
}

function getEcartPct(prix: number, budget: number): number {
  if (!budget) return 0;
  return Math.round(((prix - budget) / budget) * 1000) / 10;
}

const columns: ErpColumnDef<TenderRow>[] = [
  { id: 'code', header: 'Code AO / Lot', accessorKey: 'code', width: 140 },
  { id: 'projet', header: 'Projet', accessorKey: 'projet', width: 180 },
  { id: 'lot', header: 'Lot', accessorKey: 'lot', width: 120 },
  {
    id: 'type',
    header: 'Type',
    width: 90,
    cell: (row) => (
      <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[0.65rem] text-slate-200">
        {row.type}
      </span>
    ),
  },
  {
    id: 'statut',
    header: 'Statut',
    width: 120,
    cell: (row) => (
      <span
        className={
          row.statut === 'Attribué'
            ? 'rounded-full bg-emerald-900/40 px-2 py-0.5 text-[0.65rem] text-emerald-200'
            : row.statut === 'Clôturé'
              ? 'rounded-full bg-slate-700 px-2 py-0.5 text-[0.65rem] text-slate-200'
              : row.statut === 'En cours'
                ? 'rounded-full bg-amber-900/40 px-2 py-0.5 text-[0.65rem] text-amber-200'
                : 'rounded-full bg-slate-800 px-2 py-0.5 text-[0.65rem] text-slate-300'
        }
      >
        {row.statut}
      </span>
    ),
  },
  {
    id: 'invites',
    header: 'Invités',
    width: 80,
    align: 'right',
    cell: (row) => <span className="tabular-nums text-slate-200">{row.invites}</span>,
  },
  {
    id: 'offres',
    header: 'Offres',
    width: 80,
    align: 'right',
    cell: (row) => <span className="tabular-nums text-slate-200">{row.offres}</span>,
  },
  {
    id: 'bestPrice',
    header: 'Meilleur prix',
    width: 130,
    align: 'right',
    cell: (row) => (
      <span className="tabular-nums text-slate-200 text-[0.75rem]">
        {row.bestPrice ? formatBudgetFCFA(row.bestPrice) : '—'}
      </span>
    ),
  },
  {
    id: 'ecart',
    header: 'Écart vs budget',
    width: 120,
    align: 'right',
    cell: (row) => {
      if (!row.budgetLot || !row.bestPrice) return <span className="text-slate-500">—</span>;
      const pct = getEcartPct(row.bestPrice, row.budgetLot);
      const cls =
        pct > 10 ? 'text-red-300' : pct > 0 ? 'text-amber-300' : 'text-emerald-300';
      return (
        <span className={`tabular-nums text-[0.75rem] ${cls}`}>
          {pct > 0 ? '+' : ''}{pct} %
        </span>
      );
    },
  },
  { id: 'deadline', header: 'Date limite offres', accessorKey: 'deadline', width: 130 },
];

const STATUT_OPTIONS = [
  { value: 'all', label: 'Tous les statuts' },
  { value: 'En préparation', label: 'En préparation' },
  { value: 'Publié', label: 'Publié' },
  { value: 'En cours', label: 'En cours' },
  { value: 'Clôturé', label: 'Clôturé' },
  { value: 'Attribué', label: 'Attribué' },
];

const TYPE_OPTIONS = [
  { value: 'all', label: 'Tous' },
  { value: 'AO', label: 'AO' },
  { value: 'RFQ', label: 'RFQ' },
  { value: 'GG', label: 'Gré à gré' },
];

export default function AchatsPage() {
  const [tenders, setTenders] = useState<TenderRow[]>(INITIAL_TENDERS);
  const [selected, setSelected] = useState<TenderRow | null>(null);
  const [filterStatut, setFilterStatut] = useState('all');
  const [filterType, setFilterType] = useState('all');

  const filteredData = useMemo(() => {
    return tenders.filter((row) => {
      if (filterStatut !== 'all' && row.statut !== filterStatut) return false;
      if (filterType !== 'all' && row.type !== filterType) return false;
      return true;
    });
  }, [tenders, filterStatut, filterType]);

  const handleSaveDetail = useCallback((row: TenderRow) => {
    setTenders((prev) => prev.map((r) => (r.id === row.id ? row : r)));
    setSelected(null);
  }, []);

  const lotsHorsBudget = useMemo(() => {
    return tenders.filter(
      (t) => t.budgetLot && t.bestPrice && getEcartPct(t.bestPrice, t.budgetLot) > 10
    ).length;
  }, [tenders]);

  const kpis: KPICardData[] = useMemo(
    () => [
      {
        id: 'prepa',
        label: 'AO en préparation',
        value: String(tenders.filter((t) => t.statut === 'En préparation').length),
        icon: FileCheck,
        color: 'blue',
      },
      {
        id: 'cours',
        label: 'AO en cours',
        value: String(tenders.filter((t) => t.statut === 'En cours').length),
        icon: ShoppingCart,
        color: 'amber',
      },
      {
        id: 'attribues',
        label: 'AO attribués',
        value: String(tenders.filter((t) => t.statut === 'Attribué').length),
        icon: FileCheck,
        color: 'emerald',
      },
      {
        id: 'hors-budget',
        label: 'Lots hors budget',
        value: String(lotsHorsBudget),
        icon: AlertTriangle,
        color: lotsHorsBudget > 0 ? 'rose' : 'blue',
      },
    ],
    [tenders, lotsHorsBudget]
  );

  const commandBarActions = useMemo(
    () => [
      { id: 'new', label: "Nouvel appel d'offres", icon: Plus, onClick: () => {} },
      { id: 'filter', label: 'Filtres', icon: Filter, onClick: () => {} },
      { id: 'export', label: 'Export', icon: Download, onClick: () => {} },
    ],
    []
  );

  return (
    <>
      <BusinessWindow title="Achats & Appels d'offres — Phase 5 (DCE → attribution)">
        <CommandBar actions={commandBarActions} />

        <div className="grid grid-cols-2 gap-3 mb-4 sm:grid-cols-4">
          {kpis.map((kpi) => (
            <KPICard key={kpi.id} kpi={kpi} size="sm" />
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-3 text-xs">
          <span className="text-slate-500 flex items-center gap-1">
            <Filter className="h-3.5 w-3.5" aria-hidden />
            Filtres
          </span>
          <Select value={filterStatut} onValueChange={setFilterStatut}>
            <SelectTrigger className="w-[160px] h-8 bg-slate-900/80 border-slate-700 text-slate-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUT_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[130px] h-8 bg-slate-900/80 border-slate-700 text-slate-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TYPE_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <ErpDataTable<TenderRow>
          data={filteredData}
          columns={columns}
          getRowId={(row) => row.id}
          onRowClick={(row) => setSelected(row)}
          maxHeight="520px"
        />
      </BusinessWindow>

      <TenderModal
        open={!!selected}
        onClose={() => setSelected(null)}
        tender={selected}
        onSave={handleSaveDetail}
      />
    </>
  );
}
