'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { DynamicSidebar } from './DynamicSidebar';
import { DynamicSubnav } from './DynamicSubnav';
import { DashboardBreadcrumbs } from './DashboardBreadcrumbs';
import { DashboardKPIBar } from './DashboardKPIBar';
import { DashboardViewRouter } from './DashboardViewRouter';
import { DashboardFooter } from './DashboardFooter';
import { DashboardModals } from './DashboardModals';
import { DashboardNotifications, useDashboardNotifications } from './DashboardNotifications';
import { AlertNotifications } from './AlertNotifications';
import { DashboardAISuggestionsPanel } from './shared/DashboardAISuggestionsPanel';
import { AchievementsPanel } from './shared/AchievementsPanel';
import { TenantSwitcher } from './shared/TenantSwitcher';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { useDashboardCommandCenterStore } from '@/lib/stores/dashboardCommandCenterStore';
import { useAchievementsStore } from '@/lib/stores/achievementsStore';
import { useI18n } from '@/lib/i18n';
import { cn } from '@/lib/cn';
import { useAuthHeaders } from '../utils/getAuthHeaders';
import { useVoiceCommands } from '../hooks/useVoiceCommands';
import { useDashboardLive } from '../hooks/useDashboardLive';

export function DashboardCommandCenterPage() {
  const nav = useDashboardCommandCenterStore((s) => s.navigation);
  const openModal = useDashboardCommandCenterStore((s) => s.openModal);
  const liveStats = useDashboardCommandCenterStore((s) => s.liveStats);
  const displayConfig = useDashboardCommandCenterStore((s) => s.displayConfig);
  const setDisplayConfig = useDashboardCommandCenterStore((s) => s.setDisplayConfig);
  const { locale, currency } = useI18n();
  const authHeaders = useAuthHeaders();
  const { notifications, dismissNotification, markAsRead } = useDashboardNotifications();

  const lastUpdateDate = liveStats.lastUpdate ? new Date(liveStats.lastUpdate) : new Date();
  const focusMode = displayConfig.focusMode ?? false;
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const { supported: voiceSupported, listening: voiceListening, startListening, stopListening } = useVoiceCommands(voiceEnabled);
  const { isConnected: wsConnected } = useDashboardLive({ enabled: true });
  const onVoiceToggle = useCallback(() => {
    const next = !voiceEnabled;
    setVoiceEnabled(next);
    if (next) {
      startListening();
      unlockAchievement('voice_command');
    } else stopListening();
  }, [voiceEnabled, startListening, stopListening, unlockAchievement]);

  // Phase 4 : débloquer badge "Première connexion" au premier chargement
  const unlockAchievement = useAchievementsStore((s) => s.unlock);
  useEffect(() => {
    unlockAchievement('first_login');
  }, [unlockAchievement]);

  // ? ouvre l'aide Raccourcis (hors champs de saisie)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== '?' || e.ctrlKey || e.metaKey || e.altKey) return;
      const target = e.target as HTMLElement;
      const tag = target?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || target?.getAttribute?.('contenteditable') === 'true') return;
      e.preventDefault();
      openModal('shortcuts');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [openModal]);

  // Phase 2 #11: Ctrl+Shift+F toggle mode Focus (masque sidebar + header simplifié)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'f' && e.key !== 'F') return;
      if (!e.ctrlKey && !e.metaKey) return;
      if (!e.shiftKey) return;
      const target = e.target as HTMLElement;
      const tag = target?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || target?.getAttribute?.('contenteditable') === 'true') return;
      e.preventDefault();
      const nextFocus = !displayConfig.focusMode;
      setDisplayConfig({ focusMode: nextFocus });
      if (nextFocus) unlockAchievement('focus_mode');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [displayConfig.focusMode, setDisplayConfig, unlockAchievement]);

  const incrementExportCount = useAchievementsStore((s) => s.incrementExportCount);

  const onExport = useCallback(async (format: 'csv' | 'json' | 'pdf' | 'excel') => {
    // Phase P12.b: Mapper 'excel' vers 'xlsx' pour le format natif
    const apiFormat = format === 'excel' ? 'xlsx' : format;
    
    const params = new URLSearchParams({
      main: nav.mainCategory || 'pilotage',
      format: apiFormat,
    });
    if (nav.subCategory) params.set('sub', nav.subCategory);
    if (nav.subSubCategory) params.set('leaf', nav.subSubCategory);

    // Phase P12.b: Ajouter locale/currency pour formats XLSX/PDF (formatage localisé)
    if (apiFormat === 'xlsx' || apiFormat === 'pdf') {
      params.set('locale', locale);
      params.set('currency', currency);
    }

    const res = await fetch(`/api/export/dashboard?${params.toString()}`, {
      headers: authHeaders,
    });
    if (!res.ok) throw new Error('Export failed');
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const cd = res.headers.get('Content-Disposition') ?? '';
    const match = /filename="([^"]+)"/.exec(cd);
    a.href = url;
    a.download = match?.[1] ?? `export.${format === 'excel' ? 'xlsx' : format}`;
    a.click();
    URL.revokeObjectURL(url);
    incrementExportCount();
  }, [nav, locale, currency, authHeaders, incrementExportCount]);

  return (
    <div
      className={
        "relative flex h-screen w-full text-slate-100 " +
        "bg-slate-950 " +
        "bg-[radial-gradient(1200px_circle_at_20%_0%,rgba(56,189,248,.10),transparent_42%)," +
        "radial-gradient(900px_circle_at_80%_10%,rgba(167,139,250,.08),transparent_45%)]"
      }
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:linear-gradient(to_right,rgba(255,255,255,.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,.08)_1px,transparent_1px)] [background-size:72px_72px]" />

      <div className="relative flex h-full w-full">
        {/* Sidebar — masqué en mode Focus (#11) */}
        {!focusMode && <DynamicSidebar />}

        {/* Main */}
        <main className="flex min-w-0 flex-1 flex-col" role="main" aria-label="Contenu principal du tableau de bord">
          {/* Header — masqué ou simplifié en mode Focus (#11) */}
          {!focusMode ? (
            <header className="sticky top-0 z-[30] border-b border-slate-800/60 bg-slate-950/70 backdrop-blur-xl min-w-0">
              <div className="mx-auto w-full min-w-0 max-w-[1600px] px-4 sm:px-6 lg:px-8">
                <div className="py-4">
                  <div className="flex items-center justify-between gap-2">
                    <DashboardBreadcrumbs />
                    <TenantSwitcher className="hidden sm:flex shrink-0" />
                  </div>
                  <div className="mt-3">
                    <DashboardKPIBar onExport={onExport} />
                  </div>
                </div>
                <div className="pb-3">
                  <DynamicSubnav />
                </div>
              </div>
            </header>
          ) : (
            <header className="sticky top-0 z-[30] border-b border-slate-800/60 bg-slate-950/70 backdrop-blur-xl min-w-0 px-4 py-2 flex items-center justify-between">
              <span className="text-xs text-slate-400">Mode Focus — contenu uniquement</span>
              <button
                type="button"
                onClick={() => setDisplayConfig({ focusMode: false })}
                className="text-xs px-3 py-1.5 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-800/60 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
                aria-label="Quitter le mode Focus"
              >
                Quitter Focus (Ctrl+Shift+F)
              </button>
            </header>
          )}

          {/* Content — overflow-x-hidden pour éviter scroll horizontal (manquement #3) */}
          <div className="flex-1 min-w-0 overflow-x-hidden overflow-y-auto">
            <div className="mx-auto w-full min-w-0 max-w-[1600px] px-4 sm:px-6 lg:px-8 py-6 overflow-x-hidden">
              <ErrorBoundary>
                <DashboardViewRouter />
              </ErrorBoundary>
            </div>
            {/* Phase 3 #10 : Suggestions IA — Phase 4 : Succès (gamification) */}
            <div className="mx-auto w-full min-w-0 max-w-[1600px] px-4 sm:px-6 lg:px-8 pb-2 flex flex-col sm:flex-row gap-4">
              <div className="flex-1 min-w-0">
                <DashboardAISuggestionsPanel />
              </div>
              <div className="w-full sm:w-80 flex-shrink-0">
                <AchievementsPanel />
              </div>
            </div>
            <DashboardFooter
              lastUpdate={lastUpdateDate}
              wsConnected={wsConnected}
              onToggleFocus={() => setDisplayConfig({ focusMode: !focusMode })}
              focusMode={focusMode}
              showPresence
              voiceSupported={voiceSupported}
              voiceListening={voiceListening}
              onVoiceToggle={onVoiceToggle}
            />
          </div>
        </main>

        {/* Modals globaux (KPI drill-down, raccourcis, etc.) */}
        <DashboardModals />

        {/* Notifications / drawer */}
        <DashboardNotifications
          notifications={notifications}
          onDismiss={dismissNotification}
          onMarkAsRead={markAsRead}
        />
        {/* Phase P15: Intégration alertes dans notifications */}
        <AlertNotifications />
      </div>
    </div>
  );
}
