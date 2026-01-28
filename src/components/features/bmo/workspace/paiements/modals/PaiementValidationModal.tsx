/**
 * Modal Validation/Rejet/Planification - Validation Paiements
 * Formulaire en 2 étapes avec signature électronique
 * Inspiré de ValidationBC ValidationModal
 */

'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  CheckCircle,
  XCircle,
  Calendar,
  DollarSign,
  Shield,
  Clock,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  X,
  Loader2,
  CreditCard,
  Building2,
} from 'lucide-react';

import type { Paiement } from '@/lib/services/paiementsApiService';

// ================================
// Types
// ================================
export type PaiementAction = 'validate' | 'reject' | 'schedule';

export interface PaiementValidationModalProps {
  paiement: Paiement | null;
  action: PaiementAction | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: PaiementValidationData) => Promise<void>;
}

export interface PaiementValidationData {
  action: PaiementAction;
  comment: string;
  signature?: string;
  signatureMethod?: 'pin' | 'otp' | 'biometric';
  nextValidator?: string;
  reason?: string;
  reasonCategory?: string;
  scheduledDate?: string;
  scheduledTime?: string;
  paymentMethod?: 'virement' | 'cheque' | 'especes' | 'carte';
  bankAccount?: string;
  conditions?: {
    ribVerified: boolean;
    budgetAvailable: boolean;
    documentValid: boolean;
    tresorerieOk: boolean;
  };
}

// Motifs de rejet
const REJECTION_REASONS = [
  { value: 'budget', label: 'Budget insuffisant' },
  { value: 'rib', label: 'RIB invalide ou manquant' },
  { value: 'document', label: 'Document source invalide' },
  { value: 'montant', label: 'Montant incorrect' },
  { value: 'tresorerie', label: 'Trésorerie insuffisante' },
  { value: 'autre', label: 'Autre (préciser)' },
];

// Méthodes de paiement
const PAYMENT_METHODS = [
  { value: 'virement', label: 'Virement bancaire', icon: Building2 },
  { value: 'cheque', label: 'Chèque', icon: CreditCard },
  { value: 'especes', label: 'Espèces', icon: DollarSign },
  { value: 'carte', label: 'Carte bancaire', icon: CreditCard },
];

