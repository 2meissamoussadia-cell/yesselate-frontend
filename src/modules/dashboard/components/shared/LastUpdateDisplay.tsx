/**
 * Composant LastUpdateDisplay centralisé
 * Affiche la dernière mise à jour des données de manière cohérente
 * SOURCE DE VÉRITÉ UNIQUE pour l'affichage des timestamps
 */

'use client';

import React from 'react';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface LastUpdateDisplayProps {
  /**
   * Timestamp de dernière mise à jour (Date, number, ou string ISO)
   */
  lastUpdate: Date | number | string;
  
  /**
   * Format d'affichage
   * - 'relative': "Il y a 5 minutes" (défaut)
   * - 'absolute': "20/01/2024 14:30"
   * - 'both': "20/01/2024 14:30 (il y a 5 minutes)"
   */
  format?: 'relative' | 'absolute' | 'both';
  
  /**
   * Taille du texte
   */
  size?: 'sm' | 'md' | 'lg';
  
  /**
   * Afficher l'icône
   */
  showIcon?: boolean;
  
  /**
   * Classe CSS supplémentaire
   */
  className?: string;
  
  /**
   * Préfixe du texte (ex: "Dernière mise à jour :")
   */
  prefix?: string;
}

/**
 * Formate une date en texte relatif (ex: "il y a 5 minutes")
 */
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) {
    return diffSec <= 0 ? 'à l\'instant' : `il y a ${diffSec} seconde${diffSec > 1 ? 's' : ''}`;
  }
  if (diffMin < 60) {
    return `il y a ${diffMin} minute${diffMin > 1 ? 's' : ''}`;
  }
  if (diffHour < 24) {
    return `il y a ${diffHour} heure${diffHour > 1 ? 's' : ''}`;
  }
  if (diffDay < 7) {
    return `il y a ${diffDay} jour${diffDay > 1 ? 's' : ''}`;
  }
  
  // Au-delà d'une semaine, afficher la date
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

/**
 * Formate une date en texte absolu (ex: "20/01/2024 14:30")
 */
function formatAbsoluteTime(date: Date): string {
  return date.toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Convertit une valeur en Date
 */
function toDate(value: Date | number | string): Date {
  if (value instanceof Date) return value;
  if (typeof value === 'number') return new Date(value);
  return new Date(value);
}

export function LastUpdateDisplay({
  lastUpdate,
  format = 'relative',
  size = 'sm',
  showIcon = true,
  className,
  prefix,
}: LastUpdateDisplayProps) {
  const date = toDate(lastUpdate);
  
  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  let displayText: string;
  switch (format) {
    case 'relative':
      displayText = formatRelativeTime(date);
      break;
    case 'absolute':
      displayText = formatAbsoluteTime(date);
      break;
    case 'both':
      displayText = `${formatAbsoluteTime(date)} (${formatRelativeTime(date)})`;
      break;
  }

  return (
    <div
      className={cn(
        'flex items-center gap-1.5 text-slate-400',
        sizeClasses[size],
        className
      )}
    >
      {showIcon && <Clock className={cn(iconSizes[size], 'flex-shrink-0')} />}
      {prefix && <span>{prefix}</span>}
      <span>{displayText}</span>
    </div>
  );
}
