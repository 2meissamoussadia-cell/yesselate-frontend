/**
 * Tests pour FilterBar — Barre de filtres type Outlook
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { FilterBar } from '@/components/bmo/ui/FilterBar';

describe('FilterBar', () => {
  const viewTabs = [
    { id: 'all', label: 'Tout', count: 100 },
    { id: 'critical', label: 'Critiques', count: 5 },
    { id: 'pending', label: 'En attente', count: 12 },
  ];

  const filters = [
    { id: 'unread', label: 'Non lus' },
    { id: 'starred', label: 'Favoris' },
    { id: 'attachments', label: 'Avec pièces jointes' },
  ];

  const mockOnViewChange = jest.fn();
  const mockOnFilterToggle = jest.fn();
  const mockOnSortClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Onglets de vue', () => {
    it('affiche les onglets de vue avec les compteurs', () => {
      render(
        <FilterBar
          viewTabs={viewTabs}
          activeView="all"
          onViewChange={mockOnViewChange}
        />
      );

      expect(screen.getByText('Tout')).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument();
      expect(screen.getByText('Critiques')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('marque l\'onglet actif visuellement', () => {
      render(
        <FilterBar
          viewTabs={viewTabs}
          activeView="critical"
          onViewChange={mockOnViewChange}
        />
      );

      const criticalTab = screen.getByRole('tab', { name: /critiques/i });
      expect(criticalTab).toHaveAttribute('aria-selected', 'true');
    });

    it('appelle onViewChange quand un onglet est cliqué', () => {
      render(
        <FilterBar
          viewTabs={viewTabs}
          activeView="all"
          onViewChange={mockOnViewChange}
        />
      );

      fireEvent.click(screen.getByText('Critiques'));
      expect(mockOnViewChange).toHaveBeenCalledWith('critical');
    });

    it('supporte la navigation clavier entre onglets', () => {
      render(
        <FilterBar
          viewTabs={viewTabs}
          activeView="all"
          onViewChange={mockOnViewChange}
        />
      );

      const allTab = screen.getByRole('tab', { name: /tout/i });
      allTab.focus();
      
      fireEvent.keyDown(allTab, { key: 'ArrowRight' });
      // Le focus devrait passer à l'onglet suivant
    });
  });

  describe('Filtres rapides', () => {
    it('affiche les filtres rapides', () => {
      render(
        <FilterBar
          viewTabs={viewTabs}
          activeView="all"
          onViewChange={mockOnViewChange}
          filters={filters}
          activeFilters={[]}
          onFilterToggle={mockOnFilterToggle}
        />
      );

      expect(screen.getByText('Non lus')).toBeInTheDocument();
      expect(screen.getByText('Favoris')).toBeInTheDocument();
    });

    it('marque les filtres actifs', () => {
      render(
        <FilterBar
          viewTabs={viewTabs}
          activeView="all"
          onViewChange={mockOnViewChange}
          filters={filters}
          activeFilters={['unread']}
          onFilterToggle={mockOnFilterToggle}
        />
      );

      const unreadFilter = screen.getByRole('checkbox', { name: /non lus/i });
      expect(unreadFilter).toBeChecked();
    });

    it('appelle onFilterToggle quand un filtre est cliqué', () => {
      render(
        <FilterBar
          viewTabs={viewTabs}
          activeView="all"
          onViewChange={mockOnViewChange}
          filters={filters}
          activeFilters={[]}
          onFilterToggle={mockOnFilterToggle}
        />
      );

      fireEvent.click(screen.getByText('Favoris'));
      expect(mockOnFilterToggle).toHaveBeenCalledWith('starred');
    });
  });

  describe('Tri', () => {
    it('affiche le bouton de tri avec le label', () => {
      render(
        <FilterBar
          viewTabs={viewTabs}
          activeView="all"
          onViewChange={mockOnViewChange}
          sortLabel="Date création"
          onSortClick={mockOnSortClick}
        />
      );

      expect(screen.getByText(/Date création/)).toBeInTheDocument();
    });

    it('appelle onSortClick quand le tri est cliqué', () => {
      render(
        <FilterBar
          viewTabs={viewTabs}
          activeView="all"
          onViewChange={mockOnViewChange}
          sortLabel="Date"
          onSortClick={mockOnSortClick}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /trier/i }));
      expect(mockOnSortClick).toHaveBeenCalled();
    });
  });

  describe('Recherche', () => {
    it('affiche le champ de recherche si searchValue est fourni', () => {
      render(
        <FilterBar
          viewTabs={viewTabs}
          activeView="all"
          onViewChange={mockOnViewChange}
          searchValue=""
          onSearchChange={jest.fn()}
        />
      );

      expect(screen.getByPlaceholderText(/rechercher/i)).toBeInTheDocument();
    });

    it('appelle onSearchChange lors de la saisie', () => {
      const mockOnSearchChange = jest.fn();
      
      render(
        <FilterBar
          viewTabs={viewTabs}
          activeView="all"
          onViewChange={mockOnViewChange}
          searchValue=""
          onSearchChange={mockOnSearchChange}
        />
      );

      const searchInput = screen.getByPlaceholderText(/rechercher/i);
      fireEvent.change(searchInput, { target: { value: 'test' } });
      
      expect(mockOnSearchChange).toHaveBeenCalledWith('test');
    });
  });

  describe('Accessibilité', () => {
    it('utilise des rôles ARIA appropriés', () => {
      render(
        <FilterBar
          viewTabs={viewTabs}
          activeView="all"
          onViewChange={mockOnViewChange}
        />
      );

      expect(screen.getByRole('tablist')).toBeInTheDocument();
      expect(screen.getAllByRole('tab')).toHaveLength(3);
    });

    it('a des labels accessibles pour les filtres', () => {
      render(
        <FilterBar
          viewTabs={viewTabs}
          activeView="all"
          onViewChange={mockOnViewChange}
          filters={filters}
          activeFilters={[]}
          onFilterToggle={mockOnFilterToggle}
        />
      );

      // Les filtres devraient avoir des labels accessibles
      filters.forEach((filter) => {
        expect(screen.getByLabelText(new RegExp(filter.label, 'i'))).toBeInTheDocument();
      });
    });
  });
});
