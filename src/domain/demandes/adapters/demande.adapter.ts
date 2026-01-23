/**
 * Adaptateurs pour convertir entre types locaux et types du domaine
 * Permet une migration progressive
 */

import type { Demande } from '../types/demande.types';

// Types locaux du composant DemandView
export interface LocalDemandDetail {
  id: string;
  subject: string;
  bureau: string;
  type: string;
  priority: string;
  status: 'pending' | 'validated' | 'rejected';
  amount?: number | null;
  createdAt: string;
  delayDays: number;
  isOverdue: boolean;
  budget?: {
    code: string | null;
    line: string | null;
    available: number | null;
    requested: number | null;
  };
  deadline?: string | null;
  risks?: Array<{
    id: string;
    category: string;
    score: number;
  }>;
}

/**
 * Convertit un DemandDetail local vers Demande du domaine
 */
export function adaptLocalDemandToDomain(local: LocalDemandDetail): Demande {
  return {
    id: local.id,
    subject: local.subject,
    bureau: local.bureau,
    type: local.type,
    status: local.status,
    priority: (local.priority as Demande['priority']) || 'normal',
    amount: local.amount || 0,
    createdAt: new Date(local.createdAt),
    updatedAt: new Date(),
    deadline: local.deadline ? new Date(local.deadline) : undefined,
    isOverdue: local.isOverdue,
    delayDays: local.delayDays,
    budget: local.budget?.available ? {
      available: local.budget.available,
      consumed: 0,
      allocated: local.budget.requested || 0,
      code: local.budget.code || undefined,
      line: local.budget.line || undefined
    } : undefined,
    risks: local.risks?.map(r => ({
      id: r.id,
      type: (r.category === 'budget' ? 'budget' : 
             r.category === 'delay' ? 'delay' : 
             r.category === 'quality' ? 'quality' : 
             'compliance') as Demande['risks'][0]['type'],
      score: r.score,
      description: `${r.category} risk`,
      detectedAt: new Date()
    }))
  };
}

