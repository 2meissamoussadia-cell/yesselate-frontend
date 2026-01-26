// lib/server/dashboard/schemas.ts
import { z } from 'zod';

export const OverviewSummaryDashboardSchema = z.object({
  kpis: z.object({
    demandes: z.number(),
    validations: z.number().min(0).max(1),
    budget: z.number().min(0).max(1),
    blocages: z.number(),
    risques: z.number(),
    decisions: z.number(),
    conformite: z.number().min(0).max(1),
  }),
  trends: z.array(z.object({
    date: z.string(), demandes: z.number(), validations: z.number(), budget: z.number(),
  })),
  monthlyComparison: z.array(z.object({
    month: z.string(), actuel: z.number(), precedent: z.number(),
  })),
  categoryDistribution: z.array(z.object({
    category: z.string(), count: z.number(), percentage: z.number(),
  })),
  tableData: z.array(z.object({
    id: z.string(), type: z.string(), statut: z.string(),
    priorite: z.string(), date: z.string(), bureau: z.string(),
  })),
  previousPeriod: z.object({ demandes: z.number(), validations: z.number(), budget: z.number() }),
});
