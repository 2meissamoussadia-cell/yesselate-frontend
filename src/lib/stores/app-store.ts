import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ============================================
// Store global de l'application
// Gère le thème (dark/light mode) et les 
// préférences utilisateur globales
// ============================================

/** Locales supportées (FR / EN / AR) */
export type SupportedLocale = 'fr-FR' | 'en-GB' | 'ar-MA';

/** Taille du texte BMO (page, modules, sections) */
export type BmoFontSizeScale = 'small' | 'medium' | 'large';

interface AppState {
  // Theme
  darkMode: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (value: boolean) => void;
  
  // Sidebar global (peut être utilisé par tous les portails)
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (value: boolean) => void;
  
  // Locale préférée (sélecteur FR/EN/AR). null = utiliser la locale serveur.
  localeOverride: SupportedLocale | null;
  setLocaleOverride: (value: SupportedLocale | null) => void;

  // Taille du texte BMO (topbar, pages, modules, sections)
  fontSizeScale: BmoFontSizeScale;
  setFontSizeScale: (value: BmoFontSizeScale) => void;
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
      
      // Locale - null = serveur
      localeOverride: null,
      setLocaleOverride: (value) => set({ localeOverride: value }),

      // Taille du texte BMO
      fontSizeScale: 'medium',
      setFontSizeScale: (value) => set({ fontSizeScale: value }),
    }),
    {
      name: 'nice-renovation-app-storage',
      partialize: (state) => ({
        darkMode: state.darkMode,
        sidebarOpen: state.sidebarOpen,
        localeOverride: state.localeOverride,
        fontSizeScale: state.fontSizeScale,
      }),
    }
  )
);
