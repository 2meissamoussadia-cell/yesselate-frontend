/**
 * Hook pour détecter et gérer les notifications de changements de KPIs
 * Détecte les changements de valeurs et crée des notifications
 * Auto-dismiss après 5 secondes
 */

'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import type { KPINotification } from '@/modules/dashboard/components/KPINotifications';

interface UseKPINotificationsOptions {
  maxNotifications?: number;
  autoDismissMs?: number;
}

interface UseKPINotificationsReturn {
  notifications: KPINotification[];
  addNotification: (notification: KPINotification) => void;
  dismissNotification: (id: string) => void;
  clearAll: () => void;
}

export function useKPINotifications({
  maxNotifications = 10,
  autoDismissMs = 5000,
}: UseKPINotificationsOptions = {}): UseKPINotificationsReturn {
  const [notifications, setNotifications] = useState<KPINotification[]>([]);
  const timeoutRefs = useRef<Map<string, number>>(new Map());

  // Fonction pour ajouter une notification
  const addNotification = (notification: KPINotification) => {
    setNotifications((prev) => {
      const updated = [...prev, notification];
      return updated.slice(-maxNotifications); // Garder seulement les N dernières
    });

    // Auto-dismiss après autoDismissMs
    const timeoutId = window.setTimeout(() => {
      dismissNotification(notification.id);
    }, autoDismissMs);

    timeoutRefs.current.set(notification.id, timeoutId);
  };

  // Fonction pour supprimer une notification
  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    
    // Nettoyer le timeout si existe
    const timeoutId = timeoutRefs.current.get(id);
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutRefs.current.delete(id);
    }
  };

  // Fonction pour tout effacer
  const clearAll = () => {
    // Nettoyer tous les timeouts
    timeoutRefs.current.forEach((timeoutId) => clearTimeout(timeoutId));
    timeoutRefs.current.clear();
    setNotifications([]);
  };

  // Cleanup au démontage
  useEffect(() => {
    return () => {
      timeoutRefs.current.forEach((timeoutId) => clearTimeout(timeoutId));
      timeoutRefs.current.clear();
    };
  }, []);

  return {
    notifications,
    addNotification,
    dismissNotification,
    clearAll,
  };
}

/**
 * Hook pour détecter les changements de KPIs et créer des notifications automatiquement
 */
interface UseKPIDiffOptions {
  currentKpis: Array<{ label: string; value: string | number }>;
  onChangesDetected?: (changes: KPINotification[]) => void;
}

export function useKPIDiff({ currentKpis, onChangesDetected }: UseKPIDiffOptions) {
  const previousKpisRef = useRef<typeof currentKpis | null>(null);
  const hasInitializedRef = useRef(false);
  const allKpisKeyRef = useRef<string>('');

  // Mémoriser la clé de comparaison pour éviter les recalculs
  const currentKpisKey = useMemo(
    () => currentKpis.map((k) => `${k.label}:${k.value}`).join('|'),
    [currentKpis]
  );

  useEffect(() => {
    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true;
      // Créer une clé stable pour la première initialisation
      allKpisKeyRef.current = currentKpisKey;
      previousKpisRef.current = currentKpis;
      return;
    }

    // Comparaison profonde pour éviter les déclenchements inutiles
    // Si les valeurs sont identiques, ne rien faire (même si la référence change)
    if (currentKpisKey === allKpisKeyRef.current) {
      // Ne PAS mettre à jour previousKpisRef.current si les valeurs sont identiques
      // Cela évite de créer une nouvelle référence qui déclencherait le useEffect à nouveau
      return;
    }

    // Les valeurs ont changé, mettre à jour la clé et la référence
    allKpisKeyRef.current = currentKpisKey;
    const prev = previousKpisRef.current;
    previousKpisRef.current = currentKpis; // ✅ IMPORTANT: on "commit" le snapshot TOUT DE SUITE

    if (prev === null || prev.length !== currentKpis.length) return;

    const changes: KPINotification[] = [];

    currentKpis.forEach((kpi, index) => {
      const previousKpi = prev[index];
      if (previousKpi && previousKpi.value !== kpi.value) {
        changes.push({
          id: `${Date.now()}-${index}-${Math.random()}`,
          label: kpi.label,
          oldValue: previousKpi.value,
          newValue: kpi.value,
          timestamp: new Date(),
        });
      }
    });

    if (changes.length > 0 && onChangesDetected) {
      onChangesDetected(changes);
    }
  }, [currentKpisKey, currentKpis, onChangesDetected]);
}
