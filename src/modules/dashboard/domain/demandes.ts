/**
 * Intégration logique métier Demandes (domaine) → Dashboard
 *
 * Utilise le domaine demandes (états, workflows, service) pour calculer
 * les KPIs et libellés affichés dans les vues dashboard.
 */

import type { DemandeStatus } from '@/domain/demandes/types';
import { DemandesService } from '@/domain/demandes/service';
import { DEMANDE_STATE_LABELS } from '@/domain/demandes/workflows';
import type { DemandeState } from '@/domain/demandes/workflows';

/** Données API KPI Demandes (readmodel) */
export interface KpisDemandesDataLike {
  demandes?: Array<{ id: string; type: string; statut: string; priorite: string; date: string; bureau: string }>;
  total: number;
  enAttente: number;
  validees: number;
  rejetees: number;
}

/** Mapping libellés API → statut domaine */
const STATUT_API_TO_DOMAIN: Record<string, DemandeStatus> = {
  'en attente': 'pending',
  'en cours': 'in_progress',
  'validée': 'validated',
  'validee': 'validated',
  'rejetée': 'rejected',
  'rejetee': 'rejected',
  'annulée': 'cancelled',
  'annulee': 'cancelled',
  pending: 'pending',
  in_progress: 'in_progress',
  validated: 'validated',
  rejected: 'rejected',
  cancelled: 'cancelled',
};

/**
 * Normalise le statut API (libellé ou code) vers le statut domaine.
 */
export function mapApiStatutToDomain(statut: string): DemandeStatus {
  const normalized = String(statut).toLowerCase().trim();
  return STATUT_API_TO_DOMAIN[normalized] ?? 'pending';
}

/**
 * Retourne le libellé métier d'un statut (depuis le workflow domaine).
 */
export function getDemandeStateLabel(status: DemandeStatus | DemandeState): string {
  return DEMANDE_STATE_LABELS[status as DemandeState] ?? status;
}

/**
 * Calcule les indicateurs KPIs demandes à partir des données API,
 * en appliquant les règles métier du domaine (taux, répartition).
 */
export function computeDemandesKpisFromApi(data: KpisDemandesDataLike) {
  const total = data.total ?? 0;
  const validees = data.validees ?? 0;
  const rejetees = data.rejetees ?? 0;
  const enAttente = data.enAttente ?? 0;

  const tauxValidation = total > 0 ? Math.round((validees / total) * 100) : 0;
  const tauxRejet = total > 0 ? Math.round((rejetees / total) * 100) : 0;

  return {
    total,
    enAttente,
    validees,
    rejetees,
    tauxValidation,
    tauxRejet,
    /** Libellés domaine pour affichage cohérent */
    stateLabels: DEMANDE_STATE_LABELS,
  };
}

/** Expose le service métier pour usage dans les vues (validation, risques, priorité). */
export { DemandesService };
