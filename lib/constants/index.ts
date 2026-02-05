/**
 * Constantes Globales BMO
 * ========================
 * 
 * Constantes réutilisables dans toute l'application
 */

// ============================================
// STATUTS
// ============================================

export const STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  BLOCKED: 'blocked',
  ON_HOLD: 'on_hold',
} as const;

export type Status = (typeof STATUS)[keyof typeof STATUS];

// ============================================
// PRIORITÉS
// ============================================

export const PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
  CRITICAL: 'critical',
} as const;

export type Priority = (typeof PRIORITY)[keyof typeof PRIORITY];

// ============================================
// RÔLES UTILISATEUR
// ============================================

export const USER_ROLE = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  EMPLOYEE: 'employee',
  GUEST: 'guest',
  DIRECTOR: 'directeur',
  CONTROLLER: 'controleur_budget',
  ENGINEER: 'ingenieur',
  ACCOUNTANT: 'comptable',
  LAWYER: 'juriste',
  PROJECT_MANAGER: 'chef_projet',
} as const;

export type UserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE];

// ============================================
// TYPES DE MODULES
// ============================================

export const MODULE_TYPE = {
  TICKETS_CLIENTS: 'tickets-clients',
  CLIENTS: 'clients',
  PROJETS: 'projets',
  FINANCES: 'finances',
  RECOUVREMENTS: 'recouvrements',
  LITIGES: 'litiges',
  EMPLOYES: 'employes',
  MISSIONS: 'missions',
  DELEGATIONS: 'delegations',
  RH: 'rh',
  ECHANGES: 'echanges-bureaux',
  DECISIONS: 'decisions',
  AUDIT: 'audit',
  LOGS: 'logs',
  PARAMETRES: 'parametres',
  VALIDATION_BC: 'validation-bc',
  CONTRATS: 'contrats',
  PAIEMENTS: 'paiements',
} as const;

export type ModuleType = (typeof MODULE_TYPE)[keyof typeof MODULE_TYPE];

// ============================================
// ACTIONS DISPONIBLES
// ============================================

export const ACTION_TYPE = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  VALIDATE: 'validate',
  REJECT: 'reject',
  APPROVE: 'approve',
  ASSIGN: 'assign',
  COMMENT: 'comment',
  EXPORT: 'export',
  ARCHIVE: 'archive',
  RESTORE: 'restore',
} as const;

export type ActionType = (typeof ACTION_TYPE)[keyof typeof ACTION_TYPE];

// ============================================
// FORMATS D'EXPORT
// ============================================

export const EXPORT_FORMAT = {
  CSV: 'csv',
  EXCEL: 'excel',
  PDF: 'pdf',
  JSON: 'json',
} as const;

export type ExportFormat = (typeof EXPORT_FORMAT)[keyof typeof EXPORT_FORMAT];

// ============================================
// TYPES DE NOTIFICATIONS
// ============================================

export const NOTIFICATION_TYPE = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
} as const;

export type NotificationType = (typeof NOTIFICATION_TYPE)[keyof typeof NOTIFICATION_TYPE];

// ============================================
// TYPES D'ALERTES
// ============================================

export const ALERT_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const;

export type AlertSeverity = (typeof ALERT_SEVERITY)[keyof typeof ALERT_SEVERITY];

// ============================================
// TYPES DE DOCUMENTS
// ============================================

export const DOCUMENT_CATEGORY = {
  TECHNIQUE: 'technique',
  ADMINISTRATIF: 'administratif',
  FINANCIER: 'financier',
  JURIDIQUE: 'juridique',
  RH: 'rh',
  AUTRE: 'autre',
} as const;

export type DocumentCategory = (typeof DOCUMENT_CATEGORY)[keyof typeof DOCUMENT_CATEGORY];

// ============================================
// LIMITES ET CONTRAINTES
// ============================================

export const LIMITS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10 MB
  MAX_UPLOAD_FILES: 5,
  MAX_COMMENT_LENGTH: 2000,
  MAX_DESCRIPTION_LENGTH: 500,
  MAX_TITLE_LENGTH: 100,
  MIN_PASSWORD_LENGTH: 8,
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
  REQUEST_TIMEOUT: 30000, // 30 secondes
} as const;

// ============================================
// COULEURS PAR MODULE
// ============================================

export const MODULE_COLORS = {
  [MODULE_TYPE.TICKETS_CLIENTS]: {
    primary: 'purple',
    icon: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
  },
  [MODULE_TYPE.CLIENTS]: {
    primary: 'cyan',
    icon: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/30',
  },
  [MODULE_TYPE.PROJETS]: {
    primary: 'blue',
    icon: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
  },
  [MODULE_TYPE.FINANCES]: {
    primary: 'emerald',
    icon: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
  },
  [MODULE_TYPE.RECOUVREMENTS]: {
    primary: 'amber',
    icon: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
  },
  [MODULE_TYPE.LITIGES]: {
    primary: 'red',
    icon: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
  },
  [MODULE_TYPE.EMPLOYES]: {
    primary: 'teal',
    icon: 'text-teal-400',
    bg: 'bg-teal-500/10',
    border: 'border-teal-500/30',
  },
  [MODULE_TYPE.MISSIONS]: {
    primary: 'cyan',
    icon: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/30',
  },
  [MODULE_TYPE.ECHANGES]: {
    primary: 'violet',
    icon: 'text-violet-400',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/30',
  },
  [MODULE_TYPE.DECISIONS]: {
    primary: 'rose',
    icon: 'text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/30',
  },
  [MODULE_TYPE.AUDIT]: {
    primary: 'cyan',
    icon: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/30',
  },
  [MODULE_TYPE.LOGS]: {
    primary: 'slate',
    icon: 'text-slate-400',
    bg: 'bg-slate-500/10',
    border: 'border-slate-500/30',
  },
} as const;

