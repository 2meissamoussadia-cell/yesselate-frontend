/**
 * Point d'entrée du domaine Demandes
 * Exporte tous les services, types et règles
 */

// Types
export * from './types/demande.types';

// Services
export { BudgetService } from './services/budget.service';
export { RiskService } from './services/risk.service';
export { PriorityService } from './services/priority.service';
export { DemandeService } from './services/demande.service';

// Rules
export { ValidationRules } from './rules/validation.rules';
export { ApprovalRules } from './rules/approval.rules';

// Adapters
export { adaptLocalDemandToDomain } from './adapters/demande.adapter';

