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
  Wrench,
  Shield,
  Star,
  Scale,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { formatDistanceToNow, format } from 'date-fns';
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
  /** Densité compacte (moins de padding) */
  compact?: boolean;
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
    color: 'bg-slate-100 dark:bg-slate-800/50 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200',
    badge: 'bg-slate-600 text-white dark:bg-slate-500 dark:text-slate-100',
    dot: 'bg-slate-500',
    icon: Circle,
  },
};

/** Couleurs catégories : contraste WCAG AA (4.5:1) — tons plus soutenus en dark */
interface CategorieIconProps {
  className?: string;
  'aria-hidden'?: boolean;
}
type CategorieIcon = React.ComponentType<CategorieIconProps>;
const categorieConfig: Record<string, { Icon: CategorieIcon; color: string; label: string }> = {
  technique: {
    Icon: Wrench,
    color: 'text-blue-700 bg-blue-100 dark:text-sky-300 dark:bg-blue-950/60',
    label: 'Technique',
  },
  budget: {
    Icon: DollarSign,
    color: 'text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-950/50',
    label: 'Budget',
  },
  financier: {
    Icon: DollarSign,
    color: 'text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-950/50',
    label: 'Financier',
  },
  planning: {
    Icon: Calendar,
    color: 'text-orange-700 bg-orange-100 dark:text-orange-300 dark:bg-orange-950/50',
    label: 'Planning',
  },
  securite: {
    Icon: Shield,
    color: 'text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-950/50',
    label: 'Sécurité',
  },
  qualite: {
    Icon: Star,
    color: 'text-purple-700 bg-purple-100 dark:text-purple-300 dark:bg-purple-950/50',
    label: 'Qualité',
  },
  juridique: {
    Icon: Scale,
    color: 'text-pink-700 bg-pink-100 dark:text-pink-300 dark:bg-pink-950/50',
    label: 'Juridique',
  },
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
  compact = false,
}: AlertListRowProps) {
  const config = niveauConfig[alerte.niveau];
  const catConfig = categorieConfig[alerte.categorie] ?? categorieConfig.technique;
  const CategoryIcon = catConfig.Icon;

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
          compact ? 'px-3 py-1.5' : 'px-4 py-2.5',
          'border-b border-slate-100 dark:border-slate-800/40',
          'cursor-pointer transition-all duration-150',
          'hover:bg-slate-50 dark:hover:bg-slate-800/30',
          'before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[3px]',
          'before:bg-transparent before:transition-colors before:duration-150',
          'hover:before:bg-sky-400',
          selected && 'bg-sky-50 dark:bg-sky-900/20 before:bg-sky-500',
          alerte.niveau === 'critique' && 'before:w-[6px] before:bg-red-600 dark:before:bg-red-500 before:animate-pulse',
          alerte.niveau === 'critique' && !selected && 'bg-red-50/80 dark:bg-red-950/30',
          (alerte.statut === 'traite' || alerte.statut === 'cloture') && !selected && 'bg-slate-50/50 dark:bg-slate-800/30',
          alerte.niveau === 'normal' && !selected && !(alerte.statut === 'traite' || alerte.statut === 'cloture') && 'before:bg-blue-400/50',
          alerte.niveau === 'faible' && !selected && 'before:bg-slate-400/50',
          isUnread && !selected && 'bg-slate-50/80 dark:bg-slate-800/40',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900 focus-visible:ring-inset',
          isUnread && 'font-medium'
        )}
      >
        {/* Colonne checkbox — zone tactile 44×44px min (WCAG / tactile) */}
        {showCheckbox && (
          <div
            className="flex items-center justify-center shrink-0 min-w-[44px] min-h-[44px] w-[44px] h-[44px] -m-1 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              onCheckboxChange?.(!checked);
            }}
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onCheckboxChange?.(!checked);
              }
            }}
            role="button"
            tabIndex={0}
            aria-label={checked ? `Désélectionner ${alerte.numero}` : `Sélectionner ${alerte.numero}`}
          >
            <Checkbox
              checked={checked}
              onCheckedChange={(value) => onCheckboxChange?.(!!value)}
              aria-hidden
              className="pointer-events-none"
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
          {/* Ligne 1 : Titre (2 lignes max + tooltip) | Code | Catégorie | Date */}
          <div className="grid grid-cols-[minmax(0,1fr)_auto_auto_auto] items-start gap-x-2 min-w-0">
            <Tooltip>
              <TooltipTrigger asChild>
                <span
                  className="font-semibold text-sm min-w-0 cursor-default text-left block text-slate-900 dark:text-slate-100 line-clamp-2"
                  title={alerte.titre}
                >
                  {alerte.titre}
                </span>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-sm text-sm p-3">
                <p className="whitespace-pre-wrap break-words">{alerte.titre}</p>
              </TooltipContent>
            </Tooltip>
            <span className="text-xs text-slate-500 dark:text-slate-400 shrink-0 tabular-nums pt-0.5" title={alerte.numero}>
              {alerte.numero}
            </span>
            <span
              role="img"
              aria-label={catConfig.label}
              className={cn(
                'text-xs font-medium px-1.5 py-0.5 rounded shrink-0 truncate max-w-[72px] justify-self-end inline-flex items-center gap-1',
                catConfig.color
              )}
              title={catConfig.label}
            >
              <CategoryIcon className="h-3.5 w-3.5 shrink-0" aria-hidden />
              <span>{alerte.categorie}</span>
            </span>
            <Tooltip>
              <TooltipTrigger asChild>
                <span
                  className="text-xs text-slate-600 dark:text-slate-300 shrink-0 truncate max-w-[90px] justify-self-end tabular-nums"
                  title={dateCreation.toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })}
                >
                  {format(dateCreation, "dd/MM à HH'h'mm", { locale: fr })}
                </span>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                {formatDistanceToNow(dateCreation, { addSuffix: true, locale: fr })} — {dateCreation.toLocaleString('fr-FR')}
              </TooltipContent>
            </Tooltip>
          </div>
          {/* Criticité XXL pour niveau critique — bien visible */}
          {alerte.niveau === 'critique' && (
            <div className="flex items-center gap-1.5 min-w-0">
              <Badge className="text-xs font-bold px-2 py-0.5 bg-red-600 text-white border-0 shrink-0 animate-pulse">
                CRITIQUE
              </Badge>
            </div>
          )}
          {/* Action requise — contraste WCAG AA */}
          {isUnread && alerte.niveau !== 'critique' && (
            <div className="flex items-center gap-1.5 min-w-0">
              <Badge variant="outline" className="text-[11px] px-1.5 py-0.5 bg-amber-100 text-amber-900 dark:bg-amber-900/70 dark:text-amber-100 border-amber-300 dark:border-amber-700 shrink-0 font-medium">
                Action requise
              </Badge>
            </div>
          )}

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
            'transition-opacity duration-150',
            'bg-white dark:bg-slate-900 rounded-md shadow-md',
            'border border-slate-200 dark:border-slate-700 p-0.5',
            'opacity-0 group-hover:opacity-100 group-focus-within:opacity-100',
            selected && 'opacity-100'
          )}
          role="group"
          aria-label="Actions rapides"
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 text-slate-600 dark:text-slate-300 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-900/30 transition-colors focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-1"
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
                className="h-8 w-8 shrink-0 text-slate-600 dark:text-slate-300 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-1"
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
