/**
 * Trend Analysis Schema
 * Validation Zod pour les entités TrendAnalysis
 */

import { z } from 'zod';
import { PeriodDataSchema, ValidationError } from './PeriodSchema';

export const TrendAnalysisConfigSchema = z.object({
  subCategory: z.string(),
  thresholds: z.object({
    degradation: z.number().positive(),
    improvement: z.number().positive(),
  }),
});

export const TrendAnalysisSchema = z.object({
  globalTrend: z.number(),
  globalTrendPercent: z.string(),
  isImproving: z.boolean(),
  isDegrading: z.boolean(),
  problematicPeriods: z.array(PeriodDataSchema),
  worstPeriod: PeriodDataSchema.nullable(),
  needsAction: z.boolean(),
});

export const RecommendationSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(200),
  description: z.string().min(1),
  priority: z.enum(['high', 'medium', 'low']),
  actionType: z.enum(['alert', 'task', 'meeting', 'report', 'review']),
  icon: z.string().optional(),
});

// Type inference
export type TrendAnalysisConfig = z.infer<typeof TrendAnalysisConfigSchema>;
export type TrendAnalysis = z.infer<typeof TrendAnalysisSchema>;
export type Recommendation = z.infer<typeof RecommendationSchema>;

/**
 * Valide une analyse de tendances
 */
export function validateTrendAnalysis(data: unknown): TrendAnalysis {
  try {
    return TrendAnalysisSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError('Invalid trend analysis data', error.issues);
    }
    throw error;
  }
}

/**
 * Valide une configuration d'analyse
 */
export function validateTrendAnalysisConfig(data: unknown): TrendAnalysisConfig {
  try {
    return TrendAnalysisConfigSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError('Invalid trend analysis config', error.issues);
    }
    throw error;
  }
}

export { ValidationError } from './PeriodSchema';

