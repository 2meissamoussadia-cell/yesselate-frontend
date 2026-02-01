/**
 * Store des liens de partage (token → payload).
 * En production : remplacer par Redis ou table DB avec TTL.
 */

import { randomBytes } from 'node:crypto';

const EXPIRY_DAYS_DEFAULT = 7;

export type ShareRole = 'client' | 'associe';

export interface SharePayload {
  role: ShareRole;
  chantierIds?: string[];
  scope?: string;
  expiresAt: number;
  createdAt: number;
}

const store = new Map<string, SharePayload>();

function randomToken(): string {
  return randomBytes(24).toString('base64url');
}

export function createShareToken(options: {
  role: ShareRole;
  chantierIds?: string[];
  scope?: string;
  expiryDays?: number;
}): { token: string; expiresAt: number } {
  const { role, chantierIds, scope, expiryDays = EXPIRY_DAYS_DEFAULT } = options;
  const now = Date.now();
  const expiresAt = now + expiryDays * 24 * 60 * 60 * 1000;
  const token = randomToken();
  store.set(token, {
    role,
    chantierIds: role === 'client' ? (chantierIds ?? []) : undefined,
    scope,
    expiresAt,
    createdAt: now,
  });
  return { token, expiresAt };
}

export function getSharePayload(token: string): SharePayload | null {
  const payload = store.get(token);
  if (!payload || payload.expiresAt < Date.now()) {
    if (payload) store.delete(token);
    return null;
  }
  return payload;
}
