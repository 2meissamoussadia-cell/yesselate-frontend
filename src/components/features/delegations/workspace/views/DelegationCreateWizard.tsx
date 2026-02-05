'use client';

import { useState, useCallback, useMemo } from 'react';
import { useDelegationWorkspaceStore, DelegationTab } from '@/lib/stores/delegationWorkspaceStore';
import { FluentButton } from '@/components/ui/fluent-button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/cn';
import {
  ChevronLeft, ChevronRight, Key, User, Building2, Calendar,
  FileText, DollarSign, CheckCircle2, AlertTriangle, Loader2, Shield
} from 'lucide-react';

// ================================
// Types
// ================================
type WizardStep = 'type' | 'agent' | 'scope' | 'period' | 'review';

type FormData = {
  // Type de délégation
  type: string;
  customType: string;
  
  // Agent délégataire
  agentId: string;
  agentName: string;
  agentRole: string;
  agentEmail: string;
  agentPhone: string;
  
  // Bureau
  bureau: string;
  
  // Périmètre
  scope: string;
  scopeDetails: string;
  maxAmount: string;
  
  // Période
  startDate: string;
  endDate: string;
  
  // Délégant
  delegatorId: string;
  delegatorName: string;
  
  // Notes
  notes: string;
};

// ================================
// Constants
// ================================
const DELEGATION_TYPES = [
  { value: 'signature_bc', label: 'Signature des bons de commande', description: 'Autorisation de signer les BC dans un périmètre défini' },
  { value: 'validation_paiement', label: 'Validation des paiements', description: 'Autorisation de valider les ordres de paiement' },
  { value: 'engagement_marche', label: 'Engagement marchés publics', description: 'Représentation pour les procédures de marchés' },
  { value: 'ordonnancement', label: 'Ordonnancement', description: 'Délégation d\'ordonnancement budgétaire' },
  { value: 'representation', label: 'Représentation légale', description: 'Pouvoir de représentation de l\'entité' },
  { value: 'custom', label: 'Autre (personnalisé)', description: 'Définir un type de délégation personnalisé' },
];

const BUREAUX = [
  'BAGD', 'BAVM', 'BDI', 'BFEP', 'BRH', 'BSG', 'DBMO', 'Direction'
];

const STEPS: { id: WizardStep; label: string; icon: typeof Key }[] = [
  { id: 'type', label: 'Type', icon: Key },
  { id: 'agent', label: 'Agent', icon: User },
  { id: 'scope', label: 'Périmètre', icon: FileText },
  { id: 'period', label: 'Période', icon: Calendar },
  { id: 'review', label: 'Validation', icon: CheckCircle2 },
];

// ================================
// Initial form data
// ================================
const initialFormData: FormData = {
  type: '',
  customType: '',
  agentId: '',
  agentName: '',
  agentRole: '',
  agentEmail: '',
  agentPhone: '',
  bureau: '',
  scope: '',
  scopeDetails: '',
  maxAmount: '',
  startDate: new Date().toISOString().split('T')[0],
  endDate: '',
  delegatorId: 'USR-001', // Utilisateur connecté (à remplacer par auth)
  delegatorName: 'A. DIALLO', // Utilisateur connecté
  notes: '',
};

