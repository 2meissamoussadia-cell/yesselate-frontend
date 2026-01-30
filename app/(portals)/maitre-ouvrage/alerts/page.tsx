'use client';

/**
 * Centre d'alertes — Module squelette ERP BTP.
 * Vue consolidée des incidents, dérives et risques prioritaires.
 * Utilise le CockpitLayout pour cohérence UI.
 */

import { Bell, Filter, Download, RefreshCw } from "lucide-react";
import { CockpitLayout, type KPIItem } from "@/components/layouts";
import { ALERTS_NAV_SECTIONS, createCommand } from "@/components/layouts/cockpitNavConfig";
import { KpiCard, SectionHeader, Placeholder } from '@/components/bmo/metrics';

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
            <div className="rounded-xl border border-slate-800/60 bg-slate-950/60 p-4 h-[320px]">
              <Placeholder>Heatmap des alertes par programme / chantier</Placeholder>
            </div>
          </div>

          <div className="space-y-3">
            <SectionHeader
              title="Typologie des incidents"
              description="Technique, planning, qualité, sécurité, financier…"
            />
            <div className="rounded-xl border border-slate-800/60 bg-slate-950/60 p-4 h-[320px]">
              <Placeholder>Camembert / barres par type d'incident</Placeholder>
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
            <div className="rounded-xl border border-slate-800/60 bg-slate-950/60 p-0 min-h-[200px]">
              <Placeholder>
                Tableau alertes critiques (tri par sévérité / ancienneté)
              </Placeholder>
            </div>
          </div>

          <div className="space-y-3">
            <SectionHeader
              title="Chantiers sous surveillance"
              description="Sites avec un volume inhabituel d'alertes."
            />
            <div className="rounded-xl border border-slate-800/60 bg-slate-950/60 p-0 min-h-[200px]">
              <Placeholder>
                Liste des chantiers à risque (nb alertes, type, tendance)
              </Placeholder>
            </div>
          </div>
        </section>
      </div>
    </CockpitLayout>
  );
}
