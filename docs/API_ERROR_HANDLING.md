# Gestion d'erreurs API - Guide du développeur

## Vue d'ensemble

Toutes les routes API doivent utiliser le système de gestion d'erreurs standardisé pour garantir la cohérence et faciliter le debugging.

## Import

```typescript
import {
  withErrorHandler,
  createSuccessResponse,
  validateId,
  validateRequired,
  notFound,
  badRequest,
  forbidden,
  unauthorized,
  conflict,
  rateLimitExceeded,
  ApiError,
  ErrorCodes,
  HttpStatus,
} from '@/lib/api/error-handler';
```

## Pattern de base

### Route simple avec gestion d'erreurs

```typescript
import { NextRequest } from 'next/server';
import {
  withErrorHandler,
  validateId,
  notFound,
  createSuccessResponse,
} from '@/lib/api/error-handler';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandler(async () => {
    const { id } = await params;
    validateId(id, 'ressource');

    // Logique métier
    const item = await findItemById(id);
    
    if (!item) {
      throw notFound('Ressource', id);
    }

    return createSuccessResponse({ item });
  });
}
```

## Fonctions utilitaires

### `withErrorHandler(handler)`

Wrapper qui capture automatiquement les erreurs et retourne une réponse standardisée.

```typescript
return withErrorHandler(async () => {
  // Votre code ici
  // Lancez ApiError ou une erreur standard
  throw notFound('Alerte', id);
});
```

### `createSuccessResponse(data, statusCode?)`

Crée une réponse de succès standardisée.

```typescript
// 200 OK par défaut
return createSuccessResponse({ user, message: 'Utilisateur créé' });

// 201 Created
return createSuccessResponse({ user }, HttpStatus.CREATED);
```

### Validation

#### `validateId(id, resourceName)`

Valide qu'un ID est présent et non vide.

```typescript
const { id } = await params;
validateId(id, 'demande'); // Lance ApiError si invalide
```

#### `validateRequired(params, requiredFields)`

Valide que tous les champs requis sont présents.

```typescript
const body = await request.json();
validateRequired(body, ['title', 'description', 'priority']);
```

### Erreurs pré-définies

#### `notFound(resourceName, id?)`

Retourne une erreur 404.

```typescript
if (!user) {
  throw notFound('Utilisateur', userId);
}
// Réponse : 404 { error: "Utilisateur non trouvée : 123", code: "NOT_FOUND" }
```

#### `badRequest(message, details?)`

Retourne une erreur 400.

```typescript
if (montant < 0) {
  throw badRequest('Le montant ne peut pas être négatif', { montant });
}
```

#### `forbidden(message?)`

Retourne une erreur 403.

```typescript
if (!hasPermission(user, 'delete')) {
  throw forbidden('Vous n\'avez pas les droits pour supprimer cette ressource');
}
```

#### `unauthorized(message?)`

Retourne une erreur 401.

```typescript
if (!isAuthenticated) {
  throw unauthorized('Authentification requise');
}
```

#### `conflict(message, details?)`

Retourne une erreur 409.

```typescript
if (emailExists) {
  throw conflict('Un utilisateur avec cet email existe déjà', { email });
}
```

#### `rateLimitExceeded(retryAfter?)`

Retourne une erreur 429.

```typescript
if (tooManyRequests) {
  throw rateLimitExceeded(60); // Retry après 60 secondes
}
```

## ApiError personnalisée

Pour des cas spécifiques :

```typescript
import { ApiError, ErrorCodes, HttpStatus } from '@/lib/api/error-handler';

throw new ApiError(
  ErrorCodes.VALIDATION_ERROR,
  'Données invalides',
  HttpStatus.UNPROCESSABLE_ENTITY,
  { fields: ['email', 'password'] }
);
```

## Format de réponse standardisé

### Succès

```json
{
  "success": true,
  "data": {
    "user": { ... },
    "message": "Opération réussie"
  }
}
```

### Erreur

```json
{
  "error": "Ressource non trouvée",
  "code": "NOT_FOUND",
  "timestamp": "2026-02-04T12:34:56.789Z"
}
```

En développement, les détails supplémentaires sont inclus :

```json
{
  "error": "Erreur serveur",
  "code": "INTERNAL_ERROR",
  "timestamp": "2026-02-04T12:34:56.789Z",
  "details": {
    "stack": "Error: ...\n  at ..."
  }
}
```

## Codes d'erreur disponibles

### Erreurs client (4xx)

- `BAD_REQUEST` — Requête malformée
- `UNAUTHORIZED` — Non authentifié
- `FORBIDDEN` — Non autorisé
- `NOT_FOUND` — Ressource introuvable
- `CONFLICT` — Conflit (ex: duplication)
- `VALIDATION_ERROR` — Erreur de validation
- `MISSING_PARAMETER` — Paramètre manquant
- `INVALID_PARAMETER` — Paramètre invalide

### Erreurs serveur (5xx)

