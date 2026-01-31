/**
 * Tests unitaires P7/P8 — security (checkPermission, applyTenantFilter, checkViewAccess)
 * Mocks des dépendances serveur (jwt, cookies, context) pour éviter de charger pg en Jest.
 */

import { describe, it, expect } from '@jest/globals';

jest.mock('@lib-root/server/security/jwt', () => ({ verifyJWT: jest.fn() }));
jest.mock('@lib-root/server/security/cookies', () => ({ getSessionCookie: jest.fn() }));
jest.mock('@lib-root/server/dashboard/context', () => ({ extractContextFromHeaders: jest.fn() }));
jest.mock('../../utils/logger', () => ({
  createLogger: () => ({ warn: jest.fn(), error: jest.fn(), info: jest.fn(), debug: jest.fn() }),
}));

import {
  checkPermission,
  checkViewAccess,
  applyTenantFilter,
} from '../security';
import type { SecurityContext } from '../types';

const ctx: SecurityContext = {
  userId: 'user-1',
  tenantId: 'tenant-A',
  roles: ['manager'],
  bureaux: ['B1', 'B2'],
  chantiers: ['C1'],
  permissions: ['dashboard:read'],
};

describe('security (P7/P8)', () => {
  describe('checkPermission', () => {
    it('denies when context is null', () => {
      const result = checkPermission(null, { role: 'user' });
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('No security context');
    });

    it('allows when context has required role', () => {
      const result = checkPermission(ctx, { role: 'manager' });
      expect(result.allowed).toBe(true);
    });

    it('allows when context has one of required roles', () => {
      const result = checkPermission(ctx, { role: ['admin', 'manager'] });
      expect(result.allowed).toBe(true);
    });

    it('denies when context misses required role', () => {
      const result = checkPermission(ctx, { role: 'admin' });
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('Missing required role');
    });

    it('allows when tenant matches', () => {
      const result = checkPermission(ctx, { tenant: 'tenant-A' });
      expect(result.allowed).toBe(true);
    });

    it('denies when tenant does not match', () => {
      const result = checkPermission(ctx, { tenant: 'tenant-B' });
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('Tenant mismatch');
    });

    it('allows when context has required bureau', () => {
      const result = checkPermission(ctx, { bureau: 'B1' });
      expect(result.allowed).toBe(true);
    });

    it('denies when context misses required bureau', () => {
      const result = checkPermission(ctx, { bureau: 'B3' });
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('Missing required bureau');
    });

    it('allows when custom check returns true', () => {
      const result = checkPermission(ctx, {
        custom: (c) => c.userId === 'user-1',
      });
      expect(result.allowed).toBe(true);
    });

    it('denies when custom check returns false', () => {
      const result = checkPermission(ctx, {
        custom: () => false,
      });
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('Custom permission check failed');
    });
  });

  describe('checkViewAccess', () => {
    it('denies when context is null for overview route', () => {
      const result = checkViewAccess(null, {
        main: 'overview',
        sub: 'summary',
        leaf: 'dashboard',
      });
      expect(result.allowed).toBe(false);
    });

    it('allows when context has role for overview::summary::dashboard', () => {
      const result = checkViewAccess(ctx, {
        main: 'overview',
        sub: 'summary',
        leaf: 'dashboard',
      });
      expect(result.allowed).toBe(true);
    });

    it('allows when context has role for performance::kpis::projets', () => {
      const result = checkViewAccess(ctx, {
        main: 'performance',
        sub: 'kpis',
        leaf: 'projets',
      });
      expect(result.allowed).toBe(true);
    });

    it('allows unknown route when context is authenticated', () => {
      const result = checkViewAccess(ctx, {
        main: 'overview',
        sub: 'other',
        leaf: 'other',
      });
      expect(result.allowed).toBe(true);
    });
  });

  describe('applyTenantFilter (P8)', () => {
    it('returns empty object when context is null', () => {
      const data = { items: [{ id: 1, tenantId: 'tenant-A' }] };
      const result = applyTenantFilter(data, null);
      expect(result).toEqual({});
    });

    it('filters array by tenantId', () => {
      const data = [
        { id: 1, tenantId: 'tenant-A' },
        { id: 2, tenantId: 'tenant-B' },
      ];
      const result = applyTenantFilter(data, ctx);
      expect(result).toHaveLength(1);
      expect((result as typeof data)[0].tenantId).toBe('tenant-A');
    });

    it('keeps items matching bureau when context has bureaux', () => {
      const data = [
        { id: 1, bureauId: 'B1', tenantId: 'tenant-A' },
        { id: 2, bureauId: 'B3', tenantId: 'tenant-A' },
      ];
      const result = applyTenantFilter(data, ctx);
      expect(result).toHaveLength(1);
      expect((result as typeof data)[0].bureauId).toBe('B1');
    });

    it('returns same object when no filter fields and single object', () => {
      const data = { label: 'Test', value: 42 };
      const result = applyTenantFilter(data, ctx);
      expect(result).toEqual(data);
    });
  });
});
