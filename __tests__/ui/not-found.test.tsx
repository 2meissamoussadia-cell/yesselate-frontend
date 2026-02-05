/**
 * Tests des pages 404 (not-found) — app et portail.
 * Vérifie : titre, description, lien de retour, accessibilité.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import NotFound from '@/app/not-found';
import MaitreOuvrageNotFound from '@/app/(portals)/maitre-ouvrage/not-found';
import { NOT_FOUND } from '@lib-root/constants';

jest.mock('next/link', () => {
  return function MockLink({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
    [key: string]: unknown;
  }) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  };
});

describe('Not-found UI', () => {
  describe('NotFound (app/not-found.tsx)', () => {
    it('renders title and description from NOT_FOUND', () => {
      render(<NotFound />);
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(NOT_FOUND.TITLE);
      expect(screen.getByText(NOT_FOUND.DESCRIPTION)).toBeInTheDocument();
    });

    it('has role="status" and aria-label', () => {
      render(<NotFound />);
      const container = screen.getByRole('status');
      expect(container).toHaveAttribute('aria-label', NOT_FOUND.TITLE);
    });

    it('has link to home with aria-label', () => {
      render(<NotFound />);
      const link = screen.getByRole('link', { name: NOT_FOUND.BACK_ARIA });
      expect(link).toHaveAttribute('href', '/');
    });
  });

  describe('MaitreOuvrageNotFound (portail not-found.tsx)', () => {
    it('renders title and description from NOT_FOUND', () => {
      render(<MaitreOuvrageNotFound />);
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(NOT_FOUND.TITLE);
      expect(screen.getByText(NOT_FOUND.DESCRIPTION)).toBeInTheDocument();
    });

    it('has link to dashboard', () => {
      render(<MaitreOuvrageNotFound />);
      const link = screen.getByRole('link', { name: /retour au tableau de bord/i });
      expect(link).toHaveAttribute('href', '/maitre-ouvrage/dashboard');
    });
  });
});
