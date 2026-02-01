/**
 * Vue d'accueil Dashboard — Synthèse exécution, finance, risques.
 *
 * Affichée par défaut sur pilotage/dashboard/default.
 * Navigation principale : SubNav (Vue d'ensemble, Projets, etc.) + sidebar.
 *
 * @see docs/dashboard/DASHBOARD_HOME_GUIDE.md — Guide utilisateur et développeur
 * @see utils/dashboardHomeSectionExpanded — Logique presets (computeSectionExpanded)
 */

'use client';

import React, { useState, useMemo, memo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Activity,
  AlertTriangle,
  ArrowDown,
  ArrowLeft,
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
  History,
  Keyboard,
  Save,
  Trash2,
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DashboardPanel } from '../shared/DashboardPanel';
import { CollapsibleSection } from '../shared/CollapsibleSection';
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
import { computeSectionExpanded } from '../../utils/dashboardHomeSectionExpanded';
import { CallCompanyModal } from '../modals/CallCompanyModal';
import { AutoRelanceModal } from '../modals/AutoRelanceModal';
import { EscalateDGModal } from '../modals/EscalateDGModal';
import { toast } from 'sonner';
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

const DASHBOARD_HOME_PREFS_KEY = 'dashboard-home-prefs';
const SAVED_VIEWS_KEY = 'dashboard-home-saved-views';
const SESSION_ACTIONS_MAX = 10;
type SessionAction = { id: string; label: string; at: number };
type SavedView = {
  id: string;
  name: string;
  preset: 'executive' | 'financial' | 'operational' | 'hse' | null;
  displayMode: 'all' | 'synthetique' | 'critical';
  cockpitView: 'finances' | 'operations' | 'risques';
  phase4FilterSante: 'all' | 'critique' | 'surveiller' | 'bon';
};
type Density = 'compact' | 'normal' | 'comfortable';

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
  '#051': { label: '📤 Escalade au DG', variant: 'danger', type: 'escalade' },
  '#033': { label: '📞 Appeler entreprise', variant: 'danger', type: 'call' },
  '#047': { label: '✅ Planifier visite', variant: 'warning', type: 'visit' },
  '#034': { label: '📞 Appeler entreprise', variant: 'danger', type: 'call' },
  '#035': { label: '✅ Planifier visite', variant: 'warning', type: 'visit' },
  '#036': { label: '📧 Relance automatique', variant: 'warning', type: 'relance' },
  '#039': { label: '✅ Planifier visite', variant: 'warning', type: 'visit' },
  '#040': { label: '📧 Relance automatique', variant: 'warning', type: 'relance' },
  '#041': { label: '📞 Appeler entreprise', variant: 'danger', type: 'call' },
  '#043': { label: '📤 Escalade au DG', variant: 'danger', type: 'escalade' },
  '#044': { label: '📧 Relance automatique', variant: 'warning', type: 'relance' },
  '#045': { label: '📞 Appeler entreprise', variant: 'danger', type: 'call' },
  '#048': { label: '✅ Planifier visite', variant: 'warning', type: 'visit' },
};

/** Problème principal varié par chantier (évite répétition "Lot peinture" sur tous). */
const phase4ProblemePrincipal: Record<string, string> = {
  '#042': 'Retard livraison peinture — entreprise sous capacité',
  '#038': 'Bureau 2/3 validés — en attente réception bureau 3',
  '#051': 'Escalade demandée — litige qualité finitions',
  '#033': 'Retard matériel — approvisionnement électrique',
  '#034': 'Lot peinture non démarré — délai fournisseur',
  '#035': 'Bureau 1/3 validés — réserves bureau 2 en cours',
  '#036': 'Défaut conformité finitions — photos avant/après manquantes',
  '#039': 'Bureau 3/3 validés — clôture en attente signature',
  '#040': 'Retard planning — absence équipe sous-traitant',
  '#041': 'Litige facturation — avenant en cours',
  '#043': 'Retard livraison menuiserie — 12 jours',
  '#044': 'Presqu\'accident signalé — formation HSE à planifier',
  '#045': 'Bureau 2/3 validés — délai validation MO',
  '#047': 'Visite de contrôle demandée — point qualité',
  '#048': 'Chantier en avance — réception anticipée à planifier',
};

function getProblemePrincipal(row: Phase4Row): string {
  return phase4ProblemePrincipal[row.numero] ?? (row.stockPeinture < 0.05 ? 'Lot peinture non démarré' : `Bureau ${row.bureau} validés`);
}

/** Couleur de la barre santé (0—1) — aligné getHealthBarBgClass(percent). */
function getSanteColor(sante: number): string {
  return getHealthBarBgClass(Math.round(sante * 100));
}

