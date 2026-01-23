/**
 * Mock Data pour Clients - Version complète et réaliste
 * Peut être facilement remplacé par de vraies API calls
 */

export interface Client {
  id: string;
  name: string;
  type: 'premium' | 'standard' | 'prospect';
  sector: string;
  ca: string;
  caNumeric: number;
  satisfaction: number;
  since: string;
  city: string;
  region: string;
  status: 'active' | 'pending' | 'at_risk' | 'inactive' | 'prospect';
  contacts: number;
  employees?: number;
  website?: string;
  address?: string;
  postalCode?: string;
  country: string;
  tags: string[];
  lastInteraction?: string;
  nextAction?: string;
  manager?: string;
  projects?: number;
  contracts?: number;
  revenue?: {
    month: string;
    amount: number;
  }[];
  notes?: string;
}

export interface Prospect {
  id: string;
  name: string;
  contact: string;
  email: string;
  phone: string;
  source: string;
  status: 'hot' | 'warm' | 'cold';
  value: string;
  valueNumeric: number;
  lastContact: string;
  progress: number;
  sector: string;
  employees?: number;
  city: string;
  nextStep?: string;
  probability?: number;
  competitors?: string[];
  notes?: string;
}

export interface Litige {
  id: string;
  client: string;
  clientId: string;
  subject: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  date: string;
  status: 'open' | 'in_progress' | 'resolved' | 'escalated';
  amount: string;
  amountNumeric: number;
  daysOpen: number;
  assignedTo?: string;
  resolution?: string;
  priority: number;
  category: string;
  actions: {
    id: string;
    date: string;
    user: string;
    action: string;
    comment?: string;
  }[];
}

export interface Contact {
  id: string;
  clientId: string;
  firstName: string;
  lastName: string;
  role: string;
  email: string;
  phone: string;
  mobile?: string;
  isPrimary: boolean;
  department?: string;
  linkedinUrl?: string;
  notes?: string;
}

export interface Interaction {
  id: string;
  clientId: string;
  type: 'call' | 'email' | 'meeting' | 'demo' | 'visit' | 'support';
  subject: string;
  description: string;
  date: string;
  duration?: number; // minutes
  participants: string[];
  outcome?: 'positive' | 'neutral' | 'negative';
  followUp?: string;
  tags: string[];
  attachments?: string[];
}

export interface Contract {
  id: string;
  clientId: string;
  type: string;
  value: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'expiring' | 'expired' | 'cancelled';
  renewalDate?: string;
  autoRenewal: boolean;
  terms: string;
  signedBy: string;
  documents?: string[];
}

