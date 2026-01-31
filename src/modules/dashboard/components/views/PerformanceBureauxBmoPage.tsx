/**
 * Page Performance — Bureau BMO
 * Indicateurs du bureau BMO (délègue au composant partagé PerformanceBureauxSinglePage).
 */

'use client';

import React, { memo } from 'react';
import { PerformanceBureauxSinglePage } from './PerformanceBureauxSinglePage';

export const PerformanceBureauxBmoPage = memo(function PerformanceBureauxBmoPage(props: {
  data?: { bureau?: { code: string; label: string }; items?: unknown[]; total?: number } | null;
}) {
  return <PerformanceBureauxSinglePage data={props.data} defaultBureau={{ code: 'bmo', label: 'BMO' }} />;
});
