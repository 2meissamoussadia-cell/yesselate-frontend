/**
 * Client de télémétrie avec queue et batching
 * Phase P14: Télémétrie & Analytics
 * 
 * Collecte les événements de télémétrie et les envoie par batch
 * pour optimiser les performances et réduire le nombre de requêtes
 */

type Item = { 
  event: string; 
  routeKey?: string; 
  props?: Record<string, any> 
};

const QUEUE: Item[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;

// Configuration
const FLUSH_DELAY_MS = 1200; // Batch toutes les ~1.2s
const MAX_BATCH_SIZE = 100;  // Maximum 100 événements par batch
const MAX_QUEUE_SIZE = 500;  // Limite de sécurité pour éviter l'accumulation

/**
 * Ajoute un événement à la queue de télémétrie
 * 
 * @param item - Événement à tracker
 */
export function track(item: Item): void {
  // Limite de sécurité : éviter l'accumulation excessive
  if (QUEUE.length >= MAX_QUEUE_SIZE) {
    console.warn('[Telemetry] Queue pleine, suppression des anciens événements');
    QUEUE.splice(0, QUEUE.length - MAX_QUEUE_SIZE + 1);
  }

  QUEUE.push(item);
  scheduleFlush();
}

/**
 * Planifie l'envoi du batch
 */
function scheduleFlush(): void {
  if (flushTimer) return;
  
  flushTimer = setTimeout(() => {
    flush().catch((err) => {
      console.error('[Telemetry] Erreur lors du flush:', err);
    });
  }, FLUSH_DELAY_MS);
}

/**
 * Envoie les événements en batch vers le serveur
 */
export async function flush(): Promise<void> {
  clearTimeout(flushTimer as ReturnType<typeof setTimeout>);
  flushTimer = null;

  if (!QUEUE.length) return;

  // Extraire un batch (max 100 événements)
  const batch = QUEUE.splice(0, Math.min(QUEUE.length, MAX_BATCH_SIZE)).map((i) => ({
    event: i.event,
    routeKey: i.routeKey,
    at: Date.now(),
    props: i.props,
  }));

  try {
    await fetch('/api/telemetry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      keepalive: true, // Permet l'envoi même si la page se ferme
      body: JSON.stringify({ items: batch }),
    });
  } catch (error) {
    // Best effort : ne pas bloquer l'application en cas d'erreur
    // Les événements non envoyés sont perdus (acceptable pour la télémétrie)
    console.debug('[Telemetry] Échec envoi batch (ignoré):', error);
  }
}

/**
 * Force l'envoi immédiat des événements en attente
 * Utile avant la fermeture de la page ou lors d'événements critiques
 */
export function flushImmediate(): Promise<void> {
  return flush();
}

/**
 * Vide la queue sans envoyer (pour les tests ou le nettoyage)
 */
export function clearQueue(): void {
  QUEUE.length = 0;
  if (flushTimer) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }
}

/**
 * Retourne le nombre d'événements en attente dans la queue
 */
export function getQueueSize(): number {
  return QUEUE.length;
}

// Envoyer les événements restants avant la fermeture de la page
if (typeof window !== 'undefined') {
  // Utiliser sendBeacon si disponible (plus fiable pour les envois avant fermeture)
  window.addEventListener('beforeunload', () => {
    if (QUEUE.length > 0) {
      const batch = QUEUE.splice(0, MAX_BATCH_SIZE).map((i) => ({
        event: i.event,
        routeKey: i.routeKey,
        at: Date.now(),
        props: i.props,
      }));

      // Utiliser sendBeacon pour l'envoi final (plus fiable)
      const blob = new Blob([JSON.stringify({ items: batch })], { type: 'application/json' });
      navigator.sendBeacon('/api/telemetry', blob);
    }
  });

  // Envoyer aussi lors de la visibilité change (page en arrière-plan)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden' && QUEUE.length > 0) {
      flush().catch(() => {
        // Ignorer les erreurs silencieusement
      });
    }
  });
}
