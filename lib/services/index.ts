/**
 * Services Index
 * ==============
 * 
 * Point d'entrée centralisé pour tous les services BMO
 */

// Services API de base
export { projetsApiService } from './projetsApiService';
export { clientsApiService } from './clientsApiService';
export { employesApiService } from './employesApiService';
export { financesApiService } from './financesApiService';
export { recouvrementsApiService } from './recouvrementsApiService';
export { litigesApiService } from './litigesApiService';
export { missionsApiService } from './missionsApiService';
export { decisionsApiService } from './decisionsApiService';
export { auditApiService } from './auditApiService';
export { logsApiService } from './logsApiService';

// Services fonctionnels
export { exportService } from './exportService';
export { documentService } from './documentService';
export { notificationService } from './notificationService';
export { searchService } from './searchService';
export { analyticsService } from './analyticsService';
export { workflowService } from './workflowService';
export { alertingService } from './alertingService';
export { commentsService } from './commentsService';

// Types
export type { 
  // Export types
  ExportFormat, 
  ExportOptions 
} from './exportService';

export type { 
  // Document types
  Document, 
  DocumentFilters 
} from './documentService';

export type { 
  // Notification types
  Notification, 
  NotificationType, 
  NotificationPriority 
} from './notificationService';

export type { 
  // Search types
  SearchResult, 
  SearchFilters 
} from './searchService';

export type { 
  // Analytics types
  TimeSeriesData, 
  CategoryData, 
  KPIData, 
  ProjetsAnalytics, 
  FinancesAnalytics, 
  RHAnalytics, 
  ClientsAnalytics 
} from './analyticsService';

export type { 
  // Workflow types
  WorkflowDefinition, 
  WorkflowInstance, 
  WorkflowStep, 
  WorkflowStatus 
} from './workflowService';

export type { 
  // Alert types
  Alert, 
  AlertRule, 
  AlertType, 
  AlertSeverity, 
  AlertStatus 
} from './alertingService';

export type { 
  // Comment types
  Comment, 
  CommentThread, 
  CommentFilters 
} from './commentsService';

