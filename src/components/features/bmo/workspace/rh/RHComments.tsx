'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  MessageCircle, Send, Paperclip, AtSign, Clock, 
  MoreHorizontal, Trash2, Edit2, Reply, Pin, AlertCircle,
  CheckCircle2, User
} from 'lucide-react';

type Comment = {
  id: string;
  demandId: string;
  author: {
    id: string;
    name: string;
    initials: string;
    role: string;
    avatar?: string;
  };
  content: string;
  mentions?: string[];
  attachments?: { id: string; name: string; url: string }[];
  createdAt: string;
  updatedAt?: string;
  isPinned?: boolean;
  isInternal?: boolean; // Commentaire interne (non visible par le demandeur)
  replyTo?: string;
  reactions?: { emoji: string; count: number; users: string[] }[];
};

type Props = {
  demandId: string;
  currentUser?: {
    id: string;
    name: string;
    initials: string;
    role: string;
  };
  readOnly?: boolean;
};

// Mock comments pour démo
const MOCK_COMMENTS: Comment[] = [
  {
    id: 'COM-001',
    demandId: 'RH-2026-0089',
    author: { id: 'USR-001', name: 'Amadou DIALLO', initials: 'AD', role: 'DRH' },
    content: 'Demande de congé acceptée. Merci de prévoir la passation des dossiers en cours.',
    createdAt: '09/01/2026 10:30',
    isPinned: true,
  },
  {
    id: 'COM-002',
    demandId: 'RH-2026-0089',
    author: { id: 'USR-002', name: 'Fatou NDIAYE', initials: 'FN', role: 'Assistante RH' },
    content: 'J\'ai vérifié le solde de congés. Tout est conforme. @AmadouDIALLO peut valider.',
    mentions: ['AmadouDIALLO'],
    createdAt: '08/01/2026 15:45',
    isInternal: true,
  },
  {
    id: 'COM-003',
    demandId: 'RH-2026-0089',
    author: { id: 'EMP-007', name: 'Cheikh GUEYE', initials: 'CG', role: 'Agent' },
    content: 'Merci pour le retour rapide. Je confirme que je ferai la passation vendredi.',
    createdAt: '09/01/2026 11:15',
    replyTo: 'COM-001',
    reactions: [{ emoji: '👍', count: 2, users: ['USR-001', 'USR-002'] }],
  },
];

