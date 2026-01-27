// lib/server/dashboard/alerting/schemas.ts
// Phase P17: Schémas Zod pour validation DSL v2

import { z } from 'zod';

/**
 * Schéma Zod pour DSL v2 (expr_v2)
 * Phase P17: Règles d'alerting avancées
 */
export const AlertDSLv2Schema = z.object({
  source: z.union([
    z.object({
      type: z.literal('view'),
      view: z.string(),
      params: z.record(z.unknown()).optional(),
    }),
    z.object({
      type: z.literal('query'),
      query: z.string(),
      params: z.array(z.unknown()).optional(),
    }),
  ]),
  window: z
    .object({
      range: z.enum(['15m', '1h', '6h', '24h', '7d', '30d', '90d']),
      granularity: z.enum(['1m', '5m', '15m', '1h', '1d']).optional(),
    })
    .optional(),
  aggregate: z
    .object({
      metric: z.string(),
      func: z.enum(['avg', 'sum', 'min', 'max', 'p50', 'p90', 'p95', 'p99', 'count', 'stddev']),
      field: z.string().optional(),
    })
    .optional(),
  baseline: z
    .object({
      func: z.enum(['moving_avg', 'median', 'percentile', 'z_score']),
      range: z.enum(['15m', '1h', '6h', '24h', '7d', '30d', '90d']),
      compare: z.object({
        op: z.enum(['delta_pct', 'delta_abs', 'ratio', 'z_score']),
        gt: z.number().optional(),
        lt: z.number().optional(),
      }),
    })
    .optional(),
  condition: z.union([
    z.object({
      op: z.enum(['>', '>=', '<', '<=', '=', '!=', 'in', 'not_in']),
      left: z.union([z.string(), z.number()]),
      right: z.union([z.string(), z.number(), z.array(z.number())]),
    }),
    z.object({
      any: z.array(z.lazy(() => AlertConditionSchema)).optional(),
      all: z.array(z.lazy(() => AlertConditionSchema)).optional(),
      not: z.lazy(() => AlertConditionSchema).optional(),
    }),
  ]),
  groupBy: z
    .object({
      keys: z.array(z.string()),
      topN: z.number().int().min(1).optional(),
      orderBy: z.enum(['desc', 'asc']).optional(),
    })
    .optional(),
  correlation: z
    .array(
      z.object({
        metric: z.string(),
        op: z.enum(['>', '>=', '<', '<=', '=', '!=']),
        value: z.union([z.number(), z.string()]),
        compare: z.enum(['n-1', 'baseline', 'absolute']).optional(),
        delta_pct: z.number().optional(),
      })
    )
    .optional(),
  hysteresis: z
    .object({
      enter: z.record(z.enum(['>', '>=', '<', '<=']), z.number()),
      exit: z.record(z.enum(['>', '>=', '<', '<=']), z.number()),
    })
    .optional(),
  labels: z.record(z.string()).optional(),
  channels: z.record(z.boolean()).optional(),
});

const AlertConditionSchema: z.ZodType<any> = z.union([
  z.object({
    op: z.enum(['>', '>=', '<', '<=', '=', '!=', 'in', 'not_in']),
    left: z.union([z.string(), z.number()]),
    right: z.union([z.string(), z.number(), z.array(z.number())]),
  }),
  z.object({
    any: z.array(z.lazy(() => AlertConditionSchema)).optional(),
    all: z.array(z.lazy(() => AlertConditionSchema)).optional(),
    not: z.lazy(() => AlertConditionSchema).optional(),
  }),
]);

/**
 * Schéma pour hystérésis (optionnel, peut être dans la règle directement)
 */
export const HysteresisSchema = z.object({
  enter: z.record(z.enum(['>', '>=', '<', '<=']), z.number()),
  exit: z.record(z.enum(['>', '>=', '<', '<=']), z.number()),
});

/**
 * Schéma pour group-by (optionnel, peut être dans la règle directement)
 */
export const GroupBySchema = z.object({
  keys: z.array(z.string()),
  topN: z.number().int().min(1).optional(),
  orderBy: z.enum(['desc', 'asc']).optional(),
});

/**
 * Schéma pour corrélations (optionnel, peut être dans la règle directement)
 */
export const CorrelationSchema = z.array(
  z.object({
    metric: z.string(),
    op: z.enum(['>', '>=', '<', '<=', '=', '!=']),
    value: z.union([z.number(), z.string()]),
    compare: z.enum(['n-1', 'baseline', 'absolute']).optional(),
    delta_pct: z.number().optional(),
  })
);
