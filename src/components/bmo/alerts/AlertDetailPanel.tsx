'use client';

import React, { useState } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Check,
  UserPlus,
  CheckCircle,
  Archive,
  Download,
  Printer,
  Share2,
  MoreHorizontal,
  Building2,
  Calendar,
  User,
  Clock,
  AlertTriangle,
  TrendingDown,
  Paperclip,
  MessageSquare,
  History,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { formatDistanceToNow, format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/cn';
import { sanitizeTextForComment } from '@/lib/utils/sanitize';
import type { AlerteBTP } from '@/lib/types/alerts-btp.types';

export interface AlertDetailPanelRecapStats {
  total: number;
  critiques: number;
  enAttente: number;
}

export interface AlertDetailPanelProps {
  alerte: AlerteBTP | null;
  onClose?: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  onTraiter?: () => void;
  onAssigner?: () => void;
  onCloturer?: () => void;
  onArchiver?: () => void;
  onCommentSubmit?: (text: string) => void;
  onViewChantier?: (chantierId: string) => void;
  /** Mini récap affiché quand aucune alerte sélectionnée (vision globale) */
  recapStats?: AlertDetailPanelRecapStats | null;
  loading?: boolean;
  /** Vue d'origine pour le breadcrumb (ex. "critiques", "toutes") */
  activeView?: string;
  /** Position dans la liste (1-based) pour affichage "2 / 100" */
  positionIndex?: number;
  positionTotal?: number;
}

function formatDate(d: Date | string): string {
  const date = d instanceof Date ? d : new Date(d);
  return format(date, 'dd/MM/yyyy HH:mm', { locale: fr });
}

const VIEW_LABELS: Record<string, string> = {
  critiques: 'Critiques',
  toutes: 'Toutes',
};

export function AlertDetailPanel({
  alerte,
  onClose,
  onPrevious,
  onNext,
  onTraiter,
  onAssigner,
  onCloturer,
  onArchiver,
  onCommentSubmit,
  onViewChantier,
  recapStats,
  loading,
  activeView,
  positionIndex,
  positionTotal,
}: AlertDetailPanelProps) {
  const [commentText, setCommentText] = useState('');
  const viewLabel = activeView ? (VIEW_LABELS[activeView] ?? activeView) : null;

  const handleDownload = () => {
    if (!alerte) return;
    const blob = new Blob(
      [
        JSON.stringify(
          {
            numero: alerte.numero,
            titre: alerte.titre,
            description: alerte.description,
            niveau: alerte.niveau,
            statut: alerte.statut,
            dateCreation: alerte.dateCreation,
            chantier: alerte.chantier?.nom,
          },
          null,
          2
        ),
      ],
      { type: 'application/json' }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${alerte.numero}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  const handlePrint = () => {
    if (typeof window !== 'undefined') window.print();
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full bg-white dark:bg-slate-950/40 animate-pulse">
        <div className="shrink-0 h-14 bg-slate-100 dark:bg-slate-800/50" />
        <div className="flex-1 p-6 space-y-4">
          <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
          <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-full" />
          <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-2/3" />
          <div className="h-20 bg-slate-100 dark:bg-slate-800 rounded w-full" />
        </div>
      </div>
    );
  }

  if (!alerte) {
    return (
      <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900/50 p-6 overflow-y-auto">
        <div className="text-center space-y-3 flex-1 flex flex-col justify-center">
          <AlertTriangle className="w-12 h-12 text-slate-400 mx-auto shrink-0" aria-hidden />
          <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
            Sélectionnez une alerte pour voir les détails
          </p>
          {recapStats && recapStats.total > 0 && (
            <div
              className="mt-4 p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 text-left max-w-xs mx-auto"
              role="status"
              aria-label="Récapitulatif des alertes"
            >
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Vision globale
              </p>
              <ul className="space-y-1.5 text-sm text-slate-700 dark:text-slate-300">
                <li className="flex justify-between gap-3">
                  <span>Total</span>
                  <span className="font-semibold tabular-nums">{recapStats.total}</span>
                </li>
                {recapStats.critiques > 0 && (
                  <li className="flex justify-between gap-3 text-red-700 dark:text-red-300">
                    <span>Critiques</span>
                    <span className="font-semibold tabular-nums">{recapStats.critiques}</span>
                  </li>
                )}
                {recapStats.enAttente > 0 && (
                  <li className="flex justify-between gap-3 text-amber-700 dark:text-amber-300">
                    <span>En attente</span>
                    <span className="font-semibold tabular-nums">{recapStats.enAttente}</span>
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  }

  const dateEcheance = alerte.dateEcheance
    ? (alerte.dateEcheance instanceof Date ? alerte.dateEcheance : new Date(alerte.dateEcheance))
    : null;
  const isOverdue = dateEcheance && dateEcheance < new Date();
  const historique = alerte.historique ?? [];
  const pieceJointes = alerte.pieceJointes ?? [];
  const commentaires = alerte.commentaires ?? [];

  const iconSize = 'h-[16px] w-[16px] shrink-0';

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-950/40">
      <div className="shrink-0 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800/60">
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="ghost" size="sm" onClick={onPrevious} disabled={!onPrevious} aria-label="Alerte précédente">
              <ChevronLeft className={iconSize} />
            </Button>
            <Button variant="ghost" size="sm" onClick={onNext} disabled={!onNext} aria-label="Alerte suivante">
              <ChevronRight className={iconSize} />
            </Button>
            {positionIndex != null && positionTotal != null && positionTotal > 0 && (
              <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums px-1" aria-live="polite">
                {positionIndex} / {positionTotal}
              </span>
            )}
            <Separator orientation="vertical" className="h-6" />
            <Button
              size="sm"
              onClick={onTraiter}
              disabled={!onTraiter}
              aria-label={alerte ? `Marquer ${alerte.numero} comme traité` : undefined}
            >
              <Check className={iconSize + ' mr-2'} />
              Traiter
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onAssigner}
              disabled={!onAssigner}
              aria-label={alerte ? `Assigner l'alerte ${alerte.numero}` : undefined}
            >
              <UserPlus className={iconSize + ' mr-2'} />
              Assigner
            </Button>
          </div>
          <TooltipProvider delayDuration={300}>
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0" aria-label="Télécharger" onClick={handleDownload}>
                    <Download className={iconSize} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Télécharger (JSON)</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0" aria-label="Imprimer" onClick={handlePrint}>
                    <Printer className={iconSize} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Imprimer</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0" aria-label="Partager">
                    <Share2 className={iconSize} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Partager</TooltipContent>
              </Tooltip>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0" aria-label="Plus d'actions">
                    <MoreHorizontal className={iconSize} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={onCloturer}
                    disabled={!onCloturer}
                    aria-label={alerte ? `Clôturer l'alerte ${alerte.numero}` : undefined}
                  >
                    <CheckCircle className={iconSize + ' mr-2'} />
                    Clôturer
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={onArchiver}
                    disabled={!onArchiver}
                    aria-label={alerte ? `Archiver l'alerte ${alerte.numero}` : undefined}
                  >
                    <Archive className={iconSize + ' mr-2'} />
                    Archiver
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              {onClose && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0" onClick={onClose} aria-label="Fermer">
                      <X className={iconSize} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">Fermer</TooltipContent>
                </Tooltip>
              )}
            </div>
          </TooltipProvider>
        </div>

        <div className="px-6 py-4 space-y-3">
          <nav aria-label="Fil d'Ariane" className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
            <span>Centre d&apos;alertes</span>
            {viewLabel && (
              <>
                <span aria-hidden>›</span>
                <span>{viewLabel}</span>
              </>
            )}
            <span aria-hidden>›</span>
            <span className="font-medium text-slate-600 dark:text-slate-300">{alerte.numero}</span>
          </nav>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Priorité exclusive : une seule priorité affichée (critique/urgent > important > niveau) */}
            {(alerte.urgent || alerte.niveau === 'critique') ? (
              <Badge variant="destructive" className="shrink-0">
                {alerte.niveau === 'critique' ? 'CRITIQUE' : 'URGENT'}
              </Badge>
            ) : alerte.niveau === 'important' ? (
              <Badge
                variant="outline"
                className="bg-orange-600 text-white border-orange-600 shrink-0"
              >
                IMPORTANT
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className={cn(
                  alerte.niveau === 'normal' && 'bg-blue-600 text-white border-blue-600',
                  alerte.niveau === 'faible' && 'bg-slate-500 text-white border-slate-500'
                )}
              >
                {alerte.niveau.toUpperCase()}
              </Badge>
            )}
            <Badge variant="outline" className="shrink-0">
              {alerte.statut.replace('-', ' ')}
            </Badge>
          </div>
          {/* Impact € / jours — contexte actionnable en tête (Sprint 0) */}
          {(alerte.impactBudget || alerte.impactPlanning) && (
            <div className="flex flex-wrap items-center gap-3 py-2 px-3 rounded-lg bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Impact</span>
              {alerte.impactBudget && (
                <span className="text-sm font-bold text-green-700 dark:text-green-300">
                  +{alerte.impactBudget.montant.toLocaleString('fr-FR')} {alerte.impactBudget.devise}
                </span>
              )}
              {alerte.impactBudget && alerte.impactPlanning && (
                <span className="text-slate-400 dark:text-slate-500" aria-hidden>•</span>
              )}
              {alerte.impactPlanning && (
                <span className="text-sm font-bold text-orange-700 dark:text-orange-300">
                  +{alerte.impactPlanning.retard} {alerte.impactPlanning.unite === 'semaines' ? 'sem.' : 'j'} retard
                </span>
              )}
            </div>
          )}
          <h1 className="text-base font-bold text-slate-900 dark:text-slate-100">{alerte.titre}</h1>
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="space-y-1">
              <div className="text-xs text-slate-500">Chantier</div>
              <div className="flex items-center gap-2 flex-wrap">
                <Building2 className="w-4 h-4 text-slate-400 shrink-0" aria-hidden />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium">{alerte.chantier?.nom?.trim() || 'Sans chantier'}</div>
                  {alerte.chantier?.code?.trim() && (
                    <div className="text-xs text-slate-500">{alerte.chantier.code}</div>
                  )}
                </div>
                {alerte.chantier?.id && onViewChantier && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="shrink-0"
                    onClick={() => onViewChantier(alerte.chantier!.id)}
                    aria-label={`Voir le chantier ${alerte.chantier?.nom ?? alerte.chantier?.id}`}
                  >
                    <Building2 className="h-3.5 w-3.5 mr-1.5" aria-hidden />
                    Voir le chantier
                  </Button>
                )}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-slate-500">Catégorie</div>
              <Badge variant="outline" className="w-fit capitalize">
                {alerte.categorie}
              </Badge>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-slate-500">Créée le</div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>{formatDate(alerte.dateCreation)}</span>
                <span className="text-slate-500">par {alerte.emetteur?.nom ?? '—'}</span>
              </div>
            </div>
            {dateEcheance && (
              <div className="space-y-1">
                <div className="text-xs text-slate-500">Échéance</div>
                <div
                  className={cn(
                    'flex items-center gap-2 text-sm',
                    isOverdue && 'text-red-600 dark:text-red-400 font-medium'
                  )}
                >
                  <Clock className="w-4 h-4" />
                  <span>{format(dateEcheance, 'dd/MM/yyyy', { locale: fr })}</span>
                  {isOverdue && <Badge variant="destructive">EN RETARD</Badge>}
                </div>
              </div>
            )}
            <div className="space-y-1">
              <div className="text-xs text-slate-500">Assignation</div>
              {alerte.assigneA ? (
                <div className="flex items-center gap-2">
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={alerte.assigneA.avatar} />
                    <AvatarFallback className="text-xs">{alerte.assigneA.nom?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-sm font-medium">{alerte.assigneA.nom}</div>
                    <div className="text-xs text-slate-500">{alerte.assigneA.role ?? '—'}</div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400 italic">Non assignée</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="px-6 py-6 space-y-6">
          <section>
            <h3 className="flex items-center gap-2 text-sm font-semibold mb-3">
              <Info className="w-4 h-4" />
              Description
            </h3>
            <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
              {alerte.description || '—'}
            </p>
          </section>

          {(alerte.impactBudget || alerte.impactPlanning || alerte.impactQualite) && (
            <section>
              <h3 className="flex items-center gap-2 text-sm font-semibold mb-3">
                <TrendingDown className="w-4 h-4" />
                Impact métier
              </h3>
              <div className="grid gap-3">
                {alerte.impactBudget && (
                  <div className="p-4 border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/30 rounded-lg">
                    <div className="font-medium text-green-900 dark:text-green-100">Impact budget</div>
                    <div className="text-xl font-bold text-green-700 dark:text-green-300 my-1">
                      +{alerte.impactBudget.montant.toLocaleString()} {alerte.impactBudget.devise}
                    </div>
                    {alerte.impactBudget.detail && (
                      <div className="text-sm text-green-700 dark:text-green-400">
                        {alerte.impactBudget.detail}
                      </div>
                    )}
                  </div>
                )}
                {alerte.impactPlanning && (
                  <div className="p-4 border border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/30 rounded-lg">
                    <div className="font-medium text-orange-900 dark:text-orange-100">Impact planning</div>
                    <div className="text-xl font-bold text-orange-700 dark:text-orange-300 my-1">
                      +{alerte.impactPlanning.retard} {alerte.impactPlanning.unite}
                    </div>
                    {alerte.impactPlanning.detail && (
                      <div className="text-sm text-orange-700 dark:text-orange-400">
                        {alerte.impactPlanning.detail}
                      </div>
                    )}
                  </div>
                )}
                {alerte.impactQualite && (
                  <div className="p-4 border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
                    <div className="font-medium text-purple-900 dark:text-purple-100">Impact qualité</div>
                    <div className="text-lg font-bold text-purple-700 dark:text-purple-300 my-1">
                      Niveau {alerte.impactQualite.niveau}
                    </div>
                    {alerte.impactQualite.detail && (
                      <div className="text-sm text-purple-700 dark:text-purple-400">
                        {alerte.impactQualite.detail}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </section>
          )}

          {pieceJointes.length > 0 && (
            <section>
              <h3 className="flex items-center gap-2 text-sm font-semibold mb-3">
                <Paperclip className="w-4 h-4" />
                Pièces jointes ({pieceJointes.length})
              </h3>
              <div className="grid gap-2">
                {pieceJointes.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center gap-3 p-3 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded flex items-center justify-center">
                      <Paperclip className="w-6 h-6 text-slate-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{doc.nom}</div>
                      <div className="text-xs text-slate-500">
                        {(doc.taille / 1024).toFixed(0)} Ko • {doc.uploadePar?.nom}
                      </div>
                    </div>
                    {doc.url ? (
                      <Button size="sm" variant="ghost" asChild>
                        <a href={doc.url} download={doc.nom} target="_blank" rel="noopener noreferrer" aria-label={`Télécharger ${doc.nom}`}>
                          <Download className="w-4 h-4" />
                        </a>
                      </Button>
                    ) : (
                      <Button size="sm" variant="ghost" disabled aria-label={`Télécharger ${doc.nom} (indisponible)`}>
                        <Download className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          <section>
            <h3 className="flex items-center gap-2 text-sm font-semibold mb-3">
              <MessageSquare className="w-4 h-4" />
              Commentaires ({commentaires.length})
            </h3>
            <div className="space-y-4">
              {commentaires.map((c) => (
                <div key={c.id} className="flex gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={c.auteur?.avatar} />
                    <AvatarFallback className="text-xs">{c.auteur?.nom?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{c.auteur?.nom}</span>
                      <span className="text-xs text-slate-500">
                        {c.date instanceof Date
                          ? formatDistanceToNow(c.date, { addSuffix: true, locale: fr })
                          : formatDistanceToNow(new Date(c.date), { addSuffix: true, locale: fr })}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap break-words">
                      {c.contenu}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {historique.length > 0 && (
            <section>
              <h3 className="flex items-center gap-2 text-sm font-semibold mb-3">
                <History className="w-4 h-4" />
                Historique
              </h3>
              <div className="space-y-3">
                {historique.map((action, idx) => (
                  <div key={action.id} className="flex gap-3">
                    <div
                      className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center shrink-0',
                        action.type === 'creation' && 'bg-blue-100 dark:bg-blue-900/50 text-blue-600',
                        action.type === 'modification' && 'bg-orange-100 dark:bg-orange-900/50 text-orange-600',
                        action.type === 'commentaire' && 'bg-green-100 dark:bg-green-900/50 text-green-600',
                        action.type === 'assignation' && 'bg-purple-100 dark:bg-purple-900/50 text-purple-600'
                      )}
                    >
                      {action.type === 'creation' && <AlertTriangle className="w-4 h-4" />}
                      {action.type === 'modification' && <Info className="w-4 h-4" />}
                      {action.type === 'commentaire' && <MessageSquare className="w-4 h-4" />}
                      {action.type === 'assignation' && <UserPlus className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 pb-6">
                      <div className="font-medium text-sm">{action.titre}</div>
                      {action.description && (
                        <div className="text-sm text-slate-600 dark:text-slate-400">{action.description}</div>
                      )}
                      <div className="text-xs text-slate-500 mt-1">
                        {action.auteur?.nom} •
                        {action.date instanceof Date
                          ? formatDistanceToNow(action.date, { addSuffix: true, locale: fr })
                          : formatDistanceToNow(new Date(action.date), { addSuffix: true, locale: fr })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      <div className="shrink-0 border-t border-slate-200 dark:border-slate-800 p-4">
        <div className="flex gap-3">
          <Avatar className="w-8 h-8 shrink-0">
            <AvatarFallback>AD</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Écrire un commentaire (max. 500 caractères)"
              maxLength={500}
              rows={4}
              className="w-full min-h-[100px] max-h-[200px] rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm resize-y overflow-y-auto"
              aria-describedby="comment-char-count comment-error"
              aria-invalid={commentText.trim() === '' && commentText.length > 0}
            />
            {commentText.length > 0 && commentText.trim() === '' && (
              <p id="comment-error" className="text-xs text-red-600 dark:text-red-400" role="alert">
                Le commentaire ne peut pas être vide.
              </p>
            )}
            <div className="flex justify-between items-center gap-2 flex-wrap">
              <span
                id="comment-char-count"
                className={cn(
                  'text-xs tabular-nums',
                  commentText.length >= 500
                    ? 'text-red-600 dark:text-red-400 font-medium'
                    : commentText.length >= 450
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-slate-500 dark:text-slate-400'
                )}
              >
                {commentText.length} / 500
                {commentText.length >= 450 && commentText.length < 500 && ' — bientôt la limite'}
              </span>
              <div className="flex gap-2 justify-end flex-1 min-w-0">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCommentText('')}
                  className="order-1"
                  aria-label="Annuler et vider le commentaire"
                >
                  Annuler
                </Button>
                <Button
                  size="sm"
                  variant="default"
                  disabled={!commentText.trim() || !onCommentSubmit || commentText.length > 500}
                  onClick={() => {
                    const raw = commentText.trim();
                    if (!raw || !onCommentSubmit) return;
                    const safe = sanitizeTextForComment(raw);
                    if (safe) {
                      onCommentSubmit(safe);
                      setCommentText('');
                    }
                  }}
                  aria-describedby={!commentText.trim() && commentText.length > 0 ? 'comment-error' : undefined}
                  className="order-2 min-w-[5rem]"
                  aria-label="Envoyer le commentaire"
                >
                  Envoyer
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