// ============================================
// ICÔNES PAR MODULE
// ============================================

export const MODULE_ICONS = {
  [MODULE_TYPE.TICKETS_CLIENTS]: '🎫',
  [MODULE_TYPE.CLIENTS]: '👥',
  [MODULE_TYPE.PROJETS]: '📊',
  [MODULE_TYPE.FINANCES]: '💰',
  [MODULE_TYPE.RECOUVREMENTS]: '💳',
  [MODULE_TYPE.LITIGES]: '⚖️',
  [MODULE_TYPE.EMPLOYES]: '👤',
  [MODULE_TYPE.MISSIONS]: '📋',
  [MODULE_TYPE.DELEGATIONS]: '🔄',
  [MODULE_TYPE.RH]: '🧑‍💼',
  [MODULE_TYPE.ECHANGES]: '💬',
  [MODULE_TYPE.DECISIONS]: '✅',
  [MODULE_TYPE.AUDIT]: '🔍',
  [MODULE_TYPE.LOGS]: '📝',
  [MODULE_TYPE.PARAMETRES]: '⚙️',
} as const;

// ============================================
// MESSAGES PAR DÉFAUT
// ============================================

export const DEFAULT_MESSAGES = {
  LOADING: 'Chargement en cours...',
  ERROR: 'Une erreur est survenue',
  SUCCESS: 'Opération réussie',
  NO_DATA: 'Aucune donnée disponible',
  CONFIRM_DELETE: 'Êtes-vous sûr de vouloir supprimer cet élément ?',
  CONFIRM_ACTION: 'Êtes-vous sûr de vouloir effectuer cette action ?',
  SAVED: 'Modifications enregistrées',
  CANCELLED: 'Opération annulée',
  UNAUTHORIZED: 'Vous n\'avez pas les permissions nécessaires',
  SESSION_EXPIRED: 'Votre session a expiré',
} as const;

// ============================================
// ERROR BOUNDARIES — titres et libellés a11y (LAYOUT_UI_GAPS)
// ============================================

export const ERROR_BOUNDARY = {
  /** Titre erreur globale (app/error.tsx) */
  GLOBAL_TITLE: 'Une erreur est survenue',
  /** Message par défaut erreur globale */
  GLOBAL_FALLBACK: 'Erreur inattendue. Veuillez réessayer.',
  /** Titre erreur segment (dashboard, portail, etc.) */
  SEGMENT_TITLE: 'Erreur de chargement',
  /** Message par défaut erreur segment */
  SEGMENT_FALLBACK: 'Cette vue n’a pas pu être chargée. Veuillez réessayer.',
  /** Titre erreur portail maître-ouvrage */
  PORTAL_TITLE: 'Erreur du portail',
  /** Message par défaut erreur portail */
  PORTAL_FALLBACK: 'Une erreur est survenue. Veuillez réessayer.',
} as const;

/** Libellés accessibilité pour les boutons des error boundaries */
export const ARIA_LABELS = {
  RETRY: 'Réessayer le chargement',
} as const;

/** Libellés accessibilité pour les états de chargement (loading) */
export const LOADING_LABELS = {
  ROOT: "Chargement de l'application",
} as const;

/** Messages et libellés pour les pages 404 (not-found) */
export const NOT_FOUND = {
  TITLE: 'Page introuvable',
  DESCRIPTION: 'La page demandée n’existe pas ou a été déplacée.',
  BACK_LABEL: 'Retour à l’accueil',
  BACK_ARIA: 'Retour à la page d’accueil',
} as const;

// ============================================
// REGEX PATTERNS
// ============================================

export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_SN: /^7[0-8]\d{7}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
  URL: /^https?:\/\/.+/,
  NUMBER: /^\d+$/,
  DECIMAL: /^\d+\.?\d*$/,
} as const;

// ============================================
// DÉLAIS ET TIMEOUTS
// ============================================

export const TIMEOUTS = {
  TOAST: 3000, // 3 secondes
  SHORT: 1000, // 1 seconde
  MEDIUM: 3000, // 3 secondes
  LONG: 5000, // 5 secondes
  REQUEST: 30000, // 30 secondes
  POLLING: 10000, // 10 secondes
  DEBOUNCE: 300, // 300ms
  THROTTLE: 1000, // 1 seconde
} as const;

// ============================================
// PAGINATION
// ============================================

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
  MAX_PAGE_SIZE: 100,
} as const;

// ============================================
// SHORTCUTS CLAVIER
// ============================================

export const KEYBOARD_SHORTCUTS = {
  SEARCH: 'Ctrl+K',
  SAVE: 'Ctrl+S',
  NEW: 'Ctrl+N',
  CLOSE: 'Escape',
  SUBMIT: 'Ctrl+Enter',
  HELP: 'F1',
} as const;

