/**
 * ====================================================================
 * MOCK DATA: Délégations
 * Données de démonstration réalistes pour le développement
 * Peut être facilement remplacé par de vraies API calls
 * ====================================================================
 */

export interface MockDelegation {
  id: string;
  type: string;
  status: 'active' | 'expired' | 'revoked' | 'suspended';
  agentName: string;
  agentRole: string | null;
  bureau: string;
  scope: string;
  maxAmount: number | null;
  startDate: string;
  endDate: string;
  delegatorName: string;
  usageCount: number;
  lastUsedAt: string | null;
  expiringSoon: boolean;
  hash: string | null;
  fromUserId: string;
  toUserId: string;
  permissions: string[];
  reason: string;
  ruleId?: string;
  revokedAt?: string;
  revokedBy?: string;
}

// Bureaux disponibles
const BUREAUX = ['BAGD', 'BAVM', 'BDI', 'BFEP', 'BRH', 'BSG', 'DBMO', 'Direction'];

// Types de délégations
const DELEGATION_TYPES = [
  'Signature de contrats',
  'Approbation budgétaire',
  'Engagement de dépenses',
  'Validation de marchés',
  'Approbation de commandes',
  'Validation de documents',
  'Gestion d\'équipe',
  'Décision administrative',
];

// Permissions possibles
const PERMISSIONS = [
  'signature_contrats',
  'approbation_budget',
  'engagement_depenses',
  'validation_marches',
  'approbation_commandes',
  'validation_documents',
  'gestion_equipe',
  'decision_administrative',
];

// Noms d'agents réalistes
const AGENTS = [
  { name: 'Yao N\'Guessan', role: 'Chef de Bureau', bureau: 'BAGD' },
  { name: 'Marie Kouassi', role: 'Directrice', bureau: 'BAVM' },
  { name: 'Amadou Diallo', role: 'Responsable Finance', bureau: 'BDI' },
  { name: 'Fatou Diop', role: 'Chef de Service', bureau: 'BFEP' },
  { name: 'Jean Traoré', role: 'Directeur Adjoint', bureau: 'BRH' },
  { name: 'Aminata Cissé', role: 'Responsable Administratif', bureau: 'BSG' },
  { name: 'Ibrahima Ba', role: 'Coordonnateur', bureau: 'DBMO' },
  { name: 'Sarah Koné', role: 'Directrice Générale', bureau: 'Direction' },
];

// Générateur de dates
const generateDate = (daysAgo: number, daysFromNow?: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  if (daysFromNow) {
    date.setDate(date.getDate() + daysFromNow);
  }
  return date.toISOString();
};

// Générateur de hash SHA3-256 (mock)
const generateHash = (id: string): string => {
  // Simule un hash SHA3-256
  return `sha3-256:${id.split('').reverse().join('').padStart(64, '0').substring(0, 64)}`;
};

// Créer une délégation mock
const createMockDelegation = (
  id: string,
  status: MockDelegation['status'],
  typeIndex: number,
  agentIndex: number,
  daysAgo: number,
  durationDays: number,
  usageCount: number,
  expiringSoon = false
): MockDelegation => {
  const agent = AGENTS[agentIndex % AGENTS.length];
  const delegator = AGENTS[(agentIndex + 2) % AGENTS.length];
  const type = DELEGATION_TYPES[typeIndex % DELEGATION_TYPES.length];
  const startDate = generateDate(daysAgo);
  const endDate = generateDate(daysAgo, durationDays);
  const isExpired = new Date(endDate) < new Date();
  const finalStatus = isExpired && status === 'active' ? 'expired' : status;

  // Sélectionner 2-4 permissions aléatoires
  const selectedPermissions = PERMISSIONS.slice(
    typeIndex % PERMISSIONS.length,
    (typeIndex % PERMISSIONS.length) + (2 + (typeIndex % 3))
  );

  const lastUsedAt = usageCount > 0 
    ? generateDate(Math.max(0, daysAgo - usageCount * 3))
    : null;

  return {
    id,
    type,
    status: finalStatus,
    agentName: agent.name,
    agentRole: agent.role,
    bureau: agent.bureau,
    scope: `${type} - ${agent.bureau}`,
    maxAmount: typeIndex % 3 === 0 ? 5000000 + (typeIndex * 100000) : null,
    startDate,
    endDate,
    delegatorName: delegator.name,
    usageCount,
    lastUsedAt,
    expiringSoon: expiringSoon || (finalStatus === 'active' && durationDays < 7),
    hash: generateHash(id),
    fromUserId: `user-${delegator.name.toLowerCase().replace(/\s+/g, '-')}`,
    toUserId: `user-${agent.name.toLowerCase().replace(/\s+/g, '-')}`,
    permissions: selectedPermissions,
    reason: `Délégation pour ${type.toLowerCase()} dans le cadre de ${['formation', 'congé', 'mission', 'projet spécial', 'remplacement'][typeIndex % 5]}`,
    ruleId: typeIndex % 4 === 0 ? `RULE-${String(typeIndex + 1).padStart(3, '0')}` : undefined,
    revokedAt: finalStatus === 'revoked' ? generateDate(Math.max(0, daysAgo - 5)) : undefined,
    revokedBy: finalStatus === 'revoked' ? delegator.name : undefined,
  };
};

