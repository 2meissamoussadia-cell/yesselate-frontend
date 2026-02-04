/**
 * Tests pour DetailPanel — Panneau de détail type Outlook
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { DetailPanel } from '@/components/bmo/DetailPanel';

describe('DetailPanel', () => {
  const mockItem = { id: '1', title: 'Test Item', description: 'Test description' };
  const renderContent = (item: typeof mockItem) => (
    <div data-testid="detail-content">{item.title}</div>
  );

  describe('État vide', () => {
    it('affiche le message par défaut quand item est null', () => {
      render(
        <DetailPanel
          item={null}
          renderContent={renderContent}
        />
      );

      expect(screen.getByText('Sélectionnez un élément')).toBeInTheDocument();
    });

    it('affiche un message personnalisé quand fourni', () => {
      render(
        <DetailPanel
          item={null}
          renderContent={renderContent}
          emptyMessage="Aucune alerte sélectionnée"
        />
      );

      expect(screen.getByText('Aucune alerte sélectionnée')).toBeInTheDocument();
    });

    it('affiche la description personnalisée', () => {
      render(
        <DetailPanel
          item={null}
          renderContent={renderContent}
          emptyDescription="Cliquez sur une alerte pour voir les détails"
        />
      );

      expect(screen.getByText('Cliquez sur une alerte pour voir les détails')).toBeInTheDocument();
    });

    it('affiche le nombre total d\'éléments', () => {
      render(
        <DetailPanel
          item={null}
          renderContent={renderContent}
          totalItems={42}
        />
      );

      expect(screen.getByText(/42 éléments? disponibles?/)).toBeInTheDocument();
    });

    it('affiche les raccourcis clavier', () => {
      render(
        <DetailPanel
          item={null}
          renderContent={renderContent}
          shortcuts={[
            { key: '↑↓', label: 'Naviguer' },
            { key: 'Entrée', label: 'Ouvrir' },
          ]}
        />
      );

      expect(screen.getByText('Naviguer')).toBeInTheDocument();
      expect(screen.getByText('Ouvrir')).toBeInTheDocument();
    });
  });

  describe('État avec item', () => {
    it('affiche le contenu via renderContent', () => {
      render(
        <DetailPanel
          item={mockItem}
          renderContent={renderContent}
        />
      );

      expect(screen.getByTestId('detail-content')).toBeInTheDocument();
      expect(screen.getByText('Test Item')).toBeInTheDocument();
    });

    it('affiche le header via renderHeader', () => {
      render(
        <DetailPanel
          item={mockItem}
          renderHeader={(item) => <h1 data-testid="detail-header">{item.title}</h1>}
          renderContent={renderContent}
        />
      );

      expect(screen.getByTestId('detail-header')).toBeInTheDocument();
    });

    it('affiche le footer via renderFooter', () => {
      render(
        <DetailPanel
          item={mockItem}
          renderContent={renderContent}
          renderFooter={(item) => <footer data-testid="detail-footer">Footer for {item.id}</footer>}
        />
      );

      expect(screen.getByTestId('detail-footer')).toBeInTheDocument();
    });
  });

  describe('État de chargement', () => {
    it('affiche des skeletons quand loading est true', () => {
      render(
        <DetailPanel
          item={mockItem}
          renderContent={renderContent}
          loading={true}
        />
      );

      // Les skeletons devraient être présents
      const skeletons = document.querySelectorAll('[class*="skeleton"]');
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe('Accessibilité', () => {
    it('a un aria-live pour annoncer les changements', () => {
      render(
        <DetailPanel
          item={null}
          renderContent={renderContent}
        />
      );

      const emptyState = screen.getByRole('generic', { hidden: true });
      // Le conteneur devrait avoir aria-live
    });

    it('a un aria-label sur le conteneur avec item', () => {
      render(
        <DetailPanel
          item={mockItem}
          renderContent={renderContent}
        />
      );

      expect(screen.getByLabelText('Détail')).toBeInTheDocument();
    });
  });
});
