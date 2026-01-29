/**
 * Cockpit DG — Centrale de commandement (design actuel conservé)
 * 4 quadrants + barre Executive Controls, sans casser le design existant.
 * Même tokens (slate, bordures, panels) que le reste du dashboard.
 */

'use client';

import React, { useMemo, useCallback, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import {
  Activity,
  Building2,
  GitBranch,
  Zap,
  AlertTriangle,
  FileCheck,
  FileText,
  Wallet,
  FolderKanban,
  AlertCircle,
  Scale,
  ChevronRight,
  WifiOff,
} from 'lucide-react';
import { useDashboardCommandCenterStore } from '@/lib/stores/dashboardCommandCenterStore';
import { DashboardPanel } from '../shared/DashboardPanel';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import { colors } from '../../utils/dashboardDesignTokens';
import { useCockpitLive } from '../../hooks/useCockpitLive';
import { useCockpitFps } from '../../hooks/useCockpitFps';
import { useCockpitBriefing } from '../../hooks/useCockpitBriefing';
import { useCockpitPredictions } from '../../hooks/useCockpitPredictions';
import { useCockpitUrgentNotification } from '../../hooks/useCockpitUrgentNotification';
import { PushConsentBanner } from '../cockpit/PushConsentBanner';
import { CockpitSpheresLoadingSkeleton } from '../cockpit/CockpitSpheresLoadingSkeleton';
import { EmptyState } from '../shared/EmptyState';

/** Grille 3D chargée uniquement côté client (Three.js/WebGL incompatible SSR) */
const HealthSphereGrid = dynamic(
  () => import('../cockpit/HealthSphereGrid').then((mod) => ({ default: mod.HealthSphereGrid })),
  {
    ssr: false,
    loading: () => <CockpitSpheresLoadingSkeleton />,
  }
);

/** Phase 4 — Barre Executive Controls + commandes vocales (fixe en bas) */
const ExecutiveControls = dynamic(
  () => import('../cockpit/ExecutiveControls').then((mod) => ({ default: mod.ExecutiveControls })),
  { ssr: false }
);

/** Phase 6 — Photos GPS + Plan AR + Pointage QR + Drone */
const CockpitPhase6Section = dynamic(
  () => import('../cockpit/CockpitPhase6Section').then((mod) => ({ default: mod.CockpitPhase6Section })),
  { ssr: false }
);

/** Cartes d’accès rapide aux modules métier (même logique que DashboardAccueil3P) */
const MODULES_METIER: Array<{
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  main: string;
  sub: string;
  leaf: string | null;
  color: string;
}> = [
  { id: 'demandes', title: 'Demandes', description: 'Suivi des demandes, validation et flux internes.', icon: FileText, main: 'overview', sub: 'kpis', leaf: 'demandes', color: 'blue' },
  { id: 'budget', title: 'Budget', description: 'Indicateurs budgétaires et financiers.', icon: Wallet, main: 'overview', sub: 'kpis', leaf: 'budget', color: 'emerald' },
  { id: 'validations', title: 'Validations', description: 'Circuit de validation BC, factures, avenants.', icon: FileCheck, main: 'performance', sub: 'validation', leaf: 'en-attente', color: 'violet' },
  { id: 'projets', title: 'Projets', description: 'KPIs projets et maîtrise d\'ouvrage.', icon: FolderKanban, main: 'overview', sub: 'kpis', leaf: 'projets', color: 'amber' },
  { id: 'alertes', title: 'Alertes', description: 'Alertes actives et urgentes.', icon: AlertCircle, main: 'overview', sub: 'alerts', leaf: 'actives', color: 'rose' },
  { id: 'risques', title: 'Risques', description: 'Risques critiques et analyse.', icon: AlertTriangle, main: 'risks', sub: 'critical', leaf: 'risques', color: 'amber' },
  { id: 'decisions', title: 'Décisions', description: 'Décisions en attente et exécutées.', icon: Scale, main: 'decisions', sub: 'pending', leaf: 'urgentes', color: 'cyan' },
];

const MODULE_CARD_COLORS: Record<string, string> = {
  blue: 'border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20',
  emerald: 'border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20',
  violet: 'border-violet-500/30 bg-violet-500/10 hover:bg-violet-500/20',
  amber: 'border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20',
  rose: 'border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20',
  cyan: 'border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20',
};

const CockpitDGPageComponent = function CockpitDGPage() {
  const navigate = useDashboardCommandCenterStore((s) => s.navigate);
  const queryClient = useQueryClient();
  const { isConnected: liveConnected } = useCockpitLive({
    enabled: true,
    onMessage: (msg) => {
      if (msg.type === 'chantier:update') {
        queryClient.invalidateQueries({ queryKey: ['cockpit', 'chantiers'] });
      }
    },
  });
  const { fps, quality } = useCockpitFps({ enabled: true });
  useCockpitUrgentNotification({ enabled: true, sound: true, browserNotification: false });
  const {
    briefing,
    status: briefingStatus,
    topRisks,
    opportunities,
    isLoading: briefingLoading,
    error: briefingError,
    fromCache: briefingFromCache,
  } = useCockpitBriefing({ enabled: true });
  const {
    retardRisk,
    budgetRisk,
    qualityScore,
    satisfactionClient,
    isLoading: predictionsLoading,
    source: predictionsSource,
    fromCache: predictionsFromCache,
  } = useCockpitPredictions({ enabled: true });

  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);
  const showOfflineBadge = !isOnline || briefingFromCache || predictionsFromCache;

  const handleDrilldown = useCallback(
    (chantierId: string) => {
      navigate('performance', 'delays', 'critiques');
    },
    [navigate]
  );

  // Données mock (même style que les autres vues)
  const healthMetrics = useMemo(
    () => ({
      operations: 87,
      finance: 76,
      workflow: 62,
    }),
    []
  );

  return (
    <>
    <div className="space-y-4 animate-fadeIn pb-28 pb-[max(7rem,calc(7rem+env(safe-area-inset-bottom)))] min-w-0 max-w-full overflow-x-hidden">
      {/* Indicateur offline / données en cache (PWA Semaine 3) */}
      {showOfflineBadge && (
        <div
          className={cn(
            'rounded-lg border px-3 py-2 flex flex-wrap items-center gap-2 text-sm',
            colors.border.default,
            'bg-amber-500/10 border-amber-500/30 text-amber-200/90'
          )}
          role="status"
          aria-live="polite"
        >
          <WifiOff className="h-4 w-4 shrink-0" />
          <span>
            {!isOnline
              ? 'Mode hors ligne — données en cache'
              : 'Données affichées depuis le cache (dernière synchro)'}
          </span>
        </div>
      )}

      {/* Consentement Web Push (Semaine 3) */}
      <PushConsentBanner />

      {/* AI Briefing V5 — status, 3 phrases, top 3 risques, opportunités + Live + FPS */}
      <div
        className={cn(
          'rounded-xl border px-4 py-3',
          colors.border.default,
          colors.bg.secondary
        )}
      >
        <div className="flex items-start gap-3 flex-wrap">
          <div className="min-w-0 flex-1">
            <p className="text-sm text-slate-200 flex items-center gap-2 flex-wrap">
              <span className="text-slate-400 font-medium">Briefing :</span>
              {briefingLoading && !briefing ? (
                <span className="inline-flex items-center gap-2 min-w-[200px]">
                  <span className="h-4 flex-1 max-w-[280px] rounded dashboard-skeleton-shimmer" />
                  <span className="h-4 w-16 rounded dashboard-skeleton-shimmer shrink-0" />
                </span>
              ) : briefingError ? (
                <span className="text-amber-400/90">{briefingError}</span>
              ) : briefing ? (
                briefing
              ) : (
                'Phase4 à surveiller. Stock peinture bas. 3 chantiers en retard.'
              )}
              {briefingStatus && (
                <span
                  className={cn(
                    'inline-flex h-2 w-2 rounded-full shrink-0',
                    briefingStatus === 'green' && 'bg-emerald-400',
                    briefingStatus === 'yellow' && 'bg-amber-400',
                    briefingStatus === 'red' && 'bg-rose-400'
                  )}
                  title={`Statut global : ${briefingStatus}`}
                  aria-hidden
                />
              )}
            </p>
            {!briefingLoading && (topRisks.length > 0 || opportunities.length > 0) && (
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {topRisks.length > 0 && (
                  <div>
                    <span className="text-slate-500 font-medium">Top 3 risques :</span>
                    <ul className="mt-1 space-y-0.5 text-rose-300/90">
                      {topRisks.slice(0, 3).map((r, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-rose-500/80 shrink-0">•</span>
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {opportunities.length > 0 && (
                  <div>
                    <span className="text-slate-500 font-medium">Opportunités :</span>
                    <ul className="mt-1 space-y-0.5 text-emerald-300/90">
                      {opportunities.slice(0, 3).map((o, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-emerald-500/80 shrink-0">•</span>
                          <span>{o}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
            {!briefingLoading && topRisks.length === 0 && opportunities.length === 0 && briefing && (
              <p className="mt-2 text-xs text-slate-500">Aucun risque ni opportunité identifié.</p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {liveConnected && (
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                title="WebSocket temps réel actif"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live
              </span>
            )}
            <span
              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-700/60 text-slate-300 border border-slate-600/50"
              title="V5 Ultimate — FPS et qualité adaptative"
            >
              <span className="font-mono font-semibold text-blue-400">{typeof fps === 'number' && fps > 0 ? fps : '—'} FPS</span>
              <span className="text-slate-500">·</span>
              <span className="capitalize">{quality}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Prédictions ML — retard, budget, qualité (V5) */}
      <div
        className={cn(
          'rounded-xl border px-4 py-3 grid grid-cols-2 sm:grid-cols-4 gap-4',
          colors.border.default,
          colors.bg.secondary
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-slate-400">Risque retard</span>
          {predictionsLoading && retardRisk === null ? (
            <span className="text-slate-500 text-sm">—</span>
          ) : (
            <span
              className={cn(
                'text-sm font-semibold',
                (retardRisk ?? 0) > 50 ? 'text-rose-400' : (retardRisk ?? 0) > 25 ? 'text-amber-400' : 'text-emerald-400'
              )}
            >
              {retardRisk ?? 0} %
            </span>
          )}
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-slate-400">Risque budget</span>
          {predictionsLoading && budgetRisk === null ? (
            <span className="text-slate-500 text-sm">—</span>
          ) : (
            <span
              className={cn(
                'text-sm font-semibold',
                (budgetRisk ?? 0) > 50 ? 'text-rose-400' : (budgetRisk ?? 0) > 25 ? 'text-amber-400' : 'text-emerald-400'
              )}
            >
              {budgetRisk ?? 0} %
            </span>
          )}
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-slate-400">Score qualité</span>
          {predictionsLoading && qualityScore === null ? (
            <span className="text-slate-500 text-sm">—</span>
          ) : (
            <span
              className={cn(
                'text-sm font-semibold',
                (qualityScore ?? 0) >= 70 ? 'text-emerald-400' : (qualityScore ?? 0) >= 50 ? 'text-amber-400' : 'text-rose-400'
              )}
            >
              {qualityScore ?? 0}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-slate-400">Satisfaction client</span>
          {predictionsLoading && satisfactionClient === null ? (
            <span className="text-slate-500 text-sm">—</span>
          ) : (
            <span className="text-sm font-semibold text-violet-400">
              {satisfactionClient ?? 0}
            </span>
          )}
        </div>
        {predictionsSource && (
          <span className="col-span-2 sm:col-span-4 text-[10px] text-slate-500">
            Prédictions {predictionsSource === 'ml' ? 'ML' : 'mock'} · mise à jour 5 min
          </span>
        )}
      </div>

      {/* Phase 1 — Health Spheres 3D (Procore-style), chargé côté client uniquement */}
      <ErrorBoundary
        fallback={
          <div className={cn('rounded-2xl border min-h-[320px] md:min-h-[480px] flex items-center justify-center', colors.border.default, colors.bg.secondary)}>
            <p className="text-slate-400 text-sm">Vue 3D indisponible. Utilisez un navigateur à jour ou désactivez les extensions bloquant WebGL.</p>
          </div>
        }
      >
        <div className="min-h-[320px] md:min-h-[480px]">
          <HealthSphereGrid maxSpheres={20} onDrilldown={handleDrilldown} />
        </div>
      </ErrorBoundary>

      {/* 4 quadrants — mobile: swipe horizontal (snap) / desktop: grille 2x2 */}
      <div
        className={cn(
          'flex overflow-x-auto gap-4 pb-2 scrollbar-dashboard',
          'snap-x snap-mandatory snap-center',
          'lg:grid lg:grid-cols-2 lg:overflow-visible lg:snap-none'
        )}
        role="region"
        aria-label="Quadrants Cockpit"
      >
        {/* Q1 : Santé globale (résumé) */}
        <div className="snap-center shrink-0 w-[min(88vw,400px)] lg:w-auto lg:shrink-0">
          <DashboardPanel padding="md" className="min-h-[200px]">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-5 w-5 text-slate-400" />
            <h3 className="text-slate-100 font-semibold text-base">Santé globale</h3>
          </div>
          <div className="flex flex-wrap gap-4">
            {[
              { label: 'Opérations', value: healthMetrics.operations, color: 'emerald' },
              { label: 'Finance', value: healthMetrics.finance, color: 'amber' },
              { label: 'Workflow', value: healthMetrics.workflow, color: 'rose' },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex flex-col items-center gap-1">
                <div
                  className={cn(
                    'h-14 w-14 rounded-full border-2 flex items-center justify-center text-sm font-semibold',
                    color === 'emerald' && 'border-emerald-500/50 text-emerald-300',
                    color === 'amber' && 'border-amber-500/50 text-amber-300',
                    color === 'rose' && 'border-rose-500/50 text-rose-300'
                  )}
                >
                  {value}%
                </div>
                <span className="text-xs text-slate-400">{label}</span>
              </div>
            ))}
          </div>
        </DashboardPanel>
        </div>

        {/* Q2 : Chantier critique (résumé) — Empty state + CTA si aucun focus */}
        <div className="snap-center shrink-0 w-[min(88vw,400px)] lg:w-auto lg:shrink-0">
          <DashboardPanel padding="md" className="min-h-[200px]">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="h-5 w-5 text-slate-400" />
            <h3 className="text-slate-100 font-semibold text-base">Chantier en focus</h3>
          </div>
          <EmptyState
            title="Aucun chantier critique"
            description="Aucun chantier n'est actuellement en focus. Consultez le portfolio 3D ou la liste des chantiers pour en sélectionner un."
            icon={Building2}
            variant="info"
            actionLabel="Voir les chantiers"
            actionAriaLabel="Ouvrir la vue chantiers"
            onAction={() => navigate('performance', 'projets', null)}
          />
        </DashboardPanel>
        </div>

        {/* Q3 : Écosystème */}
        <div className="snap-center shrink-0 w-[min(88vw,400px)] lg:w-auto lg:shrink-0">
          <DashboardPanel padding="md" className="min-h-[200px]">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="h-5 w-5 text-slate-400" />
            <h3 className="text-slate-100 font-semibold text-base">Écosystème</h3>
          </div>
          <ul className="space-y-2 text-sm text-slate-300">
            <li>Ouvriers KYC : 27 · 12/27 sur chantier</li>
            <li>Quincailleries : 34 h retard · 3 ruptures</li>
            <li>Huissiers : 2 dossiers en attente</li>
          </ul>
        </DashboardPanel>
        </div>

        {/* Q4 : Workflow (mini colonnes) */}
        <div className="snap-center shrink-0 w-[min(88vw,400px)] lg:w-auto lg:shrink-0">
          <DashboardPanel padding="md" className="min-h-[200px]">
          <div className="flex items-center gap-2 mb-4">
            <GitBranch className="h-5 w-5 text-slate-400" />
            <h3 className="text-slate-100 font-semibold text-base">Workflow</h3>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-dashboard">
            {['Phase1', 'Phase2', 'Phase3', 'Phase4', 'Phase5', 'Phase6'].map((phase, i) => (
              <button
                key={phase}
                type="button"
                onClick={() => navigate('performance', 'delays', 'critiques')}
                className={cn(
                  'shrink-0 rounded-lg border px-3 py-2 text-xs font-medium transition-colors',
                  colors.border.default,
                  colors.bg.tertiary,
                  'hover:bg-slate-800/50',
                  i === 3 && 'border-amber-500/40 bg-amber-500/10 text-amber-300'
                )}
              >
                {phase}
                <span className="ml-1 text-slate-500">12</span>
              </button>
            ))}
          </div>
        </DashboardPanel>
        </div>
      </div>

      {/* Phase 6 — Photos GPS · Plan AR · Pointage QR · Drone */}
      <CockpitPhase6Section />

      {/* Accès aux modules métier — même logique que Vue d’ensemble 3P, intégré à la Centrale */}
      <div
        className={cn(
          'rounded-xl border',
          colors.border.default,
          colors.bg.secondary,
          'p-4 sm:p-6'
        )}
      >
        <h3 className="text-base font-semibold text-slate-100 mb-1">Accès aux modules métier</h3>
        <p className="text-xs text-slate-400 mb-4">
          Choisissez un module pour les indicateurs et la logique métier (type 3P / Odoo).
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {MODULES_METIER.map((card) => {
            const Icon = card.icon;
            return (
              <button
                key={card.id}
                type="button"
                onClick={() => navigate(card.main as any, card.sub, card.leaf)}
                className={cn(
                  'rounded-xl border p-4 text-left transition-all duration-200 min-h-[88px] sm:min-h-0',
                  'hover:shadow-lg hover:shadow-black/20 hover:scale-[1.02] active:scale-[0.98]',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 touch-manipulation',
                  MODULE_CARD_COLORS[card.color] ?? 'border-slate-700/50 bg-slate-900/30'
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-800/60">
                    <Icon className="h-5 w-5 text-slate-200" />
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
                </div>
                <h4 className="mt-3 text-sm font-semibold text-slate-100">{card.title}</h4>
                <p className="mt-1 text-xs text-slate-400 line-clamp-2">{card.description}</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>

    {/* Phase 4 — Barre Executive Controls fixe en bas (8 boutons 1-clic + voix) */}
    <ExecutiveControls />
    </>
  );
};

const CockpitDGPage = React.memo(CockpitDGPageComponent);
export default CockpitDGPage;
export { CockpitDGPage };
