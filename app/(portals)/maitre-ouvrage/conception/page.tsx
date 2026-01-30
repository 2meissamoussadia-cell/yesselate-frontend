'use client';

/**
 * Études & Conception — Phase 3 : ESQ, APS, APD.
 * Tableau projets, KPIs, fiche projet (DesignModal) avec onglets ESQ / APS / APD / Coûts & surfaces.
 */

import { useState, useMemo, useCallback } from 'react';
import { BusinessWindow } from '@/components/ui/BusinessWindow';
import { CommandBar } from '@/components/ui/CommandBar';
import { KPICard } from '@/modules/dashboard/components/shared/KPICard';
import type { KPICardData } from '@/modules/dashboard/components/shared/KPICard';
import { ErpDataTable } from '@/components/erp/ErpDataTable';
import type { ErpColumnDef } from '@/components/erp/types';
import { DesignModal, type DesignProjectRow } from '@/components/bmo/conception';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Filter, GitBranch, GitCommit, BarChart2 } from 'lucide-react';

const INITIAL_PROJECTS: DesignProjectRow[] = [
  {
    id: '1',
    code: 'PRJ-2026-001',
    name: 'Immeuble Almadies',
    architecte: 'Atelier Dakar',
    phase: 'APD',
    costEstimate: 3_400_000_000,
    budgetProgramme: 3_500_000_000,
    docsStatus: 'complet',
    gateStatus: 'APD gelé',
    nextReview: '2026-03-10',
  },
  {
    id: '2',
    code: 'PRJ-2026-002',
    name: 'Hôtel Saly',
    architecte: 'Studio Saly',
    phase: 'APS',
    costEstimate: 1_200_000_000,
    budgetProgramme: 1_100_000_000,
    docsStatus: 'partiel',
    gateStatus: 'APS en révision',
    nextReview: '2026-02-28',
  },
  {
    id: '3',
    code: 'PRJ-2026-003',
    name: 'Résidence Les Mamelles',
    architecte: 'Atelier Dakar',
    phase: 'ESQ',
    costEstimate: 800_000_000,
    budgetProgramme: 750_000_000,
    docsStatus: 'incomplet',
    gateStatus: 'ESQ en cours',
    nextReview: '2026-03-15',
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

function getEcartPct(cost: number, budget: number): number {
  if (!budget) return 0;
  return Math.round(((cost - budget) / budget) * 1000) / 10;
}

const columns: ErpColumnDef<DesignProjectRow>[] = [
  { id: 'code', header: 'Code', accessorKey: 'code', width: 120 },
  { id: 'name', header: 'Projet', accessorKey: 'name', width: 180 },
  { id: 'architecte', header: 'Architecte / MOE', accessorKey: 'architecte', width: 140 },
  {
    id: 'phase',
    header: 'Phase conception',
    width: 120,
    cell: (row) => (
      <span className="inline-flex items-center gap-1 rounded-full bg-slate-800/80 px-2 py-0.5 text-[0.7rem] text-slate-100">
        <GitBranch className="h-3 w-3 text-amber-400" aria-hidden />
        {row.phase}
      </span>
    ),
  },
  {
    id: 'costEstimate',
    header: 'Coût estimé',
    width: 130,
    align: 'right',
    cell: (row) => (
      <span className="tabular-nums text-slate-200 text-[0.75rem]">
        {formatBudgetFCFA(row.costEstimate)}
      </span>
    ),
  },
  {
    id: 'budgetProgramme',
    header: 'Budget prog.',
    width: 120,
    align: 'right',
    cell: (row) => (
      <span className="tabular-nums text-slate-400 text-[0.75rem]">
        {formatBudgetFCFA(row.budgetProgramme)}
      </span>
    ),
  },
  {
    id: 'ecart',
    header: 'Écart vs budget',
    width: 120,
    align: 'right',
    cell: (row) => {
      const pct = getEcartPct(row.costEstimate, row.budgetProgramme);
      const cls =
        pct > 10 ? 'text-red-300' : pct > 0 ? 'text-amber-300' : 'text-emerald-300';
      return (
        <span className={`tabular-nums text-[0.75rem] ${cls}`}>
          {pct > 0 ? '+' : ''}{pct} %
        </span>
      );
    },
  },
  {
    id: 'docsStatus',
    header: 'Docs',
    width: 100,
    cell: (row) => (
      <span
        className={
          row.docsStatus === 'complet'
            ? 'rounded-full bg-emerald-900/40 px-2 py-0.5 text-[0.65rem] text-emerald-200'
            : row.docsStatus === 'partiel'
              ? 'rounded-full bg-amber-900/40 px-2 py-0.5 text-[0.65rem] text-amber-200'
              : 'rounded-full bg-slate-700 px-2 py-0.5 text-[0.65rem] text-slate-300'
        }
      >
        {row.docsStatus === 'complet' ? 'Complet' : row.docsStatus === 'partiel' ? 'Partiel' : 'Incomplet'}
      </span>
    ),
  },
  {
    id: 'gateStatus',
    header: 'Gate conception',
    width: 140,
    cell: (row) => (
      <span className="inline-flex items-center gap-1 rounded-full bg-slate-800 px-2 py-0.5 text-[0.65rem] text-slate-100">
        <GitCommit className="h-3 w-3 text-sky-400" aria-hidden />
        {row.gateStatus}
      </span>
    ),
  },
  { id: 'nextReview', header: 'Prochaine revue', accessorKey: 'nextReview', width: 120 },
];

const PHASE_OPTIONS = [
  { value: 'all', label: 'Toutes les phases' },
  { value: 'ESQ', label: 'ESQ' },
  { value: 'APS', label: 'APS' },
  { value: 'APD', label: 'APD' },
];

const ARCHITECTE_OPTIONS = [
  { value: 'all', label: 'Tous' },
  { value: 'Atelier Dakar', label: 'Atelier Dakar' },
  { value: 'Studio Saly', label: 'Studio Saly' },
];

export default function ConceptionPage() {
  const [projects, setProjects] = useState<DesignProjectRow[]>(INITIAL_PROJECTS);
  const [selected, setSelected] = useState<DesignProjectRow | null>(null);
  const [filterPhase, setFilterPhase] = useState('all');
  const [filterArchitecte, setFilterArchitecte] = useState('all');

  const filteredData = useMemo(() => {
    return projects.filter((row) => {
      if (filterPhase !== 'all' && row.phase !== filterPhase) return false;
      if (filterArchitecte !== 'all' && row.architecte !== filterArchitecte) return false;
      return true;
    });
  }, [projects, filterPhase, filterArchitecte]);

  const handleSaveDetail = useCallback((row: DesignProjectRow) => {
    setProjects((prev) => prev.map((r) => (r.id === row.id ? row : r)));
    setSelected(null);
  }, []);

  const ecartMoyen = useMemo(() => {
    if (projects.length === 0) return 0;
    const sum = projects.reduce(
      (acc, p) => acc + getEcartPct(p.costEstimate, p.budgetProgramme),
      0
    );
    return Math.round((sum / projects.length) * 10) / 10;
  }, [projects]);

  const kpis: KPICardData[] = useMemo(
    () => [
      {
        id: 'esq',
        label: 'Projets en ESQ',
        value: String(projects.filter((p) => p.phase === 'ESQ').length),
        icon: GitBranch,
        color: 'blue',
      },
      {
        id: 'aps',
        label: 'Projets en APS',
        value: String(projects.filter((p) => p.phase === 'APS').length),
        icon: GitBranch,
        color: 'amber',
      },
      {
        id: 'apd',
        label: 'Projets en APD',
        value: String(projects.filter((p) => p.phase === 'APD').length),
        icon: GitCommit,
        color: 'emerald',
      },
      {
        id: 'ecart',
        label: 'Écart coût moyen',
        value: `${ecartMoyen > 0 ? '+' : ''}${ecartMoyen} %`,
        icon: BarChart2,
        color: ecartMoyen > 10 ? 'rose' : ecartMoyen > 0 ? 'amber' : 'emerald',
      },
    ],
    [projects, ecartMoyen]
  );

  const commandBarActions = useMemo(
    () => [
      { id: 'new', label: 'Nouveau projet (conception)', icon: Plus, onClick: () => {} },
      { id: 'filter', label: 'Filtres', icon: Filter, onClick: () => {} },
      {
        id: 'apd',
        label: 'Passer en APD',
        icon: GitCommit,
        onClick: () => {},
      },
    ],
    []
  );

  return (
    <>
      <BusinessWindow title="Études & Conception — Phase 3 (ESQ, APS, APD)">
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
          <Select value={filterPhase} onValueChange={setFilterPhase}>
            <SelectTrigger className="w-[150px] h-8 bg-slate-900/80 border-slate-700 text-slate-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PHASE_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterArchitecte} onValueChange={setFilterArchitecte}>
            <SelectTrigger className="w-[140px] h-8 bg-slate-900/80 border-slate-700 text-slate-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ARCHITECTE_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <ErpDataTable<DesignProjectRow>
          data={filteredData}
          columns={columns}
          getRowId={(row) => row.id}
          onRowClick={(row) => setSelected(row)}
          maxHeight="520px"
        />
      </BusinessWindow>

      <DesignModal
        open={!!selected}
        onClose={() => setSelected(null)}
        project={selected}
        onSave={handleSaveDetail}
      />
    </>
  );
}
