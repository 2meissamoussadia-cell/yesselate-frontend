/**
 * ====================================================================
 * MODAL: Détail Substitution - Pattern Overlay (comme Blocked/Tickets)
 * Modal overlay complète avec tabs pour une navigation fluide
 * ====================================================================
 */

'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import {
  FileText,
  User,
  Users,
  Calendar,
  Clock,
  AlertTriangle,
  MessageSquare,
  Paperclip,
  History,
  TrendingUp,
  Award,
  Download,
  Eye,
  Send,
  Loader2,
  Plus,
  CheckCircle,
  XCircle,
  Upload,
  Ban,
  Building2,
  Timer,
  Briefcase,
} from 'lucide-react';
import type { Substitution, TimelineEvent, Document, Comment } from '@/lib/types/substitution.types';

interface SubstitutionDetailModalProps {
  open: boolean;
  onClose: () => void;
  substitutionId: string;
}

export function SubstitutionDetailModal({
  open,
  onClose,
  substitutionId,
}: SubstitutionDetailModalProps) {
  const [activeTab, setActiveTab] = useState('details');
  const [substitution, setSubstitution] = useState<Substitution | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [sendingComment, setSendingComment] = useState(false);

  // Load substitution details
  useEffect(() => {
    if (!open || !substitutionId) return;

    const loadDetails = async () => {
      setLoading(true);
      try {
        const { substitutionApiService } = await import('@/lib/services/substitutionApiService');
        const { getTimelineByEntity } = await import('@/lib/data/timeline-documents-mock-data');
        const { getDocumentsByEntity } = await import('@/lib/data/timeline-documents-mock-data');
        const { getCommentsByEntity } = await import('@/lib/data/comments-mock-data');

        const sub = await substitutionApiService.getById(substitutionId);
        const timelineData = getTimelineByEntity('substitution', substitutionId);
        const docsData = getDocumentsByEntity('substitution', substitutionId);
        const commentsData = getCommentsByEntity('substitution', substitutionId);

        const raw = sub as unknown as { createdAt?: Date; updatedAt?: Date };
        setSubstitution(
          sub
            ? ({ ...sub, createdAt: raw?.createdAt ?? new Date(), updatedAt: raw?.updatedAt ?? new Date() } as unknown as Substitution)
            : null
        );
        setTimeline(timelineData);
        setDocuments(docsData);
        setComments(commentsData);
      } catch (error) {
        console.error('Error loading details:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDetails();
  }, [open, substitutionId]);

  const handleSendComment = async () => {
    if (!newComment.trim() || !substitution) return;

    setSendingComment(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      const comment: Comment = {
        id: `CMT-${Date.now()}`,
        entityType: 'substitution',
        entityId: substitution.id,
        userId: 'current-user',
        user: {
          id: 'current-user',
          name: 'Vous',
          email: 'user@example.com',
          phone: '',
          bureau: '',
          role: 'Utilisateur',
          competences: [],
          disponibilite: 'available',
          chargeActuelle: 0,
          score: 0,
          avatar: undefined,
        },
        content: newComment,
        mentions: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setComments([...comments, comment]);
      setNewComment('');
    } catch (error) {
      console.error('Send error:', error);
    } finally {
      setSendingComment(false);
    }
  };

  const getStatusColor = (status: string) => {
    const config = {
      active: 'bg-green-500/10 text-green-400 border-green-500/30',
      pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
      completed: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      expired: 'bg-red-500/10 text-red-400 border-red-500/30',
    };
    return config[status as keyof typeof config] || config.pending;
  };

  const getUrgencyColor = (urgency: string) => {
    const config = {
      critical: 'bg-red-500',
      high: 'bg-orange-500',
      medium: 'bg-yellow-500',
      low: 'bg-green-500',
    };
    return config[urgency as keyof typeof config] || config.medium;
  };

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes} min`;
    if (hours < 24) return `Il y a ${hours}h`;
    if (days < 7) return `Il y a ${days}j`;
    return new Date(date).toLocaleDateString('fr-FR');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const timelineTypeLabel: Record<TimelineEvent['type'], string> = {
    created: 'Créé',
    updated: 'Mis à jour',
    assigned: 'Assigné',
    escalated: 'Escaladé',
    completed: 'Terminé',
    commented: 'Commenté',
    approved: 'Approuvé',
    rejected: 'Rejeté',
    revoked: 'Révoqué',
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!substitution) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <DialogTitle className="text-xl text-white flex items-center gap-3">
                <FileText className="h-5 w-5 text-blue-400" />
                Substitution - {substitution.ref}
              </DialogTitle>
              <div className="flex items-center gap-2">
                <Badge className={getStatusColor(substitution.status)}>
                  {substitution.status}
                </Badge>
                <Badge className={cn('text-white', getUrgencyColor(substitution.urgency))}>
                  {substitution.urgency}
                </Badge>
                <Badge variant="default" className="text-slate-400 border-slate-600">
                  <Clock className="h-3 w-3 mr-1" />
                  {substitution.delay} jours de retard
                </Badge>
              </div>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-5 bg-slate-800/50">
            <TabsTrigger value="details" className="text-xs">
              <FileText className="h-3.5 w-3.5 mr-1.5" />
              Détails
            </TabsTrigger>
            <TabsTrigger value="timeline" className="text-xs">
              <History className="h-3.5 w-3.5 mr-1.5" />
              Timeline ({timeline.length})
            </TabsTrigger>
            <TabsTrigger value="documents" className="text-xs">
              <Paperclip className="h-3.5 w-3.5 mr-1.5" />
              Documents ({documents.length})
            </TabsTrigger>
            <TabsTrigger value="comments" className="text-xs">
              <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
              Discussion ({comments.length})
            </TabsTrigger>
            <TabsTrigger value="actions" className="text-xs">
              <TrendingUp className="h-3.5 w-3.5 mr-1.5" />
              Actions
            </TabsTrigger>
          </TabsList>

          <div className="mt-4 max-h-[calc(90vh-220px)] overflow-y-auto">
            {/* ONGLET 1: DÉTAILS */}
            <TabsContent value="details" className="space-y-6 m-0">
              {/* Quick Stats */}
              <div className="grid grid-cols-4 gap-3">
                <div className="p-3 bg-slate-800/50 border border-slate-700 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-slate-400 mb-1">
                    <Building2 className="h-3.5 w-3.5" />
                    Bureau
                  </div>
                  <div className="font-semibold text-white">{substitution.bureau}</div>
                </div>
                <div className="p-3 bg-slate-800/50 border border-slate-700 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-slate-400 mb-1">
                    <Timer className="h-3.5 w-3.5" />
                    Retard
                  </div>
                  <div className="font-semibold text-orange-400">{substitution.delay}j</div>
                </div>
                <div className="p-3 bg-slate-800/50 border border-slate-700 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-slate-400 mb-1">
                    <Ban className="h-3.5 w-3.5" />
                    Motif
                  </div>
                  <div className="font-semibold text-white capitalize">{substitution.reason}</div>
                </div>
                <div className="p-3 bg-slate-800/50 border border-slate-700 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-slate-400 mb-1">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Montant
                  </div>
                  <div className="font-semibold text-green-400">
                    {substitution.amount ? `${(substitution.amount / 1000000).toFixed(1)}M` : 'N/A'}
                  </div>
                </div>
              </div>

              <Separator className="bg-slate-800" />

              {/* Description */}
              <div>
                <label className="text-sm text-slate-400 block mb-2">Description</label>
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 text-slate-300">
                  {substitution.description}
                </div>
              </div>

              {/* People */}
              <div>
                <label className="text-sm text-slate-400 block mb-3">Personnes impliquées</label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">
                      <User className="h-3.5 w-3.5" />
                      Titulaire
                    </div>
                    <div className="font-medium text-white">{substitution.titulaire.name}</div>
                    <div className="text-sm text-slate-400">{substitution.titulaire.bureau}</div>
                  </div>

                  {substitution.substitut ? (
                    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">
                        <Users className="h-3.5 w-3.5" />
                        Substitut
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="font-medium text-white">{substitution.substitut.name}</div>
                        <Badge variant="outline" className="text-green-400 border-green-500/30 text-xs">
                          <Award className="h-3 w-3 mr-1" />
                          {substitution.substitut.score}%
                        </Badge>
                      </div>
                      <div className="text-sm text-slate-400">{substitution.substitut.bureau}</div>
                    </div>
                  ) : (
                    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 flex items-center justify-center">
                      <div className="text-center">
                        <AlertTriangle className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
                        <div className="text-sm text-slate-400">Aucun substitut assigné</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-slate-400 block mb-1">Date de début</label>
                  <div className="flex items-center gap-2 text-white">
                    <Calendar className="h-4 w-4 text-blue-400" />
                    {new Date(substitution.dateDebut).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </div>
                </div>
                {substitution.dateFin && (
                  <div>
                    <label className="text-sm text-slate-400 block mb-1">Date de fin</label>
                    <div className="flex items-center gap-2 text-white">
                      <Calendar className="h-4 w-4 text-blue-400" />
                      {new Date(substitution.dateFin).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Linked Projects */}
              {substitution.linkedProjects && substitution.linkedProjects.length > 0 && (
                <div>
                  <label className="text-sm text-slate-400 block mb-2">Projets liés</label>
                  <div className="flex flex-wrap gap-2">
                    {substitution.linkedProjects.map((projectId) => (
                      <Badge key={projectId} variant="default" className="text-blue-400 border-blue-500/30">
                        {projectId}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* ONGLET 2: TIMELINE */}
            <TabsContent value="timeline" className="space-y-3 m-0">
              {timeline.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <History className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p>Aucun événement</p>
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-700" />
                  
                  <div className="space-y-4">
                    {timeline.map((event, index) => (
                      <div key={index} className="relative pl-12">
                        <div
                          className={cn(
                            'absolute left-0 h-8 w-8 rounded-full flex items-center justify-center text-lg',
                            event.color || 'bg-slate-700'
                          )}
                        >
                          {event.icon}
                        </div>

                        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3">
                          <div className="flex items-start justify-between mb-1">
                            <h4 className="font-medium text-white">{timelineTypeLabel[event.type]}</h4>
                            <span className="text-xs text-slate-400">
                              {formatRelativeTime(event.createdAt)}
                            </span>
                          </div>
                          {event.description && (
                            <p className="text-sm text-slate-400 mb-1">{event.description}</p>
                          )}
                          {event.user && (
                            <div className="text-xs text-slate-400">Par {event.user.name}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* ONGLET 3: DOCUMENTS */}
            <TabsContent value="documents" className="space-y-4 m-0">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-slate-400">
                  {documents.length} document(s)
                </h3>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter
                </Button>
              </div>

              {documents.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <FileText className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p>Aucun document</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-4 bg-slate-800/50 border border-slate-700 rounded-lg hover:bg-slate-800 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="bg-blue-500/20 p-2 rounded">
                          <Paperclip className="h-5 w-5 text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-white truncate">{doc.name}</div>
                          <div className="text-sm text-slate-400">
                            {formatFileSize(doc.size)} • {formatRelativeTime(doc.uploadedAt)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* ONGLET 4: COMMENTAIRES */}
            <TabsContent value="comments" className="space-y-4 m-0">
              {/* New Comment */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Ajouter un commentaire..."
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
                <div className="flex items-center justify-end mt-3">
                  <Button
                    onClick={handleSendComment}
                    disabled={!newComment.trim() || sendingComment}
                    size="sm"
                  >
                    {sendingComment ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    Envoyer
                  </Button>
                </div>
              </div>

              {/* Comments List */}
              {comments.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <MessageSquare className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p>Aucun commentaire</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="bg-slate-800/50 border border-slate-700 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="bg-purple-500/20 h-10 w-10 rounded-full flex items-center justify-center text-purple-400 font-medium">
                            {comment.user.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-medium text-white">{comment.user.name}</div>
                            <div className="text-xs text-slate-400">{comment.user.role}</div>
                          </div>
                        </div>
                        <div className="text-xs text-slate-400">
                          {formatRelativeTime(comment.createdAt)}
                        </div>
                      </div>
                      <p className="text-slate-300">{comment.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* ONGLET 5: ACTIONS */}
            <TabsContent value="actions" className="space-y-3 m-0">
              <div className="space-y-2">
                {!substitution.substitut && (
                  <Button className="w-full justify-start" variant="outline">
                    <Users className="h-4 w-4 mr-2" />
                    Assigner un substitut
                  </Button>
                )}
                <Button className="w-full justify-start" variant="outline">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Escalader la demande
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Demander des informations
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Exporter le dossier
                </Button>
                {substitution.status === 'active' && (
                  <Button className="w-full justify-start bg-green-500 hover:bg-green-600">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Marquer comme résolu
                  </Button>
                )}
              </div>
            </TabsContent>
          </div>
        </Tabs>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <Eye className="h-4 w-4 mr-2" />
              Suivre
            </Button>
            {!substitution.substitut && (
              <Button>
                <Users className="h-4 w-4 mr-2" />
                Assigner un substitut
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

