/**
 * Page Performance — Bureau BRC
 */

'use client';

import React, { memo } from 'react';
import { PerformanceBureauxSinglePage } from './PerformanceBureauxSinglePage';

export const PerformanceBureauxBrcPage = memo(function PerformanceBureauxBrcPage(props: {
  data?: { bureau?: { code: string; label: string }; items?: unknown[]; total?: number } | null;
}) {
  return <PerformanceBureauxSinglePage data={props.data} defaultBureau={{ code: 'brc', label: 'BRC' }} />;
});
