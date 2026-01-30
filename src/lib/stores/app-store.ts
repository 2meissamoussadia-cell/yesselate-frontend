import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ============================================
// Store global de l'application
// Gère le thème (dark/light mode) et les 
// préférences utilisateur globales
// ============================================

interface AppState {
  // Theme
  darkMode: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (value: boolean) => void;
  
  // Sidebar global (peut être utilisé par tous les portails)
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (value: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Theme - Dark mode par défaut
      darkMode: true,
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
      setDarkMode: (value) => set({ darkMode: value }),
      
      // Sidebar - Fermé par défaut, ouvert via bouton hamburger
      sidebarOpen: false,
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (value) => set({ sidebarOpen: value }),
    }),
    {
      name: 'nice-renovation-app-storage',
      partialize: (state) => ({
        darkMode: state.darkMode,
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
);
