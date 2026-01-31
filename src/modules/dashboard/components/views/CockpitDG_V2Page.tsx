/**
 * Cockpit DG V2 — Niveau futuriste 2027
 * IA prédictive (heuristique) + Auto-pilot + Prédictions 7j + Panneau décisions
 * Même design (slate, panels) que V1 ; prêt pour ML/LLM et 4D plus tard.
 */

'use client';

import React, { useMemo, useCallback, useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import {
  Activity,
  Building2,
  GitBranch,
  Zap,
  AlertTriangle,
  FileText,
  Wallet,
  FileCheck,
  FolderKanban,
  AlertCircle,
  Scale,
  ChevronRight,
  Brain,
} from 'lucide-react';
import { useDashboardCommandCenterStore } from '@/lib/stores/dashboardCommandCenterStore';
import { useIsMobile } from '@/application/hooks/useMediaQuery';
import { DashboardPanel } from '../shared/DashboardPanel';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import { colors, spacing } from '../../utils/dashboardDesignTokens';
import { useCockpitChantiers } from '../../hooks/useCockpitChantiers';
import { useCockpitLive } from '../../hooks/useCockpitLive';
import { predictiveEngine, autoPilot, EVENT_DG_APPROVAL } from '../../cockpit-v2';
import type { PredictiveInsight, AutoPilotDecision } from '../../types/cockpitV2';
import { AutoPilotPanel } from '../cockpit/AutoPilotPanel';

const MobileCockpit = dynamic(
  () => import('../cockpit/MobileCockpit').then((mod) => ({ default: mod.MobileCockpit })),
  { ssr: false }
);

const HealthSphereGrid = dynamic(
  () => import('../cockpit/HealthSphereGrid').then((mod) => ({ default: mod.HealthSphereGrid })),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-[480px] rounded-2xl border border-slate-800/60 bg-slate-900/40 flex items-center justify-center">
        <p className="text-slate-400 text-sm">Chargement du portfolio 3D…</p>
      </div>
    ),
  }
);

const LiveHealthSpheres = dynamic(
  () => import('../cockpit/LiveHealthSpheres').then((mod) => ({ default: mod.LiveHealthSpheres })),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-[480px] rounded-2xl border border-slate-800/60 bg-slate-900/40 flex items-center justify-center">
        <p className="text-slate-400 text-sm">Chargement Live (Phase 5)…</p>
      </div>
    ),
  }
);

const FourDimensionalView = dynamic(
  () => import('../cockpit/FourDimensionalView').then((mod) => ({ default: mod.FourDimensionalView })),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-[480px] rounded-2xl border border-slate-800/60 bg-slate-900/40 flex items-center justify-center">
        <p className="text-slate-400 text-sm">Chargement vue 4D…</p>
      </div>
    ),
  }
);

const MODULES_METIER = [
  { id: 'demandes', title: 'Demandes', icon: FileText, main: 'overview', sub: 'kpis', leaf: 'demandes', color: 'blue' },
  { id: 'budget', title: 'Budget', icon: Wallet, main: 'overview', sub: 'kpis', leaf: 'budget', color: 'emerald' },
  { id: 'validations', title: 'Validations', icon: FileCheck, main: 'performance', sub: 'validation', leaf: 'en-attente', color: 'violet' },
  { id: 'projets', title: 'Projets', icon: FolderKanban, main: 'overview', sub: 'kpis', leaf: 'projets', color: 'amber' },
  { id: 'alertes', title: 'Alertes', icon: AlertCircle, main: 'overview', sub: 'alerts', leaf: 'actives', color: 'rose' },
  { id: 'risques', title: 'Risques', icon: AlertTriangle, main: 'risks', sub: 'critical', leaf: 'risques', color: 'amber' },
  { id: 'decisions', title: 'Décisions', icon: Scale, main: 'decisions', sub: 'pending', leaf: 'urgentes', color: 'cyan' },
] as const;

const MODULE_CARD_COLORS: Record<string, string> = {
  blue: 'border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20',
  emerald: 'border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20',
  violet: 'border-violet-500/30 bg-violet-500/10 hover:bg-violet-500/20',
  amber: 'border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20',
  rose: 'border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20',
  cyan: 'border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20',
};

