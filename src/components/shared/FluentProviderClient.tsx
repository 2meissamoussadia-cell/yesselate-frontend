'use client';

import * as React from 'react';
import { FluentProvider, webDarkTheme, webLightTheme } from '@fluentui/react-components';
import { useAppStore } from '@/lib/stores';

/** Thème fixe au premier rendu pour éviter hydration mismatch (darkMode vient du store persisté localStorage). */
export function FluentProviderClient({ children }: { children: React.ReactNode }) {
  const { darkMode } = useAppStore();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const theme = mounted ? (darkMode ? webDarkTheme : webLightTheme) : webDarkTheme;

  return <FluentProvider theme={theme}>{children}</FluentProvider>;
}


