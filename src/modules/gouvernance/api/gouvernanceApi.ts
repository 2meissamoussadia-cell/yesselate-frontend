/**
 * Service API pour le module Centre de Commande – Gouvernance
 * Utilise Axios pour les appels API
 * Utilise des données mockées si les endpoints ne sont pas disponibles
 */

import axios from 'axios';
import { createLogger } from '@/modules/dashboard/utils/logger';
import { isNotFoundError as checkNotFound, type ApiError } from '@/lib/types/api-error.types';

const logger = createLogger('GouvernanceApi');
import {
  mockStats,
  mockProjets,
  mockBudgets,
  mockJalons,
  mockRisques,
  mockValidations,
  mockPointsAttention,
  mockDecisions,
  mockArbitrages,
  mockInstances,
  mockIndicateursConformite,
  mockAudits,
  mockEngagements,
  mockTendances,
  mockOverview,
  createPaginatedResponse,
} from './gouvernanceApiMock';
import type {
  GouvernanceFilters,
  GouvernanceStats,
  GouvernanceOverviewResponse,
  GouvernanceSyntheseResponse,
  ProjetGouvernance,
  BudgetGouvernance,
  JalonGouvernance,
  RisqueGouvernance,
  ValidationGouvernance,
  PointAttention,
  DecisionGouvernance,
  ArbitrageGouvernance,
  InstanceGouvernance,
  IndicateurConformite,
  AuditGouvernance,
  EngagementGouvernance,
  TendanceMensuelle,
  PaginatedResponse,
} from '../types/gouvernanceTypes';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/gouvernance`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 secondes
});

// Alias local pour le helper de vérification 404
const isNotFoundError = checkNotFound;

// Helper pour créer une réponse paginée vide
function emptyPaginatedResponse<T>(): PaginatedResponse<T> {
  return {
    data: [],
    total: 0,
    page: 1,
    pageSize: 25,
    totalPages: 0,
  };
}

// Intercepteur pour gérer les erreurs globalement
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error)) {
      // Gérer les erreurs 404 de manière gracieuse
      if (error.response?.status === 404) {
        logger.warn(`Endpoint non trouvé: ${error.config?.url}`);
        // Retourner une structure vide plutôt que de throw
        return Promise.reject({
          ...error,
          isNotFound: true,
          message: `Ressource introuvable: ${error.config?.url}`,
        });
      }
      
      // Gérer les erreurs réseau
      if (!error.response) {
        logger.error('Erreur réseau', { action: 'network' }, error);
        return Promise.reject({
          ...error,
          isNetworkError: true,
          message: 'Erreur de connexion au serveur',
        });
      }
    }
    return Promise.reject(error);
  }
);

// ================================
// Vue d'ensemble et statistiques
// ================================

export async function getGouvernanceOverview(
  params?: Partial<GouvernanceFilters>
): Promise<GouvernanceOverviewResponse> {
  try {
    const response = await apiClient.get<GouvernanceOverviewResponse>('/overview', {
      params,
    });
    return response.data;
  } catch (error) {
    // Retourner des données mockées si 404 (sans logger en production)
    if (error?.isNotFound || error?.response?.status === 404) {
      if (process.env.NODE_ENV === 'development') {
        logger.warn('Endpoint non disponible, fallback données mockées', { action: 'getGouvernanceOverview' });
      }
      return mockOverview;
    }
    
    // Logger uniquement les vraies erreurs en développement
    if (process.env.NODE_ENV === 'development') {
      logger.error('Erreur récupération vue d\'ensemble', { action: 'getGouvernanceOverview' });
    }
    
    // En production, retourner les données mockées pour éviter un écran blanc
    return mockOverview;
  }
}

export async function getGouvernanceStats(
  params?: Partial<GouvernanceFilters>
): Promise<GouvernanceStats> {
  try {
    const response = await apiClient.get<GouvernanceStats>('/stats', {
      params,
    });
    return response.data;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      if (error?.isNotFound || error?.response?.status === 404) {
        logger.warn('Endpoint non disponible, fallback données mockées', { action: 'getGouvernanceStats' });
      } else {
        logger.warn('Erreur, fallback données mockées', { action: 'getGouvernanceStats' });
      }
    }
    // Toujours retourner des données mockées en cas d'erreur (évite indicateurs à 0)
    return mockStats;
  }
}

export async function getTendancesMensuelles(
  params?: Partial<GouvernanceFilters>
): Promise<TendanceMensuelle[]> {
  try {
    const response = await apiClient.get<TendanceMensuelle[]>('/tendances', {
      params,
    });
    return response.data;
  } catch (error) {
    // Retourner des tendances mockées si 404 (sans logger en production)
    if (error?.isNotFound || error?.response?.status === 404) {
      if (process.env.NODE_ENV === 'development') {
        logger.warn('Endpoint non disponible, fallback données mockées', { action: 'getTendancesMensuelles' });
      }
      return mockTendances;
    }
    
    // Logger uniquement les vraies erreurs en développement
    if (process.env.NODE_ENV === 'development') {
      logger.error('Erreur récupération des tendances', { action: 'getTendancesMensuelles' });
    }
    
    // En production, retourner les données mockées pour éviter un écran blanc
    return mockTendances;
  }
}

// ================================
// Synthèses
// ================================

export async function getSyntheseProjets(
  params?: Partial<GouvernanceFilters>
): Promise<PaginatedResponse<ProjetGouvernance>> {
  try {
    const response = await apiClient.get<PaginatedResponse<ProjetGouvernance>>('/synthese/projets', {
      params,
    });
    return response.data;
  } catch (error) {
    logger.error('Erreur récupération synthèse projets', { action: 'getSyntheseProjets' });
    if (isNotFoundError(error)) {
      logger.warn('Endpoint non disponible, fallback données mockées');
      return createPaginatedResponse(mockProjets);
    }
    throw error;
  }
}

export async function getSyntheseBudget(
  params?: Partial<GouvernanceFilters>
): Promise<PaginatedResponse<BudgetGouvernance>> {
  try {
    const response = await apiClient.get<PaginatedResponse<BudgetGouvernance>>('/synthese/budget', {
      params,
    });
    return response.data;
  } catch (error) {
    logger.error('Erreur récupération synthèse budget', { action: 'getSyntheseBudget' });
    if (isNotFoundError(error)) {
      logger.warn('Endpoint non disponible, fallback données mockées');
      return createPaginatedResponse(mockBudgets);
    }
    throw error;
  }
}

export async function getSyntheseJalons(
  params?: Partial<GouvernanceFilters>
): Promise<PaginatedResponse<JalonGouvernance>> {
  try {
    const response = await apiClient.get<PaginatedResponse<JalonGouvernance>>('/synthese/jalons', {
      params,
    });
    return response.data;
  } catch (error) {
    logger.error('Erreur récupération synthèse jalons', { action: 'getSyntheseJalons' });
    if (isNotFoundError(error)) {
      logger.warn('Endpoint non disponible, fallback données mockées');
      return createPaginatedResponse(mockJalons);
    }
    throw error;
  }
}

export async function getSyntheseRisques(
  params?: Partial<GouvernanceFilters>
): Promise<PaginatedResponse<RisqueGouvernance>> {
  try {
    const response = await apiClient.get<PaginatedResponse<RisqueGouvernance>>('/synthese/risques', {
      params,
    });
    return response.data;
  } catch (error) {
    logger.error('Erreur récupération synthèse risques', { action: 'getSyntheseRisques' });
    if (isNotFoundError(error)) {
      logger.warn('Endpoint non disponible, fallback données mockées');
      return createPaginatedResponse(mockRisques);
    }
    throw error;
  }
}

export async function getSyntheseValidations(
  params?: Partial<GouvernanceFilters>
): Promise<PaginatedResponse<ValidationGouvernance>> {
  try {
    const response = await apiClient.get<PaginatedResponse<ValidationGouvernance>>('/synthese/validations', {
      params,
    });
    return response.data;
  } catch (error) {
    logger.error('Erreur récupération synthèse validations', { action: 'getSyntheseValidations' });
    if (isNotFoundError(error)) {
      logger.warn('Endpoint non disponible, fallback données mockées');
      return createPaginatedResponse(mockValidations);
    }
    throw error;
  }
}

// ================================
// Points d'attention
// ================================

export async function getPointsAttention(
  params?: Partial<GouvernanceFilters>
): Promise<PaginatedResponse<PointAttention>> {
  try {
    const response = await apiClient.get<PaginatedResponse<PointAttention>>('/attention', {
      params,
    });
    return response.data;
  } catch (error) {
    logger.error('Erreur récupération points d\'attention', { action: 'getPointsAttention' });
    if (isNotFoundError(error)) {
      logger.warn('Endpoint non disponible, fallback données mockées');
      return createPaginatedResponse(mockPointsAttention);
    }
    throw error;
  }
}

export async function getDepassementsBudget(
  params?: Partial<GouvernanceFilters>
): Promise<PaginatedResponse<BudgetGouvernance>> {
  try {
    const response = await apiClient.get<PaginatedResponse<BudgetGouvernance>>('/attention/depassements-budget', {
      params,
    });
    return response.data;
  } catch (error) {
    logger.error('Erreur récupération dépassements budget', { action: 'getDepassementsBudget' });
    if (isNotFoundError(error)) {
      logger.warn('Endpoint non disponible, fallback données mockées');
      return createPaginatedResponse(mockBudgets);
    }
    throw error;
  }
}

export async function getRetardsCritiques(
  params?: Partial<GouvernanceFilters>
): Promise<PaginatedResponse<JalonGouvernance>> {
  try {
    const response = await apiClient.get<PaginatedResponse<JalonGouvernance>>('/attention/retards-critiques', {
      params,
    });
    return response.data;
  } catch (error) {
    logger.error('Erreur récupération retards critiques', { action: 'getRetardsCritiques' });
    if (isNotFoundError(error)) {
      logger.warn('Endpoint non disponible, fallback données mockées');
      return createPaginatedResponse(mockJalons);
    }
    throw error;
  }
}

export async function getRessourcesIndispo(
  params?: Partial<GouvernanceFilters>
): Promise<PaginatedResponse<PointAttention>> {
  try {
    const response = await apiClient.get<PaginatedResponse<PointAttention>>('/attention/ressources-indispo', {
      params,
    });
    return response.data;
  } catch (error) {
    logger.error('Erreur récupération ressources indisponibles', { action: 'getRessourcesIndispo' });
    if (isNotFoundError(error)) {
      logger.warn('Endpoint non disponible, fallback données mockées');
      return createPaginatedResponse(mockPointsAttention);
    }
    throw error;
  }
}

export async function getEscalades(
  params?: Partial<GouvernanceFilters>
): Promise<PaginatedResponse<PointAttention>> {
  try {
    const response = await apiClient.get<PaginatedResponse<PointAttention>>('/attention/escalades', {
      params,
    });
    return response.data;
  } catch (error) {
    logger.error('Erreur récupération escalades', { action: 'getEscalades' });
    if (isNotFoundError(error)) {
      logger.warn('Endpoint non disponible, fallback données mockées');
      return createPaginatedResponse(mockPointsAttention);
    }
    throw error;
  }
}

// ================================
// Arbitrages et décisions
// ================================

export async function getDecisionsValidees(
  params?: Partial<GouvernanceFilters>
): Promise<PaginatedResponse<DecisionGouvernance>> {
  try {
    const response = await apiClient.get<PaginatedResponse<DecisionGouvernance>>('/arbitrages/decisions-validees', {
      params,
    });
    return response.data;
  } catch (error) {
    logger.error('Erreur récupération décisions validées', { action: 'getDecisionsValidees' });
    if (isNotFoundError(error)) {
      logger.warn('Endpoint non disponible, fallback données mockées');
      return createPaginatedResponse(mockDecisions);
    }
    throw error;
  }
}

export async function getArbitragesEnAttente(
  params?: Partial<GouvernanceFilters>
): Promise<PaginatedResponse<ArbitrageGouvernance>> {
  try {
    const response = await apiClient.get<PaginatedResponse<ArbitrageGouvernance>>('/arbitrages/en-attente', {
      params,
    });
    return response.data;
  } catch (error) {
    logger.error('Erreur récupération arbitrages en attente', { action: 'getArbitragesEnAttente' });
    if (isNotFoundError(error)) {
      logger.warn('Endpoint non disponible, fallback données mockées');
      return createPaginatedResponse(mockArbitrages);
    }
    throw error;
  }
}

export async function getHistoriqueDecisions(
  params?: Partial<GouvernanceFilters>
): Promise<PaginatedResponse<DecisionGouvernance>> {
  try {
    const response = await apiClient.get<PaginatedResponse<DecisionGouvernance>>('/arbitrages/historique', {
      params,
    });
    return response.data;
  } catch (error) {
    logger.error('Erreur récupération historique décisions', { action: 'getHistoriqueDecisions' });
    if (isNotFoundError(error)) {
      logger.warn('Endpoint non disponible, fallback données mockées');
      return createPaginatedResponse(mockDecisions);
    }
    throw error;
  }
}

// ================================
// Instances de coordination
// ================================

export async function getReunionsDG(
  params?: Partial<GouvernanceFilters>
): Promise<PaginatedResponse<InstanceGouvernance>> {
  try {
    const response = await apiClient.get<PaginatedResponse<InstanceGouvernance>>('/instances/reunions-dg', {
      params,
    });
    return response.data;
  } catch (error) {
    logger.error('Erreur récupération réunions DG', { action: 'getReunionsDG' });
    if (isNotFoundError(error)) {
      logger.warn('Endpoint non disponible, fallback données mockées');
      return createPaginatedResponse(mockInstances);
    }
    throw error;
  }
}

export async function getReunionsMOAMOE(
  params?: Partial<GouvernanceFilters>
): Promise<PaginatedResponse<InstanceGouvernance>> {
  try {
    const response = await apiClient.get<PaginatedResponse<InstanceGouvernance>>('/instances/reunions-moa-moe', {
      params,
    });
    return response.data;
  } catch (error) {
    logger.error('Erreur récupération réunions MOA/MOE', { action: 'getReunionsMOAMOE' });
    if (isNotFoundError(error)) {
      logger.warn('Endpoint non disponible, fallback données mockées');
      return createPaginatedResponse(mockInstances);
    }
    throw error;
  }
}

export async function getReunionsTransverses(
  params?: Partial<GouvernanceFilters>
): Promise<PaginatedResponse<InstanceGouvernance>> {
  try {
    const response = await apiClient.get<PaginatedResponse<InstanceGouvernance>>('/instances/reunions-transverses', {
      params,
    });
    return response.data;
  } catch (error) {
    logger.error('Erreur récupération réunions transverses', { action: 'getReunionsTransverses' });
    if (isNotFoundError(error)) {
      logger.warn('Endpoint non disponible, fallback données mockées');
      return createPaginatedResponse(mockInstances);
    }
    throw error;
  }
}

// ================================
// Conformité et performance
// ================================

export async function getIndicateursConformite(
  params?: Partial<GouvernanceFilters>
): Promise<PaginatedResponse<IndicateurConformite>> {
  try {
    const response = await apiClient.get<PaginatedResponse<IndicateurConformite>>('/conformite/indicateurs', {
      params,
    });
    return response.data;
  } catch (error) {
    logger.error('Erreur récupération indicateurs conformité', { action: 'getIndicateursConformite' });
    if (isNotFoundError(error)) {
      logger.warn('Endpoint non disponible, fallback données mockées');
      return createPaginatedResponse(mockIndicateursConformite);
    }
    throw error;
  }
}

export async function getAuditGouvernance(
  params?: Partial<GouvernanceFilters>
): Promise<PaginatedResponse<AuditGouvernance>> {
  try {
    const response = await apiClient.get<PaginatedResponse<AuditGouvernance>>('/conformite/audit', {
      params,
    });
    return response.data;
  } catch (error) {
    logger.error('Erreur récupération audits', { action: 'getAuditGouvernance' });
    if (isNotFoundError(error)) {
      logger.warn('Endpoint non disponible, fallback données mockées');
      return createPaginatedResponse(mockAudits);
    }
    throw error;
  }
}

export async function getSuiviEngagements(
  params?: Partial<GouvernanceFilters>
): Promise<PaginatedResponse<EngagementGouvernance>> {
  try {
    const response = await apiClient.get<PaginatedResponse<EngagementGouvernance>>('/conformite/engagements', {
      params,
    });
    return response.data;
  } catch (error) {
    logger.error('Erreur récupération suivi engagements', { action: 'getSuiviEngagements' });
    if (isNotFoundError(error)) {
      logger.warn('Endpoint non disponible, fallback données mockées');
      return createPaginatedResponse(mockEngagements);
    }
    throw error;
  }
}

