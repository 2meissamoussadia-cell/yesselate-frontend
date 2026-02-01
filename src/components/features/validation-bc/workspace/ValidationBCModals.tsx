/**
 * Modales du Validation BC Command Center
 * Toutes les modales unifiées : stats, export, settings, shortcuts, confirm, validation, etc.
 * Architecture harmonisée avec Paiements et Blocked Command Centers
 */

'use client';

import React from 'react';
import { ValidationBCStatsModal } from './ValidationBCStatsModal';
import { ValidationBCExportModal } from './ValidationBCExportModal';
import { ValidationBCValidationModal } from './ValidationBCValidationModal';
import { ValidationBCQuickCreateModal } from './ValidationBCQuickCreate';
import { ValidationBCTimeline } from './ValidationBCTimeline';
import { ValidationBCWorkflowEngine } from './ValidationBCWorkflowEngine';
import { ValidationBCPredictiveAnalytics } from './ValidationBCPredictiveAnalytics';
import { ValidationBCDelegationManager } from './ValidationBCDelegationManager';
import { ValidationBCRemindersSystem } from './ValidationBCRemindersSystem';
import { ValidationBCMultiLevelValidation } from './ValidationBCMultiLevelValidation';
import { ValidationBCRequestJustificatif } from './ValidationBCRequestJustificatif';
import { ValidationBCHelpModal } from '../modals/ValidationBCHelpModal';
import type { ValidationDocument } from '@/lib/services/validation-bc-api';

// ================================
// Types
// ================================
export type ValidationBCModalType =
  | 'stats'
  | 'export'
  | 'settings'
  | 'shortcuts'
  | 'confirm'
  | 'validation'
  | 'quick-create'
  | 'timeline'
  | 'workflow'
  | 'analytics'
  | 'delegations'
  | 'reminders'
  | 'multi-level-validation'
  | 'request-justificatif';

interface ModalState {
  isOpen: boolean;
  type: ValidationBCModalType | null;
  data?: any;
}

interface ValidationBCModalsProps {
  modal: ModalState;
  onClose: () => void;
  onValidation?: (document: ValidationDocument) => Promise<void>;
  onRejection?: (document: ValidationDocument) => Promise<void>;
  onExport?: (format: 'csv' | 'json' | 'pdf') => Promise<void>;
  onQuickCreateSuccess?: (document: ValidationDocument) => void;
}

export function ValidationBCModals({
  modal,
  onClose,
  onValidation,
  onRejection,
  onExport,
  onQuickCreateSuccess,
}: ValidationBCModalsProps) {
  if (!modal.isOpen || !modal.type) return null;

  // Stats Modal
  if (modal.type === 'stats') {
    return <ValidationBCStatsModal />;
  }

  // Export Modal
  if (modal.type === 'export') {
    return (
      <ValidationBCExportModal
        open={true}
        onClose={onClose}
        onExport={onExport || (async () => {})}
      />
    );
  }

  // Validation Modal
  if (modal.type === 'validation' && modal.data?.document) {
    return (
      <ValidationBCValidationModal
        open={true}
        document={modal.data.document}
        onClose={onClose}
        onValidate={(_comment: string) => {
          const doc = modal.data?.document;
          if (doc) void onValidation?.(doc);
        }}
        onReject={(_reason: string) => {
          const doc = modal.data?.document;
          if (doc) void onRejection?.(doc);
        }}
      />
    );
  }

  // Quick Create Modal
  if (modal.type === 'quick-create') {
    return (
      <ValidationBCQuickCreateModal
        open={true}
        onClose={onClose}
        onSuccess={onQuickCreateSuccess || (() => {})}
      />
    );
  }

  // Timeline Modal
  if (modal.type === 'timeline') {
    return <ValidationBCTimeline open={true} onClose={onClose} />;
  }

  // Workflow Engine Modal
  if (modal.type === 'workflow') {
    return (
      <ValidationBCWorkflowEngine
        open={true}
        onClose={onClose}
        documentId={modal.data?.documentId}
      />
    );
  }

  // Predictive Analytics Modal
  if (modal.type === 'analytics') {
    return <ValidationBCPredictiveAnalytics open={true} onClose={onClose} />;
  }

  // Delegation Manager Modal
  if (modal.type === 'delegations') {
    return <ValidationBCDelegationManager open={true} onClose={onClose} />;
  }

  // Reminders System Modal
  if (modal.type === 'reminders') {
    return <ValidationBCRemindersSystem open={true} onClose={onClose} />;
  }

  // Multi-Level Validation Modal
  if (modal.type === 'multi-level-validation') {
    return (
      <ValidationBCMultiLevelValidation
        open={true}
        onClose={onClose}
      />
    );
  }

  // Request Justificatif Modal
  if (modal.type === 'request-justificatif') {
    return (
      <ValidationBCRequestJustificatif
        open={true}
        onClose={onClose}
      />
    );
  }

  // Shortcuts/Help Modal
  if (modal.type === 'shortcuts') {
    return <ValidationBCHelpModal open={true} onClose={onClose} />;
  }

  // Settings Modal (TODO: Créer si nécessaire)
  if (modal.type === 'settings') {
    // Pour l'instant, on peut utiliser un placeholder ou créer le composant
    return null;
  }

  // Confirm Modal (TODO: Créer si nécessaire)
  if (modal.type === 'confirm') {
    // Pour l'instant, on peut utiliser un placeholder ou créer le composant
    return null;
  }

  return null;
}

