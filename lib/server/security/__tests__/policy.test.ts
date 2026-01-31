/**
 * Tests unitaires P10 — policy (hasPerm, flagEnabled, can)
 */

import { describe, it, expect } from '@jest/globals';
import { hasPerm, flagEnabled, can } from '../policy';

describe('policy (P10)', () => {
  describe('hasPerm', () => {
    it('returns true when ctx has permission', () => {
      expect(hasPerm({ perms: ['dashboard:read'] }, 'dashboard:read')).toBe(true);
      expect(hasPerm({ permissions: ['export:read'] }, 'export:read')).toBe(true);
    });

    it('returns false when ctx lacks permission', () => {
      expect(hasPerm({ perms: ['dashboard:read'] }, 'export:read')).toBe(false);
    });

    it('returns false when perms is empty', () => {
      expect(hasPerm({ perms: [] }, 'dashboard:read')).toBe(false);
    });
  });

  describe('flagEnabled', () => {
    it('returns true when flag is true', () => {
      expect(flagEnabled({ flags: { export_enabled: true } }, 'export_enabled')).toBe(true);
      expect(flagEnabled({ featureFlags: { x: true } }, 'x')).toBe(true);
    });

    it('returns false when flag is false or absent', () => {
      expect(flagEnabled({ flags: { export_enabled: false } }, 'export_enabled')).toBe(false);
      expect(flagEnabled({ flags: {} }, 'missing')).toBe(false);
    });
  });

  describe('can', () => {
    it('returns true when perm only and user has it', () => {
      expect(can({ perms: ['dashboard:read'] }, { perm: 'dashboard:read' })).toBe(true);
    });

    it('returns false when perm only and user lacks it', () => {
      expect(can({ perms: [] }, { perm: 'dashboard:read' })).toBe(false);
    });

    it('returns false when flag required and disabled', () => {
      expect(can({ perms: ['export:read'], flags: { export_enabled: false } }, { perm: 'export:read', flag: 'export_enabled' })).toBe(false);
    });

    it('returns true when flag required and enabled', () => {
      expect(can({ perms: ['export:read'], flags: { export_enabled: true } }, { perm: 'export:read', flag: 'export_enabled' })).toBe(true);
    });
  });
});
