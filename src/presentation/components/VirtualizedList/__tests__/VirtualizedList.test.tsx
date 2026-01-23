/**
 * Tests unitaires pour VirtualizedList
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import { VirtualizedList } from '../VirtualizedList';

describe('VirtualizedList', () => {
  const mockItems = Array.from({ length: 1000 }, (_, i) => ({
    id: `item-${i}`,
    name: `Item ${i}`,
    value: i
  }));

  it('should render only visible items, not all items', () => {
    render(
      <VirtualizedList
        items={mockItems}
        renderItem={(item) => <div data-testid="list-item">{item.name}</div>}
        estimateSize={60}
        containerClassName="h-[400px]"
      />
    );

    // Should only render ~10-15 visible items, not 1000
    const renderedItems = screen.getAllByTestId('list-item');
    expect(renderedItems.length).toBeLessThan(20);
    expect(renderedItems.length).toBeGreaterThan(5);
  });

  it('should render empty message when items array is empty', () => {
    render(
      <VirtualizedList
        items={[]}
        renderItem={() => <div>Item</div>}
        emptyMessage="Aucun élément"
      />
    );

    expect(screen.getByText('Aucun élément')).toBeInTheDocument();
  });

  it('should use custom getItemKey when provided', () => {
    const items = [
      { id: '1', name: 'Item 1' },
      { id: '2', name: 'Item 2' }
    ];

    render(
      <VirtualizedList
        items={items}
        renderItem={(item) => <div>{item.name}</div>}
        getItemKey={(item) => item.id}
        estimateSize={60}
        containerClassName="h-[400px]"
      />
    );

    expect(screen.getByText('Item 1')).toBeInTheDocument();
  });

  it('should handle large lists efficiently', () => {
    const largeList = Array.from({ length: 10000 }, (_, i) => ({
      id: i,
      name: `Item ${i}`
    }));

    const startTime = performance.now();
    render(
      <VirtualizedList
        items={largeList}
        renderItem={(item) => <div>{item.name}</div>}
        estimateSize={60}
        containerClassName="h-[400px]"
      />
    );
    const renderTime = performance.now() - startTime;

    // Should render quickly even with 10k items
    expect(renderTime).toBeLessThan(1000); // < 1s
  });
});

