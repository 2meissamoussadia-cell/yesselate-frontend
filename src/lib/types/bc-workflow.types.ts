// ============================================
// Types pour le workflow BC type CIRIL
// State machine et audit complet
// ============================================

import type { EnrichedBC, BCLigne, DocumentAnomaly, AnomalySeverity } from './document-validation.types';
import type { FamilyCode } from '@/domain/nomenclature';
import type { BCStatus } from '@/domain/bcTypes';

// ============================================
// State Machine BC
// ============================================

export type { BCStatus };
export type BCWorkflowStatus = BCStatus;

// Alias pour compatibilité ascendante
export type BCWorkflowStatusOld =
  | 'draft_ba'              // Brouillon créé par BA (non soumis)
  | 'pending_bmo'           // En attente de validation BMO
  | 'audit_required'        // Audit requis (non exécuté ou incomplet)
  | 'approved_bmo'          // Approuvé par le BMO
  | 'sent_supplier'         // Envoyé au fournisseur
  | 'rejected'              // Refusé (compatibilité, utiliser rejected_bmo)
  | 'needs_complement';     // Nécessite des compléments

// Transitions valides de la state machine
export const BC_TRANSITIONS: Record<BCStatus, BCStatus[]> = {
  draft_ba: ['pending_bmo', 'rejected_bmo'],
  pending_bmo: ['audit_required', 'in_audit', 'approved_bmo', 'rejected_bmo', 'needs_complement'],
  audit_required: ['pending_bmo', 'in_audit', 'approved_bmo', 'rejected_bmo', 'needs_complement'],
  in_audit: ['audit_required', 'approved_bmo', 'rejected_bmo', 'needs_complement'],
  needs_complement: ['pending_bmo', 'rejected_bmo'],
  approved_bmo: ['sent_supplier', 'rejected_bmo'],
  rejected_bmo: [], // État final
  sent_supplier: [], // État final
};

// ============================================
// Nomenclature interne BTP
// ============================================

// Ré-export depuis le domaine nomenclature
export type { FamilyCode, NomenclatureFamily, NomenclatureDomain } from '@/domain/nomenclature';
export { NOMENCLATURE, getFamily, isCompatibleFamily, detectFamilyFromLine, getCompatibleFamilies } from '@/domain/nomenclature';

// ============================================
// Rapport d'Audit
// ============================================

export interface BCAuditReport {
  auditId: string;
  bcId: string;
  executedAt: string;
  executedBy: string;
  
  // Résultat global
  isValid: boolean;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  
  // Anomalies détectées
  anomalies: DocumentAnomaly[];
  
  // Vérifications effectuées
  checks: BCAuditCheck[];
  
  // Recommandations
  recommendations: BCAuditRecommendation[];
  
  // Score global
  score: number; // 0-100
  
  // Blocages
  blocking: boolean; // Si true, ne peut pas être validé
  blockingReasons: string[];

  /** Rapport détaillé par domaine (optionnel, utilisé par le service d'audit) */
  domainReport?: {
    recommendation?: 'approve' | 'reject' | 'split_bc' | string;
    summary?: string;
    risk?: string;
    anomalies?: Array<{ id: string; severity: string; title: string; details: string }>;
    generatedAt?: string;
  };
}

export interface BCAuditCheck {
  id: string;
  category: 'nomenclature' | 'amount' | 'supplier' | 'project' | 'administrative' | 'compliance';
  name: string;
  passed: boolean;
  severity: AnomalySeverity;
  message: string;
  details?: Record<string, any>;
}

export interface BCAuditRecommendation {
  id: string;
  type: 'split_bc' | 'adjust_amount' | 'change_supplier' | 'add_document' | 'request_clarification' | 'other';
  priority: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  action?: string; // Action suggérée
}

// ============================================
// Contexte d'audit
// ============================================

export interface BCAuditContext {
  // Utilisateur qui lance l'audit
  executedBy: string;
  executedByRole: string;
  
  // Options d'audit
  deepAudit?: boolean;        // Audit approfondi (plus de vérifications)
  checkBudget?: boolean;       // Vérifier le budget projet
  checkSupplier?: boolean;     // Vérifier le fournisseur
  checkCompliance?: boolean;   // Vérifier la conformité réglementaire
  
  // Projet associé (pour vérifications budgétaires)
  projectBudget?: {
    total: number;
    used: number;
    remaining: number;
  };
  
  // Historique du fournisseur
  supplierHistory?: {
    totalOrders: number;
    reliability: 'excellent' | 'bon' | 'moyen' | 'faible';
    lastOrderDate?: string;
  };
}

