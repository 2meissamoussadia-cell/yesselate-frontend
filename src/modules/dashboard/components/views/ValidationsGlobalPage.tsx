/**
 * Page Vue globale (Validations - Performance)
 * ✅ Amélioré avec layout responsive
 */

'use client';

import React, { memo } from 'react';
import { DashboardPageShell } from '../shared/DashboardPageShell';
import { DashboardPanel } from '../shared/DashboardPanel';

export const ValidationsGlobalPage = memo(function ValidationsGlobalPage() {
  return (
    <DashboardPageShell
      title="Validations — Vue globale"
      subtitle="Performance & KPIs (vue d’ensemble)"
    >
      <DashboardPanel className="p-4 sm:p-6">
        <p className="text-sm text-slate-300">
          À compléter : KPIs, suivi des validations, goulets et actions associées.
        </p>
      </DashboardPanel>
    </DashboardPageShell>
  );
});

