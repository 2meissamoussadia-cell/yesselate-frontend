/**
 * Index des Utilitaires
 * ======================
 * 
 * Export centralisé de tous les utilitaires BMO
 */

// Helpers
export {
  // Formatage
  formatCurrency,
  formatPercentage,
  formatDuration,
  formatRelativeTime,
  formatPhoneNumber,
  
  // Validation
  isValidEmail,
  isValidPhoneNumber,
  isValidAmount,
  
  // Manipulation de données
  sortBy,
  groupBy,
  paginate,
  searchInArray,
  
  // Dates
  isToday,
  isPast,
  daysBetween,
  addDays,
  
  // Fichiers
  formatFileSize,
  getFileExtension,
  getMimeType,
  
  // Couleurs
  stringToColor,
  getInitials,
  
  // Performance
  debounce,
  throttle,
  
  // Sécurité
  escapeHtml,
  generateId,
  
  // Copie
  copyToClipboard,
  deepClone,
} from './helpers';

