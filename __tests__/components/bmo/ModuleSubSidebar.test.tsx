/**
 * Tests ModuleSubSidebar — Arborescence dossiers/catégories type Outlook
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ModuleSubSidebar } from '@/components/bmo/ModuleSubSidebar';
import type { SubSidebarSection } from '@/lib/types/module.types';

const mockSections: SubSidebarSection[] = [
  {
    title: 'DOSSIERS',
    items: [
      { id: 'toutes', label: 'Toutes les alertes', icon: 'Inbox', badge: 47 },
      { id: 'critiques', label: 'Critiques', icon: 'AlertCircle', badge: 8 },
    ],
  },
  {
    title: 'CATÉGORIES',
    collapsible: true,
    items: [
      { id: 'technique', label: 'Technique', icon: 'Wrench', badge: 15 },
      { id: 'budget', label: 'Budget', icon: 'DollarSign', badge: 8 },
    ],
  },
];

describe('ModuleSubSidebar', () => {
  it('renders all sections and items', () => {
    render(
      <ModuleSubSidebar
        sections={mockSections}
        selectedId="toutes"
        onSelect={() => {}}
      />
    );

    expect(screen.getByText('DOSSIERS')).toBeInTheDocument();
    expect(screen.getByText('Toutes les alertes')).toBeInTheDocument();
    expect(screen.getByText('47')).toBeInTheDocument();

    expect(screen.getByText('CATÉGORIES')).toBeInTheDocument();
    expect(screen.getByText('Technique')).toBeInTheDocument();
  });

  it('highlights active item', () => {
    render(
      <ModuleSubSidebar
        sections={mockSections}
        selectedId="critiques"
        onSelect={() => {}}
      />
    );

    const activeButton = screen.getByRole('button', {
      name: /critiques/i,
    });
    expect(activeButton).toHaveAttribute('aria-current', 'true');
  });

  it('calls onSelect when item is clicked', async () => {
    const user = userEvent.setup();
    const onSelect = jest.fn();

    render(
      <ModuleSubSidebar
        sections={mockSections}
        selectedId="toutes"
        onSelect={onSelect}
      />
    );

    await user.click(screen.getByRole('button', { name: /critiques/i }));

    expect(onSelect).toHaveBeenCalledWith('critiques');
  });

  it('renders badges correctly', () => {
    render(
      <ModuleSubSidebar
        sections={mockSections}
        selectedId="toutes"
        onSelect={() => {}}
      />
    );

    expect(screen.getByText('47')).toBeInTheDocument();
    expect(screen.getAllByText('8')).toHaveLength(2); // Critiques et Budget
    expect(screen.getByText('15')).toBeInTheDocument();
  });

  it('renders headerLabel when provided', () => {
    render(
      <ModuleSubSidebar
        sections={mockSections}
        selectedId="toutes"
        onSelect={() => {}}
        headerLabel="Centre d'alertes"
      />
    );

    expect(screen.getByText("Centre d'alertes")).toBeInTheDocument();
  });
});
