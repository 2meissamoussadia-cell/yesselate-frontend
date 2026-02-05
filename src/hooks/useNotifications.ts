/**
 * Hook pour gérer les notifications - Validation Contrats
 * State management et actions pour notifications
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getNotifications,
  getUnreadNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllRead,
  subscribeToNotifications,
  type Notification,
} from '@/lib/services/notificationsApiService';
import { logger } from '@/lib/utils/logger';

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ================================
  // Fetch notifications
  // ================================
  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getNotifications();
      setNotifications(data);
      
      const count = await getUnreadCount();
      setUnreadCount(count);
    } catch (err) {
      setError('Erreur lors du chargement des notifications');
      logger.error('Error fetching notifications', err instanceof Error ? err : undefined, { component: 'useNotifications' });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ================================
  // Mark as read
  // ================================
  const handleMarkAsRead = useCallback(async (notificationId: string) => {
    try {
      await markAsRead(notificationId);
      
      // Update local state
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      logger.error('Error marking notification as read', err instanceof Error ? err : undefined, { component: 'useNotifications' });
    }
  }, []);

  // ================================
  // Mark all as read
  // ================================
  const handleMarkAllAsRead = useCallback(async () => {
    try {
      await markAllAsRead();
      
      // Update local state
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      logger.error('Error marking all as read', err instanceof Error ? err : undefined, { component: 'useNotifications' });
    }
  }, []);

  // ================================
  // Delete notification
  // ================================
  const handleDeleteNotification = useCallback(async (notificationId: string) => {
    try {
      await deleteNotification(notificationId);
      
      // Update local state
      setNotifications((prev) => {
        const notification = prev.find((n) => n.id === notificationId);
        if (notification && !notification.read) {
          setUnreadCount((count) => Math.max(0, count - 1));
        }
        return prev.filter((n) => n.id !== notificationId);
      });
    } catch (err) {
      logger.error('Error deleting notification', err instanceof Error ? err : undefined, { component: 'useNotifications' });
    }
  }, []);

  // ================================
  // Delete all read
  // ================================
  const handleDeleteAllRead = useCallback(async () => {
    try {
      await deleteAllRead();
      
      // Update local state
      setNotifications((prev) => prev.filter((n) => !n.read));
    } catch (err) {
      logger.error('Error deleting read notifications', err instanceof Error ? err : undefined, { component: 'useNotifications' });
    }
  }, []);

  // ================================
  // Refresh
  // ================================
  const refresh = useCallback(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // ================================
  // Initial load & real-time subscription
  // ================================
  useEffect(() => {
    fetchNotifications();

    // Subscribe to real-time notifications
    const unsubscribe = subscribeToNotifications((newNotification) => {
      setNotifications((prev) => [newNotification, ...prev]);
      if (!newNotification.read) {
        setUnreadCount((prev) => prev + 1);
      }
    });

    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
    };
  }, [fetchNotifications]);

  // ================================
  // Auto-refresh every 2 minutes
  // ================================
  useEffect(() => {
    const interval = setInterval(() => {
      fetchNotifications();
    }, 2 * 60 * 1000); // 2 minutes

    return () => clearInterval(interval);
  }, [fetchNotifications]);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead: handleMarkAsRead,
    markAllAsRead: handleMarkAllAsRead,
    deleteNotification: handleDeleteNotification,
    deleteAllRead: handleDeleteAllRead,
    refresh,
  };
}

