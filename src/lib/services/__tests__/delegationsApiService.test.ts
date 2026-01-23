/**
 * Tests unitaires pour delegationsApiService
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { delegationsApiService } from '../delegationsApiService';
import type { DelegationFilter } from '@/lib/types/substitution.types';

// Mock des données
jest.mock('@/lib/data/delegations-mock-data', () => ({
  mockDelegations: [
    {
      id: '1',
      fromUserId: 'user-1',
      toUserId: 'user-2',
      type: 'temporary',
      status: 'active',
      reason: 'Congé',
      fromUser: { id: 'user-1', name: 'Jean Dupont', bureau: 'BMO' },
      toUser: { id: 'user-2', name: 'Marie Martin', bureau: 'BMO' },
      createdAt: '2025-01-01T00:00:00Z',
      validFrom: '2025-01-01',
      validUntil: '2025-01-15',
      ruleId: null
    },
    {
      id: '2',
      fromUserId: 'user-3',
      toUserId: 'user-4',
      type: 'permanent',
      status: 'active',
      reason: 'Délégation permanente',
      fromUser: { id: 'user-3', name: 'Pierre Bernard', bureau: 'Finance' },
      toUser: { id: 'user-4', name: 'Sophie Laurent', bureau: 'Finance' },
      createdAt: '2025-01-02T00:00:00Z',
      validFrom: '2025-01-02',
      validUntil: null,
      ruleId: 'rule-1'
    }
  ]
}));

jest.mock('@/lib/data/employees-mock-data', () => ({
  mockEmployees: [
    { id: 'user-1', name: 'Jean Dupont', bureau: 'BMO' },
    { id: 'user-2', name: 'Marie Martin', bureau: 'BMO' },
    { id: 'user-3', name: 'Pierre Bernard', bureau: 'Finance' },
    { id: 'user-4', name: 'Sophie Laurent', bureau: 'Finance' }
  ]
}));

describe('DelegationsApiService', () => {
  let service: DelegationsApiService;

  beforeEach(() => {
    service = new DelegationsApiService();
  });

  describe('getAll', () => {
    it('should return all delegations without filter', async () => {
      const result = await service.getAll();

      expect(result.data.length).toBeGreaterThan(0);
      expect(result.total).toBeGreaterThan(0);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(20);
    });

    it('should filter by type', async () => {
      const filter: DelegationFilter = { type: 'temporary' };
      const result = await service.getAll(filter);

      expect(result.data.every(d => d.type === 'temporary')).toBe(true);
    });

    it('should filter by status', async () => {
      const filter: DelegationFilter = { status: 'active' };
      const result = await service.getAll(filter);

      expect(result.data.every(d => d.status === 'active')).toBe(true);
    });

    it('should filter by bureau', async () => {
      const filter: DelegationFilter = { bureau: 'BMO' };
      const result = await service.getAll(filter);

      expect(result.data.every(d => d.fromUser.bureau === 'BMO')).toBe(true);
    });

    it('should filter by fromUserId', async () => {
      const filter: DelegationFilter = { fromUserId: 'user-1' };
      const result = await service.getAll(filter);

      expect(result.data.every(d => d.fromUserId === 'user-1')).toBe(true);
    });

    it('should filter by search query', async () => {
      const filter: DelegationFilter = { search: 'Jean' };
      const result = await service.getAll(filter);

      expect(result.data.length).toBeGreaterThan(0);
      expect(
        result.data.some(d => 
          d.fromUser.name.toLowerCase().includes('jean') ||
          d.toUser.name.toLowerCase().includes('jean')
        )
      ).toBe(true);
    });

    it('should paginate results', async () => {
      const result = await service.getAll(undefined, 'createdAt', 1, 1);

      expect(result.data.length).toBe(1);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(1);
      expect(result.totalPages).toBeGreaterThan(0);
    });
  });

  describe('getById', () => {
    it('should return delegation by id', async () => {
      const result = await service.getById('1');

      expect(result.id).toBe('1');
      expect(result.fromUserId).toBe('user-1');
      expect(result.toUserId).toBe('user-2');
    });

    it('should throw error if delegation not found', async () => {
      await expect(service.getById('invalid-id')).rejects.toThrow('Delegation invalid-id not found');
    });
  });

  describe('create', () => {
    it('should create a new delegation', async () => {
      const data = {
        fromUserId: 'user-1',
        toUserId: 'user-2',
        type: 'temporary' as const,
        reason: 'Test delegation',
        validFrom: '2025-02-01',
        validUntil: '2025-02-15'
      };

      const result = await service.create(data);

      expect(result.fromUserId).toBe('user-1');
      expect(result.toUserId).toBe('user-2');
      expect(result.type).toBe('temporary');
      expect(result.reason).toBe('Test delegation');
      expect(result.status).toBe('active');
    });
  });

  describe('update', () => {
    it('should update an existing delegation', async () => {
      const updateData = {
        reason: 'Updated reason',
        validUntil: '2025-02-20'
      };

      const result = await service.update('1', updateData);

      expect(result.reason).toBe('Updated reason');
      expect(result.validUntil).toBe('2025-02-20');
    });
  });

  describe('delete', () => {
    it('should delete a delegation', async () => {
      await expect(service.delete('1')).resolves.not.toThrow();
    });
  });

  describe('getStats', () => {
    it('should return delegation statistics', async () => {
      const result = await service.getStats();

      expect(result.total).toBeGreaterThanOrEqual(0);
      expect(result.active).toBeGreaterThanOrEqual(0);
      expect(result.expired).toBeGreaterThanOrEqual(0);
      expect(result.byType).toBeDefined();
      expect(result.byBureau).toBeDefined();
    });
  });
});

