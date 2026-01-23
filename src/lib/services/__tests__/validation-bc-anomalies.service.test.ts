/**
 * Tests unitaires pour validation-bc-anomalies.service
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { validationBCAnomaliesAPI } from '../validation-bc-anomalies.service';
import type { DocumentAnomaly, DocumentAnnotation } from '@/lib/types/document-validation.types';

// Mock fetch global
global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;

describe('validationBCAnomaliesAPI', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAnomalies', () => {
    it('should fetch anomalies for a document', async () => {
      const mockAnomalies: DocumentAnomaly[] = [
        {
          id: '1',
          documentId: 'doc-1',
          field: 'amount',
          type: 'error',
          message: 'Montant incorrect',
          severity: 'high',
          createdAt: new Date().toISOString(),
          resolvedAt: null,
          resolvedBy: null
        }
      ];

      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockAnomalies,
        status: 200,
        statusText: 'OK'
      } as Response);

      const result = await validationBCAnomaliesAPI.getAnomalies('doc-1');

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/validation-bc/documents/doc-1/anomalies',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          })
        })
      );
      expect(result).toEqual(mockAnomalies);
      expect(result.length).toBe(1);
    });

    it('should handle API errors', async () => {
      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        text: async () => 'Document not found'
      });

      await expect(
        validationBCAnomaliesAPI.getAnomalies('invalid-id')
      ).rejects.toThrow('API Error (404)');
    });
  });

  describe('getAnnotations', () => {
    it('should fetch annotations for a document', async () => {
      const mockAnnotations: DocumentAnnotation[] = [
        {
          id: '1',
          documentId: 'doc-1',
          field: 'description',
          comment: 'Vérifier cette description',
          type: 'comment',
          createdBy: 'user-1',
          createdAt: new Date().toISOString()
        }
      ];

      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockAnnotations,
        status: 200,
        statusText: 'OK'
      } as Response);

      const result = await validationBCAnomaliesAPI.getAnnotations('doc-1');

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/validation-bc/documents/doc-1/annotations',
        expect.any(Object)
      );
      expect(result).toEqual(mockAnnotations);
    });
  });

  describe('resolveAnomaly', () => {
    it('should resolve an anomaly', async () => {
      const mockResolvedAnomaly: DocumentAnomaly = {
        id: '1',
        documentId: 'doc-1',
        field: 'amount',
        type: 'error',
        message: 'Montant incorrect',
        severity: 'high',
        createdAt: new Date().toISOString(),
        resolvedAt: new Date().toISOString(),
        resolvedBy: 'user-1'
      };

      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResolvedAnomaly,
        status: 200,
        statusText: 'OK'
      } as Response);

      const result = await validationBCAnomaliesAPI.resolveAnomaly('1', {
        comment: 'Corrigé'
      });

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/validation-bc/anomalies/1/resolve',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ comment: 'Corrigé' })
        })
      );
      expect(result.resolvedAt).toBeDefined();
      expect(result.resolvedBy).toBe('user-1');
    });
  });

  describe('createAnnotation', () => {
    it('should create a new annotation', async () => {
      const mockAnnotation: DocumentAnnotation = {
        id: 'new-1',
        documentId: 'doc-1',
        field: 'description',
        comment: 'Nouvelle annotation',
        type: 'comment',
        createdBy: 'user-1',
        createdAt: new Date().toISOString()
      };

      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockAnnotation,
        status: 200,
        statusText: 'OK'
      } as Response);

      const result = await validationBCAnomaliesAPI.createAnnotation({
        documentId: 'doc-1',
        documentType: 'bc',
        field: 'description',
        comment: 'Nouvelle annotation',
        createdBy: 'user-1',
        type: 'comment'
      });

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/validation-bc/annotations',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('Nouvelle annotation')
        })
      );
      expect(result).toEqual(mockAnnotation);
    });
  });

  describe('updateAnnotation', () => {
    it('should update an existing annotation', async () => {
      const mockUpdatedAnnotation: DocumentAnnotation = {
        id: '1',
        documentId: 'doc-1',
        field: 'description',
        comment: 'Annotation mise à jour',
        type: 'comment',
        createdBy: 'user-1',
        createdAt: new Date().toISOString()
      };

      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockUpdatedAnnotation,
        status: 200,
        statusText: 'OK'
      } as Response);

      const result = await validationBCAnomaliesAPI.updateAnnotation('1', {
        comment: 'Annotation mise à jour'
      });

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/validation-bc/annotations/1',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ comment: 'Annotation mise à jour' })
        })
      );
      expect(result.comment).toBe('Annotation mise à jour');
    });
  });
});

