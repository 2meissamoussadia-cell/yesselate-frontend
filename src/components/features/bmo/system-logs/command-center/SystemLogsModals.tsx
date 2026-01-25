/**
 * Modales du System Logs Command Center
 * Routeur pour toutes les modales : log-detail, export, integrity-scan, incident-detail, etc.
 */

'use client';

import React from 'react';
import { useSystemLogsCommandCenterStore } from '@/lib/stores/systemLogsCommandCenterStore';
import { LogDetailModal } from './modals/LogDetailModal';
// Les autres modals seront créées séparément
// import { ExportModal } from './modals/ExportModal';
// import { IntegrityScanModal } from './modals/IntegrityScanModal';
// import { IncidentDetailModal } from './modals/IncidentDetailModal';

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

  // Export Modal (à créer)
  if (modal.type === 'export') {
    // return <ExportModal open={true} onClose={closeModal} format={modal.data?.format} />;
    return null; // TODO: Créer ExportModal
  }

  // Integrity Scan Modal (à créer)
  if (modal.type === 'integrity-scan') {
    // return <IntegrityScanModal open={true} onClose={closeModal} />;
    return null; // TODO: Créer IntegrityScanModal
  }

  // Incident Detail Modal (à créer)
  if (modal.type === 'incident-detail') {
    // return <IncidentDetailModal open={true} onClose={closeModal} incidentId={modal.data?.incidentId} />;
    return null; // TODO: Créer IncidentDetailModal
  }

  // Stats Modal (à créer)
  if (modal.type === 'stats') {
    return null; // TODO: Créer StatsModal
  }

  // Settings Modal (à créer)
  if (modal.type === 'settings') {
    return null; // TODO: Créer SettingsModal
  }

  // Shortcuts Modal (à créer)
  if (modal.type === 'shortcuts') {
    return null; // TODO: Créer ShortcutsModal
  }

  return null;
}

