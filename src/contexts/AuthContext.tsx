/**
 * Auth Context & Hook
 * ====================
 * 
 * Gestion complète de l'authentification et des permissions utilisateur
 */

'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { logger } from '@/lib/utils/logger';

// ============================================
// TYPES
// ============================================

export type UserRole = 'admin' | 'manager' | 'user' | 'readonly';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  permissions: string[];
  avatar?: string;
  department?: string;
  position?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: UserRole | UserRole[]) => boolean;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

// ============================================
// CONTEXT
// ============================================

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================
// PROVIDER
// ============================================

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  // ============================================
  // INITIALIZE AUTH
  // ============================================
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      // Vérifier le token dans localStorage
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
        return;
      }

      // Valider le token avec l'API
      // TODO: Remplacer par l'appel API réel
      const user = await mockValidateToken(token);

      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('auth_token');
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'Session expirée',
      });
    }
  };

  // ============================================
  // LOGIN
  // ============================================
  const login = useCallback(async (email: string, password: string) => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      // TODO: Remplacer par l'appel API réel
      const { user, token } = await mockLogin(email, password);

      // Sauvegarder le token
      localStorage.setItem('auth_token', token);

      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: error.message || 'Échec de la connexion',
      });
      throw error;
    }
  }, []);

  // ============================================
  // LOGOUT
  // ============================================
  const logout = useCallback(async () => {
    try {
      // TODO: Appeler l'API de logout si nécessaire
      await mockLogout();

      // Nettoyer le localStorage
      localStorage.removeItem('auth_token');

      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }, []);

  // ============================================
  // REFRESH USER
  // ============================================
  const refreshUser = useCallback(async () => {
    await checkAuth();
  }, []);

  // ============================================
  // CHECK PERMISSION
  // ============================================
  const hasPermission = useCallback(
    (permission: string): boolean => {
      if (!state.user) return false;
      
      // Admin a toutes les permissions
      if (state.user.role === 'admin') return true;

      return state.user.permissions.includes(permission);
    },
    [state.user]
  );

  // ============================================
  // CHECK ROLE
  // ============================================
  const hasRole = useCallback(
    (role: UserRole | UserRole[]): boolean => {
      if (!state.user) return false;

      const roles = Array.isArray(role) ? role : [role];
      return roles.includes(state.user.role);
    },
    [state.user]
  );

  // ============================================
  // UPDATE PROFILE
  // ============================================
  const updateProfile = useCallback(async (data: Partial<User>) => {
    try {
      if (!state.user) throw new Error('Non authentifié');

      setState((prev) => ({ ...prev, isLoading: true }));

      // TODO: Remplacer par l'appel API réel
      const updatedUser = await mockUpdateProfile(state.user.id, data);

      setState((prev) => ({
        ...prev,
        user: updatedUser,
        isLoading: false,
      }));
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error.message,
      }));
      throw error;
    }
  }, [state.user]);

  // ============================================
  // CONTEXT VALUE
  // ============================================
  const value: AuthContextType = {
    ...state,
    login,
    logout,
    refreshUser,
    hasPermission,
    hasRole,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ============================================
// HOOK
// ============================================

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// ============================================
// MOCKS (À REMPLACER PAR DES APPELS API RÉELS)
// ============================================

async function mockValidateToken(token: string): Promise<User> {
  // Simuler délai réseau
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Mock user basé sur le token
  return {
    id: 'user-1',
    email: 'admin@yesselate.com',
    firstName: 'Moussa',
    lastName: 'Diallo',
    role: 'admin',
    permissions: ['*'],
    avatar: undefined,
    department: 'Direction',
    position: 'Directeur Général',
  };
}

async function mockLogin(email: string, password: string): Promise<{ user: User; token: string }> {
  // Simuler délai réseau
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Validation basique
  if (!email || !password) {
    throw new Error('Email et mot de passe requis');
  }

  // Mock credentials
  const mockUsers: Record<string, { password: string; user: User }> = {
    'admin@yesselate.com': {
      password: 'admin123',
      user: {
        id: 'user-1',
        email: 'admin@yesselate.com',
        firstName: 'Moussa',
        lastName: 'Diallo',
        role: 'admin',
        permissions: ['*'],
        department: 'Direction',
        position: 'Directeur Général',
      },
    },
    'manager@yesselate.com': {
      password: 'manager123',
      user: {
        id: 'user-2',
        email: 'manager@yesselate.com',
        firstName: 'Aïcha',
        lastName: 'Traoré',
        role: 'manager',
        permissions: ['projets.read', 'projets.write', 'clients.read', 'employes.read'],
        department: 'Projets',
        position: 'Chef de Projet',
      },
    },
    'user@yesselate.com': {
      password: 'user123',
      user: {
        id: 'user-3',
        email: 'user@yesselate.com',
        firstName: 'Ibrahima',
        lastName: 'Sow',
        role: 'user',
        permissions: ['projets.read', 'clients.read'],
        department: 'Bureau d\'Études',
        position: 'Ingénieur',
      },
    },
  };

  const mockData = mockUsers[email];

  if (!mockData || mockData.password !== password) {
    throw new Error('Email ou mot de passe incorrect');
  }

  return {
    user: mockData.user,
    token: `mock-token-${Date.now()}`,
  };
}

async function mockLogout(): Promise<void> {
  // Simuler délai réseau
  await new Promise((resolve) => setTimeout(resolve, 300));
  logger.debug('User logged out', { component: 'AuthContext' });
}

async function mockUpdateProfile(userId: string, data: Partial<User>): Promise<User> {
  // Simuler délai réseau
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Mock update
  return {
    id: userId,
    email: data.email || 'admin@yesselate.com',
    firstName: data.firstName || 'Moussa',
    lastName: data.lastName || 'Diallo',
    role: data.role || 'admin',
    permissions: data.permissions || ['*'],
    avatar: data.avatar,
    department: data.department,
    position: data.position,
  };
}

// ============================================
// HELPER COMPONENTS
// ============================================

/**
 * Protected Route - Redirige si non authentifié
 */
interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: UserRole | UserRole[];
  requiredPermission?: string;
  fallback?: ReactNode;
}

export function ProtectedRoute({
  children,
  requiredRole,
  requiredPermission,
  fallback,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, hasRole, hasPermission } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return fallback || <div>Non authentifié - Redirection...</div>;
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return fallback || <div>Accès refusé - Rôle insuffisant</div>;
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return fallback || <div>Accès refusé - Permission manquante</div>;
  }

  return <>{children}</>;
}

/**
 * Conditional render based on permission
 */
interface CanProps {
  permission: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export function Can({ permission, children, fallback }: CanProps) {
  const { hasPermission } = useAuth();

  if (!hasPermission(permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
