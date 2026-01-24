/**
 * Event Utilities
 * Helpers pour gérer les événements
 */

/**
 * Crée un EventEmitter simple
 */
export class EventEmitter {
  private events: Map<string, Set<(...args: unknown[]) => void>> = new Map();

  /**
   * Écoute un événement
   */
  on(event: string, listener: (...args: unknown[]) => void): () => void {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    this.events.get(event)!.add(listener);

    // Retourne une fonction pour se désabonner
    return () => {
      this.off(event, listener);
    };
  }

  /**
   * Écoute un événement une seule fois
   */
  once(event: string, listener: (...args: unknown[]) => void): void {
    const onceWrapper = (...args: any[]) => {
      listener(...args);
      this.off(event, onceWrapper);
    };
    this.on(event, onceWrapper);
  }

  /**
   * Arrête d'écouter un événement
   */
  off(event: string, listener: (...args: unknown[]) => void): void {
    const listeners = this.events.get(event);
    if (listeners) {
      listeners.delete(listener);
      if (listeners.size === 0) {
        this.events.delete(event);
      }
    }
  }

  /**
   * Émet un événement
   */
  emit(event: string, ...args: unknown[]): void {
    const listeners = this.events.get(event);
    if (listeners) {
      listeners.forEach(listener => {
        listener(...args);
      });
    }
  }

  /**
   * Supprime tous les listeners d'un événement
   */
  removeAllListeners(event?: string): void {
    if (event) {
      this.events.delete(event);
    } else {
      this.events.clear();
    }
  }

  /**
   * Obtient le nombre de listeners pour un événement
   */
  listenerCount(event: string): number {
    return this.events.get(event)?.size || 0;
  }
}

/**
 * Crée un EventTarget personnalisé
 */
export class CustomEventTarget extends EventTarget {
  /**
   * Écoute un événement avec options
   */
  on(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void {
    this.addEventListener(type, listener, options);
  }

  /**
   * Arrête d'écouter un événement
   */
  off(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void {
    this.removeEventListener(type, listener, options);
  }

  /**
   * Émet un événement personnalisé
   */
  emit(type: string, detail?: any): void {
    const event = new CustomEvent(type, { detail });
    this.dispatchEvent(event);
  }
}

/**
 * Délègue un événement
 */
export function delegateEvent(
  container: HTMLElement,
  selector: string,
  eventType: string,
  handler: (event: Event, element: HTMLElement) => void
): () => void {
  const eventHandler = (e: Event) => {
    const target = e.target as HTMLElement;
    const element = target.closest(selector) as HTMLElement;
    if (element && container.contains(element)) {
      handler(e, element);
    }
  };

  container.addEventListener(eventType, eventHandler);

  return () => {
    container.removeEventListener(eventType, eventHandler);
  };
}

/**
 * Préviens le comportement par défaut et arrête la propagation
 */
export function stopEvent(event: Event): void {
  event.preventDefault();
  event.stopPropagation();
}

/**
 * Obtient les coordonnées de la souris depuis un événement
 */
export function getMouseCoordinates(event: MouseEvent | TouchEvent): { x: number; y: number } {
  if ('touches' in event && event.touches.length > 0) {
    return {
      x: event.touches[0].clientX,
      y: event.touches[0].clientY,
    };
  }
  if ('clientX' in event) {
    return {
      x: event.clientX,
      y: event.clientY,
    };
  }
  return { x: 0, y: 0 };
}

/**
 * Vérifie si un événement est un clic gauche
 */
export function isLeftClick(event: MouseEvent): boolean {
  return event.button === 0;
}

/**
 * Vérifie si un événement est un clic droit
 */
export function isRightClick(event: MouseEvent): boolean {
  return event.button === 2;
}

/**
 * Vérifie si une touche de modification est pressée
 */
export function hasModifierKey(event: KeyboardEvent | MouseEvent): boolean {
  return event.ctrlKey || event.metaKey || event.shiftKey || event.altKey;
}

/**
 * Obtient le code de la touche depuis un événement clavier
 */
export function getKeyCode(event: KeyboardEvent): string {
  return event.key || event.code;
}

/**
 * Vérifie si une touche spécifique est pressée
 */
export function isKeyPressed(event: KeyboardEvent, key: string): boolean {
  return getKeyCode(event).toLowerCase() === key.toLowerCase();
}

