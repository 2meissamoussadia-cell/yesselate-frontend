export default function ChantiersPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Chantiers</h1>
      <p className="text-muted-foreground">
        Liste des chantiers — à connecter à GET /api/chantiers.
      </p>
      <div className="rounded-lg border bg-card p-6">
        <p className="text-sm text-muted-foreground">Aucun chantier (API à brancher).</p>
      </div>
    </div>
  );
}