// Générer les délégations mock
export const mockDelegations: MockDelegation[] = [
  // Actives
  ...Array.from({ length: 15 }, (_, i) =>
    createMockDelegation(`DEL-${String(i + 1).padStart(4, '0')}`, 'active', i, i, 30 + i * 2, 60, 3 + i, false)
  ),
  
  // Expirant bientôt (dans moins de 7 jours)
  ...Array.from({ length: 5 }, (_, i) =>
    createMockDelegation(`DEL-${String(16 + i).padStart(4, '0')}`, 'active', i + 2, i + 3, 50 + i * 2, 3 + i, 2 + i, true)
  ),

  // Expirées récentes
  ...Array.from({ length: 8 }, (_, i) =>
    createMockDelegation(`DEL-${String(21 + i).padStart(4, '0')}`, 'expired', i + 1, i + 4, 90 + i * 5, 30, 5 + i, false)
  ),

  // Expirées anciennes
  ...Array.from({ length: 5 }, (_, i) =>
    createMockDelegation(`DEL-${String(29 + i).padStart(4, '0')}`, 'expired', i + 3, i + 5, 180 + i * 10, 30, 8 + i, false)
  ),

  // Révoquées
  ...Array.from({ length: 4 }, (_, i) =>
    createMockDelegation(`DEL-${String(34 + i).padStart(4, '0')}`, 'revoked', i + 2, i + 6, 60 + i * 7, 90, 1 + i, false)
  ),

  // Suspendues
  ...Array.from({ length: 3 }, (_, i) =>
    createMockDelegation(`DEL-${String(38 + i).padStart(4, '0')}`, 'suspended', i + 1, i + 7, 45 + i * 5, 60, 2 + i, false)
  ),
];

// Statistiques calculées
export const mockDelegationsStats = {
  total: mockDelegations.length,
  active: mockDelegations.filter(d => d.status === 'active').length,
  expired: mockDelegations.filter(d => d.status === 'expired').length,
  revoked: mockDelegations.filter(d => d.status === 'revoked').length,
  suspended: mockDelegations.filter(d => d.status === 'suspended').length,
  expiringSoon: mockDelegations.filter(d => d.expiringSoon).length,
  totalUsage: mockDelegations.reduce((sum, d) => sum + d.usageCount, 0),
  byBureau: BUREAUX.map(bureau => ({
    bureau,
    count: mockDelegations.filter(d => d.bureau === bureau).length,
  })).filter(b => b.count > 0),
  byType: DELEGATION_TYPES.map(type => ({
    type,
    count: mockDelegations.filter(d => d.type === type).length,
  })).filter(t => t.count > 0),
  recentActivity: mockDelegations
    .filter(d => d.lastUsedAt)
    .sort((a, b) => new Date(b.lastUsedAt!).getTime() - new Date(a.lastUsedAt!).getTime())
    .slice(0, 10)
    .map(d => ({
      id: `ACT-${d.id}`,
      delegationId: d.id,
      delegationType: d.type,
      agentName: d.agentName,
      action: 'utilisation',
      actorName: d.agentName,
      details: `Utilisation de la délégation ${d.type}`,
      createdAt: d.lastUsedAt!,
    })),
  ts: new Date().toISOString(),
};

// Fonctions utilitaires pour filtrer les délégations
export function getDelegationsByQueue(queue: string): MockDelegation[] {
  switch (queue) {
    case 'active':
      return mockDelegations.filter(d => d.status === 'active');
    case 'expired':
      return mockDelegations.filter(d => d.status === 'expired');
    case 'revoked':
      return mockDelegations.filter(d => d.status === 'revoked');
    case 'suspended':
      return mockDelegations.filter(d => d.status === 'suspended');
    case 'expiring_soon':
      return mockDelegations.filter(d => d.expiringSoon);
    default:
      return mockDelegations;
  }
}

export function getDelegationById(id: string): MockDelegation | undefined {
  return mockDelegations.find(d => d.id === id);
}

export function filterDelegations(filters: {
  bureau?: string;
  type?: string;
  status?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}): MockDelegation[] {
  let result = [...mockDelegations];

  if (filters.bureau) {
    result = result.filter(d => d.bureau === filters.bureau);
  }

  if (filters.type) {
    result = result.filter(d => d.type.toLowerCase().includes(filters.type!.toLowerCase()));
  }

  if (filters.status) {
    result = result.filter(d => d.status === filters.status);
  }

  if (filters.search) {
    const search = filters.search.toLowerCase();
    result = result.filter(d =>
      d.id.toLowerCase().includes(search) ||
      d.type.toLowerCase().includes(search) ||
      d.agentName.toLowerCase().includes(search) ||
      d.bureau.toLowerCase().includes(search) ||
      d.scope.toLowerCase().includes(search) ||
      d.delegatorName.toLowerCase().includes(search)
    );
  }

  if (filters.dateFrom) {
    const dateFrom = new Date(filters.dateFrom);
    result = result.filter(d => new Date(d.endDate) >= dateFrom);
  }

  if (filters.dateTo) {
    const dateTo = new Date(filters.dateTo);
    result = result.filter(d => new Date(d.endDate) <= dateTo);
  }

  return result;
}

// Règles de délégation (stub pour le service)
export interface MockDelegationRule {
  id: string;
  name: string;
  description: string;
  fromRole: string;
  toRole: string;
  permissions: string[];
  conditions: Record<string, unknown>;
  autoApprove: boolean;
  active: boolean;
  createdAt: Date;
}

export const mockDelegationRules: MockDelegationRule[] = [];

export function findApplicableRules(_fromRole: string, _toRole: string, _bureau: string): MockDelegationRule[] {
  return [];
}

// Export par défaut
export default {
  delegations: mockDelegations,
  stats: mockDelegationsStats,
  getByQueue: getDelegationsByQueue,
  getById: getDelegationById,
  filter: filterDelegations,
  mockDelegationRules,
  findApplicableRules,
};
