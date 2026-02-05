'use client';

import React from 'react';
import {
  AlertCircle,
  Clock,
  DollarSign,
  Calendar,
  Paperclip,
  MessageSquare,
  Flag,
  Circle,
  Building2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/cn';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { AlerteBTP } from '@/lib/types/alerts-btp.types';

export interface AlertListRowProps {
  alerte: AlerteBTP;
  selected: boolean;
  onClick?: () => void;
  /** Sélection multiple : afficher une case à cocher à gauche */
  showCheckbox?: boolean;
  /** Case cochée (pour multi-sélection) */
  checked?: boolean;
  /** Clic sur la case (stopPropagation pour ne pas déclencher le clic ligne) */
  onCheckboxChange?: (checked: boolean) => void;
}

const niveauConfig: Record<
  AlerteBTP['niveau'],
  { color: string; badge: string; dot: string; icon: React.ComponentType<{ className?: string }> }
> = {
  critique: {
    color: 'bg-red-50 dark:bg-red-950/30 border-red-200 text-red-700 dark:text-red-300',
    badge: 'bg-red-600 text-white',
    dot: 'bg-red-600',
    icon: AlertCircle,
  },
  important: {
    color: 'bg-orange-50 dark:bg-orange-950/30 border-orange-200 text-orange-700 dark:text-orange-300',
    badge: 'bg-orange-600 text-white',
    dot: 'bg-orange-600',
    icon: AlertCircle,
  },
  normal: {
    color: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 text-blue-700 dark:text-blue-300',
    badge: 'bg-blue-600 text-white',
    dot: 'bg-blue-600',
    icon: Circle,
  },
  faible: {
    color: 'bg-gray-50 dark:bg-gray-900/30 border-gray-200 text-gray-700 dark:text-gray-300',
    badge: 'bg-gray-600 text-white',
    dot: 'bg-gray-600',
    icon: Circle,
  },
};

const categorieConfig: Record<string, { icon: string; color: string }> = {
  technique: { icon: '🔧', color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/50' },
  budget: { icon: '💰', color: 'text-green-600 bg-green-50 dark:bg-green-950/50' },
  financier: { icon: '💰', color: 'text-green-600 bg-green-50 dark:bg-green-950/50' },
  planning: { icon: '📅', color: 'text-orange-600 bg-orange-50 dark:bg-orange-950/50' },
  securite: { icon: '🛡️', color: 'text-red-600 bg-red-50 dark:bg-red-950/50' },
  qualite: { icon: '⭐', color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/50' },
  juridique: { icon: '⚖️', color: 'text-pink-600 bg-pink-50 dark:bg-pink-950/50' },
};

/**
 * AlertListRow — Ligne de liste type Outlook pour une alerte BTP.
 *
 * Grille stricte, largeur contrainte :
 * - Racine : grid-cols-[auto_minmax(0,1fr)] → [icônes | contenu]
 * - Contenu : pr-24 pour les actions rapides (encadrement droit) ; sous-grille par ligne.
 * - Ligne 1 : [ID | titre (1fr) | catégorie | date]
 * - Ligne 2 : [chantier + pièces | émetteur → assigné · échéance]
 * - Lignes 3–4 optionnelles : description, impacts.
 * Tous les textes longs ont truncate + min-w-0 pour éviter tout débordement.
 */
export const AlertListRow = React.memo(function AlertListRow({
  alerte,
  selected,
  onClick,
  showCheckbox = false,
  checked = false,
  onCheckboxChange,
}: AlertListRowProps) {
  const config = niveauConfig[alerte.niveau];
  const catConfig = categorieConfig[alerte.categorie] ?? categorieConfig.technique;

  const dateCreation = alerte.dateCreation instanceof Date
    ? alerte.dateCreation
    : new Date(alerte.dateCreation);
  const dateEcheance = alerte.dateEcheance
    ? (alerte.dateEcheance instanceof Date ? alerte.dateEcheance : new Date(alerte.dateEcheance))
    : null;

  const isOverdue = dateEcheance && dateEcheance < new Date();
  const isUnread = alerte.statut === 'non-traite';
  const pieceJointes = alerte.pieceJointes ?? [];
  const commentaires = alerte.commentaires ?? [];

  const metaRight = [
    alerte.emetteur?.nom ?? '—',
    alerte.assigneA?.nom,
    dateEcheance ? formatDistanceToNow(dateEcheance, { addSuffix: true, locale: fr }) : null,
  ].filter(Boolean).join(' · ');
  const hasImpacts = !!(alerte.impactBudget || alerte.impactPlanning);

  const chantierNomRaw = alerte.chantier?.nom?.trim();
  const chantierNom =
    chantierNomRaw && chantierNomRaw !== '—' && chantierNomRaw !== '-' && chantierNomRaw !== '–'
      ? chantierNomRaw
      : null;
  const hasChantier = !!chantierNom;
  const hasPiecesOrComments = pieceJointes.length > 0 || commentaires.length > 0;
  const emetteurNom = alerte.emetteur?.nom?.trim();
  const isEmetteurSysteme = !emetteurNom || emetteurNom.toLowerCase() === 'système';
  const assigneNomRaw = alerte.assigneA?.nom?.trim();
  const assigneNom =
    assigneNomRaw && assigneNomRaw !== '—' && assigneNomRaw !== '-' && assigneNomRaw !== '–'
      ? assigneNomRaw
      : null;
  const hasAssigneUseful = !!assigneNom;
  const hasEmetteurUseful =
    (emetteurNom && !isEmetteurSysteme) || hasAssigneUseful || !!dateEcheance;
  const showLine2 = hasChantier || hasPiecesOrComments || hasEmetteurUseful;
  const showChantierBlock = hasChantier || hasPiecesOrComments;
  const showEmetteurLabel = (!isEmetteurSysteme && emetteurNom) || hasAssigneUseful;

  return (
    <TooltipProvider delayDuration={300}>
      <div
        role="button"
        tabIndex={0}
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick?.();
          }
        }}
        aria-selected={selected}
        className={cn(
          'group relative w-full min-w-0 overflow-hidden shrink-0',
          showCheckbox ? 'grid grid-cols-[auto_auto_minmax(0,1fr)] gap-x-3' : 'grid grid-cols-[auto_minmax(0,1fr)] gap-x-3',
          'px-4 py-2.5 border-b border-slate-100 dark:border-slate-800/40',
          'cursor-pointer transition-all duration-150',
          'hover:bg-slate-50 dark:hover:bg-slate-800/30',
          'before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[3px]',
          'before:bg-transparent before:transition-colors before:duration-150',
          'hover:before:bg-sky-400',
          selected && 'bg-sky-50 dark:bg-sky-900/20 before:bg-sky-500',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-inset',
          isUnread && 'font-medium'
        )}
      >
        {/* Colonne checkbox — 16px strict (même taille que icônes barre Supprimer / Marquer important) */}
        {showCheckbox && (
          <div
            className="flex items-center justify-center shrink-0 w-[16px] min-w-[16px] h-[16px]"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            role="presentation"
          >
            <Checkbox
              checked={checked}
              onCheckedChange={(value) => onCheckboxChange?.(!!value)}
              aria-label={`Sélectionner l'alerte ${alerte.numero}`}
            />
          </div>
        )}
        {/* Colonne icônes (non lu + drapeau) — 16px strict */}
        <div className="flex flex-col items-center gap-0.5 pt-0.5 shrink-0 w-[16px] min-w-[16px]" aria-hidden>
          {isUnread && <div className={cn('w-2 h-2 rounded-full', config.dot)} />}
          {alerte.urgent && (
            <Flag className="h-[16px] w-[16px] text-red-600 fill-red-600 dark:fill-red-500 dark:text-red-500 shrink-0" />
          )}
        </div>

        {/* Colonne contenu — grille stricte, largeur contrainte ; pr-24 = zone réservée pour les actions rapides (encadrement droit) */}
        <div className="min-w-0 overflow-hidden pr-24 grid grid-cols-1 gap-y-1.5">
          {/* Ligne 1 : ID | Titre | Catégorie | Date — texte sm pour titre, xs pour métadonnées */}
          <div className="grid grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center gap-x-1.5 min-w-0">
            <Badge variant="secondary" className="text-xs font-semibold px-1.5 py-0 shrink-0 justify-self-start">
              {alerte.numero}
            </Badge>
            <Tooltip>
              <TooltipTrigger asChild>
                <span
                  className="font-semibold text-sm truncate min-w-0 cursor-default text-left block"
                  title={alerte.titre}
                >
                  {alerte.titre}
                </span>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs text-sm">
                <p>{alerte.titre}</p>
              </TooltipContent>
            </Tooltip>
            <span
              className={cn(
                'text-xs font-medium px-1.5 py-0.5 rounded shrink-0 truncate max-w-[72px] justify-self-end',
                catConfig.color
              )}
              title={alerte.categorie}
            >
              {catConfig.icon} {alerte.categorie}
            </span>
            <span
              className="text-xs text-slate-500 dark:text-slate-400 shrink-0 truncate max-w-[90px] justify-self-end"
              title={dateCreation.toLocaleString()}
            >
              {formatDistanceToNow(dateCreation, { addSuffix: true, locale: fr })}
            </span>
          </div>

          {/* Ligne 2 : texte xs, icônes 3.5 */}
          {showLine2 && (
            <div className="flex items-center gap-2 min-w-0 text-xs text-slate-500 dark:text-slate-400 flex-nowrap">
              {showChantierBlock && (
                <>
                  <div className="flex items-center gap-1 min-w-0 overflow-hidden max-w-full">
                    {hasChantier && (
                      <>
                        <Building2 className="w-3.5 h-3.5 shrink-0" aria-hidden />
                        <span className="truncate">{chantierNom}</span>
                      </>
                    )}
                    {pieceJointes.length > 0 && (
                      <span className="shrink-0 flex items-center gap-0.5">
                        <Paperclip className="w-3.5 h-3.5" aria-hidden />
                        {pieceJointes.length}
                      </span>
                    )}
                    {commentaires.length > 0 && (
                      <span className="shrink-0 flex items-center gap-0.5">
                        <MessageSquare className="w-3.5 h-3.5" aria-hidden />
                        {commentaires.length}
                      </span>
                    )}
                  </div>
                  {hasEmetteurUseful && (
                    <span className="text-slate-400 dark:text-slate-500 shrink-0" aria-hidden>•</span>
                  )}
                </>
              )}
              {hasEmetteurUseful && (
                <div className="flex items-center gap-1.5 min-w-0 overflow-hidden shrink-0">
                  {showEmetteurLabel && (
                    <span className="truncate max-w-[140px]" title={metaRight}>
                      {!isEmetteurSysteme && alerte.emetteur?.nom}
                      {assigneNom &&
                        (isEmetteurSysteme ? `→ ${assigneNom}` : ` → ${assigneNom}`)}
                    </span>
                  )}
                  {dateEcheance && (
                    <span
                      className={cn(
                        'shrink-0 whitespace-nowrap flex items-center gap-0.5',
                        isOverdue && 'text-red-600 dark:text-red-400 font-medium'
                      )}
                      title={dateEcheance.toLocaleString()}
                    >
                      <Clock className="w-3.5 h-3.5" aria-hidden />
                      {formatDistanceToNow(dateEcheance, { addSuffix: true, locale: fr })}
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Ligne 3 (optionnelle) : description — texte xs */}
          {alerte.description && (
            <p
              className="text-xs text-slate-600 dark:text-slate-400 truncate min-w-0"
              title={alerte.description}
            >
              {alerte.description}
            </p>
          )}

          {/* Ligne 4 (optionnelle) : impacts — texte xs, icônes 3.5 */}
          {hasImpacts && (
            <div className="flex items-center gap-1.5 text-xs min-w-0 overflow-hidden flex-nowrap">
              {alerte.impactBudget && (
                <span className="text-green-700 dark:text-green-300 truncate shrink-0 max-w-[50%] inline-flex items-center gap-0.5">
                  <DollarSign className="w-3.5 h-3.5 shrink-0" aria-hidden />
                  {alerte.impactBudget.montant.toLocaleString()} {alerte.impactBudget.devise}
                </span>
              )}
              {alerte.impactPlanning && (
                <span className="text-orange-700 dark:text-orange-300 truncate min-w-0 inline-flex items-center gap-0.5">
                  <Calendar className="w-3.5 h-3.5 shrink-0" aria-hidden />
                  +{alerte.impactPlanning.retard} {alerte.impactPlanning.unite}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Actions rapides au survol — calées dans l’encadrement droit (pr-24), sans déborder */}
        <div
          className={cn(
            'absolute right-2 top-1/2 -translate-y-1/2 z-10',
            'grid grid-cols-3 gap-0.5 w-[4.5rem] shrink-0 overflow-hidden',
            'opacity-0 group-hover:opacity-100 group-focus-within:opacity-100',
            'transition-opacity duration-150',
            'bg-white dark:bg-slate-900 rounded-md shadow-md',
            'border border-slate-200 dark:border-slate-700 p-0.5'
          )}
          role="group"
          aria-label="Actions rapides"
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0 text-slate-600 dark:text-slate-300 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-900/30 transition-colors"
                onClick={(e) => e.stopPropagation()}
                aria-label="Marquer comme traité"
              >
                <Circle className="w-3.5 h-3.5 shrink-0" aria-hidden />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left" className="text-xs">Marquer comme traité</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0 text-slate-600 dark:text-slate-300 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/30 transition-colors"
                onClick={(e) => e.stopPropagation()}
                aria-label="Marquer comme important"
              >
                <Flag className="w-3.5 h-3.5 shrink-0" aria-hidden />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left" className="text-xs">Marquer important</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0 text-slate-600 dark:text-slate-300 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                onClick={(e) => e.stopPropagation()}
                aria-label="Supprimer"
              >
                <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left" className="text-xs">Supprimer</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
});
