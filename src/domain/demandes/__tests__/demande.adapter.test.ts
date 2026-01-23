/**
 * Tests unitaires pour l'adapter demande
 */

import { describe, it, expect } from '@jest/globals';
import { adaptLocalDemandToDomain } from '../adapters/demande.adapter';
import type { Demande } from '../types/demande.types';

describe('adaptLocalDemandToDomain', () => {
  it('should convert local demand to domain demande', () => {
    const local = {
      id: 'DEM-001',
      subject: 'Test demande',
      bureau: 'BMO',
      type: 'test',
      priority: 'high',
      status: 'pending' as const,
      amount: 50000,
      createdAt: '2024-01-01T00:00:00Z',
      delayDays: 5,
      isOverdue: false,
      budget: {
        code: 'BUD-001',
        line: 'Ligne 1',
        available: 100000,
        requested: 50000
      },
      deadline: '2024-01-10T00:00:00Z',
      risks: [{
        id: 'RISK-001',
        category: 'budget',
        score: 50
      }]
    };

    const demande = adaptLocalDemandToDomain(local);

    expect(demande.id).toBe('DEM-001');
    expect(demande.subject).toBe('Test demande');
    expect(demande.bureau).toBe('BMO');
    expect(demande.priority).toBe('high');
    expect(demande.amount).toBe(50000);
    expect(demande.budget?.available).toBe(100000);
    expect(demande.budget?.code).toBe('BUD-001');
    expect(demande.deadline).toBeInstanceOf(Date);
    expect(demande.risks).toHaveLength(1);
    expect(demande.risks?.[0]?.type).toBe('budget');
  });

  it('should handle missing optional fields', () => {
    const local = {
      id: 'DEM-002',
      subject: 'Test demande',
      bureau: 'BMO',
      type: 'test',
      priority: 'normal',
      status: 'pending' as const,
      amount: null,
      createdAt: '2024-01-01T00:00:00Z',
      delayDays: 0,
      isOverdue: false
    };

    const demande = adaptLocalDemandToDomain(local);

    expect(demande.amount).toBe(0);
    expect(demande.budget).toBeUndefined();
    expect(demande.deadline).toBeUndefined();
    expect(demande.risks).toBeUndefined();
  });

  it('should convert risk categories correctly', () => {
    const local = {
      id: 'DEM-003',
      subject: 'Test demande',
      bureau: 'BMO',
      type: 'test',
      priority: 'normal',
      status: 'pending' as const,
      amount: 1000,
      createdAt: '2024-01-01T00:00:00Z',
      delayDays: 0,
      isOverdue: false,
      risks: [
        { id: '1', category: 'budget', score: 50 },
        { id: '2', category: 'delay', score: 30 },
        { id: '3', category: 'quality', score: 20 },
        { id: '4', category: 'other', score: 10 }
      ]
    };

    const demande = adaptLocalDemandToDomain(local);

    expect(demande.risks).toHaveLength(4);
    expect(demande.risks?.[0]?.type).toBe('budget');
    expect(demande.risks?.[1]?.type).toBe('delay');
    expect(demande.risks?.[2]?.type).toBe('quality');
    expect(demande.risks?.[3]?.type).toBe('compliance');
  });
});

