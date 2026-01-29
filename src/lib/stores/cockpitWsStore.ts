/**
 * Store Zustand pour les événements WebSocket Cockpit (V5)
 * Dernier message, file des N derniers (replay après reconnect), dispatch urgent pour toasts/son.
 */

import { create } from 'zustand';

export interface CockpitWsMessage {
  type: string;
  data: Record<string, unknown>;
  timestamp: string;
}

const MAX_RECENT = 50;

interface CockpitWsState {
  lastMessage: CockpitWsMessage | null;
  recentMessages: CockpitWsMessage[];
  addMessage: (message: CockpitWsMessage) => void;
  clear: () => void;
}

export const useCockpitWsStore = create<CockpitWsState>((set) => ({
  lastMessage: null,
  recentMessages: [],

  addMessage: (message) => {
    set((state) => {
      const recent = [message, ...state.recentMessages].slice(0, MAX_RECENT);
      return {
        lastMessage: message,
        recentMessages: recent,
      };
    });
    const isUrgent =
      message.type === 'cockpit_emergency' ||
      message.type === 'emergency:alert' ||
      message.type === 'cockpit_alert';
    if (isUrgent && typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('cockpit-urgent', { detail: message })
      );
    }
  },

  clear: () =>
    set({ lastMessage: null, recentMessages: [] }),
}));
