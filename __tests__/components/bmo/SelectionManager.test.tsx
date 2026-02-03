/**
 * Tests SelectionManager — Sélection multiple type Outlook
 */

import React from 'react';
import { renderHook, act } from '@testing-library/react';
import {
  SelectionProvider,
  useSelection,
} from '@/components/bmo/interactions/SelectionManager';

function wrapper({ children }: { children: React.ReactNode }) {
  return <SelectionProvider>{children}</SelectionProvider>;
}

describe('SelectionManager', () => {
  it('selects single item', () => {
    const { result } = renderHook(() => useSelection(), { wrapper });

    act(() => {
      result.current.select('item1');
    });

    expect(result.current.isSelected('item1')).toBe(true);
    expect(result.current.selectedIds.size).toBe(1);
  });

  it('toggles item selection', () => {
    const { result } = renderHook(() => useSelection(), { wrapper });

    act(() => {
      result.current.toggle('item1');
    });
    expect(result.current.isSelected('item1')).toBe(true);

    act(() => {
      result.current.toggle('item1');
    });
    expect(result.current.isSelected('item1')).toBe(false);
  });

  it('selects range of items', () => {
    const allIds = ['item1', 'item2', 'item3', 'item4', 'item5'];
    const { result } = renderHook(() => useSelection(), { wrapper });

    act(() => {
      result.current.selectRange('item2', 'item4', allIds);
    });

    expect(result.current.isSelected('item1')).toBe(false);
    expect(result.current.isSelected('item2')).toBe(true);
    expect(result.current.isSelected('item3')).toBe(true);
    expect(result.current.isSelected('item4')).toBe(true);
    expect(result.current.isSelected('item5')).toBe(false);
  });

  it('selects all items', () => {
    const allIds = ['item1', 'item2', 'item3'];
    const { result } = renderHook(() => useSelection(), { wrapper });

    act(() => {
      result.current.selectAll(allIds);
    });

    expect(result.current.selectedIds.size).toBe(3);
    allIds.forEach((id) => {
      expect(result.current.isSelected(id)).toBe(true);
    });
  });

  it('clears selection', () => {
    const { result } = renderHook(() => useSelection(), { wrapper });

    act(() => {
      result.current.selectAll(['item1', 'item2', 'item3']);
    });
    expect(result.current.selectedIds.size).toBe(3);

    act(() => {
      result.current.clear();
    });
    expect(result.current.selectedIds.size).toBe(0);
  });
});
