/**
 * Tests unitaires P11 — cacheStrategy (getCacheStrategy, CACHE_STRATEGIES)
 * Mock next/server pour éviter ReferenceError: Request is not defined en Jest.
 */
import { describe, it, expect } from '@jest/globals';

jest.mock('next/server', () => ({
  NextResponse: {
    json: (data: unknown, init?: { status?: number }) => ({ data, status: init?.status ?? 200 }),
  },
}));

import {
  getCacheStrategy,
  CacheStrategyType,
  CACHE_STRATEGIES,
} from '../cacheStrategy';

describe('cacheStrategy (P11)', () => {
  describe('getCacheStrategy', () => {
    it('returns REALTIME for main realtime', () => {
      expect(getCacheStrategy('realtime', null, null)).toBe(CacheStrategyType.REALTIME);
      expect(getCacheStrategy('realtime', 'live', null)).toBe(CacheStrategyType.REALTIME);
    });

    it('returns REPORTING for performance/reporting', () => {
      expect(getCacheStrategy('performance', 'reporting', null)).toBe(CacheStrategyType.REPORTING);
      expect(getCacheStrategy('performance', 'reporting', 'dashboard')).toBe(CacheStrategyType.REPORTING);
    });

    it('returns REPORTING for trends monthly/quarterly', () => {
      expect(getCacheStrategy('performance', 'trends', 'monthly')).toBe(CacheStrategyType.REPORTING);
      expect(getCacheStrategy('performance', 'trends', 'quarterly')).toBe(CacheStrategyType.REPORTING);
    });

    it('returns OPERATIONAL for overview, performance, actions, risks, decisions', () => {
      expect(getCacheStrategy('overview', null, null)).toBe(CacheStrategyType.OPERATIONAL);
      expect(getCacheStrategy('performance', 'kpis', 'projets')).toBe(CacheStrategyType.OPERATIONAL);
      expect(getCacheStrategy('actions', null, null)).toBe(CacheStrategyType.OPERATIONAL);
      expect(getCacheStrategy('risks', null, null)).toBe(CacheStrategyType.OPERATIONAL);
      expect(getCacheStrategy('decisions', null, null)).toBe(CacheStrategyType.OPERATIONAL);
    });

    it('returns OPERATIONAL by default', () => {
      expect(getCacheStrategy('other', null, null)).toBe(CacheStrategyType.OPERATIONAL);
    });
  });

  describe('CACHE_STRATEGIES', () => {
    it('defines config for each strategy type', () => {
      expect(CACHE_STRATEGIES[CacheStrategyType.REALTIME].revalidate).toBe(5);
      expect(CACHE_STRATEGIES[CacheStrategyType.OPERATIONAL].revalidate).toBe(30);
      expect(CACHE_STRATEGIES[CacheStrategyType.REPORTING].revalidate).toBe(60);
      expect(CACHE_STRATEGIES[CacheStrategyType.STATIC].revalidate).toBe(300);
    });

    it('REALTIME has short maxAge', () => {
      expect(CACHE_STRATEGIES[CacheStrategyType.REALTIME].maxAge).toBe(5);
    });

    it('REPORTING has sMaxAge for CDN', () => {
      expect(CACHE_STRATEGIES[CacheStrategyType.REPORTING].sMaxAge).toBe(300);
    });
  });
});
