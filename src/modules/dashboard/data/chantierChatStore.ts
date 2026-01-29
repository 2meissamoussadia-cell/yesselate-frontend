/**
 * Store conversations par chantier (DG ↔ Chef chantier).
 * Threads par sujet. En production : API + WebSocket.
 */

import type { ChantierMock } from './chantiersMock';

export type ChatRole = 'dg' | 'chef_chantier';

export interface ChatMessage {
  id: string;
  threadId: string;
  chantierId: string;
  role: ChatRole;
  content: string;
  createdAt: number;
  read?: boolean;
}

export interface ChatThread {
  id: string;
  chantierId: string;
  subject: string;
  lastMessageAt: number;
  lastMessagePreview: string;
  messageCount: number;
}

const threads = new Map<string, ChatThread>();
const messagesByThread = new Map<string, ChatMessage[]>();

function threadKey(chantierId: string, subject: string): string {
  return `${chantierId}::${subject}`;
}

/** Récupère ou crée un thread pour un chantier/sujet */
export function getOrCreateThread(chantierId: string, subject: string): ChatThread {
  const key = threadKey(chantierId, subject);
  let thread = threads.get(key);
  if (!thread) {
    thread = {
      id: key,
      chantierId,
      subject,
      lastMessageAt: 0,
      lastMessagePreview: '',
      messageCount: 0,
    };
    threads.set(key, thread);
    messagesByThread.set(key, []);
  }
  return thread;
}

/** Liste des threads (historique centralisé) */
export function getThreads(chantierId?: string): ChatThread[] {
  const list = Array.from(threads.values());
  if (chantierId) return list.filter((t) => t.chantierId === chantierId);
  return list.sort((a, b) => b.lastMessageAt - a.lastMessageAt);
}

/** Messages d'un thread */
export function getMessages(threadId: string): ChatMessage[] {
  return messagesByThread.get(threadId) ?? [];
}

/** Envoyer un message (mock : stockage local) */
export function sendMessage(
  chantierId: string,
  subject: string,
  role: ChatRole,
  content: string
): ChatMessage {
  const key = threadKey(chantierId, subject);
  const thread = getOrCreateThread(chantierId, subject);
  const msg: ChatMessage = {
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    threadId: key,
    chantierId,
    role,
    content,
    createdAt: Date.now(),
    read: false,
  };
  const list = messagesByThread.get(key) ?? [];
  list.push(msg);
  messagesByThread.set(key, list);
  thread.lastMessageAt = msg.createdAt;
  thread.lastMessagePreview = content.slice(0, 60) + (content.length > 60 ? '…' : '');
  thread.messageCount = list.length;
  threads.set(key, thread);
  return msg;
}

/** Sujets par défaut pour un nouveau thread */
export const DEFAULT_SUBJECTS = [
  'Blocage Phase',
  'Validation livraison',
  'Retard fournisseur',
  'Point avancement',
  'Autre',
] as const;
