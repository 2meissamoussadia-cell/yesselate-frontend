# Phase P12 - Provider i18n Côté Front

## 🎯 Objectif

Provider React pour gérer l'internationalisation (i18n) avec locale, currency, timezone, direction RTL automatique.

**Règle** : On formate au front (Intl), on garde des valeurs brutes dans l'API.

---

## ✅ Implémentation

### 1. Provider i18n

**Fichiers** :
- `src/lib/i18n/I18nProvider.tsx` : Provider simplifié (reçoit messages et bundle en props)
- `src/lib/i18n/I18nProviderWrapper.tsx` : Wrapper qui charge automatiquement depuis l'API

**Fonctionnalités** :
- `I18nProviderWrapper` charge le bundle depuis `/api/me/policy` et les messages depuis `/locales/{locale}.json`
- `I18nProvider` reçoit directement les props (messages, locale, currency, timezone, dir)
- Applique automatiquement la direction RTL/LTR au document
- Fournit des helpers de formatage (Intl API) via `fmt`

### 2. Catalogues de Messages

**Fichiers** : `public/locales/{locale}.json`

Locales supportées :
- `fr-FR.json` : Français
- `en-GB.json` : English
- `ar-MA.json` : العربية (RTL)

Structure des messages :
```json
{
  "common": { "loading": "...", "error": "..." },
  "dashboard": { "title": "...", "overview": "..." },
  "navigation": { "dashboard": "...", "performance": "..." },
  "kpi": { "budget": "...", "consumed": "..." }
}
```

### 3. Helpers de Formatage

Le provider expose via `fmt` :
- `fmt.number(n, options?)` : Formatage de nombres
- `fmt.currency(n, currency?, options?)` : Formatage de devises
- `fmt.percent(n, options?)` : Formatage de pourcentages
- `fmt.date(d, options?)` : Formatage de dates (avec timezone)
- `t(key, vars?)` : Traduction avec interpolation simple `{var}`

---

## 📊 Utilisation

### 1. Utiliser le Hook

```typescript
import { useI18n } from '@/src/lib/i18n';

function MyComponent() {
  const { locale, currency, dir, fmt, t } = useI18n();
  
  return (
    <div dir={dir}>
      <h1>{t('nav.performance')}</h1>
      <p>{fmt.currency(1000)}</p>
      <p>{fmt.date(new Date())}</p>
    </div>
  );
}
```

### 2. Formatage de Nombres

```typescript
const { fmt } = useI18n();

// Formatage simple
fmt.number(1234.56); // "1 234,56" (fr-FR) ou "1,234.56" (en-GB)

// Avec options
fmt.number(1234.56, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
```

### 3. Formatage de Devises

```typescript
const { fmt, currency } = useI18n();

// Utilise la devise de l'utilisateur
fmt.currency(1000); // "1 000,00 €" (fr-FR, EUR)

// Override de devise
fmt.currency(1000, 'XOF'); // "1 000,00 FCFA"
```

### 4. Formatage de Dates

```typescript
const { fmt } = useI18n();

fmt.date(new Date()); // "25/01/2026" (fr-FR) ou "01/25/2026" (en-GB)
fmt.date(new Date(), { dateStyle: 'long' }); // Format long
fmt.date(new Date(), { timeStyle: 'short' }); // Avec heure
```

### 5. Formatage de Pourcentages

```typescript
const { fmt } = useI18n();

fmt.percent(75.5); // "75,5 %" (fr-FR) ou "75.5%" (en-GB)
```

### 6. Traduction

```typescript
const { t } = useI18n();

// Clés simples
t('nav.performance'); // "Performance & KPIs" (fr-FR) ou "Performance & KPIs" (en-GB)

// Avec interpolation
t('kpi.budget', { value: 1000 }); // Si le message contient {value}
```

### 7. Direction RTL

```typescript
const { dir } = useI18n();

// Appliqué automatiquement au document, mais peut être utilisé dans les composants
<div dir={dir}>
  {/* Contenu */}
</div>
```

---

## 🔧 Intégration

### Provider Intégré

**Deux approches disponibles** :

#### 1. Client-side (I18nProviderWrapper)

Le `I18nProviderWrapper` est intégré dans `lib/providers/Providers.tsx` :

```typescript
<I18nProviderWrapper>
  <AuthProvider>
    {/* ... */}
  </AuthProvider>
</I18nProviderWrapper>
```

