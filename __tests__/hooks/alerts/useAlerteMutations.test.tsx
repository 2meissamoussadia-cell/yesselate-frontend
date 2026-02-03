/**
 * Tests useAlerteMutations — Create, update, delete alertes
 */

import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useCreateAlerte,
  useUpdateAlerte,
  useDeleteAlerte,
} from '@/hooks/alerts/useAlerteMutations';
import { alertsBtpApi } from '@/lib/api/alerts-btp';
import { toast } from 'sonner';

jest.mock('@/lib/api/alerts-btp');
jest.mock('sonner');

describe('useAlerteMutations', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    jest.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  describe('useCreateAlerte', () => {
    it('creates alerte successfully', async () => {
      const mockAlerte = {
        id: '1',
        numero: 'A-2024-0001',
        titre: 'Test alerte',
      };

      (alertsBtpApi.createAlerte as jest.Mock).mockResolvedValue(mockAlerte);

      const { result } = renderHook(() => useCreateAlerte(), { wrapper });

      result.current.mutate({
        titre: 'Test alerte',
        description: 'Description test',
      } as Parameters<typeof result.current.mutate>[0]);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(alertsBtpApi.createAlerte).toHaveBeenCalledWith(
        expect.objectContaining({
          titre: 'Test alerte',
        })
      );

      expect(toast.success).toHaveBeenCalledWith('Alerte créée', {
        description: 'A-2024-0001',
      });
    });

    it('handles creation error', async () => {
      const error = new Error('Erreur création');
      (alertsBtpApi.createAlerte as jest.Mock).mockRejectedValue(error);

      const { result } = renderHook(() => useCreateAlerte(), { wrapper });

      result.current.mutate({ titre: 'Test' } as Parameters<typeof result.current.mutate>[0]);

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(toast.error).toHaveBeenCalledWith('Erreur création', {
        description: 'Erreur création',
      });
    });
  });

  describe('useUpdateAlerte', () => {
    it('updates alerte successfully', async () => {
      const mockUpdated = {
        id: '1',
        titre: 'Titre modifié',
        numero: 'A-2024-0001',
      };

      (alertsBtpApi.updateAlerte as jest.Mock).mockResolvedValue(mockUpdated);

      const { result } = renderHook(() => useUpdateAlerte(), { wrapper });

      result.current.mutate({
        id: '1',
        data: { titre: 'Titre modifié' },
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(alertsBtpApi.updateAlerte).toHaveBeenCalledWith('1', {
        titre: 'Titre modifié',
      });

      expect(toast.success).toHaveBeenCalledWith('Alerte mise à jour');
    });

    it('updates cache on success', async () => {
      const mockUpdated = {
        id: '1',
        titre: 'Titre modifié',
        numero: 'A-2024-0001',
      };

      (alertsBtpApi.updateAlerte as jest.Mock).mockResolvedValue(mockUpdated);

      const { result } = renderHook(() => useUpdateAlerte(), { wrapper });

      result.current.mutate({
        id: '1',
        data: { titre: 'Titre modifié' },
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      const cachedData = queryClient.getQueryData(['alerte-btp', '1']);
      expect(cachedData).toEqual(mockUpdated);
    });
  });

  describe('useDeleteAlerte', () => {
    it('deletes alerte successfully', async () => {
      (alertsBtpApi.deleteAlerte as jest.Mock).mockResolvedValue(undefined);

      const { result } = renderHook(() => useDeleteAlerte(), { wrapper });

      result.current.mutate('1');

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(alertsBtpApi.deleteAlerte).toHaveBeenCalledWith('1');
      expect(toast.success).toHaveBeenCalledWith('Alerte supprimée');
    });

    it('handles delete error', async () => {
      const error = new Error('Erreur suppression');
      (alertsBtpApi.deleteAlerte as jest.Mock).mockRejectedValue(error);

      const { result } = renderHook(() => useDeleteAlerte(), { wrapper });

      result.current.mutate('1');

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(toast.error).toHaveBeenCalledWith('Erreur suppression', {
        description: 'Erreur suppression',
      });
    });
  });
});
