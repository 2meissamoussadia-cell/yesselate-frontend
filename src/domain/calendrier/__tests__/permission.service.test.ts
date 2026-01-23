/**
 * Tests unitaires pour PermissionService
 */

import { describe, it, expect } from '@jest/globals';
import { PermissionService, type CalendrierRole } from '../services/permission.service';
import type { CalendrierPermission } from '../services/permission.service';

describe('PermissionService', () => {
  describe('hasPermission', () => {
    it('should return true for viewer permissions', () => {
      expect(PermissionService.hasPermission('viewer', 'view_events')).toBe(true);
      expect(PermissionService.hasPermission('viewer', 'view_absences')).toBe(true);
    });

    it('should return false for viewer create permission', () => {
      expect(PermissionService.hasPermission('viewer', 'create_events')).toBe(false);
    });

    it('should return true for editor permissions', () => {
      expect(PermissionService.hasPermission('editor', 'create_events')).toBe(true);
      expect(PermissionService.hasPermission('editor', 'edit_events')).toBe(true);
    });

    it('should return true for admin permissions', () => {
      expect(PermissionService.hasPermission('admin', 'resolve_conflicts')).toBe(true);
      expect(PermissionService.hasPermission('admin', 'edit_affectations')).toBe(true);
    });

    it('should return true for owner permissions', () => {
      expect(PermissionService.hasPermission('owner', 'resolve_conflicts')).toBe(true);
      expect(PermissionService.hasPermission('owner', 'edit_affectations')).toBe(true);
    });
  });

  describe('getPermissions', () => {
    it('should return all permissions for a role', () => {
      const viewerPerms = PermissionService.getPermissions('viewer');
      const editorPerms = PermissionService.getPermissions('editor');
      const adminPerms = PermissionService.getPermissions('admin');

      expect(viewerPerms.length).toBeGreaterThan(0);
      expect(editorPerms.length).toBeGreaterThan(viewerPerms.length);
      expect(adminPerms.length).toBeGreaterThanOrEqual(editorPerms.length);
    });
  });

  describe('canCreateEvents', () => {
    it('should return false for viewer', () => {
      expect(PermissionService.canCreateEvents('viewer')).toBe(false);
    });

    it('should return true for editor', () => {
      expect(PermissionService.canCreateEvents('editor')).toBe(true);
    });

    it('should return true for admin', () => {
      expect(PermissionService.canCreateEvents('admin')).toBe(true);
    });
  });

  describe('canEditEvents', () => {
    it('should return false for viewer', () => {
      expect(PermissionService.canEditEvents('viewer')).toBe(false);
    });

    it('should return true for editor', () => {
      expect(PermissionService.canEditEvents('editor')).toBe(true);
    });
  });

  describe('canResolveConflicts', () => {
    it('should return false for viewer and editor', () => {
      expect(PermissionService.canResolveConflicts('viewer')).toBe(false);
      expect(PermissionService.canResolveConflicts('editor')).toBe(false);
    });

    it('should return true for admin and owner', () => {
      expect(PermissionService.canResolveConflicts('admin')).toBe(true);
      expect(PermissionService.canResolveConflicts('owner')).toBe(true);
    });
  });
});
