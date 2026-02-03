/**
 * Tests AlertsPage — Module Centre d'alertes (architecture Outlook-like)
 */

import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AlertsCenterPage from '@/app/(portals)/maitre-ouvrage/alerts/page';
import { alertsBtpApi } from '@/lib/api/alerts-btp';

jest.mock('@/lib/api/alerts-btp', () => ({
  alertsBtpApi: {
    getAlertes: jest.fn(),
    getAlerte: jest.fn(),
    createAlerte: jest.fn(),
    updateAlerte: jest.fn(),
    deleteAlerte: jest.fn(),
  },
}));

const mockAlertes = [
  {
    id: '1',
    numero: 'A-2024-0001',
    titre: 'Retard livraison béton',
    description: "Le béton prévu pour le 15/01 n'est toujours pas livré",
    niveau: 'critique' as const,
    statut: 'non-traite' as const,
    categorie: 'technique' as const,
    priorite: 'haute' as const,
    urgent: true,
    chantier: {
      id: 'vdp2',
      nom: 'Villa Dakar Phase 2',
      code: 'VDP2-2024',
    },
    emetteur: {
      id: 'user1',
      nom: 'A. DIALLO',
      role: 'Chef de chantier',
    },
    dateCreation: new Date('2024-01-15'),
    dateModification: new Date('2024-01-15'),
    pieceJointes: [],
    commentaires: [],
    historique: [],
    archived: false,
    deleted: false,
    version: 1,
  },
  {
    id: '2',
    numero: 'A-2024-0002',
    titre: 'Fissures dans le mur',
    description: 'Fissures observées sur le mur nord',
    niveau: 'important' as const,
    statut: 'en-cours' as const,
    categorie: 'qualite' as const,
    priorite: 'moyenne' as const,
    urgent: false,
    chantier: {
      id: 'vdp2',
      nom: 'Villa Dakar Phase 2',
      code: 'VDP2-2024',
    },
    emetteur: {
      id: 'user2',
      nom: 'M. NDIAYE',
      role: "Ingénieur qualité",
    },
    dateCreation: new Date('2024-01-14'),
    dateModification: new Date('2024-01-14'),
    pieceJointes: [],
    commentaires: [],
    historique: [],
    archived: false,
    deleted: false,
    version: 1,
  },
];

describe('AlertsPage', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    jest.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    (alertsBtpApi.getAlertes as jest.Mock).mockResolvedValue({
      data: mockAlertes,
      total: 2,
      page: 1,
      totalPages: 1,
    });
  });

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        {component}
      </QueryClientProvider>
    );
  };

  it('renders page with alerts list', async () => {
    renderWithProviders(<AlertsCenterPage />);

    await waitFor(() => {
      expect(screen.getByText('Retard livraison béton')).toBeInTheDocument();
      expect(screen.getByText('Fissures dans le mur')).toBeInTheDocument();
    });
  });

  it('displays correct badges and metadata', async () => {
    renderWithProviders(<AlertsCenterPage />);

    await waitFor(() => {
      expect(screen.getByText('A-2024-0001')).toBeInTheDocument();
      expect(screen.getByText('A-2024-0002')).toBeInTheDocument();
      expect(screen.getAllByText('Villa Dakar Phase 2').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('filters alerts when clicking sidebar items', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AlertsCenterPage />);

    await waitFor(() => {
      expect(screen.getByText('Retard livraison béton')).toBeInTheDocument();
    });

    const sidebar = screen.getByRole('complementary', { name: /dossiers/i });
    const critiquesBtn = within(sidebar).getByRole('button', { name: /critiques/i });
    await user.click(critiquesBtn);

    await waitFor(() => {
      expect(alertsBtpApi.getAlertes).toHaveBeenCalledWith(
        expect.objectContaining({
          filters: expect.objectContaining({
            niveaux: ['critique'],
          }),
        })
      );
    });
  });

  it('opens detail panel when clicking an alert', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AlertsCenterPage />);

    await waitFor(() => {
      expect(screen.getByText('Retard livraison béton')).toBeInTheDocument();
    });

    const alertRow = screen.getByText('Retard livraison béton');
    await user.click(alertRow);

    await waitFor(() => {
      const desc = screen.getAllByText("Le béton prévu pour le 15/01 n'est toujours pas livré");
      expect(desc.length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText(/1\s+élément\s+sélectionné/)).toBeInTheDocument();
    });
  });

  it('opens create dialog when clicking "Nouvelle alerte"', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AlertsCenterPage />);

    await waitFor(() => {
      expect(screen.getByText('Retard livraison béton')).toBeInTheDocument();
    });

    const createButton = screen.getByRole('button', { name: /nouvelle alerte/i });
    await user.click(createButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  it('displays empty state when no alerts', async () => {
    (alertsBtpApi.getAlertes as jest.Mock).mockResolvedValue({
      data: [],
      total: 0,
      page: 1,
      totalPages: 0,
    });

    renderWithProviders(<AlertsCenterPage />);

    await waitFor(() => {
      expect(screen.getByText(/aucune alerte/i)).toBeInTheDocument();
    });
  });
});
