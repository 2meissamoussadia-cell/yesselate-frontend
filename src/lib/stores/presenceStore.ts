/**
 * Phase 3 #22 — Collaboration temps réel : présence (utilisateurs en ligne)
 * Store pour la liste des utilisateurs présents sur la vue (mock ou WebSocket plus tard)
 */

'use client';

import { create } from 'zustand';

export interface PresenceUser {
  id: string;
  name: string;
  avatar?: string;
  currentView?: string;
  lastSeen: string;
}

interface PresenceState {
  users: PresenceUser[];
  isConnected: boolean;
  setUsers: (users: PresenceUser[]) => void;
  setConnected: (connected: boolean) => void;
}

const MOCK_USERS: PresenceUser[] = [
  { id: 'u1', name: 'Marie Dupont', currentView: 'Pilotage / Dashboard', lastSeen: new Date().toISOString() },
  { id: 'u2', name: 'Jean Martin', currentView: 'Chantiers', lastSeen: new Date().toISOString() },
  { id: 'u3', name: 'Sophie Bernard', currentView: 'Gouvernance', lastSeen: new Date().toISOString() },
];

export const usePresenceStore = create<PresenceState>((set) => ({
  users: MOCK_USERS,
  isConnected: true,
  setUsers: (users) => set({ users }),
  setConnected: (isConnected) => set({ isConnected }),
}));
