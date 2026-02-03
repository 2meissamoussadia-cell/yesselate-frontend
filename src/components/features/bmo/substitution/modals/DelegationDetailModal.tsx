/**
 * ====================================================================
 * MODAL: Détail Délégation - Pattern Overlay
 * Modal complète pour visualiser et gérer une délégation
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
  Users,
  User,
  Shield,
  Calendar,
  Clock,
  FileText,
  MessageSquare,
  History,
  Ban,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  Download,
  Send,
  Building2,
  Briefcase,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';
import type { Delegation, TimelineEvent, Comment } from '@/lib/types/substitution.types';

interface DelegationDetailModalProps {
  open: boolean;
  onClose: () => void;
  delegationId: string;
}

export function DelegationDetailModal({
  open,
  onClose,
  delegationId,
}: DelegationDetailModalProps) {
  const [activeTab, setActiveTab] = useState('details');
  const [delegation, setDelegation] = useState<Delegation | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [sendingComment, setSendingComment] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!open || !delegationId) return;

    const loadDetails = async () => {
      setLoading(true);
      try {
        const { delegationsApiService } = await import('@/lib/services/delegationsApiService');
        const { getTimelineByEntity } = await import('@/lib/data/timeline-documents-mock-data');
        const { getCommentsByEntity } = await import('@/lib/data/comments-mock-data');

        const del = await delegationsApiService.getById(delegationId);
        const timelineData = getTimelineByEntity('delegation', delegationId);
        const commentsData = getCommentsByEntity('delegation', delegationId);

        setDelegation(del);
        setTimeline(timelineData);
        setComments(commentsData);
      } catch (error) {
        console.error('Error loading details:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDetails();
  }, [open, delegationId]);

  const handleRevoke = async () => {
    if (!delegation) return;
    setProcessing(true);
    try {
      const { delegationsApiService } = await import('@/lib/services/delegationsApiService');
      await delegationsApiService.revoke(delegation.id, 'current-user');
      const updated = await delegationsApiService.getById(delegation.id);
      setDelegation(updated);
    } catch (error) {
      console.error('Revoke error:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleSendComment = async () => {
    if (!newComment.trim() || !delegation) return;
    setSendingComment(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const comment: Comment = {
        id: `CMT-${Date.now()}`,
        entityType: 'delegation',
        entityId: delegation.id,
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
      active: 'bg-green-500/10 text-green-400 border-green-500/30',
      inactive: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
      revoked: 'bg-red-500/10 text-red-400 border-red-500/30',
    };
    return config[status as keyof typeof config] || config.active;
  };

  const getTypeColor = (type: string) => {
    return type === 'permanent'
      ? 'bg-purple-500/20 text-purple-400'
      : 'bg-blue-500/20 text-blue-400';
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

  if (!delegation) return null;

  const duration = delegation.endDate
    ? Math.ceil((new Date(delegation.endDate).getTime() - new Date(delegation.startDate).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <DialogTitle className="text-xl text-white flex items-center gap-3">
                <Users className="h-5 w-5 text-purple-400" />
                Délégation de pouvoir
              </DialogTitle>
              <div className="flex items-center gap-2">
                <Badge className={getStatusColor(delegation.status)}>
                  {delegation.status}
                </Badge>
                <Badge className={getTypeColor(delegation.type)}>
                  {delegation.type}
                </Badge>
                {duration && (
                  <Badge variant="default" className="text-slate-400 border-slate-600">
                    <Clock className="h-3 w-3 mr-1" />
                    {duration} jour{duration > 1 ? 's' : ''}
                  </Badge>
                )}
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
            <TabsTrigger value="permissions" className="text-xs">
              <Shield className="h-3.5 w-3.5 mr-1.5" />
              Permissions ({delegation.permissions.length})
            </TabsTrigger>
            <TabsTrigger value="timeline" className="text-xs">
              <History className="h-3.5 w-3.5 mr-1.5" />
              Timeline ({timeline.length})
            </TabsTrigger>
            <TabsTrigger value="comments" className="text-xs">
              <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
              Discussion ({comments.length})
            </TabsTrigger>
          </TabsList>

          <div className="mt-4 max-h-[calc(90vh-220px)] overflow-y-auto">
            {/* DÉTAILS */}
            <TabsContent value="details" className="space-y-6 m-0">
              {/* Delegation Flow */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  {/* From */}
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-xl">
                      {delegation.fromUser.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{delegation.fromUser.name}</h3>
                      <div className="flex items-center gap-2 mt-1 text-sm text-slate-400">
                        <Briefcase className="h-3.5 w-3.5" />
                        {delegation.fromUser.role}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <Building2 className="h-3.5 w-3.5" />
                        {delegation.fromUser.bureau}
                      </div>
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="px-8">
                    <ArrowRight className="w-8 h-8 text-purple-400" />
                  </div>

                  {/* To */}
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center text-white font-semibold text-xl">
                      {delegation.toUser.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{delegation.toUser.name}</h3>
                      <div className="flex items-center gap-2 mt-1 text-sm text-slate-400">
                        <Briefcase className="h-3.5 w-3.5" />
                        {delegation.toUser.role}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <Building2 className="h-3.5 w-3.5" />
                        {delegation.toUser.bureau}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Separator className="bg-slate-800" />

              {/* Period */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-slate-400 block mb-1">Date de début</label>
                  <div className="flex items-center gap-2 text-white">
                    <Calendar className="h-4 w-4 text-blue-400" />
                    {new Date(delegation.startDate).toLocaleDateString('fr-FR', {
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
                    {delegation.endDate
                      ? new Date(delegation.endDate).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })
                      : 'Indéfinie'}
                  </div>
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className="text-sm text-slate-400 block mb-2">Raison</label>
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 text-slate-300">
                  {delegation.reason}
                </div>
              </div>

              {/* Rule Reference */}
              {delegation.ruleId && (
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-blue-400 mb-2">
                    <Shield className="h-4 w-4" />
                    <span className="font-medium">Basée sur une règle automatique</span>
                  </div>
                  <p className="text-sm text-slate-400">Règle ID: {delegation.ruleId}</p>
                </div>
              )}

              {/* Revocation Info */}
              {delegation.revokedAt && delegation.revokedBy && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-red-400 mb-2">
                    <Ban className="h-4 w-4" />
                    <span className="font-medium">Révoquée</span>
                  </div>
                  <p className="text-sm text-slate-400">
                    Par {delegation.revokedBy} le {new Date(delegation.revokedAt).toLocaleString('fr-FR')}
                  </p>
                </div>
              )}
            </TabsContent>

            {/* PERMISSIONS */}
            <TabsContent value="permissions" className="space-y-3 m-0">
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 text-blue-400">
                  <Shield className="h-5 w-5" />
                  <span className="font-medium">
                    {delegation.permissions.length} permission{delegation.permissions.length > 1 ? 's' : ''} déléguée{delegation.permissions.length > 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              <div className="grid gap-2">
                {delegation.permissions.map((permission, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-slate-800/50 border border-slate-700 rounded-lg"
                  >
                    <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="font-medium text-white">{permission}</div>
                    </div>
                  </div>
                ))}
              </div>
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
          </div>
        </Tabs>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <Button variant="outline" onClick={onClose}>Fermer</Button>
          <div className="flex items-center gap-2">
            {delegation.status === 'active' && (
              <>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Exporter
                </Button>
                <Button onClick={handleRevoke} disabled={processing} variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10">
                  <Ban className="h-4 w-4 mr-2" />
                  Révoquer
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