// ================================
// MOCK CLIENTS
// ================================
export const mockClients: Client[] = [
  {
    id: 'CLT-001',
    name: 'Groupe Delta Technologies',
    type: 'premium',
    sector: 'Technologie',
    ca: '450K€',
    caNumeric: 450000,
    satisfaction: 98,
    since: '2021-03-15',
    city: 'Paris',
    region: 'Île-de-France',
    status: 'active',
    contacts: 12,
    employees: 250,
    website: 'www.delta-tech.fr',
    address: '123 Avenue des Champs-Élysées',
    postalCode: '75008',
    country: 'France',
    tags: ['Tech', 'Strategic', 'Key Account'],
    lastInteraction: '2025-01-08',
    nextAction: 'Renouvellement contrat Q1 2025',
    manager: 'Jean Dupont',
    projects: 8,
    contracts: 3,
    revenue: [
      { month: '2024-07', amount: 35000 },
      { month: '2024-08', amount: 38000 },
      { month: '2024-09', amount: 42000 },
      { month: '2024-10', amount: 40000 },
      { month: '2024-11', amount: 45000 },
      { month: '2024-12', amount: 48000 },
    ],
    notes: 'Client stratégique. Besoin de suivre de près le renouvellement annuel.',
  },
  {
    id: 'CLT-002',
    name: 'Omega Industries Corp',
    type: 'premium',
    sector: 'Industrie',
    ca: '380K€',
    caNumeric: 380000,
    satisfaction: 95,
    since: '2019-06-22',
    city: 'Lyon',
    region: 'Auvergne-Rhône-Alpes',
    status: 'active',
    contacts: 8,
    employees: 180,
    website: 'www.omega-industries.com',
    address: '45 Rue de la République',
    postalCode: '69002',
    country: 'France',
    tags: ['Industry', 'Long-term', 'Stable'],
    lastInteraction: '2025-01-05',
    nextAction: 'Présentation nouveaux services',
    manager: 'Marie Martin',
    projects: 5,
    contracts: 2,
    revenue: [
      { month: '2024-07', amount: 30000 },
      { month: '2024-08', amount: 31000 },
      { month: '2024-09', amount: 32000 },
      { month: '2024-10', amount: 33000 },
      { month: '2024-11', amount: 31000 },
      { month: '2024-12', amount: 32000 },
    ],
  },
  {
    id: 'CLT-003',
    name: 'Sigma Financial Holdings',
    type: 'premium',
    sector: 'Finance',
    ca: '320K€',
    caNumeric: 320000,
    satisfaction: 92,
    since: '2020-09-10',
    city: 'Marseille',
    region: 'PACA',
    status: 'active',
    contacts: 6,
    employees: 120,
    website: 'www.sigma-holdings.fr',
    address: '78 La Canebière',
    postalCode: '13001',
    country: 'France',
    tags: ['Finance', 'Compliance', 'Premium'],
    lastInteraction: '2025-01-03',
    manager: 'Pierre Dubois',
    projects: 4,
    contracts: 2,
  },
  {
    id: 'CLT-004',
    name: 'Alpha Services SARL',
    type: 'standard',
    sector: 'Services',
    ca: '150K€',
    caNumeric: 150000,
    satisfaction: 88,
    since: '2022-01-20',
    city: 'Bordeaux',
    region: 'Nouvelle-Aquitaine',
    status: 'active',
    contacts: 4,
    employees: 85,
    website: 'www.alpha-services.fr',
    address: '12 Place de la Bourse',
    postalCode: '33000',
    country: 'France',
    tags: ['Services', 'Growing'],
    lastInteraction: '2024-12-28',
    manager: 'Sophie Bernard',
    projects: 3,
    contracts: 1,
  },
  {
    id: 'CLT-005',
    name: 'Beta Tech Industries',
    type: 'standard',
    sector: 'Industrie',
    ca: '120K€',
    caNumeric: 120000,
    satisfaction: 85,
    since: '2023-03-15',
    city: 'Toulouse',
    region: 'Occitanie',
    country: 'France',
    status: 'pending',
    contacts: 3,
    employees: 60,
    tags: ['Industry', 'New'],
    lastInteraction: '2024-12-20',
    manager: 'Luc Martin',
    projects: 2,
    contracts: 1,
  },
  {
    id: 'CLT-006',
    name: 'Epsilon SA',
    type: 'standard',
    sector: 'Commerce',
    ca: '95K€',
    caNumeric: 95000,
    satisfaction: 75,
    since: '2022-11-05',
    city: 'Nantes',
    region: 'Pays de la Loire',
    country: 'France',
    status: 'at_risk',
    contacts: 3,
    employees: 45,
    tags: ['At Risk', 'Litigation'],
    lastInteraction: '2025-01-07',
    manager: 'Claire Dubois',
    projects: 1,
    contracts: 1,
    notes: 'Client mécontent suite au retard de livraison. Action urgente requise.',
  },
];

// ================================
// MOCK PROSPECTS
// ================================
export const mockProspects: Prospect[] = [
  {
    id: 'PRO-001',
    name: 'Tech Innovations SARL',
    contact: 'Marie Dupont',
    email: 'marie.dupont@techinno.fr',
    phone: '+33 6 12 34 56 78',
    source: 'Site web',
    status: 'hot',
    value: '85K€',
    valueNumeric: 85000,
    lastContact: '2025-01-09',
    progress: 75,
    sector: 'Technologie',
    employees: 45,
    city: 'Paris',
    nextStep: 'Présentation solution complète',
    probability: 80,
    competitors: ['Concurrent A', 'Concurrent B'],
    notes: 'Très intéressé par notre solution. Budget confirmé pour Q1 2025.',
  },
  {
    id: 'PRO-002',
    name: 'Green Energy Solutions',
    contact: 'Paul Martin',
    email: 'paul.martin@greenenergy.fr',
    phone: '+33 6 98 76 54 32',
    source: 'Recommandation',
    status: 'warm',
    value: '120K€',
    valueNumeric: 120000,
    lastContact: '2025-01-06',
    progress: 50,
    sector: 'Énergie',
    employees: 80,
    city: 'Lyon',
    nextStep: 'Rendez-vous CEO',
    probability: 60,
    notes: 'En phase de comparaison. Besoin de références clients.',
  },
  {
    id: 'PRO-003',
    name: 'Digital Solutions Group',
    contact: 'Sophie Bernard',
    email: 'sophie@digitalsol.fr',
    phone: '+33 6 45 67 89 01',
    source: 'Salon professionnel',
    status: 'cold',
    value: '45K€',
    valueNumeric: 45000,
    lastContact: '2024-12-28',
    progress: 25,
    sector: 'Services',
    employees: 30,
    city: 'Bordeaux',
    nextStep: 'Relance téléphonique',
    probability: 30,
    notes: 'Premier contact au salon. Intérêt limité pour le moment.',
  },
  {
    id: 'PRO-004',
    name: 'Innovative Healthcare',
    contact: 'Dr. Jean Rousseau',
    email: 'j.rousseau@innohealthcare.fr',
    phone: '+33 6 23 45 67 89',
    source: 'LinkedIn',
    status: 'warm',
    value: '95K€',
    valueNumeric: 95000,
    lastContact: '2025-01-04',
    progress: 55,
    sector: 'Santé',
    employees: 65,
    city: 'Marseille',
    nextStep: 'Demo produit',
    probability: 55,
  },
];

