/**
 * Tests BmoLayoutShell — shell BMO (sidebar, topbar, main).
 * Vérifie : SkipLink, main#main-content, role="main", structure.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { BmoLayoutShell } from '@/components/bmo/layout/BmoLayoutShell';

jest.mock('@/lib/stores/app-store', () => ({
  useAppStore: () => ({
    sidebarOpen: true,
    toggleSidebar: jest.fn(),
    fontSizeScale: 'medium',
  }),
}));

jest.mock('@lib-root/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { nom: 'Dupont', prenom: 'Jean', role: 'manager' },
  }),
}));

jest.mock('@/components/bmo/navigation/BmoSidebar', () => ({
  BmoSidebar: () => <aside data-testid="bmo-sidebar">Sidebar</aside>,
}));

jest.mock('@/components/bmo/navigation/BmoTopbar', () => ({
  BmoTopbar: () => <header data-testid="bmo-topbar">Topbar</header>,
}));

jest.mock('@/components/ui/skip-link', () => ({
  SkipLink: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href} data-testid="skip-link">{children}</a>
  ),
}));

jest.mock('@/lib/design-tokens', () => ({
  SIDEBAR_MOBILE_BREAKPOINT: 1024,
  SIDEBAR_WIDTH_CLASS: { collapsed: 'w-16', expanded: 'w-64' },
}));

describe('BmoLayoutShell', () => {
  it('renders SkipLink with href #main-content', () => {
    render(
      <BmoLayoutShell>
        <div>Contenu</div>
      </BmoLayoutShell>
    );

    const skipLink = screen.getByTestId('skip-link');
    expect(skipLink).toBeInTheDocument();
    expect(skipLink).toHaveAttribute('href', '#main-content');
    expect(skipLink).toHaveTextContent('Aller au contenu');
  });

  it('renders main with id main-content and role main', () => {
    render(
      <BmoLayoutShell>
        <span data-testid="main-child">Contenu principal</span>
      </BmoLayoutShell>
    );

    const main = screen.getByRole('main');
    expect(main).toBeInTheDocument();
    expect(main).toHaveAttribute('id', 'main-content');
    expect(screen.getByTestId('main-child')).toBeInTheDocument();
    expect(screen.getByTestId('main-child')).toHaveTextContent('Contenu principal');
  });

  it('renders BmoSidebar and BmoTopbar', () => {
    render(<BmoLayoutShell><div>Child</div></BmoLayoutShell>);

    expect(screen.getByTestId('bmo-sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('bmo-topbar')).toBeInTheDocument();
  });
});
