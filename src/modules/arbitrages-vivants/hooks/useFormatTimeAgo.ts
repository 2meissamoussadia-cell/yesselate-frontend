/**
 * Hook utilitaire pour formater le temps écoulé
 * Pattern réutilisable pour afficher "il y a X min/h"
 */

'use client';

import { useMemo } from 'react';

export function useFormatTimeAgo(date: Date): string {
  return useMemo(() => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diff < 60) return "à l'instant";
    if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
    return `il y a ${Math.floor(diff / 3600)}h`;
  }, [date]);
}
