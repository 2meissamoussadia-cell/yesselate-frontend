/**
 * ====================================================================
 * MODAL : Résolution Dossier Bloqué - 4 Types × 3 Étapes
 * Substitution BMO ⭐ | Escalade | Déblocage | Arbitrage
 * ====================================================================
 */

'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import {
  Users,
  TrendingUp,
  Zap,
  Scale,
  ChevronRight,
  ChevronLeft,
  AlertTriangle,
  CheckCircle,
  Shield,
  Clock,
  FileText,
  Send,
  Calendar,
  User,
  Building2,
  Target,
  Loader2,
  Info,
  X,
} from 'lucide-react';
import type { BlockedDossier } from '@/lib/types/bmo.types';

interface BlockedResolutionModalProps {
  open: boolean;
  onClose: () => void;
  dossier?: BlockedDossier;
  preselectedType?: ResolutionType;
  onSuccess?: () => void;
}

type ResolutionType = 'substitution' | 'escalation' | 'deblocage' | 'arbitrage';

interface SubstitutionData {
  remplacant: string;
  justification: string;
  duree: string;
  conditions: string;
  signature: {
    password: string;
    certificat: string;
  };
}

interface EscaladeData {
  niveau: 'daf' | 'dg';
  motif: string;
  urgence: 'critical' | 'high' | 'medium';
  documents: File[];
  deadline: string;
}

interface DeblocageData {
  solution: string;
  responsable: string;
  planAction: string;
  delai: string;
  conditions: string;
}

interface ArbitrageData {
  analyse: string;
  parties: string[];
  decision: string;
  justification: string;
  execution: string;
}

