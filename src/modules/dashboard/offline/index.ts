/**
 * Module Offline — IndexedDB + sync pour le dashboard / Cockpit DG.
 */

export {
  getBriefingFromOffline,
  setBriefingOffline,
  getPredictionsFromOffline,
  setPredictionsOffline,
  COCKPIT_OFFLINE_KEYS,
} from './offlineStore';
export type { StoredEntry } from './offlineStore';