// ================================
// Component
// ================================
export function PaiementValidationModal({
  paiement,
  action,
  isOpen,
  onClose,
  onConfirm,
}: PaiementValidationModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState<Partial<PaiementValidationData>>({
    action: action || 'validate',
    comment: '',
    conditions: {
      ribVerified: false,
      budgetAvailable: false,
      documentValid: false,
      tresorerieOk: false,
    },
  });

  useEffect(() => {
    if (isOpen && action) {
      setFormData({
        action,
        comment: '',
        conditions: {
          ribVerified: false,
          budgetAvailable: false,
          documentValid: false,
          tresorerieOk: false,
        },
      });
      setStep(1);
      setFormErrors({});
    }
  }, [isOpen, action]);

  const handleFormChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (formErrors[field]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleConditionChange = (field: keyof NonNullable<PaiementValidationData['conditions']>, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      conditions: {
        ...prev.conditions!,
        [field]: value,
      },
    }));
  };

  const validateStep1 = (): boolean => {
    const errors: Record<string, string> = {};

    // Validation selon l'action
    if (formData.action === 'validate') {
      // Vérifier les conditions
      if (!formData.conditions?.ribVerified) {
        errors.conditions = 'Toutes les conditions doivent être vérifiées';
      }
      if (!formData.conditions?.budgetAvailable) {
        errors.conditions = 'Toutes les conditions doivent être vérifiées';
      }
      if (!formData.conditions?.documentValid) {
        errors.conditions = 'Toutes les conditions doivent être vérifiées';
      }
      if (!formData.conditions?.tresorerieOk) {
        errors.conditions = 'Toutes les conditions doivent être vérifiées';
      }
      
      // Signature obligatoire
      if (!formData.signature) {
        errors.signature = 'La signature est obligatoire';
      }
    }

    if (formData.action === 'reject') {
      if (!formData.reasonCategory) {
        errors.reasonCategory = 'Le motif de rejet est obligatoire';
      }
      if (!formData.comment || formData.comment.length < 10) {
        errors.comment = 'L\'explication doit contenir au moins 10 caractères';
      }
    }

    if (formData.action === 'schedule') {
      if (!formData.scheduledDate) {
        errors.scheduledDate = 'La date de planification est obligatoire';
      }
      if (!formData.paymentMethod) {
        errors.paymentMethod = 'La méthode de paiement est obligatoire';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handlePreviousStep = () => {
    setStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step === 1) {
      handleNextStep();
      return;
    }

    setLoading(true);
    try {
      await onConfirm(formData as PaiementValidationData);
      onClose();
    } catch (error) {
      console.error('Validation failed:', error);
      setFormErrors({ submit: 'Une erreur est survenue. Veuillez réessayer.' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !paiement) return null;

  const isValidation = formData.action === 'validate';
  const isRejection = formData.action === 'reject';
  const isSchedule = formData.action === 'schedule';

  const title = isValidation
    ? 'Valider le paiement'
    : isRejection
    ? 'Rejeter le paiement'
    : 'Planifier le paiement';

  const titleIcon = isValidation
    ? <CheckCircle className="h-6 w-6 text-emerald-400" />
    : isRejection
    ? <XCircle className="h-6 w-6 text-red-400" />
    : <Calendar className="h-6 w-6 text-blue-400" />;

  const confirmButtonText = isValidation
    ? 'Confirmer la validation'
    : isRejection
    ? 'Confirmer le rejet'
    : 'Confirmer la planification';

  const confirmButtonClass = isValidation
    ? 'bg-emerald-600 hover:bg-emerald-700'
    : isRejection
    ? 'bg-red-600 hover:bg-red-700'
    : 'bg-blue-600 hover:bg-blue-700';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col bg-slate-900 border-slate-700 text-slate-50">
        <DialogHeader className="flex flex-row items-center justify-between pb-4 border-b border-slate-700/50">
          <DialogTitle className="text-xl font-bold flex items-center gap-3">
            {titleIcon}
            {title}
          </DialogTitle>
          <Button size="sm" variant="ghost" onClick={onClose} className="text-slate-400 hover:text-slate-50">
            <X className="h-5 w-5" />
          </Button>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Étape indicator */}
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className={cn(
                "h-2 w-16 rounded-full transition-colors",
                step === 1 ? "bg-blue-500" : "bg-emerald-500"
              )} />
              <div className={cn(
                "h-2 w-16 rounded-full transition-colors",
                step === 2 ? "bg-blue-500" : "bg-slate-700"
              )} />
            </div>

            {/* Informations paiement */}
            <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400">Paiement</span>
                <Badge className="bg-blue-500/20 text-blue-400">{paiement.reference}</Badge>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400">Fournisseur</span>
                <span className="font-medium text-slate-200">{typeof paiement.fournisseur === 'object' && paiement.fournisseur && 'name' in paiement.fournisseur ? (paiement.fournisseur as { name: string }).name : String(paiement.fournisseur ?? '')}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Montant</span>
                <span className="text-lg font-bold text-emerald-400">
                  {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 }).format(paiement.montant)}
                </span>
              </div>
            </div>

            {/* ÉTAPE 1 : Formulaire */}
            {step === 1 && (
              <div className="space-y-4">
                {/* VALIDATION */}
                {isValidation && (
                  <>
                    <div>
                      <Label className="mb-3 block font-semibold text-slate-200">
                        Conditions de validation <span className="text-red-500">*</span>
                      </Label>
                      <div className="space-y-3 bg-slate-800/30 p-4 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            id="rib-verified"
                            checked={formData.conditions?.ribVerified}
                            onCheckedChange={(checked) => handleConditionChange('ribVerified', checked as boolean)}
                          />
                          <Label htmlFor="rib-verified" className="text-sm cursor-pointer">
                            RIB/IBAN vérifié et valide
                          </Label>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            id="budget-available"
                            checked={formData.conditions?.budgetAvailable}
                            onCheckedChange={(checked) => handleConditionChange('budgetAvailable', checked as boolean)}
                          />
                          <Label htmlFor="budget-available" className="text-sm cursor-pointer">
                            Budget disponible sur le projet
                          </Label>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            id="document-valid"
                            checked={formData.conditions?.documentValid}
                            onCheckedChange={(checked) => handleConditionChange('documentValid', checked as boolean)}
                          />
                          <Label htmlFor="document-valid" className="text-sm cursor-pointer">
                            Document source (BC/Facture) validé
                          </Label>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            id="tresorerie-ok"
                            checked={formData.conditions?.tresorerieOk}
                            onCheckedChange={(checked) => handleConditionChange('tresorerieOk', checked as boolean)}
                          />
                          <Label htmlFor="tresorerie-ok" className="text-sm cursor-pointer">
                            Trésorerie suffisante (pas d'alerte seuil)
                          </Label>
                        </div>
                      </div>
                      {formErrors.conditions && (
                        <p className="text-red-500 text-sm mt-2">{formErrors.conditions}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="signature" className="mb-2 block">
                        Signature Électronique <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="signature"
                        type="password"
                        placeholder="Entrez votre code PIN ou mot de passe"
                        value={formData.signature || ''}
                        onChange={(e) => handleFormChange('signature', e.target.value)}
                        className="bg-slate-800 border-slate-700"
                      />
                      {formErrors.signature && (
                        <p className="text-red-500 text-sm mt-1">{formErrors.signature}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="next-validator" className="mb-2 block">
                        Prochain validateur (optionnel)
                      </Label>
                      <Select
                        value={formData.nextValidator || ''}
                        onValueChange={(value) => handleFormChange('nextValidator', value)}
                      >
                        <SelectTrigger className="bg-slate-800 border-slate-700">
                          <SelectValue placeholder="Sélectionner si validation multi-niveaux" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                          <SelectItem value="val-daf">Directeur Financier</SelectItem>
                          <SelectItem value="val-dg">Directeur Général</SelectItem>
                          <SelectItem value="val-tresorier">Trésorier</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                {/* REJET */}
                {isRejection && (
                  <>
                    <div>
                      <Label htmlFor="reason-category" className="mb-2 block">
                        Motif de rejet <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formData.reasonCategory || ''}
                        onValueChange={(value) => handleFormChange('reasonCategory', value)}
                      >
                        <SelectTrigger className="bg-slate-800 border-slate-700">
                          <SelectValue placeholder="Sélectionner un motif" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                          {REJECTION_REASONS.map((reason) => (
                            <SelectItem key={reason.value} value={reason.value}>
                              {reason.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {formErrors.reasonCategory && (
                        <p className="text-red-500 text-sm mt-1">{formErrors.reasonCategory}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="comment" className="mb-2 block">
                        Explication détaillée <span className="text-red-500">*</span>
                      </Label>
                      <textarea
                        id="comment"
                        placeholder="Expliquer en détail la raison du rejet (min 10 caractères)..."
                        value={formData.comment || ''}
                        onChange={(e) => handleFormChange('comment', e.target.value)}
                        rows={4}
                        className="w-full rounded-lg px-3 py-2 border text-sm bg-slate-800 border-slate-700 text-slate-50"
                      />
                      <div className="flex justify-between items-center mt-1">
                        {formErrors.comment && (
                          <p className="text-red-500 text-sm">{formErrors.comment}</p>
                        )}
                        <p className="text-xs text-slate-500 ml-auto">
                          {formData.comment?.length || 0} caractères
                        </p>
                      </div>
                    </div>
                  </>
                )}

                {/* PLANIFICATION */}
                {isSchedule && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="scheduled-date" className="mb-2 block">
                          Date d'exécution <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="scheduled-date"
                          type="date"
                          value={formData.scheduledDate || ''}
                          onChange={(e) => handleFormChange('scheduledDate', e.target.value)}
                          className="bg-slate-800 border-slate-700"
                        />
                        {formErrors.scheduledDate && (
                          <p className="text-red-500 text-sm mt-1">{formErrors.scheduledDate}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="scheduled-time" className="mb-2 block">
                          Heure (optionnel)
                        </Label>
                        <Input
                          id="scheduled-time"
                          type="time"
                          value={formData.scheduledTime || ''}
                          onChange={(e) => handleFormChange('scheduledTime', e.target.value)}
                          className="bg-slate-800 border-slate-700"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="mb-2 block">
                        Méthode de paiement <span className="text-red-500">*</span>
                      </Label>
                      <div className="grid grid-cols-2 gap-3">
                        {PAYMENT_METHODS.map((method) => {
                          const Icon = method.icon;
                          return (
                            <button
                              key={method.value}
                              type="button"
                              onClick={() => handleFormChange('paymentMethod', method.value)}
                              className={cn(
                                "p-4 rounded-lg border-2 transition-all flex items-center gap-3",
                                formData.paymentMethod === method.value
                                  ? "border-blue-500 bg-blue-500/20"
                                  : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
                              )}
                            >
                              <Icon className="h-5 w-5" />
                              <span className="text-sm font-medium">{method.label}</span>
                            </button>
                          );
                        })}
                      </div>
                      {formErrors.paymentMethod && (
                        <p className="text-red-500 text-sm mt-2">{formErrors.paymentMethod}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="bank-account" className="mb-2 block">
                        Compte bancaire (optionnel)
                      </Label>
                      <Select
                        value={formData.bankAccount || ''}
                        onValueChange={(value) => handleFormChange('bankAccount', value)}
                      >
                        <SelectTrigger className="bg-slate-800 border-slate-700">
                          <SelectValue placeholder="Compte par défaut" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                          <SelectItem value="default">Compte principal (CBAO)</SelectItem>
                          <SelectItem value="backup">Compte secondaire (BOA)</SelectItem>
                          <SelectItem value="treasury">Compte trésorerie (SGBS)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                {/* Commentaire (commun à toutes les actions) */}
                {!isRejection && (
                  <div>
                    <Label htmlFor="comment" className="mb-2 block">
                      Commentaire (optionnel)
                    </Label>
                    <textarea
                      id="comment"
                      placeholder="Ajouter un commentaire..."
                      value={formData.comment || ''}
                      onChange={(e) => handleFormChange('comment', e.target.value)}
                      rows={3}
                      className="w-full rounded-lg px-3 py-2 border text-sm bg-slate-800 border-slate-700 text-slate-50"
                    />
                  </div>
                )}
              </div>
            )}

            {/* ÉTAPE 2 : Confirmation */}
            {step === 2 && (
              <div className="text-center space-y-6">
                <div className={cn(
                  "mx-auto h-20 w-20 rounded-full flex items-center justify-center",
                  isValidation && "bg-emerald-500/20",
                  isRejection && "bg-red-500/20",
                  isSchedule && "bg-blue-500/20"
                )}>
                  {isValidation && <CheckCircle className="h-10 w-10 text-emerald-400" />}
                  {isRejection && <XCircle className="h-10 w-10 text-red-400" />}
                  {isSchedule && <Calendar className="h-10 w-10 text-blue-400" />}
                </div>

                <div>
                  <h3 className="text-2xl font-bold text-slate-200 mb-2">
                    Confirmer {isValidation ? 'la validation' : isRejection ? 'le rejet' : 'la planification'} ?
                  </h3>
                  <p className="text-slate-400">
                    Vous êtes sur le point de{' '}
                    <span className="font-semibold">
                      {isValidation ? 'valider' : isRejection ? 'rejeter' : 'planifier'}
                    </span>{' '}
                    le paiement <span className="font-semibold">{paiement.reference}</span>.
                  </p>
                  {isValidation && (
                    <p className="text-amber-400 text-sm mt-2">
                      ⚠️ Cette action est irréversible et déclenchera le processus de paiement.
                    </p>
                  )}
                </div>

                {/* Récapitulatif */}
                <div className="bg-slate-800/50 p-4 rounded-lg text-left space-y-2 border border-slate-700">
                  <h4 className="font-semibold text-slate-200 mb-3">Récapitulatif</h4>
                  
                  {isValidation && formData.nextValidator && (
                    <div className="text-sm">
                      <span className="text-slate-400">Prochain validateur :</span>
                      <span className="ml-2 text-slate-200">{formData.nextValidator}</span>
                    </div>
                  )}
                  
                  {isRejection && (
                    <>
                      <div className="text-sm">
                        <span className="text-slate-400">Motif :</span>
                        <span className="ml-2 text-slate-200">
                          {REJECTION_REASONS.find(r => r.value === formData.reasonCategory)?.label}
                        </span>
                      </div>
                      <div className="text-sm">
                        <span className="text-slate-400">Explication :</span>
                        <p className="text-slate-300 italic mt-1">"{formData.comment}"</p>
                      </div>
                    </>
                  )}
                  
                  {isSchedule && (
                    <>
                      <div className="text-sm">
                        <span className="text-slate-400">Date d'exécution :</span>
                        <span className="ml-2 text-slate-200">
                          {formData.scheduledDate} {formData.scheduledTime && `à ${formData.scheduledTime}`}
                        </span>
                      </div>
                      <div className="text-sm">
                        <span className="text-slate-400">Méthode :</span>
                        <span className="ml-2 text-slate-200">
                          {PAYMENT_METHODS.find(m => m.value === formData.paymentMethod)?.label}
                        </span>
                      </div>
                    </>
                  )}
                  
                  {formData.comment && !isRejection && (
                    <div className="text-sm">
                      <span className="text-slate-400">Commentaire :</span>
                      <p className="text-slate-300 italic mt-1">"{formData.comment}"</p>
                    </div>
                  )}
                </div>

                {formErrors.submit && (
                  <p className="text-red-500 text-sm">{formErrors.submit}</p>
                )}
              </div>
            )}
          </div>

          <DialogFooter className="flex justify-between pt-4 border-t border-slate-700/50">
            {step === 2 && (
              <Button type="button" variant="secondary" onClick={handlePreviousStep}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
            )}
            <div className="flex-1 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Annuler
              </Button>
              {step === 1 && (
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  Suivant
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              )}
              {step === 2 && (
                <Button type="submit" className={confirmButtonClass} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Confirmation...
                    </>
                  ) : (
                    confirmButtonText
                  )}
                </Button>
              )}
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

