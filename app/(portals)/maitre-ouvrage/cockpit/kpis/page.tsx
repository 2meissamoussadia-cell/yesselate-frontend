'use client';

/**
 * Cockpit DG — KPIs (sous-page sitemap).
 */

import { BusinessWindow } from '@/components/ui/BusinessWindow';

export default function CockpitKpisPage() {
  return (
    <BusinessWindow title="Cockpit DG — KPIs">
      <p className="text-sm text-slate-400 mb-4">
        Indicateurs clés de pilotage : avancement, budget, jalons, retards.
      </p>
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 text-center text-slate-500 text-sm">
        Contenu KPIs à brancher (widgets, graphiques, tableaux).
      </div>
    </BusinessWindow>
  );
}
