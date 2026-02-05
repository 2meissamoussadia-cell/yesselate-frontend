/**
 * Tests PortalModuleCleanLayout — layout module avec sous-sidebar et zone principale.
 * Vérifie : structure, région contenu, navigation par onglets, accessibilité.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { PortalModuleCleanLayout } from '@/components/bmo/layout/PortalModuleCleanLayout';
import { Activity } from 'lucide-react';

const mockTabs = [
  { id: 'overview', label: 'Vue d’ensemble', path: '/maitre-ouvrage/performance', icon: Activity },
];

jest.mock('next/navigation', () => ({
  usePathname: () => '/maitre-ouvrage/performance',
}));

describe('PortalModuleCleanLayout', () => {
  it('renders title and children', () => {
    render(
      <PortalModuleCleanLayout title="Performance & SLA" tabs={mockTabs}>
        <div data-testid="main-content">Contenu principal</div>
      </PortalModuleCleanLayout>
    );

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Performance & SLA');
    expect(screen.getByTestId('main-content')).toHaveTextContent('Contenu principal');
  });

  it('has region with aria-label "Contenu"', () => {
    render(
      <PortalModuleCleanLayout title="Test" tabs={mockTabs}>
        <span>Child</span>
      </PortalModuleCleanLayout>
    );

    const region = screen.getByRole('region', { name: 'Contenu' });
    expect(region).toBeInTheDocument();
  });

  it('renders aside with aria-label "Sections {title}"', () => {
    render(
      <PortalModuleCleanLayout title="Documents" tabs={mockTabs}>
        <span>Child</span>
      </PortalModuleCleanLayout>
    );

    const aside = document.querySelector('aside');
    expect(aside).toBeInTheDocument();
    expect(aside).toHaveAttribute('aria-label', 'Sections Documents');
  });

  it('renders nav with tab links', () => {
    render(
      <PortalModuleCleanLayout title="Test" tabs={mockTabs}>
        <span>Child</span>
      </PortalModuleCleanLayout>
    );

    const link = screen.getByRole('link', { name: 'Vue d’ensemble' });
    expect(link).toHaveAttribute('href', '/maitre-ouvrage/performance');
  });
});
