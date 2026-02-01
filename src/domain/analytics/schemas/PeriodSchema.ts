/**
 * Period Schema
 * Validation Zod pour les entités Period
 */

import { z } from 'zod';

export const PeriodDataSchema = z.object({
  period: z.string().min(1),
  label: z.string().min(1),
  value: z.number().int().nonnegative(),
  critical: z.number().int().nonnegative().optional(),
  warning: z.number().int().nonnegative().optional(),
  resolved: z.number().int().nonnegative().optional(),
  trend: z.number().optional(),
});

export const PeriodTypeSchema = z.enum(['months', 'quarters', 'years']);

export const PeriodSchema = z.object({
  id: z.string().uuid(),
  type: PeriodTypeSchema,
  startDate: z.date(),
  endDate: z.date(),
  label: z.string().min(1),
});

// Type inference
export type PeriodData = z.infer<typeof PeriodDataSchema>;
export type PeriodType = z.infer<typeof PeriodTypeSchema>;
export type Period = z.infer<typeof PeriodSchema>;

/**
 * Valide des données de période
 */
export function validatePeriodData(data: unknown): PeriodData {
  try {
    return PeriodDataSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError('Invalid period data', error.issues);
    }
    throw error;
  }
}

/**
 * Valide un tableau de données de périodes
 */
export function validatePeriodDataArray(data: unknown): PeriodData[] {
  try {
    return z.array(PeriodDataSchema).parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError('Invalid period data array', error.issues);
    }
    throw error;
  }
}

/**
 * Erreur de validation personnalisée
 */
export class ValidationError extends Error {
  constructor(
    message: string,
    public readonly errors: z.ZodIssue[]
  ) {
    super(message);
    this.name = 'ValidationError';
  }

  /**
   * Formate les erreurs pour l'affichage
   */
  formatErrors(): string {
    return this.errors
      .map(err => `${err.path.join('.')}: ${err.message}`)
      .join(', ');
  }
}

