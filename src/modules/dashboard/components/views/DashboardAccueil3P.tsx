/**
 * Vue d'accueil Cockpit DG — Synthèse exécution, finance, risques.
 * Affichée par défaut sur pilotage/dashboard/default.
 * Navigation principale : SubNav (Vue d'ensemble, Projets, etc.) + sidebar.
 */

'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  Activity,
  AlertTriangle,
  Briefcase,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FileText,
  Gavel,
  HeartPulse,
  ShoppingCart,
  ThumbsUp,
} from 'lucide-react';
import { DashboardPanel } from '../shared/DashboardPanel';
import { FinancesGlobalesWidget } from '../shared/FinancesGlobalesWidget';
import { SparklineChart } from '../shared/SparklineChart';
import { formatCFA } from '../cockpit/OrangeMoneyButton';
import { financesGlobales } from '../../data/financesGlobalesMock';

// Données mock Phase 4 — à remplacer par API (aligné DashboardCleanHome)
const phase4Critiques = [
  { numero: '#042', ca: 2_400_000, sante: 0.62, stockPeinture: 0.02, bureau: '1/3' },
  { numero: '#038', ca: 1_800_000, sante: 0.45, stockPeinture: 0.08, bureau: '2/3' },
  { numero: '#051', ca: 3_100_000, sante: 0.78, stockPeinture: 0.15, bureau: '1/3' },
  { numero: '#033', ca: 950_000, sante: 0.31, stockPeinture: 0, bureau: '1/3' },
  { numero: '#047', ca: 2_700_000, sante: 0.55, stockPeinture: 0.05, bureau: '2/3' },
];

function getSanteColor(sante: number): string {
  if (sante >= 0.7) return 'bg-emerald-500';
  if (sante >= 0.5) return 'bg-amber-500';
  return 'bg-red-500';
}

/** KPIs optionnels : si fournis par la page dashboard, les valeurs affichées sont alignées sur la barre KPI. */
export interface DashboardAccueil3PProps {
  kpis?: Array<{ label: string; value?: string | number; delta?: string }>;
}

function getKpiValue(kpis: DashboardAccueil3PProps['kpis'], label: string): string | null {
  const k = kpis?.find((kp) => kp.label === label || (kp.label && kp.label.includes(label)));
  return k != null ? String(k.value) : null;
}

