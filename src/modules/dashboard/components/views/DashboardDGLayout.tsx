/**
 * Dashboard DG — Structure 3 niveaux (logique métier ERP-BTP)
 *
 * Ligne 1 : 4 KPI DG
 * Ligne 2 : Synthèse stratégique (full width)
 * Ligne 3 : 2 colonnes (Chantiers & Risques / Budget & Décisions)
 *
 * Header simple inclus pour cohérence avec la maquette.
 */

'use client';

import React, { useCallback } from 'react';
import { useDashboardCommandCenterStore } from '@/lib/stores/dashboardCommandCenterStore';
import { cn } from '@/lib/utils';
import { EnterpriseBadge } from '../shared/EnterpriseBadge';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type KpiTone = 'good' | 'warn' | 'bad';

interface KpiItem {
  id: string;
  label: string;
  value: number | string;
  trend: string;
  tone: KpiTone;
}

interface SynthesisItem {
  label: string;
  value: string;
}

// ---------------------------------------------------------------------------
// Données de référence (à brancher sur API plus tard)
// ---------------------------------------------------------------------------

const KPIS_DG: KpiItem[] = [
  { id: 'chantiers', label: 'Chantiers actifs', value: 42, trend: '+12%', tone: 'good' },
  { id: 'conformite', label: 'Taux de conformité global', value: '94%', trend: '+2 pts', tone: 'good' },
  { id: 'retards', label: 'Projets en retard', value: 3, trend: '-2%', tone: 'warn' },
  { id: 'risques', label: 'Risques critiques', value: 3, trend: '+1', tone: 'bad' },
];

const TABS = ['Vue d’ensemble', 'Projets', 'Demandes', 'Budget', 'Risques', 'RH'] as const;

// ---------------------------------------------------------------------------
// Composants utilitaires
// ---------------------------------------------------------------------------

function KpiCard({ kpi }: { kpi: KpiItem }) {
  const toneClasses =
    kpi.tone === 'good'
      ? 'border-emerald-500/40 bg-emerald-500/5'
      : kpi.tone === 'warn'
        ? 'border-amber-500/40 bg-amber-500/5'
        : 'border-rose-500/40 bg-rose-500/5';

  const trendClass =
    kpi.trend.startsWith('+')
      ? 'text-emerald-400'
      : kpi.trend.startsWith('-') || kpi.trend.includes('−')
        ? 'text-rose-400'
        : 'text-slate-400';

  return (
    <div
      className={cn(
        'rounded-2xl border p-4 flex flex-col justify-between min-h-[100px]',
        toneClasses
      )}
    >
      <div className="text-[11px] text-slate-400 mb-1">{kpi.label}</div>
      <div className="text-2xl font-semibold mb-1">{kpi.value}</div>
      <div className={cn('text-[11px]', trendClass)}>{kpi.trend}</div>
    </div>
  );
}

function SynthesisBlock({
  title,
  items,
}: {
  title: string;
  items: SynthesisItem[];
}) {
  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-2">
      <div className="text-xs font-semibold mb-1">{title}</div>
      {items.map((it) => (
        <div key={it.label} className="flex justify-between text-[11px]">
          <span className="text-slate-400">{it.label}</span>
          <span className="font-medium">{it.value}</span>
        </div>
      ))}
    </div>
  );
}

function CardBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-lg">
      <div className="text-sm font-semibold mb-3">{title}</div>
      {children}
    </div>
  );
}

