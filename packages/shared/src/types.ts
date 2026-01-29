/**
 * Shared domain types (Chantier, Client, User, etc.)
 * Used by api and cockpit-dg
 */

export type UserRole = 'DG' | 'DAF' | 'ASSOCIE' | 'ADMIN' | 'USER';

export type ClientSegment =
  | 'DIASPORA'
  | 'COMMERCANTS'
  | 'COMMERCE_INFORMEL'
  | 'ETABLISSEMENTS'
  | 'PARTICULIERS';

export type ChantierStatut = 'ACTIF' | 'TERMINE' | 'BLOQUE' | 'ARCHIVE';

export type PaiementMode = 'ORANGE_MONEY' | 'WAVE' | 'VIREMENT' | 'CHEQUE' | 'CASH';

export interface ApiHealth {
  status: 'ok' | 'degraded' | 'error';
  timestamp: string;
  version?: string;
}
