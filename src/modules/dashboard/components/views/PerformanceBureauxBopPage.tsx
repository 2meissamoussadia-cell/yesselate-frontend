/**
 * Page Performance — Bureau BOP
 */

'use client';

import React, { memo } from 'react';
import { PerformanceBureauxSinglePage } from './PerformanceBureauxSinglePage';

export const PerformanceBureauxBopPage = memo(function PerformanceBureauxBopPage(props: {
  data?: { bureau?: { code: string; label: string }; items?: unknown[]; total?: number } | null;
}) {
  return <PerformanceBureauxSinglePage data={props.data} defaultBureau={{ code: 'bop', label: 'BOP' }} />;
});
