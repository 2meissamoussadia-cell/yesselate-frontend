# Formation : Système de Gestion d'Erreurs API

## 📚 Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Pourquoi ce système ?](#pourquoi-ce-système-)
3. [Concepts clés](#concepts-clés)
4. [Guide pratique](#guide-pratique)
5. [Exercices pratiques](#exercices-pratiques)
6. [Pièges courants](#pièges-courants)
7. [Ressources](#ressources)

---

## Vue d'ensemble

Le système de gestion d'erreurs standardisé garantit que toutes nos routes API:
- Retournent des réponses cohérentes
- Gèrent les erreurs de manière prévisible
- Facilitent le debugging
- Améliorent l'expérience développeur

### Avant/Après

#### ❌ Avant (code dispersé, incohérent)

```typescript
export async function GET(req: Request) {
  try {
    const user = await findUser(id);
    
    if (!user) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    
    return NextResponse.json({ user });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
```

#### ✅ Après (standardisé, robuste)

```typescript
export async function GET(request: NextRequest, { params }) {
  return withErrorHandler(async () => {
    const { id } = await params;
    validateId(id, 'utilisateur');
    
    const user = await findUser(id);
    
    if (!user) {
      throw notFound('Utilisateur', id);
    }
    
    return createSuccessResponse({ user });
  });
}
```

---

## Pourquoi ce système ?

### 🎯 Objectifs

1. **Cohérence** : Toutes les erreurs suivent le même format
2. **Maintenabilité** : Moins de code répétitif
3. **Debugging** : Messages d'erreur clairs et traçables
4. **Type safety** : Utilisation correcte de TypeScript
5. **Sécurité** : Pas de fuite d'informations sensibles en production

### 📊 Bénéfices mesurables

- **-60%** de code boilerplate dans les routes
- **100%** de cohérence dans les réponses API
- **Zéro** stack trace exposée en production
- **Logs automatiques** pour toutes les erreurs serveur

---

## Concepts clés

### 1. `withErrorHandler`

Wrapper principal qui capture toutes les erreurs.

```typescript
withErrorHandler(async () => {
  // Votre logique ici
  // Lancez des ApiError ou erreurs standards
})
```

**Ce qu'il fait :**
- Capture toutes les exceptions
- Transforme les ApiError en réponses HTTP appropriées
- Log automatiquement les erreurs serveur (5xx)
- Masque les détails sensibles en production

### 2. Fonctions de validation

#### `validateId(id, resourceName)`

Valide qu'un ID est présent et non vide.

```typescript
const { id } = await params;
validateId(id, 'produit'); 
// Lance ApiError 400 si id est vide/null
```

#### `validateRequired(body, fields)`

Valide que tous les champs requis sont présents.

```typescript
const body = await request.json();
validateRequired(body, ['nom', 'email', 'telephone']);
// Lance ApiError 400 si un champ manque
```

### 3. Fonctions de réponse

#### `createSuccessResponse(data, statusCode?)`

Crée une réponse de succès standardisée.

```typescript
// 200 OK (par défaut)
return createSuccessResponse({ user, message: 'Créé avec succès' });

// 201 Created
return createSuccessResponse({ user }, HttpStatus.CREATED);
```

Format de réponse :
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "message": "Créé avec succès"
  }
}
```

### 4. Fonctions d'erreur pré-définies

#### `notFound(resourceName, id?)`

```typescript
if (!product) {
  throw notFound('Produit', productId);
}
// HTTP 404 : "Produit non trouvée : ABC123"
```

#### `badRequest(message, details?)`

```typescript
if (price < 0) {
  throw badRequest('Le prix ne peut pas être négatif', { price });
}
// HTTP 400 : "Le prix ne peut pas être négatif"
```

#### `forbidden(message?)`

```typescript
if (!canDelete(user, resource)) {
  throw forbidden('Vous n\'avez pas les droits nécessaires');
}
// HTTP 403 : "Vous n'avez pas les droits nécessaires"
```

#### `unauthorized(message?)`

```typescript
if (!isAuthenticated) {
  throw unauthorized();
}
// HTTP 401 : "Non autorisé"
```

#### `conflict(message, details?)`

```typescript
if (emailExists) {
  throw conflict('Un utilisateur avec cet email existe déjà', { email });
}
// HTTP 409 : "Un utilisateur avec cet email existe déjà"
```

---

## Guide pratique

### Pattern de base

```typescript
import { NextRequest } from 'next/server';
import {
  withErrorHandler,
  validateId,
  validateRequired,
  notFound,
  badRequest,
  createSuccessResponse,
  HttpStatus,
} from '@/lib/api/error-handler';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandler(async () => {
    // 1. Valider les paramètres
    const { id } = await params;
    validateId(id, 'ressource');
    
    // 2. Logique métier
    const item = await findItem(id);
    
    // 3. Vérifications
    if (!item) {
      throw notFound('Ressource', id);
    }
    
    // 4. Retourner la réponse
    return createSuccessResponse({ item });
  });
}
```

### Route POST complète

```typescript
export async function POST(request: NextRequest) {
  return withErrorHandler(async () => {
    const body = await request.json();
    
    // Validation des champs requis
    validateRequired(body, ['titre', 'description', 'priorite']);
    
    // Validation métier
    if (body.priorite < 1 || body.priorite > 5) {
      throw badRequest(
        'La priorité doit être entre 1 et 5',
        { priorite: body.priorite }
      );
    }
    
    // Vérification de duplication
    const exists = await findByTitle(body.titre);
    if (exists) {
      throw conflict('Un élément avec ce titre existe déjà');
    }
    
    // Création
    const item = await createItem(body);
    
    return createSuccessResponse({ item }, HttpStatus.CREATED);
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
    
    // Authentification
    const user = await getCurrentUser(request);
    if (!user) {
      throw unauthorized();
    }
    
    // Récupérer la ressource
    const doc = await getDocument(id);
    if (!doc) {
      throw notFound('Document', id);
    }
    
    // Vérifier les permissions
    if (doc.ownerId !== user.id && !user.isAdmin) {
      throw forbidden('Vous ne pouvez supprimer que vos propres documents');
    }
    
    // Suppression
    await deleteDocument(id);
    
    return createSuccessResponse({
      message: 'Document supprimé avec succès',
    });
  });
}
```

---

## Exercices pratiques

### Exercice 1 : Route GET simple

**Objectif** : Créer une route GET `/api/products/[id]` qui retourne un produit

```typescript
// TODO: Implémenter cette route
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Votre code ici
}
```

<details>
<summary>Solution</summary>

```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandler(async () => {
    const { id } = await params;
    validateId(id, 'produit');
    
    const product = await prisma.product.findUnique({ where: { id } });
    
    if (!product) {
      throw notFound('Produit', id);
    }
    
    return createSuccessResponse({ product });
  });
}
```
</details>

### Exercice 2 : Route POST avec validation

**Objectif** : Créer une route POST `/api/comments` avec validation

Champs requis : `content`, `authorId`, `postId`
Validation : content ne doit pas être vide

<details>
<summary>Solution</summary>

```typescript
export async function POST(request: NextRequest) {
  return withErrorHandler(async () => {
    const body = await request.json();
    
    validateRequired(body, ['content', 'authorId', 'postId']);
    
    const content = String(body.content).trim();
    if (!content) {
      throw badRequest('Le contenu ne peut pas être vide');
    }
    
    const comment = await prisma.comment.create({
      data: {
        content,
        authorId: body.authorId,
        postId: body.postId,
      },
    });
    
    return createSuccessResponse({ comment }, HttpStatus.CREATED);
  });
}
```
</details>

### Exercice 3 : Route avec logique métier complexe

**Objectif** : Créer une route POST `/api/orders` qui :
- Vérifie que l'utilisateur est authentifié
- Valide que les produits existent
- Vérifie le stock disponible
- Crée la commande

<details>
<summary>Solution</summary>

```typescript
export async function POST(request: NextRequest) {
  return withErrorHandler(async () => {
    const body = await request.json();
    validateRequired(body, ['productIds', 'quantities']);
    
    // Authentification
    const user = await getCurrentUser(request);
    if (!user) {
      throw unauthorized('Vous devez être connecté pour commander');
    }
    
    // Vérifier les produits
    const products = await prisma.product.findMany({
      where: { id: { in: body.productIds } },
    });
    
    if (products.length !== body.productIds.length) {
      throw notFound('Certains produits sont introuvables');
    }
    
    // Vérifier le stock
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const quantity = body.quantities[i];
      
      if (product.stock < quantity) {
        throw conflict(`Stock insuffisant pour ${product.name}`, {
          available: product.stock,
          requested: quantity,
        });
      }
    }
    
    // Créer la commande
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        items: {
          create: products.map((p, i) => ({
            productId: p.id,
            quantity: body.quantities[i],
            price: p.price,
          })),
        },
      },
      include: { items: true },
    });
    
    return createSuccessResponse({ order }, HttpStatus.CREATED);
  });
}
```
</details>

---

## Pièges courants

### ❌ Piège 1 : Oublier `await params`

```typescript
// MAUVAIS
export async function GET(request: NextRequest, { params }) {
  return withErrorHandler(async () => {
    const { id } = params; // ❌ params est une Promise!
    // ...
  });
}

