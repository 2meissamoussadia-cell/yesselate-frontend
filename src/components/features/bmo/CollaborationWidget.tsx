'use client';

import { useState, useCallback } from 'react';
import { cn } from '@/lib/cn';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { DashboardCard } from './DashboardCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageSquare, Send, Users, AtSign } from 'lucide-react';

interface CollaborationWidgetProps {
  itemId?: string;
  itemType?: string;
  className?: string;
}

interface Comment {
  id: string;
  author: string;
  message: string;
  timestamp: Date;
  mentions?: string[];
}

export function CollaborationWidget({
  itemId,
  itemType = 'dashboard',
  className,
}: CollaborationWidgetProps) {
  const { darkMode } = useAppStore();
  const { addToast } = useBMOStore();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleAddComment = useCallback(() => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: `comment-${Date.now()}`,
      author: 'Vous', // En prod: depuis store/auth
      message: newComment,
      timestamp: new Date(),
    };

    setComments((prev) => [comment, ...prev]);
    setNewComment('');
    addToast('Commentaire ajouté', 'success');
  }, [newComment, addToast]);

  return (
    <DashboardCard
      title="💬 Collaboration"
      subtitle="Commentaires et mentions"
      icon="💬"
      borderColor="#8B5CF6"
      badge={comments.length}
      badgeVariant="info"
      className={className}
    >
      <div className="space-y-3">
        {/* Liste des commentaires */}
        {comments.length > 0 && (
          <div className={cn('space-y-2', !isExpanded && 'max-h-32 overflow-y-auto')}>
            {comments.map((comment) => (
              <div
                key={comment.id}
                className={cn(
                  'p-2 rounded-lg',
                  darkMode ? 'bg-slate-800/30' : 'bg-gray-50'
                )}
              >
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-400/20 flex items-center justify-center flex-shrink-0">
                    <Users className="w-3 h-3 text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-semibold">{comment.author}</span>
                      <span className="text-[9px] text-slate-400">
                        {comment.timestamp.toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-300">{comment.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Formulaire de commentaire */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Ajouter un commentaire..."
              className="text-xs flex-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleAddComment();
                }
              }}
            />
            <Button
              size="sm"
              variant="secondary"
              onClick={handleAddComment}
              className="text-xs"
              disabled={!newComment.trim()}
            >
              <Send className="w-3 h-3" />
            </Button>
          </div>
          <div className="flex items-center gap-2 text-[9px] text-slate-400">
            <AtSign className="w-3 h-3" />
            <span>Utilisez @ pour mentionner</span>
          </div>
        </div>

        {comments.length > 3 && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs w-full"
          >
            {isExpanded ? 'Voir moins' : `Voir tous (${comments.length})`}
          </Button>
        )}
      </div>
    </DashboardCard>
  );
}

