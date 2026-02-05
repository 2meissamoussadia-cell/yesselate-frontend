'use client';
import { useState, useEffect } from 'react';
import { commentsService, type Comment, type CommentThread } from '@/lib/services/commentsService';
import { documentService } from '@/lib/services/documentService';
import { MessageSquare, Send, Paperclip, Smile, MoreHorizontal, Edit2, Trash2, Reply } from 'lucide-react';
import { cn } from '@/lib/cn';
import { logger } from '@/lib/utils/logger';

interface Props {
  entityType: string;
  entityId: string;
  className?: string;
}

export function CommentSection({ entityType, entityId, className }: Props) {
  const [threads, setThreads] = useState<CommentThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    loadComments();
  }, [entityType, entityId]);

  const loadComments = async () => {
    try {
      setLoading(true);
      const data = await commentsService.getThreads(entityType, entityId);
      setThreads(data);
    } catch (e) {
      logger.error('Erreur chargement commentaires', e instanceof Error ? e : undefined, { component: 'CommentSection' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      await commentsService.addComment({
        entityType,
        entityId,
        contenu: newComment,
        parentId: replyTo || undefined,
      });

      setNewComment('');
      setReplyTo(null);
      await loadComments();
    } catch (e) {
      logger.error('Erreur ajout commentaire', e instanceof Error ? e : undefined, { component: 'CommentSection' });
    }
  };

  const handleEdit = async (commentId: string) => {
    if (!editContent.trim()) return;

    try {
      await commentsService.editComment(commentId, editContent);
      setEditingId(null);
      setEditContent('');
      await loadComments();
    } catch (e) {
      logger.error('Erreur édition commentaire', e instanceof Error ? e : undefined, { component: 'CommentSection' });
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm('Supprimer ce commentaire ?')) return;

    try {
      await commentsService.deleteComment(commentId);
      await loadComments();
    } catch (e) {
      logger.error('Erreur suppression commentaire', e instanceof Error ? e : undefined, { component: 'CommentSection' });
    }
  };

  const handleReaction = async (commentId: string, emoji: string) => {
    try {
      await commentsService.addReaction(commentId, emoji);
      await loadComments();
    } catch (e) {
      logger.error('Erreur ajout réaction', e instanceof Error ? e : undefined, { component: 'CommentSection' });
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-slate-400" />
          <h3 className="font-semibold text-slate-200">
            Commentaires ({threads.reduce((acc, t) => acc + 1 + t.replyCount, 0)})
          </h3>
        </div>
      </div>

      {/* Liste des commentaires */}
      {loading ? (
        <div className="space-y-3 animate-pulse">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-slate-800/30" />
          ))}
        </div>
      ) : threads.length === 0 ? (
        <div className="p-8 rounded-xl bg-slate-800/30 border border-slate-700/50 text-center">
          <MessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">Aucun commentaire pour le moment</p>
          <p className="text-sm text-slate-400 mt-1">Soyez le premier à commenter</p>
        </div>
      ) : (
        <div className="space-y-4">
          {threads.map((thread) => (
            <div key={thread.comment.id} className="space-y-3">
              {/* Commentaire principal */}
              <CommentItem
                comment={thread.comment}
                onReply={(id) => setReplyTo(id)}
                onEdit={(id, content) => {
                  setEditingId(id);
                  setEditContent(content);
                }}
                onDelete={handleDelete}
                onReaction={handleReaction}
                isEditing={editingId === thread.comment.id}
                editContent={editContent}
                setEditContent={setEditContent}
                handleEdit={handleEdit}
              />

              {/* Réponses */}
              {thread.replies.length > 0 && (
                <div className="ml-12 space-y-3 border-l-2 border-slate-700/50 pl-4">
                  {thread.replies.map((reply) => (
                    <CommentItem
                      key={reply.id}
                      comment={reply}
                      onReply={(id) => setReplyTo(id)}
                      onEdit={(id, content) => {
                        setEditingId(id);
                        setEditContent(content);
                      }}
                      onDelete={handleDelete}
                      onReaction={handleReaction}
                      isEditing={editingId === reply.id}
                      editContent={editContent}
                      setEditContent={setEditContent}
                      handleEdit={handleEdit}
                      isReply
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Formulaire d'ajout */}
      <form onSubmit={handleSubmit} className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/50">
        {replyTo && (
          <div className="flex items-center justify-between mb-2 p-2 rounded-lg bg-slate-700/30">
            <span className="text-sm text-slate-400">
              Répondre à {threads.find((t) => t.comment.id === replyTo || t.replies.find((r) => r.id === replyTo))?.comment.auteurNom}
            </span>
            <button type="button" onClick={() => setReplyTo(null)} className="text-slate-400 hover:text-slate-300">
              ✕
            </button>
          </div>
        )}

        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
            U
          </div>

          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Ajouter un commentaire... (utilisez @nom pour mentionner quelqu'un)"
              className="w-full px-4 py-2 rounded-lg bg-slate-700/50 border border-slate-600 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
              rows={3}
            />

            <div className="flex items-center justify-between mt-2">
              <div className="flex gap-2">
                <button type="button" className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-slate-300">
                  <Paperclip className="w-4 h-4" />
                </button>
                <button type="button" className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-slate-300">
                  <Smile className="w-4 h-4" />
                </button>
              </div>

              <button
                type="submit"
                disabled={!newComment.trim()}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-4 h-4" />
                Commenter
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

// Composant individuel de commentaire
function CommentItem({
  comment,
  onReply,
  onEdit,
  onDelete,
  onReaction,
  isEditing,
  editContent,
  setEditContent,
  handleEdit,
  isReply,
}: {
  comment: Comment;
  onReply: (id: string) => void;
  onEdit: (id: string, content: string) => void;
  onDelete: (id: string) => void;
  onReaction: (id: string, emoji: string) => void;
  isEditing: boolean;
  editContent: string;
  setEditContent: (content: string) => void;
  handleEdit: (id: string) => void;
  isReply?: boolean;
}) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/50 hover:border-slate-600/50 transition-colors">
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
          {comment.auteurNom.charAt(0)}
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-200">{comment.auteurNom}</span>
                {comment.isEdited && (
                  <span className="text-xs text-slate-400">(modifié)</span>
                )}
              </div>
              <span className="text-xs text-slate-400">
                {commentsService.formatRelativeTime(comment.createdAt)}
              </span>
            </div>

            {/* Menu actions */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 rounded-lg hover:bg-slate-700/50 text-slate-400"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>

              {showMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                  <div className="absolute right-0 mt-2 w-48 rounded-lg border border-slate-700 bg-slate-900 shadow-xl z-20 py-1">
                    <button
                      onClick={() => {
                        onEdit(comment.id, comment.contenu);
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-slate-800 flex items-center gap-3 text-slate-300"
                    >
                      <Edit2 className="w-4 h-4" />
                      Modifier
                    </button>
                    <button
                      onClick={() => {
                        onDelete(comment.id);
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-slate-800 flex items-center gap-3 text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                      Supprimer
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Contenu */}
          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-700/50 border border-slate-600 text-slate-200 focus:outline-none focus:border-blue-500 resize-none"
                rows={3}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(comment.id)}
                  className="px-3 py-1.5 rounded-lg bg-blue-500 text-white text-sm hover:bg-blue-600"
                >
                  Sauvegarder
                </button>
                <button
                  onClick={() => onEdit('', '')}
                  className="px-3 py-1.5 rounded-lg bg-slate-700 text-slate-300 text-sm hover:bg-slate-600"
                >
                  Annuler
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-slate-300 whitespace-pre-wrap break-words">{comment.contenu}</p>

              {/* Pièces jointes */}
              {comment.piecesJointes && comment.piecesJointes.length > 0 && (
                <div className="mt-3 flex gap-2">
                  {comment.piecesJointes.map((doc) => (
                    <div
                      key={doc.id}
                      className="px-3 py-2 rounded-lg bg-slate-700/50 border border-slate-600 text-sm text-slate-300"
                    >
                      <Paperclip className="w-3 h-3 inline mr-1" />
                      {doc.nom}
                    </div>
                  ))}
                </div>
              )}

              {/* Réactions et actions */}
              <div className="flex items-center gap-4 mt-3">
                {/* Réactions existantes */}
                {comment.reactions && comment.reactions.length > 0 && (
                  <div className="flex gap-2">
                    {Array.from(new Set(comment.reactions.map((r) => r.emoji))).map((emoji) => {
                      const count = comment.reactions!.filter((r) => r.emoji === emoji).length;
                      return (
                        <button
                          key={emoji}
                          onClick={() => onReaction(comment.id, emoji)}
                          className="px-2 py-1 rounded-lg bg-slate-700/50 text-sm hover:bg-slate-700"
                        >
                          {emoji} {count}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Bouton répondre */}
                {!isReply && (
                  <button
                    onClick={() => onReply(comment.id)}
                    className="text-sm text-slate-400 hover:text-slate-300 flex items-center gap-1"
                  >
                    <Reply className="w-3 h-3" />
                    Répondre
                  </button>
                )}

                {/* Bouton ajouter réaction */}
                <button
                  onClick={() => onReaction(comment.id, '👍')}
                  className="text-sm text-slate-400 hover:text-slate-300"
                >
                  👍
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

