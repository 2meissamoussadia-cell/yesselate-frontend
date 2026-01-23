'use client';

import React, { useMemo, useState, useCallback } from 'react';
import { useValidationContratsWorkspaceStore } from '@/lib/stores/validationContratsWorkspaceStore';
import { useContratToast } from '../ContratToast';
import { contractsToSign, employees, raciMatrix } from '@/lib/data';
import { FluentButton } from '@/components/ui/fluent-button';
import { FluentTabs, FluentTabsTrigger, FluentTabsContent } from '@/components/ui/fluent-tabs';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

import {
  FileText,
  Building2,
  User,
  Calendar,
  Clock,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Shield,
  Signature,
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  History,
  Paperclip,
  MessageSquare,
  Scale,
  Send,
  RefreshCw,
  Download,
  Printer,
  Share2,
  MoreVertical,
  Hash,
  Eye,
  Lock,
  Unlock,
  X,
  Check,
  AlertCircle,
  Info,
} from 'lucide-react';

// ================================
// Utils
// ================================
const parseMoney = (v: unknown): number => {
  if (typeof v === 'number') return Number.isFinite(v) ? v : 0;
  const raw = String(v ?? '').replace(/\s/g, '').replace(/FCFA|XOF/gi, '').replace(/[^\d,.-]/g, '');
  return Number(raw.replace(/,/g, '')) || 0;
};

const formatFCFA = (v: unknown): string => {
  const n = parseMoney(v);
  return `${n.toLocaleString('fr-FR')} FCFA`;
};

const parseFRDate = (d?: string | null): Date | null => {
  if (!d || d === '—') return null;
  const parts = d.split('/');
  if (parts.length !== 3) return null;
  const [dd, mm, yy] = parts.map((x) => Number(x));
  if (!dd || !mm || !yy) return null;
  return new Date(yy, mm - 1, dd, 0, 0, 0, 0);
};

const getDaysToExpiry = (expiryStr: string): number | null => {
  const expiryDate = parseFRDate(expiryStr);
  if (!expiryDate) return null;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

// Hash simulation
const sha256Short = (input: string): string => {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const chr = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0;
  }
  return `SHA256:${Math.abs(hash).toString(16).padStart(8, '0').toUpperCase()}...`;
};

// ================================
// Types
// ================================
type DetailTab = 'overview' | 'workflow' | 'documents' | 'history' | 'notes';
type WorkflowStep = 'draft' | 'review' | 'bj' | 'bmo' | 'signed';

interface WorkflowAction {
  step: WorkflowStep;
  actor: string;
  actorRole: string;
  date: string;
  action: string;
  hash?: string;
  note?: string;
}

