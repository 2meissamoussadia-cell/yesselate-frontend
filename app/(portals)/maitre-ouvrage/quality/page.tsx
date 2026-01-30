'use client';

/**
 * Qualité & Réserves — Phases 8–9 : Punch list, non-conformités, réserves réception.
 * Tableau réserves (Code, Chantier, Zone, Lot, Priorité, Responsable, Statut, Date détection, Date cible), fiche réserve (ReserveModal).
 */

import { useState, useMemo, useCallback } from 'react';
import { BusinessWindow } from '@/components/ui/BusinessWindow';
import { CommandBar } from '@/components/ui/CommandBar';
import { KPICard } from '@/modules/dashboard/components/shared/KPICard';
import type { KPICardData } from '@/modules/dashboard/components/shared/KPICard';
import { ErpDataTable } from '@/components/erp/ErpDataTable';
import type { ErpColumnDef } from '@/components/erp/types';
import { ReserveModal, type ReserveRow } from '@/components/bmo/qualite-reserves';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Filter, Download, AlertTriangle, Clock, Percent, ListTodo } from 'lucide-react';

function daysBetween(dateA: string, dateB: string): number {
  const a = new Date(dateA).getTime();
  const b = new Date(dateB).getTime();
  return Math.round((b - a) / (24 * 60 * 60 * 1000));
}

const INITIAL_RESERVES: ReserveRow[] = [
  {
    id: '1',
    code: 'RES-2026-001',
    chantier: 'Immeuble Almadies',
    zone: 'Bât A, R+2, pièce 204',
    lot: 'Finition',
    priorite: 'Haute',
    responsable: 'Entreprise NDIAYE',
    statut: 'En cours',
    dateDetection: '2026-01-20',
    dateCible: '2026-02-15',
  },
  {
    id: '2',
    code: 'RES-2026-002',
    chantier: 'Immeuble Almadies',
    zone: 'RDC, local technique',
    lot: 'CVC',
    priorite: 'Critique',
    responsable: 'Climax Sénégal',
    statut: 'Ouverte',
    dateDetection: '2026-01-25',
    dateCible: '2026-02-01',
  },
  {
    id: '3',
    code: 'RES-2026-003',
    chantier: 'Hôtel Saly',
    zone: 'Façade sud',
    lot: 'Second œuvre',
    priorite: 'Moyenne',
    responsable: 'BTP Dakar',
    statut: 'Levée',
    dateDetection: '2026-01-10',
    dateCible: '2026-01-28',
    dateLeveeReelle: '2026-01-19',
  },
];

const columns: ErpColumnDef<ReserveRow>[] = [
  { id: 'code', header: 'Code', accessorKey: 'code', width: 120 },
  { id: 'chantier', header: 'Chantier', accessorKey: 'chantier', width: 180 },
  { id: 'zone', header: 'Zone (bât / niveau / pièce)', accessorKey: 'zone', width: 200 },
  { id: 'lot', header: 'Lot', accessorKey: 'lot', width: 110 },
  {
    id: 'priorite',
    header: 'Priorité',
    width: 100,
    cell: (row) => (
      <span
        className={
          row.priorite === 'Critique'
            ? 'rounded-full bg-red-900/40 px-2 py-0.5 text-[0.65rem] text-red-200'
            : row.priorite === 'Haute'
              ? 'rounded-full bg-amber-900/40 px-2 py-0.5 text-[0.65rem] text-amber-200'
              : row.priorite === 'Moyenne'
                ? 'rounded-full bg-slate-700 px-2 py-0.5 text-[0.65rem] text-slate-200'
                : 'rounded-full bg-slate-800 px-2 py-0.5 text-[0.65rem] text-slate-400'
        }
      >
        {row.priorite}
      </span>
    ),
  },
  { id: 'responsable', header: 'Responsable', accessorKey: 'responsable', width: 150 },
  {
    id: 'statut',
    header: 'Statut',
    width: 100,
    cell: (row) => (
      <span
        className={
          row.statut === 'Levée'
            ? 'rounded-full bg-emerald-900/40 px-2 py-0.5 text-[0.65rem] text-emerald-200'
            : row.statut === 'Ouverte'
              ? 'rounded-full bg-amber-900/40 px-2 py-0.5 text-[0.65rem] text-amber-200'
              : 'rounded-full bg-slate-700 px-2 py-0.5 text-[0.65rem] text-slate-300'
        }
      >
        {row.statut}
      </span>
    ),
  },
  { id: 'dateDetection', header: 'Date détection', accessorKey: 'dateDetection', width: 120 },
  { id: 'dateCible', header: 'Date cible', accessorKey: 'dateCible', width: 110 },
];