Le wrapper charge automatiquement :
1. Le bundle (locale, currency, timezone, direction) depuis `/api/me/policy`
2. Les messages depuis `/locales/{locale}.json`
3. Passe tout au `I18nProvider` simplifié

#### 2. Server-side (Layout Dashboard)

Le layout dashboard (`app/(portals)/maitre-ouvrage/dashboard/layout.tsx`) charge les messages côté serveur pour optimiser le chargement initial :

```typescript
// Layout server component
export default async function DashboardLayout({ children }) {
  const headersList = await headers();
  const baseCtx = extractContextFromHeaders(headersList);
  const localeBundle = await resolveLocaleContext(headersList, baseCtx.tenantId, baseCtx.userId);
  const messages = loadMessages(localeBundle.locale); // Charge depuis public/locales/
  
  return (
    <I18nProvider messages={messages} locale={localeBundle.locale} ...>
      {children}
    </I18nProvider>
  );
}
```

**Avantages** :
- Chargement initial plus rapide (pas de fetch client)
- Messages disponibles dès le SSR
- Meilleure SEO

### Endpoint Étendu

L'endpoint `/api/me/policy` retourne maintenant :
```json
{
  "perms": [...],
  "flags": {...},
  "locale": "fr-FR",
  "currency": "EUR",
  "timezone": "Europe/Paris",
  "direction": "ltr"
}
```

---

## 📈 Bénéfices

### 1. Formatage Automatique

- **Nombres** : Formatage selon la locale (virgule/point, séparateurs)
- **Devises** : Formatage avec symbole selon la locale
- **Dates** : Formatage selon les conventions locales
- **RTL** : Direction automatique pour l'arabe

### 2. Traduction Centralisée

- **Messages structurés** : Organisation par namespace (common, dashboard, navigation, etc.)
- **Clés imbriquées** : Support de `key.nested.key`
- **Paramètres** : Support de `{{param}}` dans les messages

### 3. Performance

- **Chargement lazy** : Messages chargés uniquement quand nécessaire
- **Cache** : Bundle mis en cache (60s) via `/api/me/policy`
- **Fallback** : Fallback automatique sur `fr-FR` si locale non trouvée

---

## ✅ Validation

- [x] Provider i18n créé avec hooks de formatage
- [x] Catalogues de messages (fr-FR, en-GB, ar-MA)
- [x] Endpoint `/api/me/policy` étendu avec bundle i18n
- [x] Intégration dans `Providers.tsx`
- [x] Support RTL automatique
- [x] Helpers de formatage (Intl API)
- [x] Fonction de traduction avec clés imbriquées
- [x] Documentation complète

**Status** : ✅ Provider i18n prêt pour utilisation

---

## 🚀 Prochaines Étapes

1. **Utiliser dans les composants** : Remplacer les textes en dur par `t('key')`
2. **Formatage KPI Bar** : Utiliser `formatCurrency`, `formatPercent` dans les KPIs
3. **Navigation localisée** : Injecter `t('navigation.*')` dans la Sidebar/Subnav
4. **ChartKit localisé** : Formater les axes et légendes selon la locale
5. **Exports localisés** : CSV/Excel avec séparateurs locaux, PDF RTL

---

## 💱 Conversion de Devise (Optionnel)

### Helper de Conversion Côté Front

**Fichier** : `src/lib/i18n/currency.ts`

**Fonction** : `convertIfNeeded(amount, fromCurrency, toCurrency, rate?)`

**Usage** :
```typescript
import { useI18n } from '@/src/lib/i18n';
import { convertIfNeeded } from '@/src/lib/i18n';

function MyComponent() {
  const { fmt, currency: uiCur } = useI18n();
  
  // Montant reçu depuis l'API (toujours en devise de référence tenant, ex: EUR)
  const priceEuros = 100;
  
  // Optionnel : convertir si l'utilisateur préfère XOF
  // (le taux peut être récupéré depuis l'API ou un store)
  const rate = 655.957; // EUR -> XOF
  const price = convertIfNeeded(priceEuros, 'EUR', uiCur, rate);
  
  // Formater selon la devise de l'utilisateur
  const label = fmt.currency(price, uiCur, { 
    maximumFractionDigits: uiCur === 'XOF' ? 0 : 2 
  });
  
  return <div>{label}</div>;
}
```

