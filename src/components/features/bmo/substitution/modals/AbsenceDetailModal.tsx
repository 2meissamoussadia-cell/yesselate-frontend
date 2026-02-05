/**
 * ====================================================================
 * MODAL: Détail Absence - Pattern Overlay
 * Modal complète pour visualiser et gérer une absence
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
import { cn } from '@/lib/cn';
import {
  Calendar,
  User,
  Clock,
  FileText,
  MessageSquare,
  History,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  Download,
  Send,
  Building2,
  Briefcase,
  TrendingUp,
  Ban,
} from 'lucide-react';
import type { Absence, TimelineEvent, Comment } from '@/lib/types/substitution.types';

interface AbsenceDetailModalProps {
  open: boolean;
  onClose: () => void;
  absenceId: string;
}

export function AbsenceDetailModal({
  open,
  onClose,
  absenceId,
}: AbsenceDetailModalProps) {
  const [activeTab, setActiveTab] = useState('details');
  const [absence, setAbsence] = useState<Absence | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [sendingComment, setSendingComment] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!open || !absenceId) return;

    const loadDetails = async () => {
      setLoading(true);
      try {
        const { absencesApiService } = await import('@/lib/services/absencesApiService');
        const { getTimelineByEntity } = await import('@/lib/data/timeline-documents-mock-data');
        const { getCommentsByEntity } = await import('@/lib/data/comments-mock-data');

        const abs = await absencesApiService.getById(absenceId);
        const timelineData = getTimelineByEntity('absence', absenceId);
        const commentsData = getCommentsByEntity('absence', absenceId);

        setAbsence(abs);
        setTimeline(timelineData);
        setComments(commentsData);
      } catch (error) {
        console.error('Error loading details:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDetails();
  }, [open, absenceId]);

  const handleApprove = async () => {
    if (!absence) return;
    setProcessing(true);
    try {
      const { absencesApiService } = await import('@/lib/services/absencesApiService');
      await absencesApiService.approve(absence.id, 'current-user');
      // Reload
      const updated = await absencesApiService.getById(absence.id);
      setAbsence(updated);
    } catch (error) {
      console.error('Approve error:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!absence) return;
    setProcessing(true);
    try {
      const { absencesApiService } = await import('@/lib/services/absencesApiService');
      await absencesApiService.reject(absence.id, 'Non conforme aux règles');
      const updated = await absencesApiService.getById(absence.id);
      setAbsence(updated);
    } catch (error) {
      console.error('Reject error:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleSendComment = async () => {
    if (!newComment.trim() || !absence) return;
    setSendingComment(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const comment: Comment = {
        id: `CMT-${Date.now()}`,
        entityType: 'absence',
        entityId: absence.id,
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
    } finally {
      setSendingComment(false);
    }
  };

  const getStatusColor = (status: string) => {
    const config = {
      pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
      approved: 'bg-green-500/10 text-green-400 border-green-500/30',
      rejected: 'bg-red-500/10 text-red-400 border-red-500/30',
    };
    return config[status as keyof typeof config] || config.pending;
  };

  const getTypeColor = (type: string) => {
    const colors = {
      maladie: 'bg-red-500/20 text-red-400',
      conge: 'bg-blue-500/20 text-blue-400',
      formation: 'bg-purple-500/20 text-purple-400',
      autre: 'bg-slate-500/20 text-slate-400',
    };
    return colors[type as keyof typeof colors] || colors.autre;
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

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-5xl max-h-[90vh] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!absence) return null;

  const duration = Math.ceil(
    (new Date(absence.endDate).getTime() - new Date(absence.startDate).getTime()) /
    (1000 * 60 * 60 * 24)
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <DialogTitle className="text-xl text-white flex items-center gap-3">
                <Calendar className="h-5 w-5 text-blue-400" />
                Absence - {absence.employee.name}
              </DialogTitle>
              <div className="flex items-center gap-2">
                <Badge className={getStatusColor(absence.status)}>
                  {absence.status}
                </Badge>
                <Badge className={getTypeColor(absence.type)}>
                  {absence.type}
                </Badge>
                <Badge variant="default" className="text-slate-400 border-slate-600">
                  <Clock className="h-3 w-3 mr-1" />
                  {duration} jour{duration > 1 ? 's' : ''}
                </Badge>
              </div>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-4 bg-slate-800/50">
            <TabsTrigger value="details" className="text-xs">
              <FileText className="h-3.5 w-3.5 mr-1.5" />
              Détails
            </TabsTrigger>
            <TabsTrigger value="timeline" className="text-xs">
              <History className="h-3.5 w-3.5 mr-1.5" />
              Timeline ({timeline.length})
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
            {/* DÉTAILS */}
            <TabsContent value="details" className="space-y-6 m-0">
              {/* Employee Info */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-xl">
                    {absence.employee.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white">{absence.employee.name}</h3>
                    <div className="flex items-center gap-4 mt-1 text-sm text-slate-400">
                      <span className="flex items-center gap-1">
                        <Briefcase className="h-3.5 w-3.5" />
                        {absence.employee.role}
                      </span>
                      <span className="flex items-center gap-1">
                        <Building2 className="h-3.5 w-3.5" />
                        {absence.employee.bureau}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <Separator className="bg-slate-800" />

              {/* Absence Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-slate-400 block mb-1">Date de début</label>
                  <div className="flex items-center gap-2 text-white">
                    <Calendar className="h-4 w-4 text-blue-400" />
                    {new Date(absence.startDate).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </div>
                </div>
                <div>
                  <label className="text-sm text-slate-400 block mb-1">Date de fin</label>
                  <div className="flex items-center gap-2 text-white">
                    <Calendar className="h-4 w-4 text-blue-400" />
                    {new Date(absence.endDate).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </div>
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className="text-sm text-slate-400 block mb-2">Motif</label>
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 text-slate-300">
                  {absence.reason}
                </div>
              </div>

              {/* Description */}
              {absence.description && (
                <div>
                  <label className="text-sm text-slate-400 block mb-2">Description</label>
                  <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 text-slate-300">
                    {absence.description}
                  </div>
                </div>
              )}

              {/* Approval Info */}
              {absence.approvedBy && absence.approvedAt && (
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-green-400 mb-2">
                    <CheckCircle className="h-4 w-4" />
                    <span className="font-medium">Approuvée</span>
                  </div>
                  <p className="text-sm text-slate-400">
                    Par {absence.approvedBy} le {new Date(absence.approvedAt).toLocaleString('fr-FR')}
                  </p>
                </div>
              )}
            </TabsContent>

            {/* TIMELINE */}
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
                        <div className={cn('absolute left-0 h-8 w-8 rounded-full flex items-center justify-center text-lg', event.color || 'bg-slate-700')}>
                          {event.icon}
                        </div>
                        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3">
                          <div className="flex items-start justify-between mb-1">
                            <h4 className="font-medium text-white">{event.type}</h4>
                            <span className="text-xs text-slate-400">{formatRelativeTime(event.createdAt)}</span>
                          </div>
                          {event.description && <p className="text-sm text-slate-400">{event.description}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* COMMENTS */}
            <TabsContent value="comments" className="space-y-4 m-0">
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Ajouter un commentaire..."
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
                <div className="flex justify-end mt-3">
                  <Button onClick={handleSendComment} disabled={!newComment.trim() || sendingComment} size="sm">
                    {sendingComment ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                    Envoyer
                  </Button>
                </div>
              </div>

              {comments.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <MessageSquare className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p>Aucun commentaire</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {comments.map((comment) => (
                    <div key={comment.id} className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
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
                        <span className="text-xs text-slate-400">{formatRelativeTime(comment.createdAt)}</span>
                      </div>
                      <p className="text-slate-300">{comment.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* ACTIONS */}
            <TabsContent value="actions" className="space-y-3 m-0">
              {absence.status === 'pending' && (
                <div className="space-y-2">
                  <Button onClick={handleApprove} disabled={processing} className="w-full justify-start bg-green-500 hover:bg-green-600">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approuver l'absence
                  </Button>
                  <Button onClick={handleReject} disabled={processing} variant="outline" className="w-full justify-start border-red-500/30 text-red-400 hover:bg-red-500/10">
                    <XCircle className="h-4 w-4 mr-2" />
                    Rejeter l'absence
                  </Button>
                </div>
              )}
              
              <Separator className="bg-slate-800" />

              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Signaler un conflit
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Exporter les détails
                </Button>
              </div>
            </TabsContent>
          </div>
        </Tabs>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <Button variant="outline" onClick={onClose}>Fermer</Button>
          <div className="flex items-center gap-2">
            {absence.status === 'pending' && (
              <>
                <Button onClick={handleReject} disabled={processing} variant="outline">
                  <XCircle className="h-4 w-4 mr-2" />
                  Rejeter
                </Button>
                <Button onClick={handleApprove} disabled={processing}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approuver
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

