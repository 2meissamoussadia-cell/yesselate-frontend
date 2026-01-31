'use client';

import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { FluentButton } from '@/components/ui/fluent-button';
import { useDelegationWorkspaceStore } from '@/lib/stores/delegationWorkspaceStore';
import {
  AlertTriangle,
  Clock,
  Shield,
  FileWarning,
  UserX,
  RefreshCw,
  Zap,
  ChevronRight,
  AlertCircle,
  Banknote,
  Activity,
  Lightbulb,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Pause,
} from 'lucide-react';
import type { DelegationAction, Currency, PolicyEvaluationResult } from '@/lib/delegation/types';

// ============================================
// TYPES
// ============================================

interface InsightsData {
  toDecide: {
    expiringSoon: Array<{
      id: string;
      code: string;
      title: string;
      delegateName: string;
      bureau: string;
      endsAt: string;
      daysLeft: number;
    }>;
    withoutController: Array<{
      id: string;
      code: string;
      title: string;
      delegateName: string;
      bureau: string;
    }>;
    suspended: Array<{
      id: string;
      code: string;
      title: string;
      delegateName: string;
      suspendedAt: string;
      suspendedReason: string | null;
    }>;
  };
  risks: {
    highValueUsages: Array<{
      id: string;
      delegationId: string;
      delegationCode: string;
      amount: number;
      maxAmount: number | null;
      usagePercentage: number | null;
    }>;
    highFrequency: Array<{
      id: string;
      code: string;
      title: string;
      usageCount: number;
    }>;
    deniedEvents: Array<{
      id: string;
      delegationCode: string;
      eventType: string;
      summary: string;
      createdAt: string;
    }>;
  };
  recommendations: Array<{
    priority: 'critical' | 'high' | 'medium' | 'low';
    type: string;
    title: string;
    description: string;
    action: string;
    delegationId?: string;
  }>;
  kpis: {
    healthScore: number;
    active: number;
    expired: number;
    revoked: number;
    suspended: number;
    usagesThisMonth: number;
    amountThisMonth: number;
  };
}

// ============================================
// COMPONENT
// ============================================

