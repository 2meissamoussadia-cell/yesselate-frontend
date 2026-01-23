/**
 * Hook pour mesurer les performances de rendu et collecter les Web Vitals
 * Extrait de DashboardContent pour améliorer la maintenabilité
 */

'use client';

import { useState, useLayoutEffect, useRef } from 'react';
import { useLogger } from '@/lib/utils/logger';

interface PerformanceWithMemory extends Performance {
  memory?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
}

interface WebVitals {
  fcp?: number; // First Contentful Paint
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  ttfb?: number; // Time to First Byte
}

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryDelta?: number;
  webVitals?: WebVitals;
}

interface UsePerformanceMetricsOptions {
  componentName?: string;
  route?: string;
  logThreshold?: number; // Seuil en ms pour logger les rendus lents
}

export function usePerformanceMetrics({
  componentName = 'Component',
  route,
  logThreshold = 500,
}: UsePerformanceMetricsOptions = {}) {
  const log = useLogger(componentName);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    renderTime: 0,
  });
  
  const renderStartTimeRef = useRef<number>(0);
  const renderCountRef = useRef<number>(0);

  // Mesure de performance optimisée : utiliser useLayoutEffect pour mesurer le temps de rendu réel
  useLayoutEffect(() => {
    const startTime = performance.now();
    renderCountRef.current += 1;
    
    // Mesurer après que le DOM soit mis à jour
    requestAnimationFrame(() => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Ne mettre à jour que si le temps de rendu est significatif (> 10ms)
      if (renderTime > 10) {
        // Type guard pour performance.memory (Chrome/Edge uniquement)
        const perfMemory = (performance as PerformanceWithMemory).memory;
        const endMemory = perfMemory ? perfMemory.usedJSHeapSize : 0;
        
        setPerformanceMetrics(prev => ({
          ...prev,
          renderTime,
          // Log uniquement si le temps de rendu est significatif (dev mode)
          ...(process.env.NODE_ENV === 'development' && renderTime > 200 && perfMemory && {
            memoryDelta: endMemory - (prev.memoryDelta || 0),
          }),
        }));
        
        // Log de performance en dev uniquement - seuil configurable
        if (process.env.NODE_ENV === 'development' && renderTime > logThreshold) {
          log.warn('Rendu lent détecté', {
            renderTime: `${renderTime.toFixed(2)}ms`,
            route: route || 'unknown',
            component: componentName,
          });
        }
      }
    });
  }, [componentName, route, log, logThreshold]);

  // Fonction pour collecter les Web Vitals
  const collectWebVitals = (): WebVitals => {
    const webVitals: WebVitals = {};
    
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      try {
        // Récupérer les métriques depuis Performance API
        const perfEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
        if (perfEntries.length > 0) {
          const navTiming = perfEntries[0];
          webVitals.ttfb = navTiming.responseStart - navTiming.requestStart;
        }
        
        // Récupérer FCP si disponible
        const paintEntries = performance.getEntriesByType('paint') as PerformancePaintTiming[];
        const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
        if (fcpEntry) {
          webVitals.fcp = fcpEntry.startTime;
        }
      } catch (e) {
        // Ignorer les erreurs de Web Vitals (API non standardisée)
        if (process.env.NODE_ENV === 'development') {
          const errorMessage = e instanceof Error ? e.message : String(e);
          log.debug('Web Vitals non disponibles', { error: errorMessage });
        }
        // En production, ignorer silencieusement (Web Vitals optionnels)
      }
    }
    
    return webVitals;
  };

  // Fonction pour mettre à jour le loadTime et les Web Vitals
  const updateLoadMetrics = (loadTime: number) => {
    const webVitals = collectWebVitals();
    
    setPerformanceMetrics(prev => ({
      ...prev,
      loadTime,
      webVitals: Object.keys(webVitals).length > 0 ? webVitals : prev.webVitals,
    }));
    
    if (process.env.NODE_ENV === 'development') {
      log.performance('Load time', loadTime);
      if (Object.keys(webVitals).length > 0) {
        log.debug('Web Vitals', webVitals);
      }
    }
  };

  return {
    performanceMetrics,
    updateLoadMetrics,
    collectWebVitals,
  };
}
