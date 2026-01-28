/**
 * CardList Component
 * Affichage en grille de cards avec interactions
 * Basé sur le pattern de DemandesKpiPage.tsx
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { DashboardGrid } from './DashboardPageLayout';

export interface CardListProps<T extends { id: string }> {
  items: T[];
  renderCard: (item: T, index: number) => React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
  emptyMessage?: string;
  className?: string;
}

export function CardList<T extends { id: string }>({
  items,
  renderCard,
  columns = 2,
  gap = 'md',
  emptyMessage = 'Aucun élément disponible',
  className,
}: CardListProps<T>) {
  if (items.length === 0) {
    return (
      <div className={cn('text-center py-12', className)}>
        <p className="text-slate-400 text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <DashboardGrid columns={columns} gap={gap} className={className}>
      {items.map((item, index) => (
        <React.Fragment key={item.id}>
          {renderCard(item, index)}
        </React.Fragment>
      ))}
    </DashboardGrid>
  );
}
