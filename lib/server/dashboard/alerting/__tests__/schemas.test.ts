/**
 * Tests unitaires P15/P17 — schémas alerting (AlertDSLv2, Hysteresis, GroupBy, Correlation)
 */

import { describe, it, expect } from '@jest/globals';
import {
  AlertDSLv2Schema,
  HysteresisSchema,
  GroupBySchema,
  CorrelationSchema,
} from '../schemas';

describe('AlertDSLv2Schema (P15/P17)', () => {
  it('parses valid view source', () => {
    const raw = {
      source: { type: 'view' as const, view: 'rm_finance_overview' },
      condition: { op: '>' as const, left: 'metric', right: 100 },
    };
    const out = AlertDSLv2Schema.parse(raw);
    expect(out.source.type).toBe('view');
    expect((out.source as { view: string }).view).toBe('rm_finance_overview');
    expect(out.condition.op).toBe('>');
  });

  it('parses valid query source', () => {
    const raw = {
      source: { type: 'query' as const, query: 'SELECT 1' },
      condition: { op: '>=' as const, left: 'metric', right: 0 },
    };
    const out = AlertDSLv2Schema.parse(raw);
    expect(out.source.type).toBe('query');
    expect((out.source as { query: string }).query).toBe('SELECT 1');
  });

  it('parses with window and aggregate', () => {
    const raw = {
      source: { type: 'view' as const, view: 'v' },
      window: { range: '24h' as const, granularity: '1h' as const },
      aggregate: { metric: 'dso_jours', func: 'avg' as const },
      condition: { op: '>' as const, left: 'metric', right: 30 },
    };
    const out = AlertDSLv2Schema.parse(raw);
    expect(out.window?.range).toBe('24h');
    expect(out.aggregate?.func).toBe('avg');
  });

  it('rejects missing source', () => {
    expect(() =>
      AlertDSLv2Schema.parse({ condition: { op: '>', left: 'metric', right: 1 } } as any)
    ).toThrow();
  });

  it('rejects missing condition', () => {
    expect(() =>
      AlertDSLv2Schema.parse({
        source: { type: 'view', view: 'v' },
      } as any)
    ).toThrow();
  });
});

describe('HysteresisSchema (P17)', () => {
  it('parses valid hysteresis with all op keys', () => {
    const raw = {
      enter: { '>': 100, '>=': 100, '<': 50, '<=': 50 },
      exit: { '>': 90, '>=': 90, '<': 80, '<=': 80 },
    };
    const out = HysteresisSchema.parse(raw);
    expect(out.enter['>']).toBe(100);
    expect(out.exit['<']).toBe(80);
  });
  it('rejects invalid op key', () => {
    expect(() => HysteresisSchema.parse({ enter: { x: 1 }, exit: {} } as any)).toThrow();
  });
});

describe('GroupBySchema (P17)', () => {
  it('parses valid groupBy', () => {
    const raw = { keys: ['bureau', 'chantier'], topN: 10, orderBy: 'desc' as const };
    const out = GroupBySchema.parse(raw);
    expect(out.keys).toEqual(['bureau', 'chantier']);
    expect(out.topN).toBe(10);
    expect(out.orderBy).toBe('desc');
  });
  it('rejects topN < 1', () => {
    expect(() => GroupBySchema.parse({ keys: ['a'], topN: 0 } as any)).toThrow();
  });
});

describe('CorrelationSchema (P17)', () => {
  it('parses valid correlation array', () => {
    const raw = [{ metric: 'dso', op: '>' as const, value: 50 }];
    const out = CorrelationSchema.parse(raw);
    expect(out).toHaveLength(1);
    expect(out[0].metric).toBe('dso');
    expect(out[0].op).toBe('>');
    expect(out[0].value).toBe(50);
  });
  it('parses with compare and delta_pct', () => {
    const raw = [
      { metric: 'x', op: '>=' as const, value: 1, compare: 'baseline' as const, delta_pct: 25 },
    ];
    const out = CorrelationSchema.parse(raw);
    expect(out[0].compare).toBe('baseline');
    expect(out[0].delta_pct).toBe(25);
  });
});