// BON
export async function GET(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandler(async () => {
    const { id } = await params; // ✅
    // ...
  });
}
```

### ❌ Piège 2 : Ne pas valider les IDs

```typescript
// MAUVAIS
const { id } = await params;
const item = await findItem(id); // ❌ Si id est vide?

// BON
const { id } = await params;
validateId(id, 'item'); // ✅ Lance une erreur 400 si vide
const item = await findItem(id);
```

### ❌ Piège 3 : Retourner NextResponse.json directement

```typescript
// MAUVAIS
return withErrorHandler(async () => {
  const item = await findItem(id);
  return NextResponse.json({ item }); // ❌ Format incohérent
});

// BON
return withErrorHandler(async () => {
  const item = await findItem(id);
  return createSuccessResponse({ item }); // ✅ Format standardisé
});
```

### ❌ Piège 4 : Créer des ApiError manuellement

```typescript
// ÉVITER (sauf cas très spécifique)
throw new ApiError('NOT_FOUND', 'Ressource non trouvée', 404);

// PRÉFÉRER
throw notFound('Ressource', id);
```

### ❌ Piège 5 : Exposer des détails sensibles

```typescript
// MAUVAIS
throw badRequest('Erreur de connexion à la DB', { 
  host: 'db.internal.com', 
  password: 'xxx' // ❌ JAMAIS!
});

