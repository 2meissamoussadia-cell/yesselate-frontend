/**
 * Types Communs
 * ==============
 * 
 * Types TypeScript de base réutilisables dans toute l'application.
 * ATTENTION : Ce fichier ne doit PAS créer de doublons avec bmo.types.ts
 */

// ============================================
// TYPES DE BASE
// ============================================

export type ID = string;
export type Timestamp = string; // ISO 8601
export type Currency = number; // FCFA

// ============================================
// ENTITÉS DE BASE (GÉNÉRIQUES)
// ============================================

export interface BaseEntity {
  id: ID;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  deletedAt?: Timestamp;
}

/**
 * User générique - Pour l'authentification et les permissions
 * Note : Pour les employés BMO, utiliser Employee de bmo.types.ts
 */
export interface User extends BaseEntity {
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  role: string;
  avatar?: string;
  bureauId?: ID;
  isActive: boolean;
}

// ============================================
// RÉPONSES API
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// ============================================
// FILTRES ET RECHERCHE
// ============================================

export interface BaseFilters {
  search?: string;
  dateDebut?: Timestamp;
  dateFin?: Timestamp;
  status?: string | string[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export interface SearchParams extends BaseFilters, PaginationParams {}

// ============================================
// STATISTIQUES
// ============================================

export interface Stats {
  total: number;
  [key: string]: number | string | Record<string, unknown>;
}

export interface TrendData {
  value: number;
  change: number; // Pourcentage
  trend: 'up' | 'down' | 'stable';
  period?: string;
}

// ============================================
// ACTIONS ET ÉVÉNEMENTS
// ============================================

export interface Action {
  type: string;
  label: string;
  icon?: string;
  disabled?: boolean;
  dangerous?: boolean;
  handler: () => void | Promise<void>;
}

export interface Event extends BaseEntity {
  type: string;
  entityType: string;
  entityId: ID;
  userId: ID;
  userName: string;
  description: string;
  metadata?: Record<string, unknown>;
}

// ============================================
// NAVIGATION ET WORKSPACE
// ============================================

export interface Tab {
  id: ID;
  type: string;
  title: string;
  icon: string;
  data?: Record<string, unknown>;
  closable?: boolean;
  isDirty?: boolean;
}

export interface MenuItem {
  id: string;
  label: string;
  icon?: string;
  path?: string;
  badge?: number | string;
  children?: MenuItem[];
  action?: () => void;
}

export interface Breadcrumb {
  label: string;
  path?: string;
}

// ============================================
// FORMULAIRES ET VALIDATION
// ============================================

export interface FormField<T = any> {
  name: string;
  label: string;
  type: 'text' | 'number' | 'email' | 'date' | 'select' | 'textarea' | 'checkbox' | 'radio';
  value: T;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  options?: Array<{ value: any; label: string }>;
}

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean | string;
}

export interface FormErrors {
  [key: string]: string;
}

// ============================================
// MODALES ET DIALOGUES
// ============================================

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOutsideClick?: boolean;
  showCloseButton?: boolean;
}

export interface ConfirmDialogProps extends ModalProps {
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
  variant?: 'info' | 'warning' | 'danger';
}

// ============================================
// TABLEAUX ET LISTES
// ============================================

export interface Column<T = any> {
  key: keyof T | string;
  label: string;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
}

export interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  selectedRows?: ID[];
  onSelectionChange?: (ids: ID[]) => void;
}

// ============================================
// NOTIFICATIONS ET ALERTES
// ============================================

export interface ToastNotification {
  id: ID;
  type: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    handler: () => void;
  };
}

export interface Alert {
  id: ID;
  type: 'info' | 'warning' | 'error';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  timestamp: Timestamp;
  acknowledged?: boolean;
  resolved?: boolean;
}

// ============================================
// FICHIERS ET DOCUMENTS
// ============================================

export interface FileInfo {
  name: string;
  size: number;
  type: string;
  lastModified: number;
}

export interface UploadProgress {
  file: FileInfo;
  progress: number; // 0-100
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
}

export interface Document extends BaseEntity {
  nom: string;
  type: string;
  taille: number;
  url: string;
  thumbnailUrl?: string;
  category?: string;
  tags?: string[];
  entityType: string;
  entityId: ID;
  uploadedBy: ID;
  version?: number;
}

// ============================================
// PERMISSIONS ET SÉCURITÉ
// ============================================

export interface Permission {
  module: string;
  action: string;
  scope?: string;
}

export interface Role {
  id: ID;
  name: string;
  description?: string;
  permissions: Permission[];
}

// ============================================
// ACTIVITÉ ET HISTORIQUE
// ============================================

export interface Activity extends BaseEntity {
  type: string;
  userId: ID;
  userName: string;
  userAvatar?: string;
  entityType: string;
  entityId: ID;
  action: string;
  description: string;
  metadata?: Record<string, unknown>;
}

export interface ChangeLog {
  field: string;
  oldValue: any;
  newValue: any;
  changedBy: ID;
  changedAt: Timestamp;
}

// ============================================
// UTILITAIRES
// ============================================

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Nullable<T> = T | null;

export type Optional<T> = T | undefined;

export type AsyncFunction<T = void> = () => Promise<T>;

export type EventHandler<T = void> = (data: T) => void;

export type AsyncEventHandler<T = void> = (data: T) => Promise<void>;

// ============================================
// ÉTAT DE CHARGEMENT
// ============================================

export interface LoadingState {
  loading: boolean;
  error: string | null;
}

export interface DataState<T> extends LoadingState {
  data: T | null;
}

// ============================================
// CONTEXTE
// ============================================

export interface AppContext {
  user: User | null;
  bureau: string | null; // Code du bureau
  permissions: Permission[];
  theme: 'light' | 'dark';
  language: 'fr' | 'en';
}

// ============================================
// CONFIGURATION
// ============================================

export interface AppConfig {
  apiUrl: string;
  wsUrl?: string;
  uploadMaxSize: number;
  enableMocks: boolean;
  enableLogs: boolean;
  features: Record<string, boolean>;
}