export function CockpitDG_V2Page() {
  const navigate = useDashboardCommandCenterStore((s) => s.navigate);
  const queryClient = useQueryClient();
  const { chantiers } = useCockpitChantiers({ maxSpheres: 20 });

  useCockpitLive({
    enabled: true,
    onMessage: (msg) => {
      if (msg.type === 'chantier:update') {
        queryClient.invalidateQueries({ queryKey: ['cockpit', 'chantiers'] });
      }
    },
  });

  const [insights, setInsights] = useState<PredictiveInsight[]>([]);
  const [decisions, setDecisions] = useState<AutoPilotDecision[]>([]);
  const [viewMode, setViewMode] = useState<'3d' | '4d'>('3d');
  const [liveMode, setLiveMode] = useState(false);

  const handleDrilldown = useCallback(
    (chantierId: string) => {
      navigate('performance', 'delays', 'critiques');
    },
    [navigate]
  );

  const hasRunPredictions = useRef(false);

  // Calculs santé (main thread) — worker désactivé temporairement (Turbopack worker loader)
  // TODO: réactiver Worker quand support Turbopack stabilisé
  const _healthScores = useMemo(() => {
    const scores: Record<string, number> = {};
    for (const c of chantiers) {
      scores[c.id] = c.sante ?? 0.7;
    }
    return scores;
  }, [chantiers]);

  // Lancer prédictions + auto-pilot une fois quand chantiers sont disponibles
  useEffect(() => {
    if (chantiers.length === 0 || hasRunPredictions.current) return;
    hasRunPredictions.current = true;
    predictiveEngine.loadModel();
    const nextInsights = predictiveEngine.predictNextWeek(chantiers);
    setInsights(nextInsights);
    const newDecisions = autoPilot.executeInsights(nextInsights);
    setDecisions((prev) => [...prev, ...newDecisions]);
  }, [chantiers]);

  // Écouter les demandes de validation DG (depuis l’auto-pilot)
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<AutoPilotDecision>).detail;
      if (detail?.id) setDecisions((prev) => [...prev, detail]);
    };
    window.addEventListener(EVENT_DG_APPROVAL, handler);
    return () => window.removeEventListener(EVENT_DG_APPROVAL, handler);
  }, []);

  const handleApprove = useCallback((_id: string, _approved: boolean) => {
    setDecisions(autoPilot.getAllDecisions());
  }, []);

  const healthMetrics = useMemo(
    () => ({ operations: 87, finance: 76, workflow: 62 }),
    []
  );

  const criticalCount = insights.filter((i) => i.severity === 'critical').length;
  const isMobile = useIsMobile();

  // Phase 7 — Mobile-First: cockpit swipe quadrants sur mobile
  if (isMobile) {
    return (
      <MobileCockpit
        onDrilldown={handleDrilldown}
        onNewChantier={() => navigate('performance', 'projets', null)}
      />
    );
  }

  return (
    <div className="space-y-4 animate-fadeIn min-w-0 max-w-full overflow-x-hidden">
      {/* Header IA V2 */}
      <div
        className={cn(
          'rounded-xl border px-4 py-3 flex items-center justify-between',
          colors.border.default,
          colors.bg.secondary
        )}
      >
        <div className="flex items-center gap-3">
          <Brain className="h-5 w-5 text-violet-400" />
          <span className="text-sm font-semibold text-slate-100">YESSALATE AI V2</span>
          {criticalCount > 0 && (
            <span className="text-xs font-medium text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
              {criticalCount} alerte{criticalCount > 1 ? 's' : ''} critique{criticalCount > 1 ? 's' : ''}
            </span>
          )}
        </div>
        <p className="text-xs text-slate-400">
          Prédictions 7j • Auto-pilot actif
        </p>
      </div>

      {/* Briefing */}
      <div className={cn('rounded-xl border px-4 py-3', colors.border.default, colors.bg.secondary)}>
        <p className="text-sm text-slate-200">
          <span className="text-slate-400 font-medium">Briefing :</span>{' '}
          {insights.length > 0
            ? `${insights.length} insight(s) — ${insights.slice(0, 2).map((i) => i.prediction).join(' • ')}`
            : 'Phase4 à surveiller. Stock peinture bas. 3 chantiers en retard.'}
        </p>
      </div>

      {/* Toggle Vue 3D / Vue 4D / Live (Phase 5) */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-slate-400 font-medium">Vue :</span>
        <button
          type="button"
          onClick={() => setViewMode('3d')}
          className={cn(
            'rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors',
            colors.border.default,
            viewMode === '3d' ? 'bg-slate-700/50 text-slate-100 border-slate-600' : 'bg-slate-900/40 text-slate-400 hover:bg-slate-800/50'
          )}
        >
          3D Portfolio
        </button>
        <button
          type="button"
          onClick={() => setViewMode('4d')}
          className={cn(
            'rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors',
            colors.border.default,
            viewMode === '4d' ? 'bg-slate-700/50 text-slate-100 border-slate-600' : 'bg-slate-900/40 text-slate-400 hover:bg-slate-800/50'
          )}
        >
          4D Temps + Prédictions
        </button>
        <button
          type="button"
          onClick={() => setLiveMode((prev) => !prev)}
          className={cn(
            'rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors',
            colors.border.default,
            liveMode ? 'bg-emerald-700/50 text-emerald-100 border-emerald-600' : 'bg-slate-900/40 text-slate-400 hover:bg-slate-800/50'
          )}
          title="Phase 5 — /api/chantiers/health, refresh 5s, WebSocket GPS/stock"
        >
          Live
        </button>
      </div>

      {/* Grille 3D ou Vue 4D + Panneau Auto-pilot côte à côte */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
        <ErrorBoundary
          fallback={
            <div className={cn('rounded-2xl border min-h-[480px] flex items-center justify-center', colors.border.default, colors.bg.secondary)}>
              <p className="text-slate-400 text-sm">Vue 3D/4D indisponible.</p>
            </div>
          }
        >
          {viewMode === '3d' ? (
            liveMode ? (
              <LiveHealthSpheres
                maxSpheres={20}
                onDrilldown={handleDrilldown}
                onNewChantier={() => navigate('performance', 'projets', null)}
              />
            ) : (
              <HealthSphereGrid
                maxSpheres={20}
                onDrilldown={handleDrilldown}
                onNewChantier={() => navigate('performance', 'projets', null)}
              />
            )
          ) : (
            <FourDimensionalView
              chantiers={chantiers}
              insights={insights}
              onDrilldown={handleDrilldown}
            />
          )}
        </ErrorBoundary>
        <AutoPilotPanel decisions={decisions} onApprove={handleApprove} />
      </div>

      {/* Prédictions 7 jours — cartes insights */}
      {insights.length > 0 && (
        <div className={cn('rounded-xl border overflow-hidden', colors.border.default, colors.bg.secondary)}>
          <div className="px-4 py-3 border-b border-slate-800/60 bg-slate-950/40 flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-400" />
            <h3 className="text-sm font-semibold text-slate-100">Prédictions 7 jours</h3>
          </div>
          <div className="p-4 flex flex-wrap gap-3">
            {insights.slice(0, 8).map((i) => (
              <div
                key={i.id}
                className={cn(
                  'rounded-lg border px-3 py-2 min-w-[200px]',
                  i.severity === 'critical' && 'border-rose-500/40 bg-rose-500/10',
                  i.severity === 'high' && 'border-amber-500/40 bg-amber-500/10',
                  (i.severity === 'medium' || i.severity === 'low') && 'border-slate-700/60 bg-slate-900/30'
                )}
              >
                <p className="text-xs font-medium text-slate-200 line-clamp-2">{i.prediction}</p>
                <p className="text-[10px] text-slate-400 mt-1">
                  {i.chantier_id} • {i.confidence}% • {i.impact_financial.toLocaleString('fr-FR')} FCFA
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4 quadrants (même que V1) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
        <DashboardPanel padding="md" className="min-h-[200px]">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="h-5 w-5 text-slate-400" />
            <h3 className="text-slate-100 font-semibold text-base">Chantier en focus</h3>
          </div>
          <div className="space-y-2 text-sm">
            <p className="text-slate-300">
              <span className="text-slate-400">#042</span> Phase4 — Avancement 62 %
            </p>
            <p className="text-slate-400 text-xs">GPS Thiès · Bureau Contrôle 1/3</p>
            <p className="text-amber-300 text-xs">Peinture stock bas</p>
          </div>
        </DashboardPanel>
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
                <span className="ml-1 text-slate-400">12</span>
              </button>
            ))}
          </div>
        </DashboardPanel>
      </div>

      {/* Accès modules métier */}
      <div className={cn('rounded-xl border p-4 sm:p-6', colors.border.default, colors.bg.secondary)}>
        <h3 className="text-base font-semibold text-slate-100 mb-1">Accès aux modules métier</h3>
        <p className="text-xs text-slate-400 mb-4">Choisissez un module pour les indicateurs et la logique métier.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {MODULES_METIER.map((card) => {
            const Icon = card.icon;
            return (
              <button
                key={card.id}
                type="button"
                onClick={() => navigate(card.main as any, card.sub, card.leaf)}
                className={cn(
                  'rounded-xl border p-4 text-left transition-all duration-200',
                  'hover:shadow-lg hover:shadow-black/20 hover:scale-[1.02]',
                  MODULE_CARD_COLORS[card.color] ?? 'border-slate-700/50 bg-slate-900/30'
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-800/60">
                    <Icon className="h-5 w-5 text-slate-200" />
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                </div>
                <h4 className="mt-3 text-sm font-semibold text-slate-100">{card.title}</h4>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
