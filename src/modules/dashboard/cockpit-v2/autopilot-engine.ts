/**
 * Auto-pilot décisionnel Cockpit DG V2
 * Exécution automatique avec garde-fous (budget max 500k FCFA auto)
 * Events pour validation DG (dg-approval-required, autopilot-notification)
 */

import type { PredictiveInsight, AutoPilotAction, AutoPilotDecision } from '@/modules/dashboard/types/cockpitV2';

const BUDGET_AUTO_MAX_FCFA = 500_000;

/** Event DG : une décision attend validation */
export const EVENT_DG_APPROVAL = 'dg-approval-required';
/** Event DG : une action a été exécutée automatiquement (info) */
export const EVENT_AUTO_EXECUTED = 'autopilot-notification';

const decisions = new Map<string, AutoPilotDecision>();
let dgApprovalRequired = true;

/**
 * Exécuter les insights : auto si autorisé et budget OK, sinon pending_dg
 */
export function executeInsights(insights: PredictiveInsight[]): AutoPilotDecision[] {
  const result: AutoPilotDecision[] = [];

  for (const insight of insights) {
    const action = insight.recommended_action;
    const cost = (action.params?.cost as number) ?? (action.params?.amount as number) ?? 0;
    const canAuto =
      action.auto_executable &&
      cost <= BUDGET_AUTO_MAX_FCFA &&
      !dgApprovalRequired;

    const decision: AutoPilotDecision = {
      id: `decision-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      insight,
      action,
      status: canAuto ? 'auto_executed' : 'pending_dg',
    };

    if (canAuto) {
      decision.executed_at = new Date();
      executeAction(action);
      notifyDG({
        type: 'auto_executed',
        title: `Action auto : ${insight.prediction}`,
        action: action.type,
        cost,
      });
    } else {
      requestDGApproval(decision);
    }

    decisions.set(decision.id, decision);
    result.push(decision);
  }

  return result;
}

function executeAction(_action: AutoPilotAction): void {
  // Stub : plus tard appels API (Orange Money, SMS, email)
  // await fetch('/api/orange-money/pay', ...) etc.
}

function notifyDG(notification: { type: string; title: string; action: string; cost: number }): void {
  if (typeof window === 'undefined') return;
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(notification.title, {
      body: `${notification.action} — ${notification.cost.toLocaleString('fr-FR')} FCFA`,
    });
  }
  window.dispatchEvent(
    new CustomEvent(EVENT_AUTO_EXECUTED, { detail: notification })
  );
}

function requestDGApproval(decision: AutoPilotDecision): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent(EVENT_DG_APPROVAL, { detail: decision })
  );
  // Timeout 24h : auto-reject (simplifié ici, pas de setTimeout long en dev)
}

/**
 * DG approuve ou rejette une décision
 */
export function approveDecision(decisionId: string, approved: boolean): void {
  const decision = decisions.get(decisionId);
  if (!decision) return;

  if (approved) {
    executeAction(decision.action);
    decision.status = 'completed';
    decision.executed_at = new Date();
  } else {
    decision.status = 'rejected';
  }
}

export function getDecision(id: string): AutoPilotDecision | undefined {
  return decisions.get(id);
}

export function getAllDecisions(): AutoPilotDecision[] {
  return Array.from(decisions.values());
}

export function setDGApprovalRequired(required: boolean): void {
  dgApprovalRequired = required;
}

export const autoPilot = {
  executeInsights,
  approveDecision,
  getDecision,
  getAllDecisions,
  setDGApprovalRequired,
};
