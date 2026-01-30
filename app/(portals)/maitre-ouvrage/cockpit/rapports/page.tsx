'use client';

/**
 * Cockpit DG — Rapports (sous-page sitemap).
 */

import { BusinessWindow } from '@/components/ui/BusinessWindow';

export default function CockpitRapportsPage() {
  return (
    <BusinessWindow title="Cockpit DG — Rapports">
      <p className="text-sm text-slate-400 mb-4">
        Rapports de synthèse, exports, historiques.
      </p>
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 text-center text-slate-500 text-sm">
        Liste des rapports et exports à brancher.
      </div>
    </BusinessWindow>
  );
}
