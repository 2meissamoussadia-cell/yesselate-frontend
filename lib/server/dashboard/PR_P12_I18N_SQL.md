# ✅ Phase P12 - Internationalisation & Multi-devise : Modèles SQL

## 🎯 Objectif

Créer le schéma SQL minimal pour supporter l'internationalisation (i18n) et la multi-devise, avec préférences par tenant et utilisateur.

**Compatibilité garantie** : 100% compatible avec l'architecture existante (routeur, registry, navigation).

---

## ✅ Implémentation

### 1. Locales Supportées

**Table** : `supported_locales`

Référentiel des locales supportées avec métadonnées :
- **code** : Code locale (ex: 'fr', 'fr-FR', 'en', 'ar-MA')
- **name** : Nom affiché (ex: 'Français', 'English')
- **native_name** : Nom natif (ex: 'العربية')
- **direction** : Direction du texte ('ltr' ou 'rtl')
- **date_format** : Format de date par défaut
- **time_format** : Format d'heure par défaut
- **number_format** : Format de nombre (ICU locale)
- **currency_code** : Devise par défaut pour cette locale

**Locales initiales** :
- `fr`, `fr-FR` : Français (LTR, EUR)
- `en`, `en-US` : English (LTR, USD)
- `ar`, `ar-MA` : Arabic (RTL, XOF)

### 2. Préférences I18N par Tenant

**Table** : `tenant_settings`

Préférences i18n par défaut pour chaque tenant :
- **default_locale** : Locale par défaut (ex: 'fr-FR')
- **default_timezone** : Fuseau horaire IANA (ex: 'Europe/Paris')
- **default_currency** : Devise par défaut ISO 4217 (ex: 'EUR')

**Valeurs par défaut** :
- Locale : `fr-FR`
- Timezone : `Europe/Paris`
- Currency : `EUR`

### 3. Préférences I18N par Utilisateur

**Table** : `user_prefs`

Préférences i18n par utilisateur (surcharge les préférences tenant) :
- **locale** : Locale préférée (null = utiliser tenant default) - ex: 'fr-FR', 'en-GB', 'ar-MA'
- **timezone** : Fuseau horaire préféré (null = utiliser tenant default) - ex: 'Europe/Paris', 'Africa/Casablanca'
- **currency** : Devise préférée (null = utiliser tenant default) - ex: 'EUR', 'XOF'

**Hiérarchie de résolution** :
1. Préférence utilisateur (si définie)
2. Préférence tenant (si définie)
3. Valeur par défaut système

### 4. Taux de Change (Multi-devise)

**Table** : `exchange_rates`

Taux de change pour conversion multi-devise (si conversion on-the-fly supportée) :
- **base_currency** : Devise de base (ex: 'EUR')
- **quote_currency** : Devise cible (ex: 'XOF')
- **rate** : Taux de change (1 base_currency = rate quote_currency)
- **as_of** : Date d'effet du taux

**Taux initiaux** :
- EUR → XOF : 1 EUR = 656 XOF
- XOF → EUR : 1 XOF = 0.001524 EUR
- EUR → USD : 1 EUR = 1.094 USD
- USD → EUR : 1 USD = 0.914 EUR

### 5. Fonctions Utilitaires

**Fonctions SQL** :

1. **`get_user_locale(tenant_id, user_id)`** :
   - Retourne la locale effective d'un utilisateur
   - Résolution : user preference → tenant default → 'fr-FR'

2. **`get_user_timezone(tenant_id, user_id)`** :
   - Retourne le fuseau horaire effectif d'un utilisateur
   - Résolution : user preference → tenant default → 'Europe/Paris'

3. **`get_user_currency(tenant_id, user_id)`** :
   - Retourne la devise effective d'un utilisateur
   - Résolution : user preference → tenant default → 'EUR'

4. **`convert_currency(amount, from_currency, to_currency)`** :
   - Convertit un montant d'une devise à une autre
   - Utilise le taux de change de la table `exchange_rates`
   - Retourne NULL si conversion impossible

---

## 📊 Utilisation

### Initialiser les Préférences Tenant

```sql
INSERT INTO tenant_settings (tenant_id, default_locale, default_currency, default_timezone)
VALUES ('tenant-uuid', 'fr-FR', 'EUR', 'Europe/Paris')
ON CONFLICT (tenant_id) DO UPDATE SET
  default_locale = EXCLUDED.default_locale,
  default_currency = EXCLUDED.default_currency,
  default_timezone = EXCLUDED.default_timezone;
```

