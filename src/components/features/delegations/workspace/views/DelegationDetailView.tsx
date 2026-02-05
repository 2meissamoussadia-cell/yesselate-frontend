'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { cn } from '@/lib/cn';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FluentButton } from '@/components/ui/fluent-button';
import { FluentModal } from '@/components/ui/fluent-modal';
import {
  FileText,
  Users,
  Shield,
  Activity,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  Pause,
  Play,
  RefreshCw,
  Copy,
  ExternalLink,
  ChevronRight,
  Building2,
  Banknote,
  Calendar,
  Hash,
  Target,
  FileCheck,
  Zap,
  BarChart3,
  ListChecks,
  Scale,
  Lock,
  Unlock,
  UserCheck,
  AlertCircle,
} from 'lucide-react';
import type {
  DelegationFull,
  DelegationPolicy,
  DelegationActor,
  DelegationEngagement,
  DelegationAuditEvent,
  DelegationUsage,
  PolicyEvaluationResult,
  DelegationAction,
  Currency,
} from '@/lib/delegation/types';

// ============================================
// TYPES
// ============================================

interface DelegationFullResponse extends DelegationFull {
  events: DelegationAuditEvent[];
  usages: DelegationUsage[];
  metrics: {
    daysToExpiry: number;
    usageRate: number | null;
    remainingAmount: number | null;
    isExpiringSoon: boolean;
    activeControlsCount: number;
  };
}

interface Props {
  delegationId: string;
}

type TabId = 'resume' | 'perimetre' | 'limites' | 'acteurs' | 'engagements' | 'audit' | 'simulateur';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'resume', label: 'Résumé', icon: <FileText className="w-4 h-4" /> },
  { id: 'perimetre', label: 'Périmètre', icon: <Target className="w-4 h-4" /> },
  { id: 'limites', label: 'Limites & Contrôles', icon: <Shield className="w-4 h-4" /> },
  { id: 'acteurs', label: 'Acteurs', icon: <Users className="w-4 h-4" /> },
  { id: 'engagements', label: 'Engagements', icon: <ListChecks className="w-4 h-4" /> },
  { id: 'audit', label: 'Journal d\'audit', icon: <Activity className="w-4 h-4" /> },
  { id: 'simulateur', label: 'Simulateur', icon: <Zap className="w-4 h-4" /> },
];

// ============================================
// HELPERS
// ============================================

