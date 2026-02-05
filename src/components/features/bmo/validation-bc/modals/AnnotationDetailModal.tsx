/**
 * Modal de détail d'annotation - Pattern Modal Overlay
 * Affiche les détails complets d'une annotation avec navigation prev/next
 */

'use client';

import React from 'react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DetailModal, useDetailNavigation } from '@/components/ui/detail-modal';
import {
  MessageSquare,
  Clock,
  User,
  Edit2,
  Trash2,
  FileWarning,
  Loader2,
} from 'lucide-react';
import type { DocumentAnnotation, DocumentAnomaly } from '@/lib/types/document-validation.types';

interface AnnotationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  annotation: DocumentAnnotation | null;
  annotations: DocumentAnnotation[];
  linkedAnomaly?: DocumentAnomaly | null;
  onUpdate?: (annotationId: string, comment: string) => void;
  onDelete?: (annotationId: string) => void;
  isUpdating?: boolean;
  isDeleting?: boolean;
  onNavigatePrev?: (prevAnnotation: DocumentAnnotation) => void;
  onNavigateNext?: (nextAnnotation: DocumentAnnotation) => void;
  onEdit?: (annotation: DocumentAnnotation) => void;
}

const typeConfig = {
  comment: {
    icon: MessageSquare,
    color: 'blue',
    label: 'Commentaire',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    textColor: 'text-blue-400',
  },
  correction: {
    icon: Edit2,
    color: 'amber',
    label: 'Correction',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    textColor: 'text-amber-400',
  },
  approval: {
    icon: MessageSquare,
    color: 'emerald',
    label: 'Approbation',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    textColor: 'text-emerald-400',
  },
  rejection: {
    icon: Trash2,
    color: 'red',
    label: 'Rejet',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
    textColor: 'text-red-400',
  },
};

export function AnnotationDetailModal({
  isOpen,
  onClose,
  annotation,
  annotations,
  linkedAnomaly,
  onUpdate,
  onDelete,
  isUpdating = false,
  isDeleting = false,
  onNavigatePrev,
  onNavigateNext,
  onEdit,
}: AnnotationDetailModalProps) {
  if (!annotation) return null;

  const {
    canNavigatePrev,
    canNavigateNext,
    navigatePrev,
    navigateNext,
    currentIndex,
    totalItems,
  } = useDetailNavigation(annotations, annotation);

  const type = typeConfig[annotation.type || 'comment'];
  const TypeIcon = type.icon;

  const handleDelete = () => {
    if (onDelete && window.confirm('Êtes-vous sûr de vouloir supprimer cette annotation ?')) {
      onDelete(annotation.id);
      onClose();
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(annotation);
      onClose();
    }
  };

  return (
    <DetailModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Annotation #${currentIndex + 1} sur ${totalItems}`}
      subtitle={annotation.field ? `Champ: ${annotation.field.replace(/_/g, ' ')}` : undefined}
      icon={<TypeIcon className="w-5 h-5" />}
      accentColor={type.color}
      size="xl"
      position="right"
      canNavigatePrev={canNavigatePrev}
      canNavigateNext={canNavigateNext}
      onNavigatePrev={() => {
        const prev = navigatePrev();
        if (prev && onNavigatePrev) {
          onNavigatePrev(prev);
        }
      }}
      onNavigateNext={() => {
        const next = navigateNext();
        if (next && onNavigateNext) {
          onNavigateNext(next);
        }
      }}
      footer={
        <div className="flex items-center justify-between">
          <div className="text-xs text-slate-400">
            Navigation: ← → | Fermer: ESC
          </div>
          <div className="flex items-center gap-2">
            {onEdit && (
              <Button
                variant="ghost"
                onClick={handleEdit}
                disabled={isUpdating || isDeleting}
                className="text-slate-400 hover:text-slate-200"
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Modifier
              </Button>
            )}
            {onDelete && (
              <Button
                onClick={handleDelete}
                disabled={isUpdating || isDeleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Suppression...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Supprimer
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      }
    >
      <div className="p-6 space-y-6">
        {/* Header avec type */}
        <div className={cn(
          'p-4 rounded-lg border',
          type.bgColor,
          type.borderColor
        )}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              <div className={cn('p-2 rounded-lg', type.bgColor)}>
                <TypeIcon className={cn('w-6 h-6', type.textColor)} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <Badge className={cn(
                    'text-xs font-medium border',
                    type.bgColor,
                    type.textColor,
                    type.borderColor
                  )}>
                    {type.label}
                  </Badge>
                  {annotation.field && (
                    <Badge variant="outline" className="text-xs bg-slate-800/50 text-slate-400 border-slate-700/50 font-mono">
                      {annotation.field}
                    </Badge>
                  )}
                  {linkedAnomaly && (
                    <Badge variant="outline" className="text-xs bg-amber-500/20 text-amber-400 border-amber-500/30">
                      <FileWarning className="w-3 h-3 mr-1" />
                      Liée à une anomalie
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Commentaire */}
        <div className="bg-slate-800/40 rounded-lg p-4 border border-slate-700/30">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">
              Commentaire
            </span>
          </div>
          <p className="text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">
            {annotation.comment}
          </p>
        </div>

        {/* Informations détaillées */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Date de création */}
          <div className="bg-slate-800/40 rounded-lg p-4 border border-slate-700/30">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                Créé le
              </span>
            </div>
            <p className="text-sm text-slate-200 font-medium">
              {new Date(annotation.createdAt).toLocaleDateString('fr-FR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              à {new Date(annotation.createdAt).toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
            {annotation.createdBy && (
              <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-700/30">
                <User className="w-3 h-3 text-slate-400" />
                <span className="text-xs text-slate-400">
                  Par: {annotation.createdBy}
                </span>
              </div>
            )}
          </div>

          {/* Anomalie liée */}
          {linkedAnomaly && (
            <div className="bg-amber-500/10 rounded-lg p-4 border border-amber-500/20">
              <div className="flex items-center gap-2 mb-2">
                <FileWarning className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-medium text-amber-400 uppercase tracking-wide">
                  Anomalie liée
                </span>
              </div>
              <p className="text-sm text-amber-200 font-medium mb-1">
                {linkedAnomaly.message}
              </p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <Badge className={cn(
                  'text-xs',
                  linkedAnomaly.severity === 'critical' || linkedAnomaly.severity === 'error'
                    ? 'bg-red-500/20 text-red-400 border-red-500/30'
                    : linkedAnomaly.severity === 'warning'
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                    : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                )}>
                  {linkedAnomaly.severity}
                </Badge>
                {linkedAnomaly.field && (
                  <Badge variant="outline" className="text-xs bg-slate-800/50 text-slate-400 border-slate-700/50">
                    {linkedAnomaly.field}
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Métadonnées supplémentaires */}
        {annotation.documentId && (
          <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/30">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                Document
              </span>
            </div>
            <p className="text-sm text-slate-300 font-mono">
              {annotation.documentId}
            </p>
          </div>
        )}
      </div>
    </DetailModal>
  );
}