export function RHComments({ demandId, currentUser, readOnly = false }: Props) {
  const [comments, setComments] = useState<Comment[]>(
    MOCK_COMMENTS.filter(c => c.demandId === demandId || demandId === 'RH-2026-0089')
  );
  const [newComment, setNewComment] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [showMentions, setShowMentions] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const commentsEndRef = useRef<HTMLDivElement>(null);

  const defaultUser = currentUser || {
    id: 'USR-001',
    name: 'Amadou DIALLO',
    initials: 'AD',
    role: 'DRH',
  };

  // Scroll vers le bas quand un nouveau commentaire est ajouté
  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments.length]);

  // Focus sur le textarea quand on répond
  useEffect(() => {
    if (replyingTo && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [replyingTo]);

  const handleSubmit = () => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: `COM-${Date.now()}`,
      demandId,
      author: defaultUser,
      content: newComment.trim(),
      createdAt: new Date().toLocaleString('fr-FR', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).replace(',', ''),
      isInternal,
      replyTo: replyingTo || undefined,
    };

    setComments(prev => [...prev, comment]);
    setNewComment('');
    setReplyingTo(null);
    setIsInternal(false);
  };

  const handleEdit = (id: string) => {
    const comment = comments.find(c => c.id === id);
    if (comment) {
      setEditingId(id);
      setEditContent(comment.content);
    }
  };

  const handleSaveEdit = () => {
    if (!editingId || !editContent.trim()) return;

    setComments(prev => prev.map(c => 
      c.id === editingId 
        ? { ...c, content: editContent.trim(), updatedAt: new Date().toLocaleString('fr-FR') }
        : c
    ));
    setEditingId(null);
    setEditContent('');
  };

  const handleDelete = (id: string) => {
    if (confirm('Supprimer ce commentaire ?')) {
      setComments(prev => prev.filter(c => c.id !== id));
    }
  };

  const handlePin = (id: string) => {
    setComments(prev => prev.map(c =>
      c.id === id ? { ...c, isPinned: !c.isPinned } : c
    ));
  };

  const handleReaction = (commentId: string, emoji: string) => {
    setComments(prev => prev.map(c => {
      if (c.id !== commentId) return c;

      const reactions = c.reactions || [];
      const existingReaction = reactions.find(r => r.emoji === emoji);

      if (existingReaction) {
        if (existingReaction.users.includes(defaultUser.id)) {
          // Remove user from reaction
          const updatedUsers = existingReaction.users.filter(u => u !== defaultUser.id);
          if (updatedUsers.length === 0) {
            return { ...c, reactions: reactions.filter(r => r.emoji !== emoji) };
          }
          return {
            ...c,
            reactions: reactions.map(r => 
              r.emoji === emoji 
                ? { ...r, count: r.count - 1, users: updatedUsers }
                : r
            ),
          };
        } else {
          // Add user to reaction
          return {
            ...c,
            reactions: reactions.map(r =>
              r.emoji === emoji
                ? { ...r, count: r.count + 1, users: [...r.users, defaultUser.id] }
                : r
            ),
          };
        }
      } else {
        // Add new reaction
        return {
          ...c,
          reactions: [...reactions, { emoji, count: 1, users: [defaultUser.id] }],
        };
      }
    }));
  };

  // Trier: épinglés en premier, puis par date
  const sortedComments = useMemo(() => {
    return [...comments].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return 0; // Garder l'ordre original pour les autres
    });
  }, [comments]);

  const getReplyToComment = (replyId: string) => {
    return comments.find(c => c.id === replyId);
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-orange-500" />
            Commentaires ({comments.length})
          </h2>
          <Badge variant="default">
            {comments.filter(c => c.isInternal).length} internes
          </Badge>
        </div>

        {/* Liste des commentaires */}
        <div className="space-y-4 max-h-[400px] overflow-y-auto mb-4 pr-2">
          {sortedComments.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Aucun commentaire pour le moment</p>
              <p className="text-sm mt-1">Soyez le premier à commenter</p>
            </div>
          ) : (
            sortedComments.map(comment => {
              const replyToComment = comment.replyTo ? getReplyToComment(comment.replyTo) : null;
              const isOwn = comment.author.id === defaultUser.id;
              const isEditing = editingId === comment.id;

              return (
                <div
                  key={comment.id}
                  className={cn(
                    "relative p-4 rounded-xl transition-all",
                    comment.isPinned && "bg-amber-500/5 border border-amber-500/20",
                    comment.isInternal && !comment.isPinned && "bg-purple-500/5 border border-purple-500/20",
                    !comment.isPinned && !comment.isInternal && "bg-slate-50 dark:bg-slate-800/50",
                    "hover:shadow-sm"
                  )}
                >
                  {/* Badge épinglé */}
                  {comment.isPinned && (
                    <div className="absolute -top-2 right-4">
                      <Badge variant="warning" className="text-xs">
                        <Pin className="w-3 h-3 mr-1" /> Épinglé
                      </Badge>
                    </div>
                  )}

                  {/* Badge interne */}
                  {comment.isInternal && !comment.isPinned && (
                    <div className="absolute -top-2 right-4">
                      <Badge variant="default" className="text-xs bg-purple-500/20 text-purple-500">
                        🔒 Interne
                      </Badge>
                    </div>
                  )}

                  {/* En-tête */}
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-none",
                      isOwn 
                        ? "bg-orange-500 text-white" 
                        : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                    )}>
                      {comment.author.initials}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold">{comment.author.name}</span>
                        <Badge variant="default" className="text-[10px]">
                          {comment.author.role}
                        </Badge>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {comment.createdAt}
                          {comment.updatedAt && ' (modifié)'}
                        </span>
                      </div>

                      {/* Réponse à */}
                      {replyToComment && (
                        <div className="mt-1 mb-2 p-2 rounded-lg bg-slate-100 dark:bg-slate-700/50 border-l-2 border-orange-500">
                          <div className="text-xs text-slate-400 flex items-center gap-1">
                            <Reply className="w-3 h-3" />
                            En réponse à {replyToComment.author.name}
                          </div>
                          <div className="text-sm truncate text-slate-600 dark:text-slate-400">
                            {replyToComment.content.slice(0, 100)}...
                          </div>
                        </div>
                      )}

                      {/* Contenu */}
                      {isEditing ? (
                        <div className="mt-2 space-y-2">
                          <textarea
                            value={editContent}
                            onChange={e => setEditContent(e.target.value)}
                            className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 
                                     bg-white dark:bg-slate-900 resize-none focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                            rows={3}
                          />
                          <div className="flex gap-2">
                            <Button size="sm" onClick={handleSaveEdit}>
                              <CheckCircle2 className="w-4 h-4 mr-1" /> Enregistrer
                            </Button>
                            <Button size="sm" variant="secondary" onClick={() => setEditingId(null)}>
                              Annuler
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-2 text-sm whitespace-pre-wrap">
                          {comment.content}
                        </div>
                      )}

                      {/* Réactions */}
                      {comment.reactions && comment.reactions.length > 0 && (
                        <div className="flex items-center gap-1 mt-2">
                          {comment.reactions.map(reaction => (
                            <button
                              key={reaction.emoji}
                              onClick={() => handleReaction(comment.id, reaction.emoji)}
                              className={cn(
                                "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs",
                                "border transition-all",
                                reaction.users.includes(defaultUser.id)
                                  ? "bg-orange-500/10 border-orange-500/30 text-orange-600"
                                  : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                              )}
                            >
                              {reaction.emoji} {reaction.count}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Actions */}
                      {!readOnly && !isEditing && (
                        <div className="flex items-center gap-2 mt-3">
                          <button
                            onClick={() => setReplyingTo(comment.id)}
                            className="text-xs text-slate-400 hover:text-orange-500 flex items-center gap-1"
                          >
                            <Reply className="w-3 h-3" /> Répondre
                          </button>
                          <button
                            onClick={() => handleReaction(comment.id, '👍')}
                            className="text-xs text-slate-400 hover:text-orange-500"
                          >
                            👍
                          </button>
                          <button
                            onClick={() => handleReaction(comment.id, '❤️')}
                            className="text-xs text-slate-400 hover:text-orange-500"
                          >
                            ❤️
                          </button>
                          {isOwn && (
                            <>
                              <button
                                onClick={() => handleEdit(comment.id)}
                                className="text-xs text-slate-400 hover:text-blue-500 flex items-center gap-1"
                              >
                                <Edit2 className="w-3 h-3" /> Modifier
                              </button>
                              <button
                                onClick={() => handleDelete(comment.id)}
                                className="text-xs text-slate-400 hover:text-red-500 flex items-center gap-1"
                              >
                                <Trash2 className="w-3 h-3" /> Supprimer
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handlePin(comment.id)}
                            className={cn(
                              "text-xs flex items-center gap-1",
                              comment.isPinned ? "text-amber-500" : "text-slate-400 hover:text-amber-500"
                            )}
                          >
                            <Pin className="w-3 h-3" /> {comment.isPinned ? 'Désépingler' : 'Épingler'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={commentsEndRef} />
        </div>

        {/* Formulaire nouveau commentaire */}
        {!readOnly && (
          <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
            {/* Indicateur réponse */}
            {replyingTo && (
              <div className="flex items-center justify-between mb-2 p-2 rounded-lg bg-orange-500/10 border border-orange-500/20">
                <div className="text-sm text-orange-600 dark:text-orange-400 flex items-center gap-2">
                  <Reply className="w-4 h-4" />
                  Réponse à {getReplyToComment(replyingTo)?.author.name}
                </div>
                <button 
                  onClick={() => setReplyingTo(null)}
                  className="text-orange-600 hover:text-orange-700"
                >
                  ✕
                </button>
              </div>
            )}

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold flex-none">
                {defaultUser.initials}
              </div>

              <div className="flex-1 space-y-2">
                <textarea
                  ref={textareaRef}
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  placeholder="Ajouter un commentaire... (utilisez @ pour mentionner)"
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 
                           bg-white dark:bg-slate-900 resize-none focus:outline-none focus:ring-2 focus:ring-orange-500/30
                           placeholder:text-slate-400"
                  rows={3}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                      handleSubmit();
                    }
                  }}
                />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isInternal}
                        onChange={e => setIsInternal(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 accent-purple-500"
                      />
                      <span className="text-slate-400 flex items-center gap-1">
                        🔒 Commentaire interne
                      </span>
                    </label>

                    <button
                      className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
                      title="Joindre un fichier"
                    >
                      <Paperclip className="w-4 h-4" />
                    </button>

                    <button
                      className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
                      title="Mentionner quelqu'un"
                      onClick={() => setShowMentions(!showMentions)}
                    >
                      <AtSign className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">
                      ⌘↵ pour envoyer
                    </span>
                    <Button
                      onClick={handleSubmit}
                      disabled={!newComment.trim()}
                      className="bg-orange-500 hover:bg-orange-600"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Envoyer
                    </Button>
                  </div>
                </div>

                {isInternal && (
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs">
                    <AlertCircle className="w-4 h-4" />
                    Ce commentaire ne sera visible que par l&apos;équipe RH
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