export function BlockedResolutionModal({
  open,
  onClose,
  dossier,
  preselectedType,
  onSuccess,
}: BlockedResolutionModalProps) {
  const [resolutionType, setResolutionType] = useState<ResolutionType | null>(preselectedType || null);
  const [currentStep, setCurrentStep] = useState(preselectedType ? 1 : 0);
  const [submitting, setSubmitting] = useState(false);

  // Data states
  const [substitutionData, setSubstitutionData] = useState<SubstitutionData>({
    remplacant: '',
    justification: '',
    duree: '7',
    conditions: '',
    signature: { password: '', certificat: '' },
  });

  const [escaladeData, setEscaladeData] = useState<EscaladeData>({
    niveau: 'daf',
    motif: '',
    urgence: 'high',
    documents: [],
    deadline: '',
  });

  const [deblocageData, setDeblocageData] = useState<DeblocageData>({
    solution: '',
    responsable: '',
    planAction: '',
    delai: '',
    conditions: '',
  });

  const [arbitrageData, setArbitrageData] = useState<ArbitrageData>({
    analyse: '',
    parties: [],
    decision: '',
    justification: '',
    execution: '',
  });

  // Reset on open (sauf si preselectedType)
  useEffect(() => {
    if (open) {
      if (preselectedType) {
        setResolutionType(preselectedType);
        setCurrentStep(1);
      } else {
        setResolutionType(null);
        setCurrentStep(0);
      }
      setSubmitting(false);
    }
  }, [open, preselectedType]);

  const handleSelectType = (type: ResolutionType) => {
    setResolutionType(type);
    setCurrentStep(1);
  };

  const handleNext = () => {
    setCurrentStep((prev) => Math.min(prev + 1, 3));
  };

  const handleBack = () => {
    if (currentStep === 1) {
      setResolutionType(null);
    } else {
      setCurrentStep((prev) => Math.max(prev - 1, 1));
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      // TODO: API calls selon type
      switch (resolutionType) {
        case 'substitution':
          // await blockedApi.substitute(dossier.id, substitutionData);
          break;
        case 'escalation':
          // await blockedApi.escalate(dossier.id, escaladeData);
          break;
        case 'deblocage':
          // await blockedApi.resolve(dossier.id, deblocageData);
          break;
        case 'arbitrage':
          // await blockedApi.arbitrate(dossier.id, arbitrageData);
          break;
      }

      await new Promise((resolve) => setTimeout(resolve, 1500));
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Resolution error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const canProceed = () => {
    if (!resolutionType) return false;

    switch (resolutionType) {
      case 'substitution':
        if (currentStep === 1) return substitutionData.remplacant && substitutionData.justification;
        if (currentStep === 2) return substitutionData.duree && substitutionData.conditions;
        if (currentStep === 3) return substitutionData.signature.password;
        return false;

      case 'escalation':
        if (currentStep === 1) return escaladeData.niveau && escaladeData.motif;
        if (currentStep === 2) return escaladeData.documents.length > 0 || escaladeData.deadline;
        return true;

      case 'deblocage':
        if (currentStep === 1) return deblocageData.solution && deblocageData.responsable;
        if (currentStep === 2) return deblocageData.planAction;
        return true;

      case 'arbitrage':
        if (currentStep === 1) return arbitrageData.analyse && arbitrageData.parties.length > 0;
        if (currentStep === 2) return arbitrageData.decision && arbitrageData.justification;
        return true;

      default:
        return false;
    }
  };

  const getResolutionIcon = (type: ResolutionType) => {
    switch (type) {
      case 'substitution':
        return Users;
      case 'escalation':
        return TrendingUp;
      case 'deblocage':
        return Zap;
      case 'arbitrage':
        return Scale;
    }
  };

  const getResolutionColor = (type: ResolutionType) => {
    switch (type) {
      case 'substitution':
        return 'from-blue-500/20 to-purple-500/20 border-blue-500/30';
      case 'escalation':
        return 'from-orange-500/20 to-red-500/20 border-orange-500/30';
      case 'deblocage':
        return 'from-green-500/20 to-emerald-500/20 border-green-500/30';
      case 'arbitrage':
        return 'from-purple-500/20 to-pink-500/20 border-purple-500/30';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-xl text-white">
                Résoudre Dossier Bloqué
              </DialogTitle>
              <DialogDescription className="text-slate-400 mt-1">
                {dossier ? `${dossier.id} - ${dossier.bureau}` : 'Sélectionner un dossier'}
              </DialogDescription>
            </div>
            {resolutionType && (
              <Badge
                variant="outline"
                className={cn('capitalize', getResolutionColor(resolutionType))}
              >
                {resolutionType}
              </Badge>
            )}
          </div>
        </DialogHeader>

        {/* Sélection type résolution */}
        {!resolutionType && (
          <div className="space-y-4 py-4">
            <div>
              <h3 className="text-sm font-medium text-slate-400 mb-3">
                Choisissez le type de résolution
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Substitution BMO */}
              <button
                onClick={() => handleSelectType('substitution')}
                className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-2 border-blue-500/30 rounded-lg p-6 hover:border-blue-500/50 transition-all text-left group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="bg-blue-500/20 p-3 rounded-lg group-hover:scale-110 transition-transform">
                    <Users className="h-6 w-6 text-blue-400" />
                  </div>
                  <Badge variant="outline" className="text-blue-400 border-blue-500/30">
                    ⭐ BMO
                  </Badge>
                </div>
                <h4 className="font-semibold text-white mb-2">Substitution</h4>
                <p className="text-sm text-slate-400">
                  Remplacer un validateur absent ou indisponible (pouvoir BMO)
                </p>
              </button>

              {/* Escalade */}
              <button
                onClick={() => handleSelectType('escalation')}
                className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-2 border-orange-500/30 rounded-lg p-6 hover:border-orange-500/50 transition-all text-left group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="bg-orange-500/20 p-3 rounded-lg group-hover:scale-110 transition-transform">
                    <TrendingUp className="h-6 w-6 text-orange-400" />
                  </div>
                  <Badge variant="outline" className="text-orange-400 border-orange-500/30">
                    Urgent
                  </Badge>
                </div>
                <h4 className="font-semibold text-white mb-2">Escalade</h4>
                <p className="text-sm text-slate-400">
                  Remonter vers DAF/DG pour décision rapide
                </p>
              </button>

              {/* Déblocage Direct */}
              <button
                onClick={() => handleSelectType('deblocage')}
                className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-2 border-green-500/30 rounded-lg p-6 hover:border-green-500/50 transition-all text-left group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="bg-green-500/20 p-3 rounded-lg group-hover:scale-110 transition-transform">
                    <Zap className="h-6 w-6 text-green-400" />
                  </div>
                  <Badge variant="outline" className="text-green-400 border-green-500/30">
                    Rapide
                  </Badge>
                </div>
                <h4 className="font-semibold text-white mb-2">Déblocage Direct</h4>
                <p className="text-sm text-slate-400">
                  Résoudre le blocage avec solution immédiate
                </p>
              </button>

              {/* Arbitrage BMO */}
              <button
                onClick={() => handleSelectType('arbitrage')}
                className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-2 border-purple-500/30 rounded-lg p-6 hover:border-purple-500/50 transition-all text-left group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="bg-purple-500/20 p-3 rounded-lg group-hover:scale-110 transition-transform">
                    <Scale className="h-6 w-6 text-purple-400" />
                  </div>
                  <Badge variant="outline" className="text-purple-400 border-purple-500/30">
                    ⭐ BMO
                  </Badge>
                </div>
                <h4 className="font-semibold text-white mb-2">Arbitrage</h4>
                <p className="text-sm text-slate-400">
                  Décision BMO pour conflit ou impasse (pouvoir suprême)
                </p>
              </button>
            </div>
          </div>
        )}

        {/* Formulaires par type */}
        {resolutionType && (
          <div className="py-4">
            {/* Progress indicator */}
            <div className="flex items-center justify-between mb-6">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div
                    className={cn(
                      'h-8 w-8 rounded-full flex items-center justify-center font-medium transition-all',
                      currentStep >= step
                        ? 'bg-blue-500 text-white'
                        : 'bg-slate-800 text-slate-400'
                    )}
                  >
                    {currentStep > step ? <CheckCircle className="h-5 w-5" /> : step}
                  </div>
                  {step < 3 && (
                    <div
                      className={cn(
                        'w-20 h-0.5 mx-2',
                        currentStep > step ? 'bg-blue-500' : 'bg-slate-800'
                      )}
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="max-h-[calc(90vh-350px)] overflow-y-auto pr-2">
              {/* SUBSTITUTION */}
              {resolutionType === 'substitution' && (
                <>
                  {/* Étape 1: Sélection + Justification */}
                  {currentStep === 1 && (
                    <div className="space-y-4">
                      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <Shield className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-white mb-1">
                              Substitution de Validateur
                            </h4>
                            <p className="text-sm text-slate-400">
                              Pouvoir BMO : Remplacer temporairement un validateur absent
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <Label className="text-slate-300">
                            Remplaçant *
                          </Label>
                          <Select
                            value={substitutionData.remplacant}
                            onValueChange={(value) =>
                              setSubstitutionData({ ...substitutionData, remplacant: value })
                            }
                          >
                            <SelectTrigger className="bg-slate-800 border-slate-700">
                              <SelectValue placeholder="Sélectionner un remplaçant" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user1">Amadou SECK - Chef Service (Suppléant)</SelectItem>
                              <SelectItem value="user2">Fatou NDIAYE - DAF Adjoint</SelectItem>
                              <SelectItem value="user3">Ibrahima BA - Contrôleur Senior</SelectItem>
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-slate-400 mt-1">
                            Liste des validateurs disponibles et autorisés
                          </p>
                        </div>

                        <div>
                          <Label className="text-slate-300">
                            Justification de la substitution *
                          </Label>
                          <Textarea
                            value={substitutionData.justification}
                            onChange={(e) =>
                              setSubstitutionData({
                                ...substitutionData,
                                justification: e.target.value,
                              })
                            }
                            placeholder="Expliquez la raison de la substitution (absence, indisponibilité, urgence...)"
                            className="bg-slate-800 border-slate-700 min-h-[100px]"
                          />
                          <p className="text-xs text-slate-400 mt-1">
                            {substitutionData.justification.length}/500 caractères
                          </p>
                        </div>

                        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-amber-400">
                            La substitution sera enregistrée dans l'audit trail et notifiée à la
                            Direction
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Étape 2: Durée + Conditions */}
                  {currentStep === 2 && (
                    <div className="space-y-4">
                      <div>
                        <Label className="text-slate-300">
                          Durée de la substitution (jours) *
                        </Label>
                        <Select
                          value={substitutionData.duree}
                          onValueChange={(value) =>
                            setSubstitutionData({ ...substitutionData, duree: value })
                          }
                        >
                          <SelectTrigger className="bg-slate-800 border-slate-700">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="3">3 jours (court terme)</SelectItem>
                            <SelectItem value="7">7 jours (moyen terme)</SelectItem>
                            <SelectItem value="14">14 jours (long terme)</SelectItem>
                            <SelectItem value="30">30 jours (temporaire)</SelectItem>
                            <SelectItem value="indefini">Indéfini (jusqu'à révocation)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-slate-300">
                          Conditions et limitations *
                        </Label>
                        <Textarea
                          value={substitutionData.conditions}
                          onChange={(e) =>
                            setSubstitutionData({
                              ...substitutionData,
                              conditions: e.target.value,
                            })
                          }
                          placeholder="Précisez les conditions : seuils de montant, types de dossiers, validations requises..."
                          className="bg-slate-800 border-slate-700 min-h-[120px]"
                        />
                        <p className="text-xs text-slate-400 mt-1">
                          Exemples : Montants &lt; 10M FCFA uniquement, Validation DAF requise
                          pour montants &gt; 5M
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3">
                          <div className="text-sm text-slate-400 mb-1">Validateur remplacé</div>
                          <div className="text-white font-medium">Marie FALL (DAF)</div>
                        </div>
                        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3">
                          <div className="text-sm text-slate-400 mb-1">Date de fin</div>
                          <div className="text-white font-medium">
                            {substitutionData.duree !== 'indefini'
                              ? new Date(
                                  Date.now() + parseInt(substitutionData.duree) * 24 * 60 * 60 * 1000
                                ).toLocaleDateString('fr-FR')
                              : 'Indéterminée'}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Étape 3: Signature Électronique */}
                  {currentStep === 3 && (
                    <div className="space-y-4">
                      <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <Shield className="h-5 w-5 text-purple-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-white mb-1">
                              Signature Électronique BMO
                            </h4>
                            <p className="text-sm text-slate-400">
                              Authentifiez cette décision de substitution avec votre signature
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <Label className="text-slate-300">
                            Mot de passe de signature *
                          </Label>
                          <Input
                            type="password"
                            value={substitutionData.signature.password}
                            onChange={(e) =>
                              setSubstitutionData({
                                ...substitutionData,
                                signature: {
                                  ...substitutionData.signature,
                                  password: e.target.value,
                                },
                              })
                            }
                            placeholder="Entrez votre mot de passe"
                            className="bg-slate-800 border-slate-700"
                          />
                        </div>

                        <div>
                          <Label className="text-slate-300">Certificat numérique</Label>
                          <Select
                            value={substitutionData.signature.certificat}
                            onValueChange={(value) =>
                              setSubstitutionData({
                                ...substitutionData,
                                signature: { ...substitutionData.signature, certificat: value },
                              })
                            }
                          >
                            <SelectTrigger className="bg-slate-800 border-slate-700">
                              <SelectValue placeholder="Sélectionner un certificat" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="cert1">
                                Certificat BMO Principal (expire: 2027-12-31)
                              </SelectItem>
                              <SelectItem value="cert2">
                                Certificat BMO Secondaire (expire: 2026-06-30)
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 space-y-2">
                          <h5 className="text-sm font-medium text-slate-300 mb-2">
                            Résumé de la substitution
                          </h5>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <span className="text-slate-400">Remplaçant:</span>
                              <span className="text-white ml-2">{substitutionData.remplacant || 'N/A'}</span>
                            </div>
                            <div>
                              <span className="text-slate-400">Durée:</span>
                              <span className="text-white ml-2">{substitutionData.duree} jours</span>
                            </div>
                            <div className="col-span-2">
                              <span className="text-slate-400">Justification:</span>
                              <p className="text-white mt-1 text-xs">
                                {substitutionData.justification || 'N/A'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* ESCALADE */}
              {resolutionType === 'escalation' && (
                <>
                  {/* Étape 1: Niveau + Motif */}
                  {currentStep === 1 && (
                    <div className="space-y-4">
                      <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <TrendingUp className="h-5 w-5 text-orange-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-white mb-1">Escalade Hiérarchique</h4>
                            <p className="text-sm text-slate-400">
                              Remonter le dossier vers un niveau de décision supérieur
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <Label className="text-slate-300">Niveau d'escalade *</Label>
                          <Select
                            value={escaladeData.niveau}
                            onValueChange={(value: 'daf' | 'dg') =>
                              setEscaladeData({ ...escaladeData, niveau: value })
                            }
                          >
                            <SelectTrigger className="bg-slate-800 border-slate-700">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="daf">
                                <div className="flex items-center gap-2">
                                  <Building2 className="h-4 w-4" />
                                  <span>Direction Administrative et Financière (DAF)</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="dg">
                                <div className="flex items-center gap-2">
                                  <Shield className="h-4 w-4" />
                                  <span>Direction Générale (DG)</span>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label className="text-slate-300">Niveau d'urgence *</Label>
                          <Select
                            value={escaladeData.urgence}
                            onValueChange={(value: 'critical' | 'high' | 'medium') =>
                              setEscaladeData({ ...escaladeData, urgence: value })
                            }
                          >
                            <SelectTrigger className="bg-slate-800 border-slate-700">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="critical">
                                <Badge className="bg-red-500/20 text-red-400">Critical</Badge> -
                                Décision requise sous 24h
                              </SelectItem>
                              <SelectItem value="high">
                                <Badge className="bg-orange-500/20 text-orange-400">High</Badge> -
                                Décision requise sous 48h
                              </SelectItem>
                              <SelectItem value="medium">
                                <Badge className="bg-yellow-500/20 text-yellow-400">Medium</Badge> -
                                Décision requise sous 7j
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label className="text-slate-300">Motif de l'escalade *</Label>
                          <Textarea
                            value={escaladeData.motif}
                            onChange={(e) =>
                              setEscaladeData({ ...escaladeData, motif: e.target.value })
                            }
                            placeholder="Expliquez pourquoi cette escalade est nécessaire..."
                            className="bg-slate-800 border-slate-700 min-h-[120px]"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Étape 2: Documents + Deadline */}
                  {currentStep === 2 && (
                    <div className="space-y-4">
                      <div>
                        <Label className="text-slate-300">Documents justificatifs</Label>
                        <div className="border-2 border-dashed border-slate-700 rounded-lg p-8 text-center hover:border-slate-600 transition-colors cursor-pointer">
                          <FileText className="h-10 w-10 text-slate-400 mx-auto mb-3" />
                          <p className="text-sm text-slate-400 mb-2">
                            Glissez-déposez ou cliquez pour ajouter des documents
                          </p>
                          <Button variant="outline" size="sm">
                            Parcourir
                          </Button>
                        </div>
                      </div>

                      <div>
                        <Label className="text-slate-300">Échéance de décision</Label>
                        <Input
                          type="datetime-local"
                          value={escaladeData.deadline}
                          onChange={(e) =>
                            setEscaladeData({ ...escaladeData, deadline: e.target.value })
                          }
                          className="bg-slate-800 border-slate-700"
                        />
                        <p className="text-xs text-slate-400 mt-1">
                          Date limite pour obtenir une réponse
                        </p>
                      </div>

                      <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
                        <p className="text-sm text-amber-400">
                          Les parties prenantes seront automatiquement notifiées de l'escalade
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Étape 3: Confirmation */}
                  {currentStep === 3 && (
                    <div className="space-y-4">
                      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                        <h5 className="text-sm font-medium text-slate-300 mb-3">
                          Résumé de l'escalade
                        </h5>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Niveau:</span>
                            <span className="text-white">{escaladeData.niveau.toUpperCase()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Urgence:</span>
                            <Badge
                              className={cn(
                                escaladeData.urgence === 'critical' && 'bg-red-500/20 text-red-400',
                                escaladeData.urgence === 'high' && 'bg-orange-500/20 text-orange-400',
                                escaladeData.urgence === 'medium' && 'bg-yellow-500/20 text-yellow-400'
                              )}
                            >
                              {escaladeData.urgence}
                            </Badge>
                          </div>
                          <div>
                            <span className="text-slate-400">Motif:</span>
                            <p className="text-white mt-1">{escaladeData.motif}</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-green-400">
                          Le dossier sera transmis à {escaladeData.niveau.toUpperCase()} avec notification
                          immédiate
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* DÉBLOCAGE */}
              {resolutionType === 'deblocage' && (
                <>
                  {/* Étape 1: Solution + Responsable */}
                  {currentStep === 1 && (
                    <div className="space-y-4">
                      <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <Zap className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-white mb-1">Déblocage Direct</h4>
                            <p className="text-sm text-slate-400">
                              Résoudre le blocage avec une action immédiate
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <Label className="text-slate-300">Solution proposée *</Label>
                          <Textarea
                            value={deblocageData.solution}
                            onChange={(e) =>
                              setDeblocageData({ ...deblocageData, solution: e.target.value })
                            }
                            placeholder="Décrivez la solution qui va débloquer le dossier..."
                            className="bg-slate-800 border-slate-700 min-h-[100px]"
                          />
                        </div>

                        <div>
                          <Label className="text-slate-300">Responsable de l'exécution *</Label>
                          <Select
                            value={deblocageData.responsable}
                            onValueChange={(value) =>
                              setDeblocageData({ ...deblocageData, responsable: value })
                            }
                          >
                            <SelectTrigger className="bg-slate-800 border-slate-700">
                              <SelectValue placeholder="Sélectionner un responsable" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user1">Jean DIOP - Chef Service Dakar</SelectItem>
                              <SelectItem value="user2">Marie FALL - DAF</SelectItem>
                              <SelectItem value="user3">Amadou SECK - BMO</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label className="text-slate-300">Délai d'exécution</Label>
                          <Select
                            value={deblocageData.delai}
                            onValueChange={(value) =>
                              setDeblocageData({ ...deblocageData, delai: value })
                            }
                          >
                            <SelectTrigger className="bg-slate-800 border-slate-700">
                              <SelectValue placeholder="Sélectionner un délai" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="immediate">Immédiat (moins de 2h)</SelectItem>
                              <SelectItem value="same-day">Jour même (24h)</SelectItem>
                              <SelectItem value="2-days">2 jours ouvrés</SelectItem>
                              <SelectItem value="week">1 semaine</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Étape 2: Plan d'action */}
                  {currentStep === 2 && (
                    <div className="space-y-4">
                      <div>
                        <Label className="text-slate-300">Plan d'action détaillé *</Label>
                        <Textarea
                          value={deblocageData.planAction}
                          onChange={(e) =>
                            setDeblocageData({ ...deblocageData, planAction: e.target.value })
                          }
                          placeholder="Listez les étapes précises pour débloquer le dossier..."
                          className="bg-slate-800 border-slate-700 min-h-[150px]"
                        />
                        <p className="text-xs text-slate-400 mt-1">
                          Exemple : 1) Obtenir signature manquante 2) Valider documents 3) Notifier
                          parties prenantes
                        </p>
                      </div>

                      <div>
                        <Label className="text-slate-300">Conditions de succès</Label>
                        <Textarea
                          value={deblocageData.conditions}
                          onChange={(e) =>
                            setDeblocageData({ ...deblocageData, conditions: e.target.value })
                          }
                          placeholder="Quels critères confirment que le déblocage est réussi ?"
                          className="bg-slate-800 border-slate-700 min-h-[100px]"
                        />
                      </div>
                    </div>
                  )}

                  {/* Étape 3: Validation */}
                  {currentStep === 3 && (
                    <div className="space-y-4">
                      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                        <h5 className="text-sm font-medium text-slate-300 mb-3">
                          Résumé du déblocage
                        </h5>
                        <div className="space-y-3 text-sm">
                          <div>
                            <span className="text-slate-400">Solution:</span>
                            <p className="text-white mt-1">{deblocageData.solution}</p>
                          </div>
                          <div>
                            <span className="text-slate-400">Responsable:</span>
                            <p className="text-white mt-1">{deblocageData.responsable || 'N/A'}</p>
                          </div>
                          <div>
                            <span className="text-slate-400">Délai:</span>
                            <p className="text-white mt-1">{deblocageData.delai || 'N/A'}</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                        <p className="text-sm text-green-400">
                          Le déblocage sera effectif immédiatement après validation
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* ARBITRAGE */}
              {resolutionType === 'arbitrage' && (
                <>
                  {/* Étape 1: Analyse + Parties */}
                  {currentStep === 1 && (
                    <div className="space-y-4">
                      <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <Scale className="h-5 w-5 text-purple-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-white mb-1">Arbitrage BMO</h4>
                            <p className="text-sm text-slate-400">
                              Décision BMO en cas de conflit ou d'impasse (pouvoir suprême)
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <Label className="text-slate-300">Analyse de la situation *</Label>
                          <Textarea
                            value={arbitrageData.analyse}
                            onChange={(e) =>
                              setArbitrageData({ ...arbitrageData, analyse: e.target.value })
                            }
                            placeholder="Analysez le contexte, les enjeux et les positions de chaque partie..."
                            className="bg-slate-800 border-slate-700 min-h-[120px]"
                          />
                        </div>

                        <div>
                          <Label className="text-slate-300">Parties impliquées *</Label>
                          <div className="space-y-2">
                            {['Chef Service Dakar', 'DAF', 'Fournisseur', 'Contrôleur'].map(
                              (partie) => (
                                <label
                                  key={partie}
                                  className="flex items-center gap-2 p-2 bg-slate-800/50 rounded cursor-pointer hover:bg-slate-800"
                                >
                                  <input
                                    type="checkbox"
                                    checked={arbitrageData.parties.includes(partie)}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setArbitrageData({
                                          ...arbitrageData,
                                          parties: [...arbitrageData.parties, partie],
                                        });
                                      } else {
                                        setArbitrageData({
                                          ...arbitrageData,
                                          parties: arbitrageData.parties.filter(
                                            (p) => p !== partie
                                          ),
                                        });
                                      }
                                    }}
                                    className="rounded"
                                  />
                                  <span className="text-white">{partie}</span>
                                </label>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Étape 2: Décision */}
                  {currentStep === 2 && (
                    <div className="space-y-4">
                      <div>
                        <Label className="text-slate-300">Décision BMO *</Label>
                        <Textarea
                          value={arbitrageData.decision}
                          onChange={(e) =>
                            setArbitrageData({ ...arbitrageData, decision: e.target.value })
                          }
                          placeholder="Énoncez clairement la décision arbitrale..."
                          className="bg-slate-800 border-slate-700 min-h-[100px]"
                        />
                      </div>

                      <div>
                        <Label className="text-slate-300">Justification motivée *</Label>
                        <Textarea
                          value={arbitrageData.justification}
                          onChange={(e) =>
                            setArbitrageData({
                              ...arbitrageData,
                              justification: e.target.value,
                            })
                          }
                          placeholder="Justifiez votre décision avec arguments et références..."
                          className="bg-slate-800 border-slate-700 min-h-[120px]"
                        />
                      </div>

                      <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
                        <p className="text-sm text-amber-400">
                          L'arbitrage BMO est définitif et s'impose à toutes les parties
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Étape 3: Exécution */}
                  {currentStep === 3 && (
                    <div className="space-y-4">
                      <div>
                        <Label className="text-slate-300">Modalités d'exécution *</Label>
                        <Textarea
                          value={arbitrageData.execution}
                          onChange={(e) =>
                            setArbitrageData({ ...arbitrageData, execution: e.target.value })
                          }
                          placeholder="Comment cette décision sera-t-elle mise en œuvre ?"
                          className="bg-slate-800 border-slate-700 min-h-[100px]"
                        />
                      </div>

                      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                        <h5 className="text-sm font-medium text-slate-300 mb-3">
                          Résumé de l'arbitrage
                        </h5>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="text-slate-400">Parties impliquées:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {arbitrageData.parties.map((p, idx) => (
                                <Badge key={idx} variant="outline">
                                  {p}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div>
                            <span className="text-slate-400">Décision:</span>
                            <p className="text-white mt-1">{arbitrageData.decision}</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3 flex items-start gap-2">
                        <Shield className="h-4 w-4 text-purple-400 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-purple-400">
                          Cette décision sera enregistrée avec signature BMO et notifiée à toutes les
                          parties
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Footer Actions */}
        {resolutionType && (
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <Button variant="outline" onClick={handleBack}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              {currentStep === 1 ? 'Type de résolution' : 'Étape précédente'}
            </Button>

            {currentStep < 3 ? (
              <Button onClick={handleNext} disabled={!canProceed()}>
                Étape suivante
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={!canProceed() || submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Traitement...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Confirmer la résolution
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

