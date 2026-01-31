/**
 * Tests unitaires P13 — CircuitBreaker (résilience & DR)
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';

jest.mock('@/lib/server/observability/metrics', () => ({
  circuitOpenTotal: { inc: jest.fn() },
}));

import { CircuitBreaker } from '../circuit';

describe('CircuitBreaker (P13)', () => {
  let breaker: CircuitBreaker;

  beforeEach(() => {
    breaker = new CircuitBreaker(3, 100, 'db');
  });

  it('starts closed and allows requests', () => {
    expect(breaker.getState()).toBe('closed');
    expect(breaker.canPass()).toBe(true);
  });

  it('opens after threshold failures', () => {
    breaker.failure();
    breaker.failure();
    expect(breaker.getState()).toBe('closed');
    breaker.failure();
    expect(breaker.getState()).toBe('open');
    expect(breaker.canPass()).toBe(false);
  });

  it('success resets to closed', () => {
    breaker.failure();
    breaker.failure();
    breaker.success();
    expect(breaker.getState()).toBe('closed');
    expect(breaker.canPass()).toBe(true);
  });

  it('reset manually closes circuit', () => {
    breaker.failure();
    breaker.failure();
    breaker.failure();
    expect(breaker.getState()).toBe('open');
    breaker.reset();
    expect(breaker.getState()).toBe('closed');
    expect(breaker.canPass()).toBe(true);
  });
});