- `INTERNAL_ERROR` — Erreur serveur générique
- `DATABASE_ERROR` — Erreur base de données
- `EXTERNAL_API_ERROR` — Erreur API externe
- `SERVICE_UNAVAILABLE` — Service indisponible

### Erreurs métier

- `RESOURCE_LOCKED` — Ressource verrouillée
- `QUOTA_EXCEEDED` — Quota dépassé
- `RATE_LIMIT_EXCEEDED` — Trop de requêtes

## Codes HTTP disponibles

```typescript
HttpStatus.OK                    // 200
HttpStatus.CREATED               // 201
HttpStatus.NO_CONTENT            // 204
HttpStatus.BAD_REQUEST           // 400
HttpStatus.UNAUTHORIZED          // 401
HttpStatus.FORBIDDEN             // 403
HttpStatus.NOT_FOUND             // 404
HttpStatus.CONFLICT              // 409
HttpStatus.UNPROCESSABLE_ENTITY  // 422
HttpStatus.TOO_MANY_REQUESTS     // 429
HttpStatus.INTERNAL_SERVER_ERROR // 500
HttpStatus.SERVICE_UNAVAILABLE   // 503
```

## Exemples complets

### Route GET avec validation

```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandler(async () => {
    const { id } = await params;
    validateId(id, 'alerte');

    const alert = await getAlertById(id);
    
    if (!alert) {
      throw notFound('Alerte', id);
    }

    return createSuccessResponse({ alert });
  });
}
```

### Route POST avec validation de champs

```typescript
export async function POST(request: NextRequest) {
  return withErrorHandler(async () => {
    const body = await request.json();
    
    // Valider les champs requis
    validateRequired(body, ['title', 'description', 'priority']);
    
    // Validation métier
    if (body.priority < 1 || body.priority > 5) {
      throw badRequest('La priorité doit être entre 1 et 5', { priority: body.priority });
    }
    
    // Créer la ressource
    const alert = await createAlert(body);
    
    return createSuccessResponse({ alert }, HttpStatus.CREATED);
  });
}
```

### Route PATCH avec gestion de conflit

```typescript
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandler(async () => {
    const { id } = await params;
    validateId(id, 'demande');
    
    const body = await request.json();
    
    const demande = await getDemandeById(id);
    if (!demande) {
      throw notFound('Demande', id);
    }
    
    // Vérifier si la ressource est verrouillée
    if (demande.locked) {
      throw conflict('Cette demande est en cours de modification par un autre utilisateur', {
        lockedBy: demande.lockedBy,
        lockedAt: demande.lockedAt,
      });
    }
    
    const updated = await updateDemande(id, body);
    
    return createSuccessResponse({
      demande: updated,
      message: 'Demande mise à jour avec succès',
    });
  });
}
```

### Route avec permissions

```typescript
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandler(async () => {
    const { id } = await params;
    validateId(id, 'document');
    
    // Vérifier l'authentification
    const user = await getCurrentUser(request);
    if (!user) {
      throw unauthorized();
    }
    
    // Vérifier les permissions
    const document = await getDocumentById(id);
    if (!document) {
      throw notFound('Document', id);
    }
    
    if (document.ownerId !== user.id && !user.isAdmin) {
      throw forbidden('Vous n\'avez pas les droits pour supprimer ce document');
    }
    
    await deleteDocument(id);
    
    return createSuccessResponse({
      message: 'Document supprimé avec succès',
    });
  });
}
```

## Migration des routes existantes

### Avant (ancien pattern)

```typescript
export async function GET(request: NextRequest, { params }) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 });
    }
    
    const item = await findItem(id);
    
    if (!item) {
      return NextResponse.json({ error: 'Non trouvé' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, item });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
```

### Après (nouveau pattern)

```typescript
import {
  withErrorHandler,
  validateId,
  notFound,
  createSuccessResponse,
} from '@/lib/api/error-handler';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandler(async () => {
    const { id } = await params;
    validateId(id, 'item');
    
    const item = await findItem(id);
    
    if (!item) {
      throw notFound('Item', id);
    }
    
    return createSuccessResponse({ item });
  });
}
```

## Bonnes pratiques

1. **Toujours utiliser `withErrorHandler`** pour capturer les erreurs
2. **Valider les paramètres en début de route** avec `validateId`, `validateRequired`
3. **Utiliser les fonctions pré-définies** (`notFound`, `badRequest`, etc.) plutôt que créer des `ApiError` manuellement
4. **Inclure des détails pertinents** en mode développement uniquement
5. **Logger les erreurs 500+** automatiquement (géré par `createErrorResponse`)
6. **Retourner des messages clairs** pour aider le debugging côté client
7. **Ne jamais exposer les détails sensibles** (stack traces, mots de passe, etc.) en production

## Logging

Le système de gestion d'erreurs log automatiquement :

- **Erreurs serveur (5xx)** : `console.error` avec détails complets
- **Erreurs client (4xx)** : `console.warn` en développement uniquement

---

Date de création : 2026-02-04
Dernière mise à jour : 2026-02-04
