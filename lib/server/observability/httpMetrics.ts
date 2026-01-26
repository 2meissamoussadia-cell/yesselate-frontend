/**
 * Métriques HTTP simplifiées avec prom-client
 * Phase P4: Observabilité & Robustesse
 * 
 * Ré-export depuis l'endpoint metrics
 * Le middleware utilise cette fonction pour observer les durées HTTP
 */

// Ré-exporter depuis l'endpoint metrics
export { observeHttp } from '@/app/api/internal/metrics/route';
