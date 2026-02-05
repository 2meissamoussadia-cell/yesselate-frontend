import Link from 'next/link';
import { NOT_FOUND } from '@lib-root/constants';

/**
 * Page 404 globale — affichée quand aucune route ne correspond.
 * Accessible et cohérente avec le reste de l’app (LAYOUT_UI_GAPS).
 */
export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-100 p-6"
      role="status"
      aria-live="polite"
      aria-label={NOT_FOUND.TITLE}
    >
      <div className="max-w-md w-full rounded-2xl border border-slate-700/60 bg-slate-900/80 p-8 shadow-xl text-center">
        <h1 className="text-xl font-semibold text-slate-100 mb-2">
          {NOT_FOUND.TITLE}
        </h1>
        <p className="text-sm text-slate-400 mb-6">
          {NOT_FOUND.DESCRIPTION}
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-sm font-medium px-4 py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
          aria-label={NOT_FOUND.BACK_ARIA}
        >
          {NOT_FOUND.BACK_LABEL}
        </Link>
      </div>
    </div>
  );
}
