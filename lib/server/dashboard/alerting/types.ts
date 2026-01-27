// lib/server/dashboard/alerting/types.ts
// Phase P15: Moteur d'alertes - Types TypeScript

/**
 * DSL pour expressions d'alerte
 * Phase P15: Moteur d'alertes
 * 
 * Supporte deux formats :
 * 1. Source = MView avec select/where/condition
 * 2. Source = Query SQL directe avec params
 */
export interface AlertExpression {
  /** Source de données : soit une MView, soit une requête SQL */
  source: {
    /** Format 1 : MView (read-model) */
    view?: string; // ex: 'rm_finance_overview', 'rm_achats_overview'
    
    /** Format 2 : Requête SQL directe */
    query?: string; // ex: "select count(*) as retards from projets p where ..."
    params?: string[]; // Paramètres pour la query (ex: ["${tenantId}"])
  };
  
  /** Sélection de la métrique à évaluer */
  select: {
    metric: string; // Nom de la colonne/métrique (ex: 'dso_jours', 'conformite_ratio', 'retards')
  };
  
  /** Filtres WHERE (optionnel, uniquement pour source.view) */
  where?: Array<{
    col: string; // Nom de la colonne
    op: '=' | '!=' | '>' | '>=' | '<' | '<=' | 'IN' | 'LIKE' | 'ILIKE';
    val: any; // Valeur ou "${tenantId}" pour substitution
  }>;
  
  /** Condition de déclenchement */
  condition: {
    op: '>' | '>=' | '<' | '<=' | '=' | '!=';
    left: string; // 'metric' (référence à select.metric) ou nom de colonne
    right: number | string; // Seuil ou valeur de comparaison
  };
  
  /** Grouping (optionnel) : pour créer une alerte par groupe */
  groupBy?: string[]; // Colonnes pour GROUP BY
}

/**
 * Règle d'alerte
 * Phase P15: Moteur d'alertes
 * Phase P17: Extensions v2 (expr_v2, hysteresis, group_by, correlation)
 */
export interface AlertRule {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  severity: 'info' | 'warning' | 'critical';
  enabled: boolean;
  routeKey?: string;
  labels?: Record<string, any>;
  expr: AlertExpression; // DSL v1 (legacy)
  expr_v2?: import('./dsl_v2').AlertDSLv2; // DSL v2 (Phase P17)
  hysteresis?: {
    enter: Record<string, number>; // ex: { ">=": 60 }
    exit: Record<string, number>; // ex: { "<=": 55 }
  };
  group_by?: {
    keys: string[];
    topN?: number;
    orderBy?: 'desc' | 'asc';
  };
  correlation?: Array<{
    metric: string;
    op: '>' | '>=' | '<' | '<=' | '=' | '!=';
    value: number | string;
    compare?: 'n-1' | 'baseline' | 'absolute';
    delta_pct?: number;
  }>;
  cooldownSec: number;
  reopenAfterSec: number;
  schedule?: {
    mute?: {
      start: string; // HH:mm
      end: string;   // HH:mm
      tz: string;    // timezone
    };
  };
  defaultChannels?: Record<string, boolean>;
}

/**
 * Canal de notification
 * Phase P15: Moteur d'alertes
 */
export interface AlertChannel {
  id: string;
  tenantId: string;
  kind: 'email' | 'teams' | 'sms' | 'webhook';
  name: string;
  config: Record<string, any>;
  enabled: boolean;
}

/**
 * Événement d'alerte
 * Phase P15: Moteur d'alertes
 * Phase P17: Extensions (acked_by, acked_at, closed_at, closed_by, evidence)
 */
export interface AlertEvent {
  id: string;
  tenantId: string;
  ruleId: string;
  fingerprint: string;
  status: 'open' | 'ack' | 'closed';
  firstSeen: Date;
  lastSeen: Date;
  acknowledgedAt?: Date;
  acknowledgedBy?: string;
  acked_at?: Date; // alias SQL
  acked_by?: string; // alias SQL
  closedAt?: Date;
  closedBy?: string;
  closed_at?: Date; // alias SQL
  closed_by?: string; // alias SQL
  count: number;
  payload: Record<string, any>;
  labels?: Record<string, any>;
  evidence?: Record<string, any>; // Phase P17: données de preuve (séries, valeurs sources)
}

/**
 * Notification envoyée
 * Phase P15: Moteur d'alertes
 */
export interface AlertNotification {
  id: string;
  tenantId: string;
  eventId: string;
  channelId: string;
  target: string;
  status: 'pending' | 'sent' | 'failed';
  sentAt?: Date;
  error?: string;
}
