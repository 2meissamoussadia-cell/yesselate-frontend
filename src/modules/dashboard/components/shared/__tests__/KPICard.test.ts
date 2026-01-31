/**
 * Tests unitaires P4 — KPICard / sanitizeKpiValue
 */

import { describe, it, expect } from '@jest/globals';
import { sanitizeKpiValue } from '../KPICard';

describe('sanitizeKpiValue', () => {
  it('returns "—" for undefined', () => {
    expect(sanitizeKpiValue(undefined as unknown as string)).toBe('—');
  });

  it('returns "—" for null', () => {
    expect(sanitizeKpiValue(null as unknown as string)).toBe('—');
  });

  it('returns "—" for NaN', () => {
    expect(sanitizeKpiValue(Number.NaN)).toBe('—');
  });

  it('returns "—" for empty string', () => {
    expect(sanitizeKpiValue('')).toBe('—');
  });

  it('returns the value for valid number', () => {
    expect(sanitizeKpiValue(42)).toBe(42);
    expect(sanitizeKpiValue(0)).toBe(0);
  });

  it('returns the value for valid string', () => {
    expect(sanitizeKpiValue('89%')).toBe('89%');
    expect(sanitizeKpiValue('247')).toBe('247');
  });
});
