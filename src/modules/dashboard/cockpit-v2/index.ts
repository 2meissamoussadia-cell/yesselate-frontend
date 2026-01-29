/**
 * Cockpit DG V2 — IA prédictive, auto-pilot, 4D
 * Export central pour moteur prédictif et auto-pilot
 */

export { predictiveEngine, predictNextWeek } from './predictive-engine';
export type { ChantierInput } from './predictive-engine';
export {
  autoPilot,
  executeInsights,
  approveDecision,
  getDecision,
  getAllDecisions,
  setDGApprovalRequired,
  EVENT_DG_APPROVAL,
  EVENT_AUTO_EXECUTED,
} from './autopilot-engine';
