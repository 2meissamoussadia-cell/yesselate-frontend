import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export { formatFCFA, formatFCFAWithCurrency, parseMoney } from './format-currency';
export { parseFRDate, formatFRDate, formatISODate, isDateInRange } from './format-date';
export { exportFacturesAsCSV, exportDataAsCSV } from './export';
export {
  calculateBCPendingAmount,
  calculateBCValidatedAmount,
  calculateBMOTotalImpact,
  calculateBMOStats,
  type BMOStats,
} from './bmo-stats';
export { buildWorkInboxItems } from './work-inbox-builder';
export { verifyDecisionHash, useHashVerification } from './verifyHash';
export { sanitizeTextForComment, sanitizeHtmlForDisplay, sanitizeHighlightHtml } from './sanitize';