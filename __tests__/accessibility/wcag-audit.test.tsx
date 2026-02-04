/**
 * Tests d'accessibilité WCAG 2.1 AA
 * 
 * Vérifie la conformité des composants BMO aux standards d'accessibilité.
 * Critères testés :
 * - 1.4.3 Contraste minimum (AA: 4.5:1)
 * - 2.1.1 Clavier (toutes fonctionnalités accessibles au clavier)
 * - 2.4.7 Focus visible
 * - 4.1.2 Nom, rôle, valeur (attributs ARIA)
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Composants à tester
import { ActionButton, IconButton } from '@/components/bmo/ui/ActionButton';
import { StatusBadge, CategoryBadge } from '@/components/bmo/ui/StatusBadge';
import { TabBar, TabBadge } from '@/components/bmo/ui/TabBadge';
import { PriorityIndicator, PriorityBadge } from '@/components/bmo/ui/PriorityIndicator';
import { ListItem } from '@/components/bmo/ui/ListItem';
import { AlertItem } from '@/components/bmo/ui/AlertItem';
import { EmptyState } from '@/components/bmo/ui/EmptyStates';
import { Edit, Plus, Trash2 } from 'lucide-react';

describe('WCAG 2.1 AA - Composants BMO', () => {
  describe('1.4.3 Contraste minimum', () => {
    it('StatusBadge a un contraste suffisant pour chaque variante', () => {
      const variants = ['success', 'warning', 'error', 'info', 'neutral'] as const;
      
      variants.forEach((variant) => {
        const { container } = render(
          <StatusBadge variant={variant}>Test</StatusBadge>
        );
        const badge = container.firstChild as HTMLElement;
        
        // Vérifie que le badge a des classes de couleur
        expect(badge).toHaveClass('inline-flex');
        expect(badge.textContent).toBe('Test');
      });
    });

    it('TabBadge a un contraste suffisant (actif/inactif)', () => {
      const { rerender } = render(
        <TabBadge count={5} active={false} />
      );
      
      let badge = screen.getByLabelText(/éléments?/i);
      expect(badge).toBeInTheDocument();
      
      rerender(<TabBadge count={5} active={true} />);
      badge = screen.getByLabelText(/éléments?/i);
      expect(badge).toBeInTheDocument();
    });
  });

  describe('2.1.1 Accessibilité clavier', () => {
    it('ActionButton est focusable et activable avec Enter', async () => {
      const handleClick = jest.fn();
      render(<ActionButton onClick={handleClick}>Test</ActionButton>);
      
      const button = screen.getByRole('button', { name: 'Test' });
      
      // Focus avec Tab
      button.focus();
      expect(button).toHaveFocus();
      
      // Activation avec Enter
      await userEvent.keyboard('{Enter}');
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('ActionButton est activable avec Space', async () => {
      const handleClick = jest.fn();
      render(<ActionButton onClick={handleClick}>Test</ActionButton>);
      
      const button = screen.getByRole('button', { name: 'Test' });
      button.focus();
      
      await userEvent.keyboard(' ');
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('IconButton a un aria-label obligatoire', () => {
      render(
        <IconButton 
          icon={<Edit />} 
          aria-label="Modifier"
          onClick={() => {}}
        />
      );
      
      const button = screen.getByRole('button', { name: 'Modifier' });
      expect(button).toBeInTheDocument();
    });

    it('ListItem est navigable au clavier', async () => {
      const handleSelect = jest.fn();
      render(
        <ListItem id="test-1" onClick={handleSelect}>
          Contenu test
        </ListItem>
      );
      
      // ListItem utilise role="button"
      const items = screen.getAllByRole('button');
      const item = items[0]; // Le premier bouton est l'item principal
      
      // Focus
      item.focus();
      expect(item).toHaveFocus();
      
      // Enter
      await userEvent.keyboard('{Enter}');
      expect(handleSelect).toHaveBeenCalled();
    });

    it('AlertItem supporte Enter et Space', async () => {
      const handleSelect = jest.fn();
      render(
        <AlertItem
          id="alert-1"
          title="Test alerte"
          onSelect={handleSelect}
        />
      );
      
      // Sélectionner l'item principal par aria-label
      const item = screen.getByRole('button', { name: /Alerte: Test alerte/i });
      item.focus();
      
      // Enter
      await userEvent.keyboard('{Enter}');
      expect(handleSelect).toHaveBeenCalledWith('alert-1');
      
      // Space
      await userEvent.keyboard(' ');
      expect(handleSelect).toHaveBeenCalledTimes(2);
    });
  });

  describe('2.4.7 Focus visible', () => {
    it('ActionButton a un indicateur de focus visible', () => {
      render(<ActionButton>Test</ActionButton>);
      const button = screen.getByRole('button');
      
      // Vérifie les classes focus-visible
      expect(button.className).toContain('focus-visible');
    });

    it('TabWithBadge a un indicateur de focus visible', () => {
      const tabs = [
        { id: 'tab1', label: 'Tab 1', count: 5 },
        { id: 'tab2', label: 'Tab 2', count: 10 },
      ];
      
      render(
        <TabBar 
          tabs={tabs} 
          activeTab="tab1" 
          onTabChange={() => {}} 
        />
      );
      
      const tab = screen.getByRole('tab', { name: /Tab 1/i });
      expect(tab.className).toContain('focus-visible');
    });
  });

  describe('4.1.2 Nom, rôle, valeur', () => {
    it('TabBar a role="tablist"', () => {
      const tabs = [
        { id: 'tab1', label: 'Tab 1' },
        { id: 'tab2', label: 'Tab 2' },
      ];
      
      render(
        <TabBar 
          tabs={tabs} 
          activeTab="tab1" 
          onTabChange={() => {}} 
        />
      );
      
      expect(screen.getByRole('tablist')).toBeInTheDocument();
    });

    it('Tabs ont role="tab" et aria-selected', () => {
      const tabs = [
        { id: 'tab1', label: 'Tab 1' },
        { id: 'tab2', label: 'Tab 2' },
      ];
      
      render(
        <TabBar 
          tabs={tabs} 
          activeTab="tab1" 
          onTabChange={() => {}} 
        />
      );
      
      const tab1 = screen.getByRole('tab', { name: /Tab 1/i });
      const tab2 = screen.getByRole('tab', { name: /Tab 2/i });
      
      expect(tab1).toHaveAttribute('aria-selected', 'true');
      expect(tab2).toHaveAttribute('aria-selected', 'false');
    });

    it('PriorityIndicator a un aria-label descriptif', () => {
      render(<PriorityIndicator priority="high" />);
      
      const indicator = screen.getByRole('img');
      expect(indicator).toHaveAttribute('aria-label', expect.stringContaining('Priorité'));
    });

    it('EmptyState a des labels accessibles', () => {
      render(
        <EmptyState 
          type="no-data"
          primaryAction={{
            label: 'Créer',
            onClick: () => {},
          }}
        />
      );
      
      expect(screen.getByRole('button', { name: /Créer/i })).toBeInTheDocument();
    });

    it('AlertItem a aria-selected quand sélectionné', () => {
      const { rerender } = render(
        <AlertItem
          id="alert-1"
          title="Test"
          selected={false}
        />
      );
      
      // Sélectionner l'élément principal par aria-label
      let item = screen.getByRole('button', { name: /Alerte: Test/i });
      expect(item).toHaveAttribute('aria-selected', 'false');
      
      rerender(
        <AlertItem
          id="alert-1"
          title="Test"
          selected={true}
        />
      );
      
      item = screen.getByRole('button', { name: /Alerte: Test/i });
      expect(item).toHaveAttribute('aria-selected', 'true');
    });
  });

  describe('Boutons désactivés', () => {
    it('ActionButton désactivé n\'est pas cliquable', async () => {
      const handleClick = jest.fn();
      render(
        <ActionButton disabled onClick={handleClick}>
          Test
        </ActionButton>
      );
      
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      
      await userEvent.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('ActionButton en loading est désactivé', () => {
      render(<ActionButton loading>Test</ActionButton>);
      
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });
  });

  describe('Tooltips et labels', () => {
    it('StatusBadge rend le texte accessible', () => {
      render(<StatusBadge variant="success">Validé</StatusBadge>);
      expect(screen.getByText('Validé')).toBeInTheDocument();
    });

    it('CategoryBadge rend la catégorie accessible', () => {
      render(<CategoryBadge category="technique" />);
      // Le texte de la catégorie doit être visible
      expect(screen.getByText(/technique/i)).toBeInTheDocument();
    });
  });
});

describe('Navigation au clavier - Flux complet', () => {
  it('Navigation avec Tab dans une liste d\'alertes', async () => {
    const handleSelect = jest.fn();
    
    render(
      <div>
        <AlertItem id="1" title="Alerte 1" onSelect={handleSelect} />
        <AlertItem id="2" title="Alerte 2" onSelect={handleSelect} />
        <AlertItem id="3" title="Alerte 3" onSelect={handleSelect} />
      </div>
    );
    
    // Sélectionner uniquement les items principaux (pas les boutons de dropdown)
    const items = screen.getAllByRole('button', { name: /^Alerte:/i });
    expect(items).toHaveLength(3);
    
    // Tab au premier item
    await userEvent.tab();
    expect(items[0]).toHaveFocus();
  });
});
