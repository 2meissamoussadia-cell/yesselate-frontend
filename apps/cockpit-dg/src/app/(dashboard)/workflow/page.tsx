import { WorkflowNuclear } from '@/components/dashboard';

export default function WorkflowPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Workflow — 6 phases</h1>
      <p className="text-muted-foreground">
        Kanban 6 phases — GET /api/workflow/phases, drag & drop, actions groupées.
      </p>
      <WorkflowNuclear
        dragDropEnabled
        bulkActions
        aiPredict
        onPhaseChange={(chantierId, newPhase) => {
          console.log('Phase change:', chantierId, newPhase);
        }}
      />
    </div>
  );
}
