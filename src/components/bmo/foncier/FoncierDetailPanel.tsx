'use client';

import React from 'react';
import { MapPin, Calendar, FileText, User, Building2, Ruler } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatDistanceToNow, format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/cn';
import type { FoncierItem } from './FoncierListRow';

export interface FoncierDetailPanelProps {
  item: FoncierItem | null;
  loading?: boolean;
}

const statutConfig: Record<FoncierItem['statut'], { color: string; label: string }> = {
  'en-cours': { color: 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300', label: 'En cours' },
  'valide': { color: 'bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-300', label: 'Validé' },
  'rejete': { color: 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300', label: 'Rejeté' },
  'attente': { color: 'bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300', label: 'En attente' },
};

export const FoncierDetailPanel = React.memo(function FoncierDetailPanel({
  item,
  loading = false,
}: FoncierDetailPanelProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-500 dark:text-slate-400">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-3 max-w-sm px-4">
          <MapPin className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto" />
          <div className="space-y-1">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">
              Aucun dossier sélectionné
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Sélectionnez un dossier foncier dans la liste pour voir les détails
            </p>
          </div>
        </div>
      </div>
    );
  }

  const dateCreation = item.dateCreation instanceof Date
    ? item.dateCreation
    : new Date(item.dateCreation);
  const statutInfo = statutConfig[item.statut];

  return (
    <div className="h-full overflow-y-auto bg-white dark:bg-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="font-semibold">
                {item.numero}
              </Badge>
              <Badge variant="outline" className={cn('text-xs', statutInfo.color)}>
                {statutInfo.label}
              </Badge>
            </div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-1">
              {item.titre}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Créé {formatDistanceToNow(dateCreation, { addSuffix: true, locale: fr })}
            </p>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <Button size="sm" variant="default">
            Valider
          </Button>
          <Button size="sm" variant="outline">
            Modifier
          </Button>
          <Button size="sm" variant="outline">
            Exporter
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Informations principales */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Informations principales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Type d'opération
                </label>
                <p className="text-sm text-slate-900 dark:text-slate-100 capitalize">
                  {item.type}
                </p>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Localisation
                </label>
                <p className="text-sm text-slate-900 dark:text-slate-100 flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {item.localisation}
                </p>
              </div>
              {item.surface && (
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Surface
                  </label>
                  <p className="text-sm text-slate-900 dark:text-slate-100 flex items-center gap-1">
                    <Ruler className="w-4 h-4" />
                    {item.surface.toLocaleString()} m²
                  </p>
                </div>
              )}
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Date de création
                </label>
                <p className="text-sm text-slate-900 dark:text-slate-100 flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {format(dateCreation, 'dd MMM yyyy', { locale: fr })}
                </p>
              </div>
            </div>

            {item.responsable && (
              <>
                <Separator />
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Responsable
                  </label>
                  <p className="text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    {item.responsable.nom}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Description */}
        {item.description && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                {item.description}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Pièces jointes */}
        {item.pieceJointes && item.pieceJointes > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Pièces jointes ({item.pieceJointes})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {item.pieceJointes} document{item.pieceJointes > 1 ? 's' : ''} attaché{item.pieceJointes > 1 ? 's' : ''}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
});
