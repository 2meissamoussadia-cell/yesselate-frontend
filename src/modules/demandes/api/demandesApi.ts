/**
 * API layer pour le module Demandes
 */

import axios from 'axios';
import type { Demande, DemandeStats, DemandeFilters, DemandeTrend, ServiceStats } from '../types/demandesTypes';

const API_BASE_URL = '/api/demandes';

/**
 * Récupère toutes les demandes avec filtres optionnels
 */
export async function getDemandes(filters?: DemandeFilters): Promise<Demande[]> {
  try {
    const response = await axios.get<Demande[]>(API_BASE_URL, { params: filters });
    return response.data;
  } catch (error) {
    // Fallback sur mock data si API non disponible
    if (process.env.NODE_ENV === 'development' || !process.env.NEXT_PUBLIC_API_URL) {
      const { mockDemandes, getDemandesByStatus, getDemandesByService } = await import('../data/demandesMock');
      let filtered = [...mockDemandes];

      if (filters?.status && filters.status.length > 0) {
        filtered = filtered.filter((d) => filters.status!.includes(d.status));
      }
      if (filters?.service && filters.service.length > 0) {
        filtered = filtered.filter((d) => filters.service!.includes(d.service));
      }
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        filtered = filtered.filter(
          (d) =>
            d.title.toLowerCase().includes(searchLower) ||
            d.reference.toLowerCase().includes(searchLower) ||
            d.description?.toLowerCase().includes(searchLower)
        );
      }

      return filtered;
    }
    throw error;
  }
}

/**
 * Récupère une demande par ID
 */
export async function getDemandeById(id: string): Promise<Demande> {
  const response = await axios.get<Demande>(`${API_BASE_URL}/${id}`);
  return response.data;
}

/**
 * Récupère les statistiques globales
 */
export async function getDemandesStats(): Promise<DemandeStats> {
  try {
    const response = await axios.get<DemandeStats>(`${API_BASE_URL}/stats`);
    return response.data;
  } catch (error: any) {
    // Retourner des données mockées si 404 (sans logger en production)
    if (error?.response?.status === 404 || !error?.response) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[getDemandesStats] Endpoint non disponible, utilisation de données mockées');
      }
      const { mockStats } = await import('../data/demandesMock');
      return mockStats;
    }
    
    // Logger uniquement les vraies erreurs en développement
    if (process.env.NODE_ENV === 'development') {
      console.error('[getDemandesStats] Erreur lors de la récupération des statistiques:', error);
    }
    
    // En production, retourner les données mockées pour éviter un écran blanc
    const { mockStats } = await import('../data/demandesMock');
    return mockStats;
  }
}

/**
 * Récupère les tendances sur une période
 */
export async function getDemandesTrends(days: number = 30): Promise<DemandeTrend[]> {
  try {
    const response = await axios.get<DemandeTrend[]>(`${API_BASE_URL}/trends`, {
      params: { days },
    });
    return response.data;
  } catch (error) {
    // Fallback sur mock data si API non disponible
    if (process.env.NODE_ENV === 'development' || !process.env.NEXT_PUBLIC_API_URL) {
      const { mockTrends } = await import('../data/demandesMock');
      return mockTrends.slice(-days);
    }
    throw error;
  }
}

/**
 * Récupère les statistiques par service
 */
export async function getServiceStats(): Promise<ServiceStats[]> {
  try {
    const response = await axios.get<ServiceStats[]>(`${API_BASE_URL}/services/stats`);
    return response.data;
  } catch (error) {
    // Fallback sur mock data si API non disponible
    if (process.env.NODE_ENV === 'development' || !process.env.NEXT_PUBLIC_API_URL) {
      const { mockServiceStats } = await import('../data/demandesMock');
      return mockServiceStats;
    }
    throw error;
  }
}

/**
 * Récupère les demandes par statut
 */
export async function getDemandesByStatus(status: string): Promise<Demande[]> {
  try {
    const response = await axios.get<Demande[]>(`${API_BASE_URL}/status/${status}`);
    return response.data;
  } catch (error) {
    // Fallback sur mock data si API non disponible
    if (process.env.NODE_ENV === 'development' || !process.env.NEXT_PUBLIC_API_URL) {
      const { getDemandesByStatus: getByStatus } = await import('../data/demandesMock');
      return getByStatus(status);
    }
    throw error;
  }
}

