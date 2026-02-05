/**
 * Sanitization pour éviter XSS — affichage et envoi de contenu utilisateur.
 * Utilisé pour commentaires, champs texte, aperçu markdown, surlignage recherche.
 */

import DOMPurify from 'isomorphic-dompurify';

/**
 * Retourne du texte brut sans balises HTML (pour envoi API ou affichage sécurisé).
 * À utiliser avant d'enregistrer un commentaire ou tout champ libre.
 */
export function sanitizeTextForComment(text: string): string {
  if (typeof text !== 'string') return '';
  return DOMPurify.sanitize(text, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] }).trim();
}

/** Balises et attributs autorisés pour un aperçu Markdown (liens, gras, code, etc.) */
const MARKDOWN_PREVIEW_ALLOWED = {
  ALLOWED_TAGS: [
    'p', 'br', 'strong', 'em', 'b', 'i', 'code', 'pre', 'a',
    'ul', 'ol', 'li', 'span', 'blockquote', 'h1', 'h2', 'h3',
  ],
  ALLOWED_ATTR: ['href', 'class', 'target', 'rel'],
  ADD_ATTR: ['target', 'rel'],
};
/** Schéma URI autorisé pour les liens (évite javascript:, data:, etc.) */
const SAFE_URI_REGEXP = /^(?:(?:https?|mailto|tel):|[#/]|\.)/i;

/**
 * Sanitize du HTML issu d'un rendu Markdown (aperçu commentaires, etc.).
 * Autorise les balises courantes et les liens vers http(s)/mailto/tel/#.
 */
export function sanitizeHtmlForDisplay(html: string): string {
  if (typeof html !== 'string') return '';
  return DOMPurify.sanitize(html, {
    ...MARKDOWN_PREVIEW_ALLOWED,
    ALLOWED_URI_REGEXP: SAFE_URI_REGEXP,
  });
}

/**
 * Sanitize du HTML de surlignage (ex. highlightMatch) : n'autorise que <mark> avec class.
 */
export function sanitizeHighlightHtml(html: string): string {
  if (typeof html !== 'string') return '';
  return DOMPurify.sanitize(html, { ALLOWED_TAGS: ['mark'], ALLOWED_ATTR: ['class'] });
}