// ================================
// Component
// ================================
export function DelegationCreateWizard({ tab }: { tab: DelegationTab }) {
  const { closeTab, openTab } = useDelegationWorkspaceStore();
  
  const [step, setStep] = useState<WizardStep>('type');
  const [form, setForm] = useState<FormData>(initialFormData);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentStepIndex = STEPS.findIndex(s => s.id === step);

  const updateField = useCallback(<K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setError(null);
  }, []);

  // ================================
  // Validation par étape
  // ================================
  const validateStep = useCallback((stepId: WizardStep): string | null => {
    switch (stepId) {
      case 'type':
        if (!form.type) return 'Veuillez sélectionner un type de délégation';
        if (form.type === 'custom' && !form.customType.trim()) return 'Veuillez préciser le type de délégation';
        return null;
        
      case 'agent':
        if (!form.agentName.trim()) return 'Le nom de l\'agent est requis';
        if (!form.bureau) return 'Le bureau est requis';
        return null;
        
      case 'scope':
        if (!form.scope.trim()) return 'Le périmètre est requis';
        return null;
        
      case 'period':
        if (!form.startDate) return 'La date de début est requise';
        if (!form.endDate) return 'La date de fin est requise';
        if (new Date(form.endDate) <= new Date(form.startDate)) {
          return 'La date de fin doit être postérieure à la date de début';
        }
        return null;
        
      default:
        return null;
    }
  }, [form]);

  const canGoNext = useMemo(() => {
    return validateStep(step) === null;
  }, [step, validateStep]);

  const goNext = useCallback(() => {
    const error = validateStep(step);
    if (error) {
      setError(error);
      return;
    }
    
    const idx = currentStepIndex;
    if (idx < STEPS.length - 1) {
      setStep(STEPS[idx + 1].id);
      setError(null);
    }
  }, [step, currentStepIndex, validateStep]);

  const goBack = useCallback(() => {
    const idx = currentStepIndex;
    if (idx > 0) {
      setStep(STEPS[idx - 1].id);
      setError(null);
    }
  }, [currentStepIndex]);

  // ================================
  // Submission
  // ================================
  const handleSubmit = useCallback(async () => {
    setSubmitting(true);
    setError(null);
    
    try {
      const finalType = form.type === 'custom' ? form.customType : DELEGATION_TYPES.find(t => t.value === form.type)?.label ?? form.type;
      
      const payload = {
        type: finalType,
        agentId: form.agentId || `AGT-${Date.now()}`,
        agentName: form.agentName,
        agentRole: form.agentRole || null,
        agentEmail: form.agentEmail || null,
        agentPhone: form.agentPhone || null,
        bureau: form.bureau,
        scope: form.scope,
        scopeDetails: form.scopeDetails || null,
        maxAmount: form.maxAmount ? parseInt(form.maxAmount, 10) : null,
        startDate: form.startDate,
        endDate: form.endDate,
        delegatorId: form.delegatorId,
        delegatorName: form.delegatorName,
        notes: form.notes || null,
      };
      
      const res = await fetch('/api/delegations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error ?? 'Erreur lors de la création');
      }
      
      const result = await res.json();
      const newId = result.item?.id;
      
      // Fermer le wizard et ouvrir la fiche de la nouvelle délégation
      closeTab(tab.id);
      
      if (newId) {
        openTab({
          id: `delegation:${newId}`,
          type: 'delegation',
          title: `${newId} — ${finalType.slice(0, 15)}`,
          icon: '✅',
          data: { delegationId: newId },
        });
      } else {
        // Ouvrir la liste des actives
        openTab({
          id: 'inbox:active',
          type: 'inbox',
          title: 'Actives',
          icon: '✅',
          data: { queue: 'active' },
        });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur inconnue');
    } finally {
      setSubmitting(false);
    }
  }, [form, closeTab, openTab, tab.id]);

  // ================================
  // Render helpers
  // ================================
  const renderTypeStep = () => (
    <div className="space-y-4">
      <p className="text-sm text-slate-400">
        Sélectionnez le type de délégation de pouvoir à créer.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {DELEGATION_TYPES.map(t => (
          <button
            key={t.value}
            type="button"
            className={cn(
              "p-4 rounded-xl border text-left transition-all",
              form.type === t.value
                ? "border-purple-500 bg-purple-500/10 ring-2 ring-purple-500/30"
                : "border-slate-200/70 dark:border-slate-800 hover:border-purple-500/50 hover:bg-slate-50 dark:hover:bg-slate-800/50"
            )}
            onClick={() => updateField('type', t.value)}
          >
            <div className="font-semibold text-sm">{t.label}</div>
            <div className="text-xs text-slate-400 mt-1">{t.description}</div>
          </button>
        ))}
      </div>
      
      {form.type === 'custom' && (
        <div className="mt-4">
          <label className="block text-sm font-medium mb-2">Type personnalisé *</label>
          <input
            type="text"
            value={form.customType}
            onChange={(e) => updateField('customType', e.target.value)}
            placeholder="Ex: Signature des contrats de sous-traitance"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200/70 bg-white/90
                       dark:border-slate-800 dark:bg-[#141414]/70 dark:text-white
                       focus:outline-none focus:ring-2 focus:ring-purple-500/30"
          />
        </div>
      )}
    </div>
  );

  const renderAgentStep = () => (
    <div className="space-y-4">
      <p className="text-sm text-slate-400">
        Identifiez l'agent qui recevra cette délégation de pouvoir.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Nom de l'agent *</label>
          <input
            type="text"
            value={form.agentName}
            onChange={(e) => updateField('agentName', e.target.value)}
            placeholder="Prénom NOM"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200/70 bg-white/90
                       dark:border-slate-800 dark:bg-[#141414]/70 dark:text-white
                       focus:outline-none focus:ring-2 focus:ring-purple-500/30"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Bureau *</label>
          <Select
            value={form.bureau || '__none__'}
            onValueChange={(v) => updateField('bureau', v === '__none__' ? '' : v)}
          >
            <SelectTrigger className="w-full h-10 rounded-xl border-slate-200/70 bg-white/90 dark:border-slate-800 dark:bg-[#141414]/70 text-sm focus:ring-2 focus:ring-purple-500/30">
              <SelectValue placeholder="Sélectionner un bureau" />
            </SelectTrigger>
            <SelectContent className="border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1f1f1f]">
              <SelectItem value="__none__">Sélectionner un bureau</SelectItem>
              {BUREAUX.map(b => (
                <SelectItem key={b} value={b}>{b}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Fonction</label>
          <input
            type="text"
            value={form.agentRole}
            onChange={(e) => updateField('agentRole', e.target.value)}
            placeholder="Ex: Chef de service, Comptable..."
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200/70 bg-white/90
                       dark:border-slate-800 dark:bg-[#141414]/70 dark:text-white
                       focus:outline-none focus:ring-2 focus:ring-purple-500/30"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Matricule / ID agent</label>
          <input
            type="text"
            value={form.agentId}
            onChange={(e) => updateField('agentId', e.target.value)}
            placeholder="Ex: AGT-001"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200/70 bg-white/90
                       dark:border-slate-800 dark:bg-[#141414]/70 dark:text-white
                       focus:outline-none focus:ring-2 focus:ring-purple-500/30"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Email</label>
          <input
            type="email"
            value={form.agentEmail}
            onChange={(e) => updateField('agentEmail', e.target.value)}
            placeholder="agent@example.com"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200/70 bg-white/90
                       dark:border-slate-800 dark:bg-[#141414]/70 dark:text-white
                       focus:outline-none focus:ring-2 focus:ring-purple-500/30"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Téléphone</label>
          <input
            type="tel"
            value={form.agentPhone}
            onChange={(e) => updateField('agentPhone', e.target.value)}
            placeholder="+221 XX XXX XX XX"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200/70 bg-white/90
                       dark:border-slate-800 dark:bg-[#141414]/70 dark:text-white
                       focus:outline-none focus:ring-2 focus:ring-purple-500/30"
          />
        </div>
      </div>
    </div>
  );

  const renderScopeStep = () => (
    <div className="space-y-4">
      <p className="text-sm text-slate-400">
        Définissez le périmètre exact de cette délégation.
      </p>
      
      <div>
        <label className="block text-sm font-medium mb-2">Périmètre *</label>
        <textarea
          value={form.scope}
          onChange={(e) => updateField('scope', e.target.value)}
          placeholder="Décrivez le périmètre de la délégation (types d'opérations autorisées, limites...)"
          rows={3}
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200/70 bg-white/90
                     dark:border-slate-800 dark:bg-[#141414]/70 dark:text-white
                     focus:outline-none focus:ring-2 focus:ring-purple-500/30"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Détails supplémentaires</label>
        <textarea
          value={form.scopeDetails}
          onChange={(e) => updateField('scopeDetails', e.target.value)}
          placeholder="Conditions spéciales, exceptions, références réglementaires..."
          rows={2}
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200/70 bg-white/90
                     dark:border-slate-800 dark:bg-[#141414]/70 dark:text-white
                     focus:outline-none focus:ring-2 focus:ring-purple-500/30"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            <DollarSign className="w-4 h-4 inline mr-1" />
            Montant maximum (FCFA)
          </label>
          <input
            type="number"
            value={form.maxAmount}
            onChange={(e) => updateField('maxAmount', e.target.value)}
            placeholder="Ex: 10000000"
            min="0"
            step="1000"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200/70 bg-white/90
                       dark:border-slate-800 dark:bg-[#141414]/70 dark:text-white
                       focus:outline-none focus:ring-2 focus:ring-purple-500/30"
          />
          <p className="text-xs text-slate-400 mt-1">Laissez vide si pas de limite de montant</p>
        </div>
      </div>
    </div>
  );

  const renderPeriodStep = () => (
    <div className="space-y-4">
      <p className="text-sm text-slate-400">
        Définissez la période de validité de cette délégation.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Date de début *</label>
          <input
            type="date"
            value={form.startDate}
            onChange={(e) => updateField('startDate', e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200/70 bg-white/90
                       dark:border-slate-800 dark:bg-[#141414]/70 dark:text-white
                       focus:outline-none focus:ring-2 focus:ring-purple-500/30"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Date de fin *</label>
          <input
            type="date"
            value={form.endDate}
            onChange={(e) => updateField('endDate', e.target.value)}
            min={form.startDate}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200/70 bg-white/90
                       dark:border-slate-800 dark:bg-[#141414]/70 dark:text-white
                       focus:outline-none focus:ring-2 focus:ring-purple-500/30"
          />
        </div>
      </div>
      
      {/* Raccourcis de durée */}
      <div className="flex flex-wrap gap-2">
        <span className="text-sm text-slate-400">Durées rapides:</span>
        {[
          { label: '3 mois', months: 3 },
          { label: '6 mois', months: 6 },
          { label: '1 an', months: 12 },
          { label: '2 ans', months: 24 },
        ].map(({ label, months }) => (
          <button
            key={label}
            type="button"
            className="px-3 py-1 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-purple-500/10 hover:text-purple-600"
            onClick={() => {
              const start = new Date(form.startDate || new Date());
              const end = new Date(start);
              end.setMonth(end.getMonth() + months);
              updateField('endDate', end.toISOString().split('T')[0]);
            }}
          >
            {label}
          </button>
        ))}
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Notes internes</label>
        <textarea
          value={form.notes}
          onChange={(e) => updateField('notes', e.target.value)}
          placeholder="Notes pour le suivi interne..."
          rows={2}
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200/70 bg-white/90
                     dark:border-slate-800 dark:bg-[#141414]/70 dark:text-white
                     focus:outline-none focus:ring-2 focus:ring-purple-500/30"
        />
      </div>
    </div>
  );

  const renderReviewStep = () => {
    const finalType = form.type === 'custom' ? form.customType : DELEGATION_TYPES.find(t => t.value === form.type)?.label ?? form.type;
    const startDate = new Date(form.startDate);
    const endDate = new Date(form.endDate);
    const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    return (
      <div className="space-y-4">
        <div className="p-4 rounded-xl border border-purple-500/30 bg-purple-500/5">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-5 h-5 text-purple-500" />
            <h3 className="font-semibold text-purple-600 dark:text-purple-400">Récapitulatif de la délégation</h3>
          </div>
          <p className="text-sm text-slate-400">
            Vérifiez les informations avant validation. Un hash SHA3-256 sera généré pour garantir l'intégrité.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/50">
            <div className="text-xs text-slate-400 mb-1">Type de délégation</div>
            <div className="font-semibold">{finalType}</div>
          </div>
          
          <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/50">
            <div className="text-xs text-slate-400 mb-1">Agent délégataire</div>
            <div className="font-semibold">{form.agentName}</div>
            <div className="text-xs text-slate-400">{form.agentRole || '—'} • {form.bureau}</div>
          </div>
          
          <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/50 md:col-span-2">
            <div className="text-xs text-slate-400 mb-1">Périmètre</div>
            <div className="text-sm">{form.scope}</div>
            {form.maxAmount && (
              <div className="mt-1 text-xs text-purple-500 font-mono">
                Montant max: {parseInt(form.maxAmount).toLocaleString('fr-FR')} FCFA
              </div>
            )}
          </div>
          
          <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/50">
            <div className="text-xs text-slate-400 mb-1">Période de validité</div>
            <div className="font-semibold">
              {startDate.toLocaleDateString('fr-FR')} → {endDate.toLocaleDateString('fr-FR')}
            </div>
            <div className="text-xs text-slate-400">{duration} jours</div>
          </div>
          
          <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/50">
            <div className="text-xs text-slate-400 mb-1">Délégant</div>
            <div className="font-semibold">{form.delegatorName}</div>
          </div>
        </div>
        
        <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500 flex-none mt-0.5" />
            <div>
              <div className="font-semibold text-amber-700 dark:text-amber-400">Attention</div>
              <p className="text-sm text-amber-600 dark:text-amber-300">
                Une fois créée, cette délégation sera active immédiatement. Toutes les actions seront tracées et auditées.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ================================
  // Render
  // ================================
  return (
    <div className="grid grid-cols-1 xl:grid-cols-[250px_1fr] gap-4">
      {/* Sidebar - Steps */}
      <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 dark:border-slate-800 dark:bg-[#1f1f1f]/70">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Key className="w-4 h-4 text-purple-500" />
          Création de délégation
        </h3>
        
        <div className="space-y-2">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const isCurrent = s.id === step;
            const isPast = i < currentStepIndex;
            
            return (
              <button
                key={s.id}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all",
                  isCurrent && "bg-purple-500/10 text-purple-600 dark:text-purple-400 font-semibold",
                  isPast && "text-emerald-600 dark:text-emerald-400",
                  !isCurrent && !isPast && "text-slate-400"
                )}
                onClick={() => isPast && setStep(s.id)}
                disabled={!isPast && !isCurrent}
              >
                <div className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-xs",
                  isCurrent && "bg-purple-500 text-white",
                  isPast && "bg-emerald-500 text-white",
                  !isCurrent && !isPast && "bg-slate-200 dark:bg-slate-700"
                )}>
                  {isPast ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                </div>
                <span>{s.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main content */}
      <div className="rounded-2xl border border-slate-200/70 bg-white/80 dark:border-slate-800 dark:bg-[#1f1f1f]/70 overflow-hidden">
        <div className="p-4 border-b border-slate-200/70 dark:border-slate-800">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            {(() => {
              const StepIcon = STEPS[currentStepIndex].icon;
              return StepIcon ? <StepIcon className="w-5 h-5 text-purple-500" /> : null;
            })()}
            Étape {currentStepIndex + 1}: {STEPS[currentStepIndex].label}
          </h2>
        </div>

        <div className="p-6 min-h-[400px]">
          {step === 'type' && renderTypeStep()}
          {step === 'agent' && renderAgentStep()}
          {step === 'scope' && renderScopeStep()}
          {step === 'period' && renderPeriodStep()}
          {step === 'review' && renderReviewStep()}
          
          {error && (
            <div className="mt-4 p-3 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400 text-sm">
              <AlertTriangle className="w-4 h-4 inline mr-2" />
              {error}
            </div>
          )}
        </div>

        {/* Footer navigation */}
        <div className="p-4 border-t border-slate-200/70 dark:border-slate-800 flex items-center justify-between">
          <FluentButton
            variant="secondary"
            onClick={goBack}
            disabled={currentStepIndex === 0}
          >
            <ChevronLeft className="w-4 h-4" />
            Précédent
          </FluentButton>
          
          <div className="flex items-center gap-2">
            <FluentButton
              variant="secondary"
              onClick={() => closeTab(tab.id)}
            >
              Annuler
            </FluentButton>
            
            {step !== 'review' ? (
              <FluentButton
                variant="primary"
                onClick={goNext}
                disabled={!canGoNext}
              >
                Suivant
                <ChevronRight className="w-4 h-4" />
              </FluentButton>
            ) : (
              <FluentButton
                variant="success"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Création...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Créer la délégation
                  </>
                )}
              </FluentButton>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

