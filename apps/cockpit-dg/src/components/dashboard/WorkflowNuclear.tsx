'use client';

import { useState, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  useDroppable,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { endpoints } from '@/lib/api/endpoints';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface ChantierCard {
  id: string;
  nom: string;
  client?: string;
  budget?: number;
  avancementPct?: number;
  materialsStatus?: 'OK' | 'WARNING' | 'CRITICAL';
  bureauControle?: string;
  aiPredict?: number;
}

export interface Phase {
  id: number;
  nom: string;
  etapes: string[];
  chantiers: ChantierCard[];
  status: 'OK' | 'ATTENTION' | 'CRITICAL';
  metriques: {
    nbChantiers: number;
    dureeMoyenne: number;
    tauxBlocage: number;
    principauxBlocages: string[];
  };
}

export interface WorkflowNuclearProps {
  phases?: Phase[];
  dragDropEnabled?: boolean;
  bulkActions?: boolean;
  aiPredict?: boolean;
  onPhaseChange?: (chantierId: string, newPhase: number) => void;
}

const STATUS_DOTS = { OK: '●●●●●●', ATTENTION: '●●●○○○', CRITICAL: '●○○○○○' } as const;
const MATERIALS_ICON = { OK: '🟢', WARNING: '🟡', CRITICAL: '🔴' } as const;

function ChantierCardItem({
  card,
  phaseId,
  selected,
  onToggleSelect,
  aiPredict,
  compact,
}: {
  card: ChantierCard;
  phaseId: number;
  selected: boolean;
  onToggleSelect: (id: string) => void;
  aiPredict?: boolean;
  compact?: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id, data: { type: 'chantier', phaseId, card } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const materialsIcon = MATERIALS_ICON[card.materialsStatus ?? 'OK'];
  const showAiBadge = aiPredict && (card.aiPredict ?? 0) > 70;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'rounded-lg border bg-card shadow-sm',
        isDragging && 'opacity-50 shadow-lg',
        selected && 'ring-2 ring-primary'
      )}
      data-chantier-id={card.id}
    >
      <div className="flex items-start gap-2 p-3" {...listeners} {...attributes}>
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onToggleSelect(card.id)}
          onClick={(e) => e.stopPropagation()}
          className="mt-1 shrink-0"
          aria-label={`Sélectionner ${card.nom}`}
        />
        <div className="min-w-0 flex-1">
          <p className="font-medium truncate">{card.nom}</p>
          {card.client && (
            <p className="text-xs text-muted-foreground truncate">{card.client}</p>
          )}
          <div className="mt-1 flex flex-wrap items-center gap-1 text-xs">
            {card.budget != null && (
              <span className="text-muted-foreground">
                {Number(card.budget).toLocaleString()} FCFA
              </span>
            )}
            {card.avancementPct != null && (
              <span>· {Math.round(Number(card.avancementPct))}%</span>
            )}
            <span title="Matériaux">{materialsIcon}</span>
            {card.bureauControle && (
              <span className="text-muted-foreground">· Bureau {card.bureauControle}</span>
            )}
          </div>
          {showAiBadge && (
            <span
              className="mt-1 inline-block rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] text-amber-700 dark:text-amber-400"
              title="Prédiction IA"
            >
              {card.aiPredict}% retard
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function PhaseColumn({
  phase,
  chantiers,
  selectedIds,
  onToggleSelect,
  dragDropEnabled,
  aiPredict,
}: {
  phase: Phase;
  chantiers: ChantierCard[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  dragDropEnabled: boolean;
  aiPredict?: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `phase-${phase.id}` });
  const statusDots = STATUS_DOTS[phase.status];

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex min-w-[280px] flex-col rounded-lg border bg-card/50 p-3 transition-colors',
        isOver && 'border-primary bg-primary/5'
      )}
      data-phase-column={phase.id}
    >
      <div className="mb-2 border-b pb-2">
        <h3 className="font-semibold">
          PHASE {phase.id} {statusDots} {phase.metriques.nbChantiers} chantiers
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Matériel : OK · GPS Live : — · Validation : —
        </p>
      </div>
      <div className="flex flex-1 flex-col gap-2 overflow-y-auto min-h-[120px]">
        {chantiers.map((card) => (
          <ChantierCardItem
            key={card.id}
            card={card}
            phaseId={phase.id}
            selected={selectedIds.has(card.id)}
            onToggleSelect={onToggleSelect}
            aiPredict={aiPredict}
          />
        ))}
      </div>
    </div>
  );
}

