/**
 * Route: /maitre-ouvrage/alerts/projets/retards
 * Page Retards détectés + accès aux vues détaillées (critiques, moyens, analyse)
 */

'use client';

import Link from 'next/link';
import { RetardsDetectesPage } from '@/modules/centre-alertes/pages/projets/RetardsDetectesPage';
import { AlertTriangle, BarChart3 } from 'lucide-react';

const BASE = '/maitre-ouvrage/alerts/projets/retards';

export default function ProjetsRetardsPage() {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-slate-700/50 bg-slate-900/60 px-4 py-3 flex flex-wrap items-center gap-3">
        <span className="text-sm text-slate-400 flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-cyan-400" />
          Vues détaillées :
        </span>
        <Link
          href={`${BASE}/critiques`}
          className="text-sm text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-1"
        >
          <AlertTriangle className="h-3.5 w-3.5" />
          Retards critiques
        </Link>
        <Link
          href={`${BASE}/moyens`}
          className="text-sm text-cyan-400 hover:text-cyan-300 hover:underline"
        >
          Retards moyens
        </Link>
        <Link
          href={`${BASE}/analyse-causes`}
          className="text-sm text-cyan-400 hover:text-cyan-300 hover:underline"
        >
          Analyse des causes
        </Link>
      </div>
      <RetardsDetectesPage />
    </div>
  );
}

