/**
 * Tests unitaires P10 — navigationFilter (isNavNodeAccessible, filterNavigationConfig, findFirstAuthorizedRoute)
 */

import { describe, it, expect } from '@jest/globals';
import {
  isNavNodeAccessible,
  filterNavigationConfig,
  findFirstAuthorizedRoute,
} from '../navigationFilter';
import type { NavNode } from '../../types/dashboardNavigationTypes';

describe('navigationFilter (P10)', () => {
  describe('isNavNodeAccessible', () => {
    it('returns true for admin role regardless of requires', () => {
      const node: NavNode = { id: 'x', requires: { perm: 'export:read' } };
      expect(isNavNodeAccessible(node, [], ['admin'], {})).toBe(true);
    });

    it('returns true for dashboard:write permission', () => {
      const node: NavNode = { id: 'x', requires: { perm: 'export:read' } };
      expect(isNavNodeAccessible(node, ['dashboard:write'], [], {})).toBe(true);
    });

    it('returns true when no requires and user has dashboard:read', () => {
      const node: NavNode = { id: 'x' };
      expect(isNavNodeAccessible(node, ['dashboard:read'], [], {})).toBe(true);
    });

    it('returns false when no requires and user lacks dashboard:read', () => {
      const node: NavNode = { id: 'x' };
      expect(isNavNodeAccessible(node, [], [], {})).toBe(false);
    });

    it('returns true when user has required perm', () => {
      const node: NavNode = { id: 'x', requires: { perm: 'export:read' } };
      expect(isNavNodeAccessible(node, ['export:read'], [], {})).toBe(true);
    });

    it('returns false when user lacks required perm', () => {
      const node: NavNode = { id: 'x', requires: { perm: 'export:read' } };
      expect(isNavNodeAccessible(node, ['dashboard:read'], [], {})).toBe(false);
    });

    it('returns false when required flag is explicitly false', () => {
      const node: NavNode = { id: 'x', requires: { perm: 'dashboard:read', flag: 'export_enabled' } };
      expect(isNavNodeAccessible(node, ['dashboard:read'], [], { export_enabled: false })).toBe(false);
    });

    it('returns true when required role is present', () => {
      const node: NavNode = { id: 'x', requires: { perm: 'dashboard:read', roles: ['manager'] } };
      expect(isNavNodeAccessible(node, ['dashboard:read'], ['manager'], {})).toBe(true);
    });

    it('returns false when required role is absent', () => {
      const node: NavNode = { id: 'x', requires: { perm: 'dashboard:read', roles: ['manager'] } };
      expect(isNavNodeAccessible(node, ['dashboard:read'], ['user'], {})).toBe(false);
    });
  });

  describe('filterNavigationConfig', () => {
    it('returns full config when no permission data (avoid empty sidebar)', () => {
      const config: Record<string, NavNode> = {
        a: { id: 'a', requires: { perm: 'dashboard:read' }, children: [] },
      };
      expect(filterNavigationConfig(config, [], [], {})).toEqual(config);
    });

    it('filters out nodes not accessible', () => {
      const config: Record<string, NavNode> = {
        a: { id: 'a', requires: { perm: 'dashboard:read' } },
        b: { id: 'b', requires: { perm: 'export:read' } },
      };
      const result = filterNavigationConfig(config, ['dashboard:read'], [], {});
      expect(Object.keys(result)).toContain('a');
      expect(Object.keys(result)).not.toContain('b');
    });

    it('keeps node when user has required perm', () => {
      const config: Record<string, NavNode> = {
        a: { id: 'a', requires: { perm: 'dashboard:read' } },
      };
      const result = filterNavigationConfig(config, ['dashboard:read'], [], {});
      expect(result.a).toBeDefined();
      expect(result.a.id).toBe('a');
    });
  });

  describe('findFirstAuthorizedRoute', () => {
    it('returns first main when no children', () => {
      const config: Record<string, NavNode> = {
        a: { id: 'a' },
      };
      expect(findFirstAuthorizedRoute(config)).toEqual({ main: 'a', sub: null, leaf: null });
    });

    it('returns main + first sub when no leaf', () => {
      const config: Record<string, NavNode> = {
        a: { id: 'a', children: [{ id: 's1' }] },
      };
      expect(findFirstAuthorizedRoute(config)).toEqual({ main: 'a', sub: 's1', leaf: null });
    });

    it('returns main + sub + first leaf when present', () => {
      const config: Record<string, NavNode> = {
        a: { id: 'a', children: [{ id: 's1', children: [{ id: 'l1' }] }] },
      };
      expect(findFirstAuthorizedRoute(config)).toEqual({ main: 'a', sub: 's1', leaf: 'l1' });
    });

    it('returns null for empty config', () => {
      expect(findFirstAuthorizedRoute({})).toBeNull();
    });
  });
});
