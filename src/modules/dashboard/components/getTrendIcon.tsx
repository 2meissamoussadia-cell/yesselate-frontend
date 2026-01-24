/**
 * getTrendIcon
 * Retourne un composant d’icône (Lucide) selon la direction de tendance.
 * Format attendu : const TrendIcon = getTrendIcon(dir); <TrendIcon className="..." />
 */

'use client';

import type { LucideIcon } from 'lucide-react';
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';

export type TrendDir = 'up' | 'down' | 'flat' | 'neutral';

export function getTrendIcon(dir: TrendDir): LucideIcon {
  if (dir === 'up') return ArrowUpRight;
  if (dir === 'down') return ArrowDownRight;
  return Minus;
}

