# Phase P12 - Négociation de Locale Côté Serveur

## 🎯 Objectif

Résoudre le contexte i18n (locale, currency, timezone, direction) depuis les préférences tenant → utilisateur → navigateur.

**Règle** : On formate au front (Intl), on garde des valeurs brutes dans l'API (pas de nombres déjà "stringifiés").

---

## ✅ Implémentation

### 1. Résolution de Locale

**Fichier** : `lib/server/i18n/locale.server.ts`

**Fonction** : `resolveLocaleContext(headers, tenantId, userId?)`

Hiérarchie de résolution :
1. **Préférence utilisateur** (`user_prefs`) - si définie
2. **Accept-Language header** - si pas de préférence utilisateur
3. **Préférence tenant** (`tenant_settings`) - fallback
4. **Valeurs par défaut système** - `fr-FR`, `EUR`, `Europe/Paris`

**Retourne** : `LocaleBundle` avec :
- `locale` : Code locale (ex: 'fr-FR', 'en-GB', 'ar-MA')
- `currency` : Code devise ISO 4217 (ex: 'EUR', 'XOF', 'USD')
- `timezone` : Fuseau horaire IANA (ex: 'Europe/Paris', 'Africa/Casablanca')
- `direction` : Direction du texte ('ltr' ou 'rtl')

### 2. Conversion Multi-devise

**Fonctions** :
- `getExchangeRate(baseCurrency, quoteCurrency)` : Récupère le taux de change
- `convertCurrency(amount, fromCurrency, toCurrency)` : Convertit un montant

**Règle** : `value_in_quote = value_in_base * rate` (taux le plus récent)

---

## 📊 Utilisation

### Dans une Route API

```typescript
import { resolveLocaleContext } from '@/lib/server/i18n';
import { extractContextFromHeaders } from '@/lib/server/dashboard/context';

export async function GET(req: NextRequest) {
  const baseCtx = extractContextFromHeaders(req.headers);
  
  // Phase P12: Résoudre le contexte i18n
  const localeBundle = await resolveLocaleContext(
    req.headers,
    baseCtx.tenantId,
    baseCtx.userId
  );
  
  // localeBundle contient: { locale, currency, timezone, direction }
  // À injecter dans les headers de réponse ou le contexte
  
  // Exemple: Injecter dans les headers
  const headers = new Headers();
  headers.set('X-Locale', localeBundle.locale);
  headers.set('X-Currency', localeBundle.currency);
  headers.set('X-Timezone', localeBundle.timezone);
  headers.set('X-Direction', localeBundle.direction);
  
  return NextResponse.json(data, { headers });
}
```

### Conversion de Devise

```typescript
import { convertCurrency } from '@/lib/server/i18n';

// Convertir 1000 EUR en XOF
const amountInXOF = await convertCurrency(1000, 'EUR', 'XOF');
// Retourne: 656000 (si taux = 656)

// Si conversion impossible, retourne null
if (amountInXOF === null) {
  // Gérer l'erreur
}
```

---

## 🔧 Intégration dans le Contexte

### Option 1 : Injecter dans les Headers de Réponse

```typescript
const localeBundle = await resolveLocaleContext(req.headers, tenantId, userId);
const headers = new Headers();
headers.set('X-Locale', localeBundle.locale);
headers.set('X-Currency', localeBundle.currency);
headers.set('X-Timezone', localeBundle.timezone);
headers.set('X-Direction', localeBundle.direction);
return NextResponse.json(data, { headers });
```

### Option 2 : Ajouter au Contexte RequestContext

```typescript
// Dans context.ts ou context_ext.ts
export interface RequestContext {
  // ... existing fields
  locale?: LocaleBundle; // Phase P12
}
```

---

## 📈 Bénéfices

### 1. Flexibilité

- **Multi-tenant** : Chaque tenant peut avoir ses propres préférences
- **Multi-utilisateur** : Chaque utilisateur peut personnaliser
- **Négociation automatique** : Accept-Language header pris en compte

### 2. Performance

- **Requêtes optimisées** : Une seule requête pour tenant + user prefs
- **Cache possible** : Les préférences peuvent être mises en cache

### 3. Maintenabilité

- **Hiérarchie claire** : user → Accept-Language → tenant → default
- **Direction RTL automatique** : Détection automatique depuis la langue

---

## ✅ Validation

- [x] Fonction `resolveLocaleContext` implémentée
- [x] Hiérarchie de résolution correcte (user → Accept-Language → tenant → default)
- [x] Détection automatique RTL/LTR
- [x] Fonctions de conversion multi-devise
- [x] Gestion des erreurs (fallback sur valeurs par défaut)
- [x] Documentation complète

**Status** : ✅ Négociation de locale côté serveur prête

---

## 🚀 Prochaines Étapes

1. **Intégration dans les routes API** : Injecter `LocaleBundle` dans les headers de réponse
2. **Provider i18n React** : Créer le provider côté front pour consommer les headers
3. **Helpers de formatage** : Helpers pour formater nombres, devises, dates selon locale
4. **Navigation localisée** : Injecter les libellés localisés dans la navigation
