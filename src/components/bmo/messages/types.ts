/**
 * Types génériques pour la messagerie / layout Outlook-like BMO.
 *
 * Contrat :
 * - Préfixe Bmo pour éviter collision avec types backend (Message, Folder).
 * - Découplés des types métier existants (AlertItem, ExternalMessage, etc.) pour la v1 mockée.
 * - À brancher plus tard sur les types réels si besoin.
 */

/** Adresse expéditeur / destinataire (nom + email) */
export interface BmoMessageAddress {
  name?: string;
  address: string;
}

/** Élément de liste type message / alerte (présentation) */
export interface BmoMessage {
  id: string;
  from: BmoMessageAddress;
  to: BmoMessageAddress[];
  subject: string;
  snippet: string;
  bodyHtml?: string;
  bodyText?: string;
  date: Date;
  receivedAt?: Date;
  isRead: boolean;
  isStarred?: boolean;
  isPinned?: boolean;
  hasAttachments?: boolean;
  folderId: string;
  importance?: 'low' | 'normal' | 'high';
}

/** Dossier / catégorie (sidebar) */
export interface BmoFolder {
  id: string;
  name: string;
  type: 'system' | 'custom';
  systemType?: 'inbox' | 'sent' | 'drafts' | 'trash' | 'archive';
  parentId?: string;
  unreadCount: number;
  totalCount?: number;
  icon?: string;
  order: number;
  children?: BmoFolder[];
}
