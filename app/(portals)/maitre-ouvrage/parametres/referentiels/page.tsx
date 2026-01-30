'use client';

/**
 * Administration / Référentiels — Gestion des rôles et permissions (ERP BTP).
 * DG, MOA, MOE, OPC, Administrateur, Lecteur.
 */

import { PageTemplate } from '@/components/navigation/PageTemplate';
import { UserRoleManager } from '@/components/admin';

export default function ReferentielsPage() {
  return (
    <PageTemplate
      title="Référentiels"
      description="Gestion des rôles et permissions : DG, MOA, MOE, OPC, Administrateur, Lecteur."
    >
      <div className="space-y-6">
        <UserRoleManager
          onRoleChange={(userId, role) => {
            // À brancher sur API / store
          }}
        />
      </div>
    </PageTemplate>
  );
}
