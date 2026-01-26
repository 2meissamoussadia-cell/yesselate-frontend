-- lib/server/dashboard/sql/20_i18n_multi_currency.sql
-- Phase P12: Internationalisation & Multi-devise
-- Préférences de locale, fuseau horaire, devise par tenant et utilisateur

-- ============================================================================
-- 1. LOCALES SUPPORTÉES (référentiel)
-- ============================================================================

-- Référentiel des locales supportées avec métadonnées
CREATE TABLE IF NOT EXISTS supported_locales (
  code          VARCHAR(10) PRIMARY KEY, -- ex: 'fr', 'fr-FR', 'en', 'en-US', 'ar', 'ar-MA'
  name          TEXT NOT NULL,           -- Nom affiché: 'Français', 'English', 'العربية'
  native_name   TEXT NOT NULL,           -- Nom natif: 'Français', 'English', 'العربية'
  direction     TEXT NOT NULL DEFAULT 'ltr' CHECK (direction IN ('ltr', 'rtl')), -- Direction du texte
  date_format   TEXT NOT NULL DEFAULT 'DD/MM/YYYY', -- Format de date par défaut
  time_format   TEXT NOT NULL DEFAULT 'HH:mm',       -- Format d'heure par défaut
  number_format TEXT NOT NULL DEFAULT 'fr-FR',       -- Format de nombre (ICU locale)
  currency_code TEXT,                                -- Devise par défaut pour cette locale
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index pour recherche rapide
CREATE INDEX IF NOT EXISTS idx_supported_locales_active ON supported_locales(is_active) WHERE is_active = true;

-- Données initiales (locales supportées)
INSERT INTO supported_locales (code, name, native_name, direction, date_format, time_format, number_format, currency_code) VALUES
  ('fr', 'Français', 'Français', 'ltr', 'DD/MM/YYYY', 'HH:mm', 'fr-FR', 'EUR'),
  ('fr-FR', 'Français (France)', 'Français', 'ltr', 'DD/MM/YYYY', 'HH:mm', 'fr-FR', 'EUR'),
  ('en', 'English', 'English', 'ltr', 'MM/DD/YYYY', 'hh:mm A', 'en-US', 'USD'),
  ('en-US', 'English (US)', 'English', 'ltr', 'MM/DD/YYYY', 'hh:mm A', 'en-US', 'USD'),
  ('ar', 'Arabic', 'العربية', 'rtl', 'DD/MM/YYYY', 'HH:mm', 'ar-SA', 'XOF'),
  ('ar-MA', 'Arabic (Morocco)', 'العربية', 'rtl', 'DD/MM/YYYY', 'HH:mm', 'ar-MA', 'XOF')
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- 2. PRÉFÉRENCES I18N PAR TENANT
-- ============================================================================

-- Préférences i18n par défaut pour chaque tenant
CREATE TABLE IF NOT EXISTS tenant_settings (
  tenant_id        UUID PRIMARY KEY REFERENCES tenants(id) ON DELETE CASCADE,
  default_locale   TEXT NOT NULL DEFAULT 'fr-FR',
  default_currency TEXT NOT NULL DEFAULT 'EUR',
  default_timezone TEXT NOT NULL DEFAULT 'Europe/Paris'
);

-- Index pour recherche rapide
CREATE INDEX IF NOT EXISTS idx_tenant_settings_locale ON tenant_settings(default_locale);
CREATE INDEX IF NOT EXISTS idx_tenant_settings_currency ON tenant_settings(default_currency);

-- ============================================================================
-- 3. PRÉFÉRENCES I18N PAR UTILISATEUR
-- ============================================================================

-- Préférences i18n par utilisateur (surcharge les préférences tenant)
CREATE TABLE IF NOT EXISTS user_prefs (
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id   TEXT NOT NULL,
  locale    TEXT,    -- ex: 'fr-FR', 'en-GB', 'ar-MA' (null = utiliser tenant default)
  currency  TEXT,    -- ex: 'EUR', 'XOF' (null = utiliser tenant default)
  timezone  TEXT,    -- ex: 'Europe/Paris', 'Africa/Casablanca' (null = utiliser tenant default)
  PRIMARY KEY (tenant_id, user_id)
);

-- Index pour recherche rapide
CREATE INDEX IF NOT EXISTS idx_user_prefs_tenant_user ON user_prefs(tenant_id, user_id);
CREATE INDEX IF NOT EXISTS idx_user_prefs_locale ON user_prefs(locale) WHERE locale IS NOT NULL;

-- ============================================================================
-- 4. TAUX DE CHANGE (Multi-devise)
-- ============================================================================

-- Taux de change pour conversion multi-devise (si conversion on-the-fly supportée)
CREATE TABLE IF NOT EXISTS exchange_rates (
  base_currency  TEXT NOT NULL,  -- 'EUR'
  quote_currency TEXT NOT NULL,  -- 'XOF'
  rate           NUMERIC(18, 8) NOT NULL,
  as_of          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (base_currency, quote_currency)
);

-- Index pour recherche rapide
CREATE INDEX IF NOT EXISTS idx_exchange_rates_base_quote ON exchange_rates(base_currency, quote_currency);

-- Données initiales (taux de change de base - à mettre à jour via API ou manuellement)
INSERT INTO exchange_rates (base_currency, quote_currency, rate) VALUES
  ('EUR', 'XOF', 656.0),    -- 1 EUR = 656 XOF (approximatif)
  ('XOF', 'EUR', 0.001524), -- 1 XOF = 0.001524 EUR (approximatif)
  ('EUR', 'USD', 1.094),    -- 1 EUR = 1.094 USD (approximatif)
  ('USD', 'EUR', 0.914),    -- 1 USD = 0.914 EUR (approximatif)
  ('XOF', 'USD', 0.001667), -- 1 XOF = 0.001667 USD (approximatif)
  ('USD', 'XOF', 600.0)     -- 1 USD = 600 XOF (approximatif)
ON CONFLICT (base_currency, quote_currency) DO NOTHING;

-- ============================================================================
-- 5. FONCTIONS UTILITAIRES
-- ============================================================================

-- Fonction pour obtenir la locale effective d'un utilisateur
-- (user preference > tenant default > 'fr-FR')
CREATE OR REPLACE FUNCTION get_user_locale(
  p_tenant_id UUID,
  p_user_id TEXT
) RETURNS TEXT AS $$
DECLARE
  v_locale TEXT;
BEGIN
  -- 1. Vérifier préférence utilisateur
  SELECT locale INTO v_locale
  FROM user_prefs
  WHERE tenant_id = p_tenant_id AND user_id = p_user_id AND locale IS NOT NULL;
  
  -- 2. Si pas de préférence utilisateur, utiliser tenant default
  IF v_locale IS NULL THEN
    SELECT default_locale INTO v_locale
    FROM tenant_settings
    WHERE tenant_id = p_tenant_id;
  END IF;
  
  -- 3. Fallback sur 'fr-FR' si rien trouvé
  RETURN COALESCE(v_locale, 'fr-FR');
END;
$$ LANGUAGE plpgsql STABLE;

-- Fonction pour obtenir le fuseau horaire effectif d'un utilisateur
CREATE OR REPLACE FUNCTION get_user_timezone(
  p_tenant_id UUID,
  p_user_id TEXT
) RETURNS TEXT AS $$
DECLARE
  v_timezone TEXT;
BEGIN
  -- 1. Vérifier préférence utilisateur
  SELECT timezone INTO v_timezone
  FROM user_prefs
  WHERE tenant_id = p_tenant_id AND user_id = p_user_id AND timezone IS NOT NULL;
  
  -- 2. Si pas de préférence utilisateur, utiliser tenant default
  IF v_timezone IS NULL THEN
    SELECT default_timezone INTO v_timezone
    FROM tenant_settings
    WHERE tenant_id = p_tenant_id;
  END IF;
  
  -- 3. Fallback sur 'Europe/Paris' si rien trouvé
  RETURN COALESCE(v_timezone, 'Europe/Paris');
END;
$$ LANGUAGE plpgsql STABLE;

-- Fonction pour obtenir la devise effective d'un utilisateur
CREATE OR REPLACE FUNCTION get_user_currency(
  p_tenant_id UUID,
  p_user_id TEXT
) RETURNS TEXT AS $$
DECLARE
  v_currency TEXT;
BEGIN
  -- 1. Vérifier préférence utilisateur
  SELECT currency INTO v_currency
  FROM user_prefs
  WHERE tenant_id = p_tenant_id AND user_id = p_user_id AND currency IS NOT NULL;
  
  -- 2. Si pas de préférence utilisateur, utiliser tenant default
  IF v_currency IS NULL THEN
    SELECT default_currency INTO v_currency
    FROM tenant_settings
    WHERE tenant_id = p_tenant_id;
  END IF;
  
  -- 3. Fallback sur 'EUR' si rien trouvé
  RETURN COALESCE(v_currency, 'EUR');
END;
$$ LANGUAGE plpgsql STABLE;

-- Fonction pour convertir un montant d'une devise à une autre
CREATE OR REPLACE FUNCTION convert_currency(
  p_amount NUMERIC,
  p_from_currency TEXT,
  p_to_currency TEXT
) RETURNS NUMERIC AS $$
DECLARE
  v_rate NUMERIC;
BEGIN
  -- Si même devise, pas de conversion
  IF p_from_currency = p_to_currency THEN
    RETURN p_amount;
  END IF;
  
  -- Récupérer le taux de change (base_currency -> quote_currency)
  SELECT rate INTO v_rate
  FROM exchange_rates
  WHERE base_currency = p_from_currency
    AND quote_currency = p_to_currency;
  
  -- Si pas de taux trouvé, essayer l'inverse
  IF v_rate IS NULL THEN
    SELECT 1.0 / rate INTO v_rate
    FROM exchange_rates
    WHERE base_currency = p_to_currency
      AND quote_currency = p_from_currency;
  END IF;
  
  -- Si toujours pas de taux, retourner NULL (conversion impossible)
  IF v_rate IS NULL THEN
    RETURN NULL;
  END IF;
  
  RETURN p_amount * v_rate;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- 6. TRIGGERS POUR MISE À JOUR AUTOMATIQUE (si nécessaire)
-- ============================================================================

-- Note: Les tables tenant_settings et user_prefs n'ont pas de colonne updated_at
-- Si besoin, ajouter une colonne updated_at et créer les triggers correspondants

-- ============================================================================
-- NOTES
-- ============================================================================

-- Pour initialiser les préférences tenant par défaut :
-- INSERT INTO tenant_settings (tenant_id, default_locale, default_currency, default_timezone)
-- VALUES ('tenant-uuid', 'fr-FR', 'EUR', 'Europe/Paris')
-- ON CONFLICT (tenant_id) DO UPDATE SET
--   default_locale = EXCLUDED.default_locale,
--   default_currency = EXCLUDED.default_currency,
--   default_timezone = EXCLUDED.default_timezone;

-- Pour définir les préférences utilisateur :
-- INSERT INTO user_prefs (tenant_id, user_id, locale, currency, timezone)
-- VALUES ('tenant-uuid', 'user-id', 'en-GB', 'GBP', 'Europe/London')
-- ON CONFLICT (tenant_id, user_id) DO UPDATE SET
--   locale = EXCLUDED.locale,
--   currency = EXCLUDED.currency,
--   timezone = EXCLUDED.timezone;

-- Pour mettre à jour les taux de change :
-- INSERT INTO exchange_rates (base_currency, quote_currency, rate)
-- VALUES ('EUR', 'XOF', 656.0)
-- ON CONFLICT (base_currency, quote_currency) DO UPDATE SET
--   rate = EXCLUDED.rate,
--   as_of = EXCLUDED.as_of;
