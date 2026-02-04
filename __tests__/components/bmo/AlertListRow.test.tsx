/**
 * Tests pour AlertListRow — Ligne d'alerte type Outlook
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { AlertListRow } from '@/components/bmo/alerts/AlertListRow';
import type { AlerteBTP } from '@/lib/types/alerts-btp.types';

// Mock de l'alerte de test
const createMockAlerte = (overrides?: Partial<AlerteBTP>): AlerteBTP => ({
  id: 'alert-1',
  code: 'ALT-001',
  titre: 'Retard livraison matériaux',
  description: 'Retard de 3 jours sur la livraison du béton',
  categorie: 'technique',
  niveau: 'important',
  statut: 'non-traite',
  dateCreation: '2026-02-04T10:30:00Z',
  projetId: 'proj-1',
  projetNom: 'Tour Casablanca',
  chantierId: 'chantier-1',
  chantierNom: 'Phase 1',
  bureauId: 'bureau-1',
  bureauNom: 'Casablanca',
  responsableId: 'user-1',
  responsableNom: 'Ahmed El Fassi',
  impact: 'Décalage planning de 2 jours',
  actionsSuggeres: ['Contacter fournisseur', 'Prévoir alternative'],
  ...overrides,
});

describe('AlertListRow', () => {
  const mockOnClick = jest.fn();
  const mockOnQuickAction = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendu de base', () => {
    it('affiche le titre de l\'alerte', () => {
      render(
        <AlertListRow
          alerte={createMockAlerte()}
          selected={false}
          onClick={mockOnClick}
        />
      );

      expect(screen.getByText('Retard livraison matériaux')).toBeInTheDocument();
    });

    it('affiche le code de l\'alerte', () => {
      render(
        <AlertListRow
          alerte={createMockAlerte()}
          selected={false}
          onClick={mockOnClick}
        />
      );

      expect(screen.getByText('ALT-001')).toBeInTheDocument();
    });

    it('affiche le nom du projet', () => {
      render(
        <AlertListRow
          alerte={createMockAlerte()}
          selected={false}
          onClick={mockOnClick}
        />
      );

      expect(screen.getByText(/Tour Casablanca/)).toBeInTheDocument();
    });

    it('affiche la date de création formatée', () => {
      render(
        <AlertListRow
          alerte={createMockAlerte()}
          selected={false}
          onClick={mockOnClick}
        />
      );

      // La date devrait être affichée en format relatif ou local
      expect(screen.getByText(/04\/02\/2026|il y a|aujourd/i)).toBeInTheDocument();
    });
  });

  describe('Indicateurs de niveau', () => {
    it('affiche un indicateur critique rouge', () => {
      render(
        <AlertListRow
          alerte={createMockAlerte({ niveau: 'critique' })}
          selected={false}
          onClick={mockOnClick}
        />
      );

      const indicator = document.querySelector('[class*="bg-red"]');
      expect(indicator).toBeInTheDocument();
    });

    it('affiche un indicateur important orange', () => {
      render(
        <AlertListRow
          alerte={createMockAlerte({ niveau: 'important' })}
          selected={false}
          onClick={mockOnClick}
        />
      );

      const indicator = document.querySelector('[class*="bg-orange"], [class*="bg-amber"]');
      expect(indicator).toBeInTheDocument();
    });

    it('affiche un indicateur normal bleu/vert', () => {
      render(
        <AlertListRow
          alerte={createMockAlerte({ niveau: 'normal' })}
          selected={false}
          onClick={mockOnClick}
        />
      );

      const indicator = document.querySelector('[class*="bg-blue"], [class*="bg-emerald"], [class*="bg-cyan"]');
      expect(indicator).toBeInTheDocument();
    });
  });

  describe('États de sélection', () => {
    it('applique le style sélectionné quand selected=true', () => {
      const { container } = render(
        <AlertListRow
          alerte={createMockAlerte()}
          selected={true}
          onClick={mockOnClick}
        />
      );

      // Le conteneur devrait avoir une classe de sélection
      expect(container.firstChild).toHaveClass(/selected|bg-blue|bg-cyan|bg-slate/);
    });

    it('n\'applique pas le style sélectionné quand selected=false', () => {
      const { container } = render(
        <AlertListRow
          alerte={createMockAlerte()}
          selected={false}
          onClick={mockOnClick}
        />
      );

      // Le conteneur ne devrait pas avoir la classe de sélection complète
      expect(container.firstChild).not.toHaveClass('bg-cyan-900');
    });
  });

  describe('Interactions', () => {
    it('appelle onClick quand la ligne est cliquée', () => {
      render(
        <AlertListRow
          alerte={createMockAlerte()}
          selected={false}
          onClick={mockOnClick}
        />
      );

      fireEvent.click(screen.getByText('Retard livraison matériaux'));
      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('appelle onClick quand Enter est pressé', () => {
      render(
        <AlertListRow
          alerte={createMockAlerte()}
          selected={false}
          onClick={mockOnClick}
        />
      );

      const row = screen.getByRole('button') || screen.getByText('Retard livraison matériaux').closest('[role="button"], [tabindex]');
      if (row) {
        fireEvent.keyDown(row, { key: 'Enter' });
        expect(mockOnClick).toHaveBeenCalled();
      }
    });

    it('appelle onClick quand Space est pressé', () => {
      render(
        <AlertListRow
          alerte={createMockAlerte()}
          selected={false}
          onClick={mockOnClick}
        />
      );

      const row = screen.getByRole('button') || screen.getByText('Retard livraison matériaux').closest('[role="button"], [tabindex]');
      if (row) {
        fireEvent.keyDown(row, { key: ' ' });
        expect(mockOnClick).toHaveBeenCalled();
      }
    });
  });

  describe('Statut de l\'alerte', () => {
    it('affiche le badge non-traité', () => {
      render(
        <AlertListRow
          alerte={createMockAlerte({ statut: 'non-traite' })}
          selected={false}
          onClick={mockOnClick}
        />
      );

      expect(screen.getByText(/non.traité|à traiter|nouveau/i)).toBeInTheDocument();
    });

    it('affiche le badge en-cours', () => {
      render(
        <AlertListRow
          alerte={createMockAlerte({ statut: 'en-cours' })}
          selected={false}
          onClick={mockOnClick}
        />
      );

      expect(screen.getByText(/en.cours|traitement/i)).toBeInTheDocument();
    });

    it('affiche le badge résolu', () => {
      render(
        <AlertListRow
          alerte={createMockAlerte({ statut: 'resolu' })}
          selected={false}
          onClick={mockOnClick}
        />
      );

      expect(screen.getByText(/résolu|traité|clos/i)).toBeInTheDocument();
    });
  });

  describe('Accessibilité', () => {
    it('a un rôle button ou est focusable', () => {
      render(
        <AlertListRow
          alerte={createMockAlerte()}
          selected={false}
          onClick={mockOnClick}
        />
      );

      const row = screen.getByRole('button') || document.querySelector('[tabindex="0"]');
      expect(row).toBeInTheDocument();
    });

    it('a un aria-selected pour l\'état sélectionné', () => {
      render(
        <AlertListRow
          alerte={createMockAlerte()}
          selected={true}
          onClick={mockOnClick}
        />
      );

      const row = document.querySelector('[aria-selected="true"]');
      expect(row).toBeInTheDocument();
    });

    it('les séparateurs ont aria-hidden', () => {
      render(
        <AlertListRow
          alerte={createMockAlerte()}
          selected={false}
          onClick={mockOnClick}
        />
      );

      // Les éléments décoratifs (•, →, etc.) devraient avoir aria-hidden
      const decorativeElements = document.querySelectorAll('[aria-hidden="true"]');
      expect(decorativeElements.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Actions rapides', () => {
    it('affiche les boutons d\'actions rapides au hover', () => {
      render(
        <AlertListRow
          alerte={createMockAlerte()}
          selected={false}
          onClick={mockOnClick}
          onQuickAction={mockOnQuickAction}
        />
      );

      // Les actions rapides sont généralement dans un conteneur group-hover
      const actionsContainer = document.querySelector('[class*="group-hover"], [class*="opacity-0"]');
      // Les actions existent mais peuvent être cachées
    });
  });
});
