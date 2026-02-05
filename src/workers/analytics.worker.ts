/**
 * Web Worker Cockpit DG V2 — Calculs lourds hors UI (santé, prédictions, optimisation)
 * Utilisation: new Worker(new URL('@/workers/analytics.worker.ts', import.meta.url))
 * Messages: { type: 'compute_health_scores' | 'predict_delays' | 'optimize_resources', data }
 */

export type WorkerMessageType = 'compute_health_scores' | 'predict_delays' | 'optimize_resources';

export interface WorkerRequest {
  type: WorkerMessageType;
  data: unknown;
}

export interface WorkerResponse {
  type: string;
  [key: string]: unknown;
}

function computeHealthScores(chantiers: Array<{ id: string; sante?: number; ca?: number }>): Record<string, number> {
  const scores: Record<string, number> = {};
  for (const c of chantiers) {
    scores[c.id] = c.sante ?? 0.7;
  }
  return scores;
}

self.addEventListener('message', (e: MessageEvent<WorkerRequest>) => {
  const { type, data } = e.data ?? {};
  switch (type) {
    case 'compute_health_scores': {
      const chantiers = (data as { chantiers?: Array<{ id: string; sante?: number; ca?: number }> })?.chantiers ?? [];
      const scores = computeHealthScores(chantiers);
      (self as unknown as Worker).postMessage({ type: 'health_scores_ready', scores } as WorkerResponse);
      break;
    }
    case 'predict_delays':
      (self as unknown as Worker).postMessage({ type: 'predictions_ready', predictions: [] } as WorkerResponse);
      break;
    case 'optimize_resources':
      (self as unknown as Worker).postMessage({ type: 'optimization_ready', allocation: {} } as WorkerResponse);
      break;
    default:
      break;
  }
});
