// lib/server/resilience/circuit.ts
// Phase P13: Circuit Breaker pour protéger contre les cascading failures

/**
 * Circuit Breaker Pattern
 * Phase P13: Résilience & DR
 * 
 * Protège contre les cascading failures en ouvrant le circuit
 * après un seuil d'erreurs, puis le réouvrant progressivement.
 */
type HalfOpen = { since: number };

export class CircuitBreaker {
  private failures = 0;
  private openedAt = 0;
  private halfOpen: HalfOpen | null = null;

  /**
   * @param threshold - Nombre d'erreurs avant d'ouvrir le circuit (défaut: 5)
   * @param resetMs - Délai avant tentative de réouverture (défaut: 30s)
   */
  constructor(
    private readonly threshold = 5,
    private readonly resetMs = 30_000
  ) {}

  /**
   * Vérifie si une requête peut passer
   * @returns true si le circuit est fermé ou en half-open, false si ouvert
   */
  canPass(): boolean {
    const now = Date.now();
    
    // Circuit fermé : tout passe
    if (this.openedAt === 0) {
      return true;
    }
    
    // Circuit ouvert : attendre le reset
    if (now - this.openedAt < this.resetMs) {
      return false;
    }
    
    // Tentative de réouverture (half-open)
    if (!this.halfOpen) {
      this.halfOpen = { since: now };
    }
    
    return true;
  }

  /**
   * Enregistre un succès (réinitialise le circuit)
   */
  success(): void {
    this.failures = 0;
    this.openedAt = 0;
    this.halfOpen = null;
  }

  /**
   * Enregistre un échec (peut ouvrir le circuit)
   */
  failure(): void {
    this.failures++;
    
    // Si en half-open, réouvrir immédiatement
    if (this.halfOpen) {
      this.openedAt = Date.now();
      this.halfOpen = null;
      return;
    }
    
    // Si seuil atteint, ouvrir le circuit
    if (this.failures >= this.threshold) {
      this.openedAt = Date.now();
    }
  }

  /**
   * État actuel du circuit
   */
  getState(): 'closed' | 'open' | 'half-open' {
    if (this.openedAt === 0) return 'closed';
    if (this.halfOpen) return 'half-open';
    return 'open';
  }

  /**
   * Réinitialise le circuit manuellement
   */
  reset(): void {
    this.failures = 0;
    this.openedAt = 0;
    this.halfOpen = null;
  }
}
