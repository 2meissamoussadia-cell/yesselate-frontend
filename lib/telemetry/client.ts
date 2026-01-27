// lib/telemetry/client.ts
// Phase P14: Observabilité produit - Client front avec queue + batch

/**
 * Client de télémetrie avec queue et batch automatique
 * Phase P14: Observabilité produit
 * 
 * Fonctionnalités :
 * - Queue en mémoire
 * - Batch automatique toutes les ~1.2s
 * - Envoi par batch de max 100 événements
 * - Best effort (ne bloque pas l'UI)
 * - Respect du consentement RGPD
 */

type Item = {
  event: string;
  routeKey?: string;
  props?: Record<string, any>;
};

const QUEUE: Item[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;
const BATCH_SIZE = 100;
const FLUSH_INTERVAL_MS = 1200; // ~1.2s

/**
 * Vérifie si la télémetrie est autorisée (consentement)
 * Phase P14: Observabilité produit - RGPD
 */
function isTelemetryAllowed(): boolean {
  if (typeof document === 'undefined') return false;

  const cookies = document.cookie.split(';');
  const consentCookie = cookies.find((c) => c.trim().startsWith('telemetry_consent='));

  if (!consentCookie) return false; // Pas de consentement = pas de tracking

  const value = consentCookie.split('=')[1]?.trim();
  return value === 'on';
}

/**
 * Enregistre un événement de télémetrie
 * Phase P14: Observabilité produit
 * 
 * @param item - Événement à tracker
 */
export function track(item: Item): void {
  // Phase P14: RGPD - Vérifier le consentement avant de tracker
  if (!isTelemetryAllowed()) {
    return; // Pas de tracking sans consentement
  }

  QUEUE.push(item);
  scheduleFlush();
}

/**
 * Planifie un flush automatique
 */
function scheduleFlush(): void {
  if (flushTimer) return;
  flushTimer = setTimeout(flush, FLUSH_INTERVAL_MS);
}

/**
 * Force l'envoi immédiat de la queue
 * Phase P14: Observabilité produit
 */
export async function flush(): Promise<void> {
  if (flushTimer) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }
  
  if (!QUEUE.length) return;
  
  // Extraire un batch (max BATCH_SIZE)
  const batch = QUEUE.splice(0, Math.min(QUEUE.length, BATCH_SIZE)).map((i) => ({
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
    // Best effort : ne pas bloquer l'UI en cas d'erreur
    console.warn('[Telemetry] Failed to send batch', error);
  }
}

/**
 * Flush automatique avant déchargement de la page
 */
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    // Flush synchrone si possible (navigator.sendBeacon serait mieux mais nécessite un endpoint dédié)
    if (QUEUE.length > 0) {
      // Utiliser sendBeacon pour un envoi fiable même si la page se ferme
      const batch = QUEUE.splice(0, Math.min(QUEUE.length, BATCH_SIZE)).map((i) => ({
        event: i.event,
        routeKey: i.routeKey,
        at: Date.now(),
        props: i.props,
      }));
      
      const blob = new Blob([JSON.stringify({ items: batch })], { type: 'application/json' });
      navigator.sendBeacon('/api/telemetry', blob);
    }
  });
}
