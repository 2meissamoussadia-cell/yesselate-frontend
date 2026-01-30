'use client';

/**
 * Réceptions & Livraison — Phase 9 : PV réception, DOE, levée des réserves.
 */

import { useState, useMemo, useCallback } from 'react';
import { BusinessWindow } from '@/components/ui/BusinessWindow';
import { CommandBar } from '@/components/ui/CommandBar';
import { KPICard } from '@/modules/dashboard/components/shared/KPICard';
import type { KPICardData } from '@/modules/dashboard/components/shared/KPICard';
import { ErpDataTable } from '@/components/erp/ErpDataTable';
import type { ErpColumnDef } from '@/components/erp/types';
import { ReceptionModal, type ReceptionRow } from '@/components/bmo/receptions';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Filter, Download, PackageCheck, FileCheck, AlertTriangle } from 'lucide-react';

const INITIAL_RECEPTIONS: ReceptionRow[] = [
  {
    id: '1',
    code: 'REC-2026-001-P',
    projet: 'Immeuble Almadies',
    typeReception: 'Provisoire',
    statut: 'Avec réserves',
    dateReception: '2026-06-15',
    nbReserves: 8,
    reservesLevees: 3,
    doeRemis: 'Partiel',
  },
  {
    id: '2',
    code: 'REC-2026-002-D',
    projet: 'Hôtel Saly',
    typeReception: 'Définitive',
    statut: 'Levée',
    dateReception: '2026-05-20',
    nbReserves: 5,
    reservesLevees: 5,
    doeRemis: 'Oui',
  },
  {
    id: '3',
    code: 'REC-2026-003-L',
    projet: 'Résidence Les Mamelles',
    typeReception: 'Lot',
    statut: 'À planifier',
    dateReception: '',
    nbReserves: 0,
    reservesLevees: 0,
    doeRemis: 'Non',
  },
];

const columns: ErpColumnDef<ReceptionRow>[] = [
  { id: 'code', header: 'Code', accessorKey: 'code', width: 130 },
  { id: 'projet', header: 'Projet', accessorKey: 'projet', width: 180 },
  {
    id: 'typeReception',
    header: 'Type',
    width: 110,
    cell: (row) => (
      <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[0.65rem] text-slate-200">
        {row.typeReception}
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
          row.statut === 'Levée'
            ? 'rounded-full bg-emerald-900/40 px-2 py-0.5 text-[0.65rem] text-emerald-200'
            : row.statut === 'Avec réserves'
              ? 'rounded-full bg-amber-900/40 px-2 py-0.5 text-[0.65rem] text-amber-200'
              : 'rounded-full bg-slate-700 px-2 py-0.5 text-[0.65rem] text-slate-300'
        }
      >
        {row.statut}
      </span>
    ),
  },
  { id: 'dateReception', header: 'Date réception', accessorKey: 'dateReception', width: 120 },
  {
    id: 'reserves',
    header: 'Réserves',
    width: 100,
    align: 'right',
    cell: (row) => (
      <span className="tabular-nums text-slate-200">
        {row.reservesLevees} / {row.nbReserves}
      </span>
    ),
  },
  {
    id: 'doeRemis',
    header: 'DOE',
    width: 90,
    cell: (row) => (
      <span
        className={
          row.doeRemis === 'Oui'
            ? 'text-emerald-300'
            : row.doeRemis === 'Partiel'
              ? 'text-amber-300'
              : 'text-slate-400'
        }
      >
        {row.doeRemis}
      </span>
    ),
  },
];

const STATUT_OPTIONS = [
  { value: 'all', label: 'Tous' },
  { value: 'À planifier', label: 'À planifier' },
  { value: 'Planifiée', label: 'Planifiée' },
  { value: 'Réalisée', label: 'Réalisée' },
  { value: 'Avec réserves', label: 'Avec réserves' },
  { value: 'Levée', label: 'Levée' },
];

export default function ReceptionsPage() {
  const [receptions, setReceptions] = useState<ReceptionRow[]>(INITIAL_RECEPTIONS);
  const [selected, setSelected] = useState<ReceptionRow | null>(null);
  const [filterStatut, setFilterStatut] = useState('all');

  const filteredData = useMemo(() => {
    if (filterStatut === 'all') return receptions;
    return receptions.filter((r) => r.statut === filterStatut);
  }, [receptions, filterStatut]);

  const handleSaveDetail = useCallback((row: ReceptionRow) => {
    setReceptions((prev) => prev.map((r) => (r.id === row.id ? row : r)));
    setSelected(null);
  }, []);

  const kpis: KPICardData[] = useMemo(
    () => [
      { id: 'a-planifier', label: 'À planifier', value: String(receptions.filter((r) => r.statut === 'À planifier').length), icon: PackageCheck, color: 'blue' },
      { id: 'avec-reserves', label: 'Avec réserves', value: String(receptions.filter((r) => r.statut === 'Avec réserves').length), icon: AlertTriangle, color: 'amber' },
      { id: 'levees', label: 'Levées', value: String(receptions.filter((r) => r.statut === 'Levée').length), icon: FileCheck, color: 'emerald' },
      { id: 'doe-remis', label: 'DOE remis', value: String(receptions.filter((r) => r.doeRemis === 'Oui').length), icon: FileCheck, color: 'purple' },
    ],
    [receptions]
  );

  const commandBarActions = useMemo(
    () => [
      { id: 'new', label: 'Nouvelle réception', icon: Plus, onClick: () => {} },
      { id: 'filter', label: 'Filtres', icon: Filter, onClick: () => {} },
      { id: 'export', label: 'Export', icon: Download, onClick: () => {} },
    ],
    []
  );

  return (
    <>
      <BusinessWindow title="Réceptions & Livraison — Phase 9 (PV, DOE, réserves)">
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
        <ErpDataTable<ReceptionRow>
          data={filteredData}
          columns={columns}
          getRowId={(row) => row.id}
          onRowClick={(row) => setSelected(row)}
          maxHeight="520px"
        />
      </BusinessWindow>
      <ReceptionModal open={!!selected} onClose={() => setSelected(null)} reception={selected} onSave={handleSaveDetail} />
    </>
  );
}