**Note** : L'API renvoie toujours les montants en devise de référence tenant (ex: EUR). La conversion est optionnelle et se fait côté front selon la préférence utilisateur.

---

## 📤 Exports Localisés

### CSV/Excel avec Séparateurs Locaux

**Fichier** : `lib/server/dashboard/export/csvFormatter.ts`

**Fonction** : `formatAsCSV(data, locale)`

**Séparateurs** :
- `fr-FR` : `;` (point-virgule)
- `en-GB`, `ar-MA` : `,` (virgule)

**Usage dans API** :
```typescript
// app/api/export/dashboard/route.ts
const localeBundle = await resolveLocaleContext(req.headers, tenantId, userId);
const separator = getCsvSeparator(localeBundle.locale); // ';' ou ','
const csv = toCsv(rows, separator);
```

Les exports CSV/Excel utilisent automatiquement le bon séparateur selon la locale de l'utilisateur.

---

## 📄 PDF RTL (Quand on fera du PDF riche)

### Support RTL pour PDF HTML→PDF

**Fichier** : `lib/server/dashboard/export/pdfFormatter.ts`

**Notes d'implémentation** :

1. **Fonts compatibles RTL** :
   - `NotoSansArabic` pour l'arabe
   - `NotoSansCJK` pour chinois/japonais/coréen si besoin
   - Précharger les fonts dans le template HTML

2. **Direction RTL dans les gabarits** :
   - Appliquer `dir="rtl"` dans les gabarits HTML→PDF
   - Utiliser CSS : `direction: rtl; text-align: right;`
   - Inverser les marges (margin-left ↔ margin-right)

3. **Exemple avec puppeteer** :
   ```typescript
   const browser = await puppeteer.launch({
     args: ['--font-render-hinting=none']
   });
   const page = await browser.newPage();
   await page.setContent(htmlTemplate, { waitUntil: 'networkidle0' });
   const pdf = await page.pdf({
     format: 'A4',
     printBackground: true,
     preferCSSPageSize: true,
   });
   ```

4. **Template HTML avec RTL** :
   ```html
   <html dir="${options.direction || 'ltr'}" lang="${options.locale || 'fr-FR'}">
     <head>
       <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;700&display=swap" rel="stylesheet">
       <style>
         body { direction: ${options.direction || 'ltr'}; font-family: 'Noto Sans Arabic', sans-serif; }
       </style>
     </head>
     <body>...</body>
   </html>
   ```

**Status** : 📝 Notes préparées pour implémentation future du PDF riche

---

## 🧪 QA & Tests

### Checklist de Validation

#### 1. Locales Supportées

**Locales à tester** : `fr-FR`, `en-GB`, `ar-MA`

**Éléments à vérifier** :
- ✅ **Sidebar/Subnav** : Labels traduits via `i18nKey` dans la navigation
- ✅ **KPI Bar** : Textes localisés (tones, auto-refresh, refresh, count, last update)
- ✅ **Pages KPI/Reporting/Compliance** : Titres, descriptions, labels de boutons
- ✅ **ChartKit** : Axes, tooltips, légendes formatés selon la locale

#### 2. Formats Localisés

**Monnaie** :
- ✅ **EUR** : Format avec 2 décimales (ex: `1 000,00 €`)
- ✅ **XOF** : Format avec 0 décimales (ex: `1 000 FCFA`)
- ✅ **Conversion optionnelle** : `convertIfNeeded()` fonctionne correctement

**Pourcentages** :
- ✅ Format selon locale (ex: `75,5 %` en fr-FR, `75.5%` en en-GB)

**Dates** :
- ✅ Format selon locale (ex: `25/01/2026` en fr-FR, `01/25/2026` en en-GB)
- ✅ Fuseau horaire respecté (ex: `Europe/Paris`, `Africa/Casablanca`)

#### 3. RTL (Right-to-Left)

**Éléments à inspecter** :
- ✅ **Layout** : `dir="rtl"` appliqué au document pour `ar-MA`
- ✅ **Breadcrumbs** : Orientation correcte (droite → gauche)
- ✅ **Subnav tabs** : Ordre inversé si nécessaire
- ✅ **Tables** : Colonnes alignées à droite
- ✅ **Tooltips charts** : Positionnement adapté
- ✅ **Icônes directionnelles** : Inversées si nécessaire (chevrons, flèches)

