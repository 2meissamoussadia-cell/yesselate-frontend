/**
 * Données mock pour les API alertes (Phase 4 / Phase 5).
 * Utilisées quand la base est vide ou indisponible pour que l'UI affiche des exemples.
 */

const now = new Date().toISOString();
const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();

export const MOCK_ALERT_EVENTS = [
  {
    id: 'evt-mock-1',
    ruleId: 'rule-sla-bc',
    ruleName: 'BC bloqué SLA dépassé',
    severity: 'critical' as const,
    status: 'open' as const,
    firstSeen: twoDaysAgo,
    lastSeen: oneHourAgo,
    count: 3,
    payload: { bureau: 'BF', bcId: 'BC-2024-0847' },
    labels: { domain: 'validation-bc', bureau: 'BF' },
  },
  {
    id: 'evt-mock-2',
    ruleId: 'rule-paiement-retard',
    ruleName: 'Paiement en retard',
    severity: 'critical' as const,
    status: 'open' as const,
    firstSeen: oneHourAgo,
    lastSeen: now,
    count: 1,
    payload: { montant: 128500000, fournisseur: 'ACME' },
    labels: { domain: 'finance', bureau: 'BCG' },
  },
  {
    id: 'evt-mock-3',
    ruleId: 'rule-contrat-expire',
    ruleName: 'Contrat expire sous 5 jours',
    severity: 'warning' as const,
    status: 'open' as const,
    firstSeen: twoDaysAgo,
    lastSeen: now,
    count: 2,
    payload: { contratId: 'CTR-2024-0567' },
    labels: { domain: 'contrats', bureau: 'BJA' },
  },
  {
    id: 'evt-mock-4',
    ruleId: 'rule-charge-bureau',
    ruleName: 'Charge bureau élevée',
    severity: 'warning' as const,
    status: 'ack' as const,
    firstSeen: twoDaysAgo,
    lastSeen: oneHourAgo,
    count: 1,
    payload: { bureau: 'BOP', charge: 95 },
    labels: { domain: 'demandes', bureau: 'BOP' },
  },
  {
    id: 'evt-mock-5',
    ruleId: 'rule-info-sync',
    ruleName: 'Synchronisation données terminée',
    severity: 'info' as const,
    status: 'closed' as const,
    firstSeen: twoDaysAgo,
    lastSeen: oneHourAgo,
    count: 1,
    payload: {},
    labels: { domain: 'system' },
  },
];

export const MOCK_ALERT_STATS = {
  open_count: 3,
  ack_count: 1,
  closed_count: 1,
  critical_open: 2,
  warning_open: 1,
  info_open: 0,
};
