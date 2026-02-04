'use client';

export type UiAuditEvent = {
  id: string;
  ts: number; // epoch ms
  scope: string; // ex: "analytics"
  type: string; // ex: "REFRESH"
  payload?: Record<string, unknown>;
};

const MAX_EVENTS = 500;

const safeNow = () => Date.now();

const safeUUID = () => {
  // crypto.randomUUID() n'existe pas partout
  try {
    if (typeof (globalThis as { crypto?: { randomUUID?: () => string } }).crypto?.randomUUID === 'function') {
      return (globalThis as { crypto: { randomUUID: () => string } }).crypto.randomUUID();
    }
  } catch {}
  return `evt_${Math.random().toString(16).slice(2)}_${safeNow()}`;
};

const storageKey = (scope: string) => `bmo.audit.${scope}`;

const readBuffer = (scope: string): UiAuditEvent[] => {
  try {
    if (typeof window === 'undefined') return [];
    const raw = window.localStorage.getItem(storageKey(scope));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as UiAuditEvent[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeBuffer = (scope: string, events: UiAuditEvent[]) => {
  try {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(storageKey(scope), JSON.stringify(events.slice(-MAX_EVENTS)));
  } catch {
    // ignore
  }
};

export const logUiEvent = (scope: string, type: string, payload?: Record<string, unknown>) => {
  const evt: UiAuditEvent = { id: safeUUID(), ts: safeNow(), scope, type, payload };

  // Console (phase 1)
  // Tu pourras remplacer plus tard par un POST /api/audit ou sendBeacon.
  // Garder console.info est utile en dev.
  // eslint-disable-next-line no-console
  console.info('[AUDIT]', scope, type, payload ?? {});

  const buf = readBuffer(scope);
  buf.push(evt);
  writeBuffer(scope, buf);

  // Hook pour futur backend (phase 2)
  try {
    if (typeof navigator !== 'undefined' && 'sendBeacon' in navigator) {
      // endpoint optionnel, non bloquant (si inexistant → silencieux)
      const blob = new Blob([JSON.stringify(evt)], { type: 'application/json' });
      (navigator as Navigator & { sendBeacon?(url: string, body: Blob): boolean }).sendBeacon?.('/api/audit', blob);
    }
  } catch {
    // ignore
  }

  return evt;
};

export function useUiAudit(scope: string) {
  return {
    log: (type: string, payload?: Record<string, unknown>) => logUiEvent(scope, type, payload),
  };
}

