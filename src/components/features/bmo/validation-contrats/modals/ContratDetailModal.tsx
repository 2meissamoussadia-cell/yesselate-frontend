/**
 * Modal de détail de contrat avec tous les onglets
 * Vue complète : Détails, Clauses, Documents, Workflow, Commentaires, Historique
 */

'use client';

import React, { useState, useMemo } from 'react';
import { cn } from '@/lib/cn';
import { logger } from '@/lib/utils/logger';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  FileText,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Building2,
  Calendar,
  DollarSign,
  Clock,
  User,
  MessageSquare,
  Download,
  Upload,
  History,
  GitBranch,
  X,
  Check,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import type { Contrat } from '@/lib/services/contratsApiService';

interface ContratDetailModalProps {
  open: boolean;
  contrat: Contrat | null;
  onClose: () => void;
  onValidate: (id: string, decision: any) => Promise<void>;
  onReject: (id: string, reason: string) => Promise<void>;
  onNegotiate: (id: string, terms: string) => Promise<void>;
  onEscalate: (id: string, to: string, reason: string) => Promise<void>;
  // Navigation prev/next
  onPrevious?: () => void;
  onNext?: () => void;
  hasNext?: boolean;
  hasPrevious?: boolean;
}

type TabType = 'details' | 'clauses' | 'documents' | 'workflow' | 'comments' | 'historique';