const STATUT_OPTIONS = [
  { value: 'all', label: 'Tous' },
  { value: 'Ouverte', label: 'Ouverte' },
  { value: 'En cours', label: 'En cours' },
  { value: 'Levée', label: 'Levée' },
  { value: 'Refusée', label: 'Refusée' },
];

const PRIORITE_OPTIONS = [
  { value: 'all', label: 'Toutes' },
  { value: 'Critique', label: 'Critique' },
  { value: 'Haute', label: 'Haute' },
  { value: 'Moyenne', label: 'Moyenne' },
  { value: 'Basse', label: 'Basse' },
];

export default function QualityPage() {
  const [reserves, setReserves] = useState<ReserveRow[]>(INITIAL_RESERVES);
  const [selected, setSelected] = useState<ReserveRow | null>(null);
  const [newReserveOpen, setNewReserveOpen] = useState(false);
  const [filterStatut, setFilterStatut] = useState('all');
  const [filterPriorite, setFilterPriorite] = useState('all');

  const filteredData = useMemo(() => {
    return reserves.filter((row) => {
      if (filterStatut !== 'all' && row.statut !== filterStatut) return false;
      if (filterPriorite !== 'all' && row.priorite !== filterPriorite) return false;
      return true;
    });
  }, [reserves, filterStatut, filterPriorite]);

  const handleSaveDetail = useCallback((row: ReserveRow) => {
    setReserves((prev) => {
      const existing = prev.find((r) => r.id === row.id);
      if (existing) return prev.map((r) => (r.id === row.id ? row : r));
      const newRow = { ...row, id: row.id || `res-${Date.now()}` };
      return [newRow, ...prev];
    });
    setSelected(null);
    setNewReserveOpen(false);
  }, []);

  const kpis: KPICardData[] = useMemo(() => {
    const ouvertes = reserves.filter((r) => r.statut === 'Ouverte' || r.statut === 'En cours').length;
    const critiques = reserves.filter((r) => r.priorite === 'Critique').length;
    const levees = reserves.filter((r) => r.statut === 'Levée');
    const total = reserves.length;
    const pctLevees = total > 0 ? Math.round((levees.length / total) * 100) : 0;
    const avecDateLevee = levees.filter((r) => r.dateLeveeReelle);
    const delaiMoyen =
      avecDateLevee.length > 0
        ? Math.round(
            avecDateLevee.reduce((acc, r) => acc + daysBetween(r.dateDetection, r.dateLeveeReelle!), 0) / avecDateLevee.length
          )
        : null;
    return [
      { id: 'ouvertes', label: 'Réserves ouvertes', value: String(ouvertes), icon: ListTodo, color: 'amber' },
      { id: 'critiques', label: 'Réserves critiques', value: String(critiques), icon: AlertTriangle, color: 'rose' },
      { id: 'delai', label: 'Délai moyen de levée', value: delaiMoyen != null ? `${delaiMoyen} j` : '—', icon: Clock, color: 'blue' },
      { id: 'pct-levees', label: '% réserves levées avant réception', value: `${pctLevees} %`, icon: Percent, color: 'emerald' },
    ];
  }, [reserves]);

  const commandBarActions = useMemo(
    () => [
      { id: 'new', label: 'Nouvelle réserve', icon: Plus, onClick: () => setNewReserveOpen(true) },
      { id: 'filter', label: 'Filtres', icon: Filter, onClick: () => {} },
      { id: 'export', label: 'Export', icon: Download, onClick: () => {} },
    ],
    []
  );

  return (
    <>
      <BusinessWindow title="Qualité & Réserves — Punch list (Phases 8–9)">
        <CommandBar actions={commandBarActions} />

        <div className="grid grid-cols-2 gap-3 mb-4 sm:grid-cols-4">
          {kpis.map((kpi) => (
            <KPICard key={kpi.id} kpi={kpi} size="sm" />
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-3 text-xs">
          <span className="text-slate-500 flex items-center gap-1">
            <Filter className="h-3.5 w-3.5" aria-hidden /> Filtres
          </span>
          <Select value={filterStatut} onValueChange={setFilterStatut}>
            <SelectTrigger className="w-[130px] h-8 bg-slate-900/80 border-slate-700 text-slate-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUT_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterPriorite} onValueChange={setFilterPriorite}>
            <SelectTrigger className="w-[130px] h-8 bg-slate-900/80 border-slate-700 text-slate-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PRIORITE_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <ErpDataTable<ReserveRow>
          data={filteredData}
          columns={columns}
          getRowId={(row) => row.id}
          onRowClick={(row) => setSelected(row)}
          maxHeight="520px"
        />
      </BusinessWindow>

      <ReserveModal
        open={!!selected || newReserveOpen}
        onClose={() => { setSelected(null); setNewReserveOpen(false); }}
        reserve={newReserveOpen ? null : selected}
        onSave={handleSaveDetail}
      />
    </>
  );
}
