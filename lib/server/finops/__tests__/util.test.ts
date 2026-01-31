/**
 * Tests unitaires P16 — FinOps util (inferRowCount)
 */

import { describe, it, expect } from '@jest/globals';
import { inferRowCount } from '../util';

describe('inferRowCount (P16)', () => {
  it('returns 0 for null/undefined', () => {
    expect(inferRowCount(null)).toBe(0);
    expect(inferRowCount(undefined)).toBe(0);
  });
  it('returns 0 for non-object', () => {
    expect(inferRowCount(42)).toBe(0);
    expect(inferRowCount('x')).toBe(0);
  });
  it('returns array length for array', () => {
    expect(inferRowCount([1, 2, 3])).toBe(3);
    expect(inferRowCount([])).toBe(0);
  });
  it('returns length of data array', () => {
    expect(inferRowCount({ data: [1, 2] })).toBe(2);
  });
  it('returns length of rows array', () => {
    expect(inferRowCount({ rows: [{ a: 1 }, { a: 2 }] })).toBe(2);
  });
  it('returns length of items array', () => {
    expect(inferRowCount({ items: [1, 2, 3, 4] })).toBe(4);
  });
  it('returns length of demandes/projets/monthly/trends/tableData/highlights', () => {
    expect(inferRowCount({ demandes: [1, 2, 3] })).toBe(3);
    expect(inferRowCount({ projets: [1] })).toBe(1);
    expect(inferRowCount({ monthly: [] })).toBe(0);
    expect(inferRowCount({ trends: [{}, {}] })).toBe(2);
    expect(inferRowCount({ tableData: [{}] })).toBe(1);
    expect(inferRowCount({ highlights: [1, 2, 3, 4, 5] })).toBe(5);
  });
  it('returns 0 when known keys are not arrays', () => {
    expect(inferRowCount({ data: null })).toBe(0);
    expect(inferRowCount({ rows: 'x' })).toBe(0);
  });
});
