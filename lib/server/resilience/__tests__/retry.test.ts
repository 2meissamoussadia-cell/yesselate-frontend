/**
 * Tests unitaires P13 — retry, isPostgresRetryable, isRedisRetryable (résilience & DR)
 */

import { describe, it, expect, jest } from '@jest/globals';

jest.mock('@/lib/server/observability/metrics', () => ({
  retryAttemptsTotal: { inc: jest.fn() },
}));

import { retry, isPostgresRetryable, isRedisRetryable } from '../retry';

describe('retry (P13)', () => {
  it('returns result on first success', async () => {
    const fn = jest.fn().mockResolvedValue(42);
    const result = await retry(fn, { attempts: 3, baseDelay: 10, maxDelay: 50 });
    expect(result).toBe(42);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('retries on failure then succeeds', async () => {
    const fn = jest.fn().mockRejectedValueOnce(new Error('fail')).mockResolvedValueOnce(1);
    const result = await retry(fn, { attempts: 3, baseDelay: 10, maxDelay: 50 });
    expect(result).toBe(1);
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('throws last error when all attempts fail', async () => {
    const err = new Error('final');
    const fn = jest.fn().mockRejectedValue(err);
    await expect(retry(fn, { attempts: 2, baseDelay: 5, maxDelay: 20 })).rejects.toThrow('final');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('does not retry when isRetryable returns false', async () => {
    const err = new Error('not retryable');
    const fn = jest.fn().mockRejectedValue(err);
    await expect(
      retry(fn, { attempts: 3, isRetryable: () => false, baseDelay: 5 })
    ).rejects.toThrow('not retryable');
    expect(fn).toHaveBeenCalledTimes(1);
  });
});

describe('isPostgresRetryable (P13)', () => {
  it('returns false for null/undefined', () => {
    expect(isPostgresRetryable(null)).toBe(false);
    expect(isPostgresRetryable(undefined)).toBe(false);
  });
  it('returns true for connection_exception code', () => {
    expect(isPostgresRetryable({ code: '08000' })).toBe(true);
    expect(isPostgresRetryable({ code: '08003', message: 'x' })).toBe(true);
  });
  it('returns true for shutdown codes', () => {
    expect(isPostgresRetryable({ code: '57P01' })).toBe(true);
    expect(isPostgresRetryable({ code: '57P03' })).toBe(true);
  });
  it('returns true when message contains connection/timeout/network', () => {
    expect(isPostgresRetryable(new Error('connection refused'))).toBe(true);
    expect(isPostgresRetryable(new Error('ETIMEDOUT'))).toBe(true);
    expect(isPostgresRetryable(new Error('ECONNREFUSED'))).toBe(true);
  });
  it('returns false for other errors', () => {
    expect(isPostgresRetryable(new Error('syntax error'))).toBe(false);
    expect(isPostgresRetryable({ code: '42P01' })).toBe(false);
  });
});

describe('isRedisRetryable (P13)', () => {
  it('returns false for null/undefined', () => {
    expect(isRedisRetryable(null)).toBe(false);
    expect(isRedisRetryable(undefined)).toBe(false);
  });
  it('returns true when message contains connection/timeout/READONLY', () => {
    expect(isRedisRetryable(new Error('connection lost'))).toBe(true);
    expect(isRedisRetryable(new Error('READONLY'))).toBe(true);
    expect(isRedisRetryable(new Error('ETIMEDOUT'))).toBe(true);
  });
  it('returns false for other errors', () => {
    expect(isRedisRetryable(new Error('wrong type'))).toBe(false);
  });
});
