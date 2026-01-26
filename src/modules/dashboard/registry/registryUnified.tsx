/**
 * Registry unifié Dashboard v20
 * 
 * Fusionne intelligemment index.tsx et dashboardRegistry.tsx
 * Priorise les composants sur les renders inline
 * Utilise les loaders API avec fallback mock
 */

'use client';

import React from 'react';
import { ViewEntry, NavKey, navToKey } from '../types/dashboard';
import type { DashboardRegistry } from '../types/dashboardRegistryTypes';
import { dashboardRegistry as extendedRegistry } from './dashboardRegistry';
import { dashboardRegistry as simpleRegistry } from './index';
import { createLogger } from '../utils/logger';

const logger = createLogger('RegistryUnified');

/**
 * Merge intelligent des registries
 * Priorise les entrées avec composants sur les renders inline
 */
function mergeRegistries(): DashboardRegistry {
  const merged: DashboardRegistry = { ...extendedRegistry };
  
  // Fusionner les entrées de simpleRegistry qui ont des composants
  for (const [key, entry] of Object.entries(simpleRegistry)) {
    if (merged[key]) {
      // Si l'entrée existe déjà, prioriser celle avec un composant
      const existing = merged[key];
      const incoming = entry;
      
      // Si l'entrée entrante a un render qui est un composant React (pas inline)
      // et que l'existante a un render inline, remplacer
      if (incoming.render && typeof incoming.render === 'function') {
        // Vérifier si c'est un composant React (a une propriété displayName ou $$typeof)
        const isReactComponent = 
          incoming.render.displayName || 
          (incoming.render as any).$$typeof === Symbol.for('react.element');
        
        if (isReactComponent || !existing.render) {
          logger.debug(`Merging registry entry: ${key}`, { 
            key, 
            action: 'mergeRegistry',
            hasComponent: !!incoming.render 
          });
          merged[key] = {
            ...existing,
            ...incoming,
            // Garder le loader de l'existante si meilleur
            loader: existing.loader || incoming.loader,
          } as ViewEntry;
        }
      }
    } else {
      // Nouvelle entrée, l'ajouter
      merged[key] = entry as ViewEntry;
    }
  }
  
  return merged;
}

// Registry unifié
export const dashboardRegistry: DashboardRegistry = mergeRegistries();

// Ré-exporter pour compatibilité
export { navToKey };
export type { NavKey };
