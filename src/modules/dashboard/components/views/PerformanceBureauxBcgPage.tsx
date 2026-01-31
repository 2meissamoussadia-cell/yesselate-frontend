/**
 * Page Performance — Bureau BCG
 */

'use client';

import React, { memo } from 'react';
import { PerformanceBureauxSinglePage } from './PerformanceBureauxSinglePage';

export const PerformanceBureauxBcgPage = memo(function PerformanceBureauxBcgPage(props: {
  data?: { bureau?: { code: string; label: string }; items?: unknown[]; total?: number } | null;
}) {
  return <PerformanceBureauxSinglePage data={props.data} defaultBureau={{ code: 'bcg', label: 'BCG' }} />;
});
