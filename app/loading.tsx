/**
 * État de chargement racine — premier rendu de l'application.
 * Affiche un skeleton plein écran pendant l'hydratation et le chargement des providers.
 */

import { Skeleton } from '@/components/ui/skeleton';
import { LOADING_LABELS } from '@lib-root/constants';

export default function RootLoading() {
  return (
    <div
      className="min-h-screen flex flex-col bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
      role="status"
      aria-label={LOADING_LABELS.ROOT}
      aria-busy="true"
    >
      {/* Barre supérieure simulée */}
      <div className="h-14 border-b border-slate-200 dark:border-slate-800 flex items-center gap-4 px-4 shrink-0">
        <Skeleton className="h-8 w-32 rounded" />
        <Skeleton className="h-8 w-24 rounded hidden sm:block" />
        <div className="flex-1" />
        <Skeleton className="h-9 w-9 rounded-full" />
      </div>
      {/* Contenu principal */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    </div>
  );
}
