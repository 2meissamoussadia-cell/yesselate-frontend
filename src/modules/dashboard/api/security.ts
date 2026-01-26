/**
 * Sécurité ABAC et Multi-tenant pour le Dashboard v20
 * 
 * Implémente :
 * - Extraction du contexte de sécurité (user, tenant, rôles, permissions)
 * - Vérification des permissions ABAC
 * - Filtrage multi-tenant (row-level security)
 * - Audit logging
 * Utilise le système de logging unifié
 */

import { NextRequest } from 'next/server';
import type { SecurityContext, NavKey } from './types';
import { createLogger } from '../utils/logger';

const logger = createLogger('Security');

// ============================================================================
// Types pour les permissions
// ============================================================================

/**
 * Permission requise pour accéder à une vue
 */
export interface RequiredPermission {
  role?: string | string[];
  tenant?: string | string[];
  bureau?: string | string[];
  chantier?: string | string[];
  custom?: (context: SecurityContext) => boolean;
}

/**
 * Résultat d'une vérification de permission
 */
export interface PermissionCheckResult {
  allowed: boolean;
  reason?: string;
}

// ============================================================================
// Extraction du contexte de sécurité
// ============================================================================

/**
 * Extrait le contexte de sécurité depuis la requête
 * 
 * TODO: Adapter selon votre système d'authentification (JWT, session, etc.)
 */
export async function extractSecurityContext(
  req: NextRequest
): Promise<SecurityContext | null> {
  try {
    // Option 1: Depuis un token JWT dans les headers
    const authHeader = req.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      // TODO: Décoder et valider le JWT
      // const decoded = await verifyJWT(token);
      // return {
      //   userId: decoded.userId,
      //   tenantId: decoded.tenantId,
      //   roles: decoded.roles,
      //   bureaux: decoded.bureaux,
      //   chantiers: decoded.chantiers,
      //   permissions: decoded.permissions,
      // };
    }
    
    // Option 2: Depuis une session (cookies)
    const sessionId = req.cookies.get('session_id')?.value;
    if (sessionId) {
      // TODO: Récupérer la session depuis votre store (Redis, DB, etc.)
      // const session = await getSession(sessionId);
      // return {
      //   userId: session.userId,
      //   tenantId: session.tenantId,
      //   roles: session.roles,
      //   bureaux: session.bureaux,
      //   chantiers: session.chantiers,
      //   permissions: session.permissions,
      // };
    }
    
    // Option 3: Depuis localStorage côté client (pour développement)
    // En production, cela devrait être géré côté serveur
    
    // Pour l'instant, retourner null (pas d'authentification)
    return null;
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error('Error extracting security context', { action: 'extractSecurityContext' }, err);
    return null;
  }
}

// ============================================================================
// Vérification des permissions ABAC
// ============================================================================

/**
 * Vérifie si le contexte de sécurité a les permissions requises
 */
export function checkPermission(
  context: SecurityContext | null,
  required: RequiredPermission
): PermissionCheckResult {
  // Si pas de contexte, refuser (sauf si explicitement autorisé)
  if (!context) {
    return {
      allowed: false,
      reason: 'No security context (not authenticated)',
    };
  }
  
  // Vérifier le rôle
  if (required.role) {
    const requiredRoles = Array.isArray(required.role) ? required.role : [required.role];
    const hasRole = requiredRoles.some((role) => context.roles.includes(role));
    if (!hasRole) {
      return {
        allowed: false,
        reason: `Missing required role: ${requiredRoles.join(', ')}`,
      };
    }
  }
  
  // Vérifier le tenant
  if (required.tenant) {
    const requiredTenants = Array.isArray(required.tenant) ? required.tenant : [required.tenant];
    if (!requiredTenants.includes(context.tenantId)) {
      return {
        allowed: false,
        reason: `Tenant mismatch: required ${requiredTenants.join(', ')}, got ${context.tenantId}`,
      };
    }
  }
  
  // Vérifier le bureau
  if (required.bureau && context.bureaux) {
    const requiredBureaux = Array.isArray(required.bureau) ? required.bureau : [required.bureau];
    const hasBureau = requiredBureaux.some((bureau) => context.bureaux?.includes(bureau));
    if (!hasBureau) {
      return {
        allowed: false,
        reason: `Missing required bureau: ${requiredBureaux.join(', ')}`,
      };
    }
  }
  
  // Vérifier le chantier
  if (required.chantier && context.chantiers) {
    const requiredChantiers = Array.isArray(required.chantier) ? required.chantier : [required.chantier];
    const hasChantier = requiredChantiers.some((chantier) => context.chantiers?.includes(chantier));
    if (!hasChantier) {
      return {
        allowed: false,
        reason: `Missing required chantier: ${requiredChantiers.join(', ')}`,
      };
    }
  }
  
  // Vérification personnalisée
  if (required.custom) {
    if (!required.custom(context)) {
      return {
        allowed: false,
        reason: 'Custom permission check failed',
      };
    }
  }
  
  return { allowed: true };
}

