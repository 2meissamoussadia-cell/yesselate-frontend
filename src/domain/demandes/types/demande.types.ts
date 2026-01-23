/**
 * Types métier pour le domaine Demandes
 * Extrait de la logique métier des composants
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
  detectedAt: Date;
}

export interface Requester {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  service?: string;
}

export interface Stakeholder {
  id: string;
  name: string;
  role: 'owner' | 'approver' | 'reviewer' | 'contributor' | 'informed';
  status?: 'pending' | 'approved' | 'rejected';
}

export interface Document {
  id: string;
  name: string;
  type: string;
  size?: number;
  url?: string;
}

export interface AuditEvent {
  id: string;
  type: 'created' | 'updated' | 'assigned' | 'validated' | 'rejected' | 'commented';
  actor: string;
  timestamp: Date;
  details?: string;
}

export interface Demande {
  id: string;
  reference?: string;
  subject: string;
  title?: string; // Alias pour subject
  description?: string;
  bureau: string;
  type: string;
  
  // Statut et priorité
  status: DemandeStatus;
  priority: DemandePriority;
  
  // Montant
  amount: number;
  montant?: number; // Alias pour amount
  
  // Dates
  createdAt: Date | string;
  updatedAt: Date | string;
  expectedDate?: Date | string | null;
  deadline?: Date | string | null;
  requestedAt?: Date | string;
  
  // Demandeur
  requester?: Requester | null;
  createdBy?: string;
  requesterId?: string;
  requesterName?: string;
  requesterEmail?: string;
  requesterPhone?: string;
  requesterService?: string;
  
  // Budget
  budget?: BudgetInfo;
  budgetCode?: string;
  budgetLine?: string;
  budgetAvailable?: number;
  
  // Contexte
  justification?: string | null;
  objectives?: string | null;
  beneficiaries?: string | null;
  urgencyReason?: string | null;
  
  // Affectation
  assignedTo?: string | null;
  assignedToId?: string | null;
  assignedToName?: string | null;
  
  // Documents
  documents?: Document[];
  
  // Métadonnées
  recommendation?: string | null;
  internalNotes?: string | null;
  metadata?: Record<string, any>;
  
  // Relations
  stakeholders?: Stakeholder[];
  risks?: Risk[];
  audit?: AuditEvent[];
  
  // Calculs dérivés
  delayDays?: number;
  isOverdue?: boolean;
}

// ============================================
// Types pour les résultats de calculs
// ============================================

export interface BudgetCalculationResult {
  usage: number; // Pourcentage 0-100
  remaining: number;
  exceeded: boolean;
  warning: boolean; // >80%
  critical: boolean; // >90%
}

export interface RiskEvaluationResult {
  risks: Risk[];
  globalScore: number; // 0-100
  highestRisk: Risk | null;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface PriorityCalculationResult {
  priority: DemandePriority;
  reason: string;
  shouldEscalate: boolean;
  escalationReason?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ApproverLevel {
  level: 'auto' | 'manager' | 'direction' | 'comex';
  reason: string;
  threshold: number;
}

