/**
 * ====================================================================
 * SERVICE: Délégations API
 * Service complet pour la gestion des délégations
 * ====================================================================
 */

import type {
  Delegation,
  DelegationRule,
  DelegationFilter,
  DelegationCreateData,
  DelegationUpdateData,
  DelegationStats,
  PaginatedResponse,
  Employee,
} from '@/lib/types/substitution.types';
import type { MockDelegation } from '@/lib/data/delegations-mock-data';

function mockToDelegation(m: MockDelegation): Delegation {
  const fromUser: Employee = {
    id: m.fromUserId,
    name: m.delegatorName,
    email: '',
    phone: '',
    bureau: m.bureau,
    role: 'User',
    competences: [],
    disponibilite: 'available',
    chargeActuelle: 0,
    score: 0,
  };
  const toUser: Employee = {
    id: m.toUserId,
    name: m.agentName,
    email: '',
    phone: '',
    bureau: m.bureau,
    role: m.agentRole ?? 'User',
    competences: [],
    disponibilite: 'available',
    chargeActuelle: 0,
    score: 0,
  };
  const statusMap = { active: 'active' as const, expired: 'inactive' as const, revoked: 'revoked' as const, suspended: 'inactive' as const };
  return {
    id: m.id,
    fromUserId: m.fromUserId,
    fromUser,
    toUserId: m.toUserId,
    toUser,
    type: 'temporary',
    permissions: m.permissions,
    startDate: new Date(m.startDate),
    endDate: m.endDate ? new Date(m.endDate) : undefined,
    status: statusMap[m.status] ?? 'inactive',
    reason: m.reason,
    ruleId: m.ruleId,
    createdAt: new Date(m.startDate),
    updatedAt: new Date(m.lastUsedAt ?? m.startDate),
    revokedAt: m.revokedAt ? new Date(m.revokedAt) : undefined,
    revokedBy: m.revokedBy,
  };
}

class DelegationsApiService {
  private baseUrl = '/api/bmo/delegations';

  // ================================
  // CRUD Operations
  // ================================

  async getAll(
    filter?: DelegationFilter,
    sort = 'createdAt',
    page = 1,
    pageSize = 20
  ): Promise<PaginatedResponse<Delegation>> {
    await this.delay(300);
    
    const { mockDelegations } = await import('@/lib/data/delegations-mock-data');
    let data = mockDelegations.map(mockToDelegation);

    // Apply filters
    if (filter) {
      if (filter.type) {
        data = data.filter(d => d.type === filter.type);
      }
      if (filter.status) {
        const statusFilter = filter.status as Delegation['status'];
        data = data.filter(d => d.status === statusFilter);
      }
      if (filter.bureau) {
        data = data.filter(d => d.fromUser.bureau === filter.bureau);
      }
      if (filter.fromUserId) {
        data = data.filter(d => d.fromUserId === filter.fromUserId);
      }
      if (filter.toUserId) {
        data = data.filter(d => d.toUserId === filter.toUserId);
      }
      if (filter.hasRule !== undefined) {
        data = data.filter(d => filter.hasRule ? !!d.ruleId : !d.ruleId);
      }
      if (filter.search) {
        const q = filter.search.toLowerCase();
        data = data.filter(d =>
          d.reason.toLowerCase().includes(q) ||
          d.fromUser.name.toLowerCase().includes(q) ||
          d.toUser.name.toLowerCase().includes(q)
        );
      }
    }

    // Apply sort
    data.sort((a, b) => {
      if (sort === 'createdAt') {
        return b.createdAt.getTime() - a.createdAt.getTime();
      }
      return 0;
    });

    // Pagination
    const start = (page - 1) * pageSize;
    const paginatedData = data.slice(start, start + pageSize);

    return {
      data: paginatedData,
      total: data.length,
      page,
      pageSize,
      totalPages: Math.ceil(data.length / pageSize),
    };
  }

  async getById(id: string): Promise<Delegation> {
    await this.delay(200);
    const { mockDelegations } = await import('@/lib/data/delegations-mock-data');
    const delegation = mockDelegations.find(d => d.id === id);
    if (!delegation) throw new Error(`Delegation ${id} not found`);
    return mockToDelegation(delegation);
  }