export function ContratDetailModal({
  open,
  contrat,
  onClose,
  onValidate,
  onReject,
  onNegotiate,
  onEscalate,
  onPrevious,
  onNext,
  hasNext = false,
  hasPrevious = false,
}: ContratDetailModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('details');
  const [actionType, setActionType] = useState<'validate' | 'reject' | 'negotiate' | 'escalate' | null>(null);
  const [actionNote, setActionNote] = useState('');
  const [escalateTo, setEscalateTo] = useState('');

  if (!contrat) return null;

  const handleAction = async () => {
    if (!actionType) return;

    try {
      switch (actionType) {
        case 'validate':
          await onValidate(contrat.id, {
            approved: true,
            approvedBy: 'current-user',
            approvedAt: new Date().toISOString(),
            comment: actionNote,
          });
          break;
        case 'reject':
          if (!actionNote || actionNote.trim().length < 10) {
            alert('La raison du rejet doit contenir au moins 10 caractères');
            return;
          }
          await onReject(contrat.id, actionNote);
          break;
        case 'negotiate':
          if (!actionNote || actionNote.trim().length < 10) {
            alert('Les termes de négociation doivent contenir au moins 10 caractères');
            return;
          }
          await onNegotiate(contrat.id, actionNote);
          break;
        case 'escalate':
          if (!escalateTo || !actionNote || actionNote.trim().length < 10) {
            alert('Destinataire et raison requis (minimum 10 caractères)');
            return;
          }
          await onEscalate(contrat.id, escalateTo, actionNote);
          break;
      }
      
      setActionType(null);
      setActionNote('');
      setEscalateTo('');
      onClose();
    } catch (error) {
      logger.error('Erreur action', error instanceof Error ? error : undefined, { component: 'ContratDetailModal' });
    }
  };

  const tabs = [
    { id: 'details', label: 'Détails', icon: FileText },
    { id: 'clauses', label: 'Clauses', icon: AlertTriangle },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'workflow', label: 'Workflow', icon: GitBranch },
    { id: 'comments', label: 'Commentaires', icon: MessageSquare },
    { id: 'historique', label: 'Historique', icon: History },
  ] as const;

  const statusColors = {
    pending: 'bg-amber-500/20 text-amber-600 border-amber-500/30',
    validated: 'bg-emerald-500/20 text-emerald-600 border-emerald-500/30',
    rejected: 'bg-red-500/20 text-red-600 border-red-500/30',
    negotiation: 'bg-blue-500/20 text-blue-600 border-blue-500/30',
    expired: 'bg-slate-500/20 text-slate-600 border-slate-500/30',
    signed: 'bg-emerald-500/20 text-emerald-600 border-emerald-500/30',
  };

  const urgencyColors = {
    low: 'bg-slate-500/20 text-slate-600',
    medium: 'bg-blue-500/20 text-blue-600',
    high: 'bg-amber-500/20 text-amber-600',
    critical: 'bg-red-500/20 text-red-600',
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-xl text-slate-200">
                {contrat.reference} - {contrat.title}
              </DialogTitle>
              <div className="flex items-center gap-2 mt-2">
                <Badge className={cn('text-xs', statusColors[contrat.status])}>
                  {contrat.status}
                </Badge>
                <Badge className={cn('text-xs', urgencyColors[contrat.urgency])}>
                  {contrat.urgency}
                </Badge>
              </div>
            </div>
            
            {/* Navigation prev/next */}
            {(onPrevious || onNext) && (
              <div className="flex items-center gap-1 ml-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onPrevious}
                  disabled={!hasPrevious}
                  title="Contrat précédent (←)"
                  className="text-slate-400 hover:text-slate-200"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onNext}
                  disabled={!hasNext}
                  title="Contrat suivant (→)"
                  className="text-slate-400 hover:text-slate-200"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-slate-700/50 -mx-6 px-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border-b-2',
                  activeTab === tab.id
                    ? 'text-purple-400 border-purple-500'
                    : 'text-slate-400 border-transparent hover:text-slate-300'
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto -mx-6 px-6 py-4">
          {activeTab === 'details' && <DetailsTab contrat={contrat} />}
          {activeTab === 'clauses' && <ClausesTab contrat={contrat} />}
          {activeTab === 'documents' && <DocumentsTab contrat={contrat} />}
          {activeTab === 'workflow' && <WorkflowTab contrat={contrat} />}
          {activeTab === 'comments' && <CommentsTab contrat={contrat} />}
          {activeTab === 'historique' && <HistoriqueTab contrat={contrat} />}
        </div>

        {/* Actions */}
        {!actionType ? (
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-700/50 -mx-6 px-6">
            <Button
              variant="outline"
              onClick={onClose}
              className="border-slate-700 text-slate-400 hover:text-slate-200"
            >
              Fermer
            </Button>
            <Button
              onClick={() => setActionType('escalate')}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              Escalader
            </Button>
            <Button
              onClick={() => setActionType('negotiate')}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              Négocier
            </Button>
            <Button
              onClick={() => setActionType('reject')}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Rejeter
            </Button>
            <Button
              onClick={() => setActionType('validate')}
              className="bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              Valider
            </Button>
          </div>
        ) : (
          <div className="space-y-3 pt-4 border-t border-slate-700/50 -mx-6 px-6">
            {actionType === 'escalate' && (
              <div className="space-y-2">
                <Label className="text-slate-300">Escalader vers</Label>
                <Select value={escalateTo || '__none__'} onValueChange={(value: string) => setEscalateTo(value === '__none__' ? '' : value)}>
                  <SelectTrigger className="w-full bg-slate-800 border-slate-700 text-slate-200 rounded-md px-3 py-2">
                    <SelectValue placeholder="Sélectionner..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Sélectionner...</SelectItem>
                    <SelectItem value="direction">Direction</SelectItem>
                    <SelectItem value="dg">Directeur Général</SelectItem>
                    <SelectItem value="comite">Comité de Direction</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label className="text-slate-300">
                {actionType === 'validate' && 'Commentaire (optionnel)'}
                {actionType === 'reject' && 'Raison du rejet *'}
                {actionType === 'negotiate' && 'Termes de négociation *'}
                {actionType === 'escalate' && 'Raison de l\'escalade *'}
              </Label>
              <Textarea
                value={actionNote}
                onChange={(e) => setActionNote(e.target.value)}
                placeholder={
                  actionType === 'validate'
                    ? 'Ajouter un commentaire...'
                    : 'Minimum 10 caractères requis...'
                }
                className="bg-slate-800 border-slate-700 text-slate-200 min-h-[100px]"
              />
              {actionNote.length > 0 && actionNote.length < 10 && actionType !== 'validate' && (
                <p className="text-xs text-red-400">Minimum 10 caractères ({actionNote.length}/10)</p>
              )}
            </div>
            <div className="flex items-center justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setActionType(null);
                  setActionNote('');
                  setEscalateTo('');
                }}
                className="border-slate-700 text-slate-400"
              >
                Annuler
              </Button>
              <Button
                onClick={handleAction}
                className={cn(
                  'text-white',
                  actionType === 'validate' && 'bg-emerald-500 hover:bg-emerald-600',
                  actionType === 'reject' && 'bg-red-500 hover:bg-red-600',
                  actionType === 'negotiate' && 'bg-blue-500 hover:bg-blue-600',
                  actionType === 'escalate' && 'bg-orange-500 hover:bg-orange-600'
                )}
              >
                Confirmer
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ================================
// Onglet Détails
// ================================
function DetailsTab({ contrat }: { contrat: Contrat }) {
  return (
    <div className="space-y-6">
      {/* Informations générales */}
      <div className="grid grid-cols-2 gap-4">
        <InfoField icon={FileText} label="Référence" value={contrat.reference} />
        <InfoField icon={Building2} label="Type" value={contrat.type} />
        <InfoField icon={DollarSign} label="Montant" value={`${(contrat.montant / 1000000).toFixed(1)}M ${contrat.devise}`} />
        <InfoField icon={Clock} label="Durée" value={`${contrat.duree} mois`} />
        <InfoField icon={Calendar} label="Date début" value={new Date(contrat.dateDebut).toLocaleDateString('fr-FR')} />
        <InfoField icon={Calendar} label="Date fin" value={new Date(contrat.dateFin).toLocaleDateString('fr-FR')} />
        <InfoField icon={User} label="Bureau" value={contrat.bureau} />
        <InfoField icon={User} label="Responsable" value={contrat.responsible} />
      </div>

      {/* Fournisseur */}
      <div className="bg-slate-800/40 rounded-lg p-4 border border-slate-700/50">
        <h3 className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          Fournisseur
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-slate-400">Nom</p>
            <p className="text-sm text-slate-300">{contrat.fournisseur.name}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Contact</p>
            <p className="text-sm text-slate-300">{contrat.fournisseur.contact}</p>
          </div>
          <div className="col-span-2">
            <p className="text-xs text-slate-400">Email</p>
            <p className="text-sm text-slate-300">{contrat.fournisseur.email}</p>
          </div>
        </div>
      </div>

      {/* Description */}
      <div>
        <h3 className="text-sm font-medium text-slate-300 mb-2">Description</h3>
        <p className="text-sm text-slate-400">{contrat.description}</p>
      </div>

      {/* Conditions */}
      <div className="bg-slate-800/40 rounded-lg p-4 border border-slate-700/50">
        <h3 className="text-sm font-medium text-slate-300 mb-3">Conditions</h3>
        <div className="space-y-2">
          <ConditionLine label="Paiement" value={contrat.conditions.paiement} />
          <ConditionLine label="Livraison" value={contrat.conditions.livraison} />
          <ConditionLine label="Garantie" value={contrat.conditions.garantie} />
          <ConditionLine label="Pénalités" value={contrat.conditions.penalites} />
        </div>
      </div>
    </div>
  );
}

// ================================
// Onglet Clauses
// ================================
function ClausesTab({ contrat }: { contrat: Contrat }) {
  const clauseStatusIcons = {
    ok: CheckCircle,
    warning: AlertTriangle,
    ko: XCircle,
  };

  const clauseStatusColors = {
    ok: 'text-emerald-500',
    warning: 'text-amber-500',
    ko: 'text-red-500',
  };

  return (
    <div className="space-y-3">
      {contrat.clauses.map((clause) => {
        const Icon = clauseStatusIcons[clause.status];
        return (
          <div
            key={clause.id}
            className="bg-slate-800/40 rounded-lg p-4 border border-slate-700/50"
          >
            <div className="flex items-start gap-3">
              <Icon className={cn('h-5 w-5 mt-0.5 flex-shrink-0', clauseStatusColors[clause.status])} />
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-slate-200">{clause.title}</h4>
                <p className="text-sm text-slate-400 mt-1">{clause.content}</p>
                {clause.comment && (
                  <div className="mt-2 p-2 bg-slate-900/50 rounded border border-slate-700/30">
                    <p className="text-xs text-slate-400">Commentaire:</p>
                    <p className="text-xs text-slate-400 mt-0.5">{clause.comment}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ================================
// Onglet Documents
// ================================
function DocumentsTab({ contrat }: { contrat: Contrat }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-slate-300">
          {contrat.documents.length} document(s)
        </h3>
        <Button size="sm" className="bg-purple-500 hover:bg-purple-600">
          <Upload className="h-4 w-4 mr-2" />
          Ajouter
        </Button>
      </div>

      {contrat.documents.map((doc) => (
        <div
          key={doc.id}
          className="bg-slate-800/40 rounded-lg p-4 border border-slate-700/50 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <FileText className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-200">{doc.name}</p>
              <p className="text-xs text-slate-400">
                {(doc.size / 1024 / 1024).toFixed(2)} MB • {new Date(doc.uploadedAt).toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>
          <Button size="sm" variant="ghost" className="text-slate-400 hover:text-slate-200">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}

// ================================
// Onglet Workflow
// ================================
function WorkflowTab({ contrat }: { contrat: Contrat }) {
  const validations = [
    { key: 'juridique', label: 'Validation Juridique', done: contrat.validations.juridique },
    { key: 'technique', label: 'Validation Technique', done: contrat.validations.technique },
    { key: 'financier', label: 'Validation Financière', done: contrat.validations.financier },
    { key: 'direction', label: 'Validation Direction', done: contrat.validations.direction },
  ];

  return (
    <div className="space-y-4">
      <div className="relative">
        {validations.map((validation, index) => (
          <div key={validation.key} className="flex items-center gap-4 pb-8 last:pb-0">
            <div className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center border-2 flex-shrink-0 z-10 bg-slate-900',
              validation.done
                ? 'border-emerald-500 bg-emerald-500/20'
                : 'border-slate-600 bg-slate-800'
            )}>
              {validation.done ? (
                <CheckCircle className="h-5 w-5 text-emerald-500" />
              ) : (
                <Clock className="h-5 w-5 text-slate-400" />
              )}
            </div>
            
            {index < validations.length - 1 && (
              <div className={cn(
                'absolute left-5 w-0.5 h-8 top-10',
                validation.done ? 'bg-emerald-500' : 'bg-slate-700'
              )} />
            )}
            
            <div className="flex-1">
              <p className={cn(
                'text-sm font-medium',
                validation.done ? 'text-slate-200' : 'text-slate-400'
              )}>
                {validation.label}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                {validation.done ? 'Terminé' : 'En attente'}
              </p>
            </div>
          </div>
        ))}
      </div>

      {contrat.risques.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-slate-300 mb-3">Risques identifiés</h3>
          <div className="space-y-2">
            {contrat.risques.map((risque, i) => (
              <div key={i} className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="h-4 w-4 text-red-400" />
                  <span className="text-xs font-medium text-red-400 uppercase">{risque.niveau}</span>
                </div>
                <p className="text-sm text-slate-300">{risque.description}</p>
                {risque.mitigation && (
                  <p className="text-xs text-slate-400 mt-1">Mitigation: {risque.mitigation}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ================================
// Onglet Commentaires
// ================================
function CommentsTab({ contrat }: { contrat: Contrat }) {
  const [newComment, setNewComment] = useState('');

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-slate-300">Ajouter un commentaire</Label>
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Votre commentaire..."
          className="bg-slate-800 border-slate-700 text-slate-200"
        />
        <Button size="sm" className="bg-purple-500 hover:bg-purple-600">
          Publier
        </Button>
      </div>

      <div className="border-t border-slate-700/50 pt-4 space-y-3">
        {contrat.commentaires.map((comment) => (
          <div key={comment.id} className="bg-slate-800/40 rounded-lg p-3 border border-slate-700/50">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="h-4 w-4 text-purple-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-slate-200">{comment.by}</span>
                  <span className="text-xs text-slate-400">
                    {new Date(comment.at).toLocaleDateString('fr-FR')}
                  </span>
                  <Badge className="text-xs" variant={comment.visibility === 'internal' ? 'gray' : 'default'}>
                    {comment.visibility}
                  </Badge>
                </div>
                <p className="text-sm text-slate-400">{comment.content}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ================================
// Onglet Historique
// ================================
function HistoriqueTab({ contrat }: { contrat: Contrat }) {
  return (
    <div className="space-y-3">
      {contrat.historique.map((entry, index) => (
        <div key={index} className="flex items-start gap-3">
          <div className="w-2 h-2 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium text-slate-200">{entry.action}</span>
              <span className="text-xs text-slate-400">
                {new Date(entry.at).toLocaleDateString('fr-FR')} à {new Date(entry.at).toLocaleTimeString('fr-FR')}
              </span>
            </div>
            <p className="text-sm text-slate-400">{entry.details}</p>
            <p className="text-xs text-slate-400 mt-0.5">Par: {entry.by}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ================================
// Helper Components
// ================================
function InfoField({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-400 mb-1 flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {label}
      </p>
      <p className="text-sm font-medium text-slate-200">{value}</p>
    </div>
  );
}

function ConditionLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-xs text-slate-400 min-w-[100px]">{label}:</span>
      <span className="text-xs text-slate-300">{value}</span>
    </div>
  );
}

