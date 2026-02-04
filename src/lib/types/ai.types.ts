/**
 * Types IA / Intelligence Artificielle
 * =====================================
 * 
 * Types pour les fonctionnalités IA : analyse de texte, suggestions,
 * prédictions, analyse de risques, recommandations automatiques
 */

import type { ID, Timestamp } from './index';

// ============================================
// ANALYSE DE TEXTE
// ============================================

export interface TextAnalysisRequest {
  text: string;
  context?: string;
  language?: 'fr' | 'en' | 'ar';
  analysisType?: 'sentiment' | 'entities' | 'keywords' | 'summary' | 'all';
}

export interface TextAnalysisResponse {
  sentiment?: SentimentAnalysis;
  entities?: EntityExtraction[];
  keywords?: Keyword[];
  summary?: string;
  language: string;
  confidence: number;
  processingTime: number;
}

export interface SentimentAnalysis {
  score: number; // -1 (négatif) à 1 (positif)
  label: 'positive' | 'negative' | 'neutral';
  confidence: number;
  emotions?: {
    joy?: number;
    sadness?: number;
    anger?: number;
    fear?: number;
    surprise?: number;
  };
}

export interface EntityExtraction {
  text: string;
  type: 'person' | 'organization' | 'location' | 'date' | 'amount' | 'other';
  confidence: number;
  startOffset: number;
  endOffset: number;
}

export interface Keyword {
  text: string;
  relevance: number;
  count: number;
}

// ============================================
// SUGGESTIONS INTELLIGENTES
// ============================================

export interface SuggestionRequest {
  context: 'demande' | 'alerte' | 'document' | 'validation' | 'chantier';
  entityId?: ID;
  partial?: string;
  limit?: number;
}

export interface Suggestion {
  id: string;
  type: string;
  value: string;
  label: string;
  confidence: number;
  reason?: string;
  metadata?: Record<string, unknown>;
}

export interface AutocompleteResponse {
  suggestions: Suggestion[];
  processingTime: number;
}

// ============================================
// PRÉDICTIONS ET RECOMMANDATIONS
// ============================================

export interface PredictionRequest {
  type: 'delay' | 'budget-overrun' | 'quality-issue' | 'resource-shortage';
  entityType: 'projet' | 'chantier' | 'demande';
  entityId: ID;
  historicalData?: Record<string, unknown>;
}

export interface Prediction {
  type: string;
  probability: number; // 0-1
  confidence: number; // 0-1
  factors: PredictionFactor[];
  recommendations: string[];
  estimatedImpact?: {
    severity: 'low' | 'medium' | 'high' | 'critical';
    financial?: number;
    timeline?: number; // jours
    quality?: number; // score 0-100
  };
  createdAt: Timestamp;
}

export interface PredictionFactor {
  name: string;
  weight: number; // 0-1
  value: number | string;
  impact: 'positive' | 'negative' | 'neutral';
}

// ============================================
// ANALYSE DE RISQUES
// ============================================

export interface RiskAnalysisRequest {
  entityType: 'projet' | 'chantier' | 'demande' | 'budget';
  entityId: ID;
  includeHistorical?: boolean;
}

export interface RiskAnalysisResponse {
  overallRisk: {
    score: number; // 0-100
    level: 'low' | 'medium' | 'high' | 'critical';
    trend: 'improving' | 'stable' | 'worsening';
  };
  risks: RiskItem[];
  mitigationStrategies: MitigationStrategy[];
  generatedAt: Timestamp;
}

export interface RiskItem {
  id: string;
  category: string;
  description: string;
  probability: number; // 0-1
  impact: number; // 0-1
  riskScore: number; // probability * impact
  indicators: string[];
  status: 'identified' | 'monitored' | 'mitigated' | 'accepted';
}

export interface MitigationStrategy {
  riskId: string;
  strategy: string;
  priority: 'low' | 'medium' | 'high';
  estimatedCost?: number;
  estimatedTime?: number; // jours
  effectiveness: number; // 0-1
}

