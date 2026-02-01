/**
 * Modal de détail complète pour une décision
 * Pattern overlay avec onglets - Inspiré de tickets-clients
 */

'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  X,
  Gavel,
  Clock,
  User,
  Users,
  DollarSign,
  Zap,
  Target,
  CheckCircle,
  FileText,
  MessageSquare,
  History,
  Settings,
  ArrowLeft,
  ArrowRight,
  Download,
  Share2,
  Edit,
  Trash2,
  Send,
  Paperclip,
  Calendar,
  Building2,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import { decisionsApiService, type Decision } from '@/lib/services/decisionsApiService';

interface DecisionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  decisionId: string | null;
  onNext?: () => void;
  onPrevious?: () => void;
  hasNext?: boolean;
  hasPrevious?: boolean;
}

type TabId = 'details' | 'timeline' | 'documents' | 'discussion' | 'actions';

export function DecisionDetailModal({
  isOpen,
  onClose,
  decisionId,
  onNext,
  onPrevious,
  hasNext = false,
  hasPrevious = false,
}: DecisionDetailModalProps) {
  const [decision, setDecision] = useState<Decision | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('details');
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (isOpen && decisionId) {
      setLoading(true);
      decisionsApiService
        .getById(decisionId)
        .then((data) => {
          setDecision(data || null);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    } else {
      setDecision(null);
      setActiveTab('details');
    }
  }, [isOpen, decisionId]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft' && hasPrevious && onPrevious) {
        e.preventDefault();
        onPrevious();
      } else if (e.key === 'ArrowRight' && hasNext && onNext) {
        e.preventDefault();
        onNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, hasNext, hasPrevious, onNext, onPrevious, onClose]);

  if (!isOpen) return null;

  const tabs: { id: TabId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'details', label: 'Détails', icon: FileText },
    { id: 'timeline', label: 'Timeline', icon: History },
    { id: 'documents', label: 'Documents', icon: Paperclip },
    { id: 'discussion', label: 'Discussion', icon: MessageSquare },
    { id: 'actions', label: 'Actions', icon: Settings },
  ];

  const statusColors = {
    draft: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    pending: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    approved: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
    executed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  };

  const impactColors = {
    critical: 'bg-red-500/20 text-red-400 border-red-500/30',
    high: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    medium: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    low: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-50" onClick={onClose} />
      <div className="fixed inset-4 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-[900px] md:top-[5%] md:bottom-[5%] bg-slate-900 border border-slate-700/50 rounded-xl z-50 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {hasPrevious && onPrevious && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onPrevious}
                className="h-8 w-8 p-0 text-slate-400 hover:text-slate-200"
                title="Précédent (←)"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <div className="flex-1 min-w-0">
              {loading ? (
                <div className="h-6 bg-slate-800 rounded animate-pulse" />
              ) : decision ? (
                <>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-sm font-semibold text-slate-300">
                      {decision.ref}
                    </span>
                    <Badge
                      variant="outline"
                      className={cn('text-xs', statusColors[decision.status])}
                    >
                      {decisionsApiService.getStatusLabel(decision.status)}
                    </Badge>
                    <Badge variant="outline" className={cn('text-xs', impactColors[decision.impact])}>
                      {decision.impact}
                    </Badge>
                  </div>
                  <h2 className="text-lg font-semibold text-slate-200 truncate">
                    {decision.titre}
                  </h2>
                </>
              ) : (
                <h2 className="text-lg font-semibold text-slate-200">Décision non trouvée</h2>
              )}
            </div>
            {hasNext && onNext && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onNext}
                className="h-8 w-8 p-0 text-slate-400 hover:text-slate-200"
                title="Suivant (→)"
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 px-6 border-b border-slate-700/50 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all whitespace-nowrap border-b-2 -mb-px',
                  isActive
                    ? 'text-rose-400 border-rose-400'
                    : 'text-slate-400 border-transparent hover:text-slate-300 hover:border-slate-600'
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-400" />
            </div>
          ) : decision ? (
            <>
              {activeTab === 'details' && <DetailsTab decision={decision} />}
              {activeTab === 'timeline' && <TimelineTab decision={decision} />}
              {activeTab === 'documents' && <DocumentsTab decision={decision} />}
              {activeTab === 'discussion' && (
                <DiscussionTab decision={decision} comment={comment} setComment={setComment} />
              )}
              {activeTab === 'actions' && <ActionsTab decision={decision} />}
            </>
          ) : (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">Décision non trouvée</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {decision && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-700/50">
            <div className="flex gap-2">
              {decision.status === 'pending' && (
                <>
                  <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approuver
                  </Button>
                  <Button variant="outline" size="sm" className="border-red-500/50 text-red-400">
                    Rejeter
                  </Button>
                </>
              )}
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Modifier
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exporter
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Partager
              </Button>
              <Button variant="outline" size="sm" onClick={onClose}>
                Fermer
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// ================================
// Details Tab
// ================================
function DetailsTab({ decision }: { decision: Decision }) {
  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-2 space-y-6">
        {/* Description */}
        <div>
          <h3 className="text-sm font-semibold text-slate-300 mb-2">Description</h3>
          <p className="text-sm text-slate-400 leading-relaxed">{decision.description}</p>
        </div>

        {/* Informations principales */}
        <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">Informations principales</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-400">Type</span>
              <p className="text-slate-200 font-medium">
                {decisionsApiService.getTypeLabel(decision.type)}
              </p>
            </div>
            <div>
              <span className="text-slate-400">Niveau</span>
              <p className="text-slate-200 font-medium">
                {decisionsApiService.getNiveauLabel(decision.niveau)}
              </p>
            </div>
            <div>
              <span className="text-slate-400">Impact</span>
              <p className="text-slate-200 font-medium capitalize">{decision.impact}</p>
            </div>
            {decision.montantImpact && (
              <div>
                <span className="text-slate-400">Montant</span>
                <p className="text-emerald-400 font-semibold">
                  {decisionsApiService.formatMontant(decision.montantImpact)} FCFA
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Dates */}
        <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
          <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Dates importantes
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Date de création</span>
              <span className="text-slate-300">
                {new Date(decision.dateCreation).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </div>
            {decision.dateDecision && (
              <div className="flex justify-between">
                <span className="text-slate-400">Date de décision</span>
                <span className="text-slate-300">
                  {new Date(decision.dateDecision).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>
            )}
            {decision.dateExecution && (
              <div className="flex justify-between">
                <span className="text-slate-400">Date d'exécution</span>
                <span className="text-slate-300">
                  {new Date(decision.dateExecution).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-4">
        {/* Auteur */}
        <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
          <h4 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
            <User className="h-4 w-4" />
            Auteur
          </h4>
          <div>
            <p className="text-sm font-medium text-slate-200">{decision.auteur.name}</p>
            <p className="text-xs text-slate-400">{decision.auteur.role}</p>
          </div>
        </div>

        {/* Approbateurs */}
        <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
          <h4 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
            <Users className="h-4 w-4" />
            Approbateurs ({decision.approbateurs.length})
          </h4>
          <div className="space-y-2">
            {decision.approbateurs.map((approbateur, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-200">{approbateur.name}</p>
                  {approbateur.date && (
                    <p className="text-xs text-slate-400">
                      {new Date(approbateur.date).toLocaleDateString('fr-FR')}
                    </p>
                  )}
                </div>
                <div
                  className={cn(
                    'w-2 h-2 rounded-full',
                    approbateur.status === 'approved'
                      ? 'bg-emerald-500'
                      : approbateur.status === 'rejected'
                      ? 'bg-red-500'
                      : 'bg-amber-500'
                  )}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Dossiers liés */}
        {decision.linkedDossiers && decision.linkedDossiers.length > 0 && (
          <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
            <h4 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Dossiers liés
            </h4>
            <div className="space-y-1">
              {decision.linkedDossiers.map((dossier, idx) => (
                <a
                  key={idx}
                  href={`#${dossier}`}
                  className="text-xs text-blue-400 hover:text-blue-300 block"
                >
                  {dossier}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ================================
// Timeline Tab
// ================================
function TimelineTab({ decision }: { decision: Decision }) {
  const events = [
    {
      id: '1',
      type: 'created',
      label: 'Décision créée',
      date: decision.dateCreation,
      author: decision.auteur.name,
      description: `Créée par ${decision.auteur.name}`,
    },
    ...decision.approbateurs
      .filter((a) => a.date)
      .map((a, idx) => ({
        id: `approb-${idx}`,
        type: a.status === 'approved' ? 'approved' : 'rejected',
        label: a.status === 'approved' ? 'Approuvée' : 'Rejetée',
        date: a.date!,
        author: a.name,
        description: `${a.status === 'approved' ? 'Approuvée' : 'Rejetée'} par ${a.name}`,
      })),
    ...(decision.dateExecution
      ? [
          {
            id: 'executed',
            type: 'executed',
            label: 'Exécutée',
            date: decision.dateExecution,
            author: 'Système',
            description: 'Décision exécutée',
          },
        ]
      : []),
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-slate-300 mb-4">Historique des événements</h3>
      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-700" />
        <div className="space-y-6">
          {events.map((event, idx) => (
            <div key={event.id} className="relative flex gap-4">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center border-2 z-10',
                  event.type === 'created'
                    ? 'bg-blue-500/20 border-blue-500 text-blue-400'
                    : event.type === 'approved'
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                    : event.type === 'rejected'
                    ? 'bg-red-500/20 border-red-500 text-red-400'
                    : 'bg-purple-500/20 border-purple-500 text-purple-400'
                )}
              >
                {event.type === 'created' ? (
                  <Gavel className="h-4 w-4" />
                ) : event.type === 'approved' ? (
                  <CheckCircle className="h-4 w-4" />
                ) : event.type === 'rejected' ? (
                  <X className="h-4 w-4" />
                ) : (
                  <TrendingUp className="h-4 w-4" />
                )}
              </div>
              <div className="flex-1 pb-6">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-slate-200">{event.label}</span>
                  <span className="text-xs text-slate-400">
                    {new Date(event.date).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <p className="text-xs text-slate-400">{event.description}</p>
                <p className="text-xs text-slate-400 mt-1">Par {event.author}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ================================
// Documents Tab
// ================================
function DocumentsTab({ decision }: { decision: Decision }) {
  // Mock documents - à remplacer par vraies données
  const documents = [
    {
      id: '1',
      name: 'Document_decision.pdf',
      type: 'pdf',
      size: '2.4 MB',
      uploadedAt: '2026-01-08',
      uploadedBy: decision.auteur.name,
    },
    {
      id: '2',
      name: 'Annexe_budget.xlsx',
      type: 'excel',
      size: '856 KB',
      uploadedAt: '2026-01-08',
      uploadedBy: decision.auteur.name,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-300">Documents attachés</h3>
        <Button size="sm" variant="outline">
          <Paperclip className="h-4 w-4 mr-2" />
          Ajouter un document
        </Button>
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-slate-700 rounded-lg">
          <FileText className="h-12 w-12 text-slate-600 mx-auto mb-4" />
          <p className="text-sm text-slate-400">Aucun document attaché</p>
        </div>
      ) : (
        <div className="space-y-2">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800/70 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-slate-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-200">{doc.name}</p>
                  <p className="text-xs text-slate-400">
                    {doc.size} • {new Date(doc.uploadedAt).toLocaleDateString('fr-FR')} •{' '}
                    {doc.uploadedBy}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ================================
// Discussion Tab
// ================================
function DiscussionTab({
  decision,
  comment,
  setComment,
}: {
  decision: Decision;
  comment: string;
  setComment: (value: string) => void;
}) {
  // Mock comments - à remplacer par vraies données
  const comments = [
    {
      id: '1',
      author: decision.auteur.name,
      role: decision.auteur.role,
      text: 'Cette décision nécessite une validation rapide compte tenu de son impact critique.',
      date: decision.dateCreation,
    },
    {
      id: '2',
      author: 'Marie Dupont',
      role: 'DAF',
      text: 'Je vais examiner le budget associé et revenir vers vous.',
      date: '2026-01-09',
    },
  ];

  const handleSend = () => {
    if (comment.trim()) {
      // TODO: Envoyer le commentaire
      setComment('');
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-slate-300 mb-4">Discussion</h3>

      {/* Comments */}
      <div className="space-y-4">
        {comments.map((c) => (
          <div key={c.id} className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-400 text-sm font-medium">
                {c.author.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-slate-200">{c.author}</span>
                  <span className="text-xs text-slate-400">{c.role}</span>
                  <span className="text-xs text-slate-600">
                    {new Date(c.date).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <p className="text-sm text-slate-300">{c.text}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Comment Input */}
      <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Ajouter un commentaire..."
          className="w-full p-3 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500/50 resize-none"
          rows={3}
        />
        <div className="flex items-center justify-between mt-3">
          <Button variant="ghost" size="sm">
            <Paperclip className="h-4 w-4" />
          </Button>
          <Button size="sm" onClick={handleSend} className="bg-rose-600 hover:bg-rose-700">
            <Send className="h-4 w-4 mr-2" />
            Envoyer
          </Button>
        </div>
      </div>
    </div>
  );
}

// ================================
// Actions Tab
// ================================
function ActionsTab({ decision }: { decision: Decision }) {
  const actions = [
    {
      id: 'approve',
      label: 'Approuver la décision',
      description: 'Valider et approuver cette décision',
      icon: CheckCircle,
      variant: 'success' as const,
      available: decision.status === 'pending',
    },
    {
      id: 'reject',
      label: 'Rejeter la décision',
      description: 'Refuser cette décision',
      icon: X,
      variant: 'danger' as const,
      available: decision.status === 'pending',
    },
    {
      id: 'edit',
      label: 'Modifier la décision',
      description: 'Éditer les informations de la décision',
      icon: Edit,
      variant: 'default' as const,
      available: true,
    },
    {
      id: 'export',
      label: 'Exporter',
      description: 'Télécharger la décision en PDF',
      icon: Download,
      variant: 'default' as const,
      available: true,
    },
    {
      id: 'share',
      label: 'Partager',
      description: 'Partager avec d\'autres utilisateurs',
      icon: Share2,
      variant: 'default' as const,
      available: true,
    },
    {
      id: 'delete',
      label: 'Supprimer',
      description: 'Supprimer définitivement cette décision',
      icon: Trash2,
      variant: 'danger' as const,
      available: decision.status === 'draft',
    },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-slate-300 mb-4">Actions disponibles</h3>
      <div className="grid grid-cols-2 gap-4">
        {actions
          .filter((a) => a.available)
          .map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                className={cn(
                  'p-4 rounded-lg border text-left transition-all hover:scale-[1.02]',
                  action.variant === 'success'
                    ? 'bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20'
                    : action.variant === 'danger'
                    ? 'bg-red-500/10 border-red-500/30 hover:bg-red-500/20'
                    : 'bg-slate-800/50 border-slate-700/50 hover:bg-slate-800/70'
                )}
              >
                <div className="flex items-center gap-3 mb-2">
                  <Icon
                    className={cn(
                      'h-5 w-5',
                      action.variant === 'success'
                        ? 'text-emerald-400'
                        : action.variant === 'danger'
                        ? 'text-red-400'
                        : 'text-slate-400'
                    )}
                  />
                  <span className="text-sm font-medium text-slate-200">{action.label}</span>
                </div>
                <p className="text-xs text-slate-400">{action.description}</p>
              </button>
            );
          })}
      </div>
    </div>
  );
}

