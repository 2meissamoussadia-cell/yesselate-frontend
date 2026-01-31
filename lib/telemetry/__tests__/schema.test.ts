/**
 * Tests unitaires P14 — schéma télémétrie (TelemetryEvent, TelemetryBatch)
 */

import { describe, it, expect } from '@jest/globals';
import { TelemetryEvent, TelemetryBatch } from '../schema';

describe('TelemetryEvent (P14)', () => {
  it('parses valid event', () => {
    const raw = { event: 'view_opened', routeKey: 'main::sub', at: Date.now(), props: { kpiId: 'x' } };
    const out = TelemetryEvent.parse(raw);
    expect(out.event).toBe('view_opened');
    expect(out.routeKey).toBe('main::sub');
    expect(out.at).toBe(raw.at);
    expect(out.props).toEqual({ kpiId: 'x' });
  });
  it('parses minimal event (event + at)', () => {
    const raw = { event: 'kpi_click', at: 12345 };
    const out = TelemetryEvent.parse(raw);
    expect(out.event).toBe('kpi_click');
    expect(out.at).toBe(12345);
    expect(out.routeKey).toBeUndefined();
    expect(out.props).toBeUndefined();
  });
  it('rejects missing event', () => {
    expect(() => TelemetryEvent.parse({ at: 1 } as any)).toThrow();
  });
  it('rejects missing at', () => {
    expect(() => TelemetryEvent.parse({ event: 'x' } as any)).toThrow();
  });
  it('rejects non-integer at', () => {
    expect(() => TelemetryEvent.parse({ event: 'x', at: 1.5 } as any)).toThrow();
  });
});

describe('TelemetryBatch (P14)', () => {
  it('parses valid batch', () => {
    const raw = {
      items: [{ event: 'view_opened', at: 1 }, { event: 'kpi_click', at: 2 }],
      seq: 42,
    };
    const out = TelemetryBatch.parse(raw);
    expect(out.items).toHaveLength(2);
    expect(out.items[0].event).toBe('view_opened');
    expect(out.seq).toBe(42);
  });
  it('rejects empty items', () => {
    expect(() => TelemetryBatch.parse({ items: [] } as any)).toThrow();
  });
  it('rejects more than 200 items', () => {
    const items = Array.from({ length: 201 }, (_, i) => ({ event: 'x', at: i }));
    expect(() => TelemetryBatch.parse({ items } as any)).toThrow();
  });
  it('accepts batch without seq', () => {
    const raw = { items: [{ event: 'x', at: 1 }] };
    const out = TelemetryBatch.parse(raw);
    expect(out.seq).toBeUndefined();
  });
});
