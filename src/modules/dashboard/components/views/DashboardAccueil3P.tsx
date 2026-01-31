/**
 * Vue d'accueil Cockpit DG — Synthèse exécution, finance, risques.
 * Affichée par défaut sur pilotage/dashboard/default.
 * Navigation principale : SubNav (Vue d'ensemble, Projets, etc.) + sidebar.
 */

'use client';

import React, { useState, useMemo, memo } from 'react';
import { cn } from '@/lib/utils';
import {
  Activity,
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Briefcase,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FileText,
  Gavel,
  HeartPulse,
  ShoppingCart,
  ThumbsUp,
  ShieldAlert,
  TrendingUp,
  Clock,
  Target,
  Leaf,
  BarChart3,
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DashboardPanel } from '../shared/DashboardPanel';
import { FinancesGlobalesWidget } from '../shared/FinancesGlobalesWidget';
import { TresoreriePrevisionnelleWidget } from '../shared/TresoreriePrevisionnelleWidget';
import { AlertesIntelligentesWidget } from '../shared/AlertesIntelligentesWidget';
import { HSEConformiteWidget } from '../shared/HSEConformiteWidget';
import { CustomizableDashboard } from '../shared/CustomizableDashboard';
import { SparklineChart } from '../shared/SparklineChart';
import { useDashboardCommandCenterStore } from '@/lib/stores/dashboardCommandCenterStore';
import { useTresoreriePrevisionnelle } from '../../hooks/useTresoreriePrevisionnelle';
import { formatCFA } from '../cockpit/OrangeMoneyButton';
import { financesGlobales } from '../../data/financesGlobalesMock';
import { chantiers } from '../../data/chantiersMock';
import { getScoreQualiteBreakdown, getTypologieBlocages, getRoiParTypeChantier, getIndicateursComplementaires, ACTIVITE_RECENTE_MOCK, type PerimetreId } from '../../data/dashboardCockpitMock';
import type { Contact } from '../../types/dashboardDomain';
import { getHealthBarBgClass, getHealthLabel } from '@lib-root/dashboard/kpi';
import { CallCompanyModal } from '../modals/CallCompanyModal';
import { AutoRelanceModal } from '../modals/AutoRelanceModal';
import { EscalateDGModal } from '../modals/EscalateDGModal';
import { ScheduleVisitModal } from '../modals/ScheduleVisitModal';
import { ChantierDetailModal } from '../modals/ChantierDetailModal';
import { CreancesModal } from '../modals/CreancesModal';
import { ValidationsModal } from '../modals/ValidationsModal';
import { BudgetConsommeModal } from '../modals/BudgetConsommeModal';
import { DecisionsEnAttenteModal } from '../modals/DecisionsEnAttenteModal';
import type { ChantierMock } from '../../data/chantiersMock';

// Données mock Phase 4 — 15 chantiers (à remplacer par API)
type Phase4RowStatic = {
  numero: string;
  ca: number;
  sante: number;
  stockPeinture: number;
  bureau: string;
};
type Phase4Row = Phase4RowStatic;

const PHASE4_ALL: Phase4RowStatic[] = [
  { numero: '#042', ca: 2_400_000, sante: 0.62, stockPeinture: 0.02, bureau: '1/3' },
  { numero: '#038', ca: 1_800_000, sante: 0.45, stockPeinture: 0.08, bureau: '2/3' },
  { numero: '#051', ca: 3_100_000, sante: 0.78, stockPeinture: 0.15, bureau: '1/3' },
  { numero: '#033', ca: 950_000, sante: 0.31, stockPeinture: 0, bureau: '1/3' },
  { numero: '#047', ca: 2_700_000, sante: 0.55, stockPeinture: 0.05, bureau: '2/3' },
  { numero: '#034', ca: 1_200_000, sante: 0.28, stockPeinture: 0, bureau: '0/3' },
  { numero: '#035', ca: 2_100_000, sante: 0.82, stockPeinture: 0.22, bureau: '3/3' },
  { numero: '#036', ca: 880_000, sante: 0.48, stockPeinture: 0.06, bureau: '1/3' },
  { numero: '#039', ca: 3_500_000, sante: 0.91, stockPeinture: 0.30, bureau: '3/3' },
  { numero: '#040', ca: 1_650_000, sante: 0.52, stockPeinture: 0.04, bureau: '2/3' },
  { numero: '#041', ca: 2_900_000, sante: 0.72, stockPeinture: 0.12, bureau: '2/3' },
  { numero: '#043', ca: 1_100_000, sante: 0.38, stockPeinture: 0.01, bureau: '1/3' },
  { numero: '#044', ca: 2_050_000, sante: 0.65, stockPeinture: 0.10, bureau: '2/3' },
  { numero: '#045', ca: 1_400_000, sante: 0.42, stockPeinture: 0.03, bureau: '1/3' },
  { numero: '#048', ca: 3_200_000, sante: 0.85, stockPeinture: 0.18, bureau: '3/3' },
];

type Phase4SortKey = 'numero' | 'ca' | 'sante' | 'stockPeinture' | 'bureau';
type Phase4FilterSante = 'all' | 'critique' | 'surveiller' | 'bon';

const PHASE4_INITIAL_LIMIT = 5;

