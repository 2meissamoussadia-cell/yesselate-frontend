/**
 * Service de Gestion des Commentaires
 * =====================================
 * 
 * Système de commentaires collaboratif avec mentions et pièces jointes
 */

import type { Document } from '@/lib/services/documentService';

// ============================================
// TYPES
// ============================================

export interface Comment {
  id: string;
  entityType: string;
  entityId: string;
  auteurId: string;
  auteurNom: string;
  auteurAvatar?: string;
  contenu: string;
  mentions?: string[]; // IDs des utilisateurs mentionnés (@userId)
  piecesJointes?: Document[];
  parentId?: string; // Pour les réponses
  reactions?: CommentReaction[];
  isEdited: boolean;
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string;
}

export interface CommentReaction {
  emoji: string;
  userId: string;
  userName: string;
  createdAt: string;
}

export interface CommentThread {
  comment: Comment;
  replies: Comment[];
  replyCount: number;
}

export interface CommentFilters {
  entityType?: string;
  entityId?: string;
  auteurId?: string;
  hasAttachments?: boolean;
  dateDebut?: string;
  dateFin?: string;
}

export interface CommentStats {
  total: number;
  parEntity: Array<{ entityType: string; count: number }>;
  parAuteur: Array<{ auteurId: string; auteurNom: string; count: number }>;
  withAttachments: number;
  withMentions: number;
}

// ============================================
// MOCK DATA
// ============================================

const mockComments: Comment[] = [
  {
    id: 'CMT-001',
    entityType: 'projet',
    entityId: 'PRJ-001',
    auteurId: 'user-1',
    auteurNom: 'Ahmed Diallo',
    auteurAvatar: '/avatars/user-1.jpg',
    contenu: 'Le projet avance bien. @user-2 peux-tu vérifier les plans ?',
    mentions: ['user-2'],
    isEdited: false,
    createdAt: '2026-01-10T09:30:00Z',
  },
  {
    id: 'CMT-002',
    entityType: 'projet',
    entityId: 'PRJ-001',
    auteurId: 'user-2',
    auteurNom: 'Fatou Sall',
    contenu: 'Plans vérifiés, tout est OK ✅',
    parentId: 'CMT-001',
    reactions: [
      { emoji: '👍', userId: 'user-1', userName: 'Ahmed Diallo', createdAt: '2026-01-10T10:00:00Z' },
    ],
    isEdited: false,
    createdAt: '2026-01-10T09:45:00Z',
  },
];

// ============================================
// SERVICE
// ============================================

class CommentsService {
  private baseUrl = '/api/comments';

  /**
   * Récupère les commentaires d'une entité
   */
  async getComments(
    entityType: string,
    entityId: string,
    options?: {
      includeDeleted?: boolean;
      sortBy?: 'date' | 'reactions';
      sortOrder?: 'asc' | 'desc';
    }
  ): Promise<Comment[]> {
    await this.delay(400);

    let comments = mockComments.filter(
      (c) => c.entityType === entityType && c.entityId === entityId
    );

    if (!options?.includeDeleted) {
      comments = comments.filter((c) => !c.deletedAt);
    }

    // Tri
    const sortOrder = options?.sortOrder || 'asc';
    comments.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

    return comments;
  }

  /**
   * Récupère les commentaires organisés en threads
   */
  async getThreads(
    entityType: string,
    entityId: string
  ): Promise<CommentThread[]> {
    await this.delay(400);

    const allComments = await this.getComments(entityType, entityId);

    // Séparer commentaires principaux et réponses
    const mainComments = allComments.filter((c) => !c.parentId);
    const replies = allComments.filter((c) => c.parentId);

    // Organiser en threads
    const threads: CommentThread[] = mainComments.map((comment) => {
      const commentReplies = replies.filter((r) => r.parentId === comment.id);

      return {
        comment,
        replies: commentReplies,
        replyCount: commentReplies.length,
      };
    });

    return threads;
  }

  /**
   * Ajoute un commentaire
   */
  async addComment(data: {
    entityType: string;
    entityId: string;
    contenu: string;
    parentId?: string;
    mentions?: string[];
    piecesJointes?: Document[];
  }): Promise<Comment> {
    await this.delay(500);

    const comment: Comment = {
      id: `CMT-${Date.now()}`,
      entityType: data.entityType,
      entityId: data.entityId,
      auteurId: 'current-user-id',
      auteurNom: 'Utilisateur Actuel',
      contenu: data.contenu,
      mentions: data.mentions || this.extractMentions(data.contenu),
      piecesJointes: data.piecesJointes,
      parentId: data.parentId,
      isEdited: false,
      createdAt: new Date().toISOString(),
    };

    // Envoyer notifications aux personnes mentionnées
    if (comment.mentions && comment.mentions.length > 0) {
      await this.notifyMentions(comment);
    }

    return comment;
  }

