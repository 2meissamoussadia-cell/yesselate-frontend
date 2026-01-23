/**
 * Tests unitaires pour rhApiService
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { demandesAPI, agentsAPI } from '../rhApiService';

// Mock fetch global
global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;

describe('rhApiService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('demandesAPI', () => {
    describe('getAll', () => {
      it('should fetch all demandes without filters', async () => {
        const mockResponse = {
          success: true,
          data: [{ id: '1', type: 'conge' }],
          total: 1,
        };

        (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse,
          status: 200,
          statusText: 'OK',
        } as Response);

        const result = await demandesAPI.getAll();

        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/rh/demandes'),
          undefined
        );
        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();
      });

      it('should apply filters when provided', async () => {
        const mockResponse = {
          success: true,
          data: [],
          total: 0,
        };

        (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse,
          status: 200,
          statusText: 'OK',
        } as Response);

        const result = await demandesAPI.getAll({
          status: 'pending',
          bureau: 'BMO',
        });

        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('status=pending'),
          undefined
        );
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('bureau=BMO'),
          undefined
        );
        expect(result.success).toBe(true);
      });
    });

    describe('getById', () => {
      it('should fetch demande by id', async () => {
        const mockResponse = {
          success: true,
          data: { id: '1', type: 'conge' },
        };

        (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse,
          status: 200,
          statusText: 'OK',
        } as Response);

        const result = await demandesAPI.getById('1');

        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/rh/demandes?id=1'),
          undefined
        );
        expect(result.success).toBe(true);
        expect(result.data?.id).toBe('1');
      });
    });

    describe('create', () => {
      it('should create a new demande', async () => {
        const mockResponse = {
          success: true,
          data: { id: 'new-1', type: 'conge' },
        };

        (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse,
          status: 200,
          statusText: 'OK',
        } as Response);

        const demandeData = {
          type: 'conge',
          employeeId: 'EMP-007',
          dateDebut: '2025-02-01',
          dateFin: '2025-02-05',
        };

        const result = await demandesAPI.create(demandeData);

        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/rh/demandes'),
          expect.objectContaining({
            method: 'POST',
            headers: expect.objectContaining({
              'Content-Type': 'application/json',
            }),
            body: JSON.stringify(demandeData),
          })
        );
        expect(result.success).toBe(true);
      });
    });

    describe('validate', () => {
      it('should validate a demande', async () => {
        const mockResponse = {
          success: true,
          data: { id: '1', status: 'validated' },
        };

        (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse,
          status: 200,
          statusText: 'OK',
        } as Response);

        const result = await demandesAPI.validate('1', 'validator-1', 'Validé');

        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/rh/demandes'),
          expect.objectContaining({
            method: 'PUT',
          })
        );
        expect(result.success).toBe(true);
      });
    });
  });

  describe('agentsAPI', () => {
    describe('getAll', () => {
      it('should fetch all agents', async () => {
        const mockResponse = {
          success: true,
          data: [{ id: 'EMP-007', name: 'Test Agent' }],
        };

        (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse,
          status: 200,
          statusText: 'OK',
        } as Response);

        const result = await agentsAPI.getAll();

        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/rh/agents'),
          undefined
        );
        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();
      });
    });
  });
});

