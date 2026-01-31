/**
 * Composant pour afficher la dernière mise à jour
 * Format: "Il y a X minutes" ou "à l'instant"
 * Met à jour automatiquement toutes les minutes
 */

'use client';

import React, { memo, useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';

interface LastUpdateDisplayProps {
  lastUpdate: Date;
  /**
   * Par défaut on affiche "Mise à jour :".
   * Mettre `false` pour n'afficher que le temps relatif.
   */
  prefix?: string | false;
  className?: string;
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'à l\'instant';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `il y a ${diffInMinutes} min`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `il y a ${diffInHours}h`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  return `il y a ${diffInDays}j`;
}

export const LastUpdateDisplay = memo(function LastUpdateDisplay({ 
  lastUpdate,
  prefix = 'Mise à jour',
  className,
}: LastUpdateDisplayProps) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTick((t) => t + 1);
    }, 60000); // 1 minute
    return () => clearInterval(interval);
  }, []);

  const timeAgo = useMemo(() => formatTimeAgo(lastUpdate), [lastUpdate, tick]);

  return (
    <span className={cn('text-[10px] text-slate-400 normal-case', className)}>
      {prefix ? `${prefix} : ` : ''}
      {timeAgo}
    </span>
  );
});
