import { useEffect, useState, useCallback } from 'react';
import { logger } from '@/lib/utils/logger';

export interface DelegationPreferences {
  autoRefresh: boolean;
  refreshInterval: number; // en ms
  defaultView: 'dashboard' | 'active' | 'expiring_soon';
  exportFormat: 'csv' | 'json' | 'pdf';
  showBanner: boolean;
  compactMode: boolean;
  theme: 'light' | 'dark' | 'auto';
  notificationsEnabled: boolean;
  soundEnabled: boolean;
}

const DEFAULT_PREFERENCES: DelegationPreferences = {
  autoRefresh: true,
  refreshInterval: 60000, // 1 minute
  defaultView: 'dashboard',
  exportFormat: 'csv',
  showBanner: true,
  compactMode: false,
  theme: 'auto',
  notificationsEnabled: true,
  soundEnabled: false,
};

const STORAGE_KEY = 'delegation:preferences';

/**
 * Hook pour gérer les préférences utilisateur avec persistance localStorage
 * Synchronise automatiquement entre les onglets/fenêtres
 */
export function useUserPreferences() {
  const [preferences, setPreferencesState] = useState<DelegationPreferences>(() => {
    if (typeof window === 'undefined') return DEFAULT_PREFERENCES;
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...DEFAULT_PREFERENCES, ...parsed };
      }
    } catch (error) {
      logger.error('Error loading preferences', error instanceof Error ? error : undefined, { component: 'useUserPreferences' });
    }
    
    return DEFAULT_PREFERENCES;
  });

  // Sauvegarder dans localStorage
  const saveToStorage = useCallback((prefs: DelegationPreferences) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch (error) {
      logger.error('Error saving preferences', error instanceof Error ? error : undefined, { component: 'useUserPreferences' });
    }
  }, []);

  // Mettre à jour les préférences
  const setPreferences = useCallback((updates: Partial<DelegationPreferences>) => {
    setPreferencesState(prev => {
      const newPrefs = { ...prev, ...updates };
      saveToStorage(newPrefs);
      return newPrefs;
    });
  }, [saveToStorage]);

  // Réinitialiser aux valeurs par défaut
  const resetPreferences = useCallback(() => {
    setPreferencesState(DEFAULT_PREFERENCES);
    saveToStorage(DEFAULT_PREFERENCES);
  }, [saveToStorage]);

  // Synchroniser entre onglets
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setPreferencesState({ ...DEFAULT_PREFERENCES, ...parsed });
        } catch (error) {
          logger.error('Error parsing storage event', error instanceof Error ? error : undefined, { component: 'useUserPreferences' });
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Helpers individuels mémorisés
  const setAutoRefresh = useCallback((enabled: boolean) => 
    setPreferences({ autoRefresh: enabled }), [setPreferences]);
  
  const setRefreshInterval = useCallback((interval: number) => 
    setPreferences({ refreshInterval: interval }), [setPreferences]);
  
  const setDefaultView = useCallback((view: DelegationPreferences['defaultView']) => 
    setPreferences({ defaultView: view }), [setPreferences]);
  
  const setExportFormat = useCallback((format: DelegationPreferences['exportFormat']) => 
    setPreferences({ exportFormat: format }), [setPreferences]);
  
  const setCompactMode = useCallback((enabled: boolean) => 
    setPreferences({ compactMode: enabled }), [setPreferences]);
  
  const setTheme = useCallback((theme: DelegationPreferences['theme']) => 
    setPreferences({ theme }), [setPreferences]);
  
  const setNotificationsEnabled = useCallback((enabled: boolean) => 
    setPreferences({ notificationsEnabled: enabled }), [setPreferences]);
  
  const setSoundEnabled = useCallback((enabled: boolean) => 
    setPreferences({ soundEnabled: enabled }), [setPreferences]);

  return {
    preferences,
    setPreferences,
    resetPreferences,
    setAutoRefresh,
    setRefreshInterval,
    setDefaultView,
    setExportFormat,
    setCompactMode,
    setTheme,
    setNotificationsEnabled,
    setSoundEnabled,
  };
}

