/**
 * Modal de Validation/Rejet/Demande d'Infos - Validation BC
 * Gère toutes les actions possibles sur un document
 */

'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Info,
  FileText,
  Shield,
  User,
  Clock,
  AlertTriangle,
  Upload,
  ChevronRight,
  X,
} from 'lucide-react';

import type { ValidationDocument } from '@/lib/services/validation-bc-api';

// ================================
// Types
// ================================
export type ValidationAction = 'validate' | 'reject' | 'request_info';

export interface ValidationModalProps {
  document: ValidationDocument | null;
  action: ValidationAction | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: ValidationData) => Promise<void>;
}

export interface ValidationData {
  action: ValidationAction;
  comment: string;
  signature?: string;
  signatureMethod?: 'pin' | 'otp' | 'graphique';
  nextValidator?: string;
  reason?: string;
  reasonCategory?: string;
  reassignTo?: string;
  requestedFields?: string[];
  deadline?: string;
  recipientId?: string;
  conditions?: {
    montantsVerifies: boolean;
    piecesConformes: boolean;
    budgetDisponible: boolean;
  };
  attachments?: File[];
}

// Motifs de rejet prédéfinis
const REJECTION_REASONS = [
  { value: 'budget', label: 'Budget insuffisant' },
  { value: 'pieces', label: 'Pièces justificatives manquantes' },
  { value: 'montant', label: 'Montant incorrect ou incohérent' },
  { value: 'fournisseur', label: 'Fournisseur non agréé' },
  { value: 'procedure', label: 'Non-respect de la procédure' },
  { value: 'autre', label: 'Autre (préciser)' },
];

// Champs pouvant être demandés
const REQUESTABLE_FIELDS = [
  { id: 'facture_proforma', label: 'Facture proforma' },
  { id: 'bon_livraison', label: 'Bon de livraison' },
  { id: 'pv_reception', label: 'PV de réception' },
  { id: 'justification_technique', label: 'Justification technique' },
  { id: 'devis_comparatif', label: 'Devis comparatif' },
  { id: 'autorisation_marche', label: 'Autorisation marché' },
  { id: 'autre', label: 'Autre document' },
];

// Délais de réponse
const RESPONSE_DELAYS = [
  { value: '24h', label: '24 heures' },
  { value: '48h', label: '48 heures' },
  { value: '72h', label: '72 heures' },
  { value: '1w', label: '1 semaine' },
];

// Mock validateurs
const VALIDATORS = [
  { id: 'val-1', name: 'A. DIALLO', fonction: 'Chef de Service' },
  { id: 'val-2', name: 'M. KANE', fonction: 'DAF' },
  { id: 'val-3', name: 'B. SOW', fonction: 'DG' },
  { id: 'val-4', name: 'F. NDIAYE', fonction: 'Chef de Projet' },
];