export function DelegationDirectionPanel() {
  const { openTab } = useDelegationWorkspaceStore();
  
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState<InsightsData | null>(null);
  const [showRecommendations, setShowRecommendations] = useState(false);
  
  // Simulateur inline
  const [simAction, setSimAction] = useState<DelegationAction>('APPROVE_PAYMENT');
  const [simBureau, setSimBureau] = useState('');
  const [simAmount, setSimAmount] = useState(0);
  const [simResult, setSimResult] = useState<PolicyEvaluationResult | null>(null);
  const [simLoading, setSimLoading] = useState(false);
  const [simDelegationId, setSimDelegationId] = useState('');
  const [availableDelegations, setAvailableDelegations] = useState<Array<{id: string; title: string}>>([]);

  // Charger les insights
  const loadInsights = useCallback(async () => {
    setLoading(true);
    try {
      // Charger les insights complets
      const insightsRes = await fetch('/api/delegations/insights', { cache: 'no-store' });
      if (insightsRes.ok) {
        const insightsData = await insightsRes.json();
        setInsights(insightsData);
      }
      
      // Charger les délégations actives pour le simulateur
      const activeRes = await fetch('/api/delegations?queue=active&limit=50', { cache: 'no-store' });
      const activeData = activeRes.ok ? await activeRes.json() : { items: [] };
      
      setAvailableDelegations(activeData.items?.map((d: any) => ({
        id: d.id,
        title: d.title || d.type || d.id,
      })) || []);
      
      if (activeData.items?.length > 0 && !simDelegationId) {
        setSimDelegationId(activeData.items[0].id);
      }
    } catch (e) {
      console.error('Erreur chargement insights:', e);
    } finally {
      setLoading(false);
    }
  }, [simDelegationId]);

  useEffect(() => {
    loadInsights();
  }, [loadInsights]);

  // Simuler
  const runSimulation = useCallback(async () => {
    if (!simDelegationId || !simBureau || simAmount <= 0) return;
    
    setSimLoading(true);
    setSimResult(null);
    
    try {
      const res = await fetch('/api/delegations/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          delegationId: simDelegationId,
          action: simAction,
          bureau: simBureau,
          amount: simAmount,
          currency: 'XOF' as Currency,
        }),
      });
      
      if (!res.ok) throw new Error('Erreur simulation');
      
      const data = await res.json();
      setSimResult(data.evaluation);
    } catch {
      // Ignorer l'erreur, juste ne pas afficher le résultat
    } finally {
      setSimLoading(false);
    }
  }, [simDelegationId, simAction, simBureau, simAmount]);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 dark:border-slate-800 dark:bg-[#1f1f1f]/70 animate-pulse">
            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-4" />
            <div className="space-y-3">
              <div className="h-16 bg-slate-100 dark:bg-slate-800 rounded" />
              <div className="h-16 bg-slate-100 dark:bg-slate-800 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Obtenir le niveau de santé en couleur
  const getHealthColor = (score: number) => {
    if (score >= 80) return 'emerald';
    if (score >= 60) return 'amber';
    return 'rose';
  };

  const healthColor = insights?.kpis?.healthScore ? getHealthColor(insights.kpis.healthScore) : 'slate';

  return (
    <div className="space-y-4">
      {/* Score de santé global */}
      {insights?.kpis && (
        <div className={cn(
          "rounded-2xl border p-4 flex items-center justify-between",
          healthColor === 'emerald' && "border-emerald-200/50 bg-emerald-50/30 dark:border-emerald-800/30 dark:bg-emerald-950/10",
          healthColor === 'amber' && "border-amber-200/50 bg-amber-50/30 dark:border-amber-800/30 dark:bg-amber-950/10",
          healthColor === 'rose' && "border-rose-200/50 bg-rose-50/30 dark:border-rose-800/30 dark:bg-rose-950/10"
        )}>
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold",
              healthColor === 'emerald' && "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300",
              healthColor === 'amber' && "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
              healthColor === 'rose' && "bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300"
            )}>
              {insights.kpis.healthScore}
            </div>
            <div>
              <div className="font-semibold text-sm">Score de santé</div>
              <div className="text-xs text-slate-400">
                {insights.kpis.active} actives • {insights.kpis.usagesThisMonth} utilisations ce mois
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-sm">
            <div className="text-center">
              <div className="font-bold text-emerald-600">{insights.kpis.active}</div>
              <div className="text-xs text-slate-400">Actives</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-amber-600">{insights.kpis.suspended}</div>
              <div className="text-xs text-slate-400">Suspendues</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-rose-600">{insights.kpis.revoked}</div>
              <div className="text-xs text-slate-400">Révoquées</div>
            </div>
          </div>
        </div>
      )}

      {/* Panneau principal 3 colonnes */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        
        {/* ========================================
            COLONNE 1 : À DÉCIDER AUJOURD'HUI
        ======================================== */}
        <div className="rounded-2xl border border-amber-200/50 dark:border-amber-800/30 bg-amber-50/30 dark:bg-amber-950/10 p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2 text-amber-700/90 dark:text-amber-400/90">
            <Clock className="w-5 h-5" />
            À décider aujourd&apos;hui
          </h3>
          
          {/* Délégations expirant bientôt */}
          <div className="space-y-2">
            {insights?.toDecide.expiringSoon.slice(0, 4).map(d => (
              <button
                key={d.id}
                onClick={() => openTab({
                  id: `delegation:${d.id}`,
                  type: 'delegation',
                  title: d.code || d.id,
                  icon: '🔑',
                  data: { delegationId: d.id },
                })}
                className="w-full text-left p-3 rounded-xl bg-white/80 dark:bg-slate-800/50 border border-amber-200/50 dark:border-amber-700/30 hover:border-amber-400 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-medium text-sm truncate">{d.title || d.code}</div>
                    <div className="text-xs text-slate-400">{d.delegateName} • {d.bureau}</div>
                  </div>
                  <span className={cn(
                    "px-2 py-0.5 rounded text-xs font-medium flex-none",
                    d.daysLeft <= 3 ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-800"
                  )}>
                    {d.daysLeft}j
                  </span>
                </div>
              </button>
            ))}
            
            {(!insights?.toDecide.expiringSoon || insights.toDecide.expiringSoon.length === 0) && (
              <div className="text-center py-4 text-sm text-slate-400">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-300" />
                Aucune délégation urgente
              </div>
            )}
          </div>
          
          {/* Délégations sans contrôleur */}
          {insights?.toDecide.withoutController && insights.toDecide.withoutController.length > 0 && (
            <div className="mt-4 pt-4 border-t border-amber-200/50 dark:border-amber-700/30">
              <div className="text-xs text-amber-700 dark:text-amber-400 mb-2 flex items-center gap-1">
                <UserX className="w-3 h-3" />
                Sans contrôleur assigné ({insights.toDecide.withoutController.length})
              </div>
              {insights.toDecide.withoutController.slice(0, 2).map(d => (
                <button 
                  key={d.id}
                  onClick={() => openTab({
                    id: `delegation:${d.id}`,
                    type: 'delegation',
                    title: d.code,
                    icon: '🔑',
                    data: { delegationId: d.id },
                  })}
                  className="w-full text-left text-sm text-slate-600 dark:text-slate-400 py-1 hover:text-slate-800 dark:hover:text-slate-200"
                >
                  {d.code} — {d.title}
                </button>
              ))}
            </div>
          )}
          
          {/* Délégations suspendues */}
          {insights?.toDecide.suspended && insights.toDecide.suspended.length > 0 && (
            <div className="mt-4 pt-4 border-t border-amber-200/50 dark:border-amber-700/30">
              <div className="text-xs text-orange-700 dark:text-orange-400 mb-2 flex items-center gap-1">
                <Pause className="w-3 h-3" />
                Suspendues ({insights.toDecide.suspended.length})
              </div>
              {insights.toDecide.suspended.slice(0, 2).map(d => (
                <button 
                  key={d.id}
                  onClick={() => openTab({
                    id: `delegation:${d.id}`,
                    type: 'delegation',
                    title: d.code,
                    icon: '🔑',
                    data: { delegationId: d.id },
                  })}
                  className="w-full text-left text-sm text-slate-600 dark:text-slate-400 py-1 hover:text-slate-800 dark:hover:text-slate-200"
                >
                  {d.code} — {d.suspendedReason || 'Raison non spécifiée'}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ========================================
            COLONNE 2 : RISQUES & ANOMALIES
        ======================================== */}
        <div className="rounded-2xl border border-rose-200/50 dark:border-rose-800/30 bg-rose-50/30 dark:bg-rose-950/10 p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2 text-rose-700/90 dark:text-rose-400/90">
            <AlertTriangle className="w-5 h-5" />
            Risques &amp; anomalies
          </h3>
          
          <div className="space-y-2">
            {/* Usages à haute valeur */}
            {insights?.risks.highValueUsages.slice(0, 3).map((u) => (
              <div
                key={u.id}
                className="p-3 rounded-xl border bg-amber-50/60 border-amber-200/50 dark:bg-amber-900/20 dark:border-amber-700/30"
              >
                <div className="flex items-start gap-2">
                  <Banknote className="w-4 h-4 text-amber-500/90 flex-none mt-0.5" />
                  <div className="min-w-0">
                    <div className="text-sm font-medium">Usage élevé: {u.delegationCode}</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">
                      {formatAmount(u.amount)} 
                      {u.usagePercentage && ` (${u.usagePercentage}% du plafond)`}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Haute fréquence */}
            {insights?.risks.highFrequency.slice(0, 2).map((d) => (
              <div
                key={d.id}
                className="p-3 rounded-xl border bg-yellow-50/60 border-yellow-200/50 dark:bg-yellow-900/20 dark:border-yellow-700/30"
              >
                <div className="flex items-start gap-2">
                  <TrendingUp className="w-4 h-4 text-yellow-500/90 flex-none mt-0.5" />
                  <div className="min-w-0">
                    <div className="text-sm font-medium">Fréquence élevée: {d.code}</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">
                      {d.usageCount} utilisations ce mois
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Événements refusés */}
            {insights?.risks.deniedEvents.slice(0, 2).map((e) => (
              <div
                key={e.id}
                className="p-3 rounded-xl border bg-rose-50/60 border-rose-200/50 dark:bg-rose-900/20 dark:border-rose-700/30"
              >
                <div className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-rose-500/90 flex-none mt-0.5" />
                  <div className="min-w-0">
                    <div className="text-sm font-medium">{e.eventType}: {e.delegationCode}</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">{e.summary}</div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Aucun risque */}
            {(!insights?.risks.highValueUsages?.length && 
              !insights?.risks.highFrequency?.length && 
              !insights?.risks.deniedEvents?.length) && (
              <div className="text-center py-4 text-sm text-slate-400">
                <Shield className="w-8 h-8 mx-auto mb-2 text-emerald-300" />
                Aucune anomalie détectée
              </div>
            )}
          </div>
          
          {/* Bouton voir recommandations */}
          {insights?.recommendations && insights.recommendations.length > 0 && (
            <div className="mt-4 pt-4 border-t border-rose-200/50 dark:border-rose-700/30">
              <button
                onClick={() => setShowRecommendations(!showRecommendations)}
                className="w-full flex items-center justify-between text-sm text-rose-700 dark:text-rose-400 hover:text-rose-800 dark:hover:text-rose-300"
              >
                <span className="flex items-center gap-1">
                  <Lightbulb className="w-3.5 h-3.5" />
                  {insights.recommendations.length} recommandation(s)
                </span>
                <ChevronRight className={cn(
                  "w-4 h-4 transition-transform",
                  showRecommendations && "rotate-90"
                )} />
              </button>
            </div>
          )}
        </div>

        {/* ========================================
            COLONNE 3 : SIMULATEUR D'ACTE
        ======================================== */}
        <div className="rounded-2xl border border-blue-200/50 dark:border-blue-800/30 bg-blue-50/30 dark:bg-blue-950/10 p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2 text-blue-700/90 dark:text-blue-400/90">
            <Zap className="w-5 h-5" />
            Simulateur d&apos;acte
          </h3>
          
          <p className="text-xs text-slate-400 mb-3">
            Testez si une action serait autorisée avant de l&apos;exécuter.
          </p>
          
          <div className="space-y-3">
            {/* Délégation */}
            <div>
              <label className="text-xs text-slate-400">Délégation</label>
              <select
                className="mt-1 w-full rounded-lg border border-slate-200/70 bg-white/90 p-2 text-sm outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                value={simDelegationId}
                onChange={(e) => setSimDelegationId(e.target.value)}
              >
                {availableDelegations.map(d => (
                  <option key={d.id} value={d.id}>{d.id} — {d.title}</option>
                ))}
              </select>
            </div>
            
            {/* Action */}
            <div>
              <label className="text-xs text-slate-400">Action</label>
              <select
                className="mt-1 w-full rounded-lg border border-slate-200/70 bg-white/90 p-2 text-sm outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                value={simAction}
                onChange={(e) => setSimAction(e.target.value as DelegationAction)}
              >
                <option value="APPROVE_PAYMENT">Valider paiement</option>
                <option value="SIGN_CONTRACT">Signer contrat</option>
                <option value="APPROVE_PURCHASE_ORDER">Valider BC</option>
                <option value="VALIDATE_CHANGE_ORDER">Valider avenant</option>
                <option value="COMMIT_BUDGET">Engager budget</option>
              </select>
            </div>
            
            {/* Bureau + Montant */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-slate-400">Bureau</label>
                <input
                  type="text"
                  className="mt-1 w-full rounded-lg border border-slate-200/70 bg-white/90 p-2 text-sm outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  value={simBureau}
                  onChange={(e) => setSimBureau(e.target.value)}
                  placeholder="Bureau..."
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Montant (XOF)</label>
                <input
                  type="number"
                  className="mt-1 w-full rounded-lg border border-slate-200/70 bg-white/90 p-2 text-sm outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  value={simAmount}
                  onChange={(e) => setSimAmount(Number(e.target.value))}
                />
              </div>
            </div>
            
            <FluentButton
              size="sm"
              variant="primary"
              onClick={runSimulation}
              disabled={simLoading || !simDelegationId || !simBureau || simAmount <= 0}
              className="w-full"
            >
              {simLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Simulation...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Tester
                </>
              )}
            </FluentButton>
            
            {/* Résultat */}
            {simResult && (
              <div className={cn(
                "p-3 rounded-xl text-sm border",
                simResult.result === 'ALLOWED' && "bg-emerald-50/60 text-emerald-700/90 border-emerald-200/50 dark:bg-emerald-900/20 dark:text-emerald-300/90 dark:border-emerald-700/30",
                simResult.result === 'PENDING_CONTROL' && "bg-amber-50/60 text-amber-700/90 border-amber-200/50 dark:bg-amber-900/20 dark:text-amber-300/90 dark:border-amber-700/30",
                simResult.result === 'DENIED' && "bg-rose-50/60 text-rose-700/90 border-rose-200/50 dark:bg-rose-900/20 dark:text-rose-300/90 dark:border-rose-700/30"
              )}>
                <div className="font-bold mb-1">
                  {simResult.result === 'ALLOWED' && '✅ AUTORISÉ'}
                  {simResult.result === 'PENDING_CONTROL' && '⏳ CONTRÔLE REQUIS'}
                  {simResult.result === 'DENIED' && '❌ REFUSÉ'}
                </div>
                
                {simResult.reasons.length > 0 && (
                  <ul className="text-xs space-y-0.5">
                    {simResult.reasons.slice(0, 3).map((r, i) => (
                      <li key={i}>• {r}</li>
                    ))}
                  </ul>
                )}
                
                {simResult.result === 'PENDING_CONTROL' && (
                  <div className="mt-2 text-xs">
                    {simResult.controls.dual && <span className="mr-2">🔒 Double validation</span>}
                    {simResult.controls.legal && <span className="mr-2">⚖️ Juridique</span>}
                    {simResult.controls.finance && <span>💰 Finance</span>}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================
          PANNEAU RECOMMANDATIONS (déroulant)
      ======================================== */}
      {showRecommendations && insights?.recommendations && (
        <div className="rounded-2xl border border-purple-200/50 dark:border-purple-800/30 bg-purple-50/30 dark:bg-purple-950/10 p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2 text-purple-700/90 dark:text-purple-400/90">
            <Lightbulb className="w-5 h-5" />
            Recommandations
          </h3>
          
          <div className="space-y-2">
            {insights.recommendations.map((rec, i) => (
              <div
                key={i}
                className={cn(
                  "p-3 rounded-xl border",
                  rec.priority === 'critical' && "bg-rose-50/60 border-rose-200/50 dark:bg-rose-900/20 dark:border-rose-700/30",
                  rec.priority === 'high' && "bg-amber-50/60 border-amber-200/50 dark:bg-amber-900/20 dark:border-amber-700/30",
                  rec.priority === 'medium' && "bg-yellow-50/60 border-yellow-200/50 dark:bg-yellow-900/20 dark:border-yellow-700/30",
                  rec.priority === 'low' && "bg-slate-50/60 border-slate-200/50 dark:bg-slate-800/30 dark:border-slate-700/30"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "px-1.5 py-0.5 rounded text-xs font-medium uppercase",
                        rec.priority === 'critical' && "bg-rose-100 text-rose-700",
                        rec.priority === 'high' && "bg-amber-100 text-amber-800",
                        rec.priority === 'medium' && "bg-yellow-100 text-yellow-800",
                        rec.priority === 'low' && "bg-slate-100 text-slate-600"
                      )}>
                        {rec.priority}
                      </span>
                      <span className="text-sm font-medium truncate">{rec.title}</span>
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">{rec.description}</div>
                    <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">💡 {rec.action}</div>
                  </div>
                  
                  {rec.delegationId && (
                    <FluentButton
                      size="sm"
                      variant="secondary"
                      onClick={() => openTab({
                        id: `delegation:${rec.delegationId}`,
                        type: 'delegation',
                        title: rec.delegationId!,
                        icon: '🔑',
                        data: { delegationId: rec.delegationId },
                      })}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </FluentButton>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


