/**
 * Hook pour récupérer les tâches du planning
 */
import { useQuery } from '@tanstack/react-query';

export interface Tache {
  id: string;
  titre: string;
  dateDebut: string;
  dateFin: string;
  journeeComplete: boolean;
  couleur?: string;
  categorie?: string;
  description?: string;
  chantier?: { id: string; nom: string };
  assignes?: { id: string; nom: string }[];
}

const MOCK_TACHES: Tache[] = [
  {
    id: '1',
    titre: 'Pose dalles sol RDC',
    dateDebut: new Date().toISOString(),
    dateFin: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    journeeComplete: false,
    couleur: '#3B82F6',
    categorie: 'gros-oeuvre',
    chantier: { id: 'vdp2', nom: 'Villa Dakar Phase 2' },
    assignes: [{ id: '1', nom: 'M. Ndoye' }],
  },
  {
    id: '2',
    titre: 'Cloisonnement lot 4',
    dateDebut: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    dateFin: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    journeeComplete: true,
    couleur: '#10B981',
    categorie: 'second-oeuvre',
    chantier: { id: 'imd', nom: 'Immeuble Diamniadio' },
  },
  {
    id: '3',
    titre: 'Peinture finitions',
    dateDebut: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    dateFin: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    journeeComplete: false,
    couleur: '#F59E0B',
    categorie: 'finitions',
    chantier: { id: 'vdp2', nom: 'Villa Dakar Phase 2' },
  },
];

export function useTaches() {
  return useQuery({
    queryKey: ['planning', 'taches'],
    queryFn: async (): Promise<{ data: Tache[] }> => {
      await new Promise((r) => setTimeout(r, 300));
      return { data: MOCK_TACHES };
    },
  });
}
