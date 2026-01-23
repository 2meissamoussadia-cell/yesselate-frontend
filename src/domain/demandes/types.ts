/**
 * Types métier pour le domaine Demandes
 * Version consolidée pour extraction domain
 */

import { z } from 'zod';

// ============================================
// Schemas de validation Zod
// ============================================

export const DemandeStatusSchema = z.enum([
  'pending',
  'in_progress',
  'validated',
  'rejected',
  'cancelled'
]);

export const DemandePrioritySchema = z.enum([
  'low',
  'normal',
  'high',
  'urgent',
  'critical'
]);

export const RiskTypeSchema = z.enum([
  'budget',
  'delay',
  'quality',
  'compliance',
  'resource'
]);

// ============================================
// Types TypeScript
// ============================================

export type DemandeStatus = z.infer<typeof DemandeStatusSchema>;
export type DemandePriority = z.infer<typeof DemandePrioritySchema>;
export type RiskType = z.infer<typeof RiskTypeSchema>;

export interface BudgetInfo {
  available: number;
  consumed: number;
  allocated: number;
  code?: string;
  line?: string;
}

export interface Risk {
  id: string;
  type: RiskType;
  score: number; // 0-100
  description: string;
  mitigation?: string;
}

export interface Demande {
  id: string;
  subject: string;
  title?: string; // Alias pour subject
  bureau: string;
  type: string;
  priority: DemandePriority;
  status: DemandeStatus;
  amount?: number;
  montant?: number; // Alias pour amount
  createdAt: Date | string;
  updatedAt: Date | string;
  deadline?: Date | string;
  description?: string;
  justification?: string;
  urgencyReason?: string;
  budget?: BudgetInfo;
  risks?: Risk[];
  documents?: Array<{ name: string; type: string; url?: string }>;
  delayDays?: number;
  isOverdue?: boolean;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ApproverLevel {
  level: 'auto' | 'manager' | 'direction' | 'comex';
  reason: string;
  threshold?: number;
}

// ============================================
// Types utilitaires
// ============================================

export type RiskScore = number; // 0-25 (probabilité 1-5 × impact 1-5)