// ================================
// Component
// ================================
export function ContratDetailView({ contractId, tabId }: { contractId: string; tabId: string }) {
  const { openTab, goBack, canGoBack, updateTab } = useValidationContratsWorkspaceStore();
  const toast = useContratToast();

  // État local
  const [activeTab, setActiveTab] = useState<DetailTab>('overview');
  const [bjApproved, setBjApproved] = useState(false);
  const [bmoSigned, setBmoSigned] = useState(false);
  const [workflowHistory, setWorkflowHistory] = useState<WorkflowAction[]>([]);
  const [noteText, setNoteText] = useState('');

  // Trouver le contrat
  const contract = useMemo(() => {
    return contractsToSign.find((c) => c.id === contractId) ?? null;
  }, [contractId]);

  // Données enrichies
  const enriched = useMemo(() => {
    if (!contract) return null;
    const amountValue = parseMoney((contract as any).amount);
    const daysToExpiry = (contract as any).expiry ? getDaysToExpiry((contract as any).expiry) : null;
    
    // Risk calculation
    let riskScore = 0;
    const riskSignals: string[] = [];
    
    if (daysToExpiry !== null) {
      if (daysToExpiry < 0) { riskScore += 35; riskSignals.push('Contrat expiré'); }
      else if (daysToExpiry <= 3) { riskScore += 25; riskSignals.push('Échéance ≤ 3 jours'); }
      else if (daysToExpiry <= 7) { riskScore += 15; riskSignals.push('Échéance ≤ 7 jours'); }
    }
    
    if (amountValue >= 50_000_000) { riskScore += 22; riskSignals.push('Montant très élevé'); }
    else if (amountValue >= 10_000_000) { riskScore += 14; riskSignals.push('Montant élevé'); }
    
    if (!bjApproved) { riskScore += 20; riskSignals.push('Validation BJ manquante'); }
    if (!bmoSigned && bjApproved) { riskScore += 15; riskSignals.push('Signature BMO en attente'); }
    
    return {
      ...contract,
      amountValue,
      daysToExpiry,
      riskScore: Math.min(100, riskScore),
      riskSignals,
      currentStep: bmoSigned ? 'signed' : bjApproved ? 'bmo' : 'bj' as WorkflowStep,
    };
  }, [contract, bjApproved, bmoSigned]);

  // Référent BJ
  const bjReferent = useMemo(() => {
    return employees.find((e: any) => e.bureau === 'BJ' && String(e.role || '').toLowerCase().includes('juriste'));
  }, []);

  // Actions workflow
  const handleApproveBJ = useCallback(() => {
    const ts = new Date().toISOString();
    const hash = sha256Short(`BJ_APPROVAL|${contractId}|${ts}`);
    
    setBjApproved(true);
    setWorkflowHistory((prev) => [...prev, {
      step: 'bj',
      actor: bjReferent?.name || 'N. FAYE',
      actorRole: 'Juriste Senior - BJ',
      date: ts,
      action: 'Validation juridique approuvée',
      hash,
    }]);
    
    toast.validation('Validation BJ enregistrée', hash, contractId);
  }, [contractId, bjReferent, toast]);

  const handleSignBMO = useCallback(() => {
    if (!bjApproved) {
      toast.warning('Double contrôle requis', 'La validation BJ est obligatoire avant signature');
      return;
    }
    
    const ts = new Date().toISOString();
    const hash = sha256Short(`BMO_SIGNATURE|${contractId}|${ts}`);
    
    setBmoSigned(true);
    setWorkflowHistory((prev) => [...prev, {
      step: 'bmo',
      actor: 'A. DIALLO',
      actorRole: 'Directeur Général - BMO',
      date: ts,
      action: 'Signature Direction enregistrée',
      hash,
    }]);
    
    updateTab(tabId, { title: `${contractId} ✓`, icon: '✅' });
    toast.signature('Contrat signé', hash, contractId);
  }, [contractId, bjApproved, toast, updateTab, tabId]);

  const handleSendToBJ = useCallback(() => {
    toast.workflow('Envoyé au Bureau Juridique', 'Demande de validation transmise', contractId);
  }, [contractId, toast]);

  const handleRequestArbitrage = useCallback(() => {
    openTab({
      id: `arbitrage:${contractId}`,
      type: 'wizard',
      title: `Arbitrage ${contractId}`,
      icon: '⚖️',
      data: { action: 'arbitrage', contractId },
    });
  }, [contractId, openTab]);

  const handleAddNote = useCallback(() => {
    if (!noteText.trim()) return;
    
    setWorkflowHistory((prev) => [...prev, {
      step: enriched?.currentStep || 'bj',
      actor: 'Vous',
      actorRole: 'Direction',
      date: new Date().toISOString(),
      action: 'Note ajoutée',
      note: noteText,
    }]);
    
    setNoteText('');
    toast.info('Note ajoutée', 'Commentaire enregistré dans l\'historique');
  }, [noteText, enriched, toast]);

  if (!contract || !enriched) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <AlertCircle className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-4" />
        <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">
          Contrat introuvable
        </h3>
        <p className="text-sm text-slate-500 mt-2">
          ID: {contractId}
        </p>
        <FluentButton
          className="mt-4"
          variant="secondary"
          onClick={() => goBack()}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Retour
        </FluentButton>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <FluentButton
            variant="secondary"
            size="sm"
            onClick={() => goBack()}
            disabled={!canGoBack()}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Retour
          </FluentButton>
          
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {contract.id}
              </h1>
              <span className={cn(
                'px-2 py-0.5 rounded-lg text-xs font-semibold',
                (contract as any).type === 'Marché' && 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
                (contract as any).type === 'Avenant' && 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300',
                (contract as any).type === 'Sous-traitance' && 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/50 dark:text-cyan-300',
              )}>
                {(contract as any).type}
              </span>
              <span className={cn(
                'px-2 py-0.5 rounded-lg text-xs font-semibold',
                bmoSigned && 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
                !bmoSigned && bjApproved && 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300',
                !bjApproved && 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
              )}>
                {bmoSigned ? '✅ Signé' : bjApproved ? '⏳ Signature BMO' : '🔐 Validation BJ'}
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">{contract.subject}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <FluentButton variant="secondary" size="sm">
            <Printer className="w-4 h-4" />
          </FluentButton>
          <FluentButton variant="secondary" size="sm">
            <Download className="w-4 h-4" />
          </FluentButton>
          <FluentButton variant="secondary" size="sm">
            <Share2 className="w-4 h-4" />
          </FluentButton>
        </div>
      </div>

      {/* Alertes */}
      {enriched.riskScore >= 70 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl border border-rose-200/70 bg-rose-50/80 dark:border-rose-700/50 dark:bg-rose-900/30 flex items-center gap-3"
        >
          <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-none" />
          <div className="flex-1">
            <p className="font-semibold text-rose-800 dark:text-rose-200">Risque élevé détecté</p>
            <p className="text-sm text-rose-700 dark:text-rose-300">{enriched.riskSignals.join(' • ')}</p>
          </div>
          <FluentButton variant="warning" size="sm" onClick={handleRequestArbitrage}>
            <Scale className="w-4 h-4 mr-2" />
            Demander arbitrage
          </FluentButton>
        </motion.div>
      )}

      {/* Workflow Progress */}
      <div className="p-4 rounded-2xl border border-slate-200/70 bg-white/80 dark:border-slate-700 dark:bg-slate-900/50">
        <h3 className="font-semibold text-sm text-slate-500 uppercase tracking-wider mb-4">
          Progression du workflow
        </h3>
        <div className="flex items-center justify-between">
          {[
            { id: 'draft', label: 'Préparation', icon: FileText },
            { id: 'review', label: 'Révision', icon: Eye },
            { id: 'bj', label: 'Validation BJ', icon: Shield },
            { id: 'bmo', label: 'Signature BMO', icon: Signature },
            { id: 'signed', label: 'Signé', icon: CheckCircle2 },
          ].map((step, index, arr) => {
            const Icon = step.icon;
            const isCurrent = enriched.currentStep === step.id;
            const isPast = 
              (step.id === 'draft' || step.id === 'review') ||
              (step.id === 'bj' && bjApproved) ||
              (step.id === 'bmo' && bmoSigned);
            
            return (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center">
                  <div className={cn(
                    'w-12 h-12 rounded-full flex items-center justify-center transition-colors',
                    isPast && 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
                    isCurrent && !isPast && 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300 ring-2 ring-purple-500 ring-offset-2',
                    !isPast && !isCurrent && 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500',
                  )}>
                    {isPast && step.id !== enriched.currentStep ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  <span className={cn(
                    'text-xs font-medium mt-2',
                    isCurrent ? 'text-purple-700 dark:text-purple-300' : 'text-slate-500',
                  )}>
                    {step.label}
                  </span>
                </div>
                {index < arr.length - 1 && (
                  <div className={cn(
                    'flex-1 h-1 mx-2 rounded-full',
                    isPast ? 'bg-emerald-300 dark:bg-emerald-700' : 'bg-slate-200 dark:bg-slate-700',
                  )} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Tabs de détail */}
      <div className="flex items-center gap-1 border-b border-slate-200/70 dark:border-slate-700/70">
        {[
          { id: 'overview' as DetailTab, label: 'Aperçu', icon: Eye },
          { id: 'workflow' as DetailTab, label: 'Actions', icon: Signature },
          { id: 'documents' as DetailTab, label: 'Documents', icon: Paperclip },
          { id: 'history' as DetailTab, label: 'Historique', icon: History },
          { id: 'notes' as DetailTab, label: 'Notes', icon: MessageSquare },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors',
                activeTab === tab.id
                  ? 'border-purple-500 text-purple-700 dark:text-purple-300'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              )}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.15 }}
        >
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Informations principales */}
              <div className="p-6 rounded-2xl border border-slate-200/70 bg-white/80 dark:border-slate-700 dark:bg-slate-900/50 space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <FileText className="w-5 h-5 text-slate-400" />
                  Informations contrat
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Partenaire</div>
                    <div className="font-medium flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-slate-400" />
                      {(contract as any).partner || '—'}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Bureau émetteur</div>
                    <div className="font-medium">{(contract as any).bureau || '—'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Préparé par</div>
                    <div className="font-medium flex items-center gap-2">
                      <User className="w-4 h-4 text-slate-400" />
                      {(contract as any).preparedBy || '—'}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Date création</div>
                    <div className="font-medium flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      {(contract as any).date || '—'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Montant et échéance */}
              <div className="p-6 rounded-2xl border border-slate-200/70 bg-white/80 dark:border-slate-700 dark:bg-slate-900/50 space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-slate-400" />
                  Montant & Échéance
                </h3>
                
                <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                  {formatFCFA(enriched.amountValue)}
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="text-xs text-slate-500 mb-1">Date d'expiration</div>
                    <div className="font-medium">{(contract as any).expiry || '—'}</div>
                  </div>
                  {enriched.daysToExpiry !== null && (
                    <div className={cn(
                      'px-4 py-2 rounded-xl text-center',
                      enriched.daysToExpiry < 0 && 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300',
                      enriched.daysToExpiry >= 0 && enriched.daysToExpiry <= 7 && 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
                      enriched.daysToExpiry > 7 && 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
                    )}>
                      <div className="text-2xl font-bold">
                        {enriched.daysToExpiry < 0 ? 'Expiré' : `J-${enriched.daysToExpiry}`}
                      </div>
                      <div className="text-xs">
                        {enriched.daysToExpiry < 0 ? 'Dépassé' : 'Avant expiration'}
                      </div>
                    </div>
                  )}
                </div>

                {/* Score de risque */}
                <div className="pt-4 border-t border-slate-200/50 dark:border-slate-700/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-500">Score de risque</span>
                    <span className={cn(
                      'text-sm font-bold',
                      enriched.riskScore >= 70 && 'text-rose-600 dark:text-rose-400',
                      enriched.riskScore >= 40 && enriched.riskScore < 70 && 'text-amber-600 dark:text-amber-400',
                      enriched.riskScore < 40 && 'text-emerald-600 dark:text-emerald-400',
                    )}>
                      {enriched.riskScore}/100
                    </span>
                  </div>
                  <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all',
                        enriched.riskScore >= 70 && 'bg-rose-500',
                        enriched.riskScore >= 40 && enriched.riskScore < 70 && 'bg-amber-500',
                        enriched.riskScore < 40 && 'bg-emerald-500',
                      )}
                      style={{ width: `${enriched.riskScore}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'workflow' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Step 1: Validation BJ */}
              <div className={cn(
                'p-6 rounded-2xl border-2 transition-colors',
                bjApproved
                  ? 'border-emerald-300 bg-emerald-50/50 dark:border-emerald-700 dark:bg-emerald-900/20'
                  : 'border-amber-300 bg-amber-50/50 dark:border-amber-700 dark:bg-amber-900/20',
              )}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Shield className={cn(
                      'w-5 h-5',
                      bjApproved ? 'text-emerald-600' : 'text-amber-600',
                    )} />
                    1. Validation Bureau Juridique
                  </h3>
                  {bjApproved ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                  ) : (
                    <Clock className="w-6 h-6 text-amber-500" />
                  )}
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-3 text-sm">
                    <User className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-600 dark:text-slate-400">Référent:</span>
                    <span className="font-medium">{bjReferent?.name || 'N. FAYE'} - Juriste Senior</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Info className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-600 dark:text-slate-400">RACI:</span>
                    <span className="font-medium">BJ = Responsable (R)</span>
                  </div>
                </div>

                {bjApproved ? (
                  <div className="p-3 rounded-lg bg-emerald-100/50 dark:bg-emerald-900/30 text-sm">
                    <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-medium">
                      <Check className="w-4 h-4" />
                      Validation enregistrée
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <FluentButton
                      variant="warning"
                      size="sm"
                      className="flex-1"
                      onClick={handleApproveBJ}
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      Valider BJ
                    </FluentButton>
                    <FluentButton
                      variant="secondary"
                      size="sm"
                      onClick={handleSendToBJ}
                    >
                      <Send className="w-4 h-4" />
                    </FluentButton>
                  </div>
                )}
              </div>

              {/* Step 2: Signature BMO */}
              <div className={cn(
                'p-6 rounded-2xl border-2 transition-colors',
                bmoSigned
                  ? 'border-emerald-300 bg-emerald-50/50 dark:border-emerald-700 dark:bg-emerald-900/20'
                  : bjApproved
                    ? 'border-purple-300 bg-purple-50/50 dark:border-purple-700 dark:bg-purple-900/20'
                    : 'border-slate-300 bg-slate-50/50 dark:border-slate-700 dark:bg-slate-900/20 opacity-60',
              )}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Signature className={cn(
                      'w-5 h-5',
                      bmoSigned ? 'text-emerald-600' : bjApproved ? 'text-purple-600' : 'text-slate-400',
                    )} />
                    2. Signature Direction (BMO)
                  </h3>
                  {bmoSigned ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                  ) : bjApproved ? (
                    <Clock className="w-6 h-6 text-purple-500" />
                  ) : (
                    <Lock className="w-6 h-6 text-slate-400" />
                  )}
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-3 text-sm">
                    <User className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-600 dark:text-slate-400">Signataire:</span>
                    <span className="font-medium">A. DIALLO - Directeur Général</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Info className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-600 dark:text-slate-400">RACI:</span>
                    <span className="font-medium">BMO = Accountable (A)</span>
                  </div>
                  {!bjApproved && (
                    <div className="flex items-center gap-3 text-sm text-amber-600 dark:text-amber-400">
                      <Lock className="w-4 h-4" />
                      <span>Verrouillé: Validation BJ requise</span>
                    </div>
                  )}
                </div>

                {bmoSigned ? (
                  <div className="p-3 rounded-lg bg-emerald-100/50 dark:bg-emerald-900/30 text-sm">
                    <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-medium">
                      <Check className="w-4 h-4" />
                      Signature enregistrée
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <FluentButton
                      variant="primary"
                      size="sm"
                      className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600"
                      onClick={handleSignBMO}
                      disabled={!bjApproved}
                    >
                      <Signature className="w-4 h-4 mr-2" />
                      Signer
                    </FluentButton>
                    <FluentButton
                      variant="warning"
                      size="sm"
                      onClick={handleRequestArbitrage}
                    >
                      <Scale className="w-4 h-4" />
                    </FluentButton>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="p-6 rounded-2xl border border-slate-200/70 bg-white/80 dark:border-slate-700 dark:bg-slate-900/50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Documents attachés</h3>
                <FluentButton variant="secondary" size="sm">
                  <Paperclip className="w-4 h-4 mr-2" />
                  Ajouter
                </FluentButton>
              </div>
              <div className="text-center py-8 text-slate-500">
                <Paperclip className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                <p>Aucun document attaché</p>
                <p className="text-sm mt-1">Cliquez sur "Ajouter" pour joindre des fichiers</p>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="p-6 rounded-2xl border border-slate-200/70 bg-white/80 dark:border-slate-700 dark:bg-slate-900/50">
              <h3 className="font-semibold mb-4">Historique des actions</h3>
              {workflowHistory.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <History className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                  <p>Aucune action enregistrée</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {workflowHistory.map((action, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex-none w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
                        {action.step === 'bj' && <Shield className="w-5 h-5 text-purple-600" />}
                        {action.step === 'bmo' && <Signature className="w-5 h-5 text-purple-600" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{action.action}</span>
                          {action.hash && (
                            <span className="text-xs font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                              {action.hash}
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-slate-500">
                          {action.actor} • {action.actorRole}
                        </div>
                        <div className="text-xs text-slate-400">
                          {new Date(action.date).toLocaleString('fr-FR')}
                        </div>
                        {action.note && (
                          <div className="mt-2 p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-sm">
                            {action.note}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="p-6 rounded-2xl border border-slate-200/70 bg-white/80 dark:border-slate-700 dark:bg-slate-900/50">
              <h3 className="font-semibold mb-4">Ajouter une note</h3>
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Saisissez votre commentaire..."
                className="w-full h-32 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 resize-none focus:ring-2 focus:ring-purple-500/30 outline-none"
              />
              <div className="flex justify-end mt-4">
                <FluentButton variant="primary" onClick={handleAddNote} disabled={!noteText.trim()}>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Ajouter la note
                </FluentButton>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

