/**
 * Tests unitaires pour VirtualizedList
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import { VirtualizedList } from '../VirtualizedList';

describe('VirtualizedList', () => {
  const mockItems = Array.from({ length: 1000 }, (_, i) => ({
    id: `item-${i}`,
    name: `Item ${i}`
  }));

  it('should render only visible items', () => {
    render(
      <VirtualizedList
        items={mockItems}
        renderItem={(item) => <div data-testid={`item-${item.id}`}>{item.name}</div>}
        estimateSize={60}
        containerHeight={400}
      />
    );

    // Should only render ~10-15 visible items, not 1000
    const renderedItems = screen.queryAllByTestId(/^item-item-\d+$/);
    expect(renderedItems.length).toBeLessThan(20);
  });

  it('should render items with correct content', () => {
    render(
      <VirtualizedList
        items={mockItems.slice(0, 10)}
        renderItem={(item) => <div>{item.name}</div>}
        estimateSize={60}
        containerHeight={400}
      />
    );

    expect(screen.getByText('Item 0')).toBeInTheDocument();
  });

  it('should handle empty list', () => {
    render(
      <VirtualizedList
        items={[]}
        renderItem={() => <div>Item</div>}
        estimateSize={60}
        containerHeight={400}
      />
    );

    expect(screen.queryByText('Item')).not.toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <VirtualizedList
        items={mockItems.slice(0, 5)}
        renderItem={(item) => <div>{item.name}</div>}
        estimateSize={60}
        containerHeight={400}
        className="custom-list"
        containerClassName="custom-container"
      />
    );

    expect(container.querySelector('.custom-container')).toBeInTheDocument();
    expect(container.querySelector('.custom-list')).toBeInTheDocument();
  });
});

