/**
 * Router de contenu pour le module Audit
 */

'use client';

import React from 'react';
import type { AuditMainCategory } from '../types/auditNavigationTypes';
import { AuditContentRouter as OldAuditContentRouter } from '@/components/features/bmo/audit/command-center/AuditContentRouter';

interface AuditContentRouterProps {
  mainCategory: AuditMainCategory;
  subCategory?: string;
  subSubCategory?: string;
}

export function AuditContentRouter({ mainCategory, subCategory, subSubCategory }: AuditContentRouterProps) {
  // Utiliser l'ancien router pour l'instant, mais avec les nouvelles props
  // TODO: Adapter l'ancien router pour accepter les nouvelles props ou créer des pages spécifiques
  return <OldAuditContentRouter category={mainCategory} subCategory={subCategory ?? ''} />;
}

