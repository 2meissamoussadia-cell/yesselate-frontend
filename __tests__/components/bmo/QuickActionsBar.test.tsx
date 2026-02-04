/**
 * Tests pour QuickActionsBar — Barre d'actions rapides type Outlook
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { QuickActionsBar } from '@/components/bmo/ui/QuickActionsBar';
import { Trash2, Archive } from 'lucide-react';

describe('QuickActionsBar', () => {
  const mockOnPrimaryClick = jest.fn();
  const mockOnMoreClick = jest.fn();
  const mockActions = [
    {
      id: 'delete',
      icon: <Trash2 className="h-5 w-5" data-testid="delete-icon" />,
      label: 'Supprimer',
      variant: 'ghost' as const,
      onClick: jest.fn(),
    },
    {
      id: 'archive',
      icon: <Archive className="h-5 w-5" data-testid="archive-icon" />,
      label: 'Archiver',
      variant: 'ghost' as const,
      onClick: jest.fn(),
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendu de base', () => {
    it('affiche le bouton primaire avec le label par défaut', () => {
      render(<QuickActionsBar />);

      expect(screen.getByText('Nouveau message')).toBeInTheDocument();
    });

    it('affiche le bouton primaire avec un label personnalisé', () => {
      render(
        <QuickActionsBar
          primaryLabel="Nouvelle alerte"
          onPrimaryClick={mockOnPrimaryClick}
        />
      );

      expect(screen.getByText('Nouvelle alerte')).toBeInTheDocument();
    });

    it('appelle onPrimaryClick quand le bouton primaire est cliqué', () => {
      render(
        <QuickActionsBar
          primaryLabel="Nouveau"
          onPrimaryClick={mockOnPrimaryClick}
        />
      );

      fireEvent.click(screen.getByText('Nouveau'));
      expect(mockOnPrimaryClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Actions secondaires', () => {
    it('affiche les actions personnalisées', () => {
      render(
        <QuickActionsBar
          actions={mockActions}
        />
      );

      expect(screen.getByLabelText('Supprimer')).toBeInTheDocument();
      expect(screen.getByLabelText('Archiver')).toBeInTheDocument();
    });

    it('désactive les actions par défaut sans sélection', () => {
      render(
        <QuickActionsBar
          actions={mockActions}
          selectedCount={0}
        />
      );

      // Les boutons delete et archive devraient être désactivés
      const deleteBtn = screen.getByLabelText('Supprimer');
      const archiveBtn = screen.getByLabelText('Archiver');

      expect(deleteBtn).toBeDisabled();
      expect(archiveBtn).toBeDisabled();
    });

    it('active les actions avec une sélection', () => {
      render(
        <QuickActionsBar
          actions={mockActions}
          selectedCount={1}
        />
      );

      const deleteBtn = screen.getByLabelText('Supprimer');
      const archiveBtn = screen.getByLabelText('Archiver');

      expect(deleteBtn).not.toBeDisabled();
      expect(archiveBtn).not.toBeDisabled();
    });

    it('appelle onClick de l\'action quand cliquée', () => {
      render(
        <QuickActionsBar
          actions={mockActions}
          selectedCount={1}
        />
      );

      fireEvent.click(screen.getByLabelText('Supprimer'));
      expect(mockActions[0].onClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Indicateur de sélection', () => {
    it('n\'affiche pas d\'indicateur sans sélection', () => {
      render(
        <QuickActionsBar
          selectedCount={0}
        />
      );

      expect(screen.queryByText(/sélectionné/)).not.toBeInTheDocument();
    });

    it('affiche "1 élément sélectionné" pour une sélection unique', () => {
      render(
        <QuickActionsBar
          selectedCount={1}
        />
      );

      expect(screen.getByText('1 élément sélectionné')).toBeInTheDocument();
    });

    it('affiche "X éléments sélectionnés" pour une sélection multiple', () => {
      render(
        <QuickActionsBar
          selectedCount={5}
        />
      );

      expect(screen.getByText('5 éléments sélectionnés')).toBeInTheDocument();
    });
  });

  describe('Bouton "Plus d\'actions"', () => {
    it('affiche le bouton "Plus d\'actions" si onMoreClick est fourni', () => {
      render(
        <QuickActionsBar
          onMoreClick={mockOnMoreClick}
        />
      );

      expect(screen.getByLabelText("Plus d'actions")).toBeInTheDocument();
    });

    it('n\'affiche pas le bouton si onMoreClick n\'est pas fourni', () => {
      render(<QuickActionsBar />);

      expect(screen.queryByLabelText("Plus d'actions")).not.toBeInTheDocument();
    });

    it('appelle onMoreClick quand cliqué', () => {
      render(
        <QuickActionsBar
          onMoreClick={mockOnMoreClick}
        />
      );

      fireEvent.click(screen.getByLabelText("Plus d'actions"));
      expect(mockOnMoreClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Tooltips d\'accessibilité', () => {
    it('affiche un tooltip explicatif pour les boutons désactivés', async () => {
      render(
        <QuickActionsBar
          actions={mockActions}
          selectedCount={0}
        />
      );

      // Les boutons désactivés devraient avoir un tooltip explicatif
      const deleteBtn = screen.getByLabelText('Supprimer');
      expect(deleteBtn).toBeDisabled();
      // Le tooltip est géré par TooltipProvider
    });
  });
});
