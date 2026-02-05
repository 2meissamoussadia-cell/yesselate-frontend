/**
 * Modales Avancées pour le Projets Command Center
 * ResolutionWizard, DecisionCenter, GanttView, ResourcePlanning
 */

'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/cn';
import { logger } from '@/lib/utils/logger';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Users,
  FileText,
  Calendar,
  DollarSign,
  Target,
  Zap,
  Scale,
  AlertCircle,
  Loader2,
  X,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Download,
  Upload,
  GripHorizontal,
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════
// RESOLUTION WIZARD - Assistant de résolution guidé
// ═══════════════════════════════════════════════════════════════════════════

interface ResolutionWizardProps {
  isOpen: boolean;
  onClose: () => void;
  projectId?: string;
  projectTitle?: string;
}

export function ResolutionWizardModal({
  isOpen,
  onClose,
  projectId,
  projectTitle,
}: ResolutionWizardProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    issue: '',
    impact: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    affectedAreas: [] as string[],
    proposedSolution: '',
    requiredResources: '',
    estimatedTime: '',
    budgetImpact: '',
    approvalNeeded: false,
  });

  const totalSteps = 4;

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const handlePrevious = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = () => {
    logger.info('Resolution submitted', { component: 'AdvancedModals', ...formData });
    onClose();
  };

  const impactOptions = [
    { value: 'low', label: 'Faible', color: 'text-slate-400', bg: 'bg-slate-500/20' },
    { value: 'medium', label: 'Moyen', color: 'text-amber-400', bg: 'bg-amber-500/20' },
    { value: 'high', label: 'Élevé', color: 'text-orange-400', bg: 'bg-orange-500/20' },
    { value: 'critical', label: 'Critique', color: 'text-rose-400', bg: 'bg-rose-500/20' },
  ];

  const affectedAreasOptions = [
    'Budget',
    'Délais',
    'Qualité',
    'Équipe',
    'Ressources',
    'Client',
    'Juridique',
    'Technique',
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-xl text-slate-100 flex items-center gap-2">
            <Zap className="w-5 h-5 text-emerald-400" />
            Assistant de Résolution
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            {projectTitle && `Projet: ${projectTitle}`}
          </DialogDescription>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="flex items-center gap-2 mb-6">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div key={i} className="flex-1 flex items-center gap-2">
              <div
                className={cn(
                  'flex-1 h-2 rounded-full transition-all',
                  i + 1 <= step ? 'bg-emerald-500' : 'bg-slate-700'
                )}
              />
              {i < totalSteps - 1 && (
                <ChevronRight className="w-4 h-4 text-slate-600" />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="space-y-4 min-h-[300px]">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-slate-200 mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-400" />
                  Étape 1: Identification du problème
                </h3>
                <label className="block text-sm text-slate-400 mb-2">
                  Décrivez le problème rencontré
                </label>
                <textarea
                  value={formData.issue}
                  onChange={(e) => setFormData({ ...formData, issue: e.target.value })}
                  className="w-full h-32 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Ex: Retard dans la livraison des matériaux..."
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">Niveau d'impact</label>
                <div className="grid grid-cols-4 gap-2">
                  {impactOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setFormData({ ...formData, impact: option.value as any })}
                      className={cn(
                        'p-3 rounded-lg border transition-all',
                        formData.impact === option.value
                          ? `${option.bg} border-current ${option.color}`
                          : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                      )}
                    >
                      <p className="text-sm font-medium">{option.label}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-slate-200 mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-400" />
                Étape 2: Zones impactées
              </h3>
              <p className="text-sm text-slate-400 mb-4">
                Sélectionnez tous les domaines affectés par ce problème
              </p>
              <div className="grid grid-cols-4 gap-2">
                {affectedAreasOptions.map((area) => {
                  const isSelected = formData.affectedAreas.includes(area);
                  return (
                    <button
                      key={area}
                      onClick={() => {
                        setFormData({
                          ...formData,
                          affectedAreas: isSelected
                            ? formData.affectedAreas.filter((a) => a !== area)
                            : [...formData.affectedAreas, area],
                        });
                      }}
                      className={cn(
                        'p-3 rounded-lg border transition-all',
                        isSelected
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                          : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                      )}
                    >
                      <p className="text-sm font-medium">{area}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-slate-200 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-400" />
                Étape 3: Solution proposée
              </h3>
              
              <div>
                <label className="block text-sm text-slate-400 mb-2">
                  Description de la solution
                </label>
                <textarea
                  value={formData.proposedSolution}
                  onChange={(e) =>
                    setFormData({ ...formData, proposedSolution: e.target.value })
                  }
                  className="w-full h-32 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Ex: Trouver un fournisseur alternatif..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-2">
                    Ressources nécessaires
                  </label>
                  <Input
                    value={formData.requiredResources}
                    onChange={(e) =>
                      setFormData({ ...formData, requiredResources: e.target.value })
                    }
                    className="bg-slate-800 border-slate-700 text-slate-200"
                    placeholder="Ex: 2 ingénieurs, 1 semaine"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">
                    Délai estimé
                  </label>
                  <Input
                    value={formData.estimatedTime}
                    onChange={(e) =>
                      setFormData({ ...formData, estimatedTime: e.target.value })
                    }
                    className="bg-slate-800 border-slate-700 text-slate-200"
                    placeholder="Ex: 2 semaines"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-slate-200 mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                Étape 4: Validation et impact
              </h3>

              <div>
                <label className="block text-sm text-slate-400 mb-2">
                  Impact budgétaire (€)
                </label>
                <Input
                  type="number"
                  value={formData.budgetImpact}
                  onChange={(e) =>
                    setFormData({ ...formData, budgetImpact: e.target.value })
                  }
                  className="bg-slate-800 border-slate-700 text-slate-200"
                  placeholder="Ex: 15000"
                />
              </div>

              <div className="flex items-center gap-3 p-4 rounded-lg bg-slate-800 border border-slate-700">
                <input
                  type="checkbox"
                  checked={formData.approvalNeeded}
                  onChange={(e) =>
                    setFormData({ ...formData, approvalNeeded: e.target.checked })
                  }
                  className="w-4 h-4 rounded border-slate-600 bg-slate-800"
                />
                <label className="text-sm text-slate-300">
                  Cette résolution nécessite une approbation de la direction
                </label>
              </div>

              {/* Summary */}
              <div className="mt-6 p-4 rounded-lg bg-slate-800/50 border border-slate-700 space-y-3">
                <h4 className="font-medium text-slate-200">Résumé</h4>
                <div className="space-y-2 text-sm">
                  <p className="text-slate-400">
                    <span className="text-slate-400">Impact:</span>{' '}
                    <span className="text-slate-200 capitalize">{formData.impact}</span>
                  </p>
                  <p className="text-slate-400">
                    <span className="text-slate-400">Zones affectées:</span>{' '}
                    <span className="text-slate-200">
                      {formData.affectedAreas.join(', ') || 'Aucune'}
                    </span>
                  </p>
                  <p className="text-slate-400">
                    <span className="text-slate-400">Délai estimé:</span>{' '}
                    <span className="text-slate-200">
                      {formData.estimatedTime || 'Non spécifié'}
                    </span>
                  </p>
                  <p className="text-slate-400">
                    <span className="text-slate-400">Impact budgétaire:</span>{' '}
                    <span className="text-slate-200">
                      {formData.budgetImpact ? `${formData.budgetImpact}€` : 'Non spécifié'}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <DialogFooter className="flex items-center justify-between">
          <div className="text-sm text-slate-400">
            Étape {step} sur {totalSteps}
          </div>
          <div className="flex gap-2">
            {step > 1 && (
              <Button
                onClick={handlePrevious}
                variant="outline"
                className="border-slate-700 text-slate-300"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Précédent
              </Button>
            )}
            {step < totalSteps ? (
              <Button
                onClick={handleNext}
                className="bg-emerald-500 hover:bg-emerald-600 text-white"
              >
                Suivant
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                className="bg-emerald-500 hover:bg-emerald-600 text-white"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Soumettre
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// DECISION CENTER - Centre de décision stratégique
// ═══════════════════════════════════════════════════════════════════════════

interface DecisionCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DecisionCenterModal({ isOpen, onClose }: DecisionCenterProps) {
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  
  const decisions = {
    pending: [
      { id: '1', title: 'Extension de délai - Projet Alpha', type: 'timeline', priority: 'high', requestedBy: 'Jean Dupont', date: '2024-12-15' },
      { id: '2', title: 'Budget supplémentaire - Projet Beta', type: 'budget', priority: 'critical', requestedBy: 'Marie Martin', date: '2024-12-14' },
      { id: '3', title: 'Changement d\'équipe - Projet Gamma', type: 'resource', priority: 'medium', requestedBy: 'Paul Bernard', date: '2024-12-13' },
    ],
    approved: [
      { id: '4', title: 'Validation planning - Projet Delta', type: 'planning', priority: 'medium', approvedBy: 'Admin', date: '2024-12-12' },
    ],
    rejected: [
      { id: '5', title: 'Demande urgente - Projet Epsilon', type: 'urgent', priority: 'high', rejectedBy: 'Admin', date: '2024-12-11', reason: 'Budget insuffisant' },
    ],
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-rose-400 bg-rose-500/20';
      case 'high': return 'text-orange-400 bg-orange-500/20';
      case 'medium': return 'text-amber-400 bg-amber-500/20';
      default: return 'text-slate-400 bg-slate-500/20';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl text-slate-100 flex items-center gap-2">
            <Scale className="w-5 h-5 text-purple-400" />
            Centre de Décision
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Gérez les approbations et décisions stratégiques
          </DialogDescription>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-slate-700 pb-2">
          <button
            onClick={() => setActiveTab('pending')}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              activeTab === 'pending'
                ? 'bg-amber-500/20 text-amber-400'
                : 'text-slate-400 hover:text-slate-300'
            )}
          >
            En attente ({decisions.pending.length})
          </button>
          <button
            onClick={() => setActiveTab('approved')}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              activeTab === 'approved'
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'text-slate-400 hover:text-slate-300'
            )}
          >
            Approuvées ({decisions.approved.length})
          </button>
          <button
            onClick={() => setActiveTab('rejected')}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              activeTab === 'rejected'
                ? 'bg-rose-500/20 text-rose-400'
                : 'text-slate-400 hover:text-slate-300'
            )}
          >
            Rejetées ({decisions.rejected.length})
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto space-y-3">
          {decisions[activeTab].map((decision) => (
            <div
              key={decision.id}
              className="p-4 rounded-lg bg-slate-800/50 border border-slate-700 hover:border-slate-600 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-medium text-slate-200 mb-1">{decision.title}</h4>
                  <p className="text-sm text-slate-400">
                    {'requestedBy' in decision && `Demandé par ${decision.requestedBy}`}
                    {'approvedBy' in decision && `Approuvé par ${decision.approvedBy}`}
                    {'rejectedBy' in decision && `Rejeté par ${decision.rejectedBy}`}
                    {' • '}
                    {new Date(decision.date).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <div className={cn('px-3 py-1 rounded-full text-xs font-medium', getPriorityColor(decision.priority))}>
                  {decision.priority}
                </div>
              </div>

              {activeTab === 'pending' && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="bg-emerald-500 hover:bg-emerald-600 text-white"
                    onClick={() => logger.debug('Approve', { component: 'AdvancedModals', id: decision.id })}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    Approuver
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-slate-700 text-slate-300 hover:bg-rose-500/10 hover:border-rose-500"
                    onClick={() => logger.info('Reject', { component: 'AdvancedModals', decisionId: decision.id })}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Rejeter
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-slate-400"
                    onClick={() => logger.debug('View details', { component: 'AdvancedModals', id: decision.id })}
                  >
                    Détails
                  </Button>
                </div>
              )}

              {'reason' in decision && decision.reason && (
                <div className="mt-2 p-2 rounded bg-slate-900/50 text-xs text-slate-400">
                  <span className="text-slate-400">Raison:</span> {decision.reason}
                </div>
              )}
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button onClick={onClose} variant="outline" className="border-slate-700 text-slate-300">
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// GANTT VIEW - Vue Gantt simplifiée
// ═══════════════════════════════════════════════════════════════════════════

interface GanttViewProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GanttViewModal({ isOpen, onClose }: GanttViewProps) {
  const projects = [
    { id: '1', title: 'Projet Alpha', start: '2024-01-01', end: '2024-03-31', progress: 75, color: 'bg-emerald-500' },
    { id: '2', title: 'Projet Beta', start: '2024-02-01', end: '2024-05-31', progress: 45, color: 'bg-blue-500' },
    { id: '3', title: 'Projet Gamma', start: '2024-03-01', end: '2024-06-30', progress: 20, color: 'bg-purple-500' },
    { id: '4', title: 'Projet Delta', start: '2024-01-15', end: '2024-04-15', progress: 90, color: 'bg-cyan-500' },
  ];

  const months = ['Janv', 'Févr', 'Mars', 'Avr', 'Mai', 'Juin', 'Juil'];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-xl text-slate-100 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-orange-400" />
            Vue Gantt - Planning Global
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Visualisation chronologique des projets
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Timeline Header */}
          <div className="flex gap-2 pl-48">
            {months.map((month) => (
              <div key={month} className="flex-1 text-center text-xs text-slate-400 border-l border-slate-700 py-2">
                {month}
              </div>
            ))}
          </div>

          {/* Projects */}
          <div className="space-y-3">
            {projects.map((project) => (
              <div key={project.id} className="flex items-center gap-2">
                <div className="w-44 text-sm text-slate-300 truncate">{project.title}</div>
                <div className="flex-1 relative h-10 bg-slate-800 rounded-lg border border-slate-700">
                  <div
                    className={cn(
                      'absolute h-full rounded-lg flex items-center px-3 text-xs font-medium text-white',
                      project.color
                    )}
                    style={{
                      left: '10%',
                      width: `${project.progress}%`,
                    }}
                  >
                    {project.progress}%
                  </div>
                  <GripHorizontal className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose} variant="outline" className="border-slate-700 text-slate-300">
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