// ================================
// MOCK LITIGES
// ================================
export const mockLitiges: Litige[] = [
  {
    id: 'LIT-001',
    client: 'Epsilon SA',
    clientId: 'CLT-006',
    subject: 'Retard de livraison - Commande #4521',
    description: 'Le client n\'a pas reçu sa commande dans les délais convenus. Retard de 15 jours sur la date prévue. Impact sur leur production.',
    severity: 'high',
    date: '2025-01-03',
    status: 'open',
    amount: '12K€',
    amountNumeric: 12000,
    daysOpen: 7,
    assignedTo: 'Claire Dubois',
    priority: 1,
    category: 'Livraison',
    actions: [
      {
        id: 'ACT-001',
        date: '2025-01-03',
        user: 'System',
        action: 'Litige ouvert',
      },
      {
        id: 'ACT-002',
        date: '2025-01-04',
        user: 'Claire Dubois',
        action: 'Premier contact avec le client',
        comment: 'Client très mécontent. Menace d\'annulation de contrat.',
      },
      {
        id: 'ACT-003',
        date: '2025-01-06',
        user: 'Claire Dubois',
        action: 'Coordination avec logistique',
        comment: 'Livraison prévue pour le 12/01.',
      },
    ],
  },
  {
    id: 'LIT-002',
    client: 'Zeta Corporation',
    clientId: 'CLT-007',
    subject: 'Qualité non conforme - Lot #892',
    description: 'Produits reçus ne correspondent pas aux spécifications. Taux de défaut: 15%. Client demande remboursement partiel.',
    severity: 'medium',
    date: '2025-01-01',
    status: 'in_progress',
    amount: '5K€',
    amountNumeric: 5000,
    daysOpen: 9,
    assignedTo: 'Luc Martin',
    priority: 2,
    category: 'Qualité',
    actions: [
      {
        id: 'ACT-004',
        date: '2025-01-01',
        user: 'System',
        action: 'Litige ouvert',
      },
      {
        id: 'ACT-005',
        date: '2025-01-02',
        user: 'Luc Martin',
        action: 'Analyse qualité initiée',
      },
      {
        id: 'ACT-006',
        date: '2025-01-08',
        user: 'Luc Martin',
        action: 'Proposition de compensation',
        comment: 'Offre de remplacement + 10% de remise.',
      },
    ],
  },
  {
    id: 'LIT-003',
    client: 'Eta Industries',
    clientId: 'CLT-008',
    subject: 'Erreur de facturation',
    description: 'Montant facturé supérieur au devis. Différence de 2 300€.',
    severity: 'low',
    date: '2024-12-28',
    status: 'resolved',
    amount: '2.3K€',
    amountNumeric: 2300,
    daysOpen: 0,
    assignedTo: 'Sophie Bernard',
    resolution: 'Avoir émis. Client satisfait.',
    priority: 3,
    category: 'Facturation',
    actions: [
      {
        id: 'ACT-007',
        date: '2024-12-28',
        user: 'System',
        action: 'Litige ouvert',
      },
      {
        id: 'ACT-008',
        date: '2024-12-29',
        user: 'Sophie Bernard',
        action: 'Vérification comptable',
      },
      {
        id: 'ACT-009',
        date: '2025-01-02',
        user: 'Sophie Bernard',
        action: 'Résolution',
        comment: 'Avoir émis pour 2 300€. Client satisfait de la réactivité.',
      },
    ],
  },
];

// ================================
// MOCK CONTACTS
// ================================
export const mockContacts: Contact[] = [
  {
    id: 'CON-001',
    clientId: 'CLT-001',
    firstName: 'Jean-Pierre',
    lastName: 'Durand',
    role: 'CEO',
    email: 'jp.durand@delta-tech.fr',
    phone: '+33 1 23 45 67 89',
    mobile: '+33 6 12 34 56 78',
    isPrimary: true,
    department: 'Direction',
    linkedinUrl: 'https://linkedin.com/in/jpdurand',
    notes: 'Décisionnaire principal. Préfère les échanges par email.',
  },
  {
    id: 'CON-002',
    clientId: 'CLT-001',
    firstName: 'Marie',
    lastName: 'Lambert',
    role: 'CTO',
    email: 'marie.lambert@delta-tech.fr',
    phone: '+33 1 23 45 67 90',
    mobile: '+33 6 98 76 54 32',
    isPrimary: false,
    department: 'Technique',
    notes: 'Contact technique principal.',
  },
  // Ajouter d'autres contacts...
];

