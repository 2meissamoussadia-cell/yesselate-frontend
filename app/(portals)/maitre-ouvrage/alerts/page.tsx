'use client';

/**
 * Centre d'alertes — Module squelette ERP BTP.
 * Vue consolidée des incidents, dérives et risques prioritaires.
 * Utilise le CockpitLayout pour cohérence UI.
 */

import { useState, useEffect } from 'react';
import { Bell, Filter, Download, RefreshCw } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { CockpitLayout, type KPIItem } from "@/components/layouts";
import { ALERTS_NAV_SECTIONS, createCommand } from "@/components/layouts/cockpitNavConfig";
import { KpiCard, SectionHeader } from '@/components/bmo/metrics';
import { DistributionChart } from '@/components/features/bmo/dashboard/charts/DistributionChart';

// Données mock pour graphiques
const ALERTES_PAR_CHANTIER = [
  { name: 'NICE RÉNOVATION', value: 42, color: '#ef4444' },
  { name: 'Résidence Les Palmiers', value: 28, color: '#f97316' },
  { name: 'Complexe Alpha', value: 22, color: '#eab308' },
  { name: 'Bureaux Zenith', value: 18, color: '#22c55e' },
  { name: 'Logements sociaux', value: 12, color: '#3b82f6' },
  { name: 'Voirie quartier Nord', value: 6, color: '#8b5cf6' },
];

const TYPOLOGIE_INCIDENTS = [
  { name: 'Technique', value: 38, color: '#3b82f6' },
  { name: 'Planning', value: 32, color: '#f59e0b' },
  { name: 'Qualité', value: 24, color: '#10b981' },
  { name: 'Sécurité', value: 18, color: '#ef4444' },
  { name: 'Financier', value: 16, color: '#8b5cf6' },
];

const ALERTES_CRITIQUES = [
  { id: 'ALT-001', chantier: 'NICE RÉNOVATION', type: 'Sécurité', severite: 'Critique', jours: 5 },
  { id: 'ALT-012', chantier: 'Résidence Les Palmiers', type: 'Financier', severite: 'Critique', jours: 3 },
  { id: 'ALT-018', chantier: 'Complexe Alpha', type: 'Technique', severite: 'Haute', jours: 2 },
  { id: 'ALT-025', chantier: 'Bureaux Zenith', type: 'Qualité', severite: 'Haute', jours: 1 },
];

const CHANTIERS_SURVEILLANCE = [
  { chantier: 'NICE RÉNOVATION', alertes: 42, type: 'Technique', tendance: '+8' },
  { chantier: 'Résidence Les Palmiers', alertes: 28, type: 'Planning', tendance: '+3' },
  { chantier: 'Complexe Alpha', alertes: 22, type: 'Qualité', tendance: '-2' },
];

// Configuration
const alertsCommands = [
  createCommand("new-alert", "Nouvelle alerte", Bell, { primary: true }),
  createCommand("filter", "Filtres", Filter, { primary: true }),
  createCommand("export", "Exporter", Download),
  createCommand("refresh", "Rafraîchir", RefreshCw),
];

const alertsKpis: KPIItem[] = [
  { id: "total", label: "Alertes", value: "128", color: "rose" },
  { id: "critiques", label: "Critiques", value: "32", color: "rose" },
  { id: "nouvelles", label: "Nouvelles (7j)", value: "46", trend: 12, trendType: "up", color: "amber" },
  { id: "non-assignees", label: "Non assignées", value: "9", color: "amber" },
];

