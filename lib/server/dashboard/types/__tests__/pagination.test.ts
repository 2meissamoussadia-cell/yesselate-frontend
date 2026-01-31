/**
 * Tests unitaires P11 — pagination (parsePaginationParams, getOffset, createPaginatedResponse)
 */

import { describe, it, expect } from '@jest/globals';
import {
  parsePaginationParams,
  getOffset,
  createPaginatedResponse,
  type PaginationOptions,
} from '../pagination';

describe('pagination (P11)', () => {
  describe('parsePaginationParams', () => {
    it('defaults to page 1 and limit 100', () => {
      const url = new URL('http://localhost/api');
      const opts = parsePaginationParams(url);
      expect(opts.page).toBe(1);
      expect(opts.limit).toBe(100);
    });

    it('parses page and limit from search params', () => {
      const url = new URL('http://localhost/api?page=2&limit=50');
      const opts = parsePaginationParams(url);
      expect(opts.page).toBe(2);
      expect(opts.limit).toBe(50);
    });

    it('clamps page to at least 1', () => {
      const url = new URL('http://localhost/api?page=0');
      const opts = parsePaginationParams(url);
      expect(opts.page).toBe(1);
    });

    it('clamps limit between 50 and 500', () => {
      const urlLow = new URL('http://localhost/api?limit=10');
      expect(parsePaginationParams(urlLow).limit).toBe(50);
      const urlHigh = new URL('http://localhost/api?limit=1000');
      expect(parsePaginationParams(urlHigh).limit).toBe(500);
    });
  });

  describe('getOffset', () => {
    it('returns 0 for page 1', () => {
      expect(getOffset({ page: 1, limit: 100 })).toBe(0);
    });

    it('returns (page-1)*limit for page > 1', () => {
      expect(getOffset({ page: 2, limit: 50 })).toBe(50);
      expect(getOffset({ page: 3, limit: 100 })).toBe(200);
    });
  });

  describe('createPaginatedResponse', () => {
    it('builds response with hasMore true when more items exist', () => {
      const items = [1, 2, 3];
      const opts: PaginationOptions = { page: 1, limit: 3 };
      const res = createPaginatedResponse(items, 10, opts);
      expect(res.items).toEqual([1, 2, 3]);
      expect(res.page).toBe(1);
      expect(res.limit).toBe(3);
      expect(res.total).toBe(10);
      expect(res.hasMore).toBe(true);
    });

    it('builds response with hasMore false when no more items', () => {
      const items = [1, 2, 3];
      const opts: PaginationOptions = { page: 1, limit: 10 };
      const res = createPaginatedResponse(items, 3, opts);
      expect(res.hasMore).toBe(false);
    });
  });
});
