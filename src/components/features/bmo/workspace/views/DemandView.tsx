'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { useWorkspaceStore, WorkspaceTab } from '@/lib/stores/workspaceStore';
import { FluentModal } from '@/components/ui/fluent-modal';
import { cn } from '@/lib/utils';
import { adaptLocalDemandToDomain } from '@/domain/demandes/adapters/demande.adapter';
import { useDemandesService } from '@/hooks/useDemandesService';
import { VirtualizedList } from '@/presentation/components/VirtualizedList/VirtualizedList';
import { formatCurrency, formatDate, getRiskColor } from '@/domain/demandes/service';
import { 
  RefreshCw, Check, X, UserPlus, MessageSquare, FileText, 
  Clock, Building2, Tag, DollarSign, AlertTriangle, User,
  Calendar, CheckCircle2, XCircle, History, Mail, Phone,
  Target, Users, FileWarning, Paperclip, ThumbsUp, ThumbsDown,
  AlertCircle, Shield, ChevronDown, ChevronUp, ExternalLink,
  Wallet, CalendarClock, Info
} from 'lucide-react';

// ============================================
// Types
// ============================================
type AuditEvent = {
  id: string;
  type: string;
  actorName: string;
  message?: string | null;
  createdAt: string;
};

type Requester = {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  service: string | null;
};

type Budget = {
  code: string | null;
  line: string | null;
  available: number | null;
  requested: number | null;
};

type Stakeholder = {
  id: string;
  personId: string;
  personName: string;
  role: string;
  required: boolean;
  note: string | null;
};

type Risk = {
  id: string;
  category: string;
  opportunity: boolean;
  probability: number;
  impact: number;
  score: number;
  mitigation: string | null;
  ownerName: string | null;
};

type Document = {
  name: string;
  type: string;
  size?: string;
  url?: string;
};

type DemandDetail = {
  id: string;
  subject: string;
  bureau: string;
  type: string;
  priority: string;
  status: 'pending' | 'validated' | 'rejected';
  amount?: number | null;
  createdAt: string;
  delayDays: number;
  isOverdue: boolean;
  
  requester: Requester | null;
  description: string | null;
  justification: string | null;
  objectives: string | null;
  beneficiaries: string | null;
  urgencyReason: string | null;
  
  budget: Budget;
  expectedDate: string | null;
  deadline: string | null;
  
  assignedToName?: string | null;
  documents: Document[];
  recommendation: string | null;
  
  stakeholders: Stakeholder[];
  risks: Risk[];
  audit: AuditEvent[];
};

// ============================================
// Constants
// ============================================
const EMPLOYEES = [
  { id: 'EMP-001', name: 'A. DIALLO', role: 'Responsable Validation' },
  { id: 'EMP-002', name: 'M. KONÉ', role: 'Chargé de Dossiers' },
  { id: 'EMP-003', name: 'S. TRAORÉ', role: 'Analyste Financier' },
  { id: 'EMP-004', name: 'K. CAMARA', role: 'Chef de Bureau' },
  { id: 'EMP-005', name: 'F. OUATTARA', role: 'Assistant Technique' },
];

