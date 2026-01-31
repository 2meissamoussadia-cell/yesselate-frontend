/**
 * Tests unitaires P5 — getAuthHeaders (dashboard)
 */

import { describe, it, expect } from '@jest/globals';
import { getAuthHeaders } from '../getAuthHeaders';

describe('getAuthHeaders', () => {
  it('returns default tenant and anonymous user when user is null', () => {
    const headers = getAuthHeaders(null);
    expect(headers['x-tenant-id']).toBe('default');
    expect(headers['x-user-id']).toBe('anonymous');
  });

  it('uses tenantId override when provided', () => {
    const headers = getAuthHeaders(null, 'tenant-123');
    expect(headers['x-tenant-id']).toBe('tenant-123');
    expect(headers['x-user-id']).toBe('anonymous');
  });

  it('uses user id and bureauId when user is provided', () => {
    const user = { id: 'user-1', bureauId: 'bureau-A' } as any;
    const headers = getAuthHeaders(user);
    expect(headers['x-tenant-id']).toBe('bureau-A');
    expect(headers['x-user-id']).toBe('user-1');
  });

  it('uses tenantId override over user bureauId when both provided', () => {
    const user = { id: 'user-1', bureauId: 'bureau-A' } as any;
    const headers = getAuthHeaders(user, 'tenant-override');
    expect(headers['x-tenant-id']).toBe('tenant-override');
    expect(headers['x-user-id']).toBe('user-1');
  });

  it('adds x-roles when user has role string', () => {
    const user = { id: 'u1', bureauId: 'b1', role: 'admin' } as any;
    const headers = getAuthHeaders(user);
    expect(headers['x-roles']).toBe('admin');
  });

  it('joins x-roles when user has role array', () => {
    const user = { id: 'u1', bureauId: 'b1', role: ['admin', 'editor'] } as any;
    const headers = getAuthHeaders(user);
    expect(headers['x-roles']).toBe('admin,editor');
  });

  it('does not add x-roles when user has no role', () => {
    const user = { id: 'u1', bureauId: 'b1' } as any;
    const headers = getAuthHeaders(user);
    expect(headers).not.toHaveProperty('x-roles');
  });
});
