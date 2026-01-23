/**
 * Composant pour afficher la dernière mise à jour
 * Format: "Il y a X minutes" ou "à l'instant"
 * Met à jour automatiquement toutes les minutes
 */

'use client';

import React, { memo, useState, useEffect } from 'react';

interface LastUpdateDisplayProps {
  lastUpdate: Date;
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
  lastUpdate 
}: LastUpdateDisplayProps) {
  const [timeAgo, setTimeAgo] = useState(() => formatTimeAgo(lastUpdate));

  useEffect(() => {
    // Mettre à jour immédiatement quand lastUpdate change
    setTimeAgo(formatTimeAgo(lastUpdate));
    
    // Puis mettre à jour toutes les minutes
    const interval = setInterval(() => {
      setTimeAgo(formatTimeAgo(lastUpdate));
    }, 60000); // 1 minute

    return () => clearInterval(interval);
  }, [lastUpdate]);

  return (
    <span className="text-[10px] text-slate-500 normal-case">
      Mise à jour : {timeAgo}
    </span>
  );
});
