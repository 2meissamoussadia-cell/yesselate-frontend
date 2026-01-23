/**
 * Règles métier pour les escalades de gouvernance
 */

import type { Projet, Jalon, Risque } from '../types/gouvernance.types';
import { isProjetAtRisk, isProjetLate } from '../types/projet.types';
import { isJalonOverdue, isJalonSLARisque } from '../types/jalon.types';
import { isRisqueCritical } from '../types/risque.types';

export class EscaladeRules {
  /**
   * Vérifie si un projet nécessite une escalade
   */
  static requiresEscalation(projet: Projet): boolean {
    return isProjetLate(projet) || isProjetAtRisk(projet);
  }

  /**
   * Détermine le niveau d'escalade requis pour un projet
   */
  static getEscalationLevel(projet: Projet): 1 | 2 | 3 {
    if (projet.statut === 'late' && (projet.retard_jours || 0) > 30) return 3;
    if (projet.statut === 'late' || projet.statut === 'blocked') return 2;
    if (isProjetAtRisk(projet)) return 1;
    return 1;
  }

  /**
   * Vérifie si un jalon nécessite une escalade
   */
  static requiresJalonEscalation(jalon: Jalon): boolean {
    return isJalonOverdue(jalon) || isJalonSLARisque(jalon);
  }

  /**
   * Détermine le niveau d'escalade requis pour un jalon
   */
  static getJalonEscalationLevel(jalon: Jalon): 1 | 2 | 3 {
    if (isJalonOverdue(jalon) && jalon.type === 'SLA') return 3;
    if (isJalonOverdue(jalon)) return 2;
    if (isJalonSLARisque(jalon)) return 1;
    return 1;
  }

  /**
   * Vérifie si un risque nécessite une escalade
   */
  static requiresRisqueEscalation(risque: Risque): boolean {
    return isRisqueCritical(risque);
  }

  /**
   * Détermine le niveau d'escalade requis pour un risque
   */
  static getRisqueEscalationLevel(risque: Risque): 1 | 2 | 3 {
    if (risque.severite === 'critical' && risque.score >= 90) return 3;
    if (risque.severite === 'critical') return 2;
    if (risque.severite === 'high') return 1;
    return 1;
  }
}
