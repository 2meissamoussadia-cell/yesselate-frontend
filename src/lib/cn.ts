import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utilitaire de fusion de classes (Tailwind + clsx).
 * Module dédié pour éviter les invalidations HMR sur utils.ts.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
