/**
 * Module Offline — Stockage IndexedDB pour le Cockpit DG (briefing, prédictions).
 * Données lues en mode hors ligne, synchronisées au retour en ligne.
 */

import { createLogger } from '../utils/logger';

export interface StoredEntry<T> {
  data: T;
  timestamp: number;
}

const DB_NAME = 'dashboard-offline-v1';
const DB_VERSION = 1;
const STORE_NAME = 'cockpit';

const OFFLINE_TTL_MS = 24 * 60 * 60 * 1000; // 24h en cache offline

let dbPromise: Promise<IDBDatabase> | null = null;

function openDB(): Promise<IDBDatabase> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('IndexedDB only in browser'));
  }
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });

  return dbPromise;
}

function getEntry<T>(key: string): Promise<StoredEntry<T> | null> {
  return openDB().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction([STORE_NAME], 'readonly');
        const req = tx.objectStore(STORE_NAME).get(key);
        req.onsuccess = () => resolve((req.result as StoredEntry<T> | undefined) ?? null);
        req.onerror = () => reject(req.error);
      })
  );
}

function setEntry<T>(key: string, data: T): Promise<void> {
  const entry: StoredEntry<T> = { data, timestamp: Date.now() };
  return openDB().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction([STORE_NAME], 'readwrite');
        tx.objectStore(STORE_NAME).put(entry, key);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      })
  );
}

function isExpired(entry: StoredEntry<unknown>): boolean {
  return Date.now() - entry.timestamp > OFFLINE_TTL_MS;
}

export const COCKPIT_OFFLINE_KEYS = {
  briefing: 'cockpit:briefing',
  predictions: 'cockpit:predictions',
} as const;

/** Récupère le briefing depuis le cache offline (ou null si absent/expiré). */
export async function getBriefingFromOffline(): Promise<StoredEntry<unknown> | null> {
  try {
    const entry = await getEntry<unknown>(COCKPIT_OFFLINE_KEYS.briefing);
    if (!entry || isExpired(entry)) return null;
    return entry;
  } catch {
    return null;
  }
}

/** Enregistre le briefing dans le cache offline. */
export async function setBriefingOffline(data: unknown): Promise<void> {
  try {
    await setEntry(COCKPIT_OFFLINE_KEYS.briefing, data);
  } catch (e) {
    if (process.env.NODE_ENV === 'development') {
      createLogger('OfflineStore').warn('setBriefingOffline failed', { action: 'setBriefingOffline', error: e });
    }
  }
}

/** Récupère les prédictions depuis le cache offline (ou null si absent/expiré). */
export async function getPredictionsFromOffline(): Promise<StoredEntry<unknown> | null> {
  try {
    const entry = await getEntry<unknown>(COCKPIT_OFFLINE_KEYS.predictions);
    if (!entry || isExpired(entry)) return null;
    return entry;
  } catch {
    return null;
  }
}

/** Enregistre les prédictions dans le cache offline. */
export async function setPredictionsOffline(data: unknown): Promise<void> {
  try {
    await setEntry(COCKPIT_OFFLINE_KEYS.predictions, data);
  } catch (e) {
    if (process.env.NODE_ENV === 'development') {
      createLogger('OfflineStore').warn('setPredictionsOffline failed', { action: 'setPredictionsOffline', error: e });
    }
  }
}
