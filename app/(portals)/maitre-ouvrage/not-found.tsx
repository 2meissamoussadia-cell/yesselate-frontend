import Link from 'next/link';
import { NOT_FOUND } from '@lib-root/constants';

/**
 * Page 404 du portail Maître d’Ouvrage — route inexistante sous /maitre-ouvrage.
 * Affiche un message clair et un lien vers le dashboard (contexte portail).
 */
export default function MaitreOuvrageNotFound() {
  return (
    <div
      className="min-h-[60vh] flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-6"
      role="status"
      aria-live="polite"
      aria-label={NOT_FOUND.TITLE}
    >
      <div className="max-w-md w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-8 shadow-lg text-center">
        <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
          {NOT_FOUND.TITLE}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          {NOT_FOUND.DESCRIPTION}
        </p>
        <Link
          href="/maitre-ouvrage/dashboard"
          className="inline-flex items-center justify-center rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-sm font-medium px-4 py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
          aria-label="Retour au tableau de bord"
        >
          Retour au tableau de bord
        </Link>
      </div>
    </div>
  );
}
