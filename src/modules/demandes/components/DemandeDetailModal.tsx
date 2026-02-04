/**
 * Modal de détail de demande
 * Utilise GenericDetailModal avec onglets et actions
 */

'use client';

import React, { useMemo, useState } from 'react';
import { GenericDetailModal, type TabConfig, type ActionButton } from '@/components/ui/GenericDetailModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  FileText,
  Clock,
  User,
  Calendar,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Paperclip,
  History,
  Send,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import type { Demande } from '../types/demandesTypes';
import { useToast } from '@/components/features/bmo/ToastProvider';

interface DemandeDetailModalProps {
  isOpen: boolean;
  demande: Demande | null;
  onClose: () => void;
  onValidate?: (id: string, comment?: string) => Promise<void>;
  onReject?: (id: string, reason: string) => Promise<void>;
  onRequestComplement?: (id: string, message: string) => Promise<void>;
  // Navigation prev/next
  onPrevious?: () => void;
  onNext?: () => void;
  hasNext?: boolean;
  hasPrevious?: boolean;
  // Liste pour navigation
  allDemandes?: Demande[];
}

export function DemandeDetailModal({
  isOpen,
  demande,
  onClose,
  onValidate,
  onReject,
  onRequestComplement,
  onPrevious,
  onNext,
  hasNext = false,
  hasPrevious = false,
  allDemandes = [],
}: DemandeDetailModalProps) {
  const toast = useToast();
  const [actionComment, setActionComment] = useState('');
  const [actionType, setActionType] = useState<'validate' | 'reject' | 'complement' | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!demande) return null;

  const getStatusBadge = () => {
    switch (demande.status) {
      case 'validated':
        return { label: 'Validée', variant: 'success' as const };
      case 'rejected':
        return { label: 'Rejetée', variant: 'critical' as const };
      case 'urgent':
        return { label: 'Urgente', variant: 'critical' as const };
      case 'overdue':
        return { label: 'En retard', variant: 'critical' as const };
      case 'pending':
      default:
        return { label: 'En attente', variant: 'warning' as const };
    }
  };

  const getPriorityBadge = () => {
    switch (demande.priority) {
      case 'critical':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'high':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'normal':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'low':
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const handleAction = async () => {
    if (!actionType || !demande) return;

    setIsLoading(true);
    try {
      switch (actionType) {
        case 'validate':
          if (onValidate) {
            await onValidate(demande.id, actionComment || undefined);
            toast.success('Demande validée avec succès');
            setActionType(null);
            setActionComment('');
            onClose();
          }
          break;
        case 'reject':
          if (!actionComment.trim()) {
            toast.error('Veuillez indiquer une raison pour le rejet');
            setIsLoading(false);
            return;
          }
          if (onReject) {
            await onReject(demande.id, actionComment);
            toast.success('Demande rejetée');
            setActionType(null);
            setActionComment('');
            onClose();
          }
          break;
        case 'complement':
          if (!actionComment.trim()) {
            toast.error('Veuillez indiquer le complément demandé');
            setIsLoading(false);
            return;
          }
          if (onRequestComplement) {
            await onRequestComplement(demande.id, actionComment);
            toast.info('Complément demandé avec succès');
            setActionType(null);
            setActionComment('');
            onClose();
          }
          break;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue lors de l\'action';
      toast.error('Erreur', errorMessage);
      // Log uniquement en développement
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.error('Action error:', error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Onglet Détails
  const detailsTab: TabConfig = {
    id: 'details',
    label: 'Détails',
    icon: <FileText className="h-4 w-4" />,
    content: (
      <div className="space-y-6">
        {/* Informations principales */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label className="text-xs text-slate-400 mb-1 block">Référence</Label>
            <p className="font-mono text-sm text-slate-200">{demande.reference}</p>
          </div>
          <div>
            <Label className="text-xs text-slate-400 mb-1 block">Service</Label>
            <Badge variant="outline" className="capitalize">{demande.service}</Badge>
          </div>
          {demande.montant && (
            <div>
              <Label className="text-xs text-slate-400 mb-1 block">Montant</Label>
              <p className="font-semibold text-amber-400">
                {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(demande.montant)}
              </p>
            </div>
          )}
          <div>
            <Label className="text-xs text-slate-400 mb-1 block">Priorité</Label>
            <Badge className={cn('text-xs', getPriorityBadge())}>
              {demande.priority === 'critical' ? 'Critique' : demande.priority === 'high' ? 'Haute' : demande.priority === 'normal' ? 'Normale' : 'Basse'}
            </Badge>
          </div>
          <div>
            <Label className="text-xs text-slate-400 mb-1 block">Créée le</Label>
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <Calendar className="h-4 w-4" />
              {demande.createdAt.toLocaleDateString('fr-FR', { dateStyle: 'full' })}
            </div>
          </div>
          {demande.dueDate && (
            <div>
              <Label className="text-xs text-slate-400 mb-1 block">Échéance</Label>
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <Clock className="h-4 w-4" />
                {demande.dueDate.toLocaleDateString('fr-FR', { dateStyle: 'full' })}
              </div>
            </div>
          )}
          <div>
            <Label className="text-xs text-slate-400 mb-1 block">Créée par</Label>
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <User className="h-4 w-4" />
              {demande.createdBy}
            </div>
          </div>
          {demande.assignedTo && (
            <div>
              <Label className="text-xs text-slate-400 mb-1 block">Assignée à</Label>
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <User className="h-4 w-4" />
                {demande.assignedTo}
              </div>
            </div>
          )}
        </div>

        {/* Description */}
        <div>
          <Label className="text-xs text-slate-400 mb-2 block">Description</Label>
          <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
            <p className="text-sm text-slate-300 whitespace-pre-wrap">
              {demande.description || 'Aucune description disponible'}
            </p>
          </div>
        </div>

        {/* Actions contextuelles */}
        {(demande.status === 'pending' || demande.status === 'urgent') && actionType === null && (
          <div className="pt-4 border-t border-slate-700/50 space-y-3">
            <Label className="text-xs font-medium text-slate-300 block">Actions disponibles</Label>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="default"
                size="sm"
                onClick={() => setActionType('validate')}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Valider
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setActionType('reject')}
              >
                <XCircle className="h-4 w-4 mr-1" />
                Rejeter
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActionType('complement')}
              >
                <MessageSquare className="h-4 w-4 mr-1" />
                Demander complément
              </Button>
            </div>
          </div>
        )}

        {/* Formulaire d'action */}
        {actionType !== null && (
          <div className="pt-4 border-t border-slate-700/50 space-y-3">
            <Label className="text-xs font-medium text-slate-300 block">
              {actionType === 'validate' && 'Commentaire (optionnel)'}
              {actionType === 'reject' && 'Raison du rejet *'}
              {actionType === 'complement' && 'Message du complément *'}
            </Label>
            <Textarea
              value={actionComment}
              onChange={(e) => setActionComment(e.target.value)}
              placeholder={
                actionType === 'validate' ? 'Ajouter un commentaire...'
                : actionType === 'reject' ? 'Indiquer la raison du rejet...'
                : 'Décrire le complément demandé...'
              }
              className="min-h-[100px] bg-slate-800/50 border-slate-700/50 text-slate-200"
              disabled={isLoading}
            />
            <div className="flex gap-2">
              <Button
                variant="default"
                size="sm"
                onClick={handleAction}
                disabled={isLoading || (actionType !== 'validate' && !actionComment.trim())}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                )}
                {actionType === 'validate' && 'Confirmer la validation'}
                {actionType === 'reject' && 'Confirmer le rejet'}
                {actionType === 'complement' && 'Envoyer la demande'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setActionType(null);
                  setActionComment('');
                }}
                disabled={isLoading}
              >
                Annuler
              </Button>
            </div>
          </div>
        )}
      </div>
    ),
  };

  // Onglet Documents
  const documentsTab: TabConfig = {
    id: 'documents',
    label: 'Documents',
    icon: <Paperclip className="h-4 w-4" />,
    content: (
      <div className="space-y-4">
        <div className="text-center py-12 text-slate-400">
          <Paperclip className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Aucun document attaché pour le moment</p>
        </div>
      </div>
    ),
  };

  // Onglet Historique
  const historyTab: TabConfig = {
    id: 'history',
    label: 'Historique',
    icon: <History className="h-4 w-4" />,
    content: (
      <div className="space-y-3">
        <div className="p-4 rounded-lg border-l-4 border-l-blue-500 bg-blue-500/10">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-sm text-slate-200">Création</span>
            <span className="text-xs text-slate-400">{demande.createdAt.toLocaleString('fr-FR')}</span>
          </div>
          <p className="text-xs text-slate-400">Demande créée par {demande.createdBy}</p>
        </div>
        {demande.updatedAt && demande.updatedAt.getTime() !== demande.createdAt.getTime() && (
          <div className="p-4 rounded-lg border-l-4 border-l-amber-500 bg-amber-500/10">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-sm text-slate-200">Dernière modification</span>
              <span className="text-xs text-slate-400">{demande.updatedAt.toLocaleString('fr-FR')}</span>
            </div>
          </div>
        )}
      </div>
    ),
  };

  // Onglet Commentaires
  const commentsTab: TabConfig = {
    id: 'comments',
    label: 'Commentaires',
    icon: <MessageSquare className="h-4 w-4" />,
    content: (
      <div className="space-y-4">
        <div className="text-center py-12 text-slate-400">
          <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Aucun commentaire pour le moment</p>
        </div>
      </div>
    ),
  };

  const tabs: TabConfig[] = [detailsTab, documentsTab, historyTab, commentsTab];

  // Actions du footer (seulement si pas d'action en cours)
  const actions: ActionButton[] = useMemo(() => {
    if (actionType !== null) return [];

    const actionButtons: ActionButton[] = [];

    if ((demande.status === 'pending' || demande.status === 'urgent') && onValidate) {
      actionButtons.push({
        id: 'validate',
        label: 'Valider',
        icon: <CheckCircle2 className="h-4 w-4" />,
        variant: 'default',
        onClick: () => setActionType('validate'),
      });
    }

    if ((demande.status === 'pending' || demande.status === 'urgent') && onReject) {
      actionButtons.push({
        id: 'reject',
        label: 'Rejeter',
        icon: <XCircle className="h-4 w-4" />,
        variant: 'destructive',
        onClick: () => setActionType('reject'),
      });
    }

    return actionButtons;
  }, [demande.status, actionType, onValidate, onReject]);

  return (
    <GenericDetailModal
      isOpen={isOpen}
      onClose={onClose}
      title={demande.title}
      subtitle={demande.reference}
      statusBadge={getStatusBadge()}
      tabs={tabs}
      actions={actions}
      onPrevious={onPrevious}
      onNext={onNext}
      hasNext={hasNext}
      hasPrevious={hasPrevious}
      size="xl"
      loading={isLoading}
    />
  );
}

