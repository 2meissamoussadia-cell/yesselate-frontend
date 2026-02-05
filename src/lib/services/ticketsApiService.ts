/**
 * ====================================================================
 * SERVICE: Tickets Clients API
 * ====================================================================
 * 
 * Service complet pour la gestion des tickets clients.
 * Inclut toutes les opérations CRUD, actions métier et analytics.
 * Mock data réaliste - facilement remplaçable par vraies API calls.
 */

// ================================
// Types
// ================================

export type TicketPriority = 'critical' | 'high' | 'medium' | 'low';
export type TicketStatus = 'open' | 'in_progress' | 'pending' | 'resolved' | 'closed';
export type TicketCategory = 'technique' | 'commercial' | 'facturation' | 'livraison' | 'qualite' | 'autre';

export interface TicketClient {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  vip?: boolean;
  segment?: 'enterprise' | 'pme' | 'startup' | 'particulier';
  totalTickets?: number;
  satisfactionScore?: number;
}

export interface TicketAssignee {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  role?: string;
  department?: string;
}

export interface TicketMessage {
  id: string;
  ticketId: string;
  content: string;
  author: TicketAssignee | TicketClient;
  authorType: 'agent' | 'client' | 'system';
  createdAt: string;
  attachments?: TicketAttachment[];
  isInternal?: boolean;
}

export interface TicketAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface TicketSLA {
  firstResponseDeadline: string;
  resolutionDeadline: string;
  firstResponseAt?: string;
  resolvedAt?: string;
  firstResponseBreached: boolean;
  resolutionBreached: boolean;
}

export interface Ticket {
  id: string;
  reference: string;
  title: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  category: TicketCategory;
  client: TicketClient;
  assignee?: TicketAssignee;
  createdAt: string;
  updatedAt: string;
  sla: TicketSLA;
  messages: TicketMessage[];
  attachments: TicketAttachment[];
  tags: string[];
  watchers?: string[];
  relatedTickets?: string[];
  customFields?: Record<string, unknown>;
  metadata?: {
    source: 'email' | 'phone' | 'web' | 'api' | 'chat';
    channel?: string;
    browser?: string;
    os?: string;
    ip?: string;
  };
}

export interface TicketFilter {
  status?: TicketStatus | TicketStatus[];
  priority?: TicketPriority | TicketPriority[];
  category?: TicketCategory | TicketCategory[];
  assigneeId?: string;
  clientId?: string;
  search?: string;
  tags?: string[];
  slaBreached?: boolean;
  dateFrom?: string;
  dateTo?: string;
  unassigned?: boolean;
}

