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
import { createLogger } from '../utils/logger.server';
import { verifyJWT, type JWTPayload } from '@lib-root/server/security/jwt';
import { getSessionCookie } from '@lib-root/server/security/cookies';
import { extractContextFromHeaders } from '@lib-root/server/dashboard/context';

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
 * ✅ Phase 7: Implémenté avec JWT, session cookie, et fallback headers
 */
export async function extractSecurityContext(
  req: NextRequest
): Promise<SecurityContext | null> {
  try {
    // Option 1: Depuis un token JWT dans les headers
    const authHeader = req.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const decoded = verifyJWT(token);
        if (decoded) {
          // Extraire les scopes comme permissions
          const permissions = decoded.scopes || [];
          // Extraire tenantId depuis le payload ou depuis les headers
          const tenantId = decoded.tenantId || req.headers.get('x-tenant-id') || 'default';
          
          return {
            userId: decoded.sub,
            tenantId,
            roles: decoded.role ? [decoded.role] : [],
            permissions,
            // Note: bureaux et chantiers peuvent être extraits depuis les scopes
            bureaux: permissions.filter(p => p.startsWith('bureau:')).map(p => p.split(':')[1]),
            chantiers: permissions.filter(p => p.startsWith('chantier:')).map(p => p.split(':')[1]),
          };
        }
      } catch (error) {
        logger.warn('Invalid JWT token', { action: 'extractSecurityContext' });
      }
    }
    
    // Option 2: Depuis une session (cookies)
    const sessionCookie = getSessionCookie(req);
    if (sessionCookie) {
      try {
        // Vérifier le token de session comme un JWT
        const decoded = verifyJWT(sessionCookie.token);
        if (decoded) {
          const permissions = decoded.scopes || [];
          const tenantId = decoded.tenantId || req.headers.get('x-tenant-id') || 'default';
          
          return {
            userId: decoded.sub,
            tenantId,
            roles: decoded.role ? [decoded.role] : [],
            permissions,
            bureaux: permissions.filter(p => p.startsWith('bureau:')).map(p => p.split(':')[1]),
            chantiers: permissions.filter(p => p.startsWith('chantier:')).map(p => p.split(':')[1]),
          };
        }
      } catch (error) {
        logger.warn('Invalid session token', { action: 'extractSecurityContext' });
      }
    }
    
    // Option 3: Fallback depuis les headers (pour compatibilité avec système existant)
    // Utilise extractContextFromHeaders qui lit x-tenant-id, x-user-id, x-roles, x-scopes
    const headerContext = extractContextFromHeaders(req.headers);
    if (headerContext.userId !== 'anonymous' && headerContext.tenantId !== 'default') {
      return {
        userId: headerContext.userId,
        tenantId: headerContext.tenantId,
        roles: headerContext.roles,
        permissions: headerContext.perms || headerContext.permissions || [],
        bureaux: headerContext.scopes.filter(s => s.startsWith('bureau:')).map(s => s.split(':')[1]),
        chantiers: headerContext.scopes.filter(s => s.startsWith('chantier:')).map(s => s.split(':')[1]),
      };
    }
    
    // Si aucune authentification trouvée, retourner null
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
 * Applique le filtrage multi-tenant et ABAC/RLS aux données
 * 
 * ✅ Phase 8: Filtrage complet avec vraies données tenant/user
 * 
 * @param data - Données brutes du read model
 * @param context - Contexte de sécurité avec tenant, bureaux, chantiers
 * @returns Données filtrées selon le tenant, bureaux et chantiers
 */