// ============================================
// RECOMMANDATIONS AUTOMATIQUES
// ============================================

export interface RecommendationRequest {
  userId?: ID;
  context: 'dashboard' | 'projet' | 'budget' | 'planning';
  filters?: Record<string, unknown>;
}

export interface Recommendation {
  id: string;
  type: 'action' | 'insight' | 'optimization' | 'alert';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  description: string;
  reasoning: string[];
  suggestedActions?: SuggestedAction[];
  metrics?: {
    potentialSavings?: number;
    timeReduction?: number;
    qualityImprovement?: number;
  };
  confidence: number;
  expiresAt?: Timestamp;
  createdAt: Timestamp;
}

export interface SuggestedAction {
  label: string;
  action: string;
  params?: Record<string, unknown>;
  impact: string;
}

// ============================================
// DÉTECTION D'ANOMALIES
// ============================================

export interface AnomalyDetectionRequest {
  dataType: 'budget' | 'timeline' | 'quality' | 'resources';
  timeRange: {
    start: Timestamp;
    end: Timestamp;
  };
  sensitivity?: 'low' | 'medium' | 'high';
}

export interface Anomaly {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  detectedAt: Timestamp;
  dataPoint: {
    value: number;
    expected: number;
    deviation: number; // pourcentage
  };
  possibleCauses: string[];
  recommendedActions: string[];
}

// ============================================
// GÉNÉRATION DE CONTENU
// ============================================

export interface ContentGenerationRequest {
  type: 'summary' | 'description' | 'report' | 'email';
  context: Record<string, unknown>;
  tone?: 'formal' | 'casual' | 'technical';
  length?: 'short' | 'medium' | 'long';
  language?: 'fr' | 'en' | 'ar';
}

export interface GeneratedContent {
  content: string;
  metadata: {
    wordCount: number;
    readingTime: number; // minutes
    language: string;
    generatedAt: Timestamp;
  };
  alternatives?: string[];
}

// ============================================
// CLASSIFICATION AUTOMATIQUE
// ============================================

export interface ClassificationRequest {
  text: string;
  categories: string[];
  multiLabel?: boolean;
}

export interface Classification {
  category: string;
  confidence: number;
  subCategories?: Classification[];
}

// ============================================
// RECHERCHE SÉMANTIQUE
// ============================================

export interface SemanticSearchRequest {
  query: string;
  entityTypes?: string[];
  limit?: number;
  minRelevance?: number;
}

export interface SemanticSearchResult {
  entityId: ID;
  entityType: string;
  title: string;
  snippet: string;
  relevance: number; // 0-1
  highlights?: string[];
  metadata?: Record<string, unknown>;
}

// ============================================
// MODÈLES IA
// ============================================

export interface AIModel {
  id: string;
  name: string;
  version: string;
  type: 'classification' | 'regression' | 'nlp' | 'prediction';
  status: 'training' | 'ready' | 'deprecated';
  accuracy?: number;
  lastTrainedAt?: Timestamp;
  description?: string;
}

export interface AIModelMetrics {
  modelId: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  totalPredictions: number;
  correctPredictions: number;
  averageResponseTime: number; // ms
  updatedAt: Timestamp;
}

// ============================================
// HISTORIQUE ET FEEDBACK
// ============================================

export interface AIPredictionHistory {
  id: ID;
  modelId: string;
  predictionType: string;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  confidence: number;
  userFeedback?: 'helpful' | 'not-helpful' | 'incorrect';
  actualOutcome?: Record<string, unknown>;
  createdAt: Timestamp;
}

export interface AIFeedback {
  predictionId: ID;
  rating: 1 | 2 | 3 | 4 | 5;
  feedback: 'helpful' | 'not-helpful' | 'incorrect';
  comment?: string;
  userId: ID;
  createdAt: Timestamp;
}
