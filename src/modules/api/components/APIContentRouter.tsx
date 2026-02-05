/**
 * Router de contenu pour le module API
 */

'use client';

import React from 'react';
import type { APIMainCategory } from '../types/apiNavigationTypes';
import { AnalyticsContentRouter as OldAPIContentRouter } from '@/components/features/bmo/analytics/command-center/AnalyticsContentRouter';

interface APIContentRouterProps {
  mainCategory: APIMainCategory;
  subCategory?: string;
  subSubCategory?: string;
}

export function APIContentRouter({ mainCategory, subCategory }: APIContentRouterProps) {
  return <OldAPIContentRouter category={mainCategory} subCategory={subCategory ?? 'overview'} />;
}

