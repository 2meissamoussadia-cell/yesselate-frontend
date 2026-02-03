'use client';

/**
 * DragDropProvider — Drag & Drop avec @dnd-kit
 */

import React, { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  useDraggable,
  useDroppable,
} from '@dnd-kit/core';
import { cn } from '@/lib/utils';

export interface DragDropProviderProps {
  children: React.ReactNode;
  onDragEnd: (event: DragEndEvent) => void;
  renderDragOverlay?: (activeId: string) => React.ReactNode;
}

export function DragDropProvider({
  children,
  onDragEnd,
  renderDragOverlay,
}: DragDropProviderProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    onDragEnd(event);
  };

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      {children}
      <DragOverlay>
        {activeId && renderDragOverlay?.(activeId)}
      </DragOverlay>
    </DndContext>
  );
}

export interface DraggableItemProps {
  id: string;
  children: React.ReactNode;
  data?: Record<string, unknown>;
}

export function DraggableItem({ id, children, data }: DraggableItemProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
    data,
  });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        'cursor-grab active:cursor-grabbing',
        isDragging && 'opacity-50'
      )}
    >
      {children}
    </div>
  );
}

export interface DroppableZoneProps {
  id: string;
  children: React.ReactNode;
  data?: Record<string, unknown>;
}

export function DroppableZone({ id, children, data }: DroppableZoneProps) {
  const { setNodeRef, isOver } = useDroppable({ id, data });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'transition-all',
        isOver && 'ring-2 ring-sky-500 ring-offset-2'
      )}
    >
      {children}
    </div>
  );
}