#### 4. Exports Localisés

**CSV** :
- ✅ **fr-FR** : Séparateur `;` (point-virgule)
- ✅ **en-GB, ar-MA** : Séparateur `,` (virgule)
- ✅ **Excel** : Ouvre sans corruption avec le bon séparateur
- ✅ **Hash header** : `X-Content-Hash` présent (Phase P9)

**Excel** :
- ✅ Compatible avec Excel FR et EN
- ✅ Pas de corruption de caractères (UTF-8)

#### 5. Accessibilité

**ARIA Labels** :
- ✅ `aria-label` localisés via `t()` au lieu de textes en dur
- ✅ Navigation clavier fonctionnelle en RTL
- ✅ Screen readers : Annonces correctes selon la locale

---

## 🚀 Déploiement — Check Express

### Étapes de Déploiement

#### 1. Base de Données

```bash
# Appliquer la migration SQL
psql -d yesselate -f sql/19_i18n_prefs.sql
```

**Fichier** : `sql/19_i18n_prefs.sql`

**Tables créées** :
- `tenant_settings` : Préférences par défaut (locale, currency, timezone)
- `user_prefs` : Préférences utilisateur (override tenant)
- `exchange_rates` : Taux de change (si conversion activée)

#### 2. API

**Endpoint `/api/me/policy`** :
- ✅ Retourne `locale`, `currency`, `timezone`, `direction`
- ✅ Headers `X-Locale`, `X-Currency`, `X-Timezone`, `X-Direction`
- ✅ Cache `Cache-Control: private, max-age=60`

**Vérification** :
```bash
curl -H "x-tenant-id: <tenant>" -H "x-user-id: <user>" http://localhost:3000/api/me/policy
```

#### 3. Frontend

**Fichiers à merger** :
- ✅ `src/lib/i18n/I18nProvider.tsx` : Provider simplifié
- ✅ `src/lib/i18n/I18nProviderWrapper.tsx` : Wrapper client-side
- ✅ `lib/server/i18n/loadMessages.ts` : Helper server-side
- ✅ `app/(portals)/maitre-ouvrage/dashboard/layout.tsx` : Bootstrap server-side

**Usages intégrés** :
- ✅ `src/modules/dashboard/components/DashboardKPIBar.tsx` : KPIs localisés
- ✅ `src/modules/dashboard/charts/ChartKit/*` : Charts formatés
- ✅ `src/modules/dashboard/navigation/DashboardSidebar.tsx` : Navigation localisée
- ✅ `src/modules/dashboard/navigation/dashboardNavigationConfig.ts` : `i18nKey` ajoutés

#### 4. Navigation

**Migration progressive** :
- ✅ Ajouter `i18nKey` dans `dashboardNavigationConfig.ts`
- ✅ Supprimer progressivement les `label` en dur
- ✅ Tester avec différentes locales

**Exemple** :
```typescript
// Avant
performance: { id: 'performance', label: 'Performance & KPIs' }

// Après
performance: { id: 'performance', i18nKey: 'nav.performance' }
```

#### 5. Exports

**CSV/Excel** :
- ✅ Utiliser `getCsvSeparator(locale)` dans `app/api/export/dashboard/route.ts`
- ✅ Tester avec `fr-FR` (séparateur `;`) et `en-GB` (séparateur `,`)

#### 6. Validation RTL

**Test avec `ar-MA`** :
- ✅ Vérifier `dir="rtl"` sur le document
- ✅ Tester navigation, tables, tooltips
- ✅ Vérifier polices arabes (si PDF riche implémenté)

---

## ⚠️ Risques & Atténuations

### 1. Libellés Manquants

**Risque** : Clés i18n manquantes → affichage de la clé brute (`nav.performance` au lieu de "Performance & KPIs")

**Atténuation** :
- ✅ **Lint/Report** : Créer un script pour détecter les clés manquantes
- ✅ **Fallback** : Afficher la clé si message non trouvé (visible en dev)
- ✅ **Validation** : Checklist QA pour chaque locale

**Script de validation** (exemple) :
```typescript
// scripts/validate-i18n.ts
const requiredKeys = ['nav.performance', 'nav.achats', ...];
const locales = ['fr-FR', 'en-GB', 'ar-MA'];
// Vérifier que toutes les clés existent dans toutes les locales
```

### 2. RTL (Right-to-Left)

