/**
 * Adapter: convertit les données "locales" (API / UI) vers le type domaine Demande
 */

import type { Demande, BudgetInfo, Risk, RiskType } from '@/domain/demandes/types';

type LocalBudget = {
  code?: string | null;
  line?: string | null;
  available?: number | null;
  requested?: number | null;
};

type LocalRisk = {
  id: string;
  category: string;
  score: number;
};

export type LocalDemandLike = {
  id: string;
  subject: string;
  bureau: string;
  type: string;
  priority: string;
  status: string;
  amount?: number | null;
  createdAt: string;
  delayDays?: number;
  isOverdue?: boolean;
  budget?: LocalBudget | null;
  deadline?: string | null;
  expectedDate?: string | null;
  risks?: LocalRisk[] | null;
  requester?: { id: string; name?: string | null; email?: string | null; phone?: string | null; service?: string | null } | null;
  description?: string | null;
  justification?: string | null;
  objectives?: string | null;
  beneficiaries?: string | null;
  urgencyReason?: string | null;
  assignedToName?: string | null;
  documents?: unknown[];
  recommendation?: string | null;
  stakeholders?: unknown[];
  audit?: unknown[];
  updatedAt?: string;
};

const categoryToRiskType: Record<string, RiskType> = {
  budget: 'budget',
  delay: 'delay',
  quality: 'quality',
  other: 'compliance',
  resource: 'resource',
} as const;

export function adaptLocalDemandToDomain(local: LocalDemandLike): Demande {
  const budget: BudgetInfo | undefined = local.budget
    ? {
        available: local.budget.available ?? 0,
        consumed: 0,
        allocated: local.budget.requested ?? 0,
        code: local.budget.code ?? undefined,
        line: local.budget.line ?? undefined,
      }
    : undefined;

  const deadline: Date | string | undefined =
    local.deadline != null && local.deadline !== ''
      ? (/\d{4}-\d{2}-\d{2}/.test(String(local.deadline))
          ? new Date(local.deadline)
          : new Date(local.deadline))
      : undefined;

  const risks: Risk[] | undefined = local.risks?.map((r) => ({
    id: r.id,
    type: categoryToRiskType[r.category] ?? 'compliance',
    score: r.score,
    description: '',
  }));

  return {
    id: local.id,
    subject: local.subject,
    bureau: local.bureau,
    type: local.type,
    priority: (local.priority as Demande['priority']) ?? 'normal',
    status: (local.status as Demande['status']) ?? 'pending',
    amount: local.amount ?? 0,
    createdAt: local.createdAt,
    updatedAt: local.updatedAt ?? local.createdAt,
    delayDays: local.delayDays,
    isOverdue: local.isOverdue,
    budget,
    deadline,
    risks,
    description: local.description ?? undefined,
    justification: local.justification ?? undefined,
    urgencyReason: local.urgencyReason ?? undefined,
    documents: local.documents as Demande['documents'],
  };
}
