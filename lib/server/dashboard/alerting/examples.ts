// lib/server/dashboard/alerting/examples.ts
// Phase P15: Moteur d'alertes - Exemples de règles BTP

import { AlertRule } from './types';

/**
 * Exemples de règles d'alerte pour le domaine BTP
 * Phase P15: Moteur d'alertes
 */

/**
 * Exemple 1 : DSO au-delà de 60 jours (critique)
 * Finance
 */
export const exampleRuleDSO: Partial<AlertRule> = {
  name: 'DSO élevé',
  description: 'DSO (Days Sales Outstanding) au-delà de 60 jours',
  severity: 'critical',
  expr: {
    source: {
      view: 'rm_finance_overview',
    },
    select: {
      metric: 'dso_jours',
    },
    where: [
      { col: 'tenant_id', op: '=', val: '${tenantId}' },
    ],
    condition: {
      op: '>',
      left: 'metric',
      right: 60,
    },
  },
  cooldownSec: 600, // 10 min
  reopenAfterSec: 3600, // 1h
  defaultChannels: {
    email: true,
    teams: true,
    sms: false,
    webhook: false,
  },
};

/**
 * Exemple 2 : OTIF (conformité) < 85% (warning)
 * Achats
 */
export const exampleRuleOTIF: Partial<AlertRule> = {
  name: 'OTIF faible',
  description: 'Taux de conformité OTIF inférieur à 85%',
  severity: 'warning',
  expr: {
    source: {
      view: 'rm_achats_overview',
    },
    select: {
      metric: 'conformite_ratio',
    },
    where: [
      { col: 'tenant_id', op: '=', val: '${tenantId}' },
    ],
    condition: {
      op: '<',
      left: 'metric',
      right: 0.85,
    },
  },
  cooldownSec: 600,
  reopenAfterSec: 3600,
  defaultChannels: {
    email: true,
    teams: true,
  },
};

/**
 * Exemple 3 : Ruptures de stock > 10 articles (warning)
 * Stocks
 */
export const exampleRuleRuptures: Partial<AlertRule> = {
  name: 'Ruptures de stock',
  description: 'Plus de 10 articles en rupture de stock',
  severity: 'warning',
  expr: {
    source: {
      view: 'rm_stocks_overview',
    },
    select: {
      metric: 'ruptures',
    },
    where: [
      { col: 'tenant_id', op: '=', val: '${tenantId}' },
    ],
    condition: {
      op: '>',
      left: 'metric',
      right: 10,
    },
  },
  cooldownSec: 600,
  reopenAfterSec: 3600,
  defaultChannels: {
    email: true,
    teams: true,
  },
};

/**
 * Exemple 4 : Retards projets > 5 (critique)
 * Projets - Utilise une requête SQL directe
 */
export const exampleRuleRetards: Partial<AlertRule> = {
  name: 'Retards projets',
  description: 'Plus de 5 projets en retard (en cours depuis > 90 jours)',
  severity: 'critical',
  expr: {
    source: {
      query: `
        SELECT COUNT(*) AS retards
        FROM projets p
        WHERE p.tenant_id = $1
          AND p.statut = 'En cours'
          AND p.progression < 100
          AND p.created_at < (NOW() - INTERVAL '90 days')
      `,
      params: ['${tenantId}'],
    },
    select: {
      metric: 'retards',
    },
    condition: {
      op: '>',
      left: 'metric',
      right: 5,
    },
  },
  cooldownSec: 600,
  reopenAfterSec: 3600,
  defaultChannels: {
    email: true,
    teams: true,
    sms: true, // SMS pour les alertes critiques
  },
};

/**
 * Exemple 5 : RàF (Reste à Facturer) élevé (warning)
 * Finance - Avec grouping par bureau
 */
export const exampleRuleRAF: Partial<AlertRule> = {
  name: 'RàF élevé par bureau',
  description: 'Reste à facturer supérieur à 100k€ par bureau',
  severity: 'warning',
  routeKey: 'performance::finance::dashboard',
  labels: {
    domain: 'finance',
    kpi: 'RAF',
  },
  expr: {
    source: {
      view: 'rm_finance_overview',
    },
    select: {
      metric: 'raf_euros',
    },
    where: [
      { col: 'tenant_id', op: '=', val: '${tenantId}' },
    ],
    condition: {
      op: '>',
      left: 'metric',
      right: 100000,
    },
    groupBy: ['bureau'], // Créer une alerte par bureau
  },
  cooldownSec: 600,
  reopenAfterSec: 3600,
  defaultChannels: {
    email: true,
    teams: true,
  },
};

/**
 * Exemple 6 : Blocages > 3 (warning)
 * Demandes - Avec filtres multiples
 */
export const exampleRuleBlocages: Partial<AlertRule> = {
  name: 'Blocages demandes',
  description: 'Plus de 3 demandes bloquées',
  severity: 'warning',
  expr: {
    source: {
      view: 'rm_demandes_overview',
    },
    select: {
      metric: 'blocages',
    },
    where: [
      { col: 'tenant_id', op: '=', val: '${tenantId}' },
      { col: 'statut', op: '=', val: 'Bloqué' },
    ],
    condition: {
      op: '>',
      left: 'metric',
      right: 3,
    },
  },
  cooldownSec: 300, // 5 min (plus fréquent pour les blocages)
  reopenAfterSec: 1800, // 30 min
  defaultChannels: {
    email: true,
    teams: true,
  },
};
