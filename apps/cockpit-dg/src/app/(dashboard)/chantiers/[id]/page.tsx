import { LiveChantier3DDynamic } from '@/components/dashboard';

type Props = { params: Promise<{ id: string }> };

export default async function ChantierDetailPage({ params }: Props) {
  const { id } = await params;
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Chantier {id}</h1>
      <p className="text-muted-foreground">
        Vue 3D temps réel — GPS ouvriers, matériaux, photos.
      </p>
      <section aria-label="Vue live chantier 3D">
        <LiveChantier3DDynamic
          chantierId={id}
          gpsLive
          avancement={0.5}
          materialsStatus="OK"
          bureauControle="1/3"
          onActionClick={(action) => console.log('Action:', action)}
        />
      </section>
      <div className="rounded-lg border bg-card p-6">
        <p className="text-sm text-muted-foreground">Chantier ID: {id}</p>
      </div>
    </div>
  );
}