// ================================
// MOCK INTERACTIONS
// ================================
export const mockInteractions: Interaction[] = [
  {
    id: 'INT-001',
    clientId: 'CLT-001',
    type: 'meeting',
    subject: 'Réunion de suivi Q4',
    description: 'Revue des projets en cours et planification 2025',
    date: '2025-01-08T14:00:00Z',
    duration: 90,
    participants: ['Jean Dupont', 'Jean-Pierre Durand', 'Marie Lambert'],
    outcome: 'positive',
    followUp: 'Envoyer proposition pour nouveau projet',
    tags: ['Strategic', 'Planning'],
  },
  {
    id: 'INT-002',
    clientId: 'CLT-002',
    type: 'call',
    subject: 'Appel de courtesy',
    description: 'Prise de nouvelles après les fêtes',
    date: '2025-01-05T10:30:00Z',
    duration: 20,
    participants: ['Marie Martin', 'Contact Omega'],
    outcome: 'positive',
    tags: ['Relationship'],
  },
  {
    id: 'INT-003',
    clientId: 'CLT-006',
    type: 'support',
    subject: 'Réclamation retard livraison',
    description: 'Client mécontent du retard. Discussion tendue.',
    date: '2025-01-04T09:00:00Z',
    duration: 45,
    participants: ['Claire Dubois', 'Contact Epsilon'],
    outcome: 'negative',
    followUp: 'Escalader au manager',
    tags: ['Urgent', 'Litigation'],
  },
];

// ================================
// MOCK CONTRACTS
// ================================
export const mockContracts: Contract[] = [
  {
    id: 'CTR-001',
    clientId: 'CLT-001',
    type: 'Service annuel Premium',
    value: 450000,
    startDate: '2024-03-15',
    endDate: '2025-03-14',
    status: 'expiring',
    renewalDate: '2025-02-15',
    autoRenewal: false,
    terms: 'Renouvellement tacite sauf dénonciation 2 mois avant échéance',
    signedBy: 'Jean-Pierre Durand',
    documents: ['contract_delta_2024.pdf', 'annexe_sla.pdf'],
  },
  {
    id: 'CTR-002',
    clientId: 'CLT-002',
    type: 'Service standard',
    value: 380000,
    startDate: '2024-06-01',
    endDate: '2025-05-31',
    status: 'active',
    autoRenewal: true,
    terms: 'Reconduction automatique',
    signedBy: 'Contact Omega',
  },
];

// ================================
// HELPER FUNCTIONS
// ================================

export const getClientById = (id: string): Client | undefined => {
  return mockClients.find(c => c.id === id);
};

export const getProspectById = (id: string): Prospect | undefined => {
  return mockProspects.find(p => p.id === id);
};

export const getLitigeById = (id: string): Litige | undefined => {
  return mockLitiges.find(l => l.id === id);
};

export const getClientContacts = (clientId: string): Contact[] => {
  return mockContacts.filter(c => c.clientId === clientId);
};

export const getClientInteractions = (clientId: string): Interaction[] => {
  return mockInteractions.filter(i => i.clientId === clientId);
};

export const getClientContracts = (clientId: string): Contract[] => {
  return mockContracts.filter(c => c.clientId === clientId);
};

// Stats calculées
export const calculateStats = () => {
  const totalClients = mockClients.filter(c => c.type !== 'prospect').length;
  const premiumClients = mockClients.filter(c => c.type === 'premium').length;
  const atRiskClients = mockClients.filter(c => c.status === 'at_risk').length;
  const activeLitiges = mockLitiges.filter(l => l.status !== 'resolved').length;
  const totalCA = mockClients.reduce((sum, c) => sum + c.caNumeric, 0);
  const avgSatisfaction = Math.round(
    mockClients.reduce((sum, c) => sum + c.satisfaction, 0) / mockClients.length
  );

  return {
    totalClients,
    premiumClients,
    prospects: mockProspects.length,
    atRiskClients,
    activeLitiges,
    totalCA,
    avgSatisfaction,
    hotProspects: mockProspects.filter(p => p.status === 'hot').length,
    warmProspects: mockProspects.filter(p => p.status === 'warm').length,
    coldProspects: mockProspects.filter(p => p.status === 'cold').length,
  };
};

// Export default pour faciliter l'import
export default {
  clients: mockClients,
  prospects: mockProspects,
  litiges: mockLitiges,
  contacts: mockContacts,
  interactions: mockInteractions,
  contracts: mockContracts,
  getClientById,
  getProspectById,
  getLitigeById,
  getClientContacts,
  getClientInteractions,
  getClientContracts,
  calculateStats,
};

