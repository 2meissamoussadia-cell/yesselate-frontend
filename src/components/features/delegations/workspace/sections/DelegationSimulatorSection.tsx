'use client';

import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { FluentButton } from '@/components/ui/fluent-button';
import {
  Zap,
  FlaskConical,
  LayoutList,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import type { DelegationUIState } from '@/lib/stores/delegationWorkspaceStore';
import type { DelegationAction, PolicyEvaluationResult } from '@/lib/delegation/types';

interface Props {
  delegationId: string;
  delegation: any;
  sub?: DelegationUIState['sub'];
}

const ACTIONS: { value: DelegationAction; label: string }[] = [
  { value: 'APPROVE_PAYMENT', label: 'Valider un paiement' },
  { value: 'SIGN_CONTRACT', label: 'Signer un contrat' },
  { value: 'APPROVE_PURCHASE_ORDER', label: 'Valider un bon de commande' },
  { value: 'VALIDATE_CHANGE_ORDER', label: 'Valider un avenant' },
  { value: 'APPROVE_RECEPTION', label: 'Valider une réception' },
  { value: 'COMMIT_BUDGET', label: 'Engager un budget' },
  { value: 'APPROVE_EXPENSE', label: 'Approuver une dépense' },
];

export function DelegationSimulatorSection({ delegationId, delegation, sub }: Props) {
  // Par défaut ou 'test' : simulateur d'acte
  if (!sub || sub === 'test') {
    return <TestSimulator delegationId={delegationId} delegation={delegation} />;
  }

  if (sub === 'scenarios') {
    return <ScenariosView delegationId={delegationId} delegation={delegation} />;
  }

  return <TestSimulator delegationId={delegationId} delegation={delegation} />;
}

// ============================================
// TEST SIMULATOR
// ============================================

function TestSimulator({ delegationId, delegation }: { delegationId: string; delegation: any }) {
  const [action, setAction] = useState<DelegationAction>('APPROVE_PAYMENT');
  const [bureau, setBureau] = useState(delegation?.bureau || '');
  const [amount, setAmount] = useState(0);
  const [projectId, setProjectId] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [category, setCategory] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PolicyEvaluationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runSimulation = useCallback(async () => {
    setLoading(true);
    setResult(null);
    setError(null);
    
    try {
      const res = await fetch('/api/delegations/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          delegationId,
          action,
          bureau,
          amount,
          projectId: projectId || undefined,
          supplierId: supplierId || undefined,
          category: category || undefined,
          currency: 'XOF',
        }),
      });
      
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Erreur de simulation');
        return;
      }
      
      const data = await res.json();
      setResult(data.evaluation);
    } catch (e) {
      setError('Erreur lors de la simulation');
    } finally {
      setLoading(false);
    }
  }, [delegationId, action, bureau, amount, projectId, supplierId, category]);

  const resetForm = () => {
    setResult(null);
    setError(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <FlaskConical className="w-5 h-5 text-purple-500" />
          Simulateur d&apos;acte
        </h2>
        <p className="text-sm text-slate-400">
          Testez si une action serait autorisée par cette délégation avant de l&apos;exécuter réellement.
        </p>
      </div>

      {/* Formulaire */}
      <div className="p-4 rounded-xl border border-purple-200/50 bg-purple-50/30 dark:border-purple-800/30 dark:bg-purple-900/10 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Action */}
          <div>
            <label className="text-sm text-slate-400">Action à tester *</label>
            <select
              className="mt-1 w-full rounded-xl border border-slate-200/70 bg-white/90 p-2.5 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              value={action}
              onChange={(e) => { setAction(e.target.value as DelegationAction); resetForm(); }}
            >
              {ACTIONS.map(a => (
                <option key={a.value} value={a.value}>{a.label}</option>
              ))}
            </select>
          </div>

          {/* Bureau */}
          <div>
            <label className="text-sm text-slate-400">Bureau *</label>
            <input
              type="text"
              className="mt-1 w-full rounded-xl border border-slate-200/70 bg-white/90 p-2.5 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              value={bureau}
              onChange={(e) => { setBureau(e.target.value); resetForm(); }}
              placeholder="Ex: Bureau Travaux"
            />
          </div>

          {/* Montant */}
          <div>
            <label className="text-sm text-slate-400">Montant (XOF) *</label>
            <input
              type="number"
              className="mt-1 w-full rounded-xl border border-slate-200/70 bg-white/90 p-2.5 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              value={amount}
              onChange={(e) => { setAmount(Number(e.target.value)); resetForm(); }}
              placeholder="0"
            />
          </div>

          {/* Projet */}
          <div>
            <label className="text-sm text-slate-400">Projet (optionnel)</label>
            <input
              type="text"
              className="mt-1 w-full rounded-xl border border-slate-200/70 bg-white/90 p-2.5 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              value={projectId}
              onChange={(e) => { setProjectId(e.target.value); resetForm(); }}
              placeholder="ID ou nom du projet"
            />
          </div>

          {/* Fournisseur */}
          <div>
            <label className="text-sm text-slate-400">Fournisseur (optionnel)</label>
            <input
              type="text"
              className="mt-1 w-full rounded-xl border border-slate-200/70 bg-white/90 p-2.5 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              value={supplierId}
              onChange={(e) => { setSupplierId(e.target.value); resetForm(); }}
              placeholder="ID ou nom du fournisseur"
            />
          </div>

          {/* Catégorie */}
          <div>
            <label className="text-sm text-slate-400">Catégorie (optionnel)</label>
            <input
              type="text"
              className="mt-1 w-full rounded-xl border border-slate-200/70 bg-white/90 p-2.5 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              value={category}
              onChange={(e) => { setCategory(e.target.value); resetForm(); }}
              placeholder="Catégorie d'achat"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <FluentButton
            variant="primary"
            onClick={runSimulation}
            disabled={loading || !bureau || amount <= 0}
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Simulation...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Simuler
              </>
            )}
          </FluentButton>
        </div>
      </div>

      {/* Erreur */}
      {error && (
        <div className="p-4 rounded-xl border border-rose-200 bg-rose-50 dark:bg-rose-900/20 dark:border-rose-800">
          <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300">
            <AlertTriangle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Résultat */}
      {result && (
        <div className={cn(
          "p-6 rounded-xl border",
          result.result === 'ALLOWED' && "bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800",
          result.result === 'PENDING_CONTROL' && "bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800",
          result.result === 'DENIED' && "bg-rose-50 border-rose-200 dark:bg-rose-900/20 dark:border-rose-800"
        )}>
          {/* Verdict */}
          <div className="flex items-center gap-3 mb-4">
            {result.result === 'ALLOWED' && <CheckCircle2 className="w-8 h-8 text-emerald-600" />}
            {result.result === 'PENDING_CONTROL' && <Clock className="w-8 h-8 text-amber-600" />}
            {result.result === 'DENIED' && <XCircle className="w-8 h-8 text-rose-600" />}
            
            <div>
              <div className="text-xl font-bold">
                {result.result === 'ALLOWED' && 'AUTORISÉ'}
                {result.result === 'PENDING_CONTROL' && 'EN ATTENTE DE CONTRÔLE'}
                {result.result === 'DENIED' && 'REFUSÉ'}
              </div>
              <div className="text-sm text-slate-400">
                Niveau de risque : <strong>{result.riskLevel}</strong>
              </div>
            </div>
          </div>

          {/* Motifs */}
          {result.reasons.length > 0 && (
            <div className="mb-4">
              <div className="font-medium mb-2">Motifs :</div>
              <ul className="space-y-1">
                {result.reasons.map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <XCircle className="w-4 h-4 text-rose-500 flex-none mt-0.5" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Contrôles requis */}
          {result.result === 'PENDING_CONTROL' && (
            <div className="mb-4">
              <div className="font-medium mb-2">Contrôles requis :</div>
              <div className="flex flex-wrap gap-2">
                {result.controls.dual && (
                  <span className="px-3 py-1 rounded-lg bg-amber-100 text-amber-800 text-sm">
                    🔒 Double validation
                  </span>
                )}
                {result.controls.legal && (
                  <span className="px-3 py-1 rounded-lg bg-blue-100 text-blue-800 text-sm">
                    ⚖️ Visa juridique
                  </span>
                )}
                {result.controls.finance && (
                  <span className="px-3 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-sm">
                    💰 Visa finance
                  </span>
                )}
                {result.controls.stepUp && (
                  <span className="px-3 py-1 rounded-lg bg-rose-100 text-rose-800 text-sm">
                    🔐 2FA requis
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Recommandations */}
          {result.recommendations.length > 0 && (
            <div>
              <div className="font-medium mb-2">Recommandations :</div>
              <ul className="space-y-1">
                {result.recommendations.map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="text-blue-500">💡</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================
// SCENARIOS VIEW
// ============================================

function ScenariosView({ delegationId, delegation }: { delegationId: string; delegation: any }) {
  // Scénarios prédéfinis
  const scenarios = [
    {
      id: 1,
      name: 'Paiement standard',
      description: 'Valider un paiement de 5M XOF',
      action: 'APPROVE_PAYMENT' as DelegationAction,
      amount: 5000000,
    },
    {
      id: 2,
      name: 'Paiement limite',
      description: 'Valider un paiement au plafond',
      action: 'APPROVE_PAYMENT' as DelegationAction,
      amount: delegation?.maxAmount || 25000000,
    },
    {
      id: 3,
      name: 'Dépassement',
      description: 'Tenter un dépassement de plafond',
      action: 'APPROVE_PAYMENT' as DelegationAction,
      amount: (delegation?.maxAmount || 25000000) + 5000000,
    },
    {
      id: 4,
      name: 'Signature contrat',
      description: 'Signer un contrat de 10M XOF',
      action: 'SIGN_CONTRACT' as DelegationAction,
      amount: 10000000,
    },
  ];

  const [selectedScenario, setSelectedScenario] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Record<number, PolicyEvaluationResult>>({});

  const runScenario = useCallback(async (scenario: typeof scenarios[0]) => {
    setLoading(true);
    setSelectedScenario(scenario.id);
    
    try {
      const res = await fetch('/api/delegations/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          delegationId,
          action: scenario.action,
          bureau: delegation?.bureau || 'Bureau Test',
          amount: scenario.amount,
          currency: 'XOF',
        }),
      });
      
      if (res.ok) {
        const data = await res.json();
        setResults(prev => ({ ...prev, [scenario.id]: data.evaluation }));
      }
    } catch (e) {
      console.error('Erreur scénario:', e);
    } finally {
      setLoading(false);
    }
  }, [delegationId, delegation?.bureau]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <LayoutList className="w-5 h-5 text-indigo-500" />
          Scénarios prédéfinis
        </h2>
        <p className="text-sm text-slate-400">
          Testez rapidement des cas d&apos;usage courants.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {scenarios.map(scenario => {
          const result = results[scenario.id];
          
          return (
            <div
              key={scenario.id}
              className={cn(
                "p-4 rounded-xl border transition-all",
                result?.result === 'ALLOWED' && "border-emerald-300 bg-emerald-50/50 dark:bg-emerald-900/10",
                result?.result === 'PENDING_CONTROL' && "border-amber-300 bg-amber-50/50 dark:bg-amber-900/10",
                result?.result === 'DENIED' && "border-rose-300 bg-rose-50/50 dark:bg-rose-900/10",
                !result && "border-slate-200/70 dark:border-slate-700 hover:border-indigo-300"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-medium">{scenario.name}</div>
                  <div className="text-sm text-slate-400">{scenario.description}</div>
                  <div className="text-xs text-slate-400 mt-1">
                    {scenario.action} • {new Intl.NumberFormat('fr-FR').format(scenario.amount)} XOF
                  </div>
                </div>
                
                {result ? (
                  <div className={cn(
                    "flex-none px-2 py-1 rounded text-xs font-bold",
                    result.result === 'ALLOWED' && "bg-emerald-100 text-emerald-700",
                    result.result === 'PENDING_CONTROL' && "bg-amber-100 text-amber-800",
                    result.result === 'DENIED' && "bg-rose-100 text-rose-700"
                  )}>
                    {result.result === 'ALLOWED' && '✓'}
                    {result.result === 'PENDING_CONTROL' && '⏳'}
                    {result.result === 'DENIED' && '✗'}
                  </div>
                ) : (
                  <FluentButton
                    size="sm"
                    variant="secondary"
                    onClick={() => runScenario(scenario)}
                    disabled={loading && selectedScenario === scenario.id}
                  >
                    {loading && selectedScenario === scenario.id ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      'Tester'
                    )}
                  </FluentButton>
                )}
              </div>
              
              {/* Résultat détaillé */}
              {result && result.reasons.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-200/50 dark:border-slate-700/50">
                  <div className="text-xs text-slate-400">
                    {result.reasons[0]}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

