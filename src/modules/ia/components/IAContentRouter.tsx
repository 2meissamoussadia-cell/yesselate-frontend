/**
 * Router de contenu pour le module IA
 */

'use client';

import React from 'react';
import type { IAMainCategory } from '../types/iaNavigationTypes';
import { IAContentRouter as OldIAContentRouter } from '@/components/features/bmo/ia/command-center/IAContentRouter';

interface IAContentRouterProps {
  category?: IAMainCategory;
  mainCategory?: IAMainCategory;
  subCategory?: string;
  subSubCategory?: string;
}

export function IAContentRouter({ category, mainCategory, subCategory, subSubCategory }: IAContentRouterProps) {
  const resolvedCategory = category ?? mainCategory;
  if (!resolvedCategory) return null;
  return <OldIAContentRouter category={resolvedCategory} />;
}

