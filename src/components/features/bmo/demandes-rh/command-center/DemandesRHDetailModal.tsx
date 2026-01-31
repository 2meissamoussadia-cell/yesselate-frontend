/**
 * Modal de détail pour Demandes RH - Pattern Overlay
 * 
 * Affiche les détails d'une demande en modal overlay
 * Préserve le contexte (liste visible en arrière-plan)
 * Navigation rapide (précédent/suivant)
 * UX moderne et fluide
 */

'use client';

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { logger } from '@/lib/utils/logger';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Calendar,
  User,
  DollarSign,
  Plane,
  Wallet,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Download,
  Send,
  MessageSquare,
} from 'lucide-react';
import { useDemandesRHCommandCenterStore } from '@/lib/stores/demandesRHCommandCenterStore';

// Types (devraient venir d'une API ou d'un fichier types partagé)
export interface DemandeRH {
  id: string;
  type: 'conges' | 'depenses' | 'deplacement' | 'avances';
  numero: string;
  agent: {
    id: string;
    nom: string;
    matricule: string;
    bureau: string;
    poste: string;
  };
  statut: 'brouillon' | 'en_cours' | 'validee' | 'rejetee' | 'annulee';
  priorite: 'normale' | 'urgente' | 'critique';
  objet: string;
  description?: string;
  montant?: number;
  devise?: string;
  dateDebut?: string;
  dateFin?: string;
  duree?: number;
  validations: {
    niveau: number;
    valideur: string;
    statut: 'en_attente' | 'approuve' | 'rejete';
    date?: string;
    commentaire?: string;
  }[];
  documents?: {
    id: string;
    nom: string;
    type: string;
    taille: number;
    url: string;
  }[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  tags?: string[];
}

interface DemandesRHDetailModalProps {
  demandeId: string | null;
  onClose: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
}

export function DemandesRHDetailModal({
  demandeId,
  onClose,
  onPrevious,
  onNext,
  hasPrevious = false,
  hasNext = false,
}: DemandesRHDetailModalProps) {
  const [demande, setDemande] = useState<DemandeRH | null>(null);
  const [loading, setLoading] = useState(true);

  // Récupérer la demande (à remplacer par un vrai appel API)
  useEffect(() => {
    if (!demandeId) {
      setDemande(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    // TODO: Remplacer par un vrai appel API
    fetch(`/api/demandes-rh/${demandeId}`)
      .then((res) => res.json())
      .then((data) => {
        setDemande(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching demande:', error);
        setLoading(false);
      });
  }, [demandeId]);

  // Gestion des raccourcis clavier
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft' && hasPrevious && onPrevious) {
        onPrevious();
      } else if (e.key === 'ArrowRight' && hasNext && onNext) {
        onNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onPrevious, onNext, hasPrevious, hasNext]);

  if (!demandeId) return null;

  const typeIcons = {
    conges: Calendar,
    depenses: DollarSign,
    deplacement: Plane,
    avances: Wallet,
  };

  const typeLabels = {
    conges: 'Congés',
    depenses: 'Dépenses',
    deplacement: 'Déplacements',
    avances: 'Avances',
  };

  const statutColors = {
    brouillon: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    en_cours: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    validee: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    rejetee: 'bg-red-500/20 text-red-400 border-red-500/30',
    annulee: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  };

  const prioriteColors = {
    normale: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    urgente: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    critique: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  const TypeIcon = demande ? typeIcons[demande.type] : Calendar;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl max-h-[90vh] rounded-2xl border border-slate-700/50 bg-slate-900 flex flex-col overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
          </div>
        ) : demande ? (
          <>
            {/* Header */}
            <div className="p-6 border-b border-slate-800/50 bg-slate-800/30">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <TypeIcon className="h-5 w-5 text-blue-400" />
                    <span className="font-mono text-sm text-slate-400">{demande.numero}</span>
                    <Badge className={cn('text-xs', statutColors[demande.statut])}>
                      {demande.statut.replace('_', ' ')}
                    </Badge>
                    <Badge className={cn('text-xs', prioriteColors[demande.priorite])}>
                      {demande.priorite}
                    </Badge>
                  </div>
                  <h2 className="text-xl font-bold text-slate-100">{demande.objet}</h2>
                  <p className="text-sm text-slate-400 mt-1">
                    {typeLabels[demande.type]} • {demande.agent.nom} • {demande.agent.bureau}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  {/* Navigation */}
                  {hasPrevious && onPrevious && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onPrevious();
                      }}
                      className="h-8 w-8 p-0 text-slate-400 hover:text-slate-200"
                      title="Précédent (←)"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                  )}
                  {hasNext && onNext && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onNext();
                      }}
                      className="h-8 w-8 p-0 text-slate-400 hover:text-slate-200"
                      title="Suivant (→)"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="h-8 w-8 p-0 text-slate-400 hover:text-slate-200"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Informations principales */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg border border-slate-700/50 bg-slate-800/30">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-4 w-4 text-slate-400" />
                    <span className="text-sm font-medium text-slate-300">Agent</span>
                  </div>
                  <p className="text-sm text-slate-200">{demande.agent.nom}</p>
                  <p className="text-xs text-slate-400">{demande.agent.poste}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {demande.agent.matricule} • {demande.agent.bureau}
                  </p>
                </div>

                {demande.montant && (
                  <div className="p-4 rounded-lg border border-slate-700/50 bg-slate-800/30">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-4 w-4 text-slate-400" />
                      <span className="text-sm font-medium text-slate-300">Montant</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-100">
                      {demande.montant.toLocaleString()} {demande.devise || 'XOF'}
                    </p>
                  </div>
                )}

                {demande.dateDebut && demande.dateFin && (
                  <div className="p-4 rounded-lg border border-slate-700/50 bg-slate-800/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      <span className="text-sm font-medium text-slate-300">Période</span>
                    </div>
                    <p className="text-sm text-slate-200">
                      {new Date(demande.dateDebut).toLocaleDateString('fr-FR')} -{' '}
                      {new Date(demande.dateFin).toLocaleDateString('fr-FR')}
                    </p>
                    {demande.duree && (
                      <p className="text-xs text-slate-400 mt-1">{demande.duree} jour(s)</p>
                    )}
                  </div>
                )}

                <div className="p-4 rounded-lg border border-slate-700/50 bg-slate-800/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-slate-400" />
                    <span className="text-sm font-medium text-slate-300">Dates</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Créée: {new Date(demande.createdAt).toLocaleDateString('fr-FR')}
                  </p>
                  <p className="text-xs text-slate-400">
                    Modifiée: {new Date(demande.updatedAt).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>

              {/* Description */}
              {demande.description && (
                <div className="p-4 rounded-lg border border-slate-700/50 bg-slate-800/30">
                  <h3 className="text-sm font-medium text-slate-300 mb-2">Description</h3>
                  <p className="text-sm text-slate-200 whitespace-pre-wrap">{demande.description}</p>
                </div>
              )}

              {/* Validations */}
              <div className="p-4 rounded-lg border border-slate-700/50 bg-slate-800/30">
                <h3 className="text-sm font-medium text-slate-300 mb-4">Circuit de validation</h3>
                <div className="space-y-3">
                  {demande.validations.map((validation, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 rounded-lg bg-slate-900/50 border border-slate-700/30"
                    >
                      <div className="flex-shrink-0 mt-1">
                        {validation.statut === 'approuve' && (
                          <CheckCircle className="h-5 w-5 text-emerald-400" />
                        )}
                        {validation.statut === 'rejete' && (
                          <XCircle className="h-5 w-5 text-red-400" />
                        )}
                        {validation.statut === 'en_attente' && (
                          <Clock className="h-5 w-5 text-amber-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-medium text-slate-200">
                            Niveau {validation.niveau} - {validation.valideur}
                          </p>
                          {validation.date && (
                            <span className="text-xs text-slate-400">
                              {new Date(validation.date).toLocaleDateString('fr-FR')}
                            </span>
                          )}
                        </div>
                        {validation.commentaire && (
                          <p className="text-xs text-slate-400 mt-1">{validation.commentaire}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Documents */}
              {demande.documents && demande.documents.length > 0 && (
                <div className="p-4 rounded-lg border border-slate-700/50 bg-slate-800/30">
                  <h3 className="text-sm font-medium text-slate-300 mb-4">Documents joints</h3>
                  <div className="space-y-2">
                    {demande.documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-slate-900/50 border border-slate-700/30"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="h-4 w-4 text-slate-400" />
                          <div>
                            <p className="text-sm text-slate-200">{doc.nom}</p>
                            <p className="text-xs text-slate-400">
                              {(doc.taille / 1024).toFixed(2)} KB
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(doc.url, '_blank')}
                          className="h-8 px-3 text-slate-400 hover:text-slate-200"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {demande.tags && demande.tags.length > 0 && (
                <div className="p-4 rounded-lg border border-slate-700/50 bg-slate-800/30">
                  <h3 className="text-sm font-medium text-slate-300 mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {demande.tags.map((tag, index) => (
                      <Badge
                        key={index}
                        variant="default"
                        className="text-xs bg-slate-700/50 text-slate-300 border-slate-600/50"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="border-t border-slate-800/50 p-4 bg-slate-800/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {demande.statut === 'en_cours' && (
                    <>
                      <Button
                        variant="default"
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        onClick={() => {
                          // TODO: Implémenter validation
                          logger.debug('Valider', { component: 'DemandesRHDetailModal', id: demande.id });
                        }}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Valider
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          // TODO: Implémenter rejet
                          logger.debug('Rejeter', { component: 'DemandesRHDetailModal', id: demande.id });
                        }}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Rejeter
                      </Button>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="default"
                    size="sm"
                    className="border-slate-700 text-slate-400 hover:text-slate-200"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Commenter
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={onClose}
                    className="border-slate-700 text-slate-400 hover:text-slate-200"
                  >
                    Fermer
                  </Button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-amber-400 mx-auto mb-4" />
              <p className="text-slate-400">Demande introuvable</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

