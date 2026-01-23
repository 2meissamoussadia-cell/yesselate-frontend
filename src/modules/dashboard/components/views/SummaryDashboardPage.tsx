/**
 * Page Dashboard principal (Synthèse)
 * Affiche la vue d'ensemble complète du dashboard avec KPIs, actions, risques, etc.
 */

'use client';

import React from 'react';
import { OverviewView } from '@/components/features/bmo/dashboard/command-center/views/OverviewView';

export default function SummaryDashboardPage() {
  return <OverviewView />;
}