function formatAmount(amount: number | undefined, currency: string = 'XOF'): string {
  if (amount == null) return '—';
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(date: Date | string | undefined): string {
  if (!date) return '—';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatDateTime(date: Date | string | undefined): string {
  if (!date) return '—';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('fr-FR');
}

function shortHash(hash: string | undefined): string {
  if (!hash) return '—';
  return hash.slice(0, 8) + '…';
}

function getStatusBadge(status: string) {
  const map: Record<string, { label: string; className: string }> = {
    draft: { label: 'Brouillon', className: 'bg-slate-500/10 text-slate-700' },
    submitted: { label: 'Soumise', className: 'bg-blue-500/10 text-blue-700' },
    active: { label: 'Active', className: 'bg-emerald-500/10 text-emerald-700' },
    suspended: { label: 'Suspendue', className: 'bg-amber-500/10 text-amber-800' },
    revoked: { label: 'Révoquée', className: 'bg-rose-500/10 text-rose-700' },
    expired: { label: 'Expirée', className: 'bg-slate-500/10 text-slate-600' },
  };
  const { label, className } = map[status] || { label: status, className: 'bg-slate-500/10' };
  return <span className={cn('px-2 py-1 rounded-lg text-xs font-medium', className)}>{label}</span>;
}

// ============================================
// COMPONENT
// ============================================

export function DelegationDetailView({ delegationId }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>('resume');
  const [data, setData] = useState<DelegationFullResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Actions modales
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [actionType, setActionType] = useState<'suspend' | 'revoke' | 'extend' | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Simulateur
  const [simAction, setSimAction] = useState<DelegationAction>('APPROVE_PAYMENT');
  const [simBureau, setSimBureau] = useState('');
  const [simAmount, setSimAmount] = useState(0);
  const [simProjectId, setSimProjectId] = useState('');
  const [simSupplierId, setSimSupplierId] = useState('');
  const [simResult, setSimResult] = useState<PolicyEvaluationResult | null>(null);
  const [simLoading, setSimLoading] = useState(false);

  // ================================
  // CHARGEMENT
  // ================================
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch(`/api/delegations/${encodeURIComponent(delegationId)}/full`);
      if (!res.ok) throw new Error('Erreur chargement');
      
      const json = await res.json();
      setData(json);
      setSimBureau(json.bureau || '');
    } catch (e) {
      setError('Impossible de charger la délégation.');
    } finally {
      setLoading(false);
    }
  }, [delegationId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ================================
  // ACTIONS MÉTIER
  // ================================
  const executeAction = useCallback(async (type: 'suspend' | 'revoke' | 'extend', reason?: string) => {
    if (!data) return;
    
    setActionLoading(true);
    try {
      const res = await fetch(`/api/delegations/${encodeURIComponent(delegationId)}/actions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          actorName: 'Utilisateur courant', // TODO: récupérer depuis session
          payload: { reason },
        }),
      });
      
      if (!res.ok) throw new Error('Erreur action');
      
      await loadData();
      setActionModalOpen(false);
    } catch {
      setError('Erreur lors de l\'action.');
    } finally {
      setActionLoading(false);
    }
  }, [data, delegationId, loadData]);

  // ================================
  // SIMULATION
  // ================================
  const runSimulation = useCallback(async () => {
    if (!data) return;
    
    setSimLoading(true);
    setSimResult(null);
    
    try {
      const res = await fetch('/api/delegations/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          delegationId,
          action: simAction,
          bureau: simBureau,
          amount: simAmount,
          projectId: simProjectId || undefined,
          supplierId: simSupplierId || undefined,
          currency: 'XOF' as Currency,
        }),
      });
      
      if (!res.ok) throw new Error('Erreur simulation');
      
      const json = await res.json();
      setSimResult(json.evaluation);
    } catch {
      setError('Erreur lors de la simulation.');
    } finally {
      setSimLoading(false);
    }
  }, [data, delegationId, simAction, simBureau, simAmount, simProjectId, simSupplierId]);

  // ================================
  // RENDER LOADING / ERROR
  // ================================
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <RefreshCw className="w-6 h-6 animate-spin text-slate-400" />
        <span className="ml-2 text-slate-400">Chargement...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 text-center">
        <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
        <p className="text-slate-400">{error || 'Délégation introuvable.'}</p>
        <FluentButton size="sm" variant="secondary" onClick={loadData} className="mt-4">
          Réessayer
        </FluentButton>
      </div>
    );
  }

  // ================================
  // RENDER TABS
  // ================================
  return (
    <div className="space-y-4">
      {/* En-tête */}
      <div className="rounded-2xl border border-slate-200/70 bg-white/90 p-4 dark:border-slate-800 dark:bg-[#1f1f1f]/80">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-xl font-bold truncate">{data.title}</h2>
              {getStatusBadge(data.status)}
            </div>
            
            <p className="text-sm text-slate-400 mb-3">{data.object}</p>
            
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-purple-500" />
                <span className="text-slate-600">
                  <strong>{data.delegate.name}</strong>
                  {data.delegate.role && <span className="text-slate-400"> ({data.delegate.role})</span>}
                </span>
              </div>
              
              <div className="flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-blue-500" />
                <span className="text-slate-600">{data.bureau}</span>
              </div>
              
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-amber-500" />
                <span className="text-slate-600">
                  {formatDate(data.startsAt)} → {formatDate(data.endsAt)}
                </span>
              </div>
              
              <div className="flex items-center gap-1.5">
                <Banknote className="w-4 h-4 text-emerald-500" />
                <span className="text-slate-600">
                  Plafond : {formatAmount(data.maxAmount, data.currency)}
                </span>
              </div>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex items-center gap-2">
            {data.status === 'active' && (
              <>
                <FluentButton
                  size="sm"
                  variant="warning"
                  onClick={() => { setActionType('suspend'); setActionModalOpen(true); }}
                >
                  <Pause className="w-4 h-4 mr-1" />
                  Suspendre
                </FluentButton>
                <FluentButton
                  size="sm"
                  variant="destructive"
                  onClick={() => { setActionType('revoke'); setActionModalOpen(true); }}
                >
                  <XCircle className="w-4 h-4 mr-1" />
                  Révoquer
                </FluentButton>
              </>
            )}
            
            {data.status === 'suspended' && (
              <FluentButton
                size="sm"
                variant="success"
                onClick={() => executeAction('extend')}
              >
                <Play className="w-4 h-4 mr-1" />
                Réactiver
              </FluentButton>
            )}
            
            {data.metrics.isExpiringSoon && data.status === 'active' && (
              <FluentButton
                size="sm"
                variant="primary"
                onClick={() => { setActionType('extend'); setActionModalOpen(true); }}
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Prolonger
              </FluentButton>
            )}
          </div>
        </div>
        
        {/* Métriques rapides */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-200/70 dark:border-slate-700/50">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{data.usageCount}</div>
            <div className="text-xs text-slate-400">Utilisations</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-600">{formatAmount(data.usageTotalAmount, data.currency)}</div>
            <div className="text-xs text-slate-400">Montant cumulé</div>
          </div>
          <div className="text-center">
            <div className={cn(
              "text-2xl font-bold",
              data.metrics.daysToExpiry <= 7 ? "text-amber-600" : "text-blue-600"
            )}>
              {data.metrics.daysToExpiry}j
            </div>
            <div className="text-xs text-slate-400">Avant expiration</div>
          </div>
          <div className="text-center">
            <div className={cn(
              "text-2xl font-bold",
              (data.metrics.usageRate ?? 0) >= 80 ? "text-rose-600" : "text-slate-600"
            )}>
              {data.metrics.usageRate ?? 0}%
            </div>
            <div className="text-xs text-slate-400">Plafond utilisé</div>
          </div>
        </div>
      </div>

      {/* Onglets internes */}
      <div className="rounded-2xl border border-slate-200/70 bg-white/90 dark:border-slate-800 dark:bg-[#1f1f1f]/80 overflow-hidden">
        {/* Nav onglets */}
        <div className="flex overflow-x-auto border-b border-slate-200/70 dark:border-slate-700/50">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors",
                activeTab === tab.id
                  ? "text-purple-600 border-b-2 border-purple-500 bg-purple-500/5"
                  : "text-slate-400 hover:text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50"
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Contenu de l'onglet */}
        <div className="p-4">
          {activeTab === 'resume' && <TabResume data={data} />}
          {activeTab === 'perimetre' && <TabPerimetre data={data} />}
          {activeTab === 'limites' && <TabLimites data={data} />}
          {activeTab === 'acteurs' && <TabActeurs data={data} />}
          {activeTab === 'engagements' && <TabEngagements data={data} />}
          {activeTab === 'audit' && <TabAudit data={data} />}
          {activeTab === 'simulateur' && (
            <TabSimulateur
              data={data}
              simAction={simAction}
              simBureau={simBureau}
              simAmount={simAmount}
              simProjectId={simProjectId}
              simSupplierId={simSupplierId}
              simResult={simResult}
              simLoading={simLoading}
              onActionChange={setSimAction}
              onBureauChange={setSimBureau}
              onAmountChange={setSimAmount}
              onProjectChange={setSimProjectId}
              onSupplierChange={setSimSupplierId}
              onSimulate={runSimulation}
            />
          )}
        </div>
      </div>

      {/* Modal action */}
      <FluentModal
        open={actionModalOpen}
        title={
          actionType === 'suspend' ? 'Suspendre la délégation'
          : actionType === 'revoke' ? 'Révoquer la délégation'
          : 'Prolonger la délégation'
        }
        onClose={() => setActionModalOpen(false)}
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-400">
            {actionType === 'suspend' && 'La délégation sera temporairement inactive. Elle pourra être réactivée.'}
            {actionType === 'revoke' && 'La délégation sera définitivement révoquée. Cette action est irréversible.'}
            {actionType === 'extend' && `La délégation sera prolongée de ${data.extensionDays} jours.`}
          </p>
          
          <div className="flex justify-end gap-2">
            <FluentButton size="sm" variant="secondary" onClick={() => setActionModalOpen(false)}>
              Annuler
            </FluentButton>
            <FluentButton
              size="sm"
              variant={actionType === 'revoke' ? 'destructive' : 'primary'}
              onClick={() => actionType && executeAction(actionType)}
              disabled={actionLoading}
            >
              {actionLoading ? 'En cours...' : 'Confirmer'}
            </FluentButton>
          </div>
        </div>
      </FluentModal>
    </div>
  );
}

// ============================================
// SUB-COMPONENTS (TABS)
// ============================================

function TabResume({ data }: { data: DelegationFullResponse }) {
  return (
    <div className="space-y-6">
      {/* Informations générales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <FileText className="w-4 h-4 text-purple-500" />
            Informations générales
          </h3>
          
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-400">ID</dt>
              <dd className="font-mono">{data.id}</dd>
            </div>
            {data.code && (
              <div className="flex justify-between">
                <dt className="text-slate-400">Code</dt>
                <dd className="font-mono">{data.code}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-slate-400">Catégorie</dt>
              <dd>{data.category}</dd>
            </div>
            {data.legalBasis && (
              <div className="flex justify-between">
                <dt className="text-slate-400">Base juridique</dt>
                <dd>{data.legalBasis}</dd>
              </div>
            )}
            {data.decisionRef && (
              <div className="flex justify-between">
                <dt className="text-slate-400">Décision</dt>
                <dd>{data.decisionRef} ({formatDate(data.decisionDate)})</dd>
              </div>
            )}
          </dl>
        </div>
        
        <div className="space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-500" />
            Parties
          </h3>
          
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <div className="text-xs text-slate-400 mb-1">Délégant (Grantor)</div>
              <div className="font-medium">{data.grantor.name}</div>
              {data.grantor.role && <div className="text-sm text-slate-400">{data.grantor.role}</div>}
              {data.grantor.email && <div className="text-xs text-slate-400">{data.grantor.email}</div>}
            </div>
            
            <ChevronRight className="w-5 h-5 text-slate-300 mx-auto" />
            
            <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-900/20">
              <div className="text-xs text-purple-600 mb-1">Délégataire (Delegate)</div>
              <div className="font-medium">{data.delegate.name}</div>
              {data.delegate.role && <div className="text-sm text-slate-400">{data.delegate.role}</div>}
              {data.delegate.email && <div className="text-xs text-slate-400">{data.delegate.email}</div>}
            </div>
          </div>
        </div>
      </div>
      
      {/* Description */}
      {data.description && (
        <div>
          <h3 className="font-semibold mb-2">Description</h3>
          <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
            {data.description}
          </p>
        </div>
      )}
      
      {/* Hashes */}
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
        <h3 className="font-semibold flex items-center gap-2 mb-3">
          <Hash className="w-4 h-4 text-slate-400" />
          Traçabilité cryptographique
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div>
            <div className="text-xs text-slate-400 mb-1">Hash décision</div>
            <div className="font-mono text-xs bg-white dark:bg-slate-700 px-2 py-1 rounded">
              {data.decisionHash || '—'}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-400 mb-1">Hash tête de chaîne</div>
            <div className="font-mono text-xs bg-white dark:bg-slate-700 px-2 py-1 rounded">
              {data.headHash || '—'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TabPerimetre({ data }: { data: DelegationFullResponse }) {
  const renderScope = (mode: string, list: string[] | undefined, label: string) => {
    if (mode === 'ALL') {
      return <span className="text-emerald-600">Tous {label}</span>;
    }
    if (!list || list.length === 0) {
      return <span className="text-slate-400">Non défini</span>;
    }
    return (
      <div>
        <span className={mode === 'INCLUDE' ? 'text-blue-600' : 'text-rose-600'}>
          {mode === 'INCLUDE' ? 'Uniquement :' : 'Sauf :'}
        </span>
        <div className="flex flex-wrap gap-1 mt-1">
          {list.map((item, i) => (
            <span key={i} className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-xs">
              {item}
            </span>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-4 rounded-xl border border-slate-200/70 dark:border-slate-700">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-500" />
            Projets
          </h4>
          {renderScope(data.projectScopeMode, data.projectScopeList, 'les projets')}
        </div>
        
        <div className="p-4 rounded-xl border border-slate-200/70 dark:border-slate-700">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-purple-500" />
            Bureaux
          </h4>
          {renderScope(data.bureauScopeMode, data.bureauScopeList, 'les bureaux')}
        </div>
        
        <div className="p-4 rounded-xl border border-slate-200/70 dark:border-slate-700">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-500" />
            Fournisseurs
          </h4>
          {renderScope(data.supplierScopeMode, data.supplierScopeList, 'les fournisseurs')}
        </div>
        
        <div className="p-4 rounded-xl border border-slate-200/70 dark:border-slate-700">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-500" />
            Catégories d&apos;achats
          </h4>
          {data.categoryScopeList?.length ? (
            <div className="flex flex-wrap gap-1">
              {data.categoryScopeList.map((cat, i) => (
                <span key={i} className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/30 text-xs text-emerald-700">
                  {cat}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-emerald-600">Toutes catégories</span>
          )}
        </div>
      </div>
      
      {/* Policies */}
      <div>
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Scale className="w-4 h-4 text-purple-500" />
          Politiques d&apos;autorisation ({data.policies.length})
        </h3>
        
        <div className="space-y-2">
          {data.policies.map(p => (
            <div key={p.id} className={cn(
              "p-3 rounded-xl border",
              p.enabled
                ? "border-slate-200/70 dark:border-slate-700"
                : "border-slate-200/50 bg-slate-50/50 opacity-60"
            )}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{p.action.replace(/_/g, ' ')}</span>
                {p.enabled ? (
                  <span className="text-xs text-emerald-600">Actif</span>
                ) : (
                  <span className="text-xs text-slate-400">Désactivé</span>
                )}
              </div>
              
              <div className="flex flex-wrap gap-3 text-xs text-slate-400">
                {p.maxAmount && (
                  <span>Plafond : {formatAmount(p.maxAmount, p.currency)}</span>
                )}
                {p.requiresDualControl && (
                  <span className="text-amber-600">🔒 Double validation</span>
                )}
                {p.requiresLegalReview && (
                  <span className="text-blue-600">⚖️ Visa juridique</span>
                )}
                {p.requiresFinanceCheck && (
                  <span className="text-emerald-600">💰 Visa finance</span>
                )}
              </div>
            </div>
          ))}
          
          {data.policies.length === 0 && (
            <p className="text-sm text-slate-400">Aucune politique définie.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function TabLimites({ data }: { data: DelegationFullResponse }) {
  return (
    <div className="space-y-6">
      {/* Limites financières */}
      <div>
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Banknote className="w-4 h-4 text-emerald-500" />
          Limites financières
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-center">
            <div className="text-2xl font-bold text-emerald-600">
              {formatAmount(data.maxAmount, data.currency)}
            </div>
            <div className="text-xs text-slate-400">Plafond par opération</div>
          </div>
          
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {formatAmount(data.maxTotalAmount, data.currency)}
            </div>
            <div className="text-xs text-slate-400">Plafond cumulé</div>
          </div>
          
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {formatAmount(data.metrics.remainingAmount ?? undefined, data.currency)}
            </div>
            <div className="text-xs text-slate-400">Montant restant</div>
          </div>
        </div>
      </div>
      
      {/* Limites temporelles */}
      <div>
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-500" />
          Limites temporelles
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-slate-200/70 dark:border-slate-700">
            <div className="text-sm text-slate-400 mb-1">Horaires autorisés</div>
            <div className="font-medium">
              {data.allowedHoursStart != null && data.allowedHoursEnd != null
                ? `${data.allowedHoursStart}h - ${data.allowedHoursEnd}h`
                : '24h/24'}
            </div>
          </div>
          
          <div className="p-4 rounded-xl border border-slate-200/70 dark:border-slate-700">
            <div className="text-sm text-slate-400 mb-1">Jours autorisés</div>
            <div className="font-medium">
              {data.allowedDays?.length
                ? data.allowedDays.join(', ')
                : 'Tous les jours'}
            </div>
          </div>
        </div>
      </div>
      
      {/* Quotas */}
      <div>
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-blue-500" />
          Quotas d&apos;opérations
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-slate-200/70 dark:border-slate-700">
            <div className="text-sm text-slate-400 mb-1">Max par jour</div>
            <div className="font-medium">{data.maxDailyOps ?? 'Illimité'}</div>
          </div>
          
          <div className="p-4 rounded-xl border border-slate-200/70 dark:border-slate-700">
            <div className="text-sm text-slate-400 mb-1">Max par mois</div>
            <div className="font-medium">{data.maxMonthlyOps ?? 'Illimité'}</div>
          </div>
        </div>
      </div>
      
      {/* Contrôles requis */}
      <div>
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Shield className="w-4 h-4 text-purple-500" />
          Contrôles requis
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className={cn(
            "p-3 rounded-xl border text-center",
            data.requiresDualControl ? "border-amber-500/50 bg-amber-50 dark:bg-amber-900/20" : "border-slate-200/70"
          )}>
            <Lock className={cn("w-5 h-5 mx-auto mb-1", data.requiresDualControl ? "text-amber-600" : "text-slate-300")} />
            <div className="text-xs">Double validation</div>
            <div className="text-xs font-medium">{data.requiresDualControl ? 'Oui' : 'Non'}</div>
          </div>
          
          <div className={cn(
            "p-3 rounded-xl border text-center",
            data.requiresLegalReview ? "border-blue-500/50 bg-blue-50 dark:bg-blue-900/20" : "border-slate-200/70"
          )}>
            <Scale className={cn("w-5 h-5 mx-auto mb-1", data.requiresLegalReview ? "text-blue-600" : "text-slate-300")} />
            <div className="text-xs">Visa juridique</div>
            <div className="text-xs font-medium">{data.requiresLegalReview ? 'Oui' : 'Non'}</div>
          </div>
          
          <div className={cn(
            "p-3 rounded-xl border text-center",
            data.requiresFinanceCheck ? "border-emerald-500/50 bg-emerald-50 dark:bg-emerald-900/20" : "border-slate-200/70"
          )}>
            <Banknote className={cn("w-5 h-5 mx-auto mb-1", data.requiresFinanceCheck ? "text-emerald-600" : "text-slate-300")} />
            <div className="text-xs">Visa finance</div>
            <div className="text-xs font-medium">{data.requiresFinanceCheck ? 'Oui' : 'Non'}</div>
          </div>
          
          <div className={cn(
            "p-3 rounded-xl border text-center",
            data.requiresStepUpAuth ? "border-rose-500/50 bg-rose-50 dark:bg-rose-900/20" : "border-slate-200/70"
          )}>
            <Shield className={cn("w-5 h-5 mx-auto mb-1", data.requiresStepUpAuth ? "text-rose-600" : "text-slate-300")} />
            <div className="text-xs">2FA requis</div>
            <div className="text-xs font-medium">{data.requiresStepUpAuth ? 'Oui' : 'Non'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TabActeurs({ data }: { data: DelegationFullResponse }) {
  const roleLabels: Record<string, { label: string; color: string }> = {
    GRANTOR: { label: 'Délégant', color: 'text-purple-600' },
    DELEGATE: { label: 'Délégataire', color: 'text-blue-600' },
    CO_APPROVER: { label: 'Co-valideur', color: 'text-amber-600' },
    CONTROLLER: { label: 'Contrôleur', color: 'text-emerald-600' },
    AUDITOR: { label: 'Auditeur', color: 'text-indigo-600' },
    WITNESS: { label: 'Témoin', color: 'text-slate-600' },
    BACKUP: { label: 'Suppléant', color: 'text-cyan-600' },
    IMPACTED: { label: 'Impacté', color: 'text-rose-600' },
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-400">
        Matrice des acteurs impliqués dans cette délégation.
      </p>
      
      <div className="space-y-3">
        {data.actors.map(actor => (
          <div key={actor.id} className="p-4 rounded-xl border border-slate-200/70 dark:border-slate-700 flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-slate-400" />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{actor.user.name}</span>
                <span className={cn("text-xs font-medium", roleLabels[actor.roleType]?.color || 'text-slate-400')}>
                  {roleLabels[actor.roleType]?.label || actor.roleType}
                </span>
                {actor.required && (
                  <span className="text-xs bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded">Obligatoire</span>
                )}
              </div>
              
              {actor.user.role && <div className="text-sm text-slate-400">{actor.user.role}</div>}
              {actor.user.email && <div className="text-xs text-slate-400">{actor.user.email}</div>}
              
              <div className="flex gap-3 mt-2 text-xs text-slate-400">
                {actor.canApprove && <span className="text-emerald-600">✓ Peut valider</span>}
                {actor.canRevoke && <span className="text-rose-600">✓ Peut révoquer</span>}
                {actor.mustBeNotified && <span className="text-blue-600">✓ Notifié</span>}
              </div>
              
              {actor.notes && (
                <div className="mt-2 text-xs text-slate-400 italic">{actor.notes}</div>
              )}
            </div>
          </div>
        ))}
        
        {data.actors.length === 0 && (
          <p className="text-sm text-slate-400 text-center py-8">Aucun acteur défini.</p>
        )}
      </div>
    </div>
  );
}

function TabEngagements({ data }: { data: DelegationFullResponse }) {
  const typeLabels: Record<string, { label: string; icon: React.ReactNode }> = {
    OBLIGATION: { label: 'Obligation', icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" /> },
    PROHIBITION: { label: 'Interdiction', icon: <XCircle className="w-4 h-4 text-rose-500" /> },
    ALERT: { label: 'Alerte', icon: <AlertTriangle className="w-4 h-4 text-amber-500" /> },
    REPORTING: { label: 'Reporting', icon: <FileText className="w-4 h-4 text-blue-500" /> },
    DOCUMENTATION: { label: 'Documentation', icon: <FileCheck className="w-4 h-4 text-purple-500" /> },
    COMPLIANCE: { label: 'Conformité', icon: <Shield className="w-4 h-4 text-indigo-500" /> },
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-400">
        Obligations et engagements du délégataire.
      </p>
      
      <div className="space-y-3">
        {data.engagements.map(eng => (
          <div key={eng.id} className={cn(
            "p-4 rounded-xl border",
            eng.enabled ? "border-slate-200/70 dark:border-slate-700" : "opacity-50 border-slate-200/50"
          )}>
            <div className="flex items-start gap-3">
              {typeLabels[eng.engagementType]?.icon}
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">{eng.title}</span>
                  <span className={cn(
                    "text-xs px-1.5 py-0.5 rounded",
                    eng.criticality === 'CRITICAL' && "bg-rose-100 text-rose-700",
                    eng.criticality === 'HIGH' && "bg-amber-100 text-amber-800",
                    eng.criticality === 'MEDIUM' && "bg-blue-100 text-blue-700",
                    eng.criticality === 'LOW' && "bg-slate-100 text-slate-600"
                  )}>
                    {eng.criticality}
                  </span>
                </div>
                
                <p className="text-sm text-slate-600 dark:text-slate-300">{eng.description}</p>
                
                {eng.frequency && (
                  <div className="mt-2 text-xs text-slate-400">
                    Fréquence : {eng.frequency}
                  </div>
                )}
                
                {eng.requiredDocs?.length && eng.requiredDocs.length > 0 && (
                  <div className="mt-2">
                    <div className="text-xs text-slate-400 mb-1">Documents requis :</div>
                    <div className="flex flex-wrap gap-1">
                      {eng.requiredDocs.map((doc, i) => (
                        <span key={i} className={cn(
                          "text-xs px-2 py-0.5 rounded",
                          doc.mandatory ? "bg-rose-100 text-rose-700" : "bg-slate-100 text-slate-600"
                        )}>
                          {doc.type} {doc.mandatory && '*'}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {data.engagements.length === 0 && (
          <p className="text-sm text-slate-400 text-center py-8">Aucun engagement défini.</p>
        )}
      </div>
    </div>
  );
}

function TabAudit({ data }: { data: DelegationFullResponse }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">
          Journal d&apos;audit immuable (chaînage cryptographique).
        </p>
        <FluentButton size="sm" variant="secondary">
          <FileCheck className="w-4 h-4 mr-1" />
          Vérifier intégrité
        </FluentButton>
      </div>
      
      <div className="space-y-2">
        {data.events.map((event, i) => (
          <div key={event.id} className="p-3 rounded-xl border border-slate-200/70 dark:border-slate-700">
            <div className="flex items-start gap-3">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center flex-none",
                event.eventType === 'CREATED' && "bg-emerald-100 text-emerald-600",
                event.eventType === 'USED' && "bg-blue-100 text-blue-600",
                event.eventType === 'EXTENDED' && "bg-purple-100 text-purple-600",
                event.eventType === 'SUSPENDED' && "bg-amber-100 text-amber-600",
                event.eventType === 'REVOKED' && "bg-rose-100 text-rose-600",
                !['CREATED', 'USED', 'EXTENDED', 'SUSPENDED', 'REVOKED'].includes(event.eventType) && "bg-slate-100 text-slate-600"
              )}>
                <Activity className="w-4 h-4" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm capitalize">{event.eventType.toLowerCase()}</span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs text-slate-400">{formatDateTime(event.createdAt)}</span>
                </div>
                
                <div className="text-sm text-slate-600 dark:text-slate-300">
                  {event.summary || `Action par ${event.actor.name}`}
                </div>
                
                {event.targetDoc && (
                  <div className="text-xs text-slate-400 mt-1">
                    Document : {event.targetDoc.ref} ({event.targetDoc.type})
                    {event.targetDoc.amount && ` — ${formatAmount(event.targetDoc.amount)}`}
                  </div>
                )}
                
                <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
                  <span>Hash : {shortHash(event.eventHash)}</span>
                  {i > 0 && <span>← {shortHash(event.previousHash)}</span>}
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {data.events.length === 0 && (
          <p className="text-sm text-slate-400 text-center py-8">Aucun événement enregistré.</p>
        )}
      </div>
    </div>
  );
}

function TabSimulateur({
  data,
  simAction,
  simBureau,
  simAmount,
  simProjectId,
  simSupplierId,
  simResult,
  simLoading,
  onActionChange,
  onBureauChange,
  onAmountChange,
  onProjectChange,
  onSupplierChange,
  onSimulate,
}: {
  data: DelegationFullResponse;
  simAction: DelegationAction;
  simBureau: string;
  simAmount: number;
  simProjectId: string;
  simSupplierId: string;
  simResult: PolicyEvaluationResult | null;
  simLoading: boolean;
  onActionChange: (v: DelegationAction) => void;
  onBureauChange: (v: string) => void;
  onAmountChange: (v: number) => void;
  onProjectChange: (v: string) => void;
  onSupplierChange: (v: string) => void;
  onSimulate: () => void;
}) {
  const actions: DelegationAction[] = [
    'APPROVE_PAYMENT',
    'SIGN_CONTRACT',
    'APPROVE_PURCHASE_ORDER',
    'VALIDATE_CHANGE_ORDER',
    'APPROVE_RECEPTION',
    'COMMIT_BUDGET',
    'APPROVE_EXPENSE',
  ];

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200/50">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-5 h-5 text-purple-600" />
          <span className="font-semibold text-purple-700 dark:text-purple-300">Simulateur d&apos;autorisation</span>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Testez si une action serait autorisée par cette délégation avant de l&apos;exécuter réellement.
        </p>
      </div>
      
      {/* Formulaire */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-slate-400">Action</label>
          <Select value={simAction} onValueChange={(v) => onActionChange(v as DelegationAction)}>
            <SelectTrigger className="mt-1 w-full h-10 rounded-xl border-slate-200/70 bg-white/90 dark:border-slate-700 dark:bg-slate-800 dark:text-white">
              <SelectValue placeholder="Action" />
            </SelectTrigger>
            <SelectContent className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
              {actions.map(a => (
                <SelectItem key={a} value={a}>{a.replace(/_/g, ' ')}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="text-sm text-slate-400">Bureau</label>
          <input
            type="text"
            className="mt-1 w-full rounded-xl border border-slate-200/70 bg-white/90 p-2 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            value={simBureau}
            onChange={(e) => onBureauChange(e.target.value)}
            placeholder="Ex: Bureau Travaux"
          />
        </div>
        
        <div>
          <label className="text-sm text-slate-400">Montant (XOF)</label>
          <input
            type="number"
            className="mt-1 w-full rounded-xl border border-slate-200/70 bg-white/90 p-2 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            value={simAmount}
            onChange={(e) => onAmountChange(Number(e.target.value))}
            placeholder="0"
          />
        </div>
        
        <div>
          <label className="text-sm text-slate-400">Projet (optionnel)</label>
          <input
            type="text"
            className="mt-1 w-full rounded-xl border border-slate-200/70 bg-white/90 p-2 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            value={simProjectId}
            onChange={(e) => onProjectChange(e.target.value)}
            placeholder="ID projet"
          />
        </div>
        
        <div>
          <label className="text-sm text-slate-400">Fournisseur (optionnel)</label>
          <input
            type="text"
            className="mt-1 w-full rounded-xl border border-slate-200/70 bg-white/90 p-2 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            value={simSupplierId}
            onChange={(e) => onSupplierChange(e.target.value)}
            placeholder="ID fournisseur"
          />
        </div>
      </div>
      
      <FluentButton
        variant="primary"
        onClick={onSimulate}
        disabled={simLoading || !simBureau}
      >
        {simLoading ? (
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
      
      {/* Résultat */}
      {simResult && (
        <div className={cn(
          "p-4 rounded-xl border",
          simResult.result === 'ALLOWED' && "bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-700",
          simResult.result === 'PENDING_CONTROL' && "bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-700",
          simResult.result === 'DENIED' && "bg-rose-50 border-rose-200 dark:bg-rose-900/20 dark:border-rose-700"
        )}>
          <div className="flex items-center gap-2 mb-3">
            {simResult.result === 'ALLOWED' && <CheckCircle2 className="w-6 h-6 text-emerald-600" />}
            {simResult.result === 'PENDING_CONTROL' && <Clock className="w-6 h-6 text-amber-600" />}
            {simResult.result === 'DENIED' && <XCircle className="w-6 h-6 text-rose-600" />}
            
            <span className="font-bold text-lg">
              {simResult.result === 'ALLOWED' && 'AUTORISÉ'}
              {simResult.result === 'PENDING_CONTROL' && 'EN ATTENTE DE CONTRÔLE'}
              {simResult.result === 'DENIED' && 'REFUSÉ'}
            </span>
          </div>
          
          {simResult.reasons.length > 0 && (
            <div className="mb-3">
              <div className="text-sm font-medium mb-1">Motifs :</div>
              <ul className="text-sm space-y-1">
                {simResult.reasons.map((r, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-rose-500">•</span>
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {simResult.result === 'PENDING_CONTROL' && (
            <div className="mb-3">
              <div className="text-sm font-medium mb-1">Contrôles requis :</div>
              <div className="flex gap-2 text-sm">
                {simResult.controls.dual && <span className="px-2 py-1 bg-amber-100 rounded">Double validation</span>}
                {simResult.controls.legal && <span className="px-2 py-1 bg-blue-100 rounded">Visa juridique</span>}
                {simResult.controls.finance && <span className="px-2 py-1 bg-emerald-100 rounded">Visa finance</span>}
                {simResult.controls.stepUp && <span className="px-2 py-1 bg-rose-100 rounded">2FA</span>}
              </div>
            </div>
          )}
          
          {simResult.recommendations.length > 0 && (
            <div>
              <div className="text-sm font-medium mb-1">Recommandations :</div>
              <ul className="text-sm space-y-1">
                {simResult.recommendations.map((r, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-blue-500">💡</span>
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="mt-3 pt-3 border-t border-slate-200/50 flex items-center gap-4 text-xs text-slate-400">
            <span>Niveau de risque : <strong>{simResult.riskLevel}</strong></span>
          </div>
        </div>
      )}
    </div>
  );
}
