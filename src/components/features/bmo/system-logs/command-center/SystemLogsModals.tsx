/**
 * Modales du System Logs Command Center
 * Routeur pour toutes les modales : log-detail, export, integrity-scan, incident-detail, etc.
 */

'use client';

import React from 'react';
import { useSystemLogsCommandCenterStore } from '@/lib/stores/systemLogsCommandCenterStore';
import { LogDetailModal } from './modals/LogDetailModal';
import { ExportModal } from './modals/ExportModal';
import { IntegrityScanModal } from './modals/IntegrityScanModal';
import { IncidentDetailModal } from './modals/IncidentDetailModal';
import { StatsModal } from './modals/StatsModal';
import { SettingsModal } from './modals/SettingsModal';
import { ShortcutsModal } from './modals/ShortcutsModal';

export function SystemLogsModals() {
  const { modal, closeModal } = useSystemLogsCommandCenterStore();

  if (!modal.isOpen || !modal.type) return null;

  // Log Detail Modal
  if (modal.type === 'log-detail') {
    return (
      <LogDetailModal
        open={true}
        onClose={closeModal}
        logId={(modal.data?.logId as string) || null}
        onNext={modal.data?.onNext}
        onPrevious={modal.data?.onPrevious}
        canNavigateNext={modal.data?.canNavigateNext}
        canNavigatePrevious={modal.data?.canNavigatePrevious}
      />
    );
  }

  if (modal.type === 'export') {
    return (
      <ExportModal
        open={true}
        onClose={closeModal}
        format={(modal.data?.format as 'json' | 'csv' | 'xlsx') || 'json'}
      />
    );
  }

  if (modal.type === 'integrity-scan') {
    return <IntegrityScanModal open={true} onClose={closeModal} />;
  }

  if (modal.type === 'incident-detail') {
    return (
      <IncidentDetailModal
        open={true}
        onClose={closeModal}
        incidentId={(modal.data?.incidentId as string) ?? undefined}
      />
    );
  }

  if (modal.type === 'stats') {
    return <StatsModal open={true} onClose={closeModal} />;
  }

  if (modal.type === 'settings') {
    return <SettingsModal open={true} onClose={closeModal} />;
  }

  if (modal.type === 'shortcuts') {
    return <ShortcutsModal open={true} onClose={closeModal} />;
  }

  return null;
}

