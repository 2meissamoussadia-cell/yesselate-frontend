/**
 * Service de Données Analytics BTP
 * Gère le chargement, la transformation et le cache des données analytics
 */

import type { DataSourceConfig } from '@/lib/config/analyticsDisplayLogic';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface AnalyticsDataResponse<T = any> {
  data: T;
  timestamp: number;
  cached?: boolean;
}

export interface KPIData {
  id: string;
  value: number;
  target?: number;
  unit?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  status?: 'good' | 'warning' | 'critical';
}

export interface AlertData {
  id: string;
  type: 'critical' | 'warning' | 'info' | 'opportunity';
  category: string;
  title: string;
  description: string;
  detectedAt: string;
  impact?: {
    estimated: string;
    elements: string[];
    costs?: number;
    delays?: number;
  };
  causes?: Array<{
    id: string;
    description: string;
    type: 'root' | 'contributing';
  }>;
  recommendations?: Array<{
    id: string;
    title: string;
    description: string;
    impact: string;
    cost?: number;
    duration?: string;
    responsible?: string;
  }>;
}

export interface TrendData {
  date: string;
  value: number;
  value_prev?: number;
  [key: string]: any;
}

// ═══════════════════════════════════════════════════════════════════════════
// SERVICE
// ═══════════════════════════════════════════════════════════════════════════

class AnalyticsDataService {
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();

  /**
   * Charge les données depuis une source de données
   */
  async loadData<T = any>(
    dataSource: DataSourceConfig,
    options?: {
      useCache?: boolean;
      forceRefresh?: boolean;
    }
  ): Promise<AnalyticsDataResponse<T>> {
    const cacheKey = this.getCacheKey(dataSource);
    const useCache = options?.useCache !== false;
    const forceRefresh = options?.forceRefresh === true;

    // Vérifier le cache
    if (useCache && !forceRefresh) {
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < cached.ttl) {
        return {
          data: cached.data,
          timestamp: cached.timestamp,
          cached: true,
        };
      }
    }

    try {
      // Construire l'URL
      const endpoint = dataSource.endpoint ?? '/api/analytics';
      const url = new URL(endpoint, window.location.origin);
      
      // Ajouter les paramètres
      if (dataSource.params) {
        Object.entries(dataSource.params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            url.searchParams.append(key, String(value));
          }
        });
      }

      // En mode développement, utiliser les données mockées si disponibles
      if (process.env.NODE_ENV === 'development') {
        const { mockApiResponse } = await import('@/lib/mocks/analyticsMockData');
        const mockData = mockApiResponse(endpoint);
        
        if (mockData !== null) {
          const timestamp = Date.now();
          const cacheOpts = dataSource.cache as { ttl?: number } | undefined;
          const ttl = cacheOpts?.ttl ?? 300000;
          
          if (useCache) {
            this.cache.set(cacheKey, { data: mockData, timestamp, ttl });
          }
          
          return {
            data: mockData,
            timestamp,
            cached: false,
          };
        }
      }

      // Faire la requête réelle
      const response = await fetch(url.toString(), {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch ${dataSource.endpoint}: ${response.statusText}`);
      }

      const data = await response.json();
      const timestamp = Date.now();
      const cacheOpts = dataSource.cache as { ttl?: number } | undefined;
      const ttl = cacheOpts?.ttl ?? 300000;

      // Mettre en cache
      if (useCache) {
        this.cache.set(cacheKey, { data, timestamp, ttl });
      }

      return {
        data,
        timestamp,
        cached: false,
      };
    } catch (error) {
      console.error(`Error loading data from ${dataSource.endpoint}:`, error);
      
      // Retourner les données en cache même si expirées en cas d'erreur
      const cached = this.cache.get(cacheKey);
      if (cached) {
        return {
          data: cached.data,
          timestamp: cached.timestamp,
          cached: true,
        };
      }

      throw error;
    }
  }

  /**
   * Charge plusieurs sources de données en parallèle
   */
  async loadMultipleData<T extends Record<string, any>>(
    dataSources: Record<keyof T, DataSourceConfig>,
    options?: {
      useCache?: boolean;
      forceRefresh?: boolean;
    }
  ): Promise<Record<keyof T, AnalyticsDataResponse>> {
    const promises = Object.entries(dataSources).map(async ([key, config]) => {
      const result = await this.loadData(config, options);
      return [key, result] as const;
    });

    const results = await Promise.all(promises);
    return Object.fromEntries(results) as Record<keyof T, AnalyticsDataResponse>;
  }

  /**
   * Invalide le cache pour une source de données
   */
  invalidateCache(dataSource: DataSourceConfig): void {
    const cacheKey = this.getCacheKey(dataSource);
    this.cache.delete(cacheKey);
  }

  /**
   * Invalide tout le cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Préchage les données
   */
  async prefetchData(dataSource: DataSourceConfig): Promise<void> {
    try {
      await this.loadData(dataSource, { useCache: true, forceRefresh: false });
    } catch (error) {
      console.warn(`Failed to prefetch ${dataSource.endpoint}:`, error);
    }
  }

  /**
   * Génère une clé de cache
   */
  private getCacheKey(dataSource: DataSourceConfig): string {
    const paramsKey = dataSource.params
      ? JSON.stringify(dataSource.params)
      : '';
    const cacheOpts = dataSource.cache as { key?: string } | undefined;
    return `${cacheOpts?.key ?? dataSource.id}-${paramsKey}`;
  }

  /**
   * Transforme les données brutes en format attendu
   */
  transformKPIData(rawData: any, kpiId: string): KPIData {
    return {
      id: kpiId,
      value: rawData.value || 0,
      target: rawData.target,
      unit: rawData.unit,
      trend: rawData.trend
        ? {
            value: rawData.trend.value || 0,
            isPositive: rawData.trend.isPositive ?? true,
          }
        : undefined,
      status: rawData.status || 'good',
    };
  }

  /**
   * Transforme les données d'alerte
   */
  transformAlertData(rawData: any): AlertData {
    return {
      id: rawData.id,
      type: rawData.type || 'info',
      category: rawData.category || 'general',
      title: rawData.title || 'Alerte',
      description: rawData.description || '',
      detectedAt: rawData.detectedAt || new Date().toISOString(),
      impact: rawData.impact,
      causes: rawData.causes,
      recommendations: rawData.recommendations,
    };
  }

  /**
   * Transforme les données de tendance
   */
  transformTrendData(rawData: any[]): TrendData[] {
    return rawData.map((item) => ({
      date: item.date || item.name || '',
      value: item.value || 0,
      value_prev: item.value_prev || item.previous || undefined,
      ...item,
    }));
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// INSTANCE SINGLETON
// ═══════════════════════════════════════════════════════════════════════════

export const analyticsDataService = new AnalyticsDataService();