const PRIORITY_CONFIG = {
  urgent: { label: 'Urgent', color: 'bg-rose-500/20 text-rose-400 border-rose-500/30', icon: AlertTriangle },
  high: { label: 'Élevée', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', icon: AlertTriangle },
  normal: { label: 'Normale', color: 'bg-slate-500/20 text-slate-400 border-slate-500/30', icon: Tag },
  low: { label: 'Basse', color: 'bg-slate-500/10 text-slate-500 border-slate-500/20', icon: Tag },
};

const STATUS_CONFIG = {
  pending: { label: 'En attente', color: 'bg-amber-500/20 text-amber-400', icon: Clock },
  validated: { label: 'Validée', color: 'bg-emerald-500/20 text-emerald-400', icon: CheckCircle2 },
  rejected: { label: 'Rejetée', color: 'bg-rose-500/20 text-rose-400', icon: XCircle },
};

const ROLE_LABELS: Record<string, string> = {
  OWNER: 'Porteur',
  APPROVER: 'Approbateur',
  REVIEWER: 'Réviseur',
  CONTRIBUTOR: 'Contributeur',
  INFORMED: 'Informé',
};

const ACTION_ICONS: Record<string, typeof Check> = {
  creation: FileText,
  validation: CheckCircle2,
  rejection: XCircle,
  assign: UserPlus,
  request_complement: MessageSquare,
  review: Clock,
};

const DOC_ICONS: Record<string, string> = {
  pdf: '📄',
  excel: '📊',
  word: '📝',
  archive: '📦',
  image: '🖼️',
  cad: '📐',
  default: '📎',
};

// ============================================
// Helpers - Utilisés depuis domain/service.ts
// ============================================
// formatCurrency, formatDate, getRiskColor sont importés depuis @/domain/demandes/service

// ============================================
// Component
// ============================================
export function DemandView({ tab }: { tab: WorkspaceTab }) {
  const demandId: string | undefined = tab.data?.demandId as string | undefined;
  const { updateTab, closeTab } = useWorkspaceStore();

  const [data, setData] = useState<DemandDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Expandable sections
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['context', 'budget', 'documents']));
  
  // Modales
  const [complementOpen, setComplementOpen] = useState(false);
  const [complementText, setComplementText] = useState('');
  const [assignOpen, setAssignOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [assignNote, setAssignNote] = useState('');
  const [confirmAction, setConfirmAction] = useState<'validate' | 'reject' | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) next.delete(section);
      else next.add(section);
      return next;
    });
  };

  const load = useCallback(async () => {
    if (!demandId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/demands/${encodeURIComponent(demandId)}`, { cache: 'no-store' });
      if (!res.ok) {
        setData(null);
        return;
      }
      const json = await res.json();
      setData(json.item ?? null);
      
      if (json.item) {
        updateTab(`demand:${demandId}`, { 
          title: `${demandId} — ${json.item.subject.slice(0, 20)}${json.item.subject.length > 20 ? '…' : ''}`,
          icon: json.item.status === 'validated' ? '✅' : json.item.status === 'rejected' ? '❌' : '📄'
        });
      }
    } catch (e) {
      console.error('Erreur chargement demande:', e);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [demandId, updateTab]);

  useEffect(() => { load(); }, [load]);

  const canAct = useMemo(() => !!data && data.status === 'pending', [data]);

  const action = async (type: 'validate' | 'reject' | 'request_complement' | 'assign', payload?: Record<string, unknown>) => {
    if (!demandId) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/demands/${encodeURIComponent(demandId)}/actions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          payload: { ...payload, actorId: 'USR-001', actorName: 'A. DIALLO' },
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error ?? 'Action impossible');
      }
      await load();
    } catch (e) {
      console.error('Erreur action:', e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedEmployee) return;
    const emp = EMPLOYEES.find(e => e.id === selectedEmployee);
    await action('assign', {
      employeeId: selectedEmployee,
      employeeName: emp?.name ?? selectedEmployee,
      note: assignNote,
    });
    setAssignOpen(false);
    setSelectedEmployee('');
    setAssignNote('');
  };

  const handleConfirmAction = async () => {
    if (!confirmAction) return;
    if (confirmAction === 'validate') {
      await action('validate');
    } else {
      await action('reject', { reason: rejectReason });
    }
    setConfirmAction(null);
    setRejectReason('');
  };

  // Erreur si pas d'ID
  if (!demandId) {
    return (
      <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 text-slate-500 dark:border-slate-800 dark:bg-[#1f1f1f]/70">
        <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-amber-500" />
        <div className="text-center">Demande introuvable (id manquant).</div>
      </div>
    );
  }

  const priorityConfig = PRIORITY_CONFIG[data?.priority as keyof typeof PRIORITY_CONFIG] ?? PRIORITY_CONFIG.normal;
  const statusConfig = STATUS_CONFIG[data?.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.pending;
  const StatusIcon = statusConfig.icon;

  // ✅ Utiliser le hook du domaine pour tous les calculs et validations
  const demandeForService = useMemo(() => {
    if (!data) return null;
    return adaptLocalDemandToDomain(data);
  }, [data]);

  const {
    budgetUsage,
    budgetMetrics,
    globalRiskScore: maxRiskScore,
    riskLevel,
    risks: evaluatedRisks,
    validation,
    warnings,
    approver,
    canAutoApprove,
  } = useDemandesService(demandeForService);
  const shouldEscalate = !canAutoApprove;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-4">
      {/* ============================================ */}
      {/* Panneau principal */}
      {/* ============================================ */}
      <div className="space-y-4">
        {/* En-tête */}
        <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 dark:border-slate-800 dark:bg-[#1f1f1f]/70">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <FileText className="w-4 h-4" />
                <span className="font-mono">{demandId}</span>
                {data && (
                  <>
                    <span>•</span>
                    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded", statusConfig.color)}>
                      <StatusIcon className="w-3 h-3" />
                      {statusConfig.label}
                    </span>
                    <span>•</span>
                    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded border", priorityConfig.color)}>
                      {priorityConfig.label}
                    </span>
                  </>
                )}
              </div>
              
              {loading ? (
                <div className="mt-2 h-7 w-64 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              ) : data ? (
                <h1 className="mt-2 text-xl font-bold">{data.subject}</h1>
              ) : (
                <h1 className="mt-2 text-xl font-bold text-rose-500">Demande introuvable</h1>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button 
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-500" 
                onClick={load}
                disabled={loading}
                title="Rafraîchir"
              >
                <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
              </button>
              
              <button
                className="px-3 py-2 rounded-xl border border-slate-200/70 hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-800/60
                           disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                onClick={() => setComplementOpen(true)}
                disabled={!data || actionLoading}
              >
                <MessageSquare className="w-4 h-4" />
                <span className="hidden sm:inline">Complément</span>
              </button>
              
              <button
                className="px-3 py-2 rounded-xl border border-slate-200/70 hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-800/60
                           disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                onClick={() => setAssignOpen(true)}
                disabled={!data || actionLoading}
              >
                <UserPlus className="w-4 h-4" />
                <span className="hidden sm:inline">Affecter</span>
              </button>
              
              <button
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 
                           disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                disabled={!canAct || actionLoading}
                onClick={() => setConfirmAction('validate')}
                data-testid="validate-button"
              >
                <Check className="w-4 h-4" />
                <span>Valider</span>
              </button>
              
              <button
                className="px-4 py-2 rounded-xl bg-rose-600 text-white hover:bg-rose-700 
                           disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                disabled={!canAct || actionLoading}
                onClick={() => setConfirmAction('reject')}
                data-testid="reject-button"
              >
                <X className="w-4 h-4" />
                <span>Rejeter</span>
              </button>
            </div>
          </div>
        </div>

        {/* Chargement */}
        {loading && (
          <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-8 dark:border-slate-800 dark:bg-[#1f1f1f]/70">
            <div className="flex items-center justify-center">
              <RefreshCw className="w-6 h-6 animate-spin text-slate-400" />
              <span className="ml-2 text-slate-500">Chargement...</span>
            </div>
          </div>
        )}

        {/* Erreur */}
        {!loading && !data && (
          <div className="rounded-2xl border border-rose-200/70 bg-rose-50/80 p-6 dark:border-rose-800 dark:bg-rose-900/20">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-rose-500" />
              <div>
                <div className="font-semibold text-rose-700 dark:text-rose-400">Demande introuvable</div>
                <div className="text-sm text-rose-600 dark:text-rose-300">
                  La demande {demandId} n&apos;existe pas ou a été supprimée.
                </div>
              </div>
            </div>
            <button
              className="mt-4 px-4 py-2 rounded-xl bg-rose-600 text-white hover:bg-rose-700"
              onClick={() => closeTab(`demand:${demandId}`)}
            >
              Fermer cet onglet
            </button>
          </div>
        )}

        {/* Contenu principal */}
        {!loading && data && (
          <div className="space-y-4">
            {/* ============================================ */}
            {/* Métriques clés (KPIs) */}
            {/* ============================================ */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/50">
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                  <Building2 className="w-3 h-3" />
                  Bureau
                </div>
                <div className="font-semibold">{data.bureau}</div>
              </div>
              
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/50">
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                  <DollarSign className="w-3 h-3" />
                  Montant demandé
                </div>
                <div className="font-semibold font-mono">{formatCurrency(data.amount)}</div>
              </div>
              
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/50">
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                  <Clock className="w-3 h-3" />
                  Délai
                </div>
                <div className={cn("font-semibold", data.isOverdue && "text-rose-500")}>
                  J+{data.delayDays} {data.isOverdue && <AlertTriangle className="w-3 h-3 inline" />}
                </div>
              </div>
              
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/50" data-testid="risk-score">
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                  <Shield className="w-3 h-3" />
                  Risque global
                </div>
                <div 
                  className={cn(
                    "font-semibold",
                    riskLevel === 'critical' ? "text-rose-500" : 
                    riskLevel === 'high' ? "text-amber-500" : 
                    riskLevel === 'medium' ? "text-yellow-500" : 
                    "text-emerald-500"
                  )}
                  data-testid="risk-score-value"
                >
                  {maxRiskScore > 0 ? `${maxRiskScore}/100` : '—'}
                </div>
                {riskLevel && (
                  <div className="text-xs mt-1 capitalize text-slate-400" data-testid="risk-level">{riskLevel}</div>
                )}
              </div>
            </div>

            {/* ============================================ */}
            {/* Demandeur */}
            {/* ============================================ */}
            {data.requester && (
              <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 dark:border-slate-800 dark:bg-[#1f1f1f]/70">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Demandeur
                </h3>
                <div className="flex flex-wrap items-start gap-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                      <User className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                      <div className="font-semibold">{data.requester.name}</div>
                      <div className="text-sm text-slate-500">{data.requester.service}</div>
                    </div>
                  </div>
                  {data.requester.email && (
                    <a href={`mailto:${data.requester.email}`} className="flex items-center gap-2 text-sm text-blue-500 hover:underline">
                      <Mail className="w-4 h-4" />
                      {data.requester.email}
                    </a>
                  )}
                  {data.requester.phone && (
                    <a href={`tel:${data.requester.phone}`} className="flex items-center gap-2 text-sm text-blue-500 hover:underline">
                      <Phone className="w-4 h-4" />
                      {data.requester.phone}
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* ============================================ */}
            {/* Contexte et justification */}
            {/* ============================================ */}
            <div className="rounded-2xl border border-slate-200/70 bg-white/80 dark:border-slate-800 dark:bg-[#1f1f1f]/70 overflow-hidden">
              <button 
                className="w-full p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/30"
                onClick={() => toggleSection('context')}
              >
                <h3 className="font-semibold flex items-center gap-2">
                  <Info className="w-4 h-4 text-blue-500" />
                  Contexte et justification
                </h3>
                {expandedSections.has('context') ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              
              {expandedSections.has('context') && (
                <div className="px-4 pb-4 space-y-4">
                  {data.description && (
                    <div>
                      <div className="text-xs font-medium text-slate-500 mb-1 flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        Description
                      </div>
                      <p className="text-sm leading-relaxed">{data.description}</p>
                    </div>
                  )}
                  
                  {data.justification && (
                    <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20">
                      <div className="text-xs font-medium text-amber-600 dark:text-amber-400 mb-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Justification
                      </div>
                      <p className="text-sm leading-relaxed">{data.justification}</p>
                    </div>
                  )}
                  
                  {data.objectives && (
                    <div>
                      <div className="text-xs font-medium text-slate-500 mb-1 flex items-center gap-1">
                        <Target className="w-3 h-3" />
                        Objectifs
                      </div>
                      <p className="text-sm leading-relaxed whitespace-pre-line">{data.objectives}</p>
                    </div>
                  )}
                  
                  {data.beneficiaries && (
                    <div>
                      <div className="text-xs font-medium text-slate-500 mb-1 flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        Bénéficiaires
                      </div>
                      <p className="text-sm leading-relaxed">{data.beneficiaries}</p>
                    </div>
                  )}
                  
                  {data.urgencyReason && data.priority === 'urgent' && (
                    <div className="p-3 rounded-xl bg-rose-500/5 border border-rose-500/20">
                      <div className="text-xs font-medium text-rose-600 dark:text-rose-400 mb-1 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Raison de l&apos;urgence
                      </div>
                      <p className="text-sm leading-relaxed">{data.urgencyReason}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ============================================ */}
            {/* Budget */}
            {/* ============================================ */}
            <div className="rounded-2xl border border-slate-200/70 bg-white/80 dark:border-slate-800 dark:bg-[#1f1f1f]/70 overflow-hidden">
              <button 
                className="w-full p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/30"
                onClick={() => toggleSection('budget')}
              >
                <h3 className="font-semibold flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-emerald-500" />
                  Budget
                  {budgetUsage !== null && (
                    <span className={cn(
                      "text-xs px-2 py-0.5 rounded-full",
                      budgetCritical ? "bg-rose-500/20 text-rose-500" : 
                      budgetWarning ? "bg-amber-500/20 text-amber-500" : 
                      "bg-emerald-500/20 text-emerald-500"
                    )}>
                      {budgetUsage.toFixed(1)}% {budgetCritical ? '⚠️' : budgetWarning ? '⚠' : ''}
                    </span>
                  )}
                </h3>
                {expandedSections.has('budget') ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              
              {expandedSections.has('budget') && (
                <div className="px-4 pb-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/50">
                      <div className="text-xs text-slate-500 mb-1">Montant demandé</div>
                      <div className="font-semibold font-mono">{formatCurrency(data.amount)}</div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/50">
                      <div className="text-xs text-slate-500 mb-1">Budget disponible</div>
                      <div className="font-semibold font-mono">{formatCurrency(data.budget.available)}</div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/50">
                      <div className="text-xs text-slate-500 mb-1">Code budgétaire</div>
                      <div className="font-mono text-sm">{data.budget.code ?? '—'}</div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/50">
                      <div className="text-xs text-slate-500 mb-1">Ligne budgétaire</div>
                      <div className="text-sm">{data.budget.line ?? '—'}</div>
                    </div>
                  </div>
                  
                  {budgetUsage !== null && (
                    <div className="mt-3 space-y-2" data-testid="budget-usage">
                      <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            "h-full rounded-full transition-all",
                            budgetCritical ? "bg-rose-500" : 
                            budgetWarning ? "bg-amber-500" : 
                            "bg-emerald-500"
                          )}
                          style={{ width: `${Math.min(100, budgetUsage)}%` }}
                        />
                      </div>
                      {budgetMetrics && (
                        <div className="flex justify-between text-xs text-slate-500">
                          <span>Utilisé: {budgetUsage.toFixed(1)}%</span>
                          {budgetRemaining !== null && (
                            <span>Restant: {budgetRemaining.toLocaleString()} FCFA</span>
                          )}
                        </div>
                      )}
                      {budgetCritical && (
                        <div className="text-xs text-rose-500 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Budget critique
                        </div>
                      )}
                      {budgetWarning && !budgetCritical && (
                        <div className="text-xs text-amber-500 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Budget en alerte
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ============================================ */}
            {/* Dates clés */}
            {/* ============================================ */}
            <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 dark:border-slate-800 dark:bg-[#1f1f1f]/70">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <CalendarClock className="w-4 h-4 text-purple-500" />
                Dates clés
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/50">
                  <div className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Date demande
                  </div>
                  <div className="font-semibold text-sm">{formatDate(data.createdAt)}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/50">
                  <div className="text-xs text-slate-500 mb-1">Date souhaitée</div>
                  <div className="font-semibold text-sm">{formatDate(data.expectedDate)}</div>
                </div>
                <div className={cn(
                  "p-3 rounded-xl",
                  data.deadline && new Date(data.deadline) < new Date() ? "bg-rose-500/10" : "bg-slate-100 dark:bg-slate-800/50"
                )}>
                  <div className="text-xs text-slate-500 mb-1">Date limite</div>
                  <div className={cn(
                    "font-semibold text-sm",
                    data.deadline && new Date(data.deadline) < new Date() && "text-rose-500"
                  )}>
                    {formatDate(data.deadline)}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/50">
                  <div className="text-xs text-slate-500 mb-1">Assignée à</div>
                  <div className="font-semibold text-sm">{data.assignedToName ?? '—'}</div>
                </div>
              </div>
            </div>

            {/* ============================================ */}
            {/* Documents */}
            {/* ============================================ */}
            {data.documents.length > 0 && (
              <div className="rounded-2xl border border-slate-200/70 bg-white/80 dark:border-slate-800 dark:bg-[#1f1f1f]/70 overflow-hidden">
                <button 
                  className="w-full p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/30"
                  onClick={() => toggleSection('documents')}
                >
                  <h3 className="font-semibold flex items-center gap-2">
                    <Paperclip className="w-4 h-4 text-slate-500" />
                    Documents joints
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700">
                      {data.documents.length}
                    </span>
                  </h3>
                  {expandedSections.has('documents') ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                
                {expandedSections.has('documents') && (
                  <div className="px-4 pb-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {data.documents.map((doc, idx) => (
                        <div 
                          key={idx}
                          className="flex items-center gap-3 p-3 rounded-xl border border-slate-200/70 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30 cursor-pointer"
                        >
                          <span className="text-2xl">{DOC_ICONS[doc.type] ?? DOC_ICONS.default}</span>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate">{doc.name}</div>
                            {doc.size && <div className="text-xs text-slate-500">{doc.size}</div>}
                          </div>
                          <ExternalLink className="w-4 h-4 text-slate-400" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ============================================ */}
            {/* Recommandation */}
            {/* ============================================ */}
            {data.recommendation && (
              <div className={cn(
                "rounded-2xl border p-4",
                data.recommendation.toLowerCase().includes('favorable') 
                  ? "border-emerald-500/30 bg-emerald-500/5" 
                  : data.recommendation.toLowerCase().includes('rejet')
                    ? "border-rose-500/30 bg-rose-500/5"
                    : "border-amber-500/30 bg-amber-500/5"
              )}>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  {data.recommendation.toLowerCase().includes('favorable') ? (
                    <ThumbsUp className="w-4 h-4 text-emerald-500" />
                  ) : data.recommendation.toLowerCase().includes('rejet') ? (
                    <ThumbsDown className="w-4 h-4 text-rose-500" />
                  ) : (
                    <FileWarning className="w-4 h-4 text-amber-500" />
                  )}
                  Avis / Recommandation
                </h3>
                <p className="text-sm leading-relaxed">{data.recommendation}</p>
              </div>
            )}

            {/* ============================================ */}
            {/* Risques - ✅ Utilise les risques évalués par le service */}
            {/* ============================================ */}
            {evaluatedRisks && evaluatedRisks.length > 0 && (
              <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 dark:border-slate-800 dark:bg-[#1f1f1f]/70" data-testid="risks-section">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-orange-500" />
                  Risques identifiés
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700">
                    {evaluatedRisks.length}
                  </span>
                </h3>
                <div className="space-y-2">
                  {evaluatedRisks.map((risk) => (
                    <div key={risk.id} className={cn("p-3 rounded-xl border", getRiskColor(risk.score))}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium capitalize">{risk.type}</span>
                        <span className="text-xs font-mono">
                          Score: {risk.score}/100
                        </span>
                      </div>
                      <p className="text-sm opacity-80">{risk.description}</p>
                      {risk.mitigation && (
                        <p className="text-sm opacity-80 mt-1">
                          <strong>Mitigation:</strong> {risk.mitigation}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ============================================ */}
      {/* Panneau latéral */}
      {/* ============================================ */}
      <div className="space-y-4">
        {/* Parties prenantes */}
        {data?.stakeholders && data.stakeholders.length > 0 && (
          <div className="rounded-2xl border border-slate-200/70 bg-white/80 dark:border-slate-800 dark:bg-[#1f1f1f]/70 overflow-hidden">
            <div className="p-4 border-b border-slate-200/70 dark:border-slate-800">
              <h3 className="font-semibold flex items-center gap-2">
                <Users className="w-4 h-4" />
                Parties prenantes
              </h3>
            </div>
            <div className="p-4 space-y-2">
              {data.stakeholders.map((s) => (
                <div key={s.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/30">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold",
                    s.required ? "bg-blue-500/20 text-blue-500" : "bg-slate-200 dark:bg-slate-700 text-slate-500"
                  )}>
                    {s.personName.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{s.personName}</div>
                    <div className="text-xs text-slate-500">{ROLE_LABELS[s.role] ?? s.role}</div>
                  </div>
                  {s.required && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-500">Requis</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Journal d'audit */}
        <div className="rounded-2xl border border-slate-200/70 bg-white/80 dark:border-slate-800 dark:bg-[#1f1f1f]/70 overflow-hidden">
          <div className="p-4 border-b border-slate-200/70 dark:border-slate-800">
            <h3 className="font-semibold flex items-center gap-2">
              <History className="w-4 h-4" />
              Journal d&apos;audit
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {data?.audit?.length ?? 0} événement{(data?.audit?.length ?? 0) > 1 ? 's' : ''}
            </p>
          </div>

          <div className="max-h-[400px] overflow-auto p-4 space-y-3">
            {!data?.audit?.length && (
              <div className="text-center text-slate-500 py-8">
                <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
                Aucun événement.
              </div>
            )}
            
            {data?.audit?.map((e, idx) => {
              const Icon = ACTION_ICONS[e.type] ?? FileText;
              const isFirst = idx === 0;
              
              return (
                <div 
                  key={e.id} 
                  className={cn(
                    "relative pl-6 pb-3",
                    idx < (data.audit.length - 1) && "border-l-2 border-slate-200 dark:border-slate-700"
                  )}
                >
                  <div className={cn(
                    "absolute left-0 -translate-x-1/2 w-3 h-3 rounded-full",
                    isFirst ? "bg-blue-500" : "bg-slate-300 dark:bg-slate-600"
                  )} />
                  
                  <div className="rounded-xl border border-slate-200/70 p-3 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-slate-500" />
                        <span className="text-sm font-semibold capitalize">{e.type.replace(/_/g, ' ')}</span>
                      </div>
                      <span className="text-xs text-slate-400">
                        {new Date(e.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-300">
                      <span className="font-medium">{e.actorName}</span>
                      {e.message && <span className="text-slate-500"> — {e.message}</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ============================================ */}
      {/* Modales */}
      {/* ============================================ */}
      
      {/* Modale complément */}
      <FluentModal
        open={complementOpen}
        title={`Demander un complément — ${demandId}`}
        onClose={() => setComplementOpen(false)}
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-500">
            Précisez les informations ou documents manquants pour traiter cette demande.
          </p>
          
          <textarea
            className="w-full min-h-[150px] rounded-xl border border-slate-200/70 bg-white/90 p-3 outline-none
                       focus:ring-2 focus:ring-blue-500/30 dark:border-slate-800 dark:bg-[#141414]/70 dark:text-white"
            placeholder="Ex: Veuillez fournir le devis détaillé et l'accord du directeur..."
            value={complementText}
            onChange={(e) => setComplementText(e.target.value)}
          />
          
          <div className="flex items-center justify-end gap-2">
            <button 
              className="px-4 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60" 
              onClick={() => {
                setComplementOpen(false);
                setComplementText('');
              }}
            >
              Annuler
            </button>
            <button
              className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
              disabled={complementText.trim().length < 10 || actionLoading}
              onClick={async () => {
                await action('request_complement', { message: complementText });
                setComplementOpen(false);
                setComplementText('');
              }}
            >
              {actionLoading ? 'Envoi...' : 'Envoyer la demande'}
            </button>
          </div>
        </div>
      </FluentModal>

      {/* Modale affectation */}
      <FluentModal
        open={assignOpen}
        title={`Affecter la demande — ${demandId}`}
        onClose={() => setAssignOpen(false)}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Sélectionner un agent</label>
            <div className="space-y-2 max-h-[300px] overflow-auto">
              {EMPLOYEES.map((emp) => (
                <button
                  key={emp.id}
                  onClick={() => setSelectedEmployee(emp.id)}
                  className={cn(
                    "w-full text-left p-3 rounded-xl border transition-colors",
                    selectedEmployee === emp.id
                      ? "border-blue-500 bg-blue-500/10 dark:bg-blue-500/20"
                      : "border-slate-200/70 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/60"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                      <User className="w-5 h-5 text-slate-500" />
                    </div>
                    <div>
                      <div className="font-semibold">{emp.name}</div>
                      <div className="text-sm text-slate-500">{emp.role}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Instructions (optionnel)</label>
            <textarea
              className="w-full min-h-[80px] rounded-xl border border-slate-200/70 bg-white/90 p-3 outline-none
                         focus:ring-2 focus:ring-blue-500/30 dark:border-slate-800 dark:bg-[#141414]/70 dark:text-white"
              placeholder="Instructions particulières pour l'agent..."
              value={assignNote}
              onChange={(e) => setAssignNote(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button 
              className="px-4 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60" 
              onClick={() => {
                setAssignOpen(false);
                setSelectedEmployee('');
                setAssignNote('');
              }}
            >
              Annuler
            </button>
            <button
              className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
              disabled={!selectedEmployee || actionLoading}
              onClick={handleAssign}
            >
              {actionLoading ? 'Affectation...' : `Affecter à ${EMPLOYEES.find(e => e.id === selectedEmployee)?.name ?? '...'}`}
            </button>
          </div>
        </div>
      </FluentModal>

      {/* Modale confirmation */}
      <FluentModal
        open={confirmAction !== null}
        title={confirmAction === 'validate' ? 'Confirmer la validation' : 'Confirmer le rejet'}
        onClose={() => {
          setConfirmAction(null);
          setRejectReason('');
        }}
      >
        <div className="space-y-4">
          {confirmAction === 'validate' ? (
            <>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                <div>
                  <div className="font-semibold text-emerald-700 dark:text-emerald-400">Validation de la demande</div>
                  <div className="text-sm text-emerald-600 dark:text-emerald-300">
                    Cette action est définitive.
                  </div>
                </div>
              </div>
              <p className="text-sm">
                Voulez-vous valider la demande <strong>{demandId}</strong> ?
              </p>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <XCircle className="w-8 h-8 text-rose-500" />
                <div>
                  <div className="font-semibold text-rose-700 dark:text-rose-400">Rejet de la demande</div>
                  <div className="text-sm text-rose-600 dark:text-rose-300">
                    Un motif doit être fourni.
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Motif du rejet *</label>
                <textarea
                  className="w-full min-h-[100px] rounded-xl border border-slate-200/70 bg-white/90 p-3 outline-none
                             focus:ring-2 focus:ring-rose-500/30 dark:border-slate-800 dark:bg-[#141414]/70 dark:text-white"
                  placeholder="Expliquez le motif du rejet..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                />
              </div>
            </>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button 
              className="px-4 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60" 
              onClick={() => {
                setConfirmAction(null);
                setRejectReason('');
              }}
            >
              Annuler
            </button>
            <button
              className={cn(
                "px-4 py-2 rounded-xl text-white disabled:opacity-50",
                confirmAction === 'validate' ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700"
              )}
              disabled={actionLoading || (confirmAction === 'reject' && rejectReason.trim().length < 10)}
              onClick={handleConfirmAction}
            >
              {actionLoading ? 'Traitement...' : confirmAction === 'validate' ? 'Confirmer' : 'Rejeter'}
            </button>
          </div>
        </div>
      </FluentModal>
    </div>
  );
}
