'use client';

/**
 * Opportunités & Programmes — Phase 0-2 : Pipeline de projets
 * Filtres, vue Table/Kanban, fiche détail, nouvelle opportunité.
 */

import { useState, useMemo, useCallback } from 'react';
import { BusinessWindow } from '@/components/ui/BusinessWindow';
import { CommandBar } from '@/components/ui/CommandBar';
import { KPICard } from '@/modules/dashboard/components/shared/KPICard';
import type { KPICardData } from '@/modules/dashboard/components/shared/KPICard';
import { ErpDataTable } from '@/components/erp/ErpDataTable';
import type { ErpColumnDef } from '@/components/erp/types';
import {
  NewOpportunityModal,
  OpportunityDetailModal,
  OpportunitiesKanbanView,
  type OpportunityRow,
} from '@/components/bmo/opportunities';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  Filter,
  Download,
  FileSpreadsheet,
  LayoutGrid,
  List,
  GitCommit,
  Layers,
  DollarSign,
  TrendingUp,
} from 'lucide-react';

const INITIAL_OPPORTUNITIES: OpportunityRow[] = [
  {
    id: '1',
    code: 'OPP-2026-001',
    projet: 'Immeuble Almadies',
    clientType: 'Promoteur',
    ville: 'Dakar',
    type: 'Neuf',
    phase: 2,
    gate: 'Programme validé',
    budget: 3_500_000_000,
    proba: 80,
    risque: 'medium',
    nextDecision: 'Lancement conception APD - 15/03/2026',
  },
  {
    id: '2',
    code: 'OPP-2026-002',
    projet: 'Rénovation Hôtel Saly',
    clientType: 'Hôtel',
    ville: 'Saly',
    type: 'Rénovation',
    phase: 1,
    gate: 'Foncier à sécuriser',
    budget: 1_200_000_000,
    proba: 60,
    risque: 'high',
    nextDecision: 'Décision foncier - 01/03/2026',
  },
  {
    id: '3',
    code: 'OPP-2026-003',
    projet: 'Data Center Diamniadio',
    clientType: 'Industriel',
    ville: 'Diamniadio',
    type: 'Neuf',
    phase: 0,
    gate: 'GO étude',
    budget: 9_000_000_000,
    proba: 40,
    risque: 'medium',
    nextDecision: 'Validation programme - 30/04/2026',
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

const columns: ErpColumnDef<OpportunityRow>[] = [
  { id: 'code', header: 'Code', accessorKey: 'code', width: 120 },
  { id: 'projet', header: 'Projet', accessorKey: 'projet', width: 180 },
  { id: 'clientType', header: 'Client', accessorKey: 'clientType', width: 110 },
  { id: 'ville', header: 'Ville', accessorKey: 'ville', width: 100 },
  { id: 'type', header: 'Type', accessorKey: 'type', width: 95 },
  {
    id: 'phase',
    header: 'Phase',
    width: 100,
    cell: (row) => (
      <span className="inline-flex items-center gap-1 rounded-full bg-slate-800/80 px-2 py-0.5 text-[0.7rem] text-slate-100">
        <GitCommit className="h-3 w-3 text-amber-400" aria-hidden />
        Phase {row.phase}
      </span>
    ),
  },
  { id: 'gate', header: 'Gate', accessorKey: 'gate', width: 160 },
  {
    id: 'budget',
    header: 'Budget (FCFA)',
    width: 130,
    align: 'right',
    cell: (row) => (
      <span className="tabular-nums text-slate-200">
        {formatBudgetFCFA(row.budget)}
      </span>
    ),
  },
  {
    id: 'proba',
    header: 'Probabilité',
    width: 100,
    align: 'right',
    cell: (row) => (
      <span className="text-[0.75rem] tabular-nums text-slate-200">
        {row.proba} %
      </span>
    ),
  },
  {
    id: 'risque',
    header: 'Risque',
    width: 90,
    cell: (row) => (
      <span
        className={
          row.risque === 'high'
            ? 'rounded-full bg-red-900/40 px-2 py-0.5 text-[0.65rem] text-red-200'
            : row.risque === 'medium'
              ? 'rounded-full bg-amber-900/40 px-2 py-0.5 text-[0.65rem] text-amber-200'
              : 'rounded-full bg-emerald-900/40 px-2 py-0.5 text-[0.65rem] text-emerald-200'
        }
      >
        {row.risque === 'high' ? 'Élevé' : row.risque === 'medium' ? 'Moyen' : 'Faible'}
      </span>
    ),
  },
  { id: 'nextDecision', header: 'Prochaine décision', accessorKey: 'nextDecision', width: 240 },
];

const PHASE_OPTIONS = [
  { value: 'all', label: 'Toutes les phases' },
  { value: '0', label: 'Phase 0' },
  { value: '1', label: 'Phase 1' },
  { value: '2', label: 'Phase 2' },
];
const VILLE_OPTIONS = [
  { value: 'all', label: 'Toutes les villes' },
  { value: 'Dakar', label: 'Dakar' },
  { value: 'Saly', label: 'Saly' },
  { value: 'Diamniadio', label: 'Diamniadio' },
];
const TYPE_OPTIONS = [
  { value: 'all', label: 'Tous les types' },
  { value: 'Neuf', label: 'Neuf' },
  { value: 'Rénovation', label: 'Rénovation' },
];
const RISQUE_OPTIONS = [
  { value: 'all', label: 'Tous les risques' },
  { value: 'low', label: 'Faible' },
  { value: 'medium', label: 'Moyen' },
  { value: 'high', label: 'Élevé' },
];

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<OpportunityRow[]>(INITIAL_OPPORTUNITIES);
  const [selected, setSelected] = useState<OpportunityRow | null>(null);
  const [newModalOpen, setNewModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
  const [filterPhase, setFilterPhase] = useState('all');
  const [filterVille, setFilterVille] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterRisque, setFilterRisque] = useState('all');

  const filteredData = useMemo(() => {
    return opportunities.filter((row) => {
      if (filterPhase !== 'all' && row.phase !== parseInt(filterPhase, 10)) return false;
      if (filterVille !== 'all' && row.ville !== filterVille) return false;
      if (filterType !== 'all' && row.type !== filterType) return false;
      if (filterRisque !== 'all' && row.risque !== filterRisque) return false;
      return true;
    });
  }, [opportunities, filterPhase, filterVille, filterType, filterRisque]);

  const handleSaveNew = useCallback((row: OpportunityRow) => {
    setOpportunities((prev) => [...prev, row]);
  }, []);

  const handleSaveDetail = useCallback((row: OpportunityRow) => {
    setOpportunities((prev) => prev.map((r) => (r.id === row.id ? row : r)));
    setSelected(null);
  }, []);

  const kpis: KPICardData[] = useMemo(
    () => [
      {
        id: 'actives',
        label: 'Opportunités actives',
        value: String(opportunities.length),
        icon: Layers,
        color: 'blue',
      },
      {
        id: 'pipeline',
        label: 'Valeur pipeline',
        value: formatBudgetFCFA(
          opportunities.reduce((s, o) => s + o.budget, 0)
        ).replace(' FCFA', ''),
        icon: DollarSign,
        color: 'emerald',
      },
      {
        id: 'phases',
        label: 'Phase 0 / 1 / 2',
        value: [
          opportunities.filter((o) => o.phase === 0).length,
          opportunities.filter((o) => o.phase === 1).length,
          opportunities.filter((o) => o.phase === 2).length,
        ].join(' / '),
        icon: GitCommit,
        color: 'amber',
      },
      {
        id: 'conversion',
        label: 'Conversion → programmes',
        value: '42 %',
        icon: TrendingUp,
        color: 'purple',
      },
    ],
    [opportunities]
  );

  const commandBarActions = useMemo(
    () => [
      { id: 'new', label: 'Nouvelle opportunité', icon: Plus, onClick: () => setNewModalOpen(true) },
      { id: 'import', label: 'Importer Excel', icon: FileSpreadsheet, onClick: () => {} },
      { id: 'filter', label: 'Filtres', icon: Filter, onClick: () => {} },
      { id: 'export', label: 'Export', icon: Download, onClick: () => {} },
      {
        id: 'view',
        label: viewMode === 'table' ? 'Vue Kanban' : 'Vue Tableau',
        icon: viewMode === 'table' ? LayoutGrid : List,
        onClick: () => setViewMode((v) => (v === 'table' ? 'kanban' : 'table')),
      },
    ],
    [viewMode]
  );

  return (
    <>
      <BusinessWindow title="Opportunités & Programmes — Phase 0-2">
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
            <SelectTrigger className="w-[140px] h-8 bg-slate-900/80 border-slate-700 text-slate-200">
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
          <Select value={filterVille} onValueChange={setFilterVille}>
            <SelectTrigger className="w-[130px] h-8 bg-slate-900/80 border-slate-700 text-slate-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {VILLE_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[120px] h-8 bg-slate-900/80 border-slate-700 text-slate-200">
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
          <Select value={filterRisque} onValueChange={setFilterRisque}>
            <SelectTrigger className="w-[120px] h-8 bg-slate-900/80 border-slate-700 text-slate-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {RISQUE_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {viewMode === 'table' ? (
          <ErpDataTable<OpportunityRow>
            data={filteredData}
            columns={columns}
            getRowId={(row) => row.id}
            onRowClick={(row) => setSelected(row)}
            maxHeight="520px"
          />
        ) : (
          <OpportunitiesKanbanView
            data={filteredData}
            onCardClick={(row) => setSelected(row)}
          />
        )}
      </BusinessWindow>

      <NewOpportunityModal
        open={newModalOpen}
        onClose={() => setNewModalOpen(false)}
        onSave={handleSaveNew}
        nextId={String(opportunities.length + 1)}
      />

      <OpportunityDetailModal
        open={!!selected}
        onClose={() => setSelected(null)}
        opportunity={selected}
        onSave={handleSaveDetail}
      />
    </>
  );
}