### Définir les Préférences Utilisateur

```sql
INSERT INTO user_prefs (tenant_id, user_id, locale, currency, timezone)
VALUES ('tenant-uuid', 'user-id', 'en-GB', 'GBP', 'Europe/London')
ON CONFLICT (tenant_id, user_id) DO UPDATE SET
  locale = EXCLUDED.locale,
  currency = EXCLUDED.currency,
  timezone = EXCLUDED.timezone;
```

### Mettre à Jour les Taux de Change

```sql
INSERT INTO exchange_rates (base_currency, quote_currency, rate)
VALUES ('EUR', 'XOF', 656.0)
ON CONFLICT (base_currency, quote_currency) DO UPDATE SET
  rate = EXCLUDED.rate,
  as_of = EXCLUDED.as_of;
```

### Utiliser les Fonctions

```sql
-- Obtenir la locale effective
SELECT get_user_locale('tenant-uuid', 'user-id');

-- Obtenir le fuseau horaire effectif
SELECT get_user_timezone('tenant-uuid', 'user-id');

-- Obtenir la devise effective
SELECT get_user_currency('tenant-uuid', 'user-id');

-- Convertir un montant
SELECT convert_currency(1000000, 'XOF', 'EUR');
-- Retourne: 1524.000000 (1M XOF = 1524 EUR)
```

---

## 🔧 Déploiement

### 1. Appliquer le SQL

```bash
psql "$DATABASE_URL" -f lib/server/dashboard/sql/20_i18n_multi_currency.sql
```

### 2. Initialiser les Préférences Tenant

Pour chaque tenant existant, initialiser les préférences par défaut :

```sql
INSERT INTO tenant_settings (tenant_id, default_locale, default_currency, default_timezone)
SELECT id, 'fr-FR', 'EUR', 'Europe/Paris'
FROM tenants
ON CONFLICT (tenant_id) DO NOTHING;
```

### 3. Vérifier les Données

```sql
-- Vérifier les locales supportées
SELECT * FROM supported_locales WHERE is_active = true;

-- Vérifier les préférences tenant
SELECT * FROM tenant_settings;

-- Vérifier les taux de change
SELECT * FROM exchange_rates;
```

---

## 📈 Bénéfices

### 1. Flexibilité

- **Multi-tenant** : Chaque tenant peut avoir ses propres préférences par défaut
- **Multi-utilisateur** : Chaque utilisateur peut personnaliser ses préférences
- **Multi-locale** : Support de plusieurs locales (FR, EN, AR, etc.)
- **Multi-devise** : Support de plusieurs devises (EUR, XOF, USD, etc.)

### 2. Performance

- **Fonctions SQL** : Résolution rapide des préférences côté DB
- **Index optimisés** : Recherche rapide par tenant/user
- **Vue matérialisée** : Taux de change les plus récents pré-calculés

### 3. Maintenabilité

- **Hiérarchie claire** : user → tenant → default
- **Extensibilité** : Facile d'ajouter de nouvelles locales/devises
- **Traçabilité** : Historique des taux de change avec dates d'effet

---

## ✅ Validation

- [x] Table `supported_locales` avec locales initiales
- [x] Table `tenant_settings` pour préférences tenant
- [x] Table `user_prefs` pour préférences utilisateur
- [x] Table `exchange_rates` pour taux de change
- [x] Fonctions utilitaires (get_user_locale, get_user_timezone, get_user_currency, convert_currency)
- [x] Triggers pour mise à jour automatique de `updated_at`
- [x] Index optimisés pour performance
- [x] Documentation complète

**Status** : ✅ Modèles SQL i18n & multi-devise prêts

---

## 🚀 Prochaines Étapes

1. **Provider i18n React** : Créer le provider i18n côté front (next-intl ou react-intl)
2. **Helpers de formatage** : Helpers pour formater nombres, devises, dates selon locale
3. **Navigation localisée** : Injecter les libellés localisés dans la navigation
4. **Exports localisés** : CSV/Excel avec séparateurs locaux, PDF RTL
5. **API endpoints** : Endpoints pour récupérer/mettre à jour les préférences
