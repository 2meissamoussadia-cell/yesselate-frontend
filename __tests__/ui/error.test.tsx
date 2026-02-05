/**
 * Tests UI — error boundaries (app et segments).
 * Vérifie : role="alert", aria-label sur Réessayer, reset callback (audit LAYOUT_UI_GAPS).
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GlobalError from '@/app/error';
import DashboardError from '@/app/(portals)/maitre-ouvrage/dashboard/error';
import MaitreOuvrageError from '@/app/(portals)/maitre-ouvrage/error';
import PerformanceError from '@/app/(portals)/maitre-ouvrage/performance/error';
import OpportunitiesError from '@/app/(portals)/maitre-ouvrage/opportunities/error';
import { SegmentErrorView } from '@/components/ui/SegmentErrorView';
import { ERROR_BOUNDARY, ARIA_LABELS } from '@lib-root/constants';

beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  (console.error as jest.Mock).mockRestore();
});

describe('Error UI (boundaries)', () => {
  describe('GlobalError (app/error.tsx)', () => {
    const mockReset = jest.fn();

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('has role="alert" on container', () => {
      render(
        <GlobalError
          error={new Error('Test')}
          reset={mockReset}
        />
      );
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('displays title from ERROR_BOUNDARY.GLOBAL_TITLE', () => {
      render(
        <GlobalError
          error={new Error('Test')}
          reset={mockReset}
        />
      );
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
        ERROR_BOUNDARY.GLOBAL_TITLE
      );
    });

    it('displays error message', () => {
      render(
        <GlobalError
          error={new Error('Erreur réseau')}
          reset={mockReset}
        />
      );
      expect(screen.getByText('Erreur réseau')).toBeInTheDocument();
    });

    it('Réessayer button has aria-label from ARIA_LABELS.RETRY', () => {
      render(
        <GlobalError
          error={new Error('Test')}
          reset={mockReset}
        />
      );
      const btn = screen.getByRole('button', { name: /réessayer le chargement/i });
      expect(btn).toHaveAttribute('aria-label', ARIA_LABELS.RETRY);
    });

    it('calls reset when Réessayer is clicked', async () => {
      const user = userEvent.setup();
      render(
        <GlobalError
          error={new Error('Test')}
          reset={mockReset}
        />
      );
      await user.click(screen.getByRole('button', { name: /réessayer/i }));
      expect(mockReset).toHaveBeenCalledTimes(1);
    });
  });

  describe('DashboardError (dashboard/error.tsx)', () => {
    const mockReset = jest.fn();

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('has role="alert" on container', () => {
      render(
        <DashboardError
          error={new Error('Test')}
          reset={mockReset}
        />
      );
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('displays title from ERROR_BOUNDARY.SEGMENT_TITLE', () => {
      render(
        <DashboardError
          error={new Error('Test')}
          reset={mockReset}
        />
      );
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
        ERROR_BOUNDARY.SEGMENT_TITLE
      );
    });

    it('Réessayer button has aria-label from ARIA_LABELS.RETRY', () => {
      render(
        <DashboardError
          error={new Error('Test')}
          reset={mockReset}
        />
      );
      const btn = screen.getByRole('button', { name: /réessayer le chargement/i });
      expect(btn).toHaveAttribute('aria-label', ARIA_LABELS.RETRY);
    });

    it('calls reset when Réessayer is clicked', async () => {
      const user = userEvent.setup();
      render(
        <DashboardError
          error={new Error('Test')}
          reset={mockReset}
        />
      );
      await user.click(screen.getByRole('button', { name: /réessayer/i }));
      expect(mockReset).toHaveBeenCalledTimes(1);
    });
  });

  describe('MaitreOuvrageError (portail error.tsx)', () => {
    const mockReset = jest.fn();

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('has role="alert" on container', () => {
      render(
        <MaitreOuvrageError
          error={new Error('Test')}
          reset={mockReset}
        />
      );
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('displays title from ERROR_BOUNDARY.PORTAL_TITLE', () => {
      render(
        <MaitreOuvrageError
          error={new Error('Test')}
          reset={mockReset}
        />
      );
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
        ERROR_BOUNDARY.PORTAL_TITLE
      );
    });

    it('Réessayer button has aria-label from ARIA_LABELS.RETRY', () => {
      render(
        <MaitreOuvrageError
          error={new Error('Test')}
          reset={mockReset}
        />
      );
      const btn = screen.getByRole('button', { name: /réessayer le chargement/i });
      expect(btn).toHaveAttribute('aria-label', ARIA_LABELS.RETRY);
    });

    it('calls reset when Réessayer is clicked', async () => {
      const user = userEvent.setup();
      render(
        <MaitreOuvrageError
          error={new Error('Test')}
          reset={mockReset}
        />
      );
      await user.click(screen.getByRole('button', { name: /réessayer/i }));
      expect(mockReset).toHaveBeenCalledTimes(1);
    });
  });

  describe('SegmentErrorView', () => {
    const mockReset = jest.fn();

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('has role="alert" and uses ARIA_LABELS.RETRY on button', () => {
      render(
        <SegmentErrorView error={new Error('Test')} reset={mockReset} />
      );
      expect(screen.getByRole('alert')).toBeInTheDocument();
      const btn = screen.getByRole('button', { name: /réessayer le chargement/i });
      expect(btn).toHaveAttribute('aria-label', ARIA_LABELS.RETRY);
    });

    it('displays custom title and fallback message', () => {
      render(
        <SegmentErrorView
          error={new Error()}
          reset={mockReset}
          title="Erreur chargement alertes"
          fallbackMessage="Les alertes n’ont pas pu être chargées."
        />
      );
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Erreur chargement alertes');
      expect(screen.getByText('Les alertes n’ont pas pu être chargées.')).toBeInTheDocument();
    });

    it('calls reset when Réessayer is clicked', async () => {
      const user = userEvent.setup();
      render(<SegmentErrorView error={new Error('E')} reset={mockReset} />);
      await user.click(screen.getByRole('button', { name: /réessayer/i }));
      expect(mockReset).toHaveBeenCalledTimes(1);
    });
  });

  describe('PerformanceError', () => {
    const mockReset = jest.fn();

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('has role="alert" and displays segment fallback message when error has no message', () => {
      render(
        <PerformanceError error={new Error()} reset={mockReset} />
      );
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText(/La performance n’a pas pu être chargée/)).toBeInTheDocument();
    });

    it('Réessayer button has aria-label from ARIA_LABELS.RETRY', () => {
      render(
        <PerformanceError error={new Error('Test')} reset={mockReset} />
      );
      const btn = screen.getByRole('button', { name: /réessayer le chargement/i });
      expect(btn).toHaveAttribute('aria-label', ARIA_LABELS.RETRY);
    });
  });

  describe('OpportunitiesError', () => {
    const mockReset = jest.fn();

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('has role="alert" and displays segment fallback when error has no message', () => {
      render(
        <OpportunitiesError error={new Error()} reset={mockReset} />
      );
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText(/Les opportunités n’ont pas pu être chargées/)).toBeInTheDocument();
    });

    it('Réessayer button has aria-label from ARIA_LABELS.RETRY', () => {
      render(
        <OpportunitiesError error={new Error('Test')} reset={mockReset} />
      );
      const btn = screen.getByRole('button', { name: /réessayer le chargement/i });
      expect(btn).toHaveAttribute('aria-label', ARIA_LABELS.RETRY);
    });
  });
});