function buildPhasesFromApi(
  data: { phase: number; nom: string; nbChantiers: number; chantierIds: string[] }[]
): Phase[] {
  return (data || []).map((p) => ({
    id: p.phase,
    nom: p.nom ?? `Phase ${p.phase}`,
    etapes: [],
    chantiers: (p.chantierIds ?? []).map((id) => ({
      id,
      nom: `Chantier ${id.slice(0, 8)}`,
      client: '—',
      avancementPct: 50,
      materialsStatus: 'OK' as const,
      bureauControle: '1/3',
    })),
    status: p.nbChantiers > 10 ? 'ATTENTION' : p.nbChantiers > 20 ? 'CRITICAL' : 'OK',
    metriques: {
      nbChantiers: p.nbChantiers,
      dureeMoyenne: 0,
      tauxBlocage: 0,
      principauxBlocages: [],
    },
  }));
}

export function WorkflowNuclear({
  phases: phasesProp,
  dragDropEnabled = true,
  bulkActions = true,
  aiPredict = true,
  onPhaseChange,
}: WorkflowNuclearProps) {
  const queryClient = useQueryClient();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [activeId, setActiveId] = useState<string | null>(null);
  const [localPhases, setLocalPhases] = useState<Phase[] | null>(null);

  const { data: phasesData } = useQuery({
    queryKey: ['workflow_phases'],
    queryFn: () => endpoints.workflow.phases(),
  });

  const phases: Phase[] =
    phasesProp ??
    localPhases ??
    (phasesData ? buildPhasesFromApi(phasesData) : []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveId(null);
      if (!over) return;

      const chantierId = active.id as string;
      const overId = over.id as string;
      const overStr = String(overId);
      let newPhase: number;
      if (/^phase-(\d+)$/.test(overStr)) {
        newPhase = parseInt(overStr.replace('phase-', ''), 10);
      } else {
        const targetPhase = phases.find((p) => p.chantiers.some((c) => c.id === overStr));
        newPhase = targetPhase?.id ?? 0;
      }

      if (!Number.isInteger(newPhase) || newPhase < 1 || newPhase > 6) return;

      const chantierPhase = phases.find((p) => p.chantiers.some((c) => c.id === chantierId))?.id;
      if (chantierPhase === newPhase) return;

      const prevPhases = phases.map((p) => ({
        ...p,
        chantiers: p.chantiers.filter((c) => c.id !== chantierId),
      }));
      const card = phases.flatMap((p) => p.chantiers).find((c) => c.id === chantierId);
      if (card) {
        const phaseIndex = newPhase - 1;
        if (prevPhases[phaseIndex]) {
          prevPhases[phaseIndex].chantiers.push(card);
          prevPhases[phaseIndex].metriques.nbChantiers = prevPhases[phaseIndex].chantiers.length;
        }
        setLocalPhases(prevPhases);
      }

      onPhaseChange?.(chantierId, newPhase);
      try {
        await endpoints.workflow.changePhase(chantierId, newPhase);
        queryClient.invalidateQueries({ queryKey: ['workflow_phases'] });
        toast.success('Phase mise à jour');
      } catch (e) {
        setLocalPhases(null);
        toast.error((e as Error).message ?? 'Erreur');
      }
    },
    [phases, onPhaseChange, queryClient]
  );

  const handleToggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const activeCard = activeId
    ? phases.flatMap((p) => p.chantiers).find((c) => c.id === activeId)
    : null;

  if (phases.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
        Aucune phase (brancher GET /api/workflow/phases).
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {bulkActions && selectedIds.size > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-muted/50 p-2">
          <span className="text-sm font-medium">{selectedIds.size} sélectionné(s)</span>
          <Button variant="outline" size="sm">
            Relancer fournisseur
          </Button>
          <Button variant="outline" size="sm">
            Envoyer photos
          </Button>
          <Button variant="outline" size="sm">
            Valider jalons
          </Button>
          <Button variant="outline" size="sm">
            Archiver
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setSelectedIds(new Set())}>
            Tout désélectionner
          </Button>
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {phases.map((phase) => (
            <PhaseColumn
              key={phase.id}
              phase={phase}
              chantiers={phase.chantiers}
              selectedIds={selectedIds}
              onToggleSelect={handleToggleSelect}
              dragDropEnabled={dragDropEnabled}
              aiPredict={aiPredict}
            />
          ))}
        </div>

        <DragOverlay>
          {activeCard ? (
            <div className="rounded-lg border bg-card p-3 shadow-lg">
              <p className="font-medium">{activeCard.nom}</p>
              <p className="text-xs text-muted-foreground">{activeCard.client}</p>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
