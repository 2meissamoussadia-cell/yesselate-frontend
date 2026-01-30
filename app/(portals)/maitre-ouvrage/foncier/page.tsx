'use client';

/**
 * Foncier & Diagnostics — Phase 1 BTP
 * Titre foncier, diagnostics, géotech, bornage.
 */

import { BusinessWindow } from '@/components/ui/BusinessWindow';
import { CommandBar } from '@/components/ui/CommandBar';
import { Button } from '@/components/ui/button';
import { KPICard } from '@/modules/dashboard/components/shared/KPICard';
import type { KPICardData } from '@/modules/dashboard/components/shared/KPICard';
import { ErpDataTable } from '@/components/erp/ErpDataTable';
import type { ErpColumnDef } from '@/components/erp/types';
import { PhaseBadge } from '@/components/bmo/phase/PhaseBadge';
import { Plus, Filter, FileText, MapPin, AlertCircle } from 'lucide-react';

interface FoncierRow {
  id: string;
  projet: string;
  type: string;
  statut: string;
  titreFoncier: string;
  g1?: string;
  bornage?: string;
  diagnostics?: string;
  risque: 'low' | 'medium' | 'high';
}

const foncierData: FoncierRow[] = [
  {
    id: '1',
    projet: 'Immeuble Almadies',
    type: 'Neuf',
    statut: 'Titre vérifié',
    titreFoncier: 'TF 12345/DAK',
    g1: 'Fait',
    bornage: 'Fait',
    risque: 'low',
  },
  {
    id: '2',
    projet: 'Rénovation Sicap',
    type: 'Ancien',
    statut: 'Diagnostics en cours',
    titreFoncier: 'TF 67890/DAK',
    diagnostics: 'Structure 80%',
    risque: 'medium',
  },
  {
    id: '3',
    projet: 'Villa Saly',
    type: 'Neuf',
    statut: 'Litige foncier',
    titreFoncier: 'En attente',
    g1: 'Bloqué',
    risque: 'high',
  },
];

const columns: ErpColumnDef<FoncierRow>[] = [
  { id: 'projet', header: 'Projet', accessorKey: 'projet', width: 200 },
  { id: 'type', header: 'Type', accessorKey: 'type', width: 80 },
  {
    id: 'statut',
    header: 'Statut',
    width: 150,
    cell: (row) => (
      <PhaseBadge
        label={row.statut}
        color={row.risque === 'high' ? 'red' : row.risque === 'medium' ? 'amber' : 'blue'}
      />
    ),
  },
  { id: 'titreFoncier', header: 'Titre foncier', accessorKey: 'titreFoncier', width: 120 },
  { id: 'g1', header: 'G1', accessorKey: 'g1', width: 80 },
  { id: 'bornage', header: 'Bornage', accessorKey: 'bornage', width: 80 },
  {
    id: 'risque',
    header: 'Risque',
    width: 80,
    cell: (row) => (
      <span
        className={
          row.risque === 'high'
            ? 'rounded-full bg-red-900/40 px-2 py-0.5 text-[0.65rem] text-red-200'
            : row.risque === 'medium'
              ? 'rounded-full bg-amber-900/40 px-2 py-0.5 text-[0.65rem] text-amber-200'
              : 'rounded-full bg-green-900/40 px-2 py-0.5 text-[0.65rem] text-green-200'
        }
      >
        {row.risque === 'high' ? 'Élevé' : row.risque === 'medium' ? 'Moyen' : 'Faible'}
      </span>
    ),
  },
];

const kpis: KPICardData[] = [
  {
    id: 'dossiers',
    label: 'Dossiers actifs',
    value: '8',
    icon: MapPin,
    color: 'blue',
  },
  {
    id: 'titres',
    label: 'Titres vérifiés',
    value: '5',
    trend: 2,
    trendType: 'up',
    icon: FileText,
    color: 'emerald',
  },
  {
    id: 'g1',
    label: 'Études G1 en cours',
    value: '3',
    icon: AlertCircle,
    color: 'amber',
  },
  {
    id: 'litiges',
    label: 'Litiges fonciers',
    value: '1',
    trend: -1,
    trendType: 'down',
    icon: AlertCircle,
    color: 'rose',
  },
];

const commandBarActions = [
  { id: 'new', label: 'Nouveau dossier foncier', icon: Plus, onClick: () => {} },
  { id: 'filter', label: 'Filtres', icon: Filter, onClick: () => {} },
  { id: 'export', label: 'Export DOC', icon: FileText, onClick: () => {} },
];

export default function FoncierPage() {
  return (
    <BusinessWindow title="Foncier & Diagnostics — Phase 1">
      <CommandBar actions={commandBarActions} />

      <div className="grid grid-cols-2 gap-3 mb-4 sm:grid-cols-4">
        {kpis.map((kpi) => (
          <KPICard key={kpi.id} kpi={kpi} size="sm" />
        ))}
      </div>

      <section className="mb-4 rounded-xl border border-slate-800/60 bg-slate-950/40 p-4">
        <h3 className="text-sm font-semibold text-slate-100 mb-3 flex items-center gap-2">
          <FileText className="h-4 w-4 text-blue-400" />
          Checklist Phase 1 — Due Diligence
        </h3>
        <div className="space-y-2 text-xs text-slate-300">
          <label className="flex items-center gap-2 cursor-default">
            <input type="checkbox" defaultChecked readOnly className="rounded border-slate-600" />
            Vérification titre foncier / bail
          </label>
          <label className="flex items-center gap-2 cursor-default">
            <input type="checkbox" defaultChecked readOnly className="rounded border-slate-600" />
            PV de bornage
          </label>
          <label className="flex items-center gap-2 cursor-default">
            <input type="checkbox" readOnly className="rounded border-slate-600" />
            Étude géotechnique G1
          </label>
          <label className="flex items-center gap-2 cursor-default">
            <input type="checkbox" readOnly className="rounded border-slate-600" />
            Diagnostics structure (si rénovation)
          </label>
          <label className="flex items-center gap-2 cursor-default">
            <input type="checkbox" readOnly className="rounded border-slate-600" />
            Accès réseaux (SENELEC, SONES, ONAS)
          </label>
        </div>
      </section>

      <ErpDataTable<FoncierRow>
        data={foncierData}
        columns={columns}
        onRowClick={(row) => console.log('Ouvrir modal', row)}
        maxHeight="400px"
      />
    </BusinessWindow>
  );
}
