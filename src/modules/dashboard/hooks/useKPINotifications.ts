/**
 * Hook pour gérer les notifications de changements de KPIs
 * Extrait de DashboardContent pour améliorer la maintenabilité
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export interface KPINotification {
  id: string;
  label: string;
  oldValue: string | number;
  newValue: string | number;
  timestamp: Date;
}

interface UseKPINotificationsOptions {
  maxNotifications?: number;
  autoDismissMs?: number;
}

export function useKPINotifications({
  maxNotifications = 10,
  autoDismissMs = 5000,
}: UseKPINotificationsOptions = {}) {
  const [notifications, setNotifications] = useState<KPINotification[]>([]);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);
  
  // Cleanup des timeouts au démontage
  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(clearTimeout);
      timeoutsRef.current = [];
    };
  }, []);
  
  // Ajouter une notification
  const addNotification = useCallback((notification: Omit<KPINotification, 'id' | 'timestamp'>) => {
    const newNotification: KPINotification = {
      ...notification,
      id: `${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
    };
    
    setNotifications(prev => {
      const updated = [...prev, newNotification];
      return updated.slice(-maxNotifications);
    });
    
    // Auto-dismiss après autoDismissMs
    const timeoutId = setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
    }, autoDismissMs);
    
    timeoutsRef.current.push(timeoutId);
  }, [maxNotifications, autoDismissMs]);
  
  // Ajouter plusieurs notifications
  const addNotifications = useCallback((newNotifications: Omit<KPINotification, 'id' | 'timestamp'>[]) => {
    const notificationsWithIds: KPINotification[] = newNotifications.map(notif => ({
      ...notif,
      id: `${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
    }));
    
    setNotifications(prev => {
      const updated = [...prev, ...notificationsWithIds];
      return updated.slice(-maxNotifications);
    });
    
    // Auto-dismiss pour chaque notification
    notificationsWithIds.forEach(notification => {
      const timeoutId = setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== notification.id));
      }, autoDismissMs);
      
      timeoutsRef.current.push(timeoutId);
    });
  }, [maxNotifications, autoDismissMs]);
  
  // Supprimer une notification
  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);
  
  // Supprimer toutes les notifications
  const dismissAll = useCallback(() => {
    setNotifications([]);
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);
  
  // Détecter les changements dans une liste de KPIs
  const detectChanges = useCallback((
    currentKPIs: Array<{ label: string; value: string | number }>,
    previousKPIs: Array<{ label: string; value: string | number }> | null
  ) => {
    if (!previousKPIs || previousKPIs.length !== currentKPIs.length) {
      return;
    }
    
    const changes: Omit<KPINotification, 'id' | 'timestamp'>[] = [];
    
    currentKPIs.forEach((kpi, index) => {
      const previousKpi = previousKPIs[index];
      if (previousKpi && previousKpi.value !== kpi.value) {
        changes.push({
          label: kpi.label,
          oldValue: previousKpi.value,
          newValue: kpi.value,
        });
      }
    });
    
    if (changes.length > 0) {
      addNotifications(changes);
    }
  }, [addNotifications]);
  
  return {
    notifications,
    addNotification,
    addNotifications,
    dismissNotification,
    dismissAll,
    detectChanges,
    hasNotifications: notifications.length > 0,
    count: notifications.length,
  };
}
