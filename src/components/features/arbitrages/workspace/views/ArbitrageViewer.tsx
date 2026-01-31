'use client';

import { useState, useEffect, useCallback } from 'react';
import { useArbitragesWorkspaceStore } from '@/lib/stores/arbitragesWorkspaceStore';
import { FluentButton } from '@/components/ui/fluent-button';
import { FluentModal } from '@/components/ui/fluent-modal';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Scale, AlertTriangle, Clock, CheckCircle, Users, FileText, Calendar,
  TrendingUp, Shield, Hash, RefreshCw, Gavel, CalendarPlus, MessageSquare,
  Download, Eye, ChevronRight, ChevronDown
} from 'lucide-react';

type ArbitrageData = {
  id: string;
  subject: string;
  status: string;
  type?: string;
  _type: 'vivant' | 'simple';
  context?: {
    riskLevel?: string;
    financialExposure?: number;
    backgroundSummary?: string;
    linkedEntity?: {
      type: string;
      label: string;
    };
    previousAttempts?: string[];
  };
  timing?: {
    daysRemaining?: number;
    isOverdue?: boolean;
  };
  deadline?: string;
  impact?: string;
  parties?: any[];
  decisionOptions?: any[];
  documents?: any[];
  decision?: {
    decisionId: string;
    decidedAt: string;
    decidedBy: string;
    motif: string;
    hash: string;
  };
  hash?: string;
  [key: string]: any;
};

type ViewSection = 'contexte' | 'options' | 'parties' | 'documents' | 'timeline';

