'use client';

/**
 * MessageDetailPanel — Panneau de détail type Outlook (header + corps + actions).
 *
 * Contrat :
 * - Présentation uniquement : pas de fetch, pas de store.
 * - Props : item, callbacks (onReply, onReplyAll, onForward, onMore), bodyHtml / bodyHtmlSanitized / bodyText, emptyMessage.
 * - Page gère : sélection, données, actions métier.
 * - HTML affiché : si le parent passe bodyHtml (brut), le composant le sanitisé avec DOMPurify.
 *   Si le parent passe bodyHtmlSanitized : le parent doit obligatoirement fournir du HTML déjà sanitisé (DOMPurify côté page/hook). Ne jamais passer de HTML non sanitisé dans bodyHtmlSanitized.
 */

import React, { useMemo } from 'react';
import DOMPurify from 'isomorphic-dompurify';
import { Reply, ReplyAll, Forward, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/cn';
import type { BmoMessage } from './types';

const ALLOWED_BODY_TAGS = ['p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li', 'blockquote', 'h1', 'h2', 'h3'];
const ALLOWED_BODY_ATTR = ['href', 'target', 'rel'];

export interface MessageDetailPanelProps {
  item: BmoMessage | null;
  onReply?: () => void;
  onReplyAll?: () => void;
  onForward?: () => void;
  onMore?: () => void;
  /** Corps du message en HTML brut : le composant le sanitisé avec DOMPurify avant affichage */
  bodyHtml?: string | null;
  /** HTML déjà sanitisé par le parent (DOMPurify obligatoire côté page). Ne jamais passer de HTML non sanitisé. Utilisé en priorité si fourni. */
  bodyHtmlSanitized?: string | null;
  /** Si aucun HTML fourni, affiche bodyText ou snippet */
  bodyText?: string | null;
  emptyMessage?: string;
  className?: string;
}

function getInitials(from: BmoMessage['from']): string {
  if (from.name) {
    const parts = from.name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return from.name.slice(0, 2).toUpperCase();
  }
  if (from.address) {
    const local = from.address.split('@')[0];
    return local.slice(0, 2).toUpperCase();
  }
  return '?';
}

function formatFullDate(date: Date): string {
  return new Date(date).toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function MessageDetailPanel({
  item,
  onReply,
  onReplyAll,
  onForward,
  onMore,
  bodyHtml,
  bodyHtmlSanitized,
  bodyText,
  emptyMessage = 'Sélectionnez un élément',
  className,
}: MessageDetailPanelProps) {
  if (!item) {
    return (
      <div
        className={cn(
          'flex-1 flex items-center justify-center p-8 text-slate-500 dark:text-slate-400 text-center',
          className
        )}
        aria-live="polite"
      >
        {emptyMessage}
      </div>
    );
  }

  const senderLabel = item.from.name || item.from.address || 'Inconnu';
  const toLabel =
    item.to.length > 0 ? item.to.map((a) => a.name || a.address).join(', ') : '—';
  const rawHtml = bodyHtml ?? item.bodyHtml;
  const sanitizedFromRaw = useMemo(() => {
    if (rawHtml == null || rawHtml === '') return null;
    return DOMPurify.sanitize(rawHtml, {
      ALLOWED_TAGS: ALLOWED_BODY_TAGS,
      ALLOWED_ATTR: ALLOWED_BODY_ATTR,
    });
  }, [rawHtml]);
  const htmlToDisplay = bodyHtmlSanitized ?? sanitizedFromRaw;
  const displayBody = htmlToDisplay ? { __html: htmlToDisplay } : undefined;
  const displayText = bodyText ?? item.bodyText ?? item.snippet;

  return (
    <div className={cn('flex flex-col h-full overflow-hidden', className)}>
      {/* Header */}
      <div className="shrink-0 border-b border-slate-200 dark:border-slate-800/60 px-6 py-4">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-start gap-3 min-w-0">
            <Avatar className="h-10 w-10 shrink-0 rounded-full bg-slate-600 dark:bg-slate-500 text-white text-sm font-semibold">
              <AvatarFallback>{getInitials(item.from)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 truncate">
                {senderLabel}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
                &lt;{item.from.address}&gt;
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                <span className="font-medium">À :</span> {toLabel}
                {item.to.length > 3 && ` + ${item.to.length - 3} autre(s)`}
              </p>
            </div>
          </div>
          <span className="text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap shrink-0">
            {formatFullDate(item.date)}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" className="gap-2" onClick={onReply} aria-label="Répondre">
            <Reply className="h-4 w-4" />
            Répondre
          </Button>
          <Button variant="outline" size="sm" className="gap-2" onClick={onReplyAll} aria-label="Répondre à tous">
            <ReplyAll className="h-4 w-4" />
            Répondre à tous
          </Button>
          <Button variant="outline" size="sm" className="gap-2" onClick={onForward} aria-label="Transférer">
            <Forward className="h-4 w-4" />
            Transférer
          </Button>
          {onMore && (
            <Button variant="ghost" size="icon" className="shrink-0" onClick={onMore} aria-label="Plus d'options">
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Sujet */}
      <div className="shrink-0 px-6 py-2 border-b border-slate-100 dark:border-slate-800/50">
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
          {item.subject || '(Sans objet)'}
        </h3>
      </div>

      {/* Corps */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {displayBody ? (
          <div
            className="prose prose-sm dark:prose-invert max-w-none text-slate-700 dark:text-slate-300"
            dangerouslySetInnerHTML={displayBody}
          />
        ) : (
          <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{displayText}</p>
        )}
      </div>
    </div>
  );
}
