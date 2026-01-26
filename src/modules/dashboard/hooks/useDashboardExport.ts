// src/modules/dashboard/hooks/useDashboardExport.ts
// Phase P9: Hook pour exporter les données du dashboard
// Phase P12.b: Ajout locale/currency pour formats XLSX/PDF

'use client';

import { useCallback } from 'react';
import { useDashboardCommandCenterStore } from '@/lib/stores/dashboardCommandCenterStore';
import { useI18n } from '@/src/lib/i18n';

export function useDashboardExport() {
  const nav = useDashboardCommandCenterStore((s) => s.navigation);
  const { locale, currency } = useI18n();

  const exportData = useCallback(
    async (format: 'csv' | 'json' | 'pdf' | 'excel') => {
      // Phase P12.b: Mapper 'excel' vers 'xlsx' pour le format natif
      const apiFormat = format === 'excel' ? 'xlsx' : format;
      
      const params = new URLSearchParams({
        main: nav.mainCategory || 'overview',
        format: apiFormat,
      });
      if (nav.subCategory) params.set('sub', nav.subCategory);
      if (nav.subSubCategory) params.set('leaf', nav.subSubCategory);

      // Phase P12.b: Ajouter locale/currency pour formats XLSX/PDF (formatage localisé)
      if (apiFormat === 'xlsx' || apiFormat === 'pdf') {
        params.set('locale', locale);
        params.set('currency', currency);
      }

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
        `dashboard-${nav.mainCategory}-${Date.now()}.${format === 'excel' ? 'xlsx' : format}`;

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
    [nav, locale, currency]
  );

  return { exportData };
}
