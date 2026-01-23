# 💡 Exemples d'Utilisation - Composants Critiques

**Date**: 10 Janvier 2026  
**Pour**: Développeurs Frontend  
**Objectif**: Exemples pratiques et concrets

---

## 📋 Table des Matières

1. [Exemple Complet : Liste avec Modal](#exemple-complet-liste-avec-modal)
2. [Exemple : Formulaire avec Toast](#exemple-formulaire-avec-toast)
3. [Exemple : Liste avec Loading et Empty States](#exemple-liste-avec-loading-et-empty-states)
4. [Exemple : Route Protégée](#exemple-route-protégée)
5. [Exemple : Page avec Error Boundary](#exemple-page-avec-error-boundary)

---

## 1. Exemple Complet : Liste avec Modal

### Composant Liste

```tsx
'use client';

import { useState, useEffect } from 'react';
import { useListNavigation } from '@/lib/hooks/useListNavigation';
import { useToast } from '@/components/features/bmo';
import { Spinner, SkeletonList } from '@/components/features/bmo';
import { EmptyList } from '@/components/features/bmo';
import { DetailModal } from '@/components/ui/detail-modal';
import { mockBlockedDossiers } from '@/lib/mocks';
import type { BlockedDossier } from '@/lib/mocks/blocked.mock';

export function BlockedDossiersList() {
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const {
    selectedItem,
    isOpen,
    canNavigatePrev,
    canNavigateNext,
    handleOpen,
    handleClose,
    handleNext,
    handlePrevious,
  } = useListNavigation<BlockedDossier>(mockBlockedDossiers, (item) => item.id);

  // Simuler chargement
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <SkeletonList items={5} />
      </div>
    );
  }

  if (mockBlockedDossiers.length === 0) {
    return (
      <div className="p-6">
        <EmptyList
          itemName="dossier bloqué"
          onCreate={() => {
            toast.info('Fonctionnalité de création à venir');
          }}
        />
      </div>
    );
  }

  return (
    <>
      <div className="p-6 space-y-3">
        <h2 className="text-2xl font-bold text-slate-200 mb-4">
          Dossiers Bloqués ({mockBlockedDossiers.length})
        </h2>

        {mockBlockedDossiers.map((dossier) => (
          <div
            key={dossier.id}
            onClick={() => handleOpen(dossier)}
            className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800 hover:border-slate-600 cursor-pointer transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-200 mb-1">
                  {dossier.titre}
                </h3>
                <p className="text-sm text-slate-400 line-clamp-2">
                  {dossier.description}
                </p>
              </div>

              <div className="flex-shrink-0 flex items-center gap-2">
                <span
                  className={`px-2 py-1 rounded-lg text-xs font-medium ${
                    dossier.priorite === 'critique'
                      ? 'bg-red-500/20 text-red-400'
                      : dossier.priorite === 'urgent'
                      ? 'bg-orange-500/20 text-orange-400'
                      : 'bg-blue-500/20 text-blue-400'
                  }`}
                >
                  {dossier.priorite}
                </span>
                <span className="text-xs text-slate-500">
                  {dossier.reference}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedItem && (
        <DetailModal
          isOpen={isOpen}
          onClose={handleClose}
          title={selectedItem.titre}
          subtitle={selectedItem.reference}
          canNavigatePrev={canNavigatePrev}
          canNavigateNext={canNavigateNext}
          onNavigatePrev={handlePrevious}
          onNavigateNext={handleNext}
        >
          <div className="p-6 space-y-4">
            <div>
              <h4 className="text-sm font-medium text-slate-400 mb-2">
                Description
              </h4>
              <p className="text-slate-200">{selectedItem.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-slate-400 mb-1">
                  Statut
                </h4>
                <p className="text-slate-200">{selectedItem.status}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-slate-400 mb-1">
                  Priorité
                </h4>
                <p className="text-slate-200">{selectedItem.priorite}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-slate-400 mb-1">
                  Type
                </h4>
                <p className="text-slate-200">{selectedItem.type}</p>
              </div>
              {selectedItem.montant && (
                <div>
                  <h4 className="text-sm font-medium text-slate-400 mb-1">
                    Montant
                  </h4>
                  <p className="text-slate-200">
                    {selectedItem.montant.toLocaleString('fr-FR')} {selectedItem.devise}
                  </p>
                </div>
              )}
            </div>
          </div>
        </DetailModal>
      )}
    </>
  );
}
```

---

## 2. Exemple : Formulaire avec Toast

### Composant Formulaire

```tsx
'use client';

import { useState } from 'react';
import { useToast } from '@/components/features/bmo';
import { LoadingButton } from '@/components/features/bmo';

interface FormData {
  nom: string;
  email: string;
  message: string;
}

export function ContactForm() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    nom: '',
    email: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simuler appel API
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Success
      toast.success('Message envoyé avec succès !', {
        title: 'Formulaire envoyé',
        action: {
          label: 'Voir',
          onClick: () => console.log('Voir message'),
        },
      });

      // Reset form
      setFormData({ nom: '', email: '', message: '' });
    } catch (error) {
      // Error
      toast.error('Erreur lors de l\'envoi du message', {
        title: 'Erreur',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4 max-w-2xl">
      <h2 className="text-2xl font-bold text-slate-200 mb-4">
        Formulaire de Contact
      </h2>

      <div>
        <label className="block text-sm font-medium text-slate-400 mb-2">
          Nom
        </label>
        <input
          type="text"
          value={formData.nom}
          onChange={handleChange('nom')}
          required
          className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-400 mb-2">
          Email
        </label>
        <input
          type="email"
          value={formData.email}
          onChange={handleChange('email')}
          required
          className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-400 mb-2">
          Message
        </label>
        <textarea
          value={formData.message}
          onChange={handleChange('message')}
          required
          rows={5}
          className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex gap-3">
        <LoadingButton
          loading={loading}
          type="submit"
          className="px-6 py-2 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors"
        >
          Envoyer
        </LoadingButton>

        <button
          type="button"
          onClick={() => {
            setFormData({ nom: '', email: '', message: '' });
            toast.info('Formulaire réinitialisé');
          }}
          className="px-6 py-2 rounded-lg bg-slate-700 text-slate-200 font-medium hover:bg-slate-600 transition-colors"
        >
          Réinitialiser
        </button>
      </div>
    </form>
  );
}
```

---

## 3. Exemple : Liste avec Loading et Empty States

### Composant Liste

```tsx
'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/components/features/bmo';
import { Spinner, SkeletonList } from '@/components/features/bmo';
import { EmptyList, EmptyError } from '@/components/features/bmo';
import { mockClients } from '@/lib/mocks';
import type { Client } from '@/lib/mocks/clients.mock';

export function ClientsList() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    setLoading(true);
    setError(null);

    try {
      // Simuler appel API
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setClients(mockClients);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      toast.error('Erreur lors du chargement des clients');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <SkeletonList items={5} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <EmptyError error={error} onRetry={loadClients} />
      </div>
    );
  }

  if (clients.length === 0) {
    return (
      <div className="p-6">
        <EmptyList
          itemName="client"
          onCreate={() => {
            toast.info('Fonctionnalité de création à venir');
          }}
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-3">
      <h2 className="text-2xl font-bold text-slate-200 mb-4">
        Clients ({clients.length})
      </h2>

      {clients.map((client) => (
        <div
          key={client.id}
          className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800 transition-colors"
        >
          <h3 className="font-semibold text-slate-200 mb-1">{client.nom}</h3>
          <p className="text-sm text-slate-400">{client.email}</p>
        </div>
      ))}
    </div>
  );
}
```

---

## 4. Exemple : Route Protégée

### Page Protégée

```tsx
'use client';

import { ProtectedRoute, useAuth, useRole } from '@/lib/contexts';
import { useToast } from '@/components/features/bmo';

function AdminDashboard() {
  const { user } = useAuth();
  const isAdmin = useRole('admin');
  const { toast } = useToast();

  if (!isAdmin) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-200 mb-2">
            Accès refusé
          </h2>
          <p className="text-slate-400">
            Vous n'avez pas les permissions nécessaires pour accéder à cette page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-slate-200 mb-4">
        Tableau de Bord Administrateur
      </h1>
      <p className="text-slate-400 mb-4">
        Bienvenue {user?.prenom} {user?.nom}
      </p>
      {/* Contenu admin */}
    </div>
  );
}

// Wrapper avec ProtectedRoute
export default function AdminDashboardPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <AdminDashboard />
    </ProtectedRoute>
  );
}
```

---

## 5. Exemple : Page avec Error Boundary

### Page avec Error Boundary

```tsx
'use client';

import { ErrorBoundary } from '@/components/features/bmo';

function MyComponent() {
  // Ce composant peut générer une erreur
  const data = null;
  return <div>{data.property}</div>; // ❌ Erreur !
}

export default function MyPage() {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('Erreur capturée:', error, errorInfo);
        // Envoyer à un service de monitoring
      }}
    >
      <MyComponent />
    </ErrorBoundary>
  );
}
```

---

## 📚 Ressources

- **Guide Complet**: `GUIDE_UTILISATION_RAPIDE.md`
- **Quick Start**: `QUICK_START_GUIDE.md`
- **Index Complet**: `INDEX_COMPLET_FINAL.md`

---

**Document créé le**: 10 Janvier 2026  
**Version**: 1.0