export function applyTenantFilter<T extends Record<string, unknown>>(
  data: T,
  context: SecurityContext | null
): T {
  if (!context) {
    // Si pas de contexte, retourner des données vides
    return {} as T;
  }
  
  // Helper pour vérifier si un item correspond au contexte de sécurité
  const matchesContext = (item: any): boolean => {
    if (!item || typeof item !== 'object') return true;
    
    // 1. Filtrage par tenantId
    if ('tenantId' in item) {
      if (item.tenantId !== context.tenantId) {
        return false;
      }
    }
    
    // 2. Filtrage par bureaux (si scopes bureau:xxx présents)
    if (context.bureaux && context.bureaux.length > 0) {
      if ('bureauId' in item || 'bureauCode' in item || 'bureau' in item) {
        const itemBureau = item.bureauId || item.bureauCode || item.bureau;
        if (itemBureau && !context.bureaux.includes(String(itemBureau))) {
          return false;
        }
      }
    }
    
    // 3. Filtrage par chantiers (si scopes chantier:xxx présents)
    if (context.chantiers && context.chantiers.length > 0) {
      if ('chantierId' in item || 'chantierCode' in item || 'chantier' in item) {
        const itemChantier = item.chantierId || item.chantierCode || item.chantier;
        if (itemChantier && !context.chantiers.includes(String(itemChantier))) {
          return false;
        }
      }
    }
    
    // 4. Filtrage par userId (si l'item appartient à un utilisateur spécifique)
    // Note: Seulement si l'utilisateur n'est pas admin (admins voient tout)
    if (!context.roles.includes('admin') && 'userId' in item) {
      // Si l'item a un userId et que ce n'est pas l'utilisateur actuel, filtrer
      // (sauf si l'utilisateur a la permission de voir les données d'autres utilisateurs)
      if (item.userId && item.userId !== context.userId) {
        // Vérifier si l'utilisateur a la permission de voir les données d'autres utilisateurs
        const canViewOthers = context.permissions?.some(p => 
          p.includes(':read:others') || p.includes(':view:all') || p.includes('dashboard:read:all')
        );
        if (!canViewOthers) {
          return false;
        }
      }
    }
    
    // 5. Filtrage par permissions spécifiques (si l'item a des champs de permission)
    // Exemple: certains items peuvent nécessiter des permissions spécifiques
    if ('requiredPermission' in item && typeof item.requiredPermission === 'string') {
      const hasRequiredPermission = context.permissions?.some(p => 
        p === item.requiredPermission || p.startsWith(`${item.requiredPermission}:`)
      );
      if (!hasRequiredPermission && !context.roles.includes('admin')) {
        return false;
      }
    }
    
    return true;
  };
  
  if (Array.isArray(data)) {
    // Si c'est un tableau, filtrer chaque élément
    return data.filter(matchesContext) as T;
  }
  
  // Si c'est un objet, vérifier le tenantId et autres filtres
  if (data && typeof data === 'object') {
    if (!matchesContext(data)) {
      // Ne correspond pas au contexte, retourner objet vide
      return {} as T;
    }
  }
  
  // Filtrer récursivement les propriétés qui sont des tableaux ou objets
  const filtered = { ...data } as any;
  for (const [key, value] of Object.entries(filtered)) {
    if (Array.isArray(value)) {
      // Filtrer les tableaux
      filtered[key] = value.filter(matchesContext);
    } else if (value && typeof value === 'object' && !(value instanceof Date)) {
      // Filtrer récursivement les objets imbriqués
      filtered[key] = applyTenantFilter(value as Record<string, unknown>, context);
    }
  }
  
  return filtered;
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
    
    // Enregistrer dans le système d'audit (table authorization_audit si disponible)
    if (process.env.DATABASE_URL) {
      try {
        const { pgPool } = await import('@lib-root/server/db/pool');
        const client = await pgPool.connect();
        try {
          // Convertir tenantId en UUID si nécessaire (le schéma attend UUID)
          // Si tenantId n'est pas un UUID valide, utiliser un UUID par défaut ou ignorer
          const tenantIdValue = context?.tenantId || 'unknown';
          
          await client.query(
            `INSERT INTO authorization_audit (
              tenant_id, user_id, resource, action, route_main, route_sub, route_leaf,
              decision, reason, roles_used, scopes_used, when_at
            ) VALUES (
              COALESCE($1::uuid, (SELECT id FROM tenants LIMIT 1)), 
              $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW()
            )`,
            [
              tenantIdValue, // PostgreSQL tentera de convertir en UUID, ou utilisera le fallback
              context?.userId || 'anonymous',
              'dashboard',
              action,
              nav.main,
              nav.sub || null,
              nav.leaf || null,
              'allowed', // On suppose que si on arrive ici, l'accès est autorisé
              'Access logged',
              context?.roles || [],
              context?.permissions || [],
            ]
          );
        } finally {
          client.release();
        }
      } catch (dbError) {
        // Si l'insertion DB échoue, logger quand même
        logger.warn('Failed to insert audit log to DB, using logger fallback', { action: 'auditAccess' });
        logger.info('Access audit', { action: 'auditAccess', ...auditEntry });
      }
    } else {
      // Pas de DB, utiliser le logger uniquement
      logger.info('Access audit', { action: 'auditAccess', ...auditEntry });
    }
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error('Error logging access', { action: 'auditAccess' }, err);
    // Ne pas faire échouer la requête si l'audit échoue
  }
}
