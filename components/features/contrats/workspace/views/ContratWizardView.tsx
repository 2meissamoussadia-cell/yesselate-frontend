'use client';

import React, { useState, useCallback } from 'react';
import { useValidationContratsWorkspaceStore } from '@/lib/stores/validationContratsWorkspaceStore';
import { useContratToast } from '../ContratToast';
import { FluentButton } from '@/components/ui/fluent-button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

import {
  FileText,
  Building2,
  User,
  Calendar,
  DollarSign,
  ArrowLeft,
  ArrowRight,
  Check,
  AlertCircle,
  Upload,
  Paperclip,
  Send,
  Save,
} from 'lucide-react';

type WizardStep = 1 | 2 | 3 | 4;

interface ContractFormData {
  type: 'Marché' | 'Avenant' | 'Sous-traitance' | '';
  subject: string;
  partner: string;
  bureau: string;
  amount: string;
  date: string;
  expiry: string;
  description: string;
  documents: File[];
}

const STEPS = [
  { id: 1, title: 'Type & Objet', icon: FileText },
  { id: 2, title: 'Partenaire', icon: Building2 },
  { id: 3, title: 'Montant & Dates', icon: DollarSign },
  { id: 4, title: 'Révision', icon: Check },
];

export function ContratWizardView({ action, tabId }: { action: string; tabId: string }) {
  const { closeTab, openTab } = useValidationContratsWorkspaceStore();
  const toast = useContratToast();

  const [currentStep, setCurrentStep] = useState<WizardStep>(1);
  const [formData, setFormData] = useState<ContractFormData>({
    type: '',
    subject: '',
    partner: '',
    bureau: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    expiry: '',
    description: '',
    documents: [],
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ContractFormData, string>>>({});

  const updateField = <K extends keyof ContractFormData>(
    key: K,
    value: ContractFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validateStep = (step: WizardStep): boolean => {
    const newErrors: typeof errors = {};

    if (step === 1) {
      if (!formData.type) newErrors.type = 'Le type est requis';
      if (!formData.subject.trim()) newErrors.subject = "L'objet est requis";
    } else if (step === 2) {
      if (!formData.partner.trim()) newErrors.partner = 'Le partenaire est requis';
      if (!formData.bureau) newErrors.bureau = 'Le bureau est requis';
    } else if (step === 3) {
      if (!formData.amount.trim()) newErrors.amount = 'Le montant est requis';
      if (!formData.expiry) newErrors.expiry = "La date d'expiration est requise";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = useCallback(() => {
    if (validateStep(currentStep)) {
      setCurrentStep((s) => Math.min(s + 1, 4) as WizardStep);
    }
  }, [currentStep]);

  const handlePrevious = useCallback(() => {
    setCurrentStep((s) => Math.max(s - 1, 1) as WizardStep);
  }, []);

  const handleSubmit = useCallback(() => {
    // Simuler la création
    const newId = `CTR-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`;
    
    toast.success('Contrat créé', `ID: ${newId}`, {
      actions: [
        { 
          label: 'Ouvrir', 
          onClick: () => openTab({
            id: `contrat:${newId}`,
            type: 'contrat',
            title: newId,
            icon: '📄',
            data: { contractId: newId },
          })
        },
      ],
    });
    
    closeTab(tabId);
  }, [toast, closeTab, tabId, openTab]);

  const handleSaveDraft = useCallback(() => {
    toast.info('Brouillon sauvegardé', 'Vous pouvez reprendre plus tard');
  }, [toast]);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Progress */}
      <div className="flex items-center justify-between">
        {STEPS.map((step, index) => {
          const Icon = step.icon;
          const isActive = currentStep === step.id;
          const isPast = currentStep > step.id;

          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'w-12 h-12 rounded-full flex items-center justify-center transition-colors',
                    isPast && 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
                    isActive && 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300 ring-2 ring-purple-500 ring-offset-2',
                    !isPast && !isActive && 'bg-slate-100 text-slate-400 dark:bg-slate-800',
                  )}
                >
                  {isPast ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </div>
                <span className={cn(
                  'text-xs font-medium mt-2',
                  isActive ? 'text-purple-700 dark:text-purple-300' : 'text-slate-500',
                )}>
                  {step.title}
                </span>
              </div>
              {index < STEPS.length - 1 && (
                <div className={cn(
                  'flex-1 h-1 mx-3 rounded-full',
                  isPast ? 'bg-emerald-300 dark:bg-emerald-700' : 'bg-slate-200 dark:bg-slate-700',
                )} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Form */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="p-6 rounded-2xl border border-slate-200/70 bg-white/80 dark:border-slate-700 dark:bg-slate-900/50"
        >
          {currentStep === 1 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Type & Objet du contrat</h3>
              
              <div>
                <label className="block text-sm font-medium mb-2">Type de contrat *</label>
                <div className="grid grid-cols-3 gap-3">
                  {(['Marché', 'Avenant', 'Sous-traitance'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => updateField('type', type)}
                      className={cn(
                        'p-4 rounded-xl border-2 text-center transition-colors',
                        formData.type === type
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300',
                      )}
                    >
                      <span className="text-2xl block mb-2">
                        {type === 'Marché' && '📋'}
                        {type === 'Avenant' && '📝'}
                        {type === 'Sous-traitance' && '🤝'}
                      </span>
                      <span className="font-medium">{type}</span>
                    </button>
                  ))}
                </div>
                {errors.type && (
                  <p className="text-sm text-rose-600 mt-2 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.type}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Objet du contrat *</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => updateField('subject', e.target.value)}
                  placeholder="Ex: Contrat cadre fournitures électriques"
                  className={cn(
                    'w-full p-3 rounded-xl border outline-none focus:ring-2 focus:ring-purple-500/30',
                    errors.subject ? 'border-rose-300' : 'border-slate-200 dark:border-slate-700',
                  )}
                />
                {errors.subject && (
                  <p className="text-sm text-rose-600 mt-2 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.subject}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Description détaillée..."
                  rows={4}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-purple-500/30 resize-none"
                />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Partenaire & Bureau</h3>
              
              <div>
                <label className="block text-sm font-medium mb-2">Partenaire / Fournisseur *</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={formData.partner}
                    onChange={(e) => updateField('partner', e.target.value)}
                    placeholder="Nom du partenaire"
                    className={cn(
                      'w-full pl-11 pr-4 py-3 rounded-xl border outline-none focus:ring-2 focus:ring-purple-500/30',
                      errors.partner ? 'border-rose-300' : 'border-slate-200 dark:border-slate-700',
                    )}
                  />
                </div>
                {errors.partner && (
                  <p className="text-sm text-rose-600 mt-2 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.partner}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Bureau émetteur *</label>
                <select
                  value={formData.bureau}
                  onChange={(e) => updateField('bureau', e.target.value)}
                  className={cn(
                    'w-full p-3 rounded-xl border outline-none focus:ring-2 focus:ring-purple-500/30 bg-white dark:bg-slate-900',
                    errors.bureau ? 'border-rose-300' : 'border-slate-200 dark:border-slate-700',
                  )}
                >
                  <option value="">Sélectionner un bureau...</option>
                  <option value="BJ">Bureau Juridique (BJ)</option>
                  <option value="BF">Bureau Financier (BF)</option>
                  <option value="BCT">Bureau Contrôle Technique (BCT)</option>
                  <option value="BA">Bureau Approvisionnement (BA)</option>
                  <option value="BM">Bureau des Marchés (BM)</option>
                </select>
                {errors.bureau && (
                  <p className="text-sm text-rose-600 mt-2 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.bureau}
                  </p>
                )}
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Montant & Dates</h3>
              
              <div>
                <label className="block text-sm font-medium mb-2">Montant du contrat (FCFA) *</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={formData.amount}
                    onChange={(e) => updateField('amount', e.target.value)}
                    placeholder="0"
                    className={cn(
                      'w-full pl-11 pr-4 py-3 rounded-xl border outline-none focus:ring-2 focus:ring-purple-500/30',
                      errors.amount ? 'border-rose-300' : 'border-slate-200 dark:border-slate-700',
                    )}
                  />
                </div>
                {errors.amount && (
                  <p className="text-sm text-rose-600 mt-2 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.amount}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Date de création</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => updateField('date', e.target.value)}
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-purple-500/30"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Date d'expiration *</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="date"
                      value={formData.expiry}
                      onChange={(e) => updateField('expiry', e.target.value)}
                      className={cn(
                        'w-full pl-11 pr-4 py-3 rounded-xl border outline-none focus:ring-2 focus:ring-purple-500/30',
                        errors.expiry ? 'border-rose-300' : 'border-slate-200 dark:border-slate-700',
                      )}
                    />
                  </div>
                  {errors.expiry && (
                    <p className="text-sm text-rose-600 mt-2 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.expiry}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Documents</label>
                <div className="p-8 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 text-center">
                  <Upload className="w-10 h-10 mx-auto text-slate-400 mb-3" />
                  <p className="text-sm text-slate-500">
                    Glissez-déposez des fichiers ici ou{' '}
                    <button className="text-purple-600 hover:underline">parcourez</button>
                  </p>
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Récapitulatif</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <div className="text-xs text-slate-500 mb-1">Type</div>
                  <div className="font-medium">{formData.type || '—'}</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <div className="text-xs text-slate-500 mb-1">Bureau</div>
                  <div className="font-medium">{formData.bureau || '—'}</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 col-span-2">
                  <div className="text-xs text-slate-500 mb-1">Objet</div>
                  <div className="font-medium">{formData.subject || '—'}</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 col-span-2">
                  <div className="text-xs text-slate-500 mb-1">Partenaire</div>
                  <div className="font-medium">{formData.partner || '—'}</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <div className="text-xs text-slate-500 mb-1">Montant</div>
                  <div className="font-medium text-amber-600">{formData.amount} FCFA</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <div className="text-xs text-slate-500 mb-1">Expiration</div>
                  <div className="font-medium">{formData.expiry || '—'}</div>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-700/50 dark:bg-amber-900/20">
                <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>Le contrat sera soumis à validation par le Bureau Juridique</span>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <FluentButton
          variant="secondary"
          onClick={handlePrevious}
          disabled={currentStep === 1}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Précédent
        </FluentButton>

        <div className="flex items-center gap-2">
          <FluentButton variant="secondary" onClick={handleSaveDraft}>
            <Save className="w-4 h-4 mr-2" />
            Brouillon
          </FluentButton>

          {currentStep < 4 ? (
            <FluentButton variant="primary" onClick={handleNext}>
              Suivant
              <ArrowRight className="w-4 h-4 ml-2" />
            </FluentButton>
          ) : (
            <FluentButton
              variant="primary"
              className="bg-gradient-to-r from-purple-600 to-pink-600"
              onClick={handleSubmit}
            >
              <Send className="w-4 h-4 mr-2" />
              Créer le contrat
            </FluentButton>
          )}
        </div>
      </div>
    </div>
  );
}

