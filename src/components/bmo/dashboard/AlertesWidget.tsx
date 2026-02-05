'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import Link from 'next/link';

export interface Alerte {
  id: string;
  numero?: string;
  titre: string;
  niveau: 'critique' | 'important' | 'normal';
  dateCreation?: Date | string;
  date?: string;
  chantier: { nom: string } | string;
}

const niveauColors = {
  critique: 'destructive',
  important: 'warning',
  normal: 'default',
} as const;

export function AlertesWidget({ alertes }: { alertes: Alerte[] }) {
  if (!alertes?.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[120px] text-gray-500 dark:text-gray-400">
        <AlertTriangle className="w-12 h-12 mb-2 opacity-20" />
        <p className="text-sm">Aucune alerte</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {alertes.slice(0, 5).map((alerte) => {
        const niveauRaw = alerte.niveau as string;
        const niveau = (niveauRaw === 'alerte' || niveauRaw === 'majeur'
          ? 'important'
          : alerte.niveau) as keyof typeof niveauColors;
        const chantierNom = typeof alerte.chantier === 'string' ? alerte.chantier : alerte.chantier?.nom ?? '—';
        const dateRaw = alerte.dateCreation ?? alerte.date;
        const date = dateRaw instanceof Date ? dateRaw : new Date(dateRaw ?? 0);

        return (
          <Link
            key={alerte.id}
            href={`/maitre-ouvrage/alerts?id=${alerte.id}`}
            className="block p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <Badge variant={niveauColors[niveau] ?? 'default'}>
                {alerte.niveau.toUpperCase()}
              </Badge>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {alerte.numero ?? alerte.id}
              </span>
            </div>

            <h4 className="font-medium text-sm line-clamp-2 mb-2 text-gray-900 dark:text-gray-100">
              {alerte.titre}
            </h4>

            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>🏗️ {chantierNom}</span>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDistanceToNow(date, {
                  addSuffix: true,
                  locale: fr,
                })}
              </div>
            </div>
          </Link>
        );
      })}

      {alertes.length > 5 && (
        <Button variant="link" size="sm" className="w-full" asChild>
          <Link href="/maitre-ouvrage/alerts">Voir toutes les alertes ({alertes.length})</Link>
        </Button>
      )}
    </div>
  );
}