function MiniTable({
  columns,
  rows,
}: {
  columns: string[];
  rows: string[][];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[11px]">
        <thead className="text-slate-400 border-b border-slate-800">
          <tr>
            {columns.map((col) => (
              <th key={col} className="text-left py-1 pr-2 font-medium">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={idx} className="border-b border-slate-900/60">
              {row.map((cell, i) => (
                <td key={i} className="py-1.5 pr-2">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Layout principal
// ---------------------------------------------------------------------------

export interface DashboardDGLayoutProps {
  /** Contenu personnalisé (ex. DashboardHome). Si fourni, remplace le contenu par défaut (onglets + KPI + synthèse). */
  content?: React.ReactNode;
}

export function DashboardDGLayout({ content }: DashboardDGLayoutProps = {}) {
  const navigate = useDashboardCommandCenterStore((s) => s.navigate);
  const main = useDashboardCommandCenterStore((s) => s.navigation.mainCategory);
  const sub = useDashboardCommandCenterStore((s) => s.navigation.subCategory);

  const handleTab = useCallback(
    (tab: (typeof TABS)[number]) => {
      const tabMap: Record<string, { main: 'pilotage' | 'chantiers' | 'finance' | 'clients' | 'rh'; sub: string }> = {
        "Vue d'ensemble": { main: 'pilotage', sub: 'dashboard' },
        Projets: { main: 'clients', sub: 'projets' },
        Demandes: { main: 'chantiers', sub: 'demandes' },
        Budget: { main: 'finance', sub: 'budget' },
        Risques: { main: 'pilotage', sub: 'alertes' },
        RH: { main: 'rh', sub: 'employes' },
      };
      const target = tabMap[tab];
      if (target) navigate(target.main, target.sub, 'default');
    },
    [navigate]
  );

  // Onglet actif selon la route courante
  const routeToTab: Record<string, number> = {
    'pilotage::dashboard': 0,
    'clients::projets': 1,
    'chantiers::demandes': 2,
    'finance::budget': 3,
    'pilotage::alertes': 4,
    'rh::employes': 5,
  };
  const routeKey = `${main ?? 'pilotage'}::${sub ?? 'dashboard'}`;
  const activeTabIndex = routeToTab[routeKey] ?? 0;

  // Quand un contenu personnalisé est fourni (ex. DashboardHome), ne pas afficher le header
  // pour éviter la duplication avec le header de la page (breadcrumbs, SubNav, KPIs, actions).
  const showHeader = content == null || content === undefined;
  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-50">
      {showHeader && (
        <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between px-6 sm:px-8 py-4 border-b border-slate-800 bg-slate-950/90 backdrop-blur shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-semibold tracking-tight">DG Cockpit</h1>
              <EnterpriseBadge variant="info" size="sm">NICE RÉNOVATION • DG</EnterpriseBadge>
            </div>
            <p className="text-xs text-slate-400">
              Vue finances – DG NICE RÉNOVATION • Portefeuille chantiers, budget, risques et satisfaction clients.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" aria-label="Activer le briefing IA" className="inline-flex items-center gap-1 rounded-full border border-slate-700 bg-slate-900/70 px-3 py-2 min-h-[44px] text-[11px] text-slate-200 hover:border-emerald-500/60 transition-colors focus-visible:outline focus-visible:ring-2 focus-visible:ring-sky-500">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" aria-hidden /> Activer briefing IA
            </button>
            <button type="button" aria-label="Exporter en PDF" className="rounded-full border border-slate-700 bg-slate-900/70 px-3 py-2 min-h-[44px] text-[11px] text-slate-300 hover:border-slate-400 transition-colors focus-visible:outline focus-visible:ring-2 focus-visible:ring-sky-500">Export PDF</button>
            <button type="button" aria-label="Passer en mode 3D" className="rounded-full border border-slate-700 bg-slate-900/70 px-3 py-2 min-h-[44px] text-[11px] text-slate-300 hover:border-violet-500/60 transition-colors focus-visible:outline focus-visible:ring-2 focus-visible:ring-sky-500">Mode 3D</button>
          </div>
        </header>
      )}

      <main className="flex-1 min-h-0 overflow-y-auto px-6 sm:px-8 py-6 space-y-8">
        {content ?? (
          <>
        {/* ONGLETS NIVEAU 2 */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs border-b border-slate-800 pb-2">
          {TABS.map((tab, idx) => (
            <button
              key={tab}
              type="button"
              onClick={() => handleTab(tab)}
              className={cn(
                'pb-2 px-1 -mb-px transition-colors',
                idx === activeTabIndex
                  ? 'border-b-2 border-blue-500 text-blue-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-100'
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* LIGNE KPI (4 cartes) */}
        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4" aria-label="KPI DG">
          {KPIS_DG.map((kpi) => (
            <KpiCard key={kpi.id} kpi={kpi} />
          ))}
        </section>

        {/* SYNTHÈSE STRATÉGIQUE */}
        <section
          className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-lg"
          aria-labelledby="synthese-title"
        >
          <h2 id="synthese-title" className="text-base font-semibold mb-1">
            Synthèse stratégique
          </h2>
          <p className="text-xs text-slate-400 mb-4">
            Vue d’ensemble des indicateurs clés : chantiers, budget, risques et satisfaction.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <SynthesisBlock
              title="Portefeuille chantiers"
              items={[
                { label: 'Chantiers actifs', value: '42' },
                { label: 'Chantiers clôturés (12 mois)', value: '118' },
                { label: 'Durée moyenne', value: '27 jours' },
              ]}
            />
            <SynthesisBlock
              title="Performance financière"
              items={[
                { label: 'CA cumulé 2026 (tous chantiers)', value: '18 M XOF' },
                { label: 'Marge nette moyenne', value: '23 %' },
                { label: 'Budget consommé', value: '84 %' },
              ]}
            />
            <SynthesisBlock
              title="Capital humain & risques"
              items={[
                { label: 'Ouvriers KYC actifs', value: '27' },
                { label: 'Risques critiques', value: '3' },
                { label: 'Litiges en cours', value: '2' },
              ]}
            />
          </div>
        </section>

        {/* DEUX COLONNES DÉTAILLÉES */}
        <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* COLONNE GAUCHE : CHANTIERS & RISQUES */}
          <div className="space-y-4">
            <CardBlock title="Projets en retard">
              <MiniTable
                columns={['Chantier', 'Retard', 'Phase']}
                rows={[
                  ['RENOV-042', '12 j', 'Phase 4'],
                  ['AMEN-015', '7 j', 'Phase 3'],
                  ['REPAR-008', '5 j', 'Phase 2'],
                ]}
              />
            </CardBlock>

            <CardBlock title="Risques critiques">
              <MiniTable
                columns={['ID', 'Type', 'Impact']}
                rows={[
                  ['R-003', 'Retard chantier diaspora', 'Élevé'],
                  ['R-007', 'Litige fournisseur', 'Moyen'],
                  ['R-011', 'Stock peinture 0%', 'Élevé'],
                ]}
              />
            </CardBlock>
          </div>

          {/* COLONNE DROITE : BUDGET & DÉCISIONS */}
          <div className="space-y-4">
            <CardBlock title="Budget & consommations">
              <MiniTable
                columns={['Poste', 'Budget', 'Consommé']}
                rows={[
                  ['Rénovation second œuvre', '30M', '24M (80%)'],
                  ['Petites réparations', '8M', '5M (62%)'],
                  ['Assistance admin', '4M', '3M (75%)'],
                ]}
              />
            </CardBlock>

            <CardBlock title="Décisions en attente">
              <MiniTable
                columns={['Objet', 'Type', 'Échéance']}
                rows={[
                  ['Approbation marché école', 'Gouvernance', 'J+2'],
                  ['Validation paiement lot 3', 'Finance', 'Aujourd’hui'],
                  ['Nomination chef d’équipe', 'RH', 'J+5'],
                ]}
              />
            </CardBlock>
          </div>
        </section>
          </>
        )}
      </main>
    </div>
  );
}

export default DashboardDGLayout;
