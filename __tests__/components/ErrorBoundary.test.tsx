/**
 * Tests ErrorBoundary — rendu normal et affichage du fallback en cas d'erreur
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';

// Composant qui lance une erreur au rendu (pour tester componentDidCatch)
function Thrower() {
  throw new Error('Test error');
}

beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  (console.error as jest.Mock).mockRestore();
});

describe('ErrorBoundary', () => {
  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div data-testid="child">Contenu normal</div>
      </ErrorBoundary>
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.getByText('Contenu normal')).toBeInTheDocument();
  });

  it('renders default fallback when child throws', () => {
    render(
      <ErrorBoundary>
        <Thrower />
      </ErrorBoundary>
    );
    expect(screen.getByText('Erreur de rendu')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /réessayer/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /recharger la page/i })).toBeInTheDocument();
  });

  it('renders custom fallback when provided', () => {
    render(
      <ErrorBoundary fallback={<div data-testid="custom-fallback">Erreur personnalisée</div>}>
        <Thrower />
      </ErrorBoundary>
    );
    expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
    expect(screen.getByText('Erreur personnalisée')).toBeInTheDocument();
  });

  it('calls onError when child throws', () => {
    const onError = jest.fn();
    render(
      <ErrorBoundary onError={onError}>
        <Thrower />
      </ErrorBoundary>
    );
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({ componentStack: expect.any(String) })
    );
  });

  it('Réessayer button is clickable and does not throw', async () => {
    const user = userEvent.setup();
    render(
      <ErrorBoundary>
        <Thrower />
      </ErrorBoundary>
    );
    const resetBtn = screen.getByRole('button', { name: /réessayer/i });
    await user.click(resetBtn);
    // Après reset, l'ErrorBoundary réaffiche les children ; le Thrower relance donc le fallback.
    // On vérifie juste que le clic ne provoque pas d'exception et que le fallback est toujours affiché.
    expect(screen.getByText('Erreur de rendu')).toBeInTheDocument();
  });
});
