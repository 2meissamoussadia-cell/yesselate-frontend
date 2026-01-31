'use client';

/**
 * FoncierScreen — Écran métier Phase 1 : Foncier & Due diligence.
 * Pattern : BusinessWindow + CommandBar + KPICardRow + ExplorerLayout (nav + content).
 */

import React, { useState } from 'react';
import { BusinessWindow } from '@/components/ui/BusinessWindow';
import { CommandBar } from '@/components/bmo/ui/CommandBar';
import { ExplorerLayout } from '@/components/bmo/layout/ExplorerLayout';
import { KpiCard } from '@/components/bmo/metrics/KpiCard';
import { PhaseModal } from '@/components/bmo/workflow/PhaseModal';
import { Plus, Filter, FileText, MapPin, AlertCircle, Workflow } from 'lucide-react';
import { cn } from '@/lib/utils';

const kpis = [
  { label: 'Dossiers actifs', value: '8', trend: '+2', variant: 'default' as const },
  { label: 'Titres vérifiés', value: '5', trend: '+2', variant: 'success' as const },
  { label: 'Études G1 en cours', value: '3', trend: '—', variant: 'warning' as const },
  { label: 'Litiges fonciers', value: '1', trend: '-1', variant: 'danger' as const },
];

const commandBarItems = [
  { id: 'new', label: 'Nouveau dossier foncier', icon: <Plus className="h-4 w-4" />, primary: true, onClick: () => {} },
  { id: 'filter', label: 'Filtres', icon: <Filter className="h-4 w-4" />, onClick: () => {} },
  { id: 'export', label: 'Export DOC', icon: <FileText className="h-4 w-4" />, onClick: () => {} },
  { id: 'workflow', label: 'Workflow phases', icon: <Workflow className="h-4 w-4" />, onClick: () => {} },
];

const navCategories = [
  { id: 'neuf', label: 'Neuf' },
  { id: 'ancien', label: 'Ancien' },
  { id: 'litiges', label: 'Litiges' },
];

export function FoncierScreen() {
  const [phaseModalOpen, setPhaseModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('neuf');

  const itemsWithWorkflow = commandBarItems.map((item) =>
    item.id === 'workflow' ? { ...item, onClick: () => setPhaseModalOpen(true) } : item
  );

  return (
    <>
      <BusinessWindow title="Foncier & Diagnostics — Phase 1">
        <CommandBar items={itemsWithWorkflow} />

        <div className="grid grid-cols-2 gap-3 mb-4 sm:grid-cols-4">
          {kpis.map((kpi) => (
            <KpiCard
              key={kpi.label}
              label={kpi.label}
              value={kpi.value}
              trend={kpi.trend}
              variant={kpi.variant}
            />
          ))}
        </div>

        <ExplorerLayout
          nav={
            <div className="p-3 space-y-3">
              <div className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                Vues
              </div>
              <ul className="space-y-0.5">
                {navCategories.map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => setActiveCategory(c.id)}
                      className={cn(
                        'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                        activeCategory === c.id
                          ? 'bg-blue-600/20 text-slate-100 border-l-2 border-blue-500'
                          : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                      )}
                    >
                      {c.label}
                    </button>
                  </li>
                ))}
              </ul>
              <div className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase pt-2">
                Filtres
              </div>
              <p className="text-xs text-slate-400">Statut, type, risque…</p>
            </div>
          }
          content={
            <div className="p-4 overflow-y-auto">
              <section className="mb-4 rounded-xl border border-slate-800/60 bg-slate-950/40 p-4">
                <h3 className="text-sm font-semibold text-slate-100 mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-400" />
                  Checklist Phase 1 — Due Diligence
                </h3>
                <ul className="space-y-2 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <span className="h-4 w-4 rounded border border-emerald-500/60 bg-emerald-500/20 flex items-center justify-center text-emerald-400">✓</span>
                    Vérification titre foncier / bail
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-4 w-4 rounded border border-emerald-500/60 bg-emerald-500/20 flex items-center justify-center text-emerald-400">✓</span>
                    PV de bornage
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-4 w-4 rounded border border-slate-600 bg-slate-800/60" />
                    Étude géotechnique G1
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-4 w-4 rounded border border-slate-600 bg-slate-800/60" />
                    Diagnostics structure (si rénovation)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-4 w-4 rounded border border-slate-600 bg-slate-800/60" />
                    Accès réseaux (SENELEC, SONES, ONAS)
                  </li>
                </ul>
                <button
                  type="button"
                  onClick={() => setPhaseModalOpen(true)}
                  className="mt-3 text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  <Workflow className="h-3.5 w-3.5" />
                  Ouvrir workflow phases
                </button>
              </section>
              <p className="text-sm text-slate-400">
                Tableau des dossiers fonciers (ErpDataTable) à brancher ici.
              </p>
            </div>
          }
        />
      </BusinessWindow>

      <PhaseModal
        open={phaseModalOpen}
        onClose={() => setPhaseModalOpen(false)}
        project={{ id: '1', name: 'Immeuble Almadies', currentPhase: 1 }}
      />
    </>
  );
}
