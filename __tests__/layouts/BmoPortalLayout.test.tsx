/**
 * Tests BmoPortalLayout — shell partagé (portals) maître-ouvrage / BMO.
 * Vérifie : rendu des enfants, structure, providers.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { BmoPortalLayout } from '@/components/bmo/layout/BmoPortalLayout';

const mockSetShowNotifications = jest.fn();

jest.mock('@/lib/stores/bmo-store', () => ({
  useBMOStore: (selector: (s: unknown) => unknown) => {
    const state = {
      showNotifications: false,
      setShowNotifications: mockSetShowNotifications,
    };
    return typeof selector === 'function' ? selector(state) : state;
  },
}));

jest.mock('@/lib/stores/app-store', () => ({
  useAppStore: () => ({
    darkMode: false,
  }),
}));

jest.mock('@/components/bmo/layout/BmoLayoutShell', () => ({
  BmoLayoutShell: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="bmo-layout-shell">{children}</div>
  ),
}));

jest.mock('@/components/navigation/PageTemplate', () => ({
  PageTemplate: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="page-template">{children}</div>
  ),
}));

jest.mock('@/components/shared/FluentProviderClient', () => ({
  FluentProviderClient: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="fluent-provider">{children}</div>
  ),
}));

jest.mock('@/components/ui/toast', () => ({
  ToastProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="toast-provider">{children}</div>
  ),
}));

jest.mock('sonner', () => ({
  Toaster: () => <div data-testid="toaster" />,
}));

jest.mock('@/components/notifications', () => ({
  NotificationPanel: () => <div data-testid="notification-panel" />,
}));

jest.mock('@/components/shared/OfflineBanner', () => ({
  OfflineBanner: () => <div data-testid="offline-banner" />,
}));

describe('BmoPortalLayout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders children inside shell and page template', () => {
    render(
      <BmoPortalLayout>
        <span data-testid="portal-child">Contenu portail</span>
      </BmoPortalLayout>
    );

    expect(screen.getByTestId('fluent-provider')).toBeInTheDocument();
    expect(screen.getByTestId('offline-banner')).toBeInTheDocument();
    expect(screen.getByTestId('toast-provider')).toBeInTheDocument();
    expect(screen.getByTestId('bmo-layout-shell')).toBeInTheDocument();
    expect(screen.getByTestId('page-template')).toBeInTheDocument();
    expect(screen.getByTestId('portal-child')).toBeInTheDocument();
    expect(screen.getByTestId('portal-child')).toHaveTextContent('Contenu portail');
  });

  it('renders notification panel and toaster', () => {
    render(<BmoPortalLayout><div>Child</div></BmoPortalLayout>);

    expect(screen.getByTestId('notification-panel')).toBeInTheDocument();
    expect(screen.getByTestId('toaster')).toBeInTheDocument();
  });
});
