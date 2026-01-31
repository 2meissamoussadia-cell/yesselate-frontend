/**
 * Composant qui rend une vue depuis le registry basé sur la navigation
 */

'use client';

import { useDashboardView } from '../registry/useDashboardView';

export function DashboardRegistryView() {
  const { entry, data, loading, error, navKey } = useDashboardView();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400">Chargement...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="text-red-400 text-sm">
          Erreur: {error.message}
        </div>
        <div className="text-slate-400 text-xs mt-2">
          Clé: {navKey.main}::{navKey.sub ?? ''}::{navKey.subSub ?? ''}
        </div>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="p-4">
        <div className="text-yellow-400 text-sm">
          Vue non trouvée dans le registry
        </div>
        <div className="text-slate-400 text-xs mt-2">
          Clé: {navKey.main}::{navKey.sub ?? ''}::{navKey.subSub ?? ''}
        </div>
      </div>
    );
  }

  return entry.render({ nav: navKey, data: data || {} });
}