/** KPIs optionnels : si fournis par la page dashboard, les valeurs affichées sont alignées sur la barre KPI. */
export interface DashboardHomeProps {
  kpis?: Array<{ label: string; value?: string | number; delta?: string }>;
  /** Périmètre sélectionné (pour score qualité et typologie blocages en mock). */
  perimetreFilter?: PerimetreId;
  /** Vue focalisée : n'afficher que la section demandée (clic sub-sidebar). */
  sectionFocus?: 'vueFinances' | 'hse' | 'risques' | 'indicateurs' | 'activite' | 'phase4';
}

function getKpiValue(kpis: DashboardHomeProps['kpis'], label: string): string | null {
  const k = kpis?.find((kp) => kp.label === label || (kp.label && kp.label.includes(label)));
  return k != null ? String(k.value) : null;
}

export const DashboardHome = memo(function DashboardHome({ kpis, perimetreFilter = 'nice-renovation', sectionFocus }: DashboardHomeProps = {}) {
  const scoreQualite = getScoreQualiteBreakdown(perimetreFilter);
  const blocagesBreakdown = getTypologieBlocages(perimetreFilter);
  const [kpisExpanded, setKpisExpanded] = useState(false);
  const [cockpitView, setCockpitView] = useState<'finances' | 'operations' | 'risques'>('finances');
  /** Filtre affichage : tout, synthétique, ou critiques uniquement */
  const [displayMode, setDisplayMode] = useState<'all' | 'synthetique' | 'critical'>('all');
  /** Preset par rôle : quand défini, pilote onglet et sections dépliées */
  const [preset, setPreset] = useState<'executive' | 'financial' | 'operational' | 'hse' | null>(null);
  /** Historique des actions de la session (exports, changements de vue) */
  const [sessionActions, setSessionActions] = useState<SessionAction[]>([]);
  const sessionActionsIdRef = React.useRef(0);
  const [showHistory, setShowHistory] = useState(false);
  /** Vues sauvegardées (filtres nommés) */
  const [savedViews, setSavedViews] = useState<SavedView[]>([]);
  const [showSavedViewsManage, setShowSavedViewsManage] = useState(false);
  /** Densité d'affichage : compact / normal / confortable */
  const [density, setDensity] = useState<Density>('normal');
  /** Annonce pour lecteurs d'écran (vue appliquée, vue sauvegardée) */
  const [liveAnnouncement, setLiveAnnouncement] = useState('');

  useEffect(() => {
    if (preset === 'operational') setCockpitView('operations');
    else if (preset !== null) setCockpitView('finances');
  }, [preset]);

  /** Charger préférences et vues sauvegardées depuis localStorage au montage */
  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      const raw = localStorage.getItem(DASHBOARD_HOME_PREFS_KEY);
      if (raw) {
        const p = JSON.parse(raw) as { preset?: string | null; displayMode?: string; cockpitView?: string; density?: string };
        if (p.preset === null || p.preset === 'executive' || p.preset === 'financial' || p.preset === 'operational' || p.preset === 'hse') setPreset(p.preset ?? null);
        if (p.displayMode === 'all' || p.displayMode === 'synthetique' || p.displayMode === 'critical') setDisplayMode(p.displayMode);
        if (p.cockpitView === 'finances' || p.cockpitView === 'operations' || p.cockpitView === 'risques') setCockpitView(p.cockpitView);
        if (p.density === 'compact' || p.density === 'normal' || p.density === 'comfortable') setDensity(p.density);
      }
      const viewsRaw = localStorage.getItem(SAVED_VIEWS_KEY);
      if (viewsRaw) {
        const parsed = JSON.parse(viewsRaw) as SavedView[];
        if (Array.isArray(parsed)) setSavedViews(parsed.slice(0, 20));
      }
    } catch {
      // ignore invalid stored data
    }
  }, []);

  /** Sauvegarder préférences dans localStorage quand elles changent */
  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      localStorage.setItem(
        DASHBOARD_HOME_PREFS_KEY,
        JSON.stringify({ preset, displayMode, cockpitView, density })
      );
    } catch {
      // ignore quota / private mode
    }
  }, [preset, displayMode, cockpitView, density]);

  /** Persister les vues sauvegardées */
  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      localStorage.setItem(SAVED_VIEWS_KEY, JSON.stringify(savedViews));
    } catch {
      // ignore
    }
  }, [savedViews]);

  const saveCurrentView = () => {
    const name = typeof window !== 'undefined' ? window.prompt('Nom de la vue à sauvegarder :', 'Ma vue dashboard') : null;
    if (!name?.trim()) return;
    const view: SavedView = {
      id: `view-${Date.now()}`,
      name: name.trim(),
      preset,
      displayMode,
      cockpitView,
      phase4FilterSante,
    };
    setSavedViews((prev) => [view, ...prev].slice(0, 20));
    pushSessionAction(`Vue sauvegardée : ${name.trim()}`);
    toast.success('Vue sauvegardée', { description: name.trim(), duration: 2000 });
    setLiveAnnouncement(`Vue « ${name.trim() } » sauvegardée.`);
    setTimeout(() => setLiveAnnouncement(''), 2000);
  };

  const applySavedView = (view: SavedView) => {
    setPreset(view.preset);
    setDisplayMode(view.displayMode);
    setCockpitView(view.cockpitView);
    setPhase4FilterSante(view.phase4FilterSante);
    pushSessionAction(`Vue appliquée : ${view.name}`);
    toast.info(`Vue « ${view.name } » appliquée`, { duration: 2000 });
    setLiveAnnouncement(`Vue « ${view.name } » appliquée. Onglet et sections mis à jour.`);
    setTimeout(() => setLiveAnnouncement(''), 2000);
  };

  const deleteSavedView = (id: string) => {
    setSavedViews((prev) => prev.filter((v) => v.id !== id));
    setShowSavedViewsManage(false);
  };

  /** Raccourcis clavier : Échap replie KPI, Ctrl+1/2/3 change d'onglet */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const inInput = /^(INPUT|TEXTAREA|SELECT)$/.test(target?.tagName ?? '') || target?.isContentEditable;
      if (e.key === 'Escape') {
        setKpisExpanded(false);
        return;
      }
      if (inInput) return;
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key === '1') {
        e.preventDefault();
        setCockpitView('finances');
        setPreset(null);
      }
      if (mod && e.key === '2') {
        e.preventDefault();
        setCockpitView('operations');
      }
      if (mod && e.key === '3') {
        e.preventDefault();
        setCockpitView('risques');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const pushSessionAction = (label: string) => {
    const id = `action-${++sessionActionsIdRef.current}-${Date.now()}`;
    setSessionActions((prev) => [{ id, label, at: Date.now() }, ...prev].slice(0, SESSION_ACTIONS_MAX));
  };

  /** defaultExpanded par section : preset prime ; sectionFocus force l'expansion de la section unique affichée */
  const sectionExpanded = useMemo(
    () => {
      const base = computeSectionExpanded(preset, displayMode);
      if (!sectionFocus) return base;
      return {
        vueFinances: sectionFocus === 'vueFinances',
        hse: sectionFocus === 'hse',
        risques: sectionFocus === 'risques',
        indicateurs: sectionFocus === 'indicateurs',
        activite: sectionFocus === 'activite',
        phase4: sectionFocus === 'phase4',
      };
    },
    [preset, displayMode, sectionFocus]
  );

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

  /** Phase 2 : personnalisation cockpit (shell — à  venir) */
  const [showPersonalizeMessage, setShowPersonalizeMessage] = useState(false);

  /** Phase 4 : tri, filtre Santé, limite d'affichage (5 / 15) */
  const [phase4SortBy, setPhase4SortBy] = useState<Phase4SortKey>('sante');
  const [phase4SortDir, setPhase4SortDir] = useState<'asc' | 'desc'>('asc');
  const [phase4FilterSante, setPhase4FilterSante] = useState<Phase4FilterSante>('all');
  const [phase4DisplayLimit, setPhase4DisplayLimit] = useState(PHASE4_INITIAL_LIMIT);

  const togglePhase4Sort = useCallback((key: Phase4SortKey) => {
    if (phase4SortBy === key) setPhase4SortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setPhase4SortBy(key);
      setPhase4SortDir('asc');
    }
  }, [phase4SortBy]);

  const phase4Filtered = useMemo(() => PHASE4_ALL.filter((row) => {
    if (phase4FilterSante === 'all') return true;
    const pct = Math.round(row.sante * 100);
    if (phase4FilterSante === 'critique') return pct < 50;
    if (phase4FilterSante === 'surveiller') return pct >= 50 && pct < 80;
    if (phase4FilterSante === 'bon') return pct >= 80;
    return true;
  }), [phase4FilterSante]);

  const phase4Sorted = useMemo(() => [...phase4Filtered].sort((a, b) => {
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
  }), [phase4Filtered, phase4SortBy, phase4SortDir]);

  const phase4Displayed = useMemo(() => phase4Sorted.slice(0, phase4DisplayLimit), [phase4Sorted, phase4DisplayLimit]);
  const phase4TotalCount = PHASE4_ALL.length;
  const phase4FilteredCount = phase4Filtered.length;
  const phase4HasMore = phase4FilteredCount > phase4DisplayLimit;
  const phase4ShowReduce = phase4DisplayLimit > PHASE4_INITIAL_LIMIT;

  const openPhase4Action = (type: Phase4ActionType, row: Phase4Row) => {
    setPhase4SelectedRow(row);
    setPhase4Action(type);
    const labels: Record<Phase4ActionType, string> = { call: 'Appel entreprise', relance: 'Relance automatique', escalade: 'Escalade DG', visit: 'Planifier visite' };
    toast.info(`Ouverture : ${labels[type]} — Chantier ${row.numero}`, { duration: 2000 });
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
            onExportSuccess={() => pushSessionAction('Export CSV trésorerie')}
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

  const densityClasses = {
    compact: 'p-3 sm:p-4 space-y-4 text-[10px]',
    normal: 'p-4 sm:p-6 space-y-6 text-[11px]',
    comfortable: 'p-5 sm:p-8 space-y-8 text-xs',
  };

  return (
    <main
      id="dashboard-home-main"
      role="main"
      aria-label="Tableau de bord — Vue d'ensemble"
      className={cn('w-full min-w-0 max-w-full overflow-x-hidden', densityClasses[density])}
      data-density={density}
      data-testid="dashboard-home"
    >
      {/* Annonces pour lecteurs d'écran (changement de vue, vue sauvegardée) */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        id="dashboard-home-live"
      >
        {liveAnnouncement}
      </div>
      <h1 className="sr-only">Dashboard — Vue d&apos;ensemble</h1>
      {/* Retour (vue focalisée) */}
      {sectionFocus && (
        <button
          type="button"
          onClick={() => navigate('pilotage', 'dashboard', 'default')}
          className="flex items-center gap-2 mb-4 text-sm text-slate-400 hover:text-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/50 rounded px-1 -ml-1"
          aria-label="Retour à l'accueil Pilotage"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Retour à l'accueil
        </button>
      )}
      {/* Filtre affichage + bascule Vue classique / personnalisable — masqué en vue focalisée */}
      {!sectionFocus && (
      <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor="preset" className="text-[11px] text-slate-300 shrink-0">Vue :</label>
          <select
            id="preset"
            value={preset ?? 'custom'}
            onChange={(e) => {
              const v = e.target.value;
              const labels: Record<string, string> = { executive: 'Exécutive (DG)', financial: 'Financière', operational: 'Opérationnelle', hse: 'HSE', custom: 'Personnalisée' };
              if (v === 'custom') setPreset(null);
              else setPreset(v as 'executive' | 'financial' | 'operational' | 'hse');
              pushSessionAction(`Vue : ${labels[v] ?? v}`);
            }}
            className="rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-1.5 text-[11px] text-slate-200 focus:border-sky-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 min-h-[44px]"
            aria-label="Vue par rôle"
          >
            <option value="executive">Exécutive (DG)</option>
            <option value="financial">Financière</option>
            <option value="operational">Opérationnelle</option>
            <option value="hse">HSE</option>
            <option value="custom">Personnalisée</option>
          </select>
          {preset === null && (
            <>
              <label htmlFor="display-mode" className="text-[11px] text-slate-400 shrink-0 ml-1">Affichage :</label>
              <select
                id="display-mode"
                value={displayMode}
                onChange={(e) => {
                  const v = e.target.value as 'all' | 'synthetique' | 'critical';
                  setDisplayMode(v);
                  if (v === 'critical') setPhase4FilterSante('critique');
                  const labels: Record<string, string> = { all: 'Tout afficher', synthetique: 'Synthétique', critical: 'Critiques uniquement' };
                  pushSessionAction(`Affichage : ${labels[v] ?? v}`);
                }}
                className="rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-1.5 text-[11px] text-slate-200 focus:border-sky-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 min-h-[44px]"
                aria-label="Mode d'affichage du dashboard"
              >
                <option value="all">Tout afficher</option>
                <option value="synthetique">Synthétique (sections repliées)</option>
                <option value="critical">Critiques uniquement</option>
              </select>
            </>
          )}
          <label htmlFor="density" className="text-[11px] text-slate-300 shrink-0 ml-1">Densité :</label>
          <select
            id="density"
            value={density}
            onChange={(e) => setDensity(e.target.value as Density)}
            className="rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-1.5 text-[11px] text-slate-200 focus:border-sky-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/50 min-h-[44px]"
            aria-label="Densité d'affichage"
          >
            <option value="compact">Compact</option>
            <option value="normal">Normal</option>
            <option value="comfortable">Confortable</option>
          </select>
          <button
            type="button"
            onClick={saveCurrentView}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-600 bg-slate-800/60 px-2 py-1.5 min-h-[44px] text-[11px] text-slate-300 hover:bg-slate-700/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/50"
            aria-label="Sauvegarder la vue actuelle"
          >
            <Save className="h-3.5 w-3.5" aria-hidden />
            Sauvegarder cette vue
          </button>
          {savedViews.length > 0 && (
            <>
              <select
                value=""
                onChange={(e) => {
                  const id = e.target.value;
                  if (!id) return;
                  const view = savedViews.find((v) => v.id === id);
                  if (view) applySavedView(view);
                  e.target.value = '';
                }}
                className="rounded-lg border border-slate-700 bg-slate-900/80 px-2 py-1.5 text-[11px] text-slate-200 min-h-[44px] max-w-[180px]"
                aria-label="Appliquer une vue sauvegardée"
              >
                <option value="">Vues sauvegardées…</option>
                {savedViews.map((v) => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setShowSavedViewsManage((v) => !v)}
                className="text-[11px] text-slate-500 hover:text-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/50 rounded px-2 py-1 min-h-[44px]"
                aria-expanded={showSavedViewsManage}
                aria-label="Gérer les vues sauvegardées"
              >
                Gérer ({savedViews.length})
              </button>
            </>
          )}
        </div>
        <button
          type="button"
          onClick={() => setShowCustomizable(!showCustomizable)}
          className="text-[11px] text-sky-400 hover:text-sky-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 rounded px-3 py-2 min-h-[44px]"
          aria-pressed={showCustomizable}
          aria-label={showCustomizable ? 'Afficher la vue classique' : 'Afficher la vue personnalisable'}
        >
          {showCustomizable ? 'Vue classique' : 'Vue personnalisable'}
        </button>
        <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-400">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-flex items-center gap-1 cursor-help">
                  <Keyboard className="h-3.5 w-3.5" aria-hidden />
                  Raccourcis
                </span>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-[240px]">
                <p className="text-xs text-slate-200 font-medium mb-1">Raccourcis clavier</p>
                <ul className="text-[11px] text-slate-300 space-y-0.5 list-none">
                  <li><kbd className="px-1 rounded bg-slate-700">Échap</kbd> Replier la bande KPI</li>
                  <li><kbd className="px-1 rounded bg-slate-700">Ctrl+1</kbd> Vue finances</li>
                  <li><kbd className="px-1 rounded bg-slate-700">Ctrl+2</kbd> Vue opérations</li>
                  <li><kbd className="px-1 rounded bg-slate-700">Ctrl+3</kbd> Vue risques</li>
                </ul>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <button
            type="button"
            onClick={() => setShowHistory((v) => !v)}
            className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/50 rounded px-2 py-1 min-h-[44px]"
            aria-expanded={showHistory}
            aria-label="Afficher l'historique de votre session"
          >
            <History className="h-3.5 w-3.5" aria-hidden />
            Historique session {sessionActions.length > 0 && <span className="tabular-nums">({sessionActions.length})</span>}
          </button>
        </div>
      </div>
      )}
      <>
      {showHistory && (
        <div className="rounded-xl border border-slate-700/60 bg-slate-900/60 p-3 text-[11px]" role="region" aria-label="Historique des actions de la session">
          <p className="font-medium text-slate-300 mb-2">Dernières actions (cette session)</p>
          {sessionActions.length === 0 ? (
            <p className="text-slate-500">Aucune action enregistrée.</p>
          ) : (
            <ul className="space-y-1.5 list-none" role="list">
              {sessionActions.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-2 text-slate-400">
                  <span>{a.label}</span>
                  <span className="text-[10px] text-slate-500 shrink-0">
                    {new Date(a.at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {showSavedViewsManage && savedViews.length > 0 && (
        <div className="rounded-xl border border-slate-700/60 bg-slate-900/60 p-3 text-[11px]" role="region" aria-label="Gérer les vues sauvegardées">
          <p className="font-medium text-slate-300 mb-2">Vues sauvegardées</p>
          <ul className="space-y-2 list-none" role="list">
            {savedViews.map((v) => (
              <li key={v.id} className="flex items-center justify-between gap-2 py-1.5 border-b border-slate-800/60 last:border-0">
                <span className="text-slate-200 truncate">{v.name}</span>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => applySavedView(v)}
                    className="text-sky-400 hover:text-sky-300 text-[10px] focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/50 rounded px-1.5"
                  >
                    Appliquer
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteSavedView(v.id)}
                    className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/50"
                    aria-label={`Supprimer la vue ${v.name}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      </>

      {showCustomizable ? (
        <CustomizableDashboard
          storageKey="cockpit-dg-widgets"
          defaultOrder={['finances_recap', 'tresorerie_prevision', 'alertes', 'hse']}
          widgets={widgetCatalog}
        />
      ) : (
        <>
      {/* KPIs COMPACTS COLLAPSIBLES — masqué en vue focalisée (ex. Budget) */}
      {(!sectionFocus || sectionFocus === 'indicateurs') && (
      <div className="rounded-2xl border border-slate-800/80 bg-slate-950/80 overflow-hidden transition-all duration-300">
        {/* Header cliquable */}
        <button
          type="button"
          onClick={() => setKpisExpanded(!kpisExpanded)}
          className="w-full px-4 py-3 min-h-[44px] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 hover:bg-slate-900/40 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/50 focus-visible:ring-inset"
          aria-expanded={kpisExpanded}
          aria-label={kpisExpanded ? 'Replier les indicateurs KPI' : 'Déplier les indicateurs KPI'}
        >
          <div className="flex items-center gap-3 flex-wrap">
            <Activity className="h-4 w-4 text-sky-400 shrink-0" aria-hidden />
            <span className="text-sm font-semibold text-slate-100" title="Rafraîchir, Exporter et Gérer les alertes KPI s'appliquent à  l'ensemble du cockpit">
              Indicateurs clés de performance (cockpit)
            </span>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[10px] sm:text-[11px]">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-slate-400 cursor-help">Demandes: <span className="text-slate-200 font-semibold">{demandesVal}</span></span>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[200px]">
                    <p className="text-xs text-slate-200">Nombre de demandes à traiter (achats, validations, demandes spéciales).</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <span className="text-slate-600">·</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-slate-400 cursor-help">Validations: <span className="text-emerald-400 font-semibold">{validationsVal}</span></span>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[200px]">
                    <p className="text-xs text-slate-200">Taux de validations traitées. Objectif : maintenir un taux élevé pour fluidifier le flux.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
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
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-slate-400 cursor-help">Décisions: <span className="text-rose-400 font-semibold">{decisionsVal}</span></span>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[200px]">
                    <p className="text-xs text-slate-200">Décisions DG en attente (arbitrages, litiges, escalades).</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <span className="text-slate-600">·</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-slate-400 cursor-help">Délai paiement: <span className="text-cyan-400 font-semibold">{delaiPaiementVal}</span></span>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[200px]">
                    <p className="text-xs text-slate-200">Délai moyen de paiement clients. Objectif typique : &lt; 45 jours.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
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
                        Demandes à  traiter
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
      )}

      {/* Vue finance DG — switch de vue + périmètre NICE RÉNOVATION, devise XOF */}
      {(!sectionFocus || sectionFocus === 'vueFinances') && (
      <CollapsibleSection
        key={`vue-finances-dg-${displayMode}-${preset ?? 'x'}`}
        title="Vue finances DG"
        defaultExpanded={sectionExpanded.vueFinances}
        itemCount={8}
        className="mt-6"
        id="vue-finances-dg"
      >
      <DashboardPanel title="" subtitle="" className="mt-0 border-0 shadow-none" padding="md">
        <p className="text-[11px] text-slate-400 mb-4">Budget, consommation et trésorerie consolidés — périmètre NICE RÉNOVATION</p>
        <div className="mb-4 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-between gap-3">
          {/* Onglets de vue visibles : changer de vue sans ouvrir le menu déroulant */}
          <div className="flex flex-wrap items-center gap-1 rounded-lg border border-slate-700/60 bg-slate-900/40 p-1 w-full sm:w-auto" role="tablist" aria-label="Choisir la vue cockpit">
            {(['finances', 'operations', 'risques'] as const).map((view) => (
              <button
                key={view}
                type="button"
                role="tab"
                aria-selected={cockpitView === view}
                aria-controls="cockpit-view-panel"
                id={`cockpit-tab-${view}`}
                onClick={() => {
                setCockpitView(view);
                const labels: Record<string, string> = { finances: 'Vue finances', operations: 'Vue opérations', risques: 'Vue risques' };
                pushSessionAction(labels[view] ?? view);
              }}
                className={cn(
                  'min-h-[44px] px-3 py-2 rounded-md text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
                  cockpitView === view
                    ? 'bg-slate-700/60 text-slate-100 border border-slate-600/60'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
                )}
              >
                {view === 'finances' && 'Vue finances'}
                {view === 'operations' && 'Vue opérations'}
                {view === 'risques' && 'Vue risques'}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <select
              id="cockpit-view"
              value={cockpitView}
              onChange={(e) => setCockpitView(e.target.value as 'finances' | 'operations' | 'risques')}
              className="rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-1.5 text-xs text-slate-200 focus:border-sky-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 sr-only sm:not-sr-only"
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
              âœï¸ Personnaliser
            </button>
          </div>
        </div>
        {showPersonalizeMessage && (
          <div className="mb-4 rounded-lg border border-sky-500/30 bg-sky-500/10 px-3 py-2 text-[11px] text-sky-200">
            Mode personnalisation à  venir : réorganisez les widgets par glisser-déposer (comme Procore). Disponible dans une prochaine version.
          </div>
        )}
        {cockpitView !== 'finances' ? (
          <div id="cockpit-view-panel" role="tabpanel" aria-labelledby={`cockpit-tab-${cockpitView}`} className="rounded-xl border border-slate-800/60 bg-slate-950/40 p-8 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={cockpitView}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
            {cockpitView === 'operations' && (
              <div className="space-y-4 text-[11px]">
                <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-sky-400" />
                  Vue opérations — indicateurs chantiers et exécution
                </h3>
                <p className="text-slate-400 text-sm">Indicateurs chantiers, avancement par lot et exécution terrain (périmètre NICE RÉNOVATION).</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3 flex flex-col gap-1">
                    <span className="text-[10px] text-slate-400">Chantiers actifs</span>
                    <span className="text-lg font-semibold text-slate-100">{PHASE4_ALL.filter((r) => r.sante >= 0.5).length}</span>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3 flex flex-col gap-1">
                    <span className="text-[10px] text-slate-400">CA cumulé (XOF)</span>
                    <span className="text-lg font-semibold text-slate-100">{formatCFA(PHASE4_ALL.reduce((s, r) => s + r.ca, 0))}</span>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3 flex flex-col gap-1">
                    <span className="text-[10px] text-slate-400">En retard (&lt; 50 %)</span>
                    <span className="text-lg font-semibold text-amber-400">{PHASE4_ALL.filter((r) => r.sante < 0.5).length}</span>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3 flex flex-col gap-1">
                    <span className="text-[10px] text-slate-400">Santé moyenne</span>
                    <span className="text-lg font-semibold text-slate-100">{Math.round((PHASE4_ALL.reduce((s, r) => s + r.sante, 0) / PHASE4_ALL.length) * 100)} %</span>
                  </div>
                </div>
                <p className="text-xs text-slate-500">Détail par chantier et planning détaillé à venir dans une prochaine version.</p>
              </div>
            )}
            {cockpitView === 'risques' && (
              <div className="space-y-4 text-[11px]">
                <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-amber-400" />
                  Vue risques — risques critiques et litiges
                </h3>
                <p className="text-slate-400 text-sm">Risques délais, budget et satisfaction (portefeuille chantiers).</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3 flex flex-col gap-1">
                    <span className="text-[10px] text-slate-400">Risque délais</span>
                    <span className="text-lg font-semibold text-amber-300">29 %</span>
                    <span className="text-[10px] text-slate-400">Chantiers &gt; 5 j retard</span>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3 flex flex-col gap-1">
                    <span className="text-[10px] text-slate-400">Risque budget</span>
                    <span className="text-lg font-semibold text-amber-300">39 %</span>
                    <span className="text-[10px] text-slate-400">Chantiers &gt; 90 % budget</span>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3 flex flex-col gap-1">
                    <span className="text-[10px] text-slate-400">Satisfaction clients</span>
                    <span className="text-lg font-semibold text-emerald-400">92 %</span>
                    <span className="text-[10px] text-slate-400">90 derniers jours</span>
                  </div>
                </div>
                <p className="text-xs text-slate-500">Plan d&apos;action et litiges détaillés à venir dans une prochaine version.</p>
              </div>
            )}
              </motion.div>
            </AnimatePresence>
          </div>
        ) : (
        <>
        <AnimatePresence mode="wait">
          <motion.div
            key="finances"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            id="cockpit-view-panel"
            role="tabpanel"
            aria-labelledby="cockpit-tab-finances"
            className="space-y-4 text-[11px]"
          >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                  âš ï¸ 3 chantiers au-dessus de 95 %
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
                  → +3 depuis hier
                </span>
                <span className="text-[10px] text-rose-300">
                  💴 5 impactent le cash sous 7 jours
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
          {loadingTresorerie ? (
            <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-6 flex items-center justify-center gap-3 min-h-[200px]" role="status" aria-label="Chargement du prévisionnel trésorerie">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" aria-hidden />
              <span className="text-sm text-slate-400">Chargement du prévisionnel trésorerie…</span>
            </div>
          ) : (
            <TresoreriePrevisionnelleWidget
              previsions={previsionsTresorerie.length > 0 ? previsionsTresorerie : undefined}
              onRelancerCreances={() => setCreancesModalOpen(true)}
              onExportSuccess={() => pushSessionAction('Export CSV trésorerie')}
            />
          )}
        </div>

        {/* Alertes prédictives — Phase 2 audit ERP BTP 2026 */}
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <AlertesIntelligentesWidget
            onVoirTout={() => navigate('pilotage', 'alertes', 'default')}
          />
        </div>
          </motion.div>
        </AnimatePresence>
        </>
        )}
      </DashboardPanel>
      </CollapsibleSection>
      )}

      {/* HSE & Conformité — Phase 3 audit ERP BTP 2026 */}
      {(!sectionFocus || sectionFocus === 'hse') && (
      <CollapsibleSection
        key={`hse-${displayMode}-${preset ?? 'x'}`}
        title="HSE & Conformité"
        defaultExpanded={sectionExpanded.hse}
        itemCount={4}
        className="mt-6"
        id="hse-conformite"
      >
        <HSEConformiteWidget onDeclarerIncident={() => {}} />
      </CollapsibleSection>
      )}

      {/* Risques & satisfaction */}
      {!sectionFocus && (
      <CollapsibleSection
        key={`risques-${displayMode}-${preset ?? 'x'}`}
        title="Risques & satisfaction"
        defaultExpanded={sectionExpanded.risques}
        itemCount={3}
        className="mt-6"
        id="risques-satisfaction"
      >
      <DashboardPanel title="" subtitle="" className="mt-0 border-0 shadow-none" padding="md">
        <p className="text-[11px] text-slate-400 mb-4">Santé globale du portefeuille chantiers et des relations clients</p>
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
                      <span>Délais (% livrés à  l&apos;heure)</span><span className="tabular-nums text-right">{scoreQualite.delais}</span>
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
      </CollapsibleSection>
      )}

      {/* Indicateurs complémentaires DG — Phase 2 audit (mock : HSE, productivité, délai paiement, ROI, taux utilisation, bilan carbone) */}
      {(!sectionFocus || sectionFocus === 'indicateurs') && (
      <CollapsibleSection
        key={`indicateurs-${displayMode}-${preset ?? 'x'}`}
        title="Indicateurs complémentaires"
        defaultExpanded={sectionExpanded.indicateurs}
        itemCount={6}
        className="mt-6"
        id="indicateurs-complementaires"
      >
      <DashboardPanel title="" subtitle="" className="mt-0 border-0 shadow-none" padding="md">
        <p className="text-[11px] text-slate-400 mb-4">Conformité HSE, rentabilité, trésorerie, utilisation, carbone — standards marché 2026</p>
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
                  <span className="text-[10px] text-slate-400">Bilan carbone (tCOâ‚‚e)</span>
                </div>
                <div className="text-lg font-semibold text-slate-100">{ind.bilanCarboneTeqCO2}</div>
                <p className="text-[10px] text-slate-400">Objectif &lt; {ind.bilanCarboneObjectifTeqCO2} tCOâ‚‚e · portefeuille</p>
              </div>
            </div>
          );
        })()}
      </DashboardPanel>
      </CollapsibleSection>
      )}

      {/* Activité récente (mock) — audit ERP BTP 2026 */}
      {!sectionFocus && (
      <CollapsibleSection
        key={`activite-${displayMode}-${preset ?? 'x'}`}
        title="Activité récente"
        defaultExpanded={sectionExpanded.activite}
        itemCount={ACTIVITE_RECENTE_MOCK.length}
        className="mt-6"
        id="activite-recente"
      >
      <DashboardPanel title="" subtitle="" className="mt-0 border-0 shadow-none" padding="md">
        <p className="text-[11px] text-slate-400 mb-4">Dernières actions et événements</p>
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
      </CollapsibleSection>
      )}

      {/* Phase 4 - Exécution : tri, filtre Santé, 5 affichés puis "Voir les 10 autres" */}
      {(!sectionFocus || sectionFocus === 'phase4') && (
      <CollapsibleSection
        key={`phase4-${displayMode}-${preset ?? 'x'}`}
        title="Phase 4 - Exécution"
        defaultExpanded={sectionExpanded.phase4}
        itemCount={phase4Displayed.length}
        className="mt-6"
        id="phase-4-execution"
      >
      <DashboardPanel title="" subtitle="" className="mt-0 border-0 shadow-none" padding="md">
        <p className="text-[11px] text-slate-400 mb-4">
          Chantiers en phase d&apos;exécution ({phase4Displayed.length} / {phase4FilteredCount} affichés{phase4FilterSante !== 'all' ? `, filtre: ${phase4FilterSante === 'critique' ? 'Critique' : phase4FilterSante === 'surveiller' ? 'À surveiller' : 'Bon'}` : ''} sur {phase4TotalCount} au total)
        </p>
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
            <option value="surveiller">À surveiller (50—80 %)</option>
            <option value="bon">Bon (≥ 80 %)</option>
          </select>
        </div>
        <div className="rounded-xl border border-slate-800/60 bg-slate-950/40 overflow-hidden">
          <div className="overflow-x-auto overflow-y-visible -mx-1 px-1 md:mx-0 md:px-0" style={{ WebkitOverflowScrolling: 'touch' }}>
            <table className="w-full min-w-[640px] border-collapse text-[10px] sm:text-[11px]">
              <thead className="bg-slate-800/60 sticky top-0 z-10">
                <tr>
                  <th className="p-2 sm:p-3 text-left whitespace-nowrap">
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
                  <th className="p-2 sm:p-3 text-right whitespace-nowrap">
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
                  <th className="p-2 sm:p-3 text-right font-semibold text-slate-200 whitespace-nowrap">Problème principal</th>
                  <th className="p-2 sm:p-3 text-right font-semibold text-slate-200 whitespace-nowrap">Action rapide</th>
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
                    <td className="p-2 sm:p-3 text-right text-red-400 min-w-[140px]">{getProblemePrincipal(chantier)}</td>
                    <td className="p-2 sm:p-3 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
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
      </CollapsibleSection>
      )}

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
            problemePrincipal={getProblemePrincipal(phase4SelectedRow)}
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
            problemePrincipal={getProblemePrincipal(phase4SelectedRow)}
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
        creances={[]}
        countLabel={financesGlobales.creancesPlus30j}
      />

      {/* Modal validations en attente (clic sur 21/45) */}
      <ValidationsModal
        isOpen={validationsModalOpen}
        onClose={() => setValidationsModalOpen(false)}
        validations={[]}
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
    </main>
  );
});