/** Résoudre un ChantierMock pour le détail modal : priorité chantiers mock, sinon minimal depuis la ligne Phase 4. */
function getChantierForDetail(numero: string, row?: Phase4Row): ChantierMock {
  const num = numero.replace('#', '');
  const fromMock = chantiers.find((ch) => ch.id.includes(num));
  if (fromMock) return fromMock;
  return {
    id: numero,
    segment: 'NICE RÉNOVATION',
    prestation: 'Exécution',
    phase: 4,
    ca: row?.ca ?? 0,
    marge: 0.2,
    sante: row?.sante ?? 0.5,
    gpsLive: false,
    bureauControle: row?.bureau ?? '0/3',
    photosGps: 0,
  };
}

type Phase4ActionType = 'call' | 'relance' | 'escalade' | 'visit';

/** Actions rapides différenciées par chantier (ex: Appeler, Relance auto, Escalade DG). */
const phase4Actions: Record<string, { label: string; variant: 'danger' | 'warning'; type: Phase4ActionType }> = {
  '#042': { label: '📞 Appeler entreprise', variant: 'danger', type: 'call' },
  '#038': { label: '📧 Relance automatique', variant: 'warning', type: 'relance' },
  '#051': { label: '🔔 Escalade au DG', variant: 'danger', type: 'escalade' },
  '#033': { label: '📞 Appeler entreprise', variant: 'danger', type: 'call' },
  '#047': { label: '✅ Planifier visite', variant: 'warning', type: 'visit' },
  '#034': { label: '📞 Appeler entreprise', variant: 'danger', type: 'call' },
  '#035': { label: '✅ Planifier visite', variant: 'warning', type: 'visit' },
  '#036': { label: '📧 Relance automatique', variant: 'warning', type: 'relance' },
  '#039': { label: '✅ Planifier visite', variant: 'warning', type: 'visit' },
  '#040': { label: '📧 Relance automatique', variant: 'warning', type: 'relance' },
  '#041': { label: '📞 Appeler entreprise', variant: 'danger', type: 'call' },
  '#043': { label: '🔔 Escalade au DG', variant: 'danger', type: 'escalade' },
  '#044': { label: '📧 Relance automatique', variant: 'warning', type: 'relance' },
  '#045': { label: '📞 Appeler entreprise', variant: 'danger', type: 'call' },
  '#048': { label: '✅ Planifier visite', variant: 'warning', type: 'visit' },
};

/** Couleur de la barre santé (0–1) — aligné getHealthBarBgClass(percent). */
function getSanteColor(sante: number): string {
  return getHealthBarBgClass(Math.round(sante * 100));
}

/** KPIs optionnels : si fournis par la page dashboard, les valeurs affichées sont alignées sur la barre KPI. */
export interface DashboardAccueil3PProps {
  kpis?: Array<{ label: string; value?: string | number; delta?: string }>;
  /** Périmètre sélectionné (pour score qualité et typologie blocages en mock). */
  perimetreFilter?: PerimetreId;
}

function getKpiValue(kpis: DashboardAccueil3PProps['kpis'], label: string): string | null {
  const k = kpis?.find((kp) => kp.label === label || (kp.label && kp.label.includes(label)));
  return k != null ? String(k.value) : null;
}

