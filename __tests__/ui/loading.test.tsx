/**
 * Tests UI — états de chargement (loading skeletons).
 * Vérifie : role="status", aria-label, aria-busy, structure (audit LAYOUT_UI_GAPS).
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import AlertsLoading from '@/app/(portals)/maitre-ouvrage/alerts/loading';
import RootLoading from '@/app/loading';
import PerformanceLoading from '@/app/(portals)/maitre-ouvrage/performance/loading';
import OpportunitiesLoading from '@/app/(portals)/maitre-ouvrage/opportunities/loading';
import { OutlookLikeLoadingSkeleton } from '@/components/ui/OutlookLikeLoadingSkeleton';
import { LOADING_LABELS } from '@lib-root/constants';

jest.mock('@/components/ui/skeleton', () => ({
  Skeleton: ({ className }: { className?: string }) => (
    <div data-testid="skeleton" className={className} aria-hidden />
  ),
}));

describe('Loading UI (skeletons)', () => {
  describe('AlertsLoading', () => {
    it('has role="status" for screen readers', () => {
      render(<AlertsLoading />);
      const container = screen.getByRole('status');
      expect(container).toBeInTheDocument();
    });

    it('has aria-label "Chargement des alertes"', () => {
      render(<AlertsLoading />);
      expect(screen.getByRole('status')).toHaveAttribute(
        'aria-label',
        'Chargement des alertes'
      );
    });

    it('has aria-busy="true"', () => {
      render(<AlertsLoading />);
      expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true');
    });

    it('renders skeleton placeholders', () => {
      render(<AlertsLoading />);
      const skeletons = screen.getAllByTestId('skeleton');
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe('RootLoading (app/loading.tsx)', () => {
    it('has role="status" and aria-label from LOADING_LABELS.ROOT', () => {
      render(<RootLoading />);
      const container = screen.getByRole('status');
      expect(container).toBeInTheDocument();
      expect(container).toHaveAttribute('aria-label', LOADING_LABELS.ROOT);
    });

    it('has aria-busy="true"', () => {
      render(<RootLoading />);
      expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true');
    });
  });

  describe('PerformanceLoading', () => {
    it('has role="status" and aria-label "Chargement de la performance"', () => {
      render(<PerformanceLoading />);
      const container = screen.getByRole('status');
      expect(container).toBeInTheDocument();
      expect(container).toHaveAttribute('aria-label', 'Chargement de la performance');
    });

    it('has aria-busy="true"', () => {
      render(<PerformanceLoading />);
      expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true');
    });
  });

  describe('OpportunitiesLoading', () => {
    it('has role="status" and aria-label "Chargement des opportunités"', () => {
      render(<OpportunitiesLoading />);
      const container = screen.getByRole('status');
      expect(container).toBeInTheDocument();
      expect(container).toHaveAttribute('aria-label', 'Chargement des opportunités');
    });

    it('has aria-busy="true"', () => {
      render(<OpportunitiesLoading />);
      expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true');
    });
  });

  describe('OutlookLikeLoadingSkeleton', () => {
    it('renders with role="status", aria-label and aria-busy', () => {
      render(<OutlookLikeLoadingSkeleton ariaLabel="Chargement test" />);
      const container = screen.getByRole('status');
      expect(container).toHaveAttribute('aria-label', 'Chargement test');
      expect(container).toHaveAttribute('aria-busy', 'true');
    });

    it('supports variant="simple"', () => {
      render(
        <OutlookLikeLoadingSkeleton ariaLabel="Simple" variant="simple" />
      );
      expect(screen.getByRole('status')).toBeInTheDocument();
    });
  });
});