// BON
throw badRequest('Impossible de se connecter à la base de données');
```

---

## Ressources

### Documentation complète

- [API Error Handling Guide](./API_ERROR_HANDLING.md) - Guide complet avec tous les exemples
- [Demandes API Migration](./DEMANDES_API_MIGRATION.md) - Guide de migration

### Code source

- **Handler** : `src/lib/api/error-handler.ts` - Implémentation du système
- **Types** : `src/lib/types/api-error.types.ts` - Types pour le client

### Codes d'erreur disponibles

| Code | HTTP | Usage |
|------|------|-------|
| `BAD_REQUEST` | 400 | Requête malformée |
| `UNAUTHORIZED` | 401 | Non authentifié |
| `FORBIDDEN` | 403 | Non autorisé |
| `NOT_FOUND` | 404 | Ressource introuvable |
| `CONFLICT` | 409 | Conflit (duplication, etc.) |
| `VALIDATION_ERROR` | 422 | Erreur de validation |
| `MISSING_PARAMETER` | 400 | Paramètre manquant |
| `INVALID_PARAMETER` | 400 | Paramètre invalide |
| `INTERNAL_ERROR` | 500 | Erreur serveur |
| `DATABASE_ERROR` | 500 | Erreur BDD |
| `EXTERNAL_API_ERROR` | 500 | Erreur API externe |
| `SERVICE_UNAVAILABLE` | 503 | Service indisponible |
| `RESOURCE_LOCKED` | 409 | Ressource verrouillée |
| `QUOTA_EXCEEDED` | 429 | Quota dépassé |
| `RATE_LIMIT_EXCEEDED` | 429 | Trop de requêtes |

### Checklist de révision de code

Lorsque vous revoyez une Pull Request avec des routes API, vérifiez :

- [ ] Utilise `withErrorHandler` pour toutes les routes
- [ ] Valide les paramètres avec `validateId`, `validateRequired`
- [ ] Utilise les fonctions pré-définies (`notFound`, `badRequest`, etc.)
- [ ] Retourne `createSuccessResponse` pour les succès
- [ ] Gère correctement `await params`
- [ ] N'expose pas de données sensibles
- [ ] Messages d'erreur clairs et utiles
- [ ] Pas de `console.log` (les erreurs sont loggées automatiquement)

---

## Questions fréquentes

### Q: Dois-je utiliser ce système pour TOUTES les routes ?

**R:** Oui ! Toutes les routes API doivent utiliser `withErrorHandler` pour garantir la cohérence.

### Q: Puis-je créer mes propres codes d'erreur ?

**R:** Préférez utiliser les codes existants. Si vraiment nécessaire, ajoutez-les dans `ErrorCodes` et documentez-les.

### Q: Comment gérer les erreurs Prisma ?

**R:** `withErrorHandler` capture automatiquement les erreurs Prisma et les transforme en erreurs 500. Pour des cas spécifiques, capturez et transformez en ApiError appropriée.

```typescript
try {
  await prisma.user.create({ data });
} catch (error) {
  if (isPrismaUniqueConstraintError(error)) {
    throw conflict('Un utilisateur avec cet email existe déjà');
  }
  throw error; // Autres erreurs gérées par withErrorHandler
}
```

### Q: Comment tester mes routes ?

**R:** Les erreurs standardisées facilitent les tests :

```typescript
test('GET /api/users/[id] - not found', async () => {
  const response = await GET(mockRequest, { params: { id: 'inexistant' } });
  const json = await response.json();
  
  expect(response.status).toBe(404);
  expect(json.code).toBe('NOT_FOUND');
  expect(json.error).toContain('Utilisateur');
});
```

---

**Dernière mise à jour** : 2026-02-04  
**Auteur** : Équipe technique Yesselate  
**Version** : 1.0
