/**
 * Types Webhooks / Intégrations
 * ===============================
 * 
 * Types pour les webhooks : événements, notifications externes,
 * intégrations tierces, callbacks HTTP
 */

import type { ID, Timestamp } from './index';

// ============================================
// WEBHOOK
// ============================================

export interface Webhook {
  id: ID;
  name: string;
  description?: string;
  url: string;
  method: 'POST' | 'PUT' | 'PATCH';
  events: WebhookEvent[];
  headers?: Record<string, string>;
  secret?: string;
  status: 'active' | 'paused' | 'failed' | 'disabled';
  retryPolicy: RetryPolicy;
  authentication?: WebhookAuth;
  createdBy: ID;
  createdAt: Timestamp;
  lastTriggeredAt?: Timestamp;
  lastSuccessAt?: Timestamp;
  lastFailureAt?: Timestamp;
  statistics: WebhookStatistics;
}

export interface WebhookEvent {
  type: string;
  entityType?: string;
  actions?: string[];
  filters?: Record<string, unknown>;
}

export interface RetryPolicy {
  enabled: boolean;
  maxAttempts: number;
  backoffStrategy: 'linear' | 'exponential' | 'fixed';
  initialDelay: number; // ms
  maxDelay: number; // ms
  multiplier?: number;
}

export interface WebhookAuth {
  type: 'none' | 'basic' | 'bearer' | 'api-key' | 'oauth2';
  credentials?: {
    username?: string;
    password?: string;
    token?: string;
    apiKey?: string;
    headerName?: string;
  };
}

export interface WebhookStatistics {
  totalDeliveries: number;
  successfulDeliveries: number;
  failedDeliveries: number;
  averageResponseTime: number; // ms
  lastStatusCode?: number;
  uptime: number; // pourcentage
}

// ============================================
// WEBHOOK DELIVERY
// ============================================

export interface WebhookDelivery {
  id: ID;
  webhookId: ID;
  eventType: string;
  payload: Record<string, unknown>;
  url: string;
  method: string;
  headers: Record<string, string>;
  status: 'pending' | 'sending' | 'success' | 'failed' | 'retrying';
  attempts: DeliveryAttempt[];
  responseStatusCode?: number;
  responseBody?: string;
  responseHeaders?: Record<string, string>;
  duration?: number; // ms
  error?: string;
  createdAt: Timestamp;
  deliveredAt?: Timestamp;
  nextRetryAt?: Timestamp;
}

export interface DeliveryAttempt {
  attemptNumber: number;
  timestamp: Timestamp;
  statusCode?: number;
  responseTime?: number; // ms
  error?: string;
  success: boolean;
}

// ============================================
// ÉVÉNEMENTS WEBHOOK
// ============================================

export interface WebhookEventDefinition {
  type: string;
  name: string;
  description: string;
  category: string;
  entityType?: string;
  actions: string[];
  payloadSchema: Record<string, unknown>;
  examplePayload: Record<string, unknown>;
}

export interface WebhookPayload {
  event: string;
  eventId: ID;
  timestamp: Timestamp;
  entityType: string;
  entityId: ID;
  action: string;
  data: Record<string, unknown>;
  metadata: {
    userId?: ID;
    userName?: string;
    ipAddress?: string;
    userAgent?: string;
    source: string;
  };
  signature?: string;
}

// ============================================
// WEBHOOK SUBSCRIPTION
// ============================================

export interface WebhookSubscription {
  id: ID;
  webhookId: ID;
  subscriberType: 'user' | 'system' | 'service';
  subscriberId: ID;
  events: string[];
  filters?: WebhookFilter[];
  isActive: boolean;
  createdAt: Timestamp;
  expiresAt?: Timestamp;
}

export interface WebhookFilter {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'nin' | 'contains';
  value: any;
}

// ============================================
// INTÉGRATIONS EXTERNES
// ============================================

export interface ExternalIntegration {
  id: ID;
  name: string;
  type: 'slack' | 'teams' | 'email' | 'sms' | 'zapier' | 'ifttt' | 'custom';
  description?: string;
  configuration: IntegrationConfig;
  webhooks: ID[];
  status: 'connected' | 'disconnected' | 'error';
  lastSyncAt?: Timestamp;
  createdAt: Timestamp;
}

