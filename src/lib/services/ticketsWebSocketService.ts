/**
 * WebSocket Service pour Tickets
 * Service de connexion temps réel pour les mises à jour des tickets clients
 * Architecture identique à Blocked WebSocket
 * 
 * @example
 * ```typescript
 * const ws = getTicketsWebSocket();
 * ws.connect();
 * 
 * const unsubscribe = ws.subscribe('ticket:created', (event) => {
 *   console.log('Nouveau ticket:', event.payload);
 * });
 * 
 * // Cleanup
 * unsubscribe();
 * ws.disconnect();
 * ```
 */

export type WSEventType =
  | 'ticket:created'
  | 'ticket:updated'
  | 'ticket:resolved'
  | 'ticket:escalated'
  | 'ticket:assigned'
  | 'ticket:commented'
  | 'ticket:closed'
  | 'ticket:reopened'
  | 'ticket:message_added'
  | 'ticket:deleted'
  | 'ticket:sla_breached'
  | 'sla:breached'
  | 'sla:warning'
  | 'stats:updated';

export type WSEvent = {
  type: WSEventType;
  payload: Record<string, unknown>;
  timestamp: string;
};

export type WSSubscriber = (event: WSEvent) => void;

type ConnectionEventType = 'connection' | 'error';
type AllEventTypes = WSEventType | ConnectionEventType | '*';

export class TicketsWebSocketService {
  private ws: WebSocket | null = null;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;
  private subscribers = new Map<AllEventTypes, Set<WSSubscriber>>();
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;
  private readonly reconnectDelay = 1000;
  private readonly heartbeatInterval_ms = 30000;
  private isConnecting = false;
  private readonly url: string;

  constructor(url?: string) {
    // Support SSR - vérifier si on est côté client
    if (typeof window === 'undefined') {
      this.url = '';
      return;
    }
    this.url = url || process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001/tickets';
  }

  /**
   * Connecter au WebSocket
   */
  connect(): void {
    // Guard SSR
    if (typeof window === 'undefined' || !this.url) {
      console.warn('[TicketsWS] WebSocket non disponible (SSR ou URL manquante)');
      return;
    }

    if (this.ws?.readyState === WebSocket.OPEN || this.isConnecting) {
      return;
    }

    this.isConnecting = true;

    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        console.log('[TicketsWS] Connecté');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.startHeartbeat();
        this.emit('connection', { status: 'connected' });
      };

      this.ws.onmessage = (event) => {
        try {
          const data: WSEvent = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error('[TicketsWS] Erreur parsing message:', error);
        }
      };

      this.ws.onerror = (event) => {
        // WebSocket error events don't provide detailed error info
        // Log the event type and WebSocket state for debugging
        const errorInfo = {
          type: event.type,
          readyState: this.ws?.readyState,
          url: this.ws?.url,
          timestamp: new Date().toISOString(),
        };
        console.error('[TicketsWS] Erreur:', errorInfo);
        this.emit('error', { error: errorInfo });
      };

      this.ws.onclose = () => {
        console.log('[TicketsWS] Déconnecté');
        this.isConnecting = false;
        this.stopHeartbeat();
        this.emit('connection', { status: 'disconnected' });
        this.scheduleReconnect();
      };
    } catch (error) {
      console.error('[TicketsWS] Erreur connexion:', error);
      this.isConnecting = false;
      this.scheduleReconnect();
    }
  }

  /**
   * Déconnecter proprement
   */
  disconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    this.stopHeartbeat();

    if (this.ws) {
      // Supprimer les event listeners avant de fermer
      this.ws.onopen = null;
      this.ws.onmessage = null;
      this.ws.onerror = null;
      this.ws.onclose = null;
      
      if (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING) {
        this.ws.close(1000, 'Client disconnect');
      }
      this.ws = null;
    }

    this.reconnectAttempts = 0;
    this.isConnecting = false;
  }

  /**
   * S'abonner à un type d'événement
   * @returns Fonction de désabonnement
   */
  subscribe(eventType: AllEventTypes, callback: WSSubscriber): () => void {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, new Set());
    }

    this.subscribers.get(eventType)!.add(callback);

    // Retourner fonction de désabonnement
    return () => {
      this.subscribers.get(eventType)?.delete(callback);
      // Nettoyer si plus d'abonnés
      if (this.subscribers.get(eventType)?.size === 0) {
        this.subscribers.delete(eventType);
      }
    };
  }

  /**
   * Envoyer un message au serveur
   */
  send(type: string, payload: Record<string, unknown> = {}): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify({ type, payload, timestamp: new Date().toISOString() }));
      } catch (error) {
        console.error('[TicketsWS] Erreur lors de l\'envoi:', error);
      }
    } else {
      console.warn('[TicketsWS] WebSocket non connecté, impossible d\'envoyer:', type);
    }
  }

  /**
   * État de connexion
   */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  /**
   * Nombre d'abonnements
   */
  getSubscriptionsCount(): number {
    let count = 0;
    this.subscribers.forEach((subs) => {
      count += subs.size;
    });
    return count;
  }

  // ================================
  // PRIVATE METHODS
  // ================================

  private handleMessage(event: WSEvent): void {
    // Émettre pour les abonnés au type spécifique
    this.emit(event.type, event.payload);

    // Émettre pour les abonnés universels ('*')
    this.emit('*' as any, event.payload);
  }

  private emit(type: AllEventTypes, payload: Record<string, unknown>): void {
    const subscribers = this.subscribers.get(type);
    if (!subscribers || subscribers.size === 0) return;

    const event: WSEvent = {
      type: type as WSEventType,
      payload,
      timestamp: new Date().toISOString(),
    };

    subscribers.forEach((callback) => {
      try {
        callback(event);
      } catch (error) {
        console.error('[TicketsWS] Erreur dans subscriber:', error);
      }
    });
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[TicketsWS] Reconnexion abandonnée après', this.maxReconnectAttempts, 'tentatives');
      return;
    }

    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts);
    console.log('[TicketsWS] Reconnexion dans', delay, 'ms (tentative', this.reconnectAttempts + 1, '/', this.maxReconnectAttempts, ')');

    this.reconnectTimeout = setTimeout(() => {
      this.reconnectAttempts++;
      this.connect();
    }, delay);
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.heartbeatInterval = setInterval(() => {
      this.send('ping', {});
    }, this.heartbeatInterval_ms);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * Stats du WebSocket
   */
  getStats() {
    return {
      connected: this.isConnected(),
      reconnectAttempts: this.reconnectAttempts,
      subscribersCount: this.getSubscriptionsCount(),
      url: this.url,
    };
  }
}

// ================================
// SINGLETON
// ================================

let instance: TicketsWebSocketService | null = null;

export function getTicketsWebSocket(url?: string): TicketsWebSocketService {
  if (!instance) {
    instance = new TicketsWebSocketService(url);
  }
  return instance;
}

export function resetTicketsWebSocket(): void {
  if (instance) {
    instance.disconnect();
    instance = null;
  }
}
