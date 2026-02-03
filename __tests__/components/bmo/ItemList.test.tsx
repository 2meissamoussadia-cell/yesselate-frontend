/**
 * Tests ItemList — Performance et virtualisation
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ItemList } from '@/components/bmo/ItemList';

describe('ItemList', () => {
  it('renders empty state when no items', () => {
    render(
      <ItemList
        items={[]}
        renderItem={() => null}
        emptyMessage="Aucune alerte"
      />
    );
    expect(screen.getByText('Aucune alerte')).toBeInTheDocument();
  });

  it('renders items when below virtualization threshold', () => {
    const items = [
      { id: '1', title: 'Item 1' },
      { id: '2', title: 'Item 2' },
    ];
    render(
      <ItemList
        items={items}
        onSelect={() => {}}
        renderItem={(item) => <span>{item.title}</span>}
      />
    );
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });

  it('calls onSelect when item is clicked', async () => {
    const user = userEvent.setup();
    const onSelect = jest.fn();
    const items = [{ id: '1', title: 'Item 1' }];
    render(
      <ItemList
        items={items}
        onSelect={onSelect}
        renderItem={(item) => <span>{item.title}</span>}
      />
    );
    await user.click(screen.getByText('Item 1'));
    expect(onSelect).toHaveBeenCalledWith('1');
  });

  it('handles large datasets with virtualization', () => {
    const items = Array.from({ length: 500 }, (_, i) => ({
      id: `item-${i}`,
      title: `Item ${i}`,
    }));

    const startTime = performance.now();
    const { container } = render(
      <ItemList
        items={items}
        virtualizeThreshold={50}
        onSelect={() => {}}
        renderItem={(item) => <div data-testid="list-item">{item.title}</div>}
      />
    );
    const renderTime = performance.now() - startTime;

    // Rendu < 200ms même avec 500 items (virtualisation)
    expect(renderTime).toBeLessThan(200);

    // Avec virtualisation, seuls ~20-30 items sont dans le DOM
    const renderedItems = container.querySelectorAll('[data-testid="list-item"]');
    expect(renderedItems.length).toBeLessThan(100);
  });
});
