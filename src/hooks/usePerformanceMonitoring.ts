// ============================================
// Hook pour monitorer les performances
// Version simplifiée sans dépendance web-vitals
// ============================================

import { useEffect } from 'react';
import { logger } from '@/lib/utils/logger';

interface WebVitalMetric {
  name: string;
  value: number;
  id: string;
  delta?: number;
  rating?: 'good' | 'needs-improvement' | 'poor';
}

/**
 * Hook pour monitorer les performances d'une page
 * @param pageName - Nom de la page pour l'analytics
 */
export function usePerformanceMonitoring(pageName: string) {
  useEffect(() => {
    // Ne rien faire côté serveur
    if (typeof window === 'undefined') return;

    // Fonction pour envoyer les métriques
    const sendToAnalytics = (metric: WebVitalMetric) => {
      if (process.env.NODE_ENV === 'development') {
        logger.info(`[Perf] ${pageName} - ${metric.name}`, { component: 'usePerformanceMonitoring', pageName, metric: metric.name, value: Math.round(metric.value), rating: metric.rating || '' });
      }

      // Envoyer à Google Analytics si disponible
      if ((window as unknown as { gtag?: (...args: unknown[]) => void }).gtag) {
        (window as unknown as { gtag: (...args: unknown[]) => void }).gtag('event', metric.name, {
          event_category: 'Web Vitals',
          event_label: pageName,
          value: Math.round(metric.value),
          non_interaction: true,
        });
      }
    };

    // Mesurer le temps de rendu initial avec Performance API
    const measureRenderTime = () => {
      if (!window.performance) return;

      try {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigation) {
          const renderTime = navigation.domContentLoadedEventEnd - navigation.fetchStart;
          if (renderTime > 0) {
            sendToAnalytics({
              name: 'RENDER_TIME',
              value: renderTime,
              id: `${pageName}-render`,
              rating: renderTime < 1000 ? 'good' : renderTime < 2500 ? 'needs-improvement' : 'poor',
            });
          }
        }
      } catch {
        // Ignorer les erreurs de performance API
      }
    };

    // Mesurer le temps jusqu'au premier paint
    const measurePaint = () => {
      if (!window.performance) return;

      try {
        const paintEntries = performance.getEntriesByType('paint');
        for (const entry of paintEntries) {
          if (entry.name === 'first-contentful-paint') {
            sendToAnalytics({
              name: 'FCP',
              value: entry.startTime,
              id: `${pageName}-fcp`,
              rating: entry.startTime < 1800 ? 'good' : entry.startTime < 3000 ? 'needs-improvement' : 'poor',
            });
          }
        }
      } catch {
        // Ignorer les erreurs
      }
    };

    // Exécuter les mesures après le premier rendu
    const timeoutId = setTimeout(() => {
      measureRenderTime();
      measurePaint();
    }, 100);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [pageName]);
}