/**
 * Récupère les demandes par service
 */
export async function getDemandesByService(service: string): Promise<Demande[]> {
  try {
    const response = await axios.get<Demande[]>(`${API_BASE_URL}/services/${service}`);
    return response.data;
  } catch (error) {
    // Fallback sur mock data si API non disponible
    if (process.env.NODE_ENV === 'development' || !process.env.NEXT_PUBLIC_API_URL) {
      const { getDemandesByService: getByService } = await import('../data/demandesMock');
      return getByService(service);
    }
    throw error;
  }
}

/**
 * Crée une nouvelle demande
 */
export async function createDemande(data: {
  title: string;
  description?: string;
  service: Demande['service'];
  montant?: number;
}): Promise<Demande> {
  try {
    const response = await axios.post<Demande>(API_BASE_URL, {
      ...data,
      status: 'pending',
      priority: 'normal',
      createdBy: 'current-user',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return response.data;
  } catch (error) {
    if (process.env.NODE_ENV === 'development' || !process.env.NEXT_PUBLIC_API_URL) {
      const { mockDemandes } = await import('../data/demandesMock');
      const newDemande: Demande = {
        id: `d-${Date.now()}`,
        reference: `DEM-${String(mockDemandes.length + 1).padStart(4, '0')}`,
        title: data.title,
        description: data.description,
        status: 'pending',
        priority: 'normal',
        service: data.service,
        montant: data.montant,
        createdBy: 'current-user',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      return newDemande;
    }
    throw error;
  }
}

/**
 * Valide une demande
 */
export async function validateDemande(id: string, note?: string): Promise<Demande> {
  const response = await axios.post<Demande>(`${API_BASE_URL}/${id}/validate`, { note });
  return response.data;
}

/**
 * Rejette une demande
 */
export async function rejectDemande(id: string, reason: string): Promise<Demande> {
  try {
    const response = await axios.post<Demande>(`${API_BASE_URL}/${id}/reject`, { reason });
    return response.data;
  } catch (error) {
    // Fallback sur mock data si API non disponible
    if (process.env.NODE_ENV === 'development' || !process.env.NEXT_PUBLIC_API_URL) {
      const { mockDemandes } = await import('../data/demandesMock');
      const demande = mockDemandes.find((d) => d.id === id);
      if (demande) {
        return { ...demande, status: 'rejected' as const };
      }
    }
    throw error;
  }
}

/**
 * Demande un complément pour une demande
 */
export async function requestComplementDemande(id: string, message: string): Promise<Demande> {
  try {
    const response = await axios.post<Demande>(`${API_BASE_URL}/${id}/request-complement`, { message });
    return response.data;
  } catch (error) {
    // Fallback sur mock data si API non disponible
    if (process.env.NODE_ENV === 'development' || !process.env.NEXT_PUBLIC_API_URL) {
      const { mockDemandes } = await import('../data/demandesMock');
      const demande = mockDemandes.find((d) => d.id === id);
      if (demande) {
        return demande; // Status reste inchangé pour demande de complément
      }
    }
    throw error;
  }
}

/**
 * Valide plusieurs demandes en masse
 */
export async function batchValidateDemandes(ids: string[], comment?: string): Promise<Demande[]> {
  try {
    const response = await axios.post<Demande[]>(`${API_BASE_URL}/batch/validate`, { ids, comment });
    return response.data;
  } catch (error) {
    // Fallback sur mock data si API non disponible
    if (process.env.NODE_ENV === 'development' || !process.env.NEXT_PUBLIC_API_URL) {
      const { mockDemandes } = await import('../data/demandesMock');
      return mockDemandes
        .filter((d) => ids.includes(d.id))
        .map((d) => ({ ...d, status: 'validated' as const }));
    }
    throw error;
  }
}

/**
 * Rejette plusieurs demandes en masse
 */
export async function batchRejectDemandes(ids: string[], reason?: string): Promise<Demande[]> {
  try {
    const response = await axios.post<Demande[]>(`${API_BASE_URL}/batch/reject`, { ids, reason });
    return response.data;
  } catch (error) {
    // Fallback sur mock data si API non disponible
    if (process.env.NODE_ENV === 'development' || !process.env.NEXT_PUBLIC_API_URL) {
      const { mockDemandes } = await import('../data/demandesMock');
      return mockDemandes
        .filter((d) => ids.includes(d.id))
        .map((d) => ({ ...d, status: 'rejected' as const }));
    }
    throw error;
  }
}

/**
 * Exporte les demandes
 */
export async function exportDemandes(filters?: DemandeFilters, format: 'xlsx' | 'csv' = 'xlsx'): Promise<Blob> {
  try {
    const response = await axios.get(`${API_BASE_URL}/export`, {
      params: { ...filters, format },
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    // Fallback : créer un blob JSON en développement
    if (process.env.NODE_ENV === 'development' || !process.env.NEXT_PUBLIC_API_URL) {
      const { mockDemandes } = await import('../data/demandesMock');
      let filtered = [...mockDemandes];
      
      if (filters?.status && filters.status.length > 0) {
        filtered = filtered.filter((d) => filters.status!.includes(d.status));
      }
      if (filters?.service && filters.service.length > 0) {
        filtered = filtered.filter((d) => filters.service!.includes(d.service));
      }
      
      if (format === 'json') {
        return new Blob([JSON.stringify(filtered, null, 2)], { type: 'application/json' });
      }
    }
    throw error;
  }
}

// ============================================
// WRAPPER DE COMPATIBILITÉ /api/demands
// ============================================

/**
 * @deprecated Utiliser getDemandes() à la place
 * Wrapper de compatibilité pour l'ancien système /api/demands
 */
export async function listDemands(queue?: string, search?: string): Promise<Demande[]> {
  const filters: DemandeFilters = {};
  
  if (queue && queue !== 'all') {
    // Mapper les anciens noms de queue vers les nouveaux statuts
    const queueToStatus: Record<string, Demande['status']> = {
      'pending': 'pending',
      'urgent': 'pending', // filtrer par priorité ensuite
      'overdue': 'pending', // filtrer par date ensuite
      'validated': 'validated',
      'rejected': 'rejected',
    };
    
    if (queueToStatus[queue]) {
      filters.status = [queueToStatus[queue]];
    }
  }
  
  if (search) {
    filters.search = search;
  }
  
  return getDemandes(filters);
}

/**
 * @deprecated Utiliser getDemandeById() à la place
 */
export async function getDemand(id: string): Promise<{ demand: Demande; item?: Demande }> {
  const demande = await getDemandeById(id);
  return { demand: demande, item: demande };
}

/**
 * @deprecated Utiliser validateDemande(), rejectDemande() à la place
 */
export async function transitionDemand(
  id: string,
  payload: { action: string; details?: string; message?: string }
): Promise<Demande> {
  switch (payload.action) {
    case 'validate':
      return validateDemande(id, payload.details);
    case 'reject':
      return rejectDemande(id, payload.message || payload.details || 'Rejeté');
    case 'request_complement':
      return requestComplementDemande(id, payload.message || 'Complément requis');
    default:
      throw new Error(`Action inconnue: ${payload.action}`);
  }
}

/**
 * @deprecated Utiliser batchValidateDemandes(), batchRejectDemandes() à la place
 */
export async function batchTransition(
  ids: string[],
  payload: { action: string; details?: string; message?: string }
): Promise<{ updated: string[]; skipped: Array<{ id: string; reason: string }> }> {
  try {
    let result: Demande[];
    
    switch (payload.action) {
      case 'validate':
        result = await batchValidateDemandes(ids, payload.details);
        break;
      case 'reject':
        result = await batchRejectDemandes(ids, payload.message || payload.details);
        break;
      default:
        throw new Error(`Action inconnue: ${payload.action}`);
    }
    
    return {
      updated: result.map(d => d.id),
      skipped: [],
    };
  } catch (error) {
    return {
      updated: [],
      skipped: ids.map(id => ({ id, reason: 'Erreur lors du traitement' })),
    };
  }
}
