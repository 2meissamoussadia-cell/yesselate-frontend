import { HealthReactor3DDynamic, EcosystemLive } from '@/components/dashboard';

export default function Dashboard360Page() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard 360°</h1>
      <p className="text-muted-foreground">
        Vue d&apos;ensemble — HealthReactor3D, LiveChantier3D, EcosystemLive, WorkflowNuclear.
      </p>
      <section aria-label="Santé entreprise 3D">
        <h2 className="mb-2 text-lg font-semibold">Health Reactor 3D</h2>
        <HealthReactor3DDynamic
          operations={0.87}
          finance={0.76}
          workflow={0.62}
          criticalAlerts={3}
          onSphereClick={(domain) => console.log('Sphere clicked:', domain)}
        />
      </section>
      <section aria-label="Écosystème vivant">
        <h2 className="mb-2 text-lg font-semibold">Écosystème vivant</h2>
        <EcosystemLive
          ouvriersKyc={8}
          quincailleries={4}
          huissiersPending={1}
          onNodeClick={(type, id) => console.log('Node:', type, id)}
        />
      </section>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {['Opérations', 'Finance', 'Workflow', 'Alertes'].map((label, i) => (
          <div
            key={label}
            className="animate-fade-in rounded-lg border bg-card p-4 shadow-sm"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <h3 className="font-medium">{label}</h3>
            <p className="mt-2 text-2xl font-bold text-primary">—</p>
            <p className="text-xs text-muted-foreground">KPI à connecter</p>
          </div>
        ))}
      </div>
    </div>
  );
}