**Risque** : Micro-ajustements CSS nécessaires pour l'arabe

**Atténuation** :
- ✅ **Icônes directionnelles** : Utiliser des classes Tailwind RTL (`rtl:rotate-180`)
- ✅ **Chevrons** : Inverser automatiquement avec CSS `[dir="rtl"] .chevron { transform: scaleX(-1); }`
- ✅ **Marges** : Utiliser `ms-*` / `me-*` (margin-start/end) au lieu de `ml-*` / `mr-*`

**Exemple CSS** :
```css
/* Inverser les chevrons en RTL */
[dir="rtl"] .chevron-right {
  transform: scaleX(-1);
}
```

### 3. Devise

**Risque** : Confusion entre conversion d'affichage et comptabilité

**Atténuation** :
- ✅ **Règle stricte** : L'API renvoie toujours la devise de référence tenant (ex: EUR)
- ✅ **Conversion optionnelle** : Uniquement côté front pour l'affichage
- ✅ **Validation Finance** : Ne pas substituer la devise métier sans validation
- ✅ **Documentation** : Clarifier que `convertIfNeeded()` est pour l'affichage uniquement

**Note** : La conversion d'affichage ne doit jamais remplacer la devise de référence dans les calculs métier.

### 4. Fuseaux Horaires

**Risque** : Incohérence entre stockage et affichage des dates

**Atténuation** :
- ✅ **Stockage** : Toujours en UTC côté serveur
- ✅ **Échange API** : Dates en ISO 8601 (UTC)
- ✅ **Formatage** : Uniquement côté front avec `fmt.date()` et `timezone` utilisateur
- ✅ **Validation** : Tester avec différents fuseaux (Europe/Paris, Africa/Casablanca, etc.)

**Exemple** :
```typescript
// ✅ Correct : Stocker en UTC, formater selon timezone user
const date = new Date('2026-01-25T12:00:00Z'); // UTC
fmt.date(date, { timeStyle: 'short' }); // Formate selon timezone user

// ❌ Incorrect : Stocker avec timezone
const date = new Date('2026-01-25T12:00:00+01:00'); // Ne pas faire ça
```

### 5. Performance

**Risque** : Chargement des messages ralentit le rendu initial

**Atténuation** :
- ✅ **Server-side** : Charger les messages dans le layout (SSR)
- ✅ **Cache** : Bundle i18n mis en cache 60s via `/api/me/policy`
- ✅ **Lazy loading** : Messages chargés uniquement pour la locale active

---

## ✅ Checklist de Validation Finale

### Avant Déploiement

- [ ] SQL `19_i18n_prefs.sql` appliqué
- [ ] Endpoint `/api/me/policy` retourne bundle i18n
- [ ] Messages `fr-FR`, `en-GB`, `ar-MA` présents dans `public/locales/`
- [ ] `I18nProvider` intégré dans layout dashboard
- [ ] KPIBar, ChartKit, Sidebar/Subnav localisés
- [ ] Exports CSV avec séparateurs locaux
- [ ] RTL testé avec `ar-MA`
- [ ] Accessibilité : ARIA labels localisés

### Après Déploiement

- [ ] Tester avec compte `fr-FR` : formats corrects
- [ ] Tester avec compte `en-GB` : formats corrects
- [ ] Tester avec compte `ar-MA` : RTL fonctionnel
- [ ] Exports CSV : séparateurs corrects selon locale
- [ ] Performance : pas de régression (SSR rapide)

---

## 🎯 Prochaines Étapes

### P12.b – Localisation Profonde des Exports

- **XLSX stylé** : Utiliser `exceljs` pour formats riches
- **PDF stylé** : Gabarits HTML→PDF avec RTL/CJK
- **Gabarits par tenant** : Personnalisation des exports
- **Polices RTL/CJK** : NotoSansArabic, NotoSansCJK

### P13 – Résilience & DR

- **RPO/RTO** : Objectifs de reprise
- **Sauvegardes** : Stratégie de backup
- **Bascule** : Plan de failover
- **Chaos testing** : Tests de résilience

### P14 – Observabilité Produit

- **Adoption** : Métriques d'utilisation
- **Parcours** : Analytics utilisateur
- **NPS** : Net Promoter Score
- **Telemetry UI** : Télémétrie côté client

**Status** : ✅ Phase P12 complète — Prêt pour P12.b, P13 ou P14