export function ArbitrageViewer({ arbitrageId, onOpenModal }: { 
  arbitrageId: string;
  onOpenModal?: (modal: string) => void;
}) {
  const [data, setData] = useState<ArbitrageData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<ViewSection>('contexte');
  const [showExplorer, setShowExplorer] = useState(true);

  // Modales d'actions
  const [trancherOpen, setTrancherOpen] = useState(false);
  const [reporterOpen, setReporterOpen] = useState(false);
  const [complementOpen, setComplementOpen] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/arbitrages/${encodeURIComponent(arbitrageId)}`, {
        cache: 'no-store',
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const result = await res.json();
      setData(result);
    } catch (err: any) {
      setError(err.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, [arbitrageId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const formatMoney = (amount?: number) => {
    if (!amount) return '—';
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
  };

  const getRiskColor = (level?: string) => {
    switch (level) {
      case 'critique': return 'bg-red-500/10 text-red-700 border-red-500/30';
      case 'eleve': return 'bg-orange-500/10 text-orange-700 border-orange-500/30';
      case 'modere': return 'bg-amber-500/10 text-amber-700 border-amber-500/30';
      case 'faible': return 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30';
      default: return 'bg-slate-500/10 text-slate-700 border-slate-500/30';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-6 h-6 animate-spin text-slate-400" />
        <span className="ml-2 text-slate-400">Chargement...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
        <h3 className="font-semibold text-lg mb-2">Erreur de chargement</h3>
        <p className="text-sm text-slate-400 mb-4">{error || 'Arbitrage introuvable'}</p>
        <FluentButton onClick={loadData}>Réessayer</FluentButton>
      </div>
    );
  }

  const isVivant = data._type === 'vivant';
  const riskLevel = data.context?.riskLevel || data.impact;
  const isTranche = data.status === 'tranche' || data.status === 'resolved';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
      {/* Explorer gauche */}
      {showExplorer && (
        <div className="lg:col-span-1">
          <div className="rounded-2xl border border-slate-200/70 bg-white/80 dark:border-slate-800 dark:bg-[#1f1f1f]/70 p-4 sticky top-4">
            <h3 className="font-semibold mb-3 text-sm">Sections</h3>
            
            <div className="space-y-1">
              {[
                { id: 'contexte' as ViewSection, label: 'Contexte', icon: FileText },
                { id: 'options' as ViewSection, label: 'Options', icon: TrendingUp },
                { id: 'parties' as ViewSection, label: 'Parties', icon: Users },
                { id: 'documents' as ViewSection, label: 'Documents', icon: FileText },
                { id: 'timeline' as ViewSection, label: 'Timeline', icon: Clock },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveSection(id)}
                  className={cn(
                    'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors',
                    activeSection === id
                      ? 'bg-blue-500/10 text-blue-700 dark:text-blue-300 font-medium'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>

            {!isTranche && (
              <>
                <div className="my-4 border-t border-slate-200 dark:border-slate-800" />
                
                <h3 className="font-semibold mb-3 text-sm">Actions rapides</h3>
                <div className="space-y-2">
                  <FluentButton
                    size="sm"
                    variant="success"
                    className="w-full"
                    onClick={() => setTrancherOpen(true)}
                  >
                    <Gavel className="w-3.5 h-3.5" />
                    Trancher
                  </FluentButton>
                  <FluentButton
                    size="sm"
                    variant="warning"
                    className="w-full"
                    onClick={() => setReporterOpen(true)}
                  >
                    <CalendarPlus className="w-3.5 h-3.5" />
                    Reporter
                  </FluentButton>
                  <FluentButton
                    size="sm"
                    variant="secondary"
                    className="w-full"
                    onClick={() => setComplementOpen(true)}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    Complément
                  </FluentButton>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Contenu principal */}
      <div className={cn(showExplorer ? 'lg:col-span-3' : 'lg:col-span-4')}>
        <div className="space-y-4">
          {/* Header */}
          <div className={cn(
            'rounded-2xl border p-6',
            getRiskColor(riskLevel)
          )}>
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <span className="font-mono text-xs text-purple-600 dark:text-purple-400">
                    {data.id}
                  </span>
                  <Badge variant={isTranche ? 'success' : 'warning'}>
                    {data.status}
                  </Badge>
                  {riskLevel && (
                    <Badge variant={riskLevel === 'critique' ? 'urgent' : 'warning'}>
                      {riskLevel}
                    </Badge>
                  )}
                  {isVivant && data.timing?.isOverdue && (
                    <Badge variant="urgent">En retard</Badge>
                  )}
                </div>

                <h2 className="text-2xl font-bold mb-2">{data.subject}</h2>

                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-300">
                  {isVivant && data.context?.linkedEntity && (
                    <span className="flex items-center gap-1">
                      🔗 {data.context.linkedEntity.type}: {data.context.linkedEntity.label}
                    </span>
                  )}
                  {isVivant && data.context?.financialExposure && (
                    <span className="flex items-center gap-1 font-semibold text-amber-600">
                      💰 {formatMoney(data.context.financialExposure)}
                    </span>
                  )}
                  {data.parties && (
                    <span>👥 {data.parties.length} partie{data.parties.length > 1 ? 's' : ''}</span>
                  )}
                </div>
              </div>

              {isVivant && data.timing && !isTranche && (
                <div className={cn(
                  'text-center px-4 py-3 rounded-xl',
                  data.timing.isOverdue
                    ? 'bg-red-500/20 border border-red-500/30'
                    : 'bg-slate-100 dark:bg-slate-800'
                )}>
                  <div className={cn(
                    'text-3xl font-bold',
                    data.timing.isOverdue ? 'text-red-600' : 'text-amber-600'
                  )}>
                    {data.timing.isOverdue ? '⏰' : data.timing.daysRemaining}
                  </div>
                  <div className="text-xs text-slate-400">
                    {data.timing.isOverdue ? 'En retard' : 'jour(s)'}
                  </div>
                </div>
              )}
            </div>

            {data.decision && (
              <div className="mt-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  <span className="font-semibold text-emerald-700 dark:text-emerald-300">
                    Décision prise le {new Date(data.decision.decidedAt).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                <p className="text-sm mb-2">{data.decision.motif}</p>
                <div className="text-xs text-slate-400">
                  Par {data.decision.decidedBy} • {data.decision.decisionId}
                </div>
              </div>
            )}
          </div>

          {/* Sections */}
          <div className="rounded-2xl border border-slate-200/70 bg-white/80 dark:border-slate-800 dark:bg-[#1f1f1f]/70 p-6">
            {activeSection === 'contexte' && (
              <ContexteSection data={data} formatMoney={formatMoney} />
            )}
            {activeSection === 'options' && (
              <OptionsSection data={data} onSelectOption={(id) => {
                setTrancherOpen(true);
              }} />
            )}
            {activeSection === 'parties' && (
              <PartiesSection data={data} />
            )}
            {activeSection === 'documents' && (
              <DocumentsSection data={data} />
            )}
            {activeSection === 'timeline' && (
              <TimelineSection arbitrageId={data.id} />
            )}
          </div>

          {/* Hash */}
          {data.hash && (
            <div className="rounded-xl border border-purple-500/30 bg-purple-500/5 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Hash className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">
                  Hash arbitrage (SHA3-256)
                </span>
              </div>
              <code className="text-xs font-mono break-all text-slate-600 dark:text-slate-400">
                {data.hash}
              </code>
            </div>
          )}
        </div>
      </div>

      {/* Modales */}
      <TrancherModal
        open={trancherOpen}
        onClose={() => setTrancherOpen(false)}
        arbitrageId={data.id}
        options={data.decisionOptions}
        onSuccess={loadData}
      />
      <ReporterModal
        open={reporterOpen}
        onClose={() => setReporterOpen(false)}
        arbitrageId={data.id}
        onSuccess={loadData}
      />
      <ComplementModal
        open={complementOpen}
        onClose={() => setComplementOpen(false)}
        arbitrageId={data.id}
        onSuccess={loadData}
      />
    </div>
  );
}

// Sections
function ContexteSection({ data, formatMoney }: { data: ArbitrageData; formatMoney: (n?: number) => string }) {
  const isVivant = data._type === 'vivant';

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Contexte</h3>

      {isVivant && data.context?.backgroundSummary && (
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900">
          <p className="text-sm text-slate-700 dark:text-slate-300">
            {data.context.backgroundSummary}
          </p>
        </div>
      )}

      {data.description && (
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900">
          <p className="text-sm text-slate-700 dark:text-slate-300">
            {data.description}
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {data.context?.riskLevel && (
          <div>
            <div className="text-xs text-slate-400 mb-1">Niveau de risque</div>
            <Badge variant={data.context.riskLevel === 'critique' ? 'urgent' : 'warning'}>
              {data.context.riskLevel}
            </Badge>
          </div>
        )}
        {data.context?.financialExposure && (
          <div>
            <div className="text-xs text-slate-400 mb-1">Exposition financière</div>
            <div className="font-semibold text-amber-600">
              {formatMoney(data.context.financialExposure)}
            </div>
          </div>
        )}
      </div>

      {data.context?.previousAttempts && data.context.previousAttempts.length > 0 && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200/50 dark:border-rose-800/50">
          <div className="text-sm font-semibold text-rose-700 dark:text-rose-300 mb-2">
            Tentatives précédentes échouées
          </div>
          <div className="space-y-1">
            {data.context.previousAttempts.map((attempt, idx) => (
              <div key={idx} className="text-sm text-rose-600 dark:text-rose-400">
                ✗ {attempt}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function OptionsSection({ data, onSelectOption }: { data: ArbitrageData; onSelectOption: (id: string) => void }) {
  if (!data.decisionOptions || data.decisionOptions.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400">
        Aucune option disponible
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Options de décision</h3>

      {data.decisionOptions.map((option: any) => (
        <div
          key={option.id}
          className={cn(
            'p-4 rounded-xl border transition-all',
            option.suggestedBy === 'ia'
              ? 'border-purple-500/30 bg-purple-50/50 dark:bg-purple-900/10'
              : 'border-slate-200/70 bg-slate-50 dark:bg-slate-900 dark:border-slate-800'
          )}
        >
          <div className="flex items-start justify-between gap-4 mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                {option.suggestedBy === 'ia' && (
                  <span className="text-lg" title="Suggérée par l'IA">🤖</span>
                )}
                <h4 className="font-semibold">{option.label}</h4>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {option.description}
              </p>
            </div>
            <Badge variant="default">{option.suggestedBy}</Badge>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-3">
            <div>
              <div className="text-xs font-semibold text-emerald-600 mb-1">Pour</div>
              <ul className="text-sm space-y-1">
                {option.pros?.slice(0, 3).map((pro: string, idx: number) => (
                  <li key={idx} className="text-slate-600 dark:text-slate-400">• {pro}</li>
                ))}
              </ul>
            </div>
            <div>
              <div className="text-xs font-semibold text-rose-600 mb-1">Contre</div>
              <ul className="text-sm space-y-1">
                {option.cons?.slice(0, 3).map((con: string, idx: number) => (
                  <li key={idx} className="text-slate-600 dark:text-slate-400">• {con}</li>
                ))}
              </ul>
            </div>
          </div>

          {data.status !== 'tranche' && data.status !== 'resolved' && (
            <FluentButton
              size="sm"
              variant="primary"
              className="w-full"
              onClick={() => onSelectOption(option.id)}
            >
              Choisir cette option
            </FluentButton>
          )}
        </div>
      ))}
    </div>
  );
}

function PartiesSection({ data }: { data: ArbitrageData }) {
  if (!data.parties || data.parties.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400">
        Aucune partie enregistrée
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Parties prenantes</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {data.parties.map((party: any, idx: number) => (
          <div
            key={idx}
            className="p-4 rounded-xl border border-slate-200/70 bg-slate-50 dark:bg-slate-900 dark:border-slate-800"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="font-semibold">{party.name}</div>
              <Badge variant={party.role === 'decideur' ? 'info' : 'default'}>
                {party.role}
              </Badge>
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              {party.bureau}
            </div>
            {party.position && (
              <div className="mt-2 text-sm italic text-slate-400">
                "{party.position}"
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function DocumentsSection({ data }: { data: ArbitrageData }) {
  if (!data.documents || data.documents.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400">
        Aucun document attaché
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Documents</h3>

      <div className="space-y-2">
        {data.documents.map((doc: any) => (
          <div
            key={doc.id}
            className="flex items-center gap-3 p-3 rounded-xl border border-slate-200/70 bg-slate-50 dark:bg-slate-900 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <FileText className="w-5 h-5 text-blue-500 flex-none" />
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{doc.title}</div>
              <div className="text-xs text-slate-400">
                {doc.type} • {doc.uploadedBy}
              </div>
            </div>
            <Download className="w-4 h-4 text-slate-400" />
          </div>
        ))}
      </div>
    </div>
  );
}

function TimelineSection({ arbitrageId }: { arbitrageId: string }) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Timeline</h3>
      <div className="text-center py-8 text-slate-400">
        Timeline à implémenter (événements, actions, modifications)
      </div>
    </div>
  );
}

// Modales d'actions
function TrancherModal({ open, onClose, arbitrageId, options, onSuccess }: any) {
  const [selectedOption, setSelectedOption] = useState('');
  const [motif, setMotif] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!motif.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/arbitrages/${encodeURIComponent(arbitrageId)}/trancher`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          optionId: selectedOption || null,
          motif,
          decidedBy: 'A. DIALLO',
        }),
      });

      if (res.ok) {
        onSuccess?.();
        onClose();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <FluentModal open={open} title="Trancher l'arbitrage" onClose={onClose}>
      <div className="space-y-4">
        {options && options.length > 0 && (
          <div>
            <label className="text-sm text-slate-400 mb-2 block">Option choisie (optionnel)</label>
            <select
              value={selectedOption}
              onChange={(e) => setSelectedOption(e.target.value)}
              className="w-full rounded-xl border border-slate-200/70 bg-white/90 p-2.5 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value="">Décision libre</option>
              {options.map((opt: any) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="text-sm text-slate-400 mb-2 block">Motif de la décision *</label>
          <textarea
            value={motif}
            onChange={(e) => setMotif(e.target.value)}
            rows={4}
            placeholder="Expliquez votre décision..."
            className="w-full rounded-xl border border-slate-200/70 bg-white/90 p-2.5 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            required
          />
        </div>

        <div className="flex justify-end gap-2">
          <FluentButton size="sm" variant="secondary" onClick={onClose}>
            Annuler
          </FluentButton>
          <FluentButton
            size="sm"
            variant="success"
            onClick={handleSubmit}
            disabled={loading || !motif.trim()}
          >
            <Gavel className="w-3.5 h-3.5" />
            {loading ? 'Enregistrement...' : 'Trancher'}
          </FluentButton>
        </div>
      </div>
    </FluentModal>
  );
}

function ReporterModal({ open, onClose, arbitrageId, onSuccess }: any) {
  const [newDeadline, setNewDeadline] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!newDeadline || !reason.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/arbitrages/${encodeURIComponent(arbitrageId)}/reporter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newDeadline,
          reason,
          reportedBy: 'A. DIALLO',
        }),
      });

      if (res.ok) {
        onSuccess?.();
        onClose();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <FluentModal open={open} title="Reporter l'arbitrage" onClose={onClose}>
      <div className="space-y-4">
        <div>
          <label className="text-sm text-slate-400 mb-2 block">Nouvelle échéance *</label>
          <input
            type="date"
            value={newDeadline}
            onChange={(e) => setNewDeadline(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="w-full rounded-xl border border-slate-200/70 bg-white/90 p-2.5 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            required
          />
        </div>

        <div>
          <label className="text-sm text-slate-400 mb-2 block">Justification *</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder="Pourquoi reporter cet arbitrage..."
            className="w-full rounded-xl border border-slate-200/70 bg-white/90 p-2.5 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            required
          />
        </div>

        <div className="flex justify-end gap-2">
          <FluentButton size="sm" variant="secondary" onClick={onClose}>
            Annuler
          </FluentButton>
          <FluentButton
            size="sm"
            variant="warning"
            onClick={handleSubmit}
            disabled={loading || !newDeadline || !reason.trim()}
          >
            <CalendarPlus className="w-3.5 h-3.5" />
            {loading ? 'Enregistrement...' : 'Reporter'}
          </FluentButton>
        </div>
      </div>
    </FluentModal>
  );
}

function ComplementModal({ open, onClose, arbitrageId, onSuccess }: any) {
  const [requestedFrom, setRequestedFrom] = useState('');
  const [questions, setQuestions] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!requestedFrom.trim() || !questions.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/arbitrages/${encodeURIComponent(arbitrageId)}/complement`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestedFrom,
          questions,
          requestedBy: 'A. DIALLO',
        }),
      });

      if (res.ok) {
        onSuccess?.();
        onClose();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <FluentModal open={open} title="Demander des compléments" onClose={onClose}>
      <div className="space-y-4">
        <div>
          <label className="text-sm text-slate-400 mb-2 block">Demandé à *</label>
          <input
            type="text"
            value={requestedFrom}
            onChange={(e) => setRequestedFrom(e.target.value)}
            placeholder="Nom ou bureau..."
            className="w-full rounded-xl border border-slate-200/70 bg-white/90 p-2.5 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            required
          />
        </div>

        <div>
          <label className="text-sm text-slate-400 mb-2 block">Questions / Informations nécessaires *</label>
          <textarea
            value={questions}
            onChange={(e) => setQuestions(e.target.value)}
            rows={4}
            placeholder="Détaillez les informations complémentaires nécessaires..."
            className="w-full rounded-xl border border-slate-200/70 bg-white/90 p-2.5 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            required
          />
        </div>

        <div className="flex justify-end gap-2">
          <FluentButton size="sm" variant="secondary" onClick={onClose}>
            Annuler
          </FluentButton>
          <FluentButton
            size="sm"
            variant="primary"
            onClick={handleSubmit}
            disabled={loading || !requestedFrom.trim() || !questions.trim()}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            {loading ? 'Envoi...' : 'Envoyer'}
          </FluentButton>
        </div>
      </div>
    </FluentModal>
  );
}
