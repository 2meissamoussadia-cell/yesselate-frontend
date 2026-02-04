'use client';

/**
 * ReferenceNumber — Composant d'affichage de numéro de référence
 * 
 * Affiche un numéro de référence professionnel au lieu d'un ID technique.
 * Supporte plusieurs formats (ALT-001, #001, REF-2024-001, etc.)
 * 
 * Usage :
 * <ReferenceNumber value="abc123" prefix="ALT" />  // Affiche: ALT-001
 * <ReferenceNumber value={42} />                   // Affiche: #042
 * <ReferenceNumber value="alert-84" format="hash" />  // Affiche: #084
 */

import React from 'react';
import { cn } from '@/lib/cn';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export interface ReferenceNumberProps {
  /** Valeur à formater (ID, numéro, ou string) */
  value: string | number;
  /** Préfixe (ALT, DEM, VAL, etc.) */
  prefix?: string;
  /** Format d'affichage */
  format?: 'prefix' | 'hash' | 'full' | 'bare';
  /** Nombre de chiffres (padding avec zéros) */
  digits?: number;
  /** Inclure l'année dans le format full */
  includeYear?: boolean;
  /** Variante de style */
  variant?: 'badge' | 'text' | 'muted';
  /** Afficher l'ID technique dans le tooltip */
  showTechnicalId?: boolean;
  /** Classes additionnelles */
  className?: string;
}

/**
 * Extrait un numéro d'une chaîne (ex: "alert-84" -> 84)
 */
function extractNumber(value: string | number): number {
  if (typeof value === 'number') return value;
  
  // Essayer d'extraire un nombre de la chaîne
  const match = value.match(/\d+/);
  if (match) {
    return parseInt(match[0], 10);
  }
  
  // Fallback: hash de la chaîne pour générer un numéro stable
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    const char = value.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash % 10000);
}

/**
 * Formate un numéro avec padding de zéros
 */
function padNumber(num: number, digits: number): string {
  return num.toString().padStart(digits, '0');
}

export function ReferenceNumber({
  value,
  prefix,
  format = 'prefix',
  digits = 3,
  includeYear = false,
  variant = 'badge',
  showTechnicalId = true,
  className,
}: ReferenceNumberProps) {
  const num = extractNumber(value);
  const paddedNum = padNumber(num, digits);
  const year = new Date().getFullYear();
  
  let displayText: string;
  
  switch (format) {
    case 'hash':
      displayText = `#${paddedNum}`;
      break;
    case 'full':
      displayText = includeYear
        ? `${prefix || 'REF'}-${year}-${paddedNum}`
        : `${prefix || 'REF'}-${paddedNum}`;
      break;
    case 'bare':
      displayText = paddedNum;
      break;
    case 'prefix':
    default:
      displayText = prefix ? `${prefix}-${paddedNum}` : `#${paddedNum}`;
      break;
  }

  const content = (
    <span
      className={cn(
        variant === 'badge' && [
          'inline-flex items-center px-2 py-0.5 rounded-md',
          'text-xs font-mono font-semibold',
          'bg-slate-100 dark:bg-slate-800',
          'text-slate-700 dark:text-slate-300',
          'border border-slate-200 dark:border-slate-700',
        ],
        variant === 'text' && [
          'text-sm font-mono font-semibold',
          'text-slate-700 dark:text-slate-300',
        ],
        variant === 'muted' && [
          'text-xs font-mono',
          'text-slate-500 dark:text-slate-400',
        ],
        className
      )}
    >
      {displayText}
    </span>
  );

  if (!showTechnicalId || value === displayText) {
    return content;
  }

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">
            <span className="text-slate-400">Réf: </span>
            <span className="font-mono">{displayText}</span>
          </p>
          <p className="text-xs text-slate-500">
            <span className="text-slate-400">ID: </span>
            <span className="font-mono">{value}</span>
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * Préfixes par module
 */
export const MODULE_PREFIXES = {
  alerts: 'ALT',
  demandes: 'DEM',
  validations: 'VAL',
  chantiers: 'CHT',
  projets: 'PRJ',
  finances: 'FIN',
  contrats: 'CTR',
  employes: 'EMP',
  documents: 'DOC',
  tickets: 'TKT',
  risques: 'RSQ',
  decisions: 'DEC',
  arbitrages: 'ARB',
} as const;

export type ModulePrefix = keyof typeof MODULE_PREFIXES;

/**
 * Composant simplifié pour un module spécifique
 */
export function ModuleReference({
  module,
  value,
  variant = 'badge',
  className,
}: {
  module: ModulePrefix;
  value: string | number;
  variant?: 'badge' | 'text' | 'muted';
  className?: string;
}) {
  return (
    <ReferenceNumber
      value={value}
      prefix={MODULE_PREFIXES[module]}
      variant={variant}
      className={className}
    />
  );
}