export interface TicketSort {
  field: 'createdAt' | 'updatedAt' | 'priority' | 'sla' | 'client';
  direction: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface TicketStats {
  total: number;
  open: number;
  inProgress: number;
  pending: number;
  resolved: number;
  closed: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  slaBreached: number;
  avgResponseTime: number; // minutes
  avgResolutionTime: number; // minutes
  satisfactionScore: number; // 0-5
  resolvedToday: number;
  newToday: number;
  byCategory: { category: TicketCategory; count: number }[];
  byAssignee: { assignee: string; count: number; resolved: number }[];
  byClient: { client: string; count: number; vip: boolean }[];
  hourlyVolume: { hour: number; count: number }[];
  dailyTrend: { date: string; opened: number; resolved: number }[];
  ts: string;
}

export interface TicketAction {
  ticketId: string;
  action: 'escalate' | 'assign' | 'resolve' | 'close' | 'reopen' | 'merge' | 'split';
  data: Record<string, unknown>;
  note?: string;
}

export interface TicketEscalation {
  ticketId: string;
  reason: string;
  urgency: 'high' | 'critical';
  targetRole: string;
  targetUser?: string;
  deadline?: string;
}

export interface TicketResolution {
  ticketId: string;
  resolution: string;
  notes?: string;
  templateId?: string;
  satisfaction?: number;
}

export interface TicketAssignment {
  ticketId: string;
  assigneeId: string;
  notes?: string;
  deadline?: string;
}

export interface AuditEntry {
  id: string;
  at: string;
  action: 'created' | 'updated' | 'assigned' | 'escalated' | 'resolved' | 'closed' | 'reopened' | 'merged' | 'commented';
  ticketId: string;
  ticketReference: string;
  userId: string;
  userName: string;
  userRole: string;
  details: string;
  changes?: Record<string, { from: unknown; to: unknown }>;
  hash?: string;
}

export interface ResponseTemplate {
  id: string;
  name: string;
  category: TicketCategory | 'general';
  subject?: string;
  content: string;
  variables: string[];
  usageCount: number;
  isActive: boolean;
}

export interface SLARule {
  id: string;
  name: string;
  priority: TicketPriority;
  category?: TicketCategory;
  clientSegment?: string;
  firstResponseMinutes: number;
  resolutionMinutes: number;
  businessHoursOnly: boolean;
  isActive: boolean;
}

// ================================
// Mock Data
// ================================

const MOCK_CLIENTS: TicketClient[] = [
  { id: 'CLI-001', name: 'Acme Corporation', email: 'contact@acme.com', phone: '+221 77 123 4567', company: 'Acme Corp', vip: true, segment: 'enterprise', totalTickets: 45, satisfactionScore: 4.2 },
  { id: 'CLI-002', name: 'TechStart SAS', email: 'support@techstart.io', phone: '+221 78 234 5678', company: 'TechStart', vip: false, segment: 'startup', totalTickets: 23, satisfactionScore: 4.5 },
  { id: 'CLI-003', name: 'Global Industries', email: 'info@globalinc.com', phone: '+221 76 345 6789', company: 'Global Inc', vip: true, segment: 'enterprise', totalTickets: 67, satisfactionScore: 4.0 },
  { id: 'CLI-004', name: 'StartupXYZ', email: 'hello@startupxyz.com', phone: '+221 70 456 7890', company: 'StartupXYZ', vip: false, segment: 'startup', totalTickets: 12, satisfactionScore: 4.8 },
  { id: 'CLI-005', name: 'MegaCorp Ltd', email: 'support@megacorp.com', phone: '+221 77 567 8901', company: 'MegaCorp', vip: true, segment: 'enterprise', totalTickets: 89, satisfactionScore: 3.9 },
  { id: 'CLI-006', name: 'DataFlow SAS', email: 'tech@dataflow.io', phone: '+221 78 678 9012', company: 'DataFlow', vip: false, segment: 'pme', totalTickets: 34, satisfactionScore: 4.6 },
  { id: 'CLI-007', name: 'Senegal Logistics', email: 'contact@senlog.sn', phone: '+221 76 789 0123', company: 'SenLog', vip: false, segment: 'pme', totalTickets: 28, satisfactionScore: 4.3 },
  { id: 'CLI-008', name: 'Dakar Digital', email: 'info@dakardigital.com', phone: '+221 70 890 1234', company: 'Dakar Digital', vip: true, segment: 'enterprise', totalTickets: 56, satisfactionScore: 4.1 },
];

const MOCK_ASSIGNEES: TicketAssignee[] = [
  { id: 'AGT-001', name: 'Marie Dupont', email: 'marie.d@support.com', role: 'Senior Agent', department: 'Support Technique' },
  { id: 'AGT-002', name: 'Jean Pierre', email: 'jean.p@support.com', role: 'Agent', department: 'Support Commercial' },
  { id: 'AGT-003', name: 'Sophie Laurent', email: 'sophie.l@support.com', role: 'Agent', department: 'Support Facturation' },
  { id: 'AGT-004', name: 'Lucas Martin', email: 'lucas.m@support.com', role: 'Tech Lead', department: 'Support Technique' },
  { id: 'AGT-005', name: 'Aminata Diallo', email: 'aminata.d@support.com', role: 'Superviseur', department: 'Direction Support' },
  { id: 'AGT-006', name: 'Moussa Ndiaye', email: 'moussa.n@support.com', role: 'Agent', department: 'Support Qualité' },
];

const MOCK_TAGS = ['urgent', 'vip', 'escalade', 'remboursement', 'technique', 'facturation', 'contrat', 'livraison', 'qualite', 'reclamation', 'info', 'suivi'];

function generateTicketReference(): string {
  const year = new Date().getFullYear();
  const num = String(Math.floor(Math.random() * 9999)).padStart(4, '0');
  return `TK-${year}-${num}`;
}

function randomDate(daysAgo: number): string {
  const date = new Date();
  date.setMinutes(date.getMinutes() - Math.floor(Math.random() * daysAgo * 24 * 60));
  return date.toISOString();
}

function generateSLA(priority: TicketPriority, createdAt: string): TicketSLA {
  const created = new Date(createdAt);
  const responseMinutes = { critical: 30, high: 60, medium: 240, low: 480 }[priority];
  const resolutionMinutes = { critical: 120, high: 480, medium: 1440, low: 2880 }[priority];
  
  const firstResponseDeadline = new Date(created.getTime() + responseMinutes * 60000).toISOString();
  const resolutionDeadline = new Date(created.getTime() + resolutionMinutes * 60000).toISOString();
  
  const now = new Date();
  const firstResponseBreached = now > new Date(firstResponseDeadline);
  const resolutionBreached = now > new Date(resolutionDeadline);
  
  return {
    firstResponseDeadline,
    resolutionDeadline,
    firstResponseBreached,
    resolutionBreached,
  };
}

function generateMockTickets(count: number = 50): Ticket[] {
  const tickets: Ticket[] = [];
  const priorities: TicketPriority[] = ['critical', 'high', 'medium', 'low'];
  const statuses: TicketStatus[] = ['open', 'in_progress', 'pending', 'resolved', 'closed'];
  const categories: TicketCategory[] = ['technique', 'commercial', 'facturation', 'livraison', 'qualite', 'autre'];
  const sources: Array<'api' | 'email' | 'phone' | 'web' | 'chat'> = ['email', 'phone', 'web', 'api', 'chat'];
  
  const titles = [
    'Problème de facturation récurrent',
    'Demande de remboursement',
    'Question sur les tarifs',
    'Modification de contrat',
    'Réclamation produit défectueux',
    'Support technique installation',
    'Erreur de livraison',
    'Demande de devis',
    'Problème de connexion',
    'Mise à jour des coordonnées',
    'Retard de livraison',
    'Demande d\'information',
    'Bug application mobile',
    'Demande de formation',
    'Problème de paiement',
    'Annulation de commande',
    'Demande de partenariat',
    'Réclamation qualité service',
    'Problème d\'accès compte',
    'Demande de documentation',
  ];

  for (let i = 0; i < count; i++) {
    const createdAt = randomDate(30);
    const priority = priorities[Math.floor(Math.random() * priorities.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const client = MOCK_CLIENTS[Math.floor(Math.random() * MOCK_CLIENTS.length)];
    const assignee = Math.random() > 0.2 ? MOCK_ASSIGNEES[Math.floor(Math.random() * MOCK_ASSIGNEES.length)] : undefined;
    
    const ticket: Ticket = {
      id: `TKT-${String(i + 1).padStart(5, '0')}`,
      reference: generateTicketReference(),
      title: titles[Math.floor(Math.random() * titles.length)],
      description: 'Description détaillée du ticket avec toutes les informations nécessaires pour le traitement.',
      priority,
      status,
      category: categories[Math.floor(Math.random() * categories.length)],
      client,
      assignee,
      createdAt,
      updatedAt: randomDate(Math.floor(Math.random() * 10)),
      sla: generateSLA(priority, createdAt),
      messages: [],
      attachments: [],
      tags: MOCK_TAGS.slice(0, Math.floor(Math.random() * 4)).sort(() => Math.random() - 0.5),
      metadata: {
        source: sources[Math.floor(Math.random() * sources.length)],
      },
    };
    
    tickets.push(ticket);
  }
  
  return tickets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

const MOCK_TICKETS = generateMockTickets(75);

const MOCK_RESPONSE_TEMPLATES: ResponseTemplate[] = [
  {
    id: 'TPL-001',
    name: 'Accusé de réception',
    category: 'general',
    content: 'Bonjour {{client_name}},\n\nNous avons bien reçu votre demande (Réf: {{ticket_ref}}) et nous vous en remercions.\n\nNotre équipe l\'analyse et vous répondra dans les plus brefs délais.\n\nCordialement,\nL\'équipe Support',
    variables: ['client_name', 'ticket_ref'],
    usageCount: 234,
    isActive: true,
  },
  {
    id: 'TPL-002',
    name: 'Demande d\'informations complémentaires',
    category: 'general',
    content: 'Bonjour {{client_name}},\n\nAfin de traiter au mieux votre demande, nous avons besoin des informations suivantes:\n\n{{questions}}\n\nMerci de nous les communiquer.\n\nCordialement,\nL\'équipe Support',
    variables: ['client_name', 'questions'],
    usageCount: 156,
    isActive: true,
  },
  {
    id: 'TPL-003',
    name: 'Résolution problème technique',
    category: 'technique',
    content: 'Bonjour {{client_name}},\n\nNous avons analysé votre problème technique et apporté la correction suivante:\n\n{{solution}}\n\nPouvez-vous confirmer que tout fonctionne correctement de votre côté?\n\nCordialement,\nL\'équipe Technique',
    variables: ['client_name', 'solution'],
    usageCount: 89,
    isActive: true,
  },
  {
    id: 'TPL-004',
    name: 'Confirmation remboursement',
    category: 'facturation',
    content: 'Bonjour {{client_name}},\n\nNous confirmons le traitement de votre demande de remboursement d\'un montant de {{montant}} FCFA.\n\nLe virement sera effectué sous 5 jours ouvrés.\n\nCordialement,\nL\'équipe Facturation',
    variables: ['client_name', 'montant'],
    usageCount: 67,
    isActive: true,
  },
  {
    id: 'TPL-005',
    name: 'Ticket résolu',
    category: 'general',
    content: 'Bonjour {{client_name}},\n\nNous avons le plaisir de vous informer que votre ticket (Réf: {{ticket_ref}}) a été résolu.\n\n{{resolution}}\n\nN\'hésitez pas à nous recontacter si nécessaire.\n\nCordialement,\nL\'équipe Support',
    variables: ['client_name', 'ticket_ref', 'resolution'],
    usageCount: 445,
    isActive: true,
  },
];

const MOCK_SLA_RULES: SLARule[] = [
  { id: 'SLA-001', name: 'Critique VIP', priority: 'critical', clientSegment: 'enterprise', firstResponseMinutes: 15, resolutionMinutes: 60, businessHoursOnly: false, isActive: true },
  { id: 'SLA-002', name: 'Critique Standard', priority: 'critical', firstResponseMinutes: 30, resolutionMinutes: 120, businessHoursOnly: false, isActive: true },
  { id: 'SLA-003', name: 'Haute Priorité', priority: 'high', firstResponseMinutes: 60, resolutionMinutes: 480, businessHoursOnly: true, isActive: true },
  { id: 'SLA-004', name: 'Priorité Moyenne', priority: 'medium', firstResponseMinutes: 240, resolutionMinutes: 1440, businessHoursOnly: true, isActive: true },
  { id: 'SLA-005', name: 'Priorité Basse', priority: 'low', firstResponseMinutes: 480, resolutionMinutes: 2880, businessHoursOnly: true, isActive: true },
];

// ================================
// API Service
// ================================

class TicketsApiService {
  private tickets: Ticket[] = MOCK_TICKETS;
  private auditLog: AuditEntry[] = [];

  // ========== CRUD ==========

  async getAll(
    filter?: TicketFilter,
    sort?: TicketSort,
    page: number = 1,
    pageSize: number = 20
  ): Promise<PaginatedResponse<Ticket>> {
    await this.delay(300);
    
    let filtered = [...this.tickets];
    
    if (filter) {
      if (filter.status) {
        const statuses = Array.isArray(filter.status) ? filter.status : [filter.status];
        filtered = filtered.filter(t => statuses.includes(t.status));
      }
      if (filter.priority) {
        const priorities = Array.isArray(filter.priority) ? filter.priority : [filter.priority];
        filtered = filtered.filter(t => priorities.includes(t.priority));
      }
      if (filter.category) {
        const categories = Array.isArray(filter.category) ? filter.category : [filter.category];
        filtered = filtered.filter(t => categories.includes(t.category));
      }
      if (filter.assigneeId) {
        filtered = filtered.filter(t => t.assignee?.id === filter.assigneeId);
      }
      if (filter.clientId) {
        filtered = filtered.filter(t => t.client.id === filter.clientId);
      }
      if (filter.unassigned) {
        filtered = filtered.filter(t => !t.assignee);
      }
      if (filter.slaBreached) {
        filtered = filtered.filter(t => t.sla.firstResponseBreached || t.sla.resolutionBreached);
      }
      if (filter.search) {
        const search = filter.search.toLowerCase();
        filtered = filtered.filter(t => 
          t.title.toLowerCase().includes(search) ||
          t.reference.toLowerCase().includes(search) ||
          t.client.name.toLowerCase().includes(search)
        );
      }
      if (filter.tags && filter.tags.length > 0) {
        filtered = filtered.filter(t => filter.tags!.some(tag => t.tags.includes(tag)));
      }
    }
    
    if (sort) {
      filtered.sort((a, b) => {
        let compare = 0;
        switch (sort.field) {
          case 'createdAt':
            compare = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            break;
          case 'updatedAt':
            compare = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
            break;
          case 'priority':
            const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
            compare = priorityOrder[a.priority] - priorityOrder[b.priority];
            break;
          case 'sla':
            compare = (a.sla.resolutionBreached ? 1 : 0) - (b.sla.resolutionBreached ? 1 : 0);
            break;
        }
        return sort.direction === 'desc' ? -compare : compare;
      });
    }
    
    const total = filtered.length;
    const start = (page - 1) * pageSize;
    const data = filtered.slice(start, start + pageSize);
    
    return {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async getById(id: string): Promise<Ticket | null> {
    await this.delay(200);
    return this.tickets.find(t => t.id === id) || null;
  }

  async getByReference(reference: string): Promise<Ticket | null> {
    await this.delay(200);
    return this.tickets.find(t => t.reference === reference) || null;
  }

  async create(data: Partial<Ticket>): Promise<Ticket> {
    await this.delay(300);
    
    const newTicket: Ticket = {
      id: `TKT-${String(this.tickets.length + 1).padStart(5, '0')}`,
      reference: generateTicketReference(),
      title: data.title || 'Nouveau ticket',
      description: data.description || '',
      priority: data.priority || 'medium',
      status: 'open',
      category: data.category || 'autre',
      client: data.client || MOCK_CLIENTS[0],
      assignee: data.assignee,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sla: generateSLA(data.priority || 'medium', new Date().toISOString()),
      messages: [],
      attachments: [],
      tags: data.tags || [],
      metadata: { source: 'web' },
    };
    
    this.tickets.unshift(newTicket);
    this.addAudit('created', newTicket, 'Ticket créé');
    
    return newTicket;
  }

  async update(id: string, data: Partial<Ticket>): Promise<Ticket> {
    await this.delay(200);
    
    const index = this.tickets.findIndex(t => t.id === id);
    if (index === -1) throw new Error('Ticket not found');
    
    const updated = {
      ...this.tickets[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    
    this.tickets[index] = updated;
    this.addAudit('updated', updated, 'Ticket mis à jour');
    
    return updated;
  }

  // ========== Actions Métier ==========

  async assign(assignment: TicketAssignment): Promise<Ticket> {
    await this.delay(300);
    
    const ticket = await this.getById(assignment.ticketId);
    if (!ticket) throw new Error('Ticket not found');
    
    const assignee = MOCK_ASSIGNEES.find(a => a.id === assignment.assigneeId);
    if (!assignee) throw new Error('Assignee not found');
    
    const updated = await this.update(assignment.ticketId, {
      assignee,
      status: ticket.status === 'open' ? 'in_progress' : ticket.status,
    });
    
    this.addAudit('assigned', updated, `Assigné à ${assignee.name}`);
    
    return updated;
  }

  async escalate(escalation: TicketEscalation): Promise<{ success: boolean; batchId: string }> {
    await this.delay(400);
    
    const ticket = await this.getById(escalation.ticketId);
    if (!ticket) throw new Error('Ticket not found');
    
    await this.update(escalation.ticketId, {
      priority: escalation.urgency as TicketPriority,
      tags: [...ticket.tags, 'escalade'],
    });
    
    const batchId = `ESC-${Date.now()}`;
    this.addAudit('escalated', ticket, `Escaladé: ${escalation.reason}`);
    
    return { success: true, batchId };
  }

  async bulkEscalate(ticketIds: string[], reason: string): Promise<{ success: boolean; batchId: string; count: number }> {
    await this.delay(500);
    
    const batchId = `BULK-ESC-${Date.now()}`;
    
    for (const id of ticketIds) {
      await this.escalate({ ticketId: id, reason, urgency: 'high', targetRole: 'Superviseur' });
    }
    
    return { success: true, batchId, count: ticketIds.length };
  }

  async resolve(resolution: TicketResolution): Promise<Ticket> {
    await this.delay(300);
    
    const ticket = await this.getById(resolution.ticketId);
    if (!ticket) throw new Error('Ticket not found');
    
    const updated = await this.update(resolution.ticketId, {
      status: 'resolved',
    });
    
    updated.sla.resolvedAt = new Date().toISOString();
    this.addAudit('resolved', updated, resolution.resolution);
    
    return updated;
  }

  async bulkResolve(ticketIds: string[], resolution: string): Promise<{ success: boolean; count: number }> {
    await this.delay(500);
    
    for (const id of ticketIds) {
      await this.resolve({ ticketId: id, resolution });
    }
    
    return { success: true, count: ticketIds.length };
  }

  async close(ticketId: string, notes?: string): Promise<Ticket> {
    await this.delay(200);
    
    const updated = await this.update(ticketId, { status: 'closed' });
    this.addAudit('closed', updated, notes || 'Ticket fermé');
    
    return updated;
  }

  async reopen(ticketId: string, reason: string): Promise<Ticket> {
    await this.delay(200);
    
    const updated = await this.update(ticketId, { status: 'open' });
    this.addAudit('reopened', updated, reason);
    
    return updated;
  }

  async addMessage(ticketId: string, content: string, isInternal: boolean = false): Promise<TicketMessage> {
    await this.delay(200);
    
    const ticket = await this.getById(ticketId);
    if (!ticket) throw new Error('Ticket not found');
    
    const message: TicketMessage = {
      id: `MSG-${Date.now()}`,
      ticketId,
      content,
      author: MOCK_ASSIGNEES[0],
      authorType: 'agent',
      createdAt: new Date().toISOString(),
      isInternal,
    };
    
    ticket.messages.push(message);
    ticket.updatedAt = new Date().toISOString();
    
    // Mark first response if this is the first agent message
    if (!ticket.sla.firstResponseAt && !isInternal) {
      ticket.sla.firstResponseAt = new Date().toISOString();
    }
    
    this.addAudit('commented', ticket, isInternal ? 'Note interne ajoutée' : 'Réponse envoyée');
    
    return message;
  }

  // ========== Statistics ==========

  async getStats(): Promise<TicketStats> {
    await this.delay(300);
    
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const open = this.tickets.filter(t => t.status === 'open').length;
    const inProgress = this.tickets.filter(t => t.status === 'in_progress').length;
    const pending = this.tickets.filter(t => t.status === 'pending').length;
    const resolved = this.tickets.filter(t => t.status === 'resolved').length;
    const closed = this.tickets.filter(t => t.status === 'closed').length;
    
    const critical = this.tickets.filter(t => t.priority === 'critical' && t.status !== 'resolved' && t.status !== 'closed').length;
    const high = this.tickets.filter(t => t.priority === 'high' && t.status !== 'resolved' && t.status !== 'closed').length;
    const medium = this.tickets.filter(t => t.priority === 'medium' && t.status !== 'resolved' && t.status !== 'closed').length;
    const low = this.tickets.filter(t => t.priority === 'low' && t.status !== 'resolved' && t.status !== 'closed').length;
    
    const slaBreached = this.tickets.filter(t => 
      (t.sla.firstResponseBreached || t.sla.resolutionBreached) && 
      t.status !== 'resolved' && t.status !== 'closed'
    ).length;
    
    const resolvedToday = this.tickets.filter(t => 
      t.status === 'resolved' && new Date(t.updatedAt) >= todayStart
    ).length;
    
    const newToday = this.tickets.filter(t => 
      new Date(t.createdAt) >= todayStart
    ).length;
    
    // Calculate category distribution
    const categories: TicketCategory[] = ['technique', 'commercial', 'facturation', 'livraison', 'qualite', 'autre'];
    const byCategory = categories.map(cat => ({
      category: cat,
      count: this.tickets.filter(t => t.category === cat && t.status !== 'closed').length,
    }));
    
    // Calculate assignee stats
    const byAssignee = MOCK_ASSIGNEES.map(a => ({
      assignee: a.name,
      count: this.tickets.filter(t => t.assignee?.id === a.id && t.status !== 'closed').length,
      resolved: this.tickets.filter(t => t.assignee?.id === a.id && t.status === 'resolved').length,
    }));
    
    // Calculate client stats
    const byClient = MOCK_CLIENTS.slice(0, 10).map(c => ({
      client: c.name,
      count: this.tickets.filter(t => t.client.id === c.id).length,
      vip: c.vip || false,
    }));
    
    return {
      total: this.tickets.length,
      open,
      inProgress,
      pending,
      resolved,
      closed,
      critical,
      high,
      medium,
      low,
      slaBreached,
      avgResponseTime: 24,
      avgResolutionTime: 480,
      satisfactionScore: 4.6,
      resolvedToday,
      newToday,
      byCategory,
      byAssignee,
      byClient,
      hourlyVolume: Array.from({ length: 24 }, (_, i) => ({ hour: i, count: Math.floor(Math.random() * 10) })),
      dailyTrend: Array.from({ length: 14 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (13 - i));
        return {
          date: date.toISOString().split('T')[0],
          opened: Math.floor(Math.random() * 20) + 5,
          resolved: Math.floor(Math.random() * 18) + 3,
        };
      }),
      ts: new Date().toISOString(),
    };
  }

  // ========== Audit ==========

  async getAuditLog(ticketId?: string, limit: number = 50): Promise<AuditEntry[]> {
    await this.delay(200);
    
    let logs = [...this.auditLog];
    
    if (ticketId) {
      logs = logs.filter(l => l.ticketId === ticketId);
    }
    
    return logs.slice(0, limit);
  }

  // ========== Templates ==========

  async getResponseTemplates(): Promise<ResponseTemplate[]> {
    await this.delay(200);
    return MOCK_RESPONSE_TEMPLATES;
  }

  async getSLARules(): Promise<SLARule[]> {
    await this.delay(200);
    return MOCK_SLA_RULES;
  }

  // ========== Clients ==========

  async getClients(): Promise<TicketClient[]> {
    await this.delay(200);
    return MOCK_CLIENTS;
  }

  async getAssignees(): Promise<TicketAssignee[]> {
    await this.delay(200);
    return MOCK_ASSIGNEES;
  }

  // ========== Export ==========

  async exportData(format: 'json' | 'csv' | 'xlsx' | 'pdf', filter?: TicketFilter): Promise<Blob> {
    await this.delay(500);
    
    const { data } = await this.getAll(filter, undefined, 1, 1000);
    
    if (format === 'json') {
      return new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    }
    
    // For CSV - simplified
    const csv = [
      ['Référence', 'Titre', 'Priorité', 'Statut', 'Catégorie', 'Client', 'Créé le'].join(','),
      ...data.map(t => [
        t.reference,
        `"${t.title}"`,
        t.priority,
        t.status,
        t.category,
        `"${t.client.name}"`,
        t.createdAt,
      ].join(','))
    ].join('\n');
    
    return new Blob([csv], { type: 'text/csv' });
  }

  // ========== Helpers ==========

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private addAudit(action: AuditEntry['action'], ticket: Ticket, details: string): void {
    this.auditLog.unshift({
      id: `AUD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      at: new Date().toISOString(),
      action,
      ticketId: ticket.id,
      ticketReference: ticket.reference,
      userId: 'USR-001',
      userName: 'A. DIALLO',
      userRole: 'Superviseur',
      details,
    });
  }
}

// Export singleton instance
export const ticketsApi = new TicketsApiService();

// Ticket, TicketMessage, TicketAttachment are exported above via interface declarations
