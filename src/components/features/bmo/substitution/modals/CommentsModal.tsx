/**
 * ====================================================================
 * MODAL: Commentaires et Discussion
 * Modal pour gérer les commentaires sur une substitution
 * ====================================================================
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Send, Loader2, User, Clock } from 'lucide-react';
import type { Comment } from '@/lib/types/substitution.types';
import { logger } from '@/lib/utils/logger';

interface CommentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityId: string;
  entityType: 'substitution' | 'absence' | 'delegation';
  title?: string;
}

export function CommentsModal({
  isOpen,
  onClose,
  entityId,
  entityType,
  title = 'Commentaires',
}: CommentsModalProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [newComment, setNewComment] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load comments
  useEffect(() => {
    if (isOpen) {
      loadComments();
    }
  }, [isOpen, entityId]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [comments]);

  const loadComments = async () => {
    setLoading(true);
    try {
      const { getCommentsByEntity } = await import('@/lib/data/comments-mock-data');
      const entityComments = getCommentsByEntity(entityType, entityId);
      setComments(entityComments);
    } catch (error) {
      logger.error('Error loading comments', error instanceof Error ? error : undefined, { component: 'CommentsModal' });
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!newComment.trim() || sending) return;

    setSending(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const comment: Comment = {
        id: `CMT-${Date.now()}`,
        entityType,
        entityId,
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
      
      logger.debug('Comment sent', { component: 'CommentsModal', commentId: comment.id });
    } catch (error) {
      logger.error('Send error', error instanceof Error ? error : undefined, { component: 'CommentsModal' });
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTimestamp = (date: Date) => {
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-lg shadow-2xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div>
            <h2 className="text-xl font-semibold text-white">{title}</h2>
            <p className="text-sm text-slate-400 mt-1">
              {comments.length} commentaire{comments.length > 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Comments List */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <p>Aucun commentaire pour le moment.</p>
              <p className="text-sm mt-2">Soyez le premier à commenter !</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                {/* Avatar */}
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                  {comment.user.name.charAt(0)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">{comment.user.name}</span>
                        <span className="text-xs text-slate-400">{comment.user.role}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-400">
                        <Clock className="w-3 h-3" />
                        {formatTimestamp(comment.createdAt)}
                      </div>
                    </div>
                    <p className="text-slate-300 text-sm whitespace-pre-wrap">{comment.content}</p>
                    
                    {comment.mentions && comment.mentions.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {comment.mentions.map((mention) => (
                          <span
                            key={mention}
                            className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded"
                          >
                            @{mention}
                          </span>
                        ))}
                      </div>
                    )}

                    {comment.resolvedAt ? (
                      <div className="mt-2 text-xs text-green-400 flex items-center gap-1">
                        ✓ Résolu
                      </div>
                    ) : null}
                  </div>

                  {/* Reply indicator */}
                  {comment.parentId && (
                    <div className="ml-4 mt-2 text-xs text-slate-400">
                      ↳ Réponse
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input */}
        <div className="p-6 border-t border-slate-700 bg-slate-800/50">
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center text-white font-semibold">
              V
            </div>
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ajouter un commentaire... (Entrée pour envoyer, Shift+Entrée pour nouvelle ligne)"
                rows={3}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
              <div className="flex items-center justify-between mt-2">
                <div className="text-xs text-slate-400">
                  Utilisez @nom pour mentionner quelqu'un
                </div>
                <button
                  onClick={handleSend}
                  disabled={!newComment.trim() || sending}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {sending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  Envoyer
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

