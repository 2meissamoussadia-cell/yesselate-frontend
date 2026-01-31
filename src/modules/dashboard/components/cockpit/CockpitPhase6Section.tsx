/**
 * Phase 6 — Section Photos GPS + Plan AR + Pointage QR + Drone
 * Onglets : Photos GPS | Plan AR | Pointage QR | Drone
 */

'use client';

import React, { useState } from 'react';
import { ImageIcon, Layers, QrCode, Video } from 'lucide-react';
import { cn } from '@/lib/utils';
import { colors } from '../../utils/dashboardDesignTokens';
import { CockpitPhotosGpsPanel } from './CockpitPhotosGpsPanel';
import { CockpitPlanARPanel } from './CockpitPlanARPanel';
import { CockpitPointageQRPanel } from './CockpitPointageQRPanel';
import { CockpitDroneFeedPanel } from './CockpitDroneFeedPanel';
import { DashboardPanel } from '../shared/DashboardPanel';

const TABS = [
  { id: 'photos', label: 'Photos GPS', icon: ImageIcon },
  { id: 'plan-ar', label: 'Plan AR', icon: Layers },
  { id: 'pointage', label: 'Pointage QR', icon: QrCode },
  { id: 'drone', label: 'Drone', icon: Video },
] as const;

type TabId = (typeof TABS)[number]['id'];

export function CockpitPhase6Section() {
  const [activeTab, setActiveTab] = useState<TabId>('photos');

  return (
    <DashboardPanel padding="md" className="min-h-[320px]">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">Phase 6</span>
        <h3 className="text-slate-100 font-semibold text-base">Photos GPS · Plan AR · Pointage · Drone</h3>
      </div>

      <div className="flex flex-wrap gap-1 border-b border-slate-800/60 mb-4 min-w-0 overflow-x-hidden">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={cn(
              'shrink-0 flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 -mb-px transition-colors',
              activeTab === id
                ? 'border-blue-500 text-blue-400 bg-blue-500/10'
                : cn(colors.border.default, 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40')
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </button>
        ))}
      </div>

      <div className="min-h-[240px]">
        {activeTab === 'photos' && <CockpitPhotosGpsPanel />}
        {activeTab === 'plan-ar' && <CockpitPlanARPanel />}
        {activeTab === 'pointage' && <CockpitPointageQRPanel />}
        {activeTab === 'drone' && <CockpitDroneFeedPanel />}
      </div>
    </DashboardPanel>
  );
}
