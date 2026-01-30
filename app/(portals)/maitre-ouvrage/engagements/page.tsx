"use client";

/**
 * Engagements & Finances — Module BMO v1 (même briques que Cockpit DG).
 * Fenêtre centrale, command bar, navigation gauche, panneau droit KPIs + pipeline + agGrid.
 */

import { PageTemplate } from "@/components/navigation/PageTemplate";
import { BusinessWindow } from "@/components/ui/BusinessWindow";
import { CommandBar, type CommandBarItem } from "@/components/bmo/ui/CommandBar";
import { ExplorerLayoutResponsive } from "@/components/bmo/layout/ExplorerLayoutResponsive";
import { KPICard } from "@/modules/dashboard/components/shared/KPICard";
import type { KPICardData } from "@/modules/dashboard/components/shared/KPICard";
import {
  FilePlus2,
  FileText,
  CreditCard,
  Receipt,
  RefreshCw,
  Filter,
  Download,
} from "lucide-react";
import { BudgetLineChart } from "@/components/bmo/charts/BudgetLineChart";

const engagementsCommands: CommandBarItem[] = [
  {
    id: "new-request",
    label: "Nouvelle demande",
    icon: <FilePlus2 className="h-4 w-4" />,
    primary: true,
    onClick: () => {},
  },
  {
    id: "filter",
    label: "Filtres",
    icon: <Filter className="h-4 w-4" />,
    primary: true,
    onClick: () => {},
  },
  {
    id: "export",
    label: "Exporter",
    icon: <Download className="h-4 w-4" />,
    primary: false,
    onClick: () => {},
  },
  {
    id: "refresh",
    label: "Rafraîchir",
    icon: <RefreshCw className="h-4 w-4" />,
    primary: false,
    onClick: () => {},
  },
];

const engagementsKpis: KPICardData[] = [
  { id: "budget", label: "Budget total", value: "4,8 Md F CFA", description: "100 %", color: "blue" },
  { id: "engage", label: "Engagé", value: "3,2 Md F CFA", description: "66 % du budget", color: "amber" },
  { id: "facture", label: "Facturé", value: "2,1 Md F CFA", description: "44 % du budget", color: "blue" },
  { id: "paye", label: "Payé", value: "1,7 Md F CFA", description: "35 % du budget", color: "emerald" },
];

export default function EngagementsPage() {
  return (
    <PageTemplate
      title="Engagements & Finances"
      description="Suivi des demandes, engagements, factures et paiements sur l'ensemble du portefeuille."
    >
      <div className="mx-auto w-full max-w-6xl">
        <BusinessWindow title="Engagements & Finances – NICE RÉNOVATION">
          <CommandBar items={engagementsCommands} />
          <div className="mt-4">
            <ExplorerLayoutResponsive
              nav={<EngagementsNavPane />}
              content={<EngagementsRightPane />}
            />
          </div>
        </BusinessWindow>
      </div>
    </PageTemplate>
  );
}

function EngagementsNavPane() {
  const sections = [
    { id: "overview", label: "Synthèse" },
    { id: "requests", label: "Demandes", icon: FileText },
    { id: "orders", label: "Bons de commande", icon: Receipt },
    { id: "invoices", label: "Factures", icon: FileText },
    { id: "payments", label: "Paiements", icon: CreditCard },
  ];

  return (
    <div className="p-3 text-xs text-slate-200">
      <p className="px-2 mb-2 text-[0.7rem] font-semibold uppercase text-slate-500">
        Flux financiers
      </p>
      <ul className="space-y-1">
        {sections.map((s) => {
          const Icon = s.icon;
          return (
            <li key={s.id}>
              <button
                type="button"
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800/80 flex items-center gap-2"
              >
                {Icon && <Icon className="h-4 w-4" />}
                <span>{s.label}</span>
              </button>
            </li>
          );
        })}
      </ul>

      <p className="mt-4 px-2 mb-2 text-[0.7rem] font-semibold uppercase text-slate-500">
        Vues sauvegardées
      </p>
      <ul className="space-y-1">
        <li>
          <button
            type="button"
            className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800/80"
          >
            Dossiers &gt; 50 M F CFA
          </button>
        </li>
        <li>
          <button
            type="button"
            className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800/80"
          >
            Factures en retard &gt; 30 jours
          </button>
        </li>
      </ul>
    </div>
  );
}

function EngagementsRightPane() {
  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-slate-800/70 bg-slate-950/80 shrink-0">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-xs">
          {engagementsKpis.map((kpi) => (
            <KPICard key={kpi.id} kpi={kpi} size="sm" />
          ))}
        </div>
      </div>

      <div className="flex-1 min-h-0 min-w-0 overflow-y-auto p-4 bg-slate-950/60">
        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-slate-100">
            Pipeline d'engagements
          </h2>
          <p className="text-xs text-slate-400">
            De la demande initiale au paiement effectif.
          </p>
          <div className="rounded-xl border border-slate-800/60 bg-slate-950/60 p-4 h-[260px]">
            <Placeholder>
              Ici, tu pourras mettre un graphique funnel ou un diagramme Kanban
              (Demandes → BC → Factures → Paiements).
            </Placeholder>
          </div>
        </section>

        <section className="mt-6 space-y-2">
          <h2 className="text-sm font-semibold text-slate-100">
            Évolution du budget consommé
          </h2>
          <p className="text-xs text-slate-400">
            % du budget consommé par mois (Nivo).
          </p>
          <div className="rounded-xl border border-slate-800/60 bg-slate-950/60 p-4">
            <BudgetLineChart />
          </div>
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-2">
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-slate-100">
              Demandes à forte valeur
            </h3>
            <p className="text-xs text-slate-400">
              Dossiers à fort impact budgétaire, à prioriser pour validation.
            </p>
            <div className="rounded-xl border border-slate-800/60 bg-slate-950/60 p-3 min-h-[220px]">
              <div className="h-full w-full flex items-center justify-center text-xs text-slate-500 border border-dashed border-slate-700/60 rounded-lg">
                Tableau des demandes par montant / urgence (agGrid ici)
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-slate-100">
              Factures en risque
            </h3>
            <p className="text-xs text-slate-400">
              Factures en litige, hors budget ou en retard de paiement.
            </p>
            <div className="rounded-xl border border-slate-800/60 bg-slate-950/60 p-3 min-h-[220px]">
              <div className="h-full w-full flex items-center justify-center text-xs text-slate-500 border border-dashed border-slate-700/60 rounded-lg">
                Tableau des factures en dépassement (agGrid ici)
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function Placeholder({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full w-full flex items-center justify-center text-xs text-slate-500 border border-dashed border-slate-700/60 rounded-lg p-4 text-center">
      {children}
    </div>
  );
}
