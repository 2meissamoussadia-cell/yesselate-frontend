/**
 * Hook pour gérer un cache persistant dans IndexedDB
 * Utilisé pour les données lourdes (KPIs, projets, bureaux, etc.)
 */

'use client';

import { useEffect, useRef, useCallback } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live en ms
}

const DB_NAME = 'yesselate-dashboard-cache';
const DB_VERSION = 1;
const STORE_NAME = 'cache';

let dbPromise: Promise<IDBDatabase> | null = null;

function openDB(): Promise<IDBDatabase> {
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

export function useIndexedDBCache<T>(key: string, ttl: number = 5 * 60 * 1000) {
  const cacheRef = useRef<CacheEntry<T> | null>(null);

  const get = useCallback(async (): Promise<T | null> => {
    try {
      const db = await openDB();
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(key);

      return new Promise((resolve, reject) => {
        request.onsuccess = () => {
          const entry = request.result as CacheEntry<T> | undefined;
          if (!entry) {
            resolve(null);
            return;
          }

          const now = Date.now();
          if (now - entry.timestamp > entry.ttl) {
            // Expiré, supprimer et retourner null
            const deleteTransaction = db.transaction([STORE_NAME], 'readwrite');
            deleteTransaction.objectStore(STORE_NAME).delete(key);
            resolve(null);
            return;
          }

          cacheRef.current = entry;
          resolve(entry.data);
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.warn('[IndexedDBCache] Erreur lors de la lecture:', error);
      return null;
    }
  }, [key]);

  const set = useCallback(async (data: T, customTtl?: number): Promise<void> => {
    try {
      const db = await openDB();
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        ttl: customTtl ?? ttl,
      };

      cacheRef.current = entry;
      store.put(entry, key);
    } catch (error) {
      console.warn('[IndexedDBCache] Erreur lors de l\'écriture:', error);
    }
  }, [key, ttl]);

  const invalidate = useCallback(async (): Promise<void> => {
    try {
      const db = await openDB();
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      transaction.objectStore(STORE_NAME).delete(key);
      cacheRef.current = null;
    } catch (error) {
      console.warn('[IndexedDBCache] Erreur lors de l\'invalidation:', error);
    }
  }, [key]);

  const clear = useCallback(async (): Promise<void> => {
    try {
      const db = await openDB();
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      transaction.objectStore(STORE_NAME).clear();
      cacheRef.current = null;
    } catch (error) {
      console.warn('[IndexedDBCache] Erreur lors du nettoyage:', error);
    }
  }, []);

  return {
    get,
    set,
    invalidate,
    clear,
    // Accès synchrone au cache en mémoire (pour éviter les re-renders)
    getSync: () => cacheRef.current?.data ?? null,
  };
}
