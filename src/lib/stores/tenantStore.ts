/**
 * Phase 4 — Multi-tenancy SaaS : contexte tenant
 * Store pour le tenant courant (mock : liste de tenants, switch)
 */

'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Tenant {
  id: string;
  name: string;
  slug: string;
}

const MOCK_TENANTS: Tenant[] = [
  { id: 't1', name: 'YESSALATE BTP', slug: 'default' },
  { id: 't2', name: 'Bureau NICE', slug: 'nice' },
  { id: 't3', name: 'Bureau MARSEILLE', slug: 'marseille' },
];

interface TenantState {
  currentTenantId: string;
  tenants: Tenant[];
  setCurrentTenant: (id: string) => void;
  currentTenant: () => Tenant | undefined;
}

export const useTenantStore = create<TenantState>()(
  persist(
    (set, get) => ({
      currentTenantId: 't1',
      tenants: MOCK_TENANTS,

      setCurrentTenant: (id) => set({ currentTenantId: id }),

      currentTenant: () => get().tenants.find((t) => t.id === get().currentTenantId),
    }),
    { name: 'yesselate-tenant-v1' }
  )
);