// ================================
// Component
// ================================
export function ValidationModal({
  document,
  action,
  isOpen,
  onClose,
  onConfirm,
}: ValidationModalProps) {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'form' | 'confirm'>('form');
  
  // Form state
  const [comment, setComment] = useState('');
  const [signaturePin, setSignaturePin] = useState('');
  const [signatureMethod, setSignatureMethod] = useState<'pin' | 'otp' | 'graphique'>('pin');
  const [nextValidator, setNextValidator] = useState('');
  const [reason, setReason] = useState('');
  const [reasonCategory, setReasonCategory] = useState('');
  const [reassignTo, setReassignTo] = useState('');
  const [requestedFields, setRequestedFields] = useState<string[]>([]);
  const [deadline, setDeadline] = useState('48h');
  const [recipientId, setRecipientId] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  
  // Conditions de validation
  const [conditions, setConditions] = useState({
    montantsVerifies: false,
    piecesConformes: false,
    budgetDisponible: false,
  });

  const resetForm = () => {
    setComment('');
    setSignaturePin('');
    setNextValidator('');
    setReason('');
    setReasonCategory('');
    setReassignTo('');
    setRequestedFields([]);
    setDeadline('48h');
    setRecipientId('');
    setAttachments([]);
    setConditions({
      montantsVerifies: false,
      piecesConformes: false,
      budgetDisponible: false,
    });
    setStep('form');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(Array.from(e.target.files));
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const toggleRequestedField = (fieldId: string) => {
    setRequestedFields(prev =>
      prev.includes(fieldId)
        ? prev.filter(id => id !== fieldId)
        : [...prev, fieldId]
    );
  };

  const canProceedToConfirm = () => {
    if (!comment.trim()) return false;

    if (action === 'validate') {
      return (
        conditions.montantsVerifies &&
        conditions.piecesConformes &&
        conditions.budgetDisponible &&
        signaturePin.length >= 4
      );
    }

    if (action === 'reject') {
      return reasonCategory && reason.trim();
    }

    if (action === 'request_info') {
      return requestedFields.length > 0 && recipientId;
    }

    return false;
  };

  const handleNext = () => {
    if (canProceedToConfirm()) {
      setStep('confirm');
    }
  };

  const handleConfirm = async () => {
    if (!action || !document) return;

    setLoading(true);
    try {
      const data: ValidationData = {
        action,
        comment,
        signature: signaturePin,
        signatureMethod,
        nextValidator: nextValidator || undefined,
        reason: action === 'reject' ? reason : undefined,
        reasonCategory: action === 'reject' ? reasonCategory : undefined,
        reassignTo: action === 'reject' ? reassignTo : undefined,
        requestedFields: action === 'request_info' ? requestedFields : undefined,
        deadline: action === 'request_info' ? deadline : undefined,
        recipientId: action === 'request_info' ? recipientId : undefined,
        conditions: action === 'validate' ? conditions : undefined,
        attachments: attachments.length > 0 ? attachments : undefined,
      };

      await onConfirm(data);
      handleClose();
    } catch (error) {
      console.error('Error confirming action:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!document || !action) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const actionConfig = {
    validate: {
      title: 'Valider le document',
      icon: CheckCircle,
      color: 'emerald',
      description: 'Vous êtes sur le point de valider ce document.',
    },
    reject: {
      title: 'Rejeter le document',
      icon: XCircle,
      color: 'red',
      description: 'Vous êtes sur le point de rejeter ce document.',
    },
    request_info: {
      title: 'Demander des informations',
      icon: Info,
      color: 'amber',
      description: 'Vous allez demander des informations complémentaires.',
    },
  };

  const config = actionConfig[action];
  const Icon = config.icon;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className={cn(
              'p-2 rounded-lg',
              action === 'validate' && 'bg-emerald-500/10',
              action === 'reject' && 'bg-red-500/10',
              action === 'request_info' && 'bg-amber-500/10'
            )}>
              <Icon className={cn(
                'h-6 w-6',
                action === 'validate' && 'text-emerald-400',
                action === 'reject' && 'text-red-400',
                action === 'request_info' && 'text-amber-400'
              )} />
            </div>
            <span className="text-slate-200">{config.title}</span>
          </DialogTitle>
        </DialogHeader>

        {/* Résumé document */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-blue-400 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-slate-200">{document.id}</span>
                  <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30">
                    {document.type === 'bc' ? 'BC' : document.type === 'facture' ? 'Facture' : 'Avenant'}
                  </Badge>
                </div>
                <p className="text-sm text-slate-400 mb-2">{document.fournisseur}</p>
                <p className="text-lg font-bold text-blue-400">{formatCurrency(document.montantTTC)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Formulaire selon l'action */}
        <div className="space-y-4">
          {step === 'form' ? (
            <>
              {/* VALIDATION */}
              {action === 'validate' && (
                <>
                  {/* Conditions à cocher */}
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Conditions de validation
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="montants"
                          checked={conditions.montantsVerifies}
                          onCheckedChange={(checked) =>
                            setConditions(prev => ({ ...prev, montantsVerifies: !!checked }))
                          }
                        />
                        <Label
                          htmlFor="montants"
                          className="text-sm text-slate-300 cursor-pointer"
                        >
                          Je confirme l'exactitude des montants
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="pieces"
                          checked={conditions.piecesConformes}
                          onCheckedChange={(checked) =>
                            setConditions(prev => ({ ...prev, piecesConformes: !!checked }))
                          }
                        />
                        <Label
                          htmlFor="pieces"
                          className="text-sm text-slate-300 cursor-pointer"
                        >
                          Les pièces justificatives sont conformes
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="budget"
                          checked={conditions.budgetDisponible}
                          onCheckedChange={(checked) =>
                            setConditions(prev => ({ ...prev, budgetDisponible: !!checked }))
                          }
                        />
                        <Label
                          htmlFor="budget"
                          className="text-sm text-slate-300 cursor-pointer"
                        >
                          Le budget est disponible
                        </Label>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Signature électronique */}
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-base">Signature électronique</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <Label htmlFor="pin">Code PIN (4 chiffres minimum) *</Label>
                        <Input
                          id="pin"
                          type="password"
                          maxLength={6}
                          value={signaturePin}
                          onChange={(e) => setSignaturePin(e.target.value.replace(/\D/g, ''))}
                          placeholder="****"
                          className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 mt-1"
                        />
                      </div>
                      <p className="text-xs text-slate-400">
                        Votre signature confirme votre responsabilité dans cette validation
                      </p>
                    </CardContent>
                  </Card>

                  {/* Prochain validateur */}
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Prochain validateur (optionnel)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Select value={nextValidator} onValueChange={setNextValidator}>
                        <SelectTrigger className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                          <SelectValue placeholder="Assigner automatiquement" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                          {VALIDATORS.map((validator) => (
                            <SelectItem key={validator.id} value={validator.id}>
                              {validator.name} - {validator.fonction}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </CardContent>
                  </Card>
                </>
              )}

              {/* REJET */}
              {action === 'reject' && (
                <>
                  {/* Motif de rejet */}
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-base">Motif de rejet *</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Select value={reasonCategory} onValueChange={setReasonCategory}>
                        <SelectTrigger className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                          <SelectValue placeholder="Sélectionner un motif" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                          {REJECTION_REASONS.map((reason) => (
                            <SelectItem key={reason.value} value={reason.value}>
                              {reason.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <div>
                        <Label htmlFor="reason">Explication détaillée *</Label>
                        <textarea
                          id="reason"
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                          placeholder="Expliquez en détail les raisons du rejet..."
                          rows={4}
                          className="w-full rounded-lg px-3 py-2 border border-slate-700 bg-slate-900 text-slate-200 text-sm focus:outline-none focus:border-red-500 mt-1"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Réassignation */}
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-base">Réassigner à (optionnel)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Select value={reassignTo} onValueChange={setReassignTo}>
                        <SelectTrigger className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                          <SelectValue placeholder="Retourner au demandeur" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                          {VALIDATORS.map((validator) => (
                            <SelectItem key={validator.id} value={validator.id}>
                              {validator.name} - {validator.fonction}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </CardContent>
                  </Card>

                  {/* Pièces jointes */}
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-base">Justificatifs (optionnel)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <Label htmlFor="attachments" className="cursor-pointer">
                          <div className="flex items-center justify-center p-4 border-2 border-dashed border-slate-700 rounded-lg hover:border-slate-600 transition-colors">
                            <Upload className="h-5 w-5 text-slate-400 mr-2" />
                            <span className="text-sm text-slate-400">
                              Cliquer pour ajouter des fichiers
                            </span>
                          </div>
                        </Label>
                        <input
                          id="attachments"
                          type="file"
                          multiple
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        {attachments.length > 0 && (
                          <div className="space-y-2 mt-2">
                            {attachments.map((file, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between p-2 bg-slate-900 rounded border border-slate-700"
                              >
                                <span className="text-sm text-slate-300">{file.name}</span>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => removeAttachment(index)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}

              {/* DEMANDE D'INFO */}
              {action === 'request_info' && (
                <>
                  {/* Champs demandés */}
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-base">Informations demandées *</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {REQUESTABLE_FIELDS.map((field) => (
                        <div key={field.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={field.id}
                            checked={requestedFields.includes(field.id)}
                            onCheckedChange={() => toggleRequestedField(field.id)}
                          />
                          <Label
                            htmlFor={field.id}
                            className="text-sm text-slate-300 cursor-pointer"
                          >
                            {field.label}
                          </Label>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Destinataire */}
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Destinataire de la demande *
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Select value={recipientId} onValueChange={setRecipientId}>
                        <SelectTrigger className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                          <SelectValue placeholder="Sélectionner un destinataire" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                          <SelectItem value="demandeur">Demandeur initial</SelectItem>
                          {VALIDATORS.map((validator) => (
                            <SelectItem key={validator.id} value={validator.id}>
                              {validator.name} - {validator.fonction}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </CardContent>
                  </Card>

                  {/* Délai de réponse */}
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Délai de réponse
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Select value={deadline} onValueChange={setDeadline}>
                        <SelectTrigger className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                          {RESPONSE_DELAYS.map((delay) => (
                            <SelectItem key={delay.value} value={delay.value}>
                              {delay.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </CardContent>
                  </Card>
                </>
              )}

              {/* Commentaire (commun à toutes les actions) */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-base">Commentaire *</CardTitle>
                </CardHeader>
                <CardContent>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Ajoutez un commentaire..."
                    rows={3}
                    className="w-full rounded-lg px-3 py-2 border border-slate-700 bg-slate-900 text-slate-200 text-sm focus:outline-none focus:border-blue-500"
                  />
                </CardContent>
              </Card>
            </>
          ) : (
            /* CONFIRMATION */
            <Card className={cn(
              'border-2',
              action === 'validate' && 'bg-emerald-500/5 border-emerald-500/30',
              action === 'reject' && 'bg-red-500/5 border-red-500/30',
              action === 'request_info' && 'bg-amber-500/5 border-amber-500/30'
            )}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className={cn(
                    'h-5 w-5',
                    action === 'validate' && 'text-emerald-400',
                    action === 'reject' && 'text-red-400',
                    action === 'request_info' && 'text-amber-400'
                  )} />
                  Confirmer l'action
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-slate-300">{config.description}</p>
                
                <div className="p-4 bg-slate-900/50 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Document:</span>
                    <span className="text-slate-200 font-medium">{document.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Montant:</span>
                    <span className="text-slate-200 font-medium">{formatCurrency(document.montantTTC)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Action:</span>
                    <Badge variant="outline" className={cn(
                      action === 'validate' && 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
                      action === 'reject' && 'bg-red-500/10 text-red-400 border-red-500/30',
                      action === 'request_info' && 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    )}>
                      {action === 'validate' ? 'Validation' : action === 'reject' ? 'Rejet' : 'Demande d\'info'}
                    </Badge>
                  </div>
                </div>

                <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                  <p className="text-sm text-amber-300">
                    ⚠️ Cette action est irréversible et sera enregistrée dans l'historique du document.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter className="flex items-center gap-2">
          {step === 'form' ? (
            <>
              <Button variant="outline" onClick={handleClose}>
                Annuler
              </Button>
              <Button
                onClick={handleNext}
                disabled={!canProceedToConfirm()}
                className={cn(
                  action === 'validate' && 'bg-emerald-500 hover:bg-emerald-600',
                  action === 'reject' && 'bg-red-500 hover:bg-red-600',
                  action === 'request_info' && 'bg-amber-500 hover:bg-amber-600'
                )}
              >
                Continuer
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setStep('form')}>
                Retour
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={loading}
                className={cn(
                  action === 'validate' && 'bg-emerald-500 hover:bg-emerald-600',
                  action === 'reject' && 'bg-red-500 hover:bg-red-600',
                  action === 'request_info' && 'bg-amber-500 hover:bg-amber-600'
                )}
              >
                {loading ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                    Traitement...
                  </>
                ) : (
                  <>
                    <Icon className="h-4 w-4 mr-2" />
                    Confirmer
                  </>
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