export interface IntegrationConfig {
  apiUrl?: string;
  apiKey?: string;
  clientId?: string;
  clientSecret?: string;
  accessToken?: string;
  refreshToken?: string;
  tokenExpiresAt?: Timestamp;
  channels?: string[];
  recipients?: string[];
  customSettings?: Record<string, unknown>;
}

// ============================================
// NOTIFICATIONS EXTERNES
// ============================================

export interface ExternalNotification {
  id: ID;
  integrationId: ID;
  type: 'message' | 'alert' | 'report' | 'custom';
  title: string;
  message: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  recipients: string[];
  channel?: string;
  data?: Record<string, unknown>;
  status: 'pending' | 'sent' | 'failed';
  sentAt?: Timestamp;
  deliveredAt?: Timestamp;
  error?: string;
  createdAt: Timestamp;
}

// ============================================
// WEBHOOK LOGS
// ============================================

export interface WebhookLog {
  id: ID;
  webhookId: ID;
  deliveryId: ID;
  level: 'info' | 'warning' | 'error';
  message: string;
  details?: Record<string, unknown>;
  timestamp: Timestamp;
}

export interface WebhookAudit {
  webhookId: ID;
  action: 'created' | 'updated' | 'deleted' | 'paused' | 'resumed';
  changes?: Array<{
    field: string;
    oldValue: any;
    newValue: any;
  }>;
  performedBy: ID;
  timestamp: Timestamp;
}

// ============================================
// WEBHOOK TEST
// ============================================

export interface WebhookTest {
  id: ID;
  webhookId: ID;
  payload: Record<string, unknown>;
  response?: {
    statusCode: number;
    headers: Record<string, string>;
    body: string;
    duration: number;
  };
  error?: string;
  success: boolean;
  testedBy: ID;
  timestamp: Timestamp;
}

export interface WebhookTestRequest {
  webhookId: ID;
  eventType: string;
  customPayload?: Record<string, unknown>;
}

// ============================================
// RATE LIMITING
// ============================================

export interface WebhookRateLimit {
  webhookId: ID;
  maxRequests: number;
  windowSize: number; // secondes
  currentCount: number;
  resetAt: Timestamp;
  isThrottled: boolean;
}

export interface RateLimitConfig {
  enabled: boolean;
  maxRequests: number;
  windowSize: number; // secondes
  retryAfter?: number; // secondes
}

// ============================================
// WEBHOOK TEMPLATE
// ============================================

export interface WebhookTemplate {
  id: ID;
  name: string;
  description?: string;
  eventType: string;
  payloadTemplate: string; // Template string avec variables
  variables: Array<{
    name: string;
    type: string;
    required: boolean;
    defaultValue?: any;
  }>;
  isPublic: boolean;
  createdBy: ID;
  createdAt: Timestamp;
}

// ============================================
// WEBHOOK MONITORING
// ============================================

export interface WebhookHealth {
  webhookId: ID;
  status: 'healthy' | 'degraded' | 'down';
  uptime: number; // pourcentage
  successRate: number; // pourcentage
  averageResponseTime: number; // ms
  lastCheck: Timestamp;
  issues?: string[];
}

export interface WebhookMetrics {
  webhookId: ID;
  period: {
    start: Timestamp;
    end: Timestamp;
  };
  totalDeliveries: number;
  successfulDeliveries: number;
  failedDeliveries: number;
  averageResponseTime: number;
  p50ResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  errorRate: number;
  deliveriesByStatus: Record<string, number>;
  deliveriesByEvent: Record<string, number>;
}

// ============================================
// CALLBACK ET RÉPONSE
// ============================================

export interface WebhookCallback {
  callbackId: ID;
  originalDeliveryId: ID;
  url: string;
  method: 'POST' | 'PUT' | 'PATCH';
  payload: Record<string, unknown>;
  scheduledAt: Timestamp;
  executedAt?: Timestamp;
  status: 'pending' | 'executed' | 'failed';
}

export interface WebhookResponse {
  deliveryId: ID;
  statusCode: number;
  headers: Record<string, string>;
  body: string;
  duration: number;
  timestamp: Timestamp;
}

// ============================================
// CONFIGURATION
// ============================================

export interface WebhookSystemConfig {
  enabled: boolean;
  maxWebhooksPerUser: number;
  maxEventsPerWebhook: number;
  defaultRetryPolicy: RetryPolicy;
  defaultRateLimit: RateLimitConfig;
  allowedDomains?: string[];
  blockedDomains?: string[];
  maxPayloadSize: number; // bytes
  timeout: number; // ms
}
