/**
 * STORE: Paramètres Workspace - Pattern Pilotage
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ParametresTabType = 'general' | 'security' | 'notifications' | 'integrations' | 'permissions' | 'backup' | 'dashboard';

export interface ParametresTab { id: string; type: ParametresTabType; title: string; icon: string; data: Record<string, unknown>; closable?: boolean; }

interface ParametresWorkspaceState {
  tabs: ParametresTab[]; activeTabId: string | null;
  commandPaletteOpen: boolean; directionPanelOpen: boolean;
  openTab: (tab: Omit<ParametresTab, 'id'> & { id?: string }) => void; closeTab: (tabId: string) => void; setActiveTab: (tabId: string) => void;
  setCommandPaletteOpen: (open: boolean) => void; setDirectionPanelOpen: (open: boolean) => void;
  reset: () => void;
}

const defaultTabs: ParametresTab[] = [{ id: 'general', type: 'general', title: 'Général', icon: '⚙️', data: {}, closable: false }];

export const useParametresWorkspaceStore = create<ParametresWorkspaceState>()(
  persist((set, get) => ({
    tabs: defaultTabs, activeTabId: 'general',
    commandPaletteOpen: false, directionPanelOpen: false,
    openTab: (tab) => { const id = tab.id || `${tab.type}:${Date.now()}`; if (get().tabs.find(t => t.id === id)) { set({ activeTabId: id }); return; } set((s) => ({ tabs: [...s.tabs, { ...tab, id, closable: tab.closable ?? true }], activeTabId: id })); },
    closeTab: (tabId) => { const { tabs, activeTabId } = get(); const tab = tabs.find(t => t.id === tabId); if (!tab || tab.closable === false) return; const newTabs = tabs.filter(t => t.id !== tabId); let newActiveId = activeTabId; if (activeTabId === tabId) { const idx = tabs.findIndex(t => t.id === tabId); newActiveId = newTabs[Math.min(idx, newTabs.length - 1)]?.id || null; } set({ tabs: newTabs, activeTabId: newActiveId }); },
    setActiveTab: (tabId) => { if (get().tabs.find(t => t.id === tabId)) set({ activeTabId: tabId }); },
    setCommandPaletteOpen: (o) => set({ commandPaletteOpen: o }),
    setDirectionPanelOpen: (o) => set({ directionPanelOpen: o }),
    reset: () => set({ tabs: defaultTabs, activeTabId: 'general', commandPaletteOpen: false }),
  }), { name: 'parametres:workspace' })
);