export default function AlertsCenterPage() {
  const [chartsReady, setChartsReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setChartsReady(true), 150);
    return () => clearTimeout(t);
  }, []);

  return (
    <CockpitLayout
      commands={alertsCommands}
      kpis={alertsKpis}
      navSections={ALERTS_NAV_SECTIONS}
    >
      <div className="p-4 space-y-6">
        {/* KPIs alertes */}
        <section
          aria-label="Indicateurs d'alertes"
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        >
          <KpiCard
            label="Alertes totales"
            value="128"
            trend="32 critiques"
            variant="danger"
          />
          <KpiCard
            label="Nouvelles 7 derniers jours"
            value="46"
            trend="+12 vs période précédente"
            variant="warning"
          />
          <KpiCard
            label="Temps moyen de traitement"
            value="3,4 j"
            trend="-0,8 j sur 30 j"
            variant="success"
          />
          <KpiCard
            label="Alertes non assignées"
            value="9"
            trend="à répartir"
            variant="warning"
          />
        </section>

        {/* Heatmap / distribution */}
        <section className="grid gap-4 lg:grid-cols-3">
          <div className="space-y-3 lg:col-span-2">
            <SectionHeader
              title="Répartition par programme / chantier"
              description="Où se concentrent les alertes sur le portefeuille."
            />
            <div className="chart-container rounded-xl border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-slate-950/60 p-4 h-[320px]">
              {!chartsReady ? (
                <ChartSkeleton className="h-full min-h-[280px]" />
              ) : (
              <ResponsiveContainer width="100%" height="100%" minHeight={280}>
                <BarChart
                  data={ALERTES_PAR_CHANTIER}
                  layout="vertical"
                  margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} className="dark:opacity-30" />
                  <XAxis type="number" stroke="#64748b" fontSize={11} tickLine={false} axisLine={{ stroke: '#475569' }} />
                  <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={11} width={140} tickLine={false} axisLine={{ stroke: '#475569' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #475569',
                      borderRadius: '8px',
                      padding: '8px 12px',
                    }}
                    labelStyle={{ color: '#cbd5e1', fontSize: 12 }}
                    formatter={(value: number | undefined) => [`${value ?? 0} alertes`, 'Nombre']}
                    labelFormatter={(label) => label}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={28}>
                    {ALERTES_PAR_CHANTIER.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <SectionHeader
              title="Typologie des incidents"
              description="Technique, planning, qualité, sécurité, financier…"
            />
            <div className="chart-container rounded-xl border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-slate-950/60 p-4 h-[320px]">
              {!chartsReady ? (
                <ChartSkeleton className="h-full min-h-[280px]" />
              ) : (
              <DistributionChart
                data={TYPOLOGIE_INCIDENTS}
                type="pie"
                height={280}
                showLegend
              />
              )}
            </div>
          </div>
        </section>

        {/* Listes détaillées */}
        <section className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-3">
            <SectionHeader
              title="Alertes critiques"
              description="Incidents à impact fort sur coûts, délais ou sécurité."
            />
            <div className="rounded-xl border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-slate-950/60 overflow-hidden min-h-[200px]">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800/60 bg-slate-50 dark:bg-slate-900/50">
                      <th className="text-left py-2.5 px-3 font-medium text-slate-600 dark:text-slate-400">ID</th>
                      <th className="text-left py-2.5 px-3 font-medium text-slate-600 dark:text-slate-400">Chantier</th>
                      <th className="text-left py-2.5 px-3 font-medium text-slate-600 dark:text-slate-400">Type</th>
                      <th className="text-left py-2.5 px-3 font-medium text-slate-600 dark:text-slate-400">Sévérité</th>
                      <th className="text-left py-2.5 px-3 font-medium text-slate-600 dark:text-slate-400">Jours</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ALERTES_CRITIQUES.map((row) => (
                      <tr key={row.id} className="border-b border-slate-100 dark:border-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800/30">
                        <td className="py-2 px-3 font-mono text-xs text-slate-600 dark:text-slate-400">{row.id}</td>
                        <td className="py-2 px-3 text-slate-700 dark:text-slate-300">{row.chantier}</td>
                        <td className="py-2 px-3 text-slate-600 dark:text-slate-400">{row.type}</td>
                        <td className="py-2 px-3">
                          <span className={row.severite === 'Critique' ? 'text-rose-500 font-medium' : 'text-amber-500'}>
                            {row.severite}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-slate-600 dark:text-slate-400">{row.jours} j</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <SectionHeader
              title="Chantiers sous surveillance"
              description="Sites avec un volume inhabituel d'alertes."
            />
            <div className="rounded-xl border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-slate-950/60 overflow-hidden min-h-[200px]">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800/60 bg-slate-50 dark:bg-slate-900/50">
                      <th className="text-left py-2.5 px-3 font-medium text-slate-600 dark:text-slate-400">Chantier</th>
                      <th className="text-left py-2.5 px-3 font-medium text-slate-600 dark:text-slate-400">Alertes</th>
                      <th className="text-left py-2.5 px-3 font-medium text-slate-600 dark:text-slate-400">Type</th>
                      <th className="text-left py-2.5 px-3 font-medium text-slate-600 dark:text-slate-400">Tendance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {CHANTIERS_SURVEILLANCE.map((row) => (
                      <tr key={row.chantier} className="border-b border-slate-100 dark:border-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800/30">
                        <td className="py-2 px-3 text-slate-700 dark:text-slate-300">{row.chantier}</td>
                        <td className="py-2 px-3 font-medium text-slate-600 dark:text-slate-400">{row.alertes}</td>
                        <td className="py-2 px-3 text-slate-600 dark:text-slate-400">{row.type}</td>
                        <td className="py-2 px-3">
                          <span className={row.tendance.startsWith('+') ? 'text-rose-500' : 'text-emerald-500'}>
                            {row.tendance} (7j)
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      </div>
    </CockpitLayout>
  );
}