/**
 * Vérifie l'accès à une vue du dashboard
 */
export function checkViewAccess(
  context: SecurityContext | null,
  nav: NavKey
): PermissionCheckResult {
  // Règles de sécurité par route
  const securityRules: Record<string, RequiredPermission> = {
    // Overview: accessible à tous les utilisateurs authentifiés
    'overview::summary::dashboard': {
      role: ['admin', 'manager', 'user'],
    },
    
    // Performance: nécessite au moins le rôle "user"
    'performance::kpis::projets': {
      role: ['admin', 'manager', 'user'],
    },
    
    // Actions: nécessite au moins le rôle "manager"
    'actions::': {
      role: ['admin', 'manager'],
    },
    
    // Risks: nécessite au moins le rôle "manager"
    'risks::': {
      role: ['admin', 'manager'],
    },
    
    // Decisions: nécessite le rôle "admin" ou "manager"
    'decisions::': {
      role: ['admin', 'manager'],
    },
    
    // Realtime: nécessite le rôle "admin"
    'realtime::': {
      role: ['admin'],
    },
  };
  
  // Trouver la règle la plus spécifique (leaf > sub > main)
  const key = `${nav.main}::${nav.sub || ''}::${nav.leaf || ''}`;
  const subKey = `${nav.main}::${nav.sub || ''}::`;
  const mainKey = `${nav.main}::`;
  
  const rule = securityRules[key] || securityRules[subKey] || securityRules[mainKey];
  
  if (!rule) {
    // Par défaut, autoriser si authentifié
    return {
      allowed: context !== null,
      reason: context === null ? 'Not authenticated' : undefined,
    };
  }
  
  return checkPermission(context, rule);
}

// ============================================================================
// Filtrage multi-tenant (Row-Level Security)
// ============================================================================

/**
 * Applique le filtrage multi-tenant aux données
 * 
 * @param data - Données brutes du read model
 * @param context - Contexte de sécurité
 * @returns Données filtrées selon le tenant
 */
export function applyTenantFilter<T extends Record<string, unknown>>(
  data: T,
  context: SecurityContext | null
): T {
  if (!context) {
    // Si pas de contexte, retourner des données vides
    return {} as T;
  }
  
  // TODO: Implémenter le filtrage selon votre modèle de données
  // Exemple:
  // if (Array.isArray(data)) {
  //   return data.filter((item) => item.tenantId === context.tenantId) as T;
  // }
  // if (data.tenantId && data.tenantId !== context.tenantId) {
  //   return {} as T;
  // }
  
  // Pour l'instant, retourner les données telles quelles
  return data;
}

// ============================================================================
// Audit logging
// ============================================================================

/**
 * Log un accès pour l'audit (conformité BTP/RGPD)
 */
export async function logAccess(
  context: SecurityContext | null,
  nav: NavKey,
  action: 'read' | 'write' | 'delete' = 'read',
  metadata?: Record<string, unknown>
): Promise<void> {
  try {
    // TODO: Enregistrer dans votre système d'audit (DB, log aggregator, etc.)
    const auditEntry = {
      timestamp: new Date().toISOString(),
      userId: context?.userId || 'anonymous',
      tenantId: context?.tenantId || 'unknown',
      route: `${nav.main}/${nav.sub || ''}/${nav.leaf || ''}`,
      action,
      metadata: {
        ...metadata,
        roles: context?.roles || [],
        bureaux: context?.bureaux || [],
        chantiers: context?.chantiers || [],
      },
    };
    
    // Exemple: await auditLogger.log(auditEntry);
    logger.info('Access audit', { action: 'auditAccess', ...auditEntry });
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error('Error logging access', { action: 'auditAccess' }, err);
    // Ne pas faire échouer la requête si l'audit échoue
  }
}
