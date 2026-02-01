'use client';

import React from 'react';
import { LayoutDashboard, FileText, ClipboardList, Wallet, CreditCard } from 'lucide-react';
import { PortalModuleCleanLayout } from '@/components/bmo/layout/PortalModuleCleanLayout';
import type { PortalModuleTab } from '@/components/bmo/layout/PortalModuleCleanLayout';
import { engagementsFinancesSubNav } from '@/lib/navigation/subnav/engagementsFinances';

const iconByTabId: Record<string, typeof FileText> = {
  overview: LayoutDashboard,
  requests: FileText,
  orders: ClipboardList,
  invoices: FileText,
  payments: CreditCard,
};

const engagementsTabs: PortalModuleTab[] = (engagementsFinancesSubNav.tabs ?? []).map((tab: { id: string; label: string; path?: string }) => {
  const path = tab.path ?? `/maitre-ouvrage/engagements/${tab.id}`;
  const icon = iconByTabId[tab.id] ?? Wallet;
  return { id: tab.id, label: tab.label, path, icon };
});

export default function EngagementsLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalModuleCleanLayout title={engagementsFinancesSubNav.title} tabs={engagementsTabs}>
      {children}
    </PortalModuleCleanLayout>
  );
}
