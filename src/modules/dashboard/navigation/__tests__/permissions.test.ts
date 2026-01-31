/**
 * Tests unitaires P10 — permissions (nodeAllowed, UserContext)
 */

import { describe, it, expect } from '@jest/globals';
import { nodeAllowed, type UserContext } from '../permissions';

describe('permissions (P10)', () => {
  const ctx: UserContext = {
    perms: ['dashboard:read', 'export:read'],
    flags: { export_enabled: true },
    roles: ['user'],
  };

  describe('nodeAllowed', () => {
    it('returns true when no requires', () => {
      expect(nodeAllowed(ctx)).toBe(true);
      expect(nodeAllowed(ctx, undefined)).toBe(true);
    });

    it('returns true for admin role regardless of requires', () => {
      const adminCtx: UserContext = { ...ctx, roles: ['admin'] };
      expect(nodeAllowed(adminCtx, { perm: 'export:read' })).toBe(true);
    });

    it('returns true for dg role', () => {
      const dgCtx: UserContext = { ...ctx, roles: ['dg'] };
      expect(nodeAllowed(dgCtx, { perm: 'export:read' })).toBe(true);
    });

    it('returns true when user has required perm', () => {
      expect(nodeAllowed(ctx, { perm: 'dashboard:read' })).toBe(true);
      expect(nodeAllowed(ctx, { perm: 'export:read' })).toBe(true);
    });

    it('returns false when user lacks required perm', () => {
      expect(nodeAllowed(ctx, { perm: 'admin:write' })).toBe(false);
    });

    it('returns false when required flag is false', () => {
      const ctxNoFlag: UserContext = { ...ctx, flags: { export_enabled: false } };
      expect(nodeAllowed(ctxNoFlag, { perm: 'dashboard:read', flag: 'export_enabled' })).toBe(false);
    });

    it('returns true when required flag is present and true', () => {
      expect(nodeAllowed(ctx, { perm: 'dashboard:read', flag: 'export_enabled' })).toBe(true);
    });

    it('returns true when user has required role', () => {
      expect(nodeAllowed(ctx, { perm: 'dashboard:read', roles: ['user'] })).toBe(true);
    });

    it('returns false when user lacks required role', () => {
      expect(nodeAllowed(ctx, { perm: 'dashboard:read', roles: ['manager'] })).toBe(false);
    });
  });
});