export function DashboardAccueil3P({ kpis }: DashboardAccueil3PProps = {}) {
  const [kpisExpanded, setKpisExpanded] = useState(false);

  const demandesVal = getKpiValue(kpis, 'Demandes') ?? '247';
  const validationsVal = getKpiValue(kpis, 'Validations') ?? '89%';
  const blocagesVal = getKpiValue(kpis, 'Blocages') ?? '5';
  const decisionsVal = getKpiValue(kpis, 'Décisions') ?? getKpiValue(kpis, 'Décisions en attente') ?? '8';

  return (
    <div className="p-4 sm:p-6 w-full min-w-0 space-y-6">
      {/* KPIs COMPACTS COLLAPSIBLES */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-950/80 overflow-hidden transition-all duration-300">
        {/* Header cliquable */}
        <button
          type="button"
          onClick={() => setKpisExpanded(!kpisExpanded)}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-900/40 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Activity className="h-4 w-4 text-sky-400" />
            <span className="text-xs font-medium text-slate-100">
              Indicateurs clés de performance
            </span>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="text-slate-400">Demandes: <span className="text-slate-200 font-semibold">{demandesVal}</span></span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-400">Validations: <span className="text-emerald-400 font-semibold">{validationsVal}</span></span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-400">Blocages: <span className="text-amber-400 font-semibold">{blocagesVal}</span></span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-400">Décisions: <span className="text-rose-400 font-semibold">{decisionsVal}</span></span>
            </div>
          </div>
          {kpisExpanded ? (
            <ChevronUp className="h-4 w-4 text-slate-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-slate-400" />
          )}
        </button>

        {/* Contenu détaillé expandable */}
        {kpisExpanded && (
          <div className="px-4 pb-4 border-t border-slate-800/60">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px] mt-3">
              {/* Demandes */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3 flex flex-col gap-1.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-sky-500/10 text-sky-400">
                      <ShoppingCart className="h-3.5 w-3.5" />
                    </span>
                    <div>
                      <div className="text-[11px] font-medium text-slate-100">
                        Demandes à traiter
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Achats, validations, demandes spéciales
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-base font-semibold text-slate-50">{demandesVal}</div>
                    <div className="text-[10px] text-emerald-400">
                      +12 vs semaine dernière
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-[10px] mt-1 pt-1 border-t border-slate-800">
                  <span className="text-slate-400">Délai moyen</span>
                  <span className="text-slate-200">3,2 jours</span>
                </div>
              </div>

              {/* Validations critiques */}
              <div className="rounded-xl border border-amber-500/40 bg-amber-500/8 p-3 flex flex-col gap-1.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-amber-500/20 text-amber-300">
                      <FileText className="h-3.5 w-3.5" />
                    </span>
                    <div>
                      <div className="text-[11px] font-medium text-slate-100">
                        Validations critiques
                      </div>
                      <div className="text-[10px] text-slate-200/80">
                        Paiements & contrats impactant le cash
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-base font-semibold text-slate-50">21</div>
                    <div className="text-[10px] text-amber-300">dont 5 en retard</div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-[10px] mt-1 pt-1 border-t border-amber-500/30">
                  <span className="text-slate-100/80">Priorité DG</span>
                  <span className="inline-flex items-center gap-1 text-amber-300">
                    <AlertTriangle className="h-3 w-3" />
                    <span>À traiter aujourd&apos;hui</span>
                  </span>
                </div>
              </div>

              {/* Blocages & arbitrages */}
              <div className="rounded-xl border border-rose-500/40 bg-rose-500/8 p-3 flex flex-col gap-1.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-rose-500/20 text-rose-300">
                      <Gavel className="h-3.5 w-3.5" />
                    </span>
                    <div>
                      <div className="text-[11px] font-medium text-slate-100">
                        Blocages & arbitrages
                      </div>
                      <div className="text-[10px] text-slate-200/80">
                        Litiges clients, fournisseurs, RH
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-base font-semibold text-slate-50">8</div>
                    <div className="text-[10px] text-rose-300">3 critiques</div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-[10px] mt-1 pt-1 border-t border-rose-500/30">
                  <span className="text-slate-100/80">Décisions DG attendues</span>
                  <span className="inline-flex items-center gap-1 text-emerald-300">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>4 préparées par les équipes</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Vue finance DG */}
      <DashboardPanel
        title="Vue finance DG"
        icon={Briefcase}
        subtitle="Budget, consommation et trésorerie consolidés NICE RÉNOVATION"
        className="mt-6"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-[11px]">
          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3">
            <FinancesGlobalesWidget data={financesGlobales} />
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-100">
                Synthèse portefeuille chantiers
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Trésorerie sous contrôle
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-1">
              <div className="space-y-0.5">
                <div className="text-[10px] text-slate-400">CA cumulé</div>
                <div className="text-base font-semibold text-slate-50">
                  18M XOF
                </div>
                <div className="text-[10px] text-emerald-400">
                  +3,2M vs N-1
                </div>
              </div>
              <div className="space-y-0.5">
                <div className="text-[10px] text-slate-400">Marge projetée</div>
                <div className="text-base font-semibold text-slate-50">
                  23%
                </div>
                <div className="text-[10px] text-slate-400">
                  Objectif DG : 25%
                </div>
              </div>
            </div>

            <div className="mt-2 grid grid-cols-2 gap-2">
              <div className="rounded-lg border border-slate-800 bg-slate-950/60 px-2 py-1.5 flex flex-col gap-0.5">
                <span className="text-[10px] text-slate-400">
                  Budget consommé
                </span>
                <span className="text-sm font-semibold text-slate-50">
                  84%
                </span>
                <span className="text-[10px] text-amber-300">
                  3 lots au-dessus de 95%
                </span>
              </div>
              <div className="rounded-lg border border-slate-800 bg-slate-950/60 px-2 py-1.5 flex flex-col gap-0.5">
                <span className="text-[10px] text-slate-400">
                  Exposition paiements
                </span>
                <span className="text-sm font-semibold text-slate-50">
                  21 validations en attente
                </span>
                <span className="text-[10px] text-rose-300">
                  5 impactent le cash &lt; 7 jours
                </span>
              </div>
            </div>
          </div>
        </div>
      </DashboardPanel>

      {/* Risques & satisfaction */}
      <DashboardPanel
        title="Risques & satisfaction"
        icon={HeartPulse}
        subtitle="Santé globale du portefeuille chantiers et des relations clients"
        className="mt-6"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-[11px]">
          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-100">
                Risque délais
              </span>
              <span className="text-[10px] text-amber-300">29%</span>
            </div>
            <p className="text-[10px] text-slate-400">
              Part des chantiers avec retard supérieur à 5 jours.
            </p>
            <div className="mt-1 h-6 flex items-end">
              <SparklineChart
                data={[22, 26, 24, 28, 27, 29]}
                color="amber"
                height={24}
                width={80}
              />
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-100">
                Risque budget
              </span>
              <span className="text-[10px] text-amber-300">39%</span>
            </div>
            <p className="text-[10px] text-slate-400">
              Chantiers dont la consommation dépasse 90% du budget initial.
            </p>
            <div className="mt-1 h-6 flex items-end">
              <SparklineChart
                data={[35, 38, 36, 40, 39, 39]}
                color="rose"
                height={24}
                width={80}
              />
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-100">
                Satisfaction clients
              </span>
              <span className="text-[10px] text-emerald-300">92%</span>
            </div>
            <p className="text-[10px] text-slate-400">
              Basée sur les chantiers clôturés sur les 90 derniers jours.
            </p>
            <div className="mt-1 h-6 flex items-end">
              <SparklineChart
                data={[88, 89, 90, 91, 91, 92]}
                color="emerald"
                height={24}
                width={80}
              />
            </div>
            <div className="flex items-center justify-between mt-1 pt-1 border-t border-slate-800 text-[10px]">
              <span className="inline-flex items-center gap-1 text-emerald-300">
                <ThumbsUp className="h-3 w-3" />
                <span>Score qualité : 45</span>
              </span>
              <span className="text-slate-400">
                Objectif DG : 50
              </span>
            </div>
          </div>
        </div>
      </DashboardPanel>

      {/* Phase 4 - Exécution (chantiers critiques, aligné interface Maître d'ouvrage) */}
      <DashboardPanel
        title="Phase 4 - Exécution"
        icon={Briefcase}
        subtitle="Chantiers en phase d'exécution nécessitant une attention (15 chantiers)"
        className="mt-6"
      >
        <div className="rounded-xl border border-slate-800/60 bg-slate-950/40 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[11px]">
              <thead className="bg-slate-800/60 sticky top-0 z-10">
                <tr>
                  <th className="p-3 text-left font-semibold text-slate-200">Chantier</th>
                  <th className="p-3 text-right font-semibold text-slate-200">CA</th>
                  <th className="p-3 text-right font-semibold text-slate-200">Santé</th>
                  <th className="p-3 text-right font-semibold text-slate-200">Problème</th>
                  <th className="p-3 text-right font-semibold text-slate-200">Action</th>
                </tr>
              </thead>
              <tbody>
                {phase4Critiques.map((chantier) => (
                  <tr
                    key={chantier.numero}
                    className={cn(
                      'border-t border-slate-800/60 transition-colors',
                      'hover:bg-slate-800/40'
                    )}
                  >
                    <td className="p-3 font-medium text-slate-100">{chantier.numero}</td>
                    <td className="p-3 text-right tabular-nums text-slate-300">{formatCFA(chantier.ca)}</td>
                    <td className="p-3">
                      <div className="w-16 h-3 rounded-full overflow-hidden bg-slate-700/50 inline-block">
                        <div
                          className={cn('h-full rounded-full transition-all', getSanteColor(chantier.sante))}
                          style={{ width: `${Math.round(chantier.sante * 100)}%` }}
                        />
                      </div>
                    </td>
                    <td className="p-3 text-right text-red-400">
                      {chantier.stockPeinture < 0.05 ? 'Peinture 0%' : `Bureau ${chantier.bureau}`}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        type="button"
                        className="px-3 py-1 rounded-lg bg-red-500/80 hover:bg-red-500 text-white text-[11px] font-medium transition-colors"
                      >
                        Relancer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </DashboardPanel>

      <div className="mt-6 rounded-xl border border-slate-800/60 bg-slate-900/30 p-4 text-center">
        <p className="text-xs text-slate-500">
          Logique métier : App → Modèle → Workflow (états et transitions). Chaque module utilise le domaine (demandes, gouvernance) pour les règles et indicateurs.
        </p>
      </div>
    </div>
  );
}
