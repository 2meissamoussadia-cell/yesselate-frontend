import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Types d'onglets disponibles
export type ProjectTabType = 'inbox' | 'project' | 'wizard' | 'analytics' | 'search';

export interface ProjectTab {
  id: string;
  type: ProjectTabType;
  title: string;
  icon: string;
  data?: Record<string, unknown>;
  pinned?: boolean;
  modified?: boolean;
}

interface ProjectWorkspaceState {
  tabs: ProjectTab[];
  activeTabId: string | null;
  
  // Actions
  openTab: (tab: ProjectTab) => void;
  closeTab: (tabId: string) => void;
  closeOtherTabs: (tabId: string) => void;
  closeAllTabs: () => void;
  setActiveTab: (tabId: string) => void;
  updateTab: (tabId: string, updates: Partial<ProjectTab>) => void;
  pinTab: (tabId: string) => void;
  unpinTab: (tabId: string) => void;
  reorderTabs: (fromIndex: number, toIndex: number) => void;
  
  // Navigation
  nextTab: () => void;
  previousTab: () => void;
}

export const useProjectWorkspaceStore = create<ProjectWorkspaceState>()(
  persist(
    (set, get) => ({
      tabs: [],
      activeTabId: null,

      openTab: (tab: ProjectTab) => {
        const { tabs, activeTabId } = get();
        const existing = tabs.find((t) => t.id === tab.id);

        if (existing) {
          // Si l'onglet existe déjà, on l'active
          set({ activeTabId: tab.id });
        } else {
          // Sinon on l'ajoute
          set({
            tabs: [...tabs, tab],
            activeTabId: tab.id,
          });
        }
      },

      closeTab: (tabId: string) => {
        const { tabs, activeTabId } = get();
        const index = tabs.findIndex((t) => t.id === tabId);

        if (index === -1) return;

        const newTabs = tabs.filter((t) => t.id !== tabId);
        let newActiveId = activeTabId;

        // Si on ferme l'onglet actif, on active le suivant ou le précédent
        if (activeTabId === tabId) {
          if (newTabs.length === 0) {
            newActiveId = null;
          } else if (index < newTabs.length) {
            newActiveId = newTabs[index].id;
          } else {
            newActiveId = newTabs[index - 1].id;
          }
        }

        set({
          tabs: newTabs,
          activeTabId: newActiveId,
        });
      },

      closeOtherTabs: (tabId: string) => {
        const { tabs } = get();
        const tab = tabs.find((t) => t.id === tabId);
        if (!tab) return;

        set({
          tabs: [tab],
          activeTabId: tabId,
        });
      },

      closeAllTabs: () => {
        set({
          tabs: [],
          activeTabId: null,
        });
      },

      setActiveTab: (tabId: string) => {
        const { tabs } = get();
        const exists = tabs.some((t) => t.id === tabId);
        if (exists) {
          set({ activeTabId: tabId });
        }
      },

      updateTab: (tabId: string, updates: Partial<ProjectTab>) => {
        const { tabs } = get();
        set({
          tabs: tabs.map((t) => (t.id === tabId ? { ...t, ...updates } : t)),
        });
      },

      pinTab: (tabId: string) => {
        const { tabs } = get();
        set({
          tabs: tabs.map((t) => (t.id === tabId ? { ...t, pinned: true } : t)),
        });
      },

      unpinTab: (tabId: string) => {
        const { tabs } = get();
        set({
          tabs: tabs.map((t) => (t.id === tabId ? { ...t, pinned: false } : t)),
        });
      },

      reorderTabs: (fromIndex: number, toIndex: number) => {
        const { tabs } = get();
        const newTabs = [...tabs];
        const [moved] = newTabs.splice(fromIndex, 1);
        newTabs.splice(toIndex, 0, moved);
        set({ tabs: newTabs });
      },

      nextTab: () => {
        const { tabs, activeTabId } = get();
        if (tabs.length === 0) return;

        const currentIndex = tabs.findIndex((t) => t.id === activeTabId);
        const nextIndex = (currentIndex + 1) % tabs.length;
        set({ activeTabId: tabs[nextIndex].id });
      },

      previousTab: () => {
        const { tabs, activeTabId } = get();
        if (tabs.length === 0) return;

        const currentIndex = tabs.findIndex((t) => t.id === activeTabId);
        const previousIndex = currentIndex === 0 ? tabs.length - 1 : currentIndex - 1;
        set({ activeTabId: tabs[previousIndex].id });
      },
    }),
    {
      name: 'bmo-project-workspace',
      partialize: (state) => ({
        // On persiste seulement les tabs et l'activeTabId
        tabs: state.tabs.filter((t) => t.pinned), // Ne persiste que les onglets épinglés
        activeTabId: null, // On ne restaure pas l'onglet actif au démarrage
      }),
    }
  )
);