export const DashboardAccueil3P = memo(function DashboardAccueil3P({ kpis, perimetreFilter = 'nice-renovation' }: DashboardAccueil3PProps = {}) {
  const scoreQualite = getScoreQualiteBreakdown(perimetreFilter);
  const blocagesBreakdown = getTypologieBlocages(perimetreFilter);
  const [kpisExpanded, setKpisExpanded] = useState(false);
  const [cockpitView, setCockpitView] = useState<'finances' | 'operations' | 'risques'>('finances');

  /** Modals Phase 4 (appel, relance, escalade, visite) */
  const [phase4Action, setPhase4Action] = useState<'call' | 'relance' | 'escalade' | 'visit' | null>(null);
  const [phase4SelectedRow, setPhase4SelectedRow] = useState<Phase4Row | null>(null);

  /** Modal détail chantier (clic sur #042, #038, etc.) */
  const [chantierDetailRow, setChantierDetailRow] = useState<Phase4Row | null>(null);

  /** Modals créances, validations, budget consommé, décisions en attente */
  const [creancesModalOpen, setCreancesModalOpen] = useState(false);
  const [validationsModalOpen, setValidationsModalOpen] = useState(false);
  const [budgetConsommeModalOpen, setBudgetConsommeModalOpen] = useState(false);
  const [decisionsModalOpen, setDecisionsModalOpen] = useState(false);

  /** Phase 2 : personnalisation cockpit (shell — à venir) */
  const [showPersonalizeMessage, setShowPersonalizeMessage] = useState(false);

  /** Phase 4 : tri, filtre Santé, limite d'affichage (5 / 15) */
  const [phase4SortBy, setPhase4SortBy] = useState<Phase4SortKey>('sante');
  const [phase4SortDir, setPhase4SortDir] = useState<'asc' | 'desc'>('asc');
  const [phase4FilterSante, setPhase4FilterSante] = useState<Phase4FilterSante>('all');
  const [phase4DisplayLimit, setPhase4DisplayLimit] = useState(PHASE4_INITIAL_LIMIT);

  const togglePhase4Sort = (key: Phase4SortKey) => {
    if (phase4SortBy === key) setPhase4SortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setPhase4SortBy(key);
      setPhase4SortDir('asc');
    }
  };

  const phase4Filtered = PHASE4_ALL.filter((row) => {
    if (phase4FilterSante === 'all') return true;
    const pct = Math.round(row.sante * 100);
    if (phase4FilterSante === 'critique') return pct < 50;
    if (phase4FilterSante === 'surveiller') return pct >= 50 && pct < 80;
    if (phase4FilterSante === 'bon') return pct >= 80;
    return true;
  });

  const phase4Sorted = [...phase4Filtered].sort((a, b) => {
    let cmp = 0;
    switch (phase4SortBy) {
      case 'numero':
        cmp = a.numero.localeCompare(b.numero);
        break;
      case 'ca':
        cmp = a.ca - b.ca;
        break;
      case 'sante':
        cmp = a.sante - b.sante;
        break;
      case 'stockPeinture':
        cmp = a.stockPeinture - b.stockPeinture;
        break;
      case 'bureau':
        cmp = a.bureau.localeCompare(b.bureau);
        break;
      default:
        break;
    }
    return phase4SortDir === 'asc' ? cmp : -cmp;
  });

  const phase4Displayed = phase4Sorted.slice(0, phase4DisplayLimit);
  const phase4TotalCount = PHASE4_ALL.length;
  const phase4FilteredCount = phase4Filtered.length;
  const phase4HasMore = phase4FilteredCount > phase4DisplayLimit;
  const phase4ShowReduce = phase4DisplayLimit > PHASE4_INITIAL_LIMIT;

  const openPhase4Action = (type: Phase4ActionType, row: Phase4Row) => {
    setPhase4SelectedRow(row);
    setPhase4Action(type);
  };
  const closePhase4Action = () => {
    setPhase4Action(null);
    setPhase4SelectedRow(null);
  };

  /** Entreprise mock par chantier (à remplacer par API). */
  const getEntreprise = (row: Phase4Row) => ({
    nom: `Entreprise ${row.numero}`,
    telephone: '+221 77 123 45 67',
    email: 'contact@exemple.sn',
  });

  /** Historique des contacts mock par chantier (à remplacer par API). */
  const getHistoriqueContacts = (numero: string): Contact[] => {
    const base = new Date();
    const day = (d: number) => new Date(base.getTime() - d * 24 * 60 * 60 * 1000);
    const byNum: Record<string, Contact[]> = {
      '#042': [
        { id: 'c1', date: day(2), type: 'appel', notes: 'Relance peinture — entreprise confirme livraison sous 48h.', auteur: 'A. Diallo' },
        { id: 'c2', date: day(5), type: 'email', notes: 'Envoi planning bureau 2/3.', auteur: 'MO' },
      ],
      '#038': [
        { id: 'c3', date: day(1), type: 'appel', notes: 'Pas de réponse — messagerie.', auteur: 'A. Diallo' },
      ],
      '#033': [
        { id: 'c4', date: day(3), type: 'visite', notes: 'Point chantier — retard matériel.', auteur: 'Équipe terrain' },
      ],
    };
    return byNum[numero] ?? [];
  };

  const navigate = useDashboardCommandCenterStore((s) => s.navigate);
  const { previsions: previsionsTresorerie, isLoading: loadingTresorerie } = useTresoreriePrevisionnelle({ days: 90 });

  const [showCustomizable, setShowCustomizable] = useState(false);

  const widgetCatalog = useMemo(
    () => ({
      finances_recap: {
        label: 'Finances',
        component: (
          <FinancesGlobalesWidget
            data={financesGlobales}
            onCreancesClick={() => setCreancesModalOpen(true)}
          />
        ),
      },
      tresorerie_prevision: {
        label: 'Prévisionnel Trésorerie 90j',
        component: (
          <TresoreriePrevisionnelleWidget
            previsions={previsionsTresorerie.length > 0 ? previsionsTresorerie : undefined}
            onRelancerCreances={() => setCreancesModalOpen(true)}
          />
        ),
      },
      alertes: {
        label: 'Alertes',
        component: (
          <AlertesIntelligentesWidget onVoirTout={() => navigate('pilotage', 'alertes', 'default')} />
        ),
      },
      hse: {
        label: 'HSE & Conformité',
        component: <HSEConformiteWidget onDeclarerIncident={() => {}} />,
      },
    }),
    [previsionsTresorerie, navigate]
  );

  const demandesVal = getKpiValue(kpis, 'Demandes') ?? '247';
  const validationsVal = getKpiValue(kpis, 'Validations') ?? '89%';
  const blocagesVal = getKpiValue(kpis, 'Blocages') ?? '5';
  const decisionsVal = getKpiValue(kpis, 'Décisions') ?? getKpiValue(kpis, 'Décisions en attente') ?? '8';
  const delaiPaiementVal = getKpiValue(kpis, 'Délai moyen paiement') ?? '42 j';

  return (
    <div className="p-4 sm:p-6 w-full min-w-0 max-w-full overflow-x-hidden space-y-6">
      <h1 className="sr-only">Cockpit DG — Vue d&apos;ensemble</h1>
      {/* Bascule Vue classique / Vue personnalisable */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setShowCustomizable(!showCustomizable)}
          className="text-[11px] text-sky-400 hover:text-sky-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 rounded px-3 py-2 min-h-[44px]"
          aria-pressed={showCustomizable}
          aria-label={showCustomizable ? 'Afficher la vue classique' : 'Afficher la vue personnalisable'}
        >
          {showCustomizable ? 'Vue classique' : 'Vue personnalisable'}
        </button>
      </div>

      {showCustomizable ? (
        <CustomizableDashboard
          storageKey="cockpit-dg-widgets"
          defaultOrder={['finances_recap', 'tresorerie_prevision', 'alertes', 'hse']}
          widgets={widgetCatalog}
        />
      ) : (
        <>
      {/* KPIs COMPACTS COLLAPSIBLES */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-950/80 overflow-hidden transition-all duration-300">
        {/* Header cliquable */}
        <button
          type="button"
          onClick={() => setKpisExpanded(!kpisExpanded)}
          className="w-full px-4 py-3 min-h-[44px] flex items-center justify-between hover:bg-slate-900/40 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/50 focus-visible:ring-inset"
          aria-expanded={kpisExpanded}
          aria-label={kpisExpanded ? 'Replier les indicateurs KPI' : 'Déplier les indicateurs KPI'}
        >
          <div className="flex items-center gap-3">
            <Activity className="h-4 w-4 text-sky-400" aria-hidden />
            <span className="text-xs font-medium text-slate-100" title="Rafraîchir, Exporter et Gérer les alertes KPI s'appliquent à l'ensemble du cockpit">
              Indicateurs clés de performance (cockpit)
            </span>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="text-slate-400">Demandes: <span className="text-slate-200 font-semibold">{demandesVal}</span></span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-400">Validations: <span className="text-emerald-400 font-semibold">{validationsVal}</span></span>
              <span className="text-slate-600">·</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-slate-400 cursor-help">
                      Blocages: <span className="text-amber-400 font-semibold">{blocagesVal}</span>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[200px]">
                    <div className="text-xs font-medium text-slate-100 mb-1">Typologie (audit ERP BTP 2026)</div>
                    <div className="text-[11px] text-slate-300 space-y-0.5">
                      <div className="flex justify-between gap-2"><span>Technique (matériaux)</span><span className="tabular-nums">{blocagesBreakdown.technique}</span></div>
                      <div className="flex justify-between gap-2"><span>Administratif (autorisation)</span><span className="tabular-nums">{blocagesBreakdown.administratif}</span></div>
                      <div className="flex justify-between gap-2"><span>Financier (paiement)</span><span className="tabular-nums">{blocagesBreakdown.financier}</span></div>
                      <div className="flex justify-between gap-2"><span>RH (absence équipe)</span><span className="tabular-nums">{blocagesBreakdown.rh}</span></div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <span className="text-slate-600">·</span>
              <span className="text-slate-400">Décisions: <span className="text-rose-400 font-semibold">{decisionsVal}</span></span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-400">Délai paiement: <span className="text-cyan-400 font-semibold">{delaiPaiementVal}</span></span>
            </div>
          </div>
          {kpisExpanded ? (
            <ChevronUp className="h-4 w-4 text-slate-400" aria-hidden />
          ) : (
            <ChevronDown className="h-4 w-4 text-slate-400" aria-hidden />
          )}
        </button>

        {/* Contenu détaillé expandable */}
        {kpisExpanded && (
          <div className="px-4 pb-4 border-t border-slate-800/60">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-[11px] mt-3">
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

              {/* Délai moyen paiement (placeholder — à brancher sur API) */}
              <div className="rounded-xl border border-cyan-500/40 bg-cyan-500/8 p-3 flex flex-col gap-1.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-300">
                      <Clock className="h-3.5 w-3.5" />
                    </span>
                    <div>
                      <div className="text-[11px] font-medium text-slate-100">
                        Délai moyen paiement
                      </div>
                      <div className="text-[10px] text-slate-200/80">
                        Jours entre facture et encaissement
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-base font-semibold text-slate-50">{delaiPaiementVal}</div>
                    <div className="text-[10px] text-cyan-300">objectif &lt; 45 j</div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-[10px] mt-1 pt-1 border-t border-cyan-500/30">
                  <span className="text-slate-100/80">Périmètre</span>
                  <span className="text-cyan-300">NICE RÉNOVATION</span>
                </div>
              </div>

              {/* Phase 2 — ROI par type de chantier (mock) */}
              <div className="rounded-xl border border-violet-500/40 bg-violet-500/8 p-3 flex flex-col gap-1.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-violet-500/20 text-violet-300">
                      <Target className="h-3.5 w-3.5" />
                    </span>
                    <div>
                      <div className="text-[11px] font-medium text-slate-100">
                        ROI par type de chantier
                      </div>
                      <div className="text-[10px] text-slate-200/80">
                        Return on investment (mock)
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-1 pt-1 border-t border-violet-500/30 space-y-1">
                  {getRoiParTypeChantier(perimetreFilter).slice(0, 4).map((row) => (
                    <div key={row.typeChantier} className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-300 truncate">{row.typeChantier}</span>
                      <span className="text-violet-300 font-medium tabular-nums">{row.roi.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between text-[10px] mt-1 pt-1 border-t border-violet-500/30">
                  <span className="text-slate-100/80">Périmètre</span>
                  <span className="text-violet-300">{perimetreFilter === 'tous' ? 'Tous' : 'NICE RÉNOVATION'}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Vue finance DG — switch de vue + périmètre NICE RÉNOVATION, devise XOF */}
      <DashboardPanel
        title="Vue finances DG"
        icon={Briefcase}
        subtitle="Budget, consommation et trésorerie consolidés — périmètre NICE RÉNOVATION"
        className="mt-6"
      >
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <label htmlFor="cockpit-view" className="text-[11px] text-slate-400">
            Vue cockpit :
          </label>
          <div className="flex items-center gap-2">
            <select
              id="cockpit-view"
              value={cockpitView}
              onChange={(e) => setCockpitView(e.target.value as 'finances' | 'operations' | 'risques')}
              className="rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-1.5 text-xs text-slate-200 focus:border-sky-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
              aria-label="Changer de vue cockpit (finances, opérations, risques)"
            >
              <option value="finances">Vue finances</option>
              <option value="operations">Vue opérations</option>
              <option value="risques">Vue risques</option>
            </select>
            <button
              type="button"
              onClick={() => setShowPersonalizeMessage((v) => !v)}
              className="rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-2 min-h-[44px] text-[11px] text-slate-300 hover:bg-slate-700/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
              title="Personnaliser l'affichage (réorganiser les widgets)"
              aria-label="Personnaliser l'affichage du dashboard"
            >
              ✏️ Personnaliser
            </button>
          </div>
        </div>
        {showPersonalizeMessage && (
          <div className="mb-4 rounded-lg border border-sky-500/30 bg-sky-500/10 px-3 py-2 text-[11px] text-sky-200">
            Mode personnalisation à venir : réorganisez les widgets par glisser-déposer (comme Procore). Disponible dans une prochaine version.
          </div>
        )}
        {cockpitView !== 'finances' ? (
          <div className="rounded-xl border border-slate-800/60 bg-slate-950/40 p-6 text-center text-sm text-slate-400">
            {cockpitView === 'operations' && 'Vue opérations : indicateurs chantiers et exécution — à venir.'}
            {cockpitView === 'risques' && 'Vue risques : risques critiques et litiges — à venir.'}
          </div>
        ) : (
        <>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-[11px]">
          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3">
            <FinancesGlobalesWidget data={financesGlobales} onCreancesClick={() => setCreancesModalOpen(true)} />
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-100">
                Synthèse portefeuille chantiers (NICE RÉNOVATION)
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Trésorerie : saine
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-1">
              <div className="space-y-0.5">
                <div className="text-[10px] text-slate-400">CA cumulé 2026 (tous chantiers NICE RÉNOVATION)</div>
                <div className="text-base font-semibold text-slate-50">
                  18 M XOF
                </div>
                <div className="text-[10px] text-emerald-400">
                  +3,2 M XOF vs 2025
                </div>
              </div>
              <div className="space-y-0.5">
                <div className="text-[10px] text-slate-400">Marge projetée</div>
                <div className="text-base font-semibold text-slate-50">
                  23 %
                </div>
                <div className="text-[10px] text-slate-400">
                  Objectif DG : 25 %
                </div>
              </div>
            </div>

            <div className="mt-2 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setBudgetConsommeModalOpen(true)}
                className="rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 min-h-[44px] flex flex-col gap-0.5 text-left hover:bg-slate-800/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/50"
                aria-label="Ouvrir le détail Budget consommé par chantier"
              >
                <span className="text-[10px] text-slate-400">
                  Budget consommé (portefeuille)
                </span>
                <span className="text-sm font-semibold text-slate-50">
                  84 %
                </span>
                <span className="text-[10px] text-amber-300">
                  ⚠️ 3 chantiers au-dessus de 95 %
                </span>
              </button>
              <button
                type="button"
                onClick={() => setValidationsModalOpen(true)}
                className="rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 min-h-[44px] flex flex-col gap-0.5 text-left hover:bg-slate-800/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/50"
                aria-label="Ouvrir les validations en attente (21 / 45)"
              >
                <span className="text-[10px] text-slate-400">
                  Validations en attente
                </span>
                <span className="text-sm font-semibold text-slate-50">
                  21 <span className="text-slate-400 font-normal text-xs">/ 45</span>
                </span>
                <span className="text-[10px] text-emerald-400">
                  ↑ +3 depuis hier
                </span>
                <span className="text-[10px] text-rose-300">
                  🔴 5 impactent le cash sous 7 jours
                </span>
              </button>
            </div>
            <button
              type="button"
              onClick={() => setDecisionsModalOpen(true)}
              className="mt-2 w-full rounded-lg border border-slate-800 bg-slate-950/40 px-3 py-2 min-h-[44px] flex items-center justify-between text-left hover:bg-slate-800/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/50 text-[11px]"
              aria-label={`Ouvrir les décisions en attente (${decisionsVal})`}
            >
              <span className="text-slate-400">📋 Décisions en attente</span>
              <span className="text-slate-100 font-semibold">{decisionsVal}</span>
            </button>
          </div>
        </div>

        {/* Prévisionnel Trésorerie 90j — Phase 2 audit ERP BTP 2026 (données API ou mock) */}
        <div className="mt-4">
          <TresoreriePrevisionnelleWidget
            previsions={previsionsTresorerie.length > 0 ? previsionsTresorerie : undefined}
            onRelancerCreances={() => setCreancesModalOpen(true)}
          />
        </div>

        {/* Alertes prédictives — Phase 2 audit ERP BTP 2026 */}
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <AlertesIntelligentesWidget
            onVoirTout={() => navigate('pilotage', 'alertes', 'default')}
          />
        </div>
        </>
        )}
      </DashboardPanel>

      {/* HSE & Conformité — Phase 3 audit ERP BTP 2026 */}
      <div className="mt-6">
        <HSEConformiteWidget onDeclarerIncident={() => {}} />
      </div>

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
              <span className="text-[10px] text-amber-300">29 %</span>
            </div>
            <p className="text-[10px] text-slate-400">
              Part des chantiers avec &gt; 5 j de retard
            </p>
            <div className="mt-2 h-10 flex items-end">
              <SparklineChart
                data={[22, 26, 24, 28, 27, 29]}
                color="amber"
                height={36}
                width={100}
                label="Risque délais"
                unit=" %"
              />
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-100">
                Risque budget
              </span>
              <span className="text-[10px] text-amber-300">39 %</span>
            </div>
            <p className="text-[10px] text-slate-400">
              Chantiers &gt; 90 % du budget initial
            </p>
            <div className="mt-2 h-10 flex items-end">
              <SparklineChart
                data={[35, 38, 36, 40, 39, 39]}
                color="rose"
                height={36}
                width={100}
                label="Risque budget"
                unit=" %"
              />
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-100">
                Satisfaction clients
              </span>
              <span className="text-[10px] text-emerald-300">92 %</span>
            </div>
            <p className="text-[10px] text-slate-400">
              Chantiers clôturés (90 derniers jours)
            </p>
            <div className="mt-2 h-10 flex items-end">
              <SparklineChart
                data={[88, 89, 90, 91, 91, 92]}
                color="emerald"
                height={36}
                width={100}
                label="Satisfaction"
                unit=" %"
              />
            </div>
            <div className="flex items-center justify-between mt-1 pt-1 border-t border-slate-800 text-[10px]">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex items-center gap-1 text-emerald-300 cursor-help">
                      <ThumbsUp className="h-3 w-3" />
                      <span>Score qualité (sur 100)</span>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[220px]">
                    <div className="text-xs font-medium text-slate-100 mb-1">Décomposition (audit ERP BTP 2026)</div>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[11px] text-slate-300">
                      <span>Finitions (photos avant/après)</span><span className="tabular-nums text-right">{scoreQualite.finitions}</span>
                      <span>Délais (% livrés à l&apos;heure)</span><span className="tabular-nums text-right">{scoreQualite.delais}</span>
                      <span>Conformité (% réserves levées)</span><span className="tabular-nums text-right">{scoreQualite.conformite}</span>
                      <span>Satisfaction (NPS client)</span><span className="tabular-nums text-right">{scoreQualite.satisfaction}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">Score global : moyenne pondérée = {scoreQualite.global}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <span className="text-slate-200 font-medium">{scoreQualite.global}</span>
              <span className="text-slate-400">
                Objectif DG : 50
              </span>
            </div>
          </div>
        </div>
      </DashboardPanel>

      {/* Indicateurs complémentaires DG — Phase 2 audit (mock : HSE, productivité, délai paiement, ROI, taux utilisation, bilan carbone) */}
      <DashboardPanel
        title="Indicateurs complémentaires"
        icon={Target}
        subtitle="Conformité HSE, rentabilité, trésorerie, utilisation, carbone — standards marché 2026"
        className="mt-6"
      >
        {(() => {
          const ind = getIndicateursComplementaires(perimetreFilter);
          return (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-[11px]">
              <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3 flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-emerald-400" aria-hidden />
                  <span className="text-[10px] text-slate-400">Taux d&apos;accidents (HSE)</span>
                </div>
                <div className="text-lg font-semibold text-slate-100">{ind.tauxAccidentsHse}</div>
                <p className="text-[10px] text-slate-400">Objectif &lt; 10 · Secteur BTP : 12,3</p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3 flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-sky-400" aria-hidden />
                  <span className="text-[10px] text-slate-400">Productivité horaire</span>
                </div>
                <div className="text-lg font-semibold text-slate-100">{ind.productiviteHoraire}</div>
                <p className="text-[10px] text-slate-400">MO directe · 30 derniers jours</p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3 flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-amber-400" aria-hidden />
                  <span className="text-[10px] text-slate-400">Délai moyen paiement clients</span>
                </div>
                <div className="text-lg font-semibold text-slate-100">{ind.delaiPaiementMoyenJours} j</div>
                <p className="text-[10px] text-slate-400">Objectif &lt; {ind.delaiPaiementObjectifJours} j</p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3 flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-violet-400" aria-hidden />
                  <span className="text-[10px] text-slate-400">ROI chantiers (moyenne)</span>
                </div>
                <div className="text-lg font-semibold text-slate-100">{ind.roiChantiersPourcent} %</div>
                <p className="text-[10px] text-slate-400">Retour sur investissement portefeuille</p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3 flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-blue-400" aria-hidden />
                  <span className="text-[10px] text-slate-400">Taux d&apos;utilisation</span>
                </div>
                <div className="text-lg font-semibold text-slate-100">{ind.tauxUtilisation} %</div>
                <p className="text-[10px] text-slate-400">Objectif &gt; {ind.tauxUtilisationObjectif} % (ressources)</p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3 flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <Leaf className="h-4 w-4 text-emerald-500" aria-hidden />
                  <span className="text-[10px] text-slate-400">Bilan carbone (tCO₂e)</span>
                </div>
                <div className="text-lg font-semibold text-slate-100">{ind.bilanCarboneTeqCO2}</div>
                <p className="text-[10px] text-slate-400">Objectif &lt; {ind.bilanCarboneObjectifTeqCO2} tCO₂e · portefeuille</p>
              </div>
            </div>
          );
        })()}
      </DashboardPanel>

      {/* Activité récente (mock) — audit ERP BTP 2026 */}
      <DashboardPanel
        title="Activité récente"
        icon={Activity}
        subtitle="Dernières actions et événements"
        className="mt-6"
      >
        <ul className="space-y-2 text-[11px]" role="list">
          {ACTIVITE_RECENTE_MOCK.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-3 py-2 px-3 rounded-lg border border-slate-800/60 bg-slate-900/50 hover:bg-slate-800/50 transition-colors"
            >
              <span className="text-slate-200 truncate min-w-0">{item.label}</span>
              <span className="text-slate-400 shrink-0 text-[10px]">{item.timeAgo}</span>
            </li>
          ))}
        </ul>
      </DashboardPanel>

      {/* Phase 4 - Exécution : tri, filtre Santé, 5 affichés puis "Voir les 10 autres" */}
      <DashboardPanel
        title="Phase 4 - Exécution"
        icon={Briefcase}
        subtitle={`Chantiers en phase d'exécution (${phase4Displayed.length} / ${phase4FilteredCount} affichés${phase4FilterSante !== 'all' ? `, filtre: ${phase4FilterSante === 'critique' ? 'Critique' : phase4FilterSante === 'surveiller' ? 'À surveiller' : 'Bon'}` : ''} sur ${phase4TotalCount} au total)`}
        className="mt-6"
      >
        <p className="text-[10px] text-slate-400 mb-2">
          Santé d&apos;avancement : barre = % d&apos;avancement global (Bon ≥ 80 %, À surveiller ≥ 50 %, Critique &lt; 50 %). 🎨 « Peinture 0 % » = lot peinture non démarré. « Bureau 2/3 » = 2 bureaux validés sur 3. Cliquez sur un en-tête de colonne pour trier.
        </p>
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <label className="text-[11px] text-slate-400">Filtrer par santé :</label>
          <select
            value={phase4FilterSante}
            onChange={(e) => setPhase4FilterSante(e.target.value as Phase4FilterSante)}
            className="rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-[11px] text-slate-200 focus:border-sky-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/50"
            aria-label="Filtrer les chantiers par niveau de santé"
          >
            <option value="all">Tous</option>
            <option value="critique">Critique (&lt; 50 %)</option>
            <option value="surveiller">À surveiller (50–80 %)</option>
            <option value="bon">Bon (≥ 80 %)</option>
          </select>
        </div>
        <div className="rounded-xl border border-slate-800/60 bg-slate-950/40 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[11px]">
              <thead className="bg-slate-800/60 sticky top-0 z-10">
                <tr>
                  <th className="p-3 text-left">
                    <button
                      type="button"
                      onClick={() => togglePhase4Sort('numero')}
                      className={cn(
                        'flex items-center gap-1 font-semibold text-slate-200 hover:text-sky-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/50 rounded min-h-[44px] px-2 py-2',
                        phase4SortBy === 'numero' && 'text-sky-400'
                      )}
                      aria-sort={phase4SortBy === 'numero' ? (phase4SortDir === 'asc' ? 'ascending' : 'descending') : undefined}
                      aria-label={phase4SortBy === 'numero' ? `Trier par chantier (${phase4SortDir === 'asc' ? 'croissant' : 'décroissant'})` : 'Trier par chantier'}
                    >
                      Chantier
                      {phase4SortBy === 'numero' ? (phase4SortDir === 'asc' ? <ArrowUp className="h-3 w-3" aria-hidden /> : <ArrowDown className="h-3 w-3" aria-hidden />) : <ArrowUpDown className="h-3 w-3 opacity-50" aria-hidden />}
                    </button>
                  </th>
                  <th className="p-3 text-right">
                    <button
                      type="button"
                      onClick={() => togglePhase4Sort('ca')}
                      className={cn(
                        'inline-flex items-center justify-end gap-1 w-full font-semibold text-slate-200 hover:text-sky-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/50 rounded min-h-[44px] px-2 py-2',
                        phase4SortBy === 'ca' && 'text-sky-400'
                      )}
                      aria-sort={phase4SortBy === 'ca' ? (phase4SortDir === 'asc' ? 'ascending' : 'descending') : undefined}
                      aria-label={phase4SortBy === 'ca' ? `Trier par CA (${phase4SortDir === 'asc' ? 'croissant' : 'décroissant'})` : 'Trier par CA'}
                    >
                      CA (XOF)
                      {phase4SortBy === 'ca' ? (phase4SortDir === 'asc' ? <ArrowUp className="h-3 w-3" aria-hidden /> : <ArrowDown className="h-3 w-3" aria-hidden />) : <ArrowUpDown className="h-3 w-3 opacity-50" aria-hidden />}
                    </button>
                  </th>
                  <th className="p-3 text-right">
                    <button
                      type="button"
                      onClick={() => togglePhase4Sort('sante')}
                      className={cn(
                        'inline-flex items-center justify-end gap-1 w-full font-semibold text-slate-200 hover:text-sky-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/50 rounded min-h-[44px] px-2 py-2',
                        phase4SortBy === 'sante' && 'text-sky-400'
                      )}
                      aria-sort={phase4SortBy === 'sante' ? (phase4SortDir === 'asc' ? 'ascending' : 'descending') : undefined}
                      aria-label={phase4SortBy === 'sante' ? `Trier par santé (${phase4SortDir === 'asc' ? 'croissant' : 'décroissant'})` : 'Trier par santé d\'avancement'}
                    >
                      Santé d&apos;avancement
                      {phase4SortBy === 'sante' ? (phase4SortDir === 'asc' ? <ArrowUp className="h-3 w-3" aria-hidden /> : <ArrowDown className="h-3 w-3" aria-hidden />) : <ArrowUpDown className="h-3 w-3 opacity-50" aria-hidden />}
                    </button>
                  </th>
                  <th className="p-3 text-right font-semibold text-slate-200">Problème principal</th>
                  <th className="p-3 text-right font-semibold text-slate-200">Action rapide</th>
                </tr>
              </thead>
              <tbody>
                {phase4Displayed.map((chantier) => (
                  <tr
                    key={chantier.numero}
                    role="button"
                    tabIndex={0}
                    onClick={() => setChantierDetailRow(chantier)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setChantierDetailRow(chantier);
                      }
                    }}
                    className={cn(
                      'border-t border-slate-800/60 transition-colors cursor-pointer',
                      'hover:bg-slate-800/40 focus-within:bg-slate-800/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sky-500/50'
                    )}
                    aria-label={`Voir le détail du chantier ${chantier.numero}`}
                  >
                    <td className="p-3">
                      <span className="font-medium text-slate-100">
                        {chantier.numero}
                      </span>
                    </td>
                    <td className="p-3 text-right tabular-nums text-slate-300">{formatCFA(chantier.ca)}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-16 h-3 rounded-full overflow-hidden bg-slate-700/50 inline-block shrink-0"
                          title={`${Math.round(chantier.sante * 100)} % d'avancement — ${getHealthLabel(Math.round(chantier.sante * 100))}`}
                        >
                          <div
                            className={cn('h-full rounded-full transition-all', getSanteColor(chantier.sante))}
                            style={{ width: `${Math.round(chantier.sante * 100)}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {Math.round(chantier.sante * 100)} % — {getHealthLabel(Math.round(chantier.sante * 100))}
                        </span>
                      </div>
                    </td>
                    <td className="p-3 text-right text-red-400">
                      {chantier.stockPeinture < 0.05 ? '🎨 Lot peinture non démarré' : `Bureau ${chantier.bureau} validés`}
                    </td>
                    <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
                      {(() => {
                        const action = phase4Actions[chantier.numero] ?? { label: "Relancer l'entreprise", variant: 'danger' as const, type: 'call' as Phase4ActionType };
                        return (
                          <button
                            type="button"
                            title={action.label}
                            onClick={() => openPhase4Action(action.type, chantier)}
                            aria-label={action.label}
                            className={cn(
                              'px-3 py-2 min-h-[44px] rounded-lg text-[11px] font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900',
                              action.variant === 'danger'
                                ? 'bg-red-500/80 hover:bg-red-500 text-white'
                                : 'bg-amber-500/80 hover:bg-amber-500 text-slate-900'
                            )}
                          >
                            {action.label}
                          </button>
                        );
                      })()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-3">
          {phase4HasMore && (
            <button
              type="button"
              onClick={() => setPhase4DisplayLimit(phase4FilteredCount)}
              className="text-[11px] text-sky-400 hover:text-sky-300 font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/50 rounded min-h-[44px] px-3 py-2"
              aria-label="Afficher tous les chantiers filtrés"
            >
              Voir les {phase4FilteredCount - phase4DisplayLimit} autres chantiers
            </button>
          )}
          {phase4ShowReduce && (
            <button
              type="button"
              onClick={() => setPhase4DisplayLimit(PHASE4_INITIAL_LIMIT)}
              className="text-[11px] text-slate-400 hover:text-slate-300 font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500/50 rounded min-h-[44px] px-3 py-2"
              aria-label="Réduire l'affichage aux 5 premiers chantiers"
            >
              Réduire
            </button>
          )}
        </div>
      </DashboardPanel>

      </>
      )}

      {/* Modals Phase 4 (appel, relance, escalade, visite) */}
      {phase4SelectedRow && (
        <>
          <CallCompanyModal
            isOpen={phase4Action === 'call'}
            onClose={closePhase4Action}
            chantierNumero={phase4SelectedRow.numero}
            entreprise={getEntreprise(phase4SelectedRow)}
            problemePrincipal={phase4SelectedRow.stockPeinture < 0.05 ? '🎨 Lot peinture non démarré' : `Bureau ${phase4SelectedRow.bureau} validés`}
            historique_contacts={getHistoriqueContacts(phase4SelectedRow.numero)}
          />
          <AutoRelanceModal
            isOpen={phase4Action === 'relance'}
            onClose={closePhase4Action}
            chantierNumero={phase4SelectedRow.numero}
            entreprise={getEntreprise(phase4SelectedRow)}
          />
          <EscalateDGModal
            isOpen={phase4Action === 'escalade'}
            onClose={closePhase4Action}
            chantierNumero={phase4SelectedRow.numero}
            problemePrincipal={phase4SelectedRow.stockPeinture < 0.05 ? '🎨 Lot peinture non démarré' : `Bureau ${phase4SelectedRow.bureau} validés`}
          />
          <ScheduleVisitModal
            isOpen={phase4Action === 'visit'}
            onClose={closePhase4Action}
            chantierNumero={phase4SelectedRow.numero}
          />
        </>
      )}

      {/* Modal détail chantier (clic sur #042, #038, etc.) */}
      {chantierDetailRow && (
        <ChantierDetailModal
          chantier={getChantierForDetail(chantierDetailRow.numero, chantierDetailRow)}
          onClose={() => setChantierDetailRow(null)}
        />
      )}

      {/* Modal créances (clic sur "X créances > 30 jours") */}
      <CreancesModal
        isOpen={creancesModalOpen}
        onClose={() => setCreancesModalOpen(false)}
        countLabel={financesGlobales.creancesPlus30j}
      />

      {/* Modal validations en attente (clic sur 21/45) */}
      <ValidationsModal
        isOpen={validationsModalOpen}
        onClose={() => setValidationsModalOpen(false)}
        enAttenteCount={21}
        totalCount={45}
      />

      {/* Modal budget consommé (clic sur bloc Budget consommé portefeuille) */}
      <BudgetConsommeModal
        open={budgetConsommeModalOpen}
        onClose={() => setBudgetConsommeModalOpen(false)}
      />

      {/* Modal décisions en attente (clic sur Décisions en attente) */}
      <DecisionsEnAttenteModal
        open={decisionsModalOpen}
        onClose={() => setDecisionsModalOpen(false)}
      />
    </div>
  );
});