  /**
   * Modifie un commentaire
   */
  async editComment(
    commentId: string,
    newContenu: string
  ): Promise<Comment> {
    await this.delay(300);

    // En production: vérifier que l'utilisateur est l'auteur
    const comment = mockComments.find((c) => c.id === commentId);
    if (!comment) throw new Error('Commentaire non trouvé');

    return {
      ...comment,
      contenu: newContenu,
      mentions: this.extractMentions(newContenu),
      isEdited: true,
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * Supprime un commentaire (soft delete)
   */
  async deleteComment(commentId: string): Promise<void> {
    await this.delay(300);

    // En production: marquer comme supprimé plutôt que vraiment supprimer
    // Pour garder l'historique et les références
  }

  /**
   * Ajoute une réaction à un commentaire
   */
  async addReaction(
    commentId: string,
    emoji: string
  ): Promise<Comment> {
    await this.delay(200);

    const comment = mockComments.find((c) => c.id === commentId);
    if (!comment) throw new Error('Commentaire non trouvé');

    const reaction: CommentReaction = {
      emoji,
      userId: 'current-user-id',
      userName: 'Utilisateur Actuel',
      createdAt: new Date().toISOString(),
    };

    return {
      ...comment,
      reactions: [...(comment.reactions || []), reaction],
    };
  }

  /**
   * Retire une réaction d'un commentaire
   */
  async removeReaction(
    commentId: string,
    emoji: string,
    userId: string
  ): Promise<Comment> {
    await this.delay(200);

    const comment = mockComments.find((c) => c.id === commentId);
    if (!comment) throw new Error('Commentaire non trouvé');

    return {
      ...comment,
      reactions: (comment.reactions || []).filter(
        (r) => !(r.emoji === emoji && r.userId === userId)
      ),
    };
  }

  /**
   * Extrait les mentions (@userId) d'un texte
   */
  private extractMentions(text: string): string[] {
    const mentionRegex = /@([a-zA-Z0-9_-]+)/g;
    const matches = text.matchAll(mentionRegex);
    return Array.from(matches, (m) => m[1]);
  }

  /**
   * Envoie des notifications aux utilisateurs mentionnés
   */
  private async notifyMentions(comment: Comment): Promise<void> {
    if (!comment.mentions || comment.mentions.length === 0) return;

    // En production: envoyer notification à chaque utilisateur mentionné
    console.log(`📧 Notifications envoyées à ${comment.mentions.length} utilisateur(s)`);

    // Exemple avec notificationService
    /*
    for (const userId of comment.mentions) {
      await notificationService.sendNotification({
        type: 'info',
        priority: 'medium',
        titre: `${comment.auteurNom} vous a mentionné`,
        message: comment.contenu.substring(0, 100),
        module: comment.entityType,
        entityId: comment.entityId,
        entityType: comment.entityType,
        userId,
        actionUrl: `/maitre-ouvrage/${comment.entityType}?id=${comment.entityId}#comment-${comment.id}`,
        actionLabel: 'Voir le commentaire',
      });
    }
    */
  }

  /**
   * Récupère les statistiques des commentaires
   */
  async getStats(filters?: CommentFilters): Promise<CommentStats> {
    await this.delay(300);

    return {
      total: 245,
      parEntity: [
        { entityType: 'projet', count: 120 },
        { entityType: 'bc', count: 58 },
        { entityType: 'contrat', count: 35 },
        { entityType: 'ticket', count: 32 },
      ],
      parAuteur: [
        { auteurId: 'user-1', auteurNom: 'Ahmed Diallo', count: 68 },
        { auteurId: 'user-2', auteurNom: 'Fatou Sall', count: 52 },
        { auteurId: 'user-3', auteurNom: 'Ousmane Sy', count: 45 },
      ],
      withAttachments: 38,
      withMentions: 92,
    };
  }

  /**
   * Recherche dans les commentaires
   */
  async searchComments(
    query: string,
    filters?: CommentFilters
  ): Promise<Comment[]> {
    await this.delay(400);

    let results = [...mockComments];

    // Filtrer par texte
    if (query.trim()) {
      const q = query.toLowerCase();
      results = results.filter(
        (c) =>
          c.contenu.toLowerCase().includes(q) ||
          c.auteurNom.toLowerCase().includes(q)
      );
    }

    // Filtrer par entité
    if (filters?.entityType) {
      results = results.filter((c) => c.entityType === filters.entityType);
    }

    if (filters?.entityId) {
      results = results.filter((c) => c.entityId === filters.entityId);
    }

    return results;
  }

  /**
   * Récupère le nombre de commentaires d'une entité
   */
  async getCount(entityType: string, entityId: string): Promise<number> {
    await this.delay(100);

    const comments = await this.getComments(entityType, entityId);
    return comments.length;
  }

  /**
   * Récupère les commentaires récents d'un utilisateur
   */
  async getUserComments(
    userId: string,
    limit: number = 10
  ): Promise<Comment[]> {
    await this.delay(300);

    return mockComments
      .filter((c) => c.auteurId === userId && !c.deletedAt)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  /**
   * Marque des commentaires comme lus (pour notifications)
   */
  async markAsRead(commentIds: string[]): Promise<void> {
    await this.delay(200);
    // En production: marquer comme lu pour l'utilisateur courant
  }

  /**
   * Formate une date relative (ex: "il y a 2 heures")
   */
  formatRelativeTime(date: string): string {
    const now = new Date();
    const commentDate = new Date(date);
    const diffMs = now.getTime() - commentDate.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return 'à l\'instant';
    if (diffMin < 60) return `il y a ${diffMin} min`;
    if (diffHour < 24) return `il y a ${diffHour}h`;
    if (diffDay < 7) return `il y a ${diffDay}j`;

    return commentDate.toLocaleDateString('fr-FR');
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export const commentsService = new CommentsService();