  async create(data: DelegationCreateData): Promise<Delegation> {
    await this.delay(500);
    
    const { mockEmployees } = await import('@/lib/data/employees-mock-data');
    const fromUser = mockEmployees.find(e => e.id === data.fromUserId);
    const toUser = mockEmployees.find(e => e.id === data.toUserId);
    
    if (!fromUser || !toUser) throw new Error('User not found');

    const newDelegation: Delegation = {
      id: `DEL-${Date.now()}`,
      fromUserId: data.fromUserId,
      fromUser,
      toUserId: data.toUserId,
      toUser,
      type: data.type,
      permissions: data.permissions,
      startDate: data.startDate,
      endDate: data.endDate,
      status: 'active',
      reason: data.reason,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    console.log('[API] Delegation created:', newDelegation);
    return newDelegation;
  }

  async update(id: string, data: DelegationUpdateData): Promise<Delegation> {
    await this.delay(400);
    const delegation = await this.getById(id);
    
    const updated: Delegation = {
      ...delegation,
      ...data,
      updatedAt: new Date(),
    };

    console.log('[API] Delegation updated:', updated);
    return updated;
  }

  async delete(id: string): Promise<void> {
    await this.delay(300);
    console.log('[API] Delegation deleted:', id);
  }

  async revoke(id: string, revokedBy: string): Promise<Delegation> {
    await this.delay(400);
    const delegation = await this.getById(id);
    
    const revoked: Delegation = {
      ...delegation,
      status: 'revoked',
      revokedAt: new Date(),
      revokedBy,
      updatedAt: new Date(),
    };

    console.log('[API] Delegation revoked:', revoked);
    return revoked;
  }

  // ================================
  // Rules Management
  // ================================

  async getRules(): Promise<DelegationRule[]> {
    await this.delay(200);
    const { mockDelegationRules } = await import('@/lib/data/delegations-mock-data');
    return mockDelegationRules.filter((r: { active: boolean }) => r.active) as DelegationRule[];
  }

  async getRuleById(id: string): Promise<DelegationRule> {
    await this.delay(150);
    const { mockDelegationRules } = await import('@/lib/data/delegations-mock-data');
    const rule = mockDelegationRules.find((r: { id: string }) => r.id === id);
    if (!rule) throw new Error(`Rule ${id} not found`);
    return rule as unknown as DelegationRule;
  }

  async createRule(rule: Omit<DelegationRule, 'id' | 'createdAt'>): Promise<DelegationRule> {
    await this.delay(400);
    
    const newRule: DelegationRule = {
      ...rule,
      id: `RULE-${Date.now()}`,
      createdAt: new Date(),
    };

    console.log('[API] Rule created:', newRule);
    return newRule;
  }

  async updateRule(id: string, rule: Partial<DelegationRule>): Promise<DelegationRule> {
    await this.delay(350);
    const existing = await this.getRuleById(id);
    
    const updated: DelegationRule = {
      ...existing,
      ...rule,
    };

    console.log('[API] Rule updated:', updated);
    return updated;
  }

  async deleteRule(id: string): Promise<void> {
    await this.delay(300);
    console.log('[API] Rule deleted:', id);
  }

  // ================================
  // Verification & Validation
  // ================================

  async canDelegate(
    fromUserId: string,
    toUserId: string,
    permissions: string[]
  ): Promise<{ canDelegate: boolean; reason?: string; applicableRule?: DelegationRule }> {
    await this.delay(200);
    
    const { mockEmployees } = await import('@/lib/data/employees-mock-data');
    const { findApplicableRules } = await import('@/lib/data/delegations-mock-data');
    
    const fromUser = mockEmployees.find((e: { id: string }) => e.id === fromUserId);
    const toUser = mockEmployees.find((e: { id: string }) => e.id === toUserId);
    
    if (!fromUser || !toUser) {
      return { canDelegate: false, reason: 'User not found' };
    }

    // Check applicable rules
    const rules = findApplicableRules(fromUser.role, toUser.role, fromUser.bureau) as DelegationRule[];
    
    if (rules.length > 0) {
      const rule = rules[0];
      
      // Check if all requested permissions are covered
      const coveredPermissions = permissions.every(p => 
        rule.permissions.includes(p) || rule.permissions.includes('all')
      );
      
      if (coveredPermissions) {
        return {
          canDelegate: true,
          applicableRule: rule,
        };
      }
    }

    // Manual approval required
    return {
      canDelegate: true,
      reason: 'Manual approval required - no automatic rule found',
    };
  }

  async getAvailableDelegates(userId: string): Promise<Employee[]> {
    await this.delay(250);
    
    const { mockEmployees } = await import('@/lib/data/employees-mock-data');
    const user = mockEmployees.find(e => e.id === userId);
    
    if (!user) return [];

    // Return employees from same bureau, excluding the user
    return mockEmployees.filter(e =>
      e.id !== userId &&
      e.bureau === user.bureau &&
      e.disponibilite === 'available'
    );
  }

  // ================================
  // Statistics
  // ================================

  async getStats(filter?: DelegationFilter): Promise<DelegationStats> {
    await this.delay(300);
    const { data } = await this.getAll(filter, 'createdAt', 1, 1000);

    const byBureau = data.reduce((acc, d) => {
      acc[d.fromUser.bureau] = (acc[d.fromUser.bureau] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Most delegated users
    const delegationCounts = data.reduce((acc, d) => {
      acc[d.fromUserId] = (acc[d.fromUserId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostDelegated = Object.entries(delegationCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([userId, count]) => {
        const user = data.find(d => d.fromUserId === userId)?.fromUser;
        return user ? { user, count } : null;
      })
      .filter(Boolean) as { user: Employee; count: number }[];

    return {
      total: data.length,
      active: data.filter(d => d.status === 'active').length,
      temporary: data.filter(d => d.type === 'temporary').length,
      permanent: data.filter(d => d.type === 'permanent').length,
      byBureau,
      mostDelegated,
    };
  }

  // ================================
  // Helpers
  // ================================

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getTypeLabel(type: string): string {
    const labels = {
      temporary: 'Temporaire',
      permanent: 'Permanente',
    };
    return labels[type as keyof typeof labels] || type;
  }

  getStatusLabel(status: string): string {
    const labels = {
      active: 'Active',
      inactive: 'Inactive',
      revoked: 'Révoquée',
    };
    return labels[status as keyof typeof labels] || status;
  }
}

export const delegationsApiService = new DelegationsApiService();
export type { DelegationsApiService };

