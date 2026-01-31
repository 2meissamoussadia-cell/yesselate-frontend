/**
 * Page Performance — Bureau BJ
 */

'use client';

import React, { memo } from 'react';
import { PerformanceBureauxSinglePage } from './PerformanceBureauxSinglePage';

export const PerformanceBureauxBjPage = memo(function PerformanceBureauxBjPage(props: {
  data?: { bureau?: { code: string; label: string }; items?: unknown[]; total?: number } | null;
}) {
  return <PerformanceBureauxSinglePage data={props.data} defaultBureau={{ code: 'bj', label: 'BJ' }} />;
});
