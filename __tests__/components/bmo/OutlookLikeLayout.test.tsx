/**
 * Tests OutlookLikeLayout — Layout 3 colonnes type Outlook
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OutlookLikeLayout } from '@/components/bmo/layout/OutlookLikeLayout';

describe('OutlookLikeLayout', () => {
  const defaultProps = {
    sidebar: <div data-testid="sub-sidebar">Sub Sidebar</div>,
    list: <div data-testid="list-content">List Content</div>,
    detail: <div data-testid="detail-content">Detail Content</div>,
  };

  beforeEach(() => {
    localStorage.clear();
  });

  it('renders all sections correctly', () => {
    render(<OutlookLikeLayout {...defaultProps} />);

    expect(screen.getByTestId('sub-sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('list-content')).toBeInTheDocument();
    expect(screen.getByTestId('detail-content')).toBeInTheDocument();
  });

  it('renders filterBar and quickActions when provided', () => {
    render(
      <OutlookLikeLayout
        {...defaultProps}
        filterBar={<div data-testid="filter-bar">Filter Bar</div>}
        quickActions={<div data-testid="quick-actions">Quick Actions</div>}
      />
    );

    expect(screen.getByTestId('filter-bar')).toBeInTheDocument();
    expect(screen.getByTestId('quick-actions')).toBeInTheDocument();
  });

  it('toggles sub-sidebar when collapsible and toolbar enabled', async () => {
    const user = userEvent.setup();

    render(
      <OutlookLikeLayout
        {...defaultProps}
        subSidebarCollapsible
        enableLayoutToolbar
        module="alerts"
      />
    );

    expect(screen.getByTestId('sub-sidebar')).toBeInTheDocument();

    const toolbar = screen.getByRole('toolbar', { name: /contrôles du layout/i });
    await user.hover(toolbar);
    const toggleBtn = screen.getByTitle(/sidebar/i);
    await user.click(toggleBtn);

    // Sidebar masquée (hidden lg:flex - en mobile viewport elle peut rester dans le DOM mais masquée)
    // Sur viewport desktop, elle disparaît car showSidebar devient false
    const sidebar = screen.queryByTestId('sub-sidebar');
    expect(sidebar).not.toBeInTheDocument();
  });

  it('persists layout state in localStorage when module prop is set', async () => {
    const user = userEvent.setup();

    render(
      <OutlookLikeLayout
        {...defaultProps}
        module="alerts"
        subSidebarCollapsible
        enableLayoutToolbar
      />
    );

    const toolbar = screen.getByRole('toolbar', { name: /contrôles du layout/i });
    await user.hover(toolbar);
    const toggleBtn = screen.getByTitle(/sidebar/i);
    await user.click(toggleBtn);

    const stored = localStorage.getItem('bmo-layout-alerts');
    expect(stored).toBeTruthy();

    const parsed = JSON.parse(stored || '{}');
    expect(parsed.subSidebarCollapsed).toBe(true);
  });

  it('renders layout toolbar when enableLayoutToolbar is true', () => {
    render(
      <OutlookLikeLayout
        {...defaultProps}
        enableLayoutToolbar
      />
    );

    const toolbar = screen.getByRole('toolbar', { name: /contrôles du layout/i });
    expect(toolbar).toBeInTheDocument();
  });
});
