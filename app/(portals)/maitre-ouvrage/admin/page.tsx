'use client';

/**
 * Admin & Référentiels — Paramètres, référentiels, utilisateurs.
 * Niveau 1 sidebar BMO (/maitre-ouvrage/admin).
 */

import Link from 'next/link';
import { BusinessWindow } from '@/components/ui/BusinessWindow';
import { Settings, FileSpreadsheet, Users } from 'lucide-react';

export default function AdminPage() {
  return (
    <BusinessWindow title="Admin & Référentiels">
      <p className="text-sm text-slate-400 mb-6">
        Paramètres système, référentiels métier et gestion des utilisateurs.
      </p>
      <div className="grid gap-3 sm:grid-cols-2 max-w-2xl">
        <Link
          href="/maitre-ouvrage/parametres"
          className="flex items-center gap-3 p-4 rounded-xl border border-slate-800 bg-slate-900/50 text-slate-200 hover:border-slate-600 hover:bg-slate-800/50 transition-colors"
        >
          <Settings className="h-5 w-5 text-slate-400 shrink-0" aria-hidden />
          <div>
            <span className="font-medium">Paramètres</span>
            <p className="text-xs text-slate-500 mt-0.5">Configuration générale, sécurité, notifications</p>
          </div>
        </Link>
        <Link
          href="/maitre-ouvrage/parametres/referentiels"
          className="flex items-center gap-3 p-4 rounded-xl border border-slate-800 bg-slate-900/50 text-slate-200 hover:border-slate-600 hover:bg-slate-800/50 transition-colors"
        >
          <FileSpreadsheet className="h-5 w-5 text-slate-400 shrink-0" aria-hidden />
          <div>
            <span className="font-medium">Référentiels</span>
            <p className="text-xs text-slate-500 mt-0.5">Lots, types, nomenclatures</p>
          </div>
        </Link>
        <Link
          href="/maitre-ouvrage/parametres"
          className="flex items-center gap-3 p-4 rounded-xl border border-slate-800 bg-slate-900/50 text-slate-200 hover:border-slate-600 hover:bg-slate-800/50 transition-colors sm:col-span-2"
        >
          <Users className="h-5 w-5 text-slate-400 shrink-0" aria-hidden />
          <div>
            <span className="font-medium">Utilisateurs & rôles</span>
            <p className="text-xs text-slate-500 mt-0.5">Gestion des accès et permissions (dans Paramètres)</p>
          </div>
        </Link>
      </div>
    </BusinessWindow>
  );
}
