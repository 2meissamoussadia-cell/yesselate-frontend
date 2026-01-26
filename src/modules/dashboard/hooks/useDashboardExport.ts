// src/modules/dashboard/hooks/useDashboardExport.ts
// Phase P9: Hook pour exporter les données du dashboard

'use client';

import { useCallback } from 'react';
import { useDashboardCommandCenterStore } from '@/lib/stores/dashboardCommandCenterStore';

export function useDashboardExport() {
  const nav = useDashboardCommandCenterStore((s) => s.navigation);

  const exportData = useCallback(
    async (format: 'csv' | 'json' | 'pdf' | 'excel') => {
      const params = new URLSearchParams({
        main: nav.mainCategory || 'overview',
        format,
      });
      if (nav.subCategory) params.set('sub', nav.subCategory);
      if (nav.subSubCategory) params.set('leaf', nav.subSubCategory);

      const url = `/api/export/dashboard?${params.toString()}`;
      const response = await fetch(url, {
        headers: {
          'x-tenant-id': 'default', // TODO: récupérer depuis le contexte auth
          'x-user-id': 'anonymous', // TODO: récupérer depuis le contexte auth
        },
      });

      if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`);
      }

      // Télécharger le fichier
      const blob = await response.blob();
      const hash = response.headers.get('X-Content-Hash');
      const contentDisposition = response.headers.get('Content-Disposition');
      const filename =
        contentDisposition?.match(/filename="(.+)"/)?.[1] ||
        `dashboard-${nav.mainCategory}-${Date.now()}.${format}`;

      const urlObj = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = urlObj;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(urlObj);

      // Log du hash si disponible
      if (hash) {
        console.log('[Export] Document hash:', hash);
      }
    },
    [nav]
  );

  return { exportData };
}
