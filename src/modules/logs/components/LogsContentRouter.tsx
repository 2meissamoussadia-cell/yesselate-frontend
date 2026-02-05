/**
 * Router de contenu pour le module Logs
 */

'use client';

import React from 'react';
import type { LogsMainCategory } from '../types/logsNavigationTypes';
import { LogsContentRouter as OldLogsContentRouter } from '@/components/features/bmo/logs/command-center/LogsContentRouter';

interface LogsContentRouterProps {
  mainCategory: LogsMainCategory;
  subCategory?: string;
  subSubCategory?: string;
}

export function LogsContentRouter({ mainCategory, subCategory, subSubCategory }: LogsContentRouterProps) {
  // Utiliser l'ancien router pour l'instant, mais avec les nouvelles props
  // TODO: Adapter l'ancien router pour accepter les nouvelles props ou créer des pages spécifiques
  return <OldLogsContentRouter category={mainCategory} subCategory={subCategory ?? ''} />;
}

