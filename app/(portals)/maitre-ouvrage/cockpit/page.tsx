"use client";

/**
 * Cockpit DG — Vue synthèse NICE RÉNOVATION (portail maître-ouvrage centralisé).
 * Utilise le CockpitLayout réutilisable pour la cohérence UI.
 */

import { FileText, Filter, Download, RefreshCw } from "lucide-react";
import { CockpitLayout } from "@/components/layouts";
import { DEFAULT_NAV_SECTIONS, DEFAULT_KPIS, createCommand } from "@/components/layouts/cockpitNavConfig";
import { BtpSecurityWidget } from "@/components/bmo/security/BtpSecurityWidget";

// ---------------------------------------------------------------------------
// Configuration de la page
// ---------------------------------------------------------------------------

const cockpitCommands = [
  createCommand("new-demand", "Nouvelle demande", FileText, { primary: true }),
  createCommand("filter", "Filtres", Filter, { primary: true }),
  createCommand("export", "Exporter", Download),
  createCommand("refresh", "Rafraîchir", RefreshCw),
];

// ---------------------------------------------------------------------------
// Page principale
// ---------------------------------------------------------------------------

export default function CockpitDGPage() {
  return (
    <CockpitLayout
      commands={cockpitCommands}
      kpis={DEFAULT_KPIS}
      navSections={DEFAULT_NAV_SECTIONS}
    >
      <div className="p-4 space-y-6">
        {/* Section Retards critiques */}
        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-slate-100">
            Retards critiques
          </h2>
          <p className="text-xs text-slate-400">
            Retards nécessitant une intervention immédiate.
          </p>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-xs">
            <MetricCard title="Total retards critiques" value="0" />
            <MetricCard title="Plus de 30 jours" value="0" />
            <MetricCard title="Plus de 60 jours" value="0" />
            <MetricCard title="Impact budget" value="0 €" />
          </div>
        </section>

        {/* Liste des retards */}
        <section>
          <h3 className="text-sm font-semibold text-slate-100 mb-2">
            Liste des retards critiques
          </h3>
          <div className="min-h-[260px] rounded-xl border border-slate-800/60 bg-slate-950/60 p-3">
            <div className="h-full w-full flex items-center justify-center text-xs text-slate-500 border border-dashed border-slate-700/60 rounded-lg min-h-[240px]">
              Ici, tu intègres agGrid avec les retards critiques
            </div>
          </div>
        </section>

        {/* Widget Sécurité */}
        <section>
          <BtpSecurityWidget criticalEventsCount={3} compliancePercent={92} />
        </section>
      </div>
    </CockpitLayout>
  );
}

// ---------------------------------------------------------------------------
// Composants locaux
// ---------------------------------------------------------------------------

function MetricCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-800/60 bg-slate-950/60 px-3 py-3">
      <p className="text-xs text-slate-300">{title}</p>
      <p className="mt-2 text-lg font-semibold text-slate-50">{value}</p>
    </div>
  );
}
