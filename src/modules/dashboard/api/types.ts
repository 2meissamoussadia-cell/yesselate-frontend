/**
 * Types et contrats pour les Read Models CQRS (Phase 2)
 * 
 * Architecture CQRS : séparation claire entre commandes (write) et queries (read)
 * Les Read Models sont optimisés pour les besoins d'affichage du dashboard
 */

import { z } from 'zod';
import type { NavKey, Main } from '../types/dashboard';
import type {
  OverviewSummaryDashboardData,
  OverviewSummaryPointsData,
  OverviewKpisHighlightsData,
  KpisProjetsData,
  KpisDemandesData,
  KpisBudgetData,
  DashboardViewData,
} from '../types/dashboardDataTypes';

// ============================================================================
// Types de base pour la sécurité et le multi-tenant
// ============================================================================

/**
 * Contexte de sécurité pour ABAC (Attribute-Based Access Control)
 */
export interface SecurityContext {
  userId: string;
  tenantId: string;
  roles: string[];
  bureaux?: string[];
  chantiers?: string[];
  permissions?: string[];
}

/**
 * Métadonnées de requête pour audit et cache
 */
export interface RequestMetadata {
  requestId: string;
  timestamp: number;
  userId?: string;
  tenantId?: string;
  userAgent?: string;
  ipAddress?: string;
}

/**
 * Réponse standardisée de l'API Dashboard
 */
export interface DashboardApiResponse<TData extends DashboardViewData = DashboardViewData> {
  success: boolean;
  data: TData;
  metadata: {
    fetchedAt: number;
    ttl: number;
    cacheKey: string;
    requestId: string;
  };
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

// ============================================================================
// Schémas Zod pour validation des paramètres de route
// ============================================================================

/**
 * Schéma de validation pour les paramètres de route dashboard
 */
export const DashboardRouteParamsSchema = z.object({
  main: z.enum(['overview', 'performance', 'actions', 'risks', 'decisions', 'realtime']),
  sub: z.string().nullable().optional(),
  leaf: z.string().nullable().optional(),
});

export type DashboardRouteParams = z.infer<typeof DashboardRouteParamsSchema>;

/**
 * Schéma de validation pour les query parameters optionnels
 */
export const DashboardQueryParamsSchema = z.object({
  bureauId: z.string().optional(),
  chantierId: z.string().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  refresh: z.enum(['true', 'false']).optional(),
}).optional();

export type DashboardQueryParams = z.infer<typeof DashboardQueryParamsSchema>;

// ============================================================================
// Types pour les Read Models par vue
// ============================================================================

/**
 * Mapping des routes vers leurs types de données correspondants
 * Utilisé pour le typage strict des réponses API
 */
export type DashboardViewDataMap = {
  'overview::summary::dashboard': OverviewSummaryDashboardData;
  'overview::summary::points': OverviewSummaryPointsData;
  'overview::kpis::highlights': OverviewKpisHighlightsData;
  'performance::kpis::projets': KpisProjetsData;
  'performance::kpis::demandes': KpisDemandesData;
  'performance::kpis::budget': KpisBudgetData;
  // Ajouter d'autres mappings au fur et à mesure
};

/**
 * Type helper pour extraire le type de données d'une route
 */
export type ViewDataForRoute<TKey extends keyof DashboardViewDataMap> = DashboardViewDataMap[TKey];

/**
 * Type helper pour obtenir le type de données depuis une NavKey
 */
export type ViewDataForNav<TNav extends NavKey> = TNav extends { main: infer M; sub: infer S; leaf: infer L }
  ? `${M & string}::${S & string}::${L & string}` extends keyof DashboardViewDataMap
    ? DashboardViewDataMap[`${M & string}::${S & string}::${L & string}`]
    : DashboardViewData
  : DashboardViewData;

// ============================================================================
// Types pour les options de requête
// ============================================================================

/**
 * Options pour les requêtes API Dashboard
 */
export interface DashboardApiOptions {
  /**
   * Forcer le rafraîchissement (bypass cache)
   */
  refresh?: boolean;
  
  /**
   * Filtres optionnels
   */
  filters?: {
    bureauId?: string;
    chantierId?: string;
    dateFrom?: string;
    dateTo?: string;
  };
  
  /**
   * Timeout en millisecondes
   */
  timeout?: number;
  
  /**
   * Headers personnalisés
   */
  headers?: Record<string, string>;
}

// ============================================================================
// Types pour les erreurs API
// ============================================================================

/**
 * Codes d'erreur standardisés
 */
export enum DashboardApiErrorCode {
  INVALID_ROUTE = 'INVALID_ROUTE',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  TIMEOUT = 'TIMEOUT',
  NETWORK_ERROR = 'NETWORK_ERROR',
}

/**
 * Erreur API standardisée
 */
export class DashboardApiError extends Error {
  constructor(
    public code: DashboardApiErrorCode,
    message: string,
    public statusCode: number = 500,
    public details?: unknown
  ) {
    super(message);
    this.name = 'DashboardApiError';
  }
}
