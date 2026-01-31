/**
 * Tests unitaires P6 — monitoring (dashboard)
 * Vérifie que captureException / captureMessage ne lèvent pas d'exception.
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { captureException, captureMessage } from '../monitoring';

describe('monitoring (P6)', () => {
  const originalWindow = typeof globalThis !== 'undefined' ? (globalThis as any).window : undefined;

  beforeEach(() => {
    (globalThis as any).window = { ...originalWindow };
    (globalThis as any).process = { ...process, env: { ...process.env, NODE_ENV: 'test' } };
  });

  afterEach(() => {
    if (originalWindow === undefined) delete (globalThis as any).window;
    else (globalThis as any).window = originalWindow;
  });

  describe('captureException', () => {
    it('does not throw when no monitoring service is available', () => {
      (globalThis as any).window.Sentry = undefined;
      (globalThis as any).window.LogRocket = undefined;
      const error = new Error('Test error');
      expect(() => captureException(error)).not.toThrow();
    });

    it('does not throw when called with options', () => {
      (globalThis as any).window.Sentry = undefined;
      (globalThis as any).window.LogRocket = undefined;
      const error = new Error('Test error');
      expect(() =>
        captureException(error, {
          extra: { component: 'Test' },
          tags: { env: 'test' },
        })
      ).not.toThrow();
    });
  });

  describe('captureMessage', () => {
    it('does not throw when no monitoring service is available', () => {
      (globalThis as any).window.Sentry = undefined;
      (globalThis as any).window.LogRocket = undefined;
      expect(() => captureMessage('Test message', 'error')).not.toThrow();
    });

    it('does not throw when called with extra', () => {
      (globalThis as any).window.Sentry = undefined;
      (globalThis as any).window.LogRocket = undefined;
      expect(() => captureMessage('Test', 'info', { key: 'value' })).not.toThrow();
    });
  });
});
